import debug from 'debug';
import Zabbix from '../lib/zabbix';
import * as ZK from './keys';
/*
import bluebird from 'bluebird';
const fs = bluebird.promisifyAll(require('fs'));
*/

async function items(fromDate, toDate) {
  debug('zabbix')(`items(${fromDate}, ${toDate})`);

  const zabbix = new Zabbix();

  const itemsRet = await zabbix.call('item.get', {
    // selectHosts: 'extend',
    // output: 'extend',
    output: [
      'itemid',
      'key_',
      'value_type',
      'lastvalue'
    ],
    monitored: true
  });

  /*
  const itemsKeySet = itemsRet.result.reduce((previousValue, currentValue) => {
    if (!previousValue.has(`${currentValue.name} : ${currentValue.key_}`)) {
      previousValue.add(`${currentValue.name} : ${currentValue.key_}`);
    }
    return previousValue;
  }, new Set());

  await fs.writeFileAsync('ItemsKeys.json', JSON.stringify(itemsKeySet));
  */

  const itemIdObj = {
    customers: new Map(),
    serviceUnits: new Map()
  };

  const objectFromItem = (prop, item) => {
    if (itemIdObj.hasOwnProperty(prop)) {
      debug('zabbix')(`items: duplicate item for customer: ${prop}, ${item.itemid}`);
    }
    itemIdObj[prop] = item.itemid;
  };

  const objectFromItemWithId = (prop1, prop, item, thisid) => {
    if (itemIdObj[prop1].has(thisid) === false) {
      itemIdObj[prop1].set(thisid, {});
    }

    const prop1Val = itemIdObj[prop1].get(thisid);
    if (prop1Val.hasOwnProperty(prop)) {
      debug('zabbix')(`items: duplicate item for ${prop1}: ${thisid}, ${prop}, ${item.itemid}`);
    }
    prop1Val[prop] = item.itemid;
  };

  const customerFromItemWithId = (prop, item, thisid) => {
    objectFromItemWithId('customers', prop, item, thisid);
  };

  const suFromItemWithId = (prop, item, thisid) => {
    objectFromItemWithId('serviceUnits', prop, item, thisid);
  };

  const itemIdArray = itemsRet.result.reduce((arr, item) => {
    switch (item.key_) {
    case (item.key_.startsWith(ZK.CUST_COUNT) ? item.key_ : undefined):
      arr.push(item);
      objectFromItem('customerCount', item);
      break;
    case (item.key_.startsWith(ZK.CUST_USERS) ? item.key_ : undefined):
      arr.push(item);
      const usersParams = /\[.*?]/.exec(item.key_)[0].slice(1, -1).split(',');
      if (usersParams.length === 1) {
        customerFromItemWithId('users', item, usersParams[0]);
      } else if (usersParams.length === 2) {
        customerFromItemWithId('usersRDS', item, usersParams[0]);
      }
      break;
    case (item.key_.startsWith(ZK.CUST_TENANTS) ? item.key_ : undefined):
      arr.push(item);
      const custTenantsParams = /\[.*?]/.exec(item.key_)[0].slice(1, -1).split(',');
      if (custTenantsParams.length === 1) {
        customerFromItemWithId('tenants', item, custTenantsParams[0].slice(1, -1));
      } else if (custTenantsParams.length === 2) {
        const type = custTenantsParams[1].trim().slice(1, -1);
        switch (type) {
        case ZK.TENANTS_TRIAL:
          customerFromItemWithId('tenantsTrial', item, custTenantsParams[0]);
          break;
        case ZK.TENANTS_DEMO:
          customerFromItemWithId('tenantsDemo', item, custTenantsParams[0]);
          break;
        case ZK.TENANTS_TESTING:
          customerFromItemWithId('tenantsTesting', item, custTenantsParams[0]);
          break;
        case ZK.TENANTS_PRODUCTIVE:
          customerFromItemWithId('tenantsProductive', item, custTenantsParams[0]);
          break;
        default:
          break;
        }
      }
      break;
      /*
    case (item.key_.startsWith(ZK.HANA) ? item.key_ : undefined):
      arr.push(item.itemid);
      const hanaParams = /\[.*?]/.exec(item.key_)[0].slice(1, -1).split(',');
      if (hanaParams.length === 3) {
        const type = hanaParams[1].trim();
        if (type === ZK.HANA_VERSION) {
          retObject.suHanaVersions.push(objectFromItemWithId(item, hanaParams[2]));
        }
      }
      break;
      */
    case (item.key_.startsWith(ZK.SU_NAME) ? item.key_ : undefined):
      arr.push(item);
      const suNameParams = /\[.*?]/.exec(item.key_)[0].slice(1, -1).split(',');
      if (suNameParams.length === 1) {
        suFromItemWithId('name', item, suNameParams[0]);
      }
      break;
    case (item.key_.startsWith(ZK.SU_VERSION) ? item.key_ : undefined):
      arr.push(item);
      const suVersionParams = /\[.*?]/.exec(item.key_)[0].slice(1, -1).split(',');
      if (suVersionParams.length === 1) {
        suFromItemWithId('version', item, suVersionParams[0]);
      }
      break;
    case (item.key_.startsWith(ZK.SU_PURPOSE) ? item.key_ : undefined):
      arr.push(item);
      const suPurposeParams = /\[.*?]/.exec(item.key_)[0].slice(1, -1).split(',');
      if (suPurposeParams.length === 1) {
        suFromItemWithId('purpose', item, suPurposeParams[0]);
      }
      break;
    case (item.key_.startsWith(ZK.SU_COMP_DB) ? item.key_ : undefined):
      const suCompDBParams = /\[.*?]/.exec(item.key_)[0].slice(1, -1).split(',');
      if (suCompDBParams.length === 2) {
        const type = suCompDBParams[1].trim().slice(1, -1);
        switch (type) {
        case ZK.SU_COMP_DB_SERVER_VERSION:
          arr.push(item);
          suFromItemWithId('hanaVersion', item, suCompDBParams[0]);
          break;
        default:
          break;
        }
      }
      break;
    case (item.key_.startsWith(ZK.SU_TENANTS) ? item.key_ : undefined):
      arr.push(item);
      const suTenantsParams = /\[.*?]/.exec(item.key_)[0].slice(1, -1).split(',');
      if (suTenantsParams.length === 2) {
        const type = suTenantsParams[1].trim().slice(1, -1);
        switch (type) {
        case ZK.TENANTS_TRIAL:
          suFromItemWithId('tenantsTrial', item, suTenantsParams[0]);
          break;
        case ZK.TENANTS_DEMO:
          suFromItemWithId('tenantsDemo', item, suTenantsParams[0]);
          break;
        case ZK.TENANTS_TESTING:
          suFromItemWithId('tenantsTesting', item, suTenantsParams[0]);
          break;
        case ZK.TENANTS_PRODUCTIVE:
          suFromItemWithId('tenantsProductive', item, suTenantsParams[0]);
          break;
        default:
          break;
        }
      }
      break;
    case (item.key_.startsWith(ZK.SU_COUNT) ? item.key_ : undefined):
      arr.push(item);
      objectFromItem('serviceUnitCount', item);
      break;
    default:
      break;
    }
    return arr;
  }, new Array());

  const itemIdToTypeMap = itemIdArray.reduce((prevVal, currVal) => {
    prevVal.set(currVal.itemid, currVal.value_type);
    return prevVal;
  }, new Map());

  const promises = itemIdArray.map((item) => zabbix.call('history.get', {
    /* zabbix bug, https://support.zabbix.com/browse/ZBX-9227
    output: [
      'itemid',
      'value'
    ],
    */
    output: 'extend',
    history: item.value_type,
    itemids: item.itemid,
    time_from: fromDate,
    time_till: toDate
  }));

  const historyArray = await Promise.all(promises);

  const resultMap = historyArray.reduce((map, history) => {
    if (history.result && history.result.length > 0) {
      const id = history.result[0].itemid;
      const type = itemIdToTypeMap.get(id);

      let firstValue = history.result[0].value;
      if (type === '0') {
        firstValue = Number.parseInt(firstValue, 10);
      } else if (type === '3') {
        firstValue = Number.parseFloat(firstValue);
      }
      let lastValue = history.result[history.result.length - 1].value;
      if (type === '0') {
        lastValue = Number.parseInt(lastValue, 10);
      } else if (type === '3') {
        lastValue = Number.parseFloat(lastValue);
      }

      const calcValues = {
        first: firstValue,
        last: lastValue
      };

      if (type === '0' || type === '3') {
        let minValue = firstValue;
        let maxValue = firstValue;
        let avgValue = 0;
        let sumValue = 0;

        history.result.forEach((h) => {
          let val = 0;
          if (type === '0') {
            val = Number.parseInt(h.value, 10);
          } else if (type === '3') {
            val = Number.parseFloat(h.value);
          }
          if (val < minValue) {
            minValue = val;
          }
          if (val > maxValue) {
            maxValue = val;
          }
          sumValue += val;
        });

        avgValue = sumValue / history.result.length;

        calcValues.min = minValue;
        calcValues.max = maxValue;
        calcValues.avg = avgValue;
      }

      map.set(id, calcValues);
    }

    return map;
  }, new Map());

  // return object
  const retObject = {};

  /*
  for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
          obj[prop] = 'xxx';
      }
  }
  */

  // transform itemIdObj into retObject, swap itemids with actual values
  Object.keys(itemIdObj).forEach((prop) => {
    if (Object.prototype.toString.call(itemIdObj[prop]) === '[object Map]') {
      // Property with id and sub properties
      const result = [];

      itemIdObj[prop].forEach((subObj, objKey) => {
        const resultObj = {
          id: objKey
        };

        Object.keys(subObj).forEach((subProp) => {
          const itemid = subObj[subProp];
          const partialResult = resultMap.get(itemid);
          resultObj[subProp] = partialResult;
        });

        result.push(resultObj);
      });

      retObject[prop] = result;
    } else {
      // Simple property
      const itemid = itemIdObj[prop];
      const result = resultMap.get(itemid);
      retObject[prop] = result;
    }
  });

  // await fs.writeFileAsync('Landscape.json', JSON.stringify(retObject));

  return retObject;
}

export default items;
