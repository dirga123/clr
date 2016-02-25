sap.ui.define([
	'sap/clr/controller/BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast'
], function (BaseController, JSONModel, MessageToast) {
	'use strict';

	return BaseController.extend('sap.clr.controller.Landscape', {
		onInit : function () {
			console.log('Landscape.controller:onInit');

			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				date: new Date()
			});
			this.setModel(oViewModel, "landscapeView");

/*
			this.getView().byId('pickMonth').bindProperty('value', {
				path: 'landscapeView>/ahoj'
			});
*/
			this.getRouter().getRoute("landscape").attachPatternMatched(this._onObjectMatched, this);
		},

		onPressRefresh: function() {
			//this.getView().setBusy(true);
			//var oViewModel = this.getModel("landscapeView");
			//oViewModel.setProperty("/busy", true);
			this.getView().setBusy(true);
			this._requestData();
		},

		onPressPrint: function(oEvent) {
			var oTarget = this.getView();
			var sTargetId = oEvent.getSource().data("targetId");

			if (sTargetId) {
				oTarget = oTarget.byId(sTargetId);
			}

			if (oTarget) {
				var $domTarget = oTarget.$()[0],
				sTargetContent = $domTarget.innerHTML,
				sOriginalContent = document.body.innerHTML;
				document.body.innerHTML = sTargetContent;
				window.print();
				document.body.innerHTML = sOriginalContent;
			} else {
				jQuery.sap.log.error("onPrint needs a valid target container [view|data:targetId=\"SID\"]");
			}
		},

		onPressExport: function() {

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
			console.log('Landscape.controller:_onObjectMatched');
			//console.log(oEvent.getParameter("arguments").id);

			//this.getView().setBusy(true);

			// Set busy indicator during view binding
			var oViewModel = this.getModel("landscapeView");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			//oViewModel.setProperty("/busy", true);
			this.getView().setBusy(true);


			// Get Landscape id
			var sLandscapeId =  oEvent.getParameter("arguments").id;

			oViewModel.setProperty("/id", sLandscapeId);

			// Create model and set it to view
			var oModel = new JSONModel();
			this.setModel(oModel, 'landscape');

			this._requestData();
		},

		_requestData: function() {
			console.log('Landscape.controller:_requestData');
			var oViewModel = this.getModel('landscapeView');
			var sLandscapeId = oViewModel.getProperty('/id');
			var oDate = oViewModel.getProperty('/date');

			// Load model
			var oModel = this.getModel('landscape');
			oModel.attachRequestCompleted(this._requestCompleted, this);
			oModel.loadData('/Landscape', JSON.stringify({
				id: sLandscapeId,
				date: oDate.getTime()
			}), true, 'POST');
		},

		_requestCompleted: function(oEvent) {
			console.log('Landscape.controller:_requestCompleted');

			var oModel = this.getModel('landscape');
			oModel.detachRequestCompleted(this._requestCompleted, this);

			//console.log(oEvent.getParameter('success'));
			if (oEvent.getParameter('success')) {
				var sError = oModel.getProperty('/error');
				if (sError) {
					MessageToast.show(sError);
				}	else {
					this._bindView('landscape>/landscape');
				}
			} else {
				var oError = oEvent.getParameter('errorobject');
				console.log(oError);
				MessageToast.show('Error '+oError.statusCode+': '+oError.statusText+' '+oError.responseText);
			}

			//this.getView().setBusy(false);

			//var oViewModel = this.getModel('landscapeView');
			//oViewModel.setProperty('/busy', false);
			this.getView().setBusy(false);

		},

		/*
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView : function (sPath) {
			console.log('Landscape.controller:_bindView');

			this.getView().bindElement({
				path: sPath,
				model: 'landscape',
				events: {
					change: this._onBindingChange.bind(this)
				}
			});

			/*
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path : sObjectPath,
				events: {
					change : this._onBindingChange.bind(this),
					dataRequested : function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
			*/
		},

		_onBindingChange : function () {
			console.log('Landscape.controller:_onBindingChange');
/*
						this.getView().byId('slaList').bindItems({
							path: '{landscape>services}',
							model: 'landscape',
							template: new ObjectListItem({
								title: '{landscape>name}'
							})
						});
*/

			/*
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}

			var sPath = oElementBinding.getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.ID,
				sObjectName = oObject.Name,
				oViewModel = this.getModel("detailView");

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			oViewModel.setProperty("/saveAsTileTitle",oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
				*/
		}

	});
});
