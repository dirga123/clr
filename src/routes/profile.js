import Router from 'koa-router';
import Config from '../config';
import Redis from '../lib/redis';
import errorString from '../errorString.js';

const router = new Router();
const config = new Config();

// path /profile/:id
router.put('/:id', async (ctx) => {
  const ret = {
    version: config.versionStr
  };

  // Check for parameters
  const body = ctx.request.body;
  if (body === undefined ||
    body.name === undefined ||
    body.oldPassword === undefined ||
    body.newPassword === undefined) {
    ret.error = 'Wrong input';
    ctx.body = ret;
    return;
  }

  try {
    const redis = new Redis();
    await redis.login();

    const userId = ctx.params.id;
    if (await redis.existsUser(userId) === false) {
      throw `User ${userId} doesnt exists.`;
    }

    ret.updated = await redis.updateProfile(userId, ctx.request.body);

    await redis.logout();
  } catch (e) {
    ret.error = errorString(e);
    ctx.body = ret;
    return;
  }

  ctx.body = ret;
});

export default router;
