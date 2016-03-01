sap.ui.define([
	'sap/ui/layout/form/SimpleForm',
	'sap/m/Label',
	'sap/m/Input'
], function (SimpleForm, Label, Input) {
	'use strict';

	sap.ui.jsfragment('sap.clr.view.LandscapeChange', {
		createContent: function(oController) {
			var oForm = new SimpleForm(this.createId('landscapeChange'), {
				minWidth: 1024,
				maxContainerCols: 2,
				layout: 'ResponsiveGridLayout',
				editable: true,
				labelSpanL: 1,
				labelSpanM: 1,
				emptySpanL: 1,
				emptySpanM: 1,
				columnsL: 1,
				columnsM: 1,
				content: [
					new Label({ text: '{i18n>landscapeID}' }),
					new Input({ value: '{landscape>id}' }),
					new Label({ text: '{i18n>landscapeZabbix}' }),
					new Input({ value: '{landscape>zabbix}' }),
					new Label({ text: '{i18n>landscapeDomain}' }),
					new Input({ value: '{landscape>domain}' })
				]
			});
			return oForm;
		}
	});
});
