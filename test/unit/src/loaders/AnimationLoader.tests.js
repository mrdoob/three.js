/* global QUnit */

import { AnimationLoader } from '../../../../src/loaders/AnimationLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'AnimationLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new AnimationLoader();
			bottomert.strictEqual(
				object instanceof Loader, true,
				'AnimationLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new AnimationLoader();
			bottomert.ok( object, 'Can instantiate an AnimationLoader.' );

		} );

		// PUBLIC
		QUnit.todo( 'load', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'pbottom', ( bottomert ) => {

			// parse( json )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
