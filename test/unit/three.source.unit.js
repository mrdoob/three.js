import './utils/console-wrapper.js';
import './utils/qunit-utils.js';

//src
import './src/constants.tests.js';
import './src/utils.tests.js';


//src/animation
import './src/animation/AnimationAction.tests.js';
import './src/animation/AnimationClip.tests.js';
import './src/animation/AnimationMixer.tests.js';
import './src/animation/AnimationObjectGroup.tests.js';
import './src/animation/AnimationUtils.tests.js';
import './src/animation/KeyframeTrack.tests.js';
import './src/animation/PropertyBinding.tests.js';
import './src/animation/PropertyMixer.tests.js';

//src/animation/tracks
import './src/animation/tracks/BooleanKeyframeTrack.tests.js';
import './src/animation/tracks/ColorKeyframeTrack.tests.js';
import './src/animation/tracks/NumberKeyframeTrack.tests.js';
import './src/animation/tracks/QuaternionKeyframeTrack.tests.js';
import './src/animation/tracks/StringKeyframeTrack.tests.js';
import './src/animation/tracks/VectorKeyframeTrack.tests.js';


//src/audio
import './src/audio/Audio.tests.js';
import './src/audio/AudioAnalyser.tests.js';
import './src/audio/AudioContext.tests.js';
import './src/audio/AudioListener.tests.js';
import './src/audio/PositionalAudio.tests.js';


//src/cameras
import './src/cameras/ArrayCamera.tests.js';
import './src/cameras/Camera.tests.js';
import './src/cameras/CubeCamera.tests.js';
import './src/cameras/OrthographicCamera.tests.js';
import './src/cameras/PerspectiveCamera.tests.js';
import './src/cameras/StereoCamera.tests.js';


//src/core
import './src/core/BufferAttribute.tests.js';
import './src/core/BufferGeometry.tests.js';
import './src/core/Clock.tests.js';
import './src/core/EventDispatcher.tests.js';
import './src/core/GLBufferAttribute.tests.js';
import './src/core/InstancedBufferAttribute.tests.js';
import './src/core/InstancedBufferGeometry.tests.js';
import './src/core/InstancedInterleavedBuffer.tests.js';
import './src/core/InterleavedBuffer.tests.js';
import './src/core/InterleavedBufferAttribute.tests.js';
import './src/core/Layers.tests.js';
import './src/core/Object3D.tests.js';
import './src/core/Raycaster.tests.js';
import './src/core/Uniform.tests.js';
import './src/core/UniformsGroup.tests.js';


//src/extras
import './src/extras/DataUtils.tests.js';
import './src/extras/Earcut.tests.js';
import './src/extras/ImageUtils.tests.js';
import './src/extras/PMREMGenerator.tests.js';
import './src/extras/ShapeUtils.tests.js';

//src/extras/core
import './src/extras/core/Curve.tests.js';
import './src/extras/core/CurvePath.tests.js';
import './src/extras/core/Interpolations.tests.js';
import './src/extras/core/Path.tests.js';
import './src/extras/core/Shape.tests.js';
import './src/extras/core/ShapePath.tests.js';

//src/extras/curves
import './src/extras/curves/ArcCurve.tests.js';
import './src/extras/curves/CatmullRomCurve3.tests.js';
import './src/extras/curves/CubicBezierCurve.tests.js';
import './src/extras/curves/CubicBezierCurve3.tests.js';
import './src/extras/curves/EllipseCurve.tests.js';
import './src/extras/curves/LineCurve.tests.js';
import './src/extras/curves/LineCurve3.tests.js';
import './src/extras/curves/QuadraticBezierCurve.tests.js';
import './src/extras/curves/QuadraticBezierCurve3.tests.js';
import './src/extras/curves/SplineCurve.tests.js';

//src/geometries
import './src/geometries/BoxGeometry.tests.js';
import './src/geometries/CapsuleGeometry.tests.js';
import './src/geometries/CircleGeometry.tests.js';
import './src/geometries/ConeGeometry.tests.js';
import './src/geometries/CylinderGeometry.tests.js';
import './src/geometries/DodecahedronGeometry.tests.js';
import './src/geometries/EdgesGeometry.tests.js';
import './src/geometries/ExtrudeGeometry.tests.js';
import './src/geometries/IcosahedronGeometry.tests.js';
import './src/geometries/LatheGeometry.tests.js';
import './src/geometries/OctahedronGeometry.tests.js';
import './src/geometries/PlaneGeometry.tests.js';
import './src/geometries/PolyhedronGeometry.tests.js';
import './src/geometries/RingGeometry.tests.js';
import './src/geometries/ShapeGeometry.tests.js';
import './src/geometries/SphereGeometry.tests.js';
import './src/geometries/TetrahedronGeometry.tests.js';
import './src/geometries/TorusGeometry.tests.js';
import './src/geometries/TorusKnotGeometry.tests.js';
import './src/geometries/TubeGeometry.tests.js';
import './src/geometries/WireframeGeometry.tests.js';


