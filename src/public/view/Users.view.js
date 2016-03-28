sap.ui.define([
  'sap/m/Page',
  'sap/m/Button',
  'sap/m/Toolbar',
  'sap/m/ToolbarSpacer',
  'sap/m/SearchField',
  'sap/m/List',
  'sap/m/StandardListItem'
], function (Page, Button, Toolbar, ToolbarSpacer, SearchField, List, StandardListItem) {
  'use strict';

  sap.ui.jsview('sap.clr.view.Users', {
    getControllerName: function() {
      return 'sap.clr.controller.Users';
    },

    createContent: function(oController) {
      jQuery.sap.log.info('Users.view:createContent');

      var oBar = new Toolbar({
        content: [
          new ToolbarSpacer(),
          new Button(this.createId('addButton'), {
            icon: 'sap-icon://add',
            text: '{i18n>usersAddButton}',
            press: [ oController.onPressAdd, oController ]
          }),
          new Button({
            icon: 'sap-icon://refresh',
            text: '{i18n>usersRefreshButton}',
            press: [ oController.onPressRefresh, oController ]
          })
        ]
      });

      var oUsersList = new List(this.createId('usersList'), {
        mode: sap.m.ListMode.Delete,
        'delete': [ oController.onPressDelete, oController ]
      });

      var oUserItem = new StandardListItem({
        title: '{users>name}',
        description: '{users>Domain}{users>login}',
        type: 'Detail',
        detailPress: [ oController.onPressEdit, oController ]
      });

      oUsersList.bindItems({
        path: 'users>/users',
        template: oUserItem
      });

      var oPage = new Page(this.createId('usersPage'), {
        title: '{i18n>usersTitle}',
        showHeader: true,
        showNavButton: true,
        navButtonPress: [ oController.onNavBack, oController ],
        enableScrolling: true,
        subHeader: [
          new Toolbar({
            content: new SearchField({
              width: '100%',
              liveChange: [ oController.onSearch, oController ]
            })
          })
        ],
        content: [
          oUsersList
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
