sap.ui.define([
  'sap/clr/controller/BaseController',
  'sap/ui/model/json/JSONModel',
  'sap/m/MessageToast',
  'sap/ui/model/SimpleType'
], function (BaseController, JSONModel, MessageToast, SimpleType) {
  'use strict';

  return BaseController.extend('sap.clr.controller.Reporting', {

    onInit: function () {
      jQuery.sap.log.info('Reporting.controller:onInit');

      this.setModel(new JSONModel({
        route: 'reporting'
      }));
      this.setCurrentDateAndPeriod();

      var oModel = new JSONModel();
      this.setModel(oModel, 'landscapes');

      this.attachDisplayForRoute(this._requestData);
      this.attachPatternMatched(this._onObjectMatched);
    },

    onPressRefresh: function() {
      jQuery.sap.log.info('Reporting.controller:onPressRefresh');

      this._requestData();
    },

    onSearch: function(oEvt) {
      jQuery.sap.log.info('Reporting.controller:onSearch');

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
      var list = this.byId('landscapesTiles');
      var binding = list.getBinding('tiles');
      binding.filter(aFilters, sap.ui.model.FilterType.Application);
    },

    onPressDetail: function(oEvent) {
      jQuery.sap.log.info('Reporting.controller:onPressDetail');

      var oItem = oEvent.getSource();
      var oBindingContext = oItem.getBindingContext('landscapes');
      var sId = oBindingContext.getProperty('id');

      var oRouter = this.getRouter();
      oRouter.navTo('reportingLandscape', {
        id: sId
      });
    },

    _onObjectMatched: function(oEvent) {
      jQuery.sap.log.info('Reporting.controller:_onObjectMatched');

      if (this.navigateHomeIfNotLoggedAsReporting()) {
        return;
      }

      this._requestData();
    },

    _requestData: function() {
      jQuery.sap.log.info('Reporting.controller:_requestData');

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
      jQuery.sap.log.info('Reporting.controller:_requestCompleted');

      var oModel = this.getModel('landscapes');
      oModel.detachRequestCompleted(this._requestCompleted, this);

      this.getView().setBusy(false);

      if (this.checkForErrorWithNavigate(oModel, oEvent)) {
        return;
      }

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
      jQuery.sap.log.info('Reporting.controller:_onStatusError');

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
      jQuery.sap.log.info('Reporting.controllesr:_onStatusSuccess');

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
