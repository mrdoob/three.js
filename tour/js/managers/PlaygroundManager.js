import * as THREE from 'three';
import { CodeCompiler } from '../code/CodeCompiler.js';
import { compressString, decompressString } from '../utils/TourUtils.js';

class PlaygroundManager {

	constructor( tour ) {

		this.tour = tour;
		this.playgroundTabs = null;
		this.activePlaygroundTabName = null;

	}

	togglePlayground( active ) {

		const MOBILE_BREAKPOINT = 768;
		if ( this.tour.isPlaygroundActive === active ) return;

		this.tour.isPlaygroundActive = active;
		document.body.classList.toggle( 'playground-mode', active );
		this.tour.dom.playgroundBtn.classList.toggle( 'active', active );

		if ( active ) {

			if ( this.tour.renderer && this.tour.renderer.domElement.parentElement !== this.tour.dom.previewContainer ) {

				this.tour.dom.previewContainer.appendChild( this.tour.renderer.domElement );

			}

			if ( this.tour.resizeObserver ) {

				this.tour.resizeObserver.disconnect();
				this.tour.resizeObserver.observe( this.tour.dom.previewContainer );

			}

			this.tour.isPreviewVisible = true;
			document.body.classList.remove( 'preview-hidden' );

			if ( window.innerWidth < MOBILE_BREAKPOINT ) {

				// Mobile layout: go to workspace-editor mode
				const editorWorkspace = document.querySelector( '.editor-workspace' );
				editorWorkspace.insertBefore( this.tour.dom.codeContainer, this.tour.dom.debugContainer );
				editorWorkspace.appendChild( this.tour.dom.editorConsole );

				document.body.classList.remove( 'collapsed-workspace' );
				this.tour.dom.contentCol.style.width = '0%';
				this.tour.dom.contentCol.style.display = 'none';
				this.tour.dom.editorCol.style.width = '100%';
				this.tour.dom.editorCol.style.display = 'flex';
				this.tour.dom.vResizer.style.display = '';
				this.tour.dom.previewSection.style.height = '';
				this.tour.dom.previewSection.style.flex = '';
				this.tour.dom.debugContainer.style.display = 'none';

			} else {

				// Desktop layout: code editor on the left (replacing contentArea), preview taking top half of right column, debug container taking bottom half
				this.tour.dom.contentArea.style.display = 'none';
				this.tour.dom.contentCol.appendChild( this.tour.dom.codeContainer );
				this.tour.dom.contentCol.appendChild( this.tour.dom.editorConsole );
				this.tour.dom.vResizer.style.display = 'block';
				this.tour.dom.previewSection.style.height = '50%';
				this.tour.dom.previewSection.style.flex = '';
				this.tour.dom.codeContainer.style.height = '';
				this.tour.dom.debugContainer.style.display = 'flex';

				// Set column widths to default (50/50) or keep current horizontal split
				if ( this.tour.isEditorCollapsed ) {

					document.body.classList.add( 'collapsed-workspace' );
					this.tour.dom.hResizer.classList.add( 'collapsed' );
					this.tour.setResizerToggleIcon( 'chevron-left' );
					this.tour.dom.contentCol.style.width = '100%';
					this.tour.dom.contentCol.style.display = 'flex';
					this.tour.dom.editorCol.style.width = '0%';
					this.tour.dom.editorCol.style.display = 'flex';

				} else {

					document.body.classList.remove( 'collapsed-workspace' );
					this.tour.dom.hResizer.classList.remove( 'collapsed' );
					this.tour.setResizerToggleIcon( 'chevron-right' );
					this.tour.dom.contentCol.style.width = '50%';
					this.tour.dom.contentCol.style.display = 'flex';
					this.tour.dom.editorCol.style.width = '50%';
					this.tour.dom.editorCol.style.display = 'flex';

				}

				this.updateDebugWGSL();

			}

			if ( this.tour.codeEditor ) this.tour.codeEditor.layout();

		} else {

			if ( ! this.tour.isContentRendered ) {

				this.tour.renderPage( this.tour.currentPageIndex || 0 );

			}

			this.tour.dom.debugContainer.style.display = 'none';
			this.tour.dom.contentArea.style.display = '';

			if ( window.innerWidth < MOBILE_BREAKPOINT ) {

				// Restore mobile layout (reader mode by default)
				this.tour.isEditorCollapsed = true;
				document.body.classList.add( 'collapsed-workspace' );
				this.tour.dom.contentCol.style.width = '100%';
				this.tour.dom.contentCol.style.display = 'flex';
				this.tour.dom.editorCol.style.width = '0%';
				this.tour.dom.editorCol.style.display = 'none';

			} else {

				// Restore desktop layout
				this.tour.dom.contentArea.style.display = '';
				const editorWorkspace = document.querySelector( '.editor-workspace' );
				editorWorkspace.insertBefore( this.tour.dom.codeContainer, this.tour.dom.debugContainer );
				editorWorkspace.appendChild( this.tour.dom.editorConsole );
				this.tour.dom.vResizer.style.display = '';
				this.tour.dom.previewSection.style.height = '';
				this.tour.dom.previewSection.style.flex = '';
				this.tour.dom.codeContainer.style.height = '';

				if ( this.tour.isEditorCollapsed ) {

					document.body.classList.add( 'collapsed-workspace' );
					this.tour.dom.hResizer.classList.add( 'collapsed' );
					this.tour.setResizerToggleIcon( 'chevron-left' );
					this.tour.dom.contentCol.style.width = '100%';
					this.tour.dom.editorCol.style.width = '0%';

				} else {

					document.body.classList.remove( 'collapsed-workspace' );
					this.tour.dom.hResizer.classList.remove( 'collapsed' );
					this.tour.setResizerToggleIcon( 'chevron-right' );
					this.tour.dom.contentCol.style.width = this.tour.lastContentWidth || '50%';
					this.tour.dom.editorCol.style.width = '';

				}

			}

			if ( this.tour.codeEditor ) this.tour.codeEditor.layout();

		}

		this.tour.updateUI();

	}

