import Router from 'koa-router';
import moment from 'moment';
import path from 'path';
import fs from 'fs';
import bluebird from 'bluebird';
import Config from '../config';
import Redis from '../lib/redis';
import Mail from '../lib/mail';
import errorString from '../errorString.js';

const router = new Router();
const config = new Config();

bluebird.promisifyAll(fs);

// path /gsc
router.get('/', async ctx => {
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
    lsRet.error = errorString(e);
    ctx.body = lsRet;
    return;
  }

  ctx.body = lsRet;
});

// path /gsc/:id/status
router.get('/:id/status', async ctx => {
  const ret = {
    version: config.versionStr
  };

  try {
    const redis = new Redis();
    await redis.login();
    ret.exists = await redis.existsGSCAccess(ctx.params.id);
    await redis.logout();
  } catch (e) {
    ret.error = errorString(e);
    ctx.body = ret;
    return;
  }
  ctx.body = ret;
});

// path /gsc/:id
router.get('/:id', async ctx => {
  const ret = {
    version: config.versionStr
  };

  try {
    const redis = new Redis();
    await redis.login();
    ret.gscaccess = await redis.getGSCAccess(ctx.params.id);
    await redis.logout();
  } catch (e) {
    ret.error = errorString(e);
    ctx.body = ret;
    return;
  }

  ctx.body = ret;
});

// path /gsc/:id
router.post('/:id', async (ctx) => {
  const ret = {
    version: config.versionStr
  };

  // Check for parameters
  if (ctx.request.body === undefined ||
    ctx.request.body.reason === undefined) {
    ret.error = 'Wrong input';
    ctx.body = ret;
    return;
  }

  try {
    const mailContext = {
      reason: ctx.request.body.reason,
      login: ctx.passport.user.login,
      name: ctx.passport.user.name
    };

    // Load all necessary information
    const redis = new Redis();
    await redis.login();

    const landscape = await redis.getLandscape(ctx.params.id);
    mailContext.project = landscape.project;
    mailContext.domain = landscape.domain;

    const gscaccess = await redis.getGSCAccess(ctx.params.id);
    mailContext.access = gscaccess.text;

    const date = moment();
    mailContext.date = date.format('YYYY/MM/DD HH:mm:ss');

    // Save request
    ret.added = await redis.addGSCRequest(
      ctx.params.id,
      ctx.passport.user.id,
      date.valueOf(),
      ctx.request.body.reason,
      gscaccess.text
    );
    await redis.logout();

    // Construct email
    const subjectTempl = await fs.readFileAsync(
      path.resolve(__dirname, 'content/GSCRequestSubject.template'),
      'utf8'
    );
    const bodyTempl = await fs.readFileAsync(
      path.resolve(__dirname, 'content/GSCRequest.template'),
      'utf8'
    );

    // Send email
    const mail = new Mail();
    await mail.sendGSCAccess(
      subjectTempl,
      bodyTempl,
      mailContext
    );
  } catch (e) {
    ret.error = errorString(e);
    ctx.body = ret;
    return;
  }

  ctx.body = ret;
});

export default router;
