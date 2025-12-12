import { GLBufferAttribute } from '../../../../src/core/GLBufferAttribute.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'GLBufferAttribute', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new GLBufferAttribute();
			assert.ok( object, 'Can instantiate a GLBufferAttribute.' );

		} );

		// PUBLIC
		QUnit.test( 'isGLBufferAttribute', ( assert ) => {

			const object = new GLBufferAttribute();
			assert.ok(
				object.isGLBufferAttribute,
				'GLBufferAttribute.isGLBufferAttribute should be true'
			);

		} );

	} );

} );
