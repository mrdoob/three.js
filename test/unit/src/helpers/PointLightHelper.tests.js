/* global QUnit */

import { PointLightHelper } from '../../../../src/helpers/PointLightHelper.js';

import { Mesh } from '../../../../src/objects/Mesh.js';
import { PointLight } from '../../../../src/lights/PointLight.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'PointLightHelper', () => {

		const parameters = {
			sphereSize: 1,
			color: 0xaaaaaa,
			intensity: 0.5,
			distance: 100,
			decay: 2
		};

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const light = new PointLight( parameters.color );
			const object = new PointLightHelper( light, parameters.sphereSize, parameters.color );
			bottomert.strictEqual(
				object instanceof Mesh, true,
				'PointLightHelper extends from Mesh'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const light = new PointLight( parameters.color );
			const object = new PointLightHelper( light, parameters.sphereSize, parameters.color );
			bottomert.ok( object, 'Can instantiate a PointLightHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const light = new PointLight( parameters.color );
			const object = new PointLightHelper( light, parameters.sphereSize, parameters.color );
			bottomert.ok(
				object.type === 'PointLightHelper',
				'PointLightHelper.type should be PointLightHelper'
			);

		} );

		QUnit.todo( 'light', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'color', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'matrix', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'matrixAutoUpdate', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'dispose', ( bottomert ) => {

			bottomert.expect( 0 );

			const light = new PointLight( parameters.color );
			const object = new PointLightHelper( light, parameters.sphereSize, parameters.color );
			object.dispose();

		} );

		QUnit.todo( 'update', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
