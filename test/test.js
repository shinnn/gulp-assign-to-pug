'use strong';

const assignToPug = require('..');
const File = require('vinyl');
const stringToStream = require('from2-string');
const test = require('tape');

test('gulp-assign-to-pug', t => {
  t.plan(14);

  t.equal(assignToPug.name, 'gulpAssignToPug', 'should have a function name.');

  assignToPug('test/fixture.pug')
  .on('error', t.fail)
  .on('data', file => {
    t.equal(
      String(file.contents),
      '<section><a></a><div></div></section>',
      'should assign file contents to a Pug template.'
    );
    t.equal(file.path, 'foo.html', 'should keep source file path.');
  })
  .end(new File({
    path: 'foo.html',
    contents: new Buffer('<a></a>')
  }));

  const tmpFile = new File({
    path: 'bar.txt',
    contents: new Buffer('12345')
  });

  tmpFile.data = {title: 'Hello'};

  assignToPug('test/fixture.pug', {pretty: true})
  .on('error', t.fail)
  .on('data', file => {
    t.equal(
      String(file.contents),
      '\n<section>12345\n  <div>Hello</div>\n</section>',
      'should use file.data and Pug options.'
    );
    t.equal(file.path, 'bar.html', 'should replace file extension with .html.');
  })
  .end(tmpFile);

  assignToPug('test/fixture.pug', {varName: 'footer'})
  .on('error', t.fail)
  .on('data', file => {
    file.contents.on('data', data => {
      t.equal(
        String(data),
        '<section><div></div></section><footer>abcdefg</footer>',
        'should change variable name with `varName` option.'
      );
    });
  })
  .end(new File({
    path: 'baz.txt',
    contents: stringToStream('abcdefg')
  }));

  assignToPug('test/fixture.pug', {})
  .on('error', err => {
    t.ok(
      /Invalid value/.test(err.message),
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
    contents: new Buffer('error')
  }));

  assignToPug('this/file/does/not/exist.pug')
  .on('error', function(err) {
    t.equal(err.code, 'ENOENT', 'should emit an error when it cannot read the template.');
    t.strictEqual(
      err.hasOwnProperty('fileName'),
      false,
      'should not include vinyl file path to the error when it cannot read the template.'
    );

    this.end(new File({contents: new Buffer('This file should be ignored.')}));
  })
  .write(new File({path: 'this/path/should/not/be/included/to/the/error'}));

  const corruptFile = {
    path: 'quux.txt',
    clone: function corruptVinylMethod() {
      throw new Error('This is not a valid vinyl file.');
    }
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

  t.throws(
    () => assignToPug({}),
    /must be a path/,
    'should throw an error when the first argument is not a string.'
  );

  t.throws(
    () => assignToPug('', {varName: 123}),
    /must be a string/,
    'should throw an error when the `varName` option is not a string.'
  );
});
