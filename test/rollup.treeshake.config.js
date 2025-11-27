import resolve from '@rollup/plugin-node-resolve';
import filesize from 'rollup-plugin-filesize';
import terser from '@rollup/plugin-terser';

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
			filesize( {
				showMinifiedSize: false,
			} )
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
			filesize( {
				showMinifiedSize: false,
			} )
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
			filesize( {
				showMinifiedSize: false,
			} )
		],
		output: [
			{
				format: 'esm',
				file: 'test/treeshake/index.webgpu.nodes.bundle.min.js'
			}
		]
	}
];
