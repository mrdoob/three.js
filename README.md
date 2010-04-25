three.js
========

#### Javascript 3D Engine ####

Currently the engine only supports particles and triangles/quads with flat colors. The aim is to keep the code as simple and modular as possible.

At the moment the engine can render using &lt;canvas&gt; and &lt;svg&gt;. WebGL rendering would come at a later stage but feel free to fork the project and have a go.

Although this allows 3D for iPhoneOS and Android platforms the performance on these devices is not too good.

### Examples ###

[![cube.png](http://github.com/mrdoob/three.js/raw/master/examples/geometry/cube.png)](http://mrdoob.com/lab/javascript/three/geometry/cube.html)
[![random.png](http://github.com/mrdoob/three.js/raw/master/examples/particles/random.png)](http://mrdoob.com/lab/javascript/three/particles/random.html)
[![waves.png](http://github.com/mrdoob/three.js/raw/master/examples/particles/waves.png)](http://mrdoob.com/lab/javascript/three/particles/waves.html)
[![floor.png](http://github.com/mrdoob/three.js/raw/master/examples/particles/floor.png)](http://mrdoob.com/lab/javascript/three/particles/floor.html)

### How to use ###

The library needs to be included first thing.

	<script type="text/javascript" src="js/three.js"></script>

Now we have access to the engine classes and methods.

This code creates a camera, then creates a scene object, adds a bunch of random particles to the scene, creates a &lt;canvas&gt; renderer and adds its viewport the document.body element.

	<script type="text/javascript">

		var camera, scene, renderer;

		init();
		setInterval(loop, 1000 / 60);

		function init()
		{
			camera = new Camera(0, 0, 1000);

			scene = new Scene();
	
			renderer = new CanvasRenderer();
			renderer.setSize(window.innerWidth, window.innerHeight);

			for (var i = 0; i < 1000; i++)
			{
				var particle = new Particle( new ColorMaterial(Math.random() * 0x808008 + 0x808080, 1) );
				particle.position.x = Math.random() * 2000 - 1000;
				particle.position.y = Math.random() * 2000 - 1000;
				particle.position.z = Math.random() * 2000 - 1000;
				particle.size = Math.random() * 10 + 5;
				particle.updateMatrix();
				scene.add( particle );
			}

			document.body.appendChild(renderer.viewport);
		}

		function loop()
		{
			renderer.render(scene, camera);
		}

	</script>
	
### Change Log ###

2010 04 24 - **r3** (16.392 kb)

* Fixed incorrect rotation matrix transforms
* Added Plane and Cube primitives


2010 04 24 - **r2** (15.724 kb)

* Improved Color handling


2010 04 24 - **r1** (15.25 kb)

* First alpha release
