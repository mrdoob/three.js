/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Audio } from './audio/Audio.js';
import { AudioAnalyser } from './audio/AudioAnalyser.js';
import { PerspectiveCamera } from './cameras/PerspectiveCamera.js';
import { CullFaceFront, CullFaceBack } from './constants.js';
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
import { EventDispatcher } from './core/EventDispatcher.js';
import { Face3 } from './core/Face3.js';
import { Geometry } from './core/Geometry';
import { Object3D } from './core/Object3D.js';
import { Uniform } from './core/Uniform';
import { CatmullRomCurve3 } from './extras/curves/CatmullRomCurve3.js';
import { BoxHelper } from './extras/helpers/BoxHelper';
import { GridHelper } from './extras/helpers/GridHelper.js';
import { BoxGeometry } from './geometries/BoxGeometry.js';
import { EdgesGeometry } from './geometries/EdgesGeometry.js';
import { ExtrudeGeometry } from './geometries/ExtrudeGeometry.js';
import { ShapeGeometry } from './geometries/ShapeGeometry.js';
import { WireframeGeometry } from './geometries/WireframeGeometry.js';
import { Light } from './lights/Light.js';
import { FileLoader } from './loaders/FileLoader.js';
import { AudioLoader } from './loaders/AudioLoader.js';
import { CubeTextureLoader } from './loaders/CubeTextureLoader.js';
import { TextureLoader } from './loaders/TextureLoader.js';
import { Material } from './materials/Material.js';
import { LineBasicMaterial } from './materials/LineBasicMaterial.js';
import { MeshPhongMaterial } from './materials/MeshPhongMaterial.js';
import { MultiMaterial } from './materials/MultiMaterial.js';
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
import { Vector3 } from './math/Vector3.js';
import { LineSegments } from './objects/LineSegments.js';
import { LOD } from './objects/LOD.js';
import { Points } from './objects/Points.js';
import { Sprite } from './objects/Sprite.js';
import { WebGLRenderer } from './renderers/WebGLRenderer.js';
import { WebGLRenderTarget } from './renderers/WebGLRenderTarget.js';
import { WebGLShadowMap } from './renderers/webgl/WebGLShadowMap.js';
import { Shape } from './extras/core/Shape.js';

export { BoxGeometry as CubeGeometry };

export function Face4( a, b, c, d, normal, color, materialIndex ) {

	console.warn( 'THREE.Face4 has been removed. A THREE.Face3 will be created instead.' );
	return new Face3( a, b, c, normal, color, materialIndex );

}

export var LineStrip = 0;

export var LinePieces = 1;

