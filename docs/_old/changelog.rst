Changelog
=========

2011 11 17 - **r46** (343.383 KB, gzip: 87.468 KB)
--------------------------------------------------

-  Added reflections to Normal Mapping.
   (`alteredq <http://github.com/alteredq>`_)
-  ``Ray`` now checks also object children.
   (`mrdoob <http://github.com/mrdoob>`_)
-  ``*Loader.load( parameters )`` to
   ``*Loader( url, callback, texturePath )``.
   (`mrdoob <http://github.com/mrdoob>`_ and
   `alteredq <http://github.com/alteredq>`_)
-  Reworked scene graph setup. (`mrdoob <http://github.com/mrdoob>`_ and
   `alteredq <http://github.com/alteredq>`_)
-  Fixed ``CanvasRenderer``'s ``SphericalReflectionMapping`` rendering.
   (`mrdoob <http://github.com/mrdoob>`_)
-  Improved ``SubdivisionModifier``. (`zz85 <http://github.com/zz85>`_)
-  Refactored ``*Controls`` to use externally supplied time delta.
   (`alteredq <http://github.com/alteredq>`_)
-  Improvements to ``CombinedCamera``.
   (`zz85 <http://github.com/zz85>`_)
-  ``ColladaLoader`` doesn't create extra ``Object3D``.
   (`mrdoob <http://github.com/mrdoob>`_)
-  Improvements to Lambert and Phong materials.
   (`alteredq <http://github.com/alteredq>`_)
-  Removed multi-materials for simplicity reasons. (Multi-materials will
   come back with MeshLayerMaterial hopefully soon)
   (`alteredq <http://github.com/alteredq>`_)
-  Fixed ``Ray`` not considering edges.
   (`mrdoob <http://github.com/mrdoob>`_)
-  Massive cleanup to ``WebGLRenderer``.
   (`alteredq <http://github.com/alteredq>`_)
-  ``Ray`` optimisations. (`mrdoob <http://github.com/mrdoob>`_ and
   `alteredq <http://github.com/alteredq>`_)
-  JSON file format is now worker-less (this was crashing Chrome/Firefox
   with dealing with many assets).
   (`alteredq <http://github.com/alteredq>`_)
-  Improved ``CubeGeometry``, ``PlaneGeometry``, ``IcosahedronGeometry``
   and ``SphereGeometry``. (`mrdoob <http://github.com/mrdoob>`_)
-  Improvements to ``Curve``. (`zz85 <http://github.com/zz85>`_)
-  Removed ``Collisions`` code and focusing on ``Ray``.
   (`mrdoob <http://github.com/mrdoob>`_)
-  Added ``cloneObject()`` method to ``SceneUtils``.
   (`alteredq <http://github.com/alteredq>`_)

2011 10 06 - **r45** (340.863 KB, gzip: 86.568 KB)
--------------------------------------------------

-  ``Object/Scene.add*()`` and ``Object/Scene.remove*()`` are now
   ``Object/Scene.add()`` and ``Object/Scene.remove()``.
   (`mrdoob <http://github.com/mrdoob>`_)
-  ``LOD.add()`` is now ``LOD.addLevel()``.
   (`mrdoob <http://github.com/mrdoob>`_)
-  Reworked ``CylinderGeometry``. (`mrdoob <http://github.com/mrdoob>`_)
-  Added ``.depthWrite`` and ``.fog`` to ``Material``.
   (`alteredq <http://github.com/alteredq>`_)
-  Added ``.applyMatrix`` to ``Geometry``.
   (`mrdoob <http://github.com/mrdoob>`_)
-  Improved postprocessing stack in ``/examples/js/postprocessing``.
   (`alteredq <http://github.com/alteredq>`_)
-  Added a realistic skin shading example.
   (`alteredq <http://github.com/alteredq>`_)
-  Started of a GUI for composing scenes and autogenerate code.
   (`mrdoob <http://github.com/mrdoob>`_)
-  Added ``.center()`` to ``GeometryUtils``.
   (`alteredq <http://github.com/alteredq>`_)
