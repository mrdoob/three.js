const FRAMEBUFFER = 0x8D40;
const READ_FRAMEBUFFER = 0x8CA8;
const DRAW_FRAMEBUFFER = 0x8CA9;

const knownConstants = {
	FRAMEBUFFER,
	READ_FRAMEBUFFER,
	DRAW_FRAMEBUFFER,
	VERSION: 0x1F02,
	MAX_COMBINED_TEXTURE_IMAGE_UNITS: 0x8B4D,
	MAX_TEXTURE_IMAGE_UNITS: 0x8872,
	SCISSOR_BOX: 0x0C10,
	VIEWPORT: 0x0BA2,
	TEXTURE_2D: 0x0DE1,
	TEXTURE_CUBE_MAP: 0x8513,
	TEXTURE_3D: 0x806F,
	TEXTURE_2D_ARRAY: 0x8C1A,
	TEXTURE_CUBE_MAP_POSITIVE_X: 0x8515,
	TEXTURE_CUBE_MAP_NEGATIVE_Z: 0x851A
};

export function createWebGLStateRecorder() {

	const calls = [];
	const actual = { read: null, draw: null };
	const constants = new Map( Object.entries( knownConstants ) );
	const methods = new Map();
	let nextConstant = 0x10000;

	const target = {
		canvas: { width: 1, height: 1 },

		getParameter( pname ) {

			if ( pname === knownConstants.VERSION ) return 'WebGL 2.0';

			if ( pname === knownConstants.MAX_COMBINED_TEXTURE_IMAGE_UNITS ||
				pname === knownConstants.MAX_TEXTURE_IMAGE_UNITS ) return 16;

			if ( pname === knownConstants.SCISSOR_BOX ||
				pname === knownConstants.VIEWPORT ) return [ 0, 0, 1, 1 ];

			return 0;

		},

		createTexture() {

			return {};

		},

		bindFramebuffer( bindTarget, framebuffer ) {

			framebuffer = framebuffer ?? null;
			calls.push( { target: bindTarget, framebuffer } );

			switch ( bindTarget ) {

				case FRAMEBUFFER:
					actual.read = framebuffer;
					actual.draw = framebuffer;
					break;

				case READ_FRAMEBUFFER:
					actual.read = framebuffer;
					break;

				case DRAW_FRAMEBUFFER:
					actual.draw = framebuffer;
					break;

				default:
					throw new Error( `Unexpected framebuffer target: ${ bindTarget }` );

			}

		}
	};

	const gl = new Proxy( target, {

		get( object, property ) {

			if ( property in object ) return object[ property ];

			if ( typeof property !== 'string' ) return undefined;

			if ( /^[A-Z][A-Z0-9_]*$/.test( property ) ) {

				if ( constants.has( property ) === false ) {

					constants.set( property, nextConstant ++ );

				}

				return constants.get( property );

			}

			if ( methods.has( property ) === false ) {

				methods.set( property, () => {} );

			}

			return methods.get( property );

		}

	} );

	return {
		gl,
		calls,
		get actualRead() {

			return actual.read;

		},
		get actualDraw() {

			return actual.draw;

		},
		clearCalls() {

			calls.length = 0;

		}
	};

}

