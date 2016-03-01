sap.ui.define([
	'sap/ui/layout/form/SimpleForm',
	'sap/m/Label',
	'sap/m/Text'
], function (SimpleForm, Label, Text) {
	'use strict';

	sap.ui.jsfragment('sap.clr.view.LandscapeDisplay', {
		createContent: function(oController) {
			var oForm = new SimpleForm(this.createId('landscapeDisplay'), {
				minWidth: 1024,
				maxContainerCols: 2,
				layout: 'ResponsiveGridLayout',
				editable: false,
				labelSpanL: 1,
				labelSpanM: 1,
				emptySpanL: 1,
				emptySpanM: 1,
				columnsL: 1,
				columnsM: 1,
				content: [
					new Label({ text: '{i18n>landscapeID}' }),
					new Text({ text: '{landscape>id}' }),
					new Label({ text: '{i18n>landscapeZabbix}' }),
					new Text({ text: '{landscape>zabbix}' }),
					new Label({ text: '{i18n>landscapeDomain}' }),
					new Text({ text: '{landscape>domain}' })
				]
			});
			return oForm;
		}
	});
});
