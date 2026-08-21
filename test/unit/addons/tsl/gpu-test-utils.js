//
// GPU-native TSL unit test harness (prototype).
//
// The general approach -- exercising real shader code on the GPU and reading
// results back to the CPU to assert on them, rather than mocking the GPU away
// -- is based on the GPU testing method used in threeify:
// https://github.com/bhouston/threeify (see packages/core/src/shaders/tests/
// and packages/core/src/shaders/**/*.test.glsl). threeify renders a fullscreen
// quad and packs one pass/fail byte per pixel via `gl.readPixels()`, since
// WebGL2 has no compute shaders. This harness follows the same "one row per
// test" idea, but via TSL compute + storage-buffer readback (available here),
// which lets each row capture full raw values (not just a pass/fail bit) and
// resolve types automatically -- see below.
//
// Design: every assertion gets its own row, addressed by `instanceIndex`, in
// a pair of `vec4` storage buffers (`actual`/`expected`) -- one compute
// invocation per assertion. The CPU reads both buffers back and does the
// comparison + tolerance handling + diagnostic formatting itself, so failures
// report actual vs. expected values (and, for vectors, a per-component diff)
// instead of a bare test id.
//
// DX goal: tests should read like ordinary vitest/chai-style assertions --
//   assert.closeAbs( roundTrip, srgb, 1e-4 )
// with no manual test ids and no manually-declared value types. Types are
// resolved automatically by asking the *actual TSL node builder* what type
// an expression evaluates to (`node.getNodeType(builder)`), which is only
// available from inside a node's own `setup(builder)` -- so each assertion
// compiles down to a tiny custom Node (AssertWriteNode) whose setup() asks
// the builder for the real type and then writes it as a single zero-padded
// vec4, whatever that expression turns out to be (float, vec2, vec3, vec4 --
// matN is a documented follow-up, see below).
//
// Two entry points:
//   - gpuTest( name, buildFn )              -- N declarative assertions, one
//                                               compute invocation per
//                                               assertion (row = instanceIndex).
//   - gpuFuzzTest( name, count, buildFn )    -- assertions dispatched over
//                                               `count` instances, each free
//                                               to generate its own inputs
//                                               from `instanceIndex`
//                                               (property/fuzz-style testing
//                                               at GPU scale).
// Both run on WebGPU and WebGPURenderer's WebGL2 fallback backend, since both
// only ever write via the bare `instanceIndex` node -- the one write pattern
// transform-feedback-based backends (WebGL2 fallback) support. Confirmed
// empirically: any write target other than the bare `instanceIndex` node
// (e.g. an arithmetic offset, or a JS-constant index) collapses onto slot 0
// there instead of landing at the requested offset. gpuTest gets one
// distinct expression per row despite that constraint by guarding each
// assertion's write with `If( instanceIndex.equal( row ), ... )` -- only the
// invocation whose `instanceIndex` matches that row ever takes the branch, so
// the actual write is still always to the bare `instanceIndex`, just
// conditionally which value it carries.

import { Fn, If, instanceIndex, instancedArray, float, vec4 } from 'three/tsl';
import { WebGPURenderer } from 'three/webgpu';
import Node from '../../../../src/nodes/core/Node.js';
import { Stack } from '../../../../src/nodes/tsl/TSLCore.js';

export const Kind = {
	EQ: 'eq',
	CLOSE_ABS: 'closeAbs',
	CLOSE_REL: 'closeRel',
	GT: 'greaterThan',
	GE: 'greaterThanOrEqual',
	LT: 'lessThan',
	LE: 'lessThanOrEqual'
};

const SWIZZLE = [ 'x', 'y', 'z', 'w' ];

// Zero-pads `value` (a resolved-`count`-component node) out to a vec4, so it
// can be written with a single `.assign()` -- one write, whatever the real
// component count turns out to be.
function toVec4( value, count ) {

	if ( count === 4 ) return value;

	const components = [];

	for ( let i = 0; i < 4; i ++ ) {

		components.push( i < count ? float( count === 1 ? value : value[ SWIZZLE[ i ] ] ) : float( 0 ) );

	}

	return vec4( ...components );

}

