// Format a perf-regression summary JSON into a GitHub-flavored markdown
// comment matching the style of the Bundle size / Tree-shaking reports.
//
// Usage:
//   node test/e2e/perf-format-comment.js <summary.json> > comment.md

import * as fs from 'node:fs/promises';

const [ , , jsonPath ] = process.argv;

if ( ! jsonPath ) {

	console.error( 'usage: node test/e2e/perf-format-comment.js <summary.json>' );
	process.exit( 1 );

}

const s = JSON.parse( await fs.readFile( jsonPath, 'utf8' ) );

const mb = v => ( v / 1024 / 1024 ).toFixed( 2 ) + ' MB';
const ms = v => v.toFixed( 2 ) + ' ms';
const num = v => Number.isInteger( v ) ? String( v ) : v.toFixed( 2 );

function fmtPct( pct ) {

	if ( ! Number.isFinite( pct ) ) return 'new';
	const sign = pct >= 0 ? '+' : '';
	return `${ sign }${ pct.toFixed( 1 ) }%`;

}

function verdictBadge( v ) {

	if ( v === 'REGRESS' ) return '🔴 **regress**';
	if ( v === 'improve' ) return '🟢 improve';
	return '·';

}

const FORMATTERS = {
	'fps': num,
	'frameTimeMs.p50': ms,
	'frameTimeMs.p95': ms,
	'frameTimeMs.p99': ms,
	'jsHeapBytes.mean': mb,
	'jsHeapBytes.growth': mb,
	'gc.events': num,
	'gc.totalFreedBytes': mb,
	'webgpu.estimatedVRAMAfter': mb,
	'webgpu.cmdSubmitsPerFrame': num,
	'webgpu.errors': num
};

const LABELS = {
	'fps': 'FPS (uncapped)',
	'frameTimeMs.p50': 'Frame p50',
	'frameTimeMs.p95': 'Frame p95',
	'frameTimeMs.p99': 'Frame p99',
	'jsHeapBytes.mean': 'JS heap (mean)',
	'jsHeapBytes.growth': 'JS heap growth',
	'gc.events': 'GC events',
	'gc.totalFreedBytes': 'GC heap freed',
	'webgpu.estimatedVRAMAfter': 'WebGPU VRAM',
	'webgpu.cmdSubmitsPerFrame': 'Submits/frame',
	'webgpu.errors': 'WebGPU errors'
};

const regressions = s.rows.filter( r => r.isRegression );
const heading = regressions.length
	? `### 🔴 Perf regression (${ s.example })`
	: `### 🟢 Perf regression (${ s.example })`;

let out = '';
out += `${ heading }\n\n`;
out += `_Median across ${ s.iterationsMeasured } measured iteration${ s.iterationsMeasured === 1 ? '' : 's' }`;
out += ` (1 warmup dropped${ s.stoppedEarly ? ', early-stopped' : '' }), `;
out += `gated at k=${ s.k }·MAD. Lavapipe (software WebGPU), vsync disabled — FPS reflects renderer throughput, not display refresh._\n\n`;

out += `| Metric | Baseline | Candidate | Δ | Verdict |\n`;
out += `|:--|:-:|:-:|:-:|:-:|\n`;

for ( const row of s.rows ) {

	const fmt = FORMATTERS[ row.name ] || num;
	const rawLabel = LABELS[ row.name ] || row.name;
	// Non-gated metrics (heap growth, GC counters) are labeled "(info)" so
	// reviewers know a red delta there doesn't block the PR.
	const label = row.gate === false ? `${ rawLabel } <sub>(info)</sub>` : rawLabel;
	const baseStr = fmt( row.b.median );
	const candStr = fmt( row.c.median );
	const pctStr = fmtPct( row.pct );
	// For non-gated rows, never show the red regress badge — only neutral indicators.
	const badge = row.gate === false
		? ( row.verdict === 'improve' ? '🟢 improve' : '·' )
		: verdictBadge( row.verdict );
	out += `| ${ label } | ${ baseStr } | ${ candStr } | ${ pctStr } | ${ badge } |\n`;

}

out += `\n`;
out += `<sub>Baseline: \`${ s.baselineRef }\` @ \`${ s.baselineSha.slice( 0, 8 ) }\``;
out += ` · Candidate: \`${ s.candidateSha.slice( 0, 8 ) }\`${ s.candidateDirty ? ' (uncommitted)' : '' }`;
out += ` · Duration: ${ s.duration }ms · Warmup: ${ s.warmup }ms</sub>\n`;

process.stdout.write( out );
