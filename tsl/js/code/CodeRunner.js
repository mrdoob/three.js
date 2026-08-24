import { EventDispatcher } from 'three';
import * as acorn from 'acorn';

let importMap = { imports: {} };

try {

	const importMapEl = document.querySelector( 'script[type="importmap"]' );
	if ( importMapEl ) {

		importMap = JSON.parse( importMapEl.textContent );

	}

} catch ( e ) {

	console.error( 'Error parsing importmap', e );

}

//

function parseScript( code ) {

	const importDeclarations = [];
	const declaredSymbols = new Set();

	let ast;
	try {

		ast = acorn.parse( code, { ecmaVersion: 'latest', sourceType: 'module' } );

	} catch {

		return { importDeclarations, declaredSymbols };

	}

	const extractPattern = ( pattern ) => {

		if ( ! pattern ) return;
		if ( pattern.type === 'Identifier' ) {

			declaredSymbols.add( pattern.name );

		} else if ( pattern.type === 'ObjectPattern' ) {

			pattern.properties.forEach( prop => extractPattern( prop.value || prop.argument ) );

		} else if ( pattern.type === 'ArrayPattern' ) {

			pattern.elements.forEach( elem => extractPattern( elem ) );

		} else if ( pattern.type === 'AssignmentPattern' ) {

			extractPattern( pattern.left );

		} else if ( pattern.type === 'RestElement' ) {

			extractPattern( pattern.argument );

		}

	};

	ast.body.forEach( node => {

		if ( node.type === 'ImportDeclaration' ) {

			const moduleName = node.source.value;
			const fullMatch = code.substring( node.start, node.end );

			const specifiers = [];
			node.specifiers.forEach( spec => {

				if ( spec.type === 'ImportSpecifier' ) {

					specifiers.push( {
						type: 'named',
						imported: spec.imported.type === 'Identifier' ? spec.imported.name : spec.imported.value,
						local: spec.local.name
					} );

				} else if ( spec.type === 'ImportDefaultSpecifier' ) {

					specifiers.push( {
						type: 'default',
						imported: 'default',
						local: spec.local.name
					} );

				} else if ( spec.type === 'ImportNamespaceSpecifier' ) {

					specifiers.push( {
						type: 'namespace',
						imported: '*',
						local: spec.local.name
					} );

				}

			} );

			importDeclarations.push( {
				start: node.start,
				end: node.end,
				moduleName: moduleName,
				fullMatch: fullMatch,
				specifiers: specifiers
			} );

		}

		let decl = node;
		if ( node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration' ) {

			decl = node.declaration;
			if ( node.specifiers ) {

				node.specifiers.forEach( s => {

					if ( s.local ) declaredSymbols.add( s.local.name );

				} );

			}

		}

		if ( decl ) {

			if ( decl.type === 'VariableDeclaration' ) {

				decl.declarations.forEach( d => extractPattern( d.id ) );

			} else if ( decl.type === 'FunctionDeclaration' || decl.type === 'ClassDeclaration' ) {

				if ( decl.id ) declaredSymbols.add( decl.id.name );

			}

		}

	} );

	return { importDeclarations, declaredSymbols };

}

function stripImportDeclarations( code, declarations ) {

	const sorted = [ ...declarations ].sort( ( a, b ) => b.start - a.start );
	let result = code;
	sorted.forEach( decl => {

		const snippet = code.substring( decl.start, decl.end );
		const linePreserved = snippet.replace( /[^\n]/g, '' );
		result = result.substring( 0, decl.start ) + linePreserved + result.substring( decl.end );

	} );
	return result;

}

