// Perf/VRAM regression harness for WebGPU examples (single-run mode).
//
// Usage:
//   node test/e2e/perf-regression.js <label> <example> [durationMs] [warmupMs]
//
// Collects per-window: JS heap (used/total), frame timing (rAF), GC events,
// and WebGPU resource counts via a minimal API interceptor. Dumps JSON to
// test/e2e/perf-regression-<label>-<example>.json.
//
// Compare two runs with test/e2e/perf-regression-compare.js, or let
// test/e2e/perf-regression-orchestrator.js drive multi-iteration A/B gating.
//
// All injection + collection logic lives in ./perf-collector.js so the
// orchestrator and this single-run script measure identical things.

import puppeteer from 'puppeteer';
import * as fs from 'node:fs/promises';
import { createServer } from '../../utils/server.js';
import { attachPerfInjection, collectIteration, buildSummary } from './perf-collector.js';

const [ , , label, example, durationArg, warmupArg ] = process.argv;

if ( ! label || ! example ) {

	console.error( 'usage: node test/e2e/perf-regression.js <label> <example> [durationMs=10000] [warmupMs=3000]' );
	process.exit( 1 );

}

const port = parseInt( process.env.PERF_PORT, 10 ) || 1240;
const duration = parseInt( durationArg, 10 ) || 10_000;
const warmup = parseInt( warmupArg, 10 ) || 3_000;

const server = createServer();
await new Promise( r => server.listen( port, r ) );

const browser = await puppeteer.launch( {
	headless: 'new',
	args: [
		'--enable-unsafe-webgpu',
		'--ignore-gpu-blocklist',
		'--disable-gpu-driver-bug-workarounds',
		'--no-sandbox',
		'--enable-precise-memory-info',
		// Uncap rAF so FPS reflects the renderer's true throughput.
		'--disable-frame-rate-limit',
		'--disable-gpu-vsync'
	],
	defaultViewport: { width: 1280, height: 720 },
	protocolTimeout: 0
} );

const page = await browser.newPage();
await attachPerfInjection( page );

page.on( 'pageerror', err => console.error( `[page error] ${ err.message }` ) );
page.on( 'console', msg => { if ( msg.type() === 'error' ) console.error( `[page console.error] ${ msg.text() }` ); } );

const { raw, before, after } = await collectIteration( page, {
	url: `http://localhost:${ port }/examples/${ example }.html`,
	warmup,
	duration,
	onLog: m => console.log( `[${ label }] ${ m }` )
} );

await browser.close();
server.close();

const summary = buildSummary( raw, before, after, {
	label, example, durationMs: duration, warmupMs: warmup
} );

const filename = `test/e2e/perf-regression-${ label }-${ example }.json`;
await fs.writeFile( filename, JSON.stringify( summary, null, 2 ) );

console.log( `\n[${ label }] wrote ${ filename }` );
console.log( JSON.stringify( summary, null, 2 ) );

process.exit( 0 );