	async loadPlaygroundFromHash( hash ) {

		const base64Str = hash.replace( /^playground[=\/]/, '' ).split( '&' )[ 0 ];
		let decodedCode = '';
		try {

			decodedCode = await decompressString( base64Str );

		} catch ( e ) {

			console.error( 'Failed to decode playground code from hash:', e );
			return;

		}

		// Enable playground layout
		this.togglePlayground( true );

		this.tour.historyManager.pushState( hash );

		let decodedTabs = null;
		try {

			const parsed = JSON.parse( decodedCode );
			if ( parsed && Array.isArray( parsed.tabs ) && parsed.tabs.length > 0 ) {

				decodedTabs = parsed.tabs;

			}

		} catch {
			// Not JSON, fallback to single Main tab
		}

		if ( decodedTabs ) {

			let changedTabName = null;
			if ( this.playgroundTabs ) {

				for ( const newTab of decodedTabs ) {

					const cleanNewName = newTab.name.toLowerCase();
					const oldTab = this.playgroundTabs.find( t => t.name === cleanNewName );
					if ( ! oldTab || oldTab.code !== newTab.code ) {

						changedTabName = cleanNewName;
						break;

					}

				}

			}

			this.playgroundTabs = decodedTabs.map( t => ( { ...t, name: t.name.toLowerCase() } ) );
			if ( changedTabName ) {

				this.activePlaygroundTabName = changedTabName;

			} else if ( ! this.activePlaygroundTabName || ! this.playgroundTabs.some( t => t.name === this.activePlaygroundTabName ) ) {

				this.activePlaygroundTabName = this.playgroundTabs[ 0 ].name;

			}

		} else {

			this.playgroundTabs = [ { name: 'main', code: decodedCode } ];
			this.activePlaygroundTabName = 'main';

		}

		// Render the playground tabs UI
		this.renderPlaygroundTabs();

		const activeTab = this.playgroundTabs.find( t => t.name === this.activePlaygroundTabName ) || this.playgroundTabs[ 0 ];

		if ( this.tour.codeEditor ) {

			const currentVal = this.tour.codeEditor.getValue();
			if ( currentVal !== activeTab.code ) {

				this.tour.codeEditor.setValue( activeTab.code );

			}

		}

		this.runPlayground();

	}

