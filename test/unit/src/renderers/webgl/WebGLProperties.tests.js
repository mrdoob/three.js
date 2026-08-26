import { WebGLProperties } from '../../../../../src/renderers/webgl/WebGLProperties.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module( 'WebGLProperties', () => {

			// INSTANCING
			QUnit.test( 'Instancing - exposes the expected API', ( assert ) => {

				const properties = new WebGLProperties();

				for ( const method of [ 'has', 'get', 'remove', 'update', 'dispose' ] ) {

					assert.strictEqual( typeof properties[ method ], 'function', `${ method }() is exposed` );

				}

			} );

			// has
			QUnit.test( 'has - reports whether an object has properties yet', ( assert ) => {

				const properties = new WebGLProperties();
				const object = {};

				assert.strictEqual( properties.has( object ), false, 'an unseen object has no properties' );

				properties.get( object );

				assert.strictEqual( properties.has( object ), true, 'get() registers the object' );

			} );

			// get
			QUnit.test( 'get - lazily creates an empty property object', ( assert ) => {

				const properties = new WebGLProperties();
				const map = properties.get( {} );

				assert.strictEqual( typeof map, 'object', 'an object is returned' );
				assert.deepEqual( map, {}, 'it starts out empty' );

			} );

			QUnit.test( 'get - returns the same object on repeated calls', ( assert ) => {

				// The renderer stashes GPU resources on this object across
				// frames, so identity has to be stable.
				const properties = new WebGLProperties();
				const object = {};

				const first = properties.get( object );
				first.texture = 'gpu-handle';

				assert.strictEqual( properties.get( object ), first, 'the same property object comes back' );
				assert.strictEqual( properties.get( object ).texture, 'gpu-handle', 'values written earlier are still there' );

			} );

			QUnit.test( 'get - keeps separate objects independent', ( assert ) => {

				const properties = new WebGLProperties();
				const a = {}, b = {};

				properties.get( a ).value = 1;
				properties.get( b ).value = 2;

				assert.strictEqual( properties.get( a ).value, 1, 'the first object keeps its own value' );
				assert.strictEqual( properties.get( b ).value, 2, 'the second object keeps its own value' );

			} );

			// update
			QUnit.test( 'update - writes a single key on an already registered object', ( assert ) => {

				const properties = new WebGLProperties();
				const object = {};

				properties.get( object );
				properties.update( object, 'version', 3 );

				assert.strictEqual( properties.get( object ).version, 3, 'the key is set' );

			} );

			QUnit.test( 'update - overwrites an existing key', ( assert ) => {

				const properties = new WebGLProperties();
				const object = {};

				properties.get( object ).version = 1;
				properties.update( object, 'version', 2 );

				assert.strictEqual( properties.get( object ).version, 2, 'the new value replaces the old one' );

			} );

			QUnit.test( 'update - requires the object to be registered first', ( assert ) => {

				// update() indexes the stored map directly, so it throws rather
				// than silently creating one -- callers are expected to have
				// called get() already.
				const properties = new WebGLProperties();

				assert.throws( () => properties.update( {}, 'key', 1 ), 'updating an unregistered object throws' );

			} );

			// remove
			QUnit.test( 'remove - forgets an object\'s properties', ( assert ) => {

				const properties = new WebGLProperties();
				const object = {};

				properties.get( object ).texture = 'gpu-handle';
				properties.remove( object );

				assert.strictEqual( properties.has( object ), false, 'the object is no longer known' );
				assert.deepEqual( properties.get( object ), {}, 'a later get() starts from scratch' );

			} );

			QUnit.test( 'remove - only affects the given object', ( assert ) => {

				const properties = new WebGLProperties();
				const a = {}, b = {};

				properties.get( a ).value = 1;
				properties.get( b ).value = 2;

				properties.remove( a );

				assert.strictEqual( properties.has( a ), false, 'the removed object is gone' );
				assert.strictEqual( properties.get( b ).value, 2, 'the other object is untouched' );

			} );

			QUnit.test( 'remove - is a no-op for an unknown object', ( assert ) => {

				const properties = new WebGLProperties();

				properties.remove( {} );

				assert.ok( true, 'removing an unregistered object does not throw' );

			} );

			// dispose
			QUnit.test( 'dispose - drops every stored property object', ( assert ) => {

				const properties = new WebGLProperties();
				const a = {}, b = {};

				properties.get( a ).value = 1;
				properties.get( b ).value = 2;

				properties.dispose();

				assert.strictEqual( properties.has( a ), false, 'the first object is forgotten' );
				assert.strictEqual( properties.has( b ), false, 'the second object is forgotten' );

			} );

			QUnit.test( 'dispose - leaves the instance usable', ( assert ) => {

				const properties = new WebGLProperties();
				const object = {};

				properties.get( object ).value = 1;
				properties.dispose();

				properties.get( object ).value = 2;

				assert.strictEqual( properties.get( object ).value, 2, 'new properties can be stored after disposal' );

			} );

		} );

	} );

} );
