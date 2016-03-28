import Router from 'koa-router';
import Config from '../config';
import Redis from '../lib/redis';
import errorString from '../errorString.js';

const router = new Router();
const config = new Config();

// path /login
router.post('/', async (ctx) => {
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
      error: errorString(e)
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

export default router;
