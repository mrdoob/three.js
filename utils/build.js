var fs = require("fs");
var path = require("path");
var argsparser =  require( "argsparser" );


var COMMON_FILES = [
'Three.js',
'core/Clock.js',
'core/Color.js',
'core/Vector2.js',
'core/Vector3.js',
'core/Vector4.js',
'core/Frustum.js',
'core/Ray.js',
'core/Rectangle.js',
'core/Math.js',
'core/Matrix3.js',
'core/Matrix4.js',
'core/Object3D.js',
'core/Projector.js',
'core/Quaternion.js',
'core/Vertex.js',
'core/Face3.js',
'core/Face4.js',
'core/UV.js',
'core/Geometry.js',
'core/Spline.js',
'cameras/Camera.js',
'cameras/OrthographicCamera.js',
'cameras/PerspectiveCamera.js',
'lights/Light.js',
'lights/AmbientLight.js',
'lights/DirectionalLight.js',
'lights/PointLight.js',
'lights/SpotLight.js',
'loaders/Loader.js',
'loaders/BinaryLoader.js',
'loaders/JSONLoader.js',
'loaders/SceneLoader.js',
'materials/Material.js',
'materials/LineBasicMaterial.js',
'materials/MeshBasicMaterial.js',
'materials/MeshLambertMaterial.js',
'materials/MeshPhongMaterial.js',
'materials/MeshDepthMaterial.js',
'materials/MeshNormalMaterial.js',
'materials/MeshFaceMaterial.js',
'materials/ParticleBasicMaterial.js',
'materials/ParticleCanvasMaterial.js',
'materials/ParticleDOMMaterial.js',
'materials/ShaderMaterial.js',
'textures/Texture.js',
'textures/DataTexture.js',
'objects/Particle.js',
'objects/ParticleSystem.js',
'objects/Line.js',
'objects/Mesh.js',
'objects/Bone.js',
'objects/SkinnedMesh.js',
'objects/MorphAnimMesh.js',
'objects/Ribbon.js',
'objects/LOD.js',
'objects/Sprite.js',
'scenes/Scene.js',
'scenes/Fog.js',
'scenes/FogExp2.js',
'renderers/CanvasRenderer.js',
'renderers/WebGLShaders.js',
'renderers/WebGLRenderer.js',
'renderers/WebGLRenderTarget.js',
'renderers/WebGLRenderTargetCube.js',
'renderers/renderables/RenderableVertex.js',
'renderers/renderables/RenderableFace3.js',
'renderers/renderables/RenderableFace4.js',
'renderers/renderables/RenderableObject.js',
'renderers/renderables/RenderableParticle.js',
'renderers/renderables/RenderableLine.js'
];

var EXTRAS_FILES = [
'extras/ColorUtils.js',
'extras/GeometryUtils.js',
'extras/ImageUtils.js',
'extras/SceneUtils.js',
'extras/ShaderUtils.js',
'extras/core/BufferGeometry.js',
'extras/core/Curve.js',
'extras/core/CurvePath.js',
'extras/core/EventTarget.js',
'extras/core/Gyroscope.js',
'extras/core/Path.js',
'extras/core/Shape.js',
'extras/core/TextPath.js',
'extras/animation/AnimationHandler.js',
'extras/animation/Animation.js',
'extras/animation/KeyFrameAnimation.js',
'extras/cameras/CubeCamera.js',
'extras/cameras/CombinedCamera.js',
'extras/controls/FirstPersonControls.js',
'extras/controls/PathControls.js',
'extras/controls/FlyControls.js',
'extras/controls/RollControls.js',
'extras/controls/TrackballControls.js',
'extras/geometries/CubeGeometry.js',
'extras/geometries/CylinderGeometry.js',
'extras/geometries/ExtrudeGeometry.js',
'extras/geometries/LatheGeometry.js',
'extras/geometries/PlaneGeometry.js',
'extras/geometries/SphereGeometry.js',
'extras/geometries/TextGeometry.js',
'extras/geometries/TorusGeometry.js',
'extras/geometries/TorusKnotGeometry.js',
'extras/geometries/TubeGeometry.js',
'extras/geometries/PolyhedronGeometry.js',
'extras/geometries/IcosahedronGeometry.js',
'extras/geometries/OctahedronGeometry.js',
'extras/geometries/TetrahedronGeometry.js',
'extras/geometries/ParametricGeometry.js',
'extras/helpers/AxisHelper.js',
'extras/helpers/ArrowHelper.js',
'extras/helpers/CameraHelper.js',
'extras/modifiers/SubdivisionModifier.js',
'extras/objects/ImmediateRenderObject.js',
'extras/objects/LensFlare.js',
'extras/objects/MorphBlendMesh.js',
'extras/renderers/plugins/LensFlarePlugin.js',
'extras/renderers/plugins/ShadowMapPlugin.js',
'extras/renderers/plugins/SpritePlugin.js',
'extras/renderers/plugins/DepthPassPlugin.js',
'extras/shaders/ShaderFlares.js',
'extras/shaders/ShaderSprite.js'
];

