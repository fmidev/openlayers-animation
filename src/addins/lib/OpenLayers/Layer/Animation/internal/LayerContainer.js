/**
 * @requires OpenLayers/Layer/Animation/Animation.js
 * @requires OpenLayers/Layer/Animation/Utils.js
 * @requires OpenLayers/Layer/Animation/internal/ConfigUtils.js
 * @requires OpenLayers/Layer/Animation/internal/TransitionUtils.js
 * @required OpenLayers/Layer/Animation/internal/LayerObject.js
 */

// Strict mode for whole file.
"use strict";

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
     *                          May be  {undefined} or {null}.
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
        var _defaultFadeOutTimeMs = 200;
        var _defaultFadeOutTimingFunction = "ease-out";
        // Notice, if fade-in value is much greater, animation may look like pulsing
        // if frame images overlap with fade-out frames. Therefore, this value is set close
        // to zero as a default.
        var _defaultFadeInTimeMs = 50;
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
