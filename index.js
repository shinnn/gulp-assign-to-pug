'use strict';

const {inspect} = require('util');
const {extname} = require('path');
const {Transform} = require('stream');

const gulpPug = require('gulp-pug');
const PluginError = require('plugin-error');
const readFilePromise = require('fs-readfile-promise');
const replaceExt = require('replace-ext');

function customError(err, options) {
	return new PluginError('gulp-assign-to-pug', err, options);
}

module.exports = function gulpAssignToPug(...args) {
	const argLen = args.length;

	if (argLen !== 1 && argLen !== 2) {
		throw new RangeError(`Expected 1 or 2 arguments (<string>[, <Object>]), but got ${
			argLen === 0 ? 'no' : argLen
		} arguments.`);
	}

	const [filePath, options = {}] = args;

	if (typeof filePath !== 'string') {
		throw customError(new TypeError(`${inspect(filePath)} is not a string. The first argument to gulp-assign-to-pug must be a path to a .pug file.`));
	}

	let varName;
	if (options.varName !== undefined) {
		if (typeof options.varName !== 'string') {
			throw customError(new TypeError(`${inspect(options.varName)} is not a string. \`varName\` option must be a string.`));
		}
		varName = options.varName;
	} else {
		varName = 'contents';
	}

	let template;
	const firstTry = (async () => {
		try {
			template = await readFilePromise(filePath);
			return true;
		} catch (err) {
			return false;
		}
	})();

	return new Transform({
		objectMode: true,
		transform(file, enc, cb) {
			(async () => {
				try {
					if (!template && !await firstTry) {
						template = await readFilePromise(filePath);
					}
				} catch (err) {
					cb(customError(err));
					return;
				}

				try {
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
					fileClone.data[varName] = file.contents.toString();

					gulpPug(options)
					.on('error', err => cb(customError(err, {fileName: file.path})))
					.once('data', newFile => {
						file.contents = newFile.contents;
						file.path = replaceExt(file.path, extname(newFile.path));
						cb(null, file);
					})
					.end(fileClone);
				} catch (err) {
					cb(customError(err, {fileName: file.path}));
				}
			})();
		}
	});
};
