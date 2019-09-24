import { Matrix4 } from "../math/Matrix4.js";
import { Vector3 } from "../math/Vector3.js";

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
