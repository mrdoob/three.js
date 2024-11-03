/* global QUnit */

import { SphericalHarmonics3 } from '../../../../src/math/SphericalHarmonics3.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'SphericalHarmonics3', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new SphericalHarmonics3();
			bottomert.ok( object, 'Can instantiate a SphericalHarmonics3.' );

		} );

		// PROPERTIES
		QUnit.todo( 'coefficients', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isSphericalHarmonics3', ( bottomert ) => {

			const object = new SphericalHarmonics3();
			bottomert.ok(
				object.isSphericalHarmonics3,
				'SphericalHarmonics3.isSphericalHarmonics3 should be true'
			);

		} );

		QUnit.todo( 'set', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'zero', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getAt', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getIrradianceAt', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'add', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'addScaledSH', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'scale', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'lerp', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'equals', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'copy', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clone', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'fromArray', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'toArray', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC - STATIC
		QUnit.todo( 'getBasisAt', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
