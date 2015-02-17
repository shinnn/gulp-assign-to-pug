# gulp-assign-to-jade

[![NPM version](https://img.shields.io/npm/v/gulp-assign-to-jade.svg)](https://www.npmjs.com/package/gulp-assign-to-jade)
[![Build Status](https://travis-ci.org/shinnn/gulp-assign-to-jade.svg?branch=master)](https://travis-ci.org/shinnn/gulp-assign-to-jade)
[![Build status](https://ci.appveyor.com/api/projects/status/vcy6r6t4vksxgei1?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/gulp-assign-to-jade)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/gulp-assign-to-jade.svg)](https://coveralls.io/r/shinnn/gulp-assign-to-jade)
[![Dependency Status](https://img.shields.io/david/shinnn/gulp-assign-to-jade.svg?label=deps)](https://david-dm.org/shinnn/gulp-assign-to-jade)
[![devDependency Status](https://img.shields.io/david/dev/shinnn/gulp-assign-to-jade.svg?label=devDeps)](https://david-dm.org/shinnn/gulp-assign-to-jade#info=devDependencies)

gulp plugin to assign file contents to the [Jade](http://jade-lang.com/) template as a local variable

```javascript
var gulp = require('gulp');
var assignToJade = require('gulp-assign-to-jade');

gulp.task('default', function() {
  return gulp.src('contents.txt')      // contents.txt      : 'Hello'
    .pipe(assignToJade('layout.jade')) // layout.jade       : 'div= contents'
    .pipe(gulp.dest('dest'))           // dest/contents.html: '<div>Hello</div>'
});
```

## Installation

[Use npm.](https://docs.npmjs.com/cli/install)

```sh
npm install --save-dev gulp-assign-to-jade
```

## API

```javascript
var assignToJade = require('gulp-assign-to-jade');
```

### assignToJade(*templatePath* [, *options*])

*templatePath*: `String` (path to a `.jade` file)  
*options*: `Object` (directly passed to [gulp-jade](https://github.com/phated/gulp-jade#options) options)  
Return: `Object` ([stream.Transform](https://iojs.org/api/stream.html#stream_class_stream_transform))

It compiles the [Jade](https://github.com/jadejs/jade) template with passing the string of source [file contents](https://github.com/wearefractal/vinyl#optionscontents) to the compiler as `contents` variable. [`data` property](https://github.com/phated/gulp-jade#use-with-gulp-data) of the contents are also used.

#### options.varName

Type: `String`  
Default: `contents`

Sets the variable name to which the file contents will be assigned.

```javascript
var path = require('path');
var gulp = require('gulp');
var assignToJade = require('gulp-assign-to-jade');
var data = require('gulp-data');

function setTitle(file) {
  return: {title: path.basename(file.path)};
}

gulp.task('default', function() {
  return gulp.src('src.txt')            // src.txt      : 'Hi'
    .pipe(data(setTitle)) 
    .pipe(assignToJade('layout.jade', { // template.jade: 'h1= title\np=  body'
      varName: 'body'
    })) 
    .pipe(gulp.dest('dest'))            // dest/src.html: '<h1>src</h1><p>Hi</p>'
});
```

## License

Copyright (c) 2015 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).
