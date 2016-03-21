import redis from 'redis';
import bluebird from 'bluebird';
import debug from 'debug';
import Config from '../../config';

bluebird.promisifyAll(redis);

export default class Redis {
  constructor() {
    const config = new Config();
    this.url = config.redisUrl;
    this.port = config.redisPort;
    this.password = config.redisPassword;

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
        const config = new Config();
        pass = config.password;
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

  async deleteLandscape(lsId) {
    try {
      debug('redis')(`deleteLandscape(${lsId})`);

      const lskeysId = `ls:${lsId}*`;

      const keys = await this.client.keysAsync(lskeysId);
      const promises = keys.map((key) => this.client.delAsync(key));
      const results = await Promise.all(promises);

      let deleted = results.reduce((prevVal, currVal) => {
        prevVal += currVal;
        return prevVal;
      }, Number(0));

      deleted += await this.client.sremAsync('ls', lsId);

      return deleted;
    } catch (e) {
      debug('redis')(`deleteLandscape error: ${e.message}`);
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
      await this.client.hmsetAsync(extMapId, 'from', ext.from);
      await this.client.hmsetAsync(extMapId, 'to', ext.to);
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

      if (bodyVal === null) {
        throw { message: `Report ${extId} is corrupted.` };
      }

      return bodyVal;
    } catch (e) {
      debug('redis')(`getExternal error: ${e.message}`);
      throw e.message;
    }
  }

  async deleteExternal(lsId, extId) {
    try {
      debug('redis')(`deleteExternal(${lsId}, ${extId})`);

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

      let deleted = await this.client.delAsync(extMapId);
      deleted += await this.client.sremAsync(extSetId, extId);

      return deleted;
    } catch (e) {
      debug('redis')(`deleteExternal error: ${e.message}`);
      throw e.message;
    }
  }
}
