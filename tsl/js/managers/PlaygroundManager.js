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

				this.tour.layoutManager.updateVResizerIcons( '' );

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

		this.tour.lastHandledHash = hash;

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
			const thumbLeft = maxScroll > 0 ? ( scrollLeft / maxScroll ) * maxThumbLeft : 0;

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

		}

		let draggedTabName = null;

		this.playgroundTabs.forEach( ( tab ) => {

			const tabEl = document.createElement( 'div' );
			tabEl.className = 'playground-tab';
			tabEl.draggable = true;

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
				this.tour.dom.tabsBar.querySelectorAll( '.playground-tab' ).forEach( el => {

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

			labelEl.ondblclick = ( e ) => {

				e.stopPropagation();
				this.startRenameTab( tab.name, labelEl );

			};

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
		projectsBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-upload" style="width: 16px; height: 16px; display: block;"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 9l5 -5l5 5" /><path d="M12 4l0 12" /></svg>';
		projectsBtn.title = 'Playground Projects (Save, Load & JSON)';
		projectsBtn.onclick = ( e ) => {

			e.stopPropagation();
			this.tour.projectsManager.openProjectsModal();

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

			await this.tour.refresh();

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
		actionsContainer.appendChild( cleanBtn );
		actionsContainer.appendChild( undoBtn );
		actionsContainer.appendChild( redoBtn );
		actionsContainer.appendChild( refreshBtn );

		this.tour.dom.tabsBar.appendChild( scrollWrapper );
		this.tour.dom.tabsBar.appendChild( actionsContainer );

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

		this.updatePlaygroundHash( true );

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

		this.updatePlaygroundHash( true );

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

		this.tour.projectsManager.autoSaveCurrentProject();

		const encoded = await compressString( JSON.stringify( {
			tabs: this.playgroundTabs
		} ) );
		const release = THREE.REVISION;
		const newHash = 'playground=' + encoded + ( release ? '&release=' + release : '' );

		this.tour.lastHandledHash = newHash;

		if ( pushHistory ) {

			this.tour.historyManager.pushState( newHash );

		}

		history.replaceState( null, '', '#' + newHash );

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
			this.updatePlaygroundHash( true );

		}

	}

	runPlayground() {

		if ( ! this.playgroundTabs ) return;

		const mainTab = this.playgroundTabs.find( t => t.name === 'main' ) || this.playgroundTabs[ 0 ];

		const tabNames = this.playgroundTabs.map( t => t.name );

		// 1. Identify virtual scripts that are no longer in tabs (i.e. deleted tabs)
		for ( const key of Object.keys( this.tour.runner.scripts ) ) {

			if ( this.tour.runner.scripts[ key ].url === null && key !== '__main__' ) {

				if ( ! tabNames.includes( key ) ) {

					this.tour.runner.invalidateScript( key );
					delete this.tour.runner.scripts[ key ];

				}

			}

		}

		// 2. Add or update virtual script configs based on tabs
		this.playgroundTabs.forEach( tab => {

			if ( tab.name !== 'main' ) {

				const existing = this.tour.runner.scripts[ tab.name ];
				if ( ! existing || existing.text !== tab.code ) {

					if ( existing ) {

						this.tour.runner.invalidateScript( tab.name );

					}

					this.tour.runner.scripts[ tab.name ] = {
						url: null,
						text: tab.code,
						instance: null,
						promise: null,
						dependencies: []
					};

				}

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

		const debugData = this.getDebugTarget();
		if ( ! debugData ) {

			this.tour.debugCodeEditor.setValue( 'No debug() function exported or debug target object found.' );

			// Collapse/hide debug container similar to clicking v-resizer-toggle-inverted
			const previewSection = this.tour.dom.previewSection;
			const currentHeight = previewSection.style.height;
			if ( currentHeight !== '100%' ) {

				this.tour.lastPreviewHeight = currentHeight;

			}

			previewSection.style.height = '100%';
			this.tour.layoutManager.updateVResizerIcons( '100%' );

			this.tour.codeEditor.layout();
			this.tour.debugCodeEditor.layout();
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

		if ( ! scene || ! camera ) {

			this.tour.debugCodeEditor.setValue( 'Invalid debug data. Ensure scene, camera, and object are provided.' );

			// Collapse/hide debug container
			const previewSection = this.tour.dom.previewSection;
			const currentHeight = previewSection.style.height;
			if ( currentHeight !== '100%' ) {

				this.tour.lastPreviewHeight = currentHeight;

			}

			previewSection.style.height = '100%';
			this.tour.layoutManager.updateVResizerIcons( '100%' );

			this.tour.codeEditor.layout();
			this.tour.debugCodeEditor.layout();
			return;

		}

		// Restore/expand debug container since we have valid debug data
		const previewSection = this.tour.dom.previewSection;
		const currentHeight = previewSection.style.height;
		if ( currentHeight === '100%' ) {

			const targetHeight = this.tour.lastPreviewHeight || '50%';
			previewSection.style.height = targetHeight;
			this.tour.layoutManager.updateVResizerIcons( targetHeight );

			this.tour.codeEditor.layout();
			this.tour.debugCodeEditor.layout();

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

	hasActiveCustomProject() {

		if ( ! this.playgroundTabs || this.playgroundTabs.length === 0 ) return false;
		if ( this.playgroundTabs.length > 1 ) return true;

		const mainTab = this.playgroundTabs[ 0 ];
		if ( ! mainTab ) return false;
		if ( mainTab.name !== 'main' ) return true;

		const code = ( mainTab.code || '' ).trim();
		if ( ! code || code === '// Tour of TSL' || code === '// Play here!' || code === '// No example available.\nimport \'scenes/empty\';' ) {

			return false;

		}

		return true;

	}

	async openExistingPlayground() {

		if ( ! this.playgroundTabs || this.playgroundTabs.length === 0 ) {

			const activePage = this.tour.pages[ this.tour.currentPageIndex ];
			let currentCode = '// Tour of TSL\n';

			if ( activePage && activePage.hasCode && this.tour.codeEditor ) {

				currentCode = this.tour.codeEditor.getValue();

			}

			this.playgroundTabs = [ { name: 'main', code: currentCode } ];
			this.activePlaygroundTabName = 'main';

		}

		this.togglePlayground( true );
		this.renderPlaygroundTabs();

		const activeTab = this.playgroundTabs.find( t => t.name === this.activePlaygroundTabName ) || this.playgroundTabs[ 0 ];
		if ( this.tour.codeEditor ) {

			this.tour.codeEditor.setValue( activeTab.code );

		}

		this.runPlayground();
		await this.updatePlaygroundHash( false );

	}

	async loadExampleIntoPlayground( code ) {

		this.tour.projectsManager.setCurrentProjectId( null );

		const newCode = code || '// Tour of TSL\n';
		this.playgroundTabs = [ { name: 'main', code: newCode } ];
		this.activePlaygroundTabName = 'main';

		this.togglePlayground( true );
		this.renderPlaygroundTabs();

		if ( this.tour.codeEditor ) {

			this.tour.codeEditor.setValue( newCode );

		}

		this.runPlayground();
		await this.updatePlaygroundHash( true );

	}

}

export { PlaygroundManager };
