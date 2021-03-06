sap.ui.define([
  'sap/m/Dialog',
  'sap/m/Button',
  'sap/ui/layout/form/SimpleForm',
  'sap/m/Label',
  'sap/m/TextArea'
], function (Dialog, Button, SimpleForm, Label, TextArea) {
  'use strict';

  sap.ui.jsfragment('sap.clr.view.GSCRequest', {

    createContent: function(oController) {
      var oDialog = new sap.m.Dialog(this.createId('gscRequestDialog'), {
        title: '{i18n>GSCRequestTitle}',
        content: new SimpleForm({
          layout: 'ResponsiveGridLayout',
          content: [
            new Label({ text: '{i18n>GSCRequestReason}', required: true }),
            new TextArea(this.createId('gscReguestReason'), {
              rows: 5,
              cols: 40,
              valueLiveUpdate: true,
              value: {
                path: 'gsc>/reason',
                type: 'sap.ui.model.type.String',
                constraints: {
                  minLength: 1
                }
              }
            })
          ]
        }),

        beginButton: new Button(this.createId('gscRequestSubmit'), {
          type: 'Emphasized',
          text: '{i18n>GSCRequestSubmit}',
          press: [ oController.onPressSubmit, oController ]
        }),

        endButton: new Button(this.createId('gscRequestCancel'), {
          type: 'Default',
          text: '{i18n>GSCRequestCancel}',
          press: [ oController.onPressCancel, oController ]
        })
      });

      return oDialog;
    }
  });
});
