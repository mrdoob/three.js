/* global QUnit */

import { runStdGeometryTests } from '../../utils/qunit-utils';
import { BoxHelper } from '../../../../src/helpers/BoxHelper';
import { BoxGeometry } from '../../../../src/geometries/BoxGeometry';
import { SphereGeometry } from '../../../../src/geometries/SphereGeometry';
import { Mesh } from '../../../../src/objects/Mesh';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'BoxHelper', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			// Test with a normal cube and a box helper
			var boxGeometry = new BoxGeometry();
			var box = new Mesh( boxGeometry );
			var boxHelper = new BoxHelper( box );

			// The same should happen with a comparable sphere
			var sphereGeometry = new SphereGeometry();
			var sphere = new Mesh( sphereGeometry );
			var sphereBoxHelper = new BoxHelper( sphere );

			// Note that unlike what I'd like to, these doesn't check the equivalency of the two generated geometries
			geometries = [ boxHelper.geometry, sphereBoxHelper.geometry ];

		} );

		// INHERITANCE
		QUnit.todo( 'Extending', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.todo( 'update', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setFromObject', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
