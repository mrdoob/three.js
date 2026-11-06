import { beforeEach, describe, test } from 'vitest';

import { CylinderGeometry } from '../../../../src/geometries/CylinderGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { assert, runStdGeometryTests } from '../../utils/test-utils.js';

describe( 'Geometries', () => {

	describe( 'CylinderGeometry', () => {

		let geometries = undefined;
		beforeEach( function () {

			const parameters = {
				radiusTop: 10,
				radiusBottom: 20,
				height: 30,
				radialSegments: 20,
				heightSegments: 30,
				openEnded: true,
				thetaStart: 0.1,
				thetaLength: 2.0,
			};

			geometries = [
				new CylinderGeometry(),
				new CylinderGeometry( parameters.radiusTop ),
				new CylinderGeometry( parameters.radiusTop, parameters.radiusBottom ),
				new CylinderGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height ),
				new CylinderGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments ),
				new CylinderGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments, parameters.heightSegments ),
				new CylinderGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments, parameters.heightSegments, parameters.openEnded ),
				new CylinderGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments, parameters.heightSegments, parameters.openEnded, parameters.thetaStart ),
				new CylinderGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments, parameters.heightSegments, parameters.openEnded, parameters.thetaStart, parameters.thetaLength ),
			];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new CylinderGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'CylinderGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new CylinderGeometry();
			assert.ok( object, 'Can instantiate a CylinderGeometry.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new CylinderGeometry();
			assert.ok(
				object.type === 'CylinderGeometry',
				'CylinderGeometry.type should be CylinderGeometry'
			);

		} );

		// OTHERS
		test( 'Standard geometry tests', () => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
