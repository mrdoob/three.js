// Perf regression orchestrator.
//
// Usage:
//   node test/e2e/perf-regression-orchestrator.js <example> \
//     [--baseline=dev] [--min-iterations=4] [--max-iterations=5] \
//     [--duration=8000] [--warmup=3000] [--port-base=1240] [--k=3] \
//     [--force-build] [--no-build]
//
// Example:
//   node test/e2e/perf-regression-orchestrator.js _perf_backdrop_water_noinspector
//
// Candidate = the live working tree (whatever you've got checked out, including
// uncommitted changes). Baseline = a detached worktree pinned at --baseline.
//
// Speed-oriented design:
//   - Parallel baseline-worktree setup + builds (runs concurrently with candidate build).
//   - Build-SHA cache: reruns against the same baseline SHA skip `npm run build`.
//   - Persistent browsers (one per side) + in-process servers (one per root).
//     Only a new Page is created per iteration — no Chromium relaunch, no Node spawn.
//   - Adaptive iteration count: fast-path exit at n=1/n=2, MAD gate at n>=3.
//   - Iteration 1 per side is warmup (cold JIT / pipeline cache) and dropped.
//
// Stability knobs (all carried over from test/e2e/puppeteer.js):
//   - Lavapipe software WebGPU via VK_DRIVER_FILES.
//   - Shared CI flag set.
//   - Deterministic Math.random seed (no RAF / now stub — we need real timing).
//   - Interleaved iterations (base, cand, base, cand, …) to cancel drift.

import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import { createServer } from '../../utils/server.js';
import { attachPerfInjection, collectIteration, buildSummary } from './perf-collector.js';

// Surface any unhandled rejection with a clear stack and a distinctive prefix,
// so CI logs point at the real cause instead of just "Process completed with
// exit code 1" and a missing summary file downstream.
process.on( 'unhandledRejection', ( reason ) => {

	console.error( '\n[orch] FATAL unhandled rejection:' );
	console.error( reason && reason.stack ? reason.stack : reason );
	process.exit( 1 );

} );
process.on( 'uncaughtException', ( err ) => {

	console.error( '\n[orch] FATAL uncaught exception:' );
	console.error( err.stack || err );
	process.exit( 1 );

} );

// --- args -------------------------------------------------------------------

const argv = process.argv.slice( 2 );
const positional = argv.filter( a => ! a.startsWith( '--' ) );
const flags = Object.fromEntries( argv.filter( a => a.startsWith( '--' ) )
	.map( a => a.replace( /^--/, '' ).split( '=' ) )
	.map( ( [ k, v ] ) => [ k, v === undefined ? true : v ] ) );

const baselineRef = flags.baseline || 'dev';

if ( positional.length === 0 ) {

	console.error( 'usage: node test/e2e/perf-regression-orchestrator.js <example> [--baseline=dev] [--min-iterations=N] [--max-iterations=N] [--duration=ms] [--warmup=ms] [--k=3] [--force-build] [--no-build]' );
	process.exit( 1 );

}

if ( positional.length > 1 ) {

	// The old CLI accepted `<baseline-ref> <candidate-ref> <example>`. Silently
	// treating positional[0] as the example leads to "no such HTML file" later,
	// after an expensive build. Fail early with a migration hint instead.
	console.error( `ERROR: too many positional args: ${ JSON.stringify( positional ) }` );
	console.error( `The CLI now takes only <example>. Baseline is set via --baseline=<ref> (default "dev").` );
	console.error( `Candidate is always the live working tree.` );
	console.error( `Example:  node test/e2e/perf-regression-orchestrator.js ${ positional[ positional.length - 1 ] } --baseline=${ positional[ 0 ] }` );
	process.exit( 1 );

}

const [ example ] = positional;

