import { Audio } from './audio/Audio.js';
import { AudioAnalyser } from './audio/AudioAnalyser.js';
import { PerspectiveCamera } from './cameras/PerspectiveCamera.js';
import {
	FlatShading,
	sRGBEncoding,
	LinearEncoding,
	StaticDrawUsage,
	DynamicDrawUsage,
	TrianglesDrawMode
} from './constants.js';
import {
	Float64BufferAttribute,
	Float32BufferAttribute,
	Uint32BufferAttribute,
	Int32BufferAttribute,
	Uint16BufferAttribute,
	Int16BufferAttribute,
	Uint8ClampedBufferAttribute,
	Uint8BufferAttribute,
	Int8BufferAttribute,
	BufferAttribute
} from './core/BufferAttribute.js';
import { BufferGeometry } from './core/BufferGeometry.js';
import { InterleavedBuffer } from './core/InterleavedBuffer.js';
import { Object3D } from './core/Object3D.js';
import { Uniform } from './core/Uniform.js';
import { Curve } from './extras/core/Curve.js';
import { Path } from './extras/core/Path.js';
import { AxesHelper } from './helpers/AxesHelper.js';
import { BoxHelper } from './helpers/BoxHelper.js';
import { GridHelper } from './helpers/GridHelper.js';
import { SkeletonHelper } from './helpers/SkeletonHelper.js';
import { EdgesGeometry } from './geometries/EdgesGeometry.js';
import { ExtrudeGeometry } from './geometries/ExtrudeGeometry.js';
import { ShapeGeometry } from './geometries/ShapeGeometry.js';
import { WireframeGeometry } from './geometries/WireframeGeometry.js';
import { Light } from './lights/Light.js';
import { Loader } from './loaders/Loader.js';
import { LoaderUtils } from './loaders/LoaderUtils.js';
import { FileLoader } from './loaders/FileLoader.js';
import { AudioLoader } from './loaders/AudioLoader.js';
import { CubeTextureLoader } from './loaders/CubeTextureLoader.js';
import { DataTextureLoader } from './loaders/DataTextureLoader.js';
import { TextureLoader } from './loaders/TextureLoader.js';
import { Material } from './materials/Material.js';
import { LineBasicMaterial } from './materials/LineBasicMaterial.js';
import { PointsMaterial } from './materials/PointsMaterial.js';
import { ShaderMaterial } from './materials/ShaderMaterial.js';
import { Box2 } from './math/Box2.js';
import { Box3 } from './math/Box3.js';
import { Sphere } from './math/Sphere.js';
import { Color } from './math/Color.js';
import { Frustum } from './math/Frustum.js';
import { Line3 } from './math/Line3.js';
import * as MathUtils from './math/MathUtils.js';
import { Matrix3 } from './math/Matrix3.js';
import { Matrix4 } from './math/Matrix4.js';
import { Plane } from './math/Plane.js';
import { Quaternion } from './math/Quaternion.js';
import { Ray } from './math/Ray.js';
import { Triangle } from './math/Triangle.js';
import { Vector2 } from './math/Vector2.js';
import { Vector3 } from './math/Vector3.js';
import { Vector4 } from './math/Vector4.js';
import { Mesh } from './objects/Mesh.js';
import { LineSegments } from './objects/LineSegments.js';
import { Points } from './objects/Points.js';
import { Sprite } from './objects/Sprite.js';
import { SkinnedMesh } from './objects/SkinnedMesh.js';
import { WebGLRenderer } from './renderers/WebGLRenderer.js';
import { WebGLRenderTarget } from './renderers/WebGLRenderTarget.js';
import { WebGLCubeRenderTarget } from './renderers/WebGLCubeRenderTarget.js';
import { WebGLShadowMap } from './renderers/webgl/WebGLShadowMap.js';
import { ImageUtils } from './extras/ImageUtils.js';
import { Shape } from './extras/core/Shape.js';
import { CubeCamera } from './cameras/CubeCamera.js';
import { Scene } from './scenes/Scene.js';

export { MathUtils as Math };

export const LineStrip = 0;
export const LinePieces = 1;
export const NoColors = 0;
export const FaceColors = 1;
export const VertexColors = 2;

export function MeshFaceMaterial( materials ) {

	console.warn( 'THREE.MeshFaceMaterial has been removed. Use an Array instead.' );
	return materials;

}

export function MultiMaterial( materials = [] ) {

	console.warn( 'THREE.MultiMaterial has been removed. Use an Array instead.' );
	materials.isMultiMaterial = true;
	materials.materials = materials;
	materials.clone = function () {

		return materials.slice();

	};

	return materials;

}

export function PointCloud( geometry, material ) {

	console.warn( 'THREE.PointCloud has been renamed to THREE.Points.' );
	return new Points( geometry, material );

}

export function Particle( material ) {

	console.warn( 'THREE.Particle has been renamed to THREE.Sprite.' );
	return new Sprite( material );

}

export function ParticleSystem( geometry, material ) {

	console.warn( 'THREE.ParticleSystem has been renamed to THREE.Points.' );
	return new Points( geometry, material );

}

export function PointCloudMaterial( parameters ) {

	console.warn( 'THREE.PointCloudMaterial has been renamed to THREE.PointsMaterial.' );
	return new PointsMaterial( parameters );

}

export function ParticleBasicMaterial( parameters ) {

	console.warn( 'THREE.ParticleBasicMaterial has been renamed to THREE.PointsMaterial.' );
	return new PointsMaterial( parameters );

}

export function ParticleSystemMaterial( parameters ) {

	console.warn( 'THREE.ParticleSystemMaterial has been renamed to THREE.PointsMaterial.' );
	return new PointsMaterial( parameters );

}

export function Vertex( x, y, z ) {

	console.warn( 'THREE.Vertex has been removed. Use THREE.Vector3 instead.' );
	return new Vector3( x, y, z );

}

//

export function DynamicBufferAttribute( array, itemSize ) {

	console.warn( 'THREE.DynamicBufferAttribute has been removed. Use new THREE.BufferAttribute().setUsage( THREE.DynamicDrawUsage ) instead.' );
	return new BufferAttribute( array, itemSize ).setUsage( DynamicDrawUsage );

}

export function Int8Attribute( array, itemSize ) {

	console.warn( 'THREE.Int8Attribute has been removed. Use new THREE.Int8BufferAttribute() instead.' );
	return new Int8BufferAttribute( array, itemSize );

}

export function Uint8Attribute( array, itemSize ) {

	console.warn( 'THREE.Uint8Attribute has been removed. Use new THREE.Uint8BufferAttribute() instead.' );
	return new Uint8BufferAttribute( array, itemSize );

}

export function Uint8ClampedAttribute( array, itemSize ) {

	console.warn( 'THREE.Uint8ClampedAttribute has been removed. Use new THREE.Uint8ClampedBufferAttribute() instead.' );
	return new Uint8ClampedBufferAttribute( array, itemSize );

}

