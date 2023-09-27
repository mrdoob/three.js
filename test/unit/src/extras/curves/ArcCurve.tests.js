/* global QUnit */

import { ArcCurve } from '../../../../../src/extras/curves/ArcCurve.js';

import { EllipseCurve } from '../../../../../src/extras/curves/EllipseCurve.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Curves', () => {

		QUnit.module( 'ArcCurve', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new ArcCurve();
				assert.strictEqual(
					object instanceof EllipseCurve, true,
					'ArcCurve extends from EllipseCurve'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				const object = new ArcCurve();
				assert.ok( object, 'Can instantiate an ArcCurve.' );

			} );

			// PROPERTIES
			QUnit.test( 'type', ( assert ) => {

				const object = new ArcCurve();
				assert.ok(
					object.type === 'ArcCurve',
					'ArcCurve.type should be ArcCurve'
				);

			} );

			// PUBLIC
			QUnit.test( 'isArcCurve', ( assert ) => {

				const object = new ArcCurve();
				assert.ok(
					object.isArcCurve,
					'ArcCurve.isArcCurve should be true'
				);

			} );

		} );

	} );

} );
