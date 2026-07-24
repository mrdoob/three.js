import * as acorn from 'acorn';
import { Linter } from 'eslint-linter-browserify';

function renameIdentifier( code, oldName, newName ) {

	let ast;
	try {

		ast = acorn.parse( code, { ecmaVersion: 'latest', sourceType: 'module' } );

	} catch {

		return code;

	}

	const rangesToReplace = [];
	const scopes = [ new Set() ];

	const addDeclarations = ( pattern, scope ) => {

		if ( ! pattern ) return;
		if ( pattern.type === 'Identifier' ) {

			scope.add( pattern.name );

		} else if ( pattern.type === 'ObjectPattern' ) {

			pattern.properties.forEach( prop => {

				if ( prop.type === 'Property' ) {

					addDeclarations( prop.value, scope );

				} else if ( prop.type === 'RestElement' ) {

					addDeclarations( prop.argument, scope );

				}

			} );

		} else if ( pattern.type === 'ArrayPattern' ) {

			pattern.elements.forEach( elem => {

				if ( elem ) addDeclarations( elem, scope );

			} );

		} else if ( pattern.type === 'AssignmentPattern' ) {

			addDeclarations( pattern.left, scope );

		}

	};

	const isShadowed = ( name ) => {

		for ( let i = scopes.length - 1; i > 0; i -- ) {

			if ( scopes[ i ].has( name ) ) return true;

		}

		return false;

	};

	const walk = ( node ) => {

		if ( ! node ) return;

		const isFunction = node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression';
		const isBlock = node.type === 'BlockStatement';
		const isCatch = node.type === 'CatchClause';

		if ( isFunction ) {

			if ( node.type === 'FunctionDeclaration' && node.id ) {

				scopes[ scopes.length - 1 ].add( node.id.name );

			}

			const newScope = new Set();
			node.params.forEach( p => addDeclarations( p, newScope ) );
			if ( node.type === 'FunctionExpression' && node.id ) {

				newScope.add( node.id.name );

			}

			scopes.push( newScope );

		} else if ( isBlock ) {

			scopes.push( new Set() );

		} else if ( isCatch ) {

			const newScope = new Set();
			if ( node.param ) addDeclarations( node.param, newScope );
			scopes.push( newScope );

		} else if ( node.type === 'ClassDeclaration' ) {

			if ( node.id ) {

				scopes[ scopes.length - 1 ].add( node.id.name );

			}

		}

		if ( node.type === 'Identifier' ) {

			if ( node.name === oldName && ! isShadowed( oldName ) ) {

				rangesToReplace.push( { start: node.start, end: node.end } );

			}

		}

		if ( node.type === 'MemberExpression' && ! node.computed ) {

			walk( node.object );

		} else if ( node.type === 'Property' ) {

			if ( node.computed ) {

				walk( node.key );

			} else if ( node.shorthand ) {

				if ( node.key.name === oldName && ! isShadowed( oldName ) ) {

					rangesToReplace.push( {
						start: node.start,
						end: node.end,
						replacement: `${oldName}: ${newName}`
					} );

				}

			} else {

				walk( node.value );

			}

		} else if ( node.type === 'VariableDeclarator' ) {

			addDeclarations( node.id, scopes[ scopes.length - 1 ] );
			walk( node.id );
			walk( node.init );

		} else {

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

		}

		if ( isFunction || isBlock || isCatch ) {

			scopes.pop();

		}

	};

	walk( ast );

	rangesToReplace.sort( ( a, b ) => b.start - a.start );
	let result = code;
	rangesToReplace.forEach( r => {

		const replacement = r.replacement !== undefined ? r.replacement : newName;
		result = result.substring( 0, r.start ) + replacement + result.substring( r.end );

	} );

	return result;

}

class CodeCompiler {

	constructor() {}

