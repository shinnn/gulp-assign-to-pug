/*!
 * gulp-assign-to-jade | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/gulp-assign-to-jade
*/
'use strict';

const path = require('path');
const Transform = require('stream').Transform;

const gulpJade = require('gulp-jade');
const PluginError = require('gulp-util').PluginError;
const readFilePromise = require('fs-readfile-promise');
const replaceExt = require('replace-ext');
const VinylBufferStream = require('vinyl-bufferstream');

function customError(err, options) {
  return new PluginError('gulp-assign-to-jade', err, options);
}

module.exports = function gulpAssignToJade(filePath, options) {
  if (typeof filePath !== 'string') {
    throw customError(new TypeError(
      String(filePath) +
      ' is not a string. The first argument to gulp-assign-to-jade must be a path to a jade file.'
    ));
  }

  options = options || {};

  const promise = readFilePromise(filePath);

  let varName;
  if (options.varName !== undefined) {
    if (typeof options.varName !== 'string') {
      throw customError(new TypeError(
        String(options.varName) +
        ' is not a string. `varName` option must be a string.'
      ));
    }
    varName = options.varName;
  } else {
    varName = 'contents';
  }

  return new Transform({
    objectMode: true,
    transform: function gulpAssignToJadeTransform(file, enc, cb) {
      promise.then(jade => {
        const fileClone = file.clone({contents: false});
        fileClone.contents = jade;
        fileClone.data = file.data || {};

        function assignContentsToJade(buf, done) {
          fileClone.data[varName] = String(buf);

          gulpJade(options)
          .on('error', function emitGulpJadeError(err) {
            done(customError(err));
          })
          .once('data', function emitGulpJadeData(newFile) {
            file.path = replaceExt(file.path, path.extname(newFile.path));
            done(null, newFile.contents);
          })
          .end(fileClone);
        }

        const run = new VinylBufferStream(assignContentsToJade);

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
