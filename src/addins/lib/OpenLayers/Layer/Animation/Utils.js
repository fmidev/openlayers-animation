/**
 * @requires OpenLayers/Layer/Animation/Animation.js
 */

// Strict mode for whole file.
"use strict";

/**
 * Class: OpenLayers.Layer.Animation.Utils
 * This class provides useful utility functions for animation implementations.
 */
OpenLayers.Layer.Animation.Utils = (function() {

    /**
     * Function to set {toISOString} for {Date} objects if an older browser does not support it natively.
     *
     * See, http://stackoverflow.com/questions/11440569/converting-a-normal-date-to-iso-8601-format
     *
     * This function is called during the construction of this sigleton instance to make sure
     * function is available.
     */
    (function() {
        // Override only if native toISOString is not defined.
        if (!Date.prototype.toISOString) {
            // Rely on JSON serialization for dates because it matches
            // the ISO standard. However, check if JSON serializer is present
            // on a page and define own .toJSON method only if necessary.
            if (!Date.prototype.toJSON) {
                Date.prototype.toJSON = function(key) {
                    var pad = function(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    };

                    return this.getUTCFullYear() + '-' + pad(this.getUTCMonth() + 1) + '-' + pad(this.getUTCDate()) + 'T' + pad(this.getUTCHours()) + ':' + pad(this.getUTCMinutes()) + ':' + pad(this.getUTCSeconds()) + 'Z';
                };
            }

            Date.prototype.toISOString = Date.prototype.toJSON;
        }
    })();

    /**
     * Function to set {indexOf} for array if an older browser does not support it natively.
     *
     * See, http://stackoverflow.com/questions/3629183/why-doesnt-indexof-work-on-an-array-ie8
     *
     * This function is called during the construction of this sigleton instance to make sure
     * function is available.
     */
    (function() {
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function(elt) {
                var len = this.length >>> 0;

                var from = Number(arguments[1]) || 0;
                from = (from < 0) ? Math.ceil(from) : Math.floor(from);
                if (from < 0) {
                    from += len;
                }

                for (; from < len; from++) {
                    if ( from in this && this[from] === elt) {
                        return from;
                    }
                }
                return -1;
            };
        }
    })();

    /**
     * Sets the window.requestAnimationFrame function if not already available.
     *
     * Notice, requestAnimationFrame calls its callback at about 60 fps.
     *
     * Credits: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
     *
     * This function is called during the construction of this sigleton instance to make sure
     * function is available.
     */
    (function() {
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = (function() {
                return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
                function(callback) {
                    // The repaint may occur up to 60 times per second for foreground tabs.
                    window.setTimeout(callback, 1000 / 60);
                };
            })();
        }
    })();

    /**
     * See API for function and paremeters description.
     */
    function floorDateToHour(date) {
        if (date && date instanceof Date) {
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
        }
    }

    /**
     * =========================================
     * Public API is returned here.
     * =========================================
     */
    return {
        /**
         * @method floorDateToHour
         *
         * Floors the value of the given Date object to an exact hour.
         * This function is provided as a simple complementary utility function.
         *
         * @parm {Date} date Date object whose value is set.
         *                   Operation is ignored if {undefined} or {null}.
         */
        floorDateToHour : floorDateToHour,
    };
})();
