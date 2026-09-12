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
// the builder for the real type.
//
// Matrix support (mat2/mat3/mat4): a single `vec4` row can't hold all matrix values.
// A matrix value is represented as `columns` column-vectors (mat2: 2 x vec2,
// mat3: 3 x vec3, mat4: 4 x vec4 -- see `MATRIX_LAYOUT`/NodeBuilder.getElementType), each
// zero-padded to a vec4 exactly like a plain vector value. `AssertWriteNode`
// resolves this layout once real type info exists (`setup(builder)`) and
// then, for each column, calls a `writeColumn(c, actualVec4, expectedVec4)`
// callback supplied by the caller -- `gpuTest` and `gpuFuzzTest` each
// implement that callback differently, because they use two different
// addressing strategies (see each function's own comment below). Crucially,
// resource cost (buffer count / dispatch size) only grows where the caller
// chooses to pay for it -- a plain gpuTest scalar/vector assertion and a
// gpuFuzzTest site with the default options cost exactly what they did
// before matrices existed.
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
// there instead of landing at the requested offset. Also confirmed
// empirically: WebGL2's transform-feedback fallback only guarantees a small,
// fixed number of simultaneously-bound output buffers (the spec-minimum
// `MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS` is 4) -- so the number of
// storage buffers a kernel writes to is a hard resource budget, not just a
// memory-size concern; see `gpuFuzzTest`'s `maxColumnsPerSite` option below
// for where that budget is spent explicitly rather than by accident.

import { Fn, If, Stack, instanceIndex, instancedArray, float, vec4 } from 'three/tsl';
import { WebGPURenderer, Node } from 'three/webgpu';

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

// Matrix types are represented as `columns` column-vectors of `columnLength`
// components each (mat2: 2 x vec2, mat3: 3 x vec3, mat4: 4 x vec4) -- see gpu-test-utils.js
// file header and NodeBuilder.getTypeLength/getElementType.
const MATRIX_LAYOUT = {
	mat2: { columns: 2, columnLength: 2 },
	mat3: { columns: 3, columnLength: 3 },
	mat4: { columns: 4, columnLength: 4 }
};

// The widest supported type (mat4) needs 4 columns -- callers that reserve
// resources up front (gpuTest's per-assertion row stride, gpuFuzzTest's
// opt-in `maxColumnsPerSite`) size against this constant.
const MAX_COLUMNS = 4;

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

// Resolves how many "columns" a type needs and how long each column is.
// Vectors/scalars are a single column of their own length; matrices are
// `MATRIX_LAYOUT`-many columns of their own (shorter) length.
function resolveLayout( type, builder ) {

	const matrixLayout = MATRIX_LAYOUT[ type ];

	if ( matrixLayout !== undefined ) {

		return { columns: matrixLayout.columns, columnLength: matrixLayout.columnLength, isMatrix: true };

	}

	const count = builder.getTypeLength( type );

	if ( count > 4 ) {

		throw new Error( `gpuTest: type "${ type }" (${ count } components) is not supported -- only scalars, vecN, mat2, mat3 and mat4 are.` );

	}

	return { columns: 1, columnLength: count, isMatrix: false };

}

// A statement node: at real shader-build time (setup(builder), when a real
// NodeBuilder -- and therefore real type information -- exists) it asks the
// builder what type `value1`/`value2` resolved to, then hands each column
// (1 for scalars/vectors, 2 to 4 for matrices), zero-padded to a vec4, to
// the caller-supplied `writeColumn(columnIndex, actualVec4, expectedVec4)`.
// How -- and at what addressing cost -- a column actually gets written to a
// buffer is entirely up to `writeColumn`; see `gpuTest`/`gpuFuzzTest` for the
// two different strategies. `resolved*` fields are stashed on the instance
// for the CPU harness to read back afterwards.
class AssertWriteNode extends Node {

	constructor( writeColumn, value1, value2 ) {

		super( 'void' );

		this.writeColumn = writeColumn;
		this.value1 = value1;
		this.value2 = value2;

		this.resolvedType = null;
		this.resolvedColumns = null;
		this.resolvedColumnLength = null;
		this.resolvedIsMatrix = null;

	}

