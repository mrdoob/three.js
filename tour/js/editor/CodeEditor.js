import * as THREE from 'three';
import * as TSL from 'three/tsl';
import { EventDispatcher } from 'three';
import { generateDeclarations } from '../utils/CodeEditorUtils.js';
import { CodeCompiler } from '../code/CodeCompiler.js';

let _monacoConfigured = false;

const tslConstants = new Set();
const tslFunctions = new Set();
const tslChaining = new Set();
let _currentImportedSymbolsStr = '';

const buildRegex = ( words, prefix = '', suffix = '\\b' ) => {

	const escaped = Array.from( words )
		.map( w => w.replace( /[-\/\\^$*+?.()|[\]{}]/g, '\\$&' ) )
		.sort( ( a, b ) => b.length - a.length );
	return new RegExp( `${prefix}(${escaped.join( '|' )})${suffix}` );

};

const updateTokenizerForCode = async () => {

	try {

		const importedSymbols = new Set();
		const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"](?:three\/tsl|three\/addons\/tsl\/[^'"]+)['"]/g;

		// Gather imports from all open models in Monaco
		window.monaco.editor.getModels().forEach( model => {

			const langId = model.getLanguageId();
			if ( langId === 'javascript' || langId === 'typescript' ) {

				let match;
				importRegex.lastIndex = 0;
				while ( ( match = importRegex.exec( model.getValue() ) ) !== null ) {

					match[ 1 ].split( ',' ).forEach( s => {

						const trimmed = s.trim();
						if ( trimmed ) importedSymbols.add( trimmed );

					} );

				}

			}

		} );

		const importedSymbolsStr = Array.from( importedSymbols ).sort().join( ',' );
		if ( importedSymbolsStr === _currentImportedSymbolsStr ) {

			return;

		}

		_currentImportedSymbolsStr = importedSymbolsStr;

		const activeConstants = Array.from( tslConstants ).filter( key => importedSymbols.has( key ) );
		const activeFunctions = Array.from( tslFunctions ).filter( key => importedSymbols.has( key ) );

		const allLangs = window.monaco.languages.getLanguages();
		for ( const langId of [ 'javascript', 'typescript' ] ) {

			const langDef = allLangs.find( ( { id } ) => id === langId );
			if ( langDef && typeof langDef.loader === 'function' ) {

				const langMod = await langDef.loader();
				const lang = langMod.language;

				if ( lang && lang.tokenizer && lang.tokenizer.root ) {

					// Clean previous rules
					lang.tokenizer.root = lang.tokenizer.root.filter( rule => {

						if ( Array.isArray( rule ) ) {

							const action = rule[ 1 ];
							if ( typeof action === 'string' ) {

								return action !== 'tsl-function-symbol' && action !== 'tsl-constant-symbol';

							} else if ( Array.isArray( action ) ) {

								return ! action.includes( 'tsl-chained-symbol' );

							}

						}

						return true;

					} );

					// Register new rules
					if ( tslChaining.size > 0 ) {

						lang.tokenizer.root.unshift( [ buildRegex( tslChaining, '(\\.)' ), [ 'delimiter', 'tsl-chained-symbol' ]] );

					}

					if ( activeFunctions.length > 0 ) {

						lang.tokenizer.root.unshift( [ buildRegex( activeFunctions, '\\b' ), 'tsl-function-symbol' ] );

					}

					if ( activeConstants.length > 0 ) {

						lang.tokenizer.root.unshift( [ buildRegex( activeConstants, '\\b' ), 'tsl-constant-symbol' ] );

					}

					window.monaco.languages.setMonarchTokensProvider( langId, lang );

				}

			}

		}

	} catch ( e ) {

		console.error( 'Failed to update Monaco tokenizer for TSL imports', e );

	}

};

