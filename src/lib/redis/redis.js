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

  // Landscape

  async getLandscapes() {
    try {
      debug('redis')('getLandscapes');
      const lsSet = await this.client.smembersAsync('ls');
      const lsArr = [];
      for (const lsId of lsSet) {
        const lsMapId = `ls:${lsId}`;
        const projectVal = await this.client.hgetAsync(lsMapId, 'project');
        const zabbixVal = await this.client.hgetAsync(lsMapId, 'zabbix');
        const domainVal = await this.client.hgetAsync(lsMapId, 'domain');
        lsArr.push({
          id: lsId,
          project: projectVal,
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

      const projectVal = await this.client.hgetAsync(`ls:${lsId}`, 'project');
      const zabbixVal = await this.client.hgetAsync(`ls:${lsId}`, 'zabbix');
      const domainVal = await this.client.hgetAsync(`ls:${lsId}`, 'domain');

      return {
        id: lsId,
        project: projectVal,
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
      debug('redis')(`addLandscape(${ls.project})`);

      const nextLsId = await this.client.incrAsync('ls:nextid');

      const addedCount = await this.client.saddAsync('ls', nextLsId);
      if (addedCount !== 1) {
        throw { message: `Adding of Landscape ${nextLsId} failed.` };
      }

      const lsMapId = `ls:${nextLsId}`;
      await this.client.hmsetAsync(lsMapId, 'project', ls.project);
      await this.client.hmsetAsync(lsMapId, 'zabbix', ls.zabbix);
      await this.client.hmsetAsync(lsMapId, 'domain', ls.domain);

      return addedCount;
    } catch (e) {
      debug('redis')(`addLandscape error: ${e.message}`);
      throw e.message;
    }
  }

  async updateLandscape(lsId, ls) {
    try {
      debug('redis')(`updateLandscape(${lsId})`);

      const isInSet = await this.client.sismemberAsync('ls', lsId);
      if (isInSet === 0) {
        return 0;
      }

      const lsMapId = `ls:${lsId}`;
      await this.client.hmsetAsync(lsMapId, 'project', ls.project);
      await this.client.hmsetAsync(lsMapId, 'zabbix', ls.zabbix);
      await this.client.hmsetAsync(lsMapId, 'domain', ls.domain);

      return 1;
    } catch (e) {
      debug('redis')(`updateLandscape error: ${e.message}`);
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

  // users

  async getUsers() {
    try {
      debug('redis')('getUsers');
      const usrSet = await this.client.smembersAsync('users');
      const usrArr = [];
      for (const usrId of usrSet) {
        const usrMapId = `users:${usrId}`;
        const user = await this.client.hgetallAsync(usrMapId);
        if (user !== null) {
          user.id = usrId;
          usrArr.push(user);
        }
      }
      /*
      const lsMapPromises = lsSet.map((ls) => {
        return this.client.hvalsAsync(`ls:${ls}`);
      });
      const lsMap = await Promise.all(lsMapPromises);
      */
      return usrArr;
    } catch (e) {
      debug('redis')(`getUsers error: ${e.message}`);
      throw e.message;
    }
  }

  async getOnlineUsersCount() {
    try {
      debug('redis')('getOnlineUsersCount');
      const sessionKeysId = 'session:*';
      const keys = await this.client.keysAsync(sessionKeysId);
      return keys.length;
    } catch (e) {
      debug('redis')(`getOnlineUsersCount error: ${e.message}`);
      throw e.message;
    }
  }

  async getLoginUser(username, password) {
    try {
      debug('redis')('getLoginUser');

      const passwordId = `users:password:${username}`;
      const pass = await this.client.getAsync(passwordId);
      if (pass === null || pass.length === 0) {
        // check if user does exists, just password key is missing?
        return undefined;
      }

      if (pass !== password) {
        return undefined;
      }

      const userId = `users:id:${username}`;
      const id = await this.client.getAsync(userId);
      if (id === null || id.length === 0) {
        throw { message: `User record for ${username} is corrupted` };
      }

      const userHashId = `users:${id}`;
      const user = await this.client.hgetallAsync(userHashId);
      if (user === null) {
        throw { message: `User record for ${username} is corrupted` };
      }

      user.id = id;
      return user;
    } catch (e) {
      debug('redis')(`getLoginUser error: ${e}`);
      throw e.message;
    }
  }

  async addUser(user) {
    try {
      debug('redis')(`addUser(${user.login})`);

      const nextUserId = await this.client.incrAsync('users:nextid');

      const addedCount = await this.client.saddAsync('users', nextUserId);
      if (addedCount !== 1) {
        throw { message: `Adding of User ${nextUserId} failed.` };
      }

      const userPasswordId = `users:password:${user.login}`;
      const respPassword = await this.client.setAsync(userPasswordId, user.password);
      if (respPassword !== 'OK') {
        throw { message: `Adding of user ${user.login} failed (password).` };
      }

      const userIndexId = `users:id:${user.login}`;
      const respIndex = await this.client.setAsync(userIndexId, nextUserId);
      if (respIndex !== 'OK') {
        throw { message: `Adding of user ${user.login} failed (index).` };
      }

      const userMapId = `users:${nextUserId}`;
      await this.client.hmsetAsync(userMapId, 'name', user.name);
      await this.client.hmsetAsync(userMapId, 'login', user.login);
      await this.client.hmsetAsync(userMapId, 'domain', user.domain);
      await this.client.hmsetAsync(userMapId, 'isAdmin', user.isAdmin);
      await this.client.hmsetAsync(userMapId, 'isGSC', user.isGSC);

      return addedCount;
    } catch (e) {
      debug('redis')(`addUser error: ${e.message}`);
      throw e.message;
    }
  }

  async deleteUser(userId) {
    try {
      debug('redis')(`deleteUser(${userId})`);

      const userKeysId = `users:${userId}*`;

      const keys = await this.client.keysAsync(userKeysId);

      const userMapId = `users:${userId}`;
      const login = await this.client.hmgetAsync(userMapId, 'login');

      const loginKeysId = `users:*:${login}`;
      const loginKeys = await this.client.keysAsync(loginKeysId);

      Array.prototype.push.apply(keys, loginKeys);

      const promises = keys.map((key) => this.client.delAsync(key));
      const results = await Promise.all(promises);

      let deleted = results.reduce((prevVal, currVal) => {
        prevVal += currVal;
        return prevVal;
      }, Number(0));

      deleted += await this.client.sremAsync('users', userId);

      return deleted;
    } catch (e) {
      debug('redis')(`deleteUser error: ${e.message}`);
      throw e.message;
    }
  }

  async existsUser(userId) {
    try {
      debug('redis')(`existsUser(${userId})`);

      const isInSet = await this.client.sismemberAsync('users', userId);
      if (isInSet === 0) {
        return false;
      }

      return true;
    } catch (e) {
      debug('redis')(`existsUser error: ${e.message}`);
      throw e.message;
    }
  }

  async updateUser(userId, user) {
    try {
      debug('redis')(`updateUser(${userId})`);

      const isInSet = await this.client.sismemberAsync('users', userId);
      if (isInSet === 0) {
        return 0;
      }

      const userMapId = `users:${userId}`;
      const oldLogin = await this.client.hmgetAsync(userMapId, 'login');

      if (oldLogin !== user.login) {
        const oldUserPasswordId = `users:password:${oldLogin}`;
        const userPasswordId = `users:password:${user.login}`;
        if (oldUserPasswordId !== userPasswordId) {
          await this.client.renameAsync(oldUserPasswordId, userPasswordId);
        }

        const oldUserIndexId = `users:id:${oldLogin}`;
        const userIndexId = `users:id:${user.login}`;
        if (oldUserIndexId !== userIndexId) {
          await this.client.renameAsync(oldUserIndexId, userIndexId);
        }
      }

      await this.client.hmsetAsync(userMapId, 'name', user.name);
      await this.client.hmsetAsync(userMapId, 'login', user.login);
      await this.client.hmsetAsync(userMapId, 'domain', user.domain);
      await this.client.hmsetAsync(userMapId, 'isAdmin', user.isAdmin);
      await this.client.hmsetAsync(userMapId, 'isGSC', user.isGSC);

      if (!/^(undefined|null)?$/.test(user.password) && user.password.length > 0) {
        const userPasswordId = `users:password:${user.login}`;
        const respPassword = await this.client.setAsync(userPasswordId, user.password);
        if (respPassword !== 'OK') {
          throw { message: `Updating of user ${user.login} failed (password).` };
        }
      }

      return 1;
    } catch (e) {
      debug('redis')(`updateUser error: ${e.message}`);
      throw e.message;
    }
  }

  async existsGSCAccess(lsId) {
    try {
      debug('redis')(`existsGSCAccess(${lsId})`);

      const gscAccessId = `ls:${lsId}:gscaccess:`;
      const exists = await this.client.existsAsync(gscAccessId);
      if (exists === 1) {
        return true;
      }

      return false;
    } catch (e) {
      debug('redis')(`existsGSCAccess error: ${e.message}`);
      throw e.message;
    }
  }

  async getGSCAccess(lsId) {
    try {
      debug('redis')(`getGSCAccess(${lsId})`);

      const gscAccessId = `ls:${lsId}:gscaccess:`;
      const exists = await this.client.existsAsync(gscAccessId);
      if (exists !== 1) {
        throw { message: `GSC Access for Landscape ${lsId} doesnt exists.` };
      }

      const val = await this.clienthgetAsync(gscAccessId);

      return {
        gscaccess: val
      };
    } catch (e) {
      debug('redis')(`getGSCAccess error: ${e.message}`);
      throw e.message;
    }
  }
}
