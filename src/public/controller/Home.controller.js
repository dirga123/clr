sap.ui.define([
  'sap/clr/controller/BaseController',
  'sap/ui/model/json/JSONModel',
  'sap/m/MessageToast'
], function (BaseController, JSONModel, MessageToast) {
  'use strict';

  return BaseController.extend('sap.clr.controller.Home', {

    onInit: function() {
      jQuery.sap.log.info('Home.controller:onInit');

      this.setModel(new JSONModel({
        route: 'home'
      }));

      var oLandscapesModel = new JSONModel({});
      this.setModel(oLandscapesModel, 'homeLandscapes');

      var oUsersModel = new JSONModel({});
      this.setModel(oUsersModel, 'homeUsers');

      this.attachDisplayForRoute(this._requestData);
      this.attachPatternMatched(this._onObjectMatched);
    },

    onPressLandscapes: function(oEvent) {
      jQuery.sap.log.info('Home.controller:onPressRefresh');
      this.getRouter().navTo('landscapes');
    },

    onPressUsers: function(oEvent) {
      jQuery.sap.log.info('Home.controller:onPressUsers');
      this.getRouter().navTo('users');
    },

    onPressGSC: function(oEvent) {
      jQuery.sap.log.info('Home.controller:onPressGSC');
      this.getRouter().navTo('gsc');
    },

    onPressReporting: function(oEvent) {
      jQuery.sap.log.info('Home.controller:onPressReporting');
      this.getRouter().navTo('reporting');
    },

    onPressRefresh: function() {
      jQuery.sap.log.info('Home.controller:onPressRefresh');

      this._requestData();
    },

    _onObjectMatched: function(oEvent) {
      jQuery.sap.log.info('Home.controller:_onObjectMatched');

      if (this.navigateLoginIfNotLogged()) {
        return;
      }

      this._requestData();
    },

    _requestData: function() {
      jQuery.sap.log.info('Home.controller:_requestData');

      this.byId('landscapesTile').setBusy(true);
      var oLandscapesModel = this.getModel('homeLandscapes');
      oLandscapesModel.attachRequestCompleted(this._requestCompletedLandscapes, this);
      oLandscapesModel.loadData(
        '/home/landscapes',
        null,
        true,
        'GET',
        false,
        false
      );

      this.byId('usersTile').setBusy(true);
      var oUsersModel = this.getModel('homeUsers');
      oUsersModel.attachRequestCompleted(this._requestCompletedUsers, this);
      oUsersModel.loadData(
        '/home/users',
        null,
        true,
        'GET',
        false,
        false
      );
    },

    _requestCompletedLandscapes: function(oEvent) {
      jQuery.sap.log.info('Home.controller:_requestCompletedLandscapes');

      var oModel = this.getModel('homeLandscapes');
      oModel.detachRequestCompleted(this._requestCompletedLandscapes, this);
      this.byId('landscapesTile').setBusy(false);

      this.checkForErrorWithNavigate(oModel, oEvent);
    },

    _requestCompletedUsers: function(oEvent) {
      jQuery.sap.log.info('Home.controller:_requestCompletedUsers');

      var oModel = this.getModel('homeUsers');
      oModel.detachRequestCompleted(this._requestCompletedUsers, this);
      this.byId('usersTile').setBusy(false);

      this.checkForErrorWithNavigate(oModel, oEvent);
    }

  });
});
