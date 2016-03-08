import redis from 'redis';
import bluebird from 'bluebird';
import debug from 'debug';
import { password, redisUrl, redisPort, redisPassword } from '../../config';

bluebird.promisifyAll(redis);

export default class Redis {
  constructor() {
    this.url = redisUrl;
    this.port = redisPort;
    this.password = redisPassword;

    const { NODE_ENV } = process.env;
    if (NODE_ENV === 'development') {
      debug.enable('redis');
    }
  }

  async login() {
    await new Promise((resolve, reject) => {
      debug('redis')(`redis url ${this.url}:${this.port}`);
      this.client = redis.createClient({
        host: this.url,
        port: this.port,
        auth_pass: this.password
      });

      this.client.on('error', (err) => {
        debug('redis')(`login error: ${err}`);
        this.client.end();
        reject(err.message);
      });

      this.client.on('ready', () => {
        debug('redis')('login ready');
        resolve();
      });
    });
  }

  async logout() {
    await new Promise((resolve) => {
      debug('redis')('quit');
      this.client.quit();
      this.client = null;
      resolve();
    });
  }

  async getPassword() {
    try {
      debug('redis')('getPassword');

      let pass = await this.client.getAsync('users:password');
      if (pass === null || pass.length === 0) {
        pass = password;
      }

      return pass;
    } catch (e) {
      debug('redis')(`getPassword error: ${e}`);
      throw e.message;
    }
  }

  async getLandscapes() {
    try {
      debug('redis')('getLandscapes');
      const lsSet = await this.client.smembersAsync('ls');
      const lsArr = [];
      for (const lsId of lsSet) {
        const lsMapId = `ls:${lsId}`;
        const zabbixVal = await this.client.hgetAsync(lsMapId, 'zabbix');
        const domainVal = await this.client.hgetAsync(lsMapId, 'domain');
        lsArr.push({
          id: lsId,
          zabbix: zabbixVal,
          domain: domainVal
        });
      }
      /*
      const lsMapPromises = lsSet.map((ls) => {
        return this.client.hvalsAsync(`ls:${ls}`);
      });
      const lsMap = await Promise.all(lsMapPromises);
      */
      return lsArr;
    } catch (e) {
      debug('redis')(`getLandscapes error: ${e.message}`);
      throw e.message;
    }
  }

  async getLandscape(lsId) {
    try {
      debug('redis')(`getLandscape(${lsId})`);

      const isInSet = await this.client.sismemberAsync('ls', lsId);
      if (isInSet !== 1) {
        throw { message: `Landscape ${lsId} doesnt exists.` };
      }

      const zabbixVal = await this.client.hgetAsync(`ls:${lsId}`, 'zabbix');
      const domainVal = await this.client.hgetAsync(`ls:${lsId}`, 'domain');

      return {
        id: lsId,
        zabbix: zabbixVal,
        domain: domainVal
      };
    } catch (e) {
      debug('redis')(`getLandscape error: ${e.message}`);
      throw e.message;
    }
  }

  async existsLandscape(lsId) {
    try {
      debug('redis')(`existsLandscape(${lsId})`);

      const isInSet = await this.client.sismemberAsync('ls', lsId);
      if (isInSet === 0) {
        return false;
      }
      return true;
    } catch (e) {
      debug('redis')(`existsLandscape error: ${e.message}`);
      throw e.message;
    }
  }

  async addLandscape(ls) {
    try {
      debug('redis')(`addLandscape(${ls.id})`);

      const addedCount = await this.client.saddAsync('ls', ls.id);
      if (addedCount !== 1) {
        throw { message: `Adding of Landscape ${ls.id} failed.` };
      }

      const lsMapId = `ls:${ls.id}`;
      await this.client.hmsetAsync(lsMapId, 'zabbix', ls.zabbix);
      await this.client.hmsetAsync(lsMapId, 'domain', ls.domain);

      return addedCount;
    } catch (e) {
      debug('redis')(`addLandscape error: ${e.message}`);
      throw e.message;
    }
  }

  async getExternalList(lsId) {
    try {
      debug('redis')(`getExternalList(${lsId})`);

      const exists = await this.existsLandscape(lsId);
      if (exists === false) {
        throw { message: `Landscape ${lsId} doesnt exists.` };
      }

      const extSetId = `ls:${lsId}:external`;
      const extSet = await this.client.smembersAsync(extSetId);
      const extArr = [];
      for (const extId of extSet) {
        const extMapId = `ls:${lsId}:external:${extId}`;
        const nameVal = await this.client.hgetAsync(extMapId, 'name');
        extArr.push({
          id: extId,
          name: nameVal
        });
      }

      return extArr;
    } catch (e) {
      debug('redis')(`getExternalList error: ${e.message}`);
      throw e.message;
    }
  }

  async addExternal(lsId, ext) {
    try {
      debug('redis')(`addExternal(${lsId}:${ext.name})`);

      const nextExtId = await this.client.incrAsync('ls:external:nextid');

      const extSetId = `ls:${lsId}:external`;

      const addedCount = await this.client.saddAsync(extSetId, nextExtId);
      if (addedCount !== 1) {
        throw { message: `Adding of External Report ${ext.name} failed.` };
      }

      const extMapId = `ls:${lsId}:external:${nextExtId}`;
      await this.client.hmsetAsync(extMapId, 'name', ext.name);
      await this.client.hmsetAsync(extMapId, 'date', ext.date);
      await this.client.hmsetAsync(extMapId, 'createDate', ext.createDate);
      await this.client.hmsetAsync(extMapId, 'body', JSON.stringify(ext));

      return nextExtId;
    } catch (e) {
      debug('redis')(`addExternal error: ${e.message}`);
      throw e.message;
    }
  }

  async getExternal(lsId, extId) {
    try {
      debug('redis')(`getExternal(${lsId}, ${extId})`);

      const exists = await this.existsLandscape(lsId);
      if (exists === false) {
        throw { message: `Landscape ${lsId} doesnt exists.` };
      }

      const extSetId = `ls:${lsId}:external`;

      const isInSet = await this.client.sismemberAsync(extSetId, extId);
      if (isInSet === 0) {
        throw { message: `Report ${extId} doesnt exists.` };
      }

      const extMapId = `ls:${lsId}:external:${extId}`;
      const bodyVal = await this.client.hgetAsync(extMapId, 'body');

      return bodyVal;
    } catch (e) {
      debug('redis')(`getExternal error: ${e.message}`);
      throw e.message;
    }
  }
}
