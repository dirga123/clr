import 'babel-polyfill';
import path from 'path';
import moment from 'moment';
import Koa from 'koa';
// import send from 'koa-send';
import logger from 'koa-logger';
import Router from 'koa-router';
import koaStatic from 'koa-static';
import koaMount from 'koa-mount';
import convert from 'koa-convert';
import body from 'koa-parse-json';
import debug from 'debug';
import Config from './config';
import Zabbix from './lib/zabbix';
import hosts from './zabbix/hosts';
import { servicesAsMap } from './zabbix/services';
import triggers from './zabbix/triggers';
import * as ZK from './zabbix/keys';
import items from './zabbix/items';
import Redis from './lib/redis';
import koaQs from 'koa-qs';
import JsReport from 'jsreport-core';
import bluebird from 'bluebird';
import fs from 'fs';

const { NODE_ENV } = process.env;
if (NODE_ENV === 'development') {
  debug.enable('dev,koa');
}

bluebird.promisifyAll(fs);

const config = new Config();
const server = new Koa();
koaQs(server, 'first');

// app.use(compress());
server.use(logger());

server.use(async (ctx, next) => {
  try {
    await next(); // next is now a function
  } catch (err) {
    ctx.body = { message: err.message };
    ctx.status = err.status || 500;
  }
});

// Router
const router = new Router();

function getErrorString(e) {
  if (typeof e === 'object') {
    e.toString();
  }
  return e;
}

// path /Login
router.post('/login', async (ctx) => {
  if (ctx.request.body === null || ctx.request.body.input === null) {
    ctx.body = {
      error: 'Wrong input'
    };
    return;
  }

  try {
    const redis = new Redis();
    await redis.login();

    const pass = await redis.getPassword();

    if (ctx.request.body.input !== pass) {
      ctx.body = {
        error: 'Wrong password'
      };
      return;
    }

    await redis.logout();
  } catch (e) {
    ctx.body = {
      error: getErrorString(e)
    };
    return;
  }

  ctx.body = {
    version: config.versionStr,
    user: {
      id: 'admin',
      name: 'Administrator'
    }
  };
});

// path /Home
router.get('/Home', async ctx => {
  const lsRet = {
    version: config.versionStr
  };

  try {
    const redis = new Redis();
    await redis.login();
    const ls = await redis.getLandscapes();
    lsRet.landscapes = ls.length;
    await redis.logout();
  } catch (e) {
    lsRet.error = getErrorString(e);
    ctx.body = lsRet;
    return;
  }

  ctx.body = lsRet;
});

// path /Landscapes
router.get('/Landscapes', async ctx => {
  const lsRet = {
    version: config.versionStr
  };

  // Retrieve list of landscapes
  try {
    const redis = new Redis();
    await redis.login();
    lsRet.landscapes = await redis.getLandscapes();
    await redis.logout();
  } catch (e) {
    lsRet.error = getErrorString(e);
    ctx.body = lsRet;
    return;
  }

  // Retrieve Zabbix info
  const today = moment();
  const paramDate = Number.parseInt(ctx.query.date, 10) || +moment();

  // Current month till today, cant use end of month explicitly
  // (zabbix bug returns N days backwards - from prev month too)
  let firstDay = moment(paramDate).startOf('month');
  if (today < firstDay) {
    firstDay = today.clone().startOf('month');
  }
  let lastDay = moment(paramDate).endOf('month');
  if (today < lastDay) {
    lastDay = today;
  }

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
      debug('dev')(`Internal error catched ${e}/`);
      ls.error = e;
    }
  }

  ctx.body = lsRet;
});

// path /Hosts
router.get('/Hosts', async ctx => {
  const hostsRet = {
    version: config.versionStr
  };

  if (ctx.request.body === null || ctx.request.body.id === null) {
    hostsRet.error = 'Wrong input';
    ctx.body = hostsRet;
    return;
  }

  try {
    const zabbix = new Zabbix();
    await zabbix.login();

    hostsRet.hosts = await hosts(zabbix);

    await zabbix.logout();
  } catch (e) {
    hostsRet.error = getErrorString(e);
    ctx.body = hostsRet;
    return;
  }

  ctx.body = hostsRet;
});

