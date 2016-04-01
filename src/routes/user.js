import Router from 'koa-router';
import Config from '../config';
import Redis from '../lib/redis';
import errorString from '../errorString.js';

const router = new Router();
const config = new Config();

function checkInput(body, checkPassword) {
  // Check for parameters
  if (body === undefined ||
    body.login === undefined ||
    body.domain === undefined ||
    body.name === undefined ||
    (checkPassword && body.password === undefined) ||
    body.isAdmin === undefined ||
    body.isGSC === undefined ||
    body.isReporting === undefined) {
    return false;
  }

  return true;
}

// path /user
router.post('/', async (ctx) => {
  const ret = {
    version: config.versionStr
  };

  // Check for parameters
  if (!checkInput(ctx.request.body)) {
    ret.error = 'Wrong input';
    ctx.body = ret;
    return;
  }

  try {
    const redis = new Redis();
    await redis.login();

    ret.added = await redis.addUser(ctx.request.body);

    await redis.logout();
  } catch (e) {
    ret.error = errorString(e);
    ctx.body = ret;
    return;
  }

  ctx.body = ret;
});

// path /user/:id
router.del('/:id', async (ctx) => {
  const ret = {
    version: config.versionStr
  };

  try {
    const redis = new Redis();
    await redis.login();
    ret.deleted = await redis.deleteUser(ctx.params.id);
    await redis.logout();
  } catch (e) {
    ret.error = errorString(e);
    ctx.body = ret;
    return;
  }

  ctx.body = ret;
});

// path /user/:id
router.put('/:id', async (ctx) => {
  const ret = {
    version: config.versionStr
  };

  // Check for parameters
  if (!checkInput(ctx.request.body, false)) {
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

    ret.updated = await redis.updateUser(userId, ctx.request.body);

    await redis.logout();
  } catch (e) {
    ret.error = errorString(e);
    ctx.body = ret;
    return;
  }

  ctx.body = ret;
});

// path /user/:id/profile
router.put('/:id/profile', async (ctx) => {
  const ret = {
    version: config.versionStr
  };

  // Check for parameters
  const body = ctx.request.body;
  if (body === undefined ||
    body.name === undefined ||
    body.oldPassword === undefined ||
    (body.newPassword !== undefined && body.newPassword.length === 0) ||
    (body.newPassword2 !== undefined && body.newPassword2.length === 0)) {
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
