var fs = require( 'fs' );
THREE = require( '../build/three.js' );

var srcFolder = __dirname + '/../examples/js/';
var dstFolder = __dirname + '/../examples/jsm/';
var dstFolderNode = __dirname + '/../examples/node/';

var files = [
	{ path: 'animation/AnimationClipCreator.js', nodeVersion: 'animation/AnimationClipCreator.js', dependencies: [], ignoreList: [] },
	{ path: 'animation/CCDIKSolver.js', nodeVersion: 'animation/CCDIKSolver.js', dependencies: [], ignoreList: [ 'SkinnedMesh' ] },
	{ path: 'animation/MMDAnimationHelper.js', nodeVersion: 'animation/MMDAnimationHelper.js', dependencies: [ { name: 'CCDIKSolver', path: 'animation/CCDIKSolver.js' }, { name: 'MMDPhysics', path: 'animation/MMDPhysics.js' } ], ignoreList: [ 'AnimationClip', 'Audio', 'Camera', 'SkinnedMesh' ] },
	{ path: 'animation/MMDPhysics.js', nodeVersion: 'animation/MMDPhysics.js', dependencies: [], ignoreList: [ 'SkinnedMesh' ] },

	{ path: 'cameras/CinematicCamera.js', nodeVersion: 'cameras/CinematicCamera.js', dependencies: [ { name: 'BokehShader', path: 'shaders/BokehShader2.js' }, { name: 'BokehDepthShader', path: 'shaders/BokehShader2.js' } ], ignoreList: [] },

	{ path: 'controls/DragControls.js', nodeVersion: 'controls/DragControls.js', dependencies: [], ignoreList: [] },
	{ path: 'controls/DeviceOrientationControls.js', nodeVersion: 'controls/DeviceOrientationControls.js', dependencies: [], ignoreList: [] },
	{ path: 'controls/FirstPersonControls.js', nodeVersion: 'controls/FirstPersonControls.js', dependencies: [], ignoreList: [] },
	{ path: 'controls/FlyControls.js', nodeVersion: 'controls/FlyControls.js', dependencies: [], ignoreList: [] },
	{ path: 'controls/OrbitControls.js', nodeVersion: 'controls/OrbitControls.js', dependencies: [], ignoreList: [] },
	{ path: 'controls/PointerLockControls.js', nodeVersion: 'controls/PointerLockControls.js', dependencies: [], ignoreList: [] },
	{ path: 'controls/TrackballControls.js', nodeVersion: 'controls/TrackballControls.js', dependencies: [], ignoreList: [] },
	{ path: 'controls/TransformControls.js', nodeVersion: 'controls/TransformControls.js', dependencies: [], ignoreList: [] },

	{ path: 'curves/CurveExtras.js', nodeVersion: 'curves/CurveExtras.js', dependencies: [], ignoreList: [] },
	{ path: 'curves/NURBSCurve.js', nodeVersion: 'curves/NURBSCurve.js', dependencies: [ { name: 'NURBSUtils', path: 'curves/NURBSUtils.js' } ], ignoreList: [] },
	{ path: 'curves/NURBSSurface.js', nodeVersion: 'curves/NURBSSurface.js', dependencies: [ { name: 'NURBSUtils', path: 'curves/NURBSUtils.js' } ], ignoreList: [] },
	{ path: 'curves/NURBSUtils.js', nodeVersion: 'curves/NURBSUtils.js', dependencies: [], ignoreList: [] },

	{ path: 'effects/AnaglyphEffect.js', nodeVersion: 'effects/AnaglyphEffect.js', dependencies: [], ignoreList: [] },
	{ path: 'effects/AsciiEffect.js', nodeVersion: 'effects/AsciiEffect.js', dependencies: [], ignoreList: [] },
	{ path: 'effects/OutlineEffect.js', nodeVersion: 'effects/OutlineEffect.js', dependencies: [], ignoreList: [] },
	{ path: 'effects/ParallaxBarrierEffect.js', nodeVersion: 'effects/ParallaxBarrierEffect.js', dependencies: [], ignoreList: [] },
	{ path: 'effects/PeppersGhostEffect.js', nodeVersion: 'effects/PeppersGhostEffect.js', dependencies: [], ignoreList: [] },
	{ path: 'effects/StereoEffect.js', nodeVersion: 'effects/StereoEffect.js', dependencies: [], ignoreList: [] },

	{ path: 'exporters/ColladaExporter.js', nodeVersion: 'exporters/ColladaExporter.js', dependencies: [], ignoreList: [] },
	{ path: 'exporters/DRACOExporter.js', nodeVersion: 'exporters/DRACOExporter.js', dependencies: [], ignoreList: [ 'Geometry' ] },
	{ path: 'exporters/GLTFExporter.js', nodeVersion: 'exporters/GLTFExporter.js', dependencies: [], ignoreList: [ 'AnimationClip', 'Camera', 'Geometry', 'Material', 'Mesh', 'Object3D', 'Scenes', 'ShaderMaterial', 'Matrix4' ] },
	{ path: 'exporters/MMDExporter.js', nodeVersion: 'exporters/MMDExporter.js', dependencies: [ { name: 'MMDParser', path: 'libs/mmdparser.module.js' } ], ignoreList: [] },
	{ path: 'exporters/OBJExporter.js', nodeVersion: 'exporters/OBJExporter.js', dependencies: [], ignoreList: [] },
	{ path: 'exporters/PLYExporter.js', nodeVersion: 'exporters/PLYExporter.js', dependencies: [], ignoreList: [] },
	{ path: 'exporters/STLExporter.js', nodeVersion: 'exporters/STLExporter.js', dependencies: [], ignoreList: [] },

	{ path: 'geometries/BoxLineGeometry.js', nodeVersion: 'geometries/BoxLineGeometry.js', dependencies: [], ignoreList: [] },
	{ path: 'geometries/ConvexGeometry.js', nodeVersion: 'geometries/ConvexGeometry.js', dependencies: [ { name: 'ConvexHull', path: 'math/ConvexHull.js' } ], ignoreList: [] },
	{ path: 'geometries/DecalGeometry.js', nodeVersion: 'geometries/DecalGeometry.js', dependencies: [], ignoreList: [] },
	{ path: 'geometries/LightningStrike.js', nodeVersion: 'geometries/LightningStrike.js', dependencies: [ { name: 'SimplexNoise', path: 'math/SimplexNoise.js' } ], ignoreList: [ 'Mesh' ] },
	{ path: 'geometries/ParametricGeometries.js', nodeVersion: 'geometries/ParametricGeometries.js', dependencies: [], ignoreList: [] },
	{ path: 'geometries/TeapotBufferGeometry.js', nodeVersion: 'geometries/TeapotBufferGeometry.js', dependencies: [], ignoreList: [] },

	{ path: 'interactive/SelectionBox.js', nodeVersion: 'interactive/SelectionBox.js', dependencies: [], ignoreList: [] },
	{ path: 'interactive/SelectionHelper.js', nodeVersion: 'interactive/SelectionHelper.js', dependencies: [], ignoreList: [] },

	{ path: 'lights/LightProbeGenerator.js', nodeVersion: 'lights/LightProbeGenerator.js', dependencies: [], ignoreList: [] },
	{ path: 'lights/RectAreaLightUniformsLib.js', nodeVersion: 'lights/RectAreaLightUniformsLib.js', dependencies: [], ignoreList: [] },

	{ path: 'lines/Line2.js', nodeVersion: 'lines/Line2.js', dependencies: [ { name: 'LineSegments2', path: 'lines/LineSegments2.js' }, { name: 'LineGeometry', path: 'lines/LineGeometry.js' }, { name: 'LineMaterial', path: 'lines/LineMaterial.js' } ], ignoreList: [] },
	{ path: 'lines/LineGeometry.js', nodeVersion: 'lines/LineGeometry.js', dependencies: [ { name: 'LineSegmentsGeometry', path: 'lines/LineSegmentsGeometry.js' } ], ignoreList: [] },
	{ path: 'lines/LineMaterial.js', nodeVersion: 'lines/LineMaterial.js', dependencies: [], ignoreList: [] },
	{ path: 'lines/LineSegments2.js', nodeVersion: 'lines/LineSegments2.js', dependencies: [ { name: 'LineSegmentsGeometry', path: 'lines/LineSegmentsGeometry.js' }, { name: 'LineMaterial', path: 'lines/LineMaterial.js' } ], ignoreList: [] },
	{ path: 'lines/LineSegmentsGeometry.js', nodeVersion: 'lines/LineSegmentsGeometry.js', dependencies: [], ignoreList: [] },
	{ path: 'lines/Wireframe.js', nodeVersion: 'lines/Wireframe.js', dependencies: [ { name: 'LineSegmentsGeometry', path: 'lines/LineSegmentsGeometry.js' }, { name: 'LineMaterial', path: 'lines/LineMaterial.js' } ], ignoreList: [] },
	{ path: 'lines/WireframeGeometry2.js', nodeVersion: 'lines/WireframeGeometry2.js', dependencies: [ { name: 'LineSegmentsGeometry', path: 'lines/LineSegmentsGeometry.js' } ], ignoreList: [] },

	{ path: 'loaders/3MFLoader.js', nodeVersion: 'loaders/3MFLoader.js', dependencies: [ { name: 'JSZip', path: 'libs/jszip.module.min.js' } ], ignoreList: [] },
	{ path: 'loaders/AMFLoader.js', nodeVersion: 'loaders/AMFLoader.js', dependencies: [ { name: 'JSZip', path: 'libs/jszip.module.min.js' } ], ignoreList: [] },
	{ path: 'loaders/AssimpLoader.js', nodeVersion: 'loaders/AssimpLoader.js', dependencies: [], ignoreList: [] },
	{ path: 'loaders/BasisTextureLoader.js', nodeVersion: 'loaders/BasisTextureLoader.js', dependencies: [], ignoreList: [] },
	{ path: 'loaders/BVHLoader.js', nodeVersion: 'loaders/BVHLoader.js', dependencies: [], ignoreList: [ 'Bones' ] },
	{ path: 'loaders/ColladaLoader.js', nodeVersion: 'loaders/ColladaLoader.js', dependencies: [ { name: 'TGALoader', path: 'loaders/TGALoader.js' } ], ignoreList: [] },
	{ path: 'loaders/DDSLoader.js', nodeVersion: 'loaders/DDSLoader.js', dependencies: [], ignoreList: [] },
	{ path: 'loaders/DRACOLoader.js', nodeVersion: 'loaders/DRACOLoader.js', dependencies: [], ignoreList: [ 'LoadingManager' ] },
	{ path: 'loaders/EXRLoader.js', nodeVersion: 'loaders/EXRLoader.js', dependencies: [ { name: 'Inflate', path: 'libs/inflate.module.min.js' } ], ignoreList: [] },
	{ path: 'loaders/FBXLoader.js', nodeVersion: 'loaders/FBXLoader.js', dependencies: [ { name: 'Inflate', path: 'libs/inflate.module.min.js' }, { name: 'NURBSCurve', path: 'curves/NURBSCurve.js' } ], ignoreList: [] },
	{ path: 'loaders/GCodeLoader.js', nodeVersion: 'loaders/GCodeLoader.js', dependencies: [], ignoreList: [] },
	{ path: 'loaders/GLTFLoader.js', nodeVersion: 'loaders/GLTFLoader.js', dependencies: [], ignoreList: [ 'NoSide', 'Matrix2', 'Camera', 'Texture' ] },
	{ path: 'loaders/HDRCubeTextureLoader.js', nodeVersion: 'loaders/HDRCubeTextureLoader.js', dependencies: [ { name: 'RGBELoader', path: 'loaders/RGBELoader.js' } ], ignoreList: [] },
	{ path: 'loaders/KMZLoader.js', nodeVersion: 'loaders/KMZLoader.js', dependencies: [ { name: 'ColladaLoader', path: 'loaders/ColladaLoader.js' }, { name: 'JSZip', path: 'libs/jszip.module.min.js' } ], ignoreList: [] },
	{ path: 'loaders/LDrawLoader.js', nodeVersion: 'loaders/LDrawLoader.js', dependencies: [], ignoreList: [ 'Cache', 'Material', 'Object3D' ] },
	{ path: 'loaders/KTXLoader.js', nodeVersion: 'loaders/KTXLoader.js', dependencies: [], ignoreList: [] },
	{ path: 'loaders/MD2Loader.js', nodeVersion: 'loaders/MD2Loader.js', dependencies: [], ignoreList: [] },
	{ path: 'loaders/MMDLoader.js', nodeVersion: 'loaders/MMDLoader.js', dependencies: [ { name: 'TGALoader', path: 'loaders/TGALoader.js' }, { name: 'MMDParser', path: 'libs/mmdparser.module.js' } ], ignoreList: [ 'Camera', 'LoadingManager' ] },
	{ path: 'loaders/MTLLoader.js', nodeVersion: 'loaders/MTLLoader.js', dependencies: [], ignoreList: [ 'BackSide', 'DoubleSide', 'ClampToEdgeWrapping', 'MirroredRepeatWrapping' ] },
	{ path: 'loaders/NRRDLoader.js', nodeVersion: 'loaders/NRRDLoader.js', dependencies: [ { name: 'Zlib', path: 'libs/gunzip.module.min.js' }, { name: 'Volume', path: 'misc/Volume.js' } ], ignoreList: [] },
	{ path: 'loaders/OBJLoader.js', nodeVersion: 'loaders/OBJLoader.js', dependencies: [], ignoreList: [] },
	{ path: 'loaders/PCDLoader.js', nodeVersion: 'loaders/PCDLoader.js', dependencies: [], ignoreList: [] },
	{ path: 'loaders/PDBLoader.js', nodeVersion: 'loaders/PDBLoader.js', dependencies: [], ignoreList: [] },
	{ path: 'loaders/PLYLoader.js', nodeVersion: 'loaders/PLYLoader.js', dependencies: [], ignoreList: [ 'Mesh' ] },
	{ path: 'loaders/PRWMLoader.js', nodeVersion: 'loaders/PRWMLoader.js', dependencies: [], ignoreList: [] },
	{ path: 'loaders/PVRLoader.js', nodeVersion: 'loaders/PVRLoader.js', dependencies: [], ignoreList: [] },
	{ path: 'loaders/RGBELoader.js', nodeVersion: 'loaders/RGBELoader.js', dependencies: [], ignoreList: [ 'RGBAFormat' ] },
	{ path: 'loaders/STLLoader.js', nodeVersion: 'loaders/STLLoader.js', dependencies: [], ignoreList: [ 'Mesh', 'MeshPhongMaterial' ] },
	{ path: 'loaders/SVGLoader.js', nodeVersion: 'loaders/SVGLoader.js', dependencies: [], ignoreList: [ 'Color' ] },
	{ path: 'loaders/TDSLoader.js', nodeVersion: 'loaders/TDSLoader.js', dependencies: [], ignoreList: [] },
	{ path: 'loaders/TGALoader.js', nodeVersion: 'loaders/TGALoader.js', dependencies: [], ignoreList: [] },
	{ path: 'loaders/TTFLoader.js', nodeVersion: 'loaders/TTFLoader.js', dependencies: [ { name: 'opentype', path: 'libs/opentype.module.min.js' } ], ignoreList: [ 'Font' ] },
	{ path: 'loaders/VRMLLoader.js', nodeVersion: 'loaders/VRMLLoader.js', dependencies: [ { name: 'chevrotain', path: 'libs/chevrotain.module.min.js' } ], ignoreList: [] },
	{ path: 'loaders/VRMLoader.js', nodeVersion: 'loaders/VRMLoader.js', dependencies: [ { name: 'GLTFLoader', path: 'loaders/GLTFLoader.js' } ], ignoreList: [] },
	{ path: 'loaders/VTKLoader.js', nodeVersion: 'loaders/VTKLoader.js', dependencies: [ { name: 'Inflate', path: 'libs/inflate.module.min.js' } ], ignoreList: [] },
	{ path: 'loaders/XLoader.js', nodeVersion: 'loaders/XLoader.js', dependencies: [], ignoreList: [] },

	{ path: 'math/ColorConverter.js', nodeVersion: 'math/ColorConverter.js', dependencies: [], ignoreList: [] },
	{ path: 'math/ConvexHull.js', nodeVersion: 'math/ConvexHull.js', dependencies: [], ignoreList: [] },
	{ path: 'math/ImprovedNoise.js', nodeVersion: 'math/ImprovedNoise.js', dependencies: [], ignoreList: [] },
	{ path: 'math/Lut.js', nodeVersion: 'math/Lut.js', dependencies: [], ignoreList: [] },
	{ path: 'math/SimplexNoise.js', nodeVersion: 'math/SimplexNoise.js', dependencies: [], ignoreList: [] },

	{ path: 'misc/ConvexObjectBreaker.js', nodeVersion: 'misc/ConvexObjectBreaker.js', dependencies: [ { name: 'ConvexBufferGeometry', path: 'geometries/ConvexGeometry.js' } ], ignoreList: [ 'Matrix4' ] },
	{ path: 'misc/GPUComputationRenderer.js', nodeVersion: 'misc/GPUComputationRenderer.js', dependencies: [], ignoreList: [] },
	{ path: 'misc/Gyroscope.js', nodeVersion: 'misc/Gyroscope.js', dependencies: [], ignoreList: [] },
	{ path: 'misc/MD2Character.js', nodeVersion: 'misc/MD2Character.js', dependencies: [ { name: 'MD2Loader', path: 'loaders/MD2Loader.js' } ], ignoreList: [] },
	{ path: 'misc/MD2CharacterComplex.js', nodeVersion: 'misc/MD2CharacterComplex.js', dependencies: [ { name: 'MD2Loader', path: 'loaders/MD2Loader.js' }, { name: 'MorphBlendMesh', path: 'misc/MorphBlendMesh.js' } ], ignoreList: [] },
	{ path: 'misc/MorphAnimMesh.js', nodeVersion: 'misc/MorphAnimMesh.js', dependencies: [], ignoreList: [] },
	{ path: 'misc/MorphBlendMesh.js', nodeVersion: 'misc/MorphBlendMesh.js', dependencies: [], ignoreList: [] },
	{ path: 'misc/Ocean.js', nodeVersion: 'misc/Ocean.js', dependencies: [ { name: 'OceanShaders', path: 'shaders/OceanShaders.js' } ], ignoreList: [] },
	{ path: 'misc/RollerCoaster.js', nodeVersion: 'misc/RollerCoaster.js', dependencies: [], ignoreList: [] },
	{ path: 'misc/Volume.js', nodeVersion: 'misc/Volume.js', dependencies: [ { name: 'VolumeSlice', path: 'misc/VolumeSlice.js' } ], ignoreList: [] },
	{ path: 'misc/VolumeSlice.js', nodeVersion: 'misc/VolumeSlice.js', dependencies: [], ignoreList: [] },

	{ path: 'modifiers/EdgeSplitModifier.js', nodeVersion: 'modifiers/EdgeSplitModifier.js', dependencies: [ { name: 'BufferGeometryUtils', path: 'utils/BufferGeometryUtils.js' } ], ignoreList: [] },
	{ path: 'modifiers/SimplifyModifier.js', nodeVersion: 'modifiers/SimplifyModifier.js', dependencies: [], ignoreList: [] },
	{ path: 'modifiers/SubdivisionModifier.js', nodeVersion: 'modifiers/SubdivisionModifier.js', dependencies: [], ignoreList: [] },
	{ path: 'modifiers/TessellateModifier.js', nodeVersion: 'modifiers/TessellateModifier.js', dependencies: [], ignoreList: [] },

	{ path: 'objects/Lensflare.js', nodeVersion: 'objects/Lensflare.js', dependencies: [], ignoreList: [] },
	{ path: 'objects/LightningStorm.js', nodeVersion: 'objects/LightningStorm.js', dependencies: [ { name: 'LightningStrike', path: 'geometries/LightningStrike.js' } ], ignoreList: [ 'Material' ] },
	{ path: 'objects/MarchingCubes.js', nodeVersion: 'objects/MarchingCubes.js', dependencies: [], ignoreList: [] },
	{ path: 'objects/Reflector.js', nodeVersion: 'objects/Reflector.js', dependencies: [], ignoreList: [] },
	{ path: 'objects/Refractor.js', nodeVersion: 'objects/Refractor.js', dependencies: [], ignoreList: [] },
	{ path: 'objects/ReflectorRTT.js', nodeVersion: 'objects/ReflectorRTT.js', dependencies: [ { name: 'Reflector', path: 'objects/Reflector.js' } ], ignoreList: [] },
	{ path: 'objects/ShadowMesh.js', nodeVersion: 'objects/ShadowMesh.js', dependencies: [], ignoreList: [] },
	{ path: 'objects/Sky.js', nodeVersion: 'objects/Sky.js', dependencies: [], ignoreList: [] },
	{ path: 'objects/Water.js', nodeVersion: 'objects/Water.js', dependencies: [], ignoreList: [] },
	{ path: 'objects/Water2.js', nodeVersion: 'objects/Water2.js', dependencies: [ { name: 'Reflector', path: 'objects/Reflector.js' }, { name: 'Refractor', path: 'objects/Refractor.js' } ], ignoreList: [] },

	{ path: 'postprocessing/AdaptiveToneMappingPass.js', nodeVersion: 'postprocessing/AdaptiveToneMappingPass.js', dependencies: [ { name: 'Pass', path: 'postprocessing/Pass.js' }, { name: 'CopyShader', path: 'shaders/CopyShader.js' }, { name: 'LuminosityShader', path: 'shaders/LuminosityShader.js' }, { name: 'ToneMapShader', path: 'shaders/ToneMapShader.js' } ], ignoreList: [] },
	{ path: 'postprocessing/AfterimagePass.js', nodeVersion: 'postprocessing/AfterimagePass.js', dependencies: [ { name: 'Pass', path: 'postprocessing/Pass.js' }, { name: 'AfterimageShader', path: 'shaders/AfterimageShader.js' } ], ignoreList: [] },
	{ path: 'postprocessing/BloomPass.js', nodeVersion: 'postprocessing/BloomPass.js', dependencies: [ { name: 'Pass', path: 'postprocessing/Pass.js' }, { name: 'CopyShader', path: 'shaders/CopyShader.js' }, { name: 'ConvolutionShader', path: 'shaders/ConvolutionShader.js' } ], ignoreList: [] },
	{ path: 'postprocessing/BokehPass.js', nodeVersion: 'postprocessing/BokehPass.js', dependencies: [ { name: 'Pass', path: 'postprocessing/Pass.js' }, { name: 'BokehShader', path: 'shaders/BokehShader.js' } ], ignoreList: [] },
	{ path: 'postprocessing/ClearPass.js', nodeVersion: 'postprocessing/ClearPass.js', dependencies: [ { name: 'Pass', path: 'postprocessing/Pass.js' } ], ignoreList: [] },
	{ path: 'postprocessing/CubeTexturePass.js', nodeVersion: 'postprocessing/CubeTexturePass.js', dependencies: [ { name: 'Pass', path: 'postprocessing/Pass.js' } ], ignoreList: [] },
	{ path: 'postprocessing/DotScreenPass.js', nodeVersion: 'postprocessing/DotScreenPass.js', dependencies: [ { name: 'Pass', path: 'postprocessing/Pass.js' }, { name: 'DotScreenShader', path: 'shaders/DotScreenShader.js' } ], ignoreList: [] },
	{ path: 'postprocessing/EffectComposer.js', nodeVersion: 'postprocessing/EffectComposer.js', dependencies: [ { name: 'CopyShader', path: 'shaders/CopyShader.js' }, { name: 'ShaderPass', path: 'postprocessing/ShaderPass.js' }, { name: 'MaskPass', path: 'postprocessing/MaskPass.js' }, { name: 'ClearMaskPass', path: 'postprocessing/MaskPass.js' } ], ignoreList: [] },
	{ path: 'postprocessing/FilmPass.js', nodeVersion: 'postprocessing/FilmPass.js', dependencies: [ { name: 'Pass', path: 'postprocessing/Pass.js' }, { name: 'FilmShader', path: 'shaders/FilmShader.js' } ], ignoreList: [] },
	{ path: 'postprocessing/GlitchPass.js', nodeVersion: 'postprocessing/GlitchPass.js', dependencies: [ { name: 'Pass', path: 'postprocessing/Pass.js' }, { name: 'DigitalGlitch', path: 'shaders/DigitalGlitch.js' } ], ignoreList: [] },
	{ path: 'postprocessing/HalftonePass.js', nodeVersion: 'postprocessing/HalftonePass.js', dependencies: [ { name: 'Pass', path: 'postprocessing/Pass.js' }, { name: 'HalftoneShader', path: 'shaders/HalftoneShader.js' } ], ignoreList: [] },
	{ path: 'postprocessing/MaskPass.js', nodeVersion: 'postprocessing/MaskPass.js', dependencies: [ { name: 'Pass', path: 'postprocessing/Pass.js' } ], ignoreList: [] },
	{ path: 'postprocessing/OutlinePass.js', nodeVersion: 'postprocessing/OutlinePass.js', dependencies: [ { name: 'Pass', path: 'postprocessing/Pass.js' }, { name: 'CopyShader', path: 'shaders/CopyShader.js' } ], ignoreList: [] },
	{ path: 'postprocessing/RenderPass.js', nodeVersion: 'postprocessing/RenderPass.js', dependencies: [ { name: 'Pass', path: 'postprocessing/Pass.js' } ], ignoreList: [] },
	{ path: 'postprocessing/SAOPass.js', nodeVersion: 'postprocessing/SAOPass.js', dependencies: [ { name: 'Pass', path: 'postprocessing/Pass.js' }, { name: 'SAOShader', path: 'shaders/SAOShader.js' }, { name: 'DepthLimitedBlurShader', path: 'shaders/DepthLimitedBlurShader.js' }, { name: 'BlurShaderUtils', path: 'shaders/DepthLimitedBlurShader.js' }, { name: 'CopyShader', path: 'shaders/CopyShader.js' }, { name: 'UnpackDepthRGBAShader', path: 'shaders/UnpackDepthRGBAShader.js' } ], ignoreList: [] },
	{ path: 'postprocessing/SavePass.js', nodeVersion: 'postprocessing/SavePass.js', dependencies: [ { name: 'Pass', path: 'postprocessing/Pass.js' }, { name: 'CopyShader', path: 'shaders/CopyShader.js' } ], ignoreList: [] },
	{ path: 'postprocessing/ShaderPass.js', nodeVersion: 'postprocessing/ShaderPass.js', dependencies: [ { name: 'Pass', path: 'postprocessing/Pass.js' } ], ignoreList: [] },
	{ path: 'postprocessing/SMAAPass.js', nodeVersion: 'postprocessing/SMAAPass.js', dependencies: [ { name: 'Pass', path: 'postprocessing/Pass.js' }, { name: 'SMAAEdgesShader', path: 'shaders/SMAAShader.js' }, { name: 'SMAAWeightsShader', path: 'shaders/SMAAShader.js' }, { name: 'SMAABlendShader', path: 'shaders/SMAAShader.js' } ], ignoreList: [] },
	{ path: 'postprocessing/SSAARenderPass.js', nodeVersion: 'postprocessing/SSAARenderPass.js', dependencies: [ { name: 'Pass', path: 'postprocessing/Pass.js' }, { name: 'CopyShader', path: 'shaders/CopyShader.js' } ], ignoreList: [] },
	{ path: 'postprocessing/SSAOPass.js', nodeVersion: 'postprocessing/SSAOPass.js', dependencies: [ { name: 'Pass', path: 'postprocessing/Pass.js' }, { name: 'SimplexNoise', path: 'math/SimplexNoise.js' }, { name: 'SSAOShader', path: 'shaders/SSAOShader.js' }, { name: 'SSAOBlurShader', path: 'shaders/SSAOShader.js' }, { name: 'SSAODepthShader', path: 'shaders/SSAOShader.js' }, { name: 'CopyShader', path: 'shaders/CopyShader.js' } ], ignoreList: [] },
	{ path: 'postprocessing/TAARenderPass.js', nodeVersion: 'postprocessing/TAARenderPass.js', dependencies: [ { name: 'SSAARenderPass', path: 'postprocessing/SSAARenderPass.js' } ], ignoreList: [] },
	{ path: 'postprocessing/TexturePass.js', nodeVersion: 'postprocessing/TexturePass.js', dependencies: [ { name: 'Pass', path: 'postprocessing/Pass.js' }, { name: 'CopyShader', path: 'shaders/CopyShader.js' } ], ignoreList: [] },
	{ path: 'postprocessing/UnrealBloomPass.js', nodeVersion: 'postprocessing/UnrealBloomPass.js', dependencies: [ { name: 'Pass', path: 'postprocessing/Pass.js' }, { name: 'CopyShader', path: 'shaders/CopyShader.js' }, { name: 'LuminosityHighPassShader', path: 'shaders/LuminosityHighPassShader.js' } ], ignoreList: [] },

	{ path: 'renderers/CSS2DRenderer.js', nodeVersion: 'renderers/CSS2DRenderer.js', dependencies: [], ignoreList: [] },
	{ path: 'renderers/CSS3DRenderer.js', nodeVersion: 'renderers/CSS3DRenderer.js', dependencies: [], ignoreList: [] },
	{ path: 'renderers/Projector.js', nodeVersion: 'renderers/Projector.js', dependencies: [], ignoreList: [] },
	{ path: 'renderers/SVGRenderer.js', nodeVersion: 'renderers/SVGRenderer.js', dependencies: [ { name: 'Projector', path: 'renderers/Projector.js' }, { name: 'RenderableFace', path: 'renderers/Projector.js' }, { name: 'RenderableLine', path: 'renderers/Projector.js' }, { name: 'RenderableSprite', path: 'renderers/Projector.js' } ], ignoreList: [] },

	{ path: 'shaders/ACESFilmicToneMappingShader.js', nodeVersion: 'shaders/ACESFilmicToneMappingShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/AfterimageShader.js', nodeVersion: 'shaders/AfterimageShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/BasicShader.js', nodeVersion: 'shaders/BasicShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/BleachBypassShader.js', nodeVersion: 'shaders/BleachBypassShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/BlendShader.js', nodeVersion: 'shaders/BlendShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/BokehShader.js', nodeVersion: 'shaders/BokehShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/BokehShader2.js', nodeVersion: 'shaders/BokehShader2.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/BrightnessContrastShader.js', nodeVersion: 'shaders/BrightnessContrastShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/ColorCorrectionShader.js', nodeVersion: 'shaders/ColorCorrectionShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/ColorifyShader.js', nodeVersion: 'shaders/ColorifyShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/ConvolutionShader.js', nodeVersion: 'shaders/ConvolutionShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/CopyShader.js', nodeVersion: 'shaders/CopyShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/DepthLimitedBlurShader.js', nodeVersion: 'shaders/DepthLimitedBlurShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/DigitalGlitch.js', nodeVersion: 'shaders/DigitalGlitch.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/DOFMipMapShader.js', nodeVersion: 'shaders/DOFMipMapShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/DotScreenShader.js', nodeVersion: 'shaders/DotScreenShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/FilmShader.js', nodeVersion: 'shaders/FilmShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/FocusShader.js', nodeVersion: 'shaders/FocusShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/FreiChenShader.js', nodeVersion: 'shaders/FreiChenShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/FresnelShader.js', nodeVersion: 'shaders/FresnelShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/FXAAShader.js', nodeVersion: 'shaders/FXAAShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/GammaCorrectionShader.js', nodeVersion: 'shaders/GammaCorrectionShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/GodRaysShader.js', nodeVersion: 'shaders/GodRaysShader.js', dependencies: [], ignoreList: [ 'MeshDepthMaterial' ] },
	{ path: 'shaders/HalftoneShader.js', nodeVersion: 'shaders/HalftoneShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/HorizontalBlurShader.js', nodeVersion: 'shaders/HorizontalBlurShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/HorizontalTiltShiftShader.js', nodeVersion: 'shaders/HorizontalTiltShiftShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/HueSaturationShader.js', nodeVersion: 'shaders/HueSaturationShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/KaleidoShader.js', nodeVersion: 'shaders/KaleidoShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/LuminosityHighPassShader.js', nodeVersion: 'shaders/LuminosityHighPassShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/LuminosityShader.js', nodeVersion: 'shaders/LuminosityShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/MirrorShader.js', nodeVersion: 'shaders/MirrorShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/NormalMapShader.js', nodeVersion: 'shaders/NormalMapShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/OceanShaders.js', nodeVersion: 'shaders/OceanShaders.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/ParallaxShader.js', nodeVersion: 'shaders/ParallaxShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/PixelShader.js', nodeVersion: 'shaders/PixelShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/RGBShiftShader.js', nodeVersion: 'shaders/RGBShiftShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/SAOShader.js', nodeVersion: 'shaders/SAOShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/SepiaShader.js', nodeVersion: 'shaders/SepiaShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/SMAAShader.js', nodeVersion: 'shaders/SMAAShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/SobelOperatorShader.js', nodeVersion: 'shaders/SobelOperatorShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/SSAOShader.js', nodeVersion: 'shaders/SSAOShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/TechnicolorShader.js', nodeVersion: 'shaders/TechnicolorShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/ToneMapShader.js', nodeVersion: 'shaders/ToneMapShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/ToonShader.js', nodeVersion: 'shaders/ToonShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/SubsurfaceScatteringShader.js', nodeVersion: 'shaders/SubsurfaceScatteringShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/TriangleBlurShader.js', nodeVersion: 'shaders/TriangleBlurShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/UnpackDepthRGBAShader.js', nodeVersion: 'shaders/UnpackDepthRGBAShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/VerticalBlurShader.js', nodeVersion: 'shaders/VerticalBlurShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/VerticalTiltShiftShader.js', nodeVersion: 'shaders/VerticalTiltShiftShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/VignetteShader.js', nodeVersion: 'shaders/VignetteShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/VolumeShader.js', nodeVersion: 'shaders/VolumeShader.js', dependencies: [], ignoreList: [] },
	{ path: 'shaders/WaterRefractionShader.js', nodeVersion: 'shaders/WaterRefractionShader.js', dependencies: [], ignoreList: [] },

	{ path: 'utils/BufferGeometryUtils.js', nodeVersion: 'utils/BufferGeometryUtils.js', dependencies: [], ignoreList: [] },
	{ path: 'utils/GeometryUtils.js', nodeVersion: 'utils/GeometryUtils.js', dependencies: [], ignoreList: [] },
	{ path: 'utils/SceneUtils.js', nodeVersion: 'utils/SceneUtils.js', dependencies: [], ignoreList: [] },
	{ path: 'utils/ShadowMapViewer.js', nodeVersion: 'utils/ShadowMapViewer.js', dependencies: [ { name: 'UnpackDepthRGBAShader', path: 'shaders/UnpackDepthRGBAShader.js' } ], ignoreList: [] },
	{ path: 'utils/SkeletonUtils.js', nodeVersion: 'utils/SkeletonUtils.js', dependencies: [], ignoreList: [] },
	{ path: 'utils/TypedArrayUtils.js', nodeVersion: 'utils/TypedArrayUtils.js', dependencies: [], ignoreList: [] },
	{ path: 'utils/UVsDebug.js', nodeVersion: 'utils/UVsDebug.js', dependencies: [], ignoreList: [ 'SphereBufferGeometry' ] },

	{ path: 'WebGL.js', nodeVersion: 'WebGL.js', dependencies: [], ignoreList: [] },
];

