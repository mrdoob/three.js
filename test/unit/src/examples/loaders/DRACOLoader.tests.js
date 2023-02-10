/* global QUnit */

import { DRACOLoader } from '../../../../../examples/jsm/loaders/DRACOLoader.js';

// import { Loader } from '../../../../../src/loaders/Loader.js';
import { Loader } from 'three';

export default QUnit.module( 'Examples', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'DRACOLoader', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new DRACOLoader();
				assert.strictEqual(
					object instanceof Loader, true,
					'DRACOLoader extends from Loader.'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				// no params
				const object = new DRACOLoader();
				assert.ok( object, 'Can instantiate a DRACOLoader.' );

			} );

			// PROPERTIES
			QUnit.todo( 'decoderPath', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'decoderConfig', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'decoderBinary', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'decoderPending', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'workerLimit', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'workerPool', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'workerNextTaskID', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'workerSourceURL', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'defaultAttributeIDs', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'defaultAttributeTypes', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			// PUBLIC
			QUnit.todo( 'setDecoderPath', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'setDecoderConfig', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'setWorkerLimit', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'load', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );


			QUnit.todo( 'preload', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );


			QUnit.todo( 'dispose', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

		} );

	} );

} );
