/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Audio } from './audio/Audio.js';
import { AudioAnalyser } from './audio/AudioAnalyser.js';
import { PerspectiveCamera } from './cameras/PerspectiveCamera.js';
import { FlatShading } from './constants.js';
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
import { Face3 } from './core/Face3.js';
import { Geometry } from './core/Geometry.js';
import { Object3D } from './core/Object3D.js';
import { Uniform } from './core/Uniform.js';
import { Curve } from './extras/core/Curve.js';
import { CurvePath } from './extras/core/CurvePath.js';
import { Path } from './extras/core/Path.js';
import { CatmullRomCurve3 } from './extras/curves/CatmullRomCurve3.js';
import { AxesHelper } from './helpers/AxesHelper.js';
import { BoxHelper } from './helpers/BoxHelper.js';
import { GridHelper } from './helpers/GridHelper.js';
import { SkeletonHelper } from './helpers/SkeletonHelper.js';
import { BoxGeometry } from './geometries/BoxGeometry.js';
import { EdgesGeometry } from './geometries/EdgesGeometry.js';
import { ExtrudeGeometry } from './geometries/ExtrudeGeometry.js';
import { ExtrudeBufferGeometry } from './geometries/ExtrudeGeometry.js';
import { ShapeGeometry } from './geometries/ShapeGeometry.js';
import { WireframeGeometry } from './geometries/WireframeGeometry.js';
import { Light } from './lights/Light.js';
import { Loader } from './loaders/Loader.js';
import { LoaderUtils } from './loaders/LoaderUtils.js';
import { FileLoader } from './loaders/FileLoader.js';
import { AudioLoader } from './loaders/AudioLoader.js';
import { CubeTextureLoader } from './loaders/CubeTextureLoader.js';
import { DataTextureLoader } from './loaders/DataTextureLoader.js';
import { ObjectLoader } from './loaders/ObjectLoader.js';
import { TextureLoader } from './loaders/TextureLoader.js';
import { Material } from './materials/Material.js';
import { LineBasicMaterial } from './materials/LineBasicMaterial.js';
import { MeshPhongMaterial } from './materials/MeshPhongMaterial.js';
import { PointsMaterial } from './materials/PointsMaterial.js';
import { ShaderMaterial } from './materials/ShaderMaterial.js';
import { Box2 } from './math/Box2.js';
import { Box3 } from './math/Box3.js';
import { Color } from './math/Color.js';
import { Line3 } from './math/Line3.js';
import { _Math } from './math/Math.js';
import { Matrix3 } from './math/Matrix3.js';
import { Matrix4 } from './math/Matrix4.js';
import { Plane } from './math/Plane.js';
import { Quaternion } from './math/Quaternion.js';
import { Ray } from './math/Ray.js';
import { Triangle } from './math/Triangle.js';
import { Vector2 } from './math/Vector2.js';
import { Vector3 } from './math/Vector3.js';
import { Vector4 } from './math/Vector4.js';
import { LineSegments } from './objects/LineSegments.js';
import { LOD } from './objects/LOD.js';
import { Points } from './objects/Points.js';
import { Sprite } from './objects/Sprite.js';
import { Skeleton } from './objects/Skeleton.js';
import { SkinnedMesh } from './objects/SkinnedMesh.js';
import { WebGLRenderer } from './renderers/WebGLRenderer.js';
import { WebGLRenderTarget } from './renderers/WebGLRenderTarget.js';
import { WebGLRenderTargetCube } from './renderers/WebGLRenderTargetCube.js';
import { WebGLShadowMap } from './renderers/webgl/WebGLShadowMap.js';
import { WebVRManager } from './renderers/webvr/WebVRManager.js';
import { ImageUtils } from './extras/ImageUtils.js';
import { Shape } from './extras/core/Shape.js';
import { CubeCamera } from './cameras/CubeCamera.js';

export { BoxGeometry as CubeGeometry };

export function Face4( a, b, c, d, normal, color, materialIndex ) {

	console.warn( 'THREE.Face4 has been removed. A THREE.Face3 will be created instead.' );
	return new Face3( a, b, c, normal, color, materialIndex );

}

export var LineStrip = 0;

export var LinePieces = 1;

export function MeshFaceMaterial( materials ) {

	console.warn( 'THREE.MeshFaceMaterial has been removed. Use an Array instead.' );
	return materials;

}

