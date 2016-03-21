sap.ui.define([
  'sap/clr/controller/BaseReportController',
  'sap/ui/model/json/JSONModel',
  'sap/m/MessageToast',
  'sap/m/Dialog',
  'sap/m/Label',
  'sap/m/TextArea',
  'sap/m/Text',
  'sap/m/Button'
], function (BaseReportController, JSONModel, MessageToast, Dialog, Label, TextArea, Text, Button) {
  'use strict';

  return BaseReportController.extend('sap.clr.controller.LandscapeExternal', {
    onInit: function() {
      jQuery.sap.log.info('LandscapeExternal.controller:onInit');

      this.setModel(new JSONModel());

      // Create model and set it to view
      this.setModel(new JSONModel(), 'external');
      this._bindView('external>/external');

      this.getRouter().getRoute('landscapeExternal').attachPatternMatched(
        this._onObjectMatched, this
      );
    },

    onPressDelete: function() {
      jQuery.sap.log.info('LandscapeExternal.controller:onPressDelete');

      var dialog = new Dialog({
        title: this.getResourceBundle().getText('landscapeExternalDeleteCaption'),
        type: 'Message',
        content: [
          new Text({ text: this.getResourceBundle().getText('landscapeExternalDeleteQuestion') })
        ],
        beginButton: new Button({
          text: this.getResourceBundle().getText('landscapeExternalDeleteButton'),
          icon: 'sap-icon://delete',
          type: 'Reject',
          press: jQuery.proxy(this.onPressDeleteDelete, this)
        }),
        endButton: new Button({
          text: this.getResourceBundle().getText('landscapeExternalCancelButton'),
          press: function () {
            dialog.close();
          }
        }),
        afterClose: function() {
          dialog.destroy();
        }
      });

      dialog.open();
    },

    onPressDeleteDelete: function(oEvent) {
      jQuery.sap.log.info('LandscapeExternal.controller:onPressDeleteDelete');
      oEvent.getSource().getParent().close();

      this.getView().setBusy(true);
      setTimeout(jQuery.proxy(this._deleteExternal(), this));
    },

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

    _deleteExternal: function() {
      jQuery.sap.log.info('LandscapeExternal.controller:_deleteExternal');
      var oViewModel = this.getModel();

      var sLandscapeId = oViewModel.getProperty('/id');
      var sReportId = oViewModel.getProperty('/reportId');

      jQuery.ajax('/Landscape/' + sLandscapeId + '/external/' + sReportId, {
        method: 'DELETE',
        error: jQuery.proxy(this.onDeleteError, this),
        success: jQuery.proxy(this.onDeleteSuccess, this)
      });
    },

    onDeleteError: function(resp, textStatus, errorThrown) {
      this.getView().setBusy(false);
      MessageToast.show(errorThrown);
    },

    onDeleteSuccess: function(resp) {
      this.getView().setBusy(false);
      if (resp.error) {
        MessageToast.show(resp.error);
        return;
      } else {
        this.onNavBack();
      }
    },

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
    _onObjectMatched: function (oEvent) {
      jQuery.sap.log.info('LandscapeExternal.controller:_onObjectMatched');

      // If the view was not bound yet its not busy,
      // only if the binding requests data it is set to busy again
      this.getView().setBusy(true);

      // Get Landscape id
      var sLandscapeId = oEvent.getParameter('arguments').id;
      var sReportId = oEvent.getParameter('arguments').reportId;

      var oViewModel = this.getModel();
      oViewModel.setProperty('/id', sLandscapeId);
      oViewModel.setProperty('/reportId', sReportId);

      this._requestData();
    },

    _requestData: function() {
      jQuery.sap.log.info('LandscapeExternal.controller:_requestData');

      var oViewModel = this.getModel();
      var sLandscapeId = oViewModel.getProperty('/id');
      var sReportId = oViewModel.getProperty('/reportId');

      // Load model
      var oModel = this.getModel('external');
      oModel.attachRequestCompleted(this._requestCompleted, this);
      oModel.loadData(
        '/Landscape/' + sLandscapeId + '/external/' + sReportId,
        null,
        true,
        'GET',
        false,
        false
      );
    },

    _requestCompleted: function(oEvent) {
      jQuery.sap.log.info('LandscapeExternal.controller:_requestCompleted');

      var oModel = this.getModel('external');
      oModel.detachRequestCompleted(this._requestCompleted, this);

      if (oEvent.getParameter('success')) {
        var oViewModel = this.getModel();

        var date = new Date();
        date.setTime(oModel.getProperty('/date'));
        oViewModel.setProperty('/date', date);

        var dateFrom = new Date();
        dateFrom.setTime(oModel.getProperty('/from'));
        oViewModel.setProperty('/from', dateFrom);

        var dateTo = new Date();
        dateTo.setTime(oModel.getProperty('/to'));
        oViewModel.setProperty('/to', dateTo);

        var sError = oModel.getProperty('/error');
        if (sError) {
          MessageToast.show(sError);
        }
      } else {
        var oError = oEvent.getParameter('errorobject');
        jQuery.sap.log.error(oError);
        MessageToast.show(
          'Error ' + oError.statusCode + ': ' + oError.statusText +
          ' ' + oError.responseText
        );
      }

      this.getView().setBusy(false);
    },

		/*
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
    _bindView: function (sPath) {
      jQuery.sap.log.info('LandscapeExternal.controller:_bindView');
      this.getView().bindElement({
        path: sPath
      });
    }

  });
});
