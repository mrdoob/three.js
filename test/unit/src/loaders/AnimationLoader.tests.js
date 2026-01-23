import { AnimationLoader } from '../../../../src/loaders/AnimationLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'AnimationLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new AnimationLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'AnimationLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new AnimationLoader();
			assert.ok( object, 'Can instantiate an AnimationLoader.' );

		} );

	} );

} );
