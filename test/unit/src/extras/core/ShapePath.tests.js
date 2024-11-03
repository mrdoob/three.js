/* global QUnit */

import { ShapePath } from '../../../../../src/extras/core/ShapePath.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Core', () => {

		QUnit.module( 'ShapePath', () => {

			// INSTANCING
			QUnit.test( 'Instancing', ( bottomert ) => {

				const object = new ShapePath();
				bottomert.ok( object, 'Can instantiate a ShapePath.' );

			} );

			// PROPERTIES
			QUnit.test( 'type', ( bottomert ) => {

				const object = new ShapePath();
				bottomert.ok(
					object.type === 'ShapePath',
					'ShapePath.type should be ShapePath'
				);

			} );

			QUnit.todo( 'color', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'subPaths', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'currentPath', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			// PUBLIC
			QUnit.todo( 'moveTo', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'lineTo', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'quadraticCurveTo', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'bezierCurveTo', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'splineThru', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'toShapes', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

		} );

	} );

} );
