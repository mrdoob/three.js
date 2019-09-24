import { Matrix3 } from "../math/Matrix3.js";

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