-  Fixed buggy scenegraph manipulation (adding/removing objects).
   (`jsermeno <http://github.com/jsermeno>`_,
   `alteredq <http://github.com/alteredq>`_ and
   `skython <http://github.com/skython>`_)
-  Renamed ``MeshShaderMaterial`` to ``ShaderMaterial``.
   (`alteredq <http://github.com/alteredq>`_)
-  Fixed ``CanvasRenderer`` ignoring color of ``SmoothShading``ed
   ``MeshLambertMaterial``. (`mrdoob <http://github.com/mrdoob>`_)
-  Renamed ``renderer.data`` to ``renderer.info``.
   (`mrdoob <http://github.com/mrdoob>`_)
-  Fixed ShadowMap aspect ratio. (`kig <http://github.com/kig>`_ and
   `alteredq <http://github.com/alteredq>`_)
-  Fixed ``Loader``'s ``extractUrlbase()`` incorrect output for short
   urls. (`rectalogic <http://github.com/rectalogic>`_ and
   `alteredq <http://github.com/alteredq>`_)
-  Added ``.color`` and ``.visible`` support to ``Sprite``.
   (`alteredq <http://github.com/alteredq>`_)
-  Added ``Face4``, Vertex Colors and Maya support to ``ColladaLoader``.
   (`mrdoob <http://github.com/mrdoob>`_)
-  Rewrite of lighting shader code.
   (`alteredq <http://github.com/alteredq>`_)
-  Improved internal array concatenation approach.
   (`pyrotechnick <http://github.com/pyrotechnick>`_)
-  ``WebGLRenderer`` performance improvements.
   (`alteredq <http://github.com/alteredq>`_)
-  Added lower level immediate rendering support to ``WebGLRenderer``.
   (`NINE78 <http://github.com/NINE78>`_ and
   `alteredq <http://github.com/alteredq>`_)
-  Added ``CubeCamera`` for rendering cubemaps.
   (`alteredq <http://github.com/alteredq>`_)
-  Improved ``GeometryUtils``'s ``.mergeVertices()`` performance.
   (`zz85 <http://github.com/zz85>`_)
-  Removed ``Camera``'s ``.target``.
   (`mrdoob <http://github.com/mrdoob>`_)
-  ``WebGLRenderer``'s ``.clear()`` is now
   ``.clear( color, depth, stencil )``.
   (`mrdoob <http://github.com/mrdoob>`_)
-  Added ``.autoClearColor``, ``.autoClearDepth`` and
   ``.autoClearStencil`` to ``WebGLRenderer``.
   (`mrdoob <http://github.com/mrdoob>`_ and
   `alteredq <http://github.com/alteredq>`_)
-  Added ``OctahedronGeometry``.
   (`clockworkgeek <http://github.com/clockworkgeek>`_)
-  Splitted ``Camera`` into ``PerspectiveCamera`` and
   ``OrthographicCamera``. (`mrdoob <http://github.com/mrdoob>`_ and
   `alteredq <http://github.com/alteredq>`_)
-  Special cameras are now ``*Controls``.
   (`alteredq <http://github.com/alteredq>`_ and
   `mrdoob <http://github.com/mrdoob>`_)
-  Added ``SubdivisionModifier``. (`zz85 <http://github.com/zz85>`_)
-  ``Projector``'s ``unprojectVector()`` now also works with
   ``OrthographicCamera``. (`jsermeno <http://github.com/jsermeno>`_)
-  Added ``.setLens()`` method to ``PerspectiveCamera``.
   (`zz85 <http://github.com/zz85>`_)
-  Added Shadow Maps, ``Texture``'s ``.offset`` and ``.repeat`` and
   reflections support to Normal Map shader.
   (`alteredq <http://github.com/alteredq>`_)

2011 09 04 - **r44** (330.356 KB, gzip: 84.039 KB)
--------------------------------------------------

-  Added ``ColladaLoader``. (`timknip2 <https://github.com/timknip2>`_)
-  Improved ``ExtrudeGeometry``. (`zz85 <http://github.com/zz85>`_)
-  Fixed ``CylinderGeometry`` normals.
   (`alteredq <http://github.com/alteredq>`_)
