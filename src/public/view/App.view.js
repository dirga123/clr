sap.ui.define([
  'sap/ui/unified/Shell',
  'sap/m/App',
  'sap/ui/unified/ShellHeadItem',
  'sap/ui/unified/ShellHeadUserItem'
], function (Shell, App, ShellHeadItem, ShellHeadUserItem) {
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
          new ShellHeadItem(this.createId('appHome'), {
            icon: 'sap-icon://home',
            tooltip: 'Home',
            visible: '{loginInfo>/logged}',
            press: [ oController.onPressHome, oController ]
          })
        ],
        headEndItems: [
          new ShellHeadItem(this.createId('appLogoff'), {
            icon: 'sap-icon://log',
            tooltip: 'Logoff',
            visible: '{loginInfo>/logged}',
            press: [ oController.onPressLogoff, oController ]
          })
        ],
        user: new ShellHeadUserItem({
          image: 'sap-icon://person-placeholder',
          showPopupIndicator: '{loginInfo>/logged}',
          username: {
            parts: [ 'loginInfo>/user/name', 'loginInfo>/user/login' ],
            formatter: function(name, login) {
              if (name !== undefined) {
                return name;
              }
              if (login !== undefined) {
                return login;
              }
              return oController.getResourceBundle().getText('userUnknown');
            }
          },
          press: [ oController.onPressUser, oController ]
        }),
        content: new App(this.createId('App'), {
        })
      });

      return oShell;
    }
  });
});
