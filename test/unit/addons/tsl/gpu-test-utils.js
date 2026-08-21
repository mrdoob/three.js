//
// GPU-native TSL unit test harness (prototype).
//
// The general approach -- exercising real shader code on the GPU and reading
// results back to the CPU to assert on them, rather than mocking the GPU away
// -- is based on the GPU testing method used in threeify:
// https://github.com/bhouston/threeify (see packages/core/src/shaders/tests/
// and packages/core/src/shaders/**/*.test.glsl). threeify renders a fullscreen
// quad and packs one pass/fail byte per pixel via `gl.readPixels()`, since
// WebGL2 has no compute shaders; this harness instead uses TSL compute +
// storage-buffer readback, which is available here, to capture full raw
// values (not just a pass/fail bit) and resolve types automatically -- see
// below for the specifics of that departure.
//
// Design: a compute kernel captures raw values (not pass/fail bits) into a flat
// float32 storage buffer, one fixed-stride "record" per assertion. The CPU reads
// the buffer back and does the comparison + tolerance handling + diagnostic
// formatting itself, so failures report actual vs. expected values (and, for
// vectors, a per-component diff) instead of a bare test id.
//
// DX goal: tests should read like ordinary vitest/chai-style assertions --
//   assert.closeAbs( roundTrip, srgb, 1e-4 )
// with no manual test ids and no manually-declared value types. Types are
// resolved automatically by asking the *actual TSL node builder* what type
// an expression evaluates to (`node.getNodeType(builder)`), which is only
// available from inside a node's own `setup(builder)` -- so each assertion
// compiles down to a tiny custom Node (AssertWriteNode) whose setup() asks
// the builder for the real type and then emits the right number of
// component writes, whatever that expression turns out to be (float, vec2,
// vec3, vec4 -- matN is a documented follow-up, see below).
//
// Two entry points:
//   - gpuTest( name, buildFn )                    -- N declarative assertions,
//                                                     one compute invocation.
//   - gpuFuzzTest( name, count, buildFn )          -- assertions dispatched
//                                                     over `count` instances,
//                                                     each free to generate
//                                                     its own inputs from
//                                                     `instanceIndex` (property/
//                                                     fuzz-style testing at
//                                                     GPU scale).
//
// Record layout (float32, fixed stride):
//   [0..3]  actual value   (up to vec4, zero-padded)
//   [4..7]  expected value (up to vec4, zero-padded)

import { Fn, instanceIndex, instancedArray, float } from 'three/tsl';
import { WebGPURenderer } from 'three/webgpu';
import Node from '../../../../src/nodes/core/Node.js';
import { Stack } from '../../../../src/nodes/tsl/TSLCore.js';

export const STRIDE = 8; // 4 floats per value, 2 values per record

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

// `offset` may be a plain JS number (compile-time constant, gpuTest's case)
// or a TSL node (instanceIndex-derived, gpuFuzzTest's case).
function addOffset( offset, i ) {

	return typeof offset === 'number' ? offset + i : offset.add( i );

}

// A statement node: at real shader-build time (setup(builder), when a real
// NodeBuilder -- and therefore real type information -- exists) it asks the
// builder what type `value1`/`value2` resolved to, and writes their
// components into `buffer` at `base`/`base+4`. `resolvedType`/`resolvedCount`
// are stashed on the instance for the CPU harness to read back afterwards.
class AssertWriteNode extends Node {

	constructor( buffer, base, value1, value2 ) {

		super( 'void' );

		this.buffer = buffer;
		this.base = base;
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

		if ( count === 1 ) {

			this.buffer.element( this.base ).assign( float( this.value1 ) );
			this.buffer.element( addOffset( this.base, 4 ) ).assign( float( this.value2 ) );

		} else {

			for ( let i = 0; i < count; i ++ ) {

				this.buffer.element( addOffset( this.base, i ) ).assign( float( this.value1[ SWIZZLE[ i ] ] ) );
				this.buffer.element( addOffset( this.base, 4 + i ) ).assign( float( this.value2[ SWIZZLE[ i ] ] ) );

			}

		}

		return undefined;

	}

}

