/**
 * @requires OpenLayers/Layer/Animation/Animation.js
 * @requires OpenLayers/Layer/WMS.js
 * @requires OpenLayers/Layer/WMTS.js
 */

// Strict mode for whole file.
"use strict";

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
            // Layer olTileImage div is created before image loading is started.
            // Therefore, the style of that element can be handled here.
            // In this library, opacity transitions of frames are handled by JS
            // separately and general OpenLayers CSS opacity transition settings
            // are ignored. Then, possible flickering during animation can be avoided.
            setCssTransition("opacity 0");
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
            var map = _layer ? _layer.map : undefined;
            if (map) {
                map.removeLayer(_layer);
            }
            _layer = undefined;
            resetState();
        };

        var loadLayer = function() {
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
            if (_layer) {
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
                _layer.setVisibility(visibility);
            }
        };

        var getZIndex = function() {
            return _layer ? _layer.getZIndex() : undefined;
        };

        var setZIndex = function(index) {
            if (index !== undefined && index !== null && !isNaN(index) && _layer) {
                _layer.setZIndex(index);
            }
        };

        var getOpacity = function() {
            return _layer ? _layer.opacity : undefined;
        };

        var setOpacity = function(opacity) {
            if (_layer) {
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
                    var tiles = div.getElementsByClassName("olTileImage");
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
