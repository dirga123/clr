sap.ui.define([
	'sap/m/Page',
	'sap/m/Button',
	'sap/m/Toolbar',
	'sap/m/ToolbarSpacer',
	'sap/m/Panel',
	'sap/clr/model/formatter',
	'jquery.sap.global',
	'sap/m/IconTabBar',
	'sap/m/Title',
	'sap/m/IconTabFilter',
	'sap/m/Text'
], function (Page, Button, Toolbar,	ToolbarSpacer, Panel, formatter, jQuery,
	IconTabBar, Title, IconTabFilter, Text) {
	'use strict';

	sap.ui.jsview('sap.clr.view.Landscape', {
		getControllerName: function () {
			return 'sap.clr.controller.Landscape';
		},

		createContent: function (oController) {
			/*
			var oPrintButton = new Button(this.createId('printButton'), {
				icon: 'sap-icon://print',
				text: '{i18n>landscapePrintButton}',
				press: [ oController.onPressPrint, oController ]
			});

			var oExportButton = new Button(this.createId('exportButton'), {
				text: '{i18n>landscapeExportButton}',
				press: [ oController.onPressExport, oController ]
			});
			*/

			var oBar = new Toolbar({
				content: [
					new ToolbarSpacer(),
					/*
					oPrintButton,
					oExportButton,
					*/
					new ToolbarSpacer()
				]
			});

			var oGeneralPanel = new Panel(this.createId('generalPanel'), {
				busyIndicatorDelay: 0,
				headerToolbar: new Toolbar({
					content: [
						new Title({
							text: '{i18n>landscapeGeneral}',
							titleStyle: 'H3'
						}),
						new ToolbarSpacer(),
						new Button(this.createId('toolbarEdit'), {
							icon: 'sap-icon://edit',
							press: [ oController.onPressEdit, oController ]
						}),
						new Button(this.createId('toolbarSave'), {
							icon: 'sap-icon://save',
							press: [ oController.onPressSave, oController ]
						}),
						new Button(this.createId('toolbarCancel'), {
							icon: 'sap-icon://sys-cancel',
							press: [ oController.onPressCancel, oController ]
						}),
						new Button(this.createId('toolbarRefresh'), {
							icon: 'sap-icon://refresh',
							press: [ oController.onPressRefresh, oController ]
						}),
						new Button(this.createId('toolbarDelete'), {
							icon: 'sap-icon://delete',
							type: 'Reject',
							press: [ oController.onPressDelete, oController ]
						})
					]
				})
			}).addStyleClass('sapUiForceWidthAuto sapUiResponsiveMargin');

			var oStatusPanel = new Panel(this.createId('statusPanel'), {
				busyIndicatorDelay: 0,
				content: []
			});

			var oExternalPanel = new Panel(this.createId('externalPanel'), {
				busyIndicatorDelay: 0,
				content: []
			});

			var oInternalPanel = new Panel(this.createId('internalPanel'), {
				busyIndicatorDelay: 0,
				content: []
			});

			var oTabs = new IconTabBar({
				expanded: '{device>/isNoPhone}',
				items: [
					new IconTabFilter({
						text: 'Status',
						content: oStatusPanel
					}),
					new IconTabFilter({
						text: 'Reports',
						content: oExternalPanel
					}),
					new IconTabFilter({
						text: 'Internal Reports',
						content: oInternalPanel
					})
				]
			}).addStyleClass('sapUiForceWidthAuto sapUiResponsiveMargin');

			var oPage = new Page(this.createId('landscapePage'), {
				title: '{i18n>landscape}',
				showHeader: true,
				showNavButton: true,
				navButtonPress: [ oController.onNavBack, oController ],
				content: [
					oGeneralPanel,
					oTabs
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
