import { Color } from 'three';
import { uniformArray, color, vec3 } from 'three/tsl';
import { gpuTest } from '../tsl/gpu-test-utils.js';

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Accessors', () => {

		QUnit.module( 'UniformArrayNode', () => {

			const palette = [ 0x0b5d79, 0x5ed6c2, 0xfeedaa ];

			QUnit.test( 'uniformArray() replaces constant nodes with their values', ( assert ) => {

				const untyped = uniformArray( palette.map( ( hex ) => color( hex ) ) );
				const typed = uniformArray( palette.map( ( hex ) => color( hex ) ), 'color' );

				for ( const node of [ untyped, typed ] ) {

					assert.strictEqual( node.elementType, 'color', 'element type is color' );

					for ( let i = 0; i < palette.length; i ++ ) {

						assert.ok( node.array[ i ].isColor === true, 'element is a Color' );
						assert.strictEqual( node.array[ i ].getHex(), palette[ i ], 'element keeps its color' );

					}

				}

			} );

			QUnit.test( 'uniformArray() keeps the given array without nodes', ( assert ) => {

				const values = palette.map( ( hex ) => new Color( hex ) );

				assert.strictEqual( uniformArray( values ).array, values );

			} );

			gpuTest( 'uniformArray() with color() nodes matches Color values', ( { assert } ) => {

				const fromNodes = uniformArray( palette.map( ( hex ) => color( hex ) ) );
				const fromNodesTyped = uniformArray( palette.map( ( hex ) => color( hex ) ), 'color' );

				for ( let i = 0; i < palette.length; i ++ ) {

					const { r, g, b } = new Color( palette[ i ] );
					const expected = vec3( r, g, b );

					assert.closeAbs( fromNodes.element( i ), expected, 1e-6 );
					assert.closeAbs( fromNodesTyped.element( i ), expected, 1e-6 );

				}

			} );

		} );

	} );

} );