	renderPlaygroundTabs() {

		if ( ! this.tour.isPlaygroundActive ) {

			this.tour.dom.tabsBar.style.display = 'none';
			return;

		}

		this.tour.dom.tabsBar.style.display = 'flex';
		this.tour.dom.tabsBar.innerHTML = '';

		if ( ! this.playgroundTabs ) {

			this.playgroundTabs = [ { name: 'main', code: '// Play here!\n' } ];
			this.activePlaygroundTabName = 'main';

		}

		this.playgroundTabs.forEach( ( tab ) => {

			const tabEl = document.createElement( 'div' );
			tabEl.className = 'playground-tab';
			if ( tab.name === this.activePlaygroundTabName ) {

				tabEl.classList.add( 'active' );

			}

			const labelEl = document.createElement( 'span' );
			labelEl.className = 'playground-tab-label';
			labelEl.textContent = tab.name;
			tabEl.appendChild( labelEl );

			if ( tab.name !== 'main' ) {

				const closeEl = document.createElement( 'span' );
				closeEl.className = 'playground-tab-close';
				closeEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 11px; height: 11px; display: block;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
				closeEl.title = 'Delete tab';
				closeEl.onclick = ( e ) => {

					e.stopPropagation();
					this.closePlaygroundTab( tab.name );

				};

				tabEl.appendChild( closeEl );

			}

			tabEl.onclick = () => {

				this.activatePlaygroundTab( tab.name );

			};

			labelEl.ondblclick = ( e ) => {

				e.stopPropagation();
				this.startRenameTab( tab.name, labelEl );

			};

			this.tour.dom.tabsBar.appendChild( tabEl );

		} );

		const addBtn = document.createElement( 'div' );
		addBtn.className = 'playground-tab-add';
		addBtn.innerHTML = '+';
		addBtn.title = 'Add new tab';
		addBtn.onclick = () => {

			this.addNewPlaygroundTab();

		};

		this.tour.dom.tabsBar.appendChild( addBtn );

		// Create Clean & Format button
		const cleanBtn = document.createElement( 'button' );
		cleanBtn.className = 'playground-history-btn playground-clean-btn';
		cleanBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; display: block;"><path d="m19 2 3 3L6 21l-3-3L19 2Z"/><path d="M11.5 6.5 13 8M16 12h5M12 16h3M18 17.5 21 19M18 8.5 21 7"/></svg>';
		cleanBtn.title = 'Clean imports & Format code';
		cleanBtn.onclick = async ( e ) => {

			e.stopPropagation();
			await this.cleanAndFormatActiveTab();

		};

		// Create Undo & Redo buttons
		const undoBtn = document.createElement( 'button' );
		undoBtn.className = 'playground-history-btn playground-undo-btn';
		undoBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; display: block;"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>';
		undoBtn.title = 'Undo';
		undoBtn.onclick = ( e ) => {

			e.stopPropagation();
			this.undoPlayground();

		};

		const redoBtn = document.createElement( 'button' );
		redoBtn.className = 'playground-history-btn playground-redo-btn';
		redoBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; display: block;"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>';
		redoBtn.title = 'Redo';
		redoBtn.onclick = ( e ) => {

			e.stopPropagation();
			this.redoPlayground();

		};

		this.tour.dom.tabsBar.appendChild( cleanBtn );
		this.tour.dom.tabsBar.appendChild( undoBtn );
		this.tour.dom.tabsBar.appendChild( redoBtn );

		this.updateUndoRedoButtons();

	}

	activatePlaygroundTab( name ) {

		if ( this.activePlaygroundTabName === name ) return;

		const activeTab = this.playgroundTabs.find( t => t.name === this.activePlaygroundTabName );
		if ( activeTab && this.tour.codeEditor ) {

			activeTab.code = this.tour.codeEditor.getValue();

		}

		this.activePlaygroundTabName = name;

		const newActiveTab = this.playgroundTabs.find( t => t.name === this.activePlaygroundTabName );
		if ( newActiveTab && this.tour.codeEditor ) {

			const currentVal = this.tour.codeEditor.getValue();
			if ( currentVal !== newActiveTab.code ) {

				this.tour.codeEditor.setValue( newActiveTab.code );

			}

		}

		this.renderPlaygroundTabs();
		this.runPlayground();

		this.updatePlaygroundHash();

	}

