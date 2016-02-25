sap.ui.define([
	'sap/clr/controller/BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast'
], function (BaseController, JSONModel, MessageToast) {
	'use strict';

	return BaseController.extend("sap.clr.controller.Home", {

		onInit: function() {
			console.log('Home.controller:onInit');

			var oModel = new JSONModel({
			});
			this.setModel(oModel, 'home');

			this.getRouter().getRoute("home").attachPatternMatched(this._onObjectMatched, this);
		},

		onPressLandscapes: function(oEvent) {
			this.getRouter().navTo('landscapes');
		},

		_onObjectMatched: function (oEvent) {
			console.log('Home.controller:_onObjectMatched');

			this.getView().byId('landscapesTile').setBusy(true);
			this._requestData();
		},

		_requestData: function() {
			console.log('Home.controller:_requestData');

			var oModel = this.getModel('home');
			oModel.attachRequestCompleted(this._requestCompleted, this);
			oModel.loadData('/Home');
		},

		_requestCompleted: function(oEvent) {
			console.log('Home.controller:_requestCompleted');

			var oModel = this.getModel('home');
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
				MessageToast.show('Error '+oError.statusCode+': '+oError.statusText+' '+oError.responseText);
			}

			this.getView().byId('landscapesTile').setBusy(false);
		},

		_bindView : function (sPath) {
			console.log('Home.controller:_bindView');

			/*
			this.getView().bindElement({
				path: sPath,
				model: 'landscape',
				events: {
					change: this._onBindingChange.bind(this)
				}
			});
			*/
		}

	});
});
