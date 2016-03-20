'use strict';

var notify = require('gulp-notify');
var gutil = require('gulp-util');

module.exports = function (error) {
    notify({
        title: 'task failed inside: ' + error.view.relative,
        message: error.reason.substring(0, 30) + '... - See console.',
        sound: 'Sosumi' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
    }).write(error);

    gutil.beep(); // Beep 'sosumi' again

    // Inspect the error object
    //console.log(error);

    // Easy error reporting
    //console.log(error.toString());

    // Pretty error reporting
    var report = '';
    var chalk = gutil.colors.white.bgRed;

    report += chalk('TMPL:') + ' ' + error.view.relative + '\n';
    report += chalk('PROB:') + ' ' + error.reason + '\n';
    console.error(report);

    // Prevent the 'watch' task from stopping
    this.emit('end');
};
