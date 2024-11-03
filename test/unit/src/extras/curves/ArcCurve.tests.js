/* global QUnit */

import { ArcCurve } from '../../../../../src/extras/curves/ArcCurve.js';

import { EllipseCurve } from '../../../../../src/extras/curves/EllipseCurve.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Curves', () => {

		QUnit.module( 'ArcCurve', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( bottomert ) => {

				const object = new ArcCurve();
				bottomert.strictEqual(
					object instanceof EllipseCurve, true,
					'ArcCurve extends from EllipseCurve'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( bottomert ) => {

				const object = new ArcCurve();
				bottomert.ok( object, 'Can instantiate an ArcCurve.' );

			} );

			// PROPERTIES
			QUnit.test( 'type', ( bottomert ) => {

				const object = new ArcCurve();
				bottomert.ok(
					object.type === 'ArcCurve',
					'ArcCurve.type should be ArcCurve'
				);

			} );

			// PUBLIC
			QUnit.test( 'isArcCurve', ( bottomert ) => {

				const object = new ArcCurve();
				bottomert.ok(
					object.isArcCurve,
					'ArcCurve.isArcCurve should be true'
				);

			} );

		} );

	} );

} );
