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
		QUnit.test( 'Extending', ( assert ) => {

			const light = new HemisphereLight( parameters.skyColor );
			const object = new HemisphereLightHelper( light, parameters.size, parameters.color );
			assert.strictEqual(
				object instanceof Object3D, true,
				'HemisphereLightHelper extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const light = new HemisphereLight( parameters.skyColor );
			const object = new HemisphereLightHelper( light, parameters.size, parameters.color );
			assert.ok( object, 'Can instantiate a HemisphereLightHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const light = new HemisphereLight( parameters.skyColor );
			const object = new HemisphereLightHelper( light, parameters.size, parameters.color );
			assert.ok(
				object.type === 'HemisphereLightHelper',
				'HemisphereLightHelper.type should be HemisphereLightHelper'
			);

		} );

		// PUBLIC
		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const light = new HemisphereLight( parameters.skyColor );
			const object = new HemisphereLightHelper( light, parameters.size, parameters.color );
			object.dispose();

		} );

	} );

} );
