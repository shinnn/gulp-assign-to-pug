'use strict';

var assignToJade = require('..');
var File = require('vinyl');
var from2array = require('from2-array');
var test = require('tape');

test('gulp-assign-to-jade', function(t) {
  t.plan(9);

  assignToJade('test/fixture.jade')
  .on('error', t.fail)
  .on('data', function(file) {
    t.equal(
      String(file.contents),
      '<section><a></a><div></div></section>',
      'should assign file contents to a Jade template.'
    );
    t.equal(file.path, 'foo.html', 'should keep source file path.');
  })
  .end(new File({
    path: 'foo.html',
    contents: new Buffer('<a></a>')
  }));

  var tmpFile = new File({
    path: 'bar.txt',
    contents: new Buffer('12345')
  });

  tmpFile.data = {title: 'Hello'};

  assignToJade('test/fixture.jade', {pretty: true})
  .on('error', t.fail)
  .on('data', function(file) {
    t.equal(
      String(file.contents),
      '\n<section>12345\n  <div>Hello</div></section>',
      'should use file.data and Jade options.'
    );
    t.equal(file.path, 'bar.html', 'should replace file extension with .html.');
  })
  .end(tmpFile);

  assignToJade('test/fixture.jade', {varName: 'footer'})
  .on('error', t.fail)
  .on('data', function(file) {
    file.contents.on('data', function(data) {
      t.equal(
        String(data),
        '<section><div></div></section><footer>abcdefg</footer>',
        'should change variable name with `varName` option.'
      );
    });
  })
  .end(new File({
    path: 'baz.txt',
    contents: from2array(['abcdefg'])
  }));

  assignToJade('index.js', {})
  .on('error', function(err) {
    t.ok(
      /unexpected token/.test(err.message),
      'should emit an error when it fails to compile the template.'
    );
  })
  .end(new File({
    path: 'qux.txt',
    contents: new Buffer('foo')
  }));

  var stream = assignToJade('this/file/does/not/exist.jade')
  .on('error', function(err) {
    t.equal(err.code, 'ENOENT', 'should emit an error when it cannot read the template.');
  });

  var count = 1000;

  while (count--) {
    stream.write(new File());
  }

  stream.end();

  t.throws(
    assignToJade.bind(null, {}),
    /must be a path/,
    'should throw an error when the first argument is not a string.'
  );

  t.throws(
    assignToJade.bind(null, '', {varName: 123}),
    /must be a string/,
    'should throw an error when the `varName` option is not a string.'
  );
});