// A statement node: at real shader-build time (setup(builder), when a real
// NodeBuilder -- and therefore real type information -- exists) it asks the
// builder what type `value1`/`value2` resolved to, and writes each as a
// single zero-padded vec4 to `actualBuffer`/`expectedBuffer` at `this.index`
// (always the bare `instanceIndex` node -- see file header). `resolvedType`/
// `resolvedCount` are stashed on the instance for the CPU harness to read
// back afterwards.
class AssertWriteNode extends Node {

	constructor( actualBuffer, expectedBuffer, index, value1, value2 ) {

		super( 'void' );

		this.actualBuffer = actualBuffer;
		this.expectedBuffer = expectedBuffer;
		this.index = index;
		this.value1 = value1;
		this.value2 = value2;

		this.resolvedType = null;
		this.resolvedCount = null;

	}

	setup( builder ) {

		const type1 = this.value1.getNodeType( builder );
		const type2 = this.value2.getNodeType( builder );

		if ( type1 !== type2 ) {

			throw new Error( `gpuTest: type mismatch -- comparing "${ type1 }" against "${ type2 }".` );

		}

		const count = builder.getTypeLength( type1 );

		if ( count > 4 ) {

			throw new Error( `gpuTest: type "${ type1 }" (${ count } components) is not supported yet -- matrix support is a follow-up.` );

		}

		this.resolvedType = type1;
		this.resolvedCount = count;

		this.actualBuffer.element( this.index ).assign( toVec4( this.value1, count ) );
		this.expectedBuffer.element( this.index ).assign( toVec4( this.value2, count ) );

		return undefined;

	}

}

// One shared renderer per backend, reused across all tests in the suite.
// `'webgpu'` is the real WebGPU backend (when available); `'webgl'` forces
// WebGPURenderer's WebGL2 fallback backend (`forceWebGL: true`), so the same
// TSL expression can be checked against both -- useful since not every node
// is (or needs to be) WebGL2-compatible, but most math/color/BRDF nodes are.
const BACKEND_OPTIONS = {
	webgpu: {},
	webgl: { forceWebGL: true }
};

// Cached per backend: a real renderer once `init()` succeeds, or `null` once
// it's failed -- some CI images can support one backend but not the other
// (confirmed in practice: WebGPU-via-software-Vulkan can work while a forced
// WebGL2 context comes back `null` in the same environment, or vice versa),
// so availability is detected empirically per backend rather than assumed.
const sharedRenderers = {};

async function getSharedRenderer( backend ) {

	if ( BACKEND_OPTIONS[ backend ] === undefined ) {

		throw new Error( `gpuTest: unknown backend "${ backend }" -- expected one of ${ Object.keys( BACKEND_OPTIONS ).join( ', ' ) }.` );

	}

	if ( sharedRenderers[ backend ] === undefined ) {

		const renderer = new WebGPURenderer( { antialias: false, ...BACKEND_OPTIONS[ backend ] } );

		try {

			await renderer.init();
			sharedRenderers[ backend ] = renderer;

		} catch ( error ) {

			console.warn( `gpu-test-utils: "${ backend }" backend is not available in this environment (${ error.message }) -- skipping tests that require it.` );
			sharedRenderers[ backend ] = null;

		}

	}

	return sharedRenderers[ backend ];

}

