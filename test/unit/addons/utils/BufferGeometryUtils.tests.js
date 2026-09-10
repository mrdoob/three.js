import { BufferAttribute, BufferGeometry } from 'three';
import * as BufferGeometryUtils from '../../../../examples/jsm/utils/BufferGeometryUtils.js';

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

			QUnit.module( 'mergeGeometries', () => {

				QUnit.test( 'rejects missing morph attributes', ( assert ) => {

					const geometry1 = getGeometry();
					const geometry2 = getGeometry();
					delete geometry2.morphAttributes.position;

					assert.strictEqual( BufferGeometryUtils.mergeGeometries( [ geometry1, geometry2 ] ), null, 'rejects a missing morph attribute' );
					assert.strictEqual( BufferGeometryUtils.mergeGeometries( [ geometry2, geometry1 ] ), null, 'rejects an unexpected morph attribute' );

				} );

				for ( const [ count1, count2 ] of [[ 2, 1 ], [ 1, 2 ], [ 0, 1 ], [ 1, 0 ]] ) {

					QUnit.test( `rejects inconsistent morph target counts (${count1}, ${count2})`, ( assert ) => {

						const geometry1 = getGeometry();
						const geometry2 = getGeometry();

						geometry1.morphAttributes.position = Array.from( { length: count1 }, () => geometry1.attributes.position.clone() );
						geometry2.morphAttributes.position = Array.from( { length: count2 }, () => geometry2.attributes.position.clone() );

						assert.strictEqual( BufferGeometryUtils.mergeGeometries( [ geometry1, geometry2 ] ), null, 'rejects mismatched target counts' );

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
