sap.ui.define([
  'sap/clr/controller/BaseController',
  'sap/ui/model/json/JSONModel',
  'sap/m/MessageToast',
  'sap/m/MessageStrip',
  'sap/m/Dialog',
  'sap/m/Button',
  'sap/m/Text'
], function (BaseController, JSONModel, MessageToast, MessageStrip, Dialog,
  Button, Text) {
  'use strict';

  return BaseController.extend('sap.clr.controller.GSCAccess', {
    onInit: function() {
      jQuery.sap.log.info('GSCAccess.controller:onInit');

      this.setModel(new JSONModel({
        route: 'gscaccess',
        edit: false,
        create: false
      }));
      this._toggleButtonsAndView(false);
      this.setCurrentDateAndPeriod();

      this.setModel(new JSONModel(), 'gscAccess');

      this.attachDisplayForRoute(this._requestData);
      this.attachPatternMatched(this._onObjectMatched);
    },

    onExit: function() {
      jQuery.sap.log.info('GSCAccess.controller:onExit');
      for (var sPropertyName in this._formFragments) {
        if (!this._formFragments.hasOwnProperty(sPropertyName)) {
          return;
        }

        this._formFragments[sPropertyName].destroy();
        this._formFragments[sPropertyName] = null;
      }
    },

    onPressRefresh: function() {
      jQuery.sap.log.info('GSCAccess.controller:onPressRefresh');
      this._requestData();
    },

    onPressEdit: function() {
      jQuery.sap.log.info('GSCAccess.controller:onPressEdit');

      // Clone the data
      this._oGSCAccess = jQuery.extend({},
        this.getView().getModel('gscAccess').getData()
      );

      this._toggleButtonsAndView(true);
    },

    onPressCancel: function() {
      jQuery.sap.log.info('GSCAccess.controller:onPressCancel');

      // Restore the data
      var oModel = this.getView().getModel('gscAccess');
      oModel.setData(this._oGSCAccess);

      this._toggleButtonsAndView(false);
    },

    onPressSave: function() {
      jQuery.sap.log.info('GSCAccess.controller:onPressSave');

      setTimeout(jQuery.proxy(
        this._saveGSCAccess, this)
      );
    },

    onPressDelete: function() {
      jQuery.sap.log.info('GSCAccess.controller:onPressDelete');

      var dialog = new Dialog({
        title: this.getResourceBundle().getText('gscAccessDeleteCaption'),
        type: 'Message',
        content: [
          new Text({ text: this.getResourceBundle().getText('gscAccessDeleteQuestion') })
        ],
        beginButton: new Button({
          text: this.getResourceBundle().getText('gscAccessDeleteButton'),
          icon: 'sap-icon://delete',
          type: 'Reject',
          press: jQuery.proxy(this.onPressDeleteDelete, this)
        }),
        endButton: new Button({
          text: this.getResourceBundle().getText('gscAccessCancelButton'),
          press: function () {
            dialog.close();
          }
        }),
        afterClose: function() {
          dialog.destroy();
        }
      });

      dialog.open();
    },

    onPressDeleteDelete: function(oEvent) {
      jQuery.sap.log.info('GSCAccess.controller:onPressDeleteDelete');

      oEvent.getSource().getParent().close();

      this.getView().setBusy(true);
      setTimeout(jQuery.proxy(
        this._deleteGSCAccess, this)
      );
    },

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

    _formFragments: {},
    _messageStrips: [],

    _saveGSCAccess: function() {
      jQuery.sap.log.info('GSCAccess.controller:_saveGSCAccess');

      var oViewModel = this.getModel();
      var sLandscapeId = oViewModel.getProperty('/id');

      /*
      var oModel = this.getModel('gscAccess');
      var oData = oModel.getProperty('/landscape');

      jQuery.ajax('/gsc/' + sLandscapeId, {
        method: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(oData),
        error: jQuery.proxy(this.ajaxError, this, 'landscapeSaveFailed'),
        success: jQuery.proxy(this.onSaveSuccess, this, this._onSaveSuccess)
      });
      */
      this._onSaveSuccess();
    },

    _onSaveSuccess: function() {
      jQuery.sap.log.info('GSCAccess.controller:_onSaveSuccess');

      this._oGSCAccess = null;
      this._toggleButtonsAndView(false);
    },

    _deleteGSCAccess: function() {
      jQuery.sap.log.info('GSCAccess.controller:_deleteGSCAccess');
      var oViewModel = this.getModel();

      var sLandscapeId = oViewModel.getProperty('/id');

      jQuery.ajax('/gsc/' + sLandscapeId, {
        method: 'DELETE',
        error: jQuery.proxy(this.ajaxError, this, 'gscDeleteFailed'),
        success: jQuery.proxy(this._onDeleteSuccess, this)
      });
    },

    _onDeleteSuccess: function(resp) {
      jQuery.sap.log.info('GSCAccess.controller:_onDeleteSuccess');
      this.getView().setBusy(false);
      if (resp.error) {
        MessageToast.show(resp.error);
        return;
      } else {
        this.onNavBack();
      }
    },

    _toggleButtonsAndView: function(bEdit, bCreate) {
      jQuery.sap.log.info('GSCAccess.controller:_toggleButtonsAndView');

      this.getModel().setProperty('/edit', bEdit);
      if (bCreate !== undefined) {
        this.getModel().setProperty('/create', bCreate);
      }
      this._showFormFragment(bEdit ? 'Change' : 'Display');
    },

    _getFormFragment: function (sFragmentName) {
      var oFormFragment = this._formFragments[sFragmentName];

      if (oFormFragment) {
        return oFormFragment;
      }

      oFormFragment = sap.ui.jsfragment(
        this.getView().getId(),
        'sap.clr.view.GSCAccess' + sFragmentName,
        this
      );

      this._formFragments[sFragmentName] = oFormFragment;

      return this._formFragments[sFragmentName];
    },

    _showFormFragment: function (sFragmentName) {
      var oPanel = this.getView().byId('gscAccessPanel');

      oPanel.removeAllContent();
      oPanel.insertContent(this._getFormFragment(sFragmentName));
    },

    _closeMessageStrips: function() {
      for (var i = 0; i < this._messageStrips.length; i++) {
        this._messageStrips[i].getParent().removeContent(this._messageStrips[i]);
        this._messageStrips[i].destroy();
        this._messageStrips[i] = null;
      }
      this._messageStrips = [];
    },

    _setBusy: function(isBusy) {
      this.getView().setBusy(isBusy);
    },

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
    _onObjectMatched: function (oEvent) {
      jQuery.sap.log.info('GSCAccess.controller:_onObjectMatched');

      if (this.navigateHomeIfNotLoggedAsAdmin()) {
        return;
      }

      var sLandscapeId = oEvent.getParameter('arguments').id;
      var bCreate = oEvent.getParameter('arguments').create;

      this._toggleButtonsAndView(bCreate, bCreate);

      var oViewModel = this.getModel();
      oViewModel.setProperty('/id', sLandscapeId);

      if (!bCreate) {
        this._requestData();
      }
    },

    _requestData: function() {
      jQuery.sap.log.info('GSCAccess.controller:_requestData');

      this._setBusy(true);
      this._closeMessageStrips();

      var oViewModel = this.getModel();
      var sLandscapeId = oViewModel.getProperty('/id');

      var oModel = this.getModel('gscAccess');
      oModel.attachRequestCompleted(this._requestCompleted, this);
      oModel.loadData(
        '/gsc/' + sLandscapeId,
        null,
        true,
        'GET',
        false,
        false
      );
    },

    _requestCompleted: function(oEvent) {
      jQuery.sap.log.info('GSCAccess.controller:_requestCompleted');

      var oModel = this.getModel('gscAccess');
      oModel.detachRequestCompleted(this._requestCompleted, this);
      this._setBusy(false);

      var sError;

      if (oEvent.getParameter('success')) {
        if (oEvent.oSource.oData.error) {
          sError = oEvent.oSource.oData.error;
        }
      } else {
        var oError = oEvent.getParameter('errorobject');

        sError = this.getResourceBundle().getText('generalError', [
          oError.statusCode,
          oError.statusText,
          oError.responseText
        ]);

        if (this.navigateToLoginAfter401(oError.statusCode)) {
          return;
        }
      }

      if (sError) {
        MessageToast.show(sError);

        var oMessageStrip = new MessageStrip({
          text: sError,
          type: 'Error',
          showIcon: true,
          showCloseButton: true
        });

        this._messageStrips.push(oMessageStrip);
        var oPanel = this.getView().byId('gscAccessDisplayPanel');
        oPanel.insertContent(oMessageStrip,	0);
      }
    },

		/*
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
    _bindElement: function (sId, sPath) {
      jQuery.sap.log.info('GSCAccess.controller:_bindElement');

      this.getView().byId(sId).bindElement({
        path: sPath
      });
    }

  });
});
