import { Timer } from '../../../../src/core/Timer.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'Timer', () => {

		function createDocument() {

			const target = document.implementation.createHTMLDocument();
			Object.defineProperty( target, 'hidden', { value: false } );
			return target;

		}

		QUnit.test( 'connect replaces the previous visibility listener', ( assert ) => {

			const timer = new Timer();
			const target = createDocument();
			let resets = 0;
			timer.reset = () => resets ++;

			timer.connect( target );
			timer.connect( target );
			target.dispatchEvent( new Event( 'visibilitychange' ) );

			assert.strictEqual( resets, 1, 'Reconnecting to the same document resets only once.' );

			timer.disconnect();
			timer.connect( target );
			target.dispatchEvent( new Event( 'visibilitychange' ) );

			assert.strictEqual( resets, 2, 'Disconnecting and reconnecting leaves only the current listener.' );
			timer.dispose();

		} );

		QUnit.test( 'connect disconnects the previous document', ( assert ) => {

			const timer = new Timer();
			const previous = createDocument();
			const current = createDocument();
			let resets = 0;
			timer.reset = () => resets ++;

			timer.connect( previous );
			timer.connect( current );
			previous.dispatchEvent( new Event( 'visibilitychange' ) );

			assert.strictEqual( resets, 0, 'The previous document no longer affects the timer.' );

			current.dispatchEvent( new Event( 'visibilitychange' ) );
			assert.strictEqual( resets, 1, 'The current document still resets the timer.' );

			timer.dispose();
			previous.dispatchEvent( new Event( 'visibilitychange' ) );
			current.dispatchEvent( new Event( 'visibilitychange' ) );
			assert.strictEqual( resets, 1, 'Disposal leaves neither document with an active listener.' );

		} );

	} );

} );
