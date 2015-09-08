/**
 * Library compilation.
 *
 * @author vanruesc
 */

var Constants = require( "./Constants" );

require( "./Polyfills" )();

module.exports = {

	// Cameras
	Camera: require( "./cameras/Camera" ),
	CubeCamera: require( "./cameras/CubeCamera" ),
	OrthographicCamera: require( "./cameras/OrthographicCamera" ),
	PerspectiveCamera: require( "./cameras/PerspectiveCamera" ),

	// Core
	BufferAttribute: require( "./core/BufferAttribute" ),
	BufferGeometry: require( "./core/BufferGeometry" ),
	Clock: require( "./core/Clock" ),
	DirectGeometry: require( "./core/DirectGeometry" ),
	EventDispatcher: require( "./core/EventDispatcher" ),
	Face3: require( "./core/Face3" ),
	Face4: require( "./core/Face4" ),
	Geometry: require( "./core/Geometry" ),
	InstancedBufferAttribute: require( "./core/InstancedBufferAttribute" ),
	InstancedBufferGeometry: require( "./core/InstancedBufferGeometry" ),
	InstancedInterleavedBuffer: require( "./core/InstancedInterleavedBuffer" ),
	InterleavedBuffer: require( "./core/InterleavedBuffer" ),
	InterleavedBufferAttribute: require( "./core/InterleavedBufferAttribute" ),
	Object3D: require( "./core/Object3D" ),
	Raycaster: require( "./core/Raycaster" ),

	// Extras
	FontUtils: require( "./extras/FontUtils" ),
	GeometryUtils: require( "./extras/GeometryUtils" ),
	ImageUtils: require( "./extras/ImageUtils" ),
	SceneUtils: require( "./extras/SceneUtils" ),
	ShapeUtils: require( "./extras/ShapeUtils" ),

	// > Animation
	Animation: require( "./extras/animation/Animation" ),
	AnimationHandler: require( "./extras/animation/AnimationHandler" ),
	KeyFrameAnimation: require( "./extras/animation/KeyFrameAnimation" ),
	MorphAnimation: require( "./extras/animation/MorphAnimation" ),

	// > Audio
	Audio: require( "./extras/audio/Audio" ),
	AudioListener: require( "./extras/audio/AudioListener" ),

	// > Core
	Curve: require( "./extras/core/Curve" ),
	CurvePath: require( "./extras/core/CurvePath" ),
	Path: require( "./extras/core/Path" ),
	Shape: require( "./extras/core/Shape" ),

	// > Curves
	ArcCurve: require( "./extras/curves/ArcCurve" ),
	CatmullRomCurve3: require( "./extras/curves/CatmullRomCurve3" ),
	ClosedSplineCurve3: require( "./extras/curves/ClosedSplineCurve3" ),
	CubicBezierCurve: require( "./extras/curves/CubicBezierCurve" ),
	CubicBezierCurve3: require( "./extras/curves/CubicBezierCurve3" ),
	EllipseCurve: require( "./extras/curves/EllipseCurve" ),
	LineCurve: require( "./extras/curves/LineCurve" ),
	LineCurve3: require( "./extras/curves/LineCurve3" ),
	QuadraticBezierCurve: require( "./extras/curves/QuadraticBezierCurve" ),
	QuadraticBezierCurve3: require( "./extras/curves/QuadraticBezierCurve3" ),
	SplineCurve: require( "./extras/curves/SplineCurve" ),
	SplineCurve3: require( "./extras/curves/SplineCurve3" ),

	// > Geometries
	BoxGeometry: require( "./extras/geometries/BoxGeometry" ),
	CircleBufferGeometry: require( "./extras/geometries/CircleBufferGeometry" ),
	CircleGeometry: require( "./extras/geometries/CircleGeometry" ),
	CylinderGeometry: require( "./extras/geometries/CylinderGeometry" ),
	DodecahedronGeometry: require( "./extras/geometries/DodecahedronGeometry" ),
	EdgesGeometry: require( "./extras/geometries/EdgesGeometry" ),
	ExtrudeGeometry: require( "./extras/geometries/ExtrudeGeometry" ),
	IcosahedronGeometry: require( "./extras/geometries/IcosahedronGeometry" ),
	LatheGeometry: require( "./extras/geometries/LatheGeometry" ),
	OctahedronGeometry: require( "./extras/geometries/OctahedronGeometry" ),
	ParametricGeometry: require( "./extras/geometries/ParametricGeometry" ),
	PlaneBufferGeometry: require( "./extras/geometries/PlaneBufferGeometry" ),
	PlaneGeometry: require( "./extras/geometries/PlaneGeometry" ),
	PolyhedronGeometry: require( "./extras/geometries/PolyhedronGeometry" ),
	RingGeometry: require( "./extras/geometries/RingGeometry" ),
	ShapeGeometry: require( "./extras/geometries/ShapeGeometry" ),
	SphereBufferGeometry: require( "./extras/geometries/SphereBufferGeometry" ),
	SphereGeometry: require( "./extras/geometries/SphereGeometry" ),
	TetrahedronGeometry: require( "./extras/geometries/TetrahedronGeometry" ),
	TextGeometry: require( "./extras/geometries/TextGeometry" ),
	TorusGeometry: require( "./extras/geometries/TorusGeometry" ),
	TorusKnotGeometry: require( "./extras/geometries/TorusKnotGeometry" ),
	TubeGeometry: require( "./extras/geometries/TubeGeometry" ),
	WireframeGeometry: require( "./extras/geometries/WireframeGeometry" ),

	// > Helpers
	ArrowHelper: require( "./extras/helpers/ArrowHelper" ),
	AxisHelper: require( "./extras/helpers/AxisHelper" ),
	BoundingBoxHelper: require( "./extras/helpers/BoundingBoxHelper" ),
	BoxHelper: require( "./extras/helpers/BoxHelper" ),
	CameraHelper: require( "./extras/helpers/CameraHelper" ),
	DirectionalLightHelper: require( "./extras/helpers/DirectionalLightHelper" ),
	EdgesHelper: require( "./extras/helpers/EdgesHelper" ),
	FaceNormalsHelper: require( "./extras/helpers/FaceNormalsHelper" ),
	GridHelper: require( "./extras/helpers/GridHelper" ),
	HemisphereLightHelper: require( "./extras/helpers/HemisphereLightHelper" ),
	PointLightHelper: require( "./extras/helpers/PointLightHelper" ),
	SkeletonHelper: require( "./extras/helpers/SkeletonHelper" ),
	SpotLightHelper: require( "./extras/helpers/SpotLightHelper" ),
	VertexNormalsHelper: require( "./extras/helpers/VertexNormalsHelper" ),
	WireframeHelper: require( "./extras/helpers/WireframeHelper" ),

	// > Objects
	ImmediateRenderObject: require( "./extras/objects/ImmediateRenderObject" ),
	MorphBlendMesh: require( "./extras/objects/MorphBlendMesh" ),

	// Lights
	AmbientLight: require( "./lights/AmbientLight" ),
	DirectionalLight: require( "./lights/DirectionalLight" ),
	HemisphereLight: require( "./lights/HemisphereLight" ),
	Light: require( "./lights/Light" ),
	PointLight: require( "./lights/PointLight" ),
	SpotLight: require( "./lights/SpotLight" ),

	// Loaders
	BinaryTextureLoader: require( "./loaders/BinaryTextureLoader" ),
	BufferGeometryLoader: require( "./loaders/BufferGeometryLoader" ),
	Cache: require( "./loaders/Cache" ),
	CompressedTextureLoader: require( "./loaders/CompressedTextureLoader" ),
	ImageLoader: require( "./loaders/ImageLoader" ),
	JSONLoader: require( "./loaders/JSONLoader" ),
	Loader: require( "./loaders/Loader" ),
	LoadingManager: require( "./loaders/LoadingManager" ),
	MaterialLoader: require( "./loaders/MaterialLoader" ),
	ObjectLoader: require( "./loaders/ObjectLoader" ),
	TextureLoader: require( "./loaders/TextureLoader" ),
	XHRLoader: require( "./loaders/XHRLoader" ),

	// Materials
	LineBasicMaterial: require( "./materials/LineBasicMaterial" ),
	LineDashedMaterial: require( "./materials/LineDashedMaterial" ),
	Material: require( "./materials/Material" ),
	MeshBasicMaterial: require( "./materials/MeshBasicMaterial" ),
	MeshDepthMaterial: require( "./materials/MeshDepthMaterial" ),
	MeshLambertMaterial: require( "./materials/MeshLambertMaterial" ),
	MeshNormalMaterial: require( "./materials/MeshNormalMaterial" ),
	MeshPhongMaterial: require( "./materials/MeshPhongMaterial" ),
	MultiMaterial: require( "./materials/MultiMaterial" ),
	PointCloudMaterial: require( "./materials/PointCloudMaterial" ),
	RawShaderMaterial: require( "./materials/RawShaderMaterial" ),
	ShaderMaterial: require( "./materials/ShaderMaterial" ),
	SpriteMaterial: require( "./materials/SpriteMaterial" ),

	// Math
	Box2: require( "./math/Box2" ),
	Box3: require( "./math/Box3" ),
	Color: require( "./math/Color" ),
	Euler: require( "./math/Euler" ),
	Frustum: require( "./math/Frustum" ),
	Line3: require( "./math/Line3" ),
	Math: require( "./math/Math" ),
	Matrix3: require( "./math/Matrix3" ),
	Matrix4: require( "./math/Matrix4" ),
	Plane: require( "./math/Plane" ),
	Quaternion: require( "./math/Quaternion" ),
	Ray: require( "./math/Ray" ),
	Sphere: require( "./math/Sphere" ),
	Spline: require( "./math/Spline" ),
	Triangle: require( "./math/Triangle" ),
	Vector2: require( "./math/Vector2" ),
	Vector3: require( "./math/Vector3" ),
	Vector4: require( "./math/Vector4" ),

	// Objects
	Bone: require( "./objects/Bone" ),
	Group: require( "./objects/Group" ),
	LensFlare: require( "./objects/LensFlare" ),
	Line: require( "./objects/Line" ),
	LineSegments: require( "./objects/LineSegments" ),
	LOD: require( "./objects/LOD" ),
	Mesh: require( "./objects/Mesh" ),
	MorphAnimMesh: require( "./objects/MorphAnimMesh" ),
	PointCloud: require( "./objects/PointCloud" ),
	Skeleton: require( "./objects/Skeleton" ),
	SkinnedMesh: require( "./objects/SkinnedMesh" ),
	Sprite: require( "./objects/Sprite" ),

	// Renderers
	WebGLRenderer: require( "./renderers/WebGLRenderer" ),
	WebGLRenderTarget: require( "./renderers/WebGLRenderTarget" ),
	WebGLRenderTargetCube: require( "./renderers/WebGLRenderTargetCube" ),

	// > Shaders
	ShaderChunk: require( "./renderers/shaders/ShaderChunk" ),
	ShaderLib: require( "./renderers/shaders/ShaderLib" ),
	UniformsLib: require( "./renderers/shaders/UniformsLib" ),
	UniformsUtils: require( "./renderers/shaders/UniformsUtils" ),

	// > WebGL
	WebGLBufferRenderer: require( "./renderers/webgl/WebGLBufferRenderer" ),
	WebGLCapabilities: require( "./renderers/webgl/WebGLCapabilities" ),
	WebGLExtensions: require( "./renderers/webgl/WebGLExtensions" ),
	WebGLGeometries: require( "./renderers/webgl/WebGLGeometries" ),
	WebGLIndexedBufferRenderer: require( "./renderers/webgl/WebGLIndexedBufferRenderer" ),
	WebGLObjects: require( "./renderers/webgl/WebGLObjects" ),
	WebGLProgram: require( "./renderers/webgl/WebGLProgram" ),
	WebGLPrograms: require( "./renderers/webgl/WebGLPrograms" ),
	WebGLProperties: require( "./renderers/webgl/WebGLProperties" ),
	WebGLShader: require( "./renderers/webgl/WebGLShader" ),
	WebGLShadowMap: require( "./renderers/webgl/WebGLShadowMap" ),
	WebGLState: require( "./renderers/webgl/WebGLState" ),

	// > WebGL > Plugins
	LensFlarePlugin: require( "./renderers/webgl/plugins/LensFlarePlugin" ),
	SpritePlugin: require( "./renderers/webgl/plugins/SpritePlugin" ),

	// Scenes
	Fog: require( "./scenes/Fog" ),
	FogExp2: require( "./scenes/FogExp2" ),
	Scene: require( "./scenes/Scene" ),

	// Textures
	CanvasTexture: require( "./textures/CanvasTexture" ),
	CompressedTexture: require( "./textures/CompressedTexture" ),
	CubeTexture: require( "./textures/CubeTexture" ),
	DataTexture: require( "./textures/DataTexture" ),
	Texture: require( "./textures/Texture" ),
	VideoTexture: require( "./textures/VideoTexture" )

};

// Define getters and setters for all internal constants.

function makeGetter ( key ) {

	return function () { return Constants[ key ]; };

}

function makeSetter ( key ) {

	return function ( value ) { Constants[ key ] = value; };

}

for( var key in Constants ) {

	Object.defineProperty( module.exports, key, {
		get: makeGetter( key ),
		set: makeSetter( key )
	} );

}

require( "./BackwardsCompatibility" )( module.exports );