function diffComponents( actual, expected, tolerance, kind ) {

	const diffs = [];

	for ( let i = 0; i < expected.length; i ++ ) {

		const a = actual[ i ];
		const e = expected[ i ];
		let delta, bad;

		if ( kind === Kind.CLOSE_REL ) {

			delta = Math.abs( a - e ) / Math.max( Math.abs( a ), Math.abs( e ), 1e-12 );
			bad = delta > tolerance;

		} else if ( kind === Kind.CLOSE_ABS ) {

			delta = Math.abs( a - e );
			bad = delta > tolerance;

		} else if ( kind === Kind.GT ) {

			bad = ! ( a > e );
			delta = e - a;

		} else if ( kind === Kind.GE ) {

			bad = ! ( a >= e );
			delta = e - a;

		} else if ( kind === Kind.LT ) {

			bad = ! ( a < e );
			delta = a - e;

		} else if ( kind === Kind.LE ) {

			bad = ! ( a <= e );
			delta = a - e;

		} else { // EQ

			delta = Math.abs( a - e );
			bad = a !== e;

		}

		diffs.push( { index: i, actual: a, expected: e, delta, bad } );

	}

	return diffs;

}

const RELATIONAL_OPS = {
	[ Kind.GT ]: '>',
	[ Kind.GE ]: '>=',
	[ Kind.LT ]: '<',
	[ Kind.LE ]: '<='
};

function describeExpectation( d, kind, tolerance ) {

	const op = RELATIONAL_OPS[ kind ];

	if ( op !== undefined ) {

		return `expected ${ op } ${ d.expected.toFixed( 6 ) }, got ${ d.actual.toFixed( 6 ) }`;

	}

	const toleranceSuffix = kind === Kind.EQ ? '' : ` (Δ${ d.delta.toFixed( 6 ) }, tolerance ${ tolerance })`;
	return `expected ${ d.expected.toFixed( 6 ) }, got ${ d.actual.toFixed( 6 ) }${ toleranceSuffix }`;

}

function formatFailure( label, diffs, tolerance, kind ) {

	const bad = diffs.filter( ( d ) => d.bad );

	if ( bad.length === 0 ) return null;

	if ( diffs.length === 1 ) {

		return `${ label }: ${ describeExpectation( bad[ 0 ], kind, tolerance ) }`;

	}

	const lines = bad.map( ( d ) => `  [${ SWIZZLE[ d.index ] }]: ${ describeExpectation( d, kind, tolerance ) }` );
	const reason = RELATIONAL_OPS[ kind ] !== undefined ? 'fail the comparison' : `exceed tolerance ${ tolerance }`;

	return `${ label }: ${ bad.length }/${ diffs.length } components ${ reason }\n${ lines.join( '\n' ) }`;

}

function evaluateAssertion( assert, actual, expected, meta ) {

	const diffs = diffComponents( actual, expected, meta.tolerance, meta.kind );
	const failure = formatFailure( meta.label, diffs, meta.tolerance, meta.kind );

	assert.pushResult( {
		result: failure === null,
		actual: actual.length === 1 ? actual[ 0 ] : actual,
		expected: expected.length === 1 ? expected[ 0 ] : expected,
		message: failure || `${ meta.label }: OK`
	} );

}

// Builds the assertion object handed to test bodies -- names follow QUnit's
// own assertion terminology (`equal`/`notEqual` style: full words, no
// abbreviations) for the relational checks, alongside the tolerance-based
// `closeAbs`/`closeRel` pair. `makeNode(kind, tolerance)` returns a function
// that creates and registers an AssertWriteNode for one (value1, value2)
// pair; each concrete TSL entry point (gpuTest / gpuFuzzTest) supplies its
// own `makeNode` since the two differ in how a row is selected/populated.
function buildAssertAPI( makeNode ) {

	return {
		eq: ( actual, expected, message ) => makeNode( Kind.EQ, 0, message )( actual, expected ),
		closeAbs: ( actual, expected, tolerance, message ) => makeNode( Kind.CLOSE_ABS, tolerance, message )( actual, expected ),
		closeRel: ( actual, expected, tolerance, message ) => makeNode( Kind.CLOSE_REL, tolerance, message )( actual, expected ),
		greaterThan: ( actual, expected, message ) => makeNode( Kind.GT, 0, message )( actual, expected ),
		greaterThanOrEqual: ( actual, expected, message ) => makeNode( Kind.GE, 0, message )( actual, expected ),
		lessThan: ( actual, expected, message ) => makeNode( Kind.LT, 0, message )( actual, expected ),
		lessThanOrEqual: ( actual, expected, message ) => makeNode( Kind.LE, 0, message )( actual, expected )
	};

}

