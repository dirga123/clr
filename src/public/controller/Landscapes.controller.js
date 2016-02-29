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
			var oModel = this.getModel('landscapes');
			var oData = oModel.getProperty('/new');
			MessageToast.show('Adding landscape.' + JSON.stringify(oData));
			this._requestData();
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

			if (oEvent.getParameter('success')) {
				var sError = oModel.getProperty('/error');
				if (sError) {
					MessageToast.show(sError);
				}
			} else {
				var oError = oEvent.getParameter('errorobject');
				console.log(oError);
				MessageToast.show('Error '+oError.statusCode+': '+oError.statusText+' '+oError.responseText);
			}

			this.getView().setBusy(false);
		},
	});
});
