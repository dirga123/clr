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

      var oModel = new JSONModel();
      this.setModel(oModel, 'landscapes');

      this.getRouter().getRoute('landscapes').attachPatternMatched(
        this._onObjectMatched, this
      );
    },

    onPressRefresh: function() {
      jQuery.sap.log.info('Landscapes.controller:onPressRefresh');

      this.getView().setBusy(true);
      this._requestData();
    },

    onPressAdd: function(oEvent) {
      jQuery.sap.log.info('Landscapes.controller:onPressAdd');

      var oModel = this.getModel('landscapes');

      // Clear new node
      oModel.setProperty('/new', {
        id: '',
        domain: '',
        zabbix: ''
      });

      this._getAddDialog().open();
    },

    onPressAddAdd: function(oEvent) {
      jQuery.sap.log.info('Landscapes.controller:onPressAddAdd');

      var oDialog = this._getAddDialog();

      var inputs = [
        sap.ui.getCore().byId('lsAddId'),
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
        setTimeout(jQuery.proxy(this.addLandscape(), this));
      }
    },

    addLandscape: function() {
      jQuery.sap.log.info('Landscapes.controller:addLandscape');

      var oModel = this.getModel('landscapes');
      var oData = oModel.getProperty('/new');

      jQuery.ajax('/Landscape', {
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(oData),
        error: jQuery.proxy(this.onAddError, this),
        success: jQuery.proxy(this.onAddSuccess, this)
      });
    },

    onAddError: function(resp, textStatus, errorThrown) {
      jQuery.sap.log.info('Landscapes.controller:onAddError');

      this.getView().setBusy(false);
      var sMsg = this.getResourceBundle().getText('landscapeAddFailed', [ errorThrown ]);
      MessageToast.show(sMsg);
    },

    onAddSuccess: function(resp) {
      jQuery.sap.log.info('Landscapes.controller:onAddSuccess');

      if (resp.error) {
        this.getView().setBusy(false);
        MessageToast.show(resp.error);
        return;
      }

      this._requestData();
    },

    onPressDetail: function(oEvent) {
      jQuery.sap.log.info('Landscapes.controller:onPressDetail');

      var oItem = oEvent.getSource();
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      var oBindingContext = oItem.getBindingContext('landscapes');
      oRouter.navTo('landscape', {
        id: oBindingContext.getProperty('id')
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

      this.getView().setBusy(true);
      this._requestData();
    },

    _requestData: function() {
      jQuery.sap.log.info('Landscapes.controller:_requestData');

      var oModel = this.getModel('landscapes');
      oModel.attachRequestCompleted(this._requestCompleted, this);
      oModel.loadData(
        '/Landscapes',
        {},
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

      if (oEvent.getParameter('success')) {
        var sError = oModel.getProperty('/error');
        if (sError) {
          MessageToast.show(sError);
        }
      } else {
        var oError = oEvent.getParameter('errorobject');
        jQuery.sap.log.info(oError);
        MessageToast.show(
          'Error ' + oError.statusCode + ': ' +
          oError.statusText + ' ' + oError.responseText
        );
      }

      this.getView().setBusy(false);
    }
  });
});
