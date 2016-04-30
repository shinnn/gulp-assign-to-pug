# gulp-assign-to-pug

[![NPM version](https://img.shields.io/npm/v/gulp-assign-to-pug.svg)](https://www.npmjs.com/package/gulp-assign-to-pug)
[![Build Status](https://travis-ci.org/shinnn/gulp-assign-to-pug.svg?branch=master)](https://travis-ci.org/shinnn/gulp-assign-to-pug)
[![Build status](https://ci.appveyor.com/api/projects/status/an9bqn2br7bw23nl/branch/master?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/gulp-assign-to-pug/branch/master)
[![Coverage Status](https://coveralls.io/repos/github/shinnn/gulp-assign-to-pug/badge.svg?branch=master)](https://coveralls.io/github/shinnn/gulp-assign-to-pug?branch=master)
[![Dependency Status](https://david-dm.org/shinnn/gulp-assign-to-pug.svg)](https://david-dm.org/shinnn/gulp-assign-to-pug)
[![devDependency Status](https://david-dm.org/shinnn/gulp-assign-to-pug/dev-status.svg)](https://david-dm.org/shinnn/gulp-assign-to-pug#info=devDependencies)

[gulp](https://github.com/gulpjs/gulp) plugin to assign file contents to the [Pug](http://jade-lang.com/) template as a local variable

```javascript
const gulp = require('gulp');
const assignToPug = require('gulp-assign-to-pug');

gulp.task('default', () => {
  return gulp.src('contents.txt')    // contents.txt      : 'Hello'
    .pipe(assignToPug('layout.pug')) // layout.pug        : 'div= contents'
    .pipe(gulp.dest('dest'))         // dest/contents.html: '<div>Hello</div>'
});
```

## Installation

[Use npm.](https://docs.npmjs.com/cli/install)

```
npm install --save-dev gulp-assign-to-pug
```

## API

```javascript
const assignToPug = require('gulp-assign-to-pug');
```

### assignToPug(*templatePath* [, *options*])

*templatePath*: `String` (path to a `.jade` file)  
*options*: `Object` (directly passed to [gulp-pug](https://github.com/jamen/gulp-pug) options)  
Return: `Object` ([stream.Transform](https://nodejs.org/api/stream.html#stream_class_stream_transform))

It compiles the [Pug](https://github.com/pugjs/pug) template with passing the string of source [file contents](https://github.com/gulpjs/vinyl#optionscontents) to the compiler as `contents` variable. [`data` property](https://github.com/jamen/gulp-pug#pugoptions) of the contents are also used.

#### options.varName

Type: `String`  
Default: `contents`

Sets the variable name to which the file contents will be assigned.

```javascript
const path = require('path');
const gulp = require('gulp');
const assignToPug = require('gulp-assign-to-pug');
const data = require('gulp-data');

function setTitle(file) {
  return: {title: path.basename(file.path)};
}

gulp.task('default', () => {
  return gulp.src('src.txt')          // src.txt      : 'Hi'
    .pipe(data(setTitle)) 
    .pipe(assignToPug('layout.pug', { // template.pug: 'h1= title\np=  body'
      varName: 'body'
    })) 
    .pipe(gulp.dest('dest'))          // dest/src.html: '<h1>src</h1><p>Hi</p>'
});
```

## License

Copyright (c) 2015 - 2016 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).
