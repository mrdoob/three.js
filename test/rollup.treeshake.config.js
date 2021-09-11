import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import filesize from 'rollup-plugin-filesize';
import { terser } from 'rollup-plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';
import { glconstants, glsl } from '../utils/build/rollup.config';
import chalk from 'chalk';

const statsFile = path.resolve( __dirname, './treeshake/stats.html' );

function logStatsFile() {

	return {
		writeBundle() {

			console.log();
			console.log( 'Open the following url in a browser to analyze the tree-shaken bundle.' );
			console.log( chalk.blue.bold.underline( statsFile ) );
			console.log();

		}
	};

}

export default [
	{
		input: 'test/treeshake/index.js',
		plugins: [
			resolve(),
		],
		output: [
			{
				format: 'esm',
				file: 'test/treeshake/index.bundle.js'
			}
		]
	},
	{
		input: 'test/treeshake/index.js',
		plugins: [
			resolve(),
			terser(),
			filesize( {
				showMinifiedSize: false,
			} ),
		],
		output: [
			{
				format: 'esm',
				file: 'test/treeshake/index.bundle.min.js'
			}
		]
	},
	{
		input: 'test/treeshake/index-src.js',
		plugins: [
			glconstants(),
			glsl(),
			terser(),
			visualizer( {
				filename: statsFile,
			} ),
			logStatsFile(),
		],
		output: [
			{
				format: 'esm',
				file: 'test/treeshake/index-src.bundle.min.js'
			}
		]
	},
];
