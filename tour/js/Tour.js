import * as THREE from 'three';
import * as TSL from 'three/tsl';

import { Inspector } from 'three/addons/inspector/Inspector.js';

import { parseTour, parse } from './utils/MarkdownUtils.js';
import { CodeRunner } from './code/CodeRunner.js';
import { CodeCompiler } from './code/CodeCompiler.js';
import { CodeEditor } from './editor/CodeEditor.js';
import { SearchManager } from './managers/SearchManager.js';
import { HistoryManager } from './managers/HistoryManager.js';
import { LayoutManager } from './managers/LayoutManager.js';
import { ConsoleManager } from './managers/ConsoleManager.js';
import { PlaygroundManager } from './managers/PlaygroundManager.js';
import { getSVG, compressString } from './utils/TourUtils.js';

const MOBILE_BREAKPOINT = 768;

let twttr;

function getTwitterWidgets() {

	if ( twttr ) return twttr;

	twttr = ( function ( d, s, id ) {

		var js, fjs = d.getElementsByTagName( s )[ 0 ],
			t = twttr || {};
		if ( d.getElementById( id ) ) return t;
		js = d.createElement( s );
		js.id = id;
		js.src = 'https://platform.twitter.com/widgets.js';
		fjs.parentNode.insertBefore( js, fjs );

		t._e = [];
		t.ready = function ( f ) {

			t._e.push( f );

		};

		return t;

	}( document, 'script', 'twitter-wjs' ) );

	return twttr;

}

class Tour {

	constructor() {

		this.pages = [];
		this.pageTree = [];
		this.currentPageIndex = 0;

		const initialHash = window.location.hash.substring( 1 );
		const isInitialPlayground = initialHash.startsWith( 'playground=' ) || initialHash.startsWith( 'playground/' );

		this.isSidebarOpen = ( window.innerWidth >= MOBILE_BREAKPOINT ) && ! isInitialPlayground;
		this.isEditorCollapsed = window.innerWidth < MOBILE_BREAKPOINT;
		this.isPreviewVisible = window.innerWidth >= MOBILE_BREAKPOINT;
		this.lastReaderPreviewState = window.innerWidth >= MOBILE_BREAKPOINT;
		this.isPreviewMaximized = false;
		this.lastContentWidth = '50%';
		this.runner = new CodeRunner();

		this.renderer = null;
		this.codeEditor = null;
		this.debugCodeEditor = null;
		this.readOnlyEditors = [];
		this.isPlaygroundActive = false;
		this.isContentRendered = false;
		this.searchManager = new SearchManager( this );
		this.historyManager = new HistoryManager( this );
		this.layoutManager = new LayoutManager( this );
		this.consoleManager = new ConsoleManager( this );
		this.playgroundManager = new PlaygroundManager( this );

		this.lastTourPageHash = '';
		this.debugStage = 'fragment';
		this.debugLanguage = 'WGSL';

		this.dom = {};

		this.animate = this.animate.bind( this );

	}

	async load( url ) {

		try {

			const response = await fetch( url );
			const text = await response.text();
			const result = parseTour( text );
			this.pages = result.pages;
			this.pageTree = result.pageTree;

			this.init();

		} catch ( err ) {

			console.error( 'Error loading tour:', err );

		}

	}