// Verify the example HTML exists in the live tree before spending time on
// builds + iterations. (In CI the live tree is the PR branch; locally it's cwd.)
try {

	await fs.access( path.join( process.cwd(), 'examples', `${ example }.html` ) );

} catch ( _ ) {

	console.error( `ERROR: examples/${ example }.html does not exist.` );
	console.error( `Did you mean one of the webgpu_*.html files under examples/? e.g. 'webgpu_backdrop_water'.` );
	process.exit( 1 );

}

const minIterations = parseInt( flags[ 'min-iterations' ], 10 ) || 4; // 1 warmup + 3 measured
const maxIterations = parseInt( flags[ 'max-iterations' ], 10 ) || 5; // 1 warmup + 4 measured
// Fast-exit percent thresholds when MAD is not yet meaningful (n < 3 measured).
// Set conservatively — frame-time percentiles can legitimately swing 40-50%
// run-to-run on identical code due to GC and scheduler stalls. These
// thresholds are "the code is clearly on fire" territory, not subtle regressions.
const fastExitPctAtN1 = parseFloat( flags[ 'fast-exit-pct1' ] ) || 75;
const fastExitPctAtN2 = parseFloat( flags[ 'fast-exit-pct2' ] ) || 30;
const duration = parseInt( flags.duration, 10 ) || 8_000;
const warmup = parseInt( flags.warmup, 10 ) || 3_000;
const portBase = parseInt( flags[ 'port-base' ], 10 ) || 1240;
const k = parseFloat( flags.k ) || 3;
const forceBuild = flags[ 'force-build' ] === true || flags[ 'force-build' ] === 'true';
const noBuild = flags[ 'no-build' ] === true || flags[ 'no-build' ] === 'true';

const root = process.cwd();
const wtRoot = path.join( root, '.perf-wt' );
const wtBase = path.join( wtRoot, 'base' );

// --- shell helpers ----------------------------------------------------------

function sh( cmd, args, opts = {} ) {

	return new Promise( ( resolve, reject ) => {

		const p = spawn( cmd, args, { stdio: 'inherit', ...opts } );
		p.on( 'exit', code => code === 0 ? resolve() : reject( new Error( `${ cmd } ${ args.join( ' ' ) } exited ${ code }` ) ) );

	} );

}

function shCapture( cmd, args, opts = {} ) {

	return new Promise( ( resolve, reject ) => {

		const p = spawn( cmd, args, { stdio: [ 'ignore', 'pipe', 'inherit' ], ...opts } );
		let out = '';
		p.stdout.on( 'data', d => out += d );
		p.on( 'exit', code => code === 0 ? resolve( out.trim() ) : reject( new Error( `${ cmd } exited ${ code }` ) ) );

	} );

}

async function resolveRef( ref ) {

	try {

		return await shCapture( 'git', [ 'rev-parse', '--verify', `${ ref }^{commit}` ] );

	} catch ( _ ) {

		throw new Error( `ref '${ ref }' does not resolve — try 'dev', 'HEAD', or a SHA.` );

	}

}

async function dirExists( p ) {

	try { await fs.access( p ); return true; } catch ( _ ) { return false; }

}

// --- live-tree build (candidate) -------------------------------------------

async function ensureLiveBuild() {

	if ( noBuild ) {

		console.log( `[orch] --no-build set; using existing build/ in live tree` );
		return;

	}

	console.log( `[orch] building live tree (candidate)` );
	await sh( 'npm', [ 'run', 'build' ], { cwd: root } );

}

// --- baseline worktree (no build — three.js commits build/ on the default branch) --

