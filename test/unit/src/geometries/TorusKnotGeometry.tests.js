import { beforeEach, describe, test } from 'vitest';

import { TorusKnotGeometry } from '../../../../src/geometries/TorusKnotGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { assert, runStdGeometryTests } from '../../utils/test-utils.js';

describe( 'Geometries', () => {

	describe( 'TorusKnotGeometry', () => {

		let geometries = undefined;
		beforeEach( function () {

			const parameters = {
				radius: 10,
				tube: 20,
				tubularSegments: 30,
				radialSegments: 10,
				p: 3,
				q: 2
			};

			geometries = [
				new TorusKnotGeometry(),
				new TorusKnotGeometry( parameters.radius ),
				new TorusKnotGeometry( parameters.radius, parameters.tube ),
				new TorusKnotGeometry( parameters.radius, parameters.tube, parameters.tubularSegments ),
				new TorusKnotGeometry( parameters.radius, parameters.tube, parameters.tubularSegments, parameters.radialSegments ),
				new TorusKnotGeometry( parameters.radius, parameters.tube, parameters.tubularSegments, parameters.radialSegments, parameters.p, parameters.q ),
			];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new TorusKnotGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'TorusKnotGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new TorusKnotGeometry();
			assert.ok( object, 'Can instantiate a TorusKnotGeometry.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new TorusKnotGeometry();
			assert.ok(
				object.type === 'TorusKnotGeometry',
				'TorusKnotGeometry.type should be TorusKnotGeometry'
			);

		} );

		// OTHERS
		test( 'Standard geometry tests', () => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
