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
	'sap/m/Text',
	'sap/ui/layout/VerticalLayout',
	'sap/m/List',
	'sap/m/StandardListItem',
	'sap/m/FlexBox'
], function (Page, Button, Toolbar,	ToolbarSpacer, Panel, formatter, jQuery,
	IconTabBar, Title, IconTabFilter, Text, VerticalLayout, List, StandardListItem,
	FlexBox) {
	'use strict';

	sap.ui.jsview('sap.clr.view.Landscape', {
		getControllerName: function () {
			return 'sap.clr.controller.Landscape';
		},

		createContent: function (oController) {
			var oBar = new Toolbar({
				content: [
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

			var oExternalList = new List(this.createId('externalList'), {
			});

			var oExternalItem = new StandardListItem({
				title: '{landscapeExternal>name}',
				type: 'Navigation',
				press: [ oController.onDisplayExternal, oController ]
			});

			oExternalList.bindItems({
				path: 'landscapeExternal>/externals',
				template: oExternalItem
			});

			var oExternalPanel = new Panel(this.createId('externalPanel'), {
				busyIndicatorDelay: 0,
				content: [
					new VerticalLayout({
						width: '100%',
						content: [
							new Button({
								text: 'Add report',
								type: sap.m.ButtonType.Emphasized,
								press: [ oController.onAddExternal, oController ]
							}),
							oExternalList
						]
					})
				]
			});

			var oInternalPanel = new Panel(this.createId('internalPanel'), {
				busyIndicatorDelay: 0,
				content: [
					new VerticalLayout({
						content: [
							new Button({
								text: 'Add report',
								type: sap.m.ButtonType.Emphasized,
								press: [ oController.onAddInternal, oController ]
							})
						]
					})
				]
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
