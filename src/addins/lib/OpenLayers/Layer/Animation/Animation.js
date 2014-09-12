/**
 * @requires OpenLayers/Layer.js
 * @requires OpenLayers/Layer/Animation/internal/ConfigUtils.js
 * @requires OpenLayers/Layer/Animation/LayerContainer.js
 */

// Strict mode for whole file.
"use strict";

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
 * - frameloadcomplete -- Inform about loading progress when a new frame has been loaded.
 *                        Event object: see frameloadstarted event object above.
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
 *         // Flag to inform if legend may be requested for the layer. Notice, default is {false}.
 *         // Notice, {string} value may also be used to explicitly define a legend URL. Then, legend URL
 *         // is not constructed from layer information. Also notice, either {boolean} or {string} value
 *         // is inherited as a default value by time period specific layers if they are defined (see below).
 *         // May be left {undefined}.
 *         hasLegend : {Boolean|String},
 *         // Time period specific animation frames may be named. Then, the frame uses the name for the layer and
 *         // the time period specific name is given when legend is requested via API. Notice, this value is
 *         // inherited as a default value by period specific layers if they are defined. May be left {undefined}.
 *         name : {String},
 *         // Layer name for certain time interval.
 *         // {endTime} may be left {undefined} for the layer object in the {layers} array.
 *         // This means that all the times after {beginTime} are included for that layer.
 *         // {hasLegend} Time period specific value. If set, overrides the animation level value.
 *         // {name} Time period specific name for the layer. If set, overrides the animation level value.
 *         layers : [ { beginTime : {Integer|Date}, endTime : {Integer|Date}, layer: {String},
 *                      hasLegend : {Boolean|String}, name : {String} }, ... ],
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
     * @method setVisibility
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
     * @method setZIndex
     * Public API method that is set when object is initialized.
     *
     * See {OpenLayers.Layer.setZindex()} for description.
     * Sets the z-index for the entire layer including sublayers.
     * This uses the parent implementation and also changes z-index
     * of animation frames accordingly.
     *
     * @param {Integer} index Z-index of the layer.
     *                        May be {undefined} or {null} but then operation is ignored.
     */
    setZIndex : undefined,

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
                    // Make sure animation frames have same z-index
                    // as the wrapping animation layer.
                    _layerContainer.setZIndex(_me.getZIndex());
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

        var setZIndex = function(index) {
            OpenLayers.Layer.prototype.setZIndex.call(this, index);
            _layerContainer.setZIndex(index);
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

        // See API for method description.
        this.setZIndex = setZIndex;
    },

    CLASS_NAME : "OpenLayers.Layer.Animation"
});
