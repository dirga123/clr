sap.ui.define([
  'sap/m/Page',
  'sap/m/Button',
  'sap/m/Toolbar',
  'sap/m/ToolbarSpacer',
  'sap/ui/layout/VerticalLayout'
], function (Page, Button, Toolbar,	ToolbarSpacer, VerticalLayout) {
  'use strict';

  sap.ui.jsview('sap.clr.view.GSCAccess', {
    getControllerName: function () {
      return 'sap.clr.controller.GSCAccess';
    },

    createContent: function (oController) {
      var oBar = new Toolbar({
        content: [
          new ToolbarSpacer(),
          new Button(this.createId('toolbarEdit'), {
            icon: 'sap-icon://edit',
            visible: {
              path: '/edit',
              formatter: function(edit) { return Boolean(edit) === false; }
            },
            text: '{i18n>landscapeEditButton}',
            press: [ oController.onPressEdit, oController ]
          }),
          new Button(this.createId('toolbarSave'), {
            icon: 'sap-icon://save',
            visible: {
              path: '/edit',
              formatter: function(edit) { return Boolean(edit); }
            },
            text: '{i18n>landscapeSaveButton}',
            press: [ oController.onPressSave, oController ]
          }),
          new Button(this.createId('toolbarCancel'), {
            icon: 'sap-icon://sys-cancel',
            visible: {
              path: '/edit',
              formatter: function(edit) { return Boolean(edit); }
            },
            text: '{i18n>landscapeCancelButton}',
            press: [ oController.onPressCancel, oController ]
          }),
          new Button(this.createId('toolbarRefresh'), {
            icon: 'sap-icon://refresh',
            visible: {
              path: '/edit',
              formatter: function(edit) { return Boolean(edit) === false; }
            },
            text: '{i18n>landscapeRefreshButton}',
            press: [ oController.onPressRefresh, oController ]
          }),
          new Button(this.createId('toolbarDelete'), {
            icon: 'sap-icon://delete',
            visible: {
              path: '/edit',
              formatter: function(edit) { return Boolean(edit); }
            },
            text: '{i18n>landscapeDeleteButton}',
            type: 'Reject',
            press: [ oController.onPressDelete, oController ]
          })
        ]
      });

      var oLandscapePanel = new VerticalLayout(this.createId('gscAccessPanel'), {
        busyIndicatorDelay: 0,
        width: '100%'
      });

      var oPage = new Page(this.createId('gscAccessPage'), {
        title: '{i18n>gscAccessTitle}',
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