export function Int16Attribute( array, itemSize ) {

	console.warn( 'THREE.Int16Attribute has been removed. Use new THREE.Int16BufferAttribute() instead.' );
	return new Int16BufferAttribute( array, itemSize );

}

export function Uint16Attribute( array, itemSize ) {

	console.warn( 'THREE.Uint16Attribute has been removed. Use new THREE.Uint16BufferAttribute() instead.' );
	return new Uint16BufferAttribute( array, itemSize );

}

export function Int32Attribute( array, itemSize ) {

	console.warn( 'THREE.Int32Attribute has been removed. Use new THREE.Int32BufferAttribute() instead.' );
	return new Int32BufferAttribute( array, itemSize );

}

export function Uint32Attribute( array, itemSize ) {

	console.warn( 'THREE.Uint32Attribute has been removed. Use new THREE.Uint32BufferAttribute() instead.' );
	return new Uint32BufferAttribute( array, itemSize );

}

export function Float32Attribute( array, itemSize ) {

	console.warn( 'THREE.Float32Attribute has been removed. Use new THREE.Float32BufferAttribute() instead.' );
	return new Float32BufferAttribute( array, itemSize );

}

export function Float64Attribute( array, itemSize ) {

	console.warn( 'THREE.Float64Attribute has been removed. Use new THREE.Float64BufferAttribute() instead.' );
	return new Float64BufferAttribute( array, itemSize );

}

//

Curve.create = function ( construct, getPoint ) {

	console.log( 'THREE.Curve.create() has been deprecated' );

	construct.prototype = Object.create( Curve.prototype );
	construct.prototype.constructor = construct;
	construct.prototype.getPoint = getPoint;

	return construct;

};

//

Path.prototype.fromPoints = function ( points ) {

	console.warn( 'THREE.Path: .fromPoints() has been renamed to .setFromPoints().' );
	return this.setFromPoints( points );

};

//

export function AxisHelper( size ) {

	console.warn( 'THREE.AxisHelper has been renamed to THREE.AxesHelper.' );
	return new AxesHelper( size );

}

export function BoundingBoxHelper( object, color ) {

	console.warn( 'THREE.BoundingBoxHelper has been deprecated. Creating a THREE.BoxHelper instead.' );
	return new BoxHelper( object, color );

}

export function EdgesHelper( object, hex ) {

	console.warn( 'THREE.EdgesHelper has been removed. Use THREE.EdgesGeometry instead.' );
	return new LineSegments( new EdgesGeometry( object.geometry ), new LineBasicMaterial( { color: hex !== undefined ? hex : 0xffffff } ) );

}

GridHelper.prototype.setColors = function () {

	console.error( 'THREE.GridHelper: setColors() has been deprecated, pass them in the constructor instead.' );

};

SkeletonHelper.prototype.update = function () {

	console.error( 'THREE.SkeletonHelper: update() no longer needs to be called.' );

};

export function WireframeHelper( object, hex ) {

	console.warn( 'THREE.WireframeHelper has been removed. Use THREE.WireframeGeometry instead.' );
	return new LineSegments( new WireframeGeometry( object.geometry ), new LineBasicMaterial( { color: hex !== undefined ? hex : 0xffffff } ) );

}

//

Loader.prototype.extractUrlBase = function ( url ) {

	console.warn( 'THREE.Loader: .extractUrlBase() has been deprecated. Use THREE.LoaderUtils.extractUrlBase() instead.' );
	return LoaderUtils.extractUrlBase( url );

};

Loader.Handlers = {

	add: function ( /* regex, loader */ ) {

		console.error( 'THREE.Loader: Handlers.add() has been removed. Use LoadingManager.addHandler() instead.' );

	},

	get: function ( /* file */ ) {

		console.error( 'THREE.Loader: Handlers.get() has been removed. Use LoadingManager.getHandler() instead.' );

	}

};

export function XHRLoader( manager ) {

	console.warn( 'THREE.XHRLoader has been renamed to THREE.FileLoader.' );
	return new FileLoader( manager );

}

export function BinaryTextureLoader( manager ) {

	console.warn( 'THREE.BinaryTextureLoader has been renamed to THREE.DataTextureLoader.' );
	return new DataTextureLoader( manager );

}

//

Box2.prototype.center = function ( optionalTarget ) {

	console.warn( 'THREE.Box2: .center() has been renamed to .getCenter().' );
	return this.getCenter( optionalTarget );

};

Box2.prototype.empty = function () {

	console.warn( 'THREE.Box2: .empty() has been renamed to .isEmpty().' );
	return this.isEmpty();

};

Box2.prototype.isIntersectionBox = function ( box ) {

	console.warn( 'THREE.Box2: .isIntersectionBox() has been renamed to .intersectsBox().' );
	return this.intersectsBox( box );

};

Box2.prototype.size = function ( optionalTarget ) {

	console.warn( 'THREE.Box2: .size() has been renamed to .getSize().' );
	return this.getSize( optionalTarget );

};

//

Box3.prototype.center = function ( optionalTarget ) {

	console.warn( 'THREE.Box3: .center() has been renamed to .getCenter().' );
	return this.getCenter( optionalTarget );

};

Box3.prototype.empty = function () {

	console.warn( 'THREE.Box3: .empty() has been renamed to .isEmpty().' );
	return this.isEmpty();

};

Box3.prototype.isIntersectionBox = function ( box ) {

	console.warn( 'THREE.Box3: .isIntersectionBox() has been renamed to .intersectsBox().' );
	return this.intersectsBox( box );

};

Box3.prototype.isIntersectionSphere = function ( sphere ) {

	console.warn( 'THREE.Box3: .isIntersectionSphere() has been renamed to .intersectsSphere().' );
	return this.intersectsSphere( sphere );

};

Box3.prototype.size = function ( optionalTarget ) {

	console.warn( 'THREE.Box3: .size() has been renamed to .getSize().' );
	return this.getSize( optionalTarget );

};

//

Sphere.prototype.empty = function () {

	console.warn( 'THREE.Sphere: .empty() has been renamed to .isEmpty().' );
	return this.isEmpty();

};

//

Frustum.prototype.setFromMatrix = function ( m ) {

	console.warn( 'THREE.Frustum: .setFromMatrix() has been renamed to .setFromProjectionMatrix().' );
	return this.setFromProjectionMatrix( m );

};

//

Line3.prototype.center = function ( optionalTarget ) {

	console.warn( 'THREE.Line3: .center() has been renamed to .getCenter().' );
	return this.getCenter( optionalTarget );

};

//

Matrix3.prototype.flattenToArrayOffset = function ( array, offset ) {

	console.warn( 'THREE.Matrix3: .flattenToArrayOffset() has been deprecated. Use .toArray() instead.' );
	return this.toArray( array, offset );

};

