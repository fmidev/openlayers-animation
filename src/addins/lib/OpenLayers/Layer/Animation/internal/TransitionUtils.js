/**
 * @requires OpenLayers/Layer/Animation/Animation.js
 * @requires OpenLayers/Layer/Animation/Utils.js
 */

// Strict mode for whole file.
"use strict";

/**
 * Class: OpenLayers.Layer.Animation.TransitionUtils
 * Provides alternative functions that handle animation transitions.
 * These can be used in case CSS transitions do not seem to work properly.
 */
OpenLayers.Layer.Animation.TransitionUtils = (function() {

    /**
     * Contains objects that have transition operations already going on.
     * Object contains transition object reference and if transition for the same
     * object is restarted, removed parameter is set {true}. Then, previous transition
     * does not continue and object can be released.
     * [ {object : {Object}, removed : {Boolean}}, ... ]
     */
    var _transitionArray = [];

    /**
     * This function is copy-pasted and modified from Raphael JavaScript library, http://raphaeljs.com/.
     *\
     * Raphael.easing_formulas
     [ property ]
     **
     * Object that contains easing formulas for animation. You could extend it with your own. By default it has following list of easing:
     # <ul>
     #     <li>“linear”</li>
     #     <li>“&lt;” or “easeIn” or “ease-in”</li>
     #     <li>“>” or “easeOut” or “ease-out”</li>
     #     <li>“&lt;>” or “easeInOut” or “ease-in-out”</li>
     #     <li>“backIn” or “back-in”</li>
     #     <li>“backOut” or “back-out”</li>
     #     <li>“elastic”</li>
     #     <li>“bounce”</li>
     # </ul>
     # <p>See also <a href="http://raphaeljs.com/easing.html">Easing demo</a>.</p>
     \*/
    var _easingFormulas = {
        linear : function(n) {
            return n;
        },
        "ease-in" : function(n) {
            return Math.pow(n, 1.7);
        },
        "ease-out" : function(n) {
            return Math.pow(n, 0.48);
        },
        "ease-in-out" : function(n) {
            var q = 0.48 - n / 1.04, Q = Math.sqrt(0.1734 + q * q), x = Q - q, X = Math.pow(Math.abs(x), 1 / 3) * (x < 0 ? -1 : 1), y = -Q - q, Y = Math.pow(Math.abs(y), 1 / 3) * (y < 0 ? -1 : 1), t = X + Y + 0.5;
            return (1 - t) * 3 * t * t + t * t * t;
        },
        "back-in" : function(n) {
            var s = 1.70158;
            return n * n * ((s + 1) * n - s);
        },
        "back-out" : function(n) {
            n = n - 1;
            var s = 1.70158;
            return n * n * ((s + 1) * n + s) + 1;
        },
        elastic : function(n) {
            if (n === 0 || n === 1) {
                return n;
            }
            return Math.pow(2, -10 * n) * Math.sin((n - 0.075) * (2 * Math.PI) / 0.3) + 1;
        },
        bounce : function(n) {
            var s = 7.5625, p = 2.75, l;
            if (n < (1 / p)) {
                l = s * n * n;
            } else {
                if (n < (2 / p)) {
                    n -= (1.5 / p);
                    l = s * n * n + 0.75;
                } else {
                    if (n < (2.5 / p)) {
                        n -= (2.25 / p);
                        l = s * n * n + 0.9375;
                    } else {
                        n -= (2.625 / p);
                        l = s * n * n + 0.984375;
                    }
                }
            }
            return l;
        }
    };

    function checkTransitionStyle(transitionStyle) {
        return _easingFormulas.hasOwnProperty(transitionStyle);
    }

    function checkNum(num) {
        return num !== undefined && num !== null && !isNaN(num);
    }

    function checkRestart(object) {
        var restart = false;
        for (var i = 0; i < _transitionArray.length; ++i) {
            var item = _transitionArray[i];
            if (object === item.object) {
                restart = true;
                item.removed = true;
                // Remove item from the array because transition will be restarted with corresponding new object
                // and the old flow will not continue in the next animation loop. The new object will be included
                // into the array later in the flow.
                _transitionArray.splice(i, 1);
                break;
            }
        }
        return restart;
    }

    function removeTransitionObject(object) {
        if (object) {
            var index = _transitionArray.indexOf(object);
            if (index !== -1) {
                _transitionArray.splice(index, 1);
            }
        }
    }

    function transition(object) {
        if (object && !object.removed && object.callback !== undefined && object.callback !== null && checkNum(object.beginValue) && checkNum(object.targetValue) && checkTransitionStyle(object.transitionStyle) && checkNum(object.transitionTime) && object.transitionTime >= 0) {
            if (object.beginTime === undefined) {
                object.beginTime = new Date();
            }
            var begin = object.beginTime.getTime();
            var end = begin + object.transitionTime;
            var time = (new Date()).getTime();
            if (time >= end || !object.transitionTime) {
                // Transition is ready.
                // Make sure final value is the exact target value.
                object.callback(object.targetValue);
                // Remove from the array because flow has ended.
                removeTransitionObject(object);

            } else {
                // Transition not ready yet.
                // Update current value according to the transition style.
                var newValue = object.beginValue + (object.targetValue - object.beginValue) * _easingFormulas[object.transitionStyle]((time - begin) / object.transitionTime);
                object.callback(newValue);
                // Continue transition.
                requestAnimationFrame(function() {
                    transition(object);
                });
            }

        } else {
            // Flow did not continue. So, remove object.
            removeTransitionObject(object);
        }
    }

    /**
     * See API for function and paremeters description.
     */
    function opacityTransition(object, targetValue, transitionStyle, time) {
        if (object) {
            checkRestart(object);
            var transitionObject = {
                object : object,
                callback : object.setOpacity,
                beginValue : object.getOpacity(),
                targetValue : targetValue,
                transitionStyle : transitionStyle,
                transitionTime : time
            };
            // Push object into the transition array.
            // Then, checks know that it is already in use.
            // It will be removed in the end of the flow.
            _transitionArray.push(transitionObject);
            transition(transitionObject);
        }
    }

    /**
     * =========================================
     * Public API is returned here.
     * =========================================
     */
    return {
        /**
         * @method opacityTransition
         *
         * Change the opacity of the given object.
         * Notice, object needs to have {setOpacity(opacity)} and {getOpacity()} functions.
         *
         * @param {Object} object Object whose opacity is changed.
         *                        May be {undefined} or {null} but then operation is ignored.
         * @param {Float} targetValue Target opacity value that transition should change towards to.
         * @param {String} transitionStyle Style that should be used for transition.
         *                                 Supported styles are:
         *                                 "linear", "ease-in", "ease-out", "ease-in-out",
         *                                 "back-in", "back-out", "bounce", "elastic".
         *                                 Operation is ignored if style is not recognized.
         * @param {Integer} time Transition time in milliseconds.
         */
        opacityTransition : opacityTransition
    };

})();
