import { assert, beforeEach, describe, test } from 'vitest';

import { WireframeGeometry } from '../../../../src/geometries/WireframeGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
// import { runStdGeometryTests } from '../../utils/test-utils.js';

describe( 'Geometries', () => {

	describe( 'WireframeGeometry', () => {

		let geometries = undefined; // eslint-disable-line no-unused-vars
		beforeEach( function () {

			geometries = [
				new WireframeGeometry()
			];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new WireframeGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'WireframeGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new WireframeGeometry();
			assert.ok( object, 'Can instantiate a WireframeGeometry.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new WireframeGeometry();
			assert.ok(
				object.type === 'WireframeGeometry',
				'WireframeGeometry.type should be WireframeGeometry'
			);

		} );

	} );

} );