Matrix3.prototype.multiplyVector3 = function ( vector ) {

	console.warn( 'THREE.Matrix3: .multiplyVector3() has been removed. Use vector.applyMatrix3( matrix ) instead.' );
	return vector.applyMatrix3( this );

};

Matrix3.prototype.multiplyVector3Array = function ( /* a */ ) {

	console.error( 'THREE.Matrix3: .multiplyVector3Array() has been removed.' );

};

Matrix3.prototype.applyToBufferAttribute = function ( attribute ) {

	console.warn( 'THREE.Matrix3: .applyToBufferAttribute() has been removed. Use attribute.applyMatrix3( matrix ) instead.' );
	return attribute.applyMatrix3( this );

};

Matrix3.prototype.applyToVector3Array = function ( /* array, offset, length */ ) {

	console.error( 'THREE.Matrix3: .applyToVector3Array() has been removed.' );

};

Matrix3.prototype.getInverse = function ( matrix ) {

	console.warn( 'THREE.Matrix3: .getInverse() has been removed. Use matrixInv.copy( matrix ).invert(); instead.' );
	return this.copy( matrix ).invert();

};

//

Matrix4.prototype.extractPosition = function ( m ) {

	console.warn( 'THREE.Matrix4: .extractPosition() has been renamed to .copyPosition().' );
	return this.copyPosition( m );

};

Matrix4.prototype.flattenToArrayOffset = function ( array, offset ) {

	console.warn( 'THREE.Matrix4: .flattenToArrayOffset() has been deprecated. Use .toArray() instead.' );
	return this.toArray( array, offset );

};

Matrix4.prototype.getPosition = function () {

	console.warn( 'THREE.Matrix4: .getPosition() has been removed. Use Vector3.setFromMatrixPosition( matrix ) instead.' );
	return new Vector3().setFromMatrixColumn( this, 3 );

};

Matrix4.prototype.setRotationFromQuaternion = function ( q ) {

	console.warn( 'THREE.Matrix4: .setRotationFromQuaternion() has been renamed to .makeRotationFromQuaternion().' );
	return this.makeRotationFromQuaternion( q );

};

Matrix4.prototype.multiplyToArray = function () {

	console.warn( 'THREE.Matrix4: .multiplyToArray() has been removed.' );

};

Matrix4.prototype.multiplyVector3 = function ( vector ) {

	console.warn( 'THREE.Matrix4: .multiplyVector3() has been removed. Use vector.applyMatrix4( matrix ) instead.' );
	return vector.applyMatrix4( this );

};

Matrix4.prototype.multiplyVector4 = function ( vector ) {

	console.warn( 'THREE.Matrix4: .multiplyVector4() has been removed. Use vector.applyMatrix4( matrix ) instead.' );
	return vector.applyMatrix4( this );

};

Matrix4.prototype.multiplyVector3Array = function ( /* a */ ) {

	console.error( 'THREE.Matrix4: .multiplyVector3Array() has been removed.' );

};

Matrix4.prototype.rotateAxis = function ( v ) {

	console.warn( 'THREE.Matrix4: .rotateAxis() has been removed. Use Vector3.transformDirection( matrix ) instead.' );
	v.transformDirection( this );

};

Matrix4.prototype.crossVector = function ( vector ) {

	console.warn( 'THREE.Matrix4: .crossVector() has been removed. Use vector.applyMatrix4( matrix ) instead.' );
	return vector.applyMatrix4( this );

};

Matrix4.prototype.translate = function () {

	console.error( 'THREE.Matrix4: .translate() has been removed.' );

};

Matrix4.prototype.rotateX = function () {

	console.error( 'THREE.Matrix4: .rotateX() has been removed.' );

};

Matrix4.prototype.rotateY = function () {

	console.error( 'THREE.Matrix4: .rotateY() has been removed.' );

};

Matrix4.prototype.rotateZ = function () {

	console.error( 'THREE.Matrix4: .rotateZ() has been removed.' );

};

Matrix4.prototype.rotateByAxis = function () {

	console.error( 'THREE.Matrix4: .rotateByAxis() has been removed.' );

};

Matrix4.prototype.applyToBufferAttribute = function ( attribute ) {

	console.warn( 'THREE.Matrix4: .applyToBufferAttribute() has been removed. Use attribute.applyMatrix4( matrix ) instead.' );
	return attribute.applyMatrix4( this );

};

Matrix4.prototype.applyToVector3Array = function ( /* array, offset, length */ ) {

	console.error( 'THREE.Matrix4: .applyToVector3Array() has been removed.' );

};

Matrix4.prototype.makeFrustum = function ( left, right, bottom, top, near, far ) {

	console.warn( 'THREE.Matrix4: .makeFrustum() has been removed. Use .makePerspective( left, right, top, bottom, near, far ) instead.' );
	return this.makePerspective( left, right, top, bottom, near, far );

};

Matrix4.prototype.getInverse = function ( matrix ) {

	console.warn( 'THREE.Matrix4: .getInverse() has been removed. Use matrixInv.copy( matrix ).invert(); instead.' );
	return this.copy( matrix ).invert();

};

//

Plane.prototype.isIntersectionLine = function ( line ) {

	console.warn( 'THREE.Plane: .isIntersectionLine() has been renamed to .intersectsLine().' );
	return this.intersectsLine( line );

};

//

Quaternion.prototype.multiplyVector3 = function ( vector ) {

	console.warn( 'THREE.Quaternion: .multiplyVector3() has been removed. Use is now vector.applyQuaternion( quaternion ) instead.' );
	return vector.applyQuaternion( this );

};

Quaternion.prototype.inverse = function ( ) {

	console.warn( 'THREE.Quaternion: .inverse() has been renamed to invert().' );
	return this.invert();

};

//

Ray.prototype.isIntersectionBox = function ( box ) {

	console.warn( 'THREE.Ray: .isIntersectionBox() has been renamed to .intersectsBox().' );
	return this.intersectsBox( box );

};

Ray.prototype.isIntersectionPlane = function ( plane ) {

	console.warn( 'THREE.Ray: .isIntersectionPlane() has been renamed to .intersectsPlane().' );
	return this.intersectsPlane( plane );

};

Ray.prototype.isIntersectionSphere = function ( sphere ) {

	console.warn( 'THREE.Ray: .isIntersectionSphere() has been renamed to .intersectsSphere().' );
	return this.intersectsSphere( sphere );

};

//

Triangle.prototype.area = function () {

	console.warn( 'THREE.Triangle: .area() has been renamed to .getArea().' );
	return this.getArea();

};

Triangle.prototype.barycoordFromPoint = function ( point, target ) {

	console.warn( 'THREE.Triangle: .barycoordFromPoint() has been renamed to .getBarycoord().' );
	return this.getBarycoord( point, target );

};

