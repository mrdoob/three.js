import { EventDispatcher } from 'three';

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

function serializeArg( arg, depth = 0, seen = new WeakSet() ) {

	if ( arg === null ) return 'null';
	if ( arg === undefined ) return 'undefined';
	if ( typeof arg === 'string' ) return arg;
	if ( typeof arg === 'number' || typeof arg === 'boolean' || typeof arg === 'symbol' || typeof arg === 'bigint' ) return String( arg );
	if ( typeof arg === 'function' ) return `[Function: ${arg.name || 'anonymous'}]`;

	if ( arg instanceof Error ) {

		return arg.message || String( arg );

	}

	if ( typeof arg === 'object' ) {

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

	return String( arg );

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


const LIFECYCLE_METHODS = [ 'init', 'update', 'resize', 'dispose' ];

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

	async load( name ) {

		const scriptConfig = this.scripts[ name ];
		if ( ! scriptConfig ) return null;

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

					const importRegex = /import\s+{(.+?)}\s+from\s+['"]([^'"]+)['"];?/g;
					const namespaceImportRegex = /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"];?/g;
					let importMatch;
					const declaredVariables = new Set();
					const declRegex = /(?:let|const|var)\s+([^;=]+)/g;
					let declMatch;
					while ( ( declMatch = declRegex.exec( text ) ) !== null ) {

						const vars = declMatch[ 1 ].split( ',' ).map( v => v.trim().split( /\s*=\s*/ )[ 0 ].split( /\s+/ ).pop() );
						vars.forEach( v => {

							if ( v && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test( v ) ) {

								declaredVariables.add( v );

							}

						} );

					}

					const funcRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
					let funcMatch;
					while ( ( funcMatch = funcRegex.exec( text ) ) !== null ) {

						declaredVariables.add( funcMatch[ 1 ] );

					}

					const symbols = [];
					const values = [];

					for ( const [ key, val ] of Object.entries( this.env ) ) {

						if ( ! declaredVariables.has( key ) ) {

							symbols.push( key );
							values.push( val );

						}

					}

					symbols.push( 'console' );
					values.push( this.customConsole );

					let cleanText = text;
					const importPromises = [];

					while ( ( importMatch = importRegex.exec( text ) ) !== null ) {

						const symbolListStr = importMatch[ 1 ];
						const moduleName = importMatch[ 2 ];
						const fullMatch = importMatch[ 0 ];

						cleanText = cleanText.replace( fullMatch, '' );

						importPromises.push( ( async () => {

							let moduleObj = this.imports[ moduleName ];
							if ( ! moduleObj ) {

								const isStandard = isStandardModule( moduleName, this.imports );
								if ( ! isStandard ) {

									const cleanName = moduleName.replace( /^\.\//, '' ).replace( /^\.\..+/, '' );
									const baseName = cleanName.replace( /\.js$/, '' );
									if ( ! this.scripts[ baseName ] ) {

										this.scripts[ baseName ] = {
											url: `./js/imports/scripts/${baseName}.js`,
											instance: null,
											promise: null
										};

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

								const symbolList = symbolListStr.split( ',' ).map( s => s.trim() ).filter( Boolean );
								symbolList.forEach( symbol => {

									let localName = symbol;
									let exportName = symbol;
									if ( symbol.includes( ' as ' ) ) {

										const parts = symbol.split( /\s+as\s+/ );
										exportName = parts[ 0 ].trim();
										localName = parts[ 1 ].trim();

									}

									symbols.push( localName );
									values.push( moduleObj[ exportName ] );

								} );

							}

						} )() );

					}

					let namespaceMatch;
					while ( ( namespaceMatch = namespaceImportRegex.exec( text ) ) !== null ) {

						const localName = namespaceMatch[ 1 ];
						const moduleName = namespaceMatch[ 2 ];
						const fullMatch = namespaceMatch[ 0 ];

						cleanText = cleanText.replace( fullMatch, '' );

						importPromises.push( ( async () => {

							let moduleObj = this.imports[ moduleName ];
							if ( ! moduleObj ) {

								const isStandard = isStandardModule( moduleName, this.imports );
								if ( ! isStandard ) {

									const cleanName = moduleName.replace( /^\.\//, '' ).replace( /^\.\..+/, '' );
									const baseName = cleanName.replace( /\.js$/, '' );
									if ( ! this.scripts[ baseName ] ) {

										this.scripts[ baseName ] = {
											url: `./js/imports/scripts/${baseName}.js`,
											instance: null,
											promise: null
										};

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

								symbols.push( localName );
								values.push( moduleObj );

							}

						} )() );

					}

					const defaultImportRegex = /import\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+from\s+['"]([^'"]+)['"];?/g;
					let defaultMatch;
					while ( ( defaultMatch = defaultImportRegex.exec( text ) ) !== null ) {

						const localName = defaultMatch[ 1 ];
						const moduleName = defaultMatch[ 2 ];
						const fullMatch = defaultMatch[ 0 ];

						cleanText = cleanText.replace( fullMatch, '' );

						importPromises.push( ( async () => {

							let moduleObj = this.imports[ moduleName ];
							if ( ! moduleObj ) {

								const isStandard = isStandardModule( moduleName, this.imports );
								if ( ! isStandard ) {

									const cleanName = moduleName.replace( /^\.\//, '' ).replace( /^\.\..+/, '' );
									const baseName = cleanName.replace( /\.js$/, '' );
									if ( ! this.scripts[ baseName ] ) {

										this.scripts[ baseName ] = {
											url: `./js/imports/scripts/${baseName}.js`,
											instance: null,
											promise: null
										};

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

								symbols.push( localName );
								values.push( moduleObj[ 'default' ] );

							}

						} )() );

					}

					if ( importPromises.length > 0 ) {

						await Promise.all( importPromises );

					}

					const exportedSymbols = [];

					// 1. Parse braced exports (e.g., export { foo, bar as baz };)
					const bracedExportRegex = /export\s+{(.+?)}/g;
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

					// 2. Parse inline variable exports (e.g., export const foo = 1;)
					cleanText = cleanText.replace( /export\s+(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g, ( match, type, name ) => {

						exportedSymbols.push( { local: name, export: name } );
						return `${type} ${name}`;

					} );

					// 3. Parse inline function or class exports (e.g., export function foo() {})
					cleanText = cleanText.replace( /export\s+(async\s+)?(function|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g, ( match, asyncPrefix, type, name ) => {

						exportedSymbols.push( { local: name, export: name } );
						return `${asyncPrefix || ''}${type} ${name}`;

					} );

					// 4. Parse default function/class declaration exports (e.g., export default function foo() {})
					cleanText = cleanText.replace( /export\s+default\s+(async\s+)?(function|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g, ( match, asyncPrefix, type, name ) => {

						exportedSymbols.push( { local: name, export: 'default' } );
						return `${asyncPrefix || ''}${type} ${name}`;

					} );

					// 5. Parse default anonymous function/class exports (e.g., export default function() {})
					cleanText = cleanText.replace( /export\s+default\s+(async\s+)?(function|class)\s*\(/g, ( match, asyncPrefix, type ) => {

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

					const returnFields = LIFECYCLE_METHODS.map( name => `${name}: typeof ${name} !== 'undefined' ? ${name} : undefined` );
					exportedSymbols.forEach( symbol => {

						returnFields.push( `get "${symbol.export}"() { return typeof ${symbol.local} !== \'undefined\' ? ${symbol.local} : undefined; }` );

					} );

					const wrapperFn = new Function( ...symbols, `${cleanText}\nreturn { ${returnFields.join( ', ' )} };\n//# sourceURL=${name}.js` );

					scriptConfig.instance = wrapperFn( ...values );
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

		this.activeScriptNames.forEach( scriptName => {

			const scriptConfig = this.scripts[ scriptName ];
			if ( scriptConfig && scriptConfig.instance && scriptConfig.instance.dispose ) {

				scriptConfig.instance.dispose();

			}

		} );

		this.activeScriptNames = [];

		try {

			// Strip comments and strings for analysis while keeping active imports intact
			const parserRegex = /(\/\*[\s\S]*?\*\/|\/\/.+)|(import\s*(?:[\w\s,\*\{\}]+\s+from\s+)?['"][^'"]+['"])|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/gi;
			const cleanCodeForAnalysis = code.replace( parserRegex, ( m, comment, imp, str ) => {

				if ( comment ) return '';
				if ( imp ) return imp;
				if ( str ) return '""';
				return m;

			} );

			// Parse imports
			const importRegex = /import\s+{(.+?)}\s+from\s+['"]([^'"]+)['"];?/g;
			let match;
			const symbols = [];
			const values = [];

			while ( ( match = importRegex.exec( cleanCodeForAnalysis ) ) !== null ) {

				const symbolList = match[ 1 ].split( ',' ).map( s => s.trim() ).filter( Boolean );
				const moduleName = match[ 2 ];
				let moduleObj = this.imports[ moduleName ];

				if ( ! moduleObj ) {

					const isStandard = isStandardModule( moduleName, this.imports );
					if ( ! isStandard ) {

						const cleanName = moduleName.replace( /^\.\//, '' ).replace( /^\.\..+/, '' );
						const baseName = cleanName.replace( /\.js$/, '' );
						const scriptConfig = this.scripts[ baseName ];
						if ( scriptConfig && scriptConfig.instance ) {

							moduleObj = scriptConfig.instance;

						}

					} else {

						try {

							moduleObj = await import( moduleName );

						} catch ( err ) {

							const charIndex = code.indexOf( match[ 0 ] );
							const lineNumber = charIndex !== - 1 ? code.substring( 0, charIndex ).split( '\n' ).length : 1;
							const error = new Error( `Failed to load import "${moduleName}" in script. Make sure the module path/importmap is correct.` );
							error.customLineNumber = lineNumber;
							throw error;

						}

					}

				}

				if ( moduleObj ) {

					symbolList.forEach( symbol => {

						let localName = symbol;
						let exportName = symbol;
						if ( symbol.includes( ' as ' ) ) {

							const parts = symbol.split( /\s+as\s+/ );
							exportName = parts[ 0 ].trim();
							localName = parts[ 1 ].trim();

						}

						if ( ! symbols.includes( localName ) ) {

							symbols.push( localName );
							values.push( moduleObj[ exportName ] );

						}

					} );

				}

			}

			// Parse namespace imports in main code
			const namespaceImportRegex = /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"];?/g;
			let namespaceMatch;
			while ( ( namespaceMatch = namespaceImportRegex.exec( cleanCodeForAnalysis ) ) !== null ) {

				const localName = namespaceMatch[ 1 ];
				const moduleName = namespaceMatch[ 2 ];
				let moduleObj = this.imports[ moduleName ];

				if ( ! moduleObj ) {

					const isStandard = isStandardModule( moduleName, this.imports );
					if ( ! isStandard ) {

						const cleanName = moduleName.replace( /^\.\//, '' ).replace( /^\.\..+/, '' );
						const baseName = cleanName.replace( /\.js$/, '' );
						const scriptConfig = this.scripts[ baseName ];
						if ( scriptConfig && scriptConfig.instance ) {

							moduleObj = scriptConfig.instance;

						}

					} else {

						try {

							moduleObj = await import( moduleName );

						} catch ( err ) {

							const charIndex = code.indexOf( namespaceMatch[ 0 ] );
							const lineNumber = charIndex !== - 1 ? code.substring( 0, charIndex ).split( '\n' ).length : 1;
							const error = new Error( `Failed to load import "${moduleName}" in script. Make sure the module path/importmap is correct.` );
							error.customLineNumber = lineNumber;
							throw error;

						}

					}

				}

				if ( moduleObj ) {

					if ( ! symbols.includes( localName ) ) {

						symbols.push( localName );
						values.push( moduleObj );

					}

				}

			}

			// Parse default imports in main code
			const defaultImportRegex = /import\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+from\s+['"]([^'"]+)['"];?/g;
			let defaultMatch;
			while ( ( defaultMatch = defaultImportRegex.exec( cleanCodeForAnalysis ) ) !== null ) {

				const localName = defaultMatch[ 1 ];
				const moduleName = defaultMatch[ 2 ];
				let moduleObj = this.imports[ moduleName ];

				if ( ! moduleObj ) {

					const isStandard = isStandardModule( moduleName, this.imports );
					if ( ! isStandard ) {

						const cleanName = moduleName.replace( /^\.\//, '' ).replace( /^\.\..+/, '' );
						const baseName = cleanName.replace( /\.js$/, '' );
						const scriptConfig = this.scripts[ baseName ];
						if ( scriptConfig && scriptConfig.instance ) {

							moduleObj = scriptConfig.instance;

						}

					} else {

						try {

							moduleObj = await import( moduleName );

						} catch ( err ) {

							const charIndex = code.indexOf( defaultMatch[ 0 ] );
							const lineNumber = charIndex !== - 1 ? code.substring( 0, charIndex ).split( '\n' ).length : 1;
							const error = new Error( `Failed to load import "${moduleName}" in script. Make sure the module path/importmap is correct.` );
							error.customLineNumber = lineNumber;
							throw error;

						}

					}

				}

				if ( moduleObj ) {

					if ( ! symbols.includes( localName ) ) {

						symbols.push( localName );
						values.push( moduleObj[ 'default' ] );

					}

				}

			}

			// Execute scene scripts dynamically
			const activeModules = {};
			this.activeScriptNames = [];

			const loadPromises = [];
			const importedCustomScripts = [];

			// Parse custom script imports (e.g. import 'teapot' or import 'teapot.js')
			const customImportRegex = /import\s+['"]([^'"]+)['"];?/gi;
			let customMatch;
			while ( ( customMatch = customImportRegex.exec( cleanCodeForAnalysis ) ) !== null ) {

				const importedName = customMatch[ 1 ];
				const isStandard = isStandardModule( importedName, this.imports );
				if ( ! isStandard ) {

					const cleanName = importedName.replace( /^\.\//, '' ).replace( /^\.\..+/, '' );
					const baseName = cleanName.replace( /\.js$/, '' );
					if ( ! importedCustomScripts.includes( baseName ) ) {

						importedCustomScripts.push( baseName );

					}

				}

			}

			// Parse custom script imports from named imports (e.g. import { foo } from 'helper')
			const namedImportRegex = /import\s+{(.+?)}\s+from\s+['"]([^'"]+)['"];?/gi;
			let namedMatch;
			while ( ( namedMatch = namedImportRegex.exec( cleanCodeForAnalysis ) ) !== null ) {

				const importedName = namedMatch[ 2 ];
				const isStandard = isStandardModule( importedName, this.imports );
				if ( ! isStandard ) {

					const cleanName = importedName.replace( /^\.\//, '' ).replace( /^\.\..+/, '' );
					const baseName = cleanName.replace( /\.js$/, '' );
					if ( ! importedCustomScripts.includes( baseName ) ) {

						importedCustomScripts.push( baseName );

					}

				}

			}

			// Parse custom script imports from namespace imports (e.g. import * as helper from 'helper')
			const customNamespaceImportRegex = /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"];?/gi;
			let customNamespaceMatch;
			while ( ( customNamespaceMatch = customNamespaceImportRegex.exec( cleanCodeForAnalysis ) ) !== null ) {

				const importedName = customNamespaceMatch[ 2 ];
				const isStandard = isStandardModule( importedName, this.imports );
				if ( ! isStandard ) {

					const cleanName = importedName.replace( /^\.\//, '' ).replace( /^\.\..+/, '' );
					const baseName = cleanName.replace( /\.js$/, '' );
					if ( ! importedCustomScripts.includes( baseName ) ) {

						importedCustomScripts.push( baseName );

					}

				}

			}

			// Parse custom script imports from default imports (e.g. import helper from 'helper')
			const namedDefaultImportRegex = /import\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+from\s+['"]([^'"]+)['"];?/gi;
			let namedDefaultMatch;
			while ( ( namedDefaultMatch = namedDefaultImportRegex.exec( cleanCodeForAnalysis ) ) !== null ) {

				const importedName = namedDefaultMatch[ 2 ];
				const isStandard = isStandardModule( importedName, this.imports );
				if ( ! isStandard ) {

					const cleanName = importedName.replace( /^\.\//, '' ).replace( /^\.\..+/, '' );
					const baseName = cleanName.replace( /\.js$/, '' );
					if ( ! importedCustomScripts.includes( baseName ) ) {

						importedCustomScripts.push( baseName );

					}

				}

			}

			// Load / Create active scripts
			for ( const baseName of importedCustomScripts ) {

				if ( ! this.scripts[ baseName ] ) {

					this.scripts[ baseName ] = {
						url: `./js/imports/scripts/${baseName}.js`,
						instance: null,
						promise: null
					};

				}

				loadPromises.push( ( async () => {

					try {

						const instance = await this.load( baseName );
						if ( instance ) {

							if ( instance.init ) await instance.init();

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
									this.env[ key ] = instance[ key ];

								}

							}

							this.activeScriptNames.push( baseName );

						}

					} catch ( err ) {

						// Find where the script was imported in the main editor code
						const matchRegex = new RegExp( `import\\s+['"](\\.\\/)?${baseName}(\\.js)?['"];?`, 'i' );
						const match = code.match( matchRegex );
						if ( match ) {

							const charIndex = code.indexOf( match[ 0 ] );
							if ( charIndex !== - 1 ) {

								err.customLineNumber = code.substring( 0, charIndex ).split( '\n' ).length;

							}

						}

						throw err;

					}

				} )() );

			}

			if ( loadPromises.length > 0 ) {

				await Promise.all( loadPromises );

			}

			// Inject active modules into parameters
			for ( const [ name, obj ] of Object.entries( activeModules ) ) {

				symbols.push( name );
				values.push( obj );

			}

			symbols.push( 'console' );
			values.push( this.customConsole );


			// Strip all import statements from code so it can run inside Function body
			const strippedCode = code
				.replace( /import\s+{(.+?)}\s+from\s+['"]([^'"]+)['"];?/g, ( match ) => match.replace( /[^\n]/g, '' ) )
				.replace( /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"];?/g, ( match ) => match.replace( /[^\n]/g, '' ) )
				.replace( /import\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+from\s+['"]([^'"]+)['"];?/g, ( match ) => match.replace( /[^\n]/g, '' ) )
				.replace( /import\s+['"]([^'"]+)['"];?/gi, ( match ) => match.replace( /[^\n]/g, '' ) );

			const returnFields = LIFECYCLE_METHODS.map( name => `${name}: typeof ${name} !== 'undefined' ? ${name} : undefined` );
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

}

export { CodeRunner };
