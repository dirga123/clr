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

      this.setModel(new JSONModel({
        username: '',
        password: ''
      }));

      var oRouter = this.getRouter();
      var oTarget = oRouter.getTarget('login');

      oTarget.attachDisplay(
        function (oEvent) {
          jQuery.sap.log.info('Login.controller:_onAttachDisplay');
          this._oData = oEvent.getParameter('data');

          this.getModel().setProperty('/password', '');

          setTimeout(jQuery.proxy(function() {
            var oDialog = this._getLoginDialog();
            if (!oDialog.isOpen()) {
              jQuery.sap.log.info('Login.controller:_onAttachDisplay: opening dialog');
              oDialog.open();
            }
          }, this));
        }, this
      );
    },

    onExit: function() {
      jQuery.sap.log.info('Login.controller:onExit');

      if (this._oLoginDialog) {
        this._oLoginDialog.destroy();
        this._oLoginDialog = null;
      }
    },

    onPressLogin: function() {
      jQuery.sap.log.info('Login.controller:onPressLogin');

      this._oLoginDialog.setBusy(true);
      setTimeout(jQuery.proxy(
        this._login, this)
      );
    },

    _login: function() {
      jQuery.sap.log.info('Login.controller:_login');

      var oModel = this.getModel();
      var sUsername = oModel.getProperty('/username');
      var sPassword = oModel.getProperty('/password');

      jQuery.ajax('/login', {
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({
          username: sUsername,
          password: sPassword
        }),
        error: jQuery.proxy(this._onLoginError, this),
        success: jQuery.proxy(this._onLoginSuccess, this)
      });
    },

    _onLoginError: function(resp, textStatus, errorThrown) {
      jQuery.sap.log.info('Login.controller:_onLoginError');

      this._oLoginDialog.setBusy(false);
      var sMsg = this.getResourceBundle().getText('loginFailed', [ errorThrown ]);
      MessageToast.show(sMsg);
    },

    _onLoginSuccess: function(resp) {
      jQuery.sap.log.info('Login.controller:_onLoginSuccess');

      this._oLoginDialog.setBusy(false);

      if (resp.error) {
        MessageToast.show(resp.error);
        return;
      }

      var oUserModel = this.getComponent().getModel('loginInfo');
      oUserModel.setData(resp);
      oUserModel.setProperty('/logged', true);
      this._onNavBackWithoutHash();
    },

    // override the parent's onNavBack (inherited from BaseController)
    _onNavBackWithoutHash: function () {
      jQuery.sap.log.info('Login.controller:_onNavBackWithoutHash');

      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      // in some cases we could display a certain target when the back button is pressed
      if (this._oData && this._oData.fromTarget) {
        jQuery.sap.log.info(
          'Login.controller:_onNavBackWithoutHash: navigating to ' + this._oData.fromTarget
        );

        oRouter.getTargets().display(this._oData.fromTarget, {
          fromTarget: 'login'
        });
        delete this._oData.fromTarget;
        return;
      }

      jQuery.sap.log.info(
        'Login.controller:_onNavBackWithoutHash: navigating to home because of no data'
      );
      oRouter.navTo('home');
    },

    _getLoginDialog: function() {
      jQuery.sap.log.info('Login.controller:_getLoginDialog');

      if (!this._oLoginDialog) {
        this._oLoginDialog = sap.ui.jsfragment('sap.clr.view.Login', this);
        this.getView().addDependent(this._oLoginDialog);
      }

      return this._oLoginDialog;
    }
  });
});
