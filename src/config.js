export const port = process.env.PORT || 5000;
export const host = process.env.HOSTNAME || `localhost:${port}`;

export const password = process.env.PASSWORD || 'nbusr123';

export const redisUrl = process.env.REDIS_URL || 'localhost';
export const redisPort = process.env.REDIS_PORT || 6379;
export const redisPassword = process.env.REDIS_PASSWORD || 'nbusr123';

// 38
// export const zabbixHost = 'http://mo-20f9056fd.dmzmo.sap.corp:1080/api_jsonrpc.php';
// 39
// export const zabbixHost = 'http://mo-c1c06a80c.dmzmo.sap.corp:1080/api_jsonrpc.php';
export const zabbixHost = process.env.ZABBIX_HOST || 'http://localhost:1080/api_jsonrpc.php';
export const zabbixUser = process.env.ZABBIX_USER || 'reader';
export const zabbixPassword = process.env.ZABBIX_PASSWORD || 'nbusr123';

export const versionStr = '1.0.0';
