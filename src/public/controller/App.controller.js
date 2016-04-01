sap.ui.define([
  'sap/clr/controller/BaseController',
  'sap/ui/model/json/JSONModel'
], function (BaseController, JSONModel) {
  'use strict';

  return BaseController.extend('sap.clr.controller.App', {
    onInit: function() {
      jQuery.sap.log.info('App.controller:onInit');

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

      var oModel = new JSONModel({
        icon: jQuery.sap.getModulePath('sap.ui.core', '/') + 'mimes/logo/sap_50x26.png'
      });

      this.setModel(oModel);

      this.setModel(new JSONModel(), 'userProfile');
    },

    onExit: function() {
      if (this._actionSheet) {
        this._actionSheet.destroy();
        this._actionSheet = null;
      }

      if (this._oProfileDialog) {
        this._oProfileDialog.destroy();
        this._oProfileDialog = null;
      }
    },

    onPressLogoff: function() {
      jQuery.sap.log.info('App.controller:onPressLogoff');

      this.getComponent().setIsLogged(false);

      jQuery.ajax('/logout', {
        method: 'GET',
        cache: false,
        error: jQuery.proxy(this.onLoginFinished, this),
        success: jQuery.proxy(this.onLoginFinished, this)
      });
    },

    onLoginFinished: function() {
      jQuery.sap.log.info('App.controller:onLoginFinished');
      var oRouter = this.getRouter();
      oRouter.getTargets().display('login');
    },

    onPressHome: function() {
      jQuery.sap.log.info('App.controller:onPressHome');
      var oRouter = this.getRouter();
      oRouter.navTo('home');
      oRouter.getTargets().display('home');
    },

    onPressUser: function(oEvent) {
      jQuery.sap.log.info('App.controller:onPressUser');

      var oSource = oEvent.getSource();

      if (!this._actionSheet) {
        this._actionSheet = sap.ui.jsfragment(
          'sap.clr.view.AppUserActions',
          this
        );
        this.getView().addDependent(this._actionSheet);
      }

      if (this._actionSheet.isOpen()) {
        this._actionSheet.close();
      } else {
        this._actionSheet.openBy(oSource);
      }
    },

    onPressProfile: function() {
      jQuery.sap.log.info('App.controller:onPressProfile');

      var oModel = this.getModel('loginInfo');
      var oProfileModel = this.getModel('userProfile');

      oProfileModel.setProperty('/id', oModel.getProperty('/user/id'));
      oProfileModel.setProperty('/name', oModel.getProperty('/user/name'));
      oProfileModel.setProperty('/oldPassword', '');
      oProfileModel.setProperty('/oldPassword', '');
      oProfileModel.setProperty('/newPassword', '');
      oProfileModel.setProperty('/newPassword2', '');

      var oDialog = this._getProfileDialog();
      oDialog.open();
    },

    onPressProfileCancel: function() {
      jQuery.sap.log.info('App.controller:onPressProfileCancel');

      var oDialog = this._getProfileDialog();
      oDialog.close();
    },

    onPressProfileSave: function() {
      jQuery.sap.log.info('App.controller:onPressProfileSave');

      var oDialog = this._getProfileDialog();

      var inputs = [
        sap.ui.getCore().byId('userProfileName'),
        sap.ui.getCore().byId('userProfileOldPassword')
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

      if (!canContinue) {
        return;
      }

      var oNewPwd1 = sap.ui.getCore().byId('userProfileNewPassword');
      var oNewPwd2 = sap.ui.getCore().byId('userProfileNewPassword2');
      var oNewPwd1Val = oNewPwd1.getValue();
      var oNewPwd2Val = oNewPwd2.getValue();
      if ((oNewPwd1Val.length > 0 || oNewPwd2Val.length > 0) &&
        oNewPwd1Val !== oNewPwd2Val) {
        oNewPwd1.setValueState('Error');
        oNewPwd1.setValueStateText(this.getResourceBundle().getText('userNewPasswordsNotMatch'));
        oNewPwd2.setValueState('Error');
        oNewPwd2.setValueStateText(this.getResourceBundle().getText('userNewPasswordsNotMatch'));
        return;
      }

      oDialog.close();
      setTimeout(jQuery.proxy(
        this._updateProfile,
        this
      ));
    },

    _updateProfile: function(sPath) {
      jQuery.sap.log.info('App.controller:_updateProfile');

      var oProfileModel = this.getModel('userProfile');

      var sUserId = oProfileModel.getProperty('/id');
      var oData = oProfileModel.getData();

      jQuery.ajax('/profile/' + sUserId, {
        method: 'PUT',
        cache: false,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(oData),
        error: jQuery.proxy(this.ajaxError, this, 'userProfileSaveFailed'),
        success: jQuery.proxy(this.ajaxSuccess, this, this._onUpdateProfileSuccess)
      });
    },

    _onUpdateProfileSuccess: function() {
      jQuery.sap.log.info('App.controller:_onUpdateProfileSuccess');

      var oProfileModel = this.getModel('userProfile');
      var oModel = this.getModel('loginInfo');
      oModel.setProperty('/user/name', oProfileModel.getProperty('/name'));
    },

    _getProfileDialog: function() {
      jQuery.sap.log.info('App.controller:_getProfileDialog');

      if (!this._oProfileDialog) {
        this._oProfileDialog = sap.ui.jsfragment('sap.clr.view.UserProfile', this);
        this.getView().addDependent(this._oProfileDialog);
      }

      return this._oProfileDialog;
    }
  });
});
