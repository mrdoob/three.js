import { DataTextureLoader } from '../../../../src/loaders/DataTextureLoader.js';
import { FileLoader } from '../../../../src/loaders/FileLoader.js';
import { Loader } from '../../../../src/loaders/Loader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'DataTextureLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new DataTextureLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'DataTextureLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new DataTextureLoader();
			assert.ok( object, 'Can instantiate a DataTextureLoader.' );

		} );

		// BUG: Missing return in error handling causes TypeError
		QUnit.test( 'parse error handling (missing return bug)', ( assert ) => {

			const loader = new DataTextureLoader();
			// Mock parse to throw an error intentionally
			loader.parse = function () {
				throw new Error( 'Mock Parse Error' );
			};

			const originalLoad = FileLoader.prototype.load;
			FileLoader.prototype.load = function ( url, onLoad ) {
				onLoad( new ArrayBuffer( 0 ) );
			};

			let callbackFired = false;
			loader.load( 'dummy.dds', function () {}, undefined, function ( err ) {
				callbackFired = err.message === 'Mock Parse Error';
			} );

			// If the bug is present, the test will crash with a TypeError before reaching this assertion
			assert.ok( callbackFired, 'onError is properly called before the crash' );

			FileLoader.prototype.load = originalLoad;

		} );

	} );

} );
