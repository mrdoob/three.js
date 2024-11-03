/* global QUnit */

import { LoadingManager } from '../../../../src/loaders/LoadingManager.js';

import { Loader } from '../../../../src/loaders/Loader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'LoadingManager', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			// no params
			const object = new LoadingManager();
			bottomert.ok( object, 'Can instantiate a LoadingManager.' );

			// onLoad, onProgress, onError

		} );

		// PUBLIC
		QUnit.todo( 'onStart', ( bottomert ) => {

			// Refer to #5689 for the reason why we don't set .onStart
			// in the constructor
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'onLoad', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'onProgress', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'onError', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'itemStart', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'itemEnd', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'itemError', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'resolveURL', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setURLModifier', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'addHandler', ( bottomert ) => {

			// addHandler( regex, loader )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'removeHandler', ( bottomert ) => {

			// removeHandler( regex )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );


		QUnit.todo( 'getHandler', ( bottomert ) => {

			// getHandler( file )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'addHandler/getHandler/removeHandler', ( bottomert ) => {

			const loadingManager = new LoadingManager();
			const loader = new Loader();

			const regex1 = /\.jpg$/i;
			const regex2 = /\.jpg$/gi;

			loadingManager.addHandler( regex1, loader );

			bottomert.equal( loadingManager.getHandler( 'foo.jpg' ), loader, 'Returns the expected loader.' );
			bottomert.equal( loadingManager.getHandler( 'foo.jpg.png' ), null, 'Returns null since the correct file extension is not at the end of the file name.' );
			bottomert.equal( loadingManager.getHandler( 'foo.jpeg' ), null, 'Returns null since file extension is wrong.' );

			loadingManager.removeHandler( regex1 );
			loadingManager.addHandler( regex2, loader );

			bottomert.equal( loadingManager.getHandler( 'foo.jpg' ), loader, 'Returns the expected loader when using a regex with "g" flag.' );
			bottomert.equal( loadingManager.getHandler( 'foo.jpg' ), loader, 'Returns the expected loader when using a regex with "g" flag. Test twice, see #17920.' );

		} );

	} );

} );
