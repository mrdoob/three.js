import { assert, beforeEach, describe, test } from 'vitest';

import { ShapeGeometry } from '../../../../src/geometries/ShapeGeometry.js';

import { Shape } from '../../../../src/extras/core/Shape.js';
import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
// import { runStdGeometryTests } from '../../utils/test-utils.js';

describe( 'Geometries', () => {

	describe( 'ShapeGeometry', () => {

		let geometries = undefined; // eslint-disable-line no-unused-vars
		beforeEach( function () {

			const triangleShape = new Shape();
			triangleShape.moveTo( 0, - 1 );
			triangleShape.lineTo( 1, 1 );
			triangleShape.lineTo( - 1, 1 );

			geometries = [
				new ShapeGeometry( triangleShape ),
			];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new ShapeGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'ShapeGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new ShapeGeometry();
			assert.ok( object, 'Can instantiate a ShapeGeometry.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new ShapeGeometry();
			assert.ok(
				object.type === 'ShapeGeometry',
				'ShapeGeometry.type should be ShapeGeometry'
			);

		} );

	} );

} );
