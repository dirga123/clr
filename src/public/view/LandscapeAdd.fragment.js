sap.ui.define([
	'sap/m/Dialog',
	'sap/m/Button',
	'sap/ui/layout/form/SimpleForm',
	'sap/m/Label',
	'sap/m/Input'
], function (Dialog, Button, SimpleForm, Label, Input) {
	'use strict';

	sap.ui.jsfragment('sap.clr.view.LandscapeAdd', {
		createContent: function(oController) {
			var oDialog = new sap.m.Dialog({
				title: '{i18n>landscapeAddTitle}',
				press: [ oController.doSomething, oController ],
				content: new SimpleForm({
						layout: 'ResponsiveGridLayout',
						content: [
							new Label({ text: '{i18n>landscapeAddId}' }),
							new Input({ value: '{home>/new/id}' }),
							new Label({ text: '{i18n>landscapeAddDomain}' }),
							new Input({ value: '{home>/new/domain}' }),
							new Label({ text: '{i18n>landscapeAddZabbix}' }),
							new Input({ value: '{home>/new/zabbix}' })
						]
				}),
				beginButton: new Button({
					type: 'Emphasized',
					text: '{i18n>landscapeAddAdd}',
					press: function() {
						oDialog.close();
						setTimeout(oController.addLandscape());
					}
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
