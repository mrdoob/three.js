import { LightProbe } from '../../../../src/lights/LightProbe.js';

import { Light } from '../../../../src/lights/Light.js';
import { ObjectLoader } from '../../../../src/loaders/ObjectLoader.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'LightProbe', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new LightProbe();
			assert.strictEqual(
				object instanceof Light, true,
				'LightProbe extends from Light'
			);

		} );

		// PUBLIC
		QUnit.test( 'isLightProbe', ( assert ) => {

			const object = new LightProbe();
			assert.ok(
				object.isLightProbe,
				'LightProbe.isLightProbe should be true'
			);

		} );

		QUnit.test( 'toJSON / ObjectLoader', ( assert ) => {

			const light = new LightProbe();
			light.intensity = 2;
			light.sh.coefficients[ 0 ].set( 1, 2, 3 );

			const json = JSON.parse( JSON.stringify( light.toJSON() ) );
			const loaded = new ObjectLoader().parse( json );

			assert.strictEqual( json.object.type, 'LightProbe', 'The serialized type is LightProbe' );
			assert.strictEqual( loaded.isLightProbe, true, 'The loaded object is a LightProbe' );
			assert.strictEqual( loaded.intensity, light.intensity, 'Intensity is restored' );
			assert.deepEqual( loaded.sh, light.sh, 'Spherical harmonics are restored' );

		} );

	} );

} );
