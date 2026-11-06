import { beforeEach, describe, test } from 'vitest';

import { DodecahedronGeometry } from '../../../../src/geometries/DodecahedronGeometry.js';

import { PolyhedronGeometry } from '../../../../src/geometries/PolyhedronGeometry.js';
import { assert, runStdGeometryTests } from '../../utils/test-utils.js';

describe( 'Geometries', () => {

	describe( 'DodecahedronGeometry', () => {

		let geometries = undefined;
		beforeEach( function () {

			const parameters = {
				radius: 10,
				detail: undefined
			};

			geometries = [
				new DodecahedronGeometry(),
				new DodecahedronGeometry( parameters.radius ),
				new DodecahedronGeometry( parameters.radius, parameters.detail ),
			];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new DodecahedronGeometry();
			assert.strictEqual(
				object instanceof PolyhedronGeometry, true,
				'DodecahedronGeometry extends from PolyhedronGeometry'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new DodecahedronGeometry();
			assert.ok( object, 'Can instantiate a DodecahedronGeometry.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new DodecahedronGeometry();
			assert.ok(
				object.type === 'DodecahedronGeometry',
				'DodecahedronGeometry.type should be DodecahedronGeometry'
			);

		} );

		// OTHERS
		test( 'Standard geometry tests', () => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