const ADDONS_TSL_IMPORTS = {

	// display
	hashBlur: 'three/addons/tsl/display/hashBlur.js',
	gaussianBlur: 'three/addons/tsl/display/GaussianBlurNode.js',
	premultipliedGaussianBlur: 'three/addons/tsl/display/GaussianBlurNode.js',
	boxBlur: 'three/addons/tsl/display/boxBlur.js',
	radialBlur: 'three/addons/tsl/display/radialBlur.js',
	depthAwareBlur: 'three/addons/tsl/display/depthAwareBlur.js',
	depthAwareBlend: 'three/addons/tsl/display/depthAwareBlend.js',
	bilateralBlur: 'three/addons/tsl/display/BilateralBlurNode.js',
	afterImage: 'three/addons/tsl/display/AfterImageNode.js',
	anaglyphPass: 'three/addons/tsl/display/AnaglyphPassNode.js',
	bleachBypass: 'three/addons/tsl/display/BleachBypass.js',
	bloom: 'three/addons/tsl/display/BloomNode.js',
	crt: 'three/addons/tsl/display/CRT.js',
	chromaticAberration: 'three/addons/tsl/display/ChromaticAberrationNode.js',
	denoise: 'three/addons/tsl/display/DenoiseNode.js',
	depthOfField: 'three/addons/tsl/display/DepthOfFieldNode.js',
	dof: 'three/addons/tsl/display/DepthOfFieldNode.js',
	dotScreen: 'three/addons/tsl/display/DotScreenNode.js',
	film: 'three/addons/tsl/display/FilmNode.js',
	fsr1: 'three/addons/tsl/display/FSR1Node.js',
	fxaa: 'three/addons/tsl/display/FXAANode.js',
	godrays: 'three/addons/tsl/display/GodraysNode.js',
	gtao: 'three/addons/tsl/display/GTAONode.js',
	importanceSampledEnvironment: 'three/addons/tsl/display/ImportanceSampledEnvironment.js',
	lensflare: 'three/addons/tsl/display/LensflareNode.js',
	lut3D: 'three/addons/tsl/display/Lut3DNode.js',
	motionBlur: 'three/addons/tsl/display/MotionBlur.js',
	outline: 'three/addons/tsl/display/OutlineNode.js',
	parallaxBarrierPass: 'three/addons/tsl/display/ParallaxBarrierPassNode.js',
	pixelationPass: 'three/addons/tsl/display/PixelationPassNode.js',
	recurrentDenoise: 'three/addons/tsl/display/RecurrentDenoiseNode.js',
	retroPass: 'three/addons/tsl/display/RetroPassNode.js',
	rgbShift: 'three/addons/tsl/display/RGBShiftNode.js',
	sepia: 'three/addons/tsl/display/Sepia.js',
	shape: 'three/addons/tsl/display/Shape.js',
	sharpen: 'three/addons/tsl/display/SharpenNode.js',
	smaa: 'three/addons/tsl/display/SMAANode.js',
	sobelOperator: 'three/addons/tsl/display/SobelOperatorNode.js',
	ssaaPass: 'three/addons/tsl/display/SSAAPassNode.js',
	ssao: 'three/addons/tsl/display/SSAONode.js',
	ssgi: 'three/addons/tsl/display/SSGINode.js',
	ssr: 'three/addons/tsl/display/SSRNode.js',
	sss: 'three/addons/tsl/display/SSSNode.js',
	stereoCompositePass: 'three/addons/tsl/display/StereoCompositePassNode.js',
	stereoPass: 'three/addons/tsl/display/StereoPassNode.js',
	taau: 'three/addons/tsl/display/TAAUNode.js',
	temporalReproject: 'three/addons/tsl/display/TemporalReprojectNode.js',
	traa: 'three/addons/tsl/display/TRAANode.js',
	transition: 'three/addons/tsl/display/TransitionNode.js',

	// math
	bayer16: 'three/addons/tsl/math/Bayer.js',
	bayerDither: 'three/addons/tsl/math/Bayer.js',
	curlNoise: 'three/addons/tsl/math/curlNoise.js',
	snoise: 'three/addons/tsl/math/curlNoise.js',
	snoiseVec3: 'three/addons/tsl/math/curlNoise.js',

	// utils
	getGroundProjectedNormal: 'three/addons/tsl/utils/GroundedSkybox.js',
	RaymarchingBox: 'three/addons/tsl/utils/Raymarching.js',
	bindAnalyticNoise: 'three/addons/tsl/utils/RNoise.js',
	softParticles: 'three/addons/tsl/utils/SoftParticles.js'
};

