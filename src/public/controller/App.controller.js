sap.ui.define([
  'sap/clr/controller/BaseController',
  'sap/ui/model/json/JSONModel'
], function (BaseController, JSONModel) {
  'use strict';

  return BaseController.extend('sap.clr.controller.App', {
    onInit: function() {
      jQuery.sap.log.info('App.controller:onInit');

      var oModel = new JSONModel({
        icon: jQuery.sap.getModulePath('sap.ui.core', '/') + 'mimes/logo/sap_50x26.png'
      });

      this.setModel(oModel);
    },

    onPressLogoff: function() {
      jQuery.sap.log.info('App.controller:onPressLogoff');

      this.getComponent().setIsLogged(false);

      jQuery.ajax('/logout', {
        method: 'GET',
        error: jQuery.proxy(this.onLoginFinished, this),
        success: jQuery.proxy(this.onLoginFinished, this)
      });
    },

    onLoginFinished: function() {
      jQuery.sap.log.info('App.controller:onLoginFinished');
      this.getRouter().navTo('login');
    },

    onPressHome: function() {
      jQuery.sap.log.info('App.controller:onPressHome');
      this.getRouter().navTo('home');
    }
  });
});
