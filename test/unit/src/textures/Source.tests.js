/* global QUnit */

import { Source } from '../../../../src/textures/Source.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'Source', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new Source();
			bottomert.ok( object, 'Can instantiate a Source.' );

		} );

		// PROPERTIES
		QUnit.todo( 'data', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'needsUpdate', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'uuid', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'version', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isSource', ( bottomert ) => {

			const object = new Source();
			bottomert.ok(
				object.isSource,
				'Source.isSource should be true'
			);

		} );

		QUnit.todo( 'toJSON', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
