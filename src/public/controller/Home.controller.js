sap.ui.define([
  'sap/clr/controller/BaseController',
  'sap/ui/model/json/JSONModel',
  'sap/m/MessageToast'
], function (BaseController, JSONModel, MessageToast) {
  'use strict';

  return BaseController.extend('sap.clr.controller.Home', {

    onInit: function() {
      jQuery.sap.log.info('Home.controller:onInit');

      var oModel = new JSONModel({});
      this.setModel(oModel, 'home');

      this.getRouter().getRoute('home').attachPatternMatched(this._onObjectMatched, this);
    },

    onPressLandscapes: function(oEvent) {
      this.getRouter().navTo('landscapes');
    },

    onPressRefresh: function() {
      jQuery.sap.log.info('Home.controller:onPressRefresh');

      this.getView().byId('landscapesTile').setBusy(true);
      this._requestData();
    },

    _onObjectMatched: function(oEvent) {
      jQuery.sap.log.info('Home.controller:_onObjectMatched');

      this.getView().byId('landscapesTile').setBusy(true);
      this._requestData();
    },

    _requestData: function() {
      jQuery.sap.log.info('Home.controller:_requestData');

      var oModel = this.getModel('home');
      oModel.attachRequestCompleted(this._requestCompleted, this);
      oModel.loadData(
        '/Home',
        null,
        true,
        'GET',
        false,
        false
      );
    },

    _requestCompleted: function(oEvent) {
      jQuery.sap.log.info('Home.controller:_requestCompleted');
      var oModel = this.getModel('home');
      oModel.detachRequestCompleted(this._requestCompleted, this);

      if (oEvent.getParameter('success')) {
        var sError = oModel.getProperty('/error');
        if (sError) {
          MessageToast.show(sError);
        }
      } else {
        var oError = oEvent.getParameter('errorobject');
        MessageToast.show('Error ' + oError.statusCode + ': ' +
          oError.statusText + ' ' + oError.responseText);
      }

      this.getView().byId('landscapesTile').setBusy(false);
    }

  });
});
