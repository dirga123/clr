let _this = null;

class Config {
  constructor() {
    if (!_this) {
      _this = this;
    }

    const data = require('./config.json');

    _this.port = process.env.PORT || data.port;
    _this.host = process.env.HOSTNAME || `${data.host}:${_this.port}`;

    _this.password = process.env.PASSWORD || data.password;

    _this.redisUrl = process.env.REDIS_URL || data.redisUrl;
    _this.redisPort = process.env.REDIS_PORT || data.redisPort;
    _this.redisPassword = process.env.REDIS_PASSWORD || data.redisPassword;

    _this.zabbixHost = process.env.ZABBIX_HOST || data.zabbixHost;
    _this.zabbixUser = process.env.ZABBIX_USER || data.zabbixUser;
    _this.zabbixPassword = process.env.ZABBIX_PASSWORD || data.zabbixPassword;

    const data2 = require('../package.json');
    _this.versionStr = data2.version;
    console.log(_this.versionStr);

    return _this;
  }
}

export default Config;
