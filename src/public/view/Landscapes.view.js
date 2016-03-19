sap.ui.define([
  'sap/m/Page',
  'sap/m/Button',
  'sap/m/Toolbar',
  'sap/m/ToolbarSpacer',
  'sap/m/TileContainer',
  'sap/m/StandardTile'
], function (Page, Button, Toolbar, ToolbarSpacer, TileContainer, StandardTile) {
  'use strict';

  sap.ui.jsview('sap.clr.view.Landscapes', {
    getControllerName: function () {
      return 'sap.clr.controller.Landscapes';
    },

    createContent: function (oController) {
      jQuery.sap.log.info('Landscapes.view:createContent');

      var oAddButton = new Button(this.createId('addButton'), {
        icon: 'sap-icon://add',
        text: '{i18n>landscapeAddButton}',
        press: [ oController.onPressAdd, oController ]
      });

      var oBar = new Toolbar({
        content: [
          new ToolbarSpacer(),
          oAddButton,
          new Button({
            icon: 'sap-icon://refresh',
            text: '{i18n>landscapeRefreshButton}',
            press: [ oController.onPressRefresh, oController ]
          }).addStyleClass('uoNoPrint')
        ]
      });

      var oTile = new StandardTile({
        icon: 'sap-icon://overview-chart',
        number: {
          parts: [ 'landscapes>currSla', 'landscapes>/services/goodSla' ],
          formatter: function(currSla, goodSla) {
            var text = '';
            if (currSla !== undefined) {
              text = parseFloat(currSla).toFixed(4);
            }
            return text;
          }
        },
        numberUnit: '{i18n>landscapesSLA}',
        title: '{landscapes>id} {landscapes>domain}',
        info: {
          parts: [ 'landscapes>triggersCount', 'landscapes>error' ],
          formatter: function(count, error) {
            if (error !== undefined || count === undefined) {
              return oController.getResourceBundle().getText('landscapeError');
            } else {
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
            case 2:
            case 3:
              return 'Warning';
            case 4:
            case 5:
              return 'Error';
            case 0:
            case 1:
            default:
              return 'Success';
            }
          }
        },
        press: [ oController.onPressDetail, oController ]
      });

      var oTileContainer = new TileContainer(this.createId('tileContainer'), {
        width: '100%',
        height: '100%'
      });

      oTileContainer.bindAggregation('tiles', 'landscapes>/landscapes', oTile);

      var oPage = new Page(this.createId('landscapesPage'), {
        title: '{i18n>landscapesTitle}',
        showHeader: true,
        showNavButton: true,
        navButtonPress: [ oController.onNavBack, oController ],
        enableScrolling: false,
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
