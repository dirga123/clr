import Router from 'koa-router';

// import moment from 'moment';

import Config from '../config';
import Redis from '../lib/redis';
/*
import Zabbix from '../lib/zabbix';
import { servicesAsMap } from '../zabbix/services';
import triggers from '../zabbix/triggers';
import * as ZK from '../zabbix/keys';
*/
import errorString from '../errorString.js';

const router = new Router();
const config = new Config();

// path /gsc
router.get('/', async ctx => {
  const lsRet = {
    version: config.versionStr
  };

  // Check for parameters
  if (ctx.query.date === undefined ||
    ctx.query.from === undefined ||
    ctx.query.to === undefined) {
    lsRet.error = 'Wrong input';
    ctx.body = lsRet;
    return;
  }

  // Retrieve list of landscapes
  try {
    const redis = new Redis();
    await redis.login();
    lsRet.landscapes = await redis.getLandscapes();
    await redis.logout();
  } catch (e) {
    lsRet.error = errorString(e);
    ctx.body = lsRet;
    return;
  }

  // Retrieve Zabbix info
  /*
  const firstDay = moment(Number.parseInt(ctx.query.from, 10));
  const lastDay = moment(Number.parseInt(ctx.query.to, 10));

  for (const ls of lsRet.landscapes) {
    try {
      const zabbixUrl = ls.zabbix;
      const zabbix = new Zabbix();
      await zabbix.login(zabbixUrl);

      // Get services as map, so it can be spread to landscape root and serviceUnits
      const servicesMap = await servicesAsMap(zabbix, firstDay.unix(), lastDay.unix());

      // Create services array (will hold just 2 values)
      const productive = servicesMap.get(ZK.SLA_PRODUCTIVE);
      ls.currSla = productive.currSla;
      ls.goodSla = productive.goodSla;

      const triggersArr = await triggers(zabbix);
      ls.triggersCount = triggersArr.length;
      ls.triggersPriority = triggersArr.reduce((prevVal, currVal) => {
        if (currVal.priority > prevVal) {
          prevVal = currVal.priority;
        }
        return prevVal;
      }, Number(0));

      await zabbix.logout();
    } catch (e) {
      ls.error = errorString(e);
    }
  }
  */

  ctx.body = lsRet;
});

export default router;
