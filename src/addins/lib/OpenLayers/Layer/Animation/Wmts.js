/**
 * @requires OpenLayers/Layer/Animation/Animation.js
 */

// Strict mode for whole file.
"use strict";

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