export function MultiMaterial( materials ) {

	if ( materials === undefined ) materials = [];

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

	console.warn( 'THREE.DynamicBufferAttribute has been removed. Use new THREE.BufferAttribute().setDynamic( true ) instead.' );
	return new BufferAttribute( array, itemSize ).setDynamic( true );

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

Object.assign( CurvePath.prototype, {

	createPointsGeometry: function ( divisions ) {

		console.warn( 'THREE.CurvePath: .createPointsGeometry() has been removed. Use new THREE.Geometry().setFromPoints( points ) instead.' );

		// generate geometry from path points (for Line or Points objects)

		var pts = this.getPoints( divisions );
		return this.createGeometry( pts );

	},

	createSpacedPointsGeometry: function ( divisions ) {

		console.warn( 'THREE.CurvePath: .createSpacedPointsGeometry() has been removed. Use new THREE.Geometry().setFromPoints( points ) instead.' );

		// generate geometry from equidistant sampling along the path

		var pts = this.getSpacedPoints( divisions );
		return this.createGeometry( pts );

	},

	createGeometry: function ( points ) {

		console.warn( 'THREE.CurvePath: .createGeometry() has been removed. Use new THREE.Geometry().setFromPoints( points ) instead.' );

		var geometry = new Geometry();

		for ( var i = 0, l = points.length; i < l; i ++ ) {

			var point = points[ i ];
			geometry.vertices.push( new Vector3( point.x, point.y, point.z || 0 ) );

		}

		return geometry;

	}

} );

//

Object.assign( Path.prototype, {

	fromPoints: function ( points ) {

		console.warn( 'THREE.Path: .fromPoints() has been renamed to .setFromPoints().' );
		this.setFromPoints( points );

	}

} );

//

export function ClosedSplineCurve3( points ) {

	console.warn( 'THREE.ClosedSplineCurve3 has been deprecated. Use THREE.CatmullRomCurve3 instead.' );

	CatmullRomCurve3.call( this, points );
	this.type = 'catmullrom';
	this.closed = true;

}

ClosedSplineCurve3.prototype = Object.create( CatmullRomCurve3.prototype );

//

export function SplineCurve3( points ) {

	console.warn( 'THREE.SplineCurve3 has been deprecated. Use THREE.CatmullRomCurve3 instead.' );

	CatmullRomCurve3.call( this, points );
	this.type = 'catmullrom';

}

SplineCurve3.prototype = Object.create( CatmullRomCurve3.prototype );

//

export function Spline( points ) {

	console.warn( 'THREE.Spline has been removed. Use THREE.CatmullRomCurve3 instead.' );

	CatmullRomCurve3.call( this, points );
	this.type = 'catmullrom';

}

Spline.prototype = Object.create( CatmullRomCurve3.prototype );

Object.assign( Spline.prototype, {

	initFromArray: function ( /* a */ ) {

		console.error( 'THREE.Spline: .initFromArray() has been removed.' );

	},
	getControlPointsArray: function ( /* optionalTarget */ ) {

		console.error( 'THREE.Spline: .getControlPointsArray() has been removed.' );

	},
	reparametrizeByArcLength: function ( /* samplingCoef */ ) {

		console.error( 'THREE.Spline: .reparametrizeByArcLength() has been removed.' );

	}

} );

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

Object.assign( Loader.prototype, {

	extractUrlBase: function ( url ) {

		console.warn( 'THREE.Loader: .extractUrlBase() has been deprecated. Use THREE.LoaderUtils.extractUrlBase() instead.' );
		return LoaderUtils.extractUrlBase( url );

	}

} );

export function XHRLoader( manager ) {

	console.warn( 'THREE.XHRLoader has been renamed to THREE.FileLoader.' );
	return new FileLoader( manager );

}

export function BinaryTextureLoader( manager ) {

	console.warn( 'THREE.BinaryTextureLoader has been renamed to THREE.DataTextureLoader.' );
	return new DataTextureLoader( manager );

}

Object.assign( ObjectLoader.prototype, {

	setTexturePath: function ( value ) {

		console.warn( 'THREE.ObjectLoader: .setTexturePath() has been renamed to .setResourcePath().' );
		return this.setResourcePath( value );

	}

} );

//

Object.assign( Box2.prototype, {

	center: function ( optionalTarget ) {

		console.warn( 'THREE.Box2: .center() has been renamed to .getCenter().' );
		return this.getCenter( optionalTarget );

	},
	empty: function () {

		console.warn( 'THREE.Box2: .empty() has been renamed to .isEmpty().' );
		return this.isEmpty();

	},
	isIntersectionBox: function ( box ) {

		console.warn( 'THREE.Box2: .isIntersectionBox() has been renamed to .intersectsBox().' );
		return this.intersectsBox( box );

	},
	size: function ( optionalTarget ) {

		console.warn( 'THREE.Box2: .size() has been renamed to .getSize().' );
		return this.getSize( optionalTarget );

	}
} );

Object.assign( Box3.prototype, {

	center: function ( optionalTarget ) {

		console.warn( 'THREE.Box3: .center() has been renamed to .getCenter().' );
		return this.getCenter( optionalTarget );

	},
	empty: function () {

		console.warn( 'THREE.Box3: .empty() has been renamed to .isEmpty().' );
		return this.isEmpty();

	},
	isIntersectionBox: function ( box ) {

		console.warn( 'THREE.Box3: .isIntersectionBox() has been renamed to .intersectsBox().' );
		return this.intersectsBox( box );

	},
	isIntersectionSphere: function ( sphere ) {

		console.warn( 'THREE.Box3: .isIntersectionSphere() has been renamed to .intersectsSphere().' );
		return this.intersectsSphere( sphere );

	},
	size: function ( optionalTarget ) {

		console.warn( 'THREE.Box3: .size() has been renamed to .getSize().' );
		return this.getSize( optionalTarget );

	}
} );

Line3.prototype.center = function ( optionalTarget ) {

	console.warn( 'THREE.Line3: .center() has been renamed to .getCenter().' );
	return this.getCenter( optionalTarget );

};

Object.assign( _Math, {

	random16: function () {

		console.warn( 'THREE.Math: .random16() has been deprecated. Use Math.random() instead.' );
		return Math.random();

	},

	nearestPowerOfTwo: function ( value ) {

		console.warn( 'THREE.Math: .nearestPowerOfTwo() has been renamed to .floorPowerOfTwo().' );
		return _Math.floorPowerOfTwo( value );

	},

	nextPowerOfTwo: function ( value ) {

		console.warn( 'THREE.Math: .nextPowerOfTwo() has been renamed to .ceilPowerOfTwo().' );
		return _Math.ceilPowerOfTwo( value );

	}

} );

Object.assign( Matrix3.prototype, {

	flattenToArrayOffset: function ( array, offset ) {

		console.warn( "THREE.Matrix3: .flattenToArrayOffset() has been deprecated. Use .toArray() instead." );
		return this.toArray( array, offset );

	},
	multiplyVector3: function ( vector ) {

		console.warn( 'THREE.Matrix3: .multiplyVector3() has been removed. Use vector.applyMatrix3( matrix ) instead.' );
		return vector.applyMatrix3( this );

	},
	multiplyVector3Array: function ( /* a */ ) {

		console.error( 'THREE.Matrix3: .multiplyVector3Array() has been removed.' );

	},
	applyToBuffer: function ( buffer /*, offset, length */ ) {

		console.warn( 'THREE.Matrix3: .applyToBuffer() has been removed. Use matrix.applyToBufferAttribute( attribute ) instead.' );
		return this.applyToBufferAttribute( buffer );

	},
	applyToVector3Array: function ( /* array, offset, length */ ) {

		console.error( 'THREE.Matrix3: .applyToVector3Array() has been removed.' );

	}

} );

Object.assign( Matrix4.prototype, {

	extractPosition: function ( m ) {

		console.warn( 'THREE.Matrix4: .extractPosition() has been renamed to .copyPosition().' );
		return this.copyPosition( m );

	},
	flattenToArrayOffset: function ( array, offset ) {

		console.warn( "THREE.Matrix4: .flattenToArrayOffset() has been deprecated. Use .toArray() instead." );
		return this.toArray( array, offset );

	},
	getPosition: function () {

		console.warn( 'THREE.Matrix4: .getPosition() has been removed. Use Vector3.setFromMatrixPosition( matrix ) instead.' );
		return new Vector3().setFromMatrixColumn( this, 3 );

	},
	setRotationFromQuaternion: function ( q ) {

		console.warn( 'THREE.Matrix4: .setRotationFromQuaternion() has been renamed to .makeRotationFromQuaternion().' );
		return this.makeRotationFromQuaternion( q );

	},
	multiplyToArray: function () {

		console.warn( 'THREE.Matrix4: .multiplyToArray() has been removed.' );

	},
	multiplyVector3: function ( vector ) {

		console.warn( 'THREE.Matrix4: .multiplyVector3() has been removed. Use vector.applyMatrix4( matrix ) instead.' );
		return vector.applyMatrix4( this );

	},
	multiplyVector4: function ( vector ) {

		console.warn( 'THREE.Matrix4: .multiplyVector4() has been removed. Use vector.applyMatrix4( matrix ) instead.' );
		return vector.applyMatrix4( this );

	},
	multiplyVector3Array: function ( /* a */ ) {

		console.error( 'THREE.Matrix4: .multiplyVector3Array() has been removed.' );

	},
	rotateAxis: function ( v ) {

		console.warn( 'THREE.Matrix4: .rotateAxis() has been removed. Use Vector3.transformDirection( matrix ) instead.' );
		v.transformDirection( this );

	},
	crossVector: function ( vector ) {

		console.warn( 'THREE.Matrix4: .crossVector() has been removed. Use vector.applyMatrix4( matrix ) instead.' );
		return vector.applyMatrix4( this );

	},
	translate: function () {

		console.error( 'THREE.Matrix4: .translate() has been removed.' );

	},
	rotateX: function () {

		console.error( 'THREE.Matrix4: .rotateX() has been removed.' );

	},
	rotateY: function () {

		console.error( 'THREE.Matrix4: .rotateY() has been removed.' );

	},
	rotateZ: function () {

		console.error( 'THREE.Matrix4: .rotateZ() has been removed.' );

	},
	rotateByAxis: function () {

		console.error( 'THREE.Matrix4: .rotateByAxis() has been removed.' );

	},
	applyToBuffer: function ( buffer /*, offset, length */ ) {

		console.warn( 'THREE.Matrix4: .applyToBuffer() has been removed. Use matrix.applyToBufferAttribute( attribute ) instead.' );
		return this.applyToBufferAttribute( buffer );

	},
	applyToVector3Array: function ( /* array, offset, length */ ) {

		console.error( 'THREE.Matrix4: .applyToVector3Array() has been removed.' );

	},
	makeFrustum: function ( left, right, bottom, top, near, far ) {

		console.warn( 'THREE.Matrix4: .makeFrustum() has been removed. Use .makePerspective( left, right, top, bottom, near, far ) instead.' );
		return this.makePerspective( left, right, top, bottom, near, far );

	}

} );

Plane.prototype.isIntersectionLine = function ( line ) {

	console.warn( 'THREE.Plane: .isIntersectionLine() has been renamed to .intersectsLine().' );
	return this.intersectsLine( line );

};

Quaternion.prototype.multiplyVector3 = function ( vector ) {

	console.warn( 'THREE.Quaternion: .multiplyVector3() has been removed. Use is now vector.applyQuaternion( quaternion ) instead.' );
	return vector.applyQuaternion( this );

};

Object.assign( Ray.prototype, {

	isIntersectionBox: function ( box ) {

		console.warn( 'THREE.Ray: .isIntersectionBox() has been renamed to .intersectsBox().' );
		return this.intersectsBox( box );

	},
	isIntersectionPlane: function ( plane ) {

		console.warn( 'THREE.Ray: .isIntersectionPlane() has been renamed to .intersectsPlane().' );
		return this.intersectsPlane( plane );

	},
	isIntersectionSphere: function ( sphere ) {

		console.warn( 'THREE.Ray: .isIntersectionSphere() has been renamed to .intersectsSphere().' );
		return this.intersectsSphere( sphere );

	}

} );

Object.assign( Triangle.prototype, {

	area: function () {

		console.warn( 'THREE.Triangle: .area() has been renamed to .getArea().' );
		return this.getArea();

	},
	barycoordFromPoint: function ( point, target ) {

		console.warn( 'THREE.Triangle: .barycoordFromPoint() has been renamed to .getBarycoord().' );
		return this.getBarycoord( point, target );

	},
	midpoint: function ( target ) {

		console.warn( 'THREE.Triangle: .midpoint() has been renamed to .getMidpoint().' );
		return this.getMidpoint( target );

	},
	normal: function ( target ) {

		console.warn( 'THREE.Triangle: .normal() has been renamed to .getNormal().' );
		return this.getNormal( target );

	},
	plane: function ( target ) {

		console.warn( 'THREE.Triangle: .plane() has been renamed to .getPlane().' );
		return this.getPlane( target );

	}

} );

Object.assign( Triangle, {

	barycoordFromPoint: function ( point, a, b, c, target ) {

		console.warn( 'THREE.Triangle: .barycoordFromPoint() has been renamed to .getBarycoord().' );
		return Triangle.getBarycoord( point, a, b, c, target );

	},
	normal: function ( a, b, c, target ) {

		console.warn( 'THREE.Triangle: .normal() has been renamed to .getNormal().' );
		return Triangle.getNormal( a, b, c, target );

	}

} );

Object.assign( Shape.prototype, {

	extractAllPoints: function ( divisions ) {

		console.warn( 'THREE.Shape: .extractAllPoints() has been removed. Use .extractPoints() instead.' );
		return this.extractPoints( divisions );

	},
	extrude: function ( options ) {

		console.warn( 'THREE.Shape: .extrude() has been removed. Use ExtrudeGeometry() instead.' );
		return new ExtrudeGeometry( this, options );

	},
	makeGeometry: function ( options ) {

		console.warn( 'THREE.Shape: .makeGeometry() has been removed. Use ShapeGeometry() instead.' );
		return new ShapeGeometry( this, options );

	}

} );

Object.assign( Vector2.prototype, {

	fromAttribute: function ( attribute, index, offset ) {

		console.warn( 'THREE.Vector2: .fromAttribute() has been renamed to .fromBufferAttribute().' );
		return this.fromBufferAttribute( attribute, index, offset );

	},
	distanceToManhattan: function ( v ) {

		console.warn( 'THREE.Vector2: .distanceToManhattan() has been renamed to .manhattanDistanceTo().' );
		return this.manhattanDistanceTo( v );

	},
	lengthManhattan: function () {

		console.warn( 'THREE.Vector2: .lengthManhattan() has been renamed to .manhattanLength().' );
		return this.manhattanLength();

	}

} );

Object.assign( Vector3.prototype, {

	setEulerFromRotationMatrix: function () {

		console.error( 'THREE.Vector3: .setEulerFromRotationMatrix() has been removed. Use Euler.setFromRotationMatrix() instead.' );

	},
	setEulerFromQuaternion: function () {

		console.error( 'THREE.Vector3: .setEulerFromQuaternion() has been removed. Use Euler.setFromQuaternion() instead.' );

	},
	getPositionFromMatrix: function ( m ) {

		console.warn( 'THREE.Vector3: .getPositionFromMatrix() has been renamed to .setFromMatrixPosition().' );
		return this.setFromMatrixPosition( m );

	},
	getScaleFromMatrix: function ( m ) {

		console.warn( 'THREE.Vector3: .getScaleFromMatrix() has been renamed to .setFromMatrixScale().' );
		return this.setFromMatrixScale( m );

	},
	getColumnFromMatrix: function ( index, matrix ) {

		console.warn( 'THREE.Vector3: .getColumnFromMatrix() has been renamed to .setFromMatrixColumn().' );
		return this.setFromMatrixColumn( matrix, index );

	},
	applyProjection: function ( m ) {

		console.warn( 'THREE.Vector3: .applyProjection() has been removed. Use .applyMatrix4( m ) instead.' );
		return this.applyMatrix4( m );

	},
	fromAttribute: function ( attribute, index, offset ) {

		console.warn( 'THREE.Vector3: .fromAttribute() has been renamed to .fromBufferAttribute().' );
		return this.fromBufferAttribute( attribute, index, offset );

	},
	distanceToManhattan: function ( v ) {

		console.warn( 'THREE.Vector3: .distanceToManhattan() has been renamed to .manhattanDistanceTo().' );
		return this.manhattanDistanceTo( v );

	},
	lengthManhattan: function () {

		console.warn( 'THREE.Vector3: .lengthManhattan() has been renamed to .manhattanLength().' );
		return this.manhattanLength();

	}

} );

Object.assign( Vector4.prototype, {

	fromAttribute: function ( attribute, index, offset ) {

		console.warn( 'THREE.Vector4: .fromAttribute() has been renamed to .fromBufferAttribute().' );
		return this.fromBufferAttribute( attribute, index, offset );

	},
	lengthManhattan: function () {

		console.warn( 'THREE.Vector4: .lengthManhattan() has been renamed to .manhattanLength().' );
		return this.manhattanLength();

	}

} );

//

Object.assign( Geometry.prototype, {

	computeTangents: function () {

		console.error( 'THREE.Geometry: .computeTangents() has been removed.' );

	},
	computeLineDistances: function () {

		console.error( 'THREE.Geometry: .computeLineDistances() has been removed. Use THREE.Line.computeLineDistances() instead.' );

	}

} );

Object.assign( Object3D.prototype, {

	getChildByName: function ( name ) {

		console.warn( 'THREE.Object3D: .getChildByName() has been renamed to .getObjectByName().' );
		return this.getObjectByName( name );

	},
	renderDepth: function () {

		console.warn( 'THREE.Object3D: .renderDepth has been removed. Use .renderOrder, instead.' );

	},
	translate: function ( distance, axis ) {

		console.warn( 'THREE.Object3D: .translate() has been removed. Use .translateOnAxis( axis, distance ) instead.' );
		return this.translateOnAxis( axis, distance );

	},
	getWorldRotation: function () {

		console.error( 'THREE.Object3D: .getWorldRotation() has been removed. Use THREE.Object3D.getWorldQuaternion( target ) instead.' );

	}

} );

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

Object.defineProperties( LOD.prototype, {

	objects: {
		get: function () {

			console.warn( 'THREE.LOD: .objects has been renamed to .levels.' );
			return this.levels;

		}
	}

} );

Object.defineProperty( Skeleton.prototype, 'useVertexTexture', {

	get: function () {

		console.warn( 'THREE.Skeleton: useVertexTexture has been removed.' );

	},
	set: function () {

		console.warn( 'THREE.Skeleton: useVertexTexture has been removed.' );

	}

} );

SkinnedMesh.prototype.initBones = function () {

	console.error( 'THREE.SkinnedMesh: initBones() has been removed.' );

};

Object.defineProperty( Curve.prototype, '__arcLengthDivisions', {

	get: function () {

		console.warn( 'THREE.Curve: .__arcLengthDivisions is now .arcLengthDivisions.' );
		return this.arcLengthDivisions;

	},
	set: function ( value ) {

		console.warn( 'THREE.Curve: .__arcLengthDivisions is now .arcLengthDivisions.' );
		this.arcLengthDivisions = value;

	}

} );

//

PerspectiveCamera.prototype.setLens = function ( focalLength, filmGauge ) {

	console.warn( "THREE.PerspectiveCamera.setLens is deprecated. " +
			"Use .setFocalLength and .filmGauge for a photographic setup." );

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
	copyIndicesArray: function ( /* indices */ ) {

		console.error( 'THREE.BufferAttribute: .copyIndicesArray() has been removed.' );

	}

} );

