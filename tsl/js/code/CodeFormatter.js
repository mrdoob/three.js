import * as acorn from 'acorn';
import { Linter } from 'eslint-linter-browserify';

function removeUnusedImports( code ) {

	let ast;
	try {

		ast = acorn.parse( code, { ecmaVersion: 'latest', sourceType: 'module' } );

	} catch ( err ) {

		return code;

	}

	const isSymbolUsed = ( symbol ) => {

		let used = false;
		const walk = ( node ) => {

			if ( used ) return;
			if ( ! node ) return;
			if ( node.type === 'Identifier' && node.name === symbol ) {

				used = true;
				return;

			}

			for ( const key in node ) {

				const child = node[ key ];
				if ( child && typeof child === 'object' ) {

					if ( Array.isArray( child ) ) {

						child.forEach( walk );

					} else if ( child.type ) {

						walk( child );

					}

				}

			}

		};

		ast.body.forEach( node => {

			if ( node.type !== 'ImportDeclaration' ) {

				walk( node );

			}

		} );

		return used;

	};

	const importNodes = ast.body.filter( node => node.type === 'ImportDeclaration' );
	const replacements = [];

	function getFullLineRange( text, start, end ) {

		let lineStart = start;
		while ( lineStart > 0 && text[ lineStart - 1 ] !== '\n' && text[ lineStart - 1 ] !== '\r' ) {

			if ( ! /\s/.test( text[ lineStart - 1 ] ) ) {

				return { start, end };

			}

			lineStart --;

		}

		let lineEnd = end;
		while ( lineEnd < text.length && text[ lineEnd ] !== '\n' && text[ lineEnd ] !== '\r' ) {

			if ( ! /\s/.test( text[ lineEnd ] ) && text[ lineEnd ] !== ';' ) {

				return { start, end };

			}

			lineEnd ++;

		}

		if ( lineEnd < text.length ) {

			if ( text[ lineEnd ] === '\r' && text[ lineEnd + 1 ] === '\n' ) {

				lineEnd += 2;

			} else if ( text[ lineEnd ] === '\n' || text[ lineEnd ] === '\r' ) {

				lineEnd += 1;

			}

		} else if ( lineStart > 0 ) {

			if ( text[ lineStart - 1 ] === '\n' && lineStart > 1 && text[ lineStart - 2 ] === '\r' ) {

				lineStart -= 2;

			} else if ( text[ lineStart - 1 ] === '\n' || text[ lineStart - 1 ] === '\r' ) {

				lineStart -= 1;

			}

		}

		return { start: lineStart, end: lineEnd };

	}

	importNodes.forEach( node => {

		const moduleName = node.source.value;
		const specifiers = node.specifiers;

		if ( specifiers.length === 0 ) {

			return;

		}

		const usedSpecifiers = specifiers.filter( spec => isSymbolUsed( spec.local.name ) );

		if ( usedSpecifiers.length === 0 ) {

			const range = getFullLineRange( code, node.start, node.end );
			replacements.push( {
				start: range.start,
				end: range.end,
				replacement: ''
			} );

		} else if ( usedSpecifiers.length < specifiers.length ) {

			const defaultSpec = usedSpecifiers.find( s => s.type === 'ImportDefaultSpecifier' );
			const namespaceSpec = usedSpecifiers.find( s => s.type === 'ImportNamespaceSpecifier' );
			const namedSpecs = usedSpecifiers.filter( s => s.type === 'ImportSpecifier' );

			let importStr = 'import ';
			const parts = [];

			if ( defaultSpec ) {

				parts.push( defaultSpec.local.name );

			}

			if ( namespaceSpec ) {

				parts.push( `* as ${namespaceSpec.local.name}` );

			}

			if ( namedSpecs.length > 0 ) {

				const namedParts = namedSpecs.map( spec => {

					const imported = spec.imported.name;
					const local = spec.local.name;
					return imported === local ? imported : `${imported} as ${local}`;

				} );
				parts.push( `{ ${namedParts.join( ', ' )} }` );

			}

			importStr += parts.join( ', ' ) + ` from '${moduleName}';`;

			replacements.push( {
				start: node.start,
				end: node.end,
				replacement: importStr
			} );

		}

	} );

	let result = code;
	replacements.sort( ( a, b ) => b.start - a.start );
	replacements.forEach( r => {

		result = result.substring( 0, r.start ) + r.replacement + result.substring( r.end );

	} );

	return result;

}

function formatCode( code ) {

	try {

		code = removeUnusedImports( code );

		const linter = new Linter();
		const formatRules = {
			'array-bracket-spacing': [ 'error', 'always', { 'singleValue': true, 'arraysInArrays': false } ],
			'block-spacing': [ 'error', 'always' ],
			'brace-style': [ 'error', '1tbs', { 'allowSingleLine': true } ],
			'comma-spacing': [ 'error', { 'before': false, 'after': true } ],
			'comma-style': [ 2, 'last' ],
			'computed-property-spacing': [ 'error', 'always' ],
			'eol-last': [ 'error', 'always' ],
			'func-call-spacing': [ 'error', 'never' ],
			'indent': [ 'error', 'tab', { 'SwitchCase': 1 } ],
			'key-spacing': [ 'error', { 'beforeColon': false } ],
			'new-parens': [ 'error' ],
			'no-trailing-spaces': [ 'error', { 'skipBlankLines': false } ],
			'no-whitespace-before-property': [ 'error' ],
			'object-curly-spacing': [ 'error', 'always' ],
			'padded-blocks': [ 'error', {
				'blocks': 'always',
				'switches': 'always',
				'classes': 'always'
			} ],
			'semi': [ 'error', 'always', { 'omitLastInOneLineBlock': true } ],
			'semi-spacing': [ 'error', { 'before': false, 'after': true } ],
			'space-before-blocks': [ 'error', { 'functions': 'always', 'keywords': 'always', 'classes': 'always' } ],
			'space-before-function-paren': [ 'error', {
				'anonymous': 'always',
				'named': 'never',
				'asyncArrow': 'ignore'
			} ],
			'space-in-parens': [ 'error', 'always' ],
			'space-infix-ops': [ 'error' ],
			'space-unary-ops': [ 'error', {
				'words': true,
				'nonwords': true,
				'overrides': {}
			} ],
			'keyword-spacing': [ 'error', { 'before': true, 'after': true } ],
			'padding-line-between-statements': [
				'error',
				{ 'blankLine': 'always', 'prev': 'block-like', 'next': '*' }
			],
			'no-multi-spaces': 2,
			'no-extra-semi': 1,
			'no-multiple-empty-lines': [ 'error', { 'max': 1, 'maxBOF': 0, 'maxEOF': 1 } ],
			'quotes': [ 'error', 'single' ],
			'prefer-const': [ 'error', {
				'destructuring': 'any',
				'ignoreReadBeforeAssign': false
			} ]
		};

		const result = linter.verifyAndFix( code, {
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: 'module'
			},
			rules: formatRules
		} );

		return result.fixed ? result.output : code;

	} catch ( err ) {

		console.error( 'Error formatting code:', err );
		return code;

	}

}

export { formatCode };
