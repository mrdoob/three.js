import { Material } from '../../../../src/materials/Material.js';

import { EventDispatcher } from '../../../../src/core/EventDispatcher.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'Material', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new Material();
			assert.strictEqual(
				object instanceof EventDispatcher, true,
				'Material extends from EventDispatcher'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Material();
			assert.ok( object, 'Can instantiate a Material.' );

		} );

		// PROPERTIES

		QUnit.test( 'type', ( assert ) => {

			const object = new Material();
			assert.ok(
				object.type === 'Material',
				'Material.type should be Material'
			);

		} );

		// PUBLIC
		QUnit.test( 'isMaterial', ( assert ) => {

			const object = new Material();
			assert.ok(
				object.isMaterial,
				'Material.isMaterial should be true'
			);

		} );

		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new Material();
			object.dispose();

		} );

		QUnit.test( 'stencilBack defaults', ( assert ) => {

			const object = new Material();

			assert.strictEqual( object.stencilBackFunc, null, 'stencilBackFunc defaults to null' );
			assert.strictEqual( object.stencilBackRef, null, 'stencilBackRef defaults to null' );
			assert.strictEqual( object.stencilBackFail, null, 'stencilBackFail defaults to null' );
			assert.strictEqual( object.stencilBackZFail, null, 'stencilBackZFail defaults to null' );
			assert.strictEqual( object.stencilBackZPass, null, 'stencilBackZPass defaults to null' );

		} );

		QUnit.test( 'stencilBack copy', ( assert ) => {

			const source = new Material();
			source.stencilBackFunc = 1;
			source.stencilBackRef = 2;
			source.stencilBackFail = 3;
			source.stencilBackZFail = 4;
			source.stencilBackZPass = 5;

			const copy = new Material().copy( source );

			assert.strictEqual( copy.stencilBackFunc, 1, 'stencilBackFunc copied' );
			assert.strictEqual( copy.stencilBackRef, 2, 'stencilBackRef copied' );
			assert.strictEqual( copy.stencilBackFail, 3, 'stencilBackFail copied' );
			assert.strictEqual( copy.stencilBackZFail, 4, 'stencilBackZFail copied' );
			assert.strictEqual( copy.stencilBackZPass, 5, 'stencilBackZPass copied' );

		} );

		QUnit.test( 'stencilBack serialization', ( assert ) => {

			const object = new Material();
			object.stencilBackFunc = 1;
			object.stencilBackRef = 2;
			object.stencilBackFail = 3;
			object.stencilBackZFail = 4;
			object.stencilBackZPass = 5;

			const json = object.toJSON();

			assert.strictEqual( json.stencilBackFunc, 1, 'stencilBackFunc serialized' );
			assert.strictEqual( json.stencilBackRef, 2, 'stencilBackRef serialized' );
			assert.strictEqual( json.stencilBackFail, 3, 'stencilBackFail serialized' );
			assert.strictEqual( json.stencilBackZFail, 4, 'stencilBackZFail serialized' );
			assert.strictEqual( json.stencilBackZPass, 5, 'stencilBackZPass serialized' );

		} );

	} );

} );
