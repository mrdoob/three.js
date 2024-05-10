import { REVISION } from '../../../../src/constants.js';

export { WebGLArrayRenderTarget } from '../../../../src/renderers/WebGLArrayRenderTarget.js';
export { WebGL3DRenderTarget } from '../../../../src/renderers/WebGL3DRenderTarget.js';
export { WebGLCubeRenderTarget } from '../../../../src/renderers/WebGLCubeRenderTarget.js';
export { WebGLRenderTarget } from '../../../../src/renderers/WebGLRenderTarget.js';
//export { WebGLRenderer } from './renderers/WebGLRenderer.js';
//export { ShaderLib } from './renderers/shaders/ShaderLib.js';
//export { UniformsLib } from './renderers/shaders/UniformsLib.js';
//export { UniformsUtils } from './renderers/shaders/UniformsUtils.js';
//export { ShaderChunk } from './renderers/shaders/ShaderChunk.js';
export { FogExp2 } from '../../../../src/scenes/FogExp2.js';
export { Fog } from '../../../../src/scenes/Fog.js';
export { Scene } from '../../../../src/scenes/Scene.js';
export { Sprite } from '../../../../src/objects/Sprite.js';
export { LOD } from '../../../../src/objects/LOD.js';
export { SkinnedMesh } from '../../../../src/objects/SkinnedMesh.js';
export { Skeleton } from '../../../../src/objects/Skeleton.js';
export { Bone } from '../../../../src/objects/Bone.js';
export { Mesh } from '../../../../src/objects/Mesh.js';
export { InstancedMesh } from '../../../../src/objects/InstancedMesh.js';
export { BatchedMesh } from '../../../../src/objects/BatchedMesh.js';
export { LineSegments } from '../../../../src/objects/LineSegments.js';
export { LineLoop } from '../../../../src/objects/LineLoop.js';
export { Line } from '../../../../src/objects/Line.js';
export { Points } from '../../../../src/objects/Points.js';
export { Group } from '../../../../src/objects/Group.js';
export { VideoTexture } from '../../../../src/textures/VideoTexture.js';
export { FramebufferTexture } from '../../../../src/textures/FramebufferTexture.js';
export { Source } from '../../../../src/textures/Source.js';
export { DataTexture } from '../../../../src/textures/DataTexture.js';
export { DataArrayTexture } from '../../../../src/textures/DataArrayTexture.js';
export { Data3DTexture } from '../../../../src/textures/Data3DTexture.js';
export { CompressedTexture } from '../../../../src/textures/CompressedTexture.js';
export { CompressedArrayTexture } from '../../../../src/textures/CompressedArrayTexture.js';
export { CompressedCubeTexture } from '../../../../src/textures/CompressedCubeTexture.js';
export { CubeTexture } from '../../../../src/textures/CubeTexture.js';
export { CanvasTexture } from '../../../../src/textures/CanvasTexture.js';
export { DepthTexture } from '../../../../src/textures/DepthTexture.js';
export { Texture } from '../../../../src/textures/Texture.js';
export * from '../../../../src/geometries/Geometries.js';
//export * from './materials/Materials.js';
export { Material } from '../../../../src/materials/Material.js';
export { AnimationLoader } from '../../../../src/loaders/AnimationLoader.js';
export { CompressedTextureLoader } from '../../../../src/loaders/CompressedTextureLoader.js';
export { CubeTextureLoader } from '../../../../src/loaders/CubeTextureLoader.js';
export { DataTextureLoader } from '../../../../src/loaders/DataTextureLoader.js';
export { TextureLoader } from '../../../../src/loaders/TextureLoader.js';
export { ObjectLoader } from '../../../../src/loaders/ObjectLoader.js';
export { MaterialLoader } from '../../../../src/loaders/MaterialLoader.js';
export { BufferGeometryLoader } from '../../../../src/loaders/BufferGeometryLoader.js';
export { DefaultLoadingManager, LoadingManager } from '../../../../src/loaders/LoadingManager.js';
export { ImageLoader } from '../../../../src/loaders/ImageLoader.js';
export { ImageBitmapLoader } from '../../../../src/loaders/ImageBitmapLoader.js';
export { FileLoader } from '../../../../src/loaders/FileLoader.js';
export { Loader } from '../../../../src/loaders/Loader.js';
export { LoaderUtils } from '../../../../src/loaders/LoaderUtils.js';
export { Cache } from '../../../../src/loaders/Cache.js';
export { AudioLoader } from '../../../../src/loaders/AudioLoader.js';
export { SpotLight } from '../../../../src/lights/SpotLight.js';
export { PointLight } from '../../../../src/lights/PointLight.js';
export { RectAreaLight } from '../../../../src/lights/RectAreaLight.js';
export { HemisphereLight } from '../../../../src/lights/HemisphereLight.js';
export { DirectionalLight } from '../../../../src/lights/DirectionalLight.js';
export { AmbientLight } from '../../../../src/lights/AmbientLight.js';
export { Light } from '../../../../src/lights/Light.js';
export { LightProbe } from '../../../../src/lights/LightProbe.js';
export { StereoCamera } from '../../../../src/cameras/StereoCamera.js';
export { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera.js';
export { OrthographicCamera } from '../../../../src/cameras/OrthographicCamera.js';
export { CubeCamera } from '../../../../src/cameras/CubeCamera.js';
export { ArrayCamera } from '../../../../src/cameras/ArrayCamera.js';
export { Camera } from '../../../../src/cameras/Camera.js';
export { AudioListener } from '../../../../src/audio/AudioListener.js';
export { PositionalAudio } from '../../../../src/audio/PositionalAudio.js';
export { AudioContext } from '../../../../src/audio/AudioContext.js';
export { AudioAnalyser } from '../../../../src/audio/AudioAnalyser.js';
export { Audio } from '../../../../src/audio/Audio.js';
export { VectorKeyframeTrack } from '../../../../src/animation/tracks/VectorKeyframeTrack.js';
export { StringKeyframeTrack } from '../../../../src/animation/tracks/StringKeyframeTrack.js';
export { QuaternionKeyframeTrack } from '../../../../src/animation/tracks/QuaternionKeyframeTrack.js';
export { NumberKeyframeTrack } from '../../../../src/animation/tracks/NumberKeyframeTrack.js';
export { ColorKeyframeTrack } from '../../../../src/animation/tracks/ColorKeyframeTrack.js';
export { BooleanKeyframeTrack } from '../../../../src/animation/tracks/BooleanKeyframeTrack.js';
export { PropertyMixer } from '../../../../src/animation/PropertyMixer.js';
export { PropertyBinding } from '../../../../src/animation/PropertyBinding.js';
export { KeyframeTrack } from '../../../../src/animation/KeyframeTrack.js';
export { AnimationUtils } from '../../../../src/animation/AnimationUtils.js';
export { AnimationObjectGroup } from '../../../../src/animation/AnimationObjectGroup.js';
export { AnimationMixer } from '../../../../src/animation/AnimationMixer.js';
export { AnimationClip } from '../../../../src/animation/AnimationClip.js';
export { AnimationAction } from '../../../../src/animation/AnimationAction.js';
export { RenderTarget } from '../../../../src/core/RenderTarget.js';
export { Uniform } from '../../../../src/core/Uniform.js';
export { UniformsGroup } from '../../../../src/core/UniformsGroup.js';
export { InstancedBufferGeometry } from '../../../../src/core/InstancedBufferGeometry.js';
export { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
export { InterleavedBufferAttribute } from '../../../../src/core/InterleavedBufferAttribute.js';
export { InstancedInterleavedBuffer } from '../../../../src/core/InstancedInterleavedBuffer.js';
export { InterleavedBuffer } from '../../../../src/core/InterleavedBuffer.js';
export { InstancedBufferAttribute } from '../../../../src/core/InstancedBufferAttribute.js';
export { GLBufferAttribute } from '../../../../src/core/GLBufferAttribute.js';
export * from '../../../../src/core/BufferAttribute.js';
export { Object3D } from '../../../../src/core/Object3D.js';
export { Raycaster } from '../../../../src/core/Raycaster.js';
export { Layers } from '../../../../src/core/Layers.js';
export { EventDispatcher } from '../../../../src/core/EventDispatcher.js';
export { Clock } from '../../../../src/core/Clock.js';
export { QuaternionLinearInterpolant } from '../../../../src/math/interpolants/QuaternionLinearInterpolant.js';
export { LinearInterpolant } from '../../../../src/math/interpolants/LinearInterpolant.js';
export { DiscreteInterpolant } from '../../../../src/math/interpolants/DiscreteInterpolant.js';
export { CubicInterpolant } from '../../../../src/math/interpolants/CubicInterpolant.js';
export { Interpolant } from '../../../../src/math/Interpolant.js';
export { Triangle } from '../../../../src/math/Triangle.js';
export { MathUtils } from '../../../../src/math/MathUtils.js';
export { Spherical } from '../../../../src/math/Spherical.js';
export { Cylindrical } from '../../../../src/math/Cylindrical.js';
export { Plane } from '../../../../src/math/Plane.js';
export { Frustum } from '../../../../src/math/Frustum.js';
export { Sphere } from '../../../../src/math/Sphere.js';
export { Ray } from '../../../../src/math/Ray.js';
export { Matrix4 } from '../../../../src/math/Matrix4.js';
export { Matrix3 } from '../../../../src/math/Matrix3.js';
export { Box3 } from '../../../../src/math/Box3.js';
export { Box2 } from '../../../../src/math/Box2.js';
export { Line3 } from '../../../../src/math/Line3.js';
export { Euler } from '../../../../src/math/Euler.js';
export { Vector4 } from '../../../../src/math/Vector4.js';
export { Vector3 } from '../../../../src/math/Vector3.js';
export { Vector2 } from '../../../../src/math/Vector2.js';
export { Quaternion } from '../../../../src/math/Quaternion.js';
export { Color } from '../../../../src/math/Color.js';
export { ColorManagement } from '../../../../src/math/ColorManagement.js';
export { SphericalHarmonics3 } from '../../../../src/math/SphericalHarmonics3.js';
export { SpotLightHelper } from '../../../../src/helpers/SpotLightHelper.js';
export { SkeletonHelper } from '../../../../src/helpers/SkeletonHelper.js';
export { PointLightHelper } from '../../../../src/helpers/PointLightHelper.js';
export { HemisphereLightHelper } from '../../../../src/helpers/HemisphereLightHelper.js';
export { GridHelper } from '../../../../src/helpers/GridHelper.js';
export { PolarGridHelper } from '../../../../src/helpers/PolarGridHelper.js';
export { DirectionalLightHelper } from '../../../../src/helpers/DirectionalLightHelper.js';
export { CameraHelper } from '../../../../src/helpers/CameraHelper.js';
export { BoxHelper } from '../../../../src/helpers/BoxHelper.js';
export { Box3Helper } from '../../../../src/helpers/Box3Helper.js';
export { PlaneHelper } from '../../../../src/helpers/PlaneHelper.js';
export { ArrowHelper } from '../../../../src/helpers/ArrowHelper.js';
export { AxesHelper } from '../../../../src/helpers/AxesHelper.js';
export * from '../../../../src/extras/curves/Curves.js';
export { Shape } from '../../../../src/extras/core/Shape.js';
export { Path } from '../../../../src/extras/core/Path.js';
export { ShapePath } from '../../../../src/extras/core/ShapePath.js';
export { CurvePath } from '../../../../src/extras/core/CurvePath.js';
export { Curve } from '../../../../src/extras/core/Curve.js';
export { DataUtils } from '../../../../src/extras/DataUtils.js';
export { ImageUtils } from '../../../../src/extras/ImageUtils.js';
export { ShapeUtils } from '../../../../src/extras/ShapeUtils.js';
export { PMREMGenerator } from '../../../../src/extras/PMREMGenerator.js';
//export { WebGLUtils } from './renderers/webgl/WebGLUtils.js';
export { createCanvasElement } from '../../../../src/utils.js';
export * from '../../../../src/constants.js';
export * from '../../../../src/Three.Legacy.js';

export { default as WebGPURenderer } from './WebGPURenderer.js';

export { default as NodeMaterial } from '../../materials/NodeMaterial.js';
export { default as MeshBasicMaterial } from '../../materials/MeshBasicMaterial.js';
export { default as MeshPhongMaterial } from '../../materials/MeshPhongMaterial.js';
export { default as MeshPhongNodeMaterial } from '../../materials/nodes/MeshPhongNodeMaterial.js';
export { default as MeshStandardMaterial } from '../../materials/MeshStandardMaterial.js';
export { default as MeshStandardNodeMaterial } from '../../materials/nodes/MeshStandardNodeMaterial.js';

if ( typeof __THREE_DEVTOOLS__ !== 'undefined' ) {

	__THREE_DEVTOOLS__.dispatchEvent( new CustomEvent( 'register', { detail: {
		revision: REVISION,
	} } ) );

}

if ( typeof window !== 'undefined' ) {

	if ( window.__THREE__ ) {

		console.warn( 'WARNING: Multiple instances of Three.js being imported.' );

	} else {

		window.__THREE__ = REVISION;

	}

}
