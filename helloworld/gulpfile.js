'use strict';

const gulp = require('gulp');
const build = require('@ms/ms-core-build');
build.tslint.isEnabled = () => { return false; };
build.initialize(gulp);