// Registers one QUnit.test per requested backend. When only one backend is
// requested (the default), the test name is left untouched; with more than
// one, each gets a `[backend]` suffix so failures say which backend failed.
// Backend availability is detected at runtime (see getSharedRenderer) rather
// than assumed, so no static "skip this backend" flag is needed here.
function declareTest( name, backends, run ) {

	for ( const backend of backends ) {

		const testName = backends.length > 1 ? `${ name } [${ backend }]` : name;

		QUnit.test( testName, async ( assert ) => {

			const renderer = await getSharedRenderer( backend );

			if ( renderer === null ) {

				// Availability can only be known after an async init() call,
				// so this can't use QUnit.skip() (which needs to be decided
				// at registration time) -- a clearly-labeled soft pass is the
				// practical equivalent: it never fails the build, and the
				// console.warn from getSharedRenderer explains why.
				assert.ok( true, `SKIPPED: "${ backend }" backend is not available in this environment.` );
				return;

			}

			await run( assert, renderer );

		} );

	}

}

// Shared by gpuTest and gpuFuzzTest: reads `actualBuffer`/`expectedBuffer`
// (vec4-typed, one row per `nodes` entry unless `rowOf` says otherwise) back
// and evaluates every collected AssertWriteNode against them.
async function readAndEvaluate( assert, renderer, nodes, actualBuffer, expectedBuffer, rowOf, labelOf ) {

	const actualData = new Float32Array( await renderer.getArrayBufferAsync( actualBuffer.value ) );
	const expectedData = new Float32Array( await renderer.getArrayBufferAsync( expectedBuffer.value ) );

	nodes.forEach( ( node, index ) => {

		const base = rowOf( node, index ) * 4;
		const count = node.resolvedCount;
		const actual = Array.from( actualData.slice( base, base + count ) );
		const expected = Array.from( expectedData.slice( base, base + count ) );

		evaluateAssertion( assert, actual, expected, {
			label: labelOf( node, index ),
			kind: node.kind,
			tolerance: node.tolerance
		} );

	} );

}

/**
 * Declare a GPU-native test suite. `buildFn` runs once (at graph-build time)
 * and receives `{ assert }` with `assert.eq/closeAbs/closeRel(actual, expected,
 * [tolerance], [message])`. Each assertion gets its own row (`vec4` pair),
 * dispatched as one compute invocation per row and guarded by
 * `If( instanceIndex.equal( row ), ... )` so only that invocation's write
 * actually commits -- see the file header for why that's required for
 * WebGL2 fallback compatibility. Every assertion is then decoded and checked
 * on the CPU with a full actual-vs-expected diagnostic on failure.
 *
 * `maxAssertions` (default 64) sizes the backing buffers and dispatch count
 * generously so callers don't need to pre-count assertions; override via the
 * options object if a suite exceeds it.
 *
 * `backends` (default `[ 'webgpu', 'webgl' ]`) selects which renderer
 * backend(s) to run the suite against -- both by default, so a backend
 * regression can't slip by unnoticed; narrow it (e.g. `[ 'webgpu' ]`) only
 * for a node that's deliberately WebGPU-only.
 */
