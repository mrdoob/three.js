/**
 * @author TristanVALCKE / https://github.com/Itee
 */

import './unit/qunit-utils.js';

//src
import './unit/src/constants.tests';
import './unit/src/polyfills.tests';
import './unit/src/utils.tests';


//src/animation
import './unit/src/animation/AnimationAction.tests';
import './unit/src/animation/AnimationClip.tests';
import './unit/src/animation/AnimationMixer.tests';
import './unit/src/animation/AnimationObjectGroup.tests';
import './unit/src/animation/AnimationUtils.tests';
import './unit/src/animation/KeyframeTrack.tests';
import './unit/src/animation/PropertyBinding.tests';
import './unit/src/animation/PropertyMixer.tests';

//src/animation/tracks
import './unit/src/animation/tracks/BooleanKeyframeTrack.tests';
import './unit/src/animation/tracks/ColorKeyframeTrack.tests';
import './unit/src/animation/tracks/NumberKeyframeTrack.tests';
import './unit/src/animation/tracks/QuaternionKeyframeTrack.tests';
import './unit/src/animation/tracks/StringKeyframeTrack.tests';
import './unit/src/animation/tracks/VectorKeyframeTrack.tests';


//src/audio
import './unit/src/audio/Audio.tests';
import './unit/src/audio/AudioAnalyser.tests';
import './unit/src/audio/AudioContext.tests';
import './unit/src/audio/AudioListener.tests';
import './unit/src/audio/PositionalAudio.tests';


//src/cameras
import './unit/src/cameras/ArrayCamera.tests';
import './unit/src/cameras/Camera.tests';
import './unit/src/cameras/CubeCamera.tests';
import './unit/src/cameras/OrthographicCamera.tests';
import './unit/src/cameras/PerspectiveCamera.tests';
import './unit/src/cameras/StereoCamera.tests';


//src/core
import './unit/src/core/BufferAttribute.tests';
import './unit/src/core/BufferGeometry.tests';
import './unit/src/core/Clock.tests';
import './unit/src/core/DirectGeometry.tests';
import './unit/src/core/EventDispatcher.tests';
import './unit/src/core/Face3.tests';
import './unit/src/core/Geometry.tests';
import './unit/src/core/InstancedBufferAttribute.tests';
import './unit/src/core/InstancedBufferGeometry.tests';
import './unit/src/core/InstancedInterleavedBuffer.tests';
import './unit/src/core/InterleavedBuffer.tests';
import './unit/src/core/InterleavedBufferAttribute.tests';
import './unit/src/core/Layers.tests';
import './unit/src/core/Object3D.tests';
import './unit/src/core/Raycaster.tests';
import './unit/src/core/Uniform.tests';


//src/extras
import './unit/src/extras/ShapeUtils.tests';

//src/extras/core
import './unit/src/extras/core/Curve.tests';
import './unit/src/extras/core/CurvePath.tests';
import './unit/src/extras/core/Font.tests';
import './unit/src/extras/core/Interpolations.tests';
import './unit/src/extras/core/Path.tests';
import './unit/src/extras/core/Shape.tests';
import './unit/src/extras/core/ShapePath.tests';

//src/extras/curves
import './unit/src/extras/curves/ArcCurve.tests';
import './unit/src/extras/curves/CatmullRomCurve3.tests';
import './unit/src/extras/curves/CubicBezierCurve.tests';
import './unit/src/extras/curves/CubicBezierCurve3.tests';
import './unit/src/extras/curves/EllipseCurve.tests';
import './unit/src/extras/curves/LineCurve.tests';
import './unit/src/extras/curves/LineCurve3.tests';
import './unit/src/extras/curves/QuadraticBezierCurve.tests';
import './unit/src/extras/curves/QuadraticBezierCurve3.tests';
import './unit/src/extras/curves/SplineCurve.tests';

//src/extras/objects
import './unit/src/extras/objects/ImmediateRenderObject.tests';


