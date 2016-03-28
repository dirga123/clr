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
        icon: 'sap-icon://overview-chart',
        number: {
          parts: [ 'landscapes>currSla', 'landscapes>/services/goodSla' ],
          formatter: function(currSla, goodSla) {
            if (currSla === undefined) {
              return '';
            }
            return parseFloat(currSla).toFixed(4);
          }
        },
        numberUnit: '{i18n>landscapesSLA}',
        title: '{landscapes>project} {landscapes>domain}',
        info: {
          parts: [ 'landscapes>triggersCount', 'landscapes>error' ],
          formatter: function(count, error) {
            if (error !== undefined || count === undefined) {
              return oController.getResourceBundle().getText('landscapeError');
            } else {
              if (count === 1) {
                return count.toString() + ' problem';
              }
              return count.toString() + ' problems';
            }
          }
        },
        infoState: {
          parts: [ 'landscapes>triggersPriority', 'landscapes>error' ],
          formatter: function(priority, error) {
            if (error !== undefined) {
              return 'Error';
            }
            switch (priority) {
            case '2':
            case '3':
              return 'Warning';
            case '4':
            case '5':
              return 'Error';
            case '0':
            case '1':
            default:
              return 'Success';
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
