import webpack from 'webpack';
import webpackConfig from './webpack.config';
import debug from 'debug';

function bundle() {
  return new Promise((resolve, reject) => {
    webpack(webpackConfig).run((err, stats) => {
      if (err) {
        return reject(err);
      }

      debug('tools:bundle')(stats.toString(webpackConfig[0].stats));
      resolve();
    });
  });
}

export default bundle;
