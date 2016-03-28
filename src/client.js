/*
import md5 from 'crypto-js/md5';

jQuery.sap.registerModulePath('ModuleName', 'http://externalFileDomain.com');
jQuery.sap.require('ModuleName.jsFileName');

    return crypto.createHash('md5').update(data).digest(digest || 'base64');
*/
sap.ui.getCore().attachInit(() => {
  const oContainer = new sap.ui.core.ComponentContainer({
    name: 'sap.clr',
    height: '100%'
  });
  oContainer.placeAt('content');
});

const { NODE_ENV } = process.env;
if (NODE_ENV === 'development') {
  jQuery.sap.log.setLevel(jQuery.sap.log.Level.INFO);
}