async function ensureBaselineWorktree( ref, dir ) {

	const target = await resolveRef( ref );

	let reusable = false;
	if ( await dirExists( dir ) ) {

		try {

			const head = await shCapture( 'git', [ '-C', dir, 'rev-parse', 'HEAD' ] );
			if ( head === target ) reusable = true;

		} catch ( _ ) {}

		if ( ! reusable ) {

			console.log( `[orch] baseline worktree ${ dir } is on a different SHA; replacing` );
			try { await sh( 'git', [ 'worktree', 'remove', '--force', dir ] ); }
			catch ( _ ) { await fs.rm( dir, { recursive: true, force: true } ); }

		}

	}

	if ( ! reusable ) {

		await fs.mkdir( wtRoot, { recursive: true } );
		await sh( 'git', [ 'worktree', 'add', '--detach', dir, ref ] );

	}

	// The baseline worktree uses the committed build/ artifacts from the ref.
	// If they're missing (some refs drop build/ from the tree), fall back to
	// rebuilding. Pass --force-build to rebuild anyway.
	const committedBuildExists = await dirExists( path.join( dir, 'build/three.webgpu.js' ) );
	if ( forceBuild || ! committedBuildExists ) {

		console.log( `[orch] building baseline in ${ dir } (${ forceBuild ? '--force-build' : 'missing build/' })` );
		await sh( 'npm', [ 'run', 'build' ], { cwd: dir } );

	} else {

		console.log( `[orch] baseline ${ ref } (${ target.slice( 0, 8 ) }): using committed build/` );

	}

	return { dir, sha: target };

}

// --- per-side runtime (server + browser, persistent) -----------------------

const CHROME_FLAGS = [
	'--hide-scrollbars',
	'--enable-unsafe-webgpu',
	'--enable-features=Vulkan',
	'--disable-vulkan-surface',
	'--ignore-gpu-blocklist',
	'--disable-gpu-driver-bug-workarounds',
	'--no-sandbox',
	'--enable-precise-memory-info',
	// Uncap frame rate so rAF reports the renderer's true throughput
	// (e.g. "potential fps" ~300 on a fast scene) instead of being clamped
	// to the compositor's 60Hz vsync.
	'--disable-frame-rate-limit',
	'--disable-gpu-vsync',
	// Noise reduction:
	'--disable-background-timer-throttling',
	'--disable-renderer-backgrounding',
	'--disable-backgrounding-occluded-windows',
	'--disable-ipc-flooding-protection',
	'--disable-features=CalculateNativeWinOcclusion,TranslateUI',
	'--autoplay-policy=no-user-gesture-required'
];

async function startSide( { name, dir, port } ) {

	// In-process server scoped to the worktree root. Serves examples/<file>.html
	// and build/*.js out of the worktree's own checkout.
	const server = createServer( { root: dir } );
	await new Promise( ( resolve, reject ) => {

		server.once( 'error', reject );
		server.listen( port, () => { server.off( 'error', reject ); resolve(); } );

	} );

	const browser = await puppeteer.launch( {
		// On CI Linux, headless 'new' has a broken GPU path — WebGPU adapter
		// returns null and WebGL context creation fails too. `false` makes
		// Chromium attach to the xvfb virtual display (the workflow runs us
		// under xvfb-run), which restores both backends.
		// Locally (no CI env, no xvfb), keep true-headless for speed.
		headless: ( 'CI' in process.env || process.env.VISIBLE ) ? false : 'new',
		args: CHROME_FLAGS,
		env: {
			...process.env,
			VK_DRIVER_FILES: process.env.VK_DRIVER_FILES || '/usr/share/vulkan/icd.d/lvp_icd.x86_64.json'
		},
		defaultViewport: { width: 1280, height: 720 },
		protocolTimeout: 0,
		handleSIGINT: false,
		userDataDir: path.join( wtRoot, `.profile-${ name }` )
	} );

	return { name, dir, port, server, browser, url: `http://localhost:${ port }/examples/${ example }.html` };

}

async function stopSide( side ) {

	try { await side.browser.close(); } catch ( _ ) {}
	try { side.server.close(); } catch ( _ ) {}

}

