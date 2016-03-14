import debug from 'debug';
import fetch from '../fetch';
import Config from '../../config';
import { ZabbixApiError } from './error';

let _this = null;

export default class Zabbix {
  constructor() {
    if (!_this) {
      _this = this;
    }

    const config = new Config();

    _this.url = config.zabbixHost;
    _this.user = config.zabbixUser;
    _this.password = config.zabbixPassword;
    _this.rpcid = 0;
    _this.authid = null;

    const { NODE_ENV } = process.env;
    if (NODE_ENV === 'development') {
      debug.enable('zabbix');
    }

    _this.time = new Date();

    return _this;
  }

  async getApiVersion() {
    try {
      const data = await this.call('apiinfo.version', {});
      debug('zabbix')(`getApiVersion: ${JSON.stringify(data)}`);
      return data.result;
    } catch (e) {
      debug('zabbix')(`getApiVersion: error: ${e.message}`);
      throw e.message || e;
    }
  }

  async login(url, user, password) {
    try {
      if (url) {
        if (!url.endsWith('.php')) {
          this.url = `http://${url}.dmzmo.sap.corp:1080/api_jsonrpc.php`;
        } else {
          this.url = url;
        }
      }

      this.rpcid = 0;
      this.authid = null;
      const data = await this.call('user.login', {
        user: user || this.user,
        password: password || this.password
      });
      this.authid = data.result;
      debug('zabbix')(`login success: ${JSON.stringify(data)}`);
      return this.authid;
    } catch (e) {
      debug('zabbix')(`login error: ${JSON.stringify(e)}`);
      throw e.message || e;
    }
  }

  async logout() {
    try {
      this.rpcid = 0;
      await this.call('user.logout', {});
      this.authid = null;
      debug('zabbix')('logout: success');
      return this.authid;
    } catch (e) {
      debug('zabbix')(`logout error: ${JSON.stringify(e)}`);
      throw e.message || e;
    }
  }

  async call(methodStr, paramsObj) {
    try {
      debug('zabbix')(`call: ${methodStr} params: ${JSON.stringify(paramsObj)}`);

      const callBody = {
        jsonrpc: '2.0',
        id: ++this.rpcid,
        auth: this.authid,
        method: methodStr,
        params: paramsObj
      };

      debug('zabbix')(`call: ${this.url}`);
      const response = await fetch(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        compress: false,
        timeout: 0,
        body: JSON.stringify(callBody)
      });

      const data = await response.json();
      if (data.error) {
        debug('zabbix')(`call: throwing error: ${JSON.stringify(data.error)}`);
        throw new ZabbixApiError(data.error);
      }

      return data;
    } catch (e) {
      debug('zabbix')(`call: throwing message from error: ${e}`);
      throw e.message || e;
    }
  }

  async safeCall(methodStr, paramsObj) {
    await this.login();
    const data = await this.call(methodStr, paramsObj);
    await this.logout();
    return data;
  }
}
