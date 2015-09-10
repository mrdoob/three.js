# three.js 

[![Build Status](https://travis-ci.org/vanruesc/three.js.svg?branch=dev)](https://travis-ci.org/vanruesc/three.js) 
[![GitHub version](https://badge.fury.io/gh/mrdoob%2Fthree.js.svg)](http://badge.fury.io/gh/mrdoob%2Fthree.js) 
[![npm version](https://badge.fury.io/js/%40mrdoob%2Fthree.js.svg)](http://badge.fury.io/js/%40mrdoob%2Fthree.js) 
[![Dependencies](https://david-dm.org/mrdoob/three.js.svg?branch=master)](https://david-dm.org/mrdoob/three.js)

Three.js is a lightweight 3D library which can easily be integrated in your projects by using browserify with grunt or a similar tool. 
The library supports a &lt;canvas&gt;, an &lt;svg&gt;, a CSS3D and a WebGL renderer. The latter is included in the library by default whereas 
the other renderers are available as [plugins](https://github.com/mrdoob/three.js/tree/master/examples/js/renderers).  

[Examples](http://threejs.org/examples/) — 
[Documentation](http://threejs.org/docs/) — 
[Migrating](https://github.com/mrdoob/three.js/wiki/Migration) — 
[Help](http://stackoverflow.com/questions/tagged/three.js)


## Installation

The complete [minified library](https://mrdoob.github.io/three.js/build/three.min.js) offers the standard functionality in the form of 
an isolated bundle:

```html
<script src="/js/three.min.js"></script>
```

The advanced approach is to install this module with [npm](https://www.npmjs.com) and aim to create a single JavaScript file that contains 
the code of three.js together with your own code. You install three.js as follows:

```sh
$ npm install @mrdoob/three.js
``` 


## Usage

This code creates a scene, a camera and a geometric cube and it adds the cube to the scene. 
It then creates a WebGL renderer for the scene and camera and it adds that viewport to the body element. 
Finally it animates the cube within the scene for the camera.

```javascript
// Note: using require is not necessary with the browser bundle.
var THREE = require("@mrdoob/three.js");

var scene, camera, renderer,
	geometry, material, mesh;

function init() {

	var ratio = window.innerWidth / window.innerHeight;

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 75, ratio, 1, 10000 );
	camera.position.z = 1000;

	geometry = new THREE.BoxGeometry( 200, 200, 200 );
	material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );

	document.body.appendChild( renderer.domElement );

}

function animate() {

	mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.02;

	renderer.render( scene, camera);

	requestAnimationFrame( animate );

}

init();
animate();
```

If everything went well you should see [this](http://jsfiddle.net/f17Lz5ux/).


## Using three.js as a module

The bundled library already contains all the necessary shaders thanks to the brfs transform step in 
the browserify build process. If you want to integrate three.js as a dependency in your own project, 
you'll need a build tool like [Grunt](https://github.com/gruntjs/grunt) or [Gulp](https://github.com/gulpjs/gulp). 
Install the following dev-dependencies for your build process:

```sh
$ npm install grunt --save-dev
$ npm install grunt-browserify --save-dev
$ npm install brfs --save-dev
```

Then configure your build file. A [Gruntfile.js](https://github.com/mrdoob/three.js/tree/master/Gruntfile.js), for instance, would contain something like this:

```javascript
// Your project configuration.
grunt.initConfig( {

	...

	browserify: {

		build: {

			src: [ "src/<%= pkg.name %>.js" ],

			dest: "build/<%= pkg.name %>.js",

			options: {

				transform: [ "brfs" ]

			}

		}

	},

	...

} );

// Plugins.
grunt.loadNpmTasks( "grunt-browserify" );
...

// Task definitions.
grunt.registerTask( "default", [ "browserify:build" ] );
...
```

This setup makes sure that browserify properly includes the full shader code of the three.js library!


## Contributing

[Guidelines](https://github.com/mrdoob/three.js/tree/master/CONTRIBUTING.md)


## Release History

[Releases](https://github.com/mrdoob/three.js/releases)


## License

Copyright © 2010-2015 three.js authors  
Licensed under the MIT license.
