sap.ui.define([
	'sap/ui/model/SimpleType'
], function (SimpleType) {
	'use strict';
  
  sap.ui.model.SimpleType.extend('sap.clr.model.LandscapeId', {
    formatValue: function(oValue) {
      console.log('formatValue');

      var re = /^([0-1]\d):([0-5]\d)\s?(?:AM|PM)?$/i;
      if (oValue != null) {
        if(re.test(oValue)) {
          // this.setEditable(false);    //ERROR
          //this.setValueState(sap.ui.core.ValueState.Success);   //ERROR
          alert("Success");
        }
      }

      return oValue;
    },

    parseValue: function(oValue) {
      console.log('formatValue');
      return oValue;
    },

    validateValue: function(oValue) {
      console.log('formatValue');
    }
  });
});
