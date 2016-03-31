import Router from 'koa-router';
import Config from '../config';
import Redis from '../lib/redis';
import errorString from '../errorString.js';

const router = new Router();
const config = new Config();

// path /landscape/:id/general
router.get('/:id/general', async (ctx) => {
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
    lsRet.error = errorString(e);
    ctx.body = lsRet;
    return;
  }

  ctx.body = lsRet;
});

export default router;
