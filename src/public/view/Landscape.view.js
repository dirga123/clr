sap.ui.define([
  'sap/m/Page',
  'sap/m/Button',
  'sap/m/Toolbar',
  'sap/m/ToolbarSpacer',
  'sap/ui/layout/VerticalLayout'
], function (Page, Button, Toolbar,	ToolbarSpacer, VerticalLayout) {
  'use strict';

  sap.ui.jsview('sap.clr.view.Landscape', {
    getControllerName: function () {
      return 'sap.clr.controller.Landscape';
    },

    /*
    onBeforeShow: function(oController) {
      jQuery.sap.log.info('Landscape.controller:onBeforeShow');
      this.getController()._toggleButtonsAndView(false);
    },
    */

    createContent: function (oController) {
      var oBar = new Toolbar({
        content: [
          new ToolbarSpacer(),
          new Button(this.createId('toolbarEdit'), {
            icon: 'sap-icon://edit',
            text: '{i18n>landscapeEditButton}',
            press: [ oController.onPressEdit, oController ]
          }),
          new Button(this.createId('toolbarSave'), {
            icon: 'sap-icon://save',
            text: '{i18n>landscapeSaveButton}',
            press: [ oController.onPressSave, oController ]
          }),
          new Button(this.createId('toolbarCancel'), {
            icon: 'sap-icon://sys-cancel',
            text: '{i18n>landscapeCancelButton}',
            press: [ oController.onPressCancel, oController ]
          }),
          new Button(this.createId('toolbarRefresh'), {
            icon: 'sap-icon://refresh',
            text: '{i18n>landscapeRefreshButton}',
            press: [ oController.onPressRefresh, oController ]
          }),
          new Button(this.createId('toolbarDelete'), {
            icon: 'sap-icon://delete',
            text: '{i18n>landscapeDeleteButton}',
            type: 'Reject',
            press: [ oController.onPressDelete, oController ]
          })
        ]
      });

      var oLandscapePanel = new VerticalLayout(this.createId('landscapePanel'), {
        busyIndicatorDelay: 0,
        width: '100%'
      });

      var oPage = new Page(this.createId('landscapePage'), {
        title: '{i18n>landscape}',
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
