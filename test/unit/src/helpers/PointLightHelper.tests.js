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
		QUnit.test( 'Extending', ( assert ) => {

			const light = new PointLight( parameters.color );
			const object = new PointLightHelper( light, parameters.sphereSize, parameters.color );
			assert.strictEqual(
				object instanceof Mesh, true,
				'PointLightHelper extends from Mesh'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const light = new PointLight( parameters.color );
			const object = new PointLightHelper( light, parameters.sphereSize, parameters.color );
			assert.ok( object, 'Can instantiate a PointLightHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const light = new PointLight( parameters.color );
			const object = new PointLightHelper( light, parameters.sphereSize, parameters.color );
			assert.ok(
				object.type === 'PointLightHelper',
				'PointLightHelper.type should be PointLightHelper'
			);

		} );

		QUnit.todo( 'light', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'color', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'matrix', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'matrixAutoUpdate', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const light = new PointLight( parameters.color );
			const object = new PointLightHelper( light, parameters.sphereSize, parameters.color );
			object.dispose();

		} );

		QUnit.todo( 'update', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
