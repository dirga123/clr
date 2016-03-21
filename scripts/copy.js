import path from 'path';
import gaze from 'gaze';
import replace from 'replace';
import Promise from 'bluebird';

/**
 * Copies static files such as robots.txt, favicon.ico to the
 * output (build) folder.
 */
async function copy({ watch } = {}) {
  const ncp = Promise.promisify(require('ncp'));

  await Promise.all([
    ncp('src/public', 'build/public'),
    ncp('src/content', 'build/content'),
    ncp('src/pdf', 'build/pdf'),
    ncp('package.json', 'build/package.json'),
    ncp('READMEBUILD.md', 'build/README.md')
  ]);

  replace({
    regex: '"start".*',
    replacement: '"start": "node server.js"',
    paths: [ 'build/package.json' ],
    recursive: false,
    silent: false
  });

  if (watch) {
    const watcher = await new Promise((resolve, reject) => {
      gaze('src/content/**/*.*', (err, val) => err ? reject(err) : resolve(val));
    });
    watcher.on('changed', async (file) => {
      const relPath = file.substr(path.join(__dirname, '../src/content/').length);
      await ncp(`src/content/${relPath}`, `build/content/${relPath}`);
    });

    const watcherPublic = await new Promise((resolve, reject) => {
      gaze('src/public/**/*.*', (err, val) => err ? reject(err) : resolve(val));
    });
    watcherPublic.on('changed', async (file) => {
      const relPath = file.substr(path.join(__dirname, '../src/public/').length);
      await ncp(`src/public/${relPath}`, `build/public/${relPath}`);
    });
  }
}

export default copy;
