import debug from 'debug';

async function services(zabbix, fromDate, toDate) {
  debug('zabbix')(`services(${fromDate}, ${toDate})`);

  const servicesRet = await zabbix.call('service.get', {
    output: [
      'serviceid',
      'name',
      'status',
      'goodsla'
    ],
    selectParent: 'serviceid',
    sortfield: 'sortorder',
    filter: {
      showsla: 1
    }
  });

  const topServicesMap = servicesRet.result.reduce((previousValue, currentValue) => {
    if (currentValue.parent.length === 0) {
      previousValue.add(currentValue.serviceid);
    }
    return previousValue;
  }, new Set());

  const servicesArr = servicesRet.result.reduce((previousValue, currentValue) => {
    if (currentValue.parent.length === 0 ||
      topServicesMap.has(currentValue.parent.serviceid)) {
      previousValue.push(currentValue);
    }
    return previousValue;
  }, []);

  const serviceIdsArr = servicesArr.map(currentValue => currentValue.serviceid);

  const slaRet = await zabbix.call('service.getsla', {
    serviceids: serviceIdsArr,
    intervals: {
      from: fromDate,
      to: toDate
    }
  });

  const slaMap = slaRet.result;

  return servicesArr.map((currentValue) => {
    const slaObj = slaMap[currentValue.serviceid];

    return {
      name: currentValue.name,
      status: slaObj.status || currentValue.status,
      goodSla: currentValue.goodsla,
      currSla: slaObj.sla[0].sla,
      okTime: slaObj.sla[0].okTime,
      problemTime: slaObj.sla[0].problemTime,
      downtimeTime: slaObj.sla[0].downtimeTime
    };
  });
}

async function servicesAsMap(zabbix, fromDate, toDate) {
  debug('zabbix')(`servicesAsMap(${fromDate}, ${toDate})`);

  const servicesRet = await zabbix.call('service.get', {
    output: [
      'serviceid',
      'name',
      'status',
      'goodsla'
    ],
    selectParent: 'serviceid',
    sortfield: 'sortorder',
    filter: {
      showsla: 1
    }
  });

  const topServicesMap = servicesRet.result.reduce((previousValue, currentValue) => {
    if (currentValue.parent.length === 0) {
      previousValue.add(currentValue.serviceid);
    }
    return previousValue;
  }, new Set());

  const servicesArr = servicesRet.result.reduce((previousValue, currentValue) => {
    if (topServicesMap.has(currentValue.serviceid) ||
      topServicesMap.has(currentValue.parent.serviceid)) {
      previousValue.push(currentValue);
    }
    return previousValue;
  }, []);

  const serviceIdsArr = servicesArr.map(currentValue => currentValue.serviceid);

  const slaRet = await zabbix.call('service.getsla', {
    serviceids: serviceIdsArr,
    intervals: {
      from: fromDate,
      to: toDate
    }
  });

  const slaMap = slaRet.result;

  return servicesArr.reduce((previousValue, currentValue) => {
    const slaObj = slaMap[currentValue.serviceid];

    previousValue.set(currentValue.name, {
      status: slaObj.status || currentValue.status,
      goodSla: currentValue.goodsla,
      currSla: slaObj.sla[0].sla,
      okTime: slaObj.sla[0].okTime,
      problemTime: slaObj.sla[0].problemTime,
      downtimeTime: slaObj.sla[0].downtimeTime
    });

    return previousValue;
  }, new Map());
}

export { services, servicesAsMap };
