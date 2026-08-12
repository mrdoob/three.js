import { SunLight } from '../../../../src/lights/SunLight.js';

import { Light } from '../../../../src/lights/Light.js';
import { ObjectLoader } from '../../../../src/loaders/ObjectLoader.js';
import { Vector3 } from '../../../../src/math/Vector3.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'SunLight', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new SunLight();
			assert.strictEqual(
				object instanceof Light, true,
				'SunLight extends from Light'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new SunLight();
			assert.ok( object, 'Can instantiate a SunLight.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new SunLight();
			assert.ok( object.type === 'SunLight', 'SunLight.type should be SunLight' );

		} );

		QUnit.test( 'shadow', ( assert ) => {

			const object = new SunLight();
			assert.ok( object.shadow.isSunLightShadow, 'SunLight.shadow is a SunLightShadow' );

		} );

		// PUBLIC
		QUnit.test( 'isSunLight', ( assert ) => {

			const object = new SunLight();
			assert.ok( object.isSunLight, 'SunLight.isSunLight should be true' );

		} );

		QUnit.test( 'setFromSphericalAngles', ( assert ) => {

			const object = new SunLight();
			const direction = new Vector3();

			direction.set( 0, 0, - 1 ).applyQuaternion( object.quaternion );
			assert.ok( direction.distanceTo( new Vector3( 0, - 1, 0 ) ) < 1e-12, 'Shines straight down by default' );

			object.setFromSphericalAngles( 0, 0 );
			direction.set( 0, 0, - 1 ).applyQuaternion( object.quaternion );
			assert.ok( direction.distanceTo( new Vector3( 0, 0, - 1 ) ) < 1e-12, 'Shines from the horizon at zero elevation' );

		} );

		// OTHERS
		QUnit.test( 'toJSON', ( assert ) => {

			const light = new SunLight( 0xffaa88, 2 );
			light.shadow.bias = 10;
			light.setFromSphericalAngles( 0.5, 1.2 );
			light.updateMatrix();

			const json = light.toJSON();
			const newLight = new ObjectLoader().parse( json );

			assert.ok( newLight.isSunLight, 'Reloaded light is a SunLight' );
			assert.ok( newLight.shadow.isSunLightShadow, 'Reloaded shadow is a SunLightShadow' );
			assert.ok( newLight.quaternion.angleTo( light.quaternion ) < 1e-6, 'Reloaded light keeps its orientation' );
			assert.smartEqual( newLight.shadow, light.shadow, 'Reloaded shadow is identical to the original one' );

		} );

	} );

} );
