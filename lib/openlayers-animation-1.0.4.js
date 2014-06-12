// Strict mode for whole file.
"use strict";

/**
 * @requires OpenLayers/Layer.js
 * @requires OpenLayers/Layer/Animation/internal/ConfigUtils.js
 * @requires OpenLayers/Layer/Animation/LayerContainer.js
 */

// Strict mode for whole file.
// "use strict";

/**
 * Class: OpenLayers.Layer.Animation
 * This is a parent class that more specific animation child classes inherit.
 * See, {OpenLayers.Layer.Animation.Wms} and {OpenLayers.Layer.Animation.Wmts}.
 * Instead of directly using this parent class, use child classes that provide more
 * specific implementation and guiding comments to create animations.
 *
 * Instance of the animation class allows viewing of WMS or WMTS layers as an animation.
 * Layer tiles may be loaded from a service that implements OGC WMS or WMTS.
 *
 * An instance of this class creates an animation by loading WMS or WMTS tiles for map layers from the service.
 * The map layers are used as animation frames by this animation layer.
 *
 * Notice, this class uses {OpenLayers.Events} style to trigger following events for registered listeners:
 * - animationloadstarted -- Inform when animation load is started for all the frames.
 *                           Event object: see frameloadstarted event object below.
 * - frameloadstarted -- Inform when a new frame load is started.
 *                       Notice, this is a frame layer specific and not frame layer group or whole animation layer specific.
 *                       Event object:
 *                          {
 *                              layer : _me,
 *                              events : [
 *                                  {
 *                                      // Time value for the frame as Date object.
 *                                      time : {Date},
 *                                      // Error, if any, of the loading operation.
 *                                      error : {Object|undefined}
 *                                  },
 *                                  ...
 *                              ]
 *                          }
 * - animationloadframeprogress -- Inform about loading progresses when a new frame has been loaded.
 *                                 Event object: see frameloadstarted event object above.
 * - animationloadgroupprogress -- Inform about loading progresses when a new frame group has been loaded.
 *                                 Event object: see frameloadstarted event object above.
 * - animationloadcomplete -- Inform that animation loading has been completed.
 *                            Event object: see frameloadstarted event object above.
 * - framechanged -- Inform when animation frame has been changed or current frame is requested to be shown again.
 *                   Event object: see frameloadstarted event object above.
 *
 * Notice, when {#setController} function is used, this class automatically uses {OpenLayers.Events} style and registers
 * itself to listen for following controller events:
 * - periodchanged -- Inform when animation should load frames for the given time period.
 *                    Event object: { begin : {Date|Integer}, end : {Date|Integer}, resolution : {Integer} }
 * - reload -- Inform that animation should reload frames with prviously defined time period.
 *             Event object : undefined
 *                                  Integer values descibe milliseconds.
 * - timechanged -- Inform when frame for the certain time should be shown in animation.
 *                  Event object: { time : {Date|Integer} }
 *                                Integer value describe milliseconds.
 * - start -- Inform when the animation should be started as automatic animation flow.
 *            Event object: undefined
 * - pause -- Inform that the animation should be paused. Flow pauses to the current frame.
 *            Event object: undefined
 * - stop -- Inform that the animation should be stopped. Sets the first frame to be current frame.
 *           Event object: undefined
 * - previous -- Infrom that previous animation frame should be shown.
 * - next -- Inform that next animation frame should be shown.
 * - frameratechanged -- Inform when animation should change its framerate.
 *                       Event object: { value : {Integer} }
 *                       Integer value describes frame rate speed vaguely in milliseconds. Value should be zero or greater.
 *                       Zero means the fastest possible frame rate. Greater the value, slower the animation.
 *
 * Notice, {OpenLayers.Events} class provides a good implementation for general controller objects that may be used
 * to control an animation flow among other components whose flow should be synced with the animation.
 *
 * See, {OpenLayers.Layer.Animation.Wms} and {OpenLayers.Layer.Animation.Wmts} for configuration examples.
 * Instead of directly using this parent class, use child classes that provide more specific implementation
 * and guiding comments to create animation configurations. Below, the configuration structure is shown as part
 * of the example code, even if child classes provide the better way to use this.
 * Example:
 * (code)
 * var ctrl = { events : new OpenLayers.Events(this) };
 * var config = {
 *     // Mandatory properties that are used to configure WMTS animation.
 *     // These are required if WMTS should be used.
 *     wmts : {
 *         // These are mandatory configuration properties for OpenLayers.Layer.WMTS.
 *         url : "http://www.somesuitableurl.com/",
 *         layer : "some_layer",
 *         style : "some_style",
 *         matrixSet : "EPSG:3067",
 *         // These are non-mandatory properties.
 *         // Do not show frames in switcher because they are internally used layers.
 *         displayInLayerSwitcher : false,
 *         // Default value that should be used for animation.
 *         isBaseLayer : false,
 *         // Default value that should be used for animation.
 *         format : "image/png",
 *         // This params object contains non-mandatory extra parameters to include in tile requests.
 *         params : {
 *         },
 *         animation : { // See comments below for details. }
 *     },
 *     // An alternative option for above WMTS properties is WMS that is shown below.
 *     // Notice, if WMTS is defined then it will be used and WMS configuration is ignored.
 *     //
 *     // Mandatory properties that are used to configure WMS animation.
 *     // These are required if WMS should be used.
 *     url : "http://www.somesuitableurl.com/",
 *     wms : {
 *         // Properties added into this params object will be added to
 *         // the WMS GetMap requests used for this layer’s tiles.
 *         // The only mandatory parameter is “layers”.
 *         params : {
 *             layers : "some_layer",
 *             // Default value that should be used for animation.
 *             transparent : true,
 *             // Default value that should be used for animation.
 *             format : "image/png"
 *         },
 *         // Hashtable of extra options to tag onto the layer.
 *         // These options include all params properties listed above.
 *         options : {
 *             // Default value that should be used for animation.
 *             singleTile : false,
 *             // Default value that should be used for animation.
 *             displayInLayerSwitcher : false,
 *             // Default value that should be used for animation.
 *             isBaseLayer : false,
 *             animation : { // See comments below for details. }
 *         }
 *     }
 * };
 *
 * This object may be included into configuration. See, above into which object.
 *     // This animation object contains non-mandatory extra parameters to configure animation.
 *     // This is common for both WMS and WMTS animations.
 *     // If animation property is given, it will be used instead of possible hard coded default value.
 *     // Also, if an event or setter functions are used later to define corresponding values, their values
 *     // will be used instead of config values.
 *     animation : {
 *         // Flag to inform if legend may be requested for the layer. Notice, default is false.
 *         // Also notice, this value is inherited as a default value by period specific layers
 *         // if they are defined (see below). May be left {undefined}.
 *         hasLegend : {Boolean},
 *         // Time period specific animation frames may be named. Then, the frame uses the name for the layer and
 *         // the time period specific name is given when legend is requested via API. Notice, this value is
 *         // inherited as a default value by period specific layers if they are defined. May be left {undefined}.
 *         name : {String},
 *         // Layer name for certain time interval.
 *         // {endTime} may be left {undefined} for the layer object in the {layers} array.
 *         // This means that all the times after {beginTime} are included for that layer.
 *         // {hasLegend} Time period specific value. If set, overrides the animation level value.
 *         // {name} Time period specific name for the layer. If set, overrides the animation level value.
 *         layers : [ { beginTime : {Integer|Date}, endTime : {Integer|Date}, layer: {String}, hasLegend : {Boolean}, name : {String} }, ... ],
 *         // Animation period information.
 *         beginTime : {Integer|Date},
 *         endTime : {Integer|Date},
 *         resolutionTime : {Integer},
 *         // Defines maximum number of asynchronous frame load operations.
 *         // Use to limit number of operations.
 *         maxAsyncLoadCount : {Integer},
 *         // Load automatically when configuration is set.
 *         // Notice, if autoLoad is set {true}, animation properties beginTime, endTime, resolutionTime
 *         // need to be given also. Otherwise, animation load can not be started.
 *         autoLoad : {Boolean},
 *         // Animation play information.
 *         // Framerate in milliseconds.
 *         frameRate : {Integer},
 *         // Animation is automatically started when frame content is available if {autoStart} is set to {true}.
 *         autoStart : {Boolean},
 *         // Animation frame fading information.
 *         // These are used for opacity transitions as transition duration in milliseconds and transition timing function.
 *         // Supported timingFunctions are:
 *         //   - "linear", "ease-in", "ease-out" (default), "ease-in-out", "back-in", "back-out", "bounce", "elastic"
 *         //   -- Notice, CSS transition is not used in implementation even if some of the names are same.
 *         //      Instead, internal JavaScript implementation is used for these.
 *         // Notice, time is in milliseconds.
 *         // Notice also, other properties are not mandatory if one is given.
 *         fadeIn : { time : {Integer}, timingFunction : {String} },
 *         // In addition to {time} and {timingFunction}, {fadeOut} may define opacity values for fade out steps.
 *         // Notice, {undefined}, {null}, empty {fadeOut} array [], or [0] all mean frame fade out in a single step
 *         // after new frame is shown. Normally, last value should be zero. For example, [0.5, 0.2, 0] defines
 *         // fade out of three steps. The most recent frame replaced by new frame will be faded out to opacity
 *         // value of 0.5, the frame before it to 0.2 and frame before it to 0. During animation, frames will go
 *         // through these fade out steps and finally frames will be set transparent when fade out flow progresses.
 *         // If last value is not zero, the frames are left visible with that opacity value after fade out flow has
 *         // passed for them. Notice, if fade out time is longer than frame rate and opacity steps have been defined,
 *         // fade out may not have enough time to finish. Then, new steps will reset the opacity target values for
 *         // frames in opacity transition. In such cases, it may be better just to define {time} and {timingFunction}
 *         // and no {opacities} steps for animation {fadeOut} configuration. Then, longer fade outs may be defined
 *         // for frames and multiple frame fade outs may occur asynchronously without extra steps. Also, new
 *         // {timingFunctions} may need to be implemented for this library for such cases.
 *         fadeOut : { time : {Integer}, timingFunction : {String}, opacities : {Array(Float)} }
 *     }
 *
 * // Notice, use childe classes instead of using this parent class directly.
 * var animation = (new OpenLayers.Layer.Animation("My Animation Layer")).registerController(ctrl.events).doSetConfig(config);
 * (end)
 *
 * Inherits from:
 *  - <OpenLayers.Layer>
 */
