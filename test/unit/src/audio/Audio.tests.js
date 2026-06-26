import { Audio } from '../../../../src/audio/Audio.js';

import { Object3D } from '../../../../src/core/Object3D.js';

export default QUnit.module( 'Audios', () => {

	QUnit.module( 'Audio', () => {

		function mockListener() {

			return {
				context: {
					createGain: () => {

						return {
							connect: () => {},
						};

					}
				},
				getInput: () => {},
			};

		}

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const listener = mockListener();
			const object = new Audio( listener );
			assert.strictEqual(
				object instanceof Object3D, true,
				'Audio extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const listener = mockListener();
			const object = new Audio( listener );
			assert.ok( object, 'Can instantiate an Audio.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const listener = mockListener();
			const object = new Audio( listener );
			assert.ok(
				object.type === 'Audio',
				'Audio.type should be Audio'
			);

		} );

	} );

} );
