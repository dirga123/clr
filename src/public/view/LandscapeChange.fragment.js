sap.ui.define([
  'sap/ui/layout/form/SimpleForm',
  'sap/ui/layout/form/Form',
  'sap/ui/layout/form/FormElement',
  'sap/ui/layout/form/ResponsiveGridLayout',
  'sap/ui/layout/form/FormContainer',
  'sap/m/Panel',
  'sap/m/Label',
  'sap/m/Input',
  'sap/m/TextArea',
  'sap/m/Button',
  'sap/ui/layout/VerticalLayout'
], function (SimpleForm, Form, FormElement, ResponsiveGridLayout, FormContainer,
	Panel, Label, Input, TextArea, Button, VerticalLayout) {
  'use strict';

  sap.ui.jsfragment('sap.clr.view.LandscapeChange', {
    createContent: function(oController) {

      var oForm = new Form(this.createId('landscapeChange'), {
        minWidth: 1024,
        maxContainerCols: 2,
        editable: true,
        layout: new ResponsiveGridLayout({
          labelSpanL: 3,
          labelSpanM: 3,
          emptySpanL: 4,
          emptySpanM: 4,
          columnsL: 1,
          columnsM: 1
        }),
        formContainers: [
          new FormContainer({
            formElements: [
              new FormElement({
                label: new Label({ text: '{i18n>landscapeID}' }),
                fields: [
                  new Input({ value: '{landscape>project}' })
                ]
              }),
              new FormElement({
                label: new Label({ text: '{i18n>landscapeZabbix}' }),
                fields: [
                  new Input({ value: '{landscape>zabbix}' })
                ]
              }),
              new FormElement({
                label: new Label({ text: '{i18n>landscapeDomain}' }),
                fields: [
                  new Input({ value: '{landscape>domain}' })
                ]
              })
            ]
          })
        ]
      });

      var oPanel = new Panel(this.createId('generalEditPanel'), {
        content: [
          oForm
        ]
      }).addStyleClass('sapUiForceWidthAuto sapUiResponsiveMargin');

      oPanel.bindElement({
        path: 'landscape>/landscape'
      });

      var oGSCAccessForm = new Form(this.createId('gscAccessChange'), {
        minWidth: 1024,
        maxContainerCols: 2,
        editable: true,
        layout: new ResponsiveGridLayout({
          labelSpanL: 3,
          labelSpanM: 3,
          emptySpanL: 4,
          emptySpanM: 4,
          columnsL: 1,
          columnsM: 1
        }),
        formContainers: [
          new FormContainer({
            formElements: [
              new FormElement({
                label: new Label({ text: '{i18n>gscAccessInfo}' }),
                fields: [
                  new TextArea({
                    rows: 10,
                    value: '{gscaccess>text}'
                  })
                ]
              })
            ]
          })
        ]
      });

      var oGSCAccessPanel = new Panel(this.createId('gscAccessEditPanel'), {
        content: [
          oGSCAccessForm
        ]
      }).addStyleClass('sapUiForceWidthAuto sapUiResponsiveMargin');

      oGSCAccessPanel.bindElement({
        path: 'gscaccess>/gscaccess'
      });

      return new VerticalLayout({
        width: '100%',
        content: [
          oPanel,
          oGSCAccessPanel
        ]
      });
    }
  });
});
