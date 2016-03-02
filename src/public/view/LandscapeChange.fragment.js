sap.ui.define([
	'sap/ui/layout/form/SimpleForm',
	'sap/ui/layout/form/Form',
	'sap/ui/layout/form/FormElement',
	'sap/ui/layout/form/ResponsiveGridLayout',
	'sap/ui/layout/form/FormContainer',
	'sap/m/Label',
	'sap/m/Input',
	'sap/m/Button'
], function (SimpleForm, Form, FormElement, ResponsiveGridLayout, FormContainer,
	Label, Input, Button) {
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
									new Input({ value: '{landscape>id}' })
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
							}),
							new FormElement({
								label: new Label({ text: '' }),
								fields: [
									new Button({
										type: sap.m.ButtonType.Reject,
										text: 'Delete',
										press: [ oController.onPressDelete, oController ]
									})
								]
							})
						]
					})
				]
			});
			return oForm;
		}
	});
});