OpenLayers.Layer.Animation = OpenLayers.Class(OpenLayers.Layer, {

    /**
     * @method registerController
     * Public API method that is set when object is initialized.
     *
     * Notice, description comments of this class inform about controller events that this class instance registers for.
     *
     * In normal use case, only one controller should be adequate. Then, the same controller may also control multiple
     * components and keep their flows in sync with each other. But, multiple controllers may also be registered for a single
     * animation if UI design requires that.
     *
     * @param {OpenLayers.Events} controller This animation instance registers to listen controller events of given controller.
     *                                       May be {undefined} and {null}. Then, operation is ignored.
     * @return {OpenLayers.Layer.Animation} Reference to {this} object. Then, this function call can easily be
     *                                      chained to other calls when a new instance of this class is created.
     *                                      May not be {undefined} or {null}.
     */
    registerController : undefined,

    /**
     * @method unregisterController
     * Public API method that is set when object is initialized.
     *
     * Notice, description comments of this class inform about controller events that this class instance registers for.
     * This function unregisters this animation instance from listening those controller events.
     *
     * @param {OpenLayers.Events} controller This animation instance unregisters to listen controller events of given controller.
     *                                       May be {undefined} and {null}. Then, operation is ignored.
     * @return {OpenLayers.Layer.Animation} Reference to {this} object. Then, this function call can easily be
     *                                      chained to other method calls of this animation instance.
     *                                      May not be {undefined} or {null}.
     */
    unregisterController : undefined,

    /**
     * @method doSetConfig
     * Public API method that is set when object is initialized.
     *
     * Notice, this function is meant as "protected" function for child classes that provide the "public"
     * {#setConfig} function. So, child classes use this function on top of their own implementation. Also,
     * notice that this class and this function should only be used by child classes and animation functionality
     * should be used through the child classes.
     *
     * Sets new configuration object for animation.
     *
     * Notice, changes in configuration may not fully take effect before animation is reloaded.
     *
     * @param {Object} config Hashtable of configurations for the animation.
     *                        Notice, some of the properties are mandatory.
     *                        Example code in description of this class provides configuration structure descriptions.
     *                        Also notice, if both WMTS and WMS configurations are provided same time,
     *                        WMTS is used for operations. May be {undefined} or {null} but proper configuration
     *                        may be required when animation content is loaded.
     * @return {OpenLayers.Layer.Animation} Reference to {this} object. Then, this function call can easily be
     *                                      chained to other calls when a new instance of this class is created.
     *                                      May not be {undefined} or {null}.
     */
    doSetConfig : undefined,

    /**
     * @method getConfig
     * Public API method that is set when object is initialized.
     *
     * Get current configuration object for animation.
     *
     * @return {Object} Hashtable of configurations for the animation.
     *                  May be {undefined} or {null}.
     */
    getConfig : undefined,

    /**
     * @method getLegendInfo
     * Public API method that is set when object is initialized.
     *
     * Get legend information for animation frame layers.
     *
     * Legend information object structure:
     *   {
     *     // Name of the layer.
     *     // May be {undefined}, {null} or empty.
     *     name : {String},
     *     // URL to load legend image for the layer.
     *     // May not be {undefined}, {null} or empty.
     *     url : {String},
     *     // Flag to inform if legend should be available in the server
     *     // according to the configuration information.
     *     hasLegend : {Boolean}
     *   }
     *
     * @return {[]} Array of frame layer legend information objects.
     *              May not be {undefined} or {null}. May be empty if
     *              layer has not been initialized properly or if legend
     *              is not included in the configuration.
     */
    getLegendInfo : undefined,

    /**
     * @method setOpacity
     * Public API method that is set when object is initialized.
     *
     * See {OpenLayers.Layer.setVisibility()} for description.
     * This uses the parent implementation and also changes visibility
     * of animation frames accordingly.
     *
     * @param {Boolean} visibility Layer and its contents are visible if {true}.
     */
    setVisibility : undefined,

    /**
     * @method setOpacity
     * Public API method that is set when object is initialized.
     *
     * See {OpenLayers.Layer.setOpacity()} for description.
     * Sets the opacity for the entire layer (all images).
     * This uses the parent implementation and also changes opacity
     * of animation frames accordingly.
     *
     * @param {Float} opacity Float number between 0.0 and 1.0.
     */
    setOpacity : undefined,

    /**
     * Constructor: OpenLayers.Layer.Animation
     * This is used as class constructor by OpenLayers framework
     * when a new class instance is created.
     *
     * @param {String} name The layer name that is used when layer information is displayed in UI.
     *                      From the usability point of view, a proper name should always be given.
     *                      May be {undefined} or {null}.
     * @param {Object} options Hashtable of extra options to tag onto the layer.
     *                         See {OpenLayers.Layer} constructor for more information about this.
     *                         May be {undefined} or {null}.
     */
    initialize : function(name, options) {
        // Initialize parent first.
        OpenLayers.Layer.prototype.initialize.call(this, name, options);

        // Private variables and initializations.

        var _me = this;

        // Observer object for layer container events. Acts as an observer interface.
        var _layerContainerObserver = {
            // Notice, these functions are actually set for this object later
            // when private functions are defined for this class. Here, the
            // function names are just defined.
            loadAnimationStartedCallback : undefined,
            loadFrameStartedCallback : undefined,
            loadFrameCompleteCallback : undefined,
            loadGroupProgressCallback : undefined,
            loadCompleteCallback : undefined,
            frameContentReleasedCallback : undefined,
            frameChangedCallback : undefined
        };
        var _layerContainer = new OpenLayers.Layer.Animation.LayerContainer(_layerContainerObserver);

        // See setController function for controller event registering and unregistering.
        var _controllerEvents = {
            scope : _me,
            // Notice, these functions are actually set for this object later
            // when private functions are defined for this class. Here, the
            // function names are just defined.
            periodchanged : undefined,
            reload : undefined,
            timechanged : undefined,
            start : undefined,
            pause : undefined,
            stop : undefined,
            previous : undefined,
            next : undefined,
            frameratechanged : undefined
        };

        // Functions for layer events are defined here.
        // This layer implementation registers to listen its own OpenLayers layer events
        // after functions are defined below. Then, actions can be assigned to events.
        var _layerEvents = {
            scope : _me,
            // Map related events.
            // Notice, these functions are actually set for this object later
            // when private functions are defined for this class. Here, the
            // function names are just defined.
            added : undefined,
            removed : undefined
        };

        // Private methods are defined here inside constructor function.
        // Then, they are also available for the public methods that are
        // defined and set below and may use private variables that are also
        // defined in the constructor.

        var doCallback = function(eventName, objects) {
            // Event object that will be published to the listeners.
            var animationEvent = {
                layer : _me,
                events : []
            };
            if (objects) {
                for (var i = 0; i < objects.length; ++i) {
                    var event = {
                        // Time value for the frame.
                        time : new Date(OpenLayers.Layer.Animation.ConfigUtils.getTimeFromConfig(objects[i].getConfig())),
                        // Error, if any, of the loading operation.
                        error : objects[i].getError(),
                    };
                    animationEvent.events.push(event);
                }
            }
            // Trigger event asynchronously.
            setTimeout(function() {
                // Events may not exist if map has been destroyed.
                if (_me.events) {
                    // Trigger event in OpenLayers style.
                    // Then listeners that have registered for this layer
                    // for this event will be informed.
                    _me.events.triggerEvent(eventName, animationEvent);
                }
            }, 0);
        };

        _layerContainerObserver.loadAnimationStartedCallback = function(objects) {
            // Inform when animation load is started for all the frames.
            // Notice, this is whole animation specific, not frame or group specific.
            doCallback("animationloadstarted", objects);
        };

        _layerContainerObserver.loadFrameStartedCallback = function(objects) {
            // Inform when new frame load is started.
            // Notice, this is frame layer specific and
            // not frame layer group or whole animation layer specific.
            doCallback("frameloadstarted", objects);
        };

        _layerContainerObserver.loadFrameCompleteCallback = function(objects) {
            // Inform when loading progresses and
            // a new frame has been loaded.
            doCallback("frameloadcomplete", objects);
        };

        _layerContainerObserver.loadGroupProgressCallback = function(objects) {
            // Inform when loading progresses and
            // a new frame group has been loaded.
            doCallback("animationloadgroupprogress", objects);
        };

        _layerContainerObserver.loadCompleteCallback = function(objects) {
            // Inform when animation loading has been completed.
            doCallback("animationloadcomplete", objects);
        };

        _layerContainerObserver.frameContentReleasedCallback = function(objects) {
            // Inform when animation frame content has been released.
            doCallback("animationframecontentreleased", objects);
        };

        _layerContainerObserver.frameChangedCallback = function(objects) {
            // Inform when animation frame has been changed
            // or current frame is requested to be shown again.
            doCallback("framechanged", objects);
        };

        _controllerEvents.periodchanged = function(event) {
            if (event) {
                // Call operation asynchronously.
                setTimeout(function() {
                    // Notice, container ignores set operation if given value is undefined.
                    _layerContainer.setBeginTime(event.begin);
                    _layerContainer.setEndTime(event.end);
                    _layerContainer.setResolutionTime(event.resolution);
                    if (_me.map) {
                        _layerContainer.loadAnimation();
                    }
                }, 0);
            }
        };

        _controllerEvents.reload = function() {
            setTimeout(function() {
                if (_me.map) {
                    _layerContainer.loadAnimation();
                }
            }, 0);
        };

        _controllerEvents.timechanged = function(event) {
            if (event) {
                // Call operation asynchronously.
                setTimeout(function() {
                    _layerContainer.showFrame(event.time);
                }, 0);
            }
        };

        _controllerEvents.start = function() {
            // Call operation asynchronously.
            setTimeout(function() {
                _layerContainer.startAnimation();
            }, 0);
        };

        _controllerEvents.pause = function() {
            // Call operation asynchronously.
            setTimeout(function() {
                _layerContainer.pauseAnimation();
            }, 0);
        };

        _controllerEvents.stop = function() {
            // Call operation asynchronously.
            setTimeout(function() {
                _layerContainer.stopAnimation();
            }, 0);
        };

        _controllerEvents.previous = function() {
            // Call operation asynchronously.
            setTimeout(function() {
                _layerContainer.showPreviousFrame();
            }, 0);
        };

        _controllerEvents.next = function() {
            // Call operation asynchronously.
            setTimeout(function() {
                _layerContainer.showNextFrame();
            }, 0);
        };

        _controllerEvents.frameratechanged = function(event) {
            if (event) {
                // Call operation asynchronously.
                setTimeout(function() {
                    _layerContainer.setFrameRate(event.value);
                }, 0);
            }
        };

        _layerEvents.added = function(event) {
            if (event && event.layer === _me) {
                // Call operation asynchronously.
                setTimeout(function() {
                    // This layer was added to the map.
                    _layerContainer.setMap(event.map);
                }, 0);
            }
        };

        _layerEvents.removed = function(event) {
            if (event && event.layer === _me) {
                // Call operation asynchronously.
                setTimeout(function() {
                    // This layer was removed from the map.
                    // Also, releaset sub layers.
                    _layerContainer.reset();
                    _layerContainer.setMap(undefined);
                }, 0);
            }
        };

        var registerController = function(controller) {
            // Notice, ctrl should be OpenLayers.Events object.
            if (controller) {
                if (!( controller instanceof OpenLayers.Events)) {
                    throw "ERROR: Controller should be OpenLayers.Events object!";
                }
                // Register to listen controller events.
                controller.on(_controllerEvents);
            }
            return _me;
        };

        var unregisterController = function(controller) {
            if (controller) {
                if (!( controller instanceof OpenLayers.Events)) {
                    throw "ERROR: Controller should be OpenLayers.Events object!";
                }
                // Unregister to listen controller events if registered before.
                controller.un(_controllerEvents);
            }
            return _me;
        };

        var doSetConfig = function(config) {
            // Make sure that sub-layers have same visibility as this layer.
            // The initialization may have given this layer visibility which should
            // also effect to sub-layer visibilities.
            _layerContainer.setVisibility(_me.getVisibility());
            // Also, handle opacity same way as visibility.
            _layerContainer.setOpacity(_me.opacity);
            // Set animation config values normally.
            _layerContainer.setConfig(config);
            return _me;
        };

        var getConfig = function() {
            return _layerContainer.getConfig();
        };

        var getLegendInfo = function() {
            return _layerContainer.getLegendInfo();
        };

        var setVisibility = function(visibility) {
            OpenLayers.Layer.prototype.setVisibility.call(this, visibility);
            _layerContainer.setVisibility(visibility);
        };

        var setOpacity = function(opacity) {
            OpenLayers.Layer.prototype.setOpacity.call(this, opacity);
            _layerContainer.setOpacity(opacity);
        };

        // Private initializations.
        // This is done after necessary functions have been defined.

        // Register this layer implementation to listen its own OpenLayers layer events.
        // Then, actions can be assigned to events.
        _me.events.on(_layerEvents);

        // Public methods that are meant for testing purposes
        // but not as part of the real API are set here.

        // Notice, this public method is provided mainly for testing and debugging purposes.
        // It may also be used in some special cases, if animation should directly be managed
        // by using container functions instead of using animation API and events.
        // In normal use case, other API functionality should be used instead of directly accessing the container.
        // @return {OpenLayers.Layer.Animation.LayerContainer} Container object. May not be {undefined} or {null}.
        this._getContainer = function() {
            return _layerContainer;
        };

        // Public API variables and methods are set here.
        // Then, they may also use private member variables and methods.
        // See, API descriptions outside of the constructor.

        // See API for method description.
        this.registerController = registerController;

        // See API for method description.
        this.unregisterController = unregisterController;

        // See API for method description.
        this.doSetConfig = doSetConfig;

        // See API for method description.
        this.getConfig = getConfig;

        // See API for method description.
        this.getLegendInfo = getLegendInfo;

        // See API for method description.
        this.setVisibility = setVisibility;

        // See API for method description.
        this.setOpacity = setOpacity;
    },

    CLASS_NAME : "OpenLayers.Layer.Animation"
});

/**
 * @requires OpenLayers/Layer/Animation/Animation.js
 */

// Strict mode for whole file.
// "use strict";

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

/**
 * @requires OpenLayers/Layer/Animation/Animation.js
 */

// Strict mode for whole file.
// "use strict";

/**
 * Class: OpenLayers.Layer.Animation.Wms
 * Instance of the animation class allows viewing of WMS layers as an animation.
 * Layer tiles may be loaded from a service that implements OGC WMS.
 *
 * Notice, {OpenLayers.Layer.Animation} is the parent class of this class and provides
 * the actual animation implementation.
 *
 * Notice also, this child class provides {#setConfig} function as an alternative to
 * the constructor parameters. Constructor parameters and {#setConfig} may be used for animation
 * WMTS configurations and for request parameters that animation {OpenLayers.Layer.WMTS} sub-layers
 * require.
 *
 * See {OpenLayers.Layer.Animation} class for more information about animation layer itself.
 *
 * Example:
 * (code)
 * var ctrl = { events : new OpenLayers.Events(this) };
 * var baseUrl = "http://www.somesuitableurl.com/";
 * var params = { layers : "some_layer" };
 * // Notice, you may also define animation specific configurations already by giving values inside options object.
 * var options = { animation : { beginTime : {Date}, endTime : {Date}, resolutionTime : {Integer}, autoLoad : true, autoStart : true } };
 * var animation = (new OpenLayers.Layer.Animation.Wms("My Animation Layer", baseUrl, params, options)).registerController(ctrl.events);
 * // Alternative way to create layer by using setConfig instead of giving configuration as constructor parameters.
 * // var animation = (new OpenLayers.Layer.Animation.Wms("Animation Layer")).registerController(MyController.events).setConfig(baseUrl, params);
 * (end)
 *
 * Inherits from:
 *  - <OpenLayers.Layer.Animation>
 */
OpenLayers.Layer.Animation.Wms = OpenLayers.Class(OpenLayers.Layer.Animation, {

    /**
     * @method setConfig
     * Public API method that is set when object is initialized.
     *
     * Sets new configuration object for WMS animation {OpenLayers.Layer.WMS} sub-layer frames.
     *
     * Notice, changes in configuration may not fully take effect before animation is reloaded.
     *
     * Notice, this function also sets default values for configuration objects to make sure that animation
     * works properly.
     *
     * See also {OpenLayers.Layer.WMS} constructor description for more information about the function parameters.
     * Parameter objects given for this function will eventually be given for an {OpenLayers.Layer.WMS} layers that
     * are used as animation frames. Notice, layer name is not given for this function because it is not needed for
     * animation frames that are used as sub-layers.
     *
     * @param {String} url Base url for the {OpenLayers.Layer.WMS} sub-layer frames. May not be {undefined}, {null} or empty.
     * @param {Object} params An object with key/value pairs representing the GetMap query string parameters and parameter values.
     *                        The mandatory parameter is “params.layers”. May not be {undefined} or {null}.
     * @param {Object} options Hashtable of extra options to tag onto {OpenLayers.Layer.WMS} sub-layer frames.
     *                         These options include all properties listed above, plus the ones inherited from superclasses.
     *                         May be {undefined} or {null}.
     * @return {OpenLayers.Layer.Animation} Reference to {this} object. Then, this function call can easily be
     *                                      chained to other calls when a new instance of this class is created.
     *                                      May not be {undefined} or {null}.
     */
    setConfig : undefined,

    /**
     * Constructor: OpenLayers.Layer.Animation.Wms
     * This is used as class constructor by OpenLayers framework
     * when a new class instance is created.
     *
     * See also {OpenLayers.Layer.WMS} constructor description for more information about the parameters.
     * Constructor parameters here are used for {OpenLayers.Layer.WMS} sub-layer frames of this animation layer.
     *
     * @param {String} name The layer name that is used when layer information is displayed in UI.
     *                      From the usability point of view, a proper name should always be given.
     *                      May be {undefined} or {null}.
     * @param {String} url Base url for {OpenLayers.Layer.WMS} sub-layer frames.
     *                     May be {undefined} if configuration is set later by using {#setConfig} function.
     *                     Otherwise, may not be left {undefined}, {null} or empty. Notice, {params} is required
     *                     if this is given.
     * @param {Object} params An object with key/value pairs representing the GetMap query string parameters
     *                        and parameter values for {OpenLayers.Layer.WMS} sub-layer frames.
     *                        May be {undefined} if configuration is set later by using {#setConfig} function.
     *                        Otherwise, may not be left {undefined} or {null}. The mandatory parameter is “params.layers”.
     *                        Notice, {url} is required if this is given.
     * @param {Object} options Hashtable of extra options to tag onto the {OpenLayers.Layer.WMS} sub-layer frames.
     *                         These options include all properties listed above, plus the ones inherited from superclasses.
     *                         Notice, {url} and  {params} are required if this is given.
     *                         May be {undefined} or {null}.
     * @param {Object} myOptions Hashtable of extra options to tag specifically onto this layer.
     *                           See {OpenLayers.Layer} constructor for more information about this.
     *                           May be {undefined} or {null}. Then, if {options} parameter is given,
     *                           its content is provided for parent class as options. For example,
     *                           then possible visibility option is handled automatically during
     *                           instantiation.
     */
    initialize : function(name, url, params, options, myOptions) {
        // Initialize parent first.
        // Notice, by using call function and this instance as the context,
        // the public methods that the parent sets during initialization are
        // actually set as methods for this child instance. Then, parent
        // functionality that uses member variables is available for this
        // child class and also public methods that parent provides
        // are available for this child and via this child.
        OpenLayers.Layer.Animation.prototype.initialize.call(this, name, myOptions || options);

        // Private variables and initializations.

        var _me = this;

        // Private methods are defined here inside constructor function.
        // Then, they are also available for the public methods that are
        // defined and set below and may use private variables that are also
        // defined in the constructor.

        var setConfig = function(url, params, options) {
            // Check that mandatory values are given.
            if (!url || !params || !params.layers) {
                throw "ERROR: Configuration error!";
            }
            // Wrapper configuration object contains the correct structure for animation
            // parent class that is used to create the animation.
            var wrapper = {
                url : url,
                wms : {
                    // Properties added into this params object will be added to
                    // the WMS GetMap requests used for this layer’s tiles.
                    // The only mandatory parameter is “layers”.
                    params : params,
                    // Hashtable of extra options to tag onto the layer.
                    // These options include all params properties listed in params.
                    options : options || {}
                }
            };
            // Set the default values that animation should have, unless explicitly given.
            if (wrapper.wms.params.transparent === undefined || wrapper.wms.params.transparent === null) {
                wrapper.wms.params.transparent = true;
            }
            if (wrapper.wms.params.format === undefined || wrapper.wms.params.format === null) {
                wrapper.wms.params.format = "image/png";
            }
            if (wrapper.wms.options.singleTile === undefined || wrapper.wms.options.singleTile === null) {
                // As a default load multiple tiles.
                wrapper.wms.options.singleTile = false;
            }
            if (wrapper.wms.options.displayInLayerSwitcher === undefined || wrapper.wms.options.displayInLayerSwitcher === null) {
                // As a default sub-layer should not be shown in switcher.
                wrapper.wms.options.displayInLayerSwitcher = false;
            }
            if (wrapper.wms.options.isBaseLayer === undefined || wrapper.wms.options.isBaseLayer === null) {
                // As a default sub-layer should not be a base-layer.
                wrapper.wms.options.isBaseLayer = false;
            }

            // Use parent implementation to handle the actual configuration.
            return _me.doSetConfig(wrapper);
        };

        // Private initializations.
        // This is done after necessary functions have been defined.

        // Initialize with the configurations given in constructor parameters.
        if (url || params || options) {
            setConfig(url, params, options);
        }

        // Public API variables and methods are set here.
        // Then, they may also use private member variables and methods.
        // See, API descriptions outside of the constructor.

        // See API for method description.
        this.setConfig = setConfig;
    },

    CLASS_NAME : "OpenLayers.Layer.Animation.Wms"
});

