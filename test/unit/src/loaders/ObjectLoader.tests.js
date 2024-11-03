/* global QUnit */

import { ObjectLoader } from '../../../../src/loaders/ObjectLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'ObjectLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new ObjectLoader();
			bottomert.strictEqual(
				object instanceof Loader, true,
				'ObjectLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new ObjectLoader();
			bottomert.ok( object, 'Can instantiate an ObjectLoader.' );

		} );

		// PUBLIC
		QUnit.todo( 'load', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'loadAsync', ( bottomert ) => {

			// async loadAsync( url, onProgress )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'pbottom', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'pbottomAsync', ( bottomert ) => {

			// async pbottomAsync( json )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'pbottomShapes', ( bottomert ) => {

			// pbottomShapes( json )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'pbottomSkeletons', ( bottomert ) => {

			// pbottomSkeletons( json, object )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'pbottomGeometries', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'pbottomMaterials', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'pbottomAnimations', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'pbottomImages', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'pbottomImagesAsync', ( bottomert ) => {

			// async pbottomImagesAsync( json )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'parseTextures', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'parseObject', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'bindSkeletons', ( bottomert ) => {

			// bindSkeletons( object, skeletons )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