// path /Landscape/:id
router.get('/Landscape/:id', async (ctx) => {
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
    lsRet.error = getErrorString(e);
    ctx.body = lsRet;
    return;
  }

  // Retrieve Zabbix info
  try {
    const zabbixUrl = lsRet.landscape.zabbix;
    const zabbix = new Zabbix();
    await zabbix.login(zabbixUrl);

    const today = moment();
    const paramDate = Number.parseInt(ctx.query.date, 10) || +moment();

    // Current month till today, cant use end of month explicitly
    // (zabbix bug returns N days backwards - from prev month too)
    let firstDay = moment(paramDate).startOf('month');
    if (today < firstDay) {
      firstDay = today.clone().startOf('month');
    }
    let lastDay = moment(paramDate).endOf('month');
    if (today < lastDay) {
      lastDay = today;
    }

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
    lsRet.error = getErrorString(e);
    ctx.body = lsRet;
    return;
  }

  ctx.body = lsRet;
});

// Landscape add
router.post('/Landscape', async (ctx) => {
  const lsRet = {
    version: config.versionStr
  };

  // Check for parameters
  if (ctx.request.body === undefined ||
    ctx.request.body.id === undefined ||
    ctx.request.body.domain === undefined ||
    ctx.request.body.zabbix === undefined) {
    lsRet.error = 'Wrong input';
    ctx.body = lsRet;
    return;
  }

  try {
    const redis = new Redis();

    await redis.login();

    const lsId = ctx.request.body.id;

    if (await redis.existsLandscape(lsId)) {
      throw `Landscape ${lsId} already exists.`;
    }

    lsRet.added = await redis.addLandscape(ctx.request.body);

    await redis.logout();
  } catch (e) {
    lsRet.error = getErrorString(e);
    ctx.body = lsRet;
    return;
  }
  ctx.body = lsRet;
});

// Landscape add
router.put('/Landscape/:id', async (ctx) => {
  const lsRet = {
    version: config.versionStr
  };

  // Check for parameters
  if (ctx.request.body === undefined ||
    ctx.request.body.id === undefined ||
    ctx.request.body.domain === undefined ||
    ctx.request.body.zabbix === undefined) {
    lsRet.error = 'Wrong input';
    ctx.body = lsRet;
    return;
  }

  try {
    const redis = new Redis();
    await redis.login();

    const lsId = ctx.request.body.id;

    if (await redis.existsLandscape(lsId) === false) {
      throw `Landscape ${lsId} doesnt exists.`;
    }

    lsRet.updated = await redis.updateLandscape(ctx.request.body);

    await redis.logout();
  } catch (e) {
    lsRet.error = getErrorString(e);
    ctx.body = lsRet;
    return;
  }
  ctx.body = lsRet;
});

// path /Landscape/:id
router.del('/Landscape/:id', async (ctx) => {
  const lsRet = {
    version: config.versionStr
  };

  try {
    const redis = new Redis();
    await redis.login();
    lsRet.deleted = await redis.deleteLandscape(ctx.params.id);
    await redis.logout();
  } catch (e) {
    lsRet.error = getErrorString(e);
    ctx.body = lsRet;
    return;
  }

  ctx.body = lsRet;
});

// path /Landscape/:id/general
router.get('/Landscape/:id/general', async (ctx) => {
  const lsRet = {
    version: config.versionStr
  };

  const redis = new Redis();

  try {
    await redis.login();

    // Retrieve DB info
    lsRet.landscape = await redis.getLandscape(ctx.params.id);

    await redis.logout();
  } catch (e) {
    lsRet.error = getErrorString(e);
    ctx.body = lsRet;
    return;
  }
  ctx.body = lsRet;
});

router.get('/Landscape/:id/status', async (ctx) => {
  const lsRet = {
    version: config.versionStr,
    error: 'Status: Not implemented'
  };
  // await new Promise(r => setTimeout(r, 2000));
  ctx.body = lsRet;
});

router.get('/Landscape/:id/internal', async (ctx) => {
  const lsRet = {
    version: config.versionStr,
    error: 'Internal report list: Not implemented'
  };
  // await new Promise(r => setTimeout(r, 2000));
  ctx.body = lsRet;
});

// External

