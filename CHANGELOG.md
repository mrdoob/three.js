# THREE.JS

## r91

### Source

- Global
    - Remove `optionalTarget.` [#12783](https://github.com/mrdoob/three.js/issues/12783), [#13494](https://github.com/mrdoob/three.js/issues/13494), [#13510](https://github.com/mrdoob/three.js/issues/13510), [#13518](https://github.com/mrdoob/three.js/issues/13518), [#13520](https://github.com/mrdoob/three.js/issues/13520), [#13525](https://github.com/mrdoob/three.js/issues/13525), [#13530](https://github.com/mrdoob/three.js/issues/13530) ([@WestLangley](https://github.com/WestLangley), [@Mugen87](https://github.com/Mugen87))
    - Add `.DS_Store` to `.npmignore`. [#13354](https://github.com/mrdoob/three.js/issues/13354) ([@Itee](https://github.com/Itee))
    - Remove unnecessary `uuid` properties. [#13463](https://github.com/mrdoob/three.js/issues/13463), [#13462](https://github.com/mrdoob/three.js/issues/13462) ([@aardgoose](https://github.com/aardgoose))
    - Move default callbacks to prototype. [#13469](https://github.com/mrdoob/three.js/issues/13469), [#13467](https://github.com/mrdoob/three.js/issues/13467) ([@aardgoose](https://github.com/aardgoose))
- AnimationAction
    - Fix processing of `LoopRepeat`. [#13374](https://github.com/mrdoob/three.js/issues/13374) ([@Mugen87](https://github.com/Mugen87))
- BufferGeometry
    - Honor groups in `.toNonIndexed()`. [#13217](https://github.com/mrdoob/three.js/issues/13217) ([@WestLangley](https://github.com/WestLangley))
    - Changed semantics of `.center()`. [#13532](https://github.com/mrdoob/three.js/issues/13532) ([@Mugen87](https://github.com/Mugen87))
- DirectGeometry
    - Remove unused `.indices` property. [#13378](https://github.com/mrdoob/three.js/issues/13378) ([@Mugen87](https://github.com/Mugen87))
- ExtrudeGeometry
    - Remove options `material` and `extrudeMaterial`. [#13560](https://github.com/mrdoob/three.js/issues/13560) ([@Mugen87](https://github.com/Mugen87))
- Geometry
    - Clarified `.mergeMesh()`. [#13531](https://github.com/mrdoob/three.js/issues/13531) ([@Mugen87](https://github.com/Mugen87))
    - Changed semantics of `.center()`. [#13532](https://github.com/mrdoob/three.js/issues/13532) ([@Mugen87](https://github.com/Mugen87))
- JSONLoader
    - Remove reference to deprecated `SceneLoader`. [#13418](https://github.com/mrdoob/three.js/issues/13418) ([@jimtang](https://github.com/jimtang))
- Loader
    - Fix parsing of `mapNormalFactor`. [#13493](https://github.com/mrdoob/three.js/issues/13493) ([@Troyhy](https://github.com/Troyhy))
- MaterialLoader
    - Add `polygonOffset` support. [#13358](https://github.com/mrdoob/three.js/issues/13358) ([@Mugen87](https://github.com/Mugen87))
- Raycaster
    - Add `optionalTarget` to `.intersectObject()`. [#12872](https://github.com/mrdoob/three.js/issues/12872) ([@ngokevin](https://github.com/ngokevin))
- Object3D
    - Remove `.getWorldRotation()`. [#13481](https://github.com/mrdoob/three.js/issues/13481) ([@WestLangley](https://github.com/WestLangley))
- ObjectLoader
    - Improve parsing of `OrthographicCamera`. [#13514](https://github.com/mrdoob/three.js/issues/13514) ([@Mugen87](https://github.com/Mugen87))
- ShadowMaterial
    - Added `.copy()`. [#13416](https://github.com/mrdoob/three.js/issues/13416) ([@Mugen87](https://github.com/Mugen87))
- Triangle
    - Rename methods. [#13549](https://github.com/mrdoob/three.js/issues/13549) ([@Mugen87](https://github.com/Mugen87))
- WebGLAttributes
    - Introduce usage of WeakMap. [#13102](https://github.com/mrdoob/three.js/issues/13102) ([@aardgoose](https://github.com/aardgoose))
- WebGLInfo
    - Introduced `WebGLInfo`. [#13404](https://github.com/mrdoob/three.js/issues/13404) ([@Mugen87](https://github.com/Mugen87))
    - Renamed primitives. [#13431](https://github.com/mrdoob/three.js/issues/13431) ([@Mugen87](https://github.com/Mugen87))
- WebGLProperties
    - Introduce usage of WeakMap. [#13102](https://github.com/mrdoob/three.js/issues/13102) ([@aardgoose](https://github.com/aardgoose))
    - Fixed weakmap usage in `update()`. [#13406](https://github.com/mrdoob/three.js/issues/13406) ([@mrdoob](https://github.com/mrdoob))
- WebGLRenderer
    - Separate light entities shaders from light maps shaders. [#13277](https://github.com/mrdoob/three.js/issues/13277) ([@sunag](https://github.com/sunag))
    - Split `normal_fragment` to `normal_fragment_begin` and `normal_fragment_maps`. [#13360](https://github.com/mrdoob/three.js/issues/13360) ([@sunag](https://github.com/sunag))
    - Add renderer parameter to `.onBeforeCompile()`. [#13362](https://github.com/mrdoob/three.js/issues/13362) ([@sunag](https://github.com/sunag))
    - BasicDepthPacking: White nearest. [#13480](https://github.com/mrdoob/three.js/issues/13480) ([@WestLangley](https://github.com/WestLangley))
    - Replace 8 with real maxMipLevel in `lights_fragment_maps.glsl`. [#13501](https://github.com/mrdoob/three.js/issues/13501) ([@takahirox](https://github.com/takahirox))
    - Added support for `texSubImage2D`. [#13512](https://github.com/mrdoob/three.js/issues/13512) ([@Mugen87](https://github.com/Mugen87))
- WebGLTexture
    - Clean up. [#13519](https://github.com/mrdoob/three.js/issues/13519) ([@takahirox](https://github.com/takahirox))
    - Refactored `generateMipmaps()` usage. [#13521](https://github.com/mrdoob/three.js/issues/13521) ([@mrdoob](https://github.com/mrdoob))
    - Make `clampToMaxSize()` more robust. [#13586](https://github.com/mrdoob/three.js/issues/13586) ([@Mugen87](https://github.com/Mugen87))
- WebVRManager
    - Fix camera transforms in VR. [#13414](https://github.com/mrdoob/three.js/issues/13414) ([@brianpeiris](https://github.com/brianpeiris))

### Documentation

- Clean up. [#13352](https://github.com/mrdoob/three.js/issues/13352), [#13387](https://github.com/mrdoob/three.js/issues/13387), [#13391](https://github.com/mrdoob/three.js/issues/13391), [#13441](https://github.com/mrdoob/three.js/issues/13441), [#13471](https://github.com/mrdoob/three.js/issues/13471), [#13496](https://github.com/mrdoob/three.js/issues/13496), [#13502](https://github.com/mrdoob/three.js/issues/13502), [#13509](https://github.com/mrdoob/three.js/issues/13509), [#13527](https://github.com/mrdoob/three.js/issues/13527) ([@MagnuzBinder](https://github.com/MagnuzBinder), [@szrharrison](https://github.com/szrharrison), [@hellochenwang](https://github.com/hellochenwang), [@WJsjtu](https://github.com/WJsjtu), [@Glinkis](https://github.com/Glinkis), [@jdanford](https://github.com/jdanford), [@Mugen87](https://github.com/Mugen87), [@ivoelbert](https://github.com/ivoelbert), [@zouyang1230](https://github.com/zouyang1230))
- Visible type information. [#13308](https://github.com/mrdoob/three.js/issues/13308) ([@donmccurdy](https://github.com/donmccurdy))
- Improved `Lensflare` page. [#13353](https://github.com/mrdoob/three.js/issues/13353) ([@gadlol](https://github.com/gadlol))
- Improved `FileLoader` page. [#13489](https://github.com/mrdoob/three.js/issues/13489) ([@takahirox](https://github.com/takahirox))
- Improved `GLTFLoader` page. [#13356](https://github.com/mrdoob/three.js/issues/13356), [#13357](https://github.com/mrdoob/three.js/issues/13357), [#13392](https://github.com/mrdoob/three.js/issues/13392), [#13413](https://github.com/mrdoob/three.js/issues/13413), [#13570](https://github.com/mrdoob/three.js/issues/13570) ([@takahirox](https://github.com/takahirox), [@donmccurdy](https://github.com/donmccurdy))
- Improved `GLTFExporter` page. [#13433](https://github.com/mrdoob/three.js/issues/13433), [#13449](https://github.com/mrdoob/three.js/issues/13449), [#13476](https://github.com/mrdoob/three.js/issues/13476) ([@takahirox](https://github.com/takahirox))
- Improved `Useful-links` page. [#13388](https://github.com/mrdoob/three.js/issues/13388), [#13492](https://github.com/mrdoob/three.js/issues/13492) ([@edwinwebb](https://github.com/edwinwebb), [@jfpferreira](https://github.com/jfpferreira))
- Improved `Material` page. [#13436](https://github.com/mrdoob/three.js/issues/13436) ([@Mugen87](https://github.com/Mugen87))
- Improved `MeshPhysicalMaterial` page. [#13564](https://github.com/mrdoob/three.js/issues/13564) ([@Mugen87](https://github.com/Mugen87))
- Improved `RectAreaLight` page. [#13529](https://github.com/mrdoob/three.js/issues/13529) ([@Mugen87](https://github.com/Mugen87))
- Improved `SpriteMaterial` page. [#13546](https://github.com/mrdoob/three.js/issues/13546) ([@wcoebergh](https://github.com/wcoebergh))
- Improved `WebGLRenderer` page. [#13442](https://github.com/mrdoob/three.js/issues/13442) ([@servinlp](https://github.com/servinlp))
- Added `CSS3DRenderer` page. [#13472](https://github.com/mrdoob/three.js/issues/13472) ([@Mugen87](https://github.com/Mugen87))
- Added `CSS2DRenderer` page. [#13486](https://github.com/mrdoob/three.js/issues/13486) ([@Mugen87](https://github.com/Mugen87))

### Examples

- Clean up. [#13348](https://github.com/mrdoob/three.js/issues/13348), [#13491](https://github.com/mrdoob/three.js/issues/13491), [#13522](https://github.com/mrdoob/three.js/issues/13522), [#13543](https://github.com/mrdoob/three.js/issues/13543), [#13547](https://github.com/mrdoob/three.js/issues/13547), [#13582](https://github.com/mrdoob/three.js/issues/13582) ([@WestLangley](https://github.com/WestLangley), [@Mugen87](https://github.com/Mugen87))
- Added `linewidth` support and `webgl_lines_fat` example. [#11349](https://github.com/mrdoob/three.js/issues/11349) ([@WestLangley](https://github.com/WestLangley))
- Improved `misc_controls_orbit`. [#12742](https://github.com/mrdoob/three.js/issues/12742) ([@WestLangley](https://github.com/WestLangley))
- Added `webgl_curvature_estimation` example. [#13120](https://github.com/mrdoob/three.js/issues/13120) ([@sneha-belkhale](https://github.com/sneha-belkhale))
- Fixed `webgl_materials_compile`. [#13328](https://github.com/mrdoob/three.js/issues/13328) ([@sunag](https://github.com/sunag))
- Delete old `cubecolors` folder. [#13330](https://github.com/mrdoob/three.js/issues/13330) ([@looeee](https://github.com/looeee))
- Converted `QRCode.js` to `QRCode.json`. [#13331](https://github.com/mrdoob/three.js/issues/13331) ([@looeee](https://github.com/looeee))
- Added `THREE.Sky` to `webgl_shaders_ocean` example. [#13408](https://github.com/mrdoob/three.js/issues/13408) ([@mrdoob](https://github.com/mrdoob))
- Switch from `Geometry` to `BufferGeometry`. [#13421](https://github.com/mrdoob/three.js/issues/13421), [#13423](https://github.com/mrdoob/three.js/issues/13423), [#13427](https://github.com/mrdoob/three.js/issues/13427) ([@WestLangley](https://github.com/WestLangley))
- Clone defines in shader passes. [#13422](https://github.com/mrdoob/three.js/issues/13422) ([@WestLangley](https://github.com/WestLangley))
- Clean up `webgl_materials_modified` example. [#13435](https://github.com/mrdoob/three.js/issues/13435) ([@Mugen87](https://github.com/Mugen87))
- Clean up redundant parameterization of WebGLRenderer. [#13438](https://github.com/mrdoob/three.js/issues/13438) ([@Mugen87](https://github.com/Mugen87))
- Improved 3DOF controllers examples. [#13445](https://github.com/mrdoob/three.js/issues/13445) ([@mrdoob](https://github.com/mrdoob))
- Test manually updating video texture in `webvr_video` example. [#13470](https://github.com/mrdoob/three.js/issues/13470) ([@mrdoob](https://github.com/mrdoob))
- Reposition inset in `webgl_lines_fat` example. [#13477](https://github.com/mrdoob/three.js/issues/13477) ([@WestLangley](https://github.com/WestLangley))
- Fix opacity bug in `UnpackDepthRGBAShader`. [#13479](https://github.com/mrdoob/three.js/issues/13479) ([@WestLangley](https://github.com/WestLangley))
- Changed to white-nearest in `webgl_depth_texture` example. [#13487](https://github.com/mrdoob/three.js/issues/13487) ([@WestLangley](https://github.com/WestLangley))
- Set `.quaternion` instead of `.rotation` in loaders. [#13488](https://github.com/mrdoob/three.js/issues/13488) ([@WestLangley](https://github.com/WestLangley))
- Change rotate speed `webgl_panorama_cube` example . [#13551](https://github.com/mrdoob/three.js/issues/13551) ([@WestLangley](https://github.com/WestLangley))
- Add support for dashed fat lines. [#13584](https://github.com/mrdoob/three.js/issues/13584) ([@WestLangley](https://github.com/WestLangley))
- Combine `webgl_lines_splines` and `webgl_lines_colors` examples. [#13563](https://github.com/mrdoob/three.js/issues/13563) ([@XanderLuciano](https://github.com/XanderLuciano))
- BufferGeometryUtils
    - Add `.mergeBufferGeometries()` helper. [#13241](https://github.com/mrdoob/three.js/issues/13241) ([@donmccurdy](https://github.com/donmccurdy))
- ColladaLoader
    - Improve parsing of distance unit. [#13338](https://github.com/mrdoob/three.js/issues/13338) ([@Mugen87](https://github.com/Mugen87))
    - Simplify `buildVisualScene()`. [#13384](https://github.com/mrdoob/three.js/issues/13384) ([@Mugen87](https://github.com/Mugen87))
    - Improve parsing of node names. [#13432](https://github.com/mrdoob/three.js/issues/13432) ([@shelbyspeegle](https://github.com/shelbyspeegle))
    - Better support of textured/non-textured materials. [#13490](https://github.com/mrdoob/three.js/issues/13490) ([@Mugen87](https://github.com/Mugen87))
    - Make parsing of skeleton more robust. [#13500](https://github.com/mrdoob/three.js/issues/13500) ([@Mugen87](https://github.com/Mugen87))
- DRACOLoader
    - Move Draco libs and add readme. [#13351](https://github.com/mrdoob/three.js/issues/13351) ([@donmccurdy](https://github.com/donmccurdy))
- EXRLoader
    - Add support for reading PIZ wavelet. [#13346](https://github.com/mrdoob/three.js/issues/13346) ([@richardmonette](https://github.com/richardmonette))
- FBXLoader
    - Add support for `GeometricScaling`. [#13513](https://github.com/mrdoob/three.js/issues/13513) ([@looeee](https://github.com/looeee))
    - Support material colors in files exported from Blender. [#13515](https://github.com/mrdoob/three.js/issues/13515) ([@looeee](https://github.com/looeee))
    - Fix `FarAttenuationEnd` parsing. [#13516](https://github.com/mrdoob/three.js/issues/13516). ([@looeee](https://github.com/looeee))
- GLTFExporter
    - Export images as binary in GLB. [#12877](https://github.com/mrdoob/three.js/issues/12877) ([@donmccurdy](https://github.com/donmccurdy))
    - Fix Morph. [#12967](https://github.com/mrdoob/three.js/issues/12967) ([@takahirox](https://github.com/takahirox))
    - Add comment for empty strings name. [#13359](https://github.com/mrdoob/three.js/issues/13359) ([@takahirox](https://github.com/takahirox))
    - Support morph target names. [#13366](https://github.com/mrdoob/three.js/issues/13366) ([@takahirox](https://github.com/takahirox))
    - CubicSpline interpolation support. [#13377](https://github.com/mrdoob/three.js/issues/13377) ([@takahirox](https://github.com/takahirox))
    - GLB chunks 4-byte aligned [#13395](https://github.com/mrdoob/three.js/issues/13395) ([@fernandojsg](https://github.com/fernandojsg))
    - Fix `znear` and `zfar` range for cameras. [#13396](https://github.com/mrdoob/three.js/issues/13396) ([@fernandojsg](https://github.com/fernandojsg))
    - Add `OBJLoader` to the scene. [#13401](https://github.com/mrdoob/three.js/issues/13401) ([@fernandojsg](https://github.com/fernandojsg))
    - Add support for `metallicRoughnessTexture`. [#13415](https://github.com/mrdoob/three.js/issues/13415) ([@takahirox](https://github.com/takahirox))
    - Add support for texture cache. [#13417](https://github.com/mrdoob/three.js/issues/13417) ([@takahirox](https://github.com/takahirox))
    - Add forcePowerOfTwoTexture option. [#13424](https://github.com/mrdoob/three.js/issues/13424) ([@takahirox](https://github.com/takahirox))
    - Add forcePOT option on the example. [#13426](https://github.com/mrdoob/three.js/issues/13426) ([@fernandojsg](https://github.com/fernandojsg))
    - Compare `.name` with empty strings for the consistency. [#13468](https://github.com/mrdoob/three.js/issues/13468) ([@takahirox](https://github.com/takahirox))
    - Use `Map` for cache. [#13552](https://github.com/mrdoob/three.js/issues/13552) ([@takahirox](https://github.com/takahirox))
    - Support `KHR_materials_unlit`. [#13566](https://github.com/mrdoob/three.js/issues/13566) ([@donmccurdy](https://github.com/donmccurdy))
    - Added Multi-material support. [#13536](https://github.com/mrdoob/three.js/issues/13536) ([@takahirox](https://github.com/takahirox))
    - Fix JSON chunk padding issue. [#13542](https://github.com/mrdoob/three.js/issues/13542) ([@takahirox](https://github.com/takahirox))
    - Use Map for nodeMap. [#13562](https://github.com/mrdoob/three.js/issues/13562) ([@takahirox](https://github.com/takahirox))
- GLTFLoader
    - Add support for KHR_materials_unlit. [#13136](https://github.com/mrdoob/three.js/issues/13136) ([@robertlong](https://github.com/robertlong))
    - Add support for KHR_draco_mesh_compression. [#13194](https://github.com/mrdoob/three.js/issues/13194) ([@donmccurdy](https://github.com/donmccurdy))
    - Support morph target names. [#13367](https://github.com/mrdoob/three.js/issues/13367) ([@takahirox](https://github.com/takahirox))
    - Make `.setDRACOLoader()` chainable. [#13495](https://github.com/mrdoob/three.js/issues/13495) ([@takahirox](https://github.com/takahirox))
    - Remove spec/gloss examples generated by COLLADA2GLTF. [#13571](https://github.com/mrdoob/three.js/issues/13571) ([@donmccurdy](https://github.com/donmccurdy))
    - Remove glTF Rigged Simple model. [#13583](https://github.com/mrdoob/three.js/issues/13583) ([@takahirox](https://github.com/takahirox))
- LegacyGLTFLoader
    - Updated shader parsing. [#13339](https://github.com/mrdoob/three.js/issues/13339) ([@1d2d3d](https://github.com/1d2d3d))
    - Fix parsing textures in GLB files. [#13589](https://github.com/mrdoob/three.js/issues/13589) ([@donmccurdy](https://github.com/donmccurdy))
- Lensflare
    - Ensure internal textures are disposed. [#13355](https://github.com/mrdoob/three.js/issues/13355) ([@gadlol](https://github.com/gadlol))
- MathUtils
    - Added `MathUtils` and `.setQuaternionFromProperEuler()`. [#13538](https://github.com/mrdoob/three.js/issues/13538) ([@thezwap](https://github.com/thezwap))
    - Clean up. [#13590](https://github.com/mrdoob/three.js/issues/13590) ([@WestLangley](https://github.com/WestLangley))
- MMDLoader
    - Optimize BufferAttribute type for `skinIndex`. [#13464](https://github.com/mrdoob/three.js/issues/13464) ([@takahirox](https://github.com/takahirox))
- OBJExporter
    - Fix export without normals. [#13409](https://github.com/mrdoob/three.js/issues/13409) ([@fernandojsg](https://github.com/fernandojsg))
- OBJLoader
    - Support files with empty uvs or normals. [#13400](https://github.com/mrdoob/three.js/issues/13400) ([@fernandojsg](https://github.com/fernandojsg))
- OBJLoader2
    - V2.4.0: Parser polishing, ArrayBuffer handling, LoaderSupport clean-up. [#13524](https://github.com/mrdoob/three.js/issues/13524) ([@kaisalmen](https://github.com/kaisalmen))
- OrbitControls
    - Add support for horizontal panning. [#13242](https://github.com/mrdoob/three.js/issues/13242) ([@WestLangley](https://github.com/WestLangley))
    - Pans with inertia when damping is enabled. [#13453](https://github.com/mrdoob/three.js/issues/13453) ([@WestLangley](https://github.com/WestLangley))
    - Added `.panSpeed` property. [#13561](https://github.com/mrdoob/three.js/issues/13561) ([@WestLangley](https://github.com/WestLangley))
- PLYExporter
    - Added exporter. [#13507](https://github.com/mrdoob/three.js/issues/13507) ([@gkjohnson](https://github.com/gkjohnson))
- SAOPass
    - Fix use of multiple instances. [#13399](https://github.com/mrdoob/three.js/issues/13399) ([@cnspaha](https://github.com/cnspaha))
    - Remove unused extension. [#13412](https://github.com/mrdoob/three.js/issues/13412) ([@cnspaha](https://github.com/cnspaha))
- SoftwareRenderer
    - Remove deprecated code and improve code style. [#13548](https://github.com/mrdoob/three.js/issues/13548) ([@Mugen87](https://github.com/Mugen87))
- TransformControls
    - Improve compatibility with fog. [#13344](https://github.com/mrdoob/three.js/issues/13344) ([@Astrak](https://github.com/Astrak))
- Water2
    - Correct reversed reflection. [#13474](https://github.com/mrdoob/three.js/issues/13474) ([@msimpson](https://github.com/msimpson))

### Editor

- Focus will frame target in view. [#13165](https://github.com/mrdoob/three.js/issues/13165) ([@Adam4lexander](https://github.com/Adam4lexander))
- Add option to export GLB. [#13390](https://github.com/mrdoob/three.js/issues/13390) ([@mrdoob](https://github.com/mrdoob))
- Added edit for `.renderOrder` and `.frustumCulled`. [#13444](https://github.com/mrdoob/three.js/issues/13444) ([@Mugen87](https://github.com/Mugen87))
- Use `RGBFormat` when loading a jpg. [#13451](https://github.com/mrdoob/three.js/issues/13451) ([@mrdoob](https://github.com/mrdoob))
- Fix edit of `.fogDensity`. [#13517](https://github.com/mrdoob/three.js/issues/13517) ([@Mugen87](https://github.com/Mugen87))

### Exporters

- Blender
    - Add option to bake keyframe animation. [#13119](https://github.com/mrdoob/three.js/issues/13119) ([@pjoe](https://github.com/pjoe))

### Tests

- Fixed build. [#13523](https://github.com/mrdoob/three.js/issues/13523) ([@Mugen87](https://github.com/Mugen87))
- Added target parameter Part I. [#13550](https://github.com/mrdoob/three.js/issues/13550) (([@Mugen87](https://github.com/Mugen87)))
- Added target parameter Part II. [#13554](https://github.com/mrdoob/three.js/issues/13554) ([@Mugen87](https://github.com/Mugen87))
- Fixed unit tests. [#13555](https://github.com/mrdoob/three.js/issues/13555), [#13558](https://github.com/mrdoob/three.js/issues/13558) ([@Mugen87](https://github.com/Mugen87))
- Removed `test/perf.html`. [#13569](https://github.com/mrdoob/three.js/issues/13569) ([@Mugen87](https://github.com/Mugen87))
- Fixed fails with `npm run test`. [#13575](https://github.com/mrdoob/three.js/issues/13575) ([@Mugen87](https://github.com/Mugen87))