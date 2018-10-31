# gulp-assign-to-pug

[![npm version](https://img.shields.io/npm/v/gulp-assign-to-pug.svg)](https://www.npmjs.com/package/gulp-assign-to-pug)
[![Build Status](https://travis-ci.org/shinnn/gulp-assign-to-pug.svg?branch=master)](https://travis-ci.org/shinnn/gulp-assign-to-pug)
[![Coverage Status](https://coveralls.io/repos/github/shinnn/gulp-assign-to-pug/badge.svg?branch=master)](https://coveralls.io/github/shinnn/gulp-assign-to-pug?branch=master)

A [gulp](https://github.com/gulpjs/gulp) 4 plugin to assign file contents to the [Pug](https://pugjs.org/) template as a local variable

```javascript
const {task} = require('gulp');
const assignToPug = require('gulp-assign-to-pug');

task('default', () => {
  return gulp.src('contents.txt')    // contents.txt      : 'Hello'
    .pipe(assignToPug('layout.pug')) // layout.pug        : 'div= contents'
    .pipe(gulp.dest('dest'))         // dest/contents.html: '<div>Hello</div>'
});
```

## Installation

[Use](https://docs.npmjs.com/cli/install) [npm](https://docs.npmjs.com/getting-started/what-is-npm).

```
npm install --save-dev gulp-assign-to-pug
```

## API

```javascript
const assignToPug = require('gulp-assign-to-pug');
```

### assignToPug(*templatePath* [, *options*])

*templatePath*: `string` `Buffer` `Uint8Array` `URL` (path to a `.jade` file)  
*options*: `Object` (directly passed to [gulp-pug](https://github.com/jamen/gulp-pug) options)  
Return: [`stream.Transform`](https://nodejs.org/api/stream.html#stream_class_stream_transform)

It compiles the [Pug](https://github.com/pugjs/pug) template with passing the string of source [file contents](https://github.com/gulpjs/vinyl#optionscontents) to the compiler as `contents` variable. [`data` property](https://github.com/gulp-community/gulp-pug#pugopts) of the contents are also used.

#### options.varName

Type: `string`  
Default: `contents`

Sets the variable name to which the file contents will be assigned.

```javascript
const {basename} = require('path');
const gulp = require('gulp');
const assignToPug = require('gulp-assign-to-pug');
const data = require('gulp-data');

const setTitle = file => ({title: basename(file.path)});

gulp.task('default', () => {
  return gulp.src('src.txt')          // src.txt      : 'Hi'
    .pipe(data(setTitle))
    .pipe(assignToPug('layout.pug', { // template.pug: 'h1= title\np=  body'
      varName: 'body'
    }))
    .pipe(gulp.dest('dest'));         // dest/src.html: '<h1>src</h1><p>Hi</p>'
});
```

## License

[ISC License](./LICENSE) © 2018 Shinnosuke Watanabe
