/*
import AWS from 'aws-sdk';

const ec2 = new AWS.EC2({
  region: 'us-east',
  endpoint: 'ec2-us-east.api.monsoon.mo.sap.corp',
  accessKeyId: 'STAzODk5Mzo6MzQxMDU%3D%0A',
  secretAccessKey: 'vqkK6ZwqQ6efNUYyvrf0J6Xi%2BqHo0vlXDqkRjcNnh%2FU%3D%0A',
  http: {
    ca: './SAPNetCA_G2.pem'
  }
});
const params = {
  DryRun: false
};
ec2.describeInstances(params, (err, data) => {
  if (err) {
    console.log(err, err.stack); // an error occurred
  } else {
    console.log(data);           // successful response
  }
});
*/
