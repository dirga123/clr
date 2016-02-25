sap.ui.define([], function () {
	'use strict';

	return {
		statusText: function(sStatus) {
      /*
			var resourceBundle = this.getView().getModel("i18n").getResourceBundle();
			switch (sStatus) {
				case "A":
					return resourceBundle.getText("invoiceStatusA");
				case "B":
					return resourceBundle.getText("invoiceStatusB");
				case "C":
					return resourceBundle.getText("invoiceStatusC");
				default:
					return sStatus;
			}
      */
		},

    secondsToString: function(val) {
			var seconds = Math.floor(val);
			var days = Math.floor(seconds / 86400);
			seconds -= days*86400;
			var hours = Math.floor(seconds / 3600);
			seconds -= hours*3600;
			var minutes = Math.floor(seconds / 60);
			seconds -= minutes*60;

			return days+'d '+hours+'h '+minutes+'m '+seconds+'s';
			/*
			var date = new Date(null);
			date.setSeconds(sec);
			return date.toISOString();
			*/
			//return (new Date(sec * 1000)).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0];
		},

		statusToState: function(status) {
			switch (status) {
				case '0':
					return 'Success';
				case '1':
					return 'Warning';
				case '2':
					return 'Error';
				default:
					return 'None';
			}
		},

		statusToText: function(status) {
			switch (status) {
				case '0':
					return 'OK';
				case '1':
					return 'To be checked';
				case '2':
					return 'Failed';
				default:
					return 'N/A';
			}
		},

		slaToText: function(sla) {
			var text = '';
			if (sla) {
				text = parseFloat(sla).toFixed(4);
			}
			return text;
		},

		avgToText: function(avg) {
			if (avg === null) {
				return '';
			}
			return parseFloat(avg).toFixed(4);
		}
	};
});
