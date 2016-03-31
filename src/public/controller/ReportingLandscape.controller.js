sap.ui.define([
  'sap/clr/controller/BaseController',
  'sap/ui/model/json/JSONModel',
  'sap/m/MessageToast',
  'sap/m/MessageStrip',
  'sap/m/Dialog',
  'sap/m/Button',
  'sap/m/Text'
], function (BaseController, JSONModel, MessageToast, MessageStrip, Dialog,
  Button, Text) {
  'use strict';

  return BaseController.extend('sap.clr.controller.ReportingLandscape', {
    onInit: function() {
      jQuery.sap.log.info('ReportingLandscape.controller:onInit');

      this.setModel(new JSONModel({
        route: 'reportingLandscape'
      }));
      this.setCurrentDateAndPeriod();

      // Create model and set it to view
      this.setModel(new JSONModel(), 'landscape');
      this.setModel(new JSONModel(), 'landscapeExternal');

      this.attachDisplayForRoute(this._requestData);
      this.attachPatternMatched(this._onObjectMatched);
    },

    onPressRefresh: function() {
      jQuery.sap.log.info('ReportingLandscape.controller:onPressRefresh');
      this._setBusy();
      this._requestData();
    },

    onAddExternal: function() {
      var oViewModel = this.getModel();
      var sLandscapeId = oViewModel.getProperty('/id');

      var oRouter = this.getRouter();
      oRouter.navTo('landscapeExternalNew', {
        id: sLandscapeId
      });
    },

    onDisplayExternal: function(oEvent) {
      var oViewModel = this.getModel();
      var sLandscapeId = oViewModel.getProperty('/id');

      var oItem = oEvent.getSource();
      var oBindingContext = oItem.getBindingContext('landscapeExternal');
      var sReportId = oBindingContext.getProperty('id');

      var oRouter = this.getRouter();
      oRouter.navTo('landscapeExternal', {
        id: sLandscapeId,
        reportId: sReportId
      });
    },

    onLinkZabbixPress: function(oEvent) {
      jQuery.sap.log.info('Landscape.controller:onLinkZabbixPress');
      var oModel = this.getModel('landscape');
      var sZabbix = oModel.getProperty('/landscape/zabbix');
      sZabbix = sZabbix.replace('api_jsonrpc.php', '');
      sap.m.URLHelper.redirect(sZabbix, true);
    },

    onLinkDomainPress: function(oEvent) {
      jQuery.sap.log.info('Landscape.controller:onLinkDomainPress');
      var oModel = this.getModel('landscape');
      var sDomain = oModel.getProperty('/landscape/domain');
      if (sDomain !== undefined && sDomain !== null) {
        sap.m.URLHelper.redirect('https://portal.' + sDomain + '/RDWeb/', true);
      }
    },

    onLinkDomainBAPress: function(oEvent) {
      jQuery.sap.log.info('Landscape.controller:onLinkDomainPress');
      var oModel = this.getModel('landscape');
      var sDomain = oModel.getProperty('/landscape/domain');
      if (sDomain !== undefined && sDomain !== null) {
        sap.m.URLHelper.redirect('https://portal.' + sDomain + '/BrowserAccess/', true);
      }
    },

    _messageStrips: [],

    _closeMessageStrips: function() {
      for (var i = 0; i < this._messageStrips.length; i++) {
        this._messageStrips[i].getParent().removeContent(this._messageStrips[i]);
        this._messageStrips[i].destroy();
        this._messageStrips[i] = null;
      }
      this._messageStrips = [];
    },

    _setBusy: function() {
      var panels = [
        this.byId('generalPanel'),
        this.byId('externalPanel')
      ];

      jQuery.each(panels, function (i, panel) {
        panel.setBusy(true);
      });
    },

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
    _onObjectMatched: function (oEvent) {
      jQuery.sap.log.info('ReportingLandscape.controller:_onObjectMatched');

      if (this.navigateHomeIfNotLoggedAsReporting()) {
        return;
      }

      this._setBusy();

      var sLandscapeId = oEvent.getParameter('arguments').id;

      var oViewModel = this.getModel();
      oViewModel.setProperty('/id', sLandscapeId);

      this._requestData();
    },

    _requestData: function() {
      jQuery.sap.log.info('ReportingLandscape.controller:_requestData');

      this._closeMessageStrips();

      var oViewModel = this.getModel();
      var sLandscapeId = oViewModel.getProperty('/id');

      // Load landscape model
      var oModel = this.getModel('landscape');
      oModel.attachRequestCompleted(this._requestCompletedGeneral, this);
      oModel.loadData(
        '/landscape/' + sLandscapeId + '/general',
        null,
        true,
        'GET',
        false,
        false
      );

      var oModelExternal = this.getModel('landscapeExternal');
      oModelExternal.attachRequestCompleted(this._requestCompletedExternal, this);
      oModelExternal.loadData(
        '/landscape/' + sLandscapeId + '/external',
        null,
        true,
        'GET',
        false,
        false
      );
    },

    _requestCompletedGeneral: function(oEvent) {
      jQuery.sap.log.info('ReportingLandscape.controller:_requestCompletedGeneral');
      var oPanel = this.getView().byId('generalPanel');
      var oModel = this.getModel('landscape');
      oModel.detachRequestCompleted(this._requestCompletedGeneral, this);
      this._requestCompleted(oEvent, oPanel, oModel, true);
    },

    _requestCompletedExternal: function(oEvent) {
      jQuery.sap.log.info('ReportingLandscape.controller:_requestCompletedExternal');
      var oPanel = this.getView().byId('externalPanel');
      var oModel = this.getModel('landscapeExternal');
      oModel.detachRequestCompleted(this._requestCompletedExternal, this);
      this._requestCompleted(oEvent, oPanel, oModel);
    },

    _requestCompleted: function(oEvent, oPanel, oModel, check401) {
      jQuery.sap.log.info('ReportingLandscape.controller:_requestCompleted');

      oPanel.setBusy(false);

      var sError;

      if (oEvent.getParameter('success')) {
        if (oEvent.oSource.oData.error) {
          sError = oEvent.oSource.oData.error;
        }
      } else {
        var oError = oEvent.getParameter('errorobject');

        sError = this.getResourceBundle().getText('generalError', [
          oError.statusCode,
          oError.statusText,
          oError.responseText
        ]);

        // Should be sure to execute only once?
        if (check401) {
          if (this.navigateToLoginAfter401(oError.statusCode)) {
            return;
          }
        }
      }

      if (sError) {
        var oMessageStrip = new MessageStrip({
          text: sError,
          type: 'Error',
          showIcon: true,
          showCloseButton: true
        });

        this._messageStrips.push(oMessageStrip);
        oPanel.insertContent(oMessageStrip,	0);
      }
    }
  });
});
