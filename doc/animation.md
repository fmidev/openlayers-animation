OpenLayers Animation Add-In: Animation
======================================

Source code is well commented. So, for more specific information, you may also want 
to check API descriptions from source code comments in 
* [Wms.js](../src/addins/lib/OpenLayers/Layer/Animation/Wms.js)
* [Wmts.js](../src/addins/lib/OpenLayers/Layer/Animation/Wmts.js)
* [Animation.js](../src/addins/lib/OpenLayers/Layer/Animation/Animation.js)
* [Utils.js](../src/addins/lib/OpenLayers/Layer/Animation/Utils.js)

Code examples below show how to use Animation API. These examples are provided to give 
general idea on how to configure and use animation layers. You may test different 
configurations to find out which ones create visually good animations for your own 
purposes.

Also notice, these examples are also fully available as HTML files in *examples* folder.

Minimal example
---------------

This example shows how to initialize WMS Animation layer with minimal options. 
Notice, layer is only created here to keep example short. But, the layer is used 
in OpenLayers just like all other layers. See [examples/minimal.html](../examples/minimal.html)
for full example source.

    // Initialize options objects for animation.
    var endTime = new Date();
    var beginTime = new Date(endTime.getTime() - 5 * 60 * 60 * 1000);
    // Make sure begin time starts from the exact hour.
    // Then, timesteps will be on the proper positions when layers are requested.
    // If requested times do not match exactly FMI observation times, layers may
    // not contain any visible content.
    OpenLayers.Layer.Animation.Utils.floorDateToHour(beginTime);
    var resolutionTime = 30 * 60 * 1000;
    var baseUrl = "http://wms.fmi.fi/fmi-apikey/insert-your-apikey-here/geoserver/Radar/wms";
    var params = {
        layers : "suomi_rr_eureffin"
    };
    // Notice, you may define animation specific configurations by giving values inside options object.
    var options = {
        animation : {
            beginTime : beginTime,
            endTime : endTime,
            resolutionTime : resolutionTime,
            autoLoad : true,
            autoStart : true
        }
    };

    // Notice, WMS Animation class constructor has same structure with OpenLayers.Layer.WMS class.
    var animation = (new OpenLayers.Layer.Animation.Wms("My Animation Layer", baseUrl, params, options)).registerController(ctrl.events);

Simple example
--------------

This is a simple example that shows how to configure animation more specifically. 
See, minimal example above on how to define all values. This example only shows 
how to create *options* object to configure animation. Everything else can be 
defined as in minimal example above. Notice, many of these values are given 
here to show them as an example. Usually, default values may also be enough. 
See [examples/simple.html](../examples/simple.html) for full example source.

    // Initialize options objects for animation.
    var currentTime = new Date();
    var endTime = new Date(currentTime.getTime() + 10 * 60 * 60 * 1000);
    var beginTime = new Date(currentTime.getTime() - 10 * 60 * 60 * 1000);
    // Make sure begin time starts from the exact hour.
    // Then, timesteps will be on the proper positions when layers are requested.
    // If requested times do not match exactly FMI observation times, layers may
    // not contain any visible content.
    OpenLayers.Layer.Animation.Utils.floorDateToHour(beginTime);
    var resolutionTime = 60 * 60 * 1000;
    var baseUrl = "http://wms.fmi.fi/fmi-apikey/insert-your-apikey-here/geoserver/wms";
    var params = {
        layers : "Radar:suomi_rr1h_eureffin"
    };
    // Animation specific configurations inside options object.
    // Notice, many of these values are given here to show them as an example.
    // Usually, default values may be enough.
    var options = {
        animation : {
            beginTime : beginTime,
            endTime : endTime,
            resolutionTime : resolutionTime,
            autoLoad : true,
            autoStart : true,
            // Layer name for certain time interval.
            // {endTime} may be left {undefined} for the layer object in the {layers} array.
            // This means that all the times after {beginTime} are included for that layer.
            // Here we use different layername for forecasts. Then, animation starts to show
            // forecasts for future times.
            layers : [{
                // Start using forecast layer data from the current time.
                beginTime : currentTime,
                layer : "Weather:precipitation-forecast",
                // Legend configuration is inherited from the parent animation object.
                // Notice, legends can also be configured here to override parent
                // configuration. Just for the purpose of an example, flag is set to
                // false here.
                hasLegend : false,
                // Time period specific animation frames may be named.
                // Then, the frame uses the name for the layer and
                // the time period specific name is given when legend
                // is requested via API.
                name : "Weather"
            }],
            // Defines maximum number of asynchronous frame load operations.
            // Restrict loading and allow maximum of only 5 layers to be loaded simultaneously.
            maxAsyncLoadCount : 5,
            // Animation framerate in milliseconds.
            frameRate : 1000,
            // Animation frame fading information.
            fadeIn : {
                // Fade in time in milliseconds.
                time : 100,
                // Function for opacity fade in.
                timingFunction : "ease-in"
            },
            fadeOut : {
                // Fade out time in milliseconds.
                time : 800,
                // Function for opacity fade out step.
                timingFunction : "ease-out",
                // Opacity values for fade out steps.
                opacities : [0.3, 0.1, 0]
            },
            // Flag to inform if legend may be requested for the layer.
            // Notice, default is false. Notice, this value is inherited
            // as a default value by period specific layers if they are defined.
            hasLegend : true,
            // Time period specific animation frames may be named.
            // Then, the frame uses the name for the layer and
            // the time period specific name is given when legend
            // is requested via API.
            name : "Radar"
        }
    };