Triangle.prototype.midpoint = function ( target ) {

	console.warn( 'THREE.Triangle: .midpoint() has been renamed to .getMidpoint().' );
	return this.getMidpoint( target );

};

Triangle.prototypenormal = function ( target ) {

	console.warn( 'THREE.Triangle: .normal() has been renamed to .getNormal().' );
	return this.getNormal( target );

};

Triangle.prototype.plane = function ( target ) {

	console.warn( 'THREE.Triangle: .plane() has been renamed to .getPlane().' );
	return this.getPlane( target );

};

Triangle.barycoordFromPoint = function ( point, a, b, c, target ) {

	console.warn( 'THREE.Triangle: .barycoordFromPoint() has been renamed to .getBarycoord().' );
	return Triangle.getBarycoord( point, a, b, c, target );

};

Triangle.normal = function ( a, b, c, target ) {

	console.warn( 'THREE.Triangle: .normal() has been renamed to .getNormal().' );
	return Triangle.getNormal( a, b, c, target );

};

//

Shape.prototype.extractAllPoints = function ( divisions ) {

	console.warn( 'THREE.Shape: .extractAllPoints() has been removed. Use .extractPoints() instead.' );
	return this.extractPoints( divisions );

};

Shape.prototype.extrude = function ( options ) {

	console.warn( 'THREE.Shape: .extrude() has been removed. Use ExtrudeGeometry() instead.' );
	return new ExtrudeGeometry( this, options );

};

Shape.prototype.makeGeometry = function ( options ) {

	console.warn( 'THREE.Shape: .makeGeometry() has been removed. Use ShapeGeometry() instead.' );
	return new ShapeGeometry( this, options );

};

//

Vector2.prototype.fromAttribute = function ( attribute, index, offset ) {

	console.warn( 'THREE.Vector2: .fromAttribute() has been renamed to .fromBufferAttribute().' );
	return this.fromBufferAttribute( attribute, index, offset );

};

Vector2.prototype.distanceToManhattan = function ( v ) {

	console.warn( 'THREE.Vector2: .distanceToManhattan() has been renamed to .manhattanDistanceTo().' );
	return this.manhattanDistanceTo( v );

};

Vector2.prototype.lengthManhattan = function () {

	console.warn( 'THREE.Vector2: .lengthManhattan() has been renamed to .manhattanLength().' );
	return this.manhattanLength();

};

//

Vector3.prototype.setEulerFromRotationMatrix = function () {

	console.error( 'THREE.Vector3: .setEulerFromRotationMatrix() has been removed. Use Euler.setFromRotationMatrix() instead.' );

};

Vector3.prototype.setEulerFromQuaternion = function () {

	console.error( 'THREE.Vector3: .setEulerFromQuaternion() has been removed. Use Euler.setFromQuaternion() instead.' );

};

Vector3.prototype.getPositionFromMatrix = function ( m ) {

	console.warn( 'THREE.Vector3: .getPositionFromMatrix() has been renamed to .setFromMatrixPosition().' );
	return this.setFromMatrixPosition( m );

};

Vector3.prototype.getScaleFromMatrix = function ( m ) {

	console.warn( 'THREE.Vector3: .getScaleFromMatrix() has been renamed to .setFromMatrixScale().' );
	return this.setFromMatrixScale( m );

};

Vector3.prototype.getColumnFromMatrix = function ( index, matrix ) {

	console.warn( 'THREE.Vector3: .getColumnFromMatrix() has been renamed to .setFromMatrixColumn().' );
	return this.setFromMatrixColumn( matrix, index );

};

Vector3.prototype.applyProjection = function ( m ) {

	console.warn( 'THREE.Vector3: .applyProjection() has been removed. Use .applyMatrix4( m ) instead.' );
	return this.applyMatrix4( m );

};

Vector3.prototype.fromAttribute = function ( attribute, index, offset ) {

	console.warn( 'THREE.Vector3: .fromAttribute() has been renamed to .fromBufferAttribute().' );
	return this.fromBufferAttribute( attribute, index, offset );

};

Vector3.prototype.distanceToManhattan = function ( v ) {

	console.warn( 'THREE.Vector3: .distanceToManhattan() has been renamed to .manhattanDistanceTo().' );
	return this.manhattanDistanceTo( v );

};

Vector3.prototype.lengthManhattan = function () {

	console.warn( 'THREE.Vector3: .lengthManhattan() has been renamed to .manhattanLength().' );
	return this.manhattanLength();

};

//

Vector4.prototype.fromAttribute = function ( attribute, index, offset ) {

	console.warn( 'THREE.Vector4: .fromAttribute() has been renamed to .fromBufferAttribute().' );
	return this.fromBufferAttribute( attribute, index, offset );

};

Vector4.prototype.lengthManhattan = function () {

	console.warn( 'THREE.Vector4: .lengthManhattan() has been renamed to .manhattanLength().' );
	return this.manhattanLength();

};

//

Object3D.prototype.getChildByName = function ( name ) {

	console.warn( 'THREE.Object3D: .getChildByName() has been renamed to .getObjectByName().' );
	return this.getObjectByName( name );

};

Object3D.prototype.renderDepth = function () {

	console.warn( 'THREE.Object3D: .renderDepth has been removed. Use .renderOrder, instead.' );

};

Object3D.prototype.translate = function ( distance, axis ) {

	console.warn( 'THREE.Object3D: .translate() has been removed. Use .translateOnAxis( axis, distance ) instead.' );
	return this.translateOnAxis( axis, distance );

};

Object3D.prototype.getWorldRotation = function () {

	console.error( 'THREE.Object3D: .getWorldRotation() has been removed. Use THREE.Object3D.getWorldQuaternion( target ) instead.' );

};

Object3D.prototype.applyMatrix = function ( matrix ) {

	console.warn( 'THREE.Object3D: .applyMatrix() has been renamed to .applyMatrix4().' );
	return this.applyMatrix4( matrix );

};

Object.defineProperties( Object3D.prototype, {

	eulerOrder: {
		get: function () {

			console.warn( 'THREE.Object3D: .eulerOrder is now .rotation.order.' );
			return this.rotation.order;

		},
		set: function ( value ) {

			console.warn( 'THREE.Object3D: .eulerOrder is now .rotation.order.' );
			this.rotation.order = value;

		}
	},
	useQuaternion: {
		get: function () {

			console.warn( 'THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.' );

		},
		set: function () {

			console.warn( 'THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.' );

		}
	}

} );

Mesh.prototype.setDrawMode = function () {

	console.error( 'THREE.Mesh: .setDrawMode() has been removed. The renderer now always assumes THREE.TrianglesDrawMode. Transform your geometry via BufferGeometryUtils.toTrianglesDrawMode() if necessary.' );

};

