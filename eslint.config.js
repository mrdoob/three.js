import js from '@eslint/js';
import globals from 'globals';
import mdcs from 'eslint-config-mdcs';
import compat from 'eslint-plugin-compat';
import html from 'eslint-plugin-html';
import importPlugin from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';

export default [
	// files to ignore
	{
		name: 'files to ignore',
		ignores: [
			'**/node_modules/**',
			'**/build/**',
			'**/libs/**',
			'**/ifc/**',
			'**/prettify.js',
			'**/prettify/**',
			'**/3rdparty/**',
			'**/shapefile.js',
			'**/vendor/**',
			'**/fuse/**',
			'**/template/static/**',
		]
	},

	// recommended
	js.configs.recommended,
	// jsdoc.configs['flat/recommended'],

	// base rules
	{
		name: 'base rules',
		files: [ '**/*.js', '**/*.html' ],
		plugins: {
			html,
			import: importPlugin,
			compat,
			jsdoc
		},
		languageOptions: {
			ecmaVersion: 2018,
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2017,
				__THREE_DEVTOOLS__: 'readonly',
				potpack: 'readonly',
				fflate: 'readonly',
				Stats: 'readonly',
				XRWebGLBinding: 'readonly',
				XRWebGLLayer: 'readonly',
				GPUShaderStage: 'readonly',
				GPUBufferUsage: 'readonly',
				GPUTextureUsage: 'readonly',
				GPUTexture: 'readonly',
				GPUMapMode: 'readonly',
				QUnit: 'readonly',
				Ammo: 'readonly',
				XRRigidTransform: 'readonly',
				XRMediaBinding: 'readonly',
				CodeMirror: 'readonly',
				esprima: 'readonly',
				jsonlint: 'readonly',
				VideoFrame: 'readonly',
				VideoDecoder: 'readonly',
				Float16Array: 'readonly',
				BigInt: 'readonly',
				BigUint64Array: 'readonly'
			},
		},
		settings: {
			polyfills: [
				'WebGL2RenderingContext'
			],
			jsdoc: {
				preferredTypes: {
					Any: 'any',
					Boolean: 'boolean',
					Number: 'number',
					object: 'Object',
					String: 'string'
				},
				tagNamePreference: {
					returns: 'return',
					extends: 'augments'
				},
			},
		},
		rules: {
			...mdcs.rules,
			...compat.configs.recommended.rules,
			'no-throw-literal': 'error',
			'quotes': [ 'error', 'single' ],
			'prefer-const': [ 'error', {
				destructuring: 'any',
				ignoreReadBeforeAssign: false
			} ],
			'no-irregular-whitespace': 'error',
			'no-duplicate-imports': 'error',
			'prefer-spread': 'error',

			'no-useless-escape': 'off',
			'no-case-declarations': 'off',
			'no-cond-assign': 'off',
			'getter-return': 'off',
			'no-async-promise-executor': 'off',
			'no-empty': 'off',
			'no-fallthrough': 'off',
			'no-prototype-builtins': 'off',
			'no-loss-of-precision': 'off',
			'no-unused-vars': [ 'error', {
				caughtErrors: 'none',
			} ],
			'jsdoc/check-types': 'error',
			'jsdoc/require-returns': 'off',
			'jsdoc/require-returns-type': 'error',
			'jsdoc/require-param-description': 'off',
			'jsdoc/require-returns-description': 'off',
			'jsdoc/require-param-type': 'error'
		}
	}
];
