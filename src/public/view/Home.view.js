sap.ui.define([
  'sap/m/Page',
  'sap/m/Button',
  'sap/m/Toolbar',
  'sap/m/ToolbarSpacer',
  'sap/m/StandardTile',
  'sap/m/FlexBox',
  'sap/ui/layout/VerticalLayout',
  'sap/ui/layout/HorizontalLayout'
], function (Page, Button, Toolbar, ToolbarSpacer, StandardTile,
	FlexBox, VerticalLayout, HorizontalLayout) {
  'use strict';

  sap.ui.jsview('sap.clr.view.Home', {
    getControllerName: function () {
      return 'sap.clr.controller.Home';
    },

    createContent: function (oController) {
      var oBar = new Toolbar({
        content: [
          new ToolbarSpacer(),
          new Button({
            icon: 'sap-icon://refresh',
            text: '{i18n>homeRefreshButton}',
            press: [ oController.onPressRefresh, oController ]
          }).addStyleClass('uoNoPrint')
        ]
      });

      var oLandscapesTile = new StandardTile(this.createId('landscapesTile'), {
        icon: 'sap-icon://cloud',
        type: 'None',
        busyIndicatorDelay: 0,
        title: '{i18n>homeLandscapeManagementReportingTitle}',
        number: '{home>/landscapes}',
        numberUnit: '{i18n>homeLandscapeManagementReportingUnit}',
        press: [ oController.onPressLandscapes, oController ]
      });

      var oVL = new VerticalLayout({
        content: new VerticalLayout({
          content: [
            new sap.m.ObjectHeader({
              title: '{i18n>homeLandscapeManagement}'
            }).addStyleClass('lpHeader'),
            new HorizontalLayout({
              content: [
                oLandscapesTile
              ]
            })
          ]
        })
      });

      var oPage = new Page(this.createId('homePage'), {
        showHeader: false,
        enableScrolling: true,
        content: [
          new FlexBox({
            fitContainer: true,
            justifyContent: sap.m.FlexJustifyContent.Start,
            alignItems: sap.m.FlexAlignItems.Start,
            items: [
              oVL
            ]
          }).addStyleClass('lpFlexBox')
        ],
        footer: [
          oBar
        ]
      });

      return oPage;
    }
  });
});