-  Fixed issue with ``WebGLRenderer.setTexture``
   (`rectalogic <http://github.com/rectalogic>`_)
-  Fixed ``TorusGeometry`` normals.
   (`mrdoob <http://github.com/mrdoob>`_)
-  Fixed ``Ray`` behind-ray intersects.
   (`mrdoob <http://github.com/mrdoob>`_)
-  Added ``OrthoCamera``. (`alteredq <http://github.com/alteredq>`_)
-  Refactored postprocessing effects used in some examples.
   (`alteredq <http://github.com/alteredq>`_)
-  Added ``.deallocateObject()`` and ``.deallocateTexture()`` methods to
   ``WebGLRenderer``. (`mrdoob <http://github.com/mrdoob>`_)
-  Fixed a glitch in normal and phong shader.
   (`evanw <http://github.com/evanw>`_ and
   `alteredq <http://github.com/alteredq>`_)
-  Added ``.frustumCulled`` property to ``Object3D``.
   (`alteredq <http://github.com/alteredq>`_ and
   `mrdoob <http://github.com/mrdoob>`_)

2011 08 14 - **r43** (298.199 KB, gzip: 74.805 KB)
--------------------------------------------------

-  Improved Blender exporter - 2.58 (and 2.59) support, normals maps,
   specular, ao maps... (`alteredq <http://github.com/alteredq>`_)
-  Added `CORS <http://www.w3.org/TR/cors/>`_ to ``ImageUtils``.
   (`mrdoob <http://github.com/mrdoob>`_)
-  Refactored ``TextGeometry`` and added ``Shape``, ``Curve``, ``Path``,
   ``ExtrudeGeometry``, ``TextPath``. (`zz85 <http://github.com/zz85>`_
   and `alteredq <http://github.com/alteredq>`_)
-  Added handling of custom attributes for ``ParticleSystems``.
   (`alteredq <http://github.com/alteredq>`_)
-  Fixed ``CanvasRenderer.setClearColor``.
   (`mrdoob <http://github.com/mrdoob>`_,
   `StephenHopkins <http://github.com/StephenHopkins>`_ and
   `sebleedelisle <http://github.com/sebleedelisle>`_)
-  Improved uniform handling in ``WebGLRenderer``.
   (`alteredq <http://github.com/alteredq>`_)
-  Implemented Shadow Mapping in ``WebGLRenderer``.
   (`alteredq <http://github.com/alteredq>`_)
-  Added ``Spotlight`` light type.
   (`alteredq <http://github.com/alteredq>`_)
-  Fixed constructor-less prototypes.
   (`pushmatrix <http://github.com/pushmatrix>`_)
-  Added ``DataTexture``. (`alteredq <http://github.com/alteredq>`_)
-  ``WebGLRenderer`` opaque pass now renders from front to back.
   (`alteredq <http://github.com/alteredq>`_)
-  Simplified ``Color``. (`mrdoob <http://github.com/mrdoob>`_)
-  Added ``preserveDrawingBuffer`` option to ``WebGLRenderer``.
   (`jeromeetienne <http://github.com/jeromeetienne>`_)
-  Added ``UTF8Loader`` for loading the new, uber compressed, `UTF8
   format <http://code.google.com/p/webgl-loader/>`_.
   (`alteredq <http://github.com/alteredq>`_)
-  ``CanvasRenderer`` now supports ``RepeatWrapping``,
   ``texture.offset`` and ``texture.repeat``.
   (`mrdoob <http://github.com/mrdoob>`_)
-  Removed Stencil Shadows and Lensflare code.
   (`mrdoob <http://github.com/mrdoob>`_)

2011 07 06 - **r42** (277.852 KB, gzip: 69.469 KB)
--------------------------------------------------

-  Added ``AnaglypWebGLRenderer`` and ``CrosseyedWebGLRenderer``.
   (`mrdoob <http://github.com/mrdoob>`_,
   `alteredq <http://github.com/alteredq>`_ and
   `marklundin <http://github.com/marklundin>`_)
-  Added ``TextGeometry``. (`zz85 <http://github.com/zz85>`_ and
   `alteredq <http://github.com/alteredq>`_)
