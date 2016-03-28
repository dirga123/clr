import Router from 'koa-router';
import Config from '../config';
import Zabbix from '../lib/zabbix';
import hosts from '../zabbix/hosts';
import errorString from '../errorString.js';

const router = new Router();
const config = new Config();

// path /hosts
router.get('/', async ctx => {
  const hostsRet = {
    version: config.versionStr
  };

  if (ctx.request.body === null || ctx.request.body.id === null) {
    hostsRet.error = 'Wrong input';
    ctx.body = hostsRet;
    return;
  }

  try {
    const zabbix = new Zabbix();
    await zabbix.login();

    hostsRet.hosts = await hosts(zabbix);

    await zabbix.logout();
  } catch (e) {
    hostsRet.error = errorString(e);
    ctx.body = hostsRet;
    return;
  }

  ctx.body = hostsRet;
});

export default router;
