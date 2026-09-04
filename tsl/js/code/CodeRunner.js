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

	let ast;
	try {

		ast = acorn.parse( code, { ecmaVersion: 'latest', sourceType: 'module' } );

	} catch {

		return { cleanText: code, exportedSymbols: [] };

	}

	const exportedSymbols = [];
	const replacements = [];

	const extractPattern = ( pattern ) => {

		if ( ! pattern ) return [];
		if ( pattern.type === 'Identifier' ) return [ pattern.name ];
		if ( pattern.type === 'ObjectPattern' ) {

			const names = [];
			pattern.properties.forEach( p => names.push( ...extractPattern( p.value || p.argument ) ) );
			return names;

		}

		if ( pattern.type === 'ArrayPattern' ) {

			const names = [];
			pattern.elements.forEach( el => names.push( ...extractPattern( el ) ) );
			return names;

		}

		return [];

	};

	ast.body.forEach( node => {

		if ( node.type === 'ExportNamedDeclaration' ) {

			if ( node.declaration ) {

				const decl = node.declaration;
				const exportKwLength = decl.start - node.start;
				const spaces = ' '.repeat( exportKwLength );
				replacements.push( { start: node.start, end: decl.start, replacement: spaces } );

				if ( decl.type === 'VariableDeclaration' ) {

					decl.declarations.forEach( d => {

						extractPattern( d.id ).forEach( name => exportedSymbols.push( { local: name, export: name } ) );

					} );

				} else if ( decl.type === 'FunctionDeclaration' || decl.type === 'ClassDeclaration' ) {

					if ( decl.id ) exportedSymbols.push( { local: decl.id.name, export: decl.id.name } );

				}

			} else if ( node.specifiers ) {

				const snippet = code.substring( node.start, node.end );
				const linePreserved = snippet.replace( /[^\n]/g, ' ' );
				replacements.push( { start: node.start, end: node.end, replacement: linePreserved } );

				node.specifiers.forEach( spec => {

					const local = spec.local ? spec.local.name : spec.local.value;
					const exported = spec.exported ? ( spec.exported.name || spec.exported.value ) : local;
					exportedSymbols.push( { local, export: exported } );

				} );

			}

		} else if ( node.type === 'ExportDefaultDeclaration' ) {

			const decl = node.declaration;
			if ( decl.type === 'FunctionDeclaration' || decl.type === 'ClassDeclaration' ) {

				if ( decl.id ) {

					const exportKwLength = decl.start - node.start;
					const spaces = ' '.repeat( exportKwLength );
					replacements.push( { start: node.start, end: decl.start, replacement: spaces } );
					exportedSymbols.push( { local: decl.id.name, export: 'default' } );

				} else {

					replacements.push( { start: node.start, end: decl.start, replacement: 'const __default_export__ = ' } );
					exportedSymbols.push( { local: '__default_export__', export: 'default' } );

				}

			} else {

				replacements.push( { start: node.start, end: decl.start, replacement: 'const __default_export__ = ' } );
				exportedSymbols.push( { local: '__default_export__', export: 'default' } );

			}

		}

	} );

	replacements.sort( ( a, b ) => b.start - a.start );
	let cleanText = code;
	replacements.forEach( r => {

		cleanText = cleanText.substring( 0, r.start ) + r.replacement + cleanText.substring( r.end );

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

	call( methodName, ...args ) {

		for ( const name of this.activeScriptNames ) {

			const scriptConfig = this.scripts[ name ];
			const instance = scriptConfig ? scriptConfig.instance : null;

			if ( instance && typeof instance[ methodName ] === 'function' ) {

				try {

					instance[ methodName ]( ...args );

				} catch ( e ) {

					console.error( `Error executing "${methodName}" on script "${name}":`, e );

				}

			}

		}

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

	invalidateScript( name ) {

		const scriptConfig = this.scripts[ name ];
		if ( ! scriptConfig ) return;

		if ( scriptConfig.instance ) {

			if ( scriptConfig.instance.dispose ) {

				try {

					scriptConfig.instance.dispose();

				} catch ( e ) {

					console.error( `Error disposing script "${name}":`, e );

				}

			}

		}

		scriptConfig.instance = null;
		scriptConfig.promise = null;
		scriptConfig.exportedKeys = new Set();

		// Cascade invalidation to any script that depends on this script
		for ( const [ otherName, otherConfig ] of Object.entries( this.scripts ) ) {

			if ( otherName !== name && otherConfig && otherConfig.dependencies && otherConfig.dependencies.includes( name ) ) {

				this.invalidateScript( otherName );

			}

		}

	}

	dispose() {

		for ( const name of [ ...this.activeScriptNames ] ) {

			this.invalidateScript( name );

		}

		if ( this.scripts[ '__main__' ] ) {

			this.invalidateScript( '__main__' );

		}

		this.activeScriptNames = [];

	}

	async load( name, refreshedScripts = null, loadingStack = new Set() ) {

		const scriptConfig = this.scripts[ name ];
		if ( ! scriptConfig ) return null;

		if ( ! scriptConfig.dependencies ) {

			scriptConfig.dependencies = [];

		}

		if ( scriptConfig.instance ) {

			if ( refreshedScripts && ! refreshedScripts.has( name ) ) {

				refreshedScripts.add( name );

				if ( scriptConfig.dependencies ) {

					for ( const dep of scriptConfig.dependencies ) {

						await this.load( dep, refreshedScripts, loadingStack );

					}

				}

				if ( scriptConfig.instance.refresh ) {

					await scriptConfig.instance.refresh();

				}

			}

			return scriptConfig.instance;

		}

		if ( loadingStack.has( name ) ) {

			return scriptConfig.instance || {};

		}

		if ( ! scriptConfig.promise ) {

			const branchStack = new Set( loadingStack );
			branchStack.add( name );

			scriptConfig.promise = ( async () => {

				try {

					let text;
					if ( scriptConfig.text !== undefined && scriptConfig.text !== null ) {

						text = scriptConfig.text;

					} else {

						let response;
						try {

							response = await fetch( scriptConfig.url );

						} catch ( fetchErr ) {

							throw new Error( `Failed to load module "${name}". Network error: ${fetchErr.message || fetchErr}.` );

						}

						const contentType = response.headers.get( 'content-type' ) || '';
						if ( ! response.ok || contentType.includes( 'text/html' ) ) {

							throw new Error( `Failed to load module "${name}". File not found at "${scriptConfig.url}".` );

						}

						text = await response.text();

						if ( text.trim().startsWith( '<' ) ) {

							throw new Error( `Failed to load module "${name}". Server returned HTML instead of JavaScript.` );

						}

						scriptConfig.text = text;

					}

					const { importDeclarations, declaredSymbols } = parseScript( text );

					const loadedModules = new Map();

					const importPromises = importDeclarations.map( async ( decl ) => {

						const moduleName = decl.moduleName;
						const fullMatch = decl.fullMatch;

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

								try {

									moduleObj = await this.load( baseName, refreshedScripts, branchStack );

								} catch ( err ) {

									const lineNumber = text.substring( 0, decl.start ).split( '\n' ).length;
									const error = new Error( `Failed to load import "${moduleName}" in script "${name}.js". ${err.message}` );
									error.customLineNumber = lineNumber;
									throw error;

								}

							} else {

								try {

									moduleObj = await import( moduleName );

								} catch ( err ) {

									const lineNumber = text.substring( 0, decl.start ).split( '\n' ).length;
									const error = new Error( `Failed to load import "${moduleName}" in script "${name}.js". Make sure the module path is correct.` );
									error.customLineNumber = lineNumber;
									throw error;

								}

							}

						}

						loadedModules.set( decl, moduleObj );

					} );

					if ( importPromises.length > 0 ) {

						await Promise.all( importPromises );

					}

					const symbols = [];
					const values = [];

					// 1. Process explicit import specifiers (named, namespace, default) or side-effect imports
					for ( const decl of importDeclarations ) {

						const moduleObj = loadedModules.get( decl );
						if ( moduleObj ) {

							if ( decl.specifiers.length > 0 ) {

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

							} else {

								// Side-effect import (e.g. import 'threejs-punk/scene';)
								for ( const key of Object.keys( moduleObj ) ) {

									if ( ! LIFECYCLE_METHODS.includes( key ) && moduleObj[ key ] !== undefined ) {

										if ( ! symbols.includes( key ) && ! declaredSymbols.has( key ) ) {

											symbols.push( key );
											values.push( moduleObj[ key ] );

										}

									}

								}

							}

						}

					}

					// 2. Inject runner environment variables (e.g. renderer) not shadowed by local declarations
					for ( const [ key, val ] of Object.entries( this.env ) ) {

						if ( ! symbols.includes( key ) && ! declaredSymbols.has( key ) ) {

							symbols.push( key );
							values.push( val );

						}

					}

					symbols.push( 'console' );
					values.push( this.customConsole );

					const cleanImportsText = stripImportDeclarations( text, importDeclarations );
					const { cleanText, exportedSymbols } = processExportDeclarations( cleanImportsText );

					const returnFields = [];
					exportedSymbols.forEach( symbol => {

						returnFields.push( `get "${symbol.export}"() { return typeof ${symbol.local} !== \'undefined\' ? ${symbol.local} : undefined; }` );

					} );

					let wrapperFn;
					try {

						wrapperFn = new Function( ...symbols, `${cleanText}\nreturn { ${returnFields.join( ', ' )} };\n//# sourceURL=${name}.js` );

					} catch ( err ) {

						throw new Error( `Syntax error in script "${name}.js": ${err.message}` );

					}

					scriptConfig.exportedKeys = new Set();

					try {

						scriptConfig.instance = wrapperFn( ...values );

					} catch ( err ) {

						throw new Error( `Error executing script "${name}.js": ${err.message}` );

					}

					if ( scriptConfig.instance && scriptConfig.instance.init ) {

						try {

							await scriptConfig.instance.init();

						} catch ( err ) {

							throw new Error( `Error in init() of script "${name}.js": ${err.message}` );

						}

					}

					return scriptConfig.instance;

				} catch ( err ) {

					scriptConfig.promise = null;
					throw err;

				}

			} )();

		}

		return await scriptConfig.promise;

	}

	async run( code ) {

		this.dispatchEvent( { type: 'start' } );

		// Dispose previous main script
		if ( this.scripts[ '__main__' ] ) {

			this.invalidateScript( '__main__' );

		}

		try {

			const { importDeclarations, declaredSymbols } = parseScript( code );

			const symbols = [];
			const values = [];

			const importedCustomScripts = [];

			const loadedStandardModules = new Map();

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

							const decl = importDeclarations.find( d => d.moduleName === moduleName );
							const lineNumber = decl ? code.substring( 0, decl.start ).split( '\n' ).length : 1;
							const error = new Error( `Failed to load import "${moduleName}" in script. Make sure the module path/importmap is correct.` );
							error.customLineNumber = lineNumber;
							throw error;

						}

					}

					if ( moduleObj ) {

						loadedStandardModules.set( decl, moduleObj );

					}

				}

			}

			// Execute scene scripts dynamically
			const prevActiveCustomScripts = this.activeScriptNames.filter( name => name !== '__main__' );
			const refreshedScripts = new Set();

			this.activeScriptNames = [];

			// 1. Load / Create active scripts (refreshing cached dependencies before dependents execute)
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

					await this.load( baseName, refreshedScripts );

				} catch ( err ) {

					const decl = importDeclarations.find( d => {

						const resolved = resolvePath( '__main__', d.moduleName ).replace( /\.js$/, '' );
						return resolved === baseName;

					} );

					if ( decl ) {

						err.customLineNumber = code.substring( 0, decl.start ).split( '\n' ).length;

					}

					throw err;

				}

			}

			// 2. Activate scripts recursively (building correct activeScriptNames order)
			for ( const baseName of importedCustomScripts ) {

				this.activateScript( baseName );

			}

			// 3. Dispose and clear removed scripts (using complete activeScriptNames list)
			const removedCustomScripts = prevActiveCustomScripts.filter( name => ! this.activeScriptNames.includes( name ) );
			for ( const baseName of removedCustomScripts ) {

				this.invalidateScript( baseName );

			}

			// 4. Resize active custom scripts
			for ( const baseName of this.activeScriptNames ) {

				const scriptConfig = this.scripts[ baseName ];
				const instance = scriptConfig ? scriptConfig.instance : null;
				if ( instance ) {

					if ( instance.resize && this.env.renderer ) {

						const width = this.env.renderer.domElement.clientWidth;
						const height = this.env.renderer.domElement.clientHeight;
						if ( width > 0 && height > 0 ) {

							instance.resize( width, height );

						}

					}

				}

			}

			// 5. Process imports for main script scope
			for ( const decl of importDeclarations ) {

				const moduleName = decl.moduleName;
				const isStandard = isStandardModule( moduleName, this.imports );
				let moduleObj;
				if ( ! isStandard ) {

					const resolvedPath = resolvePath( '__main__', moduleName );
					const baseName = resolvedPath.replace( /\.js$/, '' );
					const scriptConfig = this.scripts[ baseName ];
					moduleObj = scriptConfig ? scriptConfig.instance : null;

				} else {

					moduleObj = loadedStandardModules.get( decl );

				}

				if ( moduleObj ) {

					if ( decl.specifiers.length > 0 ) {

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

					} else {

						// Side-effect import (e.g. import 'threejs-punk/scene';)
						for ( const key of Object.keys( moduleObj ) ) {

							if ( ! LIFECYCLE_METHODS.includes( key ) && moduleObj[ key ] !== undefined ) {

								if ( ! symbols.includes( key ) && ! declaredSymbols.has( key ) ) {

									symbols.push( key );
									values.push( moduleObj[ key ] );

								}

							}

						}

					}

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

			const returnFields = [];
			exportedSymbols.forEach( symbol => {

				returnFields.push( `get "${symbol.export}"() { return typeof ${symbol.local} !== \'undefined\' ? ${symbol.local} : undefined; }` );

			} );

			const executor = new Function( ...symbols, `${strippedCode}\nreturn { ${returnFields.join( ', ' )} };\n//# sourceURL=playground-eval.js` );
			const instance = executor( ...values );

			this.scripts[ '__main__' ] = {
				url: null,
				instance: instance,
				promise: Promise.resolve( instance ),
				dependencies: importedCustomScripts,
				exportedKeys: new Set( Object.keys( instance || {} ) )
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
			let line = ( e.customLineNumber !== undefined && e.customLineNumber !== null && ! isNaN( e.customLineNumber ) && e.customLineNumber > 0 )
				? e.customLineNumber
				: null;
			let column = null;
			if ( line === null && e.stack ) {

				const pgMatch = e.stack.match( /playground-eval\.js:(\d+):(\d+)/ );
				if ( pgMatch ) {

					const parsedLine = parseInt( pgMatch[ 1 ] ) - 2;
					if ( parsedLine > 0 ) {

						line = parsedLine;
						column = parseInt( pgMatch[ 2 ] );

					}

				} else {

					// Chrome / Safari
					const match = e.stack.match( /<anonymous>:(\d+):(\d+)/ );
					if ( match ) {

						const parsedLine = parseInt( match[ 1 ] ) - 2;
						if ( parsedLine > 0 ) {

							line = parsedLine;
							column = parseInt( match[ 2 ] );

						}

					} else {

						// Firefox fallback
						const ffMatch = e.stack.match( /Function:(\d+):(\d+)/ );
						if ( ffMatch ) {

							const parsedLine = parseInt( ffMatch[ 1 ] ) - 2;
							if ( parsedLine > 0 ) {

								line = parsedLine;
								column = parseInt( ffMatch[ 2 ] );

							}

						}

					}

				}

			}

			let displayMessage = e.message || e.toString();
			if ( line !== null && ! isNaN( line ) && line > 0 ) {

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

}

export { CodeRunner, parseScript, isStandardModule, resolvePath };