	init() {

		this.searchManager.buildIndex();

		// Cache DOM Elements
		this.dom = {
			contentArea: document.getElementById( 'content-area' ),
			codeContainer: document.getElementById( 'code-container' ),
			previewContainer: document.getElementById( 'preview-container' ),
			sidebar: document.getElementById( 'sidebar' ),
			menuToggleMain: document.getElementById( 'menu-toggle-main' ),
			headerSearchBtn: document.getElementById( 'header-search-btn' ),
			menuToggleClose: document.getElementById( 'menu-toggle-close' ),
			tocList: document.getElementById( 'toc-list' ),
			contentCol: document.querySelector( '.content-col' ),
			editorCol: document.querySelector( '.editor-col' ),
			previewSection: document.querySelector( '.preview-section' ),
			hResizerContainer: document.getElementById( 'h-resizer-container' ),
			hResizer: document.getElementById( 'h-resizer' ),
			hResizerToggle: document.getElementById( 'h-resizer-toggle' ),
			vResizer: document.getElementById( 'v-resizer' ),
			vResizerToggle: document.getElementById( 'v-resizer-toggle' ),
			vResizerToggleInverted: document.getElementById( 'v-resizer-toggle-inverted' ),
			headerEditorToggle: document.getElementById( 'header-editor-toggle' ),
			headerPreviewToggle: document.getElementById( 'header-preview-toggle' ),
			previewHide: document.getElementById( 'preview-hide' ),
			previewFullscreen: document.getElementById( 'preview-fullscreen' ),
			previewPlayground: document.getElementById( 'preview-playground' ),
			previewCopy: document.getElementById( 'preview-copy' ),
			editorConsole: document.getElementById( 'editor-console' ),
			consoleHeader: document.getElementById( 'console-header' ),
			consoleToggleBtn: document.getElementById( 'console-toggle-btn' ),
			consoleToggleIcon: document.getElementById( 'console-toggle-icon' ),
			consoleErrorMessage: document.getElementById( 'console-error-message' ),
			copyCodeBtnHeader: document.getElementById( 'copy-code-btn-header' ),
			playgroundBtn: document.getElementById( 'playground-btn' ),
			debugContainer: document.getElementById( 'debug-container' ),
			debugEditorContainer: document.getElementById( 'debug-editor-container' ),
			debugLanguageSelect: document.getElementById( 'debug-language-select' ),
			debugStageSelect: document.getElementById( 'debug-stage-select' )
		};

		// Create playground tabs bar and editor sub-container
		const tabsBar = document.createElement( 'div' );
		tabsBar.id = 'playground-tabs-bar';
		tabsBar.className = 'playground-tabs-bar';
		tabsBar.style.display = 'none';

		const editorSubContainer = document.createElement( 'div' );
		editorSubContainer.id = 'editor-sub-container';
		editorSubContainer.className = 'editor-sub-container';
		editorSubContainer.style.flex = '1';
		editorSubContainer.style.width = '100%';
		editorSubContainer.style.height = '100%';
		editorSubContainer.style.minHeight = '0';

		this.dom.codeContainer.style.display = 'flex';
		this.dom.codeContainer.style.flexDirection = 'column';
		this.dom.codeContainer.style.overflow = 'hidden';

		this.dom.codeContainer.appendChild( tabsBar );
		this.dom.codeContainer.appendChild( editorSubContainer );
		this.dom.tabsBar = tabsBar;
		this.dom.editorSubContainer = editorSubContainer;

		// Create and insert search box in sidebar header
		const sidebarHeader = this.dom.sidebar.querySelector( '.sidebar-header' );
		const searchContainer = document.createElement( 'div' );
		searchContainer.className = 'sidebar-search';
		searchContainer.innerHTML = `
			<i data-icon="search" class="sidebar-search-icon"></i>
			<input type="text" id="sidebar-search-input" class="sidebar-search-input" placeholder="Search..." autocomplete="off">
			<button id="sidebar-search-clear" class="sidebar-search-clear" title="Clear search">
				<i data-icon="x"></i>
			</button>
		`;
		sidebarHeader.appendChild( searchContainer );

		const suggestionContainer = document.createElement( 'div' );
		suggestionContainer.id = 'sidebar-search-suggestion';
		suggestionContainer.className = 'sidebar-search-suggestion';
		this.dom.sidebar.insertBefore( suggestionContainer, this.dom.sidebar.querySelector( '.sidebar-content' ) );
		this.dom.searchSuggestionContainer = suggestionContainer;

		this.dom.searchContainer = searchContainer;
		this.dom.searchInput = document.getElementById( 'sidebar-search-input' );
		this.dom.searchClear = document.getElementById( 'sidebar-search-clear' );

		this.createIcons( searchContainer );

		this.openedViaHeaderSearch = false;


		this.dom.debugLanguageSelect.onchange = () => {

			this.debugLanguage = this.dom.debugLanguageSelect.value;
			this.updateDebugWGSL();

		};

		this.dom.debugStageSelect.onchange = () => {

			this.debugStage = this.dom.debugStageSelect.value;
			this.updateDebugWGSL();

		};



		// Initialize Lucide Icons
		this.createIcons();

		if ( window.innerWidth < MOBILE_BREAKPOINT ) {

			document.body.classList.add( 'preview-hidden' );
			this.dom.headerPreviewToggle.innerHTML = '<i data-icon="eye-off" style="width: 1.25rem; height: 1.25rem;"></i>';
			this.createIcons( this.dom.headerPreviewToggle );

		}

		this.dom.consoleHeader.onclick = ( e ) => {

			if ( e.target.closest( '.console-header-actions' ) ) return;
			this.toggleConsole();

		};

		this.dom.consoleToggleBtn.onclick = ( e ) => {

			e.stopPropagation();
			this.toggleConsole();

		};

		this.setupTOC();
		this.toggleSidebar( this.isSidebarOpen );

		// capture stack traces for nodes
		//THREE.Node.captureStackTrace = true;

		// Setup 3D Preview
		this.renderer = new THREE.WebGPURenderer( { antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( Math.max( this.dom.previewContainer.clientWidth, 1 ), Math.max( this.dom.previewContainer.clientHeight, 1 ) );
		this.renderer.setAnimationLoop( this.animate );
		//this.renderer.inspector = new Inspector();
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFShadowMap;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.dom.previewContainer.appendChild( this.renderer.domElement );

		this.webGLRenderer = new THREE.WebGPURenderer( { forceWebGL: true } );
		this.webGLRenderer.debug.diagnostics.keywords = true;

		this.runner.setValue( 'renderer', this.renderer );
		this.runner.setImport( 'three', THREE );
		this.runner.setImport( 'three/tsl', TSL );

		let resizeTimeout;
		this.resizeObserver = new ResizeObserver( ( entries ) => {

			for ( const entry of entries ) {

				const width = Math.floor( entry.contentRect.width );
				const height = Math.floor( entry.contentRect.height );
				if ( width > 0 && height > 0 ) {

					cancelAnimationFrame( resizeTimeout );
					resizeTimeout = requestAnimationFrame( () => {

						this.renderer.setSize( width, height );
						this.runner.call( 'resize', width, height );

					} );

				}

			}

		} );
		this.resizeObserver.observe( this.dom.previewContainer );

		// Window resize event handler
		let wasMobile = window.innerWidth < MOBILE_BREAKPOINT;
		this.onWindowResize = () => {

			if ( ! this.renderer ) return;

			const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

			if ( isMobile !== wasMobile ) {

				wasMobile = isMobile;

				if ( this.isPlaygroundActive ) {

					this.isPlaygroundActive = false;
					this.togglePlayground( true );

				}

			}

			// Re-evaluate layouts on window resize to ensure correct width properties
			const page = this.pages[ this.currentPageIndex ];
			if ( page && page.hasCode ) {

				if ( this.isEditorCollapsed ) {

					this.dom.contentCol.style.width = '100%';
					this.dom.contentCol.style.display = 'flex';
					if ( isMobile ) {

						this.dom.editorCol.style.width = '0%';

					} else {

						this.dom.editorCol.style.width = '';

					}

					this.setResizerToggleIcon( 'chevron-left' );

				} else {

					if ( isMobile ) {

						this.dom.contentCol.style.width = '0%';
						this.dom.contentCol.style.display = 'none';
						this.dom.editorCol.style.width = '100%';

					} else {

						this.dom.contentCol.style.width = this.lastContentWidth || '50%';
						this.dom.contentCol.style.display = 'flex';
						this.dom.editorCol.style.width = '';

					}

					this.setResizerToggleIcon( 'chevron-right' );

				}

			}

		};

		window.addEventListener( 'resize', this.onWindowResize );

		// Hook UI Actions
		this.dom.menuToggleMain.onclick = () => {

			this.openedViaHeaderSearch = false;
			this.toggleSidebar();

		};

		this.dom.menuToggleClose.onclick = () => {

			this.openedViaHeaderSearch = false;
			this.toggleSidebar();

		};

		this.dom.headerSearchBtn.onclick = () => {

			this.openedViaHeaderSearch = true;
			this.toggleSidebar( true );
			this.dom.searchInput.focus();

		};

		const updateSearchFocus = () => {

			const query = this.dom.searchInput.value;
			if ( document.activeElement === this.dom.searchInput || query.trim().length > 0 ) {

				this.dom.searchContainer.classList.add( 'focused' );

			} else {

				this.dom.searchContainer.classList.remove( 'focused' );

			}

		};

		this.dom.searchContainer.onclick = () => {

			if ( ! this.dom.searchContainer.classList.contains( 'focused' ) ) {

				this.dom.searchInput.focus();

			}

		};

		this.dom.searchInput.onfocus = updateSearchFocus;
		this.dom.searchInput.onblur = ( e ) => {

			updateSearchFocus();

			if ( window.innerWidth < MOBILE_BREAKPOINT ) return;

			// Check if focus is moving outside the sidebar
			const focusMovedOutside = e.relatedTarget && ! this.dom.sidebar.contains( e.relatedTarget );
			if ( this.openedViaHeaderSearch && this.dom.searchInput.value.trim().length === 0 && focusMovedOutside ) {

				this.toggleSidebar( false );

			}

		};

		this.dom.searchInput.onkeydown = ( e ) => {

			if ( e.key === 'Escape' ) {

				if ( this.dom.searchInput.value !== '' ) {

					this.dom.searchInput.value = '';
					this.dom.searchClear.style.display = 'none';
					this.searchManager.performSearch( '' );
					this.searchManager.updateHashWithSearch( '' );
					updateSearchFocus();

				} else {

					this.dom.searchInput.blur();

				}

			}

		};

		this.dom.searchInput.oninput = () => {

			const query = this.dom.searchInput.value;
			if ( query.trim().length > 0 ) {

				this.dom.searchClear.style.display = 'flex';

			} else {

				this.dom.searchClear.style.display = 'none';

			}

			this.searchManager.performSearch( query );
			this.searchManager.updateHashWithSearch( query );
			updateSearchFocus();

		};

		this.dom.searchClear.onclick = ( e ) => {

			e.stopPropagation();
			this.dom.searchInput.value = '';
			this.dom.searchClear.style.display = 'none';
			this.searchManager.performSearch( '' );
			this.searchManager.updateHashWithSearch( '' );
			updateSearchFocus();
			this.dom.searchInput.focus();

		};

		this.onDocumentPointerDown = ( e ) => {

			if ( window.innerWidth < MOBILE_BREAKPOINT && this.isSidebarOpen ) {

				const isClickInsideSidebar = this.dom.sidebar.contains( e.target );
				const isClickOnToggle = this.dom.menuToggleMain.contains( e.target );
				const isClickOnSearchToggle = this.dom.headerSearchBtn.contains( e.target );

				if ( ! isClickInsideSidebar && ! isClickOnToggle && ! isClickOnSearchToggle ) {

					this.toggleSidebar( false );

				}

			}

			// Relock embed overlays if user clicks outside of their respective preview areas
			const unlockedOverlays = document.querySelectorAll( '.tsl-embed-lock-overlay.unlocked' );
			unlockedOverlays.forEach( ( overlay ) => {

				const previewEl = overlay.closest( '.tsl-embed-preview' );
				if ( previewEl && ! previewEl.contains( e.target ) ) {

					overlay.classList.remove( 'unlocked' );

				}

			} );

		};

		document.addEventListener( 'pointerdown', this.onDocumentPointerDown );

		this.onContentAreaScroll = () => {

			const unlockedOverlays = document.querySelectorAll( '.tsl-embed-lock-overlay.unlocked' );
			unlockedOverlays.forEach( ( overlay ) => {

				overlay.classList.remove( 'unlocked' );

			} );

		};

		this.dom.contentArea.addEventListener( 'scroll', this.onContentAreaScroll );

		this.dom.headerEditorToggle.onclick = () => {

			this.dom.hResizerToggle.click();

		};

		this.dom.headerPreviewToggle.onclick = () => {

			this.isPreviewVisible = ! this.isPreviewVisible;
			this.lastReaderPreviewState = this.isPreviewVisible;
			document.body.classList.toggle( 'preview-hidden', ! this.isPreviewVisible );

			if ( this.isPreviewVisible ) {

				this.dom.headerPreviewToggle.innerHTML = '<i data-icon="eye" style="width: 1.25rem; height: 1.25rem;"></i>';



			} else {

				this.dom.headerPreviewToggle.innerHTML = '<i data-icon="eye-off" style="width: 1.25rem; height: 1.25rem;"></i>';

			}

			this.createIcons( this.dom.headerPreviewToggle );

			// Update inline code modifier active state styling when toggling preview visibility
			const hash = window.location.hash.substring( 1 );
			const hashParts = hash.split( '&' );
			const activeNode = hashParts[ 1 ] || '';
			const page = this.pages[ this.currentPageIndex ];
			if ( page ) {

				const originalCode = ( page.codes && page.codes[ activeNode ] ) || page.code || '';
				const currentVal = this.codeEditor ? this.codeEditor.getValue() : '';
				const isCodeModified = ( currentVal.trim() !== originalCode.trim() );

				const modifierButtons = document.querySelectorAll( '.code-modifier-inline-btn' );
				modifierButtons.forEach( btn => {

					const nodeName = btn.getAttribute( 'data-node' );
					if ( nodeName === activeNode && ! isCodeModified ) {

						btn.classList.add( 'active' );

					} else {

						btn.classList.remove( 'active' );

					}

				} );

			}

		};

		this.dom.previewHide.onclick = () => {

			this.dom.headerPreviewToggle.click();

		};

		this.dom.previewFullscreen.onclick = () => {

			this.isPreviewMaximized = ! this.isPreviewMaximized;
			document.body.classList.toggle( 'preview-maximized', this.isPreviewMaximized );

			if ( this.isPreviewMaximized ) {

				this.dom.previewFullscreen.innerHTML = '<i data-icon="minimize-2" style="width: 1.15rem; height: 1.15rem;"></i>';

			} else {

				this.dom.previewFullscreen.innerHTML = '<i data-icon="maximize-2" style="width: 1.15rem; height: 1.15rem;"></i>';

			}

			this.createIcons( this.dom.previewFullscreen );

		};

		this.dom.previewCopy.onclick = async () => {

			let code = '';
			if ( this.playgroundManager.playgroundTabs ) {

				const mainTab = this.playgroundManager.playgroundTabs.find( t => t.name === 'main' );
				if ( mainTab ) {

					code = mainTab.code;

				}

			}

			if ( ! code && this.codeEditor ) {

				code = this.codeEditor.getValue();

			}

			// Ensure all virtual tabs are in this.runner.scripts before compiling
			if ( this.playgroundManager.playgroundTabs ) {

				this.playgroundManager.playgroundTabs.forEach( tab => {

					if ( tab.name !== 'main' ) {

						this.runner.scripts[ tab.name ] = {
							url: null,
							text: tab.code,
							instance: this.runner.scripts[ tab.name ] ? this.runner.scripts[ tab.name ].instance : null,
							promise: this.runner.scripts[ tab.name ] ? this.runner.scripts[ tab.name ].promise : null
						};

					}

				} );

			}

			const compiler = new CodeCompiler();
			const compiledCode = await compiler.compile( code, this.runner.scripts );

			navigator.clipboard.writeText( compiledCode ).then( () => {

				this.dom.previewCopy.classList.add( 'success' );
				this.dom.previewCopy.innerHTML = '<i data-icon="check" style="width: 1.15rem; height: 1.15rem;"></i>';
				this.createIcons( this.dom.previewCopy );

				setTimeout( () => {

					this.dom.previewCopy.classList.remove( 'success' );
					this.dom.previewCopy.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-codeblock" style="width: 1.15rem; height: 1.15rem; display: block;"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5 4l-2 2l2 2" /><path d="M12 4l2 2l-2 2" /><path d="M8 8l1 -4" /><path d="M17 6a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7" /></svg>';

				}, 2000 );

			} );

		};

		this.dom.previewPlayground.onclick = () => {

			this.dom.playgroundBtn.click();

		};

		this.onWindowHashChange = () => {

			const hash = window.location.hash.substring( 1 );
			if ( hash.startsWith( 'playground=' ) || hash.startsWith( 'playground/' ) ) {

				this.playgroundManager.loadPlaygroundFromHash( hash );
				return;

			}

			if ( this.isPlaygroundActive ) {

				this.playgroundManager.togglePlayground( false );

			}

			this.lastTourPageHash = hash;

			const hashParts = hash.split( '&' );
			const pageId = hashParts[ 0 ];

			let selectedNode = '';
			for ( let i = 1; i < hashParts.length; i ++ ) {

				const part = hashParts[ i ];
				if ( ! part.startsWith( 'q=' ) ) {

					selectedNode = part;

				}

			}

			const targetIndex = this.pages.findIndex( p => p.id === pageId );

			if ( targetIndex !== - 1 ) {

				const shouldScroll = targetIndex !== this.currentPageIndex;
				this.renderPage( targetIndex, selectedNode, shouldScroll );

			} else {

				this.renderPage( 0 );
				history.replaceState( null, null, ' ' );

			}

			this.searchManager.restoreSearchFromHash( hash );

		};

		window.addEventListener( 'hashchange', this.onWindowHashChange );

		// Resizer Listeners
		this.layoutManager.setupResizer();

		// Code Editor Setup
		this.codeEditor = new CodeEditor( {
			container: this.dom.editorSubContainer,
			value: this.pages[ 0 ].code
		} );

		this.debugCodeEditor = new CodeEditor( {
			container: this.dom.debugEditorContainer,
			value: 'No shader generated yet...',
			readOnly: true,
			language: 'wgsl'
		} );

		let timeout;
		this.codeEditor.addEventListener( 'change', async ( event ) => {

			const currentCode = event.value;

			if ( this.isPlaygroundActive ) {

				const activeTab = this.playgroundManager.playgroundTabs.find( t => t.name === this.playgroundManager.activePlaygroundTabName );
				if ( activeTab ) {

					activeTab.code = currentCode;

				}

				const encoded = await compressString( JSON.stringify( {
					tabs: this.playgroundManager.playgroundTabs
				} ) );
				const release = THREE.RELEASE || THREE.REVISION;
				const newHash = 'playground=' + encoded + ( release ? '&release=' + release : '' );
				window.location.hash = newHash;

			}

			const page = this.pages[ this.currentPageIndex ];
			if ( page ) {

				let activeNode = page.defaultNode || '';
				if ( this.isPlaygroundActive ) {

					if ( this.lastTourPageHash ) {

						const lastHashParts = this.lastTourPageHash.split( '&' );
						if ( lastHashParts[ 1 ] ) {

							activeNode = lastHashParts[ 1 ];

						}

					}

				} else {

					const currentHash = window.location.hash.substring( 1 );
					activeNode = currentHash.split( '&' )[ 1 ] || page.defaultNode;

				}

				if ( activeNode && page.codes && page.codes[ activeNode ] !== undefined ) {

					if ( ! page.modifiedCodes ) page.modifiedCodes = {};
					page.modifiedCodes[ activeNode ] = currentCode;

				} else {

					page.modifiedCode = currentCode;

				}

				const originalCode = ( activeNode && page.codes && page.codes[ activeNode ] !== undefined )
					? page.codes[ activeNode ]
					: page.code;

				const isModified = ( currentCode !== originalCode );

				const activeButtons = this.dom.contentArea.querySelectorAll( '.code-modifier-inline-btn' );
				activeButtons.forEach( btn => {

					const btnNode = btn.getAttribute( 'data-node' );
					if ( btnNode === activeNode && ! isModified ) {

						btn.classList.add( 'active' );

					} else {

						btn.classList.remove( 'active' );

					}

				} );

			}

			clearTimeout( timeout );
			timeout = setTimeout( async () => {

				this.renderer.setAnimationLoop( null );

				try {

					if ( this.isPlaygroundActive ) {

						await this.runPlayground();

					} else {

						await this.runner.run( currentCode );

					}

				} finally {

					this.renderer.setAnimationLoop( this.animate );

				}

			}, 500 );

		} );

		this.codeEditor.addEventListener( 'init', () => {

			this.dom.playgroundBtn.onclick = async () => {

				if ( this.isPlaygroundActive ) {

					window.location.hash = this.lastTourPageHash || this.pages[ 0 ].id;

				} else {

					const activePage = this.pages[ this.currentPageIndex ];
					let currentCode = '';

					if ( activePage && ! activePage.hasCode ) {

						currentCode = '// No example available.\nimport \'scenes/empty\';\n';

					} else {

						currentCode = this.codeEditor ? this.codeEditor.getValue() : '';

					}

					const encoded = await compressString( currentCode );
					const release = THREE.RELEASE || THREE.REVISION;
					const newHash = 'playground=' + encoded + ( release ? '&release=' + release : '' );
					window.location.hash = newHash;

				}

			};

			const initialHash = window.location.hash.substring( 1 );
			if ( initialHash.startsWith( 'playground=' ) || initialHash.startsWith( 'playground/' ) ) {

				this.playgroundManager.loadPlaygroundFromHash( initialHash );

			} else {

				const hashParts = initialHash.split( '&' );
				const pageId = hashParts[ 0 ];

				let selectedNode = '';
				for ( let i = 1; i < hashParts.length; i ++ ) {

					const part = hashParts[ i ];
					if ( ! part.startsWith( 'q=' ) ) {

						selectedNode = part;

					}

				}

				const initialIndex = this.pages.findIndex( p => p.id === pageId );

				if ( initialIndex !== - 1 ) {

					this.renderPage( initialIndex, selectedNode );

				} else {

					this.renderPage( 0 );

				}

				this.searchManager.restoreSearchFromHash( initialHash );

			}

			document.body.classList.remove( 'loading' );
			const loadingScreen = document.getElementById( 'loading-screen' );
			if ( loadingScreen ) {

				loadingScreen.style.opacity = '0';
				setTimeout( () => {

					loadingScreen.remove();

				}, 500 );

			}

		} );

	}



	renderPage( index, activeNodeName = '', shouldScrollToTop = true ) {

		if ( index < 0 || index >= this.pages.length ) return;

		this.isContentRendered = true;
		this.openedViaHeaderSearch = false;

		if ( this.currentPageIndex !== index ) {

			const prevPage = this.pages[ this.currentPageIndex ];
			if ( prevPage ) {

				delete prevPage.modifiedCode;
				delete prevPage.modifiedCodes;

			}

		}

		this.currentPageIndex = index;
		const page = this.pages[ index ];

		this.lastTourPageHash = page.id + ( activeNodeName ? '&' + activeNodeName : '' );

		// Reset preview maximized state on page transitions
		this.isPreviewMaximized = false;
		document.body.classList.remove( 'preview-maximized' );
		this.dom.previewFullscreen.innerHTML = '<i data-icon="maximize-2" style="width: 1.15rem; height: 1.15rem;"></i>';
		this.createIcons( this.dom.previewFullscreen );

		// Resolve page code from the active node modifier, falling back to primary code
		const activeNodeForCode = activeNodeName || page.defaultNode;
		const originalPageCode = ( activeNodeForCode && page.codes && page.codes[ activeNodeForCode ] !== undefined )
			? page.codes[ activeNodeForCode ]
			: page.code;

		let pageCode = originalPageCode;
		let isModified = false;
		if ( activeNodeForCode && page.modifiedCodes && page.modifiedCodes[ activeNodeForCode ] !== undefined ) {

			pageCode = page.modifiedCodes[ activeNodeForCode ];
			isModified = ( pageCode !== originalPageCode );

		} else if ( ! activeNodeForCode && page.modifiedCode !== undefined ) {

			pageCode = page.modifiedCode;
			isModified = ( pageCode !== originalPageCode );

		}

		// Render HTML content
		let headerHTML = '';
		if ( page.path && page.path.length > 0 ) {

			const segments = page.path.map( segment => {

				const targetPage = this.pages.find( p => p.title === segment );

				if ( targetPage ) {

					return `
                        <a href="#${targetPage.id}" class="breadcrumb-link">${segment}</a>
                        <i data-icon="chevron-right" style="width: 1rem; height: 1rem; opacity: 0.7;"></i>
                    `;

				} else {

					return `
                        <span style="opacity: 0.7">${segment}</span>
                        <i data-icon="chevron-right" style="width: 1rem; height: 1rem; opacity: 0.7;"></i>
                    `;

				}

			} ).join( '' );

			headerHTML = `<div class="breadcrumb">
                ${segments}
                <span style="color: #fff; font-weight: 500;">${page.title}</span>
            </div>`;

		}

		let description = page.description;
		if ( this.isEditorCollapsed && page.hasCode ) {

			description += '\n\n```js\n' + pageCode + '\n```';

		}

		this.dom.contentArea.innerHTML = '<div style="max-width: 800px; margin: 0 auto; width: 100%; position: relative;">' +
			'<button id="copy-code-btn" class="copy-code-btn" title="Copy Markdown">' +
				'<i data-icon="copy" style="width: 1rem; height: 1rem;"></i>' +
			'</button>' +
			headerHTML + parse( description ) + '</div>';

		getTwitterWidgets().ready( ( twttr ) => {

			twttr.widgets.load( this.dom.contentArea );

		} );

		if ( shouldScrollToTop ) {

			this.dom.contentArea.scrollTo( 0, 0 );

		}



		// Append floating navigation buttons at the bottom of content
		const navDiv = document.createElement( 'div' );
		navDiv.className = 'floating-nav-container';

		const prevButton = document.createElement( 'button' );
		prevButton.className = 'floating-nav-btn prev';
		if ( this.currentPageIndex === 0 ) prevButton.classList.add( 'disabled' );
		prevButton.innerHTML = '<i data-icon=\'chevron-left\' style=\'width: 1rem; height: 1rem;\'></i><span>Previous</span>';
		prevButton.onclick = () => {

			if ( this.currentPageIndex > 0 ) {

				window.location.hash = this.pages[ this.currentPageIndex - 1 ].id;

			}

		};

		const nextButton = document.createElement( 'button' );
		nextButton.className = 'floating-nav-btn next';
		if ( this.currentPageIndex === this.pages.length - 1 ) nextButton.classList.add( 'disabled' );
		nextButton.innerHTML = '<span>Next</span><i data-icon=\'chevron-right\' style=\'width: 1rem; height: 1rem;\'></i>';
		nextButton.onclick = () => {

			if ( this.currentPageIndex < this.pages.length - 1 ) {

				window.location.hash = this.pages[ this.currentPageIndex + 1 ].id;

			} else {

				alert( 'You have completed the tour!' );

			}

		};

		navDiv.appendChild( prevButton );
		navDiv.appendChild( nextButton );
		this.dom.contentArea.querySelector( 'div' ).appendChild( navDiv );

		// Handle virtual links in the rendered HTML
		const links = this.dom.contentArea.querySelectorAll( 'a' );
		links.forEach( link => {

			const href = link.getAttribute( 'href' );
			if ( href && href.startsWith( '#' ) ) {

				link.className = 'nav-link';
				link.onclick = ( e ) => {

					e.preventDefault();
					const targetId = href.substring( 1 );
					window.location.hash = targetId;

				};

			}

		} );

		// Inject circular play buttons inside <code name="xxx"> tags
		const codeNodes = this.dom.contentArea.querySelectorAll( 'code[name]' );
		codeNodes.forEach( codeTag => {

			const nodeName = codeTag.getAttribute( 'name' );
			if ( nodeName ) {

				const textVal = codeTag.textContent.trim();
				codeTag.innerHTML = '';
				codeTag.appendChild( document.createTextNode( textVal ) );

				const button = document.createElement( 'button' );
				button.className = 'code-modifier-inline-btn';
				button.setAttribute( 'data-node', nodeName );
				button.innerHTML = '<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'currentColor\'><path stroke=\'none\' d=\'M0 0h24v24H0z\' fill=\'none\' /><path d=\'M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z\' /></svg>';

				codeTag.appendChild( button );

			}

		} );

		// Initialize Read-Only Monaco Editors for inline ```js blocks
		if ( this.readOnlyEditors ) {

			this.readOnlyEditors.forEach( editor => editor.dispose() );

		}

		this.readOnlyEditors = [];

		const jsBlocks = this.dom.contentArea.querySelectorAll( 'pre code.language-js' );
		jsBlocks.forEach( ( block ) => {

			const codeText = block.textContent;
			const pre = block.parentElement;
			const subContainer = document.createElement( 'div' );
			subContainer.className = 'inline-code-editor-container';

			const lines = codeText.trim().split( '\n' ).length;
			subContainer.style.height = ( lines * 19 + 24 ) + 'px';

			pre.replaceWith( subContainer );

			const readOnlyEditor = new CodeEditor( {
				container: subContainer,
				value: codeText.trim(),
				readOnly: true,
				scrollable: false
			} );

			this.readOnlyEditors.push( readOnlyEditor );

		} );

		// Update Code Editor
		if ( this.codeEditor ) {

			this.codeEditor.setValue( pageCode );

			const hash = window.location.hash.substring( 1 );
			const isInitialPlayground = hash.startsWith( 'playground=' ) || hash.startsWith( 'playground/' );

			if ( ! this.isPlaygroundActive && ! isInitialPlayground && ! page.hasEmbed ) {

				if ( this.renderer.domElement.parentElement !== this.dom.previewContainer ) {

					this.dom.previewContainer.appendChild( this.renderer.domElement );

				}

				this.runner.run( pageCode );

			}

		}

		// Handle tsl:embed blocks
		this.resizeObserver.disconnect();

		const embedContainers = this.dom.contentArea.querySelectorAll( '.tsl-embed-container' );
		if ( embedContainers.length > 0 ) {

			if ( ! page.modifiedEmbeds ) {

				page.modifiedEmbeds = [];

			}

			embedContainers.forEach( ( container ) => {

				const index = parseInt( container.getAttribute( 'data-index' ) );
				const originalEmbedCode = page.embeds[ index ];
				const codeText = ( page.modifiedEmbeds[ index ] !== undefined )
					? page.modifiedEmbeds[ index ]
					: originalEmbedCode;

				container.innerHTML = `
					<div class="tsl-embed-preview">
						<button class="embed-playground-btn" title="Open in Playground">
							<i data-icon="terminal" style="width: 1.15rem; height: 1.15rem;"></i>
						</button>
						<button class="embed-expand-btn" title="Toggle Fullscreen">
							<i data-icon="maximize-2" style="width: 1.15rem; height: 1.15rem;"></i>
						</button>
						<div class="tsl-embed-lock-overlay">
							<div class="tsl-embed-lock-circle">
								<i data-icon="lock-open" style="width: 1.5rem; height: 1.5rem;"></i>
							</div>
						</div>
					</div>
					<div class="tsl-embed-code"></div>
				`;

				this.createIcons( container );

				const previewEl = container.querySelector( '.tsl-embed-preview' );
				const codeEl = container.querySelector( '.tsl-embed-code' );
				const pgBtn = container.querySelector( '.embed-playground-btn' );
				const expandBtn = container.querySelector( '.embed-expand-btn' );
				const lockOverlay = container.querySelector( '.tsl-embed-lock-overlay' );

				// Create CodeEditor for the code section
				const inlineEditor = new CodeEditor( {
					container: codeEl,
					value: codeText,
					readOnly: false,
					scrollable: false
				} );
				this.readOnlyEditors.push( inlineEditor );

				expandBtn.onclick = () => {

					previewEl.classList.toggle( 'maximized' );
					const isMaximized = previewEl.classList.contains( 'maximized' );

					if ( isMaximized ) {

						expandBtn.innerHTML = '<i data-icon="minimize-2" style="width: 1.15rem; height: 1.15rem;"></i>';

					} else {

						expandBtn.innerHTML = '<i data-icon="maximize-2" style="width: 1.15rem; height: 1.15rem;"></i>';

					}

					this.createIcons( expandBtn );

				};

				lockOverlay.onclick = ( e ) => {

					e.stopPropagation();
					lockOverlay.classList.add( 'unlocked' );

				};

				pgBtn.onclick = async () => {

					const currentVal = inlineEditor.getValue();
					const encoded = await compressString( currentVal );
					const release = THREE.RELEASE || THREE.REVISION;
					const newHash = 'playground=' + encoded + ( release ? '&release=' + release : '' );
					window.location.hash = newHash;

				};

				let embedTimeout;
				inlineEditor.addEventListener( 'change', ( event ) => {

					const currentEmbedCode = event.value;
					page.modifiedEmbeds[ index ] = currentEmbedCode;

					if ( index === 0 ) {

						clearTimeout( embedTimeout );
						embedTimeout = setTimeout( () => {

							this.runner.run( currentEmbedCode );

						}, 500 );

					}

				} );

				if ( index === 0 ) {

					// Append renderer's canvas
					previewEl.appendChild( this.renderer.domElement );
					this.renderer.setSize( previewEl.clientWidth, previewEl.clientHeight );

					// Run the code
					this.runner.run( codeText );

					// Observe client size changes to resize the canvas
					this.resizeObserver.observe( previewEl );

				}

			} );

		} else {

			// Observe standard previewContainer if page hasCode
			if ( page.hasCode || this.isPlaygroundActive ) {

				this.resizeObserver.observe( this.dom.previewContainer );

			}

		}

		const copyMarkdown = ( btn ) => {

			const title = page.title;
			const breadcrumbs = page.path ? page.path.join( ' > ' ) + ' > ' + title : title;
			const currentCode = ( page.hasCode && this.codeEditor ) ? this.codeEditor.getValue() : ( page.hasCode ? page.code : '' );
			let markdownToCopy = `# ${breadcrumbs}\n\n${page.description}`;
			if ( page.hasCode && currentCode ) {

				markdownToCopy += `\n\n## Code Example\n\`\`\`javascript\n${currentCode}\n\`\`\``;

			}

			navigator.clipboard.writeText( markdownToCopy ).then( () => {

				btn.classList.add( 'success' );
				const isHeaderBtn = btn.id === 'copy-code-btn-header';
				const size = isHeaderBtn ? '1.25rem' : '1rem';
				btn.innerHTML = `<i data-icon="check" style="width: ${size}; height: ${size};"></i>`;
				this.createIcons( btn );

				setTimeout( () => {

					btn.classList.remove( 'success' );
					btn.innerHTML = `<i data-icon="copy" style="width: ${size}; height: ${size};"></i>`;
					this.createIcons( btn );

				}, 2000 );

			} );

		};

		const copyCodeBtn = document.getElementById( 'copy-code-btn' );
		copyCodeBtn.onclick = () => copyMarkdown( copyCodeBtn );

		const copyCodeBtnHeader = document.getElementById( 'copy-code-btn-header' );
		copyCodeBtnHeader.onclick = () => copyMarkdown( copyCodeBtnHeader );

		// Bind Welcome page interactive normal space buttons
		const modifierButtons = this.dom.contentArea.querySelectorAll( '.code-modifier-inline-btn' );

		let activeNode = activeNodeName || page.defaultNode;
		if ( ! activeNode ) {

			const currentCode = this.codeEditor ? this.codeEditor.getValue() : page.code;
			for ( const btn of modifierButtons ) {

				const nodeName = btn.getAttribute( 'data-node' );
				if ( nodeName && new RegExp( '\\b' + nodeName + '\\b' ).test( currentCode ) ) {

					activeNode = nodeName;
					break;

				}

			}

		}

		modifierButtons.forEach( btn => {

			const nodeName = btn.getAttribute( 'data-node' );
			if ( nodeName === activeNode && ! isModified ) {

				btn.classList.add( 'active' );

			} else {

				btn.classList.remove( 'active' );

			}

			const codeParent = btn.closest( 'code' );
			const clickTarget = codeParent || btn;
			clickTarget.onclick = () => {

				if ( nodeName ) {

					const newHash = `${page.id}&${nodeName}`;
					const isAlreadyActiveHash = ( window.location.hash === `#${newHash}` );

					// On mobile or collapsed reading mode, show preview if hidden when clicking a code modifier option (only if not already active)
					if ( ! isAlreadyActiveHash && ( window.innerWidth < MOBILE_BREAKPOINT || this.isEditorCollapsed ) && ! this.isPreviewVisible ) {

						this.isPreviewVisible = true;
						this.lastReaderPreviewState = true;
						document.body.classList.remove( 'preview-hidden' );
						this.dom.headerPreviewToggle.innerHTML = '<i data-icon="eye" style="width: 1.25rem; height: 1.25rem;"></i>';
						this.createIcons( this.dom.headerPreviewToggle );

					}

					if ( isAlreadyActiveHash ) {

						if ( window.innerWidth < MOBILE_BREAKPOINT || this.isEditorCollapsed ) {

							if ( this.isPreviewVisible ) {

								// Reset code and hide preview
								this.resetToOriginalCode( nodeName );
								this.isPreviewVisible = false;
								this.lastReaderPreviewState = false;
								document.body.classList.add( 'preview-hidden' );
								this.dom.headerPreviewToggle.innerHTML = '<i data-icon="eye-off" style="width: 1.25rem; height: 1.25rem;"></i>';
								this.createIcons( this.dom.headerPreviewToggle );

								modifierButtons.forEach( b => b.classList.remove( 'active' ) );

							} else {

								// Show preview again and restore active highlight
								this.isPreviewVisible = true;
								this.lastReaderPreviewState = true;
								document.body.classList.remove( 'preview-hidden' );
								this.dom.headerPreviewToggle.innerHTML = '<i data-icon="eye" style="width: 1.25rem; height: 1.25rem;"></i>';
								this.createIcons( this.dom.headerPreviewToggle );
								modifierButtons.forEach( btn => {

									const btnNode = btn.getAttribute( 'data-node' );
									if ( btnNode === nodeName ) {

										btn.classList.add( 'active' );

									}

								} );



							}

						} else {

							// Desktop expanded resets default code
							this.resetToOriginalCode( nodeName );

						}

					} else {

						window.location.hash = newHash;

					}

				}

			};

		} );

		this.createIcons( this.dom.contentArea );

		// Hide/Show layout division depending on whether the page contains a TSL code example
		const hash = window.location.hash.substring( 1 );
		const isInitialPlayground = hash.startsWith( 'playground=' ) || hash.startsWith( 'playground/' );

		if ( ( ! page.hasCode || page.hasEmbed ) && ! this.isPlaygroundActive && ! isInitialPlayground ) {

			this.dom.contentCol.style.width = '100%';
			this.dom.contentCol.style.display = 'flex';
			this.dom.editorCol.style.display = 'none';
			this.dom.hResizer.style.display = 'none';
			this.dom.hResizerContainer.style.display = 'none';
			document.body.classList.remove( 'collapsed-workspace' );
			this.dom.headerEditorToggle.style.display = 'none';
			this.dom.headerPreviewToggle.style.display = 'none';
			this.dom.copyCodeBtnHeader.style.display = 'none';

		} else {

			this.dom.hResizer.style.display = 'block';
			this.dom.hResizerContainer.style.display = 'flex';
			this.dom.headerEditorToggle.style.display = 'flex';
			this.dom.headerPreviewToggle.style.display = 'flex';
			this.dom.copyCodeBtnHeader.style.display = 'flex';
			if ( this.isEditorCollapsed ) {

				this.dom.contentCol.style.width = '100%';
				this.dom.contentCol.style.display = 'flex';
				if ( window.innerWidth < MOBILE_BREAKPOINT ) {

					this.dom.editorCol.style.width = '0%';

				} else {

					this.dom.editorCol.style.width = '';

				}

				this.setResizerToggleIcon( 'chevron-left' );
				this.dom.editorCol.style.display = 'flex';
				document.body.classList.add( 'collapsed-workspace' );

			} else {

				if ( window.innerWidth < MOBILE_BREAKPOINT ) {

					this.dom.contentCol.style.width = '0%';
					this.dom.contentCol.style.display = 'none';
					this.dom.editorCol.style.width = '100%';

				} else {

					this.dom.contentCol.style.width = this.lastContentWidth || '50%';
					this.dom.contentCol.style.display = 'flex';
					this.dom.editorCol.style.width = '';

				}

				this.setResizerToggleIcon( 'chevron-right' );
				this.dom.editorCol.style.display = 'flex';
				document.body.classList.remove( 'collapsed-workspace' );

			}

		}

		// Update UI State
		this.updateUI();

		this.searchManager.scrollToSearchMatch();

	}

	updateUI() {

		const activePage = this.pages[ this.currentPageIndex ];

		// Show/hide header buttons depending on hasCode or isPlaygroundActive
		const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
		const showHeaderToggles = activePage && ( activePage.hasCode || this.isPlaygroundActive );

		let showEditorToggle = showHeaderToggles;
		if ( isMobile && this.isPlaygroundActive ) {

			showEditorToggle = false;

		}

		this.dom.headerEditorToggle.style.display = showEditorToggle ? 'flex' : 'none';
		this.dom.headerPreviewToggle.style.display = showHeaderToggles ? 'flex' : 'none';
		this.dom.copyCodeBtnHeader.style.display = showHeaderToggles ? 'flex' : 'none';

		// Manage hResizer display
		if ( isMobile && this.isPlaygroundActive ) {

			this.dom.hResizer.style.display = 'none';
			this.dom.hResizerContainer.style.display = 'none';

		} else {

			if ( activePage ) {

				const hash = window.location.hash.substring( 1 );
				const isInitialPlayground = hash.startsWith( 'playground=' ) || hash.startsWith( 'playground/' );
				if ( ! activePage.hasCode && ! this.isPlaygroundActive && ! isInitialPlayground ) {

					this.dom.hResizer.style.display = 'none';
					this.dom.hResizerContainer.style.display = 'none';

				} else {

					this.dom.hResizer.style.display = 'block';
					this.dom.hResizerContainer.style.display = 'flex';

				}

			}

		}

		// TOC Active State
		const tocItems = this.dom.tocList.querySelectorAll( '.toc-btn' );
		tocItems.forEach( ( btn ) => {

			const pageId = btn.getAttribute( 'data-page-id' );
			if ( ! this.isPlaygroundActive && pageId && pageId === activePage.id ) {

				btn.classList.add( 'active' );

				// Automatically expand parent categories/folders if they are collapsed
				let parent = btn.parentElement;
				while ( parent && parent !== this.dom.tocList ) {

					if ( parent.classList.contains( 'toc-category-container' ) ) {

						parent.classList.remove( 'collapsed' );

					}

					parent = parent.parentElement;

				}

				// Scroll the active item into view within the sidebar
				btn.scrollIntoView( { behavior: 'smooth', block: 'center' } );

			} else {

				btn.classList.remove( 'active' );

			}

		} );

		this.renderPlaygroundTabs();

	}

	setupTOC( tree = this.pageTree, featuredPage = null, suggestion = null ) {

		if ( suggestion ) {

			this.dom.searchSuggestionContainer.innerHTML = `
				Did you mean: <a href="#" class="search-suggestion-link">${suggestion}</a>?
			`;
			this.dom.searchSuggestionContainer.style.display = 'flex';

			this.dom.searchSuggestionContainer.querySelector( '.search-suggestion-link' ).onclick = ( e ) => {

				e.preventDefault();
				this.dom.searchInput.value = suggestion;
				this.searchManager.performSearch( suggestion );
				this.searchManager.updateHashWithSearch( suggestion );
				this.dom.searchInput.focus();

			};

		} else {

			this.dom.searchSuggestionContainer.innerHTML = '';
			this.dom.searchSuggestionContainer.style.display = 'none';

		}

		this.dom.tocList.innerHTML = '';

		if ( tree.length === 0 && ! featuredPage && this.dom.searchInput.value.trim().length > 0 ) {

			const noResults = document.createElement( 'div' );
			noResults.className = 'toc-no-results';
			noResults.innerText = 'No results found';
			this.dom.tocList.appendChild( noResults );
			return;

		}

		// Helper function to recursively generate the DOM for a node
		const createTOCNode = ( node, level = 0 ) => {

			if ( node.isFolder ) {

				// Category/Folder container
				const container = document.createElement( 'div' );
				container.className = 'toc-category-container';
				const btn = document.createElement( 'button' );
				btn.className = 'toc-folder-btn';
				if ( level > 0 ) {

					btn.classList.add( 'nested-folder' );

				}

				if ( node.children.length === 0 ) {

					btn.innerHTML = `
						<span style="padding-left: ${ level * 0.75 }rem; display: inline-flex; align-items: center;">${node.title}</span>
					`;
					btn.disabled = true;

				} else {

					btn.innerHTML = `
						<span style="padding-left: ${ level * 0.75 }rem; display: inline-flex; align-items: center;">${node.title}</span>
						<i data-icon="chevron-down" class="toc-chevron"></i>
					`;

					btn.onclick = () => {

						if ( this.dom.searchInput.value.trim().length > 0 ) return;
						container.classList.toggle( 'collapsed' );

					};

				}

				container.appendChild( btn );

				if ( node.children.length > 0 ) {

					const pagesDiv = document.createElement( 'div' );
					pagesDiv.className = 'toc-category-pages';

					node.children.forEach( child => {

						pagesDiv.appendChild( createTOCNode( child, level + 1 ) );

					} );

					container.appendChild( pagesDiv );

				}

				return container;

			} else {

				if ( node.children.length > 0 ) {

					// Parent page
					const container = document.createElement( 'div' );
					container.className = 'toc-category-container';

					const wrapper = document.createElement( 'div' );
					wrapper.className = 'toc-item-wrapper';

					const btn = document.createElement( 'button' );
					btn.className = 'toc-btn toc-parent-link';
					btn.style.paddingLeft = '0.75rem';
					btn.style.justifyContent = 'space-between';
					btn.setAttribute( 'data-page-id', node.id );

					if ( level > 0 ) {

						btn.style.fontSize = '0.8rem';
						btn.style.opacity = '0.85';

					}

					btn.innerHTML = `
						<span style="padding-left: ${ level * 0.75 }rem; display: inline-flex; align-items: center;">${node.title}</span>
						<span class="toc-chevron-btn" style="display: inline-flex; align-items: center; padding: 0.2rem 0 0.2rem 0.5rem;">
							<i data-icon="chevron-down" class="toc-chevron"></i>
						</span>
					`;

					btn.querySelector( '.toc-chevron-btn' ).onclick = ( e ) => {

						e.stopPropagation();
						if ( this.dom.searchInput.value.trim().length > 0 ) return;
						container.classList.toggle( 'collapsed' );

					};

					btn.onclick = () => {

						const query = this.dom.searchInput.value.trim();
						const newHash = node.id + ( query ? '&q=' + encodeURIComponent( query ) : '' );
						const isSamePage = ( window.location.hash === `#${newHash}` );
						window.location.hash = newHash;
						if ( isSamePage ) {

							this.searchManager.scrollToSearchMatch();

						}

						if ( window.innerWidth < MOBILE_BREAKPOINT ) {

							this.toggleSidebar( false );

						}

					};

					wrapper.appendChild( btn );

					if ( node.searchSnippet ) {

						const snippetDiv = document.createElement( 'div' );
						snippetDiv.className = 'toc-search-snippet';
						snippetDiv.style.marginLeft = `${ ( level * 0.75 ) + 0.75 }rem`;
						snippetDiv.innerHTML = node.searchSnippet;
						snippetDiv.onclick = () => {

							const query = this.dom.searchInput.value.trim();
							const newHash = node.id + ( query ? '&q=' + encodeURIComponent( query ) : '' );
							const isSamePage = ( window.location.hash === `#${newHash}` );
							window.location.hash = newHash;
							if ( isSamePage ) {

								this.searchManager.scrollToSearchMatch();

							}

							if ( window.innerWidth < MOBILE_BREAKPOINT ) {

								this.toggleSidebar( false );

							}

						};

						wrapper.appendChild( snippetDiv );

					}

					container.appendChild( wrapper );

					const pagesDiv = document.createElement( 'div' );
					pagesDiv.className = 'toc-category-pages';

					node.children.forEach( child => {

						pagesDiv.appendChild( createTOCNode( child, level + 1 ) );

					} );

					container.appendChild( pagesDiv );
					return container;

				} else {

					// Leaf page
					const container = document.createElement( 'div' );
					container.className = 'toc-page-container';

					const wrapper = document.createElement( 'div' );
					wrapper.className = 'toc-item-wrapper';

					const btn = document.createElement( 'button' );
					btn.className = 'toc-btn';
					btn.style.paddingLeft = '0.75rem';
					btn.setAttribute( 'data-page-id', node.id );

					if ( level > 0 ) {

						btn.style.fontSize = '0.8rem';
						btn.style.opacity = '0.85';

					}

					btn.innerHTML = `
						<span style="padding-left: ${ level * 0.75 }rem; display: inline-flex; align-items: center;">${node.title}</span>
					`;

					btn.onclick = () => {

						const query = this.dom.searchInput.value.trim();
						const newHash = node.id + ( query ? '&q=' + encodeURIComponent( query ) : '' );
						const isSamePage = ( window.location.hash === `#${newHash}` );
						window.location.hash = newHash;
						if ( isSamePage ) {

							this.searchManager.scrollToSearchMatch();

						}

						if ( window.innerWidth < MOBILE_BREAKPOINT ) {

							this.toggleSidebar( false );

						}

					};

					wrapper.appendChild( btn );

					if ( node.searchSnippet ) {

						const snippetDiv = document.createElement( 'div' );
						snippetDiv.className = 'toc-search-snippet';
						snippetDiv.style.marginLeft = `${ ( level * 0.75 ) + 0.75 }rem`;
						snippetDiv.innerHTML = node.searchSnippet;
						snippetDiv.onclick = () => {

							const query = this.dom.searchInput.value.trim();
							const newHash = node.id + ( query ? '&q=' + encodeURIComponent( query ) : '' );
							const isSamePage = ( window.location.hash === `#${newHash}` );
							window.location.hash = newHash;
							if ( isSamePage ) {

								this.searchManager.scrollToSearchMatch();

							}

							if ( window.innerWidth < MOBILE_BREAKPOINT ) {

								this.toggleSidebar( false );

							}

						};

						wrapper.appendChild( snippetDiv );

					}

					container.appendChild( wrapper );
					return container;

				}

			}

		};

		if ( featuredPage ) {

			if ( ! featuredPage.searchSnippet && featuredPage.description ) {

				const query = this.dom.searchInput.value.trim();
				const queryTerms = query.toLowerCase().split( /\s+/ ).filter( t => t.length > 0 );
				const cleanText = this.searchManager.getCleanText( featuredPage.description );
				featuredPage.searchSnippet = this.searchManager.getSearchSnippet( cleanText, queryTerms, featuredPage.title );

			}

			let featuredTreeRoot = featuredPage;
			const path = featuredPage.path || [];
			for ( let i = path.length - 1; i >= 0; i -- ) {

				featuredTreeRoot = {
					title: path[ i ],
					isFolder: true,
					children: [ featuredTreeRoot ]
				};

			}

			this.dom.tocList.appendChild( createTOCNode( featuredTreeRoot, 0 ) );

		}

		tree.forEach( rootNode => {

			this.dom.tocList.appendChild( createTOCNode( rootNode, 0 ) );

		} );

		// Re-initialize Lucide icons to render the chevrons
		this.createIcons( this.dom.tocList );

	}

	toggleSidebar( force ) {

		this.isSidebarOpen = force !== undefined ? force : ! this.isSidebarOpen;
		if ( this.isSidebarOpen ) {

			this.dom.sidebar.classList.add( 'open' );
			this.dom.menuToggleMain.style.display = 'none';
			this.dom.headerSearchBtn.style.display = 'none';

		} else {

			this.dom.sidebar.classList.remove( 'open' );
			this.dom.menuToggleMain.style.display = 'flex';
			this.dom.headerSearchBtn.style.display = 'flex';
			this.openedViaHeaderSearch = false;

		}

	}

	setResizerToggleIcon( iconName ) {

		const hResizerToggle = this.dom.hResizerToggle;
		const currentIcon = hResizerToggle.querySelector( '[data-icon]' );
		if ( currentIcon && currentIcon.getAttribute( 'data-icon' ) === iconName ) return;
		hResizerToggle.innerHTML = `<i data-icon="${iconName}" style="width: 10px; height: 10px;"></i>`;
		this.createIcons( hResizerToggle );

	}


	setVResizerToggleIcon( iconName ) {

		const btn = this.dom.vResizerToggle;
		if ( ! btn ) return;
		const currentIcon = btn.querySelector( '[data-icon]' );
		if ( currentIcon && currentIcon.getAttribute( 'data-icon' ) === iconName ) return;
		btn.innerHTML = `<i data-icon="${iconName}" style="width: 10px; height: 10px;"></i>`;
		this.createIcons( btn );

	}

	setVResizerToggleInvertedIcon( iconName ) {

		const btn = this.dom.vResizerToggleInverted;
		if ( ! btn ) return;
		const currentIcon = btn.querySelector( '[data-icon]' );
		if ( currentIcon && currentIcon.getAttribute( 'data-icon' ) === iconName ) return;
		btn.innerHTML = `<i data-icon="${iconName}" style="width: 10px; height: 10px;"></i>`;
		this.createIcons( btn );

	}

	resetToOriginalCode( nodeName ) {

		const page = this.pages[ this.currentPageIndex ];
		if ( ! page ) return;

		if ( nodeName && page.modifiedCodes ) {

			delete page.modifiedCodes[ nodeName ];

		} else {

			delete page.modifiedCode;

		}

		const originalCode = ( nodeName && page.codes && page.codes[ nodeName ] !== undefined )
			? page.codes[ nodeName ]
			: page.code;

		if ( this.codeEditor ) {

			this.codeEditor.setValue( originalCode );
			this.runner.run( originalCode );

		}

	}

	async cleanAndFormatActiveTab() {

		await this.playgroundManager.cleanAndFormatActiveTab();

	}

	updateUndoRedoButtons() {

		this.historyManager.updateButtons();

	}

	toggleConsole( forceState ) {

		this.consoleManager.toggleConsole( forceState );

	}

	togglePlayground( active ) {

		this.playgroundManager.togglePlayground( active );

	}

	renderPlaygroundTabs() {

		this.playgroundManager.renderPlaygroundTabs();

	}

	runPlayground() {

		this.playgroundManager.runPlayground();

	}

	getDebugTarget() {

		return this.playgroundManager.getDebugTarget();

	}

	updateDebugWGSL() {

		this.playgroundManager.updateDebugWGSL();

	}

	animate( t ) {

		const page = this.pages[ this.currentPageIndex ];
		if ( ! page || ( ! page.hasCode && ! page.hasEmbed && ! this.isPlaygroundActive ) || ( ! page.hasEmbed && ! this.isPreviewVisible ) ) return;

		this.renderer.clear();

		this.runner.call( 'update', t );

	}

	createIcons( root = document ) {

		const elements = root.querySelectorAll( '[data-icon]' );
		elements.forEach( el => {

			const name = el.getAttribute( 'data-icon' );
			const svgEl = getSVG( name );
			if ( svgEl ) {

				for ( const attr of el.attributes ) {

					if ( attr.name !== 'data-icon' ) {

						svgEl.setAttribute( attr.name, attr.value );

					}

				}

				if ( el.id ) {

					svgEl.id = el.id;

				}

				el.replaceWith( svgEl );

			}

		} );

	}

	dispose() {

		this.resizeObserver.disconnect();

		window.removeEventListener( 'resize', this.onWindowResize );
		document.removeEventListener( 'pointerdown', this.onDocumentPointerDown );
		this.dom.contentArea.removeEventListener( 'scroll', this.onContentAreaScroll );
		window.removeEventListener( 'hashchange', this.onWindowHashChange );

		this.layoutManager.dispose();
		this.consoleManager.dispose();
		this.codeEditor.dispose();
		this.debugCodeEditor.dispose();

		this.readOnlyEditors.forEach( editor => editor.dispose() );
		this.readOnlyEditors = [];

		this.renderer.setAnimationLoop( null );
		this.renderer.dispose();
		this.webGLRenderer.dispose();

	}

}

export { Tour };
