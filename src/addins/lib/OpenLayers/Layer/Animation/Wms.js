/**
 * @requires OpenLayers/Layer/Animation/Animation.js
 */

// Strict mode for whole file.
"use strict";

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
