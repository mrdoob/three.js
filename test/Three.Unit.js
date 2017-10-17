//src
import '../src/polyfills';
import '../src/constants';
import '../src/Three.Legacy';
import '../src/utils';


//src/animation
import './unit/src/animation/AnimationAction';
import './unit/src/animation/AnimationClip';
import './unit/src/animation/AnimationMixer';
import './unit/src/animation/AnimationObjectGroup';
import './unit/src/animation/AnimationUtils';
import './unit/src/animation/KeyframeTrack';
import './unit/src/animation/KeyframeTrackConstructor';
import './unit/src/animation/KeyframeTrackPrototype';
import './unit/src/animation/PropertyBinding';
import './unit/src/animation/PropertyMixer';


//src/animation/tracks
import './unit/src/animation/tracks/BooleanKeyframeTrack';
import './unit/src/animation/tracks/ColorKeyframeTrack';
import './unit/src/animation/tracks/NumberKeyframeTrack';
import './unit/src/animation/tracks/QuaternionKeyframeTrack';
import './unit/src/animation/tracks/StringKeyframeTrack';
import './unit/src/animation/tracks/VectorKeyframeTrack';


//src/audio
import './unit/src/audio/Audio';
import './unit/src/audio/AudioAnalyser';
import './unit/src/audio/AudioContext';
import './unit/src/audio/AudioListener';
import './unit/src/audio/PositionalAudio';


//src/cameras
import './unit/src/cameras/Camera';
import './unit/src/cameras/CubeCamera';
import './unit/src/cameras/OrthographicCamera';
import './unit/src/cameras/PerspectiveCamera';
import './unit/src/cameras/StereoCamera';


//src/core
import './unit/src/core/BufferAttribute';
import './unit/src/core/BufferGeometry';
import './unit/src/core/Clock';
import './unit/src/core/DirectGeometry';
import './unit/src/core/EventDispatcher';
import './unit/src/core/Face3';
import './unit/src/core/Geometry';
import './unit/src/core/InstancedBufferAttribute';
import './unit/src/core/InstancedBufferGeometry';
import './unit/src/core/InstancedInterleavedBuffer';
import './unit/src/core/InterleavedBuffer';
import './unit/src/core/InterleavedBufferAttribute';
import './unit/src/core/Layers';
import './unit/src/core/Object3D';
import './unit/src/core/Raycaster';
import './unit/src/core/Uniform';


//src/extras
import './unit/src/extras/SceneUtils';
import './unit/src/extras/ShapeUtils';

//src/extras/core
import './unit/src/extras/core/Curve';
import './unit/src/extras/core/CurvePath';
import './unit/src/extras/core/Font';
import './unit/src/extras/core/Interpolations';
import './unit/src/extras/core/Path';
import './unit/src/extras/core/PathPrototype';
import './unit/src/extras/core/Shape';
import './unit/src/extras/core/ShapePath';

//src/extras/curves
import './unit/src/extras/curves/ArcCurve';
import './unit/src/extras/curves/CatmullRomCurve3';
import './unit/src/extras/curves/CubicBezierCurve';
import './unit/src/extras/curves/CubicBezierCurve3';
import './unit/src/extras/curves/EllipseCurve';
import './unit/src/extras/curves/LineCurve';
import './unit/src/extras/curves/LineCurve3';
import './unit/src/extras/curves/QuadraticBezierCurve';
import './unit/src/extras/curves/QuadraticBezierCurve3';
import './unit/src/extras/curves/SplineCurve';

//src/extras/objects
import './unit/src/extras/objects/ImmediateRenderObject';


//src/geometries
import './unit/src/geometries/BoxGeometry.tests';
import './unit/src/geometries/CircleGeometry.tests';
import './unit/src/geometries/CylinderGeometry.tests';
import './unit/src/geometries/DodecahedronGeometry.tests';
import './unit/src/geometries/EdgesGeometry.tests';
import './unit/src/geometries/ExtrudeGeometry.tests';
import './unit/src/geometries/IcosahedronGeometry.tests';
import './unit/src/geometries/LatheGeometry.tests';
import './unit/src/geometries/OctahedronGeometry.tests';
import './unit/src/geometries/ParametricGeometry.tests';
import './unit/src/geometries/PlaneGeometry.tests';
import './unit/src/geometries/PolyhedronGeometry.tests';
import './unit/src/geometries/RingGeometry.tests';
import './unit/src/geometries/ShapeGeometry.tests';
import './unit/src/geometries/SphereGeometry.tests';
import './unit/src/geometries/TetrahedronGeometry.tests';
import './unit/src/geometries/TextGeometry.tests';
import './unit/src/geometries/TorusGeometry.tests';
import './unit/src/geometries/TorusKnotGeometry.tests';
import './unit/src/geometries/TubeGeometry.tests';
import './unit/src/geometries/WireframeGeometry.tests';


//src/helpers
import './unit/src/helpers/ArrowHelper';
import './unit/src/helpers/AxesHelper';
import './unit/src/helpers/BoxHelper.tests';
import './unit/src/helpers/CameraHelper';
import './unit/src/helpers/DirectionalLightHelper';
import './unit/src/helpers/FaceNormalsHelper';
import './unit/src/helpers/GridHelper';
import './unit/src/helpers/HemisphereLightHelper';
//import './unit/src/helpers/PlaneHelper';
import './unit/src/helpers/PointLightHelper';
import './unit/src/helpers/PolarGridHelper';
import './unit/src/helpers/RectAreaLightHelper';
import './unit/src/helpers/SkeletonHelper';
import './unit/src/helpers/SpotLightHelper';
import './unit/src/helpers/VertexNormalsHelper';


