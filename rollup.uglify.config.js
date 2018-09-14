import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import { eslint } from 'rollup-plugin-eslint';
import { glsl } from 'rollup-plugin-three-glsl';

console.log( glsl );

export default {
	input: 'src/Three.js',
	plugins: [
		glsl(),
		eslint( {
			include: '**/*.js'
		} ),
		babel( {
			babelrc: false,
			'plugins': [
				'external-helpers'
			],
			presets: [[ 'env', { modules: false } ]]
		} ),
		uglify()
	],
	output: [
		{
			sourcemap: true,
			format: 'umd',
			name: 'THREE',
			file: 'build/three.min.js',
			indent: '\t'
		}
	]
};