Object.defineProperties( Mesh.prototype, {

	drawMode: {
		get: function () {

			console.error( 'THREE.Mesh: .drawMode has been removed. The renderer now always assumes THREE.TrianglesDrawMode.' );
			return TrianglesDrawMode;

		},
		set: function () {

			console.error( 'THREE.Mesh: .drawMode has been removed. The renderer now always assumes THREE.TrianglesDrawMode. Transform your geometry via BufferGeometryUtils.toTrianglesDrawMode() if necessary.' );

		}
	}

} );

SkinnedMesh.prototype.initBones = function () {

	console.error( 'THREE.SkinnedMesh: initBones() has been removed.' );

};

//

PerspectiveCamera.prototype.setLens = function ( focalLength, filmGauge ) {

	console.warn( 'THREE.PerspectiveCamera.setLens is deprecated. ' +
			'Use .setFocalLength and .filmGauge for a photographic setup.' );

	if ( filmGauge !== undefined ) this.filmGauge = filmGauge;
	this.setFocalLength( focalLength );

};

//

Object.defineProperties( Light.prototype, {
	onlyShadow: {
		set: function () {

			console.warn( 'THREE.Light: .onlyShadow has been removed.' );

		}
	},
	shadowCameraFov: {
		set: function ( value ) {

			console.warn( 'THREE.Light: .shadowCameraFov is now .shadow.camera.fov.' );
			this.shadow.camera.fov = value;

		}
	},
	shadowCameraLeft: {
		set: function ( value ) {

			console.warn( 'THREE.Light: .shadowCameraLeft is now .shadow.camera.left.' );
			this.shadow.camera.left = value;

		}
	},
	shadowCameraRight: {
		set: function ( value ) {

			console.warn( 'THREE.Light: .shadowCameraRight is now .shadow.camera.right.' );
			this.shadow.camera.right = value;

		}
	},
	shadowCameraTop: {
		set: function ( value ) {

			console.warn( 'THREE.Light: .shadowCameraTop is now .shadow.camera.top.' );
			this.shadow.camera.top = value;

		}
	},
	shadowCameraBottom: {
		set: function ( value ) {

			console.warn( 'THREE.Light: .shadowCameraBottom is now .shadow.camera.bottom.' );
			this.shadow.camera.bottom = value;

		}
	},
	shadowCameraNear: {
		set: function ( value ) {

			console.warn( 'THREE.Light: .shadowCameraNear is now .shadow.camera.near.' );
			this.shadow.camera.near = value;

		}
	},
	shadowCameraFar: {
		set: function ( value ) {

			console.warn( 'THREE.Light: .shadowCameraFar is now .shadow.camera.far.' );
			this.shadow.camera.far = value;

		}
	},
	shadowCameraVisible: {
		set: function () {

			console.warn( 'THREE.Light: .shadowCameraVisible has been removed. Use new THREE.CameraHelper( light.shadow.camera ) instead.' );

		}
	},
	shadowBias: {
		set: function ( value ) {

			console.warn( 'THREE.Light: .shadowBias is now .shadow.bias.' );
			this.shadow.bias = value;

		}
	},
	shadowDarkness: {
		set: function () {

			console.warn( 'THREE.Light: .shadowDarkness has been removed.' );

		}
	},
	shadowMapWidth: {
		set: function ( value ) {

			console.warn( 'THREE.Light: .shadowMapWidth is now .shadow.mapSize.width.' );
			this.shadow.mapSize.width = value;

		}
	},
	shadowMapHeight: {
		set: function ( value ) {

			console.warn( 'THREE.Light: .shadowMapHeight is now .shadow.mapSize.height.' );
			this.shadow.mapSize.height = value;

		}
	}
} );

//

Object.defineProperties( BufferAttribute.prototype, {

	length: {
		get: function () {

			console.warn( 'THREE.BufferAttribute: .length has been deprecated. Use .count instead.' );
			return this.array.length;

		}
	},
	dynamic: {
		get: function () {

			console.warn( 'THREE.BufferAttribute: .dynamic has been deprecated. Use .usage instead.' );
			return this.usage === DynamicDrawUsage;

		},
		set: function ( /* value */ ) {

			console.warn( 'THREE.BufferAttribute: .dynamic has been deprecated. Use .usage instead.' );
			this.setUsage( DynamicDrawUsage );

		}
	}

} );

BufferAttribute.prototype.setDynamic = function ( value ) {

	console.warn( 'THREE.BufferAttribute: .setDynamic() has been deprecated. Use .setUsage() instead.' );
	this.setUsage( value === true ? DynamicDrawUsage : StaticDrawUsage );
	return this;

};

BufferAttribute.prototype.copyIndicesArray = function ( /* indices */ ) {

	console.error( 'THREE.BufferAttribute: .copyIndicesArray() has been removed.' );

},

BufferAttribute.prototype.setArray = function ( /* array */ ) {

	console.error( 'THREE.BufferAttribute: .setArray has been removed. Use BufferGeometry .setAttribute to replace/resize attribute buffers' );

};

//

BufferGeometry.prototype.addIndex = function ( index ) {

	console.warn( 'THREE.BufferGeometry: .addIndex() has been renamed to .setIndex().' );
	this.setIndex( index );

};

BufferGeometry.prototype.addAttribute = function ( name, attribute ) {

	console.warn( 'THREE.BufferGeometry: .addAttribute() has been renamed to .setAttribute().' );

	if ( ! ( attribute && attribute.isBufferAttribute ) && ! ( attribute && attribute.isInterleavedBufferAttribute ) ) {

		console.warn( 'THREE.BufferGeometry: .addAttribute() now expects ( name, attribute ).' );

		return this.setAttribute( name, new BufferAttribute( arguments[ 1 ], arguments[ 2 ] ) );

	}

	if ( name === 'index' ) {

		console.warn( 'THREE.BufferGeometry.addAttribute: Use .setIndex() for index attribute.' );
		this.setIndex( attribute );

		return this;

	}

	return this.setAttribute( name, attribute );

};

BufferGeometry.prototype.addDrawCall = function ( start, count, indexOffset ) {

	if ( indexOffset !== undefined ) {

		console.warn( 'THREE.BufferGeometry: .addDrawCall() no longer supports indexOffset.' );

	}

	console.warn( 'THREE.BufferGeometry: .addDrawCall() is now .addGroup().' );
	this.addGroup( start, count );

};

BufferGeometry.prototype.clearDrawCalls = function () {

	console.warn( 'THREE.BufferGeometry: .clearDrawCalls() is now .clearGroups().' );
	this.clearGroups();

};

BufferGeometry.prototype.computeOffsets = function () {

	console.warn( 'THREE.BufferGeometry: .computeOffsets() has been removed.' );

};

BufferGeometry.prototype.removeAttribute = function ( name ) {

	console.warn( 'THREE.BufferGeometry: .removeAttribute() has been renamed to .deleteAttribute().' );

	return this.deleteAttribute( name );

};

