/*!
 * gulp-assign-to-pug | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/gulp-assign-to-pug
*/
'use strict';

const inspect = require('util').inspect;
const path = require('path');
const Transform = require('stream').Transform;

const gulpPug = require('gulp-pug');
const PluginError = require('gulp-util/lib/PluginError.js');
const readFilePromise = require('fs-readfile-promise');
const replaceExt = require('replace-ext');
const VinylBufferStream = require('vinyl-bufferstream');

function customError(err, options) {
  return new PluginError('gulp-assign-to-pug', err, options);
}

module.exports = function gulpAssignToPug(filePath, options) {
  if (typeof filePath !== 'string') {
    throw customError(new TypeError(
      inspect(filePath) +
      ' is not a string. The first argument to gulp-assign-to-pug must be a path to a .pug file.'
    ));
  }

  options = options || {};

  const promise = readFilePromise(filePath);

  let varName;
  if (options.varName !== undefined) {
    if (typeof options.varName !== 'string') {
      throw customError(new TypeError(
        inspect(options.varName) +
        ' is not a string. `varName` option must be a string.'
      ));
    }
    varName = options.varName;
  } else {
    varName = 'contents';
  }

  return new Transform({
    objectMode: true,
    transform: function gulpAssignToPugTransform(file, enc, cb) {
      promise.then(template => {
        const fileClone = file.clone({contents: false});
        fileClone.contents = template;
        fileClone.data = file.data || {};

        function assignContentsToPug(buf, done) {
          fileClone.data[varName] = String(buf);

          gulpPug(options)
          .on('error', function emitGulpJadeError(err) {
            done(customError(err));
          })
          .once('data', function emitGulpJadeData(newFile) {
            file.path = replaceExt(file.path, path.extname(newFile.path));
            done(null, newFile.contents);
          })
          .end(fileClone);
        }

        const run = new VinylBufferStream(assignContentsToPug);

        run(file, (err, contents) => {
          if (err) {
            this.emit('error', customError(err, {fileName: file.path}));
          } else {
            file.contents = contents;
            this.push(file);
          }
          cb();
        });
      }, err => {
        setImmediate(() => this.emit('error', err));
      }).catch(err => {
        setImmediate(() => this.emit('error', customError(err, {fileName: file.path})));
      });
    }
  });
};