// External list
router.get('/Landscape/:id/external', async (ctx) => {
  const lsExtRet = {
    version: config.versionStr
  };

  try {
    const redis = new Redis();
    await redis.login();
    lsExtRet.externals = await redis.getExternalList(ctx.params.id);
    await redis.logout();
  } catch (e) {
    lsExtRet.error = getErrorString(e);
    ctx.body = lsExtRet;
    return;
  }

  ctx.body = lsExtRet;
});

// External get new
// path /Landscape/:id/external/new

async function landscapeExternalNew(id, date, from, to) {
  const lsRet = {
    version: config.versionStr
  };

  // Retrieve DB info
  try {
    const redis = new Redis();
    await redis.login();
    lsRet.external = await redis.getLandscape(id);
    await redis.logout();
  } catch (e) {
    lsRet.error = getErrorString(e);
    return lsRet;
  }

  // Retrieve Zabbix info
  try {
    const zabbixUrl = lsRet.external.zabbix;
    const zabbix = new Zabbix();
    await zabbix.login(zabbixUrl);

    // Get services as map, so it can be spread to landscape root and serviceUnits
    const servicesMap = await servicesAsMap(zabbix, from, to);

    // Create services array (will hold just 2 values)
    lsRet.external.services = [];

    lsRet.external.services.push({
      name: ZK.SLA_PRODUCTIVE,
      ...servicesMap.get(ZK.SLA_PRODUCTIVE)
    });
    lsRet.external.services.push({
      name: ZK.SLA_NONPRODUCTIVE,
      ...servicesMap.get(ZK.SLA_NONPRODUCTIVE)
    });

    // lsRet.external.hosts = await hosts();

    // Retrieve all relevant items
    lsRet.external.items = await items(zabbix, from, to);

    // Update sla to serviceUnits
    lsRet.external.items.serviceUnits.forEach((currentValue) => {
      if (currentValue.name && currentValue.name.last) {
        currentValue.sla = servicesMap.get(currentValue.name.last);
      }
    });

    await zabbix.logout();
  } catch (e) {
    lsRet.error = getErrorString(e);
    return lsRet;
  }

  return lsRet;
}

// External create new
router.get('/Landscape/:id/external/new', async (ctx) => {
  // Check for parameters
  if (ctx.query.date === undefined ||
    ctx.query.from === undefined ||
    ctx.query.to === undefined) {
    const lsRet = {
      version: config.versionStr
    };
    lsRet.error = 'Wrong input';
    ctx.body = lsRet;
    return;
  }

  ctx.body = await landscapeExternalNew(
    ctx.params.id,
    ctx.query.date,
    ctx.query.from,
    ctx.query.to
  );
});

// External save new
router.post('/Landscape/:id/external/new', async (ctx) => {
  const lsRet = {
    version: config.versionStr
  };

  // Check for parameters
  if (ctx.request.body === undefined ||
    ctx.request.body.external === undefined) {
    lsRet.error = 'Wrong input';
    ctx.body = lsRet;
    return;
  }

  // Retrieve DB info
  try {
    const redis = new Redis();
    await redis.login();

    const lsId = ctx.params.id;
    if ((await redis.existsLandscape(lsId)) === false) {
      throw `Landscape ${lsId} doesnt exists.`;
    }

    lsRet.addedId = await redis.addExternal(lsId, ctx.request.body);

    await redis.logout();
  } catch (e) {
    lsRet.error = getErrorString(e);
    ctx.body = lsRet;
    return;
  }

  ctx.body = lsRet;
});

async function generateExternalPdf(ctx, external) {
  try {
    const templateStr = await fs.readFileAsync(
      path.resolve(__dirname, 'content/External.jsreport'),
      'utf8'
    );

    const jsReport = new JsReport({
      wkhtmltopdf: {
        allowLocalFilesAccess: true
      },
      rootDirectory: __dirname,
      dataDirectory: path.join(__dirname, 'pdf'),
      tempDirectory: path.join(__dirname, 'pdf/temp'),
      tasks: {
        allowedModules: [ 'moment' ]
      }
    });

    jsReport.use(require('jsreport-wkhtmltopdf')());
    jsReport.use(require('jsreport-jsrender')());

    await jsReport.init();
    const out = await jsReport.render({
      template: {
        content: templateStr,
        engine: 'jsrender',
        recipe: 'wkhtmltopdf',
        helpers: 'function dateDisp(date) { return moment(date).format("YYYY-MM-DD"); };' +
          'function periodDisp(date) { return moment(date).format("YYYY-MM"); };' +
          'function slaDisp(sla) { return parseFloat(sla).toFixed(4) };' +
          'function secondsDisp(val) { var s = Math.floor(val); var d = Math.floor(s / 86400);' +
          's -= d * 86400; var h = Math.floor(s / 3600); s -= h * 3600;' +
          'var m = Math.floor(s / 60); s -= m * 60; return d+"d "+h+"h "+m+"m "+s+"s";}'
      },
      data: external
    });

    ctx.body = out.stream;
    ctx.response.set(out.headers);
  } catch (e) {
    throw getErrorString(e);
  }
}

