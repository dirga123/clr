import Router from 'koa-router';
import Config from '../config';
import Redis from '../lib/redis';
import errorString from '../errorString.js';

const router = new Router();
const config = new Config();

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

  // Retrieve list of landscapes
  try {
    const redis = new Redis();
    await redis.login();
    ret.landscapes = await redis.getGSCAccess(ctx.params.id);
    await redis.logout();
  } catch (e) {
    ret.error = errorString(e);
    ctx.body = ret;
    return;
  }

  ctx.body = ret;
});

export default router;
