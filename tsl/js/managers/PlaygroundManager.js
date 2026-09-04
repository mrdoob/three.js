import * as THREE from 'three';
import { CodeCompiler } from '../code/CodeCompiler.js';
import { parseScript, isStandardModule, resolvePath } from '../code/CodeRunner.js';
import { compressString, decompressString } from '../utils/GuideUtils.js';

class PlaygroundManager {

	constructor( guide ) {

		this.guide = guide;
		this.playgroundTabs = null;
		this.activePlaygroundTabName = null;
		this.currentExampleName = null;
		this.initialTabsSnapshot = null;

	}

	togglePlayground( active ) {

		const MOBILE_BREAKPOINT = 768;
		if ( this.guide.isPlaygroundActive === active ) return;

		this.guide.isPlaygroundActive = active;
		document.body.classList.toggle( 'playground-mode', active );
		this.guide.dom.playgroundBtn.classList.toggle( 'active', active );

		if ( active ) {

			if ( this.guide.renderer && this.guide.renderer.domElement.parentElement !== this.guide.dom.previewContainer ) {

				this.guide.dom.previewContainer.appendChild( this.guide.renderer.domElement );

			}

			if ( this.guide.resizeObserver ) {

				this.guide.resizeObserver.disconnect();
				this.guide.resizeObserver.observe( this.guide.dom.previewContainer );

			}

			this.guide.isPreviewVisible = true;
			document.body.classList.remove( 'preview-hidden' );

			if ( window.innerWidth < MOBILE_BREAKPOINT ) {

				// Mobile layout: go to workspace-editor mode
				const editorWorkspace = document.querySelector( '.editor-workspace' );
				editorWorkspace.insertBefore( this.guide.dom.codeContainer, this.guide.dom.debugContainer );
				editorWorkspace.appendChild( this.guide.dom.editorConsole );

				document.body.classList.remove( 'collapsed-workspace' );
				this.guide.dom.contentCol.style.width = '0%';
				this.guide.dom.contentCol.style.display = 'none';
				this.guide.dom.editorCol.style.width = '100%';
				this.guide.dom.editorCol.style.display = 'flex';
				this.guide.dom.vResizer.style.display = '';
				this.guide.dom.previewSection.style.height = '';
				this.guide.dom.previewSection.style.flex = '';
				this.guide.dom.debugContainer.style.display = 'none';

			} else {

				// Desktop layout: code editor on the left (replacing contentArea), preview taking top half of right column, debug container taking bottom half
				this.guide.dom.contentArea.style.display = 'none';
				this.guide.dom.contentCol.appendChild( this.guide.dom.codeContainer );
				this.guide.dom.contentCol.appendChild( this.guide.dom.editorConsole );
				this.guide.dom.vResizer.style.display = 'block';
				this.guide.dom.previewSection.style.height = '50%';
				this.guide.dom.previewSection.style.flex = '';
				this.guide.dom.codeContainer.style.height = '';
				this.guide.dom.debugContainer.style.display = 'flex';

				// Set column widths to default (50/50) or keep current horizontal split
				if ( this.guide.isEditorCollapsed ) {

					document.body.classList.add( 'collapsed-workspace' );
					this.guide.dom.hResizer.classList.add( 'collapsed' );
					this.guide.setResizerToggleIcon( 'chevron-left' );
					this.guide.dom.contentCol.style.width = '100%';
					this.guide.dom.contentCol.style.display = 'flex';
					this.guide.dom.editorCol.style.width = '0%';
					this.guide.dom.editorCol.style.display = 'flex';

				} else {

					document.body.classList.remove( 'collapsed-workspace' );
					this.guide.dom.hResizer.classList.remove( 'collapsed' );
					this.guide.setResizerToggleIcon( 'chevron-right' );
					this.guide.dom.contentCol.style.width = '50%';
					this.guide.dom.contentCol.style.display = 'flex';
					this.guide.dom.editorCol.style.width = '50%';
					this.guide.dom.editorCol.style.display = 'flex';

				}

				this.updateDebugWGSL();

			}

			if ( this.guide.codeEditor ) this.guide.codeEditor.layout();

		} else {

			if ( ! this.guide.isContentRendered ) {

				this.guide.renderPage( this.guide.currentPageIndex || 0 );

			}

			this.guide.dom.debugContainer.style.display = 'none';
			this.guide.dom.contentArea.style.display = '';

			if ( window.innerWidth < MOBILE_BREAKPOINT ) {

				// Restore mobile layout (reader mode by default)
				this.guide.isEditorCollapsed = true;
				document.body.classList.add( 'collapsed-workspace' );
				this.guide.dom.contentCol.style.width = '100%';
				this.guide.dom.contentCol.style.display = 'flex';
				this.guide.dom.editorCol.style.width = '0%';
				this.guide.dom.editorCol.style.display = 'none';

			} else {

				// Restore desktop layout
				this.guide.dom.contentArea.style.display = '';
				const editorWorkspace = document.querySelector( '.editor-workspace' );
				editorWorkspace.insertBefore( this.guide.dom.codeContainer, this.guide.dom.debugContainer );
				editorWorkspace.appendChild( this.guide.dom.editorConsole );
				this.guide.dom.vResizer.style.display = '';
				this.guide.dom.previewSection.style.height = '';
				this.guide.dom.previewSection.style.flex = '';
				this.guide.dom.codeContainer.style.height = '';

				this.guide.layoutManager.updateVResizerIcons( '' );

				if ( this.guide.isEditorCollapsed ) {

					document.body.classList.add( 'collapsed-workspace' );
					this.guide.dom.hResizer.classList.add( 'collapsed' );
					this.guide.setResizerToggleIcon( 'chevron-left' );
					this.guide.dom.contentCol.style.width = '100%';
					this.guide.dom.editorCol.style.width = '0%';

				} else {

					document.body.classList.remove( 'collapsed-workspace' );
					this.guide.dom.hResizer.classList.remove( 'collapsed' );
					this.guide.setResizerToggleIcon( 'chevron-right' );
					this.guide.dom.contentCol.style.width = this.guide.lastContentWidth || '50%';
					this.guide.dom.editorCol.style.width = '';

				}

			}

			if ( this.guide.codeEditor ) {

				this.guide.codeEditor.setReadOnly( false );
				this.guide.codeEditor.layout();

			}

		}

		this.guide.updateUI();

	}

