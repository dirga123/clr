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
        var oUserModel = new JSONModel({
          user: {
            id: null
          },
          logged: false
        });
        oUserModel.setDefaultBindingMode("OneWay");
        this.setModel(oUserModel, "user");

        // Set device model
        var oDeviceModel = new sap.ui.model.json.JSONModel({
          isTouch: sap.ui.Device.support.touch,
          isNoTouch: !sap.ui.Device.support.touch,
          isPhone: sap.ui.Device.system.phone,
          isNoPhone: !sap.ui.Device.system.phone,
          listMode: sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",
          listItemType: sap.ui.Device.system.phone ? "Active" : "Inactive"
        });
        oDeviceModel.setDefaultBindingMode("OneWay");
        this.setModel(oDeviceModel, "device");

        // call the init function of the parent
        UIComponent.prototype.init.apply(this, arguments);

        // create the views based on the url/hash
        this.getRouter().initialize();
        this.getRouter().attachRouteMatched(this.onRouteMatched, this);
      },

      getEventBus: function() {
        return sap.ui.getCore().getEventBus();
      },

      onRouteMatched: function(oEvent) {
        /*
        var oParameters = oEvent.getParameters();
        if (oParameters.name != "login") {
          var oUserModel = this.getModel("user");
          if (oUserModel.getProperty('/logged') !== true) {
          this.getRouter().getTargets().display("login", {
          fromTarget: oParameters.name
          });
          }
        }
        */
      }
    });
  }
);
