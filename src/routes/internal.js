import Router from 'koa-router';
import Config from '../config';

const router = new Router();
const config = new Config();

// path /landscape/:id/internal
router.get('/:id/internal', async (ctx) => {
  const lsRet = {
    version: config.versionStr,
    error: 'Internal report list: Not implemented'
  };
  // await new Promise(r => setTimeout(r, 2000));
  ctx.body = lsRet;
});

export default router;
