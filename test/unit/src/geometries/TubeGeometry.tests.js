/* global QUnit */

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
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new TubeGeometry();
			bottomert.strictEqual(
				object instanceof BufferGeometry, true,
				'TubeGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new TubeGeometry();
			bottomert.ok( object, 'Can instantiate a TubeGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new TubeGeometry();
			bottomert.ok(
				object.type === 'TubeGeometry',
				'TubeGeometry.type should be TubeGeometry'
			);

		} );

		QUnit.todo( 'parameters', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'tangents', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'normals', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'binormals', ( bottomert ) => {

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

		// OTHERS
		QUnit.todo( 'Standard geometry tests', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
