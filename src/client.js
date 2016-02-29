// import 'babel-polyfill';
// import debug from 'debug';

/*
const { NODE_ENV } = process.env;
if (NODE_ENV === 'development') {
  debug.enable('dev,koa');
}
*/

sap.ui.getCore().attachInit(() => {
  new sap.ui.core.ComponentContainer({
    name: 'sap.clr',
    height: '100%'
  }).placeAt('content');
  /*
    new sap.ui.unified.Shell({
      name: 'sap.clr',
      height: '100%',
    }).placeAt('content');
  */
});
