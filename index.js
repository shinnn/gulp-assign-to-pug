'use strict';

const inspect = require('util').inspect;
const path = require('path');
const Transform = require('stream').Transform;

const gulpPug = require('gulp-pug');
const PluginError = require('plugin-error');
const readFilePromise = require('fs-readfile-promise');
const replaceExt = require('replace-ext');

function customError(err, options) {
	return new PluginError('gulp-assign-to-pug', err, options);
}

module.exports = function gulpAssignToPug(filePath, options) {
	if (typeof filePath !== 'string') {
		throw customError(new TypeError(`${inspect(filePath)} is not a string. The first argument to gulp-assign-to-pug must be a path to a .pug file.`));
	}

	options = options || {};

	let varName;
	if (options.varName !== undefined) {
		if (typeof options.varName !== 'string') {
			throw customError(new TypeError(`${inspect(options.varName)} is not a string. \`varName\` option must be a string.`));
		}
		varName = options.varName;
	} else {
		varName = 'contents';
	}

	const promise = readFilePromise(filePath);

	return new Transform({
		objectMode: true,
		transform(file, enc, cb) {
			promise.then(template => {
				if (file.isStream()) {
					cb(customError('Stream file is not supported.'));
					return;
				}

				if (!file.isBuffer()) {
					cb(null, file);
					return;
				}

				const fileClone = file.clone({contents: false});
				fileClone.contents = template;
				fileClone.data = file.data || {};
				fileClone.data[varName] = String(file.contents);

				gulpPug(options)
				.on('error', err => cb(customError(err, {fileName: file.path})))
				.once('data', newFile => {
					file.contents = newFile.contents;
					file.path = replaceExt(file.path, path.extname(newFile.path));
					cb(null, file);
				})
				.end(fileClone);
			}, err => {
				setImmediate(() => this.emit('error', err));
			}).catch(err => {
				setImmediate(() => this.emit('error', customError(err, {fileName: file.path})));
			});
		}
	});
};
