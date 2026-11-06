import { assert, describe, test } from 'vitest';

import { ArcCurve } from '../../../../../src/extras/curves/ArcCurve.js';

import { EllipseCurve } from '../../../../../src/extras/curves/EllipseCurve.js';

describe( 'Extras', () => {

	describe( 'Curves', () => {

		describe( 'ArcCurve', () => {

			// INHERITANCE
			test( 'Extending', () => {

				const object = new ArcCurve();
				assert.strictEqual(
					object instanceof EllipseCurve, true,
					'ArcCurve extends from EllipseCurve'
				);

			} );

			// INSTANCING
			test( 'Instancing', () => {

				const object = new ArcCurve();
				assert.ok( object, 'Can instantiate an ArcCurve.' );

			} );

			// PROPERTIES
			test( 'type', () => {

				const object = new ArcCurve();
				assert.ok(
					object.type === 'ArcCurve',
					'ArcCurve.type should be ArcCurve'
				);

			} );

			// PUBLIC
			test( 'isArcCurve', () => {

				const object = new ArcCurve();
				assert.ok(
					object.isArcCurve,
					'ArcCurve.isArcCurve should be true'
				);

			} );

		} );

	} );

} );