	async loadPlaygroundFromHash( hash ) {

		this.guide.lastHandledHash = hash;

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

		this.guide.historyManager.pushState( hash );

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

		if ( ! this.initialTabsSnapshot ) {

			this.initialTabsSnapshot = JSON.stringify( this.playgroundTabs );

		}

		// Render the playground tabs UI
		this.renderPlaygroundTabs();

		const activeTab = this.playgroundTabs.find( t => t.name === this.activePlaygroundTabName ) || this.playgroundTabs[ 0 ];

		if ( this.guide.codeEditor ) {

			this.guide.codeEditor.setReadOnly( !! activeTab.readOnly );

			const currentVal = this.guide.codeEditor.getValue();
			if ( currentVal !== activeTab.code ) {

				this.guide.codeEditor.setValue( activeTab.code );

			}

		}

		this.runPlayground();

	}

	renderPlaygroundTabs() {

		if ( ! this.guide.isPlaygroundActive ) {

			this.guide.dom.tabsBar.style.display = 'none';
			return;

		}

		this.guide.dom.tabsBar.style.display = 'flex';
		this.guide.dom.tabsBar.innerHTML = '';

		const scrollWrapper = document.createElement( 'div' );
		scrollWrapper.className = 'playground-tabs-scroll-wrapper';

		const tabsScrollContainer = document.createElement( 'div' );
		tabsScrollContainer.className = 'playground-tabs-scroll-container';

		const customScrollbar = document.createElement( 'div' );
		customScrollbar.className = 'playground-custom-scrollbar';
		const thumb = document.createElement( 'div' );
		thumb.className = 'playground-custom-scrollbar-thumb';
		customScrollbar.appendChild( thumb );

		const updateScrollThumb = () => {

			const { clientWidth, scrollWidth, scrollLeft } = tabsScrollContainer;
			if ( scrollWidth <= clientWidth + 2 ) {

				customScrollbar.style.display = 'none';
				return;

			}

			customScrollbar.style.display = 'block';
			const thumbWidth = Math.max( 28, ( clientWidth / scrollWidth ) * clientWidth );
			const maxScroll = scrollWidth - clientWidth;
			const maxThumbLeft = clientWidth - thumbWidth;
			const thumbLeft = ( scrollLeft / maxScroll ) * maxThumbLeft;

			thumb.style.width = `${thumbWidth}px`;
			thumb.style.transform = `translateX(${thumbLeft}px)`;

		};

		tabsScrollContainer.addEventListener( 'scroll', updateScrollThumb );

		tabsScrollContainer.addEventListener( 'wheel', ( e ) => {

			if ( e.deltaY !== 0 ) {

				e.preventDefault();
				tabsScrollContainer.scrollLeft += e.deltaY;

			}

		}, { passive: false } );

		// Dragging thumb
		let isDraggingThumb = false;
		let startX = 0;
		let startScrollLeft = 0;

		thumb.onpointerdown = ( e ) => {

			e.stopPropagation();
			e.preventDefault();
			isDraggingThumb = true;
			startX = e.clientX;
			startScrollLeft = tabsScrollContainer.scrollLeft;
			thumb.classList.add( 'dragging' );
			thumb.setPointerCapture( e.pointerId );

		};

		thumb.onpointermove = ( e ) => {

			if ( ! isDraggingThumb ) return;
			const dx = e.clientX - startX;
			const { clientWidth, scrollWidth } = tabsScrollContainer;
			const thumbWidth = thumb.offsetWidth;
			const maxThumbLeft = clientWidth - thumbWidth;
			const maxScroll = scrollWidth - clientWidth;
			if ( maxThumbLeft > 0 ) {

				const scrollDelta = ( dx / maxThumbLeft ) * maxScroll;
				tabsScrollContainer.scrollLeft = startScrollLeft + scrollDelta;

			}

		};

		thumb.onpointerup = ( e ) => {

			isDraggingThumb = false;
			thumb.classList.remove( 'dragging' );
			try {

				thumb.releasePointerCapture( e.pointerId );

			} catch ( _ ) {}

		};

		customScrollbar.onclick = ( e ) => {

			if ( e.target === thumb ) return;
			const rect = customScrollbar.getBoundingClientRect();
			const clickX = e.clientX - rect.left;
			const { clientWidth, scrollWidth } = tabsScrollContainer;
			const ratio = clickX / clientWidth;
			tabsScrollContainer.scrollLeft = ratio * ( scrollWidth - clientWidth );

		};

		if ( ! this.playgroundTabs ) {

			this.playgroundTabs = [ { name: 'main', code: '// Play here!\n' } ];
			this.activePlaygroundTabName = 'main';
			this.initialTabsSnapshot = JSON.stringify( this.playgroundTabs );

		}

		let draggedTabName = null;

		this.playgroundTabs.forEach( ( tab ) => {

			const tabEl = document.createElement( 'div' );
			tabEl.className = 'playground-tab';
			tabEl.draggable = true;

			if ( tab.name === this.activePlaygroundTabName ) {

				tabEl.classList.add( 'active' );

			}

			if ( tab.readOnly ) {

				tabEl.classList.add( 'read-only' );

				const lockEl = document.createElement( 'span' );
				lockEl.className = 'playground-tab-lock-icon';
				lockEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 11px; height: 11px; display: block;"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
				lockEl.title = 'Read-only';
				tabEl.appendChild( lockEl );

			}

			const labelEl = document.createElement( 'span' );
			labelEl.className = 'playground-tab-label';
			labelEl.textContent = tab.name;
			tabEl.appendChild( labelEl );

			if ( tab.name !== 'main' ) {

				const closeEl = document.createElement( 'span' );
				closeEl.className = 'playground-tab-close';
				closeEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; display: block;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
				closeEl.title = 'Close tab';
				closeEl.onclick = ( e ) => {

					e.stopPropagation();
					this.closePlaygroundTab( tab.name );

				};

				tabEl.appendChild( closeEl );

			}

			let isDragging = false;

			tabEl.ondragstart = ( e ) => {

				draggedTabName = tab.name;
				isDragging = true;
				tabEl.classList.add( 'dragging' );
				e.dataTransfer.effectAllowed = 'move';
				e.dataTransfer.setData( 'text/plain', tab.name );

			};

			tabEl.ondragend = () => {

				tabEl.classList.remove( 'dragging' );
				this.guide.dom.tabsBar.querySelectorAll( '.playground-tab' ).forEach( el => {

					el.classList.remove( 'drag-over-left', 'drag-over-right' );

				} );
				draggedTabName = null;
				setTimeout( () => {

					isDragging = false;

				}, 0 );

			};

			tabEl.ondragover = ( e ) => {

				e.preventDefault();
				e.dataTransfer.dropEffect = 'move';

				if ( draggedTabName && draggedTabName !== tab.name ) {

					const rect = tabEl.getBoundingClientRect();
					const midX = rect.left + rect.width / 2;

					if ( e.clientX < midX ) {

						tabEl.classList.add( 'drag-over-left' );
						tabEl.classList.remove( 'drag-over-right' );

					} else {

						tabEl.classList.add( 'drag-over-right' );
						tabEl.classList.remove( 'drag-over-left' );

					}

				}

			};

			tabEl.ondragleave = () => {

				tabEl.classList.remove( 'drag-over-left', 'drag-over-right' );

			};

			tabEl.ondrop = ( e ) => {

				e.preventDefault();
				tabEl.classList.remove( 'drag-over-left', 'drag-over-right' );

				const sourceName = e.dataTransfer.getData( 'text/plain' ) || draggedTabName;
				if ( ! sourceName || sourceName === tab.name ) return;

				const fromIndex = this.playgroundTabs.findIndex( t => t.name === sourceName );
				let toIndex = this.playgroundTabs.findIndex( t => t.name === tab.name );

				if ( fromIndex === - 1 || toIndex === - 1 ) return;

				const rect = tabEl.getBoundingClientRect();
				const midX = rect.left + rect.width / 2;
				const isRight = e.clientX >= midX;

				const [ movedTab ] = this.playgroundTabs.splice( fromIndex, 1 );

				toIndex = this.playgroundTabs.findIndex( t => t.name === tab.name );
				if ( isRight ) {

					toIndex ++;

				}

				this.playgroundTabs.splice( toIndex, 0, movedTab );

				this.renderPlaygroundTabs();
				this.updatePlaygroundHash( true );

			};

			tabEl.onclick = () => {

				if ( ! isDragging ) {

					this.activatePlaygroundTab( tab.name );

				}

			};

			if ( ! tab.readOnly ) {

				labelEl.ondblclick = ( e ) => {

					e.stopPropagation();
					this.startRenameTab( tab.name, labelEl );

				};

			}

			tabsScrollContainer.appendChild( tabEl );

		} );

		const addBtn = document.createElement( 'div' );
		addBtn.className = 'playground-tab-add';
		addBtn.innerHTML = '+';
		addBtn.title = 'Add new tab';
		addBtn.onclick = () => {

			this.addNewPlaygroundTab();

		};

		tabsScrollContainer.appendChild( addBtn );

		scrollWrapper.appendChild( tabsScrollContainer );
		scrollWrapper.appendChild( customScrollbar );

		// Create Actions toolbar container pinned to the right
		const actionsContainer = document.createElement( 'div' );
		actionsContainer.className = 'playground-tabs-actions';

		// Create Projects button
		const projectsBtn = document.createElement( 'button' );
		projectsBtn.className = 'playground-tab-btn playground-projects-btn';
		projectsBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; display: block;"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><polyline points="10 11 8 13 10 15"/><polyline points="14 11 16 13 14 15"/></svg>';
		projectsBtn.title = 'Playground Projects (Save, Load & JSON)';
		projectsBtn.onclick = ( e ) => {

			e.stopPropagation();
			this.guide.projectsManager.openProjectsModal();

		};

		// Create Imported Files button
		const importedFilesBtn = document.createElement( 'button' );
		importedFilesBtn.className = 'playground-tab-btn playground-imported-files-btn';
		importedFilesBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; display: block;"><path d="M10 12.5 8 15l2 2.5"/><path d="m14 12.5 2 2.5-2 2.5"/><path d="M14 2v6h6"/><path d="M4 15V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1"/></svg>';
		importedFilesBtn.title = 'Imported Files (Read-only)';
		importedFilesBtn.onclick = async ( e ) => {

			e.stopPropagation();
			await this.showImportedFiles();

		};

		// Create Clean & Format button
		const cleanBtn = document.createElement( 'button' );
		cleanBtn.className = 'playground-tab-btn playground-clean-btn';
		cleanBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; display: block;"><path d="m19 2 3 3L6 21l-3-3L19 2Z"/><path d="M11.5 6.5 13 8M16 12h5M12 16h3M18 17.5 21 19M18 8.5 21 7"/></svg>';
		cleanBtn.title = 'Clean imports & Format code';
		cleanBtn.onclick = async ( e ) => {

			e.stopPropagation();

			await this.cleanAndFormatActiveTab();

		};

		// Create Refresh button
		const refreshBtn = document.createElement( 'button' );
		refreshBtn.className = 'playground-tab-btn playground-refresh-btn';
		refreshBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-refresh" style="width: 16px; height: 16px; display: block;"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" /></svg>';
		refreshBtn.title = 'Refresh WebGPU Renderer & Runner';
		refreshBtn.onclick = async ( e ) => {

			e.stopPropagation();

			await this.guide.refresh();

		};

		// Create Undo & Redo buttons
		const undoBtn = document.createElement( 'button' );
		undoBtn.className = 'playground-tab-btn playground-undo-btn';
		undoBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; display: block;"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>';
		undoBtn.title = 'Undo';
		undoBtn.onclick = ( e ) => {

			e.stopPropagation();
			this.undoPlayground();

		};

		const redoBtn = document.createElement( 'button' );
		redoBtn.className = 'playground-tab-btn playground-redo-btn';
		redoBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; display: block;"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>';
		redoBtn.title = 'Redo';
		redoBtn.onclick = ( e ) => {

			e.stopPropagation();
			this.redoPlayground();

		};

		actionsContainer.appendChild( projectsBtn );
		actionsContainer.appendChild( importedFilesBtn );
		actionsContainer.appendChild( cleanBtn );
		actionsContainer.appendChild( undoBtn );
		actionsContainer.appendChild( redoBtn );
		actionsContainer.appendChild( refreshBtn );

		this.guide.dom.tabsBar.appendChild( scrollWrapper );
		this.guide.dom.tabsBar.appendChild( actionsContainer );

		const activeTabEl = tabsScrollContainer.querySelector( '.playground-tab.active' );
		if ( activeTabEl ) {

			activeTabEl.scrollIntoView( { behavior: 'smooth', block: 'nearest', inline: 'nearest' } );

		}

		setTimeout( updateScrollThumb, 0 );

		this.updateUndoRedoButtons();

	}