-  Added ``setViewOffset`` method to ``Camera``.
   (`greggman <http://github.com/greggman>`_)
-  Renamed geometries to ``*Geometry``.
   (`mrdoob <http://github.com/mrdoob>`_)
-  Improved Blender exporter. (`alteredq <http://github.com/alteredq>`_,
   `sweetfish <http://github.com/sweetfish>`_ and
   `Jhonnyg <http://github.com/Jhonnyg>`_)
-  Added Blender 2.58 exporter. (`georgik <http://github.com/georgik>`_)
-  Fixed ``Matrix4.multiply()``. (thanks
   `lukem1 <http://github.com/lukem1>`_)
-  Added support for additional Euler rotation orders in ``Matrix4``.
   (`rectalogic <http://github.com/rectalogic>`_)
-  Renamed ``QuakeCamera`` to ``FirstPersonCamera``.
   (`chriskillpack <http://github.com/chriskillpack>`_)
-  Improved Normal Map Shader.
   (`alteredq <http://github.com/alteredq>`_)
-  ``Collision`` now supports ``Object3D.flipSided`` and
   ``Object3D.doubleSided``. (`NINE78 <http://github.com/NINE78>`_)
-  Removed most of ``SceneUtils`` methods.
   (`mrdoob <http://github.com/mrdoob>`_)
-  Removed ``Sound`` object and ``SoundRenderer``.
   (`mrdoob <http://github.com/mrdoob>`_)

2011 05 31 - **r41/ROME** (265.317 KB, gzip: 64.849 KB)
-------------------------------------------------------

(Up to this point, some `RO.ME <http://ro.me>`_ specific features
managed to get in the lib. The aim is to clean this up in next
revisions.)

-  Improved Blender Object and Scene exporters.
   (`alteredq <http://github.com/alteredq>`_)
-  Fixes on WebGL attributes. (`alteredq <http://github.com/alteredq>`_
   and `empaempa <http://github.com/empaempa>`_)
-  Reduced overall memory footprint.
   (`mrdoob <http://github.com/mrdoob>`_)
-  Added ``Face4`` support to ``CollisionSystem``.
   (`NINE78 <http://github.com/NINE78>`_)
-  Added Blender 2.57 exporter. (`remoe <http://github.com/remoe>`_)
-  Added ``Particle`` support to ``Ray``.
   (`mrdoob <http://github.com/mrdoob>`_ and
   `jaycrossler <http://github.com/jaycrossler>`_)
-  Improved ``Ray.intersectObject`` performance by checking
   boundingSphere first. (`mrdoob <http://github.com/mrdoob>`_)
-  Added ``TrackballCamera``.
   (`egraether <http://github.com/egraether>`_)
-  Added ``repeat`` and ``offset`` properties to ``Texture``.
   (`mrdoob <http://github.com/mrdoob>`_ and
   `alteredq <http://github.com/alteredq>`_)
-  Cleaned up ``Vector2``, ``Vector3`` and ``Vector4``.
   (`egraether <http://github.com/egraether>`_)

2011 04 24 - **r40** (263.774 KB, gzip: 64.320 KB)
--------------------------------------------------

-  Fixed ``Object3D.lookAt``. (`mrdoob <http://github.com/mrdoob>`_)
-  More and more Blender exporter goodness.
   (`alteredq <http://github.com/alteredq>`_ and
   `mrdoob <http://github.com/mrdoob>`_)
-  Improved ``CollisionSystem``.
   (`drojdjou <http://github.com/drojdjou>`_ and
   `alteredq <http://github.com/alteredq>`_)
-  Fixes on WebGLRenderer. (`empaempa <http://github.com/empaempa>`_)
-  Added ``Trident`` object.
   (`sroucheray <http://github.com/sroucheray>`_)
-  Added ``data`` object to Renderers for getting number of
   vertices/faces/callDraws from last render.
   (`mrdoob <http://github.com/mrdoob>`_)
-  Fixed ``Projector`` handling Particles with hierarchies.
   (`mrdoob <http://github.com/mrdoob>`_)

2011 04 09 - **r39** (249.048 KB, gzip: 61.020 KB)
--------------------------------------------------

