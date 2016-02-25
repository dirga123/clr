sap.ui.define([
	'sap/clr/controller/BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast'
], function (BaseController, JSONModel, MessageToast) {
	'use strict';

	return BaseController.extend("sap.clr.controller.Landscapes", {
		onInit: function() {
			console.log('Landscapes.controller:onInit');

			var oModel = new JSONModel();
			this.setModel(oModel, 'landscapes');

			this.getRouter().getRoute("landscapes").attachPatternMatched(this._onObjectMatched, this);
		},

		onPressAddAdd: function() {
			this._requestData();
		},

		onPressAddCancel: function() {
			this._requestData();
		},

		onPressAdd: function(oEvent) {
			var oModel = this.getModel('landscapes');

			// Clear new node
			oModel.setProperty('/new', {
				id: '',
				domain: '',
				zabbix: ''
			});

			this._getAddDialog().open();
		},

		addLandscape: function() {
			MessageToast.show('Adding landscape.');
			this._requestData();			
		},

		onPressDelete: function(oEvent) {
			var tile = oEvent.getParameter("tile");
			oEvent.getSource().removeTile(tile);
		},

		onPressEdit: function(oEvent) {
			var oTileContainer = this.getView().byId('tileContainer');

			var newValue = !oTileContainer.getEditable();
			oTileContainer.setEditable(newValue);

			var sText = this.getResourceBundle().getText(newValue ? "landscapeDoneEditButton" : "landscapeEditButton");

			oEvent.getSource().setText(sText);
		},

		onPressDetail: function(oEvent) {
			var oItem = oEvent.getSource();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oBindingContext = oItem.getBindingContext('landscapes');
			oRouter.navTo("landscape", {
				id: oBindingContext.getProperty('id')
			});
		},

		_getAddDialog: function() {
			 if (!this._oAddDialog) {
					this._oAddDialog = sap.ui.jsfragment('sap.clr.view.LandscapeAdd', this);
					this.getView().addDependent(this._oAddDialog);
			 }
			 return this._oAddDialog;
		},

		_onObjectMatched: function (oEvent) {
			console.log('Landscapes.controller:_onObjectMatched');

			this.getView().setBusy(true);
			this._requestData();
		},

		_requestData: function() {
			console.log('Landscapes.controller:_requestData');

			var oModel = this.getModel('landscapes');
			oModel.attachRequestCompleted(this._requestCompleted, this);
			oModel.loadData('/Landscapes');
		},

		_requestCompleted: function(oEvent) {
			console.log('Landscapes.controller:_requestCompleted');

			var oModel = this.getModel('landscapes');
			oModel.detachRequestCompleted(this._requestCompleted, this);

			//console.log(oEvent.getParameter('success'));
			if (oEvent.getParameter('success')) {
				var sError = oModel.getProperty('/error');
				if (sError) {
					MessageToast.show(sError);
				}	else {
					//this._bindView('landscape>/landscape');
				}
			} else {
				var oError = oEvent.getParameter('errorobject');
				console.log(oError);
				MessageToast.show('Error '+oError.statusCode+': '+oError.statusText+' '+oError.responseText);
			}

			this.getView().setBusy(false);
		},

		_bindView : function (sPath) {
			console.log('Landscapes.controller:_bindView');

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
		}

	});
});
