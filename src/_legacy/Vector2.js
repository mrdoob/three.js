import { Vector2 } from "../math/Vector2.js";

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
