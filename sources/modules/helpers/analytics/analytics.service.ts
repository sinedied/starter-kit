module app {

  'use strict';

  /**
   * Analytics service: insert Google Analytics library in the page.
   */
  export class AnalyticsService {

    private analyticsAreActive = false;

    constructor(private $window: ng.IWindowService,
                private config: IApplicationConfig,
                logger: LoggerService) {

      this.logger = logger.getLogger('cacheService');

      this.init();
    }

    private createGoogleAnalyticsObject(i, s, o, g, r, a?, m?) {
      i.GoogleAnalyticsObject = r;
      i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments);
      };
      i[r].l = new Date();
      a = s.createElement(o);
      m = s.getElementsByTagName(o)[0];
      a.async = 1;
      a.src = g;
      m.parentNode.insertBefore(a, m);
    }

    /**
     * Tracks a page change in google analytics.
     * @param {String} url The url of the new page.
     */
    trackPage (url: string) {
      if (this.analyticsAreActive) {
        var urlWithoutParams = url;
        var split = url.split('?');
        if (split.length > 1) {
          urlWithoutParams = split[0];
        }
        this.$window.googleAnalytics('send', 'pageview', urlWithoutParams);
      }
    }

    /**
     * Sends a track event to google analytics.
     * @param {String} category The category to be sent.
     * @param {String} action The action to be sent.
     * @param {String=} label The label to be sent.
     */
    trackEvent (category: string, action: string, label?: string) {
      if (this.analyticsAreActive) {
        this.$window.googleAnalytics('send', 'event', category, action, label);
      }
    }

    init(): void {
      if (config.analyticsAccount !== null) {
        var analyticsScriptUrl = '//www.google-analytics.com/analytics.js';
        this.createGoogleAnalyticsObject(window, document, 'script', analyticsScriptUrl, 'googleAnalytics');
        this.$window.googleAnalytics('create', config.analyticsAccount, 'auto');
        this.analyticsAreActive = true;
      }
    }
  }

  angular
    .module('app')
    .factory('analyticsService', AnalyticsService);
}