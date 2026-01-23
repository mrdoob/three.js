import { Source } from '../../../../src/textures/Source.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'Source', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Source();
			assert.ok( object, 'Can instantiate a Source.' );

		} );

		// PUBLIC
		QUnit.test( 'isSource', ( assert ) => {

			const object = new Source();
			assert.ok(
				object.isSource,
				'Source.isSource should be true'
			);

		} );

	} );

} );
