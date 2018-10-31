'use strict';

const {join} = require('path');
const {PassThrough} = require('stream');
const {pathToFileURL} = require('url');

const assignToPug = require('..');
const File = require('vinyl');
const test = require('tape');

test('gulp-assign-to-pug', t => {
	t.plan(19);

	assignToPug('test/fixture.pug')
	.on('error', t.fail)
	.on('data', file => {
		t.equal(
			file.contents.toString(),
			'<section><a></a><div></div></section>',
			'should assign file contents to a Pug template.'
		);
		t.equal(file.path, 'foo.html', 'should keep source file path.');
	})
	.end(new File({
		path: 'foo.html',
		contents: Buffer.from('<a></a>')
	}));

	const tmpFile = new File({
		path: 'bar.txt',
		contents: Buffer.from('12345')
	});

	tmpFile.data = {title: 'Hello'};

	assignToPug(Buffer.from('test/fixture.pug'), {pretty: true})
	.on('error', t.fail)
	.on('data', file => {
		t.equal(
			file.contents.toString(),
			'\n<section>12345\n  <div>Hello</div>\n</section>',
			'should use file.data and Pug options.'
		);
		t.equal(file.path, 'bar.html', 'should replace file extension with .html.');
	})
	.end(tmpFile);

	assignToPug(pathToFileURL(join(__dirname, 'fixture.pug')), {varName: 'footer'})
	.on('error', t.fail)
	.on('data', file => {
		t.equal(
			file.contents.toString(),
			'<section><div></div></section><footer>abcdefg</footer>',
			'should change variable name with `varName` option.'
		);
	})
	.end(new File({
		path: 'baz.txt',
		contents: Buffer.from('abcdefg')
	}));

	assignToPug('test/fixture.pug')
	.on('error', t.fail)
	.on('data', file => {
		t.equal(
			file.contents,
			null,
			'should pass null files as they are.'
		);
	})
	.end(new File());

	assignToPug('test/fixture.pug')
	.on('error', err => {
		t.equal(
			err.message,
			'Stream file is not supported.',
			'should emit an error when when file has Stream contents.'
		);
	})
	.end(new File({
		path: 'stream.pug',
		contents: new PassThrough()
	}));

	assignToPug('test/fixture.pug', {})
	.on('error', err => {
		t.ok(
			err.message.includes('Invalid value'),
			'should emit an error when when Pug fails to compile the template.'
		);
		t.equal(
			err.fileName,
			'qux.txt',
			'should include file path to the error when Pug fails to compile the template.'
		);
	})
	.end(new File({
		path: 'qux.txt',
		contents: Buffer.from('error')
	}));

	assignToPug('this/file/does/not/exist.pug')
	.on('error', err => {
		t.equal(err.code, 'ENOENT', 'should emit an error when it cannot read the template.');
		t.strictEqual(
			Object.prototype.hasOwnProperty.call(err, 'fileName'),
			false,
			'should not include vinyl file path to the error when it cannot read the template.'
		);
	})
	.write(new File({path: 'this/path/should/not/be/included/to/the/error'}));

	const corruptFile = new File({
		path: 'quux.txt'
	});
	corruptFile.isStream = function corruptMethod() {
		throw new Error('This is not a valid vinyl file.');
	};

	assignToPug('test/fixture.pug')
	.on('error', err => {
		t.equal(
			err.message,
			'This is not a valid vinyl file.',
			'should emit an error when the file object is corrupt.'
		);
		t.equal(
			err.fileName,
			'quux.txt',
			'should include file path to the error when the file object is corrupt.'
		);
	})
	.end(corruptFile);

	assignToPug(__filename)
	.on('error', ({message}) => {
		t.equal(
			message,
			'Expected to receive a Vinyl object https://github.com/gulpjs/vinyl#new-vinyloptions' +
			', but got a non-object value Symbol(!).',
			'should emit an error when it receives a non-object value.'
		);
	})
	.write(Symbol('!'));

	assignToPug(__filename)
	.on('error', ({message}) => {
		t.equal(
			message,
			'Expected to receive a Vinyl object https://github.com/gulpjs/vinyl#new-vinyloptions' +
			', but got a non-Vinyl object Set {}.',
			'should emit an error when it receives a non-Vinyl object.'
		);
	})
	.write(new Set());

	t.throws(
		() => assignToPug({}),
		/^TypeError.*ERR_INVALID_ARG_TYPE/u,
		'should throw an error when the first argument is not a valid path type.'
	);

	t.throws(
		() => assignToPug(__filename, {varName: [123, null]}),
		/\[ 123, null \] is not a string\. `varName` option must be a string\./u,
		'should throw an error when the `varName` option is not a string.'
	);

	t.throws(
		() => assignToPug(),
		/^RangeError.*Expected 1 or 2 arguments \(<string>\[, <Object>\]\), but got no arguments\./u,
		'should throw an error when it takes no arguments.'
	);

	t.throws(
		() => assignToPug('_', {}, '_'),
		/^RangeError.*Expected 1 or 2 arguments \(<string>\[, <Object>\]\), but got 3 arguments\./u,
		'should throw an error when it takes too many arguments.'
	);
});
