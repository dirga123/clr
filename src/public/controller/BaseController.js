sap.ui.define([
  'sap/ui/core/mvc/Controller',
  'sap/ui/core/routing/History',
  'sap/ui/core/Component',
  'sap/m/MessageToast'
], function (Controller, History, Component, MessageToast) {
  'use strict';

  return Controller.extend('sap.clr.controller.BaseController', {

    getComponent: function() {
      return Component.getOwnerComponentFor(this.getView());
    },

		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
    getRouter: function() {
      return this.getOwnerComponent().getRouter();
      // return sap.ui.core.UIComponent.getRouterFor(this);
    },

		/**
		 * Convenience method for getting the view model
		 // by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
    getModel: function(sName) {
      return this.getView().getModel(sName);
    },

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
    setModel: function(oModel, sName) {
      return this.getView().setModel(oModel, sName);
    },

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
    getResourceBundle: function() {
      return this.getOwnerComponent().getModel('i18n').getResourceBundle();
    },

		/**
		 * Event handler  for navigating back.
		 * It checks if there is a history entry. If yes, history.go(-1) will happen.
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 * @param {object} oEvent the model name
		 */
    onNavBack: function(oEvent) {
      var oHistory = History.getInstance();
      var sPreviousHash = oHistory.getPreviousHash();

      if (sPreviousHash !== undefined) {
        // The history contains a previous entry
        window.history.go(-1);
      } else {
        // Otherwise we go backwards with a forward history
        var bReplace = true;
        this.getRouter().navTo('home', {}, bReplace);
      }
    },

    setCurrentDateAndPeriod: function() {
      var oModel = this.getModel();

      var oDate = new Date();
      var firstDay = new Date(oDate.getFullYear(), oDate.getMonth(), 1);

      oModel.setProperty('/date', oDate);
      oModel.setProperty('/from', firstDay);
      oModel.setProperty('/to', oDate);
    },

    padNumber: function(num) {
      return (num < 10 ? '0' : '') + num;
    },

    getRoutePath: function() {
      return this.getModel().getProperty('/route');
    },

    navigateHomeIfNotLoggedAsAdmin: function() {
      var oComponent = this.getComponent();
      if (!oComponent.isLogged()) {
        this.getRouter().navTo('login');
        return true;
      }
      if (!oComponent.isAdmin()) {
        this.getRouter().navTo('home');
        return true;
      }
      return false;
    },

    navigateHomeIfNotLoggedAsGSC: function() {
      var oComponent = this.getComponent();
      if (!oComponent.isLogged()) {
        this.getRouter().navTo('login');
        return true;
      }
      if (!oComponent.isGSC()) {
        this.getRouter().navTo('home');
        return true;
      }
      return false;
    },

    navigateToLoginAfter401: function(statusCode) {
      if (statusCode === 401) {
        this.getComponent().setIsLogged(false);

        setTimeout(jQuery.proxy(function() {
          this.getRouter().getTargets().display('login', {
            fromTarget: this.getRoutePath()
          });
        }, this), 2000);
      }
    },

    checkForErrorWithNavigate: function(oModel, oEvent) {
      if (oEvent.getParameter('success')) {
        var sError = oModel.getProperty('/error');
        if (sError) {
          MessageToast.show(sError);
        }
      } else {
        var oError = oEvent.getParameter('errorobject');

        var sGeneralError = this.getResourceBundle().getText('generalError', [
          oError.statusCode,
          oError.statusText,
          oError.responseText
        ]);

        MessageToast.show(sGeneralError);

        this.navigateToLoginAfter401(oError.statusCode);
      }
    },

    attachDisplayForRoute: function(callback) {
      jQuery.sap.log.info('BaseController.controller:attachDisplayForRoute');

      var oRouter = this.getRouter();
      var oTarget = oRouter.getTarget(this.getRoutePath());

      oTarget.attachDisplay(
        function (oEvent) {
          jQuery.sap.log.info('BaseController.controller:_onAttachDisplay');
          var oData = oEvent.getParameter('data');
          if (oData && oData.fromTarget && oData.fromTarget === 'login') {
            setTimeout(jQuery.proxy(callback, this));
          }
        }, this
      );
    },

    attachPatternMatched: function(callback) {
      jQuery.sap.log.info('BaseController.controller:attachPatternMatched');

      this.getRouter().getRoute(this.getRoutePath()).attachPatternMatched(
        callback, this
      );
    },

    ajaxError: function(resourceText, resp, textStatus, errorThrown) {
      jQuery.sap.log.info('BaseController.controller:ajaxError');

      this.getView().setBusy(false);
      var sMsg = this.getResourceBundle().getText(resourceText, [ errorThrown ]);
      MessageToast.show(sMsg);

      this.navigateToLoginAfter401(resp.status);
    },

    ajaxSuccess: function(callback, resp) {
      jQuery.sap.log.info('BaseController.controller:ajaxSuccess');

      this.getView().setBusy(false);

      if (resp.error) {
        MessageToast.show(resp.error);
        return;
      }

      if (callback !== undefined && typeof callback === 'function') {
        setTimeout(jQuery.proxy(callback, this));
      }
    }

  });
});
