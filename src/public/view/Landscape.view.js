sap.ui.define([
	'sap/m/Page',
	'sap/m/Button',
	'sap/m/Toolbar',
	'sap/m/ToolbarSpacer',
	'sap/m/Panel',
	'sap/m/Title',
	'sap/ui/layout/form/SimpleForm',
	'sap/m/Label',
	'sap/m/Text',
	'sap/m/List',
	'sap/m/ObjectListItem',
	'sap/m/ObjectAttribute',
	'sap/m/ObjectStatus',
	'sap/clr/model/formatter',
	'jquery.sap.global',
	'sap/m/CustomListItem',
	'sap/ui/layout/VerticalLayout',
	'sap/m/FlexBox',
	'sap/m/Table',
	'sap/m/Column',
	'sap/m/ColumnListItem',
	'sap/m/ObjectIdentifier',
	'sap/m/ObjectNumber'
], function (Page, Button, Toolbar,	ToolbarSpacer, Panel, Title, SimpleForm,
	Label, Text, List, ObjectListItem, ObjectAttribute, ObjectStatus,
	formatter, jQuery, CustomListItem, VerticalLayout, FlexBox,
	Table, Column, ColumnListItem, ObjectIdentifier, ObjectNumber) {
	'use strict';

	sap.ui.jsview('sap.clr.view.Landscape', {
		getControllerName: function () {
			return 'sap.clr.controller.Landscape';
		},

		createContent: function (oController) {
			var oPrintButton = new Button(this.createId('printButton'), {
					icon: 'sap-icon://print',
					text: '{i18n>landscapePrintButton}',
					press: [ oController.onPressPrint, oController ]
			});

			var oExportButton = new Button(this.createId('exportButton'), {
					text: '{i18n>landscapeExportButton}',
					press: [ oController.onPressExport, oController ]
			});

			var oBar = new Toolbar({
				content: [
					new ToolbarSpacer(),
					oPrintButton,
					oExportButton,
					new ToolbarSpacer()
				]
			});

			var oGeneralPanel = new Panel({
				headerToolbar: new Toolbar({
					content: [
						new Title({
							text: '{i18n>landscapeGeneral}',
							titleStyle: 'H3'
						}),
						new ToolbarSpacer(),
						new sap.m.DateTimeInput(this.createId('pickMonth'), {
							width: '15em',
							displayFormat: 'MM/yyyy',
							dateValue: '{landscapeView>/date}',
							valueFormat: 'dd.MM.yyyy',
							change: [ oController.onPressRefresh, oController ]
						}),
						new Button({
							icon: 'sap-icon://refresh',
							press: [ oController.onPressRefresh, oController ]
						})
					]
				}),
				content: [
					new SimpleForm({
						minWidth: 1024,
						maxContainerCols: 2,
						layout: 'ResponsiveGridLayout',
						editable: false,
						labelSpanL: 1,
						labelSpanM: 1,
						emptySpanL: 1,
						emptySpanM: 1,
						columnsL: 1,
						columnsM: 1,
						content: [
							new Label({ text: '{i18n>landscapeID}' }),
							new Text({ text: '{landscape>id}' }),
							new Label({ text: '{i18n>landscapeZabbix}' }),
							new Text({ text: '{landscape>zabbix}' }),
							new Label({ text: '{i18n>landscapeDomain}' }),
							new Text({ text: '{landscape>domain}' })
						]
					})
				]
			}).addStyleClass('sapUiForceWidthAuto sapUiResponsiveMargin');

			var oSlaList = new List(this.createId('slaList'), {
			});

			var oSlaItem = new ObjectListItem({
				title: '{landscape>name}',
				type: 'Inactive',
				number: {
        	parts: [ 'landscape>currSla', 'landscape>goodSla' ],
          formatter: function(currSla, goodSla) {
						var text = "";
		        if (currSla) {
							text = parseFloat(currSla).toFixed(4);
						}
		        if (goodSla) {
							text += ' / ' + parseFloat(goodSla).toFixed(4);
						}
		        return text;
					}
        },
				numberState: {
					parts: [ 'landscape>status' ],
          formatter: jQuery.proxy(formatter.statusToState, this)
				},
				attributes: [
					new ObjectAttribute({
						title: '{i18n>landscapeOkTime}',
						text: {
							parts: ['landscape>okTime'],
							formatter: jQuery.proxy(formatter.secondsToString, this)
						}
					}),
					new ObjectAttribute({
						title: '{i18n>landscapeProblemTime}',
						text: {
							parts: ['landscape>problemTime'],
							formatter: jQuery.proxy(formatter.secondsToString, this)
						}
					}),
					new ObjectAttribute({
						title: '{i18n>landscapeDowntime}',
						text: {
							parts: ['landscape>downtimeTime'],
							formatter: jQuery.proxy(formatter.secondsToString, this)
						}
					})
				],
				firstStatus: new ObjectStatus({
					title: '{i18n>landscapeStatus}',
					text: {
						parts: ['landscape>status'],
						formatter: jQuery.proxy(formatter.statusToText, this)
					},
					state: {
						parts: ['landscape>status'],
						formatter: jQuery.proxy(formatter.statusToState, this)
					}
				})
			});

			oSlaList.bindItems({
				path: 'landscape>services',
				model: 'landscape',
				template: oSlaItem
			});

			var oSlaPanel = new Panel(this.createId('slaPanel'), {
				headerToolbar: new Toolbar({
					content: [
						new Title({
							text: '{i18n>landscapeSla}',
							titleStyle: 'H3'
						}),
						new ToolbarSpacer()
					]
				}),
				content: [
					oSlaList
				]
			}).addStyleClass('sapUiForceWidthAuto sapUiResponsiveMargin');

			var oHostList = new List(this.createId('hostList'), {
				inset: true,
				headerText: '{i18n>landscapeHosts}'
			});

			var oHostItem = new ObjectListItem({
				title: '{landscape>name}',
				type: 'Inactive',
				number: {
        	parts: [ 'landscape>status' ],
          formatter: jQuery.proxy(formatter.statusToText, this)
        },
				numberState: {
					parts: [ 'landscape>status' ],
          formatter: jQuery.proxy(formatter.statusToState, this)
				},
				attributes: [
					new ObjectAttribute({
						title: '{i18n>landscapeAgentStatus}',
						text: {
							parts: ['landscape>available'],
							formatter: function(available) {
								var resourceBundle = this.getModel("i18n").getResourceBundle();

								switch (available) {
									case '1':
										return resourceBundle.getText("landscapeAgentAvail");
									case '2':
										return resourceBundle.getText("landscapeAgentUnavail");
									default:
										return resourceBundle.getText("landscapeAgentNA");
								}
							}
						}
					})
				],
				firstStatus: new ObjectStatus({
					//title: '{i18n>Error}',
					text: '{landscape>error}',
					state: 'Error'
				})
			});

			oHostList.bindItems({
				path: 'landscape>hosts',
				template: oHostItem
			});

			var oCustomerList = new List(this.createId('custList'), {
			});

			var oCustomerUsersTable = new Table({
				columns: [
					new Column({
						header: new Text({ text: 'Users' })
					}),
					new Column({
						header: new Text({ text: 'First' })
					}),
					new Column({
						header: new Text({ text: 'Last' })
					}),
					new Column({
						header: new Text({ text: 'Min' })
					}),
					new Column({
						header: new Text({ text: 'Max' })
					}),
					new Column({
						header: new Text({ text: 'Avg' })
					})
				],
				items: [
					new ColumnListItem({
						cells: [
							new ObjectIdentifier({ title: 'Users'}),
							new ObjectNumber({ number: '{landscape>users/first}' }),
							new ObjectNumber({ number: '{landscape>users/last}' }),
							new ObjectNumber({ number: '{landscape>users/min}' }),
							new ObjectNumber({ number: '{landscape>users/max}' }),
							new ObjectNumber({ number: {
								parts: [ 'landscape>users/avg' ],
								formatter: jQuery.proxy(formatter.avgToText, this)
							}})
						]
					}),
					new ColumnListItem({
						cells: [
							new ObjectIdentifier({ title: 'RDS users'}),
							new ObjectNumber({ number: '{landscape>usersRDS/first}' }),
							new ObjectNumber({ number: '{landscape>usersRDS/last}' }),
							new ObjectNumber({ number: '{landscape>usersRDS/min}' }),
							new ObjectNumber({ number: '{landscape>usersRDS/max}' }),
							new ObjectNumber({ number: {
								parts: [ 'landscape>usersRDS/avg' ],
								formatter: jQuery.proxy(formatter.avgToText, this)
							}})
						]
					})
				]
			});

			var oCustomerTenantsTable = new Table({
				columns: [
					new Column({
						header: new Text({ text: 'Tenants' })
					}),
					new Column({
						header: new Text({ text: 'First' })
					}),
					new Column({
						header: new Text({ text: 'Last' })
					}),
					new Column({
						header: new Text({ text: 'Min' })
					}),
					new Column({
						header: new Text({ text: 'Max' })
					}),
					new Column({
						header: new Text({ text: 'Avg' })
					})
				],
				items: [
					new ColumnListItem({
						cells: [
							new ObjectIdentifier({ title: 'Demo'}),
							new ObjectNumber({ number: '{landscape>tenantsDemo/first}' }),
							new ObjectNumber({ number: '{landscape>tenantsDemo/last}' }),
							new ObjectNumber({ number: '{landscape>tenantsDemo/min}' }),
							new ObjectNumber({ number: '{landscape>tenantsDemo/max}' }),
							new ObjectNumber({ number: {
								parts: [ 'landscape>tenantsDemo/avg' ],
								formatter: jQuery.proxy(formatter.avgToText, this)
							}})
						]
					}),
					new ColumnListItem({
						cells: [
							new ObjectIdentifier({ title: 'Productive'}),
							new ObjectNumber({ number: '{landscape>tenantsProductive/first}' }),
							new ObjectNumber({ number: '{landscape>tenantsProductive/last}' }),
							new ObjectNumber({ number: '{landscape>tenantsProductive/min}' }),
							new ObjectNumber({ number: '{landscape>tenantsProductive/max}' }),
							new ObjectNumber({ number: {
								parts: [ 'landscape>tenantsProductive/avg' ],
								formatter: jQuery.proxy(formatter.avgToText, this)
							}})
						]
					}),
					new ColumnListItem({
						cells: [
							new ObjectIdentifier({ title: 'Testing'}),
							new ObjectNumber({ number: '{landscape>tenantsTesting/first}' }),
							new ObjectNumber({ number: '{landscape>tenantsTesting/last}' }),
							new ObjectNumber({ number: '{landscape>tenantsTesting/min}' }),
							new ObjectNumber({ number: '{landscape>tenantsTesting/max}' }),
							new ObjectNumber({ number: {
								parts: [ 'landscape>tenantsTesting/avg' ],
								formatter: jQuery.proxy(formatter.avgToText, this)
							}})
						]
					}),
					new ColumnListItem({
						cells: [
							new ObjectIdentifier({ title: 'Trial'}),
							new ObjectNumber({ number: '{landscape>tenantsTrial/first}' }),
							new ObjectNumber({ number: '{landscape>tenantsTrial/last}' }),
							new ObjectNumber({ number: '{landscape>tenantsTrial/min}' }),
							new ObjectNumber({ number: '{landscape>tenantsTrial/max}' }),
							new ObjectNumber({ number: {
								parts: [ 'landscape>tenantsTrial/avg' ],
								formatter: jQuery.proxy(formatter.avgToText, this)
							}})
						]
					})
				]
			});

			var oCustomerItem = new CustomListItem({
				type: 'Inactive',
				content: [
					new VerticalLayout({
						content: [
							new SimpleForm({
								minWidth: 1024,
								maxContainerCols: 2,
								layout: 'ResponsiveGridLayout',
								editable: false,
								labelSpanL: 2,
								labelSpanM: 2,
								emptySpanL: 1,
								emptySpanM: 1,
								columnsL: 1,
								columnsM: 1,
								content: [
									new Label({ text: 'Name' }),
									new ObjectIdentifier({ title: 'Customer {landscape>id}' })
								]
							}),
							oCustomerUsersTable,
							oCustomerTenantsTable
						]
					})
				]
			});

			oCustomerList.bindItems({
				path: 'landscape>items/customers',
				template: oCustomerItem
			});

			var oCustomersPanel = new Panel(this.createId('customersPanel'), {
				headerToolbar: new Toolbar({
					content: [
						new Title({
							text: '{i18n>landscapeCustomers}',
							titleStyle: 'H3'
						}),
						new Title({
							text: '{landscape>items/customerCount/max}',
							titleStyle: 'H1'
						}),
						new ToolbarSpacer()
					]
				}),
				content: [
					oCustomerList
				]
			}).addStyleClass('sapUiForceWidthAuto sapUiResponsiveMargin');

			var oServiceUnitsList = new List(this.createId('serviceUnitsList'), {
			});

			var oServiceUnitTenantsTable = new Table({
				columns: [
					new Column({
						header: new Text({ text: 'Tenants' })
					}),
					new Column({
						header: new Text({ text: 'First' })
					}),
					new Column({
						header: new Text({ text: 'Last' })
					}),
					new Column({
						header: new Text({ text: 'Min' })
					}),
					new Column({
						header: new Text({ text: 'Max' })
					}),
					new Column({
						header: new Text({ text: 'Avg' })
					})
				],
				items: [
					new ColumnListItem({
						cells: [
							new ObjectIdentifier({ title: 'Demo'}),
							new ObjectNumber({ number: '{landscape>tenantsDemo/first}' }),
							new ObjectNumber({ number: '{landscape>tenantsDemo/last}' }),
							new ObjectNumber({ number: '{landscape>tenantsDemo/min}' }),
							new ObjectNumber({ number: '{landscape>tenantsDemo/max}' }),
							new ObjectNumber({ number: '{landscape>tenantsDemo/avg}' })
						]
					}),
					new ColumnListItem({
						cells: [
							new ObjectIdentifier({ title: 'Productive'}),
							new ObjectNumber({ number: '{landscape>tenantsProductive/first}' }),
							new ObjectNumber({ number: '{landscape>tenantsProductive/last}' }),
							new ObjectNumber({ number: '{landscape>tenantsProductive/min}' }),
							new ObjectNumber({ number: '{landscape>tenantsProductive/max}' }),
							new ObjectNumber({ number: '{landscape>tenantsProductive/avg}' })
						]
					}),
					new ColumnListItem({
						cells: [
							new ObjectIdentifier({ title: 'Testing'}),
							new ObjectNumber({ number: '{landscape>tenantsTesting/first}' }),
							new ObjectNumber({ number: '{landscape>tenantsTesting/last}' }),
							new ObjectNumber({ number: '{landscape>tenantsTesting/min}' }),
							new ObjectNumber({ number: '{landscape>tenantsTesting/max}' }),
							new ObjectNumber({ number: '{landscape>tenantsTesting/avg}' })
						]
					}),
					new ColumnListItem({
						cells: [
							new ObjectIdentifier({ title: 'Trial'}),
							new ObjectNumber({ number: '{landscape>tenantsTrial/first}' }),
							new ObjectNumber({ number: '{landscape>tenantsTrial/last}' }),
							new ObjectNumber({ number: '{landscape>tenantsTrial/min}' }),
							new ObjectNumber({ number: '{landscape>tenantsTrial/max}' }),
							new ObjectNumber({ number: '{landscape>tenantsTrial/avg}' })
						]
					})
				]
			})

			var oServiceUnitItem = new CustomListItem({
				type: 'Inactive',
				content: [
					new VerticalLayout({
						content: [
							new SimpleForm({
								minWidth: 1024,
								maxContainerCols: 2,
								layout: 'ResponsiveGridLayout',
								editable: false,
								labelSpanL: 2,
								labelSpanM: 2,
								emptySpanL: 1,
								emptySpanM: 1,
								columnsL: 1,
								columnsM: 1,
								content: [
									new Label({ text: 'Name' }),
									new FlexBox({
										justifyContent: sap.m.FlexJustifyContent.Start,
										alignItems: sap.m.FlexAlignItems.Center,
										items: [
											new ObjectIdentifier({ title: '{landscape>name/last}' }).addStyleClass('sapUiTinyMarginEnd'),
											new Text({ text: '(was {landscape>name/first})' })
										]
									}),
									new Label({ text: 'Purpose' }),
									new Text({ text: '{landscape>purpose/last} (was {landscape>purpose/first})' }),
									new Label({ text: 'B1 Version' }),
									new Text({ text: '{landscape>version/last} (was {landscape>version/first})' }),
									new Label({ text: 'Hana Version' }),
									new Text({ text: '{landscape>hanaVersion/last} (was {landscape>hanaVersion/first})' }),
									new Label({ text: 'SLA' }),
									new FlexBox({
										justifyContent: sap.m.FlexJustifyContent.Start,
										alignItems: sap.m.FlexAlignItems.Center,
										items: [
											new ObjectIdentifier({ title: {
							        	parts: [ 'landscape>sla/currSla' ],
							          formatter: jQuery.proxy(formatter.slaToText, this)
							        }}).addStyleClass('sapUiTinyMarginEnd'),
											new Text({ text: '(of {landscape>sla/goodSla})' })
										]
									}),
								]
							}),
							oServiceUnitTenantsTable
						]
					})
				]
			});

			oServiceUnitsList.bindItems({
				path: 'landscape>items/serviceUnits',
				template: oServiceUnitItem
			});

			var oServiceUnitsPanel = new Panel(this.createId('serviceUnitsPanel'), {
				headerToolbar: new Toolbar({
					content: [
						new Title({
							text: '{i18n>landscapeServiceUnits}',
							titleStyle: 'H3'
						}),
						new Title({
							text: '{landscape>items/serviceUnitCount/max}',
							titleStyle: 'H1'
						}),
						new ToolbarSpacer()
					]
				}),
				content: [
					oServiceUnitsList
				]
			}).addStyleClass('sapUiForceWidthAuto sapUiResponsiveMargin');

			var oPage = new Page(this.createId('landscapePage'), {
				title: '{i18n>landscape}',
				showHeader: true,
				showNavButton: true,
				navButtonPress: [ oController.onNavBack, oController ],
				// busy: '{landscapeView>/busy}',
				// busyIndicatorDelay: '{landscapeView>/delay}',
				content: [
					oGeneralPanel,
					oSlaPanel,
					oCustomersPanel,
					oServiceUnitsPanel
					// oHostList
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
