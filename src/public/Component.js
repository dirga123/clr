sap.ui.define([
  'sap/ui/core/UIComponent',
  'sap/ui/model/json/JSONModel'
], function (UIComponent, JSONModel) {
  'use strict';

  return UIComponent.extend('sap.clr.Component', {
    metadata: {
      manifest: 'json'
    },

    init: function() {
      jQuery.sap.log.info('Component:init');

      var oUserModel = new JSONModel();
      oUserModel.setDefaultBindingMode('OneWay');
      this.setModel(oUserModel, 'loginInfo');
      this.resetLoginInfoModel();

      // Set device model
      var oDeviceModel = new sap.ui.model.json.JSONModel({
        isTouch: sap.ui.Device.support.touch,
        isNoTouch: !sap.ui.Device.support.touch,
        isPhone: sap.ui.Device.system.phone,
        isNoPhone: !sap.ui.Device.system.phone,
        listMode: sap.ui.Device.system.phone ? 'None' : 'SingleSelectMaster',
        listItemType: sap.ui.Device.system.phone ? 'Active' : 'Inactive'
      });
      oDeviceModel.setDefaultBindingMode('OneWay');
      this.setModel(oDeviceModel, 'device');

      // call the init function of the parent
      UIComponent.prototype.init.apply(this, arguments);

      // create the views based on the url/hash
      var oRouter = this.getRouter();
      oRouter.initialize();
      oRouter.attachRouteMatched(this.onRouteMatched, this);
      oRouter.attachBypassed(function() {
        setTimeout(function() {
          oRouter.navTo('home');
        }, 2000);
      });
    },

    onRouteMatched: function(oEvent) {
      jQuery.sap.log.info('Component:onRouteMatched');

      var oParameters = oEvent.getParameters();
      if (oParameters.name !== 'login') {
        jQuery.sap.log.info(
          'Component:onRouteMatched: matched - ' + oParameters.name
        );

        if (!this.isLogged()) {
          jQuery.sap.log.info(
            'Component:onRouteMatched: navigating to login'
          );

          this.getRouter().getTargets().display('login', {
            fromTarget: oParameters.name
          });
        }
      }
    },

    setIsLogged: function(isLogged) {
      jQuery.sap.log.info('Component:setIsLogged');

      var oUserModel = this.getModel('loginInfo');
      oUserModel.setProperty('/logged', isLogged);

      if (!isLogged) {
        this.resetLoginInfoModel();
      }
    },

    resetLoginInfoModel: function() {
      jQuery.sap.log.info('Component:resetLoginInfoModel');

      var oModel = this.getModel('loginInfo');
      oModel.setData({
        user: {
          isAdmin: 'false',
          isGSC: 'false',
          isReporting: 'false'
        },
        logged: false
      });
    },

    isLogged: function() {
      jQuery.sap.log.info('Component:isLogged');

      var oModel = this.getModel('loginInfo');
      var bLogged = oModel.getProperty('/logged');

      if (bLogged === true) {
        return true;
      } else {
        return false;
      }
    },

    isAdmin: function() {
      jQuery.sap.log.info('Component:isAdmin');

      var oModel = this.getModel('loginInfo');
      var bLogged = oModel.getProperty('/logged');
      var sIsAdmin = oModel.getProperty('/user/isAdmin');

      if (bLogged === true && sIsAdmin === 'true') {
        return true;
      } else {
        return false;
      }
    },

    isGSC: function(logged, user) {
      jQuery.sap.log.info('Component:isGSC');

      var oModel = this.getModel('loginInfo');
      var bLogged = oModel.getProperty('/logged');
      var sIsAdmin = oModel.getProperty('/user/isAdmin');
      var sIsGSC = oModel.getProperty('/user/isGSC');

      if (bLogged === true && (sIsAdmin === 'true' || sIsGSC === 'true')) {
        return true;
      } else {
        return false;
      }
    },

    isReporting: function(logged, user) {
      jQuery.sap.log.info('Component:isReporting');

      var oModel = this.getModel('loginInfo');
      var bLogged = oModel.getProperty('/logged');
      var sIsAdmin = oModel.getProperty('/user/isAdmin');
      var sIsReporting = oModel.getProperty('/user/isReporting');

      if (bLogged === true && (sIsAdmin === 'true' || sIsReporting === 'true')) {
        return true;
      } else {
        return false;
      }
    }

  });
});