export function runFramebufferCacheTests( createState ) {

	function createHarness() {

		const recorder = createWebGLStateRecorder();
		const state = createState( recorder );
		recorder.clearCalls();

		return { state, recorder };

	}

	QUnit.test( 'FRAMEBUFFER bindings synchronize the READ cache', ( assert ) => {

		const { state, recorder } = createHarness();
		const { gl } = recorder;
		const scene = { name: 'scene' };
		const copy = { name: 'copy' };

		state.bindFramebuffer( gl.READ_FRAMEBUFFER, scene );
		assert.strictEqual( recorder.actualRead, scene, 'READ_FRAMEBUFFER binds the read target.' );
		assert.strictEqual( recorder.actualDraw, null, 'READ_FRAMEBUFFER leaves the draw target unchanged.' );

		state.bindFramebuffer( gl.FRAMEBUFFER, copy );
		assert.strictEqual( recorder.actualRead, copy, 'FRAMEBUFFER updates the actual read target.' );
		assert.strictEqual( recorder.actualDraw, copy, 'FRAMEBUFFER updates the actual draw target.' );

		state.bindFramebuffer( gl.FRAMEBUFFER, null );
		recorder.clearCalls();

		const bound = state.bindFramebuffer( gl.READ_FRAMEBUFFER, scene );

		assert.true( bound, 'The final READ_FRAMEBUFFER request executes a GL bind.' );
		assert.strictEqual( recorder.actualRead, scene, 'The actual READ binding is the requested scene framebuffer.' );
		assert.strictEqual( recorder.actualDraw, null, 'The actual DRAW binding remains unchanged.' );
		assert.deepEqual( recorder.calls, [
			{ target: gl.READ_FRAMEBUFFER, framebuffer: scene }
		], 'Exactly one READ_FRAMEBUFFER bind is issued.' );

	} );

	QUnit.test( 'FRAMEBUFFER bindings are not skipped when READ differs', ( assert ) => {

		const { state, recorder } = createHarness();
		const { gl } = recorder;
		const scene = { name: 'scene' };
		const other = { name: 'other' };

		state.bindFramebuffer( gl.DRAW_FRAMEBUFFER, scene );
		state.bindFramebuffer( gl.READ_FRAMEBUFFER, other );
		recorder.clearCalls();

		const bound = state.bindFramebuffer( gl.FRAMEBUFFER, scene );

		assert.true( bound, 'The FRAMEBUFFER request executes a GL bind.' );
		assert.strictEqual( recorder.actualRead, scene, 'FRAMEBUFFER updates the actual read target.' );
		assert.strictEqual( recorder.actualDraw, scene, 'FRAMEBUFFER updates the actual draw target.' );
		assert.deepEqual( recorder.calls, [
			{ target: gl.FRAMEBUFFER, framebuffer: scene }
		], 'Exactly one FRAMEBUFFER bind is issued.' );

	} );

	QUnit.test( 'FRAMEBUFFER bindings keep all cached targets consistent', ( assert ) => {

		const { state, recorder } = createHarness();
		const { gl } = recorder;
		const scene = { name: 'scene' };

		state.bindFramebuffer( gl.FRAMEBUFFER, scene );
		recorder.clearCalls();

		assert.false( state.bindFramebuffer( gl.FRAMEBUFFER, scene ), 'A repeated FRAMEBUFFER bind is skipped.' );
		assert.false( state.bindFramebuffer( gl.READ_FRAMEBUFFER, scene ), 'A READ bind already satisfied by FRAMEBUFFER is skipped.' );
		assert.false( state.bindFramebuffer( gl.DRAW_FRAMEBUFFER, scene ), 'A DRAW bind already satisfied by FRAMEBUFFER is skipped.' );
		assert.deepEqual( recorder.calls, [], 'No redundant framebuffer binds are issued.' );

	} );

	QUnit.test( 'DRAW_FRAMEBUFFER bindings do not overwrite the READ cache', ( assert ) => {

		const { state, recorder } = createHarness();
		const { gl } = recorder;
		const scene = { name: 'scene' };
		const other = { name: 'other' };

		state.bindFramebuffer( gl.FRAMEBUFFER, scene );
		state.bindFramebuffer( gl.DRAW_FRAMEBUFFER, other );
		recorder.clearCalls();

		const bound = state.bindFramebuffer( gl.READ_FRAMEBUFFER, other );

		assert.true( bound, 'The READ request executes a GL bind.' );
		assert.strictEqual( recorder.actualRead, other, 'The actual READ binding is updated.' );
		assert.strictEqual( recorder.actualDraw, other, 'The actual DRAW binding remains unchanged.' );
		assert.deepEqual( recorder.calls, [
			{ target: gl.READ_FRAMEBUFFER, framebuffer: other }
		], 'Exactly one READ_FRAMEBUFFER bind is issued.' );

	} );

	QUnit.test( 'READ_FRAMEBUFFER bindings do not overwrite the DRAW cache', ( assert ) => {

		const { state, recorder } = createHarness();
		const { gl } = recorder;
		const scene = { name: 'scene' };
		const other = { name: 'other' };

		state.bindFramebuffer( gl.FRAMEBUFFER, scene );
		state.bindFramebuffer( gl.READ_FRAMEBUFFER, other );
		recorder.clearCalls();

		const bound = state.bindFramebuffer( gl.DRAW_FRAMEBUFFER, other );

		assert.true( bound, 'The DRAW request executes a GL bind.' );
		assert.strictEqual( recorder.actualDraw, other, 'The actual DRAW binding is updated.' );
		assert.strictEqual( recorder.actualRead, other, 'The actual READ binding remains unchanged.' );
		assert.deepEqual( recorder.calls, [
			{ target: gl.DRAW_FRAMEBUFFER, framebuffer: other }
		], 'Exactly one DRAW_FRAMEBUFFER bind is issued.' );

	} );

	QUnit.test( 'reset does not leave stale framebuffer cache entries', ( assert ) => {

		const { state, recorder } = createHarness();
		const { gl } = recorder;
		const scene = { name: 'scene' };
		const copy = { name: 'copy' };

		state.bindFramebuffer( gl.READ_FRAMEBUFFER, scene );
		state.bindFramebuffer( gl.FRAMEBUFFER, copy );
		state.reset();
		recorder.clearCalls();

		assert.strictEqual( recorder.actualRead, null, 'reset binds the actual READ target to null.' );
		assert.strictEqual( recorder.actualDraw, null, 'reset binds the actual DRAW target to null.' );

		const bound = state.bindFramebuffer( gl.READ_FRAMEBUFFER, scene );

		assert.true( bound, 'A READ bind after reset executes a GL bind.' );
		assert.strictEqual( recorder.actualRead, scene, 'The actual READ binding is the requested framebuffer.' );
		assert.strictEqual( recorder.actualDraw, null, 'The actual DRAW binding remains null.' );
		assert.deepEqual( recorder.calls, [
			{ target: gl.READ_FRAMEBUFFER, framebuffer: scene }
		], 'Exactly one READ_FRAMEBUFFER bind is issued after reset.' );

	} );

}