function processExportDeclarations( code ) {

	let cleanText = code;
	const exportedSymbols = [];

	// 1. Parse braced exports (e.g., export { foo, bar as baz };)
	const bracedExportRegex = /export\s*\{([\s\S]*?)\};?/g;
	let bracedMatch;
	while ( ( bracedMatch = bracedExportRegex.exec( cleanText ) ) !== null ) {

		const symbolList = bracedMatch[ 1 ].split( ',' ).map( s => s.trim() ).filter( Boolean );
		symbolList.forEach( symbol => {

			let localName = symbol;
			let exportName = symbol;
			if ( symbol.includes( ' as ' ) ) {

				const parts = symbol.split( /\s+as\s+/ );
				localName = parts[ 0 ].trim();
				exportName = parts[ 1 ].trim();

			}

			exportedSymbols.push( { local: localName, export: exportName } );

		} );

	}

	cleanText = cleanText.replace( bracedExportRegex, '' );

	// 2. Parse inline variable exports (e.g., export const foo = 1; or export let a = 1, b = 2;)
	cleanText = cleanText.replace( /export\s+(const|let|var)\s+([^;\n]+)/g, ( match, type, decls ) => {

		const parts = decls.split( ',' );
		parts.forEach( p => {

			const name = p.trim().split( '=' )[ 0 ].trim().split( /\s+/ )[ 0 ];
			if ( /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test( name ) ) {

				exportedSymbols.push( { local: name, export: name } );

			}

		} );

		return `${type} ${decls}`;

	} );

	// 3. Parse inline function or class exports (e.g., export function foo() {}, export async function foo() {})
	cleanText = cleanText.replace( /export\s+(async\s+)?(function\*?|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g, ( match, asyncPrefix, type, name ) => {

		exportedSymbols.push( { local: name, export: name } );
		return `${asyncPrefix || ''}${type} ${name}`;

	} );

	// 4. Parse default function/class declaration exports (e.g., export default function foo() {})
	cleanText = cleanText.replace( /export\s+default\s+(async\s+)?(function\*?|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g, ( match, asyncPrefix, type, name ) => {

		exportedSymbols.push( { local: name, export: 'default' } );
		return `${asyncPrefix || ''}${type} ${name}`;

	} );

	// 5. Parse default anonymous function/class exports (e.g., export default function() {})
	cleanText = cleanText.replace( /export\s+default\s+(async\s+)?(function\*?|class)\s*\(/g, ( match, asyncPrefix, type ) => {

		const name = '__default_export__';
		exportedSymbols.push( { local: name, export: 'default' } );
		return `${asyncPrefix || ''}${type} ${name}(`;

	} );

	// 6. Parse default expression exports (e.g., export default foo;)
	cleanText = cleanText.replace( /export\s+default\s+([^;]+);?/g, ( match, expression ) => {

		const name = '__default_export__';
		exportedSymbols.push( { local: name, export: 'default' } );
		return `const ${name} = ${expression};`;

	} );

	return { cleanText, exportedSymbols };

}

function serializeArg( arg, depth = 0, seen = new WeakSet() ) {

	if ( arg === null ) return 'null';
	if ( arg === undefined ) return 'undefined';
	if ( typeof arg === 'string' ) return arg;
	if ( typeof arg === 'number' || typeof arg === 'boolean' || typeof arg === 'symbol' || typeof arg === 'bigint' ) return String( arg );
	if ( typeof arg === 'function' ) return `[Function: ${arg.name || 'anonymous'}]`;

	if ( arg instanceof Error ) {

		return arg.message || String( arg );

	}

	if ( seen.has( arg ) ) return '[Circular]';
	seen.add( arg );

	if ( arg instanceof HTMLElement ) {

		return `<${arg.tagName.toLowerCase()}${arg.id ? '#' + arg.id : ''}${arg.className ? '.' + arg.className.split( ' ' ).join( '.' ) : ''}>`;

	}

	if ( Array.isArray( arg ) ) {

		if ( depth > 2 ) return '[Array]';
		const items = arg.slice( 0, 10 ).map( item => serializeArg( item, depth + 1, seen ) );
		if ( arg.length > 10 ) items.push( `... ${arg.length - 10} more` );
		return `[ ${items.join( ', ' )} ]`;

	}

	const constructorName = arg.constructor ? arg.constructor.name : 'Object';
	if ( constructorName && constructorName !== 'Object' ) {

		if ( [ 'Vector2', 'Vector3', 'Vector4', 'Color' ].includes( constructorName ) ) {

			if ( constructorName === 'Color' ) {

				return `Color( r: ${arg.r}, g: ${arg.g}, b: ${arg.b} )`;

			}

			const coords = [ arg.x, arg.y, arg.z, arg.w ].filter( v => v !== undefined );
			return `${constructorName}( ${coords.join( ', ' )} )`;

		}

		const desc = [];
		if ( arg.type ) desc.push( `type: "${arg.type}"` );
		if ( arg.name ) desc.push( `name: "${arg.name}"` );
		if ( arg.uuid ) desc.push( `uuid: "${arg.uuid.substring( 0, 8 )}..."` );

		const descStr = desc.length > 0 ? ` { ${desc.join( ', ' )} }` : '';
		return `${constructorName}${descStr}`;

	}

	if ( depth > 2 ) return '[Object]';
	const keys = Object.keys( arg );
	const entries = keys.slice( 0, 10 ).map( key => {

		return `${key}: ${serializeArg( arg[ key ], depth + 1, seen )}`;

	} );
	if ( keys.length > 10 ) entries.push( `... ${keys.length - 10} more` );
	return `{ ${entries.join( ', ' )} }`;

}

function isStandardModule( moduleName, imports ) {

	const inRunnerImports = Object.keys( imports ).some( lib => moduleName === lib || moduleName.startsWith( lib + '/' ) );
	if ( inRunnerImports ) return true;

	const inImportMap = Object.keys( importMap.imports ).some( lib => {

		if ( lib.endsWith( '/' ) ) {

			return moduleName.startsWith( lib );

		}

		return moduleName === lib || moduleName.startsWith( lib + '/' );

	} );

	return inImportMap;

}

function resolvePath( importerName, importPath ) {

	if ( importPath.startsWith( './' ) || importPath.startsWith( '../' ) ) {

		const importerParts = importerName.split( '/' );
		importerParts.pop(); // Remove the filename/leaf name

		const importParts = importPath.split( '/' );
		for ( const part of importParts ) {

			if ( part === '.' ) {

				continue;

			} else if ( part === '..' ) {

				importerParts.pop();

			} else if ( part !== '' ) {

				importerParts.push( part );

			}

		}

		return importerParts.join( '/' );

	}

	return importPath;

}


const LIFECYCLE_METHODS = [ 'init', 'refresh', 'update', 'resize', 'dispose' ];

class CodeRunner extends EventDispatcher {

	constructor( env = {} ) {

		super();

		this.env = env;
		this.imports = {};

		this.activeScriptNames = [];

		this.scripts = {}; // Cache of loaded scripts
		this.loadingScripts = new Set();

		this.customConsole = new Proxy( console, {
			get: ( target, prop ) => {

				if ( prop === 'log' || prop === 'error' || prop === 'warn' || prop === 'info' ) {

					return ( ...args ) => {

						target[ prop ]( ...args );

						const firstArg = args[ 0 ];
						if ( typeof firstArg === 'string' && firstArg.includes( '%c' ) ) {

							return;

						}

						const msg = args.map( arg => serializeArg( arg ) ).join( ' ' );

						let eventType = 'log';
						if ( prop === 'error' ) eventType = 'error-log';
						else if ( prop === 'warn' ) eventType = 'warn-log';

						this.dispatchEvent( { type: eventType, message: msg } );

					};

				}

				const val = target[ prop ];
				return typeof val === 'function' ? val.bind( target ) : val;

			}
		} );

	}

	setImport( name, module ) {

		this.imports[ name ] = module;

	}

	setValue( name, value ) {

		this.env[ name ] = value;

	}

	activateScript( name ) {

		const scriptConfig = this.scripts[ name ];
		if ( ! scriptConfig ) return;

		if ( scriptConfig.dependencies ) {

			for ( const dep of scriptConfig.dependencies ) {

				this.activateScript( dep );

			}

		}

		if ( ! this.activeScriptNames.includes( name ) ) {

			this.activeScriptNames.push( name );

		}

	}

	async load( name ) {

		const scriptConfig = this.scripts[ name ];
		if ( ! scriptConfig ) return null;

		if ( ! scriptConfig.dependencies ) {

			scriptConfig.dependencies = [];

		}

		if ( scriptConfig.instance ) return scriptConfig.instance;

		if ( this.loadingScripts.has( name ) ) {

			return scriptConfig.instance || {};

		}

		if ( ! scriptConfig.promise ) {

			this.loadingScripts.add( name );

			scriptConfig.promise = ( async () => {

				try {

					let text;
					if ( scriptConfig.text !== undefined && scriptConfig.text !== null ) {

						text = scriptConfig.text;

					} else {

						const response = await fetch( scriptConfig.url );
						if ( ! response.ok ) {

							throw new Error( `Failed to load script "${name}": Server returned status ${response.status}.` );

						}

						text = await response.text();
						scriptConfig.text = text;

					}

					const { importDeclarations, declaredSymbols } = parseScript( text );

					const symbols = [];
					const values = [];

					for ( const [ key, val ] of Object.entries( this.env ) ) {

						if ( ! declaredSymbols.has( key ) ) {

							symbols.push( key );
							values.push( val );

						}

					}

					symbols.push( 'console' );
					values.push( this.customConsole );

					const importPromises = [];

					importDeclarations.forEach( decl => {

						const moduleName = decl.moduleName;
						const fullMatch = decl.fullMatch;

						importPromises.push( ( async () => {

							let moduleObj = this.imports[ moduleName ];
							if ( ! moduleObj ) {

								const isStandard = isStandardModule( moduleName, this.imports );
								if ( ! isStandard ) {

									const resolvedPath = resolvePath( name, moduleName );
									const baseName = resolvedPath.replace( /\.js$/, '' );
									if ( ! this.scripts[ baseName ] ) {

										this.scripts[ baseName ] = {
											url: `./js/imports/scripts/${baseName}.js`,
											instance: null,
											promise: null,
											dependencies: []
										};

									}

									if ( ! scriptConfig.dependencies.includes( baseName ) ) {

										scriptConfig.dependencies.push( baseName );

									}

									moduleObj = await this.load( baseName );

								} else {

									try {

										moduleObj = await import( moduleName );

									} catch ( err ) {

										const charIndex = text.indexOf( fullMatch );
										const lineNumber = charIndex !== - 1 ? text.substring( 0, charIndex ).split( '\n' ).length : 1;
										const error = new Error( `Failed to load import "${moduleName}" in script "${name}.js". Make sure the module path is correct.` );
										error.customLineNumber = lineNumber;
										throw error;

									}

								}

							}

							if ( moduleObj ) {

								decl.specifiers.forEach( spec => {

									if ( spec.type === 'named' ) {

										symbols.push( spec.local );
										values.push( moduleObj[ spec.imported ] );

									} else if ( spec.type === 'namespace' ) {

										symbols.push( spec.local );
										values.push( moduleObj );

									} else if ( spec.type === 'default' ) {

										symbols.push( spec.local );
										values.push( moduleObj[ 'default' ] );

									}

								} );

							}

						} )() );

					} );

					if ( importPromises.length > 0 ) {

						await Promise.all( importPromises );

					}

					const cleanImportsText = stripImportDeclarations( text, importDeclarations );
					const { cleanText, exportedSymbols } = processExportDeclarations( cleanImportsText );

					const returnFields = LIFECYCLE_METHODS.map( name => `${name}: typeof ${name} !== 'undefined' ? ${name} : undefined` );
					exportedSymbols.forEach( symbol => {

						if ( ! LIFECYCLE_METHODS.includes( symbol.export ) ) {

							returnFields.push( `get "${symbol.export}"() { return typeof ${symbol.local} !== \'undefined\' ? ${symbol.local} : undefined; }` );

						}

					} );

					const wrapperFn = new Function( ...symbols, `${cleanText}\nreturn { ${returnFields.join( ', ' )} };\n//# sourceURL=${name}.js` );

					scriptConfig.instance = wrapperFn( ...values );

					if ( scriptConfig.instance ) {

						for ( const key of Object.keys( scriptConfig.instance ) ) {

							if ( ! LIFECYCLE_METHODS.includes( key ) ) {

								Object.defineProperty( this.env, key, {
									get: () => scriptConfig.instance ? scriptConfig.instance[ key ] : undefined,
									configurable: true,
									enumerable: true
								} );

							}

						}

					}

					if ( scriptConfig.instance && scriptConfig.instance.init ) {

						await scriptConfig.instance.init();

					}

					return scriptConfig.instance;

				} finally {

					this.loadingScripts.delete( name );

				}

			} )();

		}

		return scriptConfig.promise;

	}
	call( name, ...args ) {

		this.activeScriptNames.forEach( scriptName => {

			const scriptConfig = this.scripts[ scriptName ];
			if ( scriptConfig && scriptConfig.instance && scriptConfig.instance[ name ] ) {

				scriptConfig.instance[ name ]( ...args );

			}

		} );

	}

	async run( code ) {

		this.dispatchEvent( { type: 'start' } );

		// Dispose previous main script
		const prevMain = this.scripts[ '__main__' ];
		if ( prevMain && prevMain.instance && prevMain.instance.dispose ) {

			prevMain.instance.dispose();

		}

		try {

			const { importDeclarations, declaredSymbols } = parseScript( code );

			const symbols = [];
			const values = [];

			const importedCustomScripts = [];

			for ( const decl of importDeclarations ) {

				const moduleName = decl.moduleName;
				const fullMatch = decl.fullMatch;

				const isStandard = isStandardModule( moduleName, this.imports );
				if ( ! isStandard ) {

					const resolvedPath = resolvePath( '__main__', moduleName );
					const baseName = resolvedPath.replace( /\.js$/, '' );
					if ( ! importedCustomScripts.includes( baseName ) ) {

						importedCustomScripts.push( baseName );

					}

				} else {

					let moduleObj = this.imports[ moduleName ];

					if ( ! moduleObj ) {

						try {

							moduleObj = await import( moduleName );

						} catch ( err ) {

							const charIndex = code.indexOf( fullMatch );
							const lineNumber = charIndex !== - 1 ? code.substring( 0, charIndex ).split( '\n' ).length : 1;
							const error = new Error( `Failed to load import "${moduleName}" in script. Make sure the module path/importmap is correct.` );
							error.customLineNumber = lineNumber;
							throw error;

						}

					}

					if ( moduleObj ) {

						decl.specifiers.forEach( spec => {

							if ( spec.type === 'named' ) {

								if ( ! symbols.includes( spec.local ) ) {

									symbols.push( spec.local );
									values.push( moduleObj[ spec.imported ] );

								}

							} else if ( spec.type === 'namespace' ) {

								if ( ! symbols.includes( spec.local ) ) {

									symbols.push( spec.local );
									values.push( moduleObj );

								}

							} else if ( spec.type === 'default' ) {

								if ( ! symbols.includes( spec.local ) ) {

									symbols.push( spec.local );
									values.push( moduleObj[ 'default' ] );

								}

							}

						} );

					}

				}

			}

			// Execute scene scripts dynamically
			const activeModules = {};
			const prevActiveCustomScripts = this.activeScriptNames.filter( name => name !== '__main__' );

			this.activeScriptNames = [];

			// Load / Create active scripts
			for ( const baseName of importedCustomScripts ) {

				if ( ! this.scripts[ baseName ] ) {

					this.scripts[ baseName ] = {
						url: `./js/imports/scripts/${baseName}.js`,
						instance: null,
						promise: null,
						dependencies: []
					};

				}

				try {

					await this.load( baseName );

				} catch ( err ) {

					// Find where the script was imported in the main editor code
					const matchRegex = new RegExp( `import\\s+(?:[\\s\\S]*?\\s+from\\s+)?['"](\\.\\/)?${baseName}(\\.js)?['"];?`, 'i' );
					const match = code.match( matchRegex );
					if ( match ) {

						const charIndex = code.indexOf( match[ 0 ] );
						if ( charIndex !== - 1 ) {

							err.customLineNumber = code.substring( 0, charIndex ).split( '\n' ).length;

						}

					}

					throw err;

				}

			}

			// Activate scripts recursively (building correct activeScriptNames order)
			for ( const baseName of importedCustomScripts ) {

				this.activateScript( baseName );

			}

			// Dispose and clear removed scripts (using complete activeScriptNames list)
			const removedCustomScripts = prevActiveCustomScripts.filter( name => ! this.activeScriptNames.includes( name ) );
			for ( const baseName of removedCustomScripts ) {

				const scriptConfig = this.scripts[ baseName ];
				if ( scriptConfig ) {

					if ( scriptConfig.instance ) {

						if ( scriptConfig.instance.dispose ) {

							scriptConfig.instance.dispose();

						}

						for ( const key of Object.keys( scriptConfig.instance ) ) {

							if ( ! LIFECYCLE_METHODS.includes( key ) ) {

								delete this.env[ key ];

							}

						}

					}

					scriptConfig.instance = null;
					scriptConfig.promise = null;

				}

			}

			// Refresh, resize, and expose exports for all active custom scripts
			for ( const baseName of this.activeScriptNames ) {

				const scriptConfig = this.scripts[ baseName ];
				const instance = scriptConfig ? scriptConfig.instance : null;
				if ( instance ) {

					if ( instance.refresh ) {

						await instance.refresh();

					}

					if ( instance.resize && this.env.renderer ) {

						const width = this.env.renderer.domElement.clientWidth;
						const height = this.env.renderer.domElement.clientHeight;
						if ( width > 0 && height > 0 ) {

							instance.resize( width, height );

						}

					}

					for ( const key of Object.keys( instance ) ) {

						if ( ! LIFECYCLE_METHODS.includes( key ) && instance[ key ] !== undefined ) {

							activeModules[ key ] = instance[ key ];

							const desc = Object.getOwnPropertyDescriptor( this.env, key );
							if ( ! desc || ! desc.get ) {

								this.env[ key ] = instance[ key ];

							}

						}

					}

				}

			}

			// Inject active modules into parameters
			for ( const [ name, obj ] of Object.entries( activeModules ) ) {

				if ( ! symbols.includes( name ) ) {

					symbols.push( name );
					values.push( obj );

				}

			}

			// Inject runner env variables (e.g. renderer) not shadowed by local declarations
			for ( const [ key, val ] of Object.entries( this.env ) ) {

				if ( ! symbols.includes( key ) && ! declaredSymbols.has( key ) ) {

					symbols.push( key );
					values.push( val );

				}

			}

			symbols.push( 'console' );
			values.push( this.customConsole );

			// Strip all import and export statements from code so it can run inside Function body
			const strippedImportsCode = stripImportDeclarations( code, importDeclarations );
			const { cleanText: strippedCode, exportedSymbols } = processExportDeclarations( strippedImportsCode );

			const returnFields = LIFECYCLE_METHODS.map( name => `${name}: typeof ${name} !== 'undefined' ? ${name} : undefined` );
			exportedSymbols.forEach( symbol => {

				if ( ! LIFECYCLE_METHODS.includes( symbol.export ) ) {

					returnFields.push( `get "${symbol.export}"() { return typeof ${symbol.local} !== \'undefined\' ? ${symbol.local} : undefined; }` );

				}

			} );

			const executor = new Function( ...symbols, `${strippedCode}\nreturn { ${returnFields.join( ', ' )} };\n//# sourceURL=playground-eval.js` );
			const instance = executor( ...values );

			this.scripts[ '__main__' ] = {
				url: null,
				instance: instance,
				promise: Promise.resolve( instance )
			};
			this.activeScriptNames.push( '__main__' );

			if ( instance && instance.init ) {

				await instance.init();

			}

			if ( instance && instance.resize && this.env.renderer ) {

				const width = this.env.renderer.domElement.clientWidth;
				const height = this.env.renderer.domElement.clientHeight;
				if ( width > 0 && height > 0 ) {

					instance.resize( width, height );

				}

			}

			this.dispatchEvent( { type: 'success' } );

		} catch ( e ) {

			// Parse error stack to find line/col
			let line = e.customLineNumber !== undefined ? e.customLineNumber : null;
			let column = null;
			if ( line === null && e.stack ) {

				const pgMatch = e.stack.match( /playground-eval\.js:(\d+):(\d+)/ );
				if ( pgMatch ) {

					line = parseInt( pgMatch[ 1 ] ) - 2;
					column = parseInt( pgMatch[ 2 ] );

				} else {

					// Chrome / Safari
					const match = e.stack.match( /<anonymous>:(\d+):(\d+)/ );
					if ( match ) {

						line = parseInt( match[ 1 ] ) - 2;
						column = parseInt( match[ 2 ] );

					} else {

						// Firefox fallback
						const ffMatch = e.stack.match( /Function:(\d+):(\d+)/ );
						if ( ffMatch ) {

							line = parseInt( ffMatch[ 1 ] ) - 2;
							column = parseInt( ffMatch[ 2 ] );

						}

					}

				}

			}

			let displayMessage = e.message || e.toString();
			if ( line !== null && line > 0 ) {

				displayMessage = `Line ${line}: ${displayMessage}`;

			}

			this.dispatchEvent( {
				type: 'error',
				error: e,
				line: line,
				column: column,
				message: displayMessage
			} );

		}

	}

	dispose() {

		for ( const baseName of Object.keys( this.scripts ) ) {

			const scriptConfig = this.scripts[ baseName ];
			if ( scriptConfig && scriptConfig.instance ) {

				if ( scriptConfig.instance.dispose ) {

					try {

						scriptConfig.instance.dispose();

					} catch ( e ) {

						console.error( `Error disposing script ${baseName}:`, e );

					}

				}

				for ( const key of Object.keys( scriptConfig.instance ) ) {

					if ( ! LIFECYCLE_METHODS.includes( key ) ) {

						delete this.env[ key ];

					}

				}

			}

		}

		this.scripts = {};
		this.activeScriptNames = [];

	}

}

export { CodeRunner };
