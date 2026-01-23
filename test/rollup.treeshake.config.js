import { gzipSync } from 'zlib';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

function filesize() {

	const green = '\x1b[1m\x1b[32m';
	const yellow = '\x1b[33m';
	const reset = '\x1b[0m';

	return {
		name: 'filesize',
		writeBundle( options, bundle ) {

			for ( const [ , chunk ] of Object.entries( bundle ) ) {

				if ( chunk.code ) {

					const size = ( chunk.code.length / 1024 ).toFixed( 2 ) + ' KB';
					const gzipped = ( gzipSync( chunk.code ).length / 1024 ).toFixed( 2 ) + ' KB';
					const destination = options.file;

					const lines = [
						{ label: 'Destination: ', value: destination },
						{ label: 'Bundle Size:  ', value: size },
						{ label: 'Gzipped Size: ', value: gzipped }
					];

					const maxLength = Math.max( ...lines.map( l => l.label.length + l.value.length ) );
					const width = maxLength + 6;

					console.log( `\n┌${'─'.repeat( width )}┐` );
					console.log( `│${' '.repeat( width )}│` );
					lines.forEach( ( { label, value } ) => {

						const padding = ' '.repeat( width - label.length - value.length - 3 );
						console.log( `│   ${green}${label}${yellow}${value}${reset}${padding}│` );

					} );
					console.log( `│${' '.repeat( width )}│` );
					console.log( `└${'─'.repeat( width )}┘` );

				}

			}

		}
	};

}

export default [
	{
		input: 'test/treeshake/index.js',
		plugins: [
			resolve()
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
			filesize()
		],
		output: [
			{
				format: 'esm',
				file: 'test/treeshake/index.bundle.min.js'
			}
		]
	},
	{
		input: 'test/treeshake/index.webgpu.js',
		plugins: [
			resolve()
		],
		output: [
			{
				format: 'esm',
				file: 'test/treeshake/index.webgpu.bundle.js'
			}
		]
	},
	{
		input: 'test/treeshake/index.webgpu.js',
		plugins: [
			resolve(),
			terser(),
			filesize()
		],
		output: [
			{
				format: 'esm',
				file: 'test/treeshake/index.webgpu.bundle.min.js'
			}
		]
	},
	{
		input: 'test/treeshake/index.webgpu.nodes.js',
		plugins: [
			resolve()
		],
		output: [
			{
				format: 'esm',
				file: 'test/treeshake/index.webgpu.nodes.bundle.js'
			}
		]
	},
	{
		input: 'test/treeshake/index.webgpu.nodes.js',
		plugins: [
			resolve(),
			terser(),
			filesize()
		],
		output: [
			{
				format: 'esm',
				file: 'test/treeshake/index.webgpu.nodes.bundle.min.js'
			}
		]
	}
];
