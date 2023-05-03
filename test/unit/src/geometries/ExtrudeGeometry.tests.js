/* global QUnit */

import { ExtrudeGeometry } from '../../../../src/geometries/ExtrudeGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
// import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'ExtrudeGeometry', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new ExtrudeGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'ExtrudeGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new ExtrudeGeometry();
			assert.ok( object, 'Can instantiate an ExtrudeGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new ExtrudeGeometry();
			assert.ok(
				object.type === 'ExtrudeGeometry',
				'ExtrudeGeometry.type should be ExtrudeGeometry'
			);

		} );

		QUnit.todo( 'parameters', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'toJSON', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// STATIC
		QUnit.todo( 'fromJSON', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
