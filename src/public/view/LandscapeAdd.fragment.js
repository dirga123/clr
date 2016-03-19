sap.ui.define([
  'sap/m/Dialog',
  'sap/m/Button',
  'sap/ui/layout/form/SimpleForm',
  'sap/m/Label',
  'sap/m/Input',
  'sap/ui/model/SimpleType'
], function (Dialog, Button, SimpleForm, Label, Input, SimpleType) {
  'use strict';

  sap.ui.jsfragment('sap.clr.view.LandscapeAdd', {

    createContent: function(oController) {
      var oDialog = new sap.m.Dialog({
        title: '{i18n>landscapeAddTitle}',
        content: new SimpleForm({
          layout: 'ResponsiveGridLayout',
          content: [
            new Label({ text: '{i18n>landscapeAddId}', required: true }),
            new Input(this.createId('lsAddId'), {
              valueLiveUpdate: true,
              value: {
                path: 'landscapes>/new/id',
                type: 'sap.ui.model.type.String',
                constraints: {
                  minLength: 1
                }
              }
            }),
            new Label({ text: '{i18n>landscapeAddDomain}', required: true }),
            new Input(this.createId('lsAddDomain'), {
              value: {
                path: 'landscapes>/new/domain',
                type: 'sap.ui.model.type.String',
                constraints: {
                  minLength: 1
                }
              }
            }),
            new Label({ text: '{i18n>landscapeAddZabbix}', required: true }),
            new Input(this.createId('lsAddZabbix'), {
              valueLiveUpdate: true,
              value: {
                path: 'landscapes>/new/zabbix',
                type: 'sap.ui.model.type.String',
                constraints: {
                  minLength: 1
                }
              }
            })
          ]
        }),

        beginButton: new Button({
          type: 'Emphasized',
          text: '{i18n>landscapeAddAdd}',
          press: [ oController.onPressAddAdd, oController ]
        }),

        endButton: new Button({
          type: 'Default',
          text: '{i18n>landscapeAddCancel}',
          press: function() {
            oDialog.close();
          }
        })
      });

      return oDialog;
    }
  });
});
