sap.ui.define([
  'sap/m/Dialog',
  'sap/m/Button',
  'sap/ui/layout/form/SimpleForm',
  'sap/m/Label',
  'sap/m/Input'
], function (Dialog, Button, SimpleForm, Label, Input) {
  'use strict';

  sap.ui.jsfragment('sap.clr.view.Login', {
    createContent: function(oController) {
      var oDialog = new sap.m.Dialog({
        title: '{i18n>loginTitle}',
        content: new SimpleForm({
          layout: 'ResponsiveGridLayout',
          content: [
            new Label({ text: '{i18n>loginName}', required: true }),
            new Input(this.createId('loginDialogName'), {
              valueLiveUpdate: true,
              placeholder: '{i18n>loginNamePlaceholder}',
              value: {
                path: '/username',
                type: 'sap.ui.model.type.String',
                constraints: {
                  minLength: 1
                }
              }
            }),
            new Label({ text: '{i18n>loginPasswd}', required: true }),
            new Input(this.createId('loginDialogPasswd'), {
              type: sap.m.InputType.Password,
              valueLiveUpdate: true,
              placeholder: '{i18n>loginPasswdPlaceholder}',
              value: {
                path: '/password',
                type: 'sap.ui.model.type.String',
                constraints: {
                  minLength: 1
                }
              }
            })
          ]
        }),

        buttons: [
          new Button({
            type: 'Emphasized',
            text: '{i18n>loginLogin}',
            press: [ oController.onPressLogin, oController ]
          })
        ]
      });


      oDialog.oPopup.onsapescape = function(oEvent) {
        oEvent.preventDefault();
        oEvent.stopPropagation();
      };

      return oDialog;
    }
  });
});
