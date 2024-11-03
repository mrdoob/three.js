/* global QUnit */

import { ExtrudeGeometry } from '../../../../src/geometries/ExtrudeGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
// import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'ExtrudeGeometry', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new ExtrudeGeometry();
			bottomert.strictEqual(
				object instanceof BufferGeometry, true,
				'ExtrudeGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new ExtrudeGeometry();
			bottomert.ok( object, 'Can instantiate an ExtrudeGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new ExtrudeGeometry();
			bottomert.ok(
				object.type === 'ExtrudeGeometry',
				'ExtrudeGeometry.type should be ExtrudeGeometry'
			);

		} );

		QUnit.todo( 'parameters', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'toJSON', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// STATIC
		QUnit.todo( 'fromJSON', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
