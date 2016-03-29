import Router from 'koa-router';
import Config from '../config';
import Redis from '../lib/redis';
import errorString from '../errorString.js';

const router = new Router();
const config = new Config();

// path /users
router.get('/', async ctx => {
  const ret = {
    version: config.versionStr
  };

  try {
    const redis = new Redis();
    await redis.login();
    ret.users = await redis.getUsers();
    await redis.logout();
  } catch (e) {
    ret.error = errorString(e);
    ctx.body = ret;
    return;
  }

  ctx.body = ret;
});

export default router;