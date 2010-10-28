three.js
========

#### Javascript 3D Engine ####

[![Flattr this](http://api.flattr.com/button/button-compact-static-100x17.png)](http://flattr.com/thing/287/three-js)

The aim of this project is to create a lightweight 3D engine with a very low level of abstraction (aka for dummies). Currently there is no documentation available but feel free to use the examples as a reference and/or read the source code. However, be aware that the API may change from revision to revision breaking compatibility.

The engine can render using &lt;canvas&gt;, &lt;svg&gt; and WebGL.

[More info...](http://mrdoob.com/blog/post/693)

Other similar projects: [pre3d](http://deanm.github.com/pre3d/), [pvjs](http://code.google.com/p/pvjswebgl/), [jsgl](http://tulrich.com/geekstuff/canvas/perspective.html), [k3d](http://www.kevs3d.co.uk/dev/canvask3d/k3d_test.html), ...

### Examples ###

[![geometry_birds](http://mrdoob.github.com/three.js/assets/examples/08_birds.png)](http://mrdoob.github.com/three.js/examples/geometry_birds.html)
[![geometry_earth](http://mrdoob.github.com/three.js/assets/examples/07_earth.png)](http://mrdoob.github.com/three.js/examples/geometry_earth.html)
[![geometry_terrain](http://mrdoob.github.com/three.js/assets/examples/06_terrain.png)](http://mrdoob.github.com/three.js/examples/geometry_terrain.html)
[![materials_video](http://mrdoob.github.com/three.js/assets/examples/05_video.png)](http://mrdoob.github.com/three.js/examples/materials_video.html)
[![geometry_vr](http://mrdoob.github.com/three.js/assets/examples/04_vr.png)](http://mrdoob.github.com/three.js/examples/geometry_vr.html)
[![geometry_cube](http://mrdoob.github.com/three.js/assets/examples/03_cube.png)](http://mrdoob.github.com/three.js/examples/geometry_cube.html)
[![particles_random](http://mrdoob.github.com/three.js/assets/examples/02_random.png)](http://mrdoob.github.com/three.js/examples/particles_random.html)
[![particles_wave](http://mrdoob.github.com/three.js/assets/examples/01_waves.png)](http://mrdoob.github.com/three.js/examples/particles_waves.html)
[![particles_floor](http://mrdoob.github.com/three.js/assets/examples/00_floor.png)](http://mrdoob.github.com/three.js/examples/particles_floor.html)

### Featured projects ###

[![The Wilderness Downtown](http://mrdoob.github.com/three.js/assets/projects/09_arcadefire.png)](http://thewildernessdowntown.com/)
[![CloudSCAD](http://mrdoob.github.com/three.js/assets/projects/08_cloudscad.png)](http://cloudscad.com/stl_viewer/)
[![Or so they say...](http://mrdoob.github.com/three.js/assets/projects/07_orsotheysay.png)](http://xplsv.com/prods/demos/online/xplsv_orsotheysay/)
[![Rat](http://mrdoob.github.com/three.js/assets/projects/06_rat.png)](http://tech.lab212.org/2010/07/export-textured-models-from-blender2-5-to-three-js/)
[![Failure](http://mrdoob.github.com/three.js/assets/projects/05_failure.png)](http://www.is-real.net/experiments/three/failure/)
[![Space Cannon 3D](http://mrdoob.github.com/three.js/assets/projects/02_spacecannon.png)](http://labs.brian-stoner.com/spacecannon/)
[![Alocasia](http://mrdoob.github.com/three.js/assets/projects/04_alocasia.png)](http://arithmetric.com/projects/alocasia/)
[![DDD](http://mrdoob.github.com/three.js/assets/projects/01_ddd.png)](http://the389.com/works/three/)
[![jsflowfield4d](http://mrdoob.github.com/three.js/assets/projects/00_jsflowfield4d.png)](http://test.sjeiti.com/jsflowfield4d/)
[![spikeball](http://mrdoob.github.com/three.js/assets/projects/03_spikeball.png)](http://kile.stravaganza.org/lab/js/spikeball/)

### Usage ###

Download the [minified library](http://mrdoob.github.com/three.js/build/Three.js) and include it in your html.

	<script type="text/javascript" src="js/Three.js"></script>

This code creates a camera, then creates a scene object, adds a bunch of random particles in it, creates a &lt;canvas&gt; renderer and adds its viewport in the document.body element.

	<script type="text/javascript">

		var camera, scene, renderer;

		init();
		setInterval( loop, 1000 / 60 );

		function init() {

			camera = new THREE.Camera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
			camera.position.z = 1000;

			scene = new THREE.Scene();

			for (var i = 0; i < 1000; i++) {

				var particle = new THREE.Particle( new THREE.ParticleCircleMaterial( Math.random() * 0x808008 + 0x808080, 1 ) );
				particle.position.x = Math.random() * 2000 - 1000;
				particle.position.y = Math.random() * 2000 - 1000;
				particle.position.z = Math.random() * 2000 - 1000;
				particle.scale.x = particle.scale.y = Math.random() * 10 + 5;
				scene.addObject( particle );

			}

			renderer = new THREE.CanvasRenderer();
			renderer.setSize( window.innerWidth, window.innerHeight );

			document.body.appendChild( renderer.domElement );

		}

		function loop() {

			renderer.render( scene, camera );

		}

	</script>

For creating a customised version of the library, including the source files in this order would be a good way to start:

	<script type="text/javascript" src="js/three/Three.js"></script>
	<script type="text/javascript" src="js/three/core/Color.js"></script>
	<script type="text/javascript" src="js/three/core/Vector2.js"></script>
	<script type="text/javascript" src="js/three/core/Vector3.js"></script>
	<script type="text/javascript" src="js/three/core/Vector4.js"></script>
	<script type="text/javascript" src="js/three/core/Rectangle.js"></script>
	<script type="text/javascript" src="js/three/core/Matrix3.js"></script>
	<script type="text/javascript" src="js/three/core/Matrix4.js"></script>
	<script type="text/javascript" src="js/three/core/Vertex.js"></script>
	<script type="text/javascript" src="js/three/core/Face3.js"></script>
	<script type="text/javascript" src="js/three/core/Face4.js"></script>
	<script type="text/javascript" src="js/three/core/UV.js"></script>
	<script type="text/javascript" src="js/three/core/Geometry.js"></script>
	<script type="text/javascript" src="js/three/cameras/Camera.js"></script>
	<script type="text/javascript" src="js/three/lights/Light.js"></script>
	<script type="text/javascript" src="js/three/lights/AmbientLight.js"></script>
	<script type="text/javascript" src="js/three/lights/DirectionalLight.js"></script>
	<script type="text/javascript" src="js/three/lights/PointLight.js"></script>
	<script type="text/javascript" src="js/three/objects/Object3D.js"></script>
	<script type="text/javascript" src="js/three/objects/Particle.js"></script>
	<script type="text/javascript" src="js/three/objects/Line.js"></script>
	<script type="text/javascript" src="js/three/objects/Mesh.js"></script>
	<script type="text/javascript" src="js/three/materials/LineColorMaterial.js"></script>
	<script type="text/javascript" src="js/three/materials/MeshPhongMaterial.js"></script>
	<script type="text/javascript" src="js/three/materials/MeshBitmapMaterial.js"></script>
	<script type="text/javascript" src="js/three/materials/MeshColorFillMaterial.js"></script>
	<script type="text/javascript" src="js/three/materials/MeshColorStrokeMaterial.js"></script>
	<script type="text/javascript" src="js/three/materials/MeshFaceMaterial.js"></script>
	<script type="text/javascript" src="js/three/materials/ParticleBitmapMaterial.js"></script>
	<script type="text/javascript" src="js/three/materials/ParticleCircleMaterial.js"></script>
	<script type="text/javascript" src="js/three/scenes/Scene.js"></script>
	<script type="text/javascript" src="js/three/renderers/Projector.js"></script>
	<script type="text/javascript" src="js/three/renderers/DOMRenderer.js"></script>
	<script type="text/javascript" src="js/three/renderers/CanvasRenderer.js"></script>
	<script type="text/javascript" src="js/three/renderers/SVGRenderer.js"></script>
	<script type="text/javascript" src="js/three/renderers/WebGLRenderer.js"></script>
	<script type="text/javascript" src="js/three/renderers/renderables/RenderableFace3.js"></script>
	<script type="text/javascript" src="js/three/renderers/renderables/RenderableFace4.js"></script>
	<script type="text/javascript" src="js/three/renderers/renderables/RenderableParticle.js"></script>
	<script type="text/javascript" src="js/three/renderers/renderables/RenderableLine.js"></script>


### Contributors ###

Thanks to the power of the internets (and github <3) these people have kindly helped out with the project.

([alteredq](http://github.com/alteredq)), [philogb](http://github.com/philogb), [supereggbert](http://github.com/supereggbert), [kikko](http://github.com/kikko), [kile](http://kile.stravaganza.org/), ...


### Change Log ###

2010 10 28 - **r25** (54.480 kb)

* `WebGLRenderer` now up to date with other renderers! ([alteredq](http://github.com/alteredq))
* .obj to .js python converter ([alteredq](http://github.com/alteredq))
* Blender 2.54 exporter
* Added `MeshFaceMaterial` (multipass per face)
* Reworked `CanvasRenderer` and `SVGRenderer` material handling


2010 10 06 - **r18** (44.420 kb)

* Added `PointLight`
* `CanvasRenderer` and `SVGRenderer` basic lighting support (ColorStroke/ColorFill only)
* `Renderer` > `Projector`. `CanvasRenderer`, `SVGRenderer` and `DOMRenderer` do not extend anymore
* Interactivity base code (hdi folder). To be refactored... ([mindlapse](http://github.com/mindlapse))
* Added `computeCentroids` method to `Geometry`


2010 09 17 - **r17** (39.487 kb)

* Added `Light`, `AmbientLight` and `DirectionalLight` ([philogb](http://github.com/philogb))
* `WebGLRenderer` basic lighting support ([philogb](http://github.com/philogb))
* Memory optimisations


2010 08 21 - **r16** (35.592 kb)

* Workaround for Opera bug (clearRect not working with context with negative scale)
* Additional `Matrix4` and `Vector3` methods


2010 07 23 - **r15** (32.440 kb)

* Using new object `UV` instead of `Vector2` where it should be used
* Added `Mesh.flipSided` boolean (false by default)
* `CanvasRenderer` was handling UVs at 1,1 as bitmapWidth, bitmapHeight (instead of bitmapWidth - 1, bitmapHeight - 1)
* `ParticleBitmapMaterial.offset` added
* Fixed gap when rendering `Face4` with `MeshBitmapUVMappingMaterial`


2010 07 17 - **r14** (32.144 kb)

* Refactored `CanvasRenderer` (more duplicated code, but easier to handle)
* `Face4` now supports `MeshBitmapUVMappingMaterial`
* Changed order of `*StrokeMaterial` parameters. Now it's `color`, `opacity`, `lineWidth`.
* `BitmapUVMappingMaterial` > `MeshBitmapUVMappingMaterial`
* `ColorFillMaterial` > `MeshColorFillMaterial`
* `ColorStrokeMaterial` > `MeshColorStrokeMaterial`
* `FaceColorFillMaterial` > `MeshFaceColorFillMaterial`
* `FaceColorStrokeMaterial` > `MeshFaceColorStrokeMaterial`
* `ColorStrokeMaterial` > `LineColorMaterial`
* `Rectangle.instersects` returned false with rectangles with 0px witdh or height


2010 07 12 - **r13** (29.492 kb)

* Added `ParticleCircleMaterial` and `ParticleBitmapMaterial`
* `Particle` now use `ParticleCircleMaterial` instead of `ColorFillMaterial`
* `Particle.size` > `Particle.scale.x` and `Particle.scale.y`
* `Particle.rotation.z` for rotating the particle
* `SVGRenderer` currently out of sync


2010 07 07 - **r12** (28.494 kb)

* First version of the `WebGLRenderer` (`ColorFillMaterial` and `FaceColorFillMaterial` by now)
* `Matrix4.lookAt` fix (`CanvasRenderer` and `SVGRenderer` now handle the -Y)
* `Color` now using 0-1 floats instead of 0-255 integers


2010 07 03 - **r11** (23.541 kb)

* Blender 2.5 exporter (utils/export_threejs.py) now exports UV and normals (Thx [kikko](http://github.com/kikko))
* `Scene.add` > `Scene.addObject`
* Enabled `Scene.removeObject`


2010 06 22 - **r10** (23.959 kb)

* Changed Camera system. (Thx [Paul Brunt](http://github.com/supereggbert))
* `Object3D.overdraw = true` to enable CanvasRenderer screen space point expansion hack.


2010 06 20 - **r9** (23.753 kb)

* JSLinted.
* `autoClear` property for renderers.
* Removed SVG rgba() workaround for WebKit. (WebKit now supports it)
* Fixed matrix bug. (transformed objects outside the x axis would get infinitely tall :S)


2010 06 06 - **r8** (23.496 kb)

* Moved UVs to `Geometry`.
* `CanvasRenderer` expands screen space points (workaround for antialias gaps).
* `CanvasRenderer` supports `BitmapUVMappingMaterial`.


2010 06 05 - **r7** (22.387 kb)

* Added Line Object.
* Workaround for WebKit not supporting rgba() in SVG yet.
* No need to call updateMatrix(). Use .autoUpdateMatrix = false if needed. (Thx [Gregory Athons](http://github.com/gregmax17)).


2010 05 17 - **r6** (21.003 kb)

* 2d clipping on `CanvasRenderer` and `SVGRenderer`
* `clearRect` optimisations on `CanvasRenderer`


2010 05 16 - **r5** (19.026 kb)

* Removed Class.js dependency
* Added `THREE` namespace
* `Camera.x` -> `Camera.position.x`
* `Camera.target.x` > `Camera.target.position.x`
* `ColorMaterial` > `ColorFillMaterial`
* `FaceColorMaterial` > `FaceColorFillMaterial`
* Materials are now multipass (use array)
* Added `ColorStrokeMaterial` and `FaceColorStrokeMaterial`
* `geometry.faces.a` are now indexes instead of references


2010 04 26 - **r4** (16.274 kb)

* `SVGRenderer` Particle rendering
* `CanvasRenderer` uses `context.setTransform` to avoid extra calculations


2010 04 24 - **r3** (16.392 kb)

* Fixed incorrect rotation matrix transforms
* Added `Plane` and `Cube` primitives


2010 04 24 - **r2** (15.724 kb)

* Improved `Color` handling


2010 04 24 - **r1** (15.25 kb)

* First alpha release