-  Improved WebGLRenderer program cache.
   (`alteredq <http://github.com/alteredq>`_)
-  Added support for pre-computed edges in loaders and exporters.
   (`alteredq <http://github.com/alteredq>`_)
-  Added ``Collisions`` classes.
   (`drojdjou <http://github.com/drojdjou>`_)
-  Added ``Sprite`` object. (`empaempa <http://github.com/empaempa>`_)
-  Fixed ``*Loader`` issue where Workers were kept alive and next loads
   were delayed. (`alteredq <http://github.com/alteredq>`_)
-  Added ``THREE`` namespace to all the classes that missed it.
   (`mrdoob <http://github.com/mrdoob>`_)

2011 03 31 - **r38** (225.442 KB, gzip: 55.908 KB)
--------------------------------------------------

-  Added ``LensFlare`` light. (`empaempa <http://github.com/empaempa>`_)
-  Added ``ShadowVolume`` object (stencil shadows).
   (`empaempa <http://github.com/empaempa>`_)
-  Improved Blender Exporter plus added Scene support.
   (`alteredq <http://github.com/alteredq>`_)
-  Blender Importer for loading JSON files.
   (`alteredq <http://github.com/alteredq>`_)
-  Added load/complete callbacks to ``Loader``
   (`mrdoob <http://github.com/mrdoob>`_)
-  Minor WebGL blend mode clean up.
   (`mrdoob <http://github.com/mrdoob>`_)
-  \*Materials now extend Material
   (`mrdoob <http://github.com/mrdoob>`_)
-  ``material.transparent`` define whether material is transparent or
   not (before we were guessing). (`mrdoob <http://github.com/mrdoob>`_)
-  Added internal program cache to WebGLRenderer (reuse already
   available programs). (`mrdoob <http://github.com/mrdoob>`_)

2011 03 22 - **r37** (208.495 KB, gzip: 51.376 KB)
--------------------------------------------------

-  Changed JSON file format. (**Re-exporting of models required**)
   (`alteredq <http://github.com/alteredq>`_ and
   `mrdoob <http://github.com/mrdoob>`_)
-  Updated Blender and 3DSMAX exporters for new format.
   (`alteredq <http://github.com/alteredq>`_)
-  Vertex colors are now per-face
   (`alteredq <http://github.com/alteredq>`_)
-  ``Geometry.uvs`` is now a multidimensional array (allowing infinite
   uv sets) (`alteredq <http://github.com/alteredq>`_)
-  ``CanvasRenderer`` renders ``Face4`` again (without spliting to 2
   ``Face3``) (`mrdoob <http://github.com/mrdoob>`_)
-  ``ParticleCircleMaterial`` > ``ParticleCanvasMaterial``. Allowing
   injecting any ``canvas.context`` code!
   (`mrdoob <http://github.com/mrdoob>`_)

2011 03 14 - **r36** (194.547 KB, gzip: 48.608 KB)
--------------------------------------------------

-  Added 3DSMAX exporter. (`alteredq <http://github.com/alteredq>`_)
-  Fixed ``WebGLRenderer`` aspect ratio bug when scene had only one
   material. (`mrdoob <http://github.com/mrdoob>`_)
-  Added ``sizeAttenuation`` property to ``ParticleBasicMaterial``.
   (`mrdoob <http://github.com/mrdoob>`_)
-  Added ``PathCamera``. (`alteredq <http://github.com/alteredq>`_)
-  Fixed ``WebGLRenderer`` bug when Camera has a parent.
   Camera``Camera.updateMatrix`` method.
   (`empaempa <http://github.com/empaempa>`_)
-  Fixed ``Camera.updateMatrix`` method and ``Object3D.updateMatrix``.
   (`mrdoob <http://github.com/mrdoob>`_)

2011 03 06 - **r35** (187.875 KB, gzip: 46.433 KB)
--------------------------------------------------

-  Added methods ``translate``, ``translateX``, ``translateY``,
   ``translateZ`` and ``lookAt`` methods to ``Object3D``.
   (`mrdoob <http://github.com/mrdoob>`_)
-  Added methods ``setViewport`` and ``setScissor`` to
   ``WebGLRenderer``. (`alteredq <http://github.com/alteredq>`_)