	addNewPlaygroundTab() {

		let counter = 1;
		let newTabName = '';
		while ( true ) {

			newTabName = `script${counter}`;
			if ( ! this.playgroundTabs.some( t => t.name === newTabName ) ) {

				break;

			}

			counter ++;

		}

		const newTabCode = `// Script: ${newTabName}\nexport { };\n`;

		const activeTab = this.playgroundTabs.find( t => t.name === this.activePlaygroundTabName );
		if ( activeTab && this.tour.codeEditor ) {

			activeTab.code = this.tour.codeEditor.getValue();

		}

		this.playgroundTabs.push( { name: newTabName, code: newTabCode } );
		this.activePlaygroundTabName = newTabName;

		if ( this.tour.codeEditor ) {

			this.tour.codeEditor.setValue( newTabCode );

		}

		this.renderPlaygroundTabs();
		this.runPlayground();

		this.updatePlaygroundHash();

	}

	closePlaygroundTab( name ) {

		const index = this.playgroundTabs.findIndex( t => t.name === name );
		if ( index === - 1 ) return;

		const activeTab = this.playgroundTabs.find( t => t.name === this.activePlaygroundTabName );
		if ( activeTab && this.tour.codeEditor ) {

			activeTab.code = this.tour.codeEditor.getValue();

		}

		this.playgroundTabs.splice( index, 1 );

		if ( this.activePlaygroundTabName === name ) {

			this.activePlaygroundTabName = this.playgroundTabs[ Math.max( 0, index - 1 ) ].name;

		}

		const newActiveTab = this.playgroundTabs.find( t => t.name === this.activePlaygroundTabName ) || this.playgroundTabs[ 0 ];
		if ( newActiveTab && this.tour.codeEditor ) {

			const currentVal = this.tour.codeEditor.getValue();
			if ( currentVal !== newActiveTab.code ) {

				this.tour.codeEditor.setValue( newActiveTab.code );

			}

		}

		this.renderPlaygroundTabs();
		this.runPlayground();

		this.updatePlaygroundHash();

	}

	startRenameTab( name, labelEl ) {

		if ( name === 'main' ) return;

		const currentName = name;
		const input = document.createElement( 'input' );
		input.type = 'text';
		input.className = 'playground-tab-rename-input';
		input.value = currentName;

		const parent = labelEl.parentNode;
		parent.replaceChild( input, labelEl );
		input.focus();
		input.select();

		let finished = false;
		const finishRename = () => {

			if ( finished ) return;
			finished = true;

			const newName = input.value.trim().toLowerCase();
			const isValidIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test( newName );
			const isUnique = ! this.playgroundTabs.some( t => t.name === newName && t.name !== currentName );

			if ( newName && isValidIdentifier && isUnique ) {

				const activeTab = this.playgroundTabs.find( t => t.name === this.activePlaygroundTabName );
				if ( activeTab && this.tour.codeEditor ) {

					activeTab.code = this.tour.codeEditor.getValue();

				}

				const tabToRename = this.playgroundTabs.find( t => t.name === currentName );
				if ( tabToRename ) {

					tabToRename.name = newName;

				}

				if ( this.activePlaygroundTabName === currentName ) {

					this.activePlaygroundTabName = newName;

				}

				this.renderPlaygroundTabs();
				this.runPlayground();
				this.updatePlaygroundHash();

			} else {

				parent.replaceChild( labelEl, input );

			}

		};

		input.onkeydown = ( e ) => {

			if ( e.key === 'Enter' ) {

				finishRename();

			} else if ( e.key === 'Escape' ) {

				finished = true;
				parent.replaceChild( labelEl, input );

			}

		};

		input.onblur = () => {

			finishRename();

		};

	}

	async updatePlaygroundHash() {

		const encoded = await compressString( JSON.stringify( {
			tabs: this.playgroundTabs
		} ) );
		const release = THREE.RELEASE || THREE.REVISION;
		const newHash = 'playground=' + encoded + ( release ? '&release=' + release : '' );
		window.location.hash = newHash;

	}

