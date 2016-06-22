three.js
========

#### JavaScript 3D library ####

The aim of the project is to create a lightweight 3D library with a very low level of complexity — in other words, for dummies. The library provides &lt;canvas&gt;, &lt;svg&gt;, CSS3D and WebGL renderers.

[Examples](http://threejs.org/examples/) — [Documentation](http://threejs.org/docs/) — [Migrating](https://github.com/mrdoob/three.js/wiki/Migration) — [Help](http://stackoverflow.com/questions/tagged/three.js)


### Usage ###

Download the [minified library](http://threejs.org/build/three.min.js) and include it in your html.
Alternatively see [how to build the library yourself](https://github.com/mrdoob/three.js/wiki/build.py,-or-how-to-generate-a-compressed-Three.js-file).

```html
<script src="js/three.min.js"></script>
```

This code creates a scene, a camera, and a geometric cube, and it adds the cube to the scene. It then creates a `WebGL` renderer for the scene and camera, and it adds that viewport to the document.body element. Finally it animates the cube within the scene for the camera.

```javascript
var scene, camera, renderer;
var geometry, material, mesh;

init();
animate();

function init() {

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
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

	requestAnimationFrame( animate );

	mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.02;

	renderer.render( scene, camera );

}
```

If everything went well you should see [this](http://jsfiddle.net/hfj7gm6t/).

### Change log ###

[releases](https://github.com/mrdoob/three.js/releases)
