/*!
 * gulp-assign-to-jade | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/gulp-assign-to-jade
*/
'use strict';

var path = require('path');

var gulpJade = require('gulp-jade');
var PluginError = require('gulp-util').PluginError;
var readFilePromise = require('fs-readfile-promise');
var replaceExt = require('replace-ext');
var through = require('through2');
var VinylBufferStream = require('vinyl-bufferstream');

function customError(err, options) {
  return new PluginError('gulp-assign-to-jade', err, options);
}

module.exports = function gulpAssignToJade(filePath, options) {
  if (typeof filePath !== 'string') {
    throw customError(new TypeError(
      filePath +
      ' is not a string. The first argument to gulp-assign-to-jade must be a path to a jade file.'
    ));
  }

  options = options || {};

  var promise = readFilePromise(filePath);

  var varName;
  if (options.varName !== undefined) {
    if (typeof options.varName !== 'string') {
      throw customError(new TypeError(
        options.varName +
        ' is not a string. `varName` option must be a string.'
      ));
    }
    varName = options.varName;
  } else {
    varName = 'contents';
  }

  return through.obj(function(file, enc, cb) {
    var self = this;

    promise.then(function(jade) {
      var fileClone = file.clone({contents: false});
      fileClone.contents = jade;
      fileClone.data = file.data || {};

      function assignContentsToJade(buf, done) {
        fileClone.data[varName] = String(buf);

        gulpJade(options)
        .on('error', function(err) {
          done(customError(err));
        })
        .once('data', function(newFile) {
          file.path = replaceExt(file.path, path.extname(newFile.path));
          done(null, newFile.contents);
        })
        .end(fileClone);
      }

      var run = new VinylBufferStream(assignContentsToJade);

      run(file, function(err, contents) {
        if (err) {
          self.emit('error', err);
        } else {
          file.contents = contents;
          self.push(file);
        }
        cb();
      });
    }, function(err) {
      self.emit('error', customError(err));
      self.destroy();
    }).catch(function(err) {
      self.emit('error', customError(err), {fileName: file.path});
    });
  });
};