	undoPlayground() {

		this.tour.historyManager.undo();

	}

	redoPlayground() {

		this.tour.historyManager.redo();

	}

	updateUndoRedoButtons() {

		this.tour.historyManager.updateButtons();

	}

	async cleanAndFormatActiveTab() {

		if ( ! this.tour.codeEditor ) return;

		const code = this.tour.codeEditor.getValue();
		const formatted = await CodeCompiler.format( code );

		// Set the new formatted value in the editor and update state/hash
		const currentVal = this.tour.codeEditor.getValue();
		if ( currentVal !== formatted ) {

			this.tour.codeEditor.format( formatted );

			const activeTab = this.playgroundTabs.find( t => t.name === this.activePlaygroundTabName );
			if ( activeTab ) {

				activeTab.code = formatted;

			}

			this.runPlayground();
			this.updatePlaygroundHash();

		}

	}

	runPlayground() {

		if ( ! this.playgroundTabs ) return;

		const mainTab = this.playgroundTabs.find( t => t.name === 'main' ) || this.playgroundTabs[ 0 ];

		for ( const key of Object.keys( this.tour.runner.scripts ) ) {

			if ( this.tour.runner.scripts[ key ].url === null && key !== '__main__' ) {

				delete this.tour.runner.scripts[ key ];

			}

		}

		this.playgroundTabs.forEach( tab => {

			if ( tab.name !== 'main' ) {

				this.tour.runner.scripts[ tab.name ] = {
					url: null,
					text: tab.code,
					instance: null,
					promise: null
				};

			}

		} );

		this.tour.runner.run( mainTab.code );

	}

	getDebugTarget() {

		// 1. Check main script
		const mainScript = this.tour.runner.scripts[ '__main__' ];
		if ( mainScript && mainScript.instance && typeof mainScript.instance.debug === 'function' ) {

			return mainScript.instance.debug();

		}

		// 2. Check other scripts
		for ( const scriptName of this.tour.runner.activeScriptNames ) {

			const script = this.tour.runner.scripts[ scriptName ];
			if ( script && script.instance && typeof script.instance.debug === 'function' ) {

				return script.instance.debug();

			}

		}

		return null;

	}

	updateDebugWGSL() {

		if ( ! this.tour.isPlaygroundActive ) return;

		if ( ! this.tour.debugCodeEditor ) return;

		const debugData = this.getDebugTarget();
		if ( ! debugData ) {

			this.tour.debugCodeEditor.setValue( 'No debug() function exported or debug target object found.' );
			return;

		}

		let scene, camera, object;
		if ( debugData.scene && debugData.camera && debugData.object ) {

			scene = debugData.scene;
			camera = debugData.camera;
			object = debugData.object;

		} else {

			object = debugData;
			scene = this.tour.runner.env.scene || this.tour.scene;
			camera = this.tour.runner.env.camera || this.tour.camera;

		}

		if ( ! scene || ! camera || ! object ) {

			this.tour.debugCodeEditor.setValue( 'Invalid debug data. Ensure scene, camera, and object are provided.' );
			return;

		}

		const targetRenderer = this.tour.debugLanguage === 'GLSL' ? this.tour.webGLRenderer : this.tour.renderer;

		if ( targetRenderer && targetRenderer.debug && typeof targetRenderer.debug.getShaderAsync === 'function' ) {

			targetRenderer.debug.getShaderAsync( scene, camera, object )
				.then( ( shader ) => {

					const code = this.tour.debugStage === 'vertex'
						? ( shader.vertexShader || 'No vertex shader generated.' )
						: ( shader.fragmentShader || 'No fragment shader generated.' );

					this.tour.debugCodeEditor.setValue( code );

				} )
				.catch( ( err ) => {

					this.tour.debugCodeEditor.setValue( 'Error retrieving shader: ' + err.message );

				} );

		} else {

			this.tour.debugCodeEditor.setValue( 'WebGPURenderer debug.getShaderAsync is not available.' );

		}

	}

}

export { PlaygroundManager };