let sharedRenderer = null;

async function getSharedRenderer() {

	if ( sharedRenderer === null ) {

		sharedRenderer = new WebGPURenderer( { antialias: false } );
		await sharedRenderer.init();

	}

	return sharedRenderer;

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

function assertRecord( assert, data, id, meta ) {

	const base = id * STRIDE;
	const count = meta.count;
	const actual = Array.from( data.slice( base, base + count ) );
	const expected = Array.from( data.slice( base + 4, base + 4 + count ) );

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
// own `makeNode` since the two differ in how they compute `base`.
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

/**
 * Declare a GPU-native test suite. `buildFn` runs once (at graph-build time)
 * and receives `{ assert }` with `assert.eq/closeAbs/closeRel(actual, expected,
 * [tolerance], [message])`; the whole suite executes as a single compute
 * invocation, then every assertion is decoded and checked on the CPU with a
 * full actual-vs-expected diagnostic on failure.
 *
 * `maxAssertions` (default 64) sizes the backing buffer generously so callers
 * don't need to pre-count assertions; override via the options object if a
 * suite exceeds it.
 */
export function gpuTest( name, buildFn, { maxAssertions = 64 } = {} ) {

	QUnit.test( name, async ( assert ) => {

		const renderer = await getSharedRenderer();

		const nodes = [];
		const buffer = instancedArray( maxAssertions * STRIDE, 'float' );

		const kernel = Fn( () => {

			const makeNode = ( kind, tolerance, message ) => ( value1, value2 ) => {

				if ( nodes.length >= maxAssertions ) {

					throw new Error( `gpuTest "${ name }": exceeded maxAssertions (${ maxAssertions }); pass a higher value via options.` );

				}

				const base = nodes.length * STRIDE;
				const node = new AssertWriteNode( buffer, base, value1, value2 );
				node.kind = kind;
				node.tolerance = tolerance;
				node.message = message;

				nodes.push( node );
				Stack( node );

			};

			buildFn( { assert: buildAssertAPI( makeNode ) } );

		} )().compute( 1 );

		await renderer.computeAsync( kernel );

		const data = new Float32Array( await renderer.getArrayBufferAsync( buffer.value ) );

		nodes.forEach( ( node, id ) => {

			assertRecord( assert, data, id, {
				label: node.message || `${ name } #${ id }`,
				kind: node.kind,
				tolerance: node.tolerance,
				count: node.resolvedCount
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
 * `maxSitesPerInstance` (default 4) bounds how many `assert.*` calls buildFn
 * may make per invocation; override via options if a test needs more.
 */
export function gpuFuzzTest( name, count, buildFn, { maxSitesPerInstance = 4 } = {} ) {

	QUnit.test( name, async ( assert ) => {

		const renderer = await getSharedRenderer();

		const nodes = []; // one entry per call site (not per instance)
		const buffer = instancedArray( count * maxSitesPerInstance * STRIDE, 'float' );

		const kernel = Fn( () => {

			const makeNode = ( kind, tolerance, message ) => ( value1, value2 ) => {

				const site = nodes.length;

				if ( site >= maxSitesPerInstance ) {

					throw new Error( `gpuFuzzTest "${ name }": exceeded maxSitesPerInstance (${ maxSitesPerInstance }); pass a higher value via options.` );

				}

				const base = instanceIndex.mul( maxSitesPerInstance ).add( site ).mul( STRIDE );
				const node = new AssertWriteNode( buffer, base, value1, value2 );
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

		const data = new Float32Array( await renderer.getArrayBufferAsync( buffer.value ) );

		for ( let instance = 0; instance < count; instance ++ ) {

			for ( const node of nodes ) {

				const id = instance * maxSitesPerInstance + node.site;
				const label = node.message ? `${ name } #${ instance }: ${ node.message }` : `${ name } #${ instance }`;

				assertRecord( assert, data, id, {
					label,
					kind: node.kind,
					tolerance: node.tolerance,
					count: node.resolvedCount
				} );

			}

		}

	} );

}
