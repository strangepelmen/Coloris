/**
 * Coloris — Configuration
 * =============================================================================
 * Instructions:
 *   1. Duplicate this file and rename to "config.js"
 *   2. Add your Unsplash API Access Key below
 *   3. (Optional) Set MOCK_MODE: true to use local demo data without API key
 *
 * Get a free Unsplash API key:
 *   https://unsplash.com/developers
 *
 * Without a valid API key, the app automatically runs in DEMO MODE
 * using a built-in curated dataset of mock images.
 * =============================================================================
 */

(function () {
  'use strict';

  window.__COLORIS_CONFIG__ = {
    // -----------------------------------------------------------------------
    //  U N S P L A S H   &   P E X E L S   A P I
    //  Get your free keys at:
    //    https://unsplash.com/developers
    //    https://www.pexels.com/api/
    // -----------------------------------------------------------------------
    UNSPLASH_ACCESS_KEY: '',
    PEXELS_API_KEY: '',

    // -----------------------------------------------------------------------
    //  A P P   M E T A D A T A
    // -----------------------------------------------------------------------
    APP_NAME: 'Coloris',
    APP_VERSION: '1.0.0',
    APP_URL: 'https://strangepelmen.github.io/coloris/',

    // -----------------------------------------------------------------------
    //  F E A T U R E   F L A G S
    // -----------------------------------------------------------------------

    // true = bypass Unsplash API, use built-in mock image dataset
    // false = use Unsplash API (requires valid UNSPLASH_ACCESS_KEY)
    MOCK_MODE: false,

    // true = show "Try demo" button that loads a sample image
    DEMO_MODE: true,

    // -----------------------------------------------------------------------
    //  C O L O R   E X T R A C T I O N
    // -----------------------------------------------------------------------
    MAX_COLORS: 5,             // Number of dominant colors to extract (3-6)
    MAX_DIMENSION: 1600,       // Max image dimension in pixels for extraction
    EXTRACTION_QUALITY: 1,    // Pixel sampling quality (1=best, 50=fast)
    MIN_COLOR_DISTANCE: 12,   // Threshold for merging similar colors

    // -----------------------------------------------------------------------
    //  C O L L A G E   B U I L D E R
    // -----------------------------------------------------------------------
    MAX_COLLAGE_IMAGES: 12,    // Max selectable images for collage

    // -----------------------------------------------------------------------
    //  S E A R C H   S E T T I N G S
    // -----------------------------------------------------------------------
    SEARCH_ENGINE: 'unsplash', // 'unsplash' | 'pexels' | 'mock'
    RESULTS_PER_PAGE: 15,      // Images per API call
    MAX_PAGES: 3,              // Max pagination pages

    // -----------------------------------------------------------------------
    //  C A C H I N G
    // -----------------------------------------------------------------------
    CACHE_TTL: 3600000,        // API response cache TTL (1 hour in ms)

    // -----------------------------------------------------------------------
    //  A N I M A T I O N S
    // -----------------------------------------------------------------------
    ENABLE_CUSTOM_CURSOR: true,
    ENABLE_SCROLL_ANIMATIONS: true,
    ENABLE_PARTICLE_EFFECTS: false,  // reserved for future use
  };

  // If no API key is provided, automatically enable mock mode
  if (!window.__COLORIS_CONFIG__.UNSPLASH_ACCESS_KEY) {
    window.__COLORIS_CONFIG__.MOCK_MODE = true;
  }
})();
