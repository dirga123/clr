sap.ui.define([
	'sap/clr/controller/BaseController',
	'sap/m/MessageToast',
	'sap/ui/core/util/File'
], function (BaseController, MessageToast, File) {
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

			var sPdfName = id + '_' + oDate.getFullYear() + oDate.getMonth();

			if (reportId === undefined) {
				//this.getView().setBusy(true);
				var oExternalModel = this.getModel('external');
				//var w = window.open('/Landscape/' + id + '/external/new/' + sPdfName);
				jQuery.ajax('/Landscape/' + id + '/external/new/' + sPdfName, {
					method: 'POST',
					contentType: 'application/json',
					//dataType: 'json',
					data: JSON.stringify(oExternalModel.getProperty('/')),
					error: jQuery.proxy(this.onExportError, this),
					/*
					success: jQuery.proxy(this.onExportSuccess, this)
					*/
					success: function(resp) {
						var blob = new Blob([ resp ]);
						var link = document.createElement('a');
						link.href = window.URL.createObjectURL(blob);
						link.download = sPdfName + '.pdf';
						link.click();

						//this.getView().setBusy(false);
						//File.save(resp, sPdfName, 'pdf', 'application/pdf');
						//sap.ui.core.util.File.save(resp);
						if (resp.error) {
							MessageToast.show(resp.error);
						} else {
						}
						//w.document.write(resp);
					}
				});
			} else {
				sap.m.URLHelper.redirect(
					'/Landscape/' + id + '/external/' + reportId + '/' + sPdfName + '.pdf',
					true
				);
			}
		},

		onExportError: function(resp, textStatus, errorThrown) {
			this.getView().setBusy(false);
			console.log('error'+textStatus);
			MessageToast.show(errorThrown);
		},

		onExportSuccess: function(resp) {
			this.getView().setBusy(false);
			//sap.ui.core.util.File.save(oContent, this._sId, "zip", "application/zip");
			console.log(resp);
			File.save(resp, 'test', 'pdf', 'application/pdf');
			if (resp.error) {
				MessageToast.show(resp.error);
			} else {
				//var w = window.open('about:blank', 'windowname');
				//console.log(w);
				//win.document.write(resp);
			}
		},

	});
});