Object.assign( BufferGeometry.prototype, {

	addIndex: function ( index ) {

		console.warn( 'THREE.BufferGeometry: .addIndex() has been renamed to .setIndex().' );
		this.setIndex( index );

	},
	addDrawCall: function ( start, count, indexOffset ) {

		if ( indexOffset !== undefined ) {

			console.warn( 'THREE.BufferGeometry: .addDrawCall() no longer supports indexOffset.' );

		}
		console.warn( 'THREE.BufferGeometry: .addDrawCall() is now .addGroup().' );
		this.addGroup( start, count );

	},
	clearDrawCalls: function () {

		console.warn( 'THREE.BufferGeometry: .clearDrawCalls() is now .clearGroups().' );
		this.clearGroups();

	},
	computeTangents: function () {

		console.warn( 'THREE.BufferGeometry: .computeTangents() has been removed.' );

	},
	computeOffsets: function () {

		console.warn( 'THREE.BufferGeometry: .computeOffsets() has been removed.' );

	}

} );

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

//

Object.assign( ExtrudeBufferGeometry.prototype, {

	getArrays: function () {

		console.error( 'THREE.ExtrudeBufferGeometry: .getArrays() has been removed.' );

	},

	addShapeList: function () {

		console.error( 'THREE.ExtrudeBufferGeometry: .addShapeList() has been removed.' );

	},

	addShape: function () {

		console.error( 'THREE.ExtrudeBufferGeometry: .addShape() has been removed.' );

	}

} );