BufferGeometry.prototype.applyMatrix = function ( matrix ) {

	console.warn( 'THREE.BufferGeometry: .applyMatrix() has been renamed to .applyMatrix4().' );
	return this.applyMatrix4( matrix );

};

Object.defineProperties( BufferGeometry.prototype, {

	drawcalls: {
		get: function () {

			console.error( 'THREE.BufferGeometry: .drawcalls has been renamed to .groups.' );
			return this.groups;

		}
	},
	offsets: {
		get: function () {

			console.warn( 'THREE.BufferGeometry: .offsets has been renamed to .groups.' );
			return this.groups;

		}
	}

} );

InterleavedBuffer.prototype.setDynamic = function ( value ) {

	console.warn( 'THREE.InterleavedBuffer: .setDynamic() has been deprecated. Use .setUsage() instead.' );
	this.setUsage( value === true ? DynamicDrawUsage : StaticDrawUsage );
	return this;

};

InterleavedBuffer.prototype.setArray = function ( /* array */ ) {

	console.error( 'THREE.InterleavedBuffer: .setArray has been removed. Use BufferGeometry .setAttribute to replace/resize attribute buffers' );

};

//

ExtrudeGeometry.prototype.getArrays = function () {

	console.error( 'THREE.ExtrudeGeometry: .getArrays() has been removed.' );

};

ExtrudeGeometry.prototype.addShapeList = function () {

	console.error( 'THREE.ExtrudeGeometry: .addShapeList() has been removed.' );

};

ExtrudeGeometry.prototype.addShape = function () {

	console.error( 'THREE.ExtrudeGeometry: .addShape() has been removed.' );

};

//

Scene.prototype.dispose = function () {

	console.error( 'THREE.Scene: .dispose() has been removed.' );

};

//

Uniform.prototype.onUpdate = function () {

	console.warn( 'THREE.Uniform: .onUpdate() has been removed. Use object.onBeforeRender() instead.' );
	return this;

};

//

Object.defineProperties( Material.prototype, {

	wrapAround: {
		get: function () {

			console.warn( 'THREE.Material: .wrapAround has been removed.' );

		},
		set: function () {

			console.warn( 'THREE.Material: .wrapAround has been removed.' );

		}
	},

	overdraw: {
		get: function () {

			console.warn( 'THREE.Material: .overdraw has been removed.' );

		},
		set: function () {

			console.warn( 'THREE.Material: .overdraw has been removed.' );

		}
	},

	wrapRGB: {
		get: function () {

			console.warn( 'THREE.Material: .wrapRGB has been removed.' );
			return new Color();

		}
	},

	shading: {
		get: function () {

			console.error( 'THREE.' + this.type + ': .shading has been removed. Use the boolean .flatShading instead.' );

		},
		set: function ( value ) {

			console.warn( 'THREE.' + this.type + ': .shading has been removed. Use the boolean .flatShading instead.' );
			this.flatShading = ( value === FlatShading );

		}
	},

	stencilMask: {
		get: function () {

			console.warn( 'THREE.' + this.type + ': .stencilMask has been removed. Use .stencilFuncMask instead.' );
			return this.stencilFuncMask;

		},
		set: function ( value ) {

			console.warn( 'THREE.' + this.type + ': .stencilMask has been removed. Use .stencilFuncMask instead.' );
			this.stencilFuncMask = value;

		}
	}

} );

Object.defineProperties( ShaderMaterial.prototype, {

	derivatives: {
		get: function () {

			console.warn( 'THREE.ShaderMaterial: .derivatives has been moved to .extensions.derivatives.' );
			return this.extensions.derivatives;

		},
		set: function ( value ) {

			console.warn( 'THREE. ShaderMaterial: .derivatives has been moved to .extensions.derivatives.' );
			this.extensions.derivatives = value;

		}
	}

} );

//

WebGLRenderer.prototype.clearTarget = function ( renderTarget, color, depth, stencil ) {

	console.warn( 'THREE.WebGLRenderer: .clearTarget() has been deprecated. Use .setRenderTarget() and .clear() instead.' );
	this.setRenderTarget( renderTarget );
	this.clear( color, depth, stencil );

};

WebGLRenderer.prototype.animate = function ( callback ) {

	console.warn( 'THREE.WebGLRenderer: .animate() is now .setAnimationLoop().' );
	this.setAnimationLoop( callback );

};

WebGLRenderer.prototype.getCurrentRenderTarget = function () {

	console.warn( 'THREE.WebGLRenderer: .getCurrentRenderTarget() is now .getRenderTarget().' );
	return this.getRenderTarget();

};

WebGLRenderer.prototype.getMaxAnisotropy = function () {

	console.warn( 'THREE.WebGLRenderer: .getMaxAnisotropy() is now .capabilities.getMaxAnisotropy().' );
	return this.capabilities.getMaxAnisotropy();

};

WebGLRenderer.prototype.getPrecision = function () {

	console.warn( 'THREE.WebGLRenderer: .getPrecision() is now .capabilities.precision.' );
	return this.capabilities.precision;

};

WebGLRenderer.prototype.resetGLState = function () {

	console.warn( 'THREE.WebGLRenderer: .resetGLState() is now .state.reset().' );
	return this.state.reset();

};

WebGLRenderer.prototype.supportsFloatTextures = function () {

	console.warn( 'THREE.WebGLRenderer: .supportsFloatTextures() is now .extensions.get( \'OES_texture_float\' ).' );
	return this.extensions.get( 'OES_texture_float' );

};

WebGLRenderer.prototype.supportsHalfFloatTextures = function () {

	console.warn( 'THREE.WebGLRenderer: .supportsHalfFloatTextures() is now .extensions.get( \'OES_texture_half_float\' ).' );
	return this.extensions.get( 'OES_texture_half_float' );

};

WebGLRenderer.prototype.supportsStandardDerivatives = function () {

	console.warn( 'THREE.WebGLRenderer: .supportsStandardDerivatives() is now .extensions.get( \'OES_standard_derivatives\' ).' );
	return this.extensions.get( 'OES_standard_derivatives' );

};

WebGLRenderer.prototype.supportsCompressedTextureS3TC = function () {

	console.warn( 'THREE.WebGLRenderer: .supportsCompressedTextureS3TC() is now .extensions.get( \'WEBGL_compressed_texture_s3tc\' ).' );
	return this.extensions.get( 'WEBGL_compressed_texture_s3tc' );

};

WebGLRenderer.prototype.supportsCompressedTexturePVRTC = function () {

	console.warn( 'THREE.WebGLRenderer: .supportsCompressedTexturePVRTC() is now .extensions.get( \'WEBGL_compressed_texture_pvrtc\' ).' );
	return this.extensions.get( 'WEBGL_compressed_texture_pvrtc' );

};

