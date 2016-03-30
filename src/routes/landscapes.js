import Router from 'koa-router';
import Config from '../config';
import Redis from '../lib/redis';
import errorString from '../errorString.js';

const router = new Router();
const config = new Config();

// path /landscapes
router.get('/', async ctx => {
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

  // Retrieve list of landscapes
  try {
    const redis = new Redis();
    await redis.login();
    ret.landscapes = await redis.getLandscapes();
    await redis.logout();
  } catch (e) {
    ret.error = errorString(e);
    ctx.body = ret;
    return;
  }

  ctx.body = ret;
});

export default router;
