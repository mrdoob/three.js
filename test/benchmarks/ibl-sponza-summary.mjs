/* global process, console */
import fs from 'node:fs';
const input = JSON.parse( fs.readFileSync( process.argv[ 2 ], 'utf8' ) );
const mean = values => values.reduce( ( sum, value ) => sum + value, 0 ) / values.length;
const summary = [];
for ( const width of [ 1920, 3840 ] ) {

	const rows = {};
	for ( const variant of [ 'before', 'after' ] ) {

		const runs = input.results.filter( run => run.width === width && run.variant === variant );
		rows[ variant ] = {
			trials: runs.length,
			completedMsPerFrame: mean( runs.map( run => run.msPerFrame ) ),
			gpuMsPerFrame: mean( runs.map( run => run.gpuMsPerFrame ) ),
			gpuTrialMs: runs.map( run => run.gpuMsPerFrame ),
			completedTrialMs: runs.map( run => run.msPerFrame )
		};

	}
	summary.push( {
		width, ...rows,
		gpuChangePercent: ( rows.after.gpuMsPerFrame / rows.before.gpuMsPerFrame - 1 ) * 100,
		completedChangePercent: ( rows.after.completedMsPerFrame / rows.before.completedMsPerFrame - 1 ) * 100
	} );

}
console.log( JSON.stringify( { ...input, summary }, null, 2 ) );