export function MeshFaceMaterial( materials ) {

	console.warn( 'THREE.MeshFaceMaterial has been renamed to THREE.MultiMaterial.' );
	return new MultiMaterial( materials );

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

export function ClosedSplineCurve3( points ) {

	console.warn( 'THREE.ClosedSplineCurve3 has been deprecated. Use THREE.CatmullRomCurve3 instead.' );

	CatmullRomCurve3.call( this, points );
	this.type = 'catmullrom';
	this.closed = true;

}

ClosedSplineCurve3.prototype = Object.create( CatmullRomCurve3.prototype );


//
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

export function WireframeHelper( object, hex ) {

	console.warn( 'THREE.WireframeHelper has been removed. Use THREE.WireframeGeometry instead.' );
	return new LineSegments( new WireframeGeometry( object.geometry ), new LineBasicMaterial( { color: hex !== undefined ? hex : 0xffffff } ) );

}

//

export function XHRLoader( manager ) {

	console.warn( 'THREE.XHRLoader has been renamed to THREE.FileLoader.' );
	return new FileLoader( manager );

}

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

_Math.random16 = function () {

	console.warn( 'THREE.Math.random16() has been deprecated. Use Math.random() instead.' );
	return Math.random();

};

Object.assign( Matrix3.prototype, {

	flattenToArrayOffset: function ( array, offset ) {

		console.warn( "THREE.Matrix3: .flattenToArrayOffset() has been deprecated. Use .toArray() instead." );
		return this.toArray( array, offset );

	},
	multiplyVector3: function ( vector ) {

		console.warn( 'THREE.Matrix3: .multiplyVector3() has been removed. Use vector.applyMatrix3( matrix ) instead.' );
		return vector.applyMatrix3( this );

	},
	multiplyVector3Array: function ( a ) {

		console.warn( 'THREE.Matrix3: .multiplyVector3Array() has been renamed. Use matrix.applyToVector3Array( array ) instead.' );
		return this.applyToVector3Array( a );

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

		var v1;

		return function getPosition() {

			if ( v1 === undefined ) v1 = new Vector3();
			console.warn( 'THREE.Matrix4: .getPosition() has been removed. Use Vector3.setFromMatrixPosition( matrix ) instead.' );
			return v1.setFromMatrixColumn( this, 3 );

		};

	}(),
	setRotationFromQuaternion: function ( q ) {

		console.warn( 'THREE.Matrix4: .setRotationFromQuaternion() has been renamed to .makeRotationFromQuaternion().' );
		return this.makeRotationFromQuaternion( q );

	},
	multiplyVector3: function ( vector ) {

		console.warn( 'THREE.Matrix4: .multiplyVector3() has been removed. Use vector.applyMatrix4( matrix ) or vector.applyProjection( matrix ) instead.' );
		return vector.applyProjection( this );

	},
	multiplyVector4: function ( vector ) {

		console.warn( 'THREE.Matrix4: .multiplyVector4() has been removed. Use vector.applyMatrix4( matrix ) instead.' );
		return vector.applyMatrix4( this );

	},
	multiplyVector3Array: function ( a ) {

		console.warn( 'THREE.Matrix4: .multiplyVector3Array() has been renamed. Use matrix.applyToVector3Array( array ) instead.' );
		return this.applyToVector3Array( a );

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

Object.assign( Shape.prototype, {

	extrude: function ( options ) {

		console.warn( 'THREE.Shape: .extrude() has been removed. Use ExtrudeGeometry() instead.' );
		return new ExtrudeGeometry( this, options );

	},
	makeGeometry: function ( options ) {

		console.warn( 'THREE.Shape: .makeGeometry() has been removed. Use ShapeGeometry() instead.' );
		return new ShapeGeometry( this, options );

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

	}

} );

//

Geometry.prototype.computeTangents = function () {

	console.warn( 'THREE.Geometry: .computeTangents() has been removed.' );

};

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

			console.warn( 'THREE.' + this.type + ': .wrapAround has been removed.' );

		},
		set: function () {

			console.warn( 'THREE.' + this.type + ': .wrapAround has been removed.' );

		}
	},
	wrapRGB: {
		get: function () {

			console.warn( 'THREE.' + this.type + ': .wrapRGB has been removed.' );
			return new Color();

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

EventDispatcher.prototype = Object.assign( Object.create( {

	// Note: Extra base ensures these properties are not 'assign'ed.

	constructor: EventDispatcher,

	apply: function ( target ) {

		console.warn( "THREE.EventDispatcher: .apply is deprecated, " +
				"just inherit or Object.assign the prototype to mix-in." );

		Object.assign( target, this );

	}

} ), EventDispatcher.prototype );

//

Object.assign( WebGLRenderer.prototype, {

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

			return this.shadowMap.cullFace;

		},
		set: function ( value ) {

			console.warn( 'THREE.WebGLRenderer: .shadowMapCullFace is now .shadowMap.cullFace.' );
			this.shadowMap.cullFace = value;

		}
	}
} );

Object.defineProperties( WebGLShadowMap.prototype, {

	cullFace: {
		get: function () {

			return this.renderReverseSided ? CullFaceFront : CullFaceBack;

		},
		set: function ( cullFace ) {

			var value = ( cullFace !== CullFaceBack );
			console.warn( "WebGLRenderer: .shadowMap.cullFace is deprecated. Set .shadowMap.renderReverseSided to " + value + "." );
			this.renderReverseSided = value;

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

export var ImageUtils = {

	crossOrigin: undefined,

	loadTexture: function ( url, mapping, onLoad, onError ) {

		console.warn( 'THREE.ImageUtils.loadTexture has been deprecated. Use THREE.TextureLoader() instead.' );

		var loader = new TextureLoader();
		loader.setCrossOrigin( this.crossOrigin );

		var texture = loader.load( url, onLoad, undefined, onError );

		if ( mapping ) texture.mapping = mapping;

		return texture;

	},

	loadTextureCube: function ( urls, mapping, onLoad, onError ) {

		console.warn( 'THREE.ImageUtils.loadTextureCube has been deprecated. Use THREE.CubeTextureLoader() instead.' );

		var loader = new CubeTextureLoader();
		loader.setCrossOrigin( this.crossOrigin );

		var texture = loader.load( urls, onLoad, undefined, onError );

		if ( mapping ) texture.mapping = mapping;

		return texture;

	},

	loadCompressedTexture: function () {

		console.error( 'THREE.ImageUtils.loadCompressedTexture has been removed. Use THREE.DDSLoader instead.' );

	},

	loadCompressedTextureCube: function () {

		console.error( 'THREE.ImageUtils.loadCompressedTextureCube has been removed. Use THREE.DDSLoader instead.' );

	}

};

export var UniformsUtils = {

	merge: function ( uniforms ) {

		console.warn( 'THREE.UniformsUtils.merge() has been deprecated. Use Object.assign() instead.' );

		var merged = {};

		for ( var u = 0; u < uniforms.length; u ++ ) {

			var tmp = this.clone( uniforms[ u ] );

			for ( var p in tmp ) {

				merged[ p ] = tmp[ p ];

			}

		}

		return merged;

	},

	clone: function ( uniforms_src ) {

		console.warn( 'THREE.UniformsUtils.clone() has been deprecated.' );

		var uniforms_dst = {};

		for ( var u in uniforms_src ) {

			uniforms_dst[ u ] = {};

			for ( var p in uniforms_src[ u ] ) {

				var parameter_src = uniforms_src[ u ][ p ];

				if ( parameter_src && ( parameter_src.isColor ||
					parameter_src.isMatrix3 || parameter_src.isMatrix4 ||
					parameter_src.isVector2 || parameter_src.isVector3 || parameter_src.isVector4 ||
					parameter_src.isTexture ) ) {

					uniforms_dst[ u ][ p ] = parameter_src.clone();

				} else if ( Array.isArray( parameter_src ) ) {

					uniforms_dst[ u ][ p ] = parameter_src.slice();

				} else {

					uniforms_dst[ u ][ p ] = parameter_src;

				}

			}

		}

		return uniforms_dst;

	}

};

//

export function Projector() {

	console.error( 'THREE.Projector has been moved to /examples/js/renderers/Projector.js.' );

	this.projectVector = function ( vector, camera ) {

		console.warn( 'THREE.Projector: .projectVector() is now vector.project().' );
		vector.project( camera );

	};

	this.unprojectVector = function ( vector, camera ) {

		console.warn( 'THREE.Projector: .unprojectVector() is now vector.unproject().' );
		vector.unproject( camera );

	};

	this.pickingRay = function () {

		console.error( 'THREE.Projector: .pickingRay() is now raycaster.setFromCamera().' );

	};

}

//

export function CanvasRenderer() {

	console.error( 'THREE.CanvasRenderer has been moved to /examples/js/renderers/CanvasRenderer.js' );

	this.domElement = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'canvas' );
	this.clear = function () {};
	this.render = function () {};
	this.setClearColor = function () {};
	this.setSize = function () {};

}