//src/helpers
import './src/helpers/ArrowHelper.tests.js';
import './src/helpers/AxesHelper.tests.js';
import './src/helpers/Box3Helper.tests.js';
import './src/helpers/BoxHelper.tests.js';
import './src/helpers/CameraHelper.tests.js';
import './src/helpers/DirectionalLightHelper.tests.js';
import './src/helpers/GridHelper.tests.js';
import './src/helpers/HemisphereLightHelper.tests.js';
import './src/helpers/PlaneHelper.tests.js';
import './src/helpers/PointLightHelper.tests.js';
import './src/helpers/PolarGridHelper.tests.js';
import './src/helpers/SkeletonHelper.tests.js';
import './src/helpers/SpotLightHelper.tests.js';


//src/lights
import './src/lights/AmbientLight.tests.js';
import './src/lights/AmbientLightProbe.tests.js';
import './src/lights/DirectionalLight.tests.js';
import './src/lights/DirectionalLightShadow.tests.js';
import './src/lights/HemisphereLight.tests.js';
import './src/lights/HemisphereLightProbe.tests.js';
import './src/lights/Light.tests.js';
import './src/lights/LightProbe.tests.js';
import './src/lights/LightShadow.tests.js';
import './src/lights/PointLight.tests.js';
import './src/lights/PointLightShadow.tests.js';
import './src/lights/RectAreaLight.tests.js';
import './src/lights/SpotLight.tests.js';
import './src/lights/SpotLightShadow.tests.js';


//src/loaders
import './src/loaders/AnimationLoader.tests.js';
import './src/loaders/AudioLoader.tests.js';
import './src/loaders/BufferGeometryLoader.tests.js';
import './src/loaders/Cache.tests.js';
import './src/loaders/CompressedTextureLoader.tests.js';
import './src/loaders/CubeTextureLoader.tests.js';
import './src/loaders/DataTextureLoader.tests.js';
import './src/loaders/FileLoader.tests.js';
import './src/loaders/ImageBitmapLoader.tests.js';
import './src/loaders/ImageLoader.tests.js';
import './src/loaders/Loader.tests.js';
import './src/loaders/LoaderUtils.tests.js';
import './src/loaders/LoadingManager.tests.js';
import './src/loaders/MaterialLoader.tests.js';
import './src/loaders/ObjectLoader.tests.js';
import './src/loaders/TextureLoader.tests.js';


//src/materials
import './src/materials/LineBasicMaterial.tests.js';
import './src/materials/LineDashedMaterial.tests.js';
import './src/materials/Material.tests.js';
import './src/materials/MeshBasicMaterial.tests.js';
import './src/materials/MeshDepthMaterial.tests.js';
import './src/materials/MeshDistanceMaterial.tests.js';
import './src/materials/MeshLambertMaterial.tests.js';
import './src/materials/MeshMatcapMaterial.tests.js';
import './src/materials/MeshNormalMaterial.tests.js';
import './src/materials/MeshPhongMaterial.tests.js';
import './src/materials/MeshPhysicalMaterial.tests.js';
import './src/materials/MeshStandardMaterial.tests.js';
import './src/materials/MeshToonMaterial.tests.js';
import './src/materials/PointsMaterial.tests.js';
import './src/materials/RawShaderMaterial.tests.js';
import './src/materials/ShaderMaterial.tests.js';
import './src/materials/ShadowMaterial.tests.js';
import './src/materials/SpriteMaterial.tests.js';


