import { BufferAttribute, BufferGeometry, Float32BufferAttribute, InterleavedBuffer, InterleavedBufferAttribute } from 'three';
import { TessellateModifier } from '../../../../examples/jsm/modifiers/TessellateModifier.js';

const positions = [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ];

function round( array ) {

	return Array.from( array, ( v ) => Math.round( v * 1000 ) / 1000 );

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Modifiers', () => {

		QUnit.module( 'TessellateModifier', () => {

			QUnit.test( 'normalized attributes', ( assert ) => {

				const geometry = new BufferGeometry();
				geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );
				geometry.setAttribute( 'normal', new BufferAttribute( new Int8Array( [ 0, 0, 127, 0, 0, 127, 0, 0, 127 ] ), 3, true ) );
				geometry.setAttribute( 'color', new BufferAttribute( new Uint8Array( [ 255, 0, 0, 0, 255, 0, 0, 0, 255 ] ), 3, true ) );
				geometry.setAttribute( 'uv', new BufferAttribute( new Uint16Array( [ 0, 0, 65535, 0, 0, 65535 ] ), 2, true ) );

				const result = new TessellateModifier( 10 ).modify( geometry );

				assert.deepEqual( round( result.attributes.normal.array ), [ 0, 0, 1, 0, 0, 1, 0, 0, 1 ], 'normals are denormalized' );
				assert.deepEqual( round( result.attributes.color.array ), [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ], 'colors are denormalized' );
				assert.deepEqual( round( result.attributes.uv.array ), [ 0, 0, 1, 0, 0, 1 ], 'uvs are denormalized' );

			} );

			QUnit.test( 'interleaved attributes', ( assert ) => {

				// position (3) and uv (2) interleaved with a stride of 5
				const buffer = new InterleavedBuffer( new Float32Array( [
					0, 0, 0, 0, 0,
					2, 0, 0, 1, 0,
					0, 1, 0, 0, 1
				] ), 5 );

				const geometry = new BufferGeometry();
				geometry.setAttribute( 'position', new InterleavedBufferAttribute( buffer, 3, 0 ) );
				geometry.setAttribute( 'uv', new InterleavedBufferAttribute( buffer, 2, 3 ) );

				const result = new TessellateModifier( 1.5, 1 ).modify( geometry );

				// the longest edge, from (2, 0, 0) to (0, 1, 0), is split at its midpoint
				assert.deepEqual( round( result.attributes.position.array ), [
					0, 0, 0, 2, 0, 0, 1, 0.5, 0,
					1, 0.5, 0, 0, 1, 0, 0, 0, 0
				], 'positions are read with the interleaved stride' );
				assert.deepEqual( round( result.attributes.uv.array ), [
					0, 0, 1, 0, 0.5, 0.5,
					0.5, 0.5, 0, 1, 0, 0
				], 'uvs are read with the interleaved stride' );

			} );

			QUnit.test( 'colors with an alpha component', ( assert ) => {

				const geometry = new BufferGeometry();
				geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );
				geometry.setAttribute( 'color', new Float32BufferAttribute( [ 1, 0, 0, 0.5, 0, 1, 0, 0.5, 0, 0, 1, 0.5 ], 4 ) );

				const result = new TessellateModifier( 10 ).modify( geometry );

				assert.deepEqual( round( result.attributes.color.array ), [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ], 'each vertex keeps its own color' );

			} );

		} );

	} );

} );
