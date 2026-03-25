import { LoadingManager } from '../../../../src/loaders/LoadingManager.js';

import { Loader } from '../../../../src/loaders/Loader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'LoadingManager', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			// no params
			const object = new LoadingManager();
			assert.ok( object, 'Can instantiate a LoadingManager.' );

			// onLoad, onProgress, onError

		} );

		// OTHERS
		QUnit.test( 'addHandler/getHandler/removeHandler', ( assert ) => {

			const loadingManager = new LoadingManager();
			const loader = new Loader();

			const regex1 = /\.jpg$/i;
			const regex2 = /\.jpg$/gi;

			loadingManager.addHandler( regex1, loader );

			assert.equal( loadingManager.getHandler( 'foo.jpg' ), loader, 'Returns the expected loader.' );
			assert.equal( loadingManager.getHandler( 'foo.jpg.png' ), null, 'Returns null since the correct file extension is not at the end of the file name.' );
			assert.equal( loadingManager.getHandler( 'foo.jpeg' ), null, 'Returns null since file extension is wrong.' );

			loadingManager.removeHandler( regex1 );
			loadingManager.addHandler( regex2, loader );

			assert.equal( loadingManager.getHandler( 'foo.jpg' ), loader, 'Returns the expected loader when using a regex with "g" flag.' );
			assert.equal( loadingManager.getHandler( 'foo.jpg' ), loader, 'Returns the expected loader when using a regex with "g" flag. Test twice, see #17920.' );

		} );

		QUnit.test( 'abortController - lazy instantiation', ( assert ) => {

			const loadingManager = new LoadingManager();

			assert.equal( loadingManager._abortController, null, '_abortController is initially null.' );

			const controller = loadingManager.abortController;

			assert.ok( controller instanceof AbortController, 'abortController returns an AbortController instance.' );
			assert.equal( loadingManager._abortController, controller, '_abortController is set after first access.' );

			const controller2 = loadingManager.abortController;
			assert.equal( controller, controller2, 'Subsequent accesses return the same AbortController instance.' );

		} );

		QUnit.test( 'abort() - aborts controller and resets', ( assert ) => {

			const loadingManager = new LoadingManager();

			const controller = loadingManager.abortController;

			assert.ok( ! controller.signal.aborted, 'Controller signal is not aborted initially.' );

			loadingManager.abort();

			assert.ok( controller.signal.aborted, 'Controller signal is aborted after calling abort().' );
			assert.equal( loadingManager._abortController, null, '_abortController is reset to null after abort().' );

		} );

		QUnit.test( 'abortController - recreation after abort', ( assert ) => {

			const loadingManager = new LoadingManager();

			const controller1 = loadingManager.abortController;

			loadingManager.abort();

			assert.ok( controller1.signal.aborted, 'First controller is aborted.' );
			assert.equal( loadingManager._abortController, null, '_abortController is null after abort.' );

			const controller2 = loadingManager.abortController;

			assert.ok( controller2 instanceof AbortController, 'New AbortController is created.' );
			assert.notEqual( controller1, controller2, 'New controller is a different instance from the aborted one.' );
			assert.ok( ! controller2.signal.aborted, 'New controller signal is not aborted.' );

		} );

	} );

} );