	formatBody( bodyText ) {

		const lines = bodyText.split( '\n' );

		// Trim empty lines from start
		while ( lines.length > 0 && lines[ 0 ].trim() === '' ) {

			lines.shift();

		}

		// Trim empty lines from end
		while ( lines.length > 0 && lines[ lines.length - 1 ].trim() === '' ) {

			lines.pop();

		}

		let minIndent = Infinity;
		lines.forEach( line => {

			if ( line.trim() === '' ) return;
			const match = line.match( /^(\t*)/ );
			if ( match ) {

				const indent = match[ 1 ].length;
				if ( indent < minIndent ) {

					minIndent = indent;

				}

			}

		} );

		if ( minIndent === Infinity ) minIndent = 0;

		const formattedLines = lines.map( line => {

			if ( line.trim() === '' ) return '';
			const stripped = line.substring( minIndent );
			return '\t' + stripped;

		} );

		return formattedLines.join( '\n' );

	}

	isSimpleValue( valStr ) {

		const trimmed = valStr.trim();
		if ( trimmed === 'true' || trimmed === 'false' || trimmed === 'null' || trimmed === 'undefined' ) return true;
		if ( ! isNaN( Number( trimmed ) ) ) return true;
		if ( /^(['"`])[\s\S]*\1$/.test( trimmed ) ) return true;
		return false;

	}

	async compile( code, scripts ) {

		const standardImports = new Set();
		const globalVars = new Map();
		globalVars.set( 'renderer', undefined );
		const customScripts = [];
		const customScriptsSet = new Set();
		const scriptsToScan = [ code ];

		// Traverse custom script imports transitively using AST parsing
		while ( scriptsToScan.length > 0 ) {

			const currentCode = scriptsToScan.shift();
			let currentAst;
			try {

				currentAst = acorn.parse( currentCode, { ecmaVersion: 'latest', sourceType: 'module' } );

			} catch ( err ) {

				console.error( 'Error parsing dependencies:', err );
				continue;

			}

			currentAst.body.forEach( node => {

				if ( node.type === 'ImportDeclaration' ) {

					const importedName = node.source.value;
					const cleanName = importedName.replace( /^\.\//, '' ).replace( /^\.\..+/, '' ).replace( /\.js$/, '' ).toLowerCase();
					const isExternal = cleanName.startsWith( 'http://' ) || cleanName.startsWith( 'https://' ) || cleanName.startsWith( '/' );
					if ( scripts && scripts[ cleanName ] && ! isExternal ) {

						if ( ! customScriptsSet.has( cleanName ) ) {

							customScriptsSet.add( cleanName );
							customScripts.push( cleanName );
							if ( scripts[ cleanName ].text ) {

								scriptsToScan.push( scripts[ cleanName ].text );

							}

						}

					}

				}

			} );

		}

		// Reverse dependencies to ensure deeply imported scripts are compiled/initialized first
		customScripts.reverse();

		// Preprocess code and scripts to detect naming conflicts and rename non-exported symbols
		const scriptTexts = {};
		customScripts.forEach( scriptName => {

			if ( scripts[ scriptName ] && scripts[ scriptName ].text ) {

				scriptTexts[ scriptName ] = scripts[ scriptName ].text;

			}

		} );
		scriptTexts[ 'main' ] = code;

		const compiledGlobalNames = new Set();

		const getAstInfo = ( fileCode ) => {

			let ast;
			try {

				ast = acorn.parse( fileCode, { ecmaVersion: 'latest', sourceType: 'module' } );

			} catch {

				return { declared: new Set(), exported: new Set() };

			}

			const declared = new Set();
			const exported = new Set();

			const extractNames = ( pattern, set ) => {

				if ( ! pattern ) return;
				if ( pattern.type === 'Identifier' ) {

					if ( pattern.name !== 'debug' && ! [ 'init', 'update', 'resize', 'dispose' ].includes( pattern.name ) ) {

						set.add( pattern.name );

					}

				} else if ( pattern.type === 'ObjectPattern' ) {

					pattern.properties.forEach( prop => {

						if ( prop.type === 'Property' ) {

							extractNames( prop.value, set );

						} else if ( prop.type === 'RestElement' ) {

							extractNames( prop.argument, set );

						}

					} );

				} else if ( pattern.type === 'ArrayPattern' ) {

					pattern.elements.forEach( elem => {

						if ( elem ) extractNames( elem, set );

					} );

				} else if ( pattern.type === 'AssignmentPattern' ) {

					extractNames( pattern.left, set );

				}

			};

			ast.body.forEach( node => {

				let decl = node;
				if ( node.type === 'ExportNamedDeclaration' ) {

					decl = node.declaration;
					if ( node.specifiers ) {

						node.specifiers.forEach( spec => {

							if ( spec.local && ! [ 'init', 'update', 'resize', 'dispose' ].includes( spec.local.name ) ) {

								declared.add( spec.local.name );
								exported.add( spec.local.name );

							}

						} );

					}

				} else if ( node.type === 'ExportDefaultDeclaration' ) {

					decl = node.declaration;
					if ( decl && ( decl.type === 'FunctionDeclaration' || decl.type === 'ClassDeclaration' ) && decl.id && ! [ 'init', 'update', 'resize', 'dispose' ].includes( decl.id.name ) ) {

						declared.add( decl.id.name );
						exported.add( decl.id.name );

					}

				}

				if ( decl ) {

					if ( decl.type === 'VariableDeclaration' ) {

						decl.declarations.forEach( d => {

							extractNames( d.id, declared );
							if ( node.type === 'ExportNamedDeclaration' ) {

								extractNames( d.id, exported );

							}

						} );

					} else if ( decl.type === 'FunctionDeclaration' || decl.type === 'ClassDeclaration' ) {

						if ( decl.id && ! [ 'init', 'update', 'resize', 'dispose' ].includes( decl.id.name ) ) {

							declared.add( decl.id.name );
							if ( node.type === 'ExportNamedDeclaration' ) {

								exported.add( decl.id.name );

							}

						}

					}

				}

			} );

			return { declared, exported };

		};

		const renameScript = ( scriptKey, fileCode ) => {

			const { declared, exported } = getAstInfo( fileCode );
			let updatedCode = fileCode;

			for ( const name of declared ) {

				if ( compiledGlobalNames.has( name ) ) {

					if ( ! exported.has( name ) ) {

						let newName = name;
						let counter = 1;
						while ( compiledGlobalNames.has( newName ) ) {

							newName = `${name}_${counter}`;
							counter ++;

						}

						updatedCode = renameIdentifier( updatedCode, name, newName );
						declared.delete( name );
						declared.add( newName );

					}

				}

			}

			for ( const name of declared ) {

				compiledGlobalNames.add( name );

			}

			return updatedCode;

		};

		customScripts.forEach( scriptName => {

			if ( scriptTexts[ scriptName ] ) {

				scriptTexts[ scriptName ] = renameScript( scriptName, scriptTexts[ scriptName ] );
				scripts[ scriptName ].text = scriptTexts[ scriptName ];

			}

		} );

		code = renameScript( 'main', scriptTexts[ 'main' ] );

		// Build scriptBasenameMap to avoid naming conflicts while using simple names
		const scriptBasenameMap = new Map();
		const basenameCounts = {};

		customScripts.forEach( scriptName => {

			const parts = scriptName.split( '/' );
			const basename = parts[ parts.length - 1 ];
			basenameCounts[ basename ] = ( basenameCounts[ basename ] || 0 ) + 1;

		} );

		customScripts.forEach( scriptName => {

			const parts = scriptName.split( '/' );
			const basename = parts[ parts.length - 1 ];
			if ( basenameCounts[ basename ] > 1 ) {

				scriptBasenameMap.set( scriptName, scriptName.replace( /\//g, '_' ) );

			} else {

				scriptBasenameMap.set( scriptName, basename );

			}

		} );

		const getDeclaredVars = ( fileCode ) => {

			const vars = new Set();
			let ast;
			try {

				ast = acorn.parse( fileCode, { ecmaVersion: 'latest', sourceType: 'module' } );

			} catch {

				return vars;

			}

			const extractNames = ( pattern ) => {

				if ( pattern.type === 'Identifier' ) {

					if ( pattern.name !== 'debug' ) vars.add( pattern.name );

				} else if ( pattern.type === 'ObjectPattern' ) {

					pattern.properties.forEach( prop => {

						if ( prop.type === 'Property' ) {

							extractNames( prop.value );

						} else if ( prop.type === 'RestElement' ) {

							extractNames( prop.argument );

						}

					} );

				} else if ( pattern.type === 'ArrayPattern' ) {

					pattern.elements.forEach( elem => {

						if ( elem ) extractNames( elem );

					} );

				} else if ( pattern.type === 'AssignmentPattern' ) {

					extractNames( pattern.left );

				}

			};

			ast.body.forEach( node => {

				let decl = node;
				if ( node.type === 'ExportNamedDeclaration' ) {

					decl = node.declaration;

				}

				if ( decl && decl.type === 'VariableDeclaration' ) {

					decl.declarations.forEach( d => {

						extractNames( d.id );

					} );

				}

			} );

			return vars;

		};

		const allowedVars = new Set();
		customScripts.forEach( scriptName => {

			const scriptConfig = scripts[ scriptName ];
			if ( scriptConfig && scriptConfig.text ) {

				const vars = getDeclaredVars( scriptConfig.text );
				vars.forEach( v => allowedVars.add( v ) );

			}

		} );

		const isSymbolUsed = ( ast, symbol ) => {

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

		const parseFile = ( fileCode, fileName, cleanName ) => {

			const fileStruct = {
				name: fileName,
				cleanName: cleanName,
				setup: [],
				functions: [],
				lifecycles: { init: null, update: null, resize: null, dispose: null }
			};

			let ast;
			try {

				ast = acorn.parse( fileCode, { ecmaVersion: 'latest', sourceType: 'module' } );

			} catch ( err ) {

				console.error( `Error parsing file ${fileName}:`, err );
				return fileStruct;

			}

			const isCustom = ( moduleName ) => {

				if ( ! moduleName ) return false;
				const clean = moduleName.replace( /^\.\//, '' ).replace( /^\.\..+/, '' ).replace( /\.js$/, '' ).toLowerCase();
				return customScripts.includes( clean );

			};

			const extractNames = ( pattern, list ) => {

				if ( pattern.type === 'Identifier' ) {

					list.push( pattern.name );

				} else if ( pattern.type === 'ObjectPattern' ) {

					pattern.properties.forEach( prop => {

						if ( prop.type === 'Property' ) {

							extractNames( prop.value, list );

						} else if ( prop.type === 'RestElement' ) {

							extractNames( prop.argument, list );

						}

					} );

				} else if ( pattern.type === 'ArrayPattern' ) {

					pattern.elements.forEach( elem => {

						if ( elem ) extractNames( elem, list );

					} );

				} else if ( pattern.type === 'AssignmentPattern' ) {

					extractNames( pattern.left, list );

				}

			};

			const processNode = ( node ) => {

				if ( node.type === 'ImportDeclaration' ) {

					const moduleName = node.source.value;
					if ( ! isCustom( moduleName ) ) {

						node.specifiers.forEach( spec => {

							const isUsed = isSymbolUsed( ast, spec.local.name );
							if ( isUsed ) {

								if ( spec.type === 'ImportSpecifier' ) {

									const importedName = spec.imported.name;
									const localName = spec.local.name;
									const importStr = importedName === localName
										? `import { ${importedName} } from '${moduleName}';`
										: `import { ${importedName} as ${localName} } from '${moduleName}';`;
									standardImports.add( importStr );

								} else if ( spec.type === 'ImportDefaultSpecifier' ) {

									standardImports.add( `import ${spec.local.name} from '${moduleName}';` );

								} else if ( spec.type === 'ImportNamespaceSpecifier' ) {

									standardImports.add( `import * as ${spec.local.name} from '${moduleName}';` );

								}

							}

						} );

						if ( node.specifiers.length === 0 ) {

							standardImports.add( `import '${moduleName}';` );

						}

					}

					return;

				}

				if ( node.type === 'FunctionDeclaration' ) {

					const fnName = node.id ? node.id.name : '__default_export__';
					if ( [ 'init', 'update', 'resize', 'dispose' ].includes( fnName ) ) {

						const params = node.params.map( p => fileCode.substring( p.start, p.end ) );
						const body = fileCode.substring( node.body.start + 1, node.body.end - 1 );
						fileStruct.lifecycles[ fnName ] = {
							params: params,
							body: body
						};

					} else {

						if ( fnName !== 'debug' ) {

							fileStruct.functions.push( fileCode.substring( node.start, node.end ) );

						}

					}

					return;

				}

				if ( node.type === 'ClassDeclaration' ) {

					const className = node.id ? node.id.name : '';
					if ( className !== 'debug' ) {

						fileStruct.functions.push( fileCode.substring( node.start, node.end ) );

					}

					return;

				}

				if ( node.type === 'VariableDeclaration' ) {

					const globalAssignments = [];
					const localDeclarators = [];

					const isFunctionInit = ( init ) => {

						if ( ! init ) return false;
						if ( init.type === 'FunctionExpression' || init.type === 'ArrowFunctionExpression' ) return true;
						if ( init.type === 'CallExpression' && init.callee.type === 'Identifier' && init.callee.name === 'Fn' ) return true;
						return false;

					};

					node.declarations.forEach( decl => {

						const declaredNames = [];
						extractNames( decl.id, declaredNames );

						if ( isFunctionInit( decl.init ) ) {

							const fnDeclStr = `${node.kind} ${fileCode.substring( decl.id.start, decl.init.end )};`;
							fileStruct.functions.push( fnDeclStr );

						} else {

							const isGlobal = declaredNames.some( name => allowedVars.has( name ) );

							if ( isGlobal ) {

								declaredNames.forEach( name => {

									if ( allowedVars.has( name ) ) {

										if ( decl.init ) {

											const valStr = fileCode.substring( decl.init.start, decl.init.end );
											if ( this.isSimpleValue( valStr ) ) {

												globalVars.set( name, valStr );

											} else {

												globalVars.set( name, undefined );
												globalAssignments.push( `${name} = ${valStr}` );

											}

										} else {

											globalVars.set( name, undefined );

										}

									}

								} );

							} else {

								localDeclarators.push( fileCode.substring( decl.start, decl.end ) );

							}

						}

					} );

					if ( globalAssignments.length > 0 ) {

						fileStruct.setup.push( globalAssignments.join( ', ' ) + ';' );

					}

					if ( localDeclarators.length > 0 ) {

						fileStruct.setup.push( `${node.kind} ${localDeclarators.join( ', ' )};` );

					}

					return;

				}

				if ( node.type === 'ExportNamedDeclaration' ) {

					if ( node.declaration ) {

						processNode( node.declaration );

					}

					return;

				}

				if ( node.type === 'ExportDefaultDeclaration' ) {

					if ( node.declaration ) {

						if ( node.declaration.type === 'FunctionDeclaration' || node.declaration.type === 'ClassDeclaration' ) {

							const innerNode = node.declaration;
							if ( ! innerNode.id ) {

								const name = '__default_export__';
								const codeStr = fileCode.substring( innerNode.start, innerNode.end );
								const kind = innerNode.type === 'FunctionDeclaration' ? 'function' : 'class';
								const replacedCode = codeStr.replace( new RegExp( `^(${innerNode.async ? 'async\\s+' : ''})${kind}\\s*\\(` ), `$1${kind} ${name}(` );
								fileStruct.functions.push( replacedCode );

							} else {

								processNode( innerNode );

							}

						} else {

							const exprStr = fileCode.substring( node.declaration.start, node.declaration.end );
							fileStruct.setup.push( `let defaultValue = ${exprStr};` );

						}

					}

					return;

				}

				const statementStr = fileCode.substring( node.start, node.end );
				if ( statementStr.trim() !== ';' ) {

					fileStruct.setup.push( statementStr );

				}

			};

			ast.body.forEach( processNode );

			return fileStruct;

		};

		// Parse all custom scripts
		const parsedScripts = [];
		customScripts.forEach( scriptName => {

			const scriptConfig = scripts[ scriptName ];
			if ( scriptConfig && scriptConfig.text ) {

				const cleanName = scriptBasenameMap.get( scriptName );
				parsedScripts.push( parseFile( scriptConfig.text, `${scriptName}.js`, cleanName ) );

			}

		} );

		// Parse main code
		const parsedMain = parseFile( code, 'main', 'main' );

		// Build unified lifecycle functions
		const buildUnifiedLifecycle = ( lifecycleName, standardParams ) => {

			const declarations = [];
			const calls = [];

			const processBody = ( s, lifecycle, setupStatements = [] ) => {

				if ( ! lifecycle && setupStatements.length === 0 ) return;
				let mapping = '';
				if ( lifecycle ) {

					lifecycle.params.forEach( ( p, idx ) => {

						if ( standardParams[ idx ] && p !== standardParams[ idx ] ) {

							mapping += `\tvar ${p} = ${standardParams[ idx ]};\n`;

						}

					} );

				}

				let bodyContent = '';
				if ( setupStatements.length > 0 ) {

					bodyContent += this.formatBody( setupStatements.join( '\n' ) );

				}

				if ( lifecycle ) {

					const formattedBody = this.formatBody( lifecycle.body );
					if ( bodyContent ) {

						bodyContent += '\n\n' + formattedBody;

					} else {

						bodyContent += formattedBody;

					}

				}

				const bodyStr = mapping ? mapping + bodyContent : bodyContent;

				const subFuncName = `${lifecycleName}_${s.cleanName}`;

				const paramsStr = standardParams.join( ', ' );
				const formattedParams = paramsStr ? ` ${paramsStr} ` : '';
				const isAsync = lifecycleName === 'init' ? 'async ' : '';
				const declText = `${isAsync}function ${subFuncName}(${formattedParams}) {\n\n${bodyStr}\n\n}`;
				declarations.push( declText );

				const callPrefix = lifecycleName === 'init' ? 'await ' : '';
				calls.push( `\t${callPrefix}${subFuncName}(${formattedParams});` );

			};

			parsedScripts.forEach( s => processBody( s, s.lifecycles[ lifecycleName ], lifecycleName === 'init' ? s.setup : [] ) );
			processBody( parsedMain, parsedMain.lifecycles[ lifecycleName ], lifecycleName === 'init' ? parsedMain.setup : [] );

			let middleSetup = '';
			if ( lifecycleName === 'init' ) {

				middleSetup += '\t// Renderer Setup\n\trenderer = new THREE.WebGPURenderer();\n\trenderer.setPixelRatio( window.devicePixelRatio );\n\trenderer.setSize( window.innerWidth, window.innerHeight );\n\trenderer.setClearColor( 0x2a2a33 );\n\tdocument.body.appendChild( renderer.domElement );\n\n\tawait renderer.init();\n\n';

			} else if ( lifecycleName === 'resize' ) {

				middleSetup += '\trenderer.setSize( width, height );\n\n';

			}

			let endSetup = '';
			if ( lifecycleName === 'init' ) {

				endSetup += '\n\n\trenderer.setAnimationLoop( update );';
				endSetup += '\n\n\twindow.addEventListener( \'resize\', () => resize( window.innerWidth, window.innerHeight ) );';

			}

			const paramsStr = standardParams.join( ', ' );
			const formattedParams = paramsStr ? ` ${paramsStr} ` : '';

			const isAsync = lifecycleName === 'init' ? 'async ' : '';
			const unifiedFunction = `${isAsync}function ${lifecycleName}(${formattedParams}) {\n\n${middleSetup}${calls.join( '\n' )}${endSetup}\n\n}`;

			return {
				declarations: declarations.join( '\n\n' ),
				unified: unifiedFunction
			};

		};

		const unifiedInit = buildUnifiedLifecycle( 'init', [] );
		const unifiedUpdate = buildUnifiedLifecycle( 'update', [ 't' ] );
		const unifiedResize = buildUnifiedLifecycle( 'resize', [ 'width', 'height' ] );

		// Assemble standard imports and global variables
		const mergedImports = this.mergeImports( standardImports );
		const importsStr = mergedImports.join( '\n' );
		const globalsList = [];
		for ( const [ name, val ] of globalVars.entries() ) {

			if ( val !== undefined ) {

				globalsList.push( `${name} = ${val}` );

			} else {

				globalsList.push( name );

			}

		}

		const globalsStr = globalsList.length > 0 ? `let ${globalsList.join( ', ' )};` : '';

		const declarationsStr = [ unifiedInit.declarations, unifiedUpdate.declarations, unifiedResize.declarations ].filter( Boolean ).join( '\n\n' );
		const unifiedStr = [ unifiedInit.unified, unifiedUpdate.unified, unifiedResize.unified ].filter( Boolean ).join( '\n\n' );

		const helperFunctions = [];
		parsedScripts.forEach( s => {

			s.functions.forEach( fn => helperFunctions.push( fn ) );

		} );
		parsedMain.functions.forEach( fn => helperFunctions.push( fn ) );

		const helpersStr = helperFunctions.join( '\n\n' );

		const finalCode = `
${importsStr}

${globalsStr}

${helpersStr}

await init();

${unifiedStr}

${declarationsStr}
`.trim() + '\n';

		return await this.format( finalCode );

	}

	mergeImports( importsSet ) {

		const grouped = {};

		importsSet.forEach( stmt => {

			const trimmed = stmt.trim();
			if ( ! trimmed ) return;

			// Namespace import: import * as THREE from 'three';
			const namespaceMatch = trimmed.match( /^import\s+\*\s+as\s+([a-zA-Z0-9_$]+)\s+from\s+['"]([^'"]+)['"];?$/ );
			if ( namespaceMatch ) {

				const local = namespaceMatch[ 1 ];
				const moduleName = namespaceMatch[ 2 ];
				if ( ! grouped[ moduleName ] ) {

					grouped[ moduleName ] = { defaultImport: null, namespaceImports: [], namedImports: new Set(), bare: false };

				}

				if ( ! grouped[ moduleName ].namespaceImports.includes( local ) ) {

					grouped[ moduleName ].namespaceImports.push( local );

				}

				return;

			}

			// Named import: import { a, b } from 'module';
			const namedMatch = trimmed.match( /^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?$/ );
			if ( namedMatch ) {

				const symbols = namedMatch[ 1 ].split( ',' ).map( s => s.trim() ).filter( Boolean );
				const moduleName = namedMatch[ 2 ];
				if ( ! grouped[ moduleName ] ) {

					grouped[ moduleName ] = { defaultImport: null, namespaceImports: [], namedImports: new Set(), bare: false };

				}

				symbols.forEach( s => grouped[ moduleName ].namedImports.add( s ) );
				return;

			}

			// Default import (with optional named imports): import defaultVal, { named1 } from 'module';
			const defaultAndNamedMatch = trimmed.match( /^import\s+([a-zA-Z0-9_$]+)\s*,\s*\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?$/ );
			if ( defaultAndNamedMatch ) {

				const defaultVal = defaultAndNamedMatch[ 1 ];
				const symbols = defaultAndNamedMatch[ 2 ].split( ',' ).map( s => s.trim() ).filter( Boolean );
				const moduleName = defaultAndNamedMatch[ 3 ];
				if ( ! grouped[ moduleName ] ) {

					grouped[ moduleName ] = { defaultImport: null, namespaceImports: [], namedImports: new Set(), bare: false };

				}

				grouped[ moduleName ].defaultImport = defaultVal;
				symbols.forEach( s => grouped[ moduleName ].namedImports.add( s ) );
				return;

			}

			// Default import only: import defaultVal from 'module';
			const defaultMatch = trimmed.match( /^import\s+([a-zA-Z0-9_$]+)\s+from\s+['"]([^'"]+)['"];?$/ );
			if ( defaultMatch ) {

				const defaultVal = defaultMatch[ 1 ];
				const moduleName = defaultMatch[ 2 ];
				if ( ! grouped[ moduleName ] ) {

					grouped[ moduleName ] = { defaultImport: null, namespaceImports: [], namedImports: new Set(), bare: false };

				}

				grouped[ moduleName ].defaultImport = defaultVal;
				return;

			}

			// Bare import: import 'module';
			const bareMatch = trimmed.match( /^import\s+['"]([^'"]+)['"];?$/ );
			if ( bareMatch ) {

				const moduleName = bareMatch[ 1 ];
				if ( ! grouped[ moduleName ] ) {

					grouped[ moduleName ] = { defaultImport: null, namespaceImports: [], namedImports: new Set(), bare: false };

				}

				grouped[ moduleName ].bare = true;
				return;

			}

			// Fallback: keep exactly as is
			const fallbackModule = 'fallback_' + Math.random();
			grouped[ fallbackModule ] = { fallback: trimmed };

		} );

		const mergedLines = [];

		const sortedModuleNames = Object.keys( grouped ).sort();

		for ( const moduleName of sortedModuleNames ) {

			const info = grouped[ moduleName ];

			if ( info.fallback ) {

				mergedLines.push( info.fallback );
				continue;

			}

			// Generate namespace imports (kept on their own lines)
			info.namespaceImports.forEach( ns => {

				mergedLines.push( `import * as ${ns} from '${moduleName}';` );

			} );

			// Generate merged default + named imports
			const hasDefault = info.defaultImport !== null;
			const hasNamed = info.namedImports.size > 0;

			if ( hasDefault && hasNamed ) {

				const sortedNamed = Array.from( info.namedImports ).sort();
				mergedLines.push( `import ${info.defaultImport}, { ${sortedNamed.join( ', ' )} } from '${moduleName}';` );

			} else if ( hasDefault ) {

				mergedLines.push( `import ${info.defaultImport} from '${moduleName}';` );

			} else if ( hasNamed ) {

				const sortedNamed = Array.from( info.namedImports ).sort();
				mergedLines.push( `import { ${sortedNamed.join( ', ' )} } from '${moduleName}';` );

			} else if ( info.bare && info.namespaceImports.length === 0 ) {

				// Only add bare import if there are no namespace/default/named imports for this module
				mergedLines.push( `import '${moduleName}';` );

			}

		}

		return mergedLines;

	}

	removeUnusedImports( code ) {

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

		importNodes.forEach( node => {

			const moduleName = node.source.value;
			const specifiers = node.specifiers;

			if ( specifiers.length === 0 ) {

				return;

			}

			const usedSpecifiers = specifiers.filter( spec => isSymbolUsed( spec.local.name ) );

			if ( usedSpecifiers.length === 0 ) {

				replacements.push( {
					start: node.start,
					end: node.end,
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

	async format( code ) {

		try {

			code = this.removeUnusedImports( code );

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

	static async format( code ) {

		return new CodeCompiler().format( code );

	}

}

export { CodeCompiler };