//

Object.defineProperties( Uniform.prototype, {

	dynamic: {
		set: function () {

			console.warn( 'THREE.Uniform: .dynamic has been removed. Use object.onBeforeRender() instead.' );

		}
	},
	onUpdate: {
		value: function () {

			console.warn( 'THREE.Uniform: .onUpdate() has been removed. Use object.onBeforeRender() instead.' );
			return this;

		}
	}

} );

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
	}

} );

Object.defineProperties( MeshPhongMaterial.prototype, {

	metal: {
		get: function () {

			console.warn( 'THREE.MeshPhongMaterial: .metal has been removed. Use THREE.MeshStandardMaterial instead.' );
			return false;

		},
		set: function () {

			console.warn( 'THREE.MeshPhongMaterial: .metal has been removed. Use THREE.MeshStandardMaterial instead' );

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

Object.assign( WebGLRenderer.prototype, {

	clearTarget: function ( renderTarget, color, depth, stencil ) {

		console.warn( 'THREE.WebGLRenderer: .clearTarget() has been deprecated. Use .setRenderTarget() and .clear() instead.' );
		this.setRenderTarget( renderTarget );
		this.clear( color, depth, stencil );

	},
	animate: function ( callback ) {

		console.warn( 'THREE.WebGLRenderer: .animate() is now .setAnimationLoop().' );
		this.setAnimationLoop( callback );

	},
	getCurrentRenderTarget: function () {

		console.warn( 'THREE.WebGLRenderer: .getCurrentRenderTarget() is now .getRenderTarget().' );
		return this.getRenderTarget();

	},
	getMaxAnisotropy: function () {

		console.warn( 'THREE.WebGLRenderer: .getMaxAnisotropy() is now .capabilities.getMaxAnisotropy().' );
		return this.capabilities.getMaxAnisotropy();

	},
	getPrecision: function () {

		console.warn( 'THREE.WebGLRenderer: .getPrecision() is now .capabilities.precision.' );
		return this.capabilities.precision;

	},
	resetGLState: function () {

		console.warn( 'THREE.WebGLRenderer: .resetGLState() is now .state.reset().' );
		return this.state.reset();

	},
	supportsFloatTextures: function () {

		console.warn( 'THREE.WebGLRenderer: .supportsFloatTextures() is now .extensions.get( \'OES_texture_float\' ).' );
		return this.extensions.get( 'OES_texture_float' );

	},
	supportsHalfFloatTextures: function () {

		console.warn( 'THREE.WebGLRenderer: .supportsHalfFloatTextures() is now .extensions.get( \'OES_texture_half_float\' ).' );
		return this.extensions.get( 'OES_texture_half_float' );

	},
	supportsStandardDerivatives: function () {

		console.warn( 'THREE.WebGLRenderer: .supportsStandardDerivatives() is now .extensions.get( \'OES_standard_derivatives\' ).' );
		return this.extensions.get( 'OES_standard_derivatives' );

	},
	supportsCompressedTextureS3TC: function () {

		console.warn( 'THREE.WebGLRenderer: .supportsCompressedTextureS3TC() is now .extensions.get( \'WEBGL_compressed_texture_s3tc\' ).' );
		return this.extensions.get( 'WEBGL_compressed_texture_s3tc' );

	},
	supportsCompressedTexturePVRTC: function () {

		console.warn( 'THREE.WebGLRenderer: .supportsCompressedTexturePVRTC() is now .extensions.get( \'WEBGL_compressed_texture_pvrtc\' ).' );
		return this.extensions.get( 'WEBGL_compressed_texture_pvrtc' );

	},
	supportsBlendMinMax: function () {

		console.warn( 'THREE.WebGLRenderer: .supportsBlendMinMax() is now .extensions.get( \'EXT_blend_minmax\' ).' );
		return this.extensions.get( 'EXT_blend_minmax' );

	},
	supportsVertexTextures: function () {

		console.warn( 'THREE.WebGLRenderer: .supportsVertexTextures() is now .capabilities.vertexTextures.' );
		return this.capabilities.vertexTextures;

	},
	supportsInstancedArrays: function () {

		console.warn( 'THREE.WebGLRenderer: .supportsInstancedArrays() is now .extensions.get( \'ANGLE_instanced_arrays\' ).' );
		return this.extensions.get( 'ANGLE_instanced_arrays' );

	},
	enableScissorTest: function ( boolean ) {

		console.warn( 'THREE.WebGLRenderer: .enableScissorTest() is now .setScissorTest().' );
		this.setScissorTest( boolean );

	},
	initMaterial: function () {

		console.warn( 'THREE.WebGLRenderer: .initMaterial() has been removed.' );

	},
	addPrePlugin: function () {

		console.warn( 'THREE.WebGLRenderer: .addPrePlugin() has been removed.' );

	},
	addPostPlugin: function () {

		console.warn( 'THREE.WebGLRenderer: .addPostPlugin() has been removed.' );

	},
	updateShadowMap: function () {

		console.warn( 'THREE.WebGLRenderer: .updateShadowMap() has been removed.' );

	},
	setFaceCulling: function () {

		console.warn( 'THREE.WebGLRenderer: .setFaceCulling() has been removed.' );

	},
	allocTextureUnit: function () {

		console.warn( 'THREE.WebGLRenderer: .allocTextureUnit() has been removed.' );

	},
	setTexture: function () {

		console.warn( 'THREE.WebGLRenderer: .setTexture() has been removed.' );

	},
	setTexture2D: function () {

		console.warn( 'THREE.WebGLRenderer: .setTexture2D() has been removed.' );

	},
	setTextureCube: function () {

		console.warn( 'THREE.WebGLRenderer: .setTextureCube() has been removed.' );

	},
	getActiveMipMapLevel: function () {

		console.warn( 'THREE.WebGLRenderer: .getActiveMipMapLevel() is now .getActiveMipmapLevel().' );
		return this.getActiveMipmapLevel();

	}

} );

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
	}

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

//

Object.defineProperties( WebGLRenderTargetCube.prototype, {

	activeCubeFace: {
		set: function ( /* value */ ) {

			console.warn( 'THREE.WebGLRenderTargetCube: .activeCubeFace has been removed. It is now the second parameter of WebGLRenderer.setRenderTarget().' );

		}
	},
	activeMipMapLevel: {
		set: function ( /* value */ ) {

			console.warn( 'THREE.WebGLRenderTargetCube: .activeMipMapLevel has been removed. It is now the third parameter of WebGLRenderer.setRenderTarget().' );

		}
	}

} );

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

Object.defineProperties( WebVRManager.prototype, {

	standing: {
		set: function ( /* value */ ) {

			console.warn( 'THREE.WebVRManager: .standing has been removed.' );

		}
	},
	userHeight: {
		set: function ( /* value */ ) {

			console.warn( 'THREE.WebVRManager: .userHeight has been removed.' );

		}
	}

} );

//

Audio.prototype.load = function ( file ) {

	console.warn( 'THREE.Audio: .load has been deprecated. Use THREE.AudioLoader instead.' );
	var scope = this;
	var audioLoader = new AudioLoader();
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

//

export var GeometryUtils = {

	merge: function ( geometry1, geometry2, materialIndexOffset ) {

		console.warn( 'THREE.GeometryUtils: .merge() has been moved to Geometry. Use geometry.merge( geometry2, matrix, materialIndexOffset ) instead.' );
		var matrix;

		if ( geometry2.isMesh ) {

			geometry2.matrixAutoUpdate && geometry2.updateMatrix();

			matrix = geometry2.matrix;
			geometry2 = geometry2.geometry;

		}

		geometry1.merge( geometry2, matrix, materialIndexOffset );

	},

	center: function ( geometry ) {

		console.warn( 'THREE.GeometryUtils: .center() has been moved to Geometry. Use geometry.center() instead.' );
		return geometry.center();

	}

};

ImageUtils.crossOrigin = undefined;

ImageUtils.loadTexture = function ( url, mapping, onLoad, onError ) {

	console.warn( 'THREE.ImageUtils.loadTexture has been deprecated. Use THREE.TextureLoader() instead.' );

	var loader = new TextureLoader();
	loader.setCrossOrigin( this.crossOrigin );

	var texture = loader.load( url, onLoad, undefined, onError );

	if ( mapping ) texture.mapping = mapping;

	return texture;

};

ImageUtils.loadTextureCube = function ( urls, mapping, onLoad, onError ) {

	console.warn( 'THREE.ImageUtils.loadTextureCube has been deprecated. Use THREE.CubeTextureLoader() instead.' );

	var loader = new CubeTextureLoader();
	loader.setCrossOrigin( this.crossOrigin );

	var texture = loader.load( urls, onLoad, undefined, onError );

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

export var SceneUtils = {

	createMultiMaterialObject: function ( /* geometry, materials */ ) {

		console.error( 'THREE.SceneUtils has been moved to /examples/js/utils/SceneUtils.js' );

	},

	detach: function ( /* child, parent, scene */ ) {

		console.error( 'THREE.SceneUtils has been moved to /examples/js/utils/SceneUtils.js' );

	},

	attach: function ( /* child, scene, parent */ ) {

		console.error( 'THREE.SceneUtils has been moved to /examples/js/utils/SceneUtils.js' );

	}

};

//

export function LensFlare() {

	console.error( 'THREE.LensFlare has been moved to /examples/js/objects/Lensflare.js' );

}