/**
 * @requires OpenLayers/Layer/Animation/Animation.js
 */

// Strict mode for whole file.
// "use strict";

/**
 * Class: OpenLayers.Layer.Animation.Wmts
 * Instance of the animation class allows viewing of WMTS layers as an animation.
 * Layer tiles may be loaded from a service that implements OGC WMTS.
 *
 * Notice, {OpenLayers.Layer.Animation} is the parent class of this class and provides
 * the actual animation implementation.
 *
 * Notice also, this child class provides {#setConfig} function as an alternative to
 * the constructor parameters. Constructor parameters and {#setConfig} may be used for animation
 * WMTS configurations and for request parameters that animation {OpenLayers.Layer.WMTS} sub-layers
 * require.
 *
 * See {OpenLayers.Layer.Animation} class for more information about animation layer itself.
 *
 * Example:
 * (code)
 * var ctrl = { events : new OpenLayers.Events(this) };
 * var config = {
 *     name : "My Animation Layer", url : "http://www.somesuitableurl.com/", layer : "some_layer",
 *     style : "some_style", matrixSet : "EPSG:3067",
 *     // Notice, you may also define animation specific configurations already by giving values inside configuration object.
 *     animation : { beginTime : {Date}, endTime : {Date}, resolutionTime : {Integer}, autoLoad : true, autoStart : true }
 * };
 * var animation = (new OpenLayers.Layer.Animation.Wmts(config)).registerController(ctrl.events);
 * // Alternative way to create layer by using setConfig instead of giving configuration as constructor parameters.
 * // var animation = (new OpenLayers.Layer.Animation.Wmts(undefined, "Animation Layer")).registerController(MyController.events).setConfig(config);
 * (end)
 *
 * Inherits from:
 *  - <OpenLayers.Layer.Animation>
 */
OpenLayers.Layer.Animation.Wmts = OpenLayers.Class(OpenLayers.Layer.Animation, {

    /**
     * @method setConfig
     * Public API method that is set when object is initialized.
     *
     * Sets new configuration object for WMTS animation {OpenLayers.Layer.WMTS} sub-layer frames.
     *
     * Notice, changes in configuration may not fully take effect before animation is reloaded.
     *
     * Notice, this function also sets default values for configuration objects to make sure that animation
     * works properly.
     *
     * See also {OpenLayers.Layer.WMTS} constructor description for more information about the function parameters.
     * Parameter objects given for this function will eventually be given for {OpenLayers.Layer.WMTS} layers that
     * are used as animation frames.
     *
     * @param {Object} config Configuration properties for the {OpenLayers.Layer.WMTS} sub-layer frames.
     *                        Notice, some of the config properties are mandatory.
     *                        May not be {undefined} or {null}.
     * @return {OpenLayers.Layer.Animation} Reference to {this} object. Then, this function call can easily be
     *                                      chained to other calls when a new instance of this class is created.
     *                                      May not be {undefined} or {null}.
     */
    setConfig : undefined,

    /**
     * Constructor: OpenLayers.Layer.Animation.Wmts
     * This is used as class constructor by OpenLayers framework
     * when a new class instance is created.
     *
     * See also {OpenLayers.Layer.WMTS} constructor description for more information about the {config} parameter.
     * {config} parameter given for this function will eventually be given for {OpenLayers.Layer.WMTS} layers that
     * are used as animation frames.
     *
     * @param {Object} config Configuration properties for the {OpenLayers.Layer.WMTS} sub-layer frames.
     *                        Notice, some of the config properties are mandatory.
     *                        May be {undefined} if configuration is set later by using {#setConfig} function.
     *                        Otherwise, may not be left {undefined} or {null}.
     * @param {String} myName The name of this specific layer. The name is used when layer information is displayed in UI.
     *                        From the usability point of view, a proper name should always be given.
     *                        May be {undefined} or {null}. Notice, if {config} contains name parameter, it is used instead.
     * @param {Object} myOptions Hashtable of extra options to tag specifically onto this layer.
     *                           See {OpenLayers.Layer} constructor for more information about this.
     *                           May be {undefined} or {null}. Then, if {config} parameter is given,
     *                           its content is provided for parent class as options. For example,
     *                           then possible visibility option is handled automatically during
     *                           instantiation.
     */
    initialize : function(config, myName, myOptions) {
        // Initialize parent first.
        // Notice, by using call function and this instance as the context,
        // the public methods that the parent sets during initialization are
        // actually set as methods for this child instance. Then, parent
        // functionality that uses member variables is available for this
        // child class and also public methods that parent provides
        // are available for this child and via this child.
        OpenLayers.Layer.Animation.prototype.initialize.call(this, (config && config.name ? config.name : myName), myOptions || config);

        // Private variables and initializations.

        var _me = this;

        // Private methods are defined here inside constructor function.
        // Then, they are also available for the public methods that are
        // defined and set below and may use private variables that are also
        // defined in the constructor.

        var setConfig = function(config) {
            // Check that mandatory values are given.
            // Notice, let the style be empty but require that it is given.
            if (!config || !config.url || !config.layer || !config.matrixSet || config.style === undefined || config.style === null) {
                throw "ERROR: Configuration error!";
            }
            // Wrapper configuration object contains the correct structure for animation
            // parent class that is used to create the animation.
            var wrapper = {
                wmts : config
            };
            // Set the default values that animation should have, unless explicitly given.
            if (wrapper.wmts.format === undefined || wrapper.wmts.format === null) {
                wrapper.wmts.format = "image/png";
            }
            if (wrapper.wmts.displayInLayerSwitcher === undefined || wrapper.wmts.displayInLayerSwitcher === null) {
                // As a default sub-layer should not be shown in switcher.
                wrapper.wmts.displayInLayerSwitcher = false;
            }
            if (wrapper.wmts.isBaseLayer === undefined || wrapper.wmts.isBaseLayer === null) {
                // As a default sub-layer should not be a base-layer.
                wrapper.wmts.isBaseLayer = false;
            }

            // Use parent implementation to handle the actual configuration.
            return _me.doSetConfig(wrapper);
        };

        // Private initializations.
        // This is done after necessary functions have been defined.

        // Initialize with the configurations given in constructor parameters.
        if (config) {
            setConfig(config);
        }

        // Public API variables and methods are set here.
        // Then, they may also use private member variables and methods.
        // See, API descriptions outside of the constructor.

        // See API for method description.
        this.setConfig = setConfig;
    },

    CLASS_NAME : "OpenLayers.Layer.Animation.Wmts"
});

/**
 * @requires OpenLayers/Layer/Animation/Animation.js
 * @requires OpenLayers/BaseTypes/Class.js
 */

// Strict mode for whole file.
// "use strict";

/**
 * Class: OpenLayers.Layer.Animation.ConfigUtils
 * Config utils provide functions that help to handle animation configuration content.
 */