WebGLRenderer.prototype.supportsBlendMinMax = function () {

	console.warn( 'THREE.WebGLRenderer: .supportsBlendMinMax() is now .extensions.get( \'EXT_blend_minmax\' ).' );
	return this.extensions.get( 'EXT_blend_minmax' );

};

WebGLRenderer.prototype.supportsVertexTextures = function () {

	console.warn( 'THREE.WebGLRenderer: .supportsVertexTextures() is now .capabilities.vertexTextures.' );
	return this.capabilities.vertexTextures;

};

WebGLRenderer.prototype.supportsInstancedArrays = function () {

	console.warn( 'THREE.WebGLRenderer: .supportsInstancedArrays() is now .extensions.get( \'ANGLE_instanced_arrays\' ).' );
	return this.extensions.get( 'ANGLE_instanced_arrays' );

};

WebGLRenderer.prototype.enableScissorTest = function ( boolean ) {

	console.warn( 'THREE.WebGLRenderer: .enableScissorTest() is now .setScissorTest().' );
	this.setScissorTest( boolean );

};

WebGLRenderer.prototype.initMaterial = function () {

	console.warn( 'THREE.WebGLRenderer: .initMaterial() has been removed.' );

};

WebGLRenderer.prototype.addPrePlugin = function () {

	console.warn( 'THREE.WebGLRenderer: .addPrePlugin() has been removed.' );

};

WebGLRenderer.prototype.addPostPlugin = function () {

	console.warn( 'THREE.WebGLRenderer: .addPostPlugin() has been removed.' );

};

WebGLRenderer.prototype.updateShadowMap = function () {

	console.warn( 'THREE.WebGLRenderer: .updateShadowMap() has been removed.' );

};

WebGLRenderer.prototype.setFaceCulling = function () {

	console.warn( 'THREE.WebGLRenderer: .setFaceCulling() has been removed.' );

};

WebGLRenderer.prototype.allocTextureUnit = function () {

	console.warn( 'THREE.WebGLRenderer: .allocTextureUnit() has been removed.' );

};

WebGLRenderer.prototype.setTexture = function () {

	console.warn( 'THREE.WebGLRenderer: .setTexture() has been removed.' );

};

WebGLRenderer.prototype.setTexture2D = function () {

	console.warn( 'THREE.WebGLRenderer: .setTexture2D() has been removed.' );

};

WebGLRenderer.prototype.setTextureCube = function () {

	console.warn( 'THREE.WebGLRenderer: .setTextureCube() has been removed.' );

};

WebGLRenderer.prototype.getActiveMipMapLevel = function () {

	console.warn( 'THREE.WebGLRenderer: .getActiveMipMapLevel() is now .getActiveMipmapLevel().' );
	return this.getActiveMipmapLevel();

};

Object.defineProperties( WebGLRenderer.prototype, {

	shadowMapEnabled: {
		get: function () {

			return this.shadowMap.enabled;

		},
		set: function ( value ) {

			console.warn( 'THREE.WebGLRenderer: .shadowMapEnabled is now .shadowMap.enabled.' );
			this.shadowMap.enabled = value;

		}
	},
	shadowMapType: {
		get: function () {

			return this.shadowMap.type;

		},
		set: function ( value ) {

			console.warn( 'THREE.WebGLRenderer: .shadowMapType is now .shadowMap.type.' );
			this.shadowMap.type = value;

		}
	},
	shadowMapCullFace: {
		get: function () {

			console.warn( 'THREE.WebGLRenderer: .shadowMapCullFace has been removed. Set Material.shadowSide instead.' );
			return undefined;

		},
		set: function ( /* value */ ) {

			console.warn( 'THREE.WebGLRenderer: .shadowMapCullFace has been removed. Set Material.shadowSide instead.' );

		}
	},
	context: {
		get: function () {

			console.warn( 'THREE.WebGLRenderer: .context has been removed. Use .getContext() instead.' );
			return this.getContext();

		}
	},
	vr: {
		get: function () {

			console.warn( 'THREE.WebGLRenderer: .vr has been renamed to .xr' );
			return this.xr;

		}
	},
	gammaInput: {
		get: function () {

			console.warn( 'THREE.WebGLRenderer: .gammaInput has been removed. Set the encoding for textures via Texture.encoding instead.' );
			return false;

		},
		set: function () {

			console.warn( 'THREE.WebGLRenderer: .gammaInput has been removed. Set the encoding for textures via Texture.encoding instead.' );

		}
	},
	gammaOutput: {
		get: function () {

			console.warn( 'THREE.WebGLRenderer: .gammaOutput has been removed. Set WebGLRenderer.outputEncoding instead.' );
			return false;

		},
		set: function ( value ) {

			console.warn( 'THREE.WebGLRenderer: .gammaOutput has been removed. Set WebGLRenderer.outputEncoding instead.' );
			this.outputEncoding = ( value === true ) ? sRGBEncoding : LinearEncoding;

		}
	},
	toneMappingWhitePoint: {
		get: function () {

			console.warn( 'THREE.WebGLRenderer: .toneMappingWhitePoint has been removed.' );
			return 1.0;

		},
		set: function () {

			console.warn( 'THREE.WebGLRenderer: .toneMappingWhitePoint has been removed.' );

		}
	},

} );

Object.defineProperties( WebGLShadowMap.prototype, {

	cullFace: {
		get: function () {

			console.warn( 'THREE.WebGLRenderer: .shadowMap.cullFace has been removed. Set Material.shadowSide instead.' );
			return undefined;

		},
		set: function ( /* cullFace */ ) {

			console.warn( 'THREE.WebGLRenderer: .shadowMap.cullFace has been removed. Set Material.shadowSide instead.' );

		}
	},
	renderReverseSided: {
		get: function () {

			console.warn( 'THREE.WebGLRenderer: .shadowMap.renderReverseSided has been removed. Set Material.shadowSide instead.' );
			return undefined;

		},
		set: function () {

			console.warn( 'THREE.WebGLRenderer: .shadowMap.renderReverseSided has been removed. Set Material.shadowSide instead.' );

		}
	},
	renderSingleSided: {
		get: function () {

			console.warn( 'THREE.WebGLRenderer: .shadowMap.renderSingleSided has been removed. Set Material.shadowSide instead.' );
			return undefined;

		},
		set: function () {

			console.warn( 'THREE.WebGLRenderer: .shadowMap.renderSingleSided has been removed. Set Material.shadowSide instead.' );

		}
	}

} );

export function WebGLRenderTargetCube( width, height, options ) {

	console.warn( 'THREE.WebGLRenderTargetCube( width, height, options ) is now WebGLCubeRenderTarget( size, options ).' );
	return new WebGLCubeRenderTarget( width, options );

}

//

