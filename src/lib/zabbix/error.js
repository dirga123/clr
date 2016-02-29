class ZabbixError extends Error {
  constructor(msg) {
    super(msg);
    this.message = msg;
    this.name = 'ZabbixError';
  }
}

class ZabbixApiError extends ZabbixError {
  constructor(obj) {
    super(obj.message);
    this.message = `${obj.message} ${obj.data}`;
    this.description = obj.data;
    this.code = obj.code;
    this.name = 'ZabbixApiError';
  }
}

export { ZabbixError, ZabbixApiError };
