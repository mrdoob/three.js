/* global QUnit */

import { Source } from '../../../../src/textures/Source.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'Source', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Source();
			assert.ok( object, 'Can instantiate a Source.' );

		} );

		// PROPERTIES
		QUnit.todo( 'data', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'needsUpdate', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'uuid', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'version', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isSource', ( assert ) => {

			const object = new Source();
			assert.ok(
				object.isSource,
				'Source.isSource should be true'
			);

		} );

		QUnit.todo( 'toJSON', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
