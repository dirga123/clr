sap.ui.define([
  'sap/m/Page',
  'sap/m/Button',
  'sap/m/Toolbar',
  'sap/m/ToolbarSpacer',
  'sap/m/TileContainer',
  'sap/m/StandardTile',
  'sap/m/SearchField'
], function (Page, Button, Toolbar, ToolbarSpacer, TileContainer, StandardTile, SearchField) {
  'use strict';

  sap.ui.jsview('sap.clr.view.GSC', {
    getControllerName: function() {
      return 'sap.clr.controller.GSC';
    },

    createContent: function(oController) {
      jQuery.sap.log.info('GSC.view:createContent');

      var oBar = new Toolbar({
        content: [
          new ToolbarSpacer(),
          new Button({
            icon: 'sap-icon://refresh',
            text: '{i18n>gscRefreshButton}',
            press: [ oController.onPressRefresh, oController ]
          })
        ]
      });

      var oTile = new StandardTile({
        icon: 'sap-icon://credit-card',
        busyIndicatorDelay: 0,
        busy: {
          parts: [ 'landscapes>exists', 'landscapes>error' ],
          formatter: function(exists, error) {
            if (error === undefined && exists === undefined) {
              return true;
            } else {
              return false;
            }
          }
        },
        // number: '{landscapes>exists}',
        // numberUnit: '{i18n>landscapesSLA}',
        title: '{landscapes>project} {landscapes>domain}',
        info: {
          parts: [ 'landscapes>exists', 'landscapes>error' ],
          formatter: function(exists, error) {
            if (error !== undefined && exists === undefined) {
              return oController.getResourceBundle().getText('landscapeError');
            } else if (exists === true) {
              return 'Set';
            } else if (exists === false) {
              return 'Not set';
            } else {
              return '';
            }
          }
        },
        infoState: {
          parts: [ 'landscapes>exists', 'landscapes>error' ],
          formatter: function(exists, error) {
            if (error !== undefined) {
              return 'Error';
            } else if (exists === true) {
              return 'Success';
            } else if (exists === false) {
              return 'Warning';
            } else {
              return 'None';
            }
          }
        },
        press: [ oController.onPressDetail, oController ]
      });

      var oTileContainer = new TileContainer(this.createId('landscapeTiles'), {
        width: '100%',
        height: '100%'
      });

      oTileContainer.bindAggregation('tiles', 'landscapes>/landscapes', oTile);

      var oPage = new Page(this.createId('gscPage'), {
        title: '{i18n>gscTitle}',
        showHeader: true,
        showNavButton: true,
        navButtonPress: [ oController.onNavBack, oController ],
        enableScrolling: false,
        subHeader: [
          new Toolbar({
            content: new SearchField({
              width: '100%',
              liveChange: [ oController.onSearch, oController ]
            })
          })
        ],
        content: [
          oTileContainer
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
