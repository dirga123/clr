sap.ui.define([
  'sap/clr/controller/BaseController',
  'sap/ui/model/json/JSONModel',
  'sap/m/MessageToast',
  'sap/m/MessageBox'
], function (BaseController, JSONModel, MessageToast, MessageBox) {
  'use strict';

  return BaseController.extend('sap.clr.controller.GSC', {

    onInit: function() {
      jQuery.sap.log.info('GSC.controller:onInit');

      this.setModel(new JSONModel({
        route: 'gsc'
      }));
      this.setCurrentDateAndPeriod();

      var oModel = new JSONModel();
      this.setModel(oModel, 'landscapes');

      var oGSCModel = new JSONModel();
      this.setModel(oGSCModel, 'gsc');

      this.attachDisplayForRoute(this._requestData);
      this.attachPatternMatched(this._onObjectMatched);
    },

    onExit: function() {
      if (this._oRequestDialog) {
        this._oRequestDialog.destroy();
        this._oRequestDialog = null;
      }
    },

    onPressRefresh: function() {
      jQuery.sap.log.info('GSC.controller:onPressRefresh');

      this._requestData();
    },

    onSearch: function(oEvt) {
      jQuery.sap.log.info('Landscapes.controller:onSearch');

      var aFilters = [];
      var sQuery = oEvt.getSource().getValue();
      if (sQuery && sQuery.length > 0) {
        var filter = new sap.ui.model.Filter([
          new sap.ui.model.Filter('project', sap.ui.model.FilterOperator.Contains, sQuery),
          new sap.ui.model.Filter('domain', sap.ui.model.FilterOperator.Contains, sQuery)
        ], false);
        aFilters.push(filter);
      }

      // update list binding
      var list = this.getView().byId('landscapeTiles');
      var binding = list.getBinding('tiles');
      binding.filter(aFilters, sap.ui.model.FilterType.Application);
    },

    onPressDetail: function(oEvent) {
      jQuery.sap.log.info('GSC.controller:onPressDetail');

      if (this.getComponent().isAdmin()) {
        var oItem = oEvent.getSource();
        var oBindingContext = oItem.getBindingContext('landscapes');
        var sId = oBindingContext.getProperty('id');
        console.log(sId);
        var oRouter = this.getRouter();
        oRouter.navTo('gscaccess', {
          id: sId
        });
      } else {
        this.getModel('gsc').setProperty('/reason', '');
        this._getReguestDialog().open();
      }
    },

    onPressSubmit: function() {
      jQuery.sap.log.info('GSC.controller:onPressSubmit');

      this._getReguestDialog().close();

      var bCompact = !!this.getView().$().closest('.sapUiSizeCompact').length;
      MessageBox.success('Credentials were sent to your email address', {
        styleClass: bCompact ? 'sapUiSizeCompact' : ''
      });
    },

    onPressCancel: function() {
      jQuery.sap.log.info('GSC.controller:onPressDetail');

      this._getReguestDialog().close();
    },

    _getReguestDialog: function() {
      jQuery.sap.log.info('GSC.controller:_getReguestDialog');

      if (!this._oRequestDialog) {
        this._oRequestDialog = sap.ui.jsfragment('sap.clr.view.GSCRequest', this);
        this.getView().addDependent(this._oRequestDialog);
      }

      return this._oRequestDialog;
    },

    _onObjectMatched: function(oEvent) {
      jQuery.sap.log.info('GSC.controller:_onObjectMatched');

      if (this.navigateHomeIfNotLoggedAsGSC()) {
        return;
      }

      this._requestData();
    },

    _requestData: function() {
      jQuery.sap.log.info('GSC.controller:_requestData');

      this.getView().setBusy(true);
      this.setCurrentDateAndPeriod();

      var oViewModel = this.getModel();
      var oDate = oViewModel.getProperty('/date');
      var oDateFrom = oViewModel.getProperty('/from');
      var oDateTo = oViewModel.getProperty('/to');

      var oModel = this.getModel('landscapes');
      oModel.attachRequestCompleted(this._requestCompleted, this);
      oModel.loadData(
        '/gsc',
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
      jQuery.sap.log.info('GSC.controller:_requestCompleted');

      var oModel = this.getModel('landscapes');
      oModel.detachRequestCompleted(this._requestCompleted, this);

      this.getView().setBusy(false);

      this.checkForErrorWithNavigate(oModel, oEvent);
    }
  });
});