	activatePlaygroundTab( name ) {

		if ( this.activePlaygroundTabName === name ) return;

		const activeTab = this.playgroundTabs.find( t => t.name === this.activePlaygroundTabName );
		if ( activeTab && ! activeTab.readOnly && this.guide.codeEditor ) {

			activeTab.code = this.guide.codeEditor.getValue();

		}

		this.activePlaygroundTabName = name;

		const newActiveTab = this.playgroundTabs.find( t => t.name === this.activePlaygroundTabName );
		if ( newActiveTab && this.guide.codeEditor ) {

			this.guide.codeEditor.setReadOnly( !! newActiveTab.readOnly );

			const currentVal = this.guide.codeEditor.getValue();
			if ( currentVal !== newActiveTab.code ) {

				this.guide.codeEditor.setValue( newActiveTab.code );

			}

		}

		this.renderPlaygroundTabs();

		this.updatePlaygroundHash( false );

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
		if ( activeTab && ! activeTab.readOnly && this.guide.codeEditor ) {

			activeTab.code = this.guide.codeEditor.getValue();

		}

		this.playgroundTabs.push( { name: newTabName, code: newTabCode } );
		this.activePlaygroundTabName = newTabName;

		if ( this.guide.codeEditor ) {

			this.guide.codeEditor.setReadOnly( false );
			this.guide.codeEditor.setValue( newTabCode );

		}

		this.renderPlaygroundTabs();
		this.runPlayground();

		this.updatePlaygroundHash( true );

	}