var CANVAS_FILES = [
'Three.js',
'core/Color.js',
'core/Vector2.js',
'core/Vector3.js',
'core/Vector4.js',
'core/Frustum.js',
'core/Ray.js',
'core/Rectangle.js',
'core/Math.js',
'core/Matrix3.js',
'core/Matrix4.js',
'core/Object3D.js',
'core/Projector.js',
'core/Quaternion.js',
'core/Vertex.js',
'core/Face3.js',
'core/Face4.js',
'core/UV.js',
'core/Geometry.js',
'cameras/Camera.js',
'cameras/OrthographicCamera.js',
'cameras/PerspectiveCamera.js',
'lights/Light.js',
'lights/AmbientLight.js',
'lights/DirectionalLight.js',
'lights/PointLight.js',
'loaders/Loader.js',
'loaders/BinaryLoader.js',
'loaders/JSONLoader.js',
'loaders/SceneLoader.js',
'materials/Material.js',
'materials/LineBasicMaterial.js',
'materials/MeshBasicMaterial.js',
'materials/MeshLambertMaterial.js',
'materials/MeshPhongMaterial.js',
'materials/MeshDepthMaterial.js',
'materials/MeshNormalMaterial.js',
'materials/MeshFaceMaterial.js',
'materials/ParticleBasicMaterial.js',
'materials/ParticleCanvasMaterial.js',
'textures/Texture.js',
'textures/DataTexture.js',
'objects/Particle.js',
'objects/Line.js',
'objects/Mesh.js',
'objects/Bone.js',
'objects/Sprite.js',
'scenes/Scene.js',
'renderers/CanvasRenderer.js',
'renderers/renderables/RenderableVertex.js',
'renderers/renderables/RenderableFace3.js',
'renderers/renderables/RenderableFace4.js',
'renderers/renderables/RenderableObject.js',
'renderers/renderables/RenderableParticle.js',
'renderers/renderables/RenderableLine.js'
];

var WEBGL_FILES = [
'Three.js',
'core/Color.js',
'core/Vector2.js',
'core/Vector3.js',
'core/Vector4.js',
'core/Frustum.js',
'core/Ray.js',
'core/Rectangle.js',
'core/Math.js',
'core/Matrix3.js',
'core/Matrix4.js',
'core/Object3D.js',
'core/Projector.js',
'core/Quaternion.js',
'core/Vertex.js',
'core/Face3.js',
'core/Face4.js',
'core/UV.js',
'core/Geometry.js',
'core/Spline.js',
'cameras/Camera.js',
'cameras/OrthographicCamera.js',
'cameras/PerspectiveCamera.js',
'lights/Light.js',
'lights/AmbientLight.js',
'lights/DirectionalLight.js',
'lights/PointLight.js',
'lights/SpotLight.js',
'loaders/Loader.js',
'loaders/BinaryLoader.js',
'loaders/JSONLoader.js',
'loaders/SceneLoader.js',
'materials/Material.js',
'materials/LineBasicMaterial.js',
'materials/MeshBasicMaterial.js',
'materials/MeshLambertMaterial.js',
'materials/MeshPhongMaterial.js',
'materials/MeshDepthMaterial.js',
'materials/MeshNormalMaterial.js',
'materials/MeshFaceMaterial.js',
'materials/ParticleBasicMaterial.js',
'materials/ShaderMaterial.js',
'textures/Texture.js',
'textures/DataTexture.js',
'objects/Particle.js',
'objects/ParticleSystem.js',
'objects/Line.js',
'objects/Mesh.js',
'objects/Bone.js',
'objects/SkinnedMesh.js',
'objects/Ribbon.js',
'objects/LOD.js',
'objects/Sprite.js',
'scenes/Scene.js',
'scenes/Fog.js',
'scenes/FogExp2.js',
'renderers/WebGLShaders.js',
'renderers/WebGLRenderer.js',
'renderers/WebGLRenderTarget.js',
'renderers/WebGLRenderTargetCube.js',
'renderers/renderables/RenderableVertex.js',
'renderers/renderables/RenderableFace3.js',
'renderers/renderables/RenderableFace4.js',
'renderers/renderables/RenderableObject.js',
'renderers/renderables/RenderableParticle.js',
'renderers/renderables/RenderableLine.js',
'extras/core/BufferGeometry.js',
'extras/core/Gyroscope.js',
'extras/helpers/CameraHelper.js',
'extras/objects/LensFlare.js',
'extras/objects/ImmediateRenderObject.js',
'extras/renderers/plugins/LensFlarePlugin.js',
'extras/renderers/plugins/ShadowMapPlugin.js',
'extras/renderers/plugins/SpritePlugin.js',
'extras/shaders/ShaderFlares.js',
'extras/shaders/ShaderSprite.js'
];