//src/lights
import './unit/src/lights/AmbientLight.tests';
import './unit/src/lights/DirectionalLight.tests';
import './unit/src/lights/DirectionalLightShadow';
import './unit/src/lights/HemisphereLight.tests';
import './unit/src/lights/Light';
import './unit/src/lights/LightShadow';
import './unit/src/lights/PointLight.tests';
import './unit/src/lights/RectAreaLight.tests';
import './unit/src/lights/SpotLight.tests';
import './unit/src/lights/SpotLightShadow';


//src/loaders
import './unit/src/loaders/AnimationLoader';
import './unit/src/loaders/AudioLoader';
import './unit/src/loaders/BufferGeometryLoader';
import './unit/src/loaders/Cache';
import './unit/src/loaders/CompressedTextureLoader';
import './unit/src/loaders/CubeTextureLoader';
import './unit/src/loaders/DataTextureLoader';
import './unit/src/loaders/LoadingManager';
import './unit/src/loaders/FileLoader';
import './unit/src/loaders/FontLoader';
import './unit/src/loaders/ImageLoader';
import './unit/src/loaders/JSONLoader';
import './unit/src/loaders/Loader';
import './unit/src/loaders/MaterialLoader';
import './unit/src/loaders/ObjectLoader';
import './unit/src/loaders/TextureLoader';


//src/materials
//import './unit/materials/Materials';


//src/math
import './unit/src/math/Math';
import './unit/src/math/Box2';
import './unit/src/math/Box3';
import './unit/src/math/Color';
import './unit/src/math/Cylindrical';
import './unit/src/math/Euler';
import './unit/src/math/Frustum';
import './unit/src/math/Interpolant';
import './unit/src/math/Line3';
import './unit/src/math/Matrix3';
import './unit/src/math/Matrix4';
import './unit/src/math/Plane';
import './unit/src/math/Quaternion';
import './unit/src/math/Ray';
import './unit/src/math/Sphere';
import './unit/src/math/Spherical';
import './unit/src/math/Triangle';
import './unit/src/math/Vector2';
import './unit/src/math/Vector3';
import './unit/src/math/Vector4';

//src/math/interpolants
import './unit/src/math/interpolants/CubicInterpolant';
import './unit/src/math/interpolants/DiscreteInterpolant';
import './unit/src/math/interpolants/LinearInterpolant';
import './unit/src/math/interpolants/QuaternionLinearInterpolant';


//src/objects
import './unit/src/objects/Bone';
import './unit/src/objects/Group';
import './unit/src/objects/LensFlare';
import './unit/src/objects/Line';
//import './unit/src/objects/LineLoop';
import './unit/src/objects/LineSegments';
import './unit/src/objects/LOD';
import './unit/src/objects/Mesh';
import './unit/src/objects/Points';
import './unit/src/objects/Skeleton';
import './unit/src/objects/SkinnedMesh';
import './unit/src/objects/Sprite';


//src/renderers
import './unit/src/renderers/WebGL2Renderer';
import './unit/src/renderers/WebGLRenderer';
import './unit/src/renderers/WebGLRenderTarget';
import './unit/src/renderers/WebGLRenderTargetCube';

//src/renderers/shaders
import './unit/src/renderers/shaders/ShaderChunk';
import './unit/src/renderers/shaders/ShaderLib';
import './unit/src/renderers/shaders/UniformsLib';
import './unit/src/renderers/shaders/UniformsUtils';

//src/renderers/webgl
//import './unit/src/renderers/webgl/WebGLAttributes';
//import './unit/src/renderers/webgl/WebGLBackground';
import './unit/src/renderers/webgl/WebGLBufferRenderer';
import './unit/src/renderers/webgl/WebGLCapabilities';
import './unit/src/renderers/webgl/WebGLClipping';
import './unit/src/renderers/webgl/WebGLExtensions';
//import './unit/src/renderers/webgl/WebGLFlareRenderer';
import './unit/src/renderers/webgl/WebGLGeometries';
import './unit/src/renderers/webgl/WebGLIndexedBufferRenderer';
import './unit/src/renderers/webgl/WebGLLights';
//import './unit/src/renderers/webgl/WebGLMorphtargets';
import './unit/src/renderers/webgl/WebGLObjects';
import './unit/src/renderers/webgl/WebGLProgram';
import './unit/src/renderers/webgl/WebGLPrograms';
import './unit/src/renderers/webgl/WebGLProperties';
//import './unit/src/renderers/webgl/WebGLRenderLists';
import './unit/src/renderers/webgl/WebGLShader';
import './unit/src/renderers/webgl/WebGLShadowMap';
//import './unit/src/renderers/webgl/WebGLSpriteRenderer';
import './unit/src/renderers/webgl/WebGLState';
import './unit/src/renderers/webgl/WebGLTextures';
import './unit/src/renderers/webgl/WebGLUniforms';
//import './unit/src/renderers/webgl/WebGLUtils';

//src/renderers/webvr
//import './unit/src/renderers/webvr/WebVRManager';


//src/scenes
import './unit/src/scenes/Fog';
import './unit/src/scenes/FogExp2';
import './unit/src/scenes/Scene';


//src/textures
import './unit/src/textures/CanvasTexture';
import './unit/src/textures/CompressedTexture';
import './unit/src/textures/CubeTexture';
import './unit/src/textures/DataTexture';
import './unit/src/textures/DepthTexture';
import './unit/src/textures/Texture';
import './unit/src/textures/VideoTexture';
