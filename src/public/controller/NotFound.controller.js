sap.ui.define([
  'sap/clr/controller/BaseController',
  'sap/ui/model/json/JSONModel'
], function (BaseController, JSONModel) {
  'use strict';

  return BaseController.extend('sap.clr.controller.NotFound', {
    onInit: function() {
      this.setModel(new JSONModel({
        route: 'notfound'
      }));
    }
  });
});
