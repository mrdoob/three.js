three.js
========

#### JavaScript 3D library ####

The aim of the project is to create a lightweight 3D library with a very low level of complexity — in other words, for dummies. The library provides &lt;canvas&gt;, &lt;svg&gt; and WebGL renderers.

[Examples](http://mrdoob.github.com/three.js/) — [Documentation](http://mrdoob.github.com/three.js/docs/) — [Migrating](https://github.com/mrdoob/three.js/wiki/Migration) — [Help](http://stackoverflow.com/questions/tagged/three.js)


### Usage ###

Download the [minified library](http://mrdoob.github.com/three.js/build/three.min.js) and include it in your html.
Alternatively see [how to build the library yourself](https://github.com/mrdoob/three.js/wiki/build.py,-or-how-to-generate-a-compressed-Three.js-file). 

```html
<script src="js/three.min.js"></script>
```

This code creates a scene, then creates a camera, adds the camera and cube to the scene, creates a &lt;canvas&gt; renderer and adds its viewport in the document.body element.

```html
<script>

	var camera, scene, renderer;
	var geometry, material, mesh;

	init();
	animate();

	function init() {

		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.z = 1000;

		scene = new THREE.Scene();

		geometry = new THREE.CubeGeometry( 200, 200, 200 );
		material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

		mesh = new THREE.Mesh( geometry, material );
		scene.add( mesh );

		renderer = new THREE.CanvasRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );

		document.body.appendChild( renderer.domElement );

	}

	function animate() {

		// note: three.js includes requestAnimationFrame shim
		requestAnimationFrame( animate );

		mesh.rotation.x += 0.01;
		mesh.rotation.y += 0.02;

		renderer.render( scene, camera );

	}

</script>
```

### Change log ###

2012 09 15 - **r51** (405,240 KB, gzip: 99,326 KB)

* Added `STLLoader`. ([aleeper](http://github.com/aleeper) and [mrdoob](http://github.com/mrdoob))
* Optimised `Ray` (2x faster). ([gero3](http://github.com/gero3))
* Added `.getDescendants` method to `Object3D`. ([gero3](http://github.com/gero3) and [mrdoob](http://github.com/mrdoob))
* `SkinnedMesh` can now work with `MorphAnimMesh`. ([apendua](http://github.com/apendua))
* Changed `CameraHelper`. Now it matches the camera independently of where it's in the scene graph. ([mrdoob](http://github.com/mrdoob))
* Removed the need for manually setting texture units with `ShaderMaterial`. ([alteredq](http://github.com/alteredq))
* Added `HemisphereLight`. ([alteredq](http://github.com/alteredq))
* Fixed `WebGLRenderer` handling of flip sided materials. ([WestLangley](http://github.com/WestLangley) and [alteredq](http://github.com/alteredq))
* Added support to normals maps in `MeshPhongMaterial`. ([crobi](http://github.com/crobi) and [alteredq](http://github.com/alteredq))
* Added handling of `BufferGeometry` for `ParticleSystems`. ([alteredq](http://github.com/alteredq))
* Added support for compressed textures and cube maps to `WebGLRenderer`. ([alteredq](http://github.com/alteredq))
* Outliner and Material panel improvements to the [editor](http://mrdoob.github.com/three.js/editor/). ([mrdoob](http://github.com/mrdoob))
* Added material.emissive support to `CanvasRenderer` and `SVGRenderer`. ([mrdoob](http://github.com/mrdoob))
* Added handling of multiple UV layers and anisotropy to Blender exporter. ([alteredq](http://github.com/alteredq))
* Handling bump and anisotropy in `Loader` and `SceneLoader`. ([alteredq](http://github.com/alteredq))
* Added mousewheel support to `TrackballControls`. ([jherrm](http://github.com/jherrm))
* Added `MTLLoader` and `OBJMTLLoader`. ([angelxuanchang](http://github.com/angelxuanchang))
* Updated `UTF8Loader` to latest version. ([angelxuanchang](http://github.com/angelxuanchang) and [alteredq](http://github.com/alteredq))
* Pluginized `SceneLoader`. ([alteredq](http://github.com/alteredq))
* Added support of `object.renderDepth` in `Projector`. ([mrdoob](http://github.com/mrdoob))
* Made build system more flexible. ([mrdoob](http://github.com/mrdoob))
* Many enhancements to `SceneLoader`. ([alteredq](http://github.com/alteredq))
* Experimenting with `CSS3DRenderer`. ([mrdoob](http://github.com/mrdoob))
* Added `ShapeGeometry`. ([jonobr1](http://github.com/jonobr1))
* Fixes to `Vector3`'s `.setEulerFromRotationMatrix` method.([WestLangley](http://github.com/WestLangley))


2012 08 15 - **r50** (391,250 KB, gzip: 96,143 KB)

* Experimenting with [SoftwareRenderer](http://pouet.net/topic.php?which=8760&page=1). ([mrdoob](http://github.com/mrdoob) and [rygorous](http://github.com/rygorous))
* Improved rotation conversion routines. ([WestLangley](http://github.com/WestLangley))
* Moved `DOMRenderer` and `SVGRenderer` out of common build. ([mrdoob](http://github.com/mrdoob))
* Improvements to Morph targets. ([alteredq](http://github.com/alteredq) and [gero3](http://github.com/gero3))
* Added `.deallocateMaterial` method to `WebGLRenderer`. ([alteredq](http://github.com/alteredq))
* Added `.worldToLocal` and `.localToWorld` methods to `Object3D`. ([zz85](http://github.com/zz85) and [WestLangley](http://github.com/WestLangley))
* Added `ConvexGeometry`. ([qiao](http://github.com/qiao))
* Added node.js build system. ([gero3](http://github.com/gero3))
* Improvements to Blender exporter. ([timbot](http://github.com/timbot) and [alteredq](http://github.com/alteredq))
* Added uvs and vertex colors support to `ImmediateRenderObjects`. ([alteredq](http://github.com/alteredq))
* Started implementing `LoadingMonitor` and `EventTarget` in loaders. ([mrdoob](http://github.com/mrdoob))
* Added `Path.ellipse`. ([linzhp](http://github.com/linzhp))
* Added `near` and `far` properties to `Ray`. ([niklassa](http://github.com/niklassa))
* Added `OrbitControls`. ([qiao](http://github.com/qiao), [mrdoob](http://github.com/mrdoob) and [alteredq](http://github.com/alteredq))
* Completed some more documentation pages. ([mrdoob](http://github.com/mrdoob), [phenomnomnominal](http://github.com/phenomnomnominal), [FuzzYspo0N](http://github.com/FuzzYspo0N), [poeschko](http://github.com/poeschko), [wwwtyro](http://github.com/wwwtyro), [maximeq](http://github.com/maximeq) and [alteredq](http://github.com/alteredq))
* Completed lots more documentation pages. ([sole](http://github.com/sole))
* Started reworking [GUI](http://mrdoob.github.com/three.js/gui/). ([mrdoob](http://github.com/mrdoob))
* Improved python build system. ([gero3](http://github.com/gero3))
* Made `VTKLoader` parsing more robust. ([mrdoob](http://github.com/mrdoob))
* Added `recursive` flag to `Ray`. ([mrdoob](http://github.com/mrdoob))
* Handling resizes properly in controls and examples. ([alteredq](http://github.com/alteredq))
* Improvements to ColladaLoader. ([spacecookies](http://github.com/spacecookies))
* Unflipped V coordinate across the whole library. ([mrdoob](http://github.com/mrdoob) and [alteredq](http://github.com/alteredq))
* Refactored `BufferGeometry`. ([alteredq](http://github.com/alteredq))
* Improved GL extensions initialisation in `WebGLRenderer`. ([alteredq](http://github.com/alteredq))
* Rescued `SkinnedMesh`. ([n3tfr34k](http://github.com/n3tfr34k) and [alteredq](http://github.com/alteredq))
* Made `OBJLoader` parsing more robust. ([Dahie](http://github.com/Dahie))
* Implemented skinning via floating point textures. ([alteredq](http://github.com/alteredq))
* Improved documentation system. ([mrdoob](http://github.com/mrdoob) and [alteredq](http://github.com/alteredq))
* Added support for anisotropic texture filtering and standard derivatives in `WebGLRenderer`. ([alteredq](http://github.com/alteredq))
* Added support for `ParticleBasicMaterial` without `map` in `CanvasRenderer`. ([mrdoob](http://github.com/mrdoob))
* `SceneLoader` now supports nested scene graphs and per object custom properties. ([skfcz](http://github.com/skfcz))
* `Camera` doesn't need to be added to the scene anymore. ([mrdoob](http://github.com/mrdoob))
* `Object3D`'s `flipSided` and `doubleSided` properties are now `Material`'s `side` property. ([alteredq](http://github.com/alteredq) and [mrdoob](http://github.com/mrdoob))
* Added `.clone` method to `*Material`. ([gero3](http://github.com/gero3), [mrdoob](http://github.com/mrdoob) and [alteredq](http://github.com/alteredq))
* [IEWEBGL](http://iewebgl.com/Engines.aspx#ThreeJS) support. ([iewebgl](http://github.com/iewebgl) and [mrdoob](http://github.com/mrdoob))
* Added `CircleGeometry`. ([hughes](http://github.com/hughes))
* Added `bumpMap` to `MeshPhongMaterial`. ([alteredq](http://github.com/alteredq))
* Added `specularMap` to `MeshBasicMaterial`, `MeshLambertMaterial` and `MeshPhongMaterial`. ([alteredq](http://github.com/alteredq))
* Reworked python build system. ([mrdoob](http://github.com/mrdoob))


2012 04 22 - **r49** (364,242 KB, gzip: 89,057 KB)

* Yet more `ColladaLoader` improvements. ([ekitson](http://github.com/ekitson), [AddictArts](http://github.com/AddictArts) and [pblasco](http://github.com/pblasco))
* Created documentation system. ([mrdoob](http://github.com/mrdoob))
* Added some documentation. ([mrdoob](http://github.com/mrdoob) and [sole](http://github.com/sole))
* Added `MorphBlendMesh`. ([alteredq](http://github.com/alteredq))
* Added `emissive` component to WebGL Materials. ([alteredq](http://github.com/alteredq))
* Added `DepthPassPlugin`. ([alteredq](http://github.com/alteredq))
* Improvements to `Path`. ([asutherland](http://github.com/asutherland))
* Improvements to `Curve`. ([zz85](http://github.com/zz85))
* Added `ArrowHelper`. ([zz85](http://github.com/zz85) and [WestLangley](http://github.com/WestLangley))
* Changed depth sorting in `WebGLRenderer` to use world positions. ([alteredq](http://github.com/alteredq))
* Improved physically based shading in `WebGLRenderer`. ([WestLangley](http://github.com/WestLangley))
* Changed depth sorting in `Projector` to use world positions. ([mrdoob](http://github.com/mrdoob))
* Added physical specular term also to normal map shader. ([alteredq](http://github.com/alteredq))
* Added `TubeGeometry`. ([zz85](http://github.com/zz85) and [WestLangley](http://github.com/WestLangley))
* Added `needsUpdate` flag to `Material`. ([alteredq](http://github.com/alteredq))
* Fixed `GeometryUtils.triangulateQuads`. ([alteredq](http://github.com/alteredq))
* Improvements to `GeometryUtils.tessellate`. ([alteredq](http://github.com/alteredq))
* Change `PlaneGeometry` from XY to XZ. ([mrdoob](http://github.com/mrdoob))
* `WebGLRenderer` back to `highp` shader precision. ([mrdoob](http://github.com/mrdoob))
* Added `deallocateRenderTarget` to `WebGLRenderer. ([kovleouf](http://github.com/kovleouf))
* Support zIndex and scale into `DOMRenderer`. ([ajorkowski](http://github.com/ajorkowski))
* Improvements to `CameraHelper`. ([zz85](http://github.com/zz85))
* Added 3D spline path extrusion support to `ExtrudeGeometry`. ([zz85](http://github.com/zz85))
* `MarchingCubes` moved out of the lib into `/examples/js` folder. ([alteredq](http://github.com/alteredq))
* Added `ImmediateRenderObject`. ([alteredq](http://github.com/alteredq))
* Renamed `__dirty*` to `*NeedUpdate`. ([valette](http://github.com/valette) and [mrdoob](http://github.com/mrdoob))
* Added `CustomBlending` to `Material` and `premultiplyAlpha` to `Texture`.  ([alteredq](http://github.com/alteredq))
* Improvements to `CubeCamera`. ([alteredq](http://github.com/alteredq) and [mrdoob](http://github.com/mrdoob))
* `CanvasRenderer.setClearColor()` and `.setClearColorHex()` now sets `opacity` to 1 when null. ([mrdoob](http://github.com/mrdoob))
* Fixed broken UVs in `SubdivisionModifier`. ([zz85](http://github.com/zz85))
* Renamed `Matrix4`'s `setTranslation`, `setRotationX`, `setRotationY`, `setRotationZ`, `setRotationAxis` and `setScale` to `makeTranslation`, `makeRotationX`, `makeRotationY`, `makeRotationZ`, `makeRotationAxis` and `makeScale`. ([mrdoob](http://github.com/mrdoob))
* `Matrix4` static methods `makeFrustum`, `makePerspective`, `makeOrtho` to non-static methods. ([mrdoob](http://github.com/mrdoob))
* Refactore handling of `Matrix4` to `Matrix3` inversion. ([alteredq](http://github.com/alteredq))
* Added `GodRays` postprocessing. ([huwb](http://github.com/huwb))
* Added `LinePieces` support to `Projector`. ([mrdoob](http://github.com/mrdoob))
* Fixed UVs handling bug in `GeometryUtils.tessellate`. ([alteredq](http://github.com/alteredq))
* Serious performance improvements to `Matrix4`, `Matrix3` and `Frustum`. ([gero3](http://github.com/gero3))
* Fixes to `LatheGeometry`. ([zz85](http://github.com/zz85))
* Removed `Vertex`. Use `Vector3` instead. ([mrdoob](http://github.com/mrdoob))
* Implemented real `Spotlight`s. ([alteredq](http://github.com/alteredq))
* Added `ParametricGeometry`. ([zz85](http://github.com/zz85))
* Added basic `OBJLoader` in `/examples/js/loaders` folder. ([mrdoob](http://github.com/mrdoob))
* Moved `ColladaLoader` and `UTF8Loader` to `/examples/js/loaders` folder. ([mrdoob](http://github.com/mrdoob))
* Added `VTKLoader` to `/examples/js/loaders` folder. ([valette](http://github.com/valette) and [mrdoob](http://github.com/mrdoob))
* Blender exporter now supports linked groups. ([Druidhawk](http://github.com/Druidhawk))
* Added `visible` property to `Material`. ([mrdoob](http://github.com/mrdoob))
* Removed Lamber+Texture support in `CanvasRenderer`. ([mrdoob](http://github.com/mrdoob))
* Fixed normals in `CylinderGeometry`. ([qiao](http://github.com/qiao))
* Added floating point textures support to `WebGLRenderer`. ([mrdoob](http://github.com/mrdoob))
* Renamed `AnaglyphWebGLRenderer` and co. to `AnaglyphEffect` & co. and moved to `/examples/js/effects`. ([mrdoob](http://github.com/mrdoob))
* Improvements to documentation system. ([mrdoob](http://github.com/mrdoob) and [codler](http://github.com/codler))
* Added `AsciiEffect`. ([zz85](http://github.com/zz85))


2012 03 04 - **r48** (393,626 KB, gzip: 99,395 KB)

* Added camera support to `ColladaLoader`. ([jbaicoianu](http://github.com/jbaicoianu))
* More `ColladaLoader` improvements. ([mrdoob](http://github.com/mrdoob), [AddictArts](http://github.com/AddictArts), [kduong](http://github.com/kduong))
* Updated `IcosahedronGeometry` and `OctahedronGeometry` with [timothypratley](http://github.com/timothypratley)'s `PolyhedronGeometry` code which also brings `TetrahedronGeometry`. ([mrdoob](http://github.com/mrdoob))
* `LOD` should now behave as expected from anywhere in the scene graph. ([mrdoob](http://github.com/mrdoob))
* Added `THREE.REVISION`. ([mrdoob](http://github.com/mrdoob))
* Fixed cancelRequestAnimationFrame polyfill. ([also](http://github.com/also))
* Improvements to convert_obj_three.py. ([alteredq](http://github.com/alteredq))
* Fixes to `Geometry`'s `.computeBoundingBox` and `.computeBoundingSphere`. ([alteredq](http://github.com/alteredq))
* Refactored ShadowMap shader. ([alteredq](http://github.com/alteredq))
* Fixed handling of meshes with multiple materials in `SceneLoader`. ([alteredq](http://github.com/alteredq))
* Changed `Material`'s default ambient color to 0xffffff. ([alteredq](http://github.com/alteredq))
* Added normals support to `MorphTarget`. ([alteredq](http://github.com/alteredq))
* Added `.setFrameRange` and `.setAnimationLabel` to `MorphAnimMesh`. ([alteredq](http://github.com/alteredq))
* Added handling of named animation sequences to `MorphAnimMesh`. ([alteredq](http://github.com/alteredq))
* Extended `MorphAnimMesh` to be able to play animations backwards. ([alteredq](http://github.com/alteredq))
* Added `.generateDataTexture` to `ImageUtils`. ([alteredq](http://github.com/alteredq))
* Removed hierarchy support and `.intersectScene()` from `Ray`. ([mrdoob](http://github.com/mrdoob))
* Added `.triangulateQuads` to `GeometryUtils`. ([alteredq](http://github.com/alteredq))
* `Projector` and `WebGLRenderer` now handles doubleSided lighting properly. ([mrdoob](http://github.com/mrdoob) and [alteredq](http://github.com/alteredq))
* Fixed `MorphAnimMesh` playback bug where the last frame didn't display. ([alteredq](http://github.com/alteredq))
* `TrackballControls` implements `EventTarget`. ([mrdoob](http://github.com/mrdoob))
* Added `.clone` to `Vertex`, `Face3` and `Face4`. ([alteredq](http://github.com/alteredq))
* Added `.explode` and `.tessellate` to `GeometryUtils`. ([alteredq](http://github.com/alteredq))
* Added `.lerpSelf` to `Vector2`, `Vector3` and `UV`. ([alteredq](http://github.com/alteredq))
* Fixed `DOMRenderer` by using single-materials. ([ajorkowski ](http://github.com/ajorkowski ))
* Added `.setPrecision` to `Ray`. ([mrdoob](http://github.com/mrdoob))
* Blender exporter now honors the "Flip YZ" option. ([rectalogic](http://github.com/rectalogic))
* Added `NoBlending` to `Material` and `WebGLRenderer`. ([kovleouf](http://github.com/kovleouf))
* Added `.applyMatrix` to `Object3D`. ([mrdoob](http://github.com/mrdoob) and [alteredq](http://github.com/alteredq))
* Added `.attach` and `.detach` to `SceneUtils` to retain position in space. ([alteredq](http://github.com/alteredq))
* Added `.sign` to `Math`. ([alteredq](http://github.com/alteredq))
* Implemented sphinx based documentation. ([ivankuzev](http://github.com/ivankuzev))
* Documented part of the API. ([ivankuzev](http://github.com/ivankuzev) and [alteredq](http://github.com/alteredq))
* Replaced sphinx based documentation with compilation-less sytem. ([mrdoob](http://github.com/mrdoob))
* Added default material to `Mesh`, `Line` and `ParticleSystem`. ([mrdoob](http://github.com/mrdoob))


2012 01 14 - **r47** (378,169 KB, gzip: 96,015 KB)

* Resurrected lens flares as custom `WebGLRenderer` plugin. ([alteredq](http://github.com/alteredq))
* Fixed typos in `Matrix4`'s `transpose()` and `getInverse()`. ([ekitson](http://github.com/ekitson))
* "Pluginized" Sprites and ShadowMaps. ([alteredq](http://github.com/alteredq))
* Added `Frustum` class. ([alteredq](http://github.com/alteredq))
* `ColladaLoader` improvements. ([ekitson](http://github.com/ekitson), [jterrace](http://github.com/jterrace), [mrdoob](http://github.com/mrdoob) and [alteredq](http://github.com/alteredq))
* Lights in a hierarchy are now supported when using `WebGLRenderer`. ([alteredq](http://github.com/alteredq))
* Included requestAnimationFrame shim in the lib. ([mrdoob](http://github.com/mrdoob))
* Started documentation effort in `/doc` (using sphinx). ([jterrace](http://github.com/jterrace))
* Changed default shader precission to `mediump`. ([mrdoob](http://github.com/mrdoob))
* Added support for the format [OpenCTM](http://openctm.sourceforge.net/). ([alteredq](http://github.com/alteredq))
* Added `BufferGeometry` for direct rendering from typed arrays. ([alteredq](http://github.com/alteredq))
* Extended `Texture` class with `format` and `type` parameters. ([alteredq](http://github.com/alteredq))
* Automatically reducing texture to max size of WebGL hardware. ([greggman](http://github.com/greggman) and [alteredq](http://github.com/alteredq))
* Improved `WebGLRenderer`'s Shadow Map code. ([alteredq](http://github.com/alteredq))
* Checking for `xhr.overrideMimeType` before using it (fixing IE support). ([mrdoob](http://github.com/mrdoob) and [alteredq](http://github.com/alteredq))
* Improved ATI and ANGLE support in across `WebGLRenderer` shaders. ([alteredq](http://github.com/alteredq))
* Added `generateMipmaps` property to `Texture` and `RenderTarget`. ([alteredq](http://github.com/alteredq))
* `Frustum` properly handling children with scaled parents. ([avinoamr](http://github.com/avinoamr))
* Fixed `Ray` when dealing with big polygons. ([WestLangley](http://github.com/WestLangley))
* Fixed `WebGLRenderer` bug where depth buffer was not cleared. ([ekitson](http://github.com/ekitson))
* Added `CameraHelper` objects for visualising both Perspective and Orthographic cameras. ([alteredq](http://github.com/alteredq))
* Improvements to `Path`. ([zz85](http://github.com/zz85))
* Improvements to Postprocessing stack. ([alteredq](http://github.com/alteredq))
* Added shadows for `DirectionalLight`s. ([alteredq](http://github.com/alteredq))
* Added `Gyroscope` object. ([alteredq](http://github.com/alteredq))
* Added `alpha` and `premultipliedAlpha` parameters to `WebGLRenderer`. ([mrdoob](http://github.com/mrdoob))
* `Ray` properly handling children with scaled parents. ([mrdoob](http://github.com/mrdoob))
* Renamed `Axes` object to `AxisHelper`. ([mrdoob](http://github.com/mrdoob))


2011 11 17 - **r46** (343.383 KB, gzip: 87.468 KB)

* Added reflections to Normal Mapping. ([alteredq](http://github.com/alteredq))
* `Ray` now checks also object children. ([mrdoob](http://github.com/mrdoob))
* `*Loader.load( parameters )` to `*Loader( url, callback, texturePath )`. ([mrdoob](http://github.com/mrdoob) and [alteredq](http://github.com/alteredq))
* Reworked scene graph setup. ([mrdoob](http://github.com/mrdoob) and [alteredq](http://github.com/alteredq))
* Fixed `CanvasRenderer`'s `SphericalReflectionMapping` rendering. ([mrdoob](http://github.com/mrdoob))
* Improved `SubdivisionModifier`. ([zz85](http://github.com/zz85))
* Refactored `*Controls` to use externally supplied time delta. ([alteredq](http://github.com/alteredq))
* Improvements to `CombinedCamera`. ([zz85](http://github.com/zz85))
* `ColladaLoader` doesn't create extra `Object3D`. ([mrdoob](http://github.com/mrdoob))
* Improvements to Lambert and Phong materials. ([alteredq](http://github.com/alteredq))
* Removed multi-materials for simplicity reasons. (Multi-materials will come back with MeshLayerMaterial hopefully soon) ([alteredq](http://github.com/alteredq))
* Fixed `Ray` not considering edges. ([mrdoob](http://github.com/mrdoob))
* Massive cleanup to `WebGLRenderer`. ([alteredq](http://github.com/alteredq))
* `Ray` optimisations. ([mrdoob](http://github.com/mrdoob) and [alteredq](http://github.com/alteredq))
* JSON file format is now worker-less (this was crashing Chrome/Firefox with dealing with many assets). ([alteredq](http://github.com/alteredq))
* Improved `CubeGeometry`, `PlaneGeometry`, `IcosahedronGeometry` and `SphereGeometry`. ([mrdoob](http://github.com/mrdoob))
* Improvements to `Curve`. ([zz85](http://github.com/zz85))
* Removed `Collisions` code and focusing on `Ray`. ([mrdoob](http://github.com/mrdoob))
* Added `cloneObject()` method to `SceneUtils`. ([alteredq](http://github.com/alteredq))


2011 10 06 - **r45** (340.863 KB, gzip: 86.568 KB)

* `Object/Scene.add*()` and `Object/Scene.remove*()` are now `Object/Scene.add()` and `Object/Scene.remove()`. ([mrdoob](http://github.com/mrdoob))
* `LOD.add()` is now `LOD.addLevel()`. ([mrdoob](http://github.com/mrdoob))
* Reworked `CylinderGeometry`. ([mrdoob](http://github.com/mrdoob))
* Added `.depthWrite` and `.fog` to `Material`. ([alteredq](http://github.com/alteredq))
* Added `.applyMatrix` to `Geometry`. ([mrdoob](http://github.com/mrdoob))
* Improved postprocessing stack in `/examples/js/postprocessing`. ([alteredq](http://github.com/alteredq))
* Added a realistic skin shading example. ([alteredq](http://github.com/alteredq))
* Started of a GUI for composing scenes and autogenerate code. ([mrdoob](http://github.com/mrdoob))
* Added `.center()` to `GeometryUtils`. ([alteredq](http://github.com/alteredq))
* Fixed buggy scenegraph manipulation (adding/removing objects). ([jsermeno](http://github.com/jsermeno), [alteredq](http://github.com/alteredq) and [skython](http://github.com/skython))
* Renamed `MeshShaderMaterial` to `ShaderMaterial`. ([alteredq](http://github.com/alteredq))
* Fixed `CanvasRenderer` ignoring color of `SmoothShading`ed `MeshLambertMaterial`. ([mrdoob](http://github.com/mrdoob))
* Renamed `renderer.data` to `renderer.info`. ([mrdoob](http://github.com/mrdoob))
* Fixed ShadowMap aspect ratio. ([kig](http://github.com/kig) and [alteredq](http://github.com/alteredq))
* Fixed `Loader`'s `extractUrlbase()` incorrect output for short urls. ([rectalogic](http://github.com/rectalogic) and [alteredq](http://github.com/alteredq))
* Added `.color` and `.visible` support to `Sprite`. ([alteredq](http://github.com/alteredq))
* Added `Face4`, Vertex Colors and Maya support to `ColladaLoader`. ([mrdoob](http://github.com/mrdoob))
* Rewrite of lighting shader code. ([alteredq](http://github.com/alteredq))
* Improved internal array concatenation approach. ([pyrotechnick](http://github.com/pyrotechnick))
* `WebGLRenderer` performance improvements. ([alteredq](http://github.com/alteredq))
* Added lower level immediate rendering support to `WebGLRenderer`. ([NINE78](http://github.com/NINE78) and [alteredq](http://github.com/alteredq))
* Added `CubeCamera` for rendering cubemaps. ([alteredq](http://github.com/alteredq))
* Improved `GeometryUtils`'s `.mergeVertices()` performance. ([zz85](http://github.com/zz85))
* Removed `Camera`'s `.target`. ([mrdoob](http://github.com/mrdoob))
* `WebGLRenderer`'s `.clear()` is now `.clear( color, depth, stencil )`. ([mrdoob](http://github.com/mrdoob))
* Added `.autoClearColor`, `.autoClearDepth` and `.autoClearStencil` to `WebGLRenderer`. ([mrdoob](http://github.com/mrdoob) and [alteredq](http://github.com/alteredq))
* Added `OctahedronGeometry`. ([clockworkgeek](http://github.com/clockworkgeek))
* Splitted `Camera` into `PerspectiveCamera` and `OrthographicCamera`. ([mrdoob](http://github.com/mrdoob) and [alteredq](http://github.com/alteredq))
* Special cameras are now `*Controls`. ([alteredq](http://github.com/alteredq) and [mrdoob](http://github.com/mrdoob))
* Added `SubdivisionModifier`. ([zz85](http://github.com/zz85))
* `Projector`'s `unprojectVector()` now also works with `OrthographicCamera`. ([jsermeno](http://github.com/jsermeno))
* Added `.setLens()` method to `PerspectiveCamera`. ([zz85](http://github.com/zz85))
* Added Shadow Maps, `Texture`'s `.offset` and `.repeat` and reflections support to Normal Map shader. ([alteredq](http://github.com/alteredq))


2011 09 04 - **r44** (330.356 KB, gzip: 84.039 KB)

* Added `ColladaLoader`. ([timknip2](http://github.com/timknip2))
* Improved `ExtrudeGeometry`. ([zz85](http://github.com/zz85))
* Fixed `CylinderGeometry` normals. ([alteredq](http://github.com/alteredq))
* Fixed issue with `WebGLRenderer.setTexture` ([rectalogic](http://github.com/rectalogic))
* Fixed `TorusGeometry` normals. ([mrdoob](http://github.com/mrdoob))
* Fixed `Ray` behind-ray intersects. ([mrdoob](http://github.com/mrdoob))
* Added `OrthoCamera`. ([alteredq](http://github.com/alteredq))
* Refactored postprocessing effects used in some examples. ([alteredq](http://github.com/alteredq))
* Added `.deallocateObject()` and `.deallocateTexture()` methods to `WebGLRenderer`. ([mrdoob](http://github.com/mrdoob))
* Fixed a glitch in normal and phong shader. ([evanw](http://github.com/evanw) and [alteredq](http://github.com/alteredq))
* Added `.frustumCulled` property to `Object3D`. ([alteredq](http://github.com/alteredq) and [mrdoob](http://github.com/mrdoob))


2011 08 14 - **r43** (298.199 KB, gzip: 74.805 KB)

* Improved Blender exporter - 2.58 (and 2.59) support, normals maps, specular, ao maps... ([alteredq](http://github.com/alteredq))
* Added [CORS](http://www.w3.org/TR/cors/) to `ImageUtils`. ([mrdoob](http://github.com/mrdoob))
* Refactored `TextGeometry` and added `Shape`, `Curve`, `Path`, `ExtrudeGeometry`, `TextPath`. ([zz85](http://github.com/zz85) and [alteredq](http://github.com/alteredq))
* Added handling of custom attributes for `ParticleSystems`. ([alteredq](http://github.com/alteredq))
* Fixed `CanvasRenderer.setClearColor`. ([mrdoob](http://github.com/mrdoob), [StephenHopkins](http://github.com/StephenHopkins) and [sebleedelisle](http://github.com/sebleedelisle))
* Improved uniform handling in `WebGLRenderer`. ([alteredq](http://github.com/alteredq))
* Implemented Shadow Mapping in `WebGLRenderer`. ([alteredq](http://github.com/alteredq))
* Added `Spotlight` light type. ([alteredq](http://github.com/alteredq))
* Fixed constructor-less prototypes. ([pushmatrix](http://github.com/pushmatrix))
* Added `DataTexture`. ([alteredq](http://github.com/alteredq))
* `WebGLRenderer` opaque pass now renders from front to back. ([alteredq](http://github.com/alteredq))
* Simplified `Color`. ([mrdoob](http://github.com/mrdoob))
* Added `preserveDrawingBuffer` option to `WebGLRenderer`. ([jeromeetienne](http://github.com/jeromeetienne))
* Added `UTF8Loader` for loading the new, uber compressed, [UTF8 format](http://code.google.com/p/webgl-loader/). ([alteredq](http://github.com/alteredq))
* `CanvasRenderer` now supports `RepeatWrapping`, `texture.offset` and `texture.repeat`. ([mrdoob](http://github.com/mrdoob))
* Removed Stencil Shadows and Lensflare code. ([mrdoob](http://github.com/mrdoob))


2011 07 06 - **r42** (277.852 KB, gzip: 69.469 KB)

* Added `AnaglypWebGLRenderer` and `CrosseyedWebGLRenderer`. ([mrdoob](http://github.com/mrdoob), [alteredq](http://github.com/alteredq) and [marklundin](http://github.com/marklundin))
* Added `TextGeometry`. ([zz85](http://github.com/zz85) and [alteredq](http://github.com/alteredq))
* Added `setViewOffset` method to `Camera`. ([greggman](http://github.com/greggman))
* Renamed geometries to `*Geometry`. ([mrdoob](http://github.com/mrdoob))
* Improved Blender exporter. ([alteredq](http://github.com/alteredq), [sweetfish](http://github.com/sweetfish) and [Jhonnyg](http://github.com/Jhonnyg))
* Added Blender 2.58 exporter. ([georgik](http://github.com/georgik))
* Fixed `Matrix4.multiply()`. (thanks [lukem1](http://github.com/lukem1)) 
* Added support for additional Euler rotation orders in `Matrix4`. ([rectalogic](http://github.com/rectalogic))
* Renamed `QuakeCamera` to `FirstPersonCamera`. ([chriskillpack](http://github.com/chriskillpack))
* Improved Normal Map Shader. ([alteredq](http://github.com/alteredq))
* `Collision` now supports `Object3D.flipSided` and `Object3D.doubleSided`. ([NINE78](http://github.com/NINE78))
* Removed most of `SceneUtils` methods. ([mrdoob](http://github.com/mrdoob))
* Removed `Sound` object and `SoundRenderer`. ([mrdoob](http://github.com/mrdoob))


2011 05 31 - **r41/ROME** (265.317 KB, gzip: 64.849 KB)

(Up to this point, some [RO.ME](http://ro.me) specific features managed to get in the lib. The aim is to clean this up in next revisions.)

* Improved Blender Object and Scene exporters. ([alteredq](http://github.com/alteredq))
* Fixes on WebGL attributes. ([alteredq](http://github.com/alteredq) and [empaempa](http://github.com/empaempa))
* Reduced overall memory footprint. ([mrdoob](http://github.com/mrdoob))
* Added `Face4` support to `CollisionSystem`. ([NINE78](http://github.com/NINE78))
* Added Blender 2.57 exporter. ([remoe](http://github.com/remoe))
* Added `Particle` support to `Ray`. ([mrdoob](http://github.com/mrdoob) and [jaycrossler](http://github.com/jaycrossler))
* Improved `Ray.intersectObject` performance by checking boundingSphere first. ([mrdoob](http://github.com/mrdoob))
* Added `TrackballCamera`. ([egraether](http://github.com/egraether))
* Added `repeat` and `offset` properties to `Texture`. ([mrdoob](http://github.com/mrdoob) and [alteredq](http://github.com/alteredq))
* Cleaned up `Vector2`, `Vector3` and `Vector4`. ([egraether](http://github.com/egraether))


2011 04 24 - **r40** (263.774 KB, gzip: 64.320 KB)

* Fixed `Object3D.lookAt`. ([mrdoob](http://github.com/mrdoob))
* More and more Blender exporter goodness. ([alteredq](http://github.com/alteredq) and [mrdoob](http://github.com/mrdoob))
* Improved `CollisionSystem`. ([drojdjou](http://github.com/drojdjou) and [alteredq](http://github.com/alteredq))
* Fixes on WebGLRenderer. ([empaempa](http://github.com/empaempa))
* Added `Trident` object. ([sroucheray](http://github.com/sroucheray))
* Added `data` object to Renderers for getting number of vertices/faces/callDraws from last render. ([mrdoob](http://github.com/mrdoob))
* Fixed `Projector` handling Particles with hierarchies. ([mrdoob](http://github.com/mrdoob))


2011 04 09 - **r39** (249.048 KB, gzip: 61.020 KB)

* Improved WebGLRenderer program cache. ([alteredq](http://github.com/alteredq))
* Added support for pre-computed edges in loaders and exporters. ([alteredq](http://github.com/alteredq))
* Added `Collisions` classes. ([drojdjou](http://github.com/drojdjou))
* Added `Sprite` object. ([empaempa](http://github.com/empaempa))
* Fixed `*Loader` issue where Workers were kept alive and next loads were delayed. ([alteredq](http://github.com/alteredq))
* Added `THREE` namespace to all the classes that missed it. ([mrdoob](http://github.com/mrdoob))


2011 03 31 - **r38** (225.442 KB, gzip: 55.908 KB)

* Added `LensFlare` light. ([empaempa](http://github.com/empaempa))
* Added `ShadowVolume` object (stencil shadows). ([empaempa](http://github.com/empaempa))
* Improved Blender Exporter plus added Scene support. ([alteredq](http://github.com/alteredq))
* Blender Importer for loading JSON files. ([alteredq](http://github.com/alteredq))
* Added load/complete callbacks to `Loader` ([mrdoob](http://github.com/mrdoob))
* Minor WebGL blend mode clean up. ([mrdoob](http://github.com/mrdoob))
* *Materials now extend Material ([mrdoob](http://github.com/mrdoob))
* `material.transparent` define whether material is transparent or not (before we were guessing). ([mrdoob](http://github.com/mrdoob))
* Added internal program cache to WebGLRenderer (reuse already available programs). ([mrdoob](http://github.com/mrdoob))


2011 03 22 - **r37** (208.495 KB, gzip: 51.376 KB)

* Changed JSON file format. (**Re-exporting of models required**) ([alteredq](http://github.com/alteredq) and [mrdoob](http://github.com/mrdoob))
* Updated Blender and 3DSMAX exporters for new format. ([alteredq](http://github.com/alteredq))
* Vertex colors are now per-face ([alteredq](http://github.com/alteredq))
* `Geometry.uvs` is now a multidimensional array (allowing infinite uv sets) ([alteredq](http://github.com/alteredq))
* `CanvasRenderer` renders `Face4` again (without spliting to 2 `Face3`) ([mrdoob](http://github.com/mrdoob))
* `ParticleCircleMaterial` > `ParticleCanvasMaterial`. Allowing injecting any `canvas.context` code! ([mrdoob](http://github.com/mrdoob))


2011 03 14 - **r36** (194.547 KB, gzip: 48.608 KB)

* Added 3DSMAX exporter. ([alteredq](http://github.com/alteredq))
* Fixed `WebGLRenderer` aspect ratio bug when scene had only one material. ([mrdoob](http://github.com/mrdoob))
* Added `sizeAttenuation` property to `ParticleBasicMaterial`. ([mrdoob](http://github.com/mrdoob))
* Added `PathCamera`. ([alteredq](http://github.com/alteredq))
* Fixed `WebGLRenderer` bug when Camera has a parent. Camera`Camera.updateMatrix` method. ([empaempa](http://github.com/empaempa))
* Fixed `Camera.updateMatrix` method and `Object3D.updateMatrix`. ([mrdoob](http://github.com/mrdoob))


2011 03 06 - **r35** (187.875 KB, gzip: 46.433 KB)

* Added methods `translate`, `translateX`, `translateY`, `translateZ` and `lookAt` methods to `Object3D`. ([mrdoob](http://github.com/mrdoob))
* Added methods `setViewport` and `setScissor` to `WebGLRenderer`. ([alteredq](http://github.com/alteredq))
* Added support for non-po2 textures. ([mrdoob](http://github.com/mrdoob) and [alteredq](http://github.com/alteredq))
* Minor API clean up. ([mrdoob](http://github.com/mrdoob))


2011 03 02 - **r34** (186.045 KB, gzip: 45.953 KB)

* Now using camera.matrixWorldInverse instead of camera.matrixWorld for projecting. ([empaempa](http://github.com/empaempa) and [mrdoob](http://github.com/mrdoob))
* Camel cased properties and object json format (**Re-exporting of models required**) ([alteredq](http://github.com/alteredq))
* Added `QuakeCamera` for easy fly-bys ([alteredq](http://github.com/alteredq))
* Added `LOD` example ([alteredq](http://github.com/alteredq))


2011 02 26 - **r33** (184.483 KB, gzip: 45.580 KB)

* Changed build setup (**build/Three.js now also include extras**) ([mrdoob](http://github.com/mrdoob))
* Added `ParticleSystem` object to `WebGLRenderer` ([alteredq](http://github.com/alteredq))
* Added `Line` support to `WebGLRenderer` ([alteredq](http://github.com/alteredq))
* Added vertex colors support to `WebGLRenderer` ([alteredq](http://github.com/alteredq))
* Added `Ribbon` object. ([alteredq](http://github.com/alteredq))
* Added updateable textures support to `WebGLRenderer` ([alteredq](http://github.com/alteredq))
* Added `Sound` object and `SoundRenderer`. ([empaempa](http://github.com/empaempa))
* `LOD`, `Bone`, `SkinnedMesh` objects and hierarchy being developed. ([empaempa](http://github.com/empaempa))
* Added hierarchies examples ([mrdoob](http://github.com/mrdoob))


2010 12 31 - **r32** (89.301 KB, gzip: 21.351 KB)

* `Scene` now supports `Fog` and `FogExp2`. `WebGLRenderer` only right now. ([alteredq](http://github.com/alteredq))
* Added `setClearColor( hex, opacity )` to `WebGLRenderer` and `CanvasRenderer` ([alteredq](http://github.com/alteredq) & [mrdoob](http://github.com/mrdoob))
* `WebGLRenderer` shader system refactored improving performance. ([alteredq](http://github.com/alteredq))
* `Projector` now does frustum culling of all the objects using their sphereBoundingBox. (thx [errynp](http://github.com/errynp))
* `material` property changed to `materials` globaly.


2010 12 06 - **r31** (79.479 KB, gzip: 18.788 KB)

* Minor Materials API change (mappings). ([alteredq](http://github.com/alteredq) & [mrdoob](http://github.com/mrdoob))
* Added Filters to `WebGLRenderer`
* `python build.py --includes` generates includes string


2010 11 30 - **r30** (77.809 KB, gzip: 18.336 KB)

* Reflection and Refraction materials support in `WebGLRenderer` ([alteredq](http://github.com/alteredq))
* `SmoothShading` support on `CanvasRenderer`/`MeshLambertMaterial`
* `MeshShaderMaterial` for `WebGLRenderer` ([alteredq](http://github.com/alteredq))
* Removed `RenderableFace4` from `Projector`/`CanvasRenderer` (maybe just temporary).
* Added extras folder with `GeometryUtils`, `ImageUtils`, `SceneUtils` and `ShaderUtils` ([alteredq](http://github.com/alteredq) & [mrdoob](http://github.com/mrdoob))
* Blender 2.5x Slim now the default exporter (old exporter removed).


2010 11 17 - **r29** (69.563 KB)

* **New materials API** Still work in progress, but mostly there. ([alteredq](http://github.com/alteredq) & [mrdoob](http://github.com/mrdoob))
* Line clipping in `CanvasRenderer` ([julianwa](http://github.com/julianwa))
* Refactored `CanvasRenderer` and `SVGRenderer`. ([mrdoob](http://github.com/mrdoob))
* Switched to Closure compiler.


2010 11 04 - **r28** (62.802 KB)

* `Loader` class allows load geometry asynchronously at runtime. ([alteredq](http://github.com/alteredq))
* `MeshPhongMaterial` working with `WebGLRenderer`. ([alteredq](http://github.com/alteredq))
* Support for *huge* objects. Max 500k polys and counting. ([alteredq](http://github.com/alteredq))
* `Projector.unprojectVector` and `Ray` class to check intersections with faces (based on [mindlapse](http://github.com/mindlapse) work)
* Fixed `Projector` z-sorting (not as jumpy anymore).
* Fixed Orthographic projection (was y-inverted).
* Hmmm.. lib file size starting to get too big...


2010 10 28 - **r25** (54.480 KB)

* `WebGLRenderer` now up to date with other renderers! ([alteredq](http://github.com/alteredq))
* .obj to .js python converter ([alteredq](http://github.com/alteredq))
* Blender 2.54 exporter
* Added `MeshFaceMaterial` (multipass per face)
* Reworked `CanvasRenderer` and `SVGRenderer` material handling


2010 10 06 - **r18** (44.420 KB)

* Added `PointLight`
* `CanvasRenderer` and `SVGRenderer` basic lighting support (ColorStroke/ColorFill only)
* `Renderer` > `Projector`. `CanvasRenderer`, `SVGRenderer` and `DOMRenderer` do not extend anymore
* Added `computeCentroids` method to `Geometry`


2010 09 17 - **r17** (39.487 KB)

* Added `Light`, `AmbientLight` and `DirectionalLight` ([philogb](http://github.com/philogb))
* `WebGLRenderer` basic lighting support ([philogb](http://github.com/philogb))
* Memory optimisations


2010 08 21 - **r16** (35.592 KB)

* Workaround for Opera bug (clearRect not working with context with negative scale)
* Additional `Matrix4` and `Vector3` methods


2010 07 23 - **r15** (32.440 KB)

* Using new object `UV` instead of `Vector2` where it should be used
* Added `Mesh.flipSided` boolean (false by default)
* `CanvasRenderer` was handling UVs at 1,1 as bitmapWidth, bitmapHeight (instead of bitmapWidth - 1, bitmapHeight - 1)
* `ParticleBitmapMaterial.offset` added
* Fixed gap when rendering `Face4` with `MeshBitmapUVMappingMaterial`


2010 07 17 - **r14** (32.144 KB)

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


2010 07 12 - **r13** (29.492 KB)

* Added `ParticleCircleMaterial` and `ParticleBitmapMaterial`
* `Particle` now use `ParticleCircleMaterial` instead of `ColorFillMaterial`
* `Particle.size` > `Particle.scale.x` and `Particle.scale.y`
* `Particle.rotation.z` for rotating the particle
* `SVGRenderer` currently out of sync


2010 07 07 - **r12** (28.494 KB)

* First version of the `WebGLRenderer` (`ColorFillMaterial` and `FaceColorFillMaterial` by now)
* `Matrix4.lookAt` fix (`CanvasRenderer` and `SVGRenderer` now handle the -Y)
* `Color` now using 0-1 floats instead of 0-255 integers


2010 07 03 - **r11** (23.541 KB)

* Blender 2.5 exporter (utils/export_threejs.py) now exports UV and normals (Thx [kikko](http://github.com/kikko))
* `Scene.add` > `Scene.addObject`
* Enabled `Scene.removeObject`


2010 06 22 - **r10** (23.959 KB)

* Changed Camera system. (Thx [Paul Brunt](http://github.com/supereggbert))
* `Object3D.overdraw = true` to enable CanvasRenderer screen space point expansion hack.


2010 06 20 - **r9** (23.753 KB)

* JSLinted.
* `autoClear` property for renderers.
* Removed SVG rgba() workaround for WebKit. (WebKit now supports it)
* Fixed matrix bug. (transformed objects outside the x axis would get infinitely tall :S)


2010 06 06 - **r8** (23.496 KB)

* Moved UVs to `Geometry`.
* `CanvasRenderer` expands screen space points (workaround for antialias gaps).
* `CanvasRenderer` supports `BitmapUVMappingMaterial`.


2010 06 05 - **r7** (22.387 KB)

* Added Line Object.
* Workaround for WebKit not supporting rgba() in SVG yet.
* No need to call updateMatrix(). Use .autoUpdateMatrix = false if needed. (Thx [Gregory Athons](http://github.com/gregmax17)).


2010 05 17 - **r6** (21.003 KB)

* 2d clipping on `CanvasRenderer` and `SVGRenderer`
* `clearRect` optimisations on `CanvasRenderer`


2010 05 16 - **r5** (19.026 KB)

* Removed Class.js dependency
* Added `THREE` namespace
* `Camera.x` -> `Camera.position.x`
* `Camera.target.x` > `Camera.target.position.x`
* `ColorMaterial` > `ColorFillMaterial`
* `FaceColorMaterial` > `FaceColorFillMaterial`
* Materials are now multipass (use array)
* Added `ColorStrokeMaterial` and `FaceColorStrokeMaterial`
* `geometry.faces.a` are now indexes instead of references


2010 04 26 - **r4** (16.274 KB)

* `SVGRenderer` Particle rendering
* `CanvasRenderer` uses `context.setTransform` to avoid extra calculations


2010 04 24 - **r3** (16.392 KB)

* Fixed incorrect rotation matrix transforms
* Added `Plane` and `Cube` primitives


2010 04 24 - **r2** (15.724 KB)

* Improved `Color` handling


2010 04 24 - **r1** (15.25 KB)

* First alpha release
