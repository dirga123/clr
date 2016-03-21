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
      var sPdfName = this.createPdfName(id, oDate);

      if (reportId === undefined) {
        var oDateFrom = oModel.getProperty('/from');
        var oDateTo = oModel.getProperty('/to');

        sap.m.URLHelper.redirect(
          '/Landscape/' + id + '/external/new/' + sPdfName + '.pdf?' +
          'date=' + oDate.getTime() +
          '&from=' + oDateFrom.getTime() +
          '&to=' + oDateTo.getTime(),
          true
        );
      } else {
        sap.m.URLHelper.redirect(
          '/Landscape/' + id + '/external/' + reportId + '/' + sPdfName + '.pdf',
          true
        );
      }
    },

    createPdfName(id, date) {
      var sPdfName = id + '_' + date.getFullYear() +
        (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1);
      return sPdfName;
    }

  });
});