OpenLayers.Layer.Animation.ConfigUtils = (function() {

    /**
     * See API for function and paremeters description.
     */
    function cloneAnimationConfig(config, time) {
        var clone;
        if (config) {
            if (config.wmts) {
                clone = cloneWmtsAnimationConfig(config, time);

            } else if (config.wms) {
                clone = cloneWmsAnimationConfig(config, time);
            }
        }
        return clone;
    }

    /**
     * See API for function and paremeters description.
     */
    function cloneWmsAnimationConfig(config, time) {
        var clone;
        if (config && config.wms) {
            // Copy properties at the root level.
            clone = {};
            OpenLayers.Util.extend(clone, config);
            // Create a new object for wms and copy its content for the clone.
            clone.wms = {};
            OpenLayers.Util.extend(clone.wms, config.wms);
            if (config.wms.params || time !== undefined && time !== null) {
                // Params object needs to be deep copied instead of shallow copied
                // or a new params object needs to be created for the time value.
                // Then, times will be frame specific instead of updating time into
                // same object each time.
                clone.wms.params = {};
                OpenLayers.Util.extend(clone.wms.params, config.wms.params);
                // Notice, time value is set in the flow for the frame.
                clone.wms.params.time = time;
            }
            // Options and animation object need to be deep copied instead of shallow copied
            // because other utils functions may also be used to update animation properties
            // from the period specific properties.
            if (config.wms.options) {
                // Create a new object and copy its content for the clone.
                clone.wms.options = {};
                OpenLayers.Util.extend(clone.wms.options, config.wms.options);
                if (config.wms.options.animation) {
                    // Create a new object and copy its content for the clone.
                    clone.wms.options.animation = {};
                    OpenLayers.Util.extend(clone.wms.options.animation, config.wms.options.animation);
                }
            }
        }
        return clone;
    }

    /**
     * See API for function and paremeters description.
     */
    function cloneWmtsAnimationConfig(config, time) {
        var clone;
        if (config && config.wmts) {
            // Copy properties at the root level.
            clone = {};
            OpenLayers.Util.extend(clone, config);
            // Create a new object for wms and copy its content for the clone.
            clone.wmts = {};
            OpenLayers.Util.extend(clone.wmts, config.wmts);
            if (config.wmts.params || time !== undefined && time !== null) {
                // Params object needs to be deep copied instead of shallow copied
                // or a new params object needs to be created for the time value.
                // Then, times will be frame specific instead of updating time into
                // same object each time.
                clone.wmts.params = {};
                OpenLayers.Util.extend(clone.wmts.params, config.wmts.params);
                // Notice, time value is set in the flow for the frame.
                clone.wmts.params.time = time;
            }
            if (config.wmts.animation) {
                // Animation object needs to be deep copied instead of shallow copied
                // because other utils functions may also be used to update animation
                // properties from the period specific properties.
                // Create a new object and copy its content for the clone.
                clone.wmts.animation = {};
                OpenLayers.Util.extend(clone.wmts.animation, config.wmts.animation);
            }
        }
        return clone;
    }

    /**
     * See API for function and paremeters description.
     */
    function getTimeFromConfig(config) {
        var time;
        if (config) {
            // WMTS configuration is the first choice.
            if (config.wmts && config.wmts.params) {
                if (config.wmts.params.time !== undefined && config.wmts.params.time !== null) {
                    time = config.wmts.params.time;

                } else if (config.wmts.params.TIME !== undefined && config.wmts.params.TIME !== null) {
                    // OpenLayers may have changed the property name to upper cases if it is used as
                    // request parameter.
                    time = config.wmts.params.TIME;
                }

            } else if (config.wms && config.wms.params) {
                if (config.wms.params.time !== undefined && config.wms.params.time !== null) {
                    time = config.wms.params.time;

                } else if (config.wms.params.TIME !== undefined && config.wms.params.TIME !== null) {
                    // OpenLayers may have changed the property name to upper cases if it is used as
                    // request parameter.
                    time = config.wms.params.TIME;
                }
            }
        }
        return time;
    }

    /**
     * See API for function and paremeters description.
     */
    function getAnimation(config) {
        var animation;
        if (config) {
            if (config.wmts && config.wmts.animation) {
                animation = config.wmts.animation;

            } else if (config.wms && config.wms.options && config.wms.options.animation) {
                animation = config.wms.options.animation;
            }
        }
        return animation;
    }

    /**
     * See API for function and paremeters description.
     */
    function getAnimationName(config) {
        var name;
        var animation = getAnimation(config);
        if (animation) {
            name = animation.name;
        }
        return name;
    }

    /**
     * See API for function and paremeters description.
     */
    function getAnimationHasLegend(config) {
        var hasLegend;
        var animation = getAnimation(config);
        if (animation) {
            hasLegend = animation.hasLegend;
        }
        return hasLegend;
    }

    /**
     * See API for function and paremeters description.
     */
    function setAnimationHasLegend(config, hasLegend) {
        if (config) {
            if (config.wmts) {
                if (!config.wmts.animation) {
                    config.wmts.animation = {};
                }
                config.wmts.animation.hasLegend = hasLegend;

            } else if (config.wms) {
                if (!config.wms.options) {
                    config.wms.options = {};
                    if (!config.wms.options.animation) {
                        config.wms.options.animation = {};
                    }
                }
                config.wms.options.animation.hasLegend = hasLegend;
            }
        }
    }

    /**
     * See API for function and paremeters description.
     */
    function getLayer(config) {
        var layer;
        if (config) {
            if (config.wmts && config.wmts.layer) {
                layer = config.wmts.layer;

            } else if (config.wms && config.wms.params && config.wms.params.layers) {
                layer = config.wms.params.layers;
            }
        }
        return layer;
    }

    /**
     * See API for function and paremeters description.
     */
    function setLayer(config, layer) {
        if (config && layer) {
            if (config.wmts) {
                config.wmts.layer = layer;

            }
            if (config.wms) {
                if (!config.wms.params) {
                    config.wms.params = {};
                }
                config.wms.params.layers = layer;
            }
        }
    }

    /**
     * See API for function and paremeters description.
     */
    function getLayerName(config) {
        var name;
        if (config) {
            if (config.wmts && config.wmts.name) {
                name = config.wmts.name;

            } else if (config.wms && config.name) {
                name = config.name;
            }
        }
        return name;

    }

    /**
     * See API for function and paremeters description.
     */
    function setLayerName(config, name) {
        if (config && name) {
            if (config.wmts) {
                config.wmts.name = name;

            } else if (config.wms) {
                config.name = name;
            }
        }
    }

    /**
     * See API for function and paremeters description.
     */
    function setFrameStyleClass(config, styleClassName) {
        if (config && styleClassName) {
            if (config.wmts) {
                // Notice, WMTS layer config does not contain options object.
                // Instead, options values are directly set under the wmts object.
                // OpenLayers.Layer.Grid uses the options objects className
                // to define stylesheet class for grid element. Set the default
                // class name if config does not already contain some value for it.
                if (!config.wmts.className) {
                    config.wmts.className = styleClassName;
                }
            }
            if (config.wms) {
                if (!config.wms.options) {
                    // Make sure options is available.
                    config.wms.options = {};
                }
                if (!config.wms.options.className) {
                    config.wms.options.className = styleClassName;
                }
            }
        }
    }

    /**
     * See API for function and paremeters description.
     */
    function setGridBuffer(config, buffer) {
        if (config && buffer !== undefined && buffer !== null && !isNaN(buffer) && buffer >= 0) {
            if (config.wmts) {
                // Notice, WMTS layer config does not contain options object.
                // Instead, options values are directly set under the wmts object.
                if (config.wmts.buffer === undefined || config.wmts.buffer === null) {
                    config.wmts.buffer = buffer;
                }
            }
            if (config.wms) {
                if (!config.wms.options) {
                    // Make sure options is available.
                    config.wms.options = {};
                }
                if (config.wms.options.buffer === undefined || config.wms.options.buffer === null) {
                    config.wms.options.buffer = buffer;
                }
            }
        }
    }

    /**
     * =========================================
     * Public API is returned here.
     * =========================================
     */
    return {
        /**
         * @method cloneAnimationConfig
         *
         * Creates a copy of the given object.
         *
         * Notice, parts of the properties are deep copied and parts shallow copied.
         * Check implementation for more details.
         *
         * Notice, if {config} object contains {wmts} property, {#cloneWmtsAnimationConfig} is used for cloning.
         * Else if {config} object contains {wms} property, {#cloneWmsAnimationConfig} is used for cloning.
         *
         * @param {Object} config Object should have structure that corresponds the configuration required by
         *                        {OpenLayers.Layer.Animation#doSetConfig} function.
         *                        Operation is ignored if {undefined} or {null}.
         * @param {Date|Integer|String} time Time may be given as its own parameter for the cloning.
         *                                   Then, this value is used instead of the value that is provided
         *                                   in {config} parameter object. This is provided mainly as a complementary
         *                                   parameter for the internal use because time value is set in the middle
         *                                   of the flow for the frames that use configurations provided during
         *                                   animation setup.
         *                                   This parameter is optional. May be {undefined} or {null}.
         * @return {Object} Clone of the given object. May be {undefined}.
         */
        cloneAnimationConfig : cloneAnimationConfig,

        /**
         * @method cloneWmsAnimationConfig
         *
         * Creates a copy of the given object.
         *
         * Notice, parts of the properties are deep copied and parts shallow copied.
         * Check implementation for more details.
         *
         * @param {Object} config Object should have structure that corresponds the WMS configuration required by
         *                        {OpenLayers.Layer.Animation#doSetConfig} function.
         *                        Operation is ignored if {undefined} or {null}.
         * @param {Date|Integer|String} time Time may be given as its own parameter for the cloning.
         *                                   Then, this value is used instead of the value that is provided
         *                                   in {config} parameter object. This is provided mainly as a complementary
         *                                   parameter for the internal use because time value is set in the middle
         *                                   of the flow for the frames that use configurations provided during
         *                                   animation setup.
         * @return {Object} Clone of the given object. May be {undefined}.
         */
        cloneWmsAnimationConfig : cloneWmsAnimationConfig,

        /**
         * @method cloneWmtsAnimationConfig
         *
         * Creates a copy of the given object.
         *
         * Notice, parts of the properties are deep copied and parts shallow copied.
         * Check implementation for more details.
         *
         * @param {Object} config Object should have structure that corresponds the WMTS configuration required by
         *                        {OpenLayers.Layer.Animation#doSetConfig} function.
         *                        Operation is ignored if {undefined} or {null}.
         * @param {Date|Integer|String} time Time may be given as its own parameter for the cloning.
         *                                   Then, this value is used instead of the value that is provided
         *                                   in {config} parameter object. This is provided mainly as a complementary
         *                                   parameter for the internal use because time value is set in the middle
         *                                   of the flow for the frames that use configurations provided during
         *                                   animation setup.
         * @return {Object} Clone of the given object. May be {undefined}.
         */
        cloneWmtsAnimationConfig : cloneWmtsAnimationConfig,

        /**
         * @method getTimeFromConfig
         *
         * Gets the time value from the given configuration.
         * This is provided as a complementary method that can handle different configuration objects.
         *
         * @param {Object} config Object should have structure that corresponds the configuration required by
         *                        {OpenLayers.Layer.Animation#doSetConfig} function.
         * @return {Integer} Time from the configuration object.
         *                   May be {undefined} if {config} parameter is not given
         *                   or if time is not set in configuration.
         */
        getTimeFromConfig : getTimeFromConfig,

        /**
         * @method getAnimation
         *
         * Gets the animation object from the given configuration.
         *
         *
         * @param {Object} config Object should have structure that corresponds the configuration required by
         *                        {OpenLayers.Layer.Animation#doSetConfig} function.
         *                        May be {undefined} or {null} but then {undefined} is returned.
         * @return {Object} Animation object from the configuration object.
         *                  May be {undefined} if {config} parameter is not given
         *                  or if animation is not set in configuration.
         */
        getAnimation : getAnimation,

        /**
         * @method getAnimationName
         *
         * Gets the animation {name} from the given configuration.
         *
         * Notice, this is name from the options animation object and is not the main layer name.
         *
         * @param {Object} config Object should have structure that corresponds the configuration required by
         *                        {OpenLayers.Layer.Animation#doSetConfig} function.
         *                        May be {undefined} or {null} but then {undefined} is returned.
         * @return {String} Options animation {name} from the configuration object.
         *                  May be {undefined} if {config} parameter is not given
         *                  or if animation or its {name} property is not set in configuration.
         */
        getAnimationName : getAnimationName,

        /**
         * @method getAnimationHasLegend
         *
         * Gets the animation {hasLegend} value from the given configuration.
         *
         * @param {Object} config Object should have structure that corresponds the configuration required by
         *                        {OpenLayers.Layer.Animation#doSetConfig} function.
         *                        May be {undefined} or {null} but then {undefined} is returned.
         * @return {Boolean} Animation {hasLegend} value from the configuration object.
         *                   {true} if legend may be requested for animation.
         *                   May be {undefined} if {config} parameter is not given
         *                   or if animation or its {hasLegend} property is not set in configuration.
         */
        getAnimationHasLegend : getAnimationHasLegend,

        /**
         * @method setAnimationHasLegend
         *
         * Sets the animation {hasLegend} value for the given configuration.
         *
         * @param {Object} config Object should have structure that corresponds the configuration required by
         *                        {OpenLayers.Layer.Animation#doSetConfig} function.
         *                        May be {undefined} or {null} but then operation is ignored.
         * @param {Boolean} hasLegend Animation {hasLegend} value for the configuration object.
         *                            May be {undefined} or {null}.
         */
        setAnimationHasLegend : setAnimationHasLegend,

        /**
         * @method getLayer
         *
         * Gets the layer ID from the given configuration.
         *
         * @param {Object} config Object should have structure that corresponds the configuration required by
         *                        {OpenLayers.Layer.Animation#doSetConfig} function.
         *                        May be {undefined} or {null} but then {undefined} is returned.
         * @return {String} Layer id from the configuration object.
         *                  May be {undefined} if {config} parameter is not given
         *                  or if layer ID is not set in configuration.
         */
        getLayer : getLayer,

        /**
         * @method setLayer
         *
         * Sets the layer ID into the given configuration.
         *
         * @param {Object} config Object should have structure that corresponds the configuration required by
         *                        {OpenLayers.Layer.Animation#doSetConfig} function.
         *                        May be {undefined} or {null} but then operation is ignored.
         * @param {String} layer Layer id for the configuration object.
         *                       May be {undefined} or {null} or empty but then operation is ignored.
         */
        setLayer : setLayer,

        /**
         * @method getLayerName
         *
         * Gets the layer name from the given configuration.
         * The value is taken from the property that is used for OpenLayers layer instance.
         *
         * The name is gotten from the configuration location that is used for the OpenLayers layer instantiation.
         *
         * @param {Object} config Object should have structure that corresponds the configuration required by
         *                        {OpenLayers.Layer.Animation#doSetConfig} function.
         *                        May be {undefined} or {null} but then {undefined} is returned.
         * @return {String} Layer name from the configuration object.
         *                  May be {undefined} if {config} parameter is not given
         *                  or if layer name is not set in configuration.
         */
        getLayerName : getLayerName,

        /**
         * @method setLayerName
         *
         * Sets the name into the configuration property that is used for the OpenLayers layer instantiation.
         *
         * @param {Object} config Object should have structure that corresponds the configuration required by
         *                        {OpenLayers.Layer.Animation#doSetConfig} function.
         *                        May be {undefined} or {null} but then operation is ignored.
         * @param {String} name Layer name for the configuration object.
         *                      May be {undefined} or {null} or empty but then operation is ignored.
         */
        setLayerName : setLayerName,

        /**
         * @method setFrameStyleClass
         *
         * Sets the style class name into the configuration for the frame layer.
         *
         * {OpenLayers.Layer.Grid} uses the options objects className for specific transition styles.
         * The class name is set here unless value has already been defined. Notice, when element
         * class name is given in configuration, it is set for the grid div-element, not directly to tile
         * elements. Therefore, style should be defined for {.styleClassName .olTileImage} (styleClassName means
         * parameter string given here) to direct animation definitions to tile elements.
         *
         * @param {Object} config Configuration object that is modified to provide correct style class name for
         *                        {OpenLayers.Layer.Grid} frame layers.
         *                        May be {undefined} or {null} but then operation is ignored.
         * @param {String} styleClassName Class name that is used for the frame layer element styles.
         *                                May be {undefined} or {null} but then operation is ignored.
         */
        setFrameStyleClass : setFrameStyleClass,

        /**
         * @method setGridBuffer
         *
         * Sets the grid buffer value into the configuration for the frame layer.
         *
         * This specifies the number of extra rows and colums of tiles on each side
         * which will surround the minimum {OpenLayers.Layer.Grid} grid tiles to cover
         * the map.
         *
         * @param {Object} config Configuration object that is modified to provide correct buffer value for
         *                        {OpenLayers.Layer.Grid} frame layers.
         * @param {Integer} buffer The number of extra rows and colums of tiles on each side which
         *                         will surround the minimum grid tiles to cover the map.
         *                         Negative values are ignored.
         *                         May be {undefined} or {null} but then operation is ignored.
         */
        setGridBuffer : setGridBuffer
    };
})();

/**
 * @requires OpenLayers/Layer/Animation/Animation.js
 * @requires OpenLayers/Layer/Animation/Utils.js
 * @requires OpenLayers/Layer/Animation/internal/ConfigUtils.js
 * @requires OpenLayers/Layer/Animation/internal/TransitionUtils.js
 * @required OpenLayers/Layer/Animation/internal/LayerObject.js
 */

// Strict mode for whole file.
// "use strict";

/**
 * Class: OpenLayers.Layer.Animation.LayerContainer
 * Instance of the layer container object class wraps sub-layers
 * of the animation and manages creation, loading and showing of
 * the layers.
 */
