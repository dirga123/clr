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

  sap.ui.jsview('sap.clr.view.LandscapeExternalNew', {
    getControllerName: function () {
      return 'sap.clr.controller.LandscapeExternalNew';
    },

    createContent: function (oController) {
      var oSaveButton = new Button(this.createId('saveButton'), {
        icon: 'sap-icon://save',
        text: '{i18n>landscapeSaveButton}',
        type: sap.m.ButtonType.Emphasized,
        press: [ oController.onPressSave, oController ]
      });

      var oExportButton = new Button(this.createId('exportButton'), {
        icon: 'sap-icon://action',
        text: '{i18n>landscapeExportButton}',
        press: [ oController.onPressExport, oController ]
      });

      var oBar = new Toolbar({
        content: [
          new ToolbarSpacer(),
          oSaveButton,
          oExportButton
        ]
      }).addStyleClass('uoNoPrint');

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
							dateValue: '{/date}',
							change: [ oController.onPressRefresh, oController ]
						}),
						new Button({
							icon: 'sap-icon://refresh',
							press: [ oController.onPressRefresh, oController ]
						}).addStyleClass('uoNoPrint')
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
							new Text({ text: '{external>id}' }),
							new Label({ text: '{i18n>landscapeZabbix}' }),
							new Text({ text: '{external>zabbix}' }),
							new Label({ text: '{i18n>landscapeDomain}' }),
							new Text({ text: '{external>domain}' })
						]
					})
				]
			}).addStyleClass('sapUiForceWidthAuto sapUiResponsiveMargin');

			var oSlaList = new List(this.createId('slaList'), {
			}).addStyleClass('page-break');

			var oSlaItem = new ObjectListItem({
				title: '{external>name}',
				type: 'Inactive',
				number: {
					parts: [ 'external>currSla', 'external>goodSla' ],
					formatter: function(currSla, goodSla) {
						var text = '';
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
					parts: [ 'external>status' ],
					formatter: jQuery.proxy(formatter.statusToState, this)
				},
				attributes: [
					new ObjectAttribute({
						title: '{i18n>landscapeOkTime}',
						text: {
							parts: [ 'external>okTime' ],
							formatter: jQuery.proxy(formatter.secondsToString, this)
						}
					}),
					new ObjectAttribute({
						title: '{i18n>landscapeProblemTime}',
						text: {
							parts: [ 'external>problemTime' ],
							formatter: jQuery.proxy(formatter.secondsToString, this)
						}
					}),
					new ObjectAttribute({
						title: '{i18n>landscapeDowntime}',
						text: {
							parts: [ 'external>downtimeTime' ],
							formatter: jQuery.proxy(formatter.secondsToString, this)
						}
					})
				],
				firstStatus: new ObjectStatus({
					title: '{i18n>landscapeStatus}',
					text: {
						parts: [ 'external>status' ],
						formatter: jQuery.proxy(formatter.statusToText, this)
					},
					state: {
						parts: [ 'external>status' ],
						formatter: jQuery.proxy(formatter.statusToState, this)
					}
				})
			});

			oSlaList.bindItems({
				path: 'external>services',
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
				title: '{external>name}',
				type: 'Inactive',
				number: {
					parts: [ 'external>status' ],
					formatter: jQuery.proxy(formatter.statusToText, this)
				},
				numberState: {
					parts: [ 'external>status' ],
					formatter: jQuery.proxy(formatter.statusToState, this)
				},
				attributes: [
					new ObjectAttribute({
						title: '{i18n>landscapeAgentStatus}',
						text: {
							parts: [ 'external>available' ],
							formatter: function(available) {
								var resourceBundle = this.getModel('i18n').getResourceBundle();

								switch (available) {
								case '1':
									return resourceBundle.getText('landscapeAgentAvail');
								case '2':
									return resourceBundle.getText('landscapeAgentUnavail');
								default:
									return resourceBundle.getText('landscapeAgentNA');
								}
							}
						}
					})
				],
				firstStatus: new ObjectStatus({
					text: '{external>error}',
					state: 'Error'
				})
			});

			oHostList.bindItems({
				path: 'external>hosts',
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
							new ObjectIdentifier({ title: 'Users' }),
							new ObjectNumber({ number: '{external>users/first}' }),
							new ObjectNumber({ number: '{external>users/last}' }),
							new ObjectNumber({ number: '{external>users/min}' }),
							new ObjectNumber({ number: '{external>users/max}' }),
							new ObjectNumber({
								number: {
									parts: [ 'external>users/avg' ],
									formatter: jQuery.proxy(formatter.avgToText, this)
								}
							})
						]
					}),
					new ColumnListItem({
						cells: [
							new ObjectIdentifier({ title: 'RDS users' }),
							new ObjectNumber({ number: '{external>usersRDS/first}' }),
							new ObjectNumber({ number: '{external>usersRDS/last}' }),
							new ObjectNumber({ number: '{external>usersRDS/min}' }),
							new ObjectNumber({ number: '{external>usersRDS/max}' }),
							new ObjectNumber({
								number: {
									parts: [ 'external>usersRDS/avg' ],
									formatter: jQuery.proxy(formatter.avgToText, this)
								}
							})
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
							new ObjectIdentifier({ title: 'Demo' }),
							new ObjectNumber({ number: '{external>tenantsDemo/first}' }),
							new ObjectNumber({ number: '{external>tenantsDemo/last}' }),
							new ObjectNumber({ number: '{external>tenantsDemo/min}' }),
							new ObjectNumber({ number: '{external>tenantsDemo/max}' }),
							new ObjectNumber({
								number: {
									parts: [ 'external>tenantsDemo/avg' ],
									formatter: jQuery.proxy(formatter.avgToText, this)
								}
							})
						]
					}),
					new ColumnListItem({
						cells: [
							new ObjectIdentifier({ title: 'Productive' }),
							new ObjectNumber({ number: '{external>tenantsProductive/first}' }),
							new ObjectNumber({ number: '{external>tenantsProductive/last}' }),
							new ObjectNumber({ number: '{external>tenantsProductive/min}' }),
							new ObjectNumber({ number: '{external>tenantsProductive/max}' }),
							new ObjectNumber({
								number: {
									parts: [ 'external>tenantsProductive/avg' ],
									formatter: jQuery.proxy(formatter.avgToText, this)
								}
							})
						]
					}),
					new ColumnListItem({
						cells: [
							new ObjectIdentifier({ title: 'Testing' }),
							new ObjectNumber({ number: '{external>tenantsTesting/first}' }),
							new ObjectNumber({ number: '{external>tenantsTesting/last}' }),
							new ObjectNumber({ number: '{external>tenantsTesting/min}' }),
							new ObjectNumber({ number: '{external>tenantsTesting/max}' }),
							new ObjectNumber({
								number: {
									parts: [ 'external>tenantsTesting/avg' ],
									formatter: jQuery.proxy(formatter.avgToText, this)
								}
							})
						]
					}),
					new ColumnListItem({
						cells: [
							new ObjectIdentifier({ title: 'Trial' }),
							new ObjectNumber({ number: '{external>tenantsTrial/first}' }),
							new ObjectNumber({ number: '{external>tenantsTrial/last}' }),
							new ObjectNumber({ number: '{external>tenantsTrial/min}' }),
							new ObjectNumber({ number: '{external>tenantsTrial/max}' }),
							new ObjectNumber({
								number: {
									parts: [ 'external>tenantsTrial/avg' ],
									formatter: jQuery.proxy(formatter.avgToText, this)
								}
							})
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
									new ObjectIdentifier({ title: 'Customer {external>id}' })
								]
							}),
							oCustomerUsersTable,
							oCustomerTenantsTable
						]
					})
				]
			});

			oCustomerList.bindItems({
				path: 'external>items/customers',
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
							text: '{external>items/customerCount/max}',
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
							new ObjectIdentifier({ title: 'Demo' }),
							new ObjectNumber({ number: '{external>tenantsDemo/first}' }),
							new ObjectNumber({ number: '{external>tenantsDemo/last}' }),
							new ObjectNumber({ number: '{external>tenantsDemo/min}' }),
							new ObjectNumber({ number: '{external>tenantsDemo/max}' }),
							new ObjectNumber({ number: '{external>tenantsDemo/avg}' })
						]
					}),
					new ColumnListItem({
						cells: [
							new ObjectIdentifier({ title: 'Productive' }),
							new ObjectNumber({ number: '{external>tenantsProductive/first}' }),
							new ObjectNumber({ number: '{external>tenantsProductive/last}' }),
							new ObjectNumber({ number: '{external>tenantsProductive/min}' }),
							new ObjectNumber({ number: '{external>tenantsProductive/max}' }),
							new ObjectNumber({ number: '{external>tenantsProductive/avg}' })
						]
					}),
					new ColumnListItem({
						cells: [
							new ObjectIdentifier({ title: 'Testing' }),
							new ObjectNumber({ number: '{external>tenantsTesting/first}' }),
							new ObjectNumber({ number: '{external>tenantsTesting/last}' }),
							new ObjectNumber({ number: '{external>tenantsTesting/min}' }),
							new ObjectNumber({ number: '{external>tenantsTesting/max}' }),
							new ObjectNumber({ number: '{external>tenantsTesting/avg}' })
						]
					}),
					new ColumnListItem({
						cells: [
							new ObjectIdentifier({ title: 'Trial' }),
							new ObjectNumber({ number: '{external>tenantsTrial/first}' }),
							new ObjectNumber({ number: '{external>tenantsTrial/last}' }),
							new ObjectNumber({ number: '{external>tenantsTrial/min}' }),
							new ObjectNumber({ number: '{external>tenantsTrial/max}' }),
							new ObjectNumber({ number: '{external>tenantsTrial/avg}' })
						]
					})
				]
			});

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
											new ObjectIdentifier({
												title: '{external>name/last}'
											}).addStyleClass('sapUiTinyMarginEnd'),
											new Text({ text: '(was {external>name/first})' })
										]
									}),
									new Label({ text: 'Purpose' }),
									new Text({
										text: '{external>purpose/last} (was {external>purpose/first})'
									}),
									new Label({ text: 'B1 Version' }),
									new Text({
										text: '{external>version/last} (was {external>version/first})'
									}),
									new Label({ text: 'Hana Version' }),
									new Text({
										text: '{external>hanaVersion/last} (was {external>hanaVersion/first})'
									}),
									new Label({ text: 'SLA' }),
									new FlexBox({
										justifyContent: sap.m.FlexJustifyContent.Start,
										alignItems: sap.m.FlexAlignItems.Center,
										items: [
											new ObjectIdentifier({
												title: {
													parts: [ 'external>sla/currSla' ],
													formatter: jQuery.proxy(formatter.slaToText, this)
												}
											}).addStyleClass('sapUiTinyMarginEnd'),
											new Text({ text: '(of {external>sla/goodSla})' })
										]
									})
								]
							}),
							oServiceUnitTenantsTable
						]
					})
				]
			});

			oServiceUnitsList.bindItems({
				path: 'external>items/serviceUnits',
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
							text: '{external>items/serviceUnitCount/max}',
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
        title: '{i18n>landscapeExternalNew}',
        showHeader: true,
        showNavButton: true,
        navButtonPress: [ oController.onNavBack, oController ],
        content: [
          oGeneralPanel,
          oSlaPanel,
          oCustomersPanel,
          oServiceUnitsPanel
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
