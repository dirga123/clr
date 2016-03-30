sap.ui.define([
  'sap/m/Page',
  'sap/m/Button',
  'sap/m/Toolbar',
  'sap/m/ToolbarSpacer',
  'sap/m/StandardTile',
  'sap/m/FlexBox',
  'sap/ui/layout/VerticalLayout',
  'sap/ui/layout/HorizontalLayout',
  'sap/clr/model/formatter'
], function (Page, Button, Toolbar, ToolbarSpacer, StandardTile,
	FlexBox, VerticalLayout, HorizontalLayout, formatter) {
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
          })
        ]
      });

      var oLandscapesTile = new StandardTile(this.createId('landscapesTile'), {
        icon: 'sap-icon://cloud',
        type: 'None',
        visible: {
          parts: [ 'loginInfo>/logged', 'loginInfo>/user' ],
          formatter: jQuery.proxy(formatter.isAdmin, this)
        },
        busyIndicatorDelay: 0,
        title: '{i18n>homeManagementTitle}',
        number: '{homeLandscapes>/landscapes}',
        numberUnit: {
          parts: [ 'homeLandscapes>/landscapes' ],
          formatter: function(count) {
            if (count === 1) {
              return oController.getResourceBundle().getText(
                'homeLandscapeManagementReportingUnit'
              );
            }
            return oController.getResourceBundle().getText(
              'homeLandscapeManagementReportingUnits'
            );
          }
        },
        press: [ oController.onPressLandscapes, oController ]
      });

      var oGSCTile = new StandardTile(this.createId('GSCTile'), {
        icon: 'sap-icon://customer',
        type: 'None',
        visible: {
          parts: [ 'loginInfo>/logged', 'loginInfo>/user' ],
          formatter: jQuery.proxy(formatter.isGSC, this)
        },
        busyIndicatorDelay: 0,
        title: '{i18n>homeGSCTitle}',
        press: [ oController.onPressGSC, oController ]
      });

      var oReportingTile = new StandardTile(this.createId('ReportingTile'), {
        icon: 'sap-icon://expense-report',
        type: 'None',
        visible: {
          parts: [ 'loginInfo>/logged', 'loginInfo>/user' ],
          formatter: jQuery.proxy(formatter.isReporting, this)
        },
        busyIndicatorDelay: 0,
        title: '{i18n>homeReportingTitle}',
        press: [ oController.onPressReporting, oController ]
      });

      var oUsersTile = new StandardTile(this.createId('usersTile'), {
        icon: 'sap-icon://account',
        type: 'None',
        visible: {
          parts: [ 'loginInfo>/logged', 'loginInfo>/user' ],
          formatter: jQuery.proxy(formatter.isAdmin, this)
        },
        busyIndicatorDelay: 0,
        title: '{i18n>homeUsersTitle}',
        info: {
          parts: [ 'homeUsers>/onlineUsers' ],
          formatter: function(onlineCount) {
            if (onlineCount === undefined) {
              onlineCount = 0;
            }
            return oController.getResourceBundle().getText(
              'homeUsersOnline', [ onlineCount ]
            );
          }
        },
        number: '{homeUsers>/users}',
        numberUnit: {
          parts: [ 'homeUsers>/users' ],
          formatter: function(count) {
            if (count === 1) {
              return oController.getResourceBundle().getText(
                'homeUsersUnit'
              );
            }
            return oController.getResourceBundle().getText(
              'homeUsersUnits'
            );
          }
        },
        press: [ oController.onPressUsers, oController ]
      });

      var oVL = new VerticalLayout({
        content: new VerticalLayout({
          content: [
            new sap.m.ObjectHeader({
              title: '{i18n>homeLandscapeManagement}',
              visible: {
                parts: [ 'loginInfo>/logged', 'loginInfo>/user' ],
                formatter: jQuery.proxy(formatter.isGSCOrReporting, this)
              }
            }).addStyleClass('lpHeader'),
            new HorizontalLayout({
              content: [
                oLandscapesTile,
                oGSCTile,
                oReportingTile
              ]
            }),
            new sap.m.ObjectHeader({
              title: '{i18n>homeSettings}',
              visible: {
                parts: [ 'loginInfo>/logged', 'loginInfo>/user' ],
                formatter: jQuery.proxy(formatter.isAdmin, this)
              }
            }).addStyleClass('lpHeader'),
            new HorizontalLayout({
              content: [
                oUsersTile
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
