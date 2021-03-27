import resolve from '@rollup/plugin-node-resolve';
import filesize from 'rollup-plugin-filesize';

export default [
	{
		input: 'test/treeshake/index.js',
		plugins: [
			resolve(),
			filesize(),
		],
		output: [
			{
				format: 'esm',
				file: 'test/treeshake/index.bundle.js'
			}
		]
	}
];
