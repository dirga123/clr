sap.ui.define([
  'sap/clr/controller/BaseController',
  'sap/ui/model/json/JSONModel',
  'jquery.sap.global',
  'sap/m/MessageToast'
], function (BaseController, JSONModel, jQuery, MessageToast) {
  'use strict';

  return BaseController.extend('sap.clr.controller.Login', {
    onInit: function() {
      jQuery.sap.log.info('Login.controller:onInit');

      var oModel = new JSONModel({
        input: ''
      });
      this.getView().setModel(oModel);

      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      var oTarget = oRouter.getTarget('login');

      oTarget.attachDisplay(function (oEvent) {
        this._oData = oEvent.getParameter('data');
      }, this);
    },

    onPressLogin: function() {
      this.getView().setBusy(true);
      this.login();
    },

    login: function() {
      var sInput = this.getView().getModel().getProperty('/input');

      jQuery.ajax('/login', {
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({
          input: sInput
        }),
        error: jQuery.proxy(this.onLoginError, this),
        success: jQuery.proxy(this.onLoginSuccess, this)
      });
    },

    onLoginError: function(resp, textStatus, errorThrown) {
      this.getView().setBusy(false);
      var sMsg = this.getResourceBundle().getText('loginFailed', [ errorThrown ]);
      MessageToast.show(sMsg);
    },

    onLoginSuccess: function(resp) {
      this.getView().setBusy(false);

      if (resp.error) {
        MessageToast.show(resp.error);
        return;
      }

      var oUserModel = this.getComponent().getModel('user');
      oUserModel.setData(resp);
      oUserModel.setProperty('/logged', true);

      this.onNavBackWithoutHash();
    },

    // override the parent's onNavBack (inherited from BaseController)
    onNavBackWithoutHash: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      // in some cases we could display a certain target when the back button is pressed
      if (this._oData && this._oData.fromTarget) {
        oRouter.getTargets().display(this._oData.fromTarget);
        delete this._oData.fromTarget;
        return;
      }
      oRouter.navTo('home');
    }
  });
});