OpenLayers.Layer.Animation.LayerContainer = OpenLayers.Class({

    /**
     * @method setMap
     * Public API method that is set when object is initialized.
     *
     * Sets map for animation.
     *
     * This function registers this container to listen necessary map events
     * when a map is added or unregisters if {undefined} is given. Also, if
     * configuration specifies that animation load should be started automatically,
     * load is started when new map is set.
     *
     * @param {OpenLayers.Map} map Map that is used for frame layers.
     *                             Maybe {undefined} or {null} if map is not used.
     */
    setMap : undefined,

    /**
     * @method setConfig
     * Public API method that is set when object is initialized.
     *
     * Sets new configuration object for animation.
     *
     * Notice, changes in configuration may not fully take effect before animation is reloaded, see {#loadAnimation}.
     *
     * @param {Object} config Hashtable of configurations for the animation.
     *                        May be {undefined} or {null} but proper configuration may be required
     *                        when animation content is loaded. See, {OpenLayers.Layer.Animation}
     *                        class description for config object structure description.
     */
    setConfig : undefined,

    /**
     * @method getConfig
     * Public API method that is set when object is initialized.
     *
     * Get current configuration object for animation.
     *
     * @return {Object} Hashtable of configurations for the animation.
     *                  May be {undefined} or {null}.
     */
    getConfig : undefined,

    /**
     * @method getLegendInfo
     * Public API method that is set when object is initialized.
     *
     * Get legend information for animation frame layers.
     *
     * Legend information object structure:
     *   {
     *     // Name of the layer.
     *     // May be {undefined}, {null} or empty.
     *     name : {String},
     *     // URL to load legend image for the layer.
     *     // May not be {undefined}, {null} or empty.
     *     url : {String},
     *     // Flag to inform if legend should be available in the server
     *     // according to the configuration information.
     *     hasLegend : {Boolean}
     *   }
     *
     * @return {[]} Array of frame layer legend information objects.
     *              May not be {undefined} or {null}. May be empty if
     *              layer has not been initialized properly or if legend
     *              is not included in the configuration.
     */
    getLegendInfo : undefined,

    /**
     * @method setBeginTime
     * Public API method that is set when object is initialized.
     *
     * Set animation begin time that is also the time for the first frame.
     *
     * Begin time is required for example when animation frames are loaded.
     *
     * @param {Date|Integer} time Time for the first frame of the animation.
     *                            May be {undefined} or {null} but then
     *                            operation is ignored.
     */
    setBeginTime : undefined,

    /**
     * @method getBeginTime
     * Public API method that is set when object is initialized.
     *
     * Get animation begin time that is also the time for the first frame.
     *
     * Begin time is required for example when animation frames are loaded.
     *
     * @return {Date|Integer} Time for the first frame of the animation.
     *                        May be {undefined}.
     */
    getBeginTime : undefined,

    /**
     * @method setEndTime
     * Public API method that is set when object is initialized.
     *
     * Set animation end time. Frames whose time is equal or less to this
     * may be loaded.
     *
     * End time is required for example when animation frames are loaded.
     *
     * @param {Date|Integer} time End time of the animation.
     *                            May be {undefined} or {null} but then
     *                            operation is ignored.
     */
    setEndTime : undefined,

    /**
     * @method getEndTime
     * Public API method that is set when object is initialized.
     *
     * Get animation end time.
     *
     * End time is required for example when animation frames are loaded.
     *
     * @return {Date|Integer} End time of the animation.
     *                        May be {undefined}.
     */
    getEndTime : undefined,

    /**
     * @method setResolutionTime
     * Public API method that is set when object is initialized.
     *
     * Set animation resolution time in milliseconds.
     *
     * Resolution time is used for example when animation frames are loaded
     * to calculate correct times for frames between animation begin and end
     * times.
     *
     * @param {Integer} time Animation resolution time in milliseconds.
     *                       May be {undefined}, {null} or less than one
     *                       but then operartion is ignored.
     */
    setResolutionTime : undefined,

    /**
     * @method getResolutionTime
     * Public API method that is set when object is initialized.
     *
     * Get animation resolution time in milliseconds.
     *
     * Resolution time is used for example when animation frames are loaded
     * to calculate correct times for frames between animation begin and end
     * times.
     *
     * @param {Integer} time Animation resolution time in milliseconds.
     *                       May not be {undefined} or {null}.
     */
    getResolutionTime : undefined,

    /**
     * @method setFrameRate
     * Public API method that is set when object is initialized.
     *
     * Sets the animation framerate that is used if animation is looped automatically.
     * This has an effect if {#startAnimation} is used.
     *
     * Framerate is given in milliseconds and describes the minimum time between frames.
     * The framerate may actually be a little bit longer than given value.
     *
     * @param {Integer} frameRate Framerate value should be zero or greater.
     *                            Zero means the fastest possible frame rate.
     *                            Greater the value, slower the animation.
     *                            Negative values are interpreted as zero.
     *                            Framerate is in milliseconds.
     *                            May be {undefined} or {null} but then
     *                            operation is ignored.
     */
    setFrameRate : undefined,

    /**
     * @method setFadeOutOpacities
     * Public API method that is set when object is initialized.
     *
     * Set the array that contains opacity values for frame fade out steps.
     *
     * Notice, {undefined}, {null}, empty array [], or [0] all mean frame fade out in a single step
     * after new frame is shown.
     *
     * Normally, last value should be zero. For example, [0.5, 0.2, 0] defines fade out of three steps.
     * The most recent frame replaced by new frame will be faded out to opacity value of 0.5, the frame
     * before it to 0.2 and frame before it to 0. During animation, frames will go through these fade out
     * steps and finally frames will be set transparent when fade out flow progresses. If last value is not
     * zero, the frames are left visible with that opacity value after fade out flow has passed for them.
     *
     * Notice, if fade out time is longer than frame rate and opacity steps have been defined,
     * fade out may not have enough time to finish. Then, new steps will reset the opacity target
     * values for frames in opacity transition. In such cases, it may be better just to define
     * {time} and {timingFunction} and no {opacities} steps for animation {fadeOut} configuration.
     * Then, longer fade outs may be defined for frames and multiple frame fade outs may occur
     * asynchronously without extra steps. Also, new {timingFunctions} may need to be implemented
     * for this library for such cases.
     *
     * @param {Array(Float)} opacities The array that contains opacity values for frame fade out steps.
     *                                 May be {undefined}, {null} or empty.
     */
    setFadeOutOpacities : undefined,

    /**
     * @method setMaxAsyncLoadCount
     * Public API method that is set when object is initialized.
     *
     * Sets the maximum limit of simultaneous asynchronous frame load operations.
     *
     * @param {Integer} maxCount Maximum number of simultaneous asynchronous frame load operations.
     *                           If this is not a positive value, no maximum limit is used.
     *                           May be {undefined} or {null}, then no maximum limit is used.
     */
    setMaxAsyncLoadCount : undefined,

    /**
     * @method setVisibility
     * Public API method that is set when object is initialized.
     *
     * Sets the information about the visibility of the container and its content.
     *
     * Notice, if visibility is set {false}, possible on-going animation is stopped.
     *
     * Notice, change of visibility may launch reloading of layer image data.
     * Also notice, {setVisibility} method of the layer actually changes
     * the CSS display property value of the element between "block" and "none"
     * instead of changing CSS visibility property. If you want to be sure
     * not to launch reloading of image data, use {setOpacity} method instead
     * to change transparency of the layer.
     *
     * @param visibility {Boolean} {true} if container content should be visible.
     */
    setVisibility : undefined,

    /**
     * @method setOpacity
     * Public API method that is set when object is initialized.
     *
     * Sets the the opacity of the container and its content.
     *
     * @param {Float} opacity Between 0 and 1. O for transparent and 1 for opaque.
     */
    setOpacity : undefined,

    /**
     * @method reset
     * Public API method that is set when object is initialized.
     *
     * Reset animation data.
     *
     * Notice, this is meant for releasing content. Animation settings need to be
     * set and content loaded before animation can be run again.
     */
    reset : undefined,

    /**
     * @method loadAnimation
     * Public API method that is set when object is initialized.
     *
     * Animation is initialized. New frames are loaded if necessary
     * and unnecessary frames are removed.
     *
     * This method creates and sets up the animation by loading WMS or WMTS tiles for map layers from the service.
     * The sub-layers are used as animation frames by the animation layer. Animation may be started
     * by using corresponding methods from this class when layers have been loaded.
     *
     * Notice, configuration needs to be set by using {#setConfig} before this function can be used. Also,
     * animation begin, end and resolution times need to be set first. See, {#setBeginTime}, {#setEndTime}
     * and {setResolutionTime} functions. Also, map needs to be set by using {#setMap} before this function
     * can be used.
     */
    loadAnimation : undefined,

    /**
     * @method startAnimation
     * Public API method that is set when object is initialized.
     *
     * Start animation flow.
     *
     * This function simply starts the whole animation and shows animation
     * frame by frame until animation is stopped by using {#stopAnimation}
     * or {#reset} function.
     *
     * Notice, this will start animation flow even if animation layer
     * was invisible but layers are not set visible by this function.
     * Notice, frame step depends on the frames that are loaded.
     * If part of the frames are still loading, frame step is
     * greater than one.
     */
    startAnimation : undefined,

    /**
     * @method stopAnimation
     * Public API method that is set when object is initialized.
     *
     * Pause the animation flow to the current frame.
     *
     * Notice, this does not pause possible on-going loading.
     */
    pauseAnimation : undefined,

    /**
     * @method stopAnimation
     * Public API method that is set when object is initialized.
     *
     * Stop the animation flow and set the current frame to the first one.
     *
     * Notice, this does not stop possible on-going loading.
     */
    stopAnimation : undefined,

    /**
     * @method showFrame
     * Public API method that is set when object is initialized.
     *
     * Show single animation frame.
     *
     * If animation should be controlled by controller, this function can be used
     * to handle showing of different animation frames.
     *
     * @param time {Date|Integer} Time value for the animation frame that should be shown.
     *                            May not be {undefined} or {null}.
     */
    showFrame : undefined,

    /**
     * @method showNextFrame
     * Public API method that is set when object is initialized.
     *
     * Show single animation frame that is next proper frame after previously shown or
     * the first animation frame if animation has not been started yet. Notice, frame
     * step depends on the frames that are loaded. If part of the frames are still loading,
     * frame step is greater than one.
     */
    showNextFrame : undefined,

    /**
     * @method showPreviousFrame
     * Public API method that is set when object is initialized.
     *
     * Show single animation frame that is previous proper frame before previously shown.
     * Notice, frame step depends on the frames that are loaded. If part of the frames are
     * still loading, frame step is greater than one.
     */
    showPreviousFrame : undefined,

    /**
     * @method initialize
     *
     * Constructor: OpenLayers.Layer.Animation.LayerContainer
     * This is used as class constructor by OpenLayers framework
     * when a new class instance is created.
     *
     * Create a new animation layer container.
     *
     * @param {Object} observer Observer is informed about the animation progress.
     *                          May be {undefined} or {null}.
     */
    initialize : function(observer) {
        // Private variables and initializations.

        var _me = this;
        var _config;
        var _beginTime;
        var _endTime;
        var _resolutionTime;

        // Member variables with some default value which can be changed through API.

        var _visibility = true;
        // Default grid buffer defines value that is set for grid tile buffer in each side of the frame.
        // Configuration object may override this when layers are created.
        var _defaultGridBuffer = 1;
        var _animationFrameRate = 500;
        // Notice, if this is not positive value, no limit is used for async loading.
        // Also, notice that browser or OpenLayers may manage async load count itself.
        // Then, limit may not be required here. This container decides the order in
        // which loading is requested. But notice, if many layers are loaded their
        // loading may finish in arbitary order. This may have noticeable effect if
        // bandwidth is limited.
        var _maxAsyncLoadCount = -1;
        // Opacity level for the whole container.
        // This effects as a multiplier for frame layer opacities.
        var _animationOpacity = 1;
        // Array to contain opacity values for fade out steps. May be undefined.
        var _fadeOutOpacities;

        // Notice, if fade-out value is much greater than 200 ms, animation may start to look blurry.
        // Also, it is hard to find a good compromise for fade-out value because of various animation
        // contents and framerates. Therefore, this value is set to zero as default. Then, animation
        // frame changes are sharp.
        var _defaultFadeOutTimeMs = 0;
        var _defaultFadeOutTimingFunction = "ease-out";
        // Notice, if fade-in value is much greater than 50ms, animation may look like pulsing
        // if frame images overlap with fade-out frames. Therefore, this value is set to zero
        // as a default. Then, animation frame changes are sharp.
        var _defaultFadeInTimeMs = 0;
        var _defaultFadeInTimingFunction = "ease-out";

        // Member variables that are updated in the operations.

        // This contains references to layers that have some animation related fade out opacity set.
        // Animation uses this as a container. This is some subset of layers array.
        var _fadeOutLayers = [];
        // Keep count of the time passed betwee frames. Undefined when animation is stopped.
        var _requestAnimationTime;
        // Container manages actions according to some map events.
        var _map;
        var _mapEvents = {
            scope : _me,
            // Notice, these functions are actually set for this object later
            // when private functions are defined for this class. Here, the
            // function names are just defined. Also notice, it is important
            // that proper functions are set before they are registered for use.
            movestart : undefined
        };
        var _layers = [];
        // Load step is used for grouping layers during load flow.
        // Layers that are indexed with same step values are grouped together.
        // Notice, load steps are values of exponents of two, for example, 1, 2, 4,...
        // Then, loading of new items can be distributed evenly.
        var _loadStep = 1;
        var _groupLoadStep = _loadStep;
        // Observer object that is provided as an interface for other objects.
        var _layerObserver = {
            // Notice, these functions are actually set for this object later
            // when private functions are defined for this class. Here, the
            // function names are just defined. Also notice, it is important
            // that proper functions are set before they are registered for use.
            layerLoadStartCallback : undefined,
            layerLoadEndCallback : undefined
        };

        // Private methods are defined here inside constructor function.
        // Then, they are also available for the public methods that are
        // defined and set below and may use private variables that are also
        // defined in the constructor.

        /**
         * Callback function for map event.
         *
         * This is called when map is dragged, panned or zoomed.
         *
         * @param {Object} event OpenLayers event.
         */
        _mapEvents.movestart = function(event) {
            if (event) {
                // Layer load will automatically be started because map is moved
                // which means drag, pan, zoom, etc. But, we want to decide the order
                // of loading ourselves.
                for (var i = 0; i < _layers.length; ++i) {
                    var layer = _layers[i];
                    // Prevent loading.
                    // Then, loading will be started when visibility is changed to true.
                    // Do not hide current frame. It can be loaded first and should be shown
                    // until reloaded.
                    if (layer !== getCurrentFrame()) {
                        layer.setVisibility(false);
                    }
                    if (observer) {
                        // Inform observer because visibility change to false and back will require reload of data.
                        observer.frameContentReleasedCallback([layer]);
                    }
                }
                // By resetting load step, the layer load callbacks will start to inform
                // about load progress in correct groups when loading is started.
                // Start to load layers in correct order.
                loadAllLayers();
            }
        };

        /**
         * Callback function for layer loading event.
         *
         * Notice, this forwards the callback to the observer frame layer specifically
         * and does not group layers.
         *
         * @param {OpenLayers.Layer.Animation.LayerObject} layer
         */
        _layerObserver.layerLoadStartCallback = function(layer) {
            if (layer) {
                // Do not hide layer, if it is current layer.
                if (getCurrentFrame() !== layer) {
                    // As a default, make the layer invisible because only one frame should be shown at the time.
                    // Animation flow makes the layer visible when necessary. Notice, change opacity instead of
                    // visibility. Then, reload of image data is not launched.
                    layer.setOpacity(0);
                }
                if (observer) {
                    // Inform observer about the start of the loading.
                    observer.loadFrameStartedCallback([layer]);
                }
            }
        };

        /**
         * Callback function for layer loading event.
         *
         * Notice, this forwards the callback to the observer in frame layer groups.
         *
         * @param {OpenLayers.Layer.Animation.LayerObject} layer
         */
        _layerObserver.layerLoadEndCallback = function(layer) {
            if (layer) {
                var group = [];
                var groupComplete = true;
                // Check if the group load step should be adjusted in case that multiple groups have been completed.
                // This may be case if items of multiple groups are loaded and latest load completes larger group in
                // addition to its sub-group.
                groupLoadStepCheck();
                // Insert a layer into the group if it has been loaded.
                // Notice, layers are grouped according to the load steps.
                // Notice, group load step is checked here to be sure that
                // possible unknown events, that start reload of layers behind
                // the scenes, do not have weird effects. In that kind of unknown
                // case, layer group is the whole group. Then, when the whole group
                // is loaded, the whole flow is also completed.
                for (var i = 0; i < _layers.length; i += (_groupLoadStep || 1)) {
                    if (_layers[i].isLoaded()) {
                        group.push(_layers[i]);

                    } else {
                        groupComplete = false;
                        break;
                    }
                }
                // Inform observer about the progress even if the group may not be completed.
                if (observer) {
                    observer.loadFrameCompleteCallback([layer]);
                }
                if (groupComplete) {
                    // Change the load step because group has been completed.
                    // Value is "shifted" to right here.
                    _groupLoadStep = Math.floor(_groupLoadStep / 2);

                    // Inform observer about the progress when whole group has been loaded.
                    if (observer) {
                        observer.loadGroupProgressCallback(group);
                    }

                    if (!_groupLoadStep) {
                        // Because whole group was loaded and load step is zero,
                        // every layer has been loaded.
                        if (observer) {
                            observer.loadCompleteCallback(group);
                        }
                    }
                }

                if (getCurrentFrame() === layer) {
                    // Loaded layer is the current frame. So, make it visible.
                    // Then, frame is made visible for example after zoom or panning
                    // even if animation would not be going on but only single frame should be shown.
                    showLayer(layer, true);
                }

                // Continue loading of next possible layer.
                // Notice, if load has been completed for all the layers,
                // this function will not do anything. Above, possible observer
                // was already informed about completion if necessary.
                nextLayerLoad();

                var animation = OpenLayers.Layer.Animation.ConfigUtils.getAnimation(_config);
                if (!_groupLoadStep && animation && animation.autoStart) {
                    // Start animation automatically if that is set in configuration and loading has been completed.
                    startAnimation();
                }
            }
        };

        var groupLoadStepCheck = function() {
            // If group load step is one or zero, there is no need to update the step here.
            if (_groupLoadStep > 1) {
                // Check if the group load step should be adjusted in case that multiple groups
                // have been completed same time. This may be case if items of multiple groups
                // are loaded and latest load completes larger group in addition to its sub-group(s).
                // Integer is a copy, not a reference here.
                var tmpGroupLoadStep = _groupLoadStep;
                // Browser groups through until all are checked or until first not complete group is found.
                // After looping tmpGroupLoadStep describes first non-complete group.
                while (tmpGroupLoadStep) {
                    var groupComplete = true;
                    for (var i = 0; i < _layers.length; i += tmpGroupLoadStep) {
                        if (!_layers[i].isLoaded()) {
                            groupComplete = false;
                            break;
                        }
                    }
                    if (groupComplete) {
                        // Change the load step because group has been completed.
                        // Value is "shifted" to right here. Notice, while loop
                        // stops if this becomes zero. Also, the group that is
                        // described after this operation may not be complete.
                        tmpGroupLoadStep = Math.floor(tmpGroupLoadStep / 2);

                    } else {
                        // Because group was not complete. Stop checking other groups also.
                        break;
                    }
                }
                // Update the real group load step only if it is a sub-group of another group that has
                // also been completed. Do not update if the original group was the latest complete group.
                // Notice, multiply by two because tmp group describes the first incomplete group.
                if (tmpGroupLoadStep * 2 < _groupLoadStep) {
                    // Group load should describe the latest complete group and be at least one.
                    // "Shift" to left because tmpGroupLoadStep describes the first group that
                    // was not complete or zero if all was complete.
                    _groupLoadStep = 2 * tmpGroupLoadStep || 1;
                }
            }
        };

        var nextLayerLoad = function() {
            // Start new layer loading(s) if load flow has not finished already.
            if (_loadStep > 0) {
                // Calculate how many new loads can be started before reaching
                // the maximum limit for asynchronous loading. Notice, in the
                // beginning of the flow, multiple loadings may be started but
                // after that one new loading is started when one finishes.
                var loadCount = _maxAsyncLoadCount > 0 ? _maxAsyncLoadCount : _layers.length;
                for (var index = 0; index < _layers.length; ++index) {
                    if (_layers[index].isLoading()) {
                        // Some layer loading is already going on.
                        --loadCount;
                    }
                }
                // Check layers and decide what to load next.
                while (loadCount > 0 && _loadStep > 0) {
                    for (var i = 0; i < _layers.length; i += _loadStep) {
                        // Notice, if layer has been set invisible before,
                        // it will be set visible and reloaded here.
                        if (_layers[i].isDefaultState()) {
                            _layers[i].loadLayer();
                            // Check if maximum load count has been reached.
                            --loadCount;
                            if (loadCount === 0) {
                                // Max load count reached for this round.
                                break;
                            }
                        }
                    }
                    if (loadCount > 0) {
                        // More layer loads can still be started if there are unloaded layers left.
                        // This means, that with current time step we have gone through the whole
                        // layer array. Therefore, use smaller step for next loop. If step becomes
                        // zero, then all the layer loads have been started. Notice, resetLoadStep
                        // needs to be called before loading can be started if step is zero.
                        _loadStep = Math.floor(_loadStep / 2);
                    }
                }
            }
        };

        var resetLoadStep = function() {
            // Load step should always be at least one.
            // In addition, step should always be inside layer indexing boundaries.
            // Load step is used for grouping layers during load flow.
            // Layers that are indexed with same step values are grouped together.
            // Notice, load steps are values of exponents of two, for example, 1, 2, 4,...
            // First, items are loaded in larger steps and then in smaller steps.
            // Then, loading of new items can be distributed evenly.
            _loadStep = 1;
            while (_loadStep * 2 < _layers.length) {
                // "Shift" step to left.
                _loadStep *= 2;
            }
            _groupLoadStep = _loadStep;
        };

        var loadAllLayers = function() {
            if (_visibility) {
                if (observer) {
                    // Inform observer that operation to load all the layers is about to start.
                    observer.loadAnimationStartedCallback();
                }
                resetLoadStep();
                nextLayerLoad();
            }
        };

        var showLayer = function(layer, force) {
            var currentFrame = getCurrentFrame();
            var currentIndex = getCurrentFrameIndex();
            var isNewLayer = layer !== currentFrame;
            var nextIndex = _layers.indexOf(layer);

            if (layer && (force || allowShowLayer(nextIndex))) {
                // Fade out only if frame has actually changed or force is requested.
                if (isNewLayer) {
                    // Remove newly given layer from the fade out array if it already exists somewhere there
                    // because layer will be pushed to the same array again. This will prevent possible duplicates.
                    // Notice, no need to change opacity yet because it will be set later. Also, notice that in the
                    // end of this if-clause the layer is pushed to the fade out array.
                    var removeIndex = _fadeOutLayers.indexOf(layer);
                    if (removeIndex !== -1) {
                        _fadeOutLayers.splice(removeIndex, 1);
                    }

                    // Remove excess items from the _fadeOutLayers and set them invisible.
                    // Only certain amount of layers should be in the fade out layers array.
                    // Others should be invisible.
                    var prevIndex = _fadeOutLayers.length > 1 ? _layers.indexOf(_fadeOutLayers[_fadeOutLayers.length - 2]) : -1;
                    // Animation is looping now if next frame index does not follow previous ascending or descending index order.
                    // Notice, previous and current can not have same index because array does not contain duplicates.
                    // Flag to inform if animation is looping now.
                    var looping = prevIndex !== -1 && !(prevIndex < currentIndex && currentIndex < nextIndex || prevIndex > currentIndex && currentIndex > nextIndex);
                    // Notice, fade out frame count needs to be at least one here.
                    var maxFadeOutFrameCount = _fadeOutOpacities && _fadeOutOpacities.length ? _fadeOutOpacities.length : 1;
                    // Notice, new current item will be added later into the array.
                    // Therefore, + 1 here to count it in. Then, item whose last fade out value is set is also removed
                    // from layer array and is not handled twice.
                    var removeCount = looping ? _fadeOutLayers.length : _fadeOutLayers.length - maxFadeOutFrameCount + 1;
                    // Make sure count is not negative.
                    if (removeCount < 0) {
                        removeCount = 0;
                    }
                    for (var i = 0; i < _fadeOutLayers.length; ++i) {
                        var fadeOutLayer = _fadeOutLayers[i];
                        // Set the next opacity value. Set default opacity to zero.
                        // Then, previous frames are set transparent if animation loops.
                        var opacity = 0;
                        if (_fadeOutOpacities && _fadeOutOpacities.length) {
                            if (looping) {
                                // Because fade out steps have been defined,
                                // use opacity value that is meant as final value also in case of looping.
                                // Then, also special case, when full transparency is not wanted, works properly.
                                opacity = _fadeOutOpacities[0];

                            } else {
                                var opacityIndex = i;
                                // Make sure indexing is correct when opacity values are indexed.
                                if (_fadeOutOpacities.length > _fadeOutLayers.length) {
                                    // Because fade out layers array is not full yet, adjust indexing
                                    // to count previous animation rounds. Therefore, opacity values
                                    // do not necessary start from the beginning. Notice, -1 is not
                                    // used here and index should always be at least one.
                                    opacityIndex += _fadeOutOpacities.length - _fadeOutLayers.length;
                                }
                                if (opacityIndex >= _fadeOutOpacities.length) {
                                    // If for some reason there are more layers for fade out
                                    // than opasity values defined, use the last opacity value for
                                    // the extra layers.
                                    opacityIndex = _fadeOutOpacities.length - 1;
                                }
                                opacity = _animationOpacity * _fadeOutOpacities[opacityIndex];
                            }
                        }

                        // Transition styles have been set above. Start transition.
                        startTransitionFadeOut(fadeOutLayer, opacity);
                    }
                    // Remove items that should not be included anymore to fade out array.
                    _fadeOutLayers.splice(0, removeCount);

                    // Because given layer is a new layer, set the new current frame which includes it
                    // as part of the fade out array. Notice, the layer was also removed if it already
                    // existed in another position of the array in the beginning of this if-clause.
                    setCurrentFrame(layer);
                }

                // Set the fade in transition style for the frame
                // before setting the opacity.
                startTransitionFadeIn(layer, _animationOpacity);

                if (observer && isNewLayer) {
                    // Inform observer about the frame change.
                    observer.frameChangedCallback([layer]);
                }
            }
        };

        var allowShowLayer = function(index) {
            // Layer can be shown if index is in the correct bounds and if
            // all the layers have been loaded or if the layer has been part of the previously loaded groups.
            // Notice, check if the layer has been loaded or if an error has occurred during load to know if
            // layer has been already handled for animation.
            return (index >= 0 && index < _layers.length && (!_groupLoadStep || index % (_groupLoadStep * 2) === 0) && _layers[index].isLoaded());
        };

        var startShowAnimation = function() {
            // Do not start a new animation flow if flow is already started.
            if (_requestAnimationTime === undefined) {
                // Initialize counters. Negative informs that animation starts.
                _requestAnimationTime = new Date();
                // Start animation.
                showAnimation();
            }
        };

        var stopShowAnimation = function() {
            _requestAnimationTime = undefined;
        };

        var showAnimation = function() {
            if (_requestAnimationTime !== undefined) {
                // Loop this until stopped
                requestAnimationFrame(showAnimation);
                // Request animation loops at certain vague frame rate.
                // The requestAnimationFrame loops at time periods that are not
                // really exact. It may be at around 60 fps but may also be much less.
                // Therefore, vague timing is used here.
                var currentDate = new Date();
                if (_requestAnimationTime.getTime() + _animationFrameRate < currentDate.getTime()) {
                    // Reset counter because time has passed or animation flow has just been started.
                    _requestAnimationTime = currentDate;
                    // Enough time has passed to show new frame.
                    showNextFrame();
                }
            }
        };

        var setCurrentFrame = function(layer) {
            if (layer) {
                _fadeOutLayers.push(layer);
            }
        };

        var getCurrentFrame = function() {
            return _fadeOutLayers.length ? _fadeOutLayers[_fadeOutLayers.length - 1] : undefined;
        };

        var getCurrentFrameIndex = function() {
            return _layers.indexOf(getCurrentFrame());
        };

        var startTransitionFadeIn = function(layer, opacity, time) {
            var animation = OpenLayers.Layer.Animation.ConfigUtils.getAnimation(_config);
            // Notice, this function is used only internally in this class.
            // So, configuration setting should override given time if configuration is given.
            if (animation && animation.fadeIn && animation.fadeIn.time !== undefined && animation.fadeIn.time !== null && !isNaN(animation.fadeIn.time) && animation.fadeIn.time >= 0) {
                // Acceptable configuration value given for fade in time.
                time = animation.fadeIn.time;

            } else if (time === undefined) {
                // Set default time for transition.
                time = _defaultFadeInTimeMs;
            }

            var timingFunction = _defaultFadeInTimingFunction;
            // Configuration should override default.
            if (animation && animation.fadeIn && !animation.fadeIn.timingFunction && ( typeof animation.fadeIn.timingFunction === "string" )) {
                timingFunction = animation.fadeIn.timingFunction;
            }

            OpenLayers.Layer.Animation.TransitionUtils.opacityTransition(layer, opacity, timingFunction, time);
        };

        var startTransitionFadeOut = function(layer, opacity, time) {
            var animation = OpenLayers.Layer.Animation.ConfigUtils.getAnimation(_config);
            // Notice, this function is used only internally in this class.
            // So, configuration setting should override given time if configuration is given.
            if (animation && animation.fadeOut && animation.fadeOut.time !== undefined && animation.fadeOut.time !== null && !isNaN(animation.fadeOut.time) && animation.fadeOut.time >= 0) {
                // Acceptable configuration value given for fade in time.
                time = animation.fadeOut.time;

            } else if (time === undefined) {
                // Set default time for transition.
                time = _defaultFadeOutTimeMs;
            }

            var timingFunction = _defaultFadeOutTimingFunction;
            // Configuration should override default.
            if (animation && animation.fadeOut && !animation.fadeOut.timingFunction && ( typeof animation.fadeOut.timingFunction === "string" )) {
                timingFunction = animation.fadeOut.timingFunction;
            }

            OpenLayers.Layer.Animation.TransitionUtils.opacityTransition(layer, opacity, timingFunction, time);
        };

        var getLayerInfo = function(time) {
            // Get time specific layer information.
            // Frame layers may have specific information set
            // because different layers may have been configured for different periods.
            var layerInfo;
            if (time !== undefined && time instanceof Date) {
                var animation = OpenLayers.Layer.Animation.ConfigUtils.getAnimation(_config);
                if (animation && animation.layers) {
                    for (var i = 0; i < animation.layers.length; ++i) {
                        var info = animation.layers[i];
                        if (info) {
                            var beginTime = info.beginTime;
                            var endTime = info.endTime;
                            // Begin time is mandatory.
                            // End time may be undefined, which means that all times after begin time are accepted.
                            if (beginTime !== undefined && beginTime !== null && ( beginTime instanceof Date || !isNaN(beginTime)) && (endTime === undefined || endTime === null || endTime instanceof Date || !isNaN(endTime))) {
                                // If information contains layer name for certain period and given time is within the period,
                                // the layer name of that information is returned.
                                beginTime = beginTime instanceof Date ? beginTime : new Date(beginTime);
                                endTime = (endTime === undefined || endTime === null || endTime instanceof Date) ? endTime : new Date(endTime);
                                if (beginTime.getTime() <= time.getTime() && (endTime === undefined || endTime === null || endTime.getTime() >= time.getTime())) {
                                    layerInfo = {
                                        layer : info.layer,
                                        name : info.name,
                                        hasLegend : info.hasLegend
                                    };
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            return layerInfo;
        };

        var getLayerIdName = function(time, defaultIdName) {
            // Default name is returned if configuration does not contain alternative.
            var layerIdName = defaultIdName;
            var info = getLayerInfo(time);
            // Use default layer ID if info does not provide proper one.
            if (info && info.layer) {
                layerIdName = info.layer;
            }
            return layerIdName;
        };

        var getLayerName = function(time, defaultName) {
            // Default is returned if configuration does not contain alternative.
            var name = defaultName;
            var info = getLayerInfo(time);
            // Use default name if info does not provide proper one.
            if (info && undefined !== info.name) {
                name = info.name;
            }
            return name;
        };

        var getLayerHasLegend = function(time, defaultHasLegend) {
            // Default is returned if configuration does not contain alternative.
            var hasLegend = defaultHasLegend;
            var info = getLayerInfo(time);
            if (info && undefined !== info.hasLegend) {
                // Because hasLegend is a boolean,
                // use default only if info object is not available at all.
                hasLegend = info.hasLegend;
            }
            return hasLegend;
        };

        var setMap = function(map) {
            if (_map !== map) {
                // Events may not exist if map has been destroyed.
                if (_map && _map.events) {
                    // Unregister possible previously registered events for the old map.
                    _map.events.un(_mapEvents);
                }
                _map = map;
                if (_map) {
                    // Register for the map events.
                    _map.events.on(_mapEvents);
                    // Also, start loading if autoload is specified in the configuration.
                    var animation = OpenLayers.Layer.Animation.ConfigUtils.getAnimation(_config);
                    if (animation && animation.autoLoad) {
                        loadAnimation();
                    }
                }
            }
        };

        var setConfig = function(config) {
            _config = config;
            var animation = OpenLayers.Layer.Animation.ConfigUtils.getAnimation(_config);
            if (animation) {
                // These functions can check the values itself and ignores undefined.
                // Update default frame rate from the config.
                setBeginTime(animation.beginTime);
                setEndTime(animation.endTime);
                setResolutionTime(animation.resolutionTime);
                setMaxAsyncLoadCount(animation.maxAsyncLoadCount);
                setFrameRate(animation.frameRate);
                if (animation.fadeOut) {
                    setFadeOutOpacities(animation.fadeOut.opacities);
                }
                if (animation.autoLoad && _map) {
                    loadAnimation();
                }
            }
        };

        var getConfig = function() {
            return _config;
        };

        var isLegendInfoDuplicate = function(array, infoObject) {
            var duplicate = false;
            for (var i = 0; i < array.length; ++i) {
                var arrayObject = array[i];
                if (arrayObject === infoObject || arrayObject.name === infoObject.name && arrayObject.url === infoObject.url && arrayObject.hasLegend === infoObject.hasLegend) {
                    // Info object has a duplicate in the array
                    // because array has the same item or
                    // because all the properties in the array item and info object are duplicates.
                    duplicate = true;
                    break;
                }
            }
            return duplicate;
        };

        var getLegendInfo = function() {
            var info = [];
            if (_layers) {
                for (var i = 0; i < _layers.length; ++i) {
                    // Notice, layers themselves may contain multiple layer ids
                    // and therefore multiple legends. Concatenate all the legends
                    // of all the layers into one array.
                    var layerLegendInfo = _layers[i].getLegendInfo();
                    // Because animation contains frames that use same layer IDs and URLs,
                    // most of the legends are duplicates. Ignore duplicates in an array.
                    for (var j = 0; j < layerLegendInfo.length; ++j) {
                        var layerLegendInfoObject = layerLegendInfo[j];
                        if (!isLegendInfoDuplicate(info, layerLegendInfoObject)) {
                            info.push(layerLegendInfoObject);
                        }
                    }
                }
            }
            return info;
        };

        var setBeginTime = function(time) {
            // Ignore setting of undefined value.
            if (time !== undefined && time !== null) {
                if ( time instanceof Date) {
                    // Make copy. Then, possible changes do not affect the original object.
                    _beginTime = new Date(time.getTime());

                } else if (!isNaN(time)) {
                    _beginTime = new Date(time);

                } else {
                    // Because of error case set value to undefined instead of using old value.
                    _beginTime = undefined;
                }
            }
        };

        var getBeginTime = function() {
            return _beginTime;
        };

        var setEndTime = function(time) {
            // Ignore setting of undefined value.
            if (time !== undefined && time !== null) {
                if ( time instanceof Date) {
                    // Make copy. Then, possible changes do not affect the original object.
                    _endTime = new Date(time.getTime());

                } else if (!isNaN(time)) {
                    _endTime = new Date(time);

                } else {
                    // Because of error case set value to undefined instead of using old value.
                    _endTime = undefined;
                }
            }
        };

        var getEndTime = function() {
            return _endTime;
        };

        var setResolutionTime = function(time) {
            // Ignore setting of undefined value.
            // Notice, resolution must always be at least one.
            if (time !== undefined && time !== null && !isNaN(time) && time >= 1) {
                // Make sure resolution time is an integer.
                _resolutionTime = Math.floor(time);
            }
        };

        var getResolutionTime = function() {
            return _resolutionTime ? _resolutionTime : 0;
        };

        var setFrameRate = function(frameRate) {
            // Ignore undefined and non-numbers
            if (frameRate !== undefined && frameRate !== null && !isNaN(frameRate)) {
                _animationFrameRate = frameRate < 0 ? 0 : frameRate;
            }
        };

        var setFadeOutOpacities = function(opacities) {
            if (!opacities || !opacities.length) {
                // Array default is undefined.
                _fadeOutOpacities = undefined;

            } else {
                // Check values.
                // Opacity values need to be from zero to one.
                // Values are copied to new array. Then, array
                // reference is not to the array that may be
                // handled outside of this library.
                var container = [];
                var success = true;
                for (var i = 0; i < opacities.length; ++i) {
                    var opacity = opacities[i];
                    if (undefined === opacity || null === opacity || isNaN(opacity) || opacity < 0 || opacity > 1) {
                        // Opacity value is not accepted.
                        success = false;
                        break;

                    } else {
                        // Opacity value is accepted. Reverse the original order.
                        // Then, order is same with fade out layer and corresponding opacities arrays.
                        container.splice(0, 0, opacity);
                    }
                }
                if (success) {
                    _fadeOutOpacities = container;
                }
            }
        };

        var setMaxAsyncLoadCount = function(maxCount) {
            if (!maxCount) {
                // Handle possible undefined values and zero.
                _maxAsyncLoadCount = -1;

            } else if (!isNaN(maxCount)) {
                // Handle given number.
                _maxAsyncLoadCount = maxCount;
            }
        };

        var setVisibility = function(visibility) {
            if ((visibility === true || visibility === false) && _visibility !== visibility) {
                // Visibility is changed and given type is boolean.
                _visibility = visibility;
                if (!visibility) {
                    // If layers should be invisible, make sure animation flow is stopped because there
                    // is no reason to keep the animation going on then.
                    stopAnimation();
                    // Notice, animation flow itself handles the cases when frame layers should be shown.
                    // Notice, if visibility is set hidden here, then animation will not be shown.
                    // Make sure that visibility of the all the frames are set according to the request here.
                    for (var i = 0; i < _layers.length; ++i) {
                        _layers[i].setVisibility(visibility);
                        if (observer) {
                            // Inform observer because visibility change to false and back will require reload of data.
                            observer.frameContentReleasedCallback([_layers[i]]);
                        }
                    }

                } else {
                    // Start to load layers if necessary because visibility is changed
                    // to visible if it is not already. Then, layers are loaded in a correct order.
                    // Notice, that change of visibility starts the loading.
                    loadAllLayers();
                }
            }
        };

        var setOpacity = function(opacity) {
            if (_animationOpacity !== opacity) {
                // Update animation opacity information.
                // Then, this can be used later during animation when opacity is changed.
                _animationOpacity = opacity;
                for (var i = 0; i < _layers.length; ++i) {
                    var layer = _layers[i];
                    if (layer.getOpacity() > 0) {
                        // Update the current opacity values of the visible frames.
                        layer.setOpacity(_animationOpacity);
                    }
                }
            }
        };

        var reset = function() {
            // Stop possible ongoing animation.
            stopAnimation();
            // Clear all the buffer arrays and release content.
            _fadeOutLayers.splice(0, _fadeOutLayers.length);
            while (_layers.length) {
                // Remove layers from the layers array.
                // Also, release their content.
                var layer = _layers.splice(0, 1)[0];
                layer.releaseContent();
                if (observer) {
                    observer.frameContentReleasedCallback([layer]);
                }
            }
            // Reset also load step because above possible
            // ongoing loading was also cancelled for layers.
            resetLoadStep();
        };

        var loadAnimation = function() {
            var resolutionTime = getResolutionTime();
            if (_map && _config && _beginTime !== undefined && _endTime !== undefined && resolutionTime && _beginTime <= _endTime) {
                // Reset possible previously set data. Then, new data can be initialized.
                // Notice, this will remove possible existing frame layers from arrays.
                // But, web browser cache still contains the images that may be used
                // later without reloading them from the server. So, recreating is
                // quite fast for layers whose image content is already available
                // from cache.
                reset();

                // Create layers according to the given time values.
                var time = new Date(_beginTime.getTime());
                for (var layerTime = _beginTime.getTime(); layerTime <= _endTime.getTime(); layerTime += resolutionTime) {
                    // Increase the time by resolution for every new frame.
                    time.setTime(layerTime);
                    // Notice, configuration objects are cloned here to make sure that
                    // setting time has an effect only to the layer object that is
                    // assigned to that certain time.
                    var configClone = OpenLayers.Layer.Animation.ConfigUtils.cloneAnimationConfig(_config, time.toISOString());
                    // Set default value for grid buffer if it is not included into the config already.
                    OpenLayers.Layer.Animation.ConfigUtils.setGridBuffer(configClone, _defaultGridBuffer);
                    // Because configuration may contain time period specific information for layer information,
                    // make sure layer contains correct information.
                    var layerId = getLayerIdName(time, OpenLayers.Layer.Animation.ConfigUtils.getLayer(configClone));
                    OpenLayers.Layer.Animation.ConfigUtils.setLayer(configClone, layerId);
                    var layerName = getLayerName(time, OpenLayers.Layer.Animation.ConfigUtils.getAnimationName(configClone));
                    OpenLayers.Layer.Animation.ConfigUtils.setLayerName(configClone, layerName);
                    var layerHasLegend = getLayerHasLegend(time, OpenLayers.Layer.Animation.ConfigUtils.getAnimationHasLegend(configClone));
                    OpenLayers.Layer.Animation.ConfigUtils.setAnimationHasLegend(configClone, layerHasLegend);
                    // Create and use new layer object.
                    _layers.push(new OpenLayers.Layer.Animation.LayerObject(configClone, _map, _layerObserver));
                }

                loadAllLayers();
            }
        };

        var startAnimation = function() {
            startShowAnimation();
        };

        var pauseAnimation = function() {
            stopShowAnimation();
        };

        var fadeOutAll = function() {
            // Clear fadeout layers and set the frames invisible.
            // Then, animation current frame will be the first frame
            // if animation is restarted.
            while (_fadeOutLayers.length) {
                var frame = _fadeOutLayers.splice(0, 1)[0];
                // Start the fadeout transition.
                startTransitionFadeOut(frame, 0);
            }
        };

        var stopAnimation = function() {
            pauseAnimation();
            fadeOutAll();
        };

        var showFrame = function(time) {
            if (time !== undefined && time !== null && ( time instanceof Date || !isNaN(time))) {
                if ( time instanceof Date) {
                    time = time.getTime();
                }
                var currentFrameIndex = getCurrentFrameIndex();
                var resolution = getResolutionTime();
                for (var i = 0; i < _layers.length; ++i) {
                    var layer = _layers[i];
                    var configTime = OpenLayers.Layer.Animation.ConfigUtils.getTimeFromConfig(layer.getConfig());
                    if ( configTime instanceof Date) {
                        configTime = configTime.getTime();

                    } else if ( typeof configTime === "string") {
                        configTime = (new Date(configTime)).getTime();
                    }
                    // Check if the time is out of animation limits.
                    if (0 === i && time <= configTime - resolution || i === _layers.length - 1 && time >= configTime + resolution || i === _layers.length - 1 && currentFrameIndex === 0 && time > configTime || i === 0 && currentFrameIndex === _layers.length - 1 && time < configTime) {
                        // Time is at least either resolution below minimum or resolution above maximum.
                        // Or, time is out of animation period when another animation has just looped.
                        // So, just fade all out. Then, frame is not left showing too long if other
                        // animations are presenting frames outside of this animation period.
                        fadeOutAll();
                        // No need to show any layer of this animation anymore.
                        break;

                    } else if (time === configTime) {
                        // Notice, this also automatically checks if the layer can be shown
                        // because it is part of the previously loaded groups.
                        showLayer(layer);
                        break;
                    }
                }
            }
        };

        var showNextFrame = function() {
            // Check the correct step from the already loaded group if any.
            var step = !_groupLoadStep ? 1 : _groupLoadStep * 2;
            if (_layers.length > 0 && (step < _layers.length || step === 1)) {
                // Make sure we loop the layers through instead of indexing out of bounds.
                var currentFrameIndex = getCurrentFrameIndex();
                if (currentFrameIndex < 0 || currentFrameIndex + step >= _layers.length) {
                    // Always start from the beginning when looping or when starting the flow.
                    currentFrameIndex = 0;

                } else {
                    // Update current frame index to the next step.
                    // Also make sure that current frame index is correctly set even if
                    // loading has been started in the background and group loads have changed
                    // in the middle of the animation when current frame can be in any place.
                    // This may occur for example when zooming the map.
                    currentFrameIndex += step - currentFrameIndex % step;
                }
                // Animate the layer if it is allowed. Notice, this will automatically update
                // the current index if frame is shown.
                showLayer(_layers[currentFrameIndex]);
            }
        };

        var showPreviousFrame = function() {
            // Check the correct step from the already loaded group if any.
            var step = !_groupLoadStep ? 1 : _groupLoadStep * 2;
            if (_layers.length > 0 && (step < _layers.length || step === 1)) {
                // Make sure we loop the layers through instead of indexing out of bounds.
                var currentFrameIndex = getCurrentFrameIndex() - step;
                if (currentFrameIndex < 0) {
                    // Either flow started or it has looped. Either way set correct starting position from end.
                    currentFrameIndex = _layers.length - (_layers.length % step || 1);
                }
                showLayer(_layers[currentFrameIndex]);
            }
        };

        // Public API variables and methods are set here.
        // Then, they may also use private member variables and methods.
        // See API descriptions outside of the constructor.

        // See API for method description.
        this.setMap = setMap;

        // See API for method description.
        this.setConfig = setConfig;

        // See API for method description.
        this.getConfig = getConfig;

        // See API for method description.
        this.getLegendInfo = getLegendInfo;

        // See API for method description.
        this.setBeginTime = setBeginTime;

        // See API for method description.
        this.getBeginTime = getBeginTime;

        // See API for method description.
        this.setEndTime = setEndTime;

        // See API for method description.
        this.getEndTime = getEndTime;

        // See API for method description.
        this.setResolutionTime = setResolutionTime;

        // See API for method description.
        this.getResolutionTime = getResolutionTime;

        // See API for method description.
        this.setFrameRate = setFrameRate;

        // See API for method description.
        this.setFadeOutOpacities = setFadeOutOpacities;

        // See API for method description.
        this.setMaxAsyncLoadCount = setMaxAsyncLoadCount;

        // See API for method description.
        this.setVisibility = setVisibility;

        // See API for method description.
        this.setOpacity = setOpacity;

        // See API for method description.
        this.reset = reset;

        // See API for method description.
        this.loadAnimation = loadAnimation;

        // See API for method description.
        this.startAnimation = startAnimation;

        // See API for method description.
        this.pauseAnimation = pauseAnimation;

        // See API for method description.
        this.stopAnimation = stopAnimation;

        // See API for method description.
        this.showFrame = showFrame;

        // See API for method description.
        this.showNextFrame = showNextFrame;

        // See API for method description.
        this.showPreviousFrame = showPreviousFrame;
    },

    CLASS_NAME : "OpenLayers.Layer.Animation.LayerContainer"
});

/**
 * @requires OpenLayers/Layer/Animation/Animation.js
 * @requires OpenLayers/Layer/WMS.js
 * @requires OpenLayers/Layer/WMTS.js
 */

// Strict mode for whole file.
// "use strict";

/**
 * Class: OpenLayers.Layer.Animation.LayerObject
 * Instance of the layer object class wraps single sub-layer,
 * in other words a frame of the animation, and manages creation,
 * loading and showing of the layer.
 */
OpenLayers.Layer.Animation.LayerObject = OpenLayers.Class({

    /**
     * @method loadLayer
     * Public API method that is set when object is initialized.
     *
     * Load layer images from the server if they have not been loaded already
     * or if the layer has been set invisible before calling this function.
     *
     * Also, creates the OpenLayers layer object if it does not already exist.
     * Also, adds the layer to the map if it has not been added before or has been
     * removed.
     *
     * Notice, layer is set visible to start loading if layer is invisible when
     * this function is called. Also, if layer is created in this function or layer
     * is not part of the map, the layer is added to the map which starts the image
     * loading. Notice, opacity may be used to hide layers without affecting to the
     * loading.
     */
    loadLayer : undefined,

    /**
     * @method releaseContent
     * Public API method that is set when object is initialized.
     *
     * Releases content allocated by this class instance.
     */
    releaseContent : undefined,

    /**
     * @method getLayer
     * Public API method that is set when object is initialized.
     *
     * @return {OpenLayers.Layer.WMTS|OpenLayers.Layer.WMTS} OpenLayers Layer object that should be shown in the map.
     *                                                        May be {undefined} if layer has not been created
     *                                                        or if content has been released.
     */
    getLayer : undefined,

    /**
     * @method getConfig
     * Public API method that is set when object is initialized.
     *
     * @return {Object} Confifuration object for this layer.
     *                  May not be {undefined} or {null}.
     */
    getConfig : undefined,

    /**
     * @method getLegendInfo
     * Public API method that is set when object is initialized.
     *
     * Get legend information for the layer.
     *
     * Legend information object structure:
     *   {
     *     // Name of the layer as given for the layer.
     *     // May be {undefined}, {null} or empty.
     *     name : {String},
     *     // URL to load legend image for the layer.
     *     // May not be {undefined}, {null} or empty.
     *     url : {String},
     *     // Flag to inform if legend should be available in the server
     *     // according to the configuration information.
     *     hasLegend : {Boolean}
     *   }
     *
     * @return {[]} Array of layer legend information objects.
     *              May not be {undefined} or {null}. May be empty if
     *              layer has not been initialized properly or if legend
     *              is not included in the configuration.
     */
    getLegendInfo : undefined,

    /**
     * @method getVisibility
     * Public API method that is set when object is initialized.
     *
     * @return {Boolean} {true} if layer is visible.
     *                   May be {undefined} if layer has not been created yet.
     */
    getVisibility : undefined,

    /**
     * @method setVisibility
     *
     * Public API method that is set when object is initialized.
     * Sets the visibility of the layer.
     *
     * Notice, change of visibility from {false} to {true} launches reloading
     * of layer image data. Also notice, {setVisibility} method of the layer
     * actually changes the CSS display property value of the element between
     * "block" and "none" instead of changing CSS visibility property. If you
     * want to be sure not to launch reloading of image data, use {setOpacity}
     * method instead to change transparency of the layer.
     *
     * @param {Boolean} visibility {true} if container content should be visible.
     */
    setVisibility : undefined,

    /**
     * @method getZIndex
     * Public API method that is set when object is initialized.
     *
     * Gets the z-index of the layer.
     *
     * @return {Integer} Z-index of the layer.
     *                   May be {undefined} if layer has not been created yet.
     */
    getZIndex : undefined,

    /**
     * @method setZIndex
     * Public API method that is set when object is initialized.
     *
     * Sets the z-index of the layer.

     * @param {Integer} index Z-index of the layer.
     *                        May be {undefined} or  {null} but then operation is ignored.
     */
    setZIndex : undefined,

    /**
     * @method getOpacity
     * Public API method that is set when object is initialized.
     *
     * Gets the opacity of the layer.
     *
     * @return {Float} Opacity value of the layer.
     *                 May be {undefined} if layer has not been created yet.
     */
    getOpacity : undefined,

    /**
     * @method setOpacity
     * Public API method that is set when object is initialized.
     *
     * Sets the opacity for the entire layer (all images).
     *
     * @param {Float} opacity Opacity value of the layer.
     */
    setOpacity : undefined,

    /**
     * @method setCssTransition
     * Public API method that is set when object is initialized.
     *
     * Sets the CSS transition style value for the tiles of entire layer (all images).
     *
     * Notice, use of CSS transition may create heart beat like movement in animation layers
     * when opacity is changed by using transition. Therefore, you may need to use
     * {OpenLayers.Layer.Animation.TransitionUtils} functions instead of this function
     * to create transitions.
     *
     * @param {String} value Transition value of the layer transition style.
     */
    setCssTransition : undefined,

    /**
     * @method isDefaultState
     * Public API method that is set when object is initialized.
     *
     * Gives information about the layer state.
     *
     * @return {Boolean} {true} if layer loading has not been started yet or
     *                          if content has been released.
     */
    isDefaultState : undefined,

    /**
     * @method isLoaded
     * Public API method that is set when object is initialized.
     *
     * Gives information about the layer state.
     *
     * @return {Boolean} {true} if layer load operation is going on.
     */
    isLoading : undefined,

    /**
     * @method isLoaded
     * Public API method that is set when object is initialized.
     *
     * Gives information about the layer state.
     *
     * @return {Boolean} {true} if layer has been loaded.
     */
    isLoaded : undefined,

    /**
     * @method getError
     * Public API method that is set when object is initialized.
     *
     * Gives information about the layer state error.
     *
     * @return {Object} Error object if an error has occurred.
     *                  If no error has occurred, {undefined}.
     */
    getError : undefined,

    /**
     * @method initialize
     *
     * Constructor: OpenLayers.Layer.Animation.LayerObject
     * This is used as class constructor by OpenLayers framework
     * when a new class instance is created.
     *
     * Create a new animation layer.
     *
     * @param {Object} config Confifuration object for this layer.
     *                        May not be {undefined} or {null}.
     * @param {OpenLayers.Map} map OpenLayers map shows layers.
     *                             May not be {undefined} or {null}.
     * @param {Object} observer Observer is informed about progress of operations.
     *                          Observer implements {layerLoadStartCallback(OpenLayers.Layer.Animation.LayerObject)}
     *                          and {layerLoadEndCallback(OpenLayers.Layer.Animation.LayerObject)} functions.
     *                          May be {undefined} or {null}.
     */
    initialize : function(config, map, observer) {
        if (!config) {
            throw "ERROR: Configuration error!";
        }
        if (!map) {
            throw "ERROR: Map is required!";
        }

        // Private variables and initializations.

        var _me = this;
        var _layer;
        // State will inform if layer has been loaded and if load has been a success.
        // Possible states are
        // - undefined -- not loaded
        // - _STATE_PRE_LOADING -- loading is requested but loadstart event not launced yet
        // - _STATE_LOADING -- loading is going on
        // - _STATE_READY -- loaded successfully or unsuccessfully, see error
        var _STATE_PRE_LOADING = 1;
        var _STATE_LOADING = 2;
        var _STATE_READY = 3;
        var _state = {
            id : undefined,
            error : undefined
        };
        // Layer events that are listened by this class instance.
        // Event names are mapped to private methods.
        var _events = {
            scope : _me,
            // Notice, these functions are actually set for this object later
            // when private functions are defined for this class. Here, the
            // function names are just defined.
            // From OpenLayers.Layer
            loadstart : undefined,
            loadend : undefined,
            // From OpenLayers.Layer.Grid class.
            tileerror : undefined
        };

        // Private methods are defined here inside constructor function.
        // Then, they are also available for the public methods that are
        // defined and set below and may use private variables that are also
        // defined in the constructor.

        _events.loadstart = function(event) {
            resetState();
            _state.id = _STATE_LOADING;
            if (observer) {
                observer.layerLoadStartCallback(_me);
            }
        };

        _events.loadend = function(event) {
            // Check if content has been released while loading.
            // In that case, do not inform observer and let the state be
            // undefined because also layer has been released from this object.
            if (_state.id) {
                _state.id = _STATE_READY;
                // Layer olTileImage div is created before image loading is started.
                // But, all tiles are available only after load has ended. Therefore,
                // the style of that element can be handled here. In this library,
                // opacity transitions of frames are handled by JS separately and
                // general OpenLayers CSS opacity transition settings are ignored.
                // Then, possible flickering during animation can be avoided.
                setCssTransition("opacity 0s");
                if (observer) {
                    observer.layerLoadEndCallback(_me);
                }
            }
        };

        _events.tileerror = function(event) {
            _state.error = event.type;
        };

        var resetState = function() {
            _state.id = undefined;
            _state.error = undefined;
        };

        var createLayer = function() {
            var layer;
            if (config) {
                if (config.wmts) {
                    layer = new OpenLayers.Layer.WMTS(config.wmts);

                } else if (config.wms) {
                    layer = new OpenLayers.Layer.WMS(config.name, config.url, config.wms.params, config.wms.options);
                }
            }
            return layer;
        };

        var releaseContent = function() {
            var layerMap = _layer ? _layer.map : undefined;
            // Events do not exist if map has been destroyed.
            // Remove layer from the map by hand here only if
            // map is in initialized state.
            if (layerMap && layerMap.events) {
                layerMap.removeLayer(_layer);
            }
            _layer = undefined;
            resetState();
        };

        var loadLayer = function() {
            // Events do not exist if map has been destroyed.
            // Load layers only if map is in initialized state.
            if (map.events) {
                // Create and insert into a correct position in array.
                if (!_layer) {
                    // Notice, if configuration is given in a wrong way,
                    // layer may not be created.
                    _layer = createLayer();
                    if (_layer) {
                        // Register to listen events.
                        _layer.events.on(_events);
                    }
                }
                // Layer div is created during layer initialization.
                // Make sure div is available to be sure that map has not been
                // destroyed during zoom operation. Layer div is removed if map is destroyed.
                if (_layer && _layer.div) {
                    if (!_layer.map) {
                        // Add layer into the map if it is not already there.
                        // Notice, layer contains information about the map where it has been added to.
                        // If layer has been removed, its map is also set to null.
                        _state.id = _STATE_PRE_LOADING;
                        map.addLayer(_layer);
                    }
                    // Layer is now part of the map in all cases.
                    // Also, make sure that it is set visible if necessary.
                    // Notice, if visibility is changed from false to true,
                    // layer load is started automatically.
                    if (!_layer.visibility) {
                        _state.id = _STATE_PRE_LOADING;
                        setVisibility(true);
                    }
                }
            }
        };

        var getLayer = function() {
            return _layer;
        };

        var getConfig = function() {
            return config;
        };

        var getLegendInfo = function() {
            var info = [];
            if (_layer) {
                var params = _layer.params;
                if (params) {
                    // Layer IDs may be given as an array in layer params.
                    // Property name for IDs depends on the layer class.
                    // WMS uses layers property name for a string value.
                    // But, WMTS uses layer property name for a string value.
                    var layerIds = params.layers || params.LAYERS || params.layer || params.LAYER;
                    if (layerIds) {
                        layerIds = layerIds.split(",");
                    }
                    // Check that configuration defines that legends should be used.
                    // Also, legend always requires the layer ID.
                    if (_layer.options && _layer.options.animation && layerIds && layerIds.length) {
                        var url = _layer.url;
                        // URL may be string or an array.
                        if ("string" !== typeof url) {
                            if (url && url.length) {
                                // Multiple URLs may be provided for the layer in an array.
                                // But, all of them should provide same content.
                                // Therefore, use the first URL in the list for legend.
                                url = url[0];

                            } else {
                                // Array does not provide URLs.
                                url = undefined;
                            }
                        }
                        // Make sure URL string is available.
                        if (url) {
                            // Create GeoServer style legend URL.
                            // First check if ? or & is required in the end
                            // of the url before query string.
                            var lastChar = url.charAt(url.length - 1);
                            if (url.indexOf("?") === -1) {
                                // URL does not contain ? yet.
                                // URL should contain only one ? in the beginning of query.
                                url += "?";

                            } else if (lastChar !== "?" && lastChar !== "&") {
                                // URL did not end with ? but contains it.
                                // Append & delimiter to the beginning of the query
                                // because it was not included there yet.
                                url += "&";
                            }
                            var imageFormat = params.format || params.FORMAT || "image/png";
                            url += "REQUEST=GetLegendGraphic&FORMAT=" + encodeURIComponent(imageFormat) + "&LAYER=";
                            // Single layer may contain multiple layer IDs.
                            // Provide separate URL for each layer ID.
                            for (var j = 0; j < layerIds.length; ++j) {
                                var layerId = layerIds[j];
                                // Skip empty ids.
                                if (layerId) {
                                    // Check is made to provide a real boolean through API.
                                    var booleanHasLegend = _layer.options.animation.hasLegend ? true : false;
                                    // All the necessary information is available
                                    // for the legend information.
                                    info.push({
                                        // Name may be empty depending if it was originally given for layer.
                                        name : _layer.name,
                                        url : url + encodeURIComponent(layerId),
                                        hasLegend : booleanHasLegend
                                    });
                                }
                            }
                        }
                    }
                }
            }
            return info;
        };

        var getVisibility = function() {
            return _layer ? _layer.getVisibility() : undefined;
        };

        var setVisibility = function(visibility) {
            if (_layer) {
                if (!visibility) {
                    // Reset state because layer needs to be loaded after this.
                    resetState();
                }
                // Set layer visibility only if layer belongs to map.
                // Layer may have been removed if map has been destroyed.
                if (_layer.map) {
                    _layer.setVisibility(visibility);
                }
            }
        };

        var getZIndex = function() {
            return _layer ? _layer.getZIndex() : undefined;
        };

        var setZIndex = function(index) {
            if (index !== undefined && index !== null && !isNaN(index) && _layer && _layer.map) {
                _layer.setZIndex(index);
            }
        };

        var getOpacity = function() {
            return _layer ? _layer.opacity : undefined;
        };

        var setOpacity = function(opacity) {
            if (_layer && _layer.map) {
                _layer.setOpacity(opacity);
            }
        };

        var setCssTransition = function(value) {
            if (_layer) {
                if (value === undefined || value === null) {
                    // Make sure some string is given for value.
                    value = "";
                }
                var div = _layer.div;
                if (div) {
                    var tiles = div.querySelectorAll(".olTileImage");
                    for (var i = 0; i < tiles.length; ++i) {
                        var tile = tiles[i];
                        tile.style.WebkitTransition = value;
                        tile.style.MozTransition = value;
                        tile.style.OTransition = value;
                        tile.style.transition = value;
                    }
                }
            }
        };

        var isDefaultState = function() {
            return _state.id === undefined && _state.error === undefined;
        };

        var isLoading = function() {
            return _state.id === _STATE_LOADING || _state.id === _STATE_PRE_LOADING ? true : false;
        };

        var isLoaded = function() {
            // Layer has been loaded successfully or unsuccessfully.
            // See also getError function.
            return _state.id === _STATE_READY ? true : false;
        };

        var getError = function() {
            return _state.error;
        };

        // Public API variables and methods are set here.
        // Then, they may also use private member variables and methods.
        // See, API descriptions outside of the constructor.

        // See API for method description.
        this.loadLayer = loadLayer;

        // See API for method description.
        this.releaseContent = releaseContent;

        // See API for method description.
        this.getLayer = getLayer;

        // See API for method description.
        this.getConfig = getConfig;

        // See API for method description.
        this.getLegendInfo = getLegendInfo;

        // See API for method description.
        this.getVisibility = getVisibility;

        // See API for method description.
        this.setVisibility = setVisibility;

        // See API for method description.
        this.getZIndex = getZIndex;

        // See API for method description.
        this.setZIndex = setZIndex;

        // See API for method description.
        this.getOpacity = getOpacity;

        // See API for method description.
        this.setOpacity = setOpacity;

        // See API for method description.
        this.setCssTransition = setCssTransition;

        // See API for method description.
        this.isDefaultState = isDefaultState;

        // See API for method description.
        this.isLoading = isLoading;

        // See API for method description.
        this.isLoaded = isLoaded;

        // See API for method description.
        this.getError = getError;
    },

    CLASS_NAME : "OpenLayers.Layer.Animation.LayerObject"
});

/**
 * @requires OpenLayers/Layer/Animation/Animation.js
 * @requires OpenLayers/Layer/Animation/Utils.js
 */

// Strict mode for whole file.
// "use strict";

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
