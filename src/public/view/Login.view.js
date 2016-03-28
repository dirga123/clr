sap.ui.define([
  'sap/m/Page',
  'sap/m/Bar'
], function (Page, Bar) {
  'use strict';

  sap.ui.jsview('sap.clr.view.Login', {
    getControllerName: function () {
      return 'sap.clr.controller.Login';
    },

    createContent: function (oController) {
      var oBar = new Bar(this.createId('emptyBar'), {
      });

      var oPage = new Page('loginPage', {
        showHeader: false,
        footer: [
          oBar
        ]
      });

      return oPage;
    }
  });
});
