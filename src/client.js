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

const { NODE_ENV } = process.env;
if (NODE_ENV === 'development') {
  jQuery.sap.log.setLevel(jQuery.sap.log.Level.INFO);
}
