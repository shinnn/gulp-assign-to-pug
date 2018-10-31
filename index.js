'use strict';

const {access, readFile} = require('fs');
const {extname} = require('path');
const {inspect, promisify} = require('util');
const {Transform} = require('stream');

const gulpPug = require('gulp-pug');
const inspectWithKind = require('inspect-with-kind');
const {isVinyl} = require('vinyl');
const noop = require('nop');
const PluginError = require('plugin-error');

const FILE_TYPE_ERROR = 'Expected to receive a Vinyl object https://github.com/gulpjs/vinyl#new-vinyloptions';
const promisifiedReadFile = promisify(readFile);

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

	// validate the 1st argument
	access(filePath, noop);

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
			template = await promisifiedReadFile(filePath);
			return true;
		} catch (err) {
			return false;
		}
	})();

	return new Transform({
		objectMode: true,
		async transform(file, enc, cb) {
			try {
				if (!template && !await firstTry) {
					template = await promisifiedReadFile(filePath);
				}
			} catch (err) {
				cb(customError(err));
				return;
			}

			if (typeof file !== 'object') {
				cb(customError(`${FILE_TYPE_ERROR}, but got a non-object value ${
					inspectWithKind(file)
				}.`));
				return;
			}

			if (!isVinyl(file)) {
				cb(customError(`${FILE_TYPE_ERROR}, but got a non-Vinyl object ${
					inspectWithKind(file)
				}.`));
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
					file.extname = extname(newFile.path);
					cb(null, file);
				})
				.end(fileClone);
			} catch (err) {
				cb(customError(err, {fileName: file.path}));
			}
		}
	});
};