async function runIteration( side, label, { warmupMs } ) {

	const page = await side.browser.newPage();
	page.on( 'pageerror', err => console.error( `[${ side.name } page error] ${ err.message }` ) );
	page.on( 'console', msg => { if ( msg.type() === 'error' ) console.error( `[${ side.name } console.error] ${ msg.text() }` ); } );
	page.on( 'response', resp => {

		const status = resp.status();
		if ( status >= 400 ) console.error( `[${ side.name } ${ status }] ${ resp.url() }` );

	} );

	await attachPerfInjection( page );

	const { raw, before, after } = await collectIteration( page, {
		url: side.url,
		warmup: warmupMs,
		duration,
		onLog: m => console.log( `[${ label }] ${ m }` )
	} );

	await page.close();

	return buildSummary( raw, before, after, {
		label, example, durationMs: duration, warmupMs
	} );

}

// --- stats ------------------------------------------------------------------

function median( arr ) {

	const s = arr.slice().sort( ( a, b ) => a - b );
	const n = s.length;
	if ( n === 0 ) return 0;
	return n % 2 ? s[ ( n - 1 ) / 2 ] : ( s[ n / 2 - 1 ] + s[ n / 2 ] ) / 2;

}

function mad( arr ) {

	const m = median( arr );
	return median( arr.map( v => Math.abs( v - m ) ) );

}

function pickAt( obj, dotted ) {

	return dotted.split( '.' ).reduce( ( a, kk ) => a && a[ kk ], obj );

}

// `gate: true`  → contributes to the pass/fail exit code. Stable metrics only.
// `gate: false` → shown in the report but not gated. Noisy but informative.
// Heap growth and GC counters swing wildly based on when GC fires relative to
// the sample window — displayed for humans, never block a CI build.
const METRICS = [
	{ name: 'fps', path: 'fps', dir: 'higher', gate: true },
	{ name: 'frameTimeMs.p50', path: 'frameTimeMs.p50', dir: 'lower', gate: true },
	{ name: 'frameTimeMs.p95', path: 'frameTimeMs.p95', dir: 'lower', gate: true },
	{ name: 'frameTimeMs.p99', path: 'frameTimeMs.p99', dir: 'lower', gate: true },
	{ name: 'jsHeapBytes.mean', path: 'jsHeapBytes.mean', dir: 'lower', gate: true },
	{ name: 'jsHeapBytes.growth', path: 'jsHeapBytes.growth', dir: 'lower', gate: false },
	{ name: 'gc.events', path: 'gc.events', dir: 'lower', gate: false },
	{ name: 'gc.totalFreedBytes', path: 'gc.totalFreedBytes', dir: 'lower', gate: false },
	{ name: 'webgpu.estimatedVRAMAfter', path: 'webgpu.estimatedVRAMAfter', dir: 'lower', gate: true },
	{ name: 'webgpu.cmdSubmitsPerFrame', path: 'webgpu.cmdSubmitsPerFrame', dir: 'lower', gate: true },
	{ name: 'webgpu.errors', path: 'webgpu.errors', dir: 'lower', gate: true }
];

function summarize( samples ) {

	const out = {};
	for ( const m of METRICS ) {

		const vals = samples.map( r => pickAt( r, m.path ) ).filter( v => typeof v === 'number' && Number.isFinite( v ) );
		out[ m.name ] = { median: median( vals ), mad: mad( vals ), n: vals.length, samples: vals };

	}

	return out;

}

// Per-metric verdict. Both significance and confidence are n-aware:
//   n <  3 measured: MAD is not reliable (MAD=0 at n=1). Use |Δ%| thresholds.
//                    n=1: |Δ%| > fastExitPctAtN1 (default 40%)
//                    n=2: |Δ%| > fastExitPctAtN2 (default 20%)
//   n >= 3 measured: MAD gate. Significance = |Δ| > k·MAD.
function classify( b, c, dir, n ) {

	const delta = c.median - b.median;
	const noise = Math.max( b.mad, c.mad );
	const pct = b.median === 0 ? ( c.median === 0 ? 0 : Infinity ) : ( delta / Math.abs( b.median ) * 100 );

	let sig, confident;
	if ( n < 3 ) {

		const threshold = n === 1 ? fastExitPctAtN1 : fastExitPctAtN2;
		sig = Math.abs( pct ) > threshold;
		confident = sig; // small-n: no "clearly noise" verdict — we just don't know yet

	} else {

		sig = Math.abs( delta ) > k * noise;
		confident = Math.abs( delta ) > 2 * k * noise || Math.abs( delta ) < 0.3 * k * noise;

	}

	const regressedDir = dir === 'lower' ? ( delta > 0 ) : ( delta < 0 );
	const isRegression = sig && regressedDir;

	return { delta, noise, pct, significant: sig, isRegression, confident };

}

