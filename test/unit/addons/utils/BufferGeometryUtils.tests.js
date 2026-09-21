import { BufferAttribute, BufferGeometry, InterleavedBuffer, InterleavedBufferAttribute } from 'three';
import * as MikkTSpace from '../../../../examples/jsm/libs/mikktspace.module.js';
import * as BufferGeometryUtils from '../../../../examples/jsm/utils/BufferGeometryUtils.js';
import { CONSOLE_LEVEL } from '../../utils/console-wrapper.js';

const getGeometry = () => {

	const geometry = new BufferGeometry();

	// square
	const vertices = new Float32Array( [
		- 1.0, - 1.0, 0.0, // Bottom left
		1.0, - 1.0, 0.0, // Bottom right
		1.0, 1.0, 0.0, // Top right
		- 1.0, 1.0, 0.0 // Top left
	] );

	const morphVertices = new Float32Array( [
		0.0, - 1.0, 0.0, // Bottom
		1.0, 0.0, 0.0, // Right
		0.0, 1.0, 0.0, // Top
		- 1.0, 0.0, 0.0 // Left
	] );

	geometry.setAttribute( 'position', new BufferAttribute( vertices, 3 ) );

	geometry.morphAttributes.position = [
		new BufferAttribute( morphVertices, 3 )
	];

	return geometry;

};

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Utils', () => {

		QUnit.module( 'BufferGeometryUtils', () => {

			QUnit.module( 'computeMikkTSpaceTangents', () => {

				QUnit.test( 'handles indexed, normalized interleaved attributes and default handedness', ( assert ) => {

					const geometry = new BufferGeometry();
					const data = new InterleavedBuffer( new Int16Array( [
						99, 0, 0, 0, 10922, 21845, 21845, 0, 0, 99,
						99, 32767, - 16384, 0, 10922, 21845, 21845, 32767, 0, 99,
						99, 32767, 0, - 16384, 10922, 21845, 21845, 32767, 32767, 99,
						99, 0, 16384, - 16384, 10922, 21845, 21845, 0, 32767, 99
					] ), 10 );
					const before = data.array.slice();

					geometry.setAttribute( 'position', new InterleavedBufferAttribute( data, 3, 1, true ) );
					geometry.setAttribute( 'normal', new InterleavedBufferAttribute( data, 3, 4, true ) );
					geometry.setAttribute( 'uv', new InterleavedBufferAttribute( data, 2, 7, true ) );
					geometry.setIndex( [ 0, 1, 2, 0, 2, 3 ] );

					assert.strictEqual( BufferGeometryUtils.computeMikkTSpaceTangents( geometry, MikkTSpace ), geometry, 'updates the original geometry' );
					assert.strictEqual( geometry.index, null, 'expands indexed triangles' );
					const tangent = geometry.getAttribute( 'tangent' );
					assert.strictEqual( tangent.count, 6 );
					assert.strictEqual( tangent.itemSize, 4 );

					// Independent native C golden, with decoded normalized attribute values.
					for ( let i = 0; i < tangent.count; i ++ ) {

						assert.ok( Math.abs( tangent.getX( i ) - 0.89442927 ) < 3e-5 && Math.abs( tangent.getY( i ) + 0.44720933 ) < 3e-5 && Math.abs( tangent.getZ( i ) - 0.00001518 ) < 3e-5, `normalized tangent ${i}` );
						assert.strictEqual( tangent.getW( i ), - 1, `default sign ${i}` );

					}

					assert.deepEqual( data.array, before, 'leaves the source interleaved buffer unchanged' );

				} );

				QUnit.test( 'converts non-Float32 attributes and supports explicit handedness', ( assert ) => {

					const geometry = new BufferGeometry();
					geometry.setAttribute( 'position', new BufferAttribute( new Float64Array( [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ] ), 3 ) );
					geometry.setAttribute( 'normal', new BufferAttribute( new Float64Array( [ 0, 0, 1, 0, 0, 1, 0, 0, 1 ] ), 3 ) );
					geometry.setAttribute( 'uv', new BufferAttribute( new Float64Array( [ 0, 0, 0, 1, 1, 0 ] ), 2 ) );

					BufferGeometryUtils.computeMikkTSpaceTangents( geometry, MikkTSpace, false );
					assert.deepEqual( Array.from( geometry.getAttribute( 'tangent' ).array ), [ 0, 1, 0, - 1, 0, 1, 0, - 1, 0, 1, 0, - 1 ], 'preserves raw mirrored handedness' );

					BufferGeometryUtils.computeMikkTSpaceTangents( geometry, MikkTSpace, true );
					assert.deepEqual( Array.from( geometry.getAttribute( 'tangent' ).array ), [ 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1 ], 'explicitly negates mirrored handedness' );

				} );

			} );

			QUnit.module( 'mergeGeometries', () => {

				QUnit.test( 'rejects missing morph attributes', ( assert ) => {

					const geometry1 = getGeometry();
					const geometry2 = getGeometry();
					delete geometry2.morphAttributes.position;

					console.level = CONSOLE_LEVEL.OFF;
					assert.strictEqual( BufferGeometryUtils.mergeGeometries( [ geometry1, geometry2 ] ), null, 'rejects a missing morph attribute' );
					assert.strictEqual( BufferGeometryUtils.mergeGeometries( [ geometry2, geometry1 ] ), null, 'rejects an unexpected morph attribute' );
					console.level = CONSOLE_LEVEL.DEFAULT;

				} );

				for ( const [ count1, count2 ] of [[ 2, 1 ], [ 1, 2 ], [ 0, 1 ], [ 1, 0 ]] ) {

					QUnit.test( `rejects inconsistent morph target counts (${count1}, ${count2})`, ( assert ) => {

						const geometry1 = getGeometry();
						const geometry2 = getGeometry();

						geometry1.morphAttributes.position = Array.from( { length: count1 }, () => geometry1.attributes.position.clone() );
						geometry2.morphAttributes.position = Array.from( { length: count2 }, () => geometry2.attributes.position.clone() );

						console.level = CONSOLE_LEVEL.OFF;
						assert.strictEqual( BufferGeometryUtils.mergeGeometries( [ geometry1, geometry2 ] ), null, 'rejects mismatched target counts' );
						console.level = CONSOLE_LEVEL.DEFAULT;

					} );

				}

				QUnit.test( 'merges compatible morph targets', ( assert ) => {

					const geometry1 = getGeometry();
					const geometry2 = getGeometry();

					for ( const [ i, geometry ] of [ geometry1, geometry2 ].entries() ) {

						geometry.setAttribute( 'normal', geometry.attributes.position.clone() );
						geometry.morphAttributes.position.push( geometry.attributes.position.clone() );
						geometry.morphAttributes.normal = [ geometry.attributes.normal.clone() ];

						for ( const name in geometry.morphAttributes ) {

							for ( const [ j, attribute ] of geometry.morphAttributes[ name ].entries() ) {

								attribute.array.fill( ( i + 1 ) * 10 + j );

							}

						}

					}

					const merged = BufferGeometryUtils.mergeGeometries( [ geometry1, geometry2 ] );

					assert.strictEqual( merged.attributes.position.count, 8 );
					assert.deepEqual( Object.keys( merged.morphAttributes ), [ 'position', 'normal' ] );

					for ( const name in geometry1.morphAttributes ) {

						assert.strictEqual( merged.morphAttributes[ name ].length, geometry1.morphAttributes[ name ].length );

						for ( let i = 0; i < merged.morphAttributes[ name ].length; i ++ ) {

							assert.strictEqual( merged.morphAttributes[ name ][ i ].count, merged.attributes[ name ].count );
							assert.deepEqual( Array.from( merged.morphAttributes[ name ][ i ].array ), [
								...geometry1.morphAttributes[ name ][ i ].array,
								...geometry2.morphAttributes[ name ][ i ].array
							] );

						}

					}

				} );

				QUnit.test( 'merges geometries without morph attributes', ( assert ) => {

					const geometry = getGeometry();
					delete geometry.morphAttributes.position;

					const merged = BufferGeometryUtils.mergeGeometries( [ geometry, geometry ] );

					assert.strictEqual( merged.attributes.position.count, 8 );
					assert.deepEqual( merged.morphAttributes, {} );

				} );

				QUnit.test( 'merges geometries with empty morph target arrays', ( assert ) => {

					const geometry = getGeometry();
					geometry.morphAttributes.position = [];

					const merged = BufferGeometryUtils.mergeGeometries( [ geometry, geometry ] );

					assert.strictEqual( merged.attributes.position.count, 8 );
					assert.deepEqual( merged.morphAttributes, {} );

				} );

			} );

			QUnit.module( 'mergeVertices', () => {

				QUnit.test( 'can handle morphAttributes without crashing', ( assert ) => {

					const geometry = getGeometry();

					const indexedGeometry = BufferGeometryUtils.mergeVertices( geometry );

					assert.deepEqual( geometry.morphAttributes.position[ 0 ], indexedGeometry.morphAttributes.position[ 0 ], 'morphAttributes were handled' );
					assert.ok( indexedGeometry.index, 'has index' );

				} );

				QUnit.test( 'preserves distinct vertices with zero tolerance', ( assert ) => {

					const geometry = new BufferGeometry();
					geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( [
						11, 0, 0,
						12, 0, 0,
						11, 0, 0
					] ), 3 ) );

					const indexedGeometry = BufferGeometryUtils.mergeVertices( geometry, 0 );

					assert.strictEqual( indexedGeometry.getAttribute( 'position' ).count, 2, 'keeps distinct positions' );
					assert.deepEqual( Array.from( indexedGeometry.index.array ), [ 0, 1, 0 ], 'merges only identical positions' );

				} );

			} );

		} );

	} );


} );