Object.defineProperties( WebGLRenderTarget.prototype, {

	wrapS: {
		get: function () {

			console.warn( 'THREE.WebGLRenderTarget: .wrapS is now .texture.wrapS.' );
			return this.texture.wrapS;

		},
		set: function ( value ) {

			console.warn( 'THREE.WebGLRenderTarget: .wrapS is now .texture.wrapS.' );
			this.texture.wrapS = value;

		}
	},
	wrapT: {
		get: function () {

			console.warn( 'THREE.WebGLRenderTarget: .wrapT is now .texture.wrapT.' );
			return this.texture.wrapT;

		},
		set: function ( value ) {

			console.warn( 'THREE.WebGLRenderTarget: .wrapT is now .texture.wrapT.' );
			this.texture.wrapT = value;

		}
	},
	magFilter: {
		get: function () {

			console.warn( 'THREE.WebGLRenderTarget: .magFilter is now .texture.magFilter.' );
			return this.texture.magFilter;

		},
		set: function ( value ) {

			console.warn( 'THREE.WebGLRenderTarget: .magFilter is now .texture.magFilter.' );
			this.texture.magFilter = value;

		}
	},
	minFilter: {
		get: function () {

			console.warn( 'THREE.WebGLRenderTarget: .minFilter is now .texture.minFilter.' );
			return this.texture.minFilter;

		},
		set: function ( value ) {

			console.warn( 'THREE.WebGLRenderTarget: .minFilter is now .texture.minFilter.' );
			this.texture.minFilter = value;

		}
	},
	anisotropy: {
		get: function () {

			console.warn( 'THREE.WebGLRenderTarget: .anisotropy is now .texture.anisotropy.' );
			return this.texture.anisotropy;

		},
		set: function ( value ) {

			console.warn( 'THREE.WebGLRenderTarget: .anisotropy is now .texture.anisotropy.' );
			this.texture.anisotropy = value;

		}
	},
	offset: {
		get: function () {

			console.warn( 'THREE.WebGLRenderTarget: .offset is now .texture.offset.' );
			return this.texture.offset;

		},
		set: function ( value ) {

			console.warn( 'THREE.WebGLRenderTarget: .offset is now .texture.offset.' );
			this.texture.offset = value;

		}
	},
	repeat: {
		get: function () {

			console.warn( 'THREE.WebGLRenderTarget: .repeat is now .texture.repeat.' );
			return this.texture.repeat;

		},
		set: function ( value ) {

			console.warn( 'THREE.WebGLRenderTarget: .repeat is now .texture.repeat.' );
			this.texture.repeat = value;

		}
	},
	format: {
		get: function () {

			console.warn( 'THREE.WebGLRenderTarget: .format is now .texture.format.' );
			return this.texture.format;

		},
		set: function ( value ) {

			console.warn( 'THREE.WebGLRenderTarget: .format is now .texture.format.' );
			this.texture.format = value;

		}
	},
	type: {
		get: function () {

			console.warn( 'THREE.WebGLRenderTarget: .type is now .texture.type.' );
			return this.texture.type;

		},
		set: function ( value ) {

			console.warn( 'THREE.WebGLRenderTarget: .type is now .texture.type.' );
			this.texture.type = value;

		}
	},
	generateMipmaps: {
		get: function () {

			console.warn( 'THREE.WebGLRenderTarget: .generateMipmaps is now .texture.generateMipmaps.' );
			return this.texture.generateMipmaps;

		},
		set: function ( value ) {

			console.warn( 'THREE.WebGLRenderTarget: .generateMipmaps is now .texture.generateMipmaps.' );
			this.texture.generateMipmaps = value;

		}
	}

} );

//

Audio.prototype.load = function ( file ) {

	console.warn( 'THREE.Audio: .load has been deprecated. Use THREE.AudioLoader instead.' );
	const scope = this;
	const audioLoader = new AudioLoader();
	audioLoader.load( file, function ( buffer ) {

		scope.setBuffer( buffer );

	} );
	return this;

};


AudioAnalyser.prototype.getData = function () {

	console.warn( 'THREE.AudioAnalyser: .getData() is now .getFrequencyData().' );
	return this.getFrequencyData();

};

//

CubeCamera.prototype.updateCubeMap = function ( renderer, scene ) {

	console.warn( 'THREE.CubeCamera: .updateCubeMap() is now .update().' );
	return this.update( renderer, scene );

};

CubeCamera.prototype.clear = function ( renderer, color, depth, stencil ) {

	console.warn( 'THREE.CubeCamera: .clear() is now .renderTarget.clear().' );
	return this.renderTarget.clear( renderer, color, depth, stencil );

};

ImageUtils.crossOrigin = undefined;

ImageUtils.loadTexture = function ( url, mapping, onLoad, onError ) {

	console.warn( 'THREE.ImageUtils.loadTexture has been deprecated. Use THREE.TextureLoader() instead.' );

	const loader = new TextureLoader();
	loader.setCrossOrigin( this.crossOrigin );

	const texture = loader.load( url, onLoad, undefined, onError );

	if ( mapping ) texture.mapping = mapping;

	return texture;

};

ImageUtils.loadTextureCube = function ( urls, mapping, onLoad, onError ) {

	console.warn( 'THREE.ImageUtils.loadTextureCube has been deprecated. Use THREE.CubeTextureLoader() instead.' );

	const loader = new CubeTextureLoader();
	loader.setCrossOrigin( this.crossOrigin );

	const texture = loader.load( urls, onLoad, undefined, onError );

	if ( mapping ) texture.mapping = mapping;

	return texture;

};

ImageUtils.loadCompressedTexture = function () {

	console.error( 'THREE.ImageUtils.loadCompressedTexture has been removed. Use THREE.DDSLoader instead.' );

};

ImageUtils.loadCompressedTextureCube = function () {

	console.error( 'THREE.ImageUtils.loadCompressedTextureCube has been removed. Use THREE.DDSLoader instead.' );

};

//

export function CanvasRenderer() {

	console.error( 'THREE.CanvasRenderer has been removed' );

}

//

export function JSONLoader() {

	console.error( 'THREE.JSONLoader has been removed.' );

}

//

export const SceneUtils = {

	createMultiMaterialObject: function ( /* geometry, materials */ ) {

		console.error( 'THREE.SceneUtils has been moved to /examples/jsm/utils/SceneUtils.js' );

	},

	detach: function ( /* child, parent, scene */ ) {

		console.error( 'THREE.SceneUtils has been moved to /examples/jsm/utils/SceneUtils.js' );

	},

	attach: function ( /* child, scene, parent */ ) {

		console.error( 'THREE.SceneUtils has been moved to /examples/jsm/utils/SceneUtils.js' );

	}

};

//

export function LensFlare() {

	console.error( 'THREE.LensFlare has been moved to /examples/jsm/objects/Lensflare.js' );

}