// Adaptive-stop checks only consider gated metrics — non-gated rows are
// reported for humans but never influence when to stop or whether to fail.
const GATED = METRICS.filter( m => m.gate );

function allConfident( base, cand, n ) {

	return GATED.every( m => classify( base[ m.name ], cand[ m.name ], m.dir, n ).confident );

}

function anyCatastrophicRegression( base, cand, n ) {

	return GATED.some( m => classify( base[ m.name ], cand[ m.name ], m.dir, n ).isRegression );

}

// --- main -------------------------------------------------------------------

// Resolve candidate SHA from the live tree. May be dirty (uncommitted changes),
// in which case the SHA still points at HEAD but the tree doesn't match it.
async function liveTreeMeta() {

	const sha = await shCapture( 'git', [ 'rev-parse', 'HEAD' ] );
	const dirty = ( await shCapture( 'git', [ 'status', '--porcelain' ] ) ).length > 0;
	return { sha, dirty };

}

// Baseline worktree + candidate (live-tree) build run in parallel.
console.log( `[orch] preparing baseline (${ baselineRef }) + building candidate (live tree) in parallel` );
const [ baseInfo, candMeta ] = await Promise.all( [
	ensureBaselineWorktree( baselineRef, wtBase ),
	Promise.all( [ ensureLiveBuild(), liveTreeMeta() ] ).then( ( [ , meta ] ) => meta )
] );

// Start both sides (server + browser) once.
console.log( `[orch] launching browsers + servers` );
const [ base, cand ] = await Promise.all( [
	startSide( { name: 'base', dir: baseInfo.dir, port: portBase } ),
	startSide( { name: 'cand', dir: root, port: portBase + 1 } )
] );

const samples = { base: [], cand: [] };
let iter = 0;
let stoppedEarly = false;

try {

	while ( iter < maxIterations ) {

		iter ++;

		// Iteration 1 per side is warmup (cold JIT, cold pipeline cache).
		const isWarmup = iter === 1;
		const warmupMs = isWarmup ? warmup : Math.min( warmup, 1000 );

		console.log( `\n[orch] iteration ${ iter }/${ maxIterations }${ isWarmup ? ' (warmup, dropped)' : '' } — base` );
		const bRun = await runIteration( base, `base${ iter }`, { warmupMs } );
		console.log( `\n[orch] iteration ${ iter }/${ maxIterations }${ isWarmup ? ' (warmup, dropped)' : '' } — cand` );
		const cRun = await runIteration( cand, `cand${ iter }`, { warmupMs } );

		if ( ! isWarmup ) {

			samples.base.push( bRun );
			samples.cand.push( cRun );

		}

		// Adaptive stop:
		//   - n <  3 measured: fast-exit only on an obvious regression (any
		//     single metric crossing the %-threshold in the wrong direction).
		//     We never fast-pass at small n — too easy for the result to flip
		//     once real samples arrive.
		//   - n >= 3 measured: the MAD gate is usable. Stop once every metric
		//     is either clearly moving or clearly noise.
		const n = samples.base.length;
		if ( n >= 1 ) {

			const b = summarize( samples.base );
			const c = summarize( samples.cand );
			let shouldStop = false;
			let reason = '';
			if ( n < 3 ) {

				if ( anyCatastrophicRegression( b, c, n ) ) {

					shouldStop = true;
					reason = `catastrophic regression at n=${ n }`;

				}

			} else if ( iter >= minIterations && allConfident( b, c, n ) ) {

				shouldStop = true;
				reason = `all metrics confident at n=${ n }`;

			}

			if ( shouldStop ) {

				console.log( `\n[orch] early stop — ${ reason }` );
				stoppedEarly = true;
				break;

			}

		}

	}

} finally {

	await Promise.all( [ stopSide( base ), stopSide( cand ) ] );

}

