import { gzipSync } from 'zlib';
import { readdirSync } from 'fs';
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

const treeshakeDir = 'test/treeshake';

// Every non-bundle .js file in test/treeshake is a treeshaking test entry point.
const entries = readdirSync( treeshakeDir )
	.filter( name => name.endsWith( '.js' ) && ! name.includes( 'bundle' ) )
	.map( name => name.slice( 0, - '.js'.length ) ); // e.g. 'index.vector3functions'

export default entries.flatMap( ( name ) => [
	{
		input: `${treeshakeDir}/${name}.js`,
		plugins: [
			resolve()
		],
		output: [
			{
				format: 'esm',
				file: `${treeshakeDir}/${name}.bundle.js`
			}
		]
	},
	{
		input: `${treeshakeDir}/${name}.js`,
		plugins: [
			resolve(),
			terser(),
			filesize()
		],
		output: [
			{
				format: 'esm',
				file: `${treeshakeDir}/${name}.bundle.min.js`
			}
		]
	}
] );
