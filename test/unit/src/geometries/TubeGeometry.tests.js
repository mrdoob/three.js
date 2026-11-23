import { TubeGeometry } from '../../../../src/geometries/TubeGeometry.js';

import { LineCurve3 } from '../../../../src/extras/curves/LineCurve3.js';
import { Vector3 } from '../../../../src/math/Vector3.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
// import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'TubeGeometry', ( hooks ) => {

		let geometries = undefined; // eslint-disable-line no-unused-vars
		hooks.beforeEach( function () {

			const path = new LineCurve3( new Vector3( 0, 0, 0 ), new Vector3( 0, 1, 0 ) );

			geometries = [
				new TubeGeometry( path ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new TubeGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'TubeGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new TubeGeometry();
			assert.ok( object, 'Can instantiate a TubeGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new TubeGeometry();
			assert.ok(
				object.type === 'TubeGeometry',
				'TubeGeometry.type should be TubeGeometry'
			);

		} );

		// PUBLIC
		QUnit.test( 'copy', ( assert ) => {

			const path = new LineCurve3( new Vector3( 0, 0, 0 ), new Vector3( 0, 0, 5 ) );
			const source = new TubeGeometry( path, 10, 1, 8, false );

			const targets = [
				[ 'copy()', new TubeGeometry().copy( source ) ],
				[ 'clone()', source.clone() ]
			];

			for ( const [ method, target ] of targets ) {

				for ( const key of [ 'tangents', 'normals', 'binormals' ] ) {

					assert.strictEqual( target[ key ].length, source[ key ].length, method + ': ' + key + ' have the length of the source frames.' );
					assert.ok( target[ key ].every( ( vector, i ) => vector.equals( source[ key ][ i ] ) ), method + ': ' + key + ' are equal to the source frames.' );
					assert.ok( target[ key ].every( ( vector, i ) => vector !== source[ key ][ i ] ), method + ': ' + key + ' are not shared with the source.' );

				}

			}

		} );

	} );

} );