// --- aggregate & gate -------------------------------------------------------

const baseSum = summarize( samples.base );
const candSum = summarize( samples.cand );

const pad = ( s, n ) => String( s ).padStart( n );
const fmt = v => ( typeof v === 'number' && Number.isFinite( v ) ) ? v.toPrecision( 4 ) : String( v );

console.log( `\nperf-regression-orchestrator: ${ example }` );
console.log( `  baseline:    ${ baselineRef } (${ baseInfo.sha.slice( 0, 8 ) })` );
console.log( `  candidate:   live tree @ ${ candMeta.sha.slice( 0, 8 ) }${ candMeta.dirty ? ' (uncommitted changes)' : '' }` );
console.log( `  iterations:  ${ iter } total, ${ samples.base.length } measured (1 warmup dropped)${ stoppedEarly ? ' [early stop]' : '' }` );
console.log( `  gate:        |Δmedian| > ${ k } · max(MAD_base, MAD_cand)\n` );

console.log( pad( 'metric', 32 ), ' | ', pad( 'base (med±MAD)', 22 ), ' | ', pad( 'cand (med±MAD)', 22 ), ' | ', pad( 'Δ%', 8 ), ' | ', pad( 'verdict', 8 ) );
console.log( '-'.repeat( 32 ), '-+-', '-'.repeat( 22 ), '-+-', '-'.repeat( 22 ), '-+-', '-'.repeat( 8 ), '-+-', '-'.repeat( 8 ) );

let regressed = 0;
const rows = [];

for ( const m of METRICS ) {

	const b = baseSum[ m.name ];
	const c = candSum[ m.name ];
	const { delta, pct, significant, isRegression } = classify( b, c, m.dir, samples.base.length );

	// Only gated metrics contribute to the pass/fail exit code.
	const gatedRegression = m.gate && isRegression;
	if ( gatedRegression ) regressed ++;

	const verdict = gatedRegression ? 'REGRESS' : ( significant ? 'improve' : 'noise' );
	rows.push( { name: m.name, gate: m.gate, b, c, delta, pct, verdict, isRegression: gatedRegression } );

	const nameDisplay = m.gate ? m.name : m.name + ' (info)';
	console.log(
		pad( nameDisplay, 32 ), ' | ',
		pad( `${ fmt( b.median ) } ± ${ fmt( b.mad ) }`, 22 ), ' | ',
		pad( `${ fmt( c.median ) } ± ${ fmt( c.mad ) }`, 22 ), ' | ',
		pad( ( pct >= 0 ? '+' : '' ) + pct.toFixed( 1 ) + '%', 8 ), ' | ',
		pad( verdict, 8 )
	);

}

const outPath = path.join( root, `test/e2e/perf-regression-${ example }.summary.json` );
await fs.writeFile( outPath, JSON.stringify( {
	example,
	baselineRef, baselineSha: baseInfo.sha,
	candidateSha: candMeta.sha, candidateDirty: candMeta.dirty,
	iterationsTotal: iter, iterationsMeasured: samples.base.length,
	duration, warmup, k,
	stoppedEarly,
	host: { platform: process.platform, arch: process.arch, cpus: os.cpus().length, mem: os.totalmem() },
	base: baseSum, cand: candSum, rows
}, null, 2 ) );
console.log( `\n[orch] wrote ${ outPath }` );

if ( regressed > 0 ) {

	console.error( `\n[orch] FAIL — ${ regressed } metric(s) regressed beyond ${ k }·MAD gate` );
	process.exit( 2 );

}

console.log( `\n[orch] PASS — no regression beyond ${ k }·MAD gate` );
process.exit( 0 );
