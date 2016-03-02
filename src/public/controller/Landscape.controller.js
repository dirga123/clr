sap.ui.define([
	'sap/clr/controller/BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast',
	'sap/m/MessageStrip'
], function (BaseController, JSONModel, MessageToast, MessageStrip) {
	'use strict';

	return BaseController.extend('sap.clr.controller.Landscape', {
		onInit: function() {
			jQuery.sap.log.info('Landscape.controller:onInit');

			// Set the initial form to be the display one
			this._toggleButtonsAndView(false);

			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				date: new Date()
			});
			this.setModel(oViewModel, 'landscapeView');

			// Create model and set it to view
			var oModel = new JSONModel();
			this.setModel(oModel, 'landscape');
			this._bindElement('generalPanel', 'landscape>/landscape');

			var oModelStatus = new JSONModel();
			this.setModel(oModelStatus, 'landscapeStatus');
			this._bindElement('statusPanel', 'landscapeStatus>/status');

			var oModelExternal = new JSONModel();
			this.setModel(oModelExternal, 'landscapeExternal');
			this._bindElement('externalPanel', 'landscapeExternal>/external');

			var oModelInternal = new JSONModel();
			this.setModel(oModelInternal, 'landscapeInternal');
			this._bindElement('internalPanel', 'landscapeInternal>/internal');

			this.getRouter().getRoute('landscape').attachPatternMatched(
				this._onObjectMatched, this
			);
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
			this._toggleButtonsAndView(false);
		},

		onPressDelete: function() {
			jQuery.sap.log.info('Landscape.controller:onPressDelete');
		},

		onPressRefresh: function() {
			jQuery.sap.log.info('Landscape.controller:onPressRefresh');
			this._setBusy();
			this._requestData();
		},

		// Status tab

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		_formFragments: {},
		_messageStrips: [],

		_toggleButtonsAndView: function(bEdit) {
			var oView = this.getView();

			// Show the appropriate action buttons
			oView.byId('toolbarEdit').setVisible(!bEdit);
			oView.byId('toolbarRefresh').setVisible(!bEdit);
			oView.byId('toolbarSave').setVisible(bEdit);
			oView.byId('toolbarCancel').setVisible(bEdit);
			oView.byId('toolbarDelete').setVisible(bEdit);

			// oView.byId('printButton').setVisible(!bEdit);
			// oView.byId('printExport').setVisible(!bEdit);

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
			var oPanel = this.getView().byId('generalPanel');

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
			this._closeMessageStrips();
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

			this._setBusy();

			// Get Landscape id
			var sLandscapeId = oEvent.getParameter('arguments').id;

			var oViewModel = this.getModel('landscapeView');
			oViewModel.setProperty('/id', sLandscapeId);

			this._requestData();
		},

		_requestData: function() {
			jQuery.sap.log.info('Landscape.controller:_requestData');
			var oViewModel = this.getModel('landscapeView');
			var sLandscapeId = oViewModel.getProperty('/id');
			var oDate = oViewModel.getProperty('/date');

			// Load landscape model
			var oModel = this.getModel('landscape');
			oModel.attachRequestCompleted(this._requestCompletedGeneral, this);
			oModel.loadData('/Landscape/' + sLandscapeId + '/general', {
				date: oDate.getTime()
			});

			// Load landscape status model
			var oModelStatus = this.getModel('landscapeStatus');
			oModelStatus.attachRequestCompleted(this._requestCompletedStatus, this);
			oModelStatus.loadData('/Landscape/' + sLandscapeId + '/status', {
				date: oDate.getTime()
			});

			// Load landscape status model
			var oModelInternal = this.getModel('landscapeInternal');
			oModelInternal.attachRequestCompleted(this._requestCompletedInternal, this);
			oModelInternal.loadData('/Landscape/' + sLandscapeId + '/internal', {
				date: oDate.getTime()
			});

			var oModelExternal = this.getModel('landscapeExternal');
			oModelExternal.attachRequestCompleted(this._requestCompletedExternal, this);
			oModelExternal.loadData('/Landscape/' + sLandscapeId + '/external', {
				date: oDate.getTime()
			});
		},

		_requestCompletedGeneral: function(oEvent) {
			jQuery.sap.log.info('Landscape.controller:_requestCompletedGeneral');
			var oPanel = this.getView().byId('generalPanel');
			var oModel = this.getModel('landscape');
			oModel.detachRequestCompleted(this._requestCompletedGeneral, this);
			this._requestCompleted(oEvent, oPanel, oModel);
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

		_requestCompleted: function(oEvent, oPanel, oModel) {
			jQuery.sap.log.info('Landscape.controller:_requestCompleted');

			//console.log(oEvent.oSource);
			//console.log(oEvent.mParameters);
			var sError;

			if (oEvent.getParameter('success')) {
				if (oEvent.oSource.oData.error) {
					sError = oEvent.oSource.oData.error;
				}
			} else {
				var oError = oEvent.getParameter('errorobject');
				// jQuery.sap.log.error(JSON.stringify(oError));
				sError = 'Error ' + oError.statusCode + ': ' + oError.statusText +
					' ' + oError.responseText;
			}
			if (sError) {
				//jQuery.sap.log.error(sError);

				var oMessageStrip = new MessageStrip({
					text: sError,
					type: 'Error',
					showIcon: true,
					showCloseButton: true
				}).addStyleClass('sapUiMediumMarginBottom');

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
				path: sPath,
				events: {
					change: this._onBindingChange.bind(this)
				}
			});
		},

		_onBindingChange: function () {
			jQuery.sap.log.info('Landscape.controller:_onBindingChange');
		}

	});
});
