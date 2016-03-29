export const SLA_PRODUCTIVE = 'Productive';
export const SLA_NONPRODUCTIVE = 'Non-Productive';

// "B1 SLD Customer Count : zabbix-sld-cust-count.sh"
export const CUST_COUNT = 'zabbix-sld-cust-count.sh';

// "B1 Customer (2) xx Users : zabbix-sld-cust-users.sh[2]"
export const CUST_USERS = 'zabbix-sld-cust-users.sh';

// "B1 Customer (2) xx Users: RDS licenses : zabbix-sld-cust-users.sh[2,\"RDS\"]"
export const CUST_USERS_RDS = 'RDS';

// "B1 Customer (2) xx Tenants : zabbix-sld-cust-tenants.sh[\"2\"]"
// "B1 Customer (2) xx Tenants: Demo : zabbix-sld-cust-tenants.sh[2, \"Demo\"]"
export const CUST_TENANTS = 'zabbix-sld-cust-tenants.sh';

export const TENANTS_TRIAL = 'Trial';
export const TENANTS_DEMO = 'Demo';
export const TENANTS_TESTING = 'Testing';
export const TENANTS_PRODUCTIVE = 'Productive';

// "B1 Service Unit Count : zabbix-sld-su-count.sh"
export const SU_COUNT = 'zabbix-sld-primitive.sh[ServiceUnits/%24count]';

// "B1 SU 21 Tenants: Trial : zabbix-sld-su-tenants.sh[21,\"Trial\"]"
export const SU_TENANTS = 'zabbix-sld-su-tenants.sh';

// "B1 SU 1 Comp: DB : zabbix-sld-su-comp-db.sh[21, "ServerVersion"]"
export const SU_COMP_DB = 'zabbix-sld-su-comp-db.sh';

export const SU_COMP_DB_NAME = 'Name';
export const SU_COMP_DB_SERVER_VERSION = 'ServerVersion';
export const SU_COMP_DB_STATUS = 'Status';

// "B1 SU 1 Purpose : zabbix-sld-su-purpose.sh[1]"
export const SU_PURPOSE = 'zabbix-sld-su-purpose.sh';

// "B1 SU 1 Status : zabbix-sld-su-status.sh[1]"
export const SU_STATUS = 'zabbix-sld-su-status.sh';

// "B1 SU 1 Version : zabbix-sld-su-version.sh[1]"
export const SU_VERSION = 'zabbix-sld-su-version.sh';

// "B1 SU 1 Name : zabbix-sld-su-name.sh[1]"
export const SU_NAME = 'zabbix-sld-su-name.sh';

// "HANA Version : zabbix-hana.sh[{HOST.HOST},hanaVersion.sql,1]"
export const HANA = 'zabbix-hana.sh';
export const HANA_VERSION = 'hanaVersion.sql';
