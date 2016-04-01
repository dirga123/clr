sap.ui.define([
  'sap/m/ActionSheet',
  'sap/m/Button'
], function (ActionSheet, Button) {
  'use strict';

  sap.ui.jsfragment('sap.clr.view.AppUserActions', {

    createContent: function(oController) {

      var oSheet = new ActionSheet({
        placement: 'Bottom',
        buttons: [
          new Button({
            text: 'Change Profile',
            icon: 'sap-icon://person-placeholder',
            press: [ oController.onPressProfile, oController ]
          }),
          new Button({
            text: 'Logoff',
            icon: 'sap-icon://log',
            press: [ oController.onPressLogoff, oController ]
          })
        ]
      });

      return oSheet;
    }
  });
});
