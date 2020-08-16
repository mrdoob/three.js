import './utils/qunit-utils.js';

//src
import './src/constants.tests';
import './src/polyfills.tests';
import './src/utils.tests';


//src/animation
import './src/animation/AnimationAction.tests';
import './src/animation/AnimationClip.tests';
import './src/animation/AnimationMixer.tests';
import './src/animation/AnimationObjectGroup.tests';
import './src/animation/AnimationUtils.tests';
import './src/animation/KeyframeTrack.tests';
import './src/animation/PropertyBinding.tests';
import './src/animation/PropertyMixer.tests';

//src/animation/tracks
import './src/animation/tracks/BooleanKeyframeTrack.tests';
import './src/animation/tracks/ColorKeyframeTrack.tests';
import './src/animation/tracks/NumberKeyframeTrack.tests';
import './src/animation/tracks/QuaternionKeyframeTrack.tests';
import './src/animation/tracks/StringKeyframeTrack.tests';
import './src/animation/tracks/VectorKeyframeTrack.tests';


//src/audio
import './src/audio/Audio.tests';
import './src/audio/AudioAnalyser.tests';
import './src/audio/AudioContext.tests';
import './src/audio/AudioListener.tests';
import './src/audio/PositionalAudio.tests';


//src/cameras
import './src/cameras/ArrayCamera.tests';
import './src/cameras/Camera.tests';
import './src/cameras/CubeCamera.tests';
import './src/cameras/OrthographicCamera.tests';
import './src/cameras/PerspectiveCamera.tests';
import './src/cameras/StereoCamera.tests';


//src/core
import './src/core/BufferAttribute.tests';
import './src/core/BufferGeometry.tests';
import './src/core/Clock.tests';
import './src/core/DirectGeometry.tests';
import './src/core/EventDispatcher.tests';
import './src/core/Face3.tests';
import './src/core/Geometry.tests';
import './src/core/InstancedBufferAttribute.tests';
import './src/core/InstancedBufferGeometry.tests';
import './src/core/InstancedInterleavedBuffer.tests';
import './src/core/InterleavedBuffer.tests';
import './src/core/InterleavedBufferAttribute.tests';
import './src/core/Layers.tests';
import './src/core/Object3D.tests';
import './src/core/Raycaster.tests';
import './src/core/Uniform.tests';


//src/extras
import './src/extras/ShapeUtils.tests';

//src/extras/core
import './src/extras/core/Curve.tests';
import './src/extras/core/CurvePath.tests';
import './src/extras/core/Font.tests';
import './src/extras/core/Interpolations.tests';
import './src/extras/core/Path.tests';
import './src/extras/core/Shape.tests';
import './src/extras/core/ShapePath.tests';

//src/extras/curves
import './src/extras/curves/ArcCurve.tests';
import './src/extras/curves/CatmullRomCurve3.tests';
import './src/extras/curves/CubicBezierCurve.tests';
import './src/extras/curves/CubicBezierCurve3.tests';
import './src/extras/curves/EllipseCurve.tests';
import './src/extras/curves/LineCurve.tests';
import './src/extras/curves/LineCurve3.tests';
import './src/extras/curves/QuadraticBezierCurve.tests';
import './src/extras/curves/QuadraticBezierCurve3.tests';
import './src/extras/curves/SplineCurve.tests';

//src/extras/objects
import './src/extras/objects/ImmediateRenderObject.tests';


//src/geometries
import './src/geometries/BoxGeometry.tests';
import './src/geometries/CircleGeometry.tests';
import './src/geometries/ConeGeometry.tests';
import './src/geometries/CylinderGeometry.tests';
import './src/geometries/DodecahedronGeometry.tests';
import './src/geometries/EdgesGeometry.tests';
import './src/geometries/ExtrudeGeometry.tests';
import './src/geometries/IcosahedronGeometry.tests';
import './src/geometries/LatheGeometry.tests';
import './src/geometries/OctahedronGeometry.tests';
import './src/geometries/ParametricGeometry.tests';
import './src/geometries/PlaneGeometry.tests';
import './src/geometries/PolyhedronGeometry.tests';
import './src/geometries/RingGeometry.tests';
import './src/geometries/ShapeGeometry.tests';
import './src/geometries/SphereGeometry.tests';
import './src/geometries/TetrahedronGeometry.tests';
import './src/geometries/TextGeometry.tests';
import './src/geometries/TorusGeometry.tests';
import './src/geometries/TorusKnotGeometry.tests';
import './src/geometries/TubeGeometry.tests';
import './src/geometries/WireframeGeometry.tests';


//src/helpers
import './src/helpers/ArrowHelper.tests';
import './src/helpers/AxesHelper.tests';
import './src/helpers/Box3Helper.tests';
import './src/helpers/BoxHelper.tests';
import './src/helpers/CameraHelper.tests';
import './src/helpers/DirectionalLightHelper.tests';
import './src/helpers/GridHelper.tests';
import './src/helpers/HemisphereLightHelper.tests';
import './src/helpers/PlaneHelper.tests';
import './src/helpers/PointLightHelper.tests';
import './src/helpers/PolarGridHelper.tests';
import './src/helpers/SkeletonHelper.tests';
import './src/helpers/SpotLightHelper.tests';


//src/lights
import './src/lights/AmbientLight.tests';
import './src/lights/DirectionalLight.tests';
import './src/lights/DirectionalLightShadow.tests';
import './src/lights/HemisphereLight.tests';
import './src/lights/Light.tests';
import './src/lights/LightShadow.tests';
import './src/lights/PointLight.tests';
import './src/lights/RectAreaLight.tests';
import './src/lights/SpotLight.tests';
import './src/lights/SpotLightShadow.tests';


