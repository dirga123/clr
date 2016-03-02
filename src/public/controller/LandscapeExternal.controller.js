sap.ui.define([
	'sap/clr/controller/BaseReportController',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast',
	'sap/m/Dialog',
	'sap/m/Label',
	'sap/m/TextArea',
	'sap/m/Button'
], function (BaseReportController, JSONModel, MessageToast, Dialog, Label, TextArea, Button) {
	'use strict';

	return BaseReportController.extend('sap.clr.controller.LandscapeExternal', {
		onInit: function() {
			jQuery.sap.log.info('LandscapeExternal.controller:onInit');

			this.setModel(
				new JSONModel({
				})
			);

			this.getRouter().getRoute('landscapeExternal').attachPatternMatched(
				this._onObjectMatched, this
			);
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			jQuery.sap.log.info('LandscapeExternal.controller:_onObjectMatched');

			// If the view was not bound yet its not busy,
			// only if the binding requests data it is set to busy again
			this.getView().setBusy(true);

			// Get Landscape id
			var sLandscapeId = oEvent.getParameter('arguments').id;
			var sReportId = oEvent.getParameter('arguments').reportId;

			var oViewModel = this.getModel();
			oViewModel.setProperty('/id', sLandscapeId);
			oViewModel.setProperty('/reportId', sReportId);

			// Create model and set it to view
			var oModel = new JSONModel();
			this.setModel(oModel, 'external');
			this._bindView('external>/external');

			this._requestData();
		},

		_requestData: function() {
			jQuery.sap.log.info('LandscapeExternal.controller:_requestData');

			var oViewModel = this.getModel();
			var sLandscapeId = oViewModel.getProperty('/id');
			var sReportId = oViewModel.getProperty('/reportId');

			// Load model
			var oModel = this.getModel('external');
			oModel.attachRequestCompleted(this._requestCompleted, this);
			oModel.loadData('/Landscape/' + sLandscapeId + '/external/' + sReportId, {});
		},

		_requestCompleted: function(oEvent) {
			jQuery.sap.log.info('LandscapeExternal.controller:_requestCompleted');

			var oModel = this.getModel('external');
			oModel.detachRequestCompleted(this._requestCompleted, this);

			if (oEvent.getParameter('success')) {
				var sError = oModel.getProperty('/error');
				if (sError) {
					MessageToast.show(sError);
				}
			} else {
				var oError = oEvent.getParameter('errorobject');
				jQuery.sap.log.error(oError);
				MessageToast.show(
					'Error ' + oError.statusCode + ': ' + oError.statusText +
					' ' + oError.responseText
				);
			}

			this.getView().setBusy(false);
		},

		/*
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function (sPath) {
			jQuery.sap.log.info('LandscapeExternal.controller:_bindView');

			this.getView().bindElement({
				path: sPath
			});
		}
	});
});
