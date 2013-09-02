OpenLayers Animation Add-In
===========================

[OpenLayers](http://openlayers.org) Animation Add-In library implements 
Web Map Service (WMS) animation API for OpenLayers. Animation class can 
be used similarly to normal OpenLayers WMS layer class. By using this add-in, 
single animation layer can be used to load and to wrap multiple WMS layers as 
animation frames for a requested time period. In addition, animation API can 
be used to control the animation. Also, the animation can be configured in 
various ways by providing configuration options for the layer.

OpenLayers Animation Add-In library has been implemented as a reference library for 
[http://en.ilmatieteenlaitos.fi/open-data-manual](FMI's Open Data Services).

FMI WMS service provides visualized observations, radar images and model forecasts. 
Notice, FMI WMS services are not intended as primary means of accessing open data, 
and direct use of the FMI's WMS service for other than evalutation purposes is not 
allowed because of the high network bandwidth and processing requirements.

Folder structure
----------------

Root folder contains this README.md and Grunt files that may be used to build different versions of the library.

* *lib* contains minified and combined library files that are provided as content that could be used for release versions.
  Also, a combined non-minified version is provided here for debugging purposes.
* *doc* contains documentation files that describe library components and give simple examples:
    * [Animation](doc/animation.md)
    * [Build](doc/build.md)
    * *conceptual* folder contains conceptual class diagram of animation library as image files and also as
      [ArgoUML](http://argouml.tigris.org) project.
* *src* contains actual source files that may be used as a reference and are used to create *release* content
   into *lib* -folder when Grunt is used.
* *deps* contains thirdparty libraries that are used by animation library
* *examples* contains examples of how to use animation library

Browsers
--------

OpenLayers Animation Add-In works well with the major browsers.

But notice, Internet Explorer version 8 or greater is required.
