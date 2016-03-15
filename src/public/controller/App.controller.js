sap.ui.define([
  'sap/clr/controller/BaseController',
  'sap/ui/model/json/JSONModel'
], function (BaseController, JSONModel) {
  'use strict';

  return BaseController.extend('sap.clr.controller.App', {
    onInit: function() {
      var oModel = new JSONModel({
        icon: jQuery.sap.getModulePath('sap.ui.core', '/') + 'mimes/logo/sap_50x26.png'
      });

      this.setModel(oModel);
    },

    onPressLogoff: function() {
      var oModel = this.getComponent().getModel('user');
      oModel.setProperty('/logged', false);

      this.getRouter().navTo('login');
    },

    onPressHome: function() {
      this.getRouter().navTo('home');
    }
  });
});