//src/geometries
import './unit/src/geometries/BoxGeometry.tests';
import './unit/src/geometries/CircleGeometry.tests';
import './unit/src/geometries/ConeGeometry.tests';
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
import './unit/src/helpers/ArrowHelper.tests';
import './unit/src/helpers/AxesHelper.tests';
import './unit/src/helpers/Box3Helper.tests';
import './unit/src/helpers/BoxHelper.tests';
import './unit/src/helpers/CameraHelper.tests';
import './unit/src/helpers/DirectionalLightHelper.tests';
import './unit/src/helpers/FaceNormalsHelper.tests';
import './unit/src/helpers/GridHelper.tests';
import './unit/src/helpers/HemisphereLightHelper.tests';
import './unit/src/helpers/PlaneHelper.tests';
import './unit/src/helpers/PointLightHelper.tests';
import './unit/src/helpers/PolarGridHelper.tests';
import './unit/src/helpers/RectAreaLightHelper.tests';
import './unit/src/helpers/SkeletonHelper.tests';
import './unit/src/helpers/SpotLightHelper.tests';
import './unit/src/helpers/VertexNormalsHelper.tests';


//src/lights
import './unit/src/lights/AmbientLight.tests';
import './unit/src/lights/DirectionalLight.tests';
import './unit/src/lights/DirectionalLightShadow.tests';
import './unit/src/lights/HemisphereLight.tests';
import './unit/src/lights/Light.tests';
import './unit/src/lights/LightShadow.tests';
import './unit/src/lights/PointLight.tests';
import './unit/src/lights/RectAreaLight.tests';
import './unit/src/lights/SpotLight.tests';
import './unit/src/lights/SpotLightShadow.tests';


//src/loaders
import './unit/src/loaders/AnimationLoader.tests';
import './unit/src/loaders/AudioLoader.tests';
import './unit/src/loaders/BufferGeometryLoader.tests';
import './unit/src/loaders/Cache.tests';
import './unit/src/loaders/CompressedTextureLoader.tests';
import './unit/src/loaders/CubeTextureLoader.tests';
import './unit/src/loaders/DataTextureLoader.tests';
import './unit/src/loaders/FileLoader.tests';
import './unit/src/loaders/FontLoader.tests';
import './unit/src/loaders/ImageLoader.tests';
import './unit/src/loaders/Loader.tests';
import './unit/src/loaders/LoaderUtils.tests';
import './unit/src/loaders/LoadingManager.tests';
import './unit/src/loaders/MaterialLoader.tests';
import './unit/src/loaders/ObjectLoader.tests';
import './unit/src/loaders/TextureLoader.tests';


//src/materials
import './unit/src/materials/LineBasicMaterial.tests';
import './unit/src/materials/LineDashedMaterial.tests';
import './unit/src/materials/Material.tests';
import './unit/src/materials/MeshBasicMaterial.tests';
import './unit/src/materials/MeshDepthMaterial.tests';
import './unit/src/materials/MeshDistanceMaterial.tests';
import './unit/src/materials/MeshLambertMaterial.tests';
import './unit/src/materials/MeshNormalMaterial.tests';
import './unit/src/materials/MeshPhongMaterial.tests';
import './unit/src/materials/MeshPhysicalMaterial.tests';
import './unit/src/materials/MeshStandardMaterial.tests';
import './unit/src/materials/MeshToonMaterial.tests';
import './unit/src/materials/PointsMaterial.tests';
import './unit/src/materials/RawShaderMaterial.tests';
import './unit/src/materials/ShaderMaterial.tests';
import './unit/src/materials/ShadowMaterial.tests';
import './unit/src/materials/SpriteMaterial.tests';


//src/math
import './unit/src/math/Box2.tests';
import './unit/src/math/Box3.tests';
import './unit/src/math/Color.tests';
import './unit/src/math/Cylindrical.tests';
import './unit/src/math/Euler.tests';
import './unit/src/math/Frustum.tests';
import './unit/src/math/Interpolant.tests';
import './unit/src/math/Line3.tests';
import './unit/src/math/Math.tests';
import './unit/src/math/Matrix3.tests';
import './unit/src/math/Matrix4.tests';
import './unit/src/math/Plane.tests';
import './unit/src/math/Quaternion.tests';
import './unit/src/math/Ray.tests';
import './unit/src/math/Sphere.tests';
import './unit/src/math/Spherical.tests';
import './unit/src/math/Triangle.tests';
import './unit/src/math/Vector2.tests';
import './unit/src/math/Vector3.tests';
import './unit/src/math/Vector4.tests';

