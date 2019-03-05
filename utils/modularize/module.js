const fs = require( 'fs-extra' );
const acorn = require( 'acorn' );
const path = require( 'path' );
const walk = require( "acorn-walk" );
const MagicString = require( 'magic-string' );
const THREE = require( '../../build/three.js' );

const THREE_PATH = path.join(__dirname, '../../build/three.module.js');

function isExportExpression( node ) {

	try {

		const { type, left } = node;
		// match 'THREE.Name = something'
		return type === 'AssignmentExpression'
      && left.type === 'MemberExpression'
      && left.object.type === 'Identifier'
      && left.object.name === 'THREE'
      && left.property.type === 'Identifier';

	} catch ( e ) {}
	return false;

}

function getRelativePath( from, to ) {
	const relativePath = path.relative( path.dirname( from ), to );
	return relativePath[0] === '.' ? relativePath : './' + relativePath;
}

function unique( array ) {

	const set = new Set( array );
	return [ ...set ];

}

class Module {

	constructor( file, options = {} ) {

		this.file = file;
		this.source = fs.readFileSync( file, 'utf-8' );
		this.code = new MagicString( this.source );
		this.ast = acorn.parse( this.source, {
			ecmaVersion: 9,
			sourceType: 'module'
		} );

		this.dependences = options.dependences || [];
		this.exports = options.exports || [];

		this._convert();

	}

	_convert() {

		this._collectExports();
		this._collectDeps();

	}

	_collectExports() {

		walk.simple( this.ast, {
			// Export by assigning values to members of THREE
			AssignmentExpression: ( node ) => {

				if ( isExportExpression( node ) ) {

					const { start, end, property } = node.left;
					this.code.overwrite( start, end, `var ${property.name}` );
					this.exports.push( property.name );

				}

			}
		} );

		if ( this.exports.length === 0 ) {

			// Guess that the exported name is same as the file name.
			const fileName = path.basename( this.file ).replace( '.js', '' );
			this.ast.body.forEach( node => {

				if ( node.type === 'VariableDeclaration' && node.declarations ) {

					const { declarations } = node;
					declarations.forEach( declaration => {

						const { type, id } = declaration;
						if ( type === 'VariableDeclarator' && id.type === 'Identifier' && id.name === fileName ) {

							this.exports.push( fileName );

						}

					} );

				} else if ( node.type === 'FunctionDeclaration' ) {

					if ( node.id.type === 'Identifier' && node.id.name === fileName ) {

						this.exports.push( fileName );

					}

				}

			} );

		}

		this.exports = unique( this.exports );

		if ( this.exports.length > 0 ) {

			this.code.append( `\nexport {\n  ${this.exports.sort().join( ',\n  ' )}\n};` );

		} else {

			console.warn( `Nothing was exported: ${this.file}` );

		}

	}

	_collectDeps() {

		walk.simple( this.ast, {
			MemberExpression: node => {

				const { object, property } = node;
				// match all 'THREE.Something'
				if ( object.name === 'THREE' && property.type === 'Identifier' ) {

					// 'THREE.Something' to 'Something'
					try {

						this.code.overwrite( object.start, object.end + 1, '' );

					} catch ( e ) {}
					if ( property.name === 'Math' ) {

						// Avoiding conflict with global Math
						this.code.overwrite( property.start, property.end, '_Math' );
						this.dependences.push( 'Math as _Math' );

					} else {

						this.dependences.push( property.name );

					}

				}

			}
		} );
		this.dependences = unique( this.dependences ).filter( name => this.exports.indexOf( name ) === - 1 );

	}

	resolveDeps( modules ) {

		const deps = {};

		if ( this.dependences.length === 0 ) return;

		const threePath = getRelativePath(this.file, THREE_PATH);

		this.dependences.forEach( name => {

			// Depend on THREE
			const dep = name.split( ' as ' )[ 0 ];
			if ( THREE[ dep ] !== undefined ) {

				if ( ! deps[ threePath ] ) {

					deps[ threePath ] = [];

				}
				deps[ threePath ].push( name );
				return;

			}

			const target = modules.find( item => item.exports.indexOf( dep ) > - 1 );
			// Depending on other modules
			if ( target ) {

				const relativePath = getRelativePath( this.file, target.file );
				if ( ! deps[ relativePath ] ) {

					deps[ relativePath ] = [];

				}
				deps[ relativePath ].push( name );
				return;

			}

			if ( ! deps[ '__UNKNOW__' ] ) {

				deps[ '__UNKNOW__' ] = [];

			}
			deps[ '__UNKNOW__' ].push( name );

		} );

		Object.keys( deps ).forEach( key => {

			this.code.prepend( `import {\n  ${unique( deps[ key ] ).sort().join( ',\n  ' )}\n} from '${key}';\n` );

		} );

	}

	toString() {

		return this.code.toString();

	}

}

module.exports = Module;
