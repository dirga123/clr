sap.ui.define([
  'sap/clr/controller/BaseReportController',
  'sap/ui/model/json/JSONModel',
  'sap/m/MessageToast',
  'sap/m/Dialog',
  'sap/m/Label',
  'sap/m/TextArea',
  'sap/m/Button'
], function (BaseReportController, JSONModel, MessageToast, Dialog, Label, TextArea, Button) {
  'use strict';

  return BaseReportController.extend('sap.clr.controller.LandscapeExternalNew', {
    onInit: function() {
      jQuery.sap.log.info('LandscapeExternalNew.controller:onInit');

      var oViewModel = new JSONModel({
        name: ''
      });
      this.setModel(oViewModel);
      this.setCurrentDateAndPeriod();

      // Create model and set it to view
      this.setModel(new JSONModel(), 'external');
      this._bindView('external>/external');

      this.getRouter().getRoute('landscapeExternalNew').attachPatternMatched(
        this._onObjectMatched, this
      );
    },

    onChangePeriod: function() {
      jQuery.sap.log.info('LandscapeExternalNew.controller:onChangePeriod');

      var oModel = this.getModel();
      var oDate = new Date();
      var oDateFrom = oModel.getProperty('/from');
      var oDateTo = new Date();
      if (oDate.getMonth() !== oDateFrom.getMonth()) {
        oDateTo = new Date(oDateFrom.getFullYear(), oDateFrom.getMonth() + 1, 1);
      }
      oModel.setProperty('/date', oDate);
      oModel.setProperty('/to', oDateTo);

      setTimeout(jQuery.proxy(this.onPressRefresh, this));
    },

    onPressRefresh: function() {
      jQuery.sap.log.info('LandscapeExternalNew.controller:onPressRefresh');

      this.getView().setBusy(true);
      this._requestData();
    },

    onPressSave: function() {
      jQuery.sap.log.info('LandscapeExternalNew.controller:onPressSave');

      var oModel = this.getModel();
      var oDateFrom = oModel.getProperty('/from');
      var oDate = oModel.getProperty('/date');
      var sDefaultName = oDateFrom.getFullYear() + '-' +
        this.padNumber(oDateFrom.getMonth() + 1) + ' ' +
        oDate.getFullYear() + '-' +
        this.padNumber(oDate.getMonth() + 1) + '-' +
        this.padNumber(oDate.getDate()) + ' ' +
        this.padNumber(oDate.getHours()) + ':' +
        this.padNumber(oDate.getMinutes()) + ':' +
        this.padNumber(oDate.getSeconds());

      oModel.setProperty('/name', sDefaultName);
      oModel.setProperty('/saveEnabled', sDefaultName.length > 0);

      var dialog = new Dialog({
        title: this.getResourceBundle().getText('landscapeExternalSaveCaption'),
        type: 'Message',
        content: [
          new Label({
            text: this.getResourceBundle().getText('landscapeExternalSaveReportName'),
            required: true
          }),
          new TextArea({
            value: '{/name}',
            liveChange: function(oEvent) {
              var sText = oEvent.getParameter('value');
              dialog.getModel().setProperty('/saveEnabled', sText.length > 0);
            },
            width: '100%',
            placeholder: this.getResourceBundle().getText(
              'landscapeExternalSaveReportNamePlaceholder'
            )
          })
        ],
        beginButton: new Button({
          text: this.getResourceBundle().getText('landscapeExternalSaveButton'),
          enabled: '{/saveEnabled}',
          press: jQuery.proxy(this.onPressSaveSave, this)
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

      dialog.setModel(oModel);
      dialog.open();
    },

    onPressSaveSave: function(oEvent) {
      jQuery.sap.log.info('LandscapeExternalNew.controller:onPressSaveSave');
      oEvent.getSource().getParent().close();

      this.getView().setBusy(true);
      setTimeout(jQuery.proxy(this._saveExternal(), this));
    },

    _saveExternal: function() {
      jQuery.sap.log.info('LandscapeExternalNew.controller:_saveExternal');
      var oViewModel = this.getModel();

      var oModel = this.getModel('external');
      oModel.setProperty('/name', oViewModel.getProperty('/name'));
      oModel.setProperty('/date', oViewModel.getProperty('/date').getTime());
      oModel.setProperty('/from', oViewModel.getProperty('/from').getTime());
      oModel.setProperty('/to', oViewModel.getProperty('/to').getTime());

      var sLandscapeId = oViewModel.getProperty('/id');

      jQuery.ajax('/Landscape/' + sLandscapeId + '/external/new', {
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(oModel.getProperty('/')),
        error: jQuery.proxy(this.onAddError, this),
        success: jQuery.proxy(this.onAddSuccess, this)
      });
    },

    onAddError: function(resp, textStatus, errorThrown) {
      this.getView().setBusy(false);
      MessageToast.show(errorThrown);
    },

    onAddSuccess: function(resp) {
      this.getView().setBusy(false);
      if (resp.error) {
        MessageToast.show(resp.error);
        return;
      } else {
        this.onNavBack();
      }
    },

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
    _onObjectMatched: function (oEvent) {
      jQuery.sap.log.info('LandscapeExternalNew.controller:_onObjectMatched');

      // If the view was not bound yet its not busy,
      // only if the binding requests data it is set to busy again
      this.getView().setBusy(true);

      this.setCurrentDateAndPeriod();

      // Get Landscape id
      var sLandscapeId = oEvent.getParameter('arguments').id;

      var oViewModel = this.getModel();
      oViewModel.setProperty('/id', sLandscapeId);

      this._requestData();
    },

    _requestData: function() {
      jQuery.sap.log.info('LandscapeExternalNew.controller:_requestData');

      var oViewModel = this.getModel();
      var sLandscapeId = oViewModel.getProperty('/id');
      var oDate = oViewModel.getProperty('/date');
      var oDateFrom = oViewModel.getProperty('/from');
      var oDateTo = oViewModel.getProperty('/to');

      // Load model
      var oModel = this.getModel('external');
      oModel.attachRequestCompleted(this._requestCompleted, this);
      oModel.loadData(
        '/Landscape/' + sLandscapeId + '/external/new',
        {
          date: oDate.getTime(),
          from: oDateFrom.getTime(),
          to: oDateTo.getTime()
        },
        true,
        'GET',
        false,
        false
      );
    },

    _requestCompleted: function(oEvent) {
      jQuery.sap.log.info('LandscapeExternalNew.controller:_requestCompleted');

      var oModel = this.getModel('external');
      oModel.detachRequestCompleted(this._requestCompleted, this);

      if (oEvent.getParameter('success')) {
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
      jQuery.sap.log.info('LandscapeExternalNew.controller:_bindView');

      this.getView().bindElement({
        path: sPath
      });
    }
  });
});
