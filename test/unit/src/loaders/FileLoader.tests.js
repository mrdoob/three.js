/* global QUnit */

import { FileLoader } from '../../../../src/loaders/FileLoader';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'FileLoader', () => {

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {

			const fileLoader = new FileLoader();
			assert.ok( fileLoader.crossOrigin === "anonymous", "Passed!" );
			assert.ok( fileLoader.mimeType === undefined, "Passed!" );
			assert.ok( fileLoader.responseType === undefined, "Passed!" );

		} );

		// PUBLIC STUFF
		QUnit.test( "load data url => undefined", ( assert ) => {

			const done = assert.async();
			const fileLoader = new FileLoader();
			fileLoader.load(
				"data:,Hello%2C%20World!",
				// onLoad callback
				function ( data ) {

					// output the text to the console
					// console.log( data );
					assert.ok( data == "Hello, World!", "Passed!" );
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

		QUnit.test( "load data url => arraybuffer", ( assert ) => {

			const done = assert.async();
			const fileLoader = new FileLoader();
			fileLoader.setResponseType( "arraybuffer" );
			fileLoader.setMimeType( "text/plain" );
			fileLoader.load(
				"data:,Hello%2C%20World!",
				// onLoad callback
				function ( data ) {

					// output the text to the console
					// console.log( data );
					assert.ok( data.byteLength === 13, "Passed!" );
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

		QUnit.test( "load data url => blob", ( assert ) => {

			const done = assert.async();
			const fileLoader = new FileLoader();
			fileLoader.setResponseType( "blob" );
			fileLoader.setMimeType( "text/plain" );
			fileLoader.load(
				"data:,Hello%2C%20World!",
				// onLoad callback
				function ( data ) {

					// output the text to the console
					// console.log( data.size );
					assert.ok( data.size === 13, "Passed!" );
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

		QUnit.test( "load data url => document", ( assert ) => {

			const done = assert.async();
			const fileLoader = new FileLoader();
			fileLoader.setResponseType( "document" );
			fileLoader.setMimeType( "text/html" );
			fileLoader.load(
				"data:text/html,%3Ch1%3EHello%2C%20World!%3C%2Fh1%3E",
				// onLoad callback
				function ( data ) {

					// output the text to the console
					// console.log( data );
					assert.ok( true, "Passed!" );
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

		QUnit.test( "load data url => json", ( assert ) => {

			const done = assert.async();
			const fileLoader = new FileLoader();
			fileLoader.setResponseType( "json" );
			fileLoader.setMimeType( "application/json" );
			fileLoader.load(
				"data:application/json;base64,eyJhIjogImJjZCIgfQ==",
				// onLoad callback
				function ( data ) {

					// output the text to the console
					// console.log( JSON.stringify( data ) );
					assert.ok( JSON.stringify( data ) === `{"a":"bcd"}`, "Passed!" );
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

		QUnit.test( "load file url => undefined", ( assert ) => {

			const done = assert.async();
			const fileLoader = new FileLoader();
			fileLoader.load(
				`file://${__dirname}/../data/data.txt`,
				// onLoad callback
				function ( data ) {

					// output the text to the console
					// console.log( data );
					assert.ok( data === "Hello, World!\n", "Passed!" );
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

		QUnit.test( "load regular url => json", ( assert ) => {

			const done = assert.async();
			const fileLoader = new FileLoader();
			fileLoader.responseType = "json";
			fileLoader.load(
				"https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/json/suzanne_buffergeometry.json",
				// onLoad callback
				function ( data ) {

					// output the text to the console
					// console.log( data );
					assert.ok( data.metadata.position === 505, "Passed!" );
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

		QUnit.todo( "setPath", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "setResponseType", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "setWithCredentials", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "setMimeType", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "setRequestHeader", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

} );