//src/math/interpolants
import './unit/src/math/interpolants/CubicInterpolant.tests';
import './unit/src/math/interpolants/DiscreteInterpolant.tests';
import './unit/src/math/interpolants/LinearInterpolant.tests';
import './unit/src/math/interpolants/QuaternionLinearInterpolant.tests';


//src/objects
import './unit/src/objects/Bone.tests';
import './unit/src/objects/Group.tests';
import './unit/src/objects/Line.tests';
import './unit/src/objects/LineLoop.tests';
import './unit/src/objects/LineSegments.tests';
import './unit/src/objects/LOD.tests';
import './unit/src/objects/Mesh.tests';
import './unit/src/objects/Points.tests';
import './unit/src/objects/Skeleton.tests';
import './unit/src/objects/SkinnedMesh.tests';
import './unit/src/objects/Sprite.tests';


//src/renderers
import './unit/src/renderers/WebGL2Renderer.tests';
import './unit/src/renderers/WebGLRenderer.tests';
import './unit/src/renderers/WebGLRenderTarget.tests';
import './unit/src/renderers/WebGLRenderTargetCube.tests';

//src/renderers/shaders
import './unit/src/renderers/shaders/ShaderChunk.tests';
import './unit/src/renderers/shaders/ShaderLib.tests';
import './unit/src/renderers/shaders/UniformsLib.tests';
import './unit/src/renderers/shaders/UniformsUtils.tests';

//src/renderers/webgl
import './unit/src/renderers/webgl/WebGLAttributes.tests';
import './unit/src/renderers/webgl/WebGLBackground.tests';
import './unit/src/renderers/webgl/WebGLBufferRenderer.tests';
import './unit/src/renderers/webgl/WebGLCapabilities.tests';
import './unit/src/renderers/webgl/WebGLClipping.tests';
import './unit/src/renderers/webgl/WebGLExtensions.tests';
import './unit/src/renderers/webgl/WebGLGeometries.tests';
import './unit/src/renderers/webgl/WebGLIndexedBufferRenderer.tests';
import './unit/src/renderers/webgl/WebGLLights.tests';
import './unit/src/renderers/webgl/WebGLMorphtargets.tests';
import './unit/src/renderers/webgl/WebGLObjects.tests';
import './unit/src/renderers/webgl/WebGLProgram.tests';
import './unit/src/renderers/webgl/WebGLPrograms.tests';
import './unit/src/renderers/webgl/WebGLProperties.tests';
import './unit/src/renderers/webgl/WebGLRenderLists.tests';
import './unit/src/renderers/webgl/WebGLShader.tests';
import './unit/src/renderers/webgl/WebGLShadowMap.tests';
import './unit/src/renderers/webgl/WebGLState.tests';
import './unit/src/renderers/webgl/WebGLTextures.tests';
import './unit/src/renderers/webgl/WebGLUniforms.tests';
import './unit/src/renderers/webgl/WebGLUtils.tests';

//src/renderers/webvr
import './unit/src/renderers/webvr/WebVRManager.tests';


//src/scenes
import './unit/src/scenes/Fog.tests';
import './unit/src/scenes/FogExp2.tests';
import './unit/src/scenes/Scene.tests';


//src/textures
import './unit/src/textures/CanvasTexture.tests';
import './unit/src/textures/CompressedTexture.tests';
import './unit/src/textures/CubeTexture.tests';
import './unit/src/textures/DataTexture.tests';
import './unit/src/textures/DepthTexture.tests';
import './unit/src/textures/Texture.tests';
import './unit/src/textures/VideoTexture.tests';
