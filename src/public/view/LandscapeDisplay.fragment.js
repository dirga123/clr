sap.ui.define([
  'sap/m/ObjectHeader',
  'sap/m/ObjectAttribute',
  'sap/m/Panel',
  'sap/m/List',
  'sap/m/StandardListItem',
  'sap/ui/layout/VerticalLayout',
  'sap/m/Button',
  'sap/m/IconTabBar',
  'sap/m/IconTabFilter',
  'sap/m/Text'
], function (ObjectHeader, ObjectAttribute, Panel, List, StandardListItem,
  VerticalLayout, Button, IconTabBar, IconTabFilter, Text) {
  'use strict';

  sap.ui.jsfragment('sap.clr.view.LandscapeDisplay', {
    createContent: function(oController) {
      var oGeneral = new ObjectHeader(this.createId('general'), {
        title: '{i18n>landscapeID}: {landscape>project}',
        attributes: [
          new ObjectAttribute({
            title: '{i18n>landscapeDomain}',
            active: true,
            text: '{landscape>domain}',
            press: [ oController.onLinkDomainPress, oController ]
          }),
          new ObjectAttribute({
            title: '{i18n>landscapeDomainBA}',
            active: true,
            text: '{landscape>domain}',
            press: [ oController.onLinkDomainBAPress, oController ]
          }),
          new ObjectAttribute({
            title: '{i18n>landscapeZabbix}',
            active: true,
            text: {
              parts: [ 'landscape>zabbix' ],
              formatter: function(url) {
                if (url === undefined || url === null) {
                  return '';
                }
                return url.replace('api_jsonrpc.php', '');
              }
            },
            press: [ oController.onLinkZabbixPress, oController ]
          })
        ]
      }).addStyleClass('sapUiNoMargin');

      var oGeneralPanel = new Panel(this.createId('generalPanel'), {
        busyIndicatorDelay: 0,
        backgroundDesign: 'Transparent',
        content: oGeneral
      });

      oGeneralPanel.bindElement({
        path: 'landscape>/landscape'
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
                return 'Success';
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

      oStatusPanel.bindElement({
        path: 'landscapeStatus>/'
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

      oExternalPanel.bindElement({
        path: 'landscapeExternal>/'
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

      oInternalPanel.bindElement({
        path: 'landscapeInternal>/'
      });

      var oGSCAccessPanel = new Panel(this.createId('gscAccessPanel'), {
        busyIndicatorDelay: 0,
        backgroundDesign: 'Transparent',
        content: [
          new VerticalLayout({
            content: [
              new Text({
                text: '{gscaccess>text}'
              })
            ]
          })
        ]
      });

      oGSCAccessPanel.bindElement({
        path: 'gscaccess>/gscaccess'
      });

      var oGSCRequestsPanel = new Panel(this.createId('gscRequestsPanel'), {
        busyIndicatorDelay: 0,
        backgroundDesign: 'Transparent',
        content: [
          new VerticalLayout({
            content: [
            ]
          })
        ]
      });

      oGSCRequestsPanel.bindElement({
        path: 'gscrequests>/'
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
          }),
          new IconTabFilter({
            text: '{i18n>landscapeTabGSCAccess}',
            content: oGSCAccessPanel
          }),
          new IconTabFilter({
            text: '{i18n>landscapeTabGSCRequests}',
            content: oGSCRequestsPanel
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
