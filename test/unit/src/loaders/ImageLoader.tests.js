/* global QUnit */

import { ImageLoader } from '../../../../src/loaders/ImageLoader';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'ImageLoader', () => {

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {

			const imageLoader = new ImageLoader();
			assert.ok( imageLoader.crossOrigin === "anonymous", "Passed!" );

		} );

		// PUBLIC STUFF
		QUnit.test( "load data url", ( assert ) => {

			const done = assert.async();
			const dataUri = "data:image/jpeg;base64,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";
			const imageLoader = new ImageLoader();
			imageLoader.load(
				dataUri,
				// onLoad callback
				function ( data ) {

					// output the text to the console
					// console.log( data );
					assert.ok( data.naturalHeight === 30, "height ok!" );
					assert.ok( data.naturalWidth === 30, "height ok!" );
					done();

				},

				// onProgress callback
				function ( xhr ) {

					console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

				},

				// onError callback
				function ( err ) {

					console.error( 'An error happened' );
					console.error( err );
					assert.ok( false, "Failed with error" );
					done();

				}
			);

		} );

		QUnit.test( "load file url", ( assert ) => {

			const done = assert.async();
			const imageLoader = new ImageLoader();
			imageLoader.load(
				`file://${__dirname}/../data/image.jpg`,
				// onLoad callback
				function ( data ) {

					// output the text to the console
					// console.log( data );
					assert.ok( data.naturalHeight === 30, "height ok!" );
					assert.ok( data.naturalWidth === 30, "height ok!" );
					done();

				},

				// onProgress callback
				function ( xhr ) {

					console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

				},

				// onError callback
				function ( err ) {

					console.error( 'An error happened' );
					console.error( err );
					assert.ok( false, "Failed with error" );
					done();

				}
			);

		} );

		QUnit.test( "load regular url", ( assert ) => {

			const done = assert.async();
			const imageLoader = new ImageLoader();
			imageLoader.load(
				"https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/screenshots/css3d_orthographic.jpg",
				// onLoad callback
				function ( data ) {

					// output the text to the console
					// console.log( data );
					assert.ok( data.naturalHeight === 250, "height ok!" );
					assert.ok( data.naturalWidth === 400, "height ok!" );
					done();

				},

				// onProgress callback
				function ( xhr ) {

					console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

				},

				// onError callback
				function ( err ) {

					console.error( 'An error happened' );
					console.error( err );
					assert.ok( false, "Failed with error" );
					done();

				}
			);

		} );

		QUnit.todo( "setCrossOrigin", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "setPath", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

} );
