sap.ui.define([
	'sap/m/Page',
	'sap/m/Button',
	'sap/m/Bar',
	'sap/m/Input',
	'sap/m/FlexBox'
], function (Page, Button, Bar, Input, FlexBox) {
	'use strict';

	sap.ui.jsview('sap.clr.view.Login', {
		getControllerName: function () {
			return 'sap.clr.controller.Login';
		},

		createContent: function (oController) {
			var oInput = new Input(this.createId('loginInput'), {
				type: sap.m.InputType.Password,
				width: '250px',
				value: '{/input}',
				valueLiveUpdate: true,
				placeholder: '{i18n>loginInput}'
			});

			var oFlexBox = new FlexBox(this.createId('fb'), {
				fitContainer: true,
				justifyContent: sap.m.FlexJustifyContent.Center,
				alignItems: sap.m.FlexAlignItems.Center,
				items: [
					oInput
				]
			});

			var oButton = new Button(this.createId('loginButton'), {
				text: '{i18n>loginButton}',
				type: sap.m.ButtonType.Emphasized,
				press: [ oController.onPressLogin, oController ]
			});

			var oBar = new Bar(this.createId('bar'), {
				contentRight: [
					oButton
				]
			});

			var oPage = new Page('loginPage', {
				showHeader: false,
				content: [
					oFlexBox
				],
				footer: [
					oBar
				]
			});

			return oPage;
		}
	});
});