Events and controls
-------------------

For simple example on how to handle animation events, see [examples/events.html](../examples/events.html). 
For more thorough example on events and controls, see [examples/complex.html](../examples/complex.html). 
Complex example has couple of controllers in UI to control animations and to test how animation layers work.

WMTS example
------------

At the moment, FMI open data services do not fully support WMTS. Therefore, this example is not available in 
*examples* folder. But, the general level example code is provided below to give a general idea on how WMTS 
animation layers can be used with services that support WMTS.

    /**
     * Controller object, singleton.
     */
    var MyController = {
        // Use OpenLayers events as a controller and this singleton object as its container.
        events : new OpenLayers.Events(this)
    };

    /**
     * Initialize WMTS Animation into the OpenLayers map.
     */
    var initWmtsAnimation = function(map) {
        // Initialize options objects for animation.
        var endTime = new Date();
        var beginTime = new Date(endTime.getTime() - 5 * 60 * 60 * 1000);
        // Make sure begin time starts from the exact hour.
        // Then, timesteps will be on the proper positions when layers are requested.
        // If requested times do not match exactly FMI observation times, layers may
        // not contain any visible content.
        OpenLayers.Layer.Animation.Utils.floorDateToHour(beginTime);
        var resolutionTime = 30 * 60 * 1000;
        var baseUrl = "INSERT_WMTS_SERVICE_BASE_URL_HERE";
        // Setup actual animation.
        var wmtsConfig = {
            name : "Animation Layer",
            url : baseUrl,
            layer : "Radar:suomi_rr_eureffin",
            style : "",
            matrixSet : "EPSG:3067",
            matrixIds : ["EPSG:3067:0", "EPSG:3067:1", "EPSG:3067:2", "EPSG:3067:3", "EPSG:3067:4", "EPSG:3067:5", "EPSG:3067:6", "EPSG:3067:7", "EPSG:3067:8"],
            animation : {
                beginTime : beginTime,
                endTime : endTime,
                resolutionTime : resolutionTime,
                autoLoad : true,
                autoStart : true
            }
        };
        // Notice, WMTS Animation class constructor has same structure with OpenLayers.Layer.WMTS class.
        var animation = (new OpenLayers.Layer.Animation.Wmts(wmtsConfig)).registerController(MyController.events);
        // Alternative way to create layer by using setConfig instead of giving configuration as constructor parameters.
        // var animation = (new OpenLayers.Layer.Animation.Wmts(undefined, "Animation Layer")).registerController(MyController.events).setConfig(wmtsConfig);

        // Add layer to map.
        map.addLayer(animation);
    };
