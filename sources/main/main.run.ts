module app {

  'use strict';

  /**
   * Entry point of the application.
   * Initializes application and root controller.
   */
  function main($window: ng.IWindowService,
                $locale: ng.ILocaleService,
                $location: ng.ILocationService,
                $rootScope: any,
                $state: angular.ui.IStateService,
                gettextCatalog: angular.gettext.gettextCatalog,
                _: _.LoDashStatic,
                config: IApplicationConfig,
                restService: RestService,
                analyticsService: AnalyticsService) {

    /*
     * Root view model
     */

    let vm = $rootScope;

    vm.pageTitle = '';

    /**
     * Utility method to set the language in the tools requiring it.
     * The current language is saved to the local storage.
     * If no parameter is specified, the language is loaded from local storage (if possible).
     * @param {string=} language The IETF language tag.
     */
    vm.setLanguage = function(language?: string) {
      language = language || $window.localStorage.getItem('language');
      let isSupportedLanguage = _.includes(config.supportedLanguages, language);

      // Fallback if language is not supported
      if (!isSupportedLanguage) {
        language = 'en-US';
      }

      // Configure translation with gettext
      gettextCatalog.setCurrentLanguage(language);
      $locale.id = language;
      $window.localStorage.setItem('language', language);
    };

    /**
     * Updates title on view change.
     */
    vm.$on('$stateChangeSuccess', (event: any, toState: angular.ui.IState) => {
      updateTitle(toState.data ? toState.data.title : null);
    });

    /**
     * Updates title on language change.
     */
    vm.$on('gettextLanguageChanged', () => {
      updateTitle($state.current.data ? $state.current.data.title : null);
    });

    /**
     * Enables tracking by analytics service.
     */
    // HACK : ignore the first $viewContentLoaded event because it's actually fired once when uiView is instantiated,
    // and then it's fired a second time after is has been linked. This is "by design" :-/
    // (http://stackoverflow.com/questions/31000417/angular-js-viewcontentloaded-loading-twice-on-initial-homepage-load)
    let loadedOnce = false;
    vm.$on('$viewContentLoaded', function () {
      if (!loadedOnce) {
        loadedOnce = true;
      } else if (analyticsService) {
        analyticsService.trackPage($location.url());
      }
    });

    init();

    /*
     * Internal
     */

    /**
     * Initializes the root controller.
     */
    function init() {
      // Enable debug mode for translations
      gettextCatalog.debug = config.environment.debug;

      vm.setLanguage();

      // Set REST server configuration
      restService.setServer(config.environment.server);
    }

    /**
     * Updates the title.
     * @param {?string=} stateTitle Title of current state, to be translated.
     */
    function updateTitle(stateTitle?: string) {
      vm.pageTitle = gettextCatalog.getString('APP_NAME');

      if (stateTitle) {
        vm.pageTitle += ' | ' + gettextCatalog.getString(stateTitle);
      }
    }

  }

  angular
    .module('app')
    .run(main);

}
