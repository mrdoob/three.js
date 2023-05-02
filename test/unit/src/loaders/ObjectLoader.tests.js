/* global QUnit */

import { ObjectLoader } from '../../../../src/loaders/ObjectLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

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

		QUnit.todo( 'parse', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

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
