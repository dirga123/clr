sap.ui.define([
  'sap/m/ObjectHeader',
  'sap/m/ObjectAttribute',
  'sap/m/Panel',
  'sap/m/List',
  'sap/m/StandardListItem',
  'sap/ui/layout/VerticalLayout',
  'sap/m/Button',
  'sap/m/IconTabBar',
  'sap/m/IconTabFilter'
], function (ObjectHeader, ObjectAttribute, Panel, List, StandardListItem,
  VerticalLayout, Button, IconTabBar, IconTabFilter) {
  'use strict';

  sap.ui.jsfragment('sap.clr.view.LandscapeDisplay', {
    createContent: function(oController) {
      var oGeneral = new ObjectHeader(this.createId('general'), {
        title: '{i18n>landscapeID}: {landscape>id}',
        attributes: [
          new ObjectAttribute({
            title: '{i18n>landscapeDomain}',
            text: '{landscape>domain}'
          }),
          new ObjectAttribute({
            title: '{i18n>landscapeZabbix}',
            text: '{landscape>zabbix}'
          })
        ]
      }).addStyleClass('sapUiNoMargin');

      var oGeneralPanel = new Panel(this.createId('generalPanel'), {
        busyIndicatorDelay: 0,
        backgroundDesign: 'Transparent',
        content: oGeneral
      });

      var oStatusList = new List(this.createId('statusList'), {
      });

      var oStatusItem = new StandardListItem({
        title: '{landscapeStatus>description}',
        error: '{landscapeStatus>error}',
        type: 'Inactive',
        info: {
          parts: [ 'landscapeStatus>priority' ],
          formatter: function(priority) {
            if (priority === undefined) {
              return '';
            } else {
              switch (priority) {
              case '5':
                return 'Disaster';
              case '4':
                return 'High';
              case '3':
                return 'Average';
              case '2':
                return 'Warning';
              case '1':
                return 'Information';
              case '0':
              default:
                return 'Not classified';
              }
            }
          }
        },
        infoState: {
          parts: [ 'landscapeStatus>priority' ],
          formatter: function(priority) {
            if (priority === undefined) {
              return '';
            } else {
              switch (priority) {
              case '5':
              case '4':
                return 'Error';
              case '3':
              case '2':
                return 'Warning';
              case '1':
              case '0':
              default:
                return 'Not classified';
              }
            }
          }
        }
      });

      oStatusList.bindItems({
        path: 'landscapeStatus>/triggers',
        template: oStatusItem
      });

      var oStatusPanel = new Panel(this.createId('statusPanel'), {
        busyIndicatorDelay: 0,
        backgroundDesign: 'Transparent',
        content: [
          new VerticalLayout({
            width: '100%',
            content: [
              oStatusList
            ]
          })
        ]
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
        backgroundDesign: 'Transparent',
        content: [
          new VerticalLayout({
            width: '100%',
            content: [
              new Button({
                text: '{i18n>landscapeAddReportButton}',
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
        backgroundDesign: 'Transparent',
        content: [
          new VerticalLayout({
            content: [
              new Button({
                text: '{i18n>landscapeAddReportButton}',
                type: sap.m.ButtonType.Emphasized,
                press: [ oController.onAddInternal, oController ]
              })
            ]
          })
        ]
      });

      var oTabs = new IconTabBar({
        expanded: '{device>/isNoPhone}',
        backgroundDesign: 'Transparent',
        items: [
          new IconTabFilter({
            text: '{i18n>landscapeTabStatus}',
            content: oStatusPanel
          }),
          new IconTabFilter({
            text: '{i18n>landscapeTabExternalReports}',
            content: oExternalPanel
          }),
          new IconTabFilter({
            text: '{i18n>landscapeTabInternalReports}',
            content: oInternalPanel
          })
        ]
      });

      return new VerticalLayout({
        width: '100%',
        content: [
          oGeneralPanel,
          oTabs
        ]
      });
    }
  });
});