-  Added support for non-po2 textures.
   (`mrdoob <http://github.com/mrdoob>`_ and
   `alteredq <http://github.com/alteredq>`_)
-  Minor API clean up. (`mrdoob <http://github.com/mrdoob>`_)

2011 03 02 - **r34** (186.045 KB, gzip: 45.953 KB)
--------------------------------------------------

-  Now using camera.matrixWorldInverse instead of camera.matrixWorld for
   projecting. (`empaempa <http://github.com/empaempa>`_ and
   `mrdoob <http://github.com/mrdoob>`_)
-  Camel cased properties and object json format (**Re-exporting of
   models required**) (`alteredq <http://github.com/alteredq>`_)
-  Added ``QuakeCamera`` for easy fly-bys
   (`alteredq <http://github.com/alteredq>`_)
-  Added ``LOD`` example (`alteredq <http://github.com/alteredq>`_)

2011 02 26 - **r33** (184.483 KB, gzip: 45.580 KB)
--------------------------------------------------

-  Changed build setup (**build/Three.js now also include extras**)
   (`mrdoob <http://github.com/mrdoob>`_)
-  Added ``ParticleSystem`` object to ``WebGLRenderer``
   (`alteredq <http://github.com/alteredq>`_)
-  Added ``Line`` support to ``WebGLRenderer``
   (`alteredq <http://github.com/alteredq>`_)
-  Added vertex colors support to ``WebGLRenderer``
   (`alteredq <http://github.com/alteredq>`_)
-  Added ``Ribbon`` object. (`alteredq <http://github.com/alteredq>`_)
-  Added updateable textures support to ``WebGLRenderer``
   (`alteredq <http://github.com/alteredq>`_)
-  Added ``Sound`` object and ``SoundRenderer``.
   (`empaempa <http://github.com/empaempa>`_)
-  ``LOD``, ``Bone``, ``SkinnedMesh`` objects and hierarchy being
   developed. (`empaempa <http://github.com/empaempa>`_)
-  Added hierarchies examples (`mrdoob <http://github.com/mrdoob>`_)

2010 12 31 - **r32** (89.301 KB, gzip: 21.351 KB)
-------------------------------------------------

-  ``Scene`` now supports ``Fog`` and ``FogExp2``. ``WebGLRenderer``
   only right now. (`alteredq <http://github.com/alteredq>`_)
-  Added ``setClearColor( hex, opacity )`` to ``WebGLRenderer`` and
   ``CanvasRenderer`` (`alteredq <http://github.com/alteredq>`_ &
   `mrdoob <http://github.com/mrdoob>`_)
-  ``WebGLRenderer`` shader system refactored improving performance.
   (`alteredq <http://github.com/alteredq>`_)
-  ``Projector`` now does frustum culling of all the objects using their
   sphereBoundingBox. (thx `errynp <http://github.com/errynp>`_)
-  ``material`` property changed to ``materials`` globaly.

2010 12 06 - **r31** (79.479 KB, gzip: 18.788 KB)
-------------------------------------------------

-  Minor Materials API change (mappings).
   (`alteredq <http://github.com/alteredq>`_ &
   `mrdoob <http://github.com/mrdoob>`_)
-  Added Filters to ``WebGLRenderer``
-  ``python build.py --includes`` generates includes string

2010 11 30 - **r30** (77.809 KB, gzip: 18.336 KB)
-------------------------------------------------

-  Reflection and Refraction materials support in ``WebGLRenderer``
   (`alteredq <http://github.com/alteredq>`_)
-  ``SmoothShading`` support on
   ``CanvasRenderer``/``MeshLambertMaterial``
-  ``MeshShaderMaterial`` for ``WebGLRenderer``
   (`alteredq <http://github.com/alteredq>`_)
-  Removed ``RenderableFace4`` from ``Projector``/``CanvasRenderer``
   (maybe just temporary).
-  Added extras folder with ``GeometryUtils``, ``ImageUtils``,
   ``SceneUtils`` and ``ShaderUtils``
   (`alteredq <http://github.com/alteredq>`_ &
   `mrdoob <http://github.com/mrdoob>`_)
