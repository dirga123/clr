sap.ui.define([
  'sap/clr/controller/BaseController',
  'sap/ui/model/json/JSONModel',
  'sap/m/MessageToast',
  'sap/ui/model/Filter',
  'sap/m/Dialog',
  'sap/m/Button',
  'sap/m/Text'
], function (BaseController, JSONModel, MessageToast, Filter, Dialog, Button, Text) {
  'use strict';

  return BaseController.extend('sap.clr.controller.Users', {

    onInit: function () {
      jQuery.sap.log.info('Users.controller:onInit');

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
        route: 'users'
      }));

      var oModel = new JSONModel();
      this.setModel(oModel, 'users');

      var oEditModel = new JSONModel();
      this.setModel(oEditModel, 'edit');

      this.attachDisplayForRoute(this._requestData);
      this.attachPatternMatched(this._onObjectMatched);
    },

    onPressRefresh: function() {
      jQuery.sap.log.info('Users.controller:onPressRefresh');

      this.getView().setBusy(true);
      this._requestData();
    },

    onSearch: function(oEvt) {
      jQuery.sap.log.info('Users.controller:onSearch');

      // add filter for search
      var aFilters = [];
      var sQuery = oEvt.getSource().getValue();
      if (sQuery && sQuery.length > 0) {
        var filter = new sap.ui.model.Filter([
          new sap.ui.model.Filter('name', sap.ui.model.FilterOperator.Contains, sQuery),
          new sap.ui.model.Filter('login', sap.ui.model.FilterOperator.Contains, sQuery)
        ], false);
        aFilters.push(filter);
      }

      // update list binding
      var list = this.getView().byId('usersList');
      var binding = list.getBinding('items');
      binding.filter(aFilters, sap.ui.model.FilterType.Application);
    },

    onPressDelete: function(oEvent) {
      jQuery.sap.log.info('Landscape.controller:onPressEditDelete');

      var dialog = new Dialog({
        title: this.getResourceBundle().getText('userDeleteCaption'),
        type: 'Message',
        content: [
          new Text({ text: this.getResourceBundle().getText('userDeleteQuestion') })
        ],
        beginButton: new Button({
          text: this.getResourceBundle().getText('userDelete'),
          icon: 'sap-icon://delete',
          type: 'Reject',
          press: jQuery.proxy(this.onPressDeleteDelete, this)
        }),
        endButton: new Button({
          text: this.getResourceBundle().getText('userCancel'),
          press: function () {
            dialog.close();
          }
        }),
        afterClose: function() {
          dialog.destroy();
        }
      });

      dialog.sPath = oEvent.getParameter('listItem').getBindingContext('users').getPath();
      dialog.open();
    },

    onPressDeleteDelete: function(oEvent) {
      jQuery.sap.log.info('Users.controller:onPressDeleteDelete');

      var oDialog = oEvent.getSource().getParent();
      oDialog.close();

      this.getView().setBusy(true);
      setTimeout(jQuery.proxy(
        this._deleteUser,
        this,
        oDialog.sPath
      ));
    },

    _deleteUser: function(sPath) {
      jQuery.sap.log.info('Users.controller:_deleteUser');

      var oModel = this.getModel('users');
      var oData = oModel.getProperty(sPath);

      jQuery.ajax('/user/' + oData.id, {
        method: 'DELETE',
        cache: false,
        data: JSON.stringify(oData),
        error: jQuery.proxy(this.ajaxError, this, 'userDeleteFailed'),
        success: jQuery.proxy(this.ajaxSuccess, this, this._requestData)
      });
    },

    onPressEdit: function(oEvent) {
      jQuery.sap.log.info('Users.controller:onPressEdit');

      var oItem = oEvent.getSource();
      var oBindingContext = oItem.getBindingContext('users');
      var sPath = oBindingContext.getPath();

      var oModel = this.getModel('users');
      this.getModel('edit').setJSON(oModel.getJSON());

      var oEditDialog = this._getEditDialog();
      oEditDialog.bindElement({
        path: 'edit>' + sPath
      });
      oEditDialog.open();
    },

    onPressEditCancel: function() {
      jQuery.sap.log.info('Users.controller:onPressCancel');

      var oEditDialog = this._getEditDialog();
      oEditDialog.close();
    },

    onPressEditSave: function() {
      jQuery.sap.log.info('Users.controller:onPressEditSave');

      var oEditDialog = this._getEditDialog();

      var inputs = [
        sap.ui.getCore().byId('userEditLogin'),
        sap.ui.getCore().byId('userEditName')
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
        var sPath = oEditDialog.getBindingContext('edit').getPath();
        oEditDialog.close();

        var oModel = this.getModel('users');
        var oEditModel = this.getModel('edit');
        oModel.setProperty(sPath, oEditModel.getProperty(sPath));

        this.getView().setBusy(true);
        setTimeout(jQuery.proxy(
          this._saveUser,
          this,
          sPath
        ));
      }
    },

    _saveUser: function(sPath) {
      jQuery.sap.log.info('Users.controller:_saveUser');

      var oModel = this.getModel('users');
      var oData = oModel.getProperty(sPath);
      var sUserId = oData.id;

      jQuery.ajax('/user/' + sUserId, {
        method: 'PUT',
        cache: false,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(oData),
        error: jQuery.proxy(this.ajaxError, this, 'userSaveFailed'),
        success: jQuery.proxy(this.ajaxSuccess, this, this._requestData)
      });
    },

    onPressAdd: function(oEvent) {
      jQuery.sap.log.info('Users.controller:onPressAdd');

      var oModel = this.getModel('users');

      // Clear new node
      oModel.setProperty('/new', {
        login: '',
        domain: '',
        name: '',
        password: '',
        isAdmin: false.toString(),
        isGSC: false.toString()
      });

      this._getAddDialog().open();
    },

    onPressAddAdd: function(oEvent) {
      jQuery.sap.log.info('Users.controller:onPressAddAdd');

      var oDialog = this._getAddDialog();

      var inputs = [
        sap.ui.getCore().byId('userAddLogin'),
        sap.ui.getCore().byId('userAddName'),
        sap.ui.getCore().byId('userAddPassword')
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
        setTimeout(jQuery.proxy(this._addUser, this));
      }
    },

    _addUser: function() {
      jQuery.sap.log.info('Users.controller:_addUser');

      var oModel = this.getModel('users');
      var oData = oModel.getProperty('/new');

      jQuery.ajax('/user', {
        method: 'POST',
        cache: false,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(oData),
        error: jQuery.proxy(this.ajaxError, this, 'userAddFailed'),
        success: jQuery.proxy(this.ajaxSuccess, this, this._requestData)
      });
    },

    _getAddDialog: function() {
      jQuery.sap.log.info('Users.controller:_getAddDialog');

      if (!this._oAddDialog) {
        this._oAddDialog = sap.ui.jsfragment('sap.clr.view.UserAdd', this);
        this.getView().addDependent(this._oAddDialog);
      }

      return this._oAddDialog;
    },

    _getEditDialog: function() {
      jQuery.sap.log.info('Users.controller:_getEditDialog');

      if (!this._oEditDialog) {
        this._oEditDialog = sap.ui.jsfragment('sap.clr.view.UserEdit', this);
        this.getView().addDependent(this._oEditDialog);
      }

      return this._oEditDialog;
    },

    _onObjectMatched: function(oEvent) {
      jQuery.sap.log.info('Users.controller:_onObjectMatched');

      if (this.navigateHomeIfNotLoggedAsAdmin()) {
        return;
      }

      this.getView().setBusy(true);
      this._requestData();
    },

    _requestData: function() {
      jQuery.sap.log.info('Users.controller:_requestData');

      var oModel = this.getModel('users');
      oModel.attachRequestCompleted(this._requestCompleted, this);
      oModel.loadData(
        '/users',
        {},
        true,
        'GET',
        false,
        false
      );
    },

    _requestCompleted: function(oEvent) {
      jQuery.sap.log.info('Users.controller:_requestCompleted');

      var oModel = this.getModel('users');
      oModel.detachRequestCompleted(this._requestCompleted, this);

      this.getView().setBusy(false);

      this.checkForErrorWithNavigate(oModel, oEvent);
    }
  });
});
