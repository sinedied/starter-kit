'use strict';

var gulp = require('gulp');
var conf = require('../gulpfile.config');

var browserSync = require('browser-sync');
var browserSyncSpa = require('browser-sync-spa');
var proxyMiddleware = require('http-proxy-middleware');

function browserSyncInit(baseDir, browser, done) {
  var server = {
    baseDir: baseDir,
    middleware: []
  };

  var agent = conf.corporateProxyAgent();

  // We activate a server proxy if we found a configuration for it.
  conf.backendProxy.forEach(function(proxyRoute) {
    var options = proxyRoute.options;

    if (agent) {
      options.agent = agent;
    }

    server.middleware.push(proxyMiddleware(proxyRoute.context, options));
  });

  browserSync.instance = browserSync.init({
    startPath: '/',
    server: server,
    browser: browser
  }, done);
}

browserSync.use(browserSyncSpa({
  selector: '[ng-app]'// Only needed for angular apps
}));

gulp.task('serve', ['watch'], function(done) {
  browserSyncInit([conf.paths.tmp, conf.paths.src], 'default', done);
});

gulp.task('serve:dist', ['build'], function(done) {
  browserSyncInit(conf.paths.dist, 'default', done);
});

gulp.task('serve:e2e', ['inject'], function(done) {
  browserSyncInit([conf.paths.tmp, conf.paths.src], [], done);
});

gulp.task('serve:e2e-dist', ['build'], function(done) {
  browserSyncInit(conf.paths.dist, [], done);
});
