sap.ui.define([
  'sap/clr/controller/BaseController',
  'sap/m/MessageToast',
  'sap/ui/core/util/File'
], function (BaseController, MessageToast, File) {
  'use strict';

  return BaseController.extend('sap.clr.controller.BaseReportController', {

    onPressExport: function() {
      jQuery.sap.log.info('BaseReportController.controller:onPressExport');

      var oModel = this.getModel();
      var id = oModel.getProperty('/id');
      var reportId = oModel.getProperty('/reportId');
      var oDate = oModel.getProperty('/date');

      var sPdfName = id + '_' + oDate.getFullYear() + oDate.getMonth();

      if (reportId === undefined) {
        sap.m.URLHelper.redirect(
          '/Landscape/' + id + '/external/new/' + sPdfName + '.pdf?date=' + oDate.getTime(),
          true
        );
      } else {
        sap.m.URLHelper.redirect(
          '/Landscape/' + id + '/external/' + reportId + '/' + sPdfName + '.pdf',
          true
        );
      }
    }

  });
});
