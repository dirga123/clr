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
				var $domTarget = oTarget.$()[0];
				var sTargetContent = $domTarget.innerHTML;
				var sOriginalContent = document.body.innerHTML;
				document.body.innerHTML = sTargetContent;
				window.print();
				document.body.innerHTML = sOriginalContent;
			} else {
				jQuery.sap.log.error(
					'onPrint needs a valid target container [view|data:targetId=\"SID\"]'
				);
			}
		},

		onPressExport: function() {
			jQuery.sap.log.info('BaseReportController.controller:onPressExport');
		}

	});
});
