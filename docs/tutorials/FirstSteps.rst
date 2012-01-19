First Steps
====================

Three.js scenes are very easy to setup and only require a few lines of code to initialize. Scenes are constructed using a few different types of objects: cameras, lights, and meshes.

The first step in rendering a three.js scene is creating the WebGL renderer object. The following code creates an HTML canvas object 800x400 pixels, adds it to the document's body, and initializes a three.js scene.

::

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize( 800, 640 );
	document.body.appendChild( renderer.domElement );
	
	var scene = new THREE.Scene();

The second step is to define a camera which the renderer object will use in rendering.

::

	var camera = new THREE.Camera(
		35,			// Field of view
		800 / 640,	// Aspect ratio
		.1,			// Near
		10000		// Far
	);
	camera.position.set( -15, 10, 15 );

The first parameter passed determines how wide the field of view is. The second parameter is the aspect ratio which is calculated by dividing the viewing area's width by its height. The third and fourth parameters specify cut-off points for objects in the camera's view. If an object's distance from the camera does not fall in the range between NEAR and FAR then that object is not rendered. The last line sets the camera's XYZ coordinates to -15, 10, and 15 respectively.

Step three creates a white cube that is 5 units wide, tall and deep, adds the Lambert material, and adds it to the scene.

::

	var cube = new THREE.Mesh(
		new THREE.CubeGeometry( 5, 5, 5 ),
		new THREE.MeshLambertMaterial( { color: 0xFF0000 } )
	);
	scene.addChild( cube );

For the last step in setting up a scene we create a yellow light source and add it to the scene.

::

	var light = new THREE.PointLight( 0xFFFF00 );
	light.position.set( 10, 0, 10 );
	scene.addLight( light );

Finally we render the scene which displays our scene through the camera's eye.

::

	renderer.render(scene, camera);

Everything together in a working example with a minimal HTML template:

::
	
	<!DOCTYPE html>
	
	<html>
	
	<head>
		<title>Getting Started with Three.js</title>
		
		<script type="text/javascript" src="Three.js"></script>
		<script type="text/javascript">
		window.onload = function() {
			
				var renderer = new THREE.WebGLRenderer();
				renderer.setSize( 800, 400 );
				document.body.appendChild( renderer.domElement );
				
				var scene = new THREE.Scene();
				
				var camera = new THREE.Camera(
					35,		// Field of view
					800 / 400,	// Aspect ratio
					.1,		// Near
					10000		// Far
				);
				camera.position.set( -15, 10, 15 );
				
				var cube = new THREE.Mesh(
					new THREE.CubeGeometry( 5, 5, 5 ),
					new THREE.MeshLambertMaterial( { color: 0xFF0000 } )
				);
				scene.addChild( cube );
				
				var light = new THREE.PointLight( 0xFFFF00 );
				light.position.set( 10, 0, 10 );
				scene.addLight( light );
				
				renderer.render(scene, camera);
				
		};
		</script>
	</head>
	
	<body></body>
	
	</html>

That's how simple and easy three.js makes WebGL. Only 20 lines of Javascript to initialize and render a scene.