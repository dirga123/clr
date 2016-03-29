sap.ui.define([
  'sap/ui/layout/form/Form',
  'sap/ui/layout/form/FormElement',
  'sap/ui/layout/form/ResponsiveGridLayout',
  'sap/ui/layout/form/FormContainer',
  'sap/m/Label',
  'sap/m/TextArea',
  'sap/ui/layout/VerticalLayout'
], function (Form, FormElement, ResponsiveGridLayout, FormContainer,
	Label, TextArea, VerticalLayout) {
  'use strict';

  sap.ui.jsfragment('sap.clr.view.GSCAccessChange', {
    createContent: function(oController) {
      var oForm = new Form(this.createId('gscAccessChangeForm'), {
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
                    value: '{gscAccess>text}',
                    rows: 20
                  })
                ]
              })
            ]
          })
        ]
      });

      var oPanel = new VerticalLayout(this.createId('gscAccessEditPanel'), {
        width: '100%',
        content: [
          oForm
        ]
      });

      oPanel.bindElement({
        path: 'gscAccess>/'
      });

      return oPanel;
    }
  });
});
