import fs from 'fs';
import mkdirp from 'mkdirp';

const writeFile = (file, contents) => new Promise((resolve, reject) => {
  fs.writeFile(file, contents, 'utf8', err => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });
});

const makeDir = (name) => new Promise((resolve, reject) => {
  mkdirp(name, err => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });
});

export default { writeFile, makeDir };