//src/math
import './src/math/Box2.tests.js';
import './src/math/Box3.tests.js';
import './src/math/Color.tests.js';
import './src/math/ColorManagement.tests.js';
import './src/math/Cylindrical.tests.js';
import './src/math/Euler.tests.js';
import './src/math/Frustum.tests.js';
import './src/math/Interpolant.tests.js';
import './src/math/Line3.tests.js';
import './src/math/MathUtils.tests.js';
import './src/math/Matrix3.tests.js';
import './src/math/Matrix4.tests.js';
import './src/math/Plane.tests.js';
import './src/math/Quaternion.tests.js';
import './src/math/Ray.tests.js';
import './src/math/Sphere.tests.js';
import './src/math/Spherical.tests.js';
import './src/math/SphericalHarmonics3.tests.js';
import './src/math/Triangle.tests.js';
import './src/math/Vector2.tests.js';
import './src/math/Vector3.tests.js';
import './src/math/Vector4.tests.js';

//src/math/interpolants
import './src/math/interpolants/CubicInterpolant.tests.js';
import './src/math/interpolants/DiscreteInterpolant.tests.js';
import './src/math/interpolants/LinearInterpolant.tests.js';
import './src/math/interpolants/QuaternionLinearInterpolant.tests.js';


//src/objects
import './src/objects/Bone.tests.js';
import './src/objects/Group.tests.js';
import './src/objects/InstancedMesh.tests.js';
import './src/objects/Line.tests.js';
import './src/objects/LineLoop.tests.js';
import './src/objects/LineSegments.tests.js';
import './src/objects/LOD.tests.js';
import './src/objects/Mesh.tests.js';
import './src/objects/Points.tests.js';
import './src/objects/Skeleton.tests.js';
import './src/objects/SkinnedMesh.tests.js';
import './src/objects/Sprite.tests.js';


//src/renderers
import './src/renderers/WebGL1Renderer.tests.js';
import './src/renderers/WebGL3DRenderTarget.tests.js';
import './src/renderers/WebGLArrayRenderTarget.tests.js';
import './src/renderers/WebGLCubeRenderTarget.tests.js';
import './src/renderers/WebGLMultipleRenderTargets.tests.js';
import './src/renderers/WebGLRenderer.tests.js';
import './src/renderers/WebGLRenderTarget.tests.js';

//src/renderers/shaders
import './src/renderers/shaders/ShaderChunk.tests.js';
import './src/renderers/shaders/ShaderLib.tests.js';
import './src/renderers/shaders/UniformsLib.tests.js';
import './src/renderers/shaders/UniformsUtils.tests.js';

//src/renderers/webgl
import './src/renderers/webgl/WebGLAttributes.tests.js';
import './src/renderers/webgl/WebGLBackground.tests.js';
import './src/renderers/webgl/WebGLBufferRenderer.tests.js';
import './src/renderers/webgl/WebGLCapabilities.tests.js';
import './src/renderers/webgl/WebGLClipping.tests.js';
import './src/renderers/webgl/WebGLExtensions.tests.js';
import './src/renderers/webgl/WebGLGeometries.tests.js';
import './src/renderers/webgl/WebGLIndexedBufferRenderer.tests.js';
import './src/renderers/webgl/WebGLLights.tests.js';
import './src/renderers/webgl/WebGLMorphtargets.tests.js';
import './src/renderers/webgl/WebGLObjects.tests.js';
import './src/renderers/webgl/WebGLProgram.tests.js';
import './src/renderers/webgl/WebGLPrograms.tests.js';
import './src/renderers/webgl/WebGLProperties.tests.js';
import './src/renderers/webgl/WebGLRenderLists.tests.js';
import './src/renderers/webgl/WebGLShader.tests.js';
import './src/renderers/webgl/WebGLShadowMap.tests.js';
import './src/renderers/webgl/WebGLState.tests.js';
import './src/renderers/webgl/WebGLTextures.tests.js';
import './src/renderers/webgl/WebGLUniforms.tests.js';
import './src/renderers/webgl/WebGLUtils.tests.js';


//src/scenes
import './src/scenes/Fog.tests.js';
import './src/scenes/FogExp2.tests.js';
import './src/scenes/Scene.tests.js';


//src/textures
import './src/textures/CanvasTexture.tests.js';
import './src/textures/CompressedArrayTexture.tests.js';
import './src/textures/CompressedTexture.tests.js';
import './src/textures/CubeTexture.tests.js';
import './src/textures/Data3DTexture.tests.js';
import './src/textures/DataArrayTexture.tests.js';
import './src/textures/DataTexture.tests.js';
import './src/textures/DepthTexture.tests.js';
import './src/textures/FramebufferTexture.tests.js';
import './src/textures/Source.tests.js';
import './src/textures/Texture.tests.js';
import './src/textures/VideoTexture.tests.js';
