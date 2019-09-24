import { BufferGeometry } from "../core/BufferGeometry.js";

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