for ( var i = 0; i < files.length; i ++ ) {

	var file = files[ i ];
	convert( file.path, file.dependencies, file.ignoreList, false );

	if ( file.nodeVersion ) {

		convert( file.nodeVersion, file.dependencies, file.ignoreList, true );

	}


}

//

function convert( path, exampleDependencies, ignoreList, isNode ) {

	var contents = fs.readFileSync( srcFolder + path, 'utf8' );

	var classNames = [];
	var coreDependencies = {};

	// class name

	contents = contents.replace( /THREE\.([a-zA-Z0-9]+) = /g, function ( match, p1 ) {

		classNames.push( p1 );

		console.log( p1 );

		return `var ${p1} = `;

	} );

	contents = contents.replace( /(\'?)THREE\.([a-zA-Z0-9]+)(\.{0,1})/g, function ( match, p1, p2, p3 ) {

		if ( p1 === '\'' ) return match; // Inside a string
		if ( classNames.includes( p2 ) ) return `${p2}${p3}`;

		return match;

	} );

	// methods

	contents = contents.replace( /new THREE\.([a-zA-Z0-9]+)\(/g, function ( match, p1 ) {

		if ( ignoreList.includes( p1 ) ) return match;

		if ( p1 in THREE ) coreDependencies[ p1 ] = true;

		return `new ${p1}(`;

	} );

	// constants

	contents = contents.replace( /(\'?)THREE\.([a-zA-Z0-9_]+)/g, function ( match, p1, p2 ) {

		if ( ignoreList.includes( p2 ) ) return match;
		if ( p1 === '\'' ) return match; // Inside a string
		if ( classNames.includes( p2 ) ) return p2;

		if ( p2 in THREE ) coreDependencies[ p2 ] = true;

		// console.log( match, p2 );

		return `${p2}`;

	} );

	//

	var keys = Object.keys( coreDependencies )
		.filter( value => ! classNames.includes( value ) )
		.map( value => '\n\t' + value )
		.sort()
		.toString();

	var imports = [];

	// compute path prefix for imports/exports

	var level = path.split( '/' ).length - 1;
	var pathPrefix = '../'.repeat( level );

	// core imports

	if ( keys ) {

		if ( isNode ) {

			imports.push( `import {${keys}\n} from "${pathPrefix}../../../build/three.module.node.js";` );

		} else {

			imports.push( `import {${keys}\n} from "${pathPrefix}../../build/three.module.js";` );

		}

	}

	// example imports

	for ( var dependency of exampleDependencies ) {

		imports.push( `import { ${dependency.name} } from "${pathPrefix}${dependency.path}";` );

	}

	var output = '';

	if ( imports.length > 0 ) output += imports.join( '\n' ) + '\n\n';

	output += contents + `\nexport { ${classNames.join( ', ' )} };\n`;

	// console.log( output );
	if ( keys ) {

		if ( isNode ) {

			fs.writeFileSync( dstFolderNode + path, output, 'utf-8' );

		} else {

			fs.writeFileSync( dstFolder + path, output, 'utf-8' );

		}

	}

}
