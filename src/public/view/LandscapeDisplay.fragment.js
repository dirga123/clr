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
        backgroundDesign: 'Transparent',
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
