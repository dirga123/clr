import debug from 'debug';
import Zabbix from '../lib/zabbix';

class Disk {
  constructor(Name, pctFree, used, total) {
    this.Name = Name;
    this.pctFree = pctFree;
    this.used = used;
    this.total = total;
  }
}

function transformOS(os) {
  if (os) {
    if (os.indexOf('Windows Server 2008 R2') > -1) {
      return 'Win Server 2008 R2';
    } else if (os.indexOf('Windows Server 2012') > -1) {
      return 'Win Server 2012';
    } else if (os.indexOf('Windows Server 2003') > -1) {
      return 'Win Server 2003';
    } else if (os.indexOf('el7') > -1) {
      return 'CentOS 7';
    } else if (os.indexOf('el6') > -1) {
      return 'CentOS 6.5';
    } else if (os.indexOf('Ubuntu') > -1) {
      // Ubuntu's uname -a does not give us the OS version
      return 'Ubuntu';
    } else if (os.indexOf('Version 10') > -1) {
      // Does this conflict with any other OS?
      return 'Mac OS 10.6';
    } else if (os.indexOf('Version 11') > -1) {
      return 'Mac OS 10.7';
    } else if (os.indexOf('Version 12') > -1) {
      return 'Mac OS 10.8';
    } else if (os.indexOf('Version 13') > -1) {
      return 'Mac OS 10.9';
    } else if (os.indexOf('Version 14') > -1) {
      return 'Mac OS 10.10';
    } else if (os.indexOf('Version 15') > -1) {
      return 'Mac OS 10.11';
      // Even though it doesn't exist yet....
      // Feel free to roll your own OS stuff here as well
      //! Don't feel restrained by my life choices!
    } else if (os.indexOf('Linux') > -1) {
      return 'Linux';
    } else {
      // Return the unfriendly string if no patterns were matched
      return os;
    }
  }

  return 'OS Unavailable';
}

function transformHosts(data) {
  if (typeof data === 'undefined' || data === null ||
    typeof data.result === 'undefined' || data.result === null) {
    debug('dev')('transformHosts: no data');
    return {};
  }

  const result = data.result;
  const newData = result.map((host) => {
    const newHost = {
      hostid: host.hostid,
      host: host.host,
      name: host.name,
      agentPing: '',
      totalMem: 0,
      freeMem: 0,
      numProcesses: 0,
      networkTraffic: 0,
      Disks: []
    };
    let processorCount = 1;
    let loadTotals = 0;
    host.items.forEach((item) => {
      switch (item.key_) {
      case 'system.cpu.num':
        processorCount = item.lastvalue;
        break;
      case 'system.cpu.load':
        loadTotals += item.lastvalue;
        break;
      case 'agent.ping':
        newHost.agentPing = item.lastvalue;
        break;
      case 'vm.memory.size[total]':
        newHost.totalMem = item.lastvalue / 1073741824; // 1024^3 => GB
        break;
      case 'vm.memory.size[free]':
        // free(avail)=free+cached+inactive on linux, free on Windows
        newHost.freeMem += item.lastvalue / 1073741824;
        break;
      case 'vm.memory.size[cached]':
        newHost.freeMem += item.lastvalue / 1073741824;
        break;
      case 'vm.memory.size[inactive]':
        newHost.freeMem += item.lastvalue / 1073741824;
        break;
      case 'vm.memory.size[available]':
        newHost.freeMem += item.lastvalue / 1073741824;
        break;
      case 'proc.num[]':
        newHost.numProcesses = item.lastvalue;
        break;
      case 'system.uname':
        newHost.os = transformOS(item.lastvalue);
        break;
      case (item.key_.match(/vfs.fs.size/) ? item.key_ : 'undefined'):
        {
          // 12 is where the name of the disk starts
          const diskName = /\[.*?(,|])/.exec(item.key_)[0].slice(1, -1);
          let nameIndex = newHost.Disks.findIndex((disk) => disk.Name === diskName);
          if (nameIndex === -1) {
            newHost.Disks.push(new Disk(diskName));
            nameIndex = newHost.Disks.findIndex((disk) => disk.Name === diskName);
          }

          switch (item.key_) {
          case ((item.key_.match(/,pfree/)) ? item.key_ : 'undefined'):
            newHost.Disks[nameIndex].pctFree = 100 - item.lastvalue;
            break;
          case ((item.key_.match(/,used/)) ? item.key_ : 'undefined'):
            newHost.Disks[nameIndex].used = item.lastvalue / 1073741824;
            break;
          case ((item.key_.match(/,total/)) ? item.key_ : 'undefined'):
            newHost.Disks[nameIndex].total = item.lastvalue / 1073741824;
            break;
          default:
            break;
          }
        }
        break;
      default:
        break;
      }
    });

    newHost.usedMem = newHost.totalMem - newHost.freeMem;
    newHost.avgCpuLoad = loadTotals / processorCount;
    newHost.memPct = newHost.usedMem / newHost.totalMem;

    return newHost;
  });

  return { Hosts: newData };
}

async function hosts() {
  debug('zabbix')('hosts()');

  const zabbix = new Zabbix();

  const hostsRet = await zabbix.call('host.get', {
    output: 'extend',
    sortfield: 'host'
  });

  // const hostIdsArr = hostsRet.result.map(currentValue => currentValue.serviceid);

  return hostsRet.result.map(currentValue =>
    ({
      hostid: currentValue.hostid,
      host: currentValue.host,
      name: currentValue.name,
      status: currentValue.status,
      available: currentValue.available,
      error: currentValue.error,
      errors_from: currentValue.errors_from
    })
  );
}

export { hosts as default, transformHosts };
