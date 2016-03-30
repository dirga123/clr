sap.ui.define([
  'sap/m/Dialog',
  'sap/m/Button',
  'sap/ui/layout/form/SimpleForm',
  'sap/m/Label',
  'sap/m/Input',
  'sap/m/Switch'
], function (Dialog, Button, SimpleForm, Label, Input, Switch) {
  'use strict';

  sap.ui.jsfragment('sap.clr.view.UserEdit', {

    createContent: function(oController) {
      var oDialog = new sap.m.Dialog({
        title: '{i18n>userEditTitle}',
        content: new SimpleForm({
          layout: 'ResponsiveGridLayout',
          content: [
            new Label({ text: '{i18n>userLogin}', required: true }),
            new Input(this.createId('userEditLogin'), {
              valueLiveUpdate: true,
              value: {
                path: 'edit>login',
                type: 'sap.ui.model.type.String',
                constraints: {
                  minLength: 1
                }
              }
            }),
            new Label({ text: '{i18n>userDomain}' }),
            new Input(this.createId('userEditDomain'), {
              value: {
                path: 'edit>domain',
                type: 'sap.ui.model.type.String'
              }
            }),
            new Label({ text: '{i18n>userName}', required: true }),
            new Input(this.createId('userEditName'), {
              valueLiveUpdate: true,
              value: {
                path: 'edit>name',
                type: 'sap.ui.model.type.String',
                constraints: {
                  minLength: 1
                }
              }
            }),
            new Label({ text: '{i18n>userPassword}' }),
            new Input(this.createId('userEditPassword'), {
              valueLiveUpdate: true,
              type: sap.m.InputType.Password,
              value: {
                path: 'edit>password',
                type: 'sap.ui.model.type.String'
              }
            }),
            new Label({ text: '{i18n>userIsAdmin}' }),
            new Switch(this.createId('userEditIsAdmin'), {
              valueLiveUpdate: true,
              state: {
                path: 'edit>isAdmin',
                type: 'sap.ui.model.type.String'
              }
            }),
            new Label({ text: '{i18n>userIsGSC}' }),
            new Switch(this.createId('userEditIsGSC'), {
              valueLiveUpdate: true,
              state: {
                path: 'edit>isGSC',
                type: 'sap.ui.model.type.String'
              }
            }),
            new Label({ text: '{i18n>userIsReporting}' }),
            new Switch(this.createId('userEditIsReporting'), {
              valueLiveUpdate: true,
              state: {
                path: 'edit>isReporting',
                type: 'sap.ui.model.type.String'
              }
            })
          ]
        }),

        buttons: [
          new Button({
            type: 'Emphasized',
            text: '{i18n>userSave}',
            press: [ oController.onPressEditSave, oController ]
          }),
          new Button({
            type: 'Default',
            text: '{i18n>userCancel}',
            press: [ oController.onPressEditCancel, oController ]
          })
        ]

      });

      return oDialog;
    }
  });
});
