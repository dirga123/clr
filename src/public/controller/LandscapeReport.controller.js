sap.ui.define([
	'sap/clr/controller/BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast'
], function (BaseController, JSONModel, MessageToast) {
	'use strict';

	return BaseController.extend('sap.clr.controller.LandscapeReport', {
		onInit: function() {
			jQuery.sap.log.info('LandscapeReport.controller:onInit');

			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				date: new Date()
			});
			this.setModel(oViewModel, 'landscapeView');

/*
			this.getView().byId('pickMonth').bindProperty('value', {
				path: 'landscapeView>/ahoj'
			});
*/
			this.getRouter().getRoute('landscapeReport').attachPatternMatched(
				this._onObjectMatched, this
			);
		},

		onPressRefresh: function() {
			jQuery.sap.log.info('LandscapeReport.controller:onPressRefresh');

			// this.getView().setBusy(true);
			// var oViewModel = this.getModel("landscapeView");
			// oViewModel.setProperty("/busy", true);
			this.getView().setBusy(true);
			this._requestData();
		},

		onPressPrint: function(oEvent) {
			jQuery.sap.log.info('LandscapeReport.controller:onPressPrint');

			var oTarget = this.getView();
			var sTargetId = oEvent.getSource().data('targetId');

			if (sTargetId) {
				oTarget = oTarget.byId(sTargetId);
			}

			if (oTarget) {
				var $domTarget = oTarget.$()[0];
				var sTargetContent = $domTarget.innerHTML;
				var sOriginalContent = document.body.innerHTML;
				document.body.innerHTML = sTargetContent;
				window.print();
				document.body.innerHTML = sOriginalContent;
			} else {
				jQuery.sap.log.error(
					'onPrint needs a valid target container [view|data:targetId=\"SID\"]'
				);
			}
		},

		onPressExport: function() {
			jQuery.sap.log.info('LandscapeReport.controller:onPressExport');
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
			jQuery.sap.log.info('LandscapeReport.controller:_onObjectMatched');
			console.log(oEvent.getParameter("arguments"));

			// Set busy indicator during view binding
			var oViewModel = this.getModel('landscapeView');

			// If the view was not bound yet its not busy,
			// only if the binding requests data it is set to busy again
			this.getView().setBusy(true);


			// Get Landscape id
			var sLandscapeId = oEvent.getParameter('arguments').id;

			oViewModel.setProperty('/id', sLandscapeId);

			// Create model and set it to view
			var oModel = new JSONModel();
			this.setModel(oModel, 'landscape');

			this._requestData();
		},

		_requestData: function() {
			jQuery.sap.log.info('LandscapeReport.controller:_requestData');

			var oViewModel = this.getModel('landscapeView');
			var sLandscapeId = oViewModel.getProperty('/id');
			var oDate = oViewModel.getProperty('/date');

			// Load model
			var oModel = this.getModel('landscape');
			oModel.attachRequestCompleted(this._requestCompleted, this);
			oModel.loadData('/Landscape/' + sLandscapeId, {
				date: oDate.getTime()
			});
		},

		_requestCompleted: function(oEvent) {
			jQuery.sap.log.info('LandscapeReport.controller:_requestCompleted');

			var oModel = this.getModel('landscape');
			oModel.detachRequestCompleted(this._requestCompleted, this);

			if (oEvent.getParameter('success')) {
				var sError = oModel.getProperty('/error');
				if (sError) {
					MessageToast.show(sError);
				}	else {
					this._bindView('landscape>/landscape');
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
			jQuery.sap.log.info('LandscapeReport.controller:_bindView');

			this.getView().bindElement({
				path: sPath,
				model: 'landscape',
				events: {
					change: this._onBindingChange.bind(this)
				}
			});
		}
	});
});
