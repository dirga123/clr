sap.ui.define([
  'sap/m/Dialog',
  'sap/m/Button',
  'sap/ui/layout/form/SimpleForm',
  'sap/m/Label',
  'sap/m/Input',
  'sap/m/Switch'
], function (Dialog, Button, SimpleForm, Label, Input, Switch) {
  'use strict';

  sap.ui.jsfragment('sap.clr.view.UserAdd', {

    createContent: function(oController) {
      var oDialog = new sap.m.Dialog({
        title: '{i18n>userAddTitle}',
        content: new SimpleForm({
          layout: 'ResponsiveGridLayout',
          content: [
            new Label({ text: '{i18n>userLogin}', required: true }),
            new Input(this.createId('userAddLogin'), {
              valueLiveUpdate: true,
              value: {
                path: 'users>/new/login',
                type: 'sap.ui.model.type.String',
                constraints: {
                  minLength: 1
                }
              }
            }),
            new Label({ text: '{i18n>userDomain}' }),
            new Input(this.createId('userAddDomain'), {
              value: {
                path: 'users>/new/domain',
                type: 'sap.ui.model.type.String'
              }
            }),
            new Label({ text: '{i18n>userName}', required: true }),
            new Input(this.createId('userAddName'), {
              valueLiveUpdate: true,
              value: {
                path: 'users>/new/name',
                type: 'sap.ui.model.type.String',
                constraints: {
                  minLength: 1
                }
              }
            }),
            new Label({ text: '{i18n>userPassword}', required: true }),
            new Input(this.createId('userAddPassword'), {
              valueLiveUpdate: true,
              type: sap.m.InputType.Password,
              value: {
                path: 'users>/new/password',
                type: 'sap.ui.model.type.String',
                constraints: {
                  minLength: 1
                }
              }
            }),
            new Label({ text: '{i18n>userIsAdmin}' }),
            new Switch(this.createId('userAddIsAdmin'), {
              valueLiveUpdate: true,
              state: {
                path: 'users>/new/isAdmin',
                type: 'sap.ui.model.type.String'
              }
            }),
            new Label({ text: '{i18n>userIsGSC}' }),
            new Switch(this.createId('userAddIsGSC'), {
              valueLiveUpdate: true,
              state: {
                path: 'users>/new/isGSC',
                type: 'sap.ui.model.type.String'
              }
            }),
            new Label({ text: '{i18n>userIsReporting}' }),
            new Switch(this.createId('userAddIsReporting'), {
              valueLiveUpdate: true,
              state: {
                path: 'users>/new/isReporting',
                type: 'sap.ui.model.type.String'
              }
            })
          ]
        }),

        beginButton: new Button({
          type: 'Emphasized',
          text: '{i18n>userAdd}',
          press: [ oController.onPressAddAdd, oController ]
        }),

        endButton: new Button({
          type: 'Default',
          text: '{i18n>userCancel}',
          press: function() {
            oDialog.close();
          }
        })
      });

      return oDialog;
    }
  });
});
