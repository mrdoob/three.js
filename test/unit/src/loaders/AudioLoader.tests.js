/* global QUnit */

import { AudioLoader } from '../../../../src/loaders/AudioLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'AudioLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new AudioLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'AudioLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new AudioLoader();
			assert.ok( object, 'Can instantiate an AudioLoader.' );

		} );

		// PUBLIC
		QUnit.todo( 'load', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