	get resolvedCount() {

		return this.resolvedColumns * this.resolvedColumnLength;

	}

	setup( builder ) {

		const type1 = this.value1.getNodeType( builder );
		const type2 = this.value2.getNodeType( builder );

		if ( type1 !== type2 ) {

			throw new Error( `gpuTest: type mismatch -- comparing "${ type1 }" against "${ type2 }".` );

		}

		const { columns, columnLength, isMatrix } = resolveLayout( type1, builder );

		if ( columns > MAX_COLUMNS ) {

			throw new Error( `gpuTest: type "${ type1 }" needs ${ columns } columns, more than the supported ${ MAX_COLUMNS }.` );

		}

		this.resolvedType = type1;
		this.resolvedColumns = columns;
		this.resolvedColumnLength = columnLength;
		this.resolvedIsMatrix = isMatrix;

		// Force value1/value2 to evaluate ONCE, here, unconditionally --
		// *before* any of writeColumn's per-column branching (an `If` per
		// column, for gpuTest's addressing scheme; see gpuTest's own comment).
		// Skipping this and reading `this.value1.element(c)` directly from
		// inside each column's conditional branch is a real, confirmed trap:
		// a node's generated value gets cached/declared in whichever branch
		// happens to build it first, so any *sibling* conditional branch that
		// references the same node sees an uninitialized (zero) variable
		// instead of re-evaluating it. `.toVar()` sidesteps this by forcing
		// the evaluation to happen up front, outside every branch, so each
		// column's branch only ever *reads* an already-computed variable.
		// (Recall multi-column values only arise for matrices here since
		// scalars/vectors are always a single column -- but `.toVar()` is
		// cheap and correct for those too, so it's applied unconditionally.)
		const v1 = this.value1.toVar();
		const v2 = this.value2.toVar();

		for ( let c = 0; c < columns; c ++ ) {

			const column1 = isMatrix ? v1.element( c ) : v1;
			const column2 = isMatrix ? v2.element( c ) : v2;

			this.writeColumn( c, toVec4( column1, columnLength ), toVec4( column2, columnLength ) );

		}

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

export async function getSharedRenderer( backend ) {

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

// Per-component labels for diagnostic output: swizzle letters for a plain
// vector/scalar (`x`, `y`, ...), or `col0.x`-style labels for a matrix, whose
// flattened component order is column-major (matching `resolveLayout`).
function componentLabels( columns, columnLength ) {

	if ( columns === 1 ) return SWIZZLE.slice( 0, columnLength );

	const labels = [];

	for ( let c = 0; c < columns; c ++ ) {

		for ( let r = 0; r < columnLength; r ++ ) {

			labels.push( `col${ c }.${ SWIZZLE[ r ] }` );

		}

	}

	return labels;

}

function describeExpectation( d, kind, tolerance ) {

	const op = RELATIONAL_OPS[ kind ];

	if ( op !== undefined ) {

		return `expected ${ op } ${ d.expected.toFixed( 6 ) }, got ${ d.actual.toFixed( 6 ) }`;

	}

	const toleranceSuffix = kind === Kind.EQ ? '' : ` (Δ${ d.delta.toFixed( 6 ) }, tolerance ${ tolerance })`;
	return `expected ${ d.expected.toFixed( 6 ) }, got ${ d.actual.toFixed( 6 ) }${ toleranceSuffix }`;

}

function formatFailure( label, diffs, tolerance, kind, labels ) {

	const bad = diffs.filter( ( d ) => d.bad );

	if ( bad.length === 0 ) return null;

	if ( diffs.length === 1 ) {

		return `${ label }: ${ describeExpectation( bad[ 0 ], kind, tolerance ) }`;

	}

	const lines = bad.map( ( d ) => `  [${ labels[ d.index ] }]: ${ describeExpectation( d, kind, tolerance ) }` );
	const reason = RELATIONAL_OPS[ kind ] !== undefined ? 'fail the comparison' : `exceed tolerance ${ tolerance }`;

	return `${ label }: ${ bad.length }/${ diffs.length } components ${ reason }\n${ lines.join( '\n' ) }`;

}

function evaluateAssertion( assert, actual, expected, meta ) {

	const labels = componentLabels( meta.columns, meta.columnLength );
	const diffs = diffComponents( actual, expected, meta.tolerance, meta.kind );
	const failure = formatFailure( meta.label, diffs, meta.tolerance, meta.kind, labels );

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
function rendererHasFeature( renderer, feature ) {

	return typeof renderer.hasFeature === 'function' && renderer.hasFeature( feature );

}

function declareTest( name, backends, requiredFeatures, run ) {

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

			const missingFeature = requiredFeatures.find( feature => rendererHasFeature( renderer, feature ) === false );

			if ( missingFeature !== undefined ) {

				assert.ok( true, `SKIPPED: "${ backend }" backend does not support "${ missingFeature }".` );
				return;

			}

			await run( assert, renderer );

		} );

	}

}

async function readBuffer( renderer, buffer ) {

	return new Float32Array( await renderer.getArrayBufferAsync( buffer.value ) );

}

// Detects a silent kernel-build/dispatch failure that would otherwise be
// invisible to the CPU-side harness. Confirmed root cause: when a compute
// pipeline fails to build (e.g. invalid WGSL/GLSL generated from a genuine
// TSL bug -- a `NaN` literal reaching a shader source position, say), the
// backing renderer (`WebGPURenderer`, on both its native WebGPU and WebGL2
// fallback paths) reports the failure asynchronously via a console
// error/"uncaptured device error" -- it does **not** reject the
// `computeAsync()` promise or throw. The dispatch that would have written
// this suite's `actual`/`expected` buffers simply never runs, so BOTH sides
// read back as their zero-initialized default -- not just `actual`, since
// `expected` is itself computed and written by the same (now-unrun) kernel,
// not supplied as a precomputed CPU-side constant. Every assertion in that
// kernel then silently compares `0` against `0` and passes, regardless of
// what it actually claimed to check -- confirmed by deliberately reproducing
// the exact shape of the original `pcurve()`/`sinc()` compile-failure bugs:
// a `gpuTest` block whose 3 assertions expected `0`, `0.5` and `1` reported
// all 3 as passing, because all 3 read back `0` against `0`.
//
// The fix: an unconditional "canary" write, in the *same* kernel, of a
// value that can't arise from an uninitialized (zero) buffer by chance. If
// the kernel fails to build, the canary is never written either (a shader
// module either compiles as a whole or not at all), and its absence proves
// the whole dispatch never ran -- so the caller can fail loudly instead of
// silently trusting a buffer that only *looks* like a real 0-vs-0 pass.
//
// The canary deliberately reuses one extra reserved row of a caller-supplied
// buffer (rather than allocating a dedicated buffer, which tipped some call
// sites over the WebGL2 fallback's tight simultaneously-bound-buffer budget)
// -- see `gpuTest`'s own comment for where that row lives and why. Wired
// into both `gpuTest` and `gpuFuzzTest`.
//
// The value itself is generated fresh per test x backend invocation (via
// `randomCanaryValue()`) rather than reused from one shared module-level
// constant -- confirmed necessary, not just defensive: a *shared* canary
// can't tell "this kernel ran" apart from "a different, still-bound kernel
// ran instead". Root cause, reproduced directly: when a kernel fails to
// link, the WebGL2 fallback logs the error but does not throw, and then
// calls `useProgram()` on the broken handle anyway -- which, per the WebGL
// spec, raises `INVALID_OPERATION` and leaves whatever program was
// *previously* bound still active, rather than unbinding it. If an earlier
// test in the same run already linked a valid compute kernel, the following
// transform-feedback draw silently reruns *that* kernel instead. With one
// constant canary shared by every kernel in the suite, that stale kernel's
// own canary write satisfies the check, and its self-consistent (but
// unrelated) `actual`/`expected` writes pass every assertion vacuously --
// confirmed by deliberately reproducing a `tsl_bitcast_uint_to_int` return
// type bug this way: a shader that failed to link at 0 fail every time,
// until run as the very first webgl kernel of the process (no valid prior
// program to fall back to), which correctly failed via this exact canary
// check. A per-invocation random value closes that gap: a stale kernel's
// own (different) canary can never satisfy what the current test expects to
// read back.
function randomCanaryValue() {

	// An integer, not an arbitrary float: buffers are float32, and integers
	// in this range round-trip through float32 exactly, so the readback
	// comparison below needs no tolerance window to absorb rounding.
	return 1000 + Math.floor( Math.random() * 9000 );

}

function writeCanary( buffer, row, canaryValue ) {

	If( instanceIndex.equal( row ), () => {

		buffer.element( instanceIndex ).assign( vec4( canaryValue, 0, 0, 0 ) );

	} );

}

// Takes an already-read `Float32Array` (not a buffer + renderer) rather than
// reading the canary's own host buffer a second time -- confirmed the WebGL2
// fallback's storage buffers are effectively single-read: a second
// `getArrayBufferAsync()` call against a buffer already read once earlier in
// the same test fails outright (`getBufferSubData: no buffer`). Every caller
// here already needs to read that same buffer's full data right afterwards
// anyway, so read once and pass the array to both.
function assertKernelRan( assert, data, row, canaryValue, name, kind = 'gpuTest' ) {

	const value = data[ row * 4 ];
	const ran = value === canaryValue;

	if ( ! ran ) {

		assert.pushResult( {
			result: false,
			actual: value,
			expected: canaryValue,
			message: `${ kind } "${ name }": compute kernel failed to build (canary mismatch -- got ${ value }, expected ${ canaryValue }).`
		} );

	}

	return ran;

}

/**
 * Declare a GPU-native test suite. `buildFn` runs once (at graph-build time)
 * and receives `{ assert }` with `assert.eq/closeAbs/closeRel(actual, expected,
 * [tolerance], [message])`.
 *
 * Addressing strategy: a single shared `actual`/`expected` buffer pair, sized
 * `maxAssertions * MAX_COLUMNS` rows -- every assertion reserves a fixed
 * `MAX_COLUMNS`-row stride (`row = assertionIndex * MAX_COLUMNS`), and only
 * uses as many of those rows as its resolved type needs (1 for a scalar/
 * vector, up to `MAX_COLUMNS` for a matrix). Each row is still written
 * only via the bare `instanceIndex` node, guarded by
 * `If( instanceIndex.equal( row ), ... )`, per the file header's WebGL2
 * addressing constraint. This costs a larger (but cheap: still just 2
 * buffers total) dispatch -- `maxAssertions * MAX_COLUMNS` compute
 * invocations -- rather than more simultaneously-bound buffers, which is
 * the resource that's actually scarce on the WebGL2 fallback.
 *
 * Supports scalars, vecN and mat2/mat3/mat4 -- see the file header's "Matrix
 * support" section.
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
export function gpuTest( name, buildFn, { maxAssertions = 64, backends = [ 'webgpu', 'webgl' ], requiredFeatures = [] } = {} ) {

	declareTest( name, backends, requiredFeatures, async ( assert, renderer ) => {

		const nodes = [];
		const totalRows = maxAssertions * MAX_COLUMNS;
		const actualBuffer = instancedArray( totalRows, 'vec4' );
		const expectedBuffer = instancedArray( totalRows, 'vec4' );

		// The *last* row is reserved for the "did this kernel actually run"
		// canary (see `writeCanary`/`assertKernelRan`) rather than a growing
		// the buffers/dispatch by one extra slot -- growing them (tried
		// first) silently overran the WebGL2 fallback's transform-feedback
		// vertex buffer sizing and crashed the whole test page, not just
		// this one test. Reusing an existing row costs exactly one
		// assertion's worth of capacity out of `maxAssertions`, with no
		// buffer-size or dispatch-count change at all.
		const canaryRow = totalRows - 1;
		const maxUsableAssertions = maxAssertions - 1;

		// Generated once per test x backend invocation, outside the Fn()
		// callback below (which can rebuild more than once -- see that
		// callback's own comment) so every rebuild embeds the same literal
		// -- see `randomCanaryValue()` for why this can't be a shared
		// module-level constant.
		const canaryValue = randomCanaryValue();

		const kernel = Fn( () => {

			// TSL callbacks passed to Fn()/If() are not guaranteed to run
			// exactly once -- three.js builds nodes across multiple stages
			// (setup/analyze/generate), and this callback can be invoked more
			// than once during that process. `nodes` is a side effect *outside*
			// the node graph (CPU-side bookkeeping: "which buffer row does
			// assertion N read back from"), so it has to be reset on every
			// invocation of this callback rather than accumulated across
			// invocations -- otherwise a second (or later) pass appends
			// duplicate/phantom entries whose `baseRow` never matches what the
			// *final* pass actually generated (confirmed: this is exactly what
			// broke the `gpuFuzzTest` canary attempt below -- see
			// tsl-unit-test-findings.md). Resetting here is safe specifically
			// because rebuilding is idempotent: each invocation walks buildFn
			// in the same order and recomputes identical baseRow values from
			// scratch, so only the *last* invocation's bookkeeping needs to
			// survive to match the actually-compiled kernel.
			nodes.length = 0;

			writeCanary( actualBuffer, canaryRow, canaryValue );

			const makeNode = ( kind, tolerance, message ) => ( value1, value2 ) => {

				if ( nodes.length >= maxUsableAssertions ) {

					throw new Error( `gpuTest "${ name }": exceeded maxAssertions (${ maxAssertions }); pass a higher value via options.` );

				}

				const baseRow = nodes.length * MAX_COLUMNS;

				const writeColumn = ( c, actualVec4, expectedVec4 ) => {

					If( instanceIndex.equal( baseRow + c ), () => {

						actualBuffer.element( instanceIndex ).assign( actualVec4 );
						expectedBuffer.element( instanceIndex ).assign( expectedVec4 );

					} );

				};

				const node = new AssertWriteNode( writeColumn, value1, value2 );
				node.kind = kind;
				node.tolerance = tolerance;
				node.message = message;
				node.baseRow = baseRow;

				nodes.push( node );

				Stack( node );

			};

			buildFn( { assert: buildAssertAPI( makeNode ), renderer, hasFeature: feature => rendererHasFeature( renderer, feature ) } );

		} )().compute( totalRows );

		await renderer.computeAsync( kernel );

		const actualData = await readBuffer( renderer, actualBuffer );
		const expectedData = await readBuffer( renderer, expectedBuffer );

		if ( ! assertKernelRan( assert, actualData, canaryRow, canaryValue, name ) ) return;

		nodes.forEach( ( node, id ) => {

			const actual = [];
			const expected = [];

			for ( let c = 0; c < node.resolvedColumns; c ++ ) {

				const base = ( node.baseRow + c ) * 4;
				actual.push( ...actualData.slice( base, base + node.resolvedColumnLength ) );
				expected.push( ...expectedData.slice( base, base + node.resolvedColumnLength ) );

			}

			evaluateAssertion( assert, actual, expected, {
				label: node.message || `${ name } #${ id }`,
				kind: node.kind,
				tolerance: node.tolerance,
				columns: node.resolvedColumns,
				columnLength: node.resolvedColumnLength
			} );

		} );

	} );

}

/**
 * Declare a GPU-native fuzz/property test: `buildFn` runs once (at graph-build
 * time) and is dispatched over `count` invocations, receiving `{ instanceIndex,
 * assert }` so it can derive per-invocation inputs from `instanceIndex` and
 * assert on them the same way as `gpuTest`.
 *
 * Addressing strategy: each call site gets its own dedicated set of
 * column-buffers (1 by default, up to `maxColumnsPerSite` -- see below), all
 * written *unconditionally* at the bare `instanceIndex` (which already
 * uniquely addresses "this fuzz instance", so no `If`-guard is needed here,
 * unlike `gpuTest`).
 *
 * `maxSitesPerInstance` (default 4) bounds how many `assert.*` calls buildFn
 * may make per invocation. `maxColumnsPerSite` (default 1) bounds how wide a
 * single site's value may be: 1 covers every scalar/vector type; pass 3 or 4
 * to allow a site to assert on a matrix. Both knobs spend the same scarce
 * resource -- WebGL2's fallback guarantees only a handful of simultaneously-
 * bound output buffers (spec minimum is 4) -- so `maxSitesPerInstance *
 * maxColumnsPerSite` total buffer pairs is a real budget, not just memory;
 * widen `maxColumnsPerSite` only for the sites that actually need it by
 * splitting matrix-asserting fuzz tests out from scalar/vector-heavy ones
 * rather than raising it globally.
 *
 * In practice the default of 4 sites is itself already close to some
 * software/CI WebGL2 implementations' actual (not just spec-guaranteed)
 * ceiling -- confirmed empirically: 3 simultaneous sites silently corrupted
 * one site's readback (to all-zero) on this project's sandboxed lavapipe
 * WebGL2 fallback, while 2 sites worked reliably. If a fuzz test with
 * several `assert.*` calls starts seeing implausible all-zero failures,
 * try splitting it into multiple smaller `gpuFuzzTest` calls before
 * suspecting the node under test.
 *
 * `backends` (default `[ 'webgpu', 'webgl' ]`) -- see `gpuTest`.
 */
export function gpuFuzzTest( name, count, buildFn, { maxSitesPerInstance = 4, maxColumnsPerSite = 1, backends = [ 'webgpu', 'webgl' ], requiredFeatures = [] } = {} ) {

	declareTest( name, backends, requiredFeatures, async ( assert, renderer ) => {

		const nodes = []; // one entry per call site (not per instance)
		const actualBuffers = []; // actualBuffers[site][column]
		const expectedBuffers = [];

		// The *last* fuzz instance is reserved for the "did this kernel
		// actually run" canary -- see `gpuTest`'s matching comment for why
		// this reuses an existing slot instead of growing the dispatch/
		// buffers by one (that overran the WebGL2 fallback's vertex buffer
		// sizing and crashed the whole page). This costs one real fuzz
		// instance out of `count`, negligible for the counts fuzz tests use.
		const canaryRow = count - 1;
		const maxUsableCount = count - 1;

		// See `gpuTest`'s matching comment: generated once per test x
		// backend invocation, not a shared module-level constant.
		const canaryValue = randomCanaryValue();

		for ( let site = 0; site < maxSitesPerInstance; site ++ ) {

			const actualColumns = [];
			const expectedColumns = [];

			for ( let c = 0; c < maxColumnsPerSite; c ++ ) {

				actualColumns.push( instancedArray( count, 'vec4' ) );
				expectedColumns.push( instancedArray( count, 'vec4' ) );

			}

			actualBuffers.push( actualColumns );
			expectedBuffers.push( expectedColumns );

		}

		const kernel = Fn( () => {

			writeCanary( actualBuffers[ 0 ][ 0 ], canaryRow, canaryValue );

			const makeNode = ( kind, tolerance, message ) => ( value1, value2 ) => {

				const site = nodes.length;

				if ( site >= maxSitesPerInstance ) {

					throw new Error( `gpuFuzzTest "${ name }": exceeded maxSitesPerInstance (${ maxSitesPerInstance }); pass a higher value via options.` );

				}

				const writeColumn = ( c, actualVec4, expectedVec4 ) => {

					if ( c >= maxColumnsPerSite ) {

						throw new Error( `gpuFuzzTest "${ name }": a value at site ${ site } needs column ${ c + 1 }, more than maxColumnsPerSite (${ maxColumnsPerSite }); raise that option to assert on wider values (e.g. matrices).` );

					}

					actualBuffers[ site ][ c ].element( instanceIndex ).assign( actualVec4 );
					expectedBuffers[ site ][ c ].element( instanceIndex ).assign( expectedVec4 );

				};

				const node = new AssertWriteNode( writeColumn, value1, value2 );
				node.kind = kind;
				node.tolerance = tolerance;
				node.message = message;
				node.site = site;

				nodes.push( node );
				Stack( node );

			};

			// Guarded so the canary's reserved last instance never also runs
			// buildFn's real per-instance writes (which would overwrite the
			// canary value it just wrote, and would be an out-of-bounds
			// concern if any buffer were sized tighter than `count`).
			//
			// Critically, THIS callback -- not the outer Fn() callback -- is
			// the one TSL invokes more than once during node-graph
			// construction (confirmed empirically: nesting `buildFn` inside
			// an extra `If()` like this is exactly what triggers a second
			// build pass over it here). `nodes`/`site` numbering is a side
			// effect outside the node graph, so it has to be reset at the
			// start of *this specific* callback -- not just once at the top
			// of the outer Fn() -- or a second pass appends a phantom
			// duplicate site whose buffer the final compiled kernel never
			// actually writes (confirmed root cause of the "Cannot read
			// properties of undefined (reading 'size')" failure recorded in
			// tsl-unit-test-findings.md). Resetting here is safe because
			// rebuilding is idempotent: each invocation walks buildFn in the
			// same order and recomputes identical site numbers from scratch.
			If( instanceIndex.lessThan( maxUsableCount ), () => {

				nodes.length = 0;

				buildFn( { instanceIndex, assert: buildAssertAPI( makeNode ), renderer, hasFeature: feature => rendererHasFeature( renderer, feature ) } );

			} );

		} )().compute( count );

		await renderer.computeAsync( kernel );

		// One set of column-buffers per site (not shared across sites, unlike
		// gpuTest's shared buffer), so read each site's data back once and
		// slice per instance below. Site 0 is read unconditionally (even if
		// buildFn made zero assert.* calls) since that's the canary's host
		// buffer, and assertKernelRan needs its already-read data -- see
		// assertKernelRan's own comment for why it must not be read twice.
		const actualData = [];
		const expectedData = [];

		actualData[ 0 ] = await Promise.all( actualBuffers[ 0 ].map( ( buf ) => readBuffer( renderer, buf ) ) );
		expectedData[ 0 ] = await Promise.all( expectedBuffers[ 0 ].map( ( buf ) => readBuffer( renderer, buf ) ) );

		if ( ! assertKernelRan( assert, actualData[ 0 ][ 0 ], canaryRow, canaryValue, name, 'gpuFuzzTest' ) ) return;

		for ( const node of nodes ) {

			if ( actualData[ node.site ] === undefined ) {

				actualData[ node.site ] = await Promise.all( actualBuffers[ node.site ].map( ( buf ) => readBuffer( renderer, buf ) ) );
				expectedData[ node.site ] = await Promise.all( expectedBuffers[ node.site ].map( ( buf ) => readBuffer( renderer, buf ) ) );

			}

		}

		for ( let instance = 0; instance < maxUsableCount; instance ++ ) {

			for ( const node of nodes ) {

				const actual = [];
				const expected = [];

				for ( let c = 0; c < node.resolvedColumns; c ++ ) {

					const base = instance * 4;
					actual.push( ...actualData[ node.site ][ c ].slice( base, base + node.resolvedColumnLength ) );
					expected.push( ...expectedData[ node.site ][ c ].slice( base, base + node.resolvedColumnLength ) );

				}

				const label = node.message ? `${ name } #${ instance }: ${ node.message }` : `${ name } #${ instance }`;

				evaluateAssertion( assert, actual, expected, {
					label,
					kind: node.kind,
					tolerance: node.tolerance,
					columns: node.resolvedColumns,
					columnLength: node.resolvedColumnLength
				} );

			}

		}

	} );

}
