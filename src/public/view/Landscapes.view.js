sap.ui.define([
	'sap/m/Page',
	'sap/m/Button',
	'sap/m/Toolbar',
	'sap/m/ToolbarSpacer',
	'sap/m/TileContainer',
	'sap/m/StandardTile'
], function (Page, Button, Toolbar, ToolbarSpacer, TileContainer, StandardTile) {
	'use strict';

	sap.ui.jsview('sap.clr.view.Landscapes', {
		getControllerName: function () {
			return 'sap.clr.controller.Landscapes';
		},

		createContent: function (oController) {
			var oAddButton = new Button(this.createId('addButton'), {
				text: '{i18n>landscapeAddButton}',
				press: [ oController.onPressAdd, oController ]
			});

			var oBar = new Toolbar({
				content: [
					new ToolbarSpacer(),
					oAddButton,
					new ToolbarSpacer()
				]
			});

			var oTile = new StandardTile({
				icon: 'sap-icon://overview-chart',
				number: '0.99',
				numberUnit: 'SLA',
				title: '{landscapes>id} {landscapes>domain}',
				info: '{landscapes>status}',
				infoState: '{landscapes>infoState}',
				press: [ oController.onPressDetail, oController ]
			});

			var oTileContainer = new TileContainer(this.createId('tileContainer'), {
				width: '100%',
				height: '100%'
			});

			oTileContainer.bindAggregation('tiles', 'landscapes>/landscapes', oTile);

			var oPage = new Page(this.createId('landscapesPage'), {
				title: '{i18n>landscapesTitle}',
				showHeader: true,
				showNavButton: true,
				navButtonPress: [ oController.onNavBack, oController ],
				enableScrolling: false,
				content: [
					oTileContainer
				],
				footer: [
					oBar
				]
			});

			this.setBusyIndicatorDelay(0);

			return oPage;
		}
	});
});
