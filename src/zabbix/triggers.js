import debug from 'debug';

async function triggers(zabbix) {
  debug('zabbix')('triggers()');

  const triggersRet = await zabbix.call('trigger.get', {
    output: [
      'triggerid',
      'description',
      'priority'
    ],
    filter: {
      value: 1,
      status: 0
    },
    sortfield: 'priority',
    sortorder: 'DESC'
  });

  return triggersRet.result;
}

export { triggers as default };
