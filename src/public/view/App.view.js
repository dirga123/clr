sap.ui.define([
  'sap/ui/unified/Shell',
  'sap/m/App'
], function (Shell, App) {
  'use strict';

  sap.ui.jsview('sap.clr.view.App', {
    getControllerName: function() {
      return 'sap.clr.controller.App';
    },

    createContent: function(oController) {
      // to avoid scrollbars on desktop the root view must be set to block display
      this.setDisplayBlock(true);

      var oShell = new Shell(this.createId('appShell'), {
        icon: '{/icon}',
        headItems: [
          new sap.ui.unified.ShellHeadItem(this.createId('appHome'), {
            icon: 'sap-icon://home',
            tooltip: 'Home',
            visible: '{user>/logged}',
            press: [ oController.onPressHome, oController ]
          })
        ],
        headEndItems: [
          new sap.ui.unified.ShellHeadItem(this.createId('appLogoff'), {
            icon: 'sap-icon://log',
            tooltip: 'Logoff',
            visible: '{user>/logged}',
            press: [ oController.onPressLogoff, oController ]
          })
        ],
        content: new App(this.createId('App'), {
        })
      });

      return oShell;
    }
  });
});
