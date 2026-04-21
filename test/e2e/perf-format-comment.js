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
	const rounded = pct.toFixed( 1 );
	// Anything that rounds to exactly zero is shown as a dot — "+0.0%"
	// adds visual noise for the common case of an identical metric.
	if ( rounded === '0.0' || rounded === '-0.0' ) return '·';
	const sign = pct >= 0 ? '+' : '';
	return `${ sign }${ rounded }%`;

}

function verdictBadge( v ) {

	if ( v === 'REGRESS' ) return '🔴 **regress**';
	if ( v === 'improve' ) return '🟢 improve';
	return '·';

}

// Whitelist + display order. Only these rows appear in the PR comment;
// the JSON artifact still contains the full metric set for anyone digging in.
const DISPLAY = [
	{ name: 'fps',                          label: 'FPS (uncapped)',     fmt: num },
	{ name: 'frameTimeMs.p50',              label: 'Frame time (median)', fmt: ms },
	{ name: 'jsHeapBytes.mean',             label: 'JS heap (mean)',     fmt: mb },
	{ name: 'webgpu.estimatedVRAMAfter',    label: 'WebGPU VRAM',        fmt: mb },
	{ name: 'webgpu.cmdSubmitsPerFrame',    label: 'Submits/frame',      fmt: num }
];

const rowsByName = new Map( s.rows.map( r => [ r.name, r ] ) );

// Regression state only reflects gated metrics (row.isRegression is already
// false for non-gated rows by construction in the orchestrator).
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

for ( const item of DISPLAY ) {

	const row = rowsByName.get( item.name );
	if ( ! row ) continue;
	const label = row.gate === false ? `${ item.label } <sub>(info)</sub>` : item.label;
	const baseStr = item.fmt( row.b.median );
	const candStr = item.fmt( row.c.median );
	const pctStr = fmtPct( row.pct );
	// Non-gated rows never show the red regress badge — only neutral indicators.
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
