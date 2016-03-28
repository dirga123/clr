import Router from 'koa-router';
import moment from 'moment';
import Config from '../config';
import Redis from '../lib/redis';
import Zabbix from '../lib/zabbix';
import { servicesAsMap } from '../zabbix/services';
import items from '../zabbix/items';
import triggers from '../zabbix/triggers';
import * as ZK from '../zabbix/keys';
import errorString from '../errorString.js';

const router = new Router();
const config = new Config();

// path /landscape/:id
router.get('/:id', async (ctx) => {
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

  try {
    const redis = new Redis();
    await redis.login();

    // Retrieve DB info
    lsRet.landscape = await redis.getLandscape(ctx.params.id);

    await redis.logout();
  } catch (e) {
    lsRet.error = errorString(e);
    ctx.body = lsRet;
    return;
  }

  // Retrieve Zabbix info
  try {
    const zabbixUrl = lsRet.landscape.zabbix;
    const zabbix = new Zabbix();
    await zabbix.login(zabbixUrl);

    const firstDay = moment(Number.parseInt(ctx.query.from, 10));
    const lastDay = moment(Number.parseInt(ctx.query.to, 10));

    // Get services as map, so it can be spread to landscape root and serviceUnits
    const servicesMap = await servicesAsMap(zabbix, firstDay.unix(), lastDay.unix());

    // Create services array (will hold just 2 values)
    lsRet.landscape.services = [];

    lsRet.landscape.services.push({
      name: ZK.SLA_PRODUCTIVE,
      ...servicesMap.get(ZK.SLA_PRODUCTIVE)
    });
    lsRet.landscape.services.push({
      name: ZK.SLA_NONPRODUCTIVE,
      ...servicesMap.get(ZK.SLA_NONPRODUCTIVE)
    });

    // lsRet.landscape.hosts = await hosts();

    // Retrieve all relevant items
    lsRet.landscape.items = await items(zabbix, firstDay.unix(), lastDay.unix());

    // Update sla to serviceUnits
    lsRet.landscape.items.serviceUnits.forEach((currentValue) => {
      if (currentValue.name && currentValue.name.last) {
        currentValue.sla = servicesMap.get(currentValue.name.last);
      }
    });

    await zabbix.logout();
  } catch (e) {
    lsRet.error = errorString(e);
    ctx.body = lsRet;
    return;
  }

  ctx.body = lsRet;
});

// /landscape add
router.post('/', async (ctx) => {
  const lsRet = {
    version: config.versionStr
  };

  // Check for parameters
  if (ctx.request.body === undefined ||
    ctx.request.body.project === undefined ||
    ctx.request.body.domain === undefined ||
    ctx.request.body.zabbix === undefined) {
    lsRet.error = 'Wrong input';
    ctx.body = lsRet;
    return;
  }

  try {
    const redis = new Redis();
    await redis.login();

    lsRet.added = await redis.addLandscape(ctx.request.body);

    await redis.logout();
  } catch (e) {
    lsRet.error = errorString(e);
    ctx.body = lsRet;
    return;
  }
  ctx.body = lsRet;
});

// Landscape update
router.put('/:id', async (ctx) => {
  const lsRet = {
    version: config.versionStr
  };

  // Check for parameters
  if (ctx.request.body === undefined ||
    ctx.request.body.project === undefined ||
    ctx.request.body.domain === undefined ||
    ctx.request.body.zabbix === undefined) {
    lsRet.error = 'Wrong input';
    ctx.body = lsRet;
    return;
  }

  try {
    const redis = new Redis();
    await redis.login();

    const lsId = ctx.params.id;
    if (await redis.existsLandscape(lsId) === false) {
      throw `Landscape ${lsId} doesnt exists.`;
    }

    lsRet.updated = await redis.updateLandscape(lsId, ctx.request.body);

    await redis.logout();
  } catch (e) {
    lsRet.error = errorString(e);
    ctx.body = lsRet;
    return;
  }
  ctx.body = lsRet;
});

// path /landscape/:id
router.del('/:id', async (ctx) => {
  const lsRet = {
    version: config.versionStr
  };

  try {
    const redis = new Redis();
    await redis.login();
    lsRet.deleted = await redis.deleteLandscape(ctx.params.id);
    await redis.logout();
  } catch (e) {
    lsRet.error = errorString(e);
    ctx.body = lsRet;
    return;
  }

  ctx.body = lsRet;
});

// path /landscape/:id/general
router.get('/:id/general', async (ctx) => {
  const lsRet = {
    version: config.versionStr
  };

  try {
    const redis = new Redis();
    await redis.login();

    // Retrieve DB info
    lsRet.landscape = await redis.getLandscape(ctx.params.id);

    await redis.logout();
  } catch (e) {
    lsRet.error = errorString(e);
    ctx.body = lsRet;
    return;
  }

  ctx.body = lsRet;
});

// path /landscape/:id/status
router.get('/:id/status', async (ctx) => {
  const lsRet = {
    version: config.versionStr
  };

  try {
    const redis = new Redis();
    await redis.login();

    // Retrieve DB info
    lsRet.landscape = await redis.getLandscape(ctx.params.id);

    await redis.logout();
  } catch (e) {
    lsRet.error = errorString(e);
    ctx.body = lsRet;
    return;
  }

  // Retrieve Zabbix info
  try {
    const zabbixUrl = lsRet.landscape.zabbix;
    const zabbix = new Zabbix();
    await zabbix.login(zabbixUrl);

    const triggersArr = await triggers(zabbix);
    lsRet.triggers = triggersArr;

    await zabbix.logout();
  } catch (e) {
    lsRet.error = errorString(e);
    ctx.body = lsRet;
    return;
  }

  ctx.body = lsRet;
});

export default router;
