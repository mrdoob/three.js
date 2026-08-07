import { REVISION } from './constants.js';
import { warn } from './utils.js';

export { WebGLArrayRenderTarget } from './renderers/WebGLArrayRenderTarget.js';
export { WebGL3DRenderTarget } from './renderers/WebGL3DRenderTarget.js';
export { WebGLRenderTarget } from './renderers/WebGLRenderTarget.js';
export { WebXRController } from './renderers/webxr/WebXRController.js';
export { FogExp2 } from './scenes/FogExp2.js';
export { Fog } from './scenes/Fog.js';
export { Scene } from './scenes/Scene.js';
export { Sprite } from './objects/Sprite.js';
export { LOD } from './objects/LOD.js';
export { SkinnedMesh } from './objects/SkinnedMesh.js';
export { Skeleton } from './objects/Skeleton.js';
export { Bone } from './objects/Bone.js';
export { Mesh } from './objects/Mesh.js';
export { InstancedMesh } from './objects/InstancedMesh.js';
export { BatchedMesh } from './objects/BatchedMesh.js';
export { LineSegments } from './objects/LineSegments.js';
export { LineLoop } from './objects/LineLoop.js';
export { Line } from './objects/Line.js';
export { Points } from './objects/Points.js';
export { Group } from './objects/Group.js';
export { VideoTexture } from './textures/VideoTexture.js';
export { VideoFrameTexture } from './textures/VideoFrameTexture.js';
export { FramebufferTexture } from './textures/FramebufferTexture.js';
export { Source } from './textures/Source.js';
export { DataTexture } from './textures/DataTexture.js';
export { DataArrayTexture } from './textures/DataArrayTexture.js';
export { Data3DTexture } from './textures/Data3DTexture.js';
export { CompressedTexture } from './textures/CompressedTexture.js';
export { CompressedArrayTexture } from './textures/CompressedArrayTexture.js';
export { CompressedCubeTexture } from './textures/CompressedCubeTexture.js';
export { CubeTexture } from './textures/CubeTexture.js';
export { CanvasTexture } from './textures/CanvasTexture.js';
export { HTMLTexture } from './textures/HTMLTexture.js';
export { DepthTexture } from './textures/DepthTexture.js';
export { CubeDepthTexture } from './textures/CubeDepthTexture.js';
export { ExternalTexture } from './textures/ExternalTexture.js';
export { Texture } from './textures/Texture.js';
export * from './geometries/Geometries.js';
export * from './materials/Materials.js';
export { AnimationLoader } from './loaders/AnimationLoader.js';
export { CompressedTextureLoader } from './loaders/CompressedTextureLoader.js';
export { CubeTextureLoader } from './loaders/CubeTextureLoader.js';
export { DataTextureLoader } from './loaders/DataTextureLoader.js';
export { TextureLoader } from './loaders/TextureLoader.js';
export { ObjectLoader } from './loaders/ObjectLoader.js';
export { MaterialLoader } from './loaders/MaterialLoader.js';
export { BufferGeometryLoader } from './loaders/BufferGeometryLoader.js';
export { DefaultLoadingManager, LoadingManager } from './loaders/LoadingManager.js';
export { ImageLoader } from './loaders/ImageLoader.js';
export { ImageBitmapLoader } from './loaders/ImageBitmapLoader.js';
export { FileLoader } from './loaders/FileLoader.js';
export { Loader } from './loaders/Loader.js';
export { LoaderUtils } from './loaders/LoaderUtils.js';
export { Cache } from './loaders/Cache.js';
export { AudioLoader } from './loaders/AudioLoader.js';
export { SpotLight } from './lights/SpotLight.js';
export { PointLight } from './lights/PointLight.js';
export { RectAreaLight } from './lights/RectAreaLight.js';
export { HemisphereLight } from './lights/HemisphereLight.js';
export { DirectionalLight } from './lights/DirectionalLight.js';
export { AmbientLight } from './lights/AmbientLight.js';
export { Light } from './lights/Light.js';
export { LightProbe } from './lights/LightProbe.js';
export { StereoCamera } from './cameras/StereoCamera.js';
export { PerspectiveCamera } from './cameras/PerspectiveCamera.js';
export { OrthographicCamera } from './cameras/OrthographicCamera.js';
export { CubeCamera } from './cameras/CubeCamera.js';
export { ArrayCamera } from './cameras/ArrayCamera.js';
export { Camera } from './cameras/Camera.js';
export { AudioListener } from './audio/AudioListener.js';
export { PositionalAudio } from './audio/PositionalAudio.js';
export { AudioContext } from './audio/AudioContext.js';
export { AudioAnalyser } from './audio/AudioAnalyser.js';
export { Audio } from './audio/Audio.js';
export { VectorKeyframeTrack } from './animation/tracks/VectorKeyframeTrack.js';
export { StringKeyframeTrack } from './animation/tracks/StringKeyframeTrack.js';
export { QuaternionKeyframeTrack } from './animation/tracks/QuaternionKeyframeTrack.js';
export { NumberKeyframeTrack } from './animation/tracks/NumberKeyframeTrack.js';
export { ColorKeyframeTrack } from './animation/tracks/ColorKeyframeTrack.js';
export { BooleanKeyframeTrack } from './animation/tracks/BooleanKeyframeTrack.js';
export { PropertyMixer } from './animation/PropertyMixer.js';
export { PropertyBinding } from './animation/PropertyBinding.js';
export { KeyframeTrack } from './animation/KeyframeTrack.js';
export { AnimationUtils } from './animation/AnimationUtils.js';
export { AnimationObjectGroup } from './animation/AnimationObjectGroup.js';
export { AnimationMixer } from './animation/AnimationMixer.js';
export { AnimationClip } from './animation/AnimationClip.js';
export { AnimationAction } from './animation/AnimationAction.js';
export { RenderTarget } from './core/RenderTarget.js';
export { RenderTarget3D } from './core/RenderTarget3D.js';
export { Uniform } from './core/Uniform.js';
export { UniformsGroup } from './core/UniformsGroup.js';
export { InstancedBufferGeometry } from './core/InstancedBufferGeometry.js';
export { BufferGeometry } from './core/BufferGeometry.js';
export { InterleavedBufferAttribute } from './core/InterleavedBufferAttribute.js';
export { InstancedInterleavedBuffer } from './core/InstancedInterleavedBuffer.js';
export { InterleavedBuffer } from './core/InterleavedBuffer.js';
export { InstancedBufferAttribute } from './core/InstancedBufferAttribute.js';
export { GLBufferAttribute } from './core/GLBufferAttribute.js';
export * from './core/BufferAttribute.js';
export { Object3D } from './core/Object3D.js';
export { Raycaster } from './core/Raycaster.js';
export { Layers } from './core/Layers.js';
export { EventDispatcher } from './core/EventDispatcher.js';
export { Clock } from './core/Clock.js';
export { Timer } from './core/Timer.js';
export { QuaternionLinearInterpolant } from './math/interpolants/QuaternionLinearInterpolant.js';
export { LinearInterpolant } from './math/interpolants/LinearInterpolant.js';
export { DiscreteInterpolant } from './math/interpolants/DiscreteInterpolant.js';
export { CubicInterpolant } from './math/interpolants/CubicInterpolant.js';
export { BezierInterpolant } from './math/interpolants/BezierInterpolant.js';
export { Interpolant } from './math/Interpolant.js';
export { Triangle } from './math/Triangle.js';
export {
	triangleClosestPointToPoint,
	triangleContainsPoint,
	triangleCopy,
	triangleCreate,
	triangleEquals,
	triangleGetArea,
	triangleGetBarycoord,
	triangleGetInterpolatedAttribute,
	triangleGetInterpolation,
	triangleGetMidpoint,
	triangleGetNormal,
	triangleGetPlane,
	triangleIntersectsBox,
	triangleIsFrontFacing,
	triangleSet,
	triangleSetFromAttributeAndIndices,
	triangleSetFromPointsAndIndices
} from './math/TriangleFunctions.js';
export { MathUtils } from './math/MathUtils.js';
export { Spherical } from './math/Spherical.js';
export {
	sphericalCopy,
	sphericalCreate,
	sphericalMakeSafe,
	sphericalSet,
	sphericalSetFromCartesianCoords,
	sphericalSetFromVector3
} from './math/SphericalFunctions.js';
export { Cylindrical } from './math/Cylindrical.js';
export {
	cylindricalCopy,
	cylindricalCreate,
	cylindricalSet,
	cylindricalSetFromCartesianCoords,
	cylindricalSetFromVector3
} from './math/CylindricalFunctions.js';
export { Plane } from './math/Plane.js';
export {
	planeApplyMatrix4,
	planeCoplanarPoint,
	planeCopy,
	planeCreate,
	planeDistanceToPoint,
	planeDistanceToSphere,
	planeEquals,
	planeFromJSON,
	planeIntersectLine,
	planeIntersectsBox,
	planeIntersectsLine,
	planeIntersectsSphere,
	planeNegate,
	planeNormalize,
	planeProjectPoint,
	planeSet,
	planeSetComponents,
	planeSetFromCoplanarPoints,
	planeSetFromNormalAndCoplanarPoint,
	planeToJSON,
	planeTranslate
} from './math/PlaneFunctions.js';
export { Frustum } from './math/Frustum.js';
export {
	frustumContainsPoint,
	frustumCopy,
	frustumCreate,
	frustumIntersectsBox,
	frustumIntersectsObject,
	frustumIntersectsSphere,
	frustumIntersectsSprite,
	frustumSet,
	frustumSetFromProjectionMatrix
} from './math/FrustumFunctions.js';
export { FrustumArray } from './math/FrustumArray.js';
export { Sphere } from './math/Sphere.js';
export {
	sphereApplyMatrix4,
	sphereClampPoint,
	sphereContainsPoint,
	sphereCopy,
	sphereCreate,
	sphereDistanceToPoint,
	sphereEquals,
	sphereExpandByPoint,
	sphereFromJSON,
	sphereGetBoundingBox,
	sphereIntersectsBox,
	sphereIntersectsPlane,
	sphereIntersectsSphere,
	sphereIsEmpty,
	sphereMakeEmpty,
	sphereSet,
	sphereSetFromPoints,
	sphereToJSON,
	sphereTranslate,
	sphereUnion
} from './math/SphereFunctions.js';
export { Ray } from './math/Ray.js';
export {
	rayApplyMatrix4,
	rayAt,
	rayClosestPointToPoint,
	rayCopy,
	rayCreate,
	rayDistanceSqToPoint,
	rayDistanceSqToSegment,
	rayDistanceToPlane,
	rayDistanceToPoint,
	rayEquals,
	rayIntersectBox,
	rayIntersectPlane,
	rayIntersectSphere,
	rayIntersectTriangle,
	rayIntersectsBox,
	rayIntersectsPlane,
	rayIntersectsSphere,
	rayLookAt,
	rayRecast,
	raySet
} from './math/RayFunctions.js';
export { Matrix4 } from './math/Matrix4.js';
export {
	mat4Compose,
	mat4Copy,
	mat4CopyPosition,
	mat4Create,
	mat4Decompose,
	mat4Determinant,
	mat4DeterminantAffine,
	mat4Equals,
	mat4ExtractBasis,
	mat4ExtractRotation,
	mat4FromArray,
	mat4GetMaxScaleOnAxis,
	mat4Identity,
	mat4Invert,
	mat4LookAt,
	mat4MakeBasis,
	mat4MakeOrthographic,
	mat4MakePerspective,
	mat4MakeRotationAxis,
	mat4MakeRotationFromEuler,
	mat4MakeRotationFromQuaternion,
	mat4MakeRotationX,
	mat4MakeRotationY,
	mat4MakeRotationZ,
	mat4MakeScale,
	mat4MakeShear,
	mat4MakeTranslation,
	mat4Multiply,
	mat4MultiplyMatrices,
	mat4MultiplyScalar,
	mat4PreMultiply,
	mat4Scale,
	mat4Set,
	mat4SetFromMatrix3,
	mat4SetPosition,
	mat4ToArray,
	mat4Transpose
} from './math/Matrix4Functions.js';
export { Matrix3 } from './math/Matrix3.js';
export {
	mat3Copy,
	mat3Create,
	mat3Determinant,
	mat3Equals,
	mat3ExtractBasis,
	mat3FromArray,
	mat3GetNormalMatrix,
	mat3Identity,
	mat3Invert,
	mat3MakeRotation,
	mat3MakeScale,
	mat3MakeTranslation,
	mat3Multiply,
	mat3MultiplyMatrices,
	mat3MultiplyScalar,
	mat3PreMultiply,
	mat3Set,
	mat3SetFromMatrix4,
	mat3SetUvTransform,
	mat3ToArray,
	mat3Transpose,
	mat3TransposeIntoArray
} from './math/Matrix3Functions.js';
export { Matrix2 } from './math/Matrix2.js';
export {
	mat2Create,
	mat2FromArray,
	mat2Identity,
	mat2Set
} from './math/Matrix2Functions.js';
export { Box3 } from './math/Box3.js';
export {
	box3ApplyMatrix4,
	box3ClampPoint,
	box3ContainsBox,
	box3ContainsPoint,
	box3Copy,
	box3Create,
	box3DistanceToPoint,
	box3Equals,
	box3ExpandByObject,
	box3ExpandByPoint,
	box3ExpandByScalar,
	box3ExpandByVector,
	box3FromJSON,
	box3GetBoundingSphere,
	box3GetCenter,
	box3GetParameter,
	box3GetSize,
	box3Intersect,
	box3IntersectsBox,
	box3IntersectsPlane,
	box3IntersectsSphere,
	box3IntersectsTriangle,
	box3IsEmpty,
	box3MakeEmpty,
	box3Set,
	box3SetFromArray,
	box3SetFromBufferAttribute,
	box3SetFromCenterAndSize,
	box3SetFromObject,
	box3SetFromPoints,
	box3ToJSON,
	box3Translate,
	box3Union
} from './math/Box3Functions.js';
export { Box2 } from './math/Box2.js';
export {
	box2ClampPoint,
	box2ContainsBox,
	box2ContainsPoint,
	box2Copy,
	box2Create,
	box2DistanceToPoint,
	box2Equals,
	box2ExpandByPoint,
	box2ExpandByScalar,
	box2ExpandByVector,
	box2GetCenter,
	box2GetParameter,
	box2GetSize,
	box2Intersect,
	box2IntersectsBox,
	box2IsEmpty,
	box2MakeEmpty,
	box2Set,
	box2SetFromCenterAndSize,
	box2SetFromPoints,
	box2Translate,
	box2Union
} from './math/Box2Functions.js';
export { Line3 } from './math/Line3.js';
export {
	line3ApplyMatrix4,
	line3At,
	line3ClosestPointToPoint,
	line3ClosestPointToPointParameter,
	line3Copy,
	line3Create,
	line3Delta,
	line3Distance,
	line3DistanceSq,
	line3DistanceSqToLine3,
	line3Equals,
	line3GetCenter,
	line3Set
} from './math/Line3Functions.js';
export { Euler } from './math/Euler.js';
export {
	EULER_DEFAULT_ORDER,
	eulerCopy,
	eulerCreate,
	eulerEquals,
	eulerFromArray,
	eulerReorder,
	eulerSet,
	eulerSetFromQuaternion,
	eulerSetFromRotationMatrix,
	eulerSetFromVector3,
	eulerToArray
} from './math/EulerFunctions.js';
export { Vector3 } from './math/Vector3.js';
export {
	vec3Add,
	vec3AddScalar,
	vec3AddScaledVector,
	vec3AddVectors,
	vec3AngleTo,
	vec3ApplyAxisAngle,
	vec3ApplyEuler,
	vec3ApplyMatrix3,
	vec3ApplyMatrix4,
	vec3ApplyNormalMatrix,
	vec3ApplyQuaternion,
	vec3Ceil,
	vec3Clamp,
	vec3ClampLength,
	vec3ClampScalar,
	vec3Copy,
	vec3Create,
	vec3Cross,
	vec3CrossVectors,
	vec3DistanceTo,
	vec3DistanceToSquared,
	vec3Divide,
	vec3DivideScalar,
	vec3Dot,
	vec3Equals,
	vec3Floor,
	vec3FromArray,
	vec3FromBufferAttribute,
	vec3GetComponent,
	vec3Length,
	vec3LengthSq,
	vec3Lerp,
	vec3LerpVectors,
	vec3ManhattanDistanceTo,
	vec3ManhattanLength,
	vec3Max,
	vec3Min,
	vec3Multiply,
	vec3MultiplyScalar,
	vec3MultiplyVectors,
	vec3Negate,
	vec3Normalize,
	vec3Project,
	vec3ProjectOnPlane,
	vec3ProjectOnVector,
	vec3Random,
	vec3RandomDirection,
	vec3Reflect,
	vec3Round,
	vec3RoundToZero,
	vec3Set,
	vec3SetComponent,
	vec3SetFromColor,
	vec3SetFromCylindrical,
	vec3SetFromCylindricalCoords,
	vec3SetFromEuler,
	vec3SetFromMatrix3Column,
	vec3SetFromMatrixColumn,
	vec3SetFromMatrixPosition,
	vec3SetFromMatrixScale,
	vec3SetFromSpherical,
	vec3SetFromSphericalCoords,
	vec3SetLength,
	vec3SetScalar,
	vec3SetX,
	vec3SetY,
	vec3SetZ,
	vec3Sub,
	vec3SubScalar,
	vec3SubVectors,
	vec3ToArray,
	vec3TransformDirection,
	vec3Unproject
} from './math/Vector3Functions.js';
export { Vector4 } from './math/Vector4.js';
export {
	vec4Add,
	vec4AddScalar,
	vec4AddScaledVector,
	vec4AddVectors,
	vec4ApplyMatrix4,
	vec4Ceil,
	vec4Clamp,
	vec4ClampLength,
	vec4ClampScalar,
	vec4Copy,
	vec4Create,
	vec4Divide,
	vec4DivideScalar,
	vec4Dot,
	vec4Equals,
	vec4Floor,
	vec4FromArray,
	vec4FromBufferAttribute,
	vec4GetComponent,
	vec4Length,
	vec4LengthSq,
	vec4Lerp,
	vec4LerpVectors,
	vec4ManhattanLength,
	vec4Max,
	vec4Min,
	vec4Multiply,
	vec4MultiplyScalar,
	vec4Negate,
	vec4Normalize,
	vec4Random,
	vec4Round,
	vec4RoundToZero,
	vec4Set,
	vec4SetAxisAngleFromQuaternion,
	vec4SetAxisAngleFromRotationMatrix,
	vec4SetComponent,
	vec4SetFromMatrixPosition,
	vec4SetLength,
	vec4SetScalar,
	vec4SetW,
	vec4SetX,
	vec4SetY,
	vec4SetZ,
	vec4Sub,
	vec4SubScalar,
	vec4SubVectors,
	vec4ToArray
} from './math/Vector4Functions.js';
export { Vector2 } from './math/Vector2.js';
export {
	vec2Add,
	vec2AddScalar,
	vec2AddScaledVector,
	vec2AddVectors,
	vec2Angle,
	vec2AngleTo,
	vec2ApplyMatrix3,
	vec2Ceil,
	vec2Clamp,
	vec2ClampLength,
	vec2ClampScalar,
	vec2Copy,
	vec2Create,
	vec2Cross,
	vec2DistanceTo,
	vec2DistanceToSquared,
	vec2Divide,
	vec2DivideScalar,
	vec2Dot,
	vec2Equals,
	vec2Floor,
	vec2FromArray,
	vec2FromBufferAttribute,
	vec2GetComponent,
	vec2Length,
	vec2LengthSq,
	vec2Lerp,
	vec2LerpVectors,
	vec2ManhattanDistanceTo,
	vec2ManhattanLength,
	vec2Max,
	vec2Min,
	vec2Multiply,
	vec2MultiplyScalar,
	vec2Negate,
	vec2Normalize,
	vec2Random,
	vec2RotateAround,
	vec2Round,
	vec2RoundToZero,
	vec2Set,
	vec2SetComponent,
	vec2SetLength,
	vec2SetScalar,
	vec2SetX,
	vec2SetY,
	vec2Sub,
	vec2SubScalar,
	vec2SubVectors,
	vec2ToArray
} from './math/Vector2Functions.js';
export { Quaternion } from './math/Quaternion.js';
export {
	quatAngleTo,
	quatConjugate,
	quatCopy,
	quatCreate,
	quatDot,
	quatEquals,
	quatFromArray,
	quatFromBufferAttribute,
	quatIdentity,
	quatInvert,
	quatLength,
	quatLengthSq,
	quatMultiply,
	quatMultiplyQuaternions,
	quatMultiplyQuaternionsFlat,
	quatNormalize,
	quatPreMultiply,
	quatRandom,
	quatRotateTowards,
	quatSet,
	quatSetFromAxisAngle,
	quatSetFromEuler,
	quatSetFromRotationMatrix,
	quatSetFromUnitVectors,
	quatSlerp,
	quatSlerpFlat,
	quatSlerpQuaternions,
	quatToArray,
	quatToJSON
} from './math/QuaternionFunctions.js';
export { Color } from './math/Color.js';
export {
	colorAdd,
	colorAddColors,
	colorAddScalar,
	colorApplyMatrix3,
	colorConvertLinearToSRGB,
	colorConvertSRGBToLinear,
	colorCopy,
	colorCopyLinearToSRGB,
	colorCopySRGBToLinear,
	colorCreate,
	colorEquals,
	colorFromArray,
	colorFromBufferAttribute,
	colorGetHex,
	colorGetHexString,
	colorGetHSL,
	colorGetRGB,
	colorGetStyle,
	colorLerp,
	colorLerpColors,
	colorLerpHSL,
	colorMultiply,
	colorMultiplyScalar,
	colorNAMES,
	colorOffsetHSL,
	colorSet,
	colorSetColorName,
	colorSetFromVector3,
	colorSetHSL,
	colorSetHex,
	colorSetRGB,
	colorSetScalar,
	colorSetStyle,
	colorSub,
	colorToArray,
	colorToJSON
} from './math/ColorFunctions.js';
export { ColorManagement } from './math/ColorManagement.js';
export { SphericalHarmonics3 } from './math/SphericalHarmonics3.js';
export {
	sh3Add,
	sh3AddScaledSH,
	sh3Copy,
	sh3Create,
	sh3Equals,
	sh3FromArray,
	sh3GetAt,
	sh3GetBasisAt,
	sh3GetIrradianceAt,
	sh3Lerp,
	sh3Scale,
	sh3Set,
	sh3ToArray,
	sh3Zero
} from './math/SphericalHarmonics3Functions.js';
export { SpotLightHelper } from './helpers/SpotLightHelper.js';
export { SkeletonHelper } from './helpers/SkeletonHelper.js';
export { PointLightHelper } from './helpers/PointLightHelper.js';
export { HemisphereLightHelper } from './helpers/HemisphereLightHelper.js';
export { GridHelper } from './helpers/GridHelper.js';
export { PolarGridHelper } from './helpers/PolarGridHelper.js';
export { DirectionalLightHelper } from './helpers/DirectionalLightHelper.js';
export { CameraHelper } from './helpers/CameraHelper.js';
export { BoxHelper } from './helpers/BoxHelper.js';
export { Box3Helper } from './helpers/Box3Helper.js';
export { PlaneHelper } from './helpers/PlaneHelper.js';
export { ArrowHelper } from './helpers/ArrowHelper.js';
export { AxesHelper } from './helpers/AxesHelper.js';
export * from './extras/curves/Curves.js';
export { Shape } from './extras/core/Shape.js';
export { Path } from './extras/core/Path.js';
export { ShapePath } from './extras/core/ShapePath.js';
export { CurvePath } from './extras/core/CurvePath.js';
export { Curve } from './extras/core/Curve.js';
export { Controls } from './extras/Controls.js';
export { DataUtils } from './extras/DataUtils.js';
export { ImageUtils } from './extras/ImageUtils.js';
export { ShapeUtils } from './extras/ShapeUtils.js';
export { TextureUtils } from './extras/TextureUtils.js';
export { createCanvasElement, setConsoleFunction, getConsoleFunction, log, warn, error, warnOnce } from './utils.js';
export * from './constants.js';
export * from './Three.Legacy.js';

if ( typeof __THREE_DEVTOOLS__ !== 'undefined' ) {

	__THREE_DEVTOOLS__.dispatchEvent( new CustomEvent( 'register', { detail: {
		revision: REVISION,
	} } ) );

}

if ( typeof window !== 'undefined' ) {

	if ( window.__THREE__ ) {

		warn( 'WARNING: Multiple instances of Three.js being imported.' );

	} else {

		window.__THREE__ = REVISION;

	}

}