function merge(files){
	"use strict";
	var buffer = [];
	for (var i = 0,il = files.length;i<il;i++){
		var fileName = path.join("src", files[i]);
		buffer.push(fs.readFileSync(fileName,'utf8'));
	}
	
	return buffer.join("");

}

function output(text, filename){
	"use strict";
    var file = path.join('build', filename);
    fs.writeFileSync(file,text,'utf8');
}


function compress(text, fname_externs){
	/*

	externs = ""
	if fname_externs:
		externs = "--externs %s.js" % fname_externs

	in_tuple = tempfile.mkstemp()
	with os.fdopen(in_tuple[0], 'w') as handle:
		handle.write(text)

	out_tuple = tempfile.mkstemp()

	os.system("java -jar compiler/compiler.jar --warning_level=VERBOSE --jscomp_off=globalThis --jscomp_off=checkTypes --externs externs_common.js %s --language_in=ECMASCRIPT5_STRICT --js %s --js_output_file %s" % (externs, in_tuple[1], out_tuple[1]))

	with os.fdopen(out_tuple[0], 'r') as handle:
		compressed = handle.read()

	os.unlink(in_tuple[1])
	os.unlink(out_tuple[1])

	return compressed*/
	"use strict";
	return text;
}

function addHeader(text, endFilename){
	"use strict";
	return "// " + endFilename + " - http://github.com/mrdoob/three.js\n" + text;
	
}

function makeDebug(text){
	"use strict";
	var position = 0;
	while (true){
		position = text.indexOf("/* DEBUG", position);
		if (position == -1){
			break;
		}
		text = text.substring(0,position) + text.substring(position+8);
		position = text.find("*/", position);
		text = text.substring(0,position) + text.substring(position+2);
	}
	return text;
}

function buildLib(files, debug, minified, filename, fname_externs){
	"use strict";
	var text = merge(files);

	if (debug){
		text = makeDebug(text);
		filename = filename + 'Debug';
	}
	
	var folder;
	if (filename == "Three"){
		folder = '';
	} else {
		folder = 'custom/';
	}

	filename = filename + '.js';

	//print("=" * 40)
	console.log("========================================");
	console.log("Compiling " + filename);
	//print("=" * 40)
	console.log("========================================");

	if (minified){
		text = compress(text, fname_externs);
	}

	output(addHeader(text, filename), folder + filename);

}

function buildIncludes(files, filename){
	"use strict";
	//var template = "\t\t<script src='../src/%s'></script>";
	//var text = "\n".join(template % f for f in files)
	var text = [];
	for (var i = 0,il = files.length;i<il;i++){
		text.push("\t\t<script src='../src/" + files[i] + "'></script>");
	}
	
	output(text.join("\n"), filename + '.js');
}


function parse_args(){
	"use strict";
	//parse 
	var returnValue = argsparser.parse();
	/*
	# If no arguments have been passed, show the help message and exit
	if len(sys.argv) == 1:
		parser.print_help()
		sys.exit(1)
*/
	for (var i in returnValue){
		if (i.substring(0,2) == "--"){
			returnValue[i.substring(2)] = returnValue[i];
			delete returnValue[i];
		} else {
			delete returnValue[i];
		}
	}
	return returnValue;
}

function main(){
	try {
	"use strict";
	var args = parse_args();
	var debug = args.debug;
	var minified = args.minified;

	var config = [
	['Three', 'includes', '', COMMON_FILES.concat(EXTRAS_FILES), args.common],
	['ThreeCanvas', 'includes_canvas', '', CANVAS_FILES, args.canvas],
	['ThreeWebGL', 'includes_webgl', '', WEBGL_FILES, args.webgl],
	['ThreeExtras', 'includes_extras', 'externs_extras', EXTRAS_FILES, args.extras]
	];


	for (var i = 0,il = config.length;i<il;i++){
		var chosenConfig = config[i],
			fname_lib = chosenConfig[0], 
			fname_inc = chosenConfig[1], 
			fname_externs = chosenConfig[2], 
			files = chosenConfig[3], 
			enabled = chosenConfig[4];
		if (enabled || args.all){
			buildLib(files, debug, minified, fname_lib, fname_externs);
			if (args.includes){
				buildIncludes(files, fname_inc);
			}
		}
	}
	}catch(e){
		console.dir(e);
	}
}
main();


