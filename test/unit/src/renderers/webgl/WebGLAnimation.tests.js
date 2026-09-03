import { WebGLAnimation } from '../../../../../src/renderers/webgl/WebGLAnimation.js';

// Stand-in for `self`, with a hand-pumped requestAnimationFrame.

const ContextMock = function () {

	this.pending = null;
	this.nextId = 1;

	this.requestAnimationFrame = function ( callback ) {

		this.pending = callback;
		return this.nextId ++;

	};

	this.cancelAnimationFrame = function () {

		this.pending = null;

	};

	this.pump = function ( time ) {

		const callback = this.pending;
		this.pending = null;
		if ( callback !== null ) callback( time, {} );

	};

};

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module( 'WebGLAnimation', () => {

			QUnit.test( 'onAnimationFrame: keeps running when the animation loop throws', ( assert ) => {

				const context = new ContextMock();
				const animation = new WebGLAnimation();
				let frames = 0;

				animation.setContext( context );
				animation.setAnimationLoop( () => {

					frames ++;
					throw new Error( 'error in animation loop' );

				} );
				animation.start();

				// The host reports the error of each frame, like the browser does.

				for ( let i = 0; i < 3; i ++ ) {

					assert.throws( () => context.pump( i ), /error in animation loop/ );

				}

				assert.strictEqual( frames, 3, 'the animation loop runs on every frame' );
				assert.notStrictEqual( context.pending, null, 'the next frame is scheduled' );

			} );

			QUnit.test( 'onAnimationFrame: can be stopped from inside the animation loop', ( assert ) => {

				const context = new ContextMock();
				const animation = new WebGLAnimation();
				let frames = 0;

				animation.setContext( context );
				animation.setAnimationLoop( () => {

					frames ++;
					animation.stop();

				} );
				animation.start();

				for ( let i = 0; i < 3; i ++ ) {

					context.pump( i );

				}

				assert.strictEqual( frames, 1, 'the animation loop runs once' );
				assert.strictEqual( context.pending, null, 'no further frame is scheduled' );

			} );

		} );

	} );

} );
