import Router from 'koa-router';
import moment from 'moment';
import path from 'path';
import bluebird from 'bluebird';
import fs from 'fs';
import JsReport from 'jsreport-core';
import Config from '../config';
import Redis from '../lib/redis';
import Zabbix from '../lib/zabbix';
import { servicesAsMap } from '../zabbix/services';
import items from '../zabbix/items';
import * as ZK from '../zabbix/keys';
import errorString from '../errorString.js';

const router = new Router();
const config = new Config();

bluebird.promisifyAll(fs);

// External

// External list
router.get('/:id/external', async (ctx) => {
  const lsExtRet = {
    version: config.versionStr
  };

  try {
    const redis = new Redis();
    await redis.login();
    lsExtRet.externals = await redis.getExternalList(ctx.params.id);
    await redis.logout();
  } catch (e) {
    lsExtRet.error = errorString(e);
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
    lsRet.error = errorString(e);
    return lsRet;
  }

  // Retrieve Zabbix info
  try {
    const zabbixUrl = lsRet.external.zabbix;
    const zabbix = new Zabbix();
    await zabbix.login(zabbixUrl);

    const firstDay = moment(Number.parseInt(from, 10));
    const lastDay = moment(Number.parseInt(to, 10));

    // Get services as map, so it can be spread to landscape root and serviceUnits
    const servicesMap = await servicesAsMap(zabbix, firstDay.unix(), lastDay.unix());

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
    lsRet.external.items = await items(zabbix, firstDay.unix(), lastDay.unix());

    // Update sla to serviceUnits
    lsRet.external.items.serviceUnits.forEach((currentValue) => {
      if (currentValue.name && currentValue.name.last) {
        currentValue.sla = servicesMap.get(currentValue.name.last);
      }
    });

    await zabbix.logout();
  } catch (e) {
    lsRet.error = errorString(e);
    return lsRet;
  }

  return lsRet;
}

// External create new
router.get('/:id/external/new', async (ctx) => {
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
router.post('/:id/external/new', async (ctx) => {
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
    lsRet.error = errorString(e);
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
        helpers: 'function dateDisp(date) { return moment(date).format("YYYY/MM/DD HH:mm:ss"); };' +
          'function periodDisp(from, to) { return moment(from).format("YYYY/MM/DD") +' +
          ' " - " + moment(to).format("YYYY/MM/DD"); };' +
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
    throw errorString(e);
  }
}

async function generateExternalXlsx(ctx, external) {
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

    jsReport.use(require('jsreport-html-to-xlsx')());
    jsReport.use(require('jsreport-jsrender')());

    await jsReport.init();
    const out = await jsReport.render({
      template: {
        content: templateStr,
        engine: 'jsrender',
        recipe: 'html-to-xlsx',
        helpers: 'function dateDisp(date) { return moment(date).format("YYYY/MM/DD HH:mm:ss"); };' +
          'function periodDisp(from, to) { return moment(from).format("YYYY/MM/DD") +' +
          ' " - " + moment(to).format("YYYY/MM/DD"); };' +
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
    throw errorString(e);
  }
}

// External retrieve new as pdf
router.get('/:id/external/new/:fileName.pdf', async (ctx) => {
  /*
  const ret = {
    version: config.versionStr
  };
  */

  // Check for parameters
  if (ctx.query.date === undefined ||
    ctx.query.from === undefined ||
    ctx.query.to === undefined) {
    /*
    ret.error = 'Wrong input';
    ctx.body = ret;
    */
    ctx.body = 'Wrong input';
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
    /*
    ret.error = errorString(e);
    ctx.body = ret;
    */
    ctx.body = errorString(e);
    return;
  }
});

// External retrieve new as pdf
router.get('/:id/external/new/:fileName.xlsx', async (ctx) => {
  /*
  const ret = {
    version: config.versionStr
  };
  */

  // Check for parameters
  if (ctx.query.date === undefined ||
    ctx.query.from === undefined ||
    ctx.query.to === undefined) {
    /*
    ret.error = 'Wrong input';
    ctx.body = ret;
    */
    ctx.body = 'Wrong input';
    return;
  }

  try {
    const external = await landscapeExternalNew(
      ctx.params.id,
      ctx.query.date,
      ctx.query.from,
      ctx.query.to
    );
    await generateExternalXlsx(ctx, external);
  } catch (e) {
    /*
    ret.error = errorString(e);
    ctx.body = ret;
    */
    ctx.body = errorString(e);
    return;
  }
});

// External retrieve saved as pdf
router.get('/:id/external/:reportId/:fileName.pdf', async (ctx) => {
  /*
  const lsRet = {
    version: config.versionStr
  };
  */
  try {
    const redis = new Redis();
    await redis.login();
    const external = await redis.getExternal(ctx.params.id, ctx.params.reportId);
    await redis.logout();

    const externalObj = JSON.parse(external);
    await generateExternalPdf(ctx, externalObj);
  } catch (e) {
    /*
    ret.error = errorString(e);
    ctx.body = ret;
    */
    ctx.body = errorString(e);
    return;
  }
});

router.get('/:id/external/:reportId/:fileName.xlsx', async (ctx) => {
  /*
  const lsRet = {
    version: config.versionStr
  };
  */
  try {
    const redis = new Redis();
    await redis.login();
    const external = await redis.getExternal(ctx.params.id, ctx.params.reportId);
    await redis.logout();

    const externalObj = JSON.parse(external);
    await generateExternalXlsx(ctx, externalObj);
  } catch (e) {
    /*
    ret.error = errorString(e);
    ctx.body = ret;
    */
    ctx.body = errorString(e);
    return;
  }
});

// External get report by id
router.get('/:id/external/:reportId', async (ctx) => {
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
    lsRet.error = errorString(e);
    ctx.body = lsRet;
    return;
  }

  ctx.body = lsRet;
});

// path /Landscape/:id/external/:reportId
router.del('/:id/external/:reportId', async (ctx) => {
  const lsRet = {
    version: config.versionStr
  };

  try {
    const redis = new Redis();
    await redis.login();
    lsRet.deleted = await redis.deleteExternal(ctx.params.id, ctx.params.reportId);
    await redis.logout();
  } catch (e) {
    lsRet.error = errorString(e);
    ctx.body = lsRet;
    return;
  }

  ctx.body = lsRet;
});

export default router;
