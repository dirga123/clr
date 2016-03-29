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

  return BaseController.extend('sap.clr.controller.Landscape', {
    onInit: function() {
      jQuery.sap.log.info('Landscape.controller:onInit');

      // Set the initial form to be the display one
      this._toggleButtonsAndView(false);

      this.setModel(new JSONModel({
        route: 'landscape'
      }));
      this.setCurrentDateAndPeriod();

      // Create model and set it to view
      var oModel = new JSONModel();
      this.setModel(oModel, 'landscape');
      this._bindElement('generalPanel', 'landscape>/landscape');

      var oModelStatus = new JSONModel();
      this.setModel(oModelStatus, 'landscapeStatus');
      this._bindElement('statusPanel', 'landscapeStatus>/');

      var oModelExternal = new JSONModel();
      this.setModel(oModelExternal, 'landscapeExternal');
      this._bindElement('externalPanel', 'landscapeExternal>/');

      var oModelInternal = new JSONModel();
      this.setModel(oModelInternal, 'landscapeInternal');
      this._bindElement('internalPanel', 'landscapeInternal>/');

      this.attachDisplayForRoute(this._requestData);
      this.attachPatternMatched(this._onObjectMatched);
    },

    onExit: function() {
      jQuery.sap.log.info('Landscape.controller:onExit');
      for (var sPropertyName in this._formFragments) {
        if (!this._formFragments.hasOwnProperty(sPropertyName)) {
          return;
        }

        this._formFragments[sPropertyName].destroy();
        this._formFragments[sPropertyName] = null;
      }
    },

		// General tab

    onPressEdit: function() {
      jQuery.sap.log.info('Landscape.controller:onPressEdit');

      // Clone the data
      this._oLandscape = jQuery.extend({},
        this.getView().getModel('landscape').getData().landscape
      );

      this._toggleButtonsAndView(true);
    },

    onPressCancel: function() {
      jQuery.sap.log.info('Landscape.controller:onPressCancel');

      // Restore the data
      var oModel = this.getView().getModel('landscape');
      var oData = oModel.getData();
      oData.landscape = this._oLandscape;
      oModel.setData(oData);

      this._toggleButtonsAndView(false);
    },

    onPressSave: function() {
      jQuery.sap.log.info('Landscape.controller:onPressSave');

      setTimeout(jQuery.proxy(this._saveLandscape, this));
    },

    _saveLandscape: function() {
      jQuery.sap.log.info('Landscapes.controller:_saveLandscape');

      var oViewModel = this.getModel();
      var sLandscapeId = oViewModel.getProperty('/id');

      var oModel = this.getModel('landscape');
      var oData = oModel.getProperty('/landscape');

      jQuery.ajax('/landscape/' + sLandscapeId, {
        method: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(oData),
        error: jQuery.proxy(this.ajaxError, this, 'landscapeSaveFailed'),
        success: jQuery.proxy(this.onSaveSuccess, this, this.onSaveSuccess)
      });
    },

    onSaveSuccess: function() {
      jQuery.sap.log.info('Landscapes.controller:onSaveSuccess');

      this._oLandscape = null;
      this._toggleButtonsAndView(false);
    },

    onPressDelete: function() {
      jQuery.sap.log.info('Landscape.controller:onPressDelete');

      var dialog = new Dialog({
        title: this.getResourceBundle().getText('landscapeDeleteCaption'),
        type: 'Message',
        content: [
          new Text({ text: this.getResourceBundle().getText('landscapeDeleteQuestion') })
        ],
        beginButton: new Button({
          text: this.getResourceBundle().getText('landscapeDeleteButton'),
          icon: 'sap-icon://delete',
          type: 'Reject',
          press: jQuery.proxy(this.onPressDeleteDelete, this)
        }),
        endButton: new Button({
          text: this.getResourceBundle().getText('landscapeCancelButton'),
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
      jQuery.sap.log.info('Landscape.controller:onPressDeleteDelete');

      oEvent.getSource().getParent().close();

      this.getView().setBusy(true);
      setTimeout(jQuery.proxy(this._deleteLandscape, this));
    },

    onPressRefresh: function() {
      jQuery.sap.log.info('Landscape.controller:onPressRefresh');
      this._setBusy();
      this._requestData();
    },

		// Status tab

		// External tab

    onAddExternal: function() {
      var oViewModel = this.getModel();
      var sLandscapeId = oViewModel.getProperty('/id');

      var oRouter = this.getRouter();
      oRouter.navTo('landscapeExternalNew', {
        id: sLandscapeId
      });
    },

    onDisplayExternal: function(oEvent) {
      var oViewModel = this.getModel();
      var sLandscapeId = oViewModel.getProperty('/id');

      var oItem = oEvent.getSource();
      var oBindingContext = oItem.getBindingContext('landscapeExternal');
      var sReportId = oBindingContext.getProperty('id');

      var oRouter = this.getRouter();
      oRouter.navTo('landscapeExternal', {
        id: sLandscapeId,
        reportId: sReportId
      });
    },

		// Internal tab

    onAddInternal: function() {
    },

    // General panel

    onLinkZabbixPress: function(oEvent) {
      jQuery.sap.log.info('Landscape.controller:onLinkZabbixPress');
      var oModel = this.getModel('landscape');
      var sZabbix = oModel.getProperty('/landscape/zabbix');
      sZabbix = sZabbix.replace('api_jsonrpc.php', '');
      sap.m.URLHelper.redirect(sZabbix, true);
    },

    onLinkDomainPress: function(oEvent) {
      jQuery.sap.log.info('Landscape.controller:onLinkDomainPress');
      var oModel = this.getModel('landscape');
      var sDomain = oModel.getProperty('/landscape/domain');
      if (sDomain !== undefined && sDomain !== null) {
        sap.m.URLHelper.redirect('https://portal.' + sDomain + '/RDWeb/', true);
      }
    },

    onLinkDomainBAPress: function(oEvent) {
      jQuery.sap.log.info('Landscape.controller:onLinkDomainPress');
      var oModel = this.getModel('landscape');
      var sDomain = oModel.getProperty('/landscape/domain');
      if (sDomain !== undefined && sDomain !== null) {
        sap.m.URLHelper.redirect('https://portal.' + sDomain + '/BrowserAccess/', true);
      }
    },

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

    _formFragments: {},
    _messageStrips: [],

    _deleteLandscape: function() {
      jQuery.sap.log.info('Landscape.controller:_deleteLandscape');
      var oViewModel = this.getModel();

      var sLandscapeId = oViewModel.getProperty('/id');

      jQuery.ajax('/landscape/' + sLandscapeId, {
        method: 'DELETE',
        error: jQuery.proxy(this.ajaxError, this, 'landscapeDeleteFailed'),
        success: jQuery.proxy(this.onDeleteSuccess, this)
      });
    },

    onDeleteSuccess: function(resp) {
      this.getView().setBusy(false);
      if (resp.error) {
        MessageToast.show(resp.error);
        return;
      } else {
        this.onNavBack();
      }
    },

    _toggleButtonsAndView: function(bEdit) {
      var oView = this.getView();

      // Show the appropriate action buttons
      oView.byId('toolbarEdit').setVisible(!bEdit);
      oView.byId('toolbarRefresh').setVisible(!bEdit);
      oView.byId('toolbarSave').setVisible(bEdit);
      oView.byId('toolbarCancel').setVisible(bEdit);
      oView.byId('toolbarDelete').setVisible(bEdit);

      // Set the right form type
      this._showFormFragment(bEdit ? 'Change' : 'Display');
    },

    _getFormFragment: function (sFragmentName) {
      var oFormFragment = this._formFragments[sFragmentName];

      if (oFormFragment) {
        return oFormFragment;
      }

      oFormFragment = sap.ui.jsfragment(
        this.getView().getId(),
        'sap.clr.view.Landscape' + sFragmentName,
        this
      );

      this._formFragments[sFragmentName] = oFormFragment;

      return this._formFragments[sFragmentName];
    },

    _showFormFragment: function (sFragmentName) {
      var oPanel = this.getView().byId('landscapePanel');

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

    _setBusy: function() {
      this.getView().byId('generalPanel').setBusy(true);
      this.getView().byId('statusPanel').setBusy(true);
      this.getView().byId('externalPanel').setBusy(true);
      this.getView().byId('internalPanel').setBusy(true);
    },

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
    _onObjectMatched: function (oEvent) {
      jQuery.sap.log.info('Landscape.controller:_onObjectMatched');

      if (this.navigateHomeIfNotLoggedAsAdmin()) {
        return;
      }

      this._toggleButtonsAndView(false);
      this._setBusy();

      // Get Landscape id
      var sLandscapeId = oEvent.getParameter('arguments').id;

      var oViewModel = this.getModel();
      oViewModel.setProperty('/id', sLandscapeId);

      this._requestData();
    },

    _requestData: function() {
      jQuery.sap.log.info('Landscape.controller:_requestData');

      this._closeMessageStrips();

      var oViewModel = this.getModel();
      var sLandscapeId = oViewModel.getProperty('/id');
      var oDate = oViewModel.getProperty('/date');

      // Load landscape model
      var oModel = this.getModel('landscape');
      oModel.attachRequestCompleted(this._requestCompletedGeneral, this);
      oModel.loadData(
        '/landscape/' + sLandscapeId + '/general',
        null,
        true,
        'GET',
        false,
        false
      );

			// Load landscape status model
      var oModelStatus = this.getModel('landscapeStatus');
      oModelStatus.attachRequestCompleted(this._requestCompletedStatus, this);
      oModelStatus.loadData(
        '/landscape/' + sLandscapeId + '/status',
        {
          date: oDate.getTime()
        },
        true,
        'GET',
        false,
        false
      );

			// Load landscape status model
      var oModelInternal = this.getModel('landscapeInternal');
      oModelInternal.attachRequestCompleted(this._requestCompletedInternal, this);
      oModelInternal.loadData(
        '/landscape/' + sLandscapeId + '/internal',
        null,
        true,
        'GET',
        false,
        false
      );

      var oModelExternal = this.getModel('landscapeExternal');
      oModelExternal.attachRequestCompleted(this._requestCompletedExternal, this);
      oModelExternal.loadData(
        '/landscape/' + sLandscapeId + '/external',
        null,
        true,
        'GET',
        false,
        false
      );
    },

    _requestCompletedGeneral: function(oEvent) {
      jQuery.sap.log.info('Landscape.controller:_requestCompletedGeneral');
      var oPanel = this.getView().byId('generalPanel');
      var oModel = this.getModel('landscape');
      oModel.detachRequestCompleted(this._requestCompletedGeneral, this);
      this._requestCompleted(oEvent, oPanel, oModel, true);
    },

    _requestCompletedStatus: function(oEvent) {
      jQuery.sap.log.info('Landscape.controller:_requestCompletedStatus');
      var oPanel = this.getView().byId('statusPanel');
      var oModel = this.getModel('landscapeStatus');
      oModel.detachRequestCompleted(this._requestCompletedStatus, this);
      this._requestCompleted(oEvent, oPanel, oModel);
    },

    _requestCompletedInternal: function(oEvent) {
      jQuery.sap.log.info('Landscape.controller:_requestCompletedInternal');
      var oPanel = this.getView().byId('internalPanel');
      var oModel = this.getModel('landscapeInternal');
      oModel.detachRequestCompleted(this._requestCompletedInternal, this);
      this._requestCompleted(oEvent, oPanel, oModel);
    },

    _requestCompletedExternal: function(oEvent) {
      jQuery.sap.log.info('Landscape.controller:_requestCompletedExternal');
      var oPanel = this.getView().byId('externalPanel');
      var oModel = this.getModel('landscapeExternal');
      oModel.detachRequestCompleted(this._requestCompletedExternal, this);
      this._requestCompleted(oEvent, oPanel, oModel);
    },

    _requestCompleted: function(oEvent, oPanel, oModel, check401) {
      jQuery.sap.log.info('Landscape.controller:_requestCompleted');

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

        // Should be sure to execute only once?
        if (check401) {
          if (this.navigateToLoginAfter401(oError.statusCode)) {
            return;
          }
        }
      }

      if (sError) {
        var oMessageStrip = new MessageStrip({
          text: sError,
          type: 'Error',
          showIcon: true,
          showCloseButton: true
        });

        this._messageStrips.push(oMessageStrip);
        oPanel.insertContent(oMessageStrip,	0);
      }

      oPanel.setBusy(false);
    },

		/*
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
    _bindElement: function (sId, sPath) {
      jQuery.sap.log.info('Landscape.controller:_bindElement');

      this.getView().byId(sId).bindElement({
        path: sPath
      });
    }

  });
});