-  Blender 2.5x Slim now the default exporter (old exporter removed).

2010 11 17 - **r29** (69.563 KB)
--------------------------------

-  **New materials API** Still work in progress, but mostly there.
   (`alteredq <http://github.com/alteredq>`_ &
   `mrdoob <http://github.com/mrdoob>`_)
-  Line clipping in ``CanvasRenderer``
   (`julianwa <http://github.com/julianwa>`_)
-  Refactored ``CanvasRenderer`` and ``SVGRenderer``.
   (`mrdoob <http://github.com/mrdoob>`_)
-  Switched to Closure compiler.

2010 11 04 - **r28** (62.802 KB)
--------------------------------

-  ``Loader`` class allows load geometry asynchronously at runtime.
   (`alteredq <http://github.com/alteredq>`_)
-  ``MeshPhongMaterial`` working with ``WebGLRenderer``.
   (`alteredq <http://github.com/alteredq>`_)
-  Support for *huge* objects. Max 500k polys and counting.
   (`alteredq <http://github.com/alteredq>`_)
-  ``Projector.unprojectVector`` and ``Ray`` class to check
   intersections with faces (based on
   `mindlapse <http://github.com/mindlapse>`_ work)
-  Fixed ``Projector`` z-sorting (not as jumpy anymore).
-  Fixed Orthographic projection (was y-inverted).
-  Hmmm.. lib file size starting to get too big...

2010 10 28 - **r25** (54.480 KB)
--------------------------------

-  ``WebGLRenderer`` now up to date with other renderers!
   (`alteredq <http://github.com/alteredq>`_)
-  .obj to .js python converter
   (`alteredq <http://github.com/alteredq>`_)
-  Blender 2.54 exporter
-  Added ``MeshFaceMaterial`` (multipass per face)
-  Reworked ``CanvasRenderer`` and ``SVGRenderer`` material handling

2010 10 06 - **r18** (44.420 KB)
--------------------------------

-  Added ``PointLight``
-  ``CanvasRenderer`` and ``SVGRenderer`` basic lighting support
   (ColorStroke/ColorFill only)
-  ``Renderer`` > ``Projector``. ``CanvasRenderer``, ``SVGRenderer`` and
   ``DOMRenderer`` do not extend anymore
-  Added ``computeCentroids`` method to ``Geometry``

2010 09 17 - **r17** (39.487 KB)
--------------------------------

-  Added ``Light``, ``AmbientLight`` and ``DirectionalLight``
   (`philogb <http://github.com/philogb>`_)
-  ``WebGLRenderer`` basic lighting support
   (`philogb <http://github.com/philogb>`_)
-  Memory optimisations

2010 08 21 - **r16** (35.592 KB)
--------------------------------

-  Workaround for Opera bug (clearRect not working with context with
   negative scale)
-  Additional ``Matrix4`` and ``Vector3`` methods

2010 07 23 - **r15** (32.440 KB)
--------------------------------

-  Using new object ``UV`` instead of ``Vector2`` where it should be
   used
-  Added ``Mesh.flipSided`` boolean (false by default)
-  ``CanvasRenderer`` was handling UVs at 1,1 as bitmapWidth,
   bitmapHeight (instead of bitmapWidth - 1, bitmapHeight - 1)
-  ``ParticleBitmapMaterial.offset`` added
-  Fixed gap when rendering ``Face4`` with
   ``MeshBitmapUVMappingMaterial``

2010 07 17 - **r14** (32.144 KB)
--------------------------------

-  Refactored ``CanvasRenderer`` (more duplicated code, but easier to
   handle)
-  ``Face4`` now supports ``MeshBitmapUVMappingMaterial``
-  Changed order of ``*StrokeMaterial`` parameters. Now it's ``color``,
   ``opacity``, ``lineWidth``.
