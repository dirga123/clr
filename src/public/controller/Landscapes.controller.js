sap.ui.define([
  'sap/clr/controller/BaseController',
  'sap/ui/model/json/JSONModel',
  'sap/m/MessageToast',
  'sap/ui/model/SimpleType'
], function (BaseController, JSONModel, MessageToast, SimpleType) {
  'use strict';

  return BaseController.extend('sap.clr.controller.Landscapes', {

    onInit: function () {
      jQuery.sap.log.info('Landscapes.controller:onInit');

      // attach handlers for validation errors
      sap.ui.getCore().attachValidationError(function (evt) {
        var control = evt.getParameter('element');
        if (control && control.setValueState) {
          control.setValueState('Error');
        }
      });
      sap.ui.getCore().attachValidationSuccess(function (evt) {
        var control = evt.getParameter('element');
        if (control && control.setValueState) {
          control.setValueState('None');
        }
      });

      this.setModel(new JSONModel({
        route: 'landscapes'
      }));
      this.setCurrentDateAndPeriod();

      var oModel = new JSONModel();
      this.setModel(oModel, 'landscapes');

      this.attachDisplayForRoute(this._requestData);
      this.attachPatternMatched(this._onObjectMatched);
    },

    onPressRefresh: function() {
      jQuery.sap.log.info('Landscapes.controller:onPressRefresh');

      this._requestData();
    },

    onSearch: function(oEvt) {
      jQuery.sap.log.info('Landscapes.controller:onSearch');

      var aFilters = [];
      var sQuery = oEvt.getSource().getValue();
      if (sQuery && sQuery.length > 0) {
        var filter = new sap.ui.model.Filter([
          new sap.ui.model.Filter('project', sap.ui.model.FilterOperator.Contains, sQuery),
          new sap.ui.model.Filter('domain', sap.ui.model.FilterOperator.Contains, sQuery)
        ], false);
        aFilters.push(filter);
      }

      // update list binding
      var list = this.getView().byId('landscapesTiles');
      var binding = list.getBinding('tiles');
      binding.filter(aFilters, sap.ui.model.FilterType.Application);
    },

    onPressAdd: function(oEvent) {
      jQuery.sap.log.info('Landscapes.controller:onPressAdd');

      var oModel = this.getModel('landscapes');

      // Clear new node
      oModel.setProperty('/new', {
        project: '',
        domain: '',
        zabbix: ''
      });

      this._getAddDialog().open();
    },

    onPressAddAdd: function(oEvent) {
      jQuery.sap.log.info('Landscapes.controller:onPressAddAdd');

      var oDialog = this._getAddDialog();

      var inputs = [
        sap.ui.getCore().byId('lsAddProject'),
        sap.ui.getCore().byId('lsAddDomain'),
        sap.ui.getCore().byId('lsAddZabbix')
      ];

      // check that inputs are not empty
      // this does not happen during data binding as this is only triggered by changes
      jQuery.each(inputs, function (i, input) {
        if (!input.getValue()) {
          input.setValueState('Error');
        }
      });

      // check states of inputs
      var canContinue = true;
      jQuery.each(inputs, function (i, input) {
        if (input.getValueState() === 'Error') {
          canContinue = false;
          return false;
        }
        return true;
      });

      if (canContinue) {
        oDialog.close();
        this.getView().setBusy(true);
        setTimeout(jQuery.proxy(this.addLandscape, this));
      }
    },

    addLandscape: function() {
      jQuery.sap.log.info('Landscapes.controller:addLandscape');

      var oModel = this.getModel('landscapes');
      var oData = oModel.getProperty('/new');

      jQuery.ajax('/landscape', {
        method: 'POST',
        cache: false,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(oData),
        error: jQuery.proxy(this.ajaxError, this, 'landscapeAddFailed'),
        success: jQuery.proxy(this.ajaxSuccess, this, this._requestData)
      });
    },

    onPressDetail: function(oEvent) {
      jQuery.sap.log.info('Landscapes.controller:onPressDetail');

      var oItem = oEvent.getSource();
      var oBindingContext = oItem.getBindingContext('landscapes');
      var sId = oBindingContext.getProperty('id');

      var oRouter = this.getRouter();
      oRouter.navTo('landscape', {
        id: sId
      });
    },

    _getAddDialog: function() {
      jQuery.sap.log.info('Landscapes.controller:_getAddDialog');

      if (!this._oAddDialog) {
        this._oAddDialog = sap.ui.jsfragment('sap.clr.view.LandscapeAdd', this);
        this.getView().addDependent(this._oAddDialog);
      }

      return this._oAddDialog;
    },

    _onObjectMatched: function(oEvent) {
      jQuery.sap.log.info('Landscapes.controller:_onObjectMatched');

      if (this.navigateHomeIfNotLoggedAsAdmin()) {
        return;
      }

      this._requestData();
    },

    _requestData: function() {
      jQuery.sap.log.info('Landscapes.controller:_requestData');

      this.getView().setBusy(true);
      this.setCurrentDateAndPeriod();

      var oViewModel = this.getModel();
      var oDate = oViewModel.getProperty('/date');
      var oDateFrom = oViewModel.getProperty('/from');
      var oDateTo = oViewModel.getProperty('/to');

      var oModel = this.getModel('landscapes');
      oModel.attachRequestCompleted(this._requestCompleted, this);
      oModel.loadData(
        '/landscapes',
        {
          date: oDate.getTime(),
          from: oDateFrom.getTime(),
          to: oDateTo.getTime()
        },
        true,
        'GET',
        false,
        false
      );
    },

    _requestCompleted: function(oEvent) {
      jQuery.sap.log.info('Landscapes.controller:_requestCompleted');

      var oModel = this.getModel('landscapes');
      oModel.detachRequestCompleted(this._requestCompleted, this);

      this.getView().setBusy(false);

      this.checkForErrorWithNavigate(oModel, oEvent);

      var oLandscapes = oModel.getProperty('/landscapes');
      if (Object.prototype.toString.call(oLandscapes) === '[object Array]') {
        var oViewModel = this.getModel();
        var oDate = oViewModel.getProperty('/date');
        var oDateFrom = oViewModel.getProperty('/from');
        var oDateTo = oViewModel.getProperty('/to');

        for (var i = 0; i < oLandscapes.length; i++) {
          var sId = oModel.getProperty('/landscapes/' + i + '/id');

          jQuery.ajax('/reporting/' + sId, {
            method: 'GET',
            cache: false,
            data: {
              date: oDate.getTime(),
              from: oDateFrom.getTime(),
              to: oDateTo.getTime()
            },
            error: jQuery.proxy(this._onStatusError, this, sId),
            success: jQuery.proxy(this._onStatusSuccess, this, sId)
          });
        }
      }
    },

    _onStatusError: function(lsId, resp, textStatus, errorThrown) {
      jQuery.sap.log.info('Landscapes.controller:_onStatusError');

      var oModel = this.getModel('landscapes');
      var oLandscapes = oModel.getProperty('/landscapes');
      for (var i = 0; i < oLandscapes.length; i++) {
        var sId = oModel.getProperty('/landscapes/' + i + '/id');
        if (sId === lsId) {
          var sError = this.getResourceBundle().getText('generalError', [
            resp.status,
            resp.statusText,
            errorThrown
          ]);

          oModel.setProperty('/landscapes/' + i + '/error', sError);
          break;
        }
      }
    },

    _onStatusSuccess: function(lsId, resp) {
      jQuery.sap.log.info('Landscapes.controllesr:_onStatusSuccess');

      var oModel = this.getModel('landscapes');
      var oLandscapes = oModel.getProperty('/landscapes');
      for (var i = 0; i < oLandscapes.length; i++) {
        var sId = oModel.getProperty('/landscapes/' + i + '/id');
        if (sId === lsId) {
          if (resp.error !== undefined) {
            oModel.setProperty('/landscapes/' + i + '/error', resp.error);
          }

          if (resp.currSla !== undefined) {
            oModel.setProperty('/landscapes/' + i + '/currSla', resp.currSla);
          }
          if (resp.goodSla !== undefined) {
            oModel.setProperty('/landscapes/' + i + '/goodSla', resp.goodSla);
          }
          if (resp.triggersCount !== undefined) {
            oModel.setProperty('/landscapes/' + i + '/triggersCount', resp.triggersCount);
          }
          if (resp.triggersPriority !== undefined) {
            oModel.setProperty('/landscapes/' + i + '/triggersCount', resp.triggersPriority);
          }
          break;
        }
      }
    }
  });
});
