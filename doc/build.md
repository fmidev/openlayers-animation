OpenLayers Animation Add-In: Build
==================================

Grunt initialization commands
-----------------------------

Notice, *lib* -folder already contains minimized and combined files of the current version. 
Use of Grunt is not necessary for normal use of the library. 
But, you may use Grunt to minimize library content if source is edited.

Use [Grunt](http://gruntjs.com) to build release versions of the source code. 
See, [Grunt guide](http://gruntjs.com/getting-started) for more information about Grunt. 
Also, notice that Grunt and gruntplugins are installed and managed via [npm](https://npmjs.org/), 
the [Node.js](http://nodejs.org/) package manager.

If you have installed Grunt globally in the past, you will need to remove it first:
* npm uninstall -g grunt

Put the grunt command in your system path, allowing it to be run from any directory (may require sudo or admin):
* npm install -g grunt-cli

Browse into *openlayers-animation* -folder. Then, required Grunt modules can be installed in there by using:
* npm install

Notice, above commands copy necessary module files into *node_modules* -folder. These are .gitignored when git is used.

After modules are installed, default task of Grunt may be run by using *grunt* -command.

Notice, remember to update version string in *package.json* -file if library version should be updated. 
Then, *grunt* -command will automatically update version information in library filenames and into example HTML files.
