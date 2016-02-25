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
        debug('redis')(`login ready`);
        resolve();
      });
    });
  }

  async logout() {
    await new Promise((resolve) => {
      debug('redis')(`quit`);
      this.client.quit();
      this.client = null;
      resolve();
    });
  }

  async getPassword() {
    try {
      debug('redis')(`getPassword`);
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
      debug('redis')(`getLandscapes`);
      const lsSet = await this.client.smembersAsync('ls');
      const lsArr = [];
      for (const ls of lsSet) {
        const zabbixVal = await this.client.hgetAsync(`ls:${ls}`, 'zabbix');
        const domainVal = await this.client.hgetAsync(`ls:${ls}`, 'domain');
        lsArr.push({
          id: ls,
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
}
