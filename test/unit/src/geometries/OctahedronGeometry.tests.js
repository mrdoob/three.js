import { beforeEach, describe, test } from 'vitest';

import { OctahedronGeometry } from '../../../../src/geometries/OctahedronGeometry.js';

import { PolyhedronGeometry } from '../../../../src/geometries/PolyhedronGeometry.js';
import { assert, runStdGeometryTests } from '../../utils/test-utils.js';

describe( 'Geometries', () => {

	describe( 'OctahedronGeometry', () => {

		let geometries = undefined;
		beforeEach( function () {

			const parameters = {
				radius: 10,
				detail: undefined
			};

			geometries = [
				new OctahedronGeometry(),
				new OctahedronGeometry( parameters.radius ),
				new OctahedronGeometry( parameters.radius, parameters.detail ),
			];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new OctahedronGeometry();
			assert.strictEqual(
				object instanceof PolyhedronGeometry, true,
				'OctahedronGeometry extends from PolyhedronGeometry'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new OctahedronGeometry();
			assert.ok( object, 'Can instantiate an OctahedronGeometry.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new OctahedronGeometry();
			assert.ok(
				object.type === 'OctahedronGeometry',
				'OctahedronGeometry.type should be OctahedronGeometry'
			);

		} );

		// OTHERS
		test( 'Standard geometry tests', () => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
