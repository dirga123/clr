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
  'sap/m/ObjectNumber',
  'sap/m/IconTabBar',
  'sap/m/IconTabFilter',
  'sap/m/ObjectHeader'
], function (Page, Button, Toolbar,	ToolbarSpacer, Panel, Title, SimpleForm,
	Label, Text, List, ObjectListItem, ObjectAttribute, ObjectStatus,
	formatter, jQuery, CustomListItem, VerticalLayout, FlexBox,
	Table, Column, ColumnListItem, ObjectIdentifier, ObjectNumber,
  IconTabBar, IconTabFilter, ObjectHeader) {
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
      });

      // SLA

      var oSlaItem = new ObjectListItem({
        title: '{external>name}',
        type: 'Inactive',
        number: {
          parts: [ 'external>currSla', 'external>goodSla' ],
          formatter: jQuery.proxy(formatter.slaBothToText, this)
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
        backgroundDesign: 'Transparent'
      });

      oSlaList.bindItems({
        path: 'external>services',
        template: oSlaItem
      });

      // Customers

      var oCustomerUsersTable = new Table({
        columns: [
          new Column({
            header: new ObjectIdentifier({ title: '{i18n>landscapeExternalAlloc}' })
          }),
          new Column({
            header: new Text({ text: '{i18n>landscapeExternalFirst}' })
          }),
          new Column({
            header: new Text({ text: '{i18n>landscapeExternalMin}' })
          }),
          new Column({
            header: new Text({ text: '{i18n>landscapeExternalAvg}' })
          }),
          new Column({
            header: new Text({ text: '{i18n>landscapeExternalMax}' })
          }),
          new Column({
            header: new Text({ text: '{i18n>landscapeExternalLast}' })
          })
        ],
        items: [
          new ColumnListItem({
            cells: [
              new ObjectIdentifier({ title: '{i18n>landscapeExternalUsers}' }),
              new ObjectNumber({ number: '{external>users/first}' }),
              new ObjectNumber({ number: '{external>users/min}' }),
              new ObjectNumber({
                number: {
                  parts: [ 'external>users/avg' ],
                  formatter: jQuery.proxy(formatter.avgToText, this)
                }
              }),
              new ObjectNumber({ number: '{external>users/max}' }),
              new ObjectNumber({ number: '{external>users/last}' })
            ]
          }),
          new ColumnListItem({
            cells: [
              new ObjectIdentifier({ title: '{i18n>landscapeExternalRDSUsers}' }),
              new ObjectNumber({ number: '{external>usersRDS/first}' }),
              new ObjectNumber({ number: '{external>usersRDS/min}' }),
              new ObjectNumber({
                number: {
                  parts: [ 'external>usersRDS/avg' ],
                  formatter: jQuery.proxy(formatter.avgToText, this)
                }
              }),
              new ObjectNumber({ number: '{external>usersRDS/max}' }),
              new ObjectNumber({ number: '{external>usersRDS/last}' })
            ]
          })
        ]
      });

      var oCustomerTenantsTable = new Table({
        columns: [
          new Column({
            header: new ObjectIdentifier({ title: '{i18n>landscapeExternalTenants}' })
          }),
          new Column({
            header: new Text({ text: '{i18n>landscapeExternalFirst}' })
          }),
          new Column({
            header: new Text({ text: '{i18n>landscapeExternalMin}' })
          }),
          new Column({
            header: new Text({ text: '{i18n>landscapeExternalAvg}' })
          }),
          new Column({
            header: new Text({ text: '{i18n>landscapeExternalMax}' })
          }),
          new Column({
            header: new Text({ text: '{i18n>landscapeExternalLast}' })
          })
        ],
        items: [
          new ColumnListItem({
            cells: [
              new ObjectIdentifier({ title: '{i18n>landscapeExternalTenantsDemo}' }),
              new ObjectNumber({ number: '{external>tenantsDemo/first}' }),
              new ObjectNumber({ number: '{external>tenantsDemo/min}' }),
              new ObjectNumber({
                number: {
                  parts: [ 'external>tenantsDemo/avg' ],
                  formatter: jQuery.proxy(formatter.avgToText, this)
                }
              }),
              new ObjectNumber({ number: '{external>tenantsDemo/max}' }),
              new ObjectNumber({ number: '{external>tenantsDemo/last}' })
            ]
          }),
          new ColumnListItem({
            cells: [
              new ObjectIdentifier({ title: '{i18n>landscapeExternalTenantsProductive}' }),
              new ObjectNumber({ number: '{external>tenantsProductive/first}' }),
              new ObjectNumber({ number: '{external>tenantsProductive/min}' }),
              new ObjectNumber({
                number: {
                  parts: [ 'external>tenantsProductive/avg' ],
                  formatter: jQuery.proxy(formatter.avgToText, this)
                }
              }),
              new ObjectNumber({ number: '{external>tenantsProductive/max}' }),
              new ObjectNumber({ number: '{external>tenantsProductive/last}' })
            ]
          }),
          new ColumnListItem({
            cells: [
              new ObjectIdentifier({ title: '{i18n>landscapeExternalTenantsTesting}' }),
              new ObjectNumber({ number: '{external>tenantsTesting/first}' }),
              new ObjectNumber({ number: '{external>tenantsTesting/min}' }),
              new ObjectNumber({
                number: {
                  parts: [ 'external>tenantsTesting/avg' ],
                  formatter: jQuery.proxy(formatter.avgToText, this)
                }
              }),
              new ObjectNumber({ number: '{external>tenantsTesting/max}' }),
              new ObjectNumber({ number: '{external>tenantsTesting/last}' })
            ]
          }),
          new ColumnListItem({
            cells: [
              new ObjectIdentifier({ title: '{i18n>landscapeExternalTenantsTrial}' }),
              new ObjectNumber({ number: '{external>tenantsTrial/first}' }),
              new ObjectNumber({ number: '{external>tenantsTrial/min}' }),
              new ObjectNumber({
                number: {
                  parts: [ 'external>tenantsTrial/avg' ],
                  formatter: jQuery.proxy(formatter.avgToText, this)
                }
              }),
              new ObjectNumber({ number: '{external>tenantsTrial/max}' }),
              new ObjectNumber({ number: '{external>tenantsTrial/last}' })
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
            header: new ObjectIdentifier({ title: '{i18n>landscapeExternalTenants}' })
          }),
          new Column({
            header: new Text({ text: '{i18n>landscapeExternalFirst}' })
          }),
          new Column({
            header: new Text({ text: '{i18n>landscapeExternalMin}' })
          }),
          new Column({
            header: new Text({ text: '{i18n>landscapeExternalAvg}' })
          }),
          new Column({
            header: new Text({ text: '{i18n>landscapeExternalMax}' })
          }),
          new Column({
            header: new Text({ text: '{i18n>landscapeExternalLast}' })
          })
        ],
        items: [
          new ColumnListItem({
            cells: [
              new ObjectIdentifier({ title: '{i18n>landscapeExternalTenantsDemo}' }),
              new ObjectNumber({ number: '{external>tenantsDemo/first}' }),
              new ObjectNumber({ number: '{external>tenantsDemo/min}' }),
              new ObjectNumber({
                number: {
                  parts: [ 'external>tenantsDemo/avg' ],
                  formatter: jQuery.proxy(formatter.avgToText, this)
                }
              }),
              new ObjectNumber({ number: '{external>tenantsDemo/max}' }),
              new ObjectNumber({ number: '{external>tenantsDemo/last}' })
            ]
          }),
          new ColumnListItem({
            cells: [
              new ObjectIdentifier({ title: '{i18n>landscapeExternalTenantsProductive}' }),
              new ObjectNumber({ number: '{external>tenantsProductive/first}' }),
              new ObjectNumber({ number: '{external>tenantsProductive/min}' }),
              new ObjectNumber({
                number: {
                  parts: [ 'external>tenantsProductive/avg' ],
                  formatter: jQuery.proxy(formatter.avgToText, this)
                }
              }),
              new ObjectNumber({ number: '{external>tenantsProductive/max}' }),
              new ObjectNumber({ number: '{external>tenantsProductive/last}' })
            ]
          }),
          new ColumnListItem({
            cells: [
              new ObjectIdentifier({ title: '{i18n>landscapeExternalTenantsTesting}' }),
              new ObjectNumber({ number: '{external>tenantsTesting/first}' }),
              new ObjectNumber({ number: '{external>tenantsTesting/min}' }),
              new ObjectNumber({
                number: {
                  parts: [ 'external>tenantsTesting/avg' ],
                  formatter: jQuery.proxy(formatter.avgToText, this)
                }
              }),
              new ObjectNumber({ number: '{external>tenantsTesting/max}' }),
              new ObjectNumber({ number: '{external>tenantsTesting/last}' })
            ]
          }),
          new ColumnListItem({
            cells: [
              new ObjectIdentifier({ title: '{i18n>landscapeExternalTenantsTrial}' }),
              new ObjectNumber({ number: '{external>tenantsTrial/first}' }),
              new ObjectNumber({ number: '{external>tenantsTrial/min}' }),
              new ObjectNumber({
                number: {
                  parts: [ 'external>tenantsTrial/avg' ],
                  formatter: jQuery.proxy(formatter.avgToText, this)
                }
              }),
              new ObjectNumber({ number: '{external>tenantsTrial/max}' }),
              new ObjectNumber({ number: '{external>tenantsTrial/last}' })
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
                labelSpanL: 3,
                labelSpanM: 3,
                emptySpanL: 4,
                emptySpanM: 4,
                columnsL: 1,
                columnsM: 1,
                content: [
                  new Label({ text: '{i18n>landscapeExternalServiceUnitName}' }),
                  new ObjectIdentifier({
                    title: '{external>name/last}'
                  }),
                  new Label({ text: '{i18n>landscapeExternalServiceUnitPurpose}' }),
                  new Text({ text: '{external>purpose/last}' }),
                  new Label({ text: '{i18n>landscapeExternalServiceUnitB1Version}' }),
                  new Text({ text: '{external>version/last}' }),
                  new Label({ text: '{i18n>landscapeExternalServiceUnitHanaVersion}' }),
                  new Text({ text: '{external>hanaVersion/last}' }),
                  new Label({ text: '{i18n>landscapeExternalServiceUnitSLA}' }),
                  new Text({
                    text: {
                      parts: [ 'external>sla/currSla', 'external>sla/goodSla' ],
                      formatter: jQuery.proxy(formatter.slaBothToText, this)
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
            text: '{i18n>landscapeServiceUnits}',
            count: '{external>items/serviceUnitCount/max}',
            content: oServiceUnitsList
          }),
          new IconTabFilter({
            text: '{i18n>landscapeCustomers}',
            count: '{external>items/customerCount/max}',
            content: oCustomerList
          })
        ]
      });

      // General

      var oGeneralPanel = new ObjectHeader({
        title: '{i18n>landscapeID}: {external>project}',
        attributes: [
          new ObjectAttribute({
            title: '{i18n>landscapeDomain}',
            text: '{external>domain}'
          })
        ]
      });

      var oSelectionPanel = new Panel(this.createId('selection'), {
        backgroundDesign: 'Transparent',
        content: [
          new sap.m.DateTimeInput(this.createId('pickMonth'), {
            width: '15em',
            displayFormat: 'MM/yyyy',
            dateValue: '{/from}',
            change: [ oController.onChangePeriod, oController ]
          }),
          new Button({
            icon: 'sap-icon://refresh',
            text: '{i18n>landscapeRefreshButton}',
            press: [ oController.onPressRefresh, oController ]
          })
        ]
      }).addStyleClass('sapUiContentPadding sapUiSmallMargin');

      var oPage = new Page(this.createId('landscapeNewExternalPage'), {
        title: '{i18n>landscapeExternalNew}',
        showHeader: true,
        showNavButton: true,
        navButtonPress: [ oController.onNavBack, oController ],
        content: [
          oGeneralPanel,
          oSelectionPanel,
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
