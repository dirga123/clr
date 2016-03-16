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
	'sap/clr/model/formatter',
	'jquery.sap.global',
	'sap/m/CustomListItem',
	'sap/ui/layout/VerticalLayout',
	'sap/m/Table',
	'sap/m/Column',
	'sap/m/ColumnListItem',
	'sap/m/ObjectIdentifier',
	'sap/m/ObjectNumber',
  'sap/m/IconTabBar',
	'sap/m/IconTabFilter',
  'sap/m/ObjectHeader'
], function (Page, Button, Toolbar,	ToolbarSpacer, Panel, Title, SimpleForm,
	Label, Text, List, ObjectListItem, ObjectAttribute,
	formatter, jQuery, CustomListItem, VerticalLayout,
	Table, Column, ColumnListItem, ObjectIdentifier, ObjectNumber,
  IconTabBar, IconTabFilter, ObjectHeader) {
	'use strict';

	sap.ui.jsview('sap.clr.view.LandscapeExternal', {
		getControllerName: function () {
			return 'sap.clr.controller.LandscapeExternal';
		},

		createContent: function (oController) {
			var oExportButton = new Button(this.createId('exportButton'), {
        icon: 'sap-icon://action',
				text: '{i18n>landscapeExportButton}',
				press: [ oController.onPressExport, oController ]
			});

			var oBar = new Toolbar({
				content: [
					new ToolbarSpacer(),
					oExportButton
				]
			});

      // SLA

			var oSlaItem = new ObjectListItem({
				title: '{external>name}',
				type: 'Inactive',
				number: {
					parts: [ 'external>currSla', 'external>goodSla' ],
					formatter: function(currSla, goodSla) {
						var text = '';
						if (currSla !== undefined) {
							text = parseFloat(currSla).toFixed(4);
						}
						if (goodSla !== undefined) {
							text += ' of ' + parseFloat(goodSla).toFixed(4);
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
				]
			});

      var oSlaList = new List(this.createId('slaList'), {
			});

			oSlaList.bindItems({
				path: 'external>services',
				template: oSlaItem
			});

      // Customers

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
					new Panel({
            headerText: '{i18n>landscapeExternalCustomer}: {external>id}',
						content: [
							oCustomerUsersTable,
							oCustomerTenantsTable
						]
					})
				]
			});

      var oCustomerList = new List(this.createId('custList'), {
        backgroundDesign: 'Transparent'
			});

			oCustomerList.bindItems({
				path: 'external>items/customers',
				template: oCustomerItem
			});

      // Service Units

			var oServiceUnitTenantsTable = new Table({
				columns: [
					new Column({
						header: new ObjectIdentifier({
							title: 'Tenants'
						})
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
									new ObjectIdentifier({
										title: '{external>name/last}'
									}),
									new Label({ text: 'Purpose' }),
									new Text({
										text: '{external>purpose/last}'
									}),
									new Label({ text: 'B1 Version' }),
									new Text({
										text: '{external>version/last}'
									}),
									new Label({ text: 'Hana Version' }),
									new Text({
										text: '{external>hanaVersion/last}'
									}),
									new Label({ text: 'SLA' }),
                  new Text({
                    text: {
            					parts: [ 'external>sla/currSla', 'external>sla/goodSla' ],
            					formatter: function(currSla, goodSla) {
            						var text = '';
            						if (currSla !== undefined) {
            							text = parseFloat(currSla).toFixed(4);
            						}
            						if (goodSla !== undefined) {
            							text += ' of ' + parseFloat(goodSla).toFixed(4);
            						}
            						return text;
            					}
            				}
                  })
								]
							}),
							oServiceUnitTenantsTable
						]
					})
				]
			});

      var oServiceUnitsList = new List(this.createId('serviceUnitsList'), {
        backgroundDesign: 'Transparent'
			});

			oServiceUnitsList.bindItems({
				path: 'external>items/serviceUnits',
				template: oServiceUnitItem
			});

      // Tabs

      var oTabs = new IconTabBar({
				expanded: '{device>/isNoPhone}',
        backgroundDesign: 'Transparent',
				items: [
					new IconTabFilter({
						text: '{i18n>landscapeSla}',
						content: oSlaList
					}),
					new IconTabFilter({
						text: '{i18n>landscapeCustomers}',
            count: '{external>items/customerCount/max}',
						content: oCustomerList
					}),
					new IconTabFilter({
						text: '{i18n>landscapeServiceUnits}',
            count: '{external>items/serviceUnitCount/max}',
						content: oServiceUnitsList
					})
				]
			});

      // General

      var oGeneralPanel = new ObjectHeader({
        title: '{i18n>landscapeID}: {external>id}',
        attributes: [
          new ObjectAttribute({
            title: '{i18n>landscapeDomain}',
            text: '{external>domain}'
          }),
          new ObjectAttribute({
            title: '{i18n>landscapeExternalPeriod}',
            text: {
              parts: [ 'external>/date' ],
              formatter: function(reportDate) {
                var date = new Date();
                date.setTime(reportDate);
                return date.getMonth() + '/' + date.getFullYear();
              }
            }
          })
        ],
        headerContainer: oTabs
      });

			var oPage = new Page(this.createId('landscapeExternalPage'), {
				title: '{i18n>landscapeExternal}: {external>/name}',
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
