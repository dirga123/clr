sap.ui.define([
  'sap/m/Dialog',
  'sap/m/Button',
  'sap/ui/layout/form/SimpleForm',
  'sap/m/Label',
  'sap/m/Input'
], function (Dialog, Button, SimpleForm, Label, Input) {
  'use strict';

  sap.ui.jsfragment('sap.clr.view.UserProfile', {

    createContent: function(oController) {
      var oDialog = new Dialog({
        title: '{i18n>userProfileTitle}',
        content: new SimpleForm({
          layout: 'ResponsiveGridLayout',
          content: [
            new Label({ text: '{i18n>userName}', required: true }),
            new Input(this.createId('userProfileName'), {
              valueLiveUpdate: true,
              value: {
                path: 'userProfile>/name',
                type: 'sap.ui.model.type.String',
                constraints: {
                  minLength: 1
                }
              }
            }),
            new Label({ text: '{i18n>userOldPassword}', required: true }),
            new Input(this.createId('userProfileOldPassword'), {
              valueLiveUpdate: true,
              type: sap.m.InputType.Password,
              value: {
                path: 'userProfile>/oldPassword',
                type: 'sap.ui.model.type.String',
                constraints: {
                  minLength: 1
                }
              }
            }),
            new Label({ text: '{i18n>userNewPassword}' }),
            new Input(this.createId('userProfileNewPassword'), {
              valueLiveUpdate: true,
              type: sap.m.InputType.Password,
              value: {
                path: 'userProfile>/newPassword',
                type: 'sap.ui.model.type.String'
              }
            }),
            new Label({ text: '{i18n>userNewPassword2}' }),
            new Input(this.createId('userProfileNewPassword2'), {
              valueLiveUpdate: true,
              type: sap.m.InputType.Password,
              value: {
                path: 'userProfile>/newPassword2',
                type: 'sap.ui.model.type.String'
              }
            })
          ]
        }),

        buttons: [
          new Button({
            type: 'Emphasized',
            text: '{i18n>userSave}',
            press: [ oController.onPressProfileSave, oController ]
          }),
          new Button({
            type: 'Default',
            text: '{i18n>userCancel}',
            press: [ oController.onPressProfileCancel, oController ]
          })
        ]

      });

      return oDialog;
    }
  });
});