// External retrieve new as pdf
router.get('/Landscape/:id/external/new/:fileName.pdf', async (ctx) => {
  const lsRet = {
    version: config.versionStr
  };

  console.log(ctx.query);
  // Check for parameters
  if (ctx.query.date === undefined ||
    ctx.query.from === undefined ||
    ctx.query.to === undefined) {
    lsRet.error = 'Wrong input';
    ctx.body = lsRet;
    return;
  }

  try {
    const external = await landscapeExternalNew(
      ctx.params.id,
      ctx.query.date,
      ctx.query.from,
      ctx.query.to
    );
    await generateExternalPdf(ctx, external);
  } catch (e) {
    lsRet.error = getErrorString(e);
    ctx.body = lsRet;
    return;
  }
});

// External retrieve saved as pdf
router.get('/Landscape/:id/external/:reportId/:fileName.pdf', async (ctx) => {
  const lsRet = {
    version: config.versionStr
  };

  try {
    const redis = new Redis();
    await redis.login();
    const external = await redis.getExternal(ctx.params.id, ctx.params.reportId);
    await redis.logout();

    const externalObj = JSON.parse(external);
    await generateExternalPdf(ctx, externalObj);
  } catch (e) {
    lsRet.error = getErrorString(e);
    ctx.body = lsRet;
    return;
  }
});

// External get report by id
router.get('/Landscape/:id/external/:reportId', async (ctx) => {
  // await send(ctx, 'External.json', { root: path.resolve(__dirname, 'content') });
  let lsRet = {
    version: config.versionStr
  };

  // Retrieve DB info
  try {
    const redis = new Redis();
    await redis.login();
    // Overwrite version, error, etc.
    lsRet = await redis.getExternal(ctx.params.id, ctx.params.reportId);
    await redis.logout();
  } catch (e) {
    lsRet.error = getErrorString(e);
    ctx.body = lsRet;
    return;
  }

  ctx.body = lsRet;
});

// path /Landscape/:id/external/:reportId
router.del('/Landscape/:id/external/:reportId', async (ctx) => {
  const lsRet = {
    version: config.versionStr
  };

  try {
    const redis = new Redis();
    await redis.login();
    lsRet.deleted = await redis.deleteExternal(ctx.params.id, ctx.params.reportId);
    await redis.logout();
  } catch (e) {
    lsRet.error = getErrorString(e);
    ctx.body = lsRet;
    return;
  }

  ctx.body = lsRet;
});


/*
router.post('/Landscape.json', async (ctx) => {
  await new Promise(r => setTimeout(r, 2000));
  await send(ctx, ctx.path, { root: path.resolve(__dirname, 'content') });
});

router.get('/Hosts.json', async (ctx) => {
  await new Promise(r => setTimeout(r, 2000));
  await send(ctx, ctx.path, { root: path.resolve(__dirname, 'content') });
});
*/

server.use(convert(koaMount('/', koaStatic(path.join(__dirname, 'public')))));

server.use(convert(body()));
server.use(router.routes());
server.use(router.allowedMethods());

server.use(async (ctx, next) => {
  if (ctx.request.url.includes('i18n')
  || ctx.request.url.includes('favicon.ico')
  || ctx.request.url.includes('Component-preload.js')
  || ctx.request.url.includes('.png')) {
    next();
  } else {
    ctx.redirect('/');
  }
});

server.listen(config.port, () => {
  /* eslint-disable no-console */
  console.log(`The server is running at http://${config.host}/`);
});
