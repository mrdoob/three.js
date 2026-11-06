import { beforeEach, describe, test } from 'vitest';

import { BoxHelper } from '../../../../src/helpers/BoxHelper.js';

import { LineSegments } from '../../../../src/objects/LineSegments.js';
import { assert, runStdGeometryTests } from '../../utils/test-utils.js';
import { BoxGeometry } from '../../../../src/geometries/BoxGeometry.js';
import { SphereGeometry } from '../../../../src/geometries/SphereGeometry.js';
import { Mesh } from '../../../../src/objects/Mesh.js';

describe( 'Helpers', () => {

	describe( 'BoxHelper', () => {

		let geometries = undefined;

		beforeEach( function () {

			// Test with a normal cube and a box helper
			const boxGeometry = new BoxGeometry();
			const box = new Mesh( boxGeometry );
			const boxHelper = new BoxHelper( box );

			// The same should happen with a comparable sphere
			const sphereGeometry = new SphereGeometry();
			const sphere = new Mesh( sphereGeometry );
			const sphereBoxHelper = new BoxHelper( sphere );

			// Note that unlike what I'd like to, these doesn't check the equivalency
			// of the two generated geometries
			geometries = [ boxHelper.geometry, sphereBoxHelper.geometry ];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new BoxHelper();
			assert.strictEqual(
				object instanceof LineSegments, true,
				'BoxHelper extends from LineSegments'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new BoxHelper();
			assert.ok( object, 'Can instantiate a BoxHelper.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new BoxHelper();
			assert.ok(
				object.type === 'BoxHelper',
				'BoxHelper.type should be BoxHelper'
			);

		} );

		// PUBLIC

		test( 'dispose', () => {


			const object = new BoxHelper();
			object.dispose();

		} );

		// OTHERS
		test( 'Standard geometry tests', () => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