//src/loaders
import './src/loaders/AnimationLoader.tests';
import './src/loaders/AudioLoader.tests';
import './src/loaders/BufferGeometryLoader.tests';
import './src/loaders/Cache.tests';
import './src/loaders/CompressedTextureLoader.tests';
import './src/loaders/CubeTextureLoader.tests';
import './src/loaders/DataTextureLoader.tests';
import './src/loaders/FileLoader.tests';
import './src/loaders/FontLoader.tests';
import './src/loaders/ImageLoader.tests';
import './src/loaders/Loader.tests';
import './src/loaders/LoaderUtils.tests';
import './src/loaders/LoadingManager.tests';
import './src/loaders/MaterialLoader.tests';
import './src/loaders/ObjectLoader.tests';
import './src/loaders/TextureLoader.tests';


//src/materials
import './src/materials/LineBasicMaterial.tests';
import './src/materials/LineDashedMaterial.tests';
import './src/materials/Material.tests';
import './src/materials/MeshBasicMaterial.tests';
import './src/materials/MeshDepthMaterial.tests';
import './src/materials/MeshDistanceMaterial.tests';
import './src/materials/MeshLambertMaterial.tests';
import './src/materials/MeshNormalMaterial.tests';
import './src/materials/MeshPhongMaterial.tests';
import './src/materials/MeshPhysicalMaterial.tests';
import './src/materials/MeshStandardMaterial.tests';
import './src/materials/MeshToonMaterial.tests';
import './src/materials/PointsMaterial.tests';
import './src/materials/RawShaderMaterial.tests';
import './src/materials/ShaderMaterial.tests';
import './src/materials/ShadowMaterial.tests';
import './src/materials/SpriteMaterial.tests';


//src/math
import './src/math/Box2.tests';
import './src/math/Box3.tests';
import './src/math/Color.tests';
import './src/math/Cylindrical.tests';
import './src/math/Euler.tests';
import './src/math/Frustum.tests';
import './src/math/Interpolant.tests';
import './src/math/Line3.tests';
import './src/math/MathUtils.tests';
import './src/math/Matrix3.tests';
import './src/math/Matrix4.tests';
import './src/math/Plane.tests';
import './src/math/Quaternion.tests';
import './src/math/Ray.tests';
import './src/math/Sphere.tests';
import './src/math/Spherical.tests';
import './src/math/Triangle.tests';
import './src/math/Vector2.tests';
import './src/math/Vector3.tests';
import './src/math/Vector4.tests';

//src/math/interpolants
import './src/math/interpolants/CubicInterpolant.tests';
import './src/math/interpolants/DiscreteInterpolant.tests';
import './src/math/interpolants/LinearInterpolant.tests';
import './src/math/interpolants/QuaternionLinearInterpolant.tests';


//src/objects
import './src/objects/Bone.tests';
import './src/objects/Group.tests';
import './src/objects/Line.tests';
import './src/objects/LineLoop.tests';
import './src/objects/LineSegments.tests';
import './src/objects/LOD.tests';
import './src/objects/Mesh.tests';
import './src/objects/Points.tests';
import './src/objects/Skeleton.tests';
import './src/objects/SkinnedMesh.tests';
import './src/objects/Sprite.tests';


//src/renderers
import './src/renderers/WebGLRenderer.tests';
import './src/renderers/WebGLRenderTarget.tests';
import './src/renderers/WebGLCubeRenderTarget.tests';

//src/renderers/shaders
import './src/renderers/shaders/ShaderChunk.tests';
import './src/renderers/shaders/ShaderLib.tests';
import './src/renderers/shaders/UniformsLib.tests';
import './src/renderers/shaders/UniformsUtils.tests';

//src/renderers/webgl
import './src/renderers/webgl/WebGLAttributes.tests';
import './src/renderers/webgl/WebGLBackground.tests';
import './src/renderers/webgl/WebGLBufferRenderer.tests';
import './src/renderers/webgl/WebGLCapabilities.tests';
import './src/renderers/webgl/WebGLClipping.tests';
import './src/renderers/webgl/WebGLExtensions.tests';
import './src/renderers/webgl/WebGLGeometries.tests';
import './src/renderers/webgl/WebGLIndexedBufferRenderer.tests';
import './src/renderers/webgl/WebGLLights.tests';
import './src/renderers/webgl/WebGLMorphtargets.tests';
import './src/renderers/webgl/WebGLObjects.tests';
import './src/renderers/webgl/WebGLProgram.tests';
import './src/renderers/webgl/WebGLPrograms.tests';
import './src/renderers/webgl/WebGLProperties.tests';
import './src/renderers/webgl/WebGLRenderLists.tests';
import './src/renderers/webgl/WebGLShader.tests';
import './src/renderers/webgl/WebGLShadowMap.tests';
import './src/renderers/webgl/WebGLState.tests';
import './src/renderers/webgl/WebGLTextures.tests';
import './src/renderers/webgl/WebGLUniforms.tests';
import './src/renderers/webgl/WebGLUtils.tests';


//src/scenes
import './src/scenes/Fog.tests';
import './src/scenes/FogExp2.tests';
import './src/scenes/Scene.tests';


//src/textures
import './src/textures/CanvasTexture.tests';
import './src/textures/CompressedTexture.tests';
import './src/textures/CubeTexture.tests';
import './src/textures/DataTexture.tests';
import './src/textures/DepthTexture.tests';
import './src/textures/Texture.tests';
import './src/textures/VideoTexture.tests';
