import { LatheGeometry } from '../../../../src/geometries/LatheGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'LatheGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				points: [],
				segments: 0,
				phiStart: 0,
				phiLength: 0
			};

			geometries = [
				new LatheGeometry( parameters.points ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new LatheGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'LatheGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new LatheGeometry();
			assert.ok( object, 'Can instantiate a LatheGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new LatheGeometry();
			assert.ok(
				object.type === 'LatheGeometry',
				'LatheGeometry.type should be LatheGeometry'
			);

		} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

		QUnit.test( 'normals', ( assert ) => {

			const normals = new LatheGeometry().getAttribute( 'normal' );
			const normal = new Vector3();
			let nonUnitNormals = 0;

			for ( let i = 0; i < normals.count; i ++ ) {

				normal.fromBufferAttribute( normals, i );

				if ( Math.abs( normal.length() - 1 ) > 1e-6 ) nonUnitNormals ++;

			}

			assert.strictEqual( nonUnitNormals, 0, 'All normals have unit length.' );

		} );

	} );

} );
