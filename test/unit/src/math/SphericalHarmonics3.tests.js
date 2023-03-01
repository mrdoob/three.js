/* global QUnit */

import { SphericalHarmonics3 } from '../../../../src/math/SphericalHarmonics3.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'SphericalHarmonics3', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new SphericalHarmonics3();
			assert.ok( object, 'Can instantiate a SphericalHarmonics3.' );

		} );

		// PROPERTIES
		QUnit.todo( 'coefficients', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isSphericalHarmonics3', ( assert ) => {

			const object = new SphericalHarmonics3();
			assert.ok(
				object.isSphericalHarmonics3,
				'SphericalHarmonics3.isSphericalHarmonics3 should be true'
			);

		} );

		QUnit.todo( 'set', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'zero', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getAt', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getIrradianceAt', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'add', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'addScaledSH', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'scale', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'lerp', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'equals', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'copy', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clone', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'fromArray', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'toArray', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC - STATIC
		QUnit.todo( 'getBasisAt', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
