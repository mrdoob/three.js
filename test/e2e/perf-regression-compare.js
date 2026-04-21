// Compare two perf-regression JSON runs and print a clean A/B table.
//
// Usage:
//   node test/e2e/perf-regression-compare.js <baseline-label> <candidate-label> <example>
//
// Reads:
//   test/e2e/perf-regression-<baseline-label>-<example>.json
//   test/e2e/perf-regression-<candidate-label>-<example>.json

import * as fs from 'node:fs/promises';

const [ , , baselineLabel, candidateLabel, example ] = process.argv;

if ( ! baselineLabel || ! candidateLabel || ! example ) {

	console.error( 'usage: node test/e2e/perf-regression-compare.js <baseline-label> <candidate-label> <example>' );
	process.exit( 1 );

}

const baseline = JSON.parse( await fs.readFile( `test/e2e/perf-regression-${ baselineLabel }-${ example }.json`, 'utf8' ) );
const candidate = JSON.parse( await fs.readFile( `test/e2e/perf-regression-${ candidateLabel }-${ example }.json`, 'utf8' ) );

const mb = v => v / 1024 / 1024;
const pad = ( s, n ) => String( s ).padStart( n );

function fmtPct( base, cand ) {

	if ( base === cand ) return '·';
	if ( base === 0 ) return 'new';
	return ( ( cand - base ) / Math.abs( base ) * 100 ).toFixed( 1 ) + '%';

}

function fmt( v, kind ) {

	if ( typeof v !== 'number' || ! Number.isFinite( v ) ) return String( v );
	if ( kind === 'bytes-mb' ) return mb( v ).toFixed( 2 );
	if ( kind === 'ms' ) return v.toFixed( 2 );
	if ( kind === 'int' ) return String( Math.round( v ) );
	return v.toFixed( 2 );

}

function arrow( base, cand ) {

	if ( base === cand ) return '·';
	return cand < base ? '▼' : '▲';

}

function row( name, path, kind = 'num' ) {

	const b = path.split( '.' ).reduce( ( a, k ) => a && a[ k ], baseline );
	const c = path.split( '.' ).reduce( ( a, k ) => a && a[ k ], candidate );
	const delta = c - b;
	const deltaStr = ( delta >= 0 ? '+' : '' ) + fmt( delta, kind );
	console.log(
		pad( name, 36 ), ' | ',
		pad( fmt( b, kind ), 12 ), ' | ',
		pad( fmt( c, kind ), 12 ), ' | ',
		pad( deltaStr + ' ' + arrow( b, c ), 14 ), ' | ',
		pad( fmtPct( b, c ), 8 )
	);

}

function section( title ) {

	console.log( '\n-- ' + title + ' --' );

}

console.log( `\nperf-regression: ${ example }` );
console.log( `  baseline:  ${ baselineLabel }` );
console.log( `  candidate: ${ candidateLabel }` );
console.log( `  duration:  ${ baseline.durationMs } ms (baseline), ${ candidate.durationMs } ms (candidate)\n` );

console.log( pad( 'metric', 36 ), ' | ', pad( baselineLabel, 12 ), ' | ', pad( candidateLabel, 12 ), ' | ', pad( 'Δ', 14 ), ' | ', pad( 'Δ %', 8 ) );
console.log( '-'.repeat( 36 ), '-+-', '-'.repeat( 12 ), '-+-', '-'.repeat( 12 ), '-+-', '-'.repeat( 14 ), '-+-', '-'.repeat( 8 ) );

section( 'Frame timing' );
row( 'fps (rAF)', 'fps' );
row( 'mean (ms)', 'frameTimeMs.mean', 'ms' );
row( 'p50 (ms)', 'frameTimeMs.p50', 'ms' );
row( 'p95 (ms)', 'frameTimeMs.p95', 'ms' );
row( 'p99 (ms)', 'frameTimeMs.p99', 'ms' );
row( 'max (ms)', 'frameTimeMs.max', 'ms' );

section( 'JS heap' );
row( 'min (MB)', 'jsHeapBytes.min', 'bytes-mb' );
row( 'mean (MB)', 'jsHeapBytes.mean', 'bytes-mb' );
row( 'max (MB)', 'jsHeapBytes.max', 'bytes-mb' );
row( 'growth (MB)', 'jsHeapBytes.growth', 'bytes-mb' );

section( 'GC' );
row( 'events', 'gc.events', 'int' );
row( 'events/s', 'gc.eventsPerSec' );
row( 'bytes freed (MB)', 'gc.totalFreedBytes', 'bytes-mb' );

section( 'WebGPU VRAM (estimated)' );
row( 'buffers+textures before (MB)', 'webgpu.estimatedVRAMBefore', 'bytes-mb' );
row( 'buffers+textures after (MB)', 'webgpu.estimatedVRAMAfter', 'bytes-mb' );
row( 'Δ over window (MB)', 'webgpu.estimatedVRAMDelta', 'bytes-mb' );

section( 'WebGPU resources (delta over window)' );
row( 'live buffers Δ', 'webgpu.liveBuffersDelta', 'int' );
row( 'live textures Δ', 'webgpu.liveTexturesDelta', 'int' );
row( 'bind groups (cumulative) Δ', 'webgpu.bindGroupsTotalDelta', 'int' );
row( 'samplers Δ', 'webgpu.samplersDelta', 'int' );

section( 'WebGPU resources (totals)' );
row( 'shader modules', 'webgpu.shaderModules', 'int' );
row( 'render pipelines', 'webgpu.renderPipelines', 'int' );
row( 'compute pipelines', 'webgpu.computePipelines', 'int' );
row( 'live buffers after', 'webgpu.liveBuffersAfter', 'int' );
row( 'live textures after', 'webgpu.liveTexturesAfter', 'int' );

section( 'WebGPU command rate (per frame)' );
row( 'submits/frame', 'webgpu.cmdSubmitsPerFrame' );
row( 'render passes/frame', 'webgpu.renderPassesPerFrame' );
row( 'compute passes/frame', 'webgpu.computePassesPerFrame' );

section( 'Errors' );
row( 'uncaptured WebGPU errors', 'webgpu.errors', 'int' );

console.log();
