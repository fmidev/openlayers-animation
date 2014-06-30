/**
 * @requires OpenLayers/Layer/Animation/Animation.js
 * @requires OpenLayers/BaseTypes/Class.js
 */

// Strict mode for whole file.
"use strict";

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
         * @return {Boolean|String} Animation {hasLegend} value from the configuration object.
         *                          {true} if legend may be requested for animation.
         *                          May be {String} if legend URL has been explicitly given.
         *                          May be {undefined} if {config} parameter is not given
         *                          or if animation or its {hasLegend} property is not set in configuration.
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
         * @param {Boolean|String} hasLegend Animation {hasLegend} value for the configuration object.
         *                                   May be {String} if legend URL is explicitly given.
         *                                   May be {undefined} or {null}.
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
