sap.ui.define([
  'sap/m/Page',
  'sap/m/Button',
  'sap/m/Toolbar',
  'sap/m/ToolbarSpacer',
  'sap/ui/layout/VerticalLayout',
  'sap/m/IconTabBar',
  'sap/m/IconTabFilter',
  'sap/m/ObjectHeader',
  'sap/m/ObjectAttribute',
  'sap/m/Panel',
  'sap/m/List',
  'sap/m/StandardListItem'
], function (Page, Button, Toolbar,	ToolbarSpacer, VerticalLayout,
  IconTabBar, IconTabFilter, ObjectHeader, ObjectAttribute, Panel,
  List, StandardListItem) {
  'use strict';

  sap.ui.jsview('sap.clr.view.ReportingLandscape', {
    getControllerName: function () {
      return 'sap.clr.controller.ReportingLandscape';
    },

    createContent: function (oController) {
      var oBar = new Toolbar({
        content: [
          new ToolbarSpacer(),
          new Button(this.createId('toolbarRefresh'), {
            icon: 'sap-icon://refresh',
            text: '{i18n>landscapeRefreshButton}',
            press: [ oController.onPressRefresh, oController ]
          })
        ]
      });

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

      var oTabs = new IconTabBar({
        expanded: '{device>/isNoPhone}',
        backgroundDesign: 'Transparent',
        items: [
          new IconTabFilter({
            text: '{i18n>landscapeTabExternalReports}',
            content: oExternalPanel
          })
        ]
      });

      var oLandscapePanel = new VerticalLayout(this.createId('landscapePanel'), {
        busyIndicatorDelay: 0,
        width: '100%',
        content: [
          oGeneralPanel,
          oTabs
        ]
      });

      var oPage = new Page(this.createId('landscapePage'), {
        title: '{i18n>reportingLandscapeTitle}',
        showHeader: true,
        showNavButton: true,
        navButtonPress: [ oController.onNavBack, oController ],
        content: [
          oLandscapePanel
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
