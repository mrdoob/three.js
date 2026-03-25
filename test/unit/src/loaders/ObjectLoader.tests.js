/* global QUnit */

import { ObjectLoader } from '../../../../src/loaders/ObjectLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';
import { FileLoader } from '../../../../src/loaders/FileLoader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'ObjectLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new ObjectLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'ObjectLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new ObjectLoader();
			assert.ok( object, 'Can instantiate an ObjectLoader.' );

		} );

		// PUBLIC
		QUnit.todo( 'load', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'loadAsync', ( assert ) => {

			// async loadAsync( url, onProgress )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'parse - invalid json variable shadowing', ( assert ) => {

			const loader = new ObjectLoader();
			let callbackFired = false;

			const originalLoad = FileLoader.prototype.load;
			FileLoader.prototype.load = function ( url, onLoad ) {
				onLoad( '{malformed}' );
			};

			loader.load( 'dummy.json', function () {}, undefined, function ( err ) {
				callbackFired = err instanceof SyntaxError;
			} );

			// We won't reach here because it crashes, but we add an assertion to satisfy QUnit if it doesn't 
			assert.ok( callbackFired, 'onError is properly called before the crash' );

			FileLoader.prototype.load = originalLoad;

		} );

		QUnit.todo( 'parseAsync', ( assert ) => {

			// async parseAsync( json )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'parseShapes', ( assert ) => {

			// parseShapes( json )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'parseSkeletons', ( assert ) => {

			// parseSkeletons( json, object )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'parseGeometries', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'parseMaterials', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'parseAnimations', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'parseImages', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'parseImagesAsync', ( assert ) => {

			// async parseImagesAsync( json )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'parseTextures', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'parseObject', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'bindSkeletons', ( assert ) => {

			// bindSkeletons( object, skeletons )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
