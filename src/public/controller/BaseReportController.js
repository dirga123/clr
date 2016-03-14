sap.ui.define([
	'sap/clr/controller/BaseController'
], function (BaseController) {
	'use strict';

	return BaseController.extend('sap.clr.controller.BaseReportController', {

		onPressPrint: function(oEvent) {
			jQuery.sap.log.info('BaseReportController.controller:onPressPrint');

			var oTarget = this.getView();
			var sTargetId = oEvent.getSource().data('targetId');

			if (sTargetId) {
				oTarget = oTarget.byId(sTargetId);
			}

			if (oTarget) {
				/*
				var $domTarget = oTarget.$()[0];
				var sTargetContent = $domTarget.innerHTML;
				var sTargetContent = $domTarget.innerHTML;
				var sOriginalContent = document.body.innerHTML;
				document.body.innerHTML = sTargetContent;
				window.print();
				document.body.innerHTML = sOriginalContent;
				*/
				/*
				var ctrlString = 'width=500px,height=600px';
				var w = window.open('', 'PrintWindow', ctrlString);
				w.document.body.innerHTML = sTargetContent;
				w.print();
				w.close();
*/
				setTimeout(window.print);
			} else {
				jQuery.sap.log.error(
					'onPrint needs a valid target container [view|data:targetId=\"SID\"]'
				);
			}
		},

		onPressExport: function() {
			jQuery.sap.log.info('BaseReportController.controller:onPressExport');

			var oModel = this.getModel();
			var id = oModel.getProperty('/id');
			var reportId = oModel.getProperty('/reportId');
			var oDate = oModel.getProperty('/date');
			// var oCreateDate = oModel.getProperty('/date');

			if (reportId === undefined) {
				sap.m.URLHelper.redirect(
					'/Landscape/' + id + '/external/' + reportId + '/' + id + '_' +
					oDate.getFullYear() + oDate.getMonth() + '.pdf',
					true
				);
			} else {
				sap.m.URLHelper.redirect(
					'/Landscape/' + id + '/external/' + reportId + '/' + id + '_' +
					oDate.getFullYear() + oDate.getMonth() + '.pdf',
					true
				);
			}
		}

	});
});