export function gpuTest( name, buildFn, { maxAssertions = 64, backends = [ 'webgpu', 'webgl' ] } = {} ) {

	declareTest( name, backends, async ( assert, renderer ) => {

		const nodes = [];
		const actualBuffer = instancedArray( maxAssertions, 'vec4' );
		const expectedBuffer = instancedArray( maxAssertions, 'vec4' );

		const kernel = Fn( () => {

			const makeNode = ( kind, tolerance, message ) => ( value1, value2 ) => {

				if ( nodes.length >= maxAssertions ) {

					throw new Error( `gpuTest "${ name }": exceeded maxAssertions (${ maxAssertions }); pass a higher value via options.` );

				}

				const row = nodes.length;
				const node = new AssertWriteNode( actualBuffer, expectedBuffer, instanceIndex, value1, value2 );
				node.kind = kind;
				node.tolerance = tolerance;
				node.message = message;

				nodes.push( node );

				If( instanceIndex.equal( row ), () => {

					Stack( node );

				} );

			};

			buildFn( { assert: buildAssertAPI( makeNode ) } );

		} )().compute( maxAssertions );

		await renderer.computeAsync( kernel );

		await readAndEvaluate(
			assert, renderer, nodes, actualBuffer, expectedBuffer,
			( node, id ) => id,
			( node, id ) => node.message || `${ name } #${ id }`
		);

	} );

}

/**
 * Declare a GPU-native fuzz/property test: `buildFn` runs once (at graph-build
 * time) and is dispatched over `count` invocations, receiving `{ instanceIndex,
 * assert }` so it can derive per-invocation inputs from `instanceIndex` and
 * assert on them the same way as `gpuTest`.
 *
 * `maxSitesPerInstance` (default 4) bounds how many `assert.*` calls buildFn
 * may make per invocation; override via options if a test needs more. Each
 * site gets its own dedicated pair of buffers so sites never collide on a
 * single write.
 *
 * `backends` (default `[ 'webgpu', 'webgl' ]`) -- see `gpuTest`.
 */
export function gpuFuzzTest( name, count, buildFn, { maxSitesPerInstance = 4, backends = [ 'webgpu', 'webgl' ] } = {} ) {

	declareTest( name, backends, async ( assert, renderer ) => {

		const nodes = []; // one entry per call site (not per instance)
		const actualBuffers = [];
		const expectedBuffers = [];

		for ( let site = 0; site < maxSitesPerInstance; site ++ ) {

			actualBuffers.push( instancedArray( count, 'vec4' ) );
			expectedBuffers.push( instancedArray( count, 'vec4' ) );

		}

		const kernel = Fn( () => {

			const makeNode = ( kind, tolerance, message ) => ( value1, value2 ) => {

				const site = nodes.length;

				if ( site >= maxSitesPerInstance ) {

					throw new Error( `gpuFuzzTest "${ name }": exceeded maxSitesPerInstance (${ maxSitesPerInstance }); pass a higher value via options.` );

				}

				const node = new AssertWriteNode( actualBuffers[ site ], expectedBuffers[ site ], instanceIndex, value1, value2 );
				node.kind = kind;
				node.tolerance = tolerance;
				node.message = message;
				node.site = site;

				nodes.push( node );
				Stack( node );

			};

			buildFn( { instanceIndex, assert: buildAssertAPI( makeNode ) } );

		} )().compute( count );

		await renderer.computeAsync( kernel );

		// One buffer pair per site (not a single shared pair, unlike gpuTest),
		// so read each site's data back once and slice per instance below.
		const actualData = [];
		const expectedData = [];

		for ( const node of nodes ) {

			if ( actualData[ node.site ] === undefined ) {

				actualData[ node.site ] = new Float32Array( await renderer.getArrayBufferAsync( actualBuffers[ node.site ].value ) );
				expectedData[ node.site ] = new Float32Array( await renderer.getArrayBufferAsync( expectedBuffers[ node.site ].value ) );

			}

		}

		for ( let instance = 0; instance < count; instance ++ ) {

			for ( const node of nodes ) {

				const base = instance * 4;
				const componentCount = node.resolvedCount;
				const actual = Array.from( actualData[ node.site ].slice( base, base + componentCount ) );
				const expected = Array.from( expectedData[ node.site ].slice( base, base + componentCount ) );
				const label = node.message ? `${ name } #${ instance }: ${ node.message }` : `${ name } #${ instance }`;

				evaluateAssertion( assert, actual, expected, { label, kind: node.kind, tolerance: node.tolerance } );

			}

		}

	} );

}
