sap.ui.define([], function () {
  'use strict';

  return {

    secondsToString: function(val) {
      var seconds = Math.floor(val);
      var days = Math.floor(seconds / 86400);
      seconds -= days * 86400;
      var hours = Math.floor(seconds / 3600);
      seconds -= hours * 3600;
      var minutes = Math.floor(seconds / 60);
      seconds -= minutes * 60;

      return days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's';
    },

    statusToState: function(status) {
      switch (status) {
      case '0':
        return 'Success';
      case '1':
        return 'Warning';
      case '2':
        return 'Error';
      default:
        return 'None';
      }
    },

    statusToText: function(status) {
      switch (status) {
      case '0':
        return 'OK';
      case '1':
        return 'To be checked';
      case '2':
        return 'Failed';
      default:
        return 'N/A';
      }
    },

    slaToText: function(sla) {
      var text = '';
      if (sla !== undefined) {
        text = parseFloat(sla).toFixed(4);
      }
      return text;
    },

    slaBothToText: function(currSla, goodSla) {
      var text = '';
      if (currSla !== undefined) {
        text = parseFloat(currSla).toFixed(4);
      }
      if (goodSla !== undefined) {
        text += ' of ' + parseFloat(goodSla).toFixed(4);
      }
      return text;
    },

    avgToText: function(avg) {
      if (avg === undefined) {
        return 0;
      }
      return parseFloat(avg).toFixed(4);
    },

    isAdmin: function(logged, user) {
      if (logged === true && user !== undefined && user.isAdmin === 'true') {
        return true;
      } else {
        return false;
      }
    },

    isGSC: function(logged, user) {
      if (logged === true && user !== undefined &&
        (user.isGSC === 'true' || user.isAdmin === 'true')) {
        return true;
      } else {
        return false;
      }
    },

    isReporting: function(logged, user) {
      if (logged === true && user !== undefined &&
        (user.isReporting === 'true' || user.isAdmin === 'true')) {
        return true;
      } else {
        return false;
      }
    },

    isGSCOrReporting: function(logged, user) {
      if (logged === true && user !== undefined &&
        (user.isGSC === 'true' || user.isReporting === 'true' || user.isAdmin === 'true')) {
        return true;
      } else {
        return false;
      }
    },

    padNumber: function(num) {
      return (num < 10 ? '0' : '') + num;
    },

    timestampToString: function(timestamp) {
      if (timestamp === undefined) {
        return '';
      }

      var date = new Date();
      date.setTime(timestamp);
      return date.getFullYear() + '/' +
        this.padNumber(date.getMonth() + 1) + '/' +
        this.padNumber(date.getDate()) + ' ' +
        this.padNumber(date.getHours()) + ':' +
        this.padNumber(date.getMinutes()) + ':' +
        this.padNumber(date.getSeconds());
    }

  };
});
