import Router from 'koa-router';
import Config from '../config';
import Redis from '../lib/redis';
import errorString from '../errorString.js';

const router = new Router();
const config = new Config();

// path /home/landscapes
router.get('/landscapes', async ctx => {
  const ret = {
    version: config.versionStr
  };

  try {
    const redis = new Redis();
    await redis.login();
    const ls = await redis.getLandscapes();
    ret.landscapes = ls.length;
    await redis.logout();
  } catch (e) {
    ret.error = errorString(e);
    ctx.body = ret;
    return;
  }

  ctx.body = ret;
});

// path /home/users
router.get('/users', async ctx => {
  const ret = {
    version: config.versionStr
  };

  try {
    const redis = new Redis();
    await redis.login();
    const users = await redis.getUsers();
    ret.users = users.length;
    await redis.logout();
  } catch (e) {
    ret.error = errorString(e);
    ctx.body = ret;
    return;
  }

  ctx.body = ret;
});

export default router;
