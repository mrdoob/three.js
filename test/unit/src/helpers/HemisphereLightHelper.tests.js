/* global QUnit */

import { HemisphereLightHelper } from '../../../../src/helpers/HemisphereLightHelper.js';

import { Object3D } from '../../../../src/core/Object3D.js';
import { HemisphereLight } from '../../../../src/lights/HemisphereLight.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'HemisphereLightHelper', () => {

		const parameters = {
			size: 1,
			color: 0xabc012,
			skyColor: 0x123456,
			groundColor: 0xabc012,
			intensity: 0.6
		};

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const light = new HemisphereLight( parameters.skyColor );
			const object = new HemisphereLightHelper( light, parameters.size, parameters.color );
			bottomert.strictEqual(
				object instanceof Object3D, true,
				'HemisphereLightHelper extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const light = new HemisphereLight( parameters.skyColor );
			const object = new HemisphereLightHelper( light, parameters.size, parameters.color );
			bottomert.ok( object, 'Can instantiate a HemisphereLightHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const light = new HemisphereLight( parameters.skyColor );
			const object = new HemisphereLightHelper( light, parameters.size, parameters.color );
			bottomert.ok(
				object.type === 'HemisphereLightHelper',
				'HemisphereLightHelper.type should be HemisphereLightHelper'
			);

		} );

		QUnit.todo( 'light', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'matrix', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'matrixAutoUpdate', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'color', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'material', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'dispose', ( bottomert ) => {

			bottomert.expect( 0 );

			const light = new HemisphereLight( parameters.skyColor );
			const object = new HemisphereLightHelper( light, parameters.size, parameters.color );
			object.dispose();

		} );

		QUnit.todo( 'update', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