	closePlaygroundTab( name ) {

		const index = this.playgroundTabs.findIndex( t => t.name === name );
		if ( index === - 1 ) return;

		const activeTab = this.playgroundTabs.find( t => t.name === this.activePlaygroundTabName );
		if ( activeTab && ! activeTab.readOnly && this.guide.codeEditor ) {

			activeTab.code = this.guide.codeEditor.getValue();

		}

		this.playgroundTabs.splice( index, 1 );

		if ( this.activePlaygroundTabName === name ) {

			this.activePlaygroundTabName = this.playgroundTabs[ Math.max( 0, index - 1 ) ].name;

		}

		const newActiveTab = this.playgroundTabs.find( t => t.name === this.activePlaygroundTabName ) || this.playgroundTabs[ 0 ];
		if ( newActiveTab && this.guide.codeEditor ) {

			this.guide.codeEditor.setReadOnly( !! newActiveTab.readOnly );

			const currentVal = this.guide.codeEditor.getValue();
			if ( currentVal !== newActiveTab.code ) {

				this.guide.codeEditor.setValue( newActiveTab.code );

			}

		}

		this.renderPlaygroundTabs();
		this.runPlayground();

		this.updatePlaygroundHash( true );

	}

	startRenameTab( name, labelEl ) {

		const tab = this.playgroundTabs?.find( t => t.name === name );
		if ( name === 'main' || tab?.readOnly ) return;

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
				if ( activeTab && ! activeTab.readOnly && this.guide.codeEditor ) {

					activeTab.code = this.guide.codeEditor.getValue();

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
				this.updatePlaygroundHash( true );

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

	async updatePlaygroundHash( pushHistory = false ) {

		if ( ! this.playgroundTabs ) return;

		this.guide.projectsManager.autoSaveCurrentProject();

		const persistTabs = this.playgroundTabs.filter( t => ! t.readOnly );
		const encoded = await compressString( JSON.stringify( {
			tabs: persistTabs
		} ) );
		const release = THREE.REVISION;
		const newHash = 'playground=' + encoded + ( release ? '&release=' + release : '' );

		this.guide.lastHandledHash = newHash;

		if ( pushHistory ) {

			this.guide.historyManager.pushState( newHash );

		}

		history.replaceState( null, '', '#' + newHash );

	}

	undoPlayground() {

		this.guide.historyManager.undo();

	}

	redoPlayground() {

		this.guide.historyManager.redo();

	}

	updateUndoRedoButtons() {

		this.guide.historyManager.updateButtons();

	}

	async cleanAndFormatActiveTab() {

		const activeTab = this.playgroundTabs?.find( t => t.name === this.activePlaygroundTabName );
		if ( ! this.guide.codeEditor || ( activeTab && activeTab.readOnly ) ) return;

		const code = this.guide.codeEditor.getValue();
		const formatted = await CodeCompiler.format( code );

		// Set the new formatted value in the editor and update state/hash
		const currentVal = this.guide.codeEditor.getValue();
		if ( currentVal !== formatted ) {

			this.guide.codeEditor.format( formatted );

			const currentActiveTab = this.playgroundTabs.find( t => t.name === this.activePlaygroundTabName );
			if ( currentActiveTab ) {

				currentActiveTab.code = formatted;

			}

			this.runPlayground();
			this.updatePlaygroundHash( true );

		}

	}

	runPlayground() {

		if ( ! this.playgroundTabs ) return;

		const mainTab = this.playgroundTabs.find( t => t.name === 'main' ) || this.playgroundTabs[ 0 ];

		const tabNames = this.playgroundTabs.map( t => t.name );

		// 1. Identify virtual scripts that are no longer in tabs (i.e. deleted tabs)
		for ( const key of Object.keys( this.guide.runner.scripts ) ) {

			if ( this.guide.runner.scripts[ key ].url === null && key !== '__main__' ) {

				if ( ! tabNames.includes( key ) ) {

					this.guide.runner.invalidateScript( key );
					delete this.guide.runner.scripts[ key ];

				}

			}

		}

		// 2. Add or update virtual script configs based on tabs
		this.playgroundTabs.forEach( tab => {

			if ( tab.name !== 'main' && ! tab.readOnly ) {

				this.guide.runner.invalidateScript( tab.name );

				this.guide.runner.scripts[ tab.name ] = {
					url: null,
					text: tab.code,
					instance: null,
					promise: null,
					dependencies: []
				};

			}

		} );

		this.guide.runner.run( mainTab.code );

	}

	getDebugTarget() {

		// 1. Check main script
		const mainScript = this.guide.runner.scripts[ '__main__' ];
		if ( mainScript && mainScript.instance && typeof mainScript.instance.debug === 'function' ) {

			return mainScript.instance.debug();

		}

		// 2. Check other scripts
		for ( const scriptName of this.guide.runner.activeScriptNames ) {

			const script = this.guide.runner.scripts[ scriptName ];
			if ( script && script.instance && typeof script.instance.debug === 'function' ) {

				return script.instance.debug();

			}

		}

		return null;

	}

	updateDebugWGSL() {

		if ( ! this.guide.isPlaygroundActive ) return;

		const debugData = this.getDebugTarget();
		if ( ! debugData ) {

			this.guide.debugCodeEditor.setValue( 'No debug() function exported or debug target object found.' );

			// Collapse/hide debug container similar to clicking v-resizer-toggle-inverted
			const previewSection = this.guide.dom.previewSection;
			const currentHeight = previewSection.style.height;
			if ( currentHeight !== '100%' ) {

				this.guide.lastPreviewHeight = currentHeight;

			}

			previewSection.style.height = '100%';
			this.guide.layoutManager.updateVResizerIcons( '100%' );

			this.guide.codeEditor.layout();
			this.guide.debugCodeEditor.layout();
			return;

		}

		let scene, camera, object;
		if ( debugData.scene && debugData.camera && debugData.object ) {

			scene = debugData.scene;
			camera = debugData.camera;
			object = debugData.object;

		} else {

			object = debugData;
			scene = this.guide.runner.env.scene || this.guide.scene;
			camera = this.guide.runner.env.camera || this.guide.camera;

		}

		if ( ! scene || ! camera ) {

			this.guide.debugCodeEditor.setValue( 'Invalid debug data. Ensure scene, camera, and object are provided.' );

			// Collapse/hide debug container
			const previewSection = this.guide.dom.previewSection;
			const currentHeight = previewSection.style.height;
			if ( currentHeight !== '100%' ) {

				this.guide.lastPreviewHeight = currentHeight;

			}

			previewSection.style.height = '100%';
			this.guide.layoutManager.updateVResizerIcons( '100%' );

			this.guide.codeEditor.layout();
			this.guide.debugCodeEditor.layout();
			return;

		}

		// Restore/expand debug container since we have valid debug data
		const previewSection = this.guide.dom.previewSection;
		const currentHeight = previewSection.style.height;
		if ( currentHeight === '100%' ) {

			const targetHeight = this.guide.lastPreviewHeight || '50%';
			previewSection.style.height = targetHeight;
			this.guide.layoutManager.updateVResizerIcons( targetHeight );

			this.guide.codeEditor.layout();
			this.guide.debugCodeEditor.layout();

		}

		const targetRenderer = this.guide.debugLanguage === 'GLSL' ? this.guide.webGLRenderer : this.guide.renderer;

		if ( targetRenderer && targetRenderer.debug && typeof targetRenderer.debug.getShaderAsync === 'function' ) {

			targetRenderer.debug.getShaderAsync( scene, camera, object )
				.then( ( shader ) => {

					const code = this.guide.debugStage === 'vertex'
						? ( shader.vertexShader || 'No vertex shader generated.' )
						: ( shader.fragmentShader || 'No fragment shader generated.' );

					this.guide.debugCodeEditor.setValue( code );

				} )
				.catch( ( err ) => {

					this.guide.debugCodeEditor.setValue( 'Error retrieving shader: ' + err.message );

				} );

		} else {

			this.guide.debugCodeEditor.setValue( 'WebGPURenderer debug.getShaderAsync is not available.' );

		}

	}

	getImportedCustomScripts() {

		const customImports = new Set();
		const runnerImports = this.guide.runner ? this.guide.runner.imports : {};

		if ( this.playgroundTabs ) {

			for ( const tab of this.playgroundTabs ) {

				if ( ! tab.readOnly && tab.code ) {

					const { importDeclarations } = parseScript( tab.code );
					for ( const decl of importDeclarations ) {

						const moduleName = decl.moduleName;
						if ( ! isStandardModule( moduleName, runnerImports ) ) {

							const importerName = tab.name === 'main' ? '__main__' : tab.name;
							const resolvedPath = resolvePath( importerName, moduleName );
							const baseName = resolvedPath.replace( /\.js$/, '' );
							customImports.add( baseName );

						}

					}

				}

			}

		}

		if ( this.guide.runner && this.guide.runner.scripts ) {

			for ( const [ name, scriptConfig ] of Object.entries( this.guide.runner.scripts ) ) {

				if ( scriptConfig && scriptConfig.url && name !== '__main__' ) {

					if ( ! isStandardModule( name, runnerImports ) ) {

						customImports.add( name );

					}

				}

			}

		}

		return Array.from( customImports );

	}

	async showImportedFiles() {

		const importedFiles = this.getImportedCustomScripts();
		if ( importedFiles.length === 0 ) {

			this.guide.consoleManager.log( 'No custom imported files found in current playground code.' );
			return;

		}

		let targetTabName = null;

		for ( const name of importedFiles ) {

			let tab = this.playgroundTabs.find( t => t.name === name );
			if ( ! tab ) {

				let code = this.guide.runner?.scripts?.[ name ]?.text;
				if ( code === undefined || code === null ) {

					try {

						const response = await fetch( `./js/imports/scripts/${name}.js` );
						const contentType = response.headers.get( 'content-type' ) || '';
						if ( response.ok && ! contentType.includes( 'text/html' ) ) {

							const text = await response.text();
							if ( ! text.trim().startsWith( '<' ) ) {

								code = text;

							} else {

								console.warn( `Could not fetch imported file: ${name}` );
								continue;

							}

						} else {

							console.warn( `Could not fetch imported file: ${name}` );
							continue;

						}

					} catch ( err ) {

						console.warn( `Error loading imported file ${name}:`, err );
						continue;

					}

				}

				tab = {
					name: name,
					code: code,
					readOnly: true
				};

				this.playgroundTabs.push( tab );

			}

			if ( ! targetTabName ) {

				targetTabName = name;

			}

		}

		if ( targetTabName ) {

			this.renderPlaygroundTabs();
			this.activatePlaygroundTab( targetTabName );

		}

	}

	hasUnsavedChanges() {

		if ( this.guide.projectsManager.currentProjectId ) return false;
		if ( ! this.playgroundTabs || this.playgroundTabs.length === 0 ) return false;
		if ( ! this.initialTabsSnapshot ) return false;

		const persistTabs = this.playgroundTabs.filter( t => ! t.readOnly );
		return JSON.stringify( persistTabs ) !== this.initialTabsSnapshot;

	}

	hasActiveCustomProject() {

		return this.hasUnsavedChanges();

	}

	async openExistingPlayground() {

		if ( ! this.playgroundTabs || this.playgroundTabs.length === 0 ) {

			const activePage = this.guide.pages[ this.guide.currentPageIndex ];
			let currentCode = '// TSL Guide\n';

			if ( activePage && activePage.hasCode && this.guide.codeEditor ) {

				currentCode = this.guide.codeEditor.getValue();

			}

			this.playgroundTabs = [ { name: 'main', code: currentCode } ];
			this.activePlaygroundTabName = 'main';
			this.currentExampleName = activePage?.title || activePage?.name || 'Example';
			this.initialTabsSnapshot = JSON.stringify( this.playgroundTabs );

		}

		this.togglePlayground( true );
		this.renderPlaygroundTabs();

		const activeTab = this.playgroundTabs.find( t => t.name === this.activePlaygroundTabName ) || this.playgroundTabs[ 0 ];
		if ( this.guide.codeEditor ) {

			this.guide.codeEditor.setReadOnly( !! activeTab.readOnly );
			this.guide.codeEditor.setValue( activeTab.code );

		}

		this.runPlayground();
		await this.updatePlaygroundHash( false );

	}

	async loadExampleIntoPlayground( code, name = null ) {

		this.guide.projectsManager.setCurrentProjectId( null );
		this.currentExampleName = name;

		const newCode = code || '// TSL Guide\n';
		this.playgroundTabs = [ { name: 'main', code: newCode } ];
		this.activePlaygroundTabName = 'main';
		this.initialTabsSnapshot = JSON.stringify( this.playgroundTabs );

		this.togglePlayground( true );
		this.renderPlaygroundTabs();

		if ( this.guide.codeEditor ) {

			this.guide.codeEditor.setReadOnly( false );
			this.guide.codeEditor.setValue( newCode );

		}

		this.runPlayground();
		await this.updatePlaygroundHash( true );

	}

}

export { PlaygroundManager };
