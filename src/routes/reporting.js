import Router from 'koa-router';
import moment from 'moment';
import Config from '../config';
import Redis from '../lib/redis';
import Zabbix from '../lib/zabbix';
import { servicesAsMap } from '../zabbix/services';
import triggers from '../zabbix/triggers';
import * as ZK from '../zabbix/keys';
import errorString from '../errorString.js';

const router = new Router();
const config = new Config();

router.get('/:id', async ctx => {
  const ret = {
    version: config.versionStr
  };

  // Check for parameters
  if (ctx.query.date === undefined ||
    ctx.query.from === undefined ||
    ctx.query.to === undefined) {
    ret.error = 'Wrong input';
    ctx.body = ret;
    return;
  }

  let landscape = null;

  try {
    const redis = new Redis();
    await redis.login();
    landscape = await redis.getLandscape(ctx.params.id);
    await redis.logout();
  } catch (e) {
    ret.error = errorString(e);
    ctx.body = ret;
    return;
  }

  // Retrieve Zabbix info
  const firstDay = moment(Number.parseInt(ctx.query.from, 10));
  const lastDay = moment(Number.parseInt(ctx.query.to, 10));

  try {
    const zabbixUrl = landscape.zabbix;
    const zabbix = new Zabbix();
    await zabbix.login(zabbixUrl);

    // Get services as map, so it can be spread to landscape root and serviceUnits
    const servicesMap = await servicesAsMap(zabbix, firstDay.unix(), lastDay.unix());

    // Create services array (will hold just 2 values)
    const productive = servicesMap.get(ZK.SLA_PRODUCTIVE);
    ret.currSla = productive.currSla;
    ret.goodSla = productive.goodSla;

    const triggersArr = await triggers(zabbix);
    ret.triggersCount = triggersArr.length;
    ret.triggersPriority = triggersArr.reduce((prevVal, currVal) => {
      if (currVal.priority > prevVal) {
        prevVal = currVal.priority;
      }

      return prevVal;
    }, Number(0));

    await zabbix.logout();
  } catch (e) {
    ret.error = errorString(e);
    ctx.body = ret;
    return;
  }

  ctx.body = ret;
});

export default router;
