import { Vector3 } from "../math/Vector3.js";

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
