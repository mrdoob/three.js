import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

function filesize() {

	return {
		name: 'filesize',
		writeBundle( options, bundle ) {

			for ( const [ name, chunk ] of Object.entries( bundle ) ) {

				if ( chunk.code ) console.log( `\x1b[32m${name}: ${( chunk.code.length / 1024 ).toFixed( 1 )} kB\x1b[0m` );

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