-  ``BitmapUVMappingMaterial`` > ``MeshBitmapUVMappingMaterial``
-  ``ColorFillMaterial`` > ``MeshColorFillMaterial``
-  ``ColorStrokeMaterial`` > ``MeshColorStrokeMaterial``
-  ``FaceColorFillMaterial`` > ``MeshFaceColorFillMaterial``
-  ``FaceColorStrokeMaterial`` > ``MeshFaceColorStrokeMaterial``
-  ``ColorStrokeMaterial`` > ``LineColorMaterial``
-  ``Rectangle.instersects`` returned false with rectangles with 0px
   witdh or height

2010 07 12 - **r13** (29.492 KB)
--------------------------------

-  Added ``ParticleCircleMaterial`` and ``ParticleBitmapMaterial``
-  ``Particle`` now use ``ParticleCircleMaterial`` instead of
   ``ColorFillMaterial``
-  ``Particle.size`` > ``Particle.scale.x`` and ``Particle.scale.y``
-  ``Particle.rotation.z`` for rotating the particle
-  ``SVGRenderer`` currently out of sync

2010 07 07 - **r12** (28.494 KB)
--------------------------------

-  First version of the ``WebGLRenderer`` (``ColorFillMaterial`` and
   ``FaceColorFillMaterial`` by now)
-  ``Matrix4.lookAt`` fix (``CanvasRenderer`` and ``SVGRenderer`` now
   handle the -Y)
-  ``Color`` now using 0-1 floats instead of 0-255 integers

2010 07 03 - **r11** (23.541 KB)
--------------------------------

-  Blender 2.5 exporter (utils/export\_threejs.py) now exports UV and
   normals (Thx `kikko <http://github.com/kikko>`_)
-  ``Scene.add`` > ``Scene.addObject``
-  Enabled ``Scene.removeObject``

2010 06 22 - **r10** (23.959 KB)
--------------------------------

-  Changed Camera system. (Thx `Paul
   Brunt <http://github.com/supereggbert>`_)
-  ``Object3D.overdraw = true`` to enable CanvasRenderer screen space
   point expansion hack.

2010 06 20 - **r9** (23.753 KB)
-------------------------------

-  JSLinted.
-  ``autoClear`` property for renderers.
-  Removed SVG rgba() workaround for WebKit. (WebKit now supports it)
-  Fixed matrix bug. (transformed objects outside the x axis would get
   infinitely tall :S)

2010 06 06 - **r8** (23.496 KB)
-------------------------------

-  Moved UVs to ``Geometry``.
-  ``CanvasRenderer`` expands screen space points (workaround for
   antialias gaps).
-  ``CanvasRenderer`` supports ``BitmapUVMappingMaterial``.

2010 06 05 - **r7** (22.387 KB)
-------------------------------

-  Added Line Object.
-  Workaround for WebKit not supporting rgba() in SVG yet.
-  No need to call updateMatrix(). Use .autoUpdateMatrix = false if
   needed. (Thx `Gregory Athons <http://github.com/gregmax17>`_).

2010 05 17 - **r6** (21.003 KB)
-------------------------------

-  2d clipping on ``CanvasRenderer`` and ``SVGRenderer``
-  ``clearRect`` optimisations on ``CanvasRenderer``

2010 05 16 - **r5** (19.026 KB)
-------------------------------

-  Removed Class.js dependency
-  Added ``THREE`` namespace
-  ``Camera.x`` -> ``Camera.position.x``
-  ``Camera.target.x`` > ``Camera.target.position.x``
-  ``ColorMaterial`` > ``ColorFillMaterial``
-  ``FaceColorMaterial`` > ``FaceColorFillMaterial``
-  Materials are now multipass (use array)
-  Added ``ColorStrokeMaterial`` and ``FaceColorStrokeMaterial``
-  ``geometry.faces.a`` are now indexes instead of references

2010 04 26 - **r4** (16.274 KB)
-------------------------------

-  ``SVGRenderer`` Particle rendering
-  ``CanvasRenderer`` uses ``context.setTransform`` to avoid extra
   calculations

2010 04 24 - **r3** (16.392 KB)
-------------------------------

-  Fixed incorrect rotation matrix transforms
-  Added ``Plane`` and ``Cube`` primitives

2010 04 24 - **r2** (15.724 KB)
-------------------------------

-  Improved ``Color`` handling

2010 04 24 - **r1** (15.25 KB)
------------------------------

-  First alpha release