class CodeEditor extends EventDispatcher {

	constructor( { container, value = '', readOnly = false, language = 'javascript', scrollable = true } = {} ) {

		super();

		this.container = container;
		this.value = value;
		this.readOnly = readOnly;
		this.language = language;
		this.scrollable = scrollable;

		this.editor = null;
		this.isProgrammaticChange = false;

		this._initMonaco();

	}

	_initMonaco() {

		if ( typeof window.require === 'undefined' ) {

			console.error( 'RequireJS / Monaco loader script is missing.' );
			return;

		}

		window.require.config( { paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs' } } );
		window.require( [ 'vs/editor/editor.main' ], () => {

			if ( ! _monacoConfigured ) {

				window.monaco.editor.defineTheme( 'chatgpt-dark', {
					base: 'vs-dark',
					inherit: true,
					rules: [
						{ token: 'tsl-constant-symbol', foreground: '#00aeff' },
						{ token: 'tsl-function-symbol', foreground: '#dcdcaa' },
						{ token: 'tsl-chained-symbol', foreground: '#59d592' }
					],
					colors: {
						'editor.background': '#15151a',
						'editor.lineHighlightBackground': '#2a2a33'
					}
				} );

				// Gather TSL keywords dynamically once on configuration
				try {

					// 1. Gather keys from TSL
					Object.keys( TSL ).forEach( key => {

						if ( /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test( key ) ) {

							const val = TSL[ key ];
							if ( typeof val === 'function' ) {

								tslFunctions.add( key );

							} else {

								tslConstants.add( key );

							}

						}

					} );

					// 2. Gather only methods (functions) from THREE.Node.prototype to support chaining
					if ( THREE.Node && THREE.Node.prototype ) {

						let proto = THREE.Node.prototype;
						while ( proto && proto !== Object.prototype ) {

							Object.getOwnPropertyNames( proto ).forEach( name => {

								if ( name === 'constructor' || name.startsWith( '_' ) ) return;

								if ( /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test( name ) ) {

									const desc = Object.getOwnPropertyDescriptor( proto, name );
									if ( desc && ! desc.get && ! desc.set && typeof desc.value === 'function' ) {

										tslChaining.add( name );

									}

								}

							} );
							proto = Object.getPrototypeOf( proto );

						}

					}

					// 3. Gather keys from TSL Addons
					Object.keys( ADDONS_TSL_IMPORTS ).forEach( key => {

						if ( /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test( key ) ) {

							tslFunctions.add( key );

						}

					} );

				} catch ( e ) {

					console.error( 'Failed to populate TSL keyword sets', e );

				}

				// Register completion provider for TSL and THREE auto-imports
				const suggestionsTemplates = [];

				const customSnippets = [
					{
						label: 'Fn',
						kind: window.monaco.languages.CompletionItemKind.Snippet,
						detail: 'TSL Function (Object parameters)',
						insertText: 'Fn( ( { ${1:arg} } ) => {\n\t${0}\n} )',
						insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
						moduleName: 'three/tsl'
					},
					{
						label: 'Fn',
						kind: window.monaco.languages.CompletionItemKind.Snippet,
						detail: 'TSL Function (Array parameters)',
						insertText: 'Fn( ( [ ${1:arg} ] ) => {\n\t${0}\n} )',
						insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
						moduleName: 'three/tsl'
					},
					{
						label: 'If',
						kind: window.monaco.languages.CompletionItemKind.Snippet,
						detail: 'TSL Conditional branch',
						insertText: 'If( ${1:condition}, () => {\n\t${0}\n} )',
						insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
						moduleName: 'three/tsl'
					},
					{
						label: 'ElseIf',
						kind: window.monaco.languages.CompletionItemKind.Snippet,
						detail: 'TSL ElseIf chain',
						insertText: 'ElseIf( ${1:condition}, () => {\n\t${0}\n} )',
						insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
					},
					{
						label: 'Else',
						kind: window.monaco.languages.CompletionItemKind.Snippet,
						detail: 'TSL Else chain',
						insertText: 'Else( () => {\n\t${0}\n} )',
						insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
					},
					{
						label: 'Loop',
						kind: window.monaco.languages.CompletionItemKind.Snippet,
						detail: 'TSL Loop (count)',
						insertText: 'Loop( ${1:count}, ( { i } ) => {\n\t${0}\n} )',
						insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
						moduleName: 'three/tsl'
					},
					{
						label: 'Loop',
						kind: window.monaco.languages.CompletionItemKind.Snippet,
						detail: 'TSL Loop (range)',
						insertText: 'Loop( { start: ${1:int( 0 )}, end: ${2:int( 10 )}, type: \'int\' }, ( { i } ) => {\n\t${0}\n} )',
						insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
						moduleName: 'three/tsl'
					},
					{
						label: 'Switch',
						kind: window.monaco.languages.CompletionItemKind.Snippet,
						detail: 'TSL Switch-Case',
						insertText: 'Switch( ${1:value} )\n\t.Case( ${2:0}, () => {\n\t\t${3}\n\t} )\n\t.Default( () => {\n\t\t${4}\n\t} );',
						insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
						moduleName: 'three/tsl'
					},
					{
						label: 'uniform',
						kind: window.monaco.languages.CompletionItemKind.Snippet,
						detail: 'TSL uniform variable',
						insertText: 'uniform( ${1:value} )',
						insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
						moduleName: 'three/tsl'
					}
				];

				const overriddenKeys = new Set( customSnippets.map( snippet => snippet.label ) );

				customSnippets.forEach( snippet => suggestionsTemplates.push( snippet ) );

				suggestionsTemplates.push( {
					label: 'THREE',
					kind: window.monaco.languages.CompletionItemKind.Module,
					detail: 'Auto-import THREE namespace',
					insertText: 'THREE',
					moduleName: 'three-namespace'
				} );

				Object.keys( TSL ).forEach( key => {

					if ( /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test( key ) ) {

						if ( overriddenKeys.has( key ) ) return;

						const val = TSL[ key ];
						let kind = window.monaco.languages.CompletionItemKind.Variable;
						if ( typeof val === 'function' ) {

							kind = window.monaco.languages.CompletionItemKind.Function;

						}

						suggestionsTemplates.push( {
							label: key,
							kind: kind,
							detail: 'Auto-import from three/tsl',
							insertText: key,
							moduleName: 'three/tsl'
						} );

					}

				} );

				Object.keys( THREE ).forEach( key => {

					if ( /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test( key ) ) {

						const val = THREE[ key ];
						let kind = window.monaco.languages.CompletionItemKind.Variable;
						if ( typeof val === 'function' ) {

							if ( key[ 0 ] === key[ 0 ].toUpperCase() ) {

								kind = window.monaco.languages.CompletionItemKind.Class;

							} else {

								kind = window.monaco.languages.CompletionItemKind.Function;

							}

						}

						suggestionsTemplates.push( {
							label: key,
							kind: kind,
							detail: 'Auto-import from three',
							insertText: key,
							moduleName: 'three'
						} );

					}

				} );

				Object.entries( ADDONS_TSL_IMPORTS ).forEach( ( [ key, modulePath ] ) => {

					let kind = window.monaco.languages.CompletionItemKind.Function;
					if ( key[ 0 ] === key[ 0 ].toUpperCase() ) {

						kind = window.monaco.languages.CompletionItemKind.Class;

					}

					suggestionsTemplates.push( {
						label: key,
						kind: kind,
						detail: `Auto-import from ${modulePath}`,
						insertText: key,
						moduleName: modulePath
					} );

				} );

				window.monaco.languages.registerCompletionItemProvider( 'javascript', {

					provideCompletionItems: ( model, position ) => {

						const word = model.getWordUntilPosition( position );
						const range = {
							startLineNumber: position.lineNumber,
							endLineNumber: position.lineNumber,
							startColumn: word.startColumn,
							endColumn: word.endColumn
						};

						const hasImportForSymbol = ( code, symbol, moduleName ) => {

							const baseSymbol = symbol.split( '.' )[ 0 ];
							const escapedModule = moduleName.replace( /[-\/\\^$*+?.()|[\]{}]/g, '\\$&' );
							const regex = new RegExp( `import\\s+\\{([^\\}]*\\b${baseSymbol}\\b[^\\}]*)\\}\\s+from\\s+['"]${escapedModule}['"]` );
							return regex.test( code );

						};

						const getAdditionalTextEdits = ( model, symbol, moduleName ) => {

							const code = model.getValue();

							if ( symbol === 'THREE' || moduleName === 'three-namespace' ) {

								const hasThreeImport = /import\s+\*\s+as\s+THREE\s+from\s+['"]three(?:|\/webgpu)['"];?/.test( code );
								if ( hasThreeImport ) return [];

								return [
									{
										range: new window.monaco.Range( 1, 1, 1, 1 ),
										text: 'import * as THREE from \'three\';\n'
									}
								];

							}

							const baseSymbol = symbol.split( '.' )[ 0 ];
							if ( hasImportForSymbol( code, baseSymbol, moduleName ) ) {

								return [];

							}

							const escapedModule = moduleName.replace( /[-\/\\^$*+?.()|[\]{}]/g, '\\$&' );
							const importRegex = new RegExp( `import\\s+\\{([^\\}]*)\\}\\s+from\\s+['"]${escapedModule}['"];?`, 'g' );
							const match = importRegex.exec( code );

							if ( match ) {

								const existingImportsStr = match[ 1 ];
								const startIdx = match.index;
								const endIdx = importRegex.lastIndex;

								const symbolList = existingImportsStr.split( ',' ).map( s => s.trim() ).filter( Boolean );
								if ( ! symbolList.includes( baseSymbol ) ) {

									symbolList.push( baseSymbol );

								}

								const newImportStatement = `import { ${symbolList.join( ', ' )} } from '${moduleName}';`;

								const startPos = model.getPositionAt( startIdx );
								const endPos = model.getPositionAt( endIdx );

								return [
									{
										range: new window.monaco.Range( startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column ),
										text: newImportStatement
									}
								];

							} else {

								return [
									{
										range: new window.monaco.Range( 1, 1, 1, 1 ),
										text: `import { ${baseSymbol} } from '${moduleName}';\n`
									}
								];

							}

						};

						const lineContent = model.getLineContent( position.lineNumber );
						const textBeforeCursor = lineContent.substring( 0, position.column - 1 );
						const isNewKeyword = /\bnew\s+[a-zA-Z0-9_$]*$/.test( textBeforeCursor );

						let filteredTemplates = suggestionsTemplates;
						if ( isNewKeyword ) {

							filteredTemplates = suggestionsTemplates.filter( item => item.moduleName !== 'three/tsl' );

						}

						const suggestions = filteredTemplates.map( item => ( {
							label: item.label,
							kind: item.kind,
							detail: item.detail,
							insertText: item.insertText,
							insertTextRules: item.insertTextRules,
							range: range,
							additionalTextEdits: item.moduleName ? getAdditionalTextEdits( model, item.label, item.moduleName ) : []
						} ) );

						return { suggestions };

					}

				} );

				// Configure TypeScript/JavaScript language service settings
				const typescriptDefaults = window.monaco.languages.typescript.javascriptDefaults;

				typescriptDefaults.setCompilerOptions( {
					target: window.monaco.languages.typescript.ScriptTarget.ES2020,
					allowNonTsExtensions: true,
					checkJs: true,
					moduleResolution: window.monaco.languages.typescript.ModuleResolutionKind.NodeJs,
					allowSyntheticDefaultImports: true,
					autoImportSuggestions: false
				} );

				typescriptDefaults.setDiagnosticsOptions( {
					noSemanticValidation: true,
					noSyntaxValidation: false
				} );

				// Procedurally generate and register type definitions
				const dtsContent = generateDeclarations( THREE, TSL, ADDONS_TSL_IMPORTS );

				typescriptDefaults.addExtraLib( dtsContent, 'ts:three-tsl.d.ts' );

				// Register formatting provider
				window.monaco.languages.registerDocumentFormattingEditProvider( 'javascript', {

					provideDocumentFormattingEdits: async ( model ) => {

						const formatted = await CodeCompiler.format( model.getValue() );

						return [
							{
								range: model.getFullModelRange(),
								text: formatted
							}
						];

					}

				} );

				_monacoConfigured = true;

			}

			let options;

			if ( this.readOnly ) {

				options = {
					value: this.value,
					language: this.language,
					theme: 'chatgpt-dark',
					automaticLayout: true,
					readOnly: true,
					minimap: { enabled: false },
					scrollBeyondLastLine: false,
					renderLineHighlight: 'none',
					hideCursorInOverviewRuler: true,
					overviewRulerBorder: false,
					padding: { top: 12, bottom: 12 },
					scrollbar: {
						vertical: 'hidden',
						horizontal: 'auto'
					},
					bracketPairColorization: { enabled: true },
					cursorBlinking: 'smooth',
					smoothScrolling: true
				};

			} else {

				options = {
					value: this.value,
					language: this.language,
					theme: 'chatgpt-dark',
					minimap: { enabled: false },
					automaticLayout: true,
					fixedOverflowWidgets: true,
					fontSize: 13,
					fontFamily: '\'Fira Code\', monospace',
					padding: { top: 16, bottom: 16 },
					insertSpaces: false,
					detectIndentation: false,
					snippetSuggestions: 'top',
					bracketPairColorization: { enabled: true },
					cursorBlinking: 'smooth',
					smoothScrolling: true
				};

			}

			if ( ! this.scrollable ) {

				options.scrollBeyondLastLine = false;
				options.scrollbar = {
					vertical: 'hidden',
					horizontal: 'auto',
					handleMouseWheel: false,
					alwaysConsumeMouseWheel: false
				};

			}

			this.editor = window.monaco.editor.create( this.container, options );

			// Dynamic TSL syntax highlighting updates based on file imports
			const updateHighlights = () => {

				if ( this.language === 'javascript' || this.language === 'typescript' ) {

					updateTokenizerForCode();

				}

			};

			if ( ! this.readOnly ) {

				this.editor.onDidChangeModelContent( () => {

					updateHighlights();

					if ( this.isProgrammaticChange ) return;

					this.dispatchEvent( { type: 'change', value: this.editor.getValue() } );

				} );

			}

			updateHighlights();

			if ( ! this.scrollable ) {

				const updateHeight = () => {

					const contentHeight = this.editor.getContentHeight();
					this.container.style.height = `${contentHeight}px`;
					this.editor.layout();

				};

				this.editor.onDidContentSizeChange( updateHeight );
				updateHeight();

				this._wheelListener = ( event ) => {

					const scrollParent = this.container.closest( '#content-area' ) || this.container.closest( '.custom-scrollbar' ) || document.documentElement;
					if ( scrollParent ) {

						scrollParent.scrollTop += event.deltaY;
						event.preventDefault();

					}

				};

				this.container.addEventListener( 'wheel', this._wheelListener, { passive: false } );

				let startX = 0;
				let startY = 0;
				let lastY = 0;
				let isScrolling = false;

				this._touchStartListener = ( event ) => {

					if ( event.touches.length === 1 ) {

						startX = event.touches[ 0 ].clientX;
						startY = event.touches[ 0 ].clientY;
						lastY = startY;
						isScrolling = false;

					}

				};

				this._touchMoveListener = ( event ) => {

					if ( event.touches.length === 1 ) {

						const currentX = event.touches[ 0 ].clientX;
						const currentY = event.touches[ 0 ].clientY;
						const totalDeltaY = Math.abs( currentY - startY );
						const totalDeltaX = Math.abs( currentX - startX );

						if ( isScrolling || ( totalDeltaY > 5 && totalDeltaY > totalDeltaX ) ) {

							isScrolling = true;

							const deltaY = lastY - currentY;
							lastY = currentY;

							const scrollParent = this.container.closest( '#content-area' ) || this.container.closest( '.custom-scrollbar' ) || document.documentElement;
							if ( scrollParent ) {

								scrollParent.scrollTop += deltaY;

							}

							event.preventDefault();
							event.stopPropagation();

						}

					}

				};

				this.container.addEventListener( 'touchstart', this._touchStartListener, { capture: true, passive: true } );
				this.container.addEventListener( 'touchmove', this._touchMoveListener, { capture: true, passive: false } );

			}

			document.fonts.ready.then( () => {

				window.monaco.editor.remeasureFonts();
				if ( ! this.scrollable && this.editor ) {

					const contentHeight = this.editor.getContentHeight();
					this.container.style.height = `${contentHeight}px`;
					this.editor.layout();

				}

			} );

			this.dispatchEvent( { type: 'init' } );

		} );

	}

	getValue() {

		if ( ! this.editor ) return this.value;
		return this.editor.getValue();

	}

	setValue( value ) {

		if ( ! this.editor ) {

			this.value = value;
			return;

		}

		this.isProgrammaticChange = true;

		try {

			this.editor.setValue( value );
			this.editor.setScrollTop( 0 );
			this.editor.setScrollLeft( 0 );
			this.editor.setPosition( { lineNumber: 1, column: 1 } );

		} finally {

			this.isProgrammaticChange = false;

		}

		// Update highlights after setting the value
		if ( this.language === 'javascript' || this.language === 'typescript' ) {

			updateTokenizerForCode();

		}

	}

	format( formatted ) {

		if ( ! this.editor ) return;
		const model = this.editor.getModel();
		this.isProgrammaticChange = true;
		try {

			this.editor.executeEdits( 'clean-and-format', [ {
				range: model.getFullModelRange(),
				text: formatted,
				forceMoveMarkers: true
			} ] );

		} finally {

			this.isProgrammaticChange = false;

		}

	}

	layout() {

		if ( this.editor ) this.editor.layout();

	}

	focus() {

		if ( this.editor ) this.editor.focus();

	}

	revealLine( line, column = 1 ) {

		if ( ! this.editor ) return;
		this.editor.revealLineInCenter( line );
		this.editor.setPosition( { lineNumber: line, column: column } );
		this.editor.focus();

	}

	clearMarkers() {

		if ( ! this.editor || ! window.monaco ) return;
		window.monaco.editor.setModelMarkers( this.editor.getModel(), 'tsl', [] );

	}

	setErrorMarker( line, column, message ) {

		if ( ! this.editor || ! window.monaco ) return;
		const lineCount = this.editor.getModel().getLineCount();
		if ( line <= lineCount ) {

			window.monaco.editor.setModelMarkers( this.editor.getModel(), 'tsl', [ {
				startLineNumber: line,
				startColumn: column || 1,
				endLineNumber: line,
				endColumn: ( column || 1 ) + 100,
				message: message,
				severity: window.monaco.MarkerSeverity.Error
			} ] );

		}

	}

	dispose() {

		if ( this._wheelListener ) {

			this.container.removeEventListener( 'wheel', this._wheelListener );
			this._wheelListener = null;

		}

		if ( this._touchStartListener ) {

			this.container.removeEventListener( 'touchstart', this._touchStartListener, { capture: true } );
			this._touchStartListener = null;

		}

		if ( this._touchMoveListener ) {

			this.container.removeEventListener( 'touchmove', this._touchMoveListener, { capture: true } );
			this._touchMoveListener = null;

		}

		if ( this.editor ) {

			this.editor.dispose();
			this.editor = null;

		}

	}

}

export { CodeEditor };
