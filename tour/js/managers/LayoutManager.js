class LayoutManager {

	constructor( tour ) {

		this.tour = tour;

	}

	toggleSidebar( force ) {

		this.tour.isSidebarOpen = force !== undefined ? force : ! this.tour.isSidebarOpen;
		if ( this.tour.isSidebarOpen ) {

			this.tour.dom.sidebar.classList.add( 'open' );
			this.tour.dom.menuToggleMain.style.display = 'none';
			this.tour.dom.headerSearchBtn.style.display = 'none';

		} else {

			this.tour.dom.sidebar.classList.remove( 'open' );
			this.tour.dom.menuToggleMain.style.display = 'flex';
			this.tour.dom.headerSearchBtn.style.display = 'flex';
			this.tour.openedViaHeaderSearch = false;

		}

	}

	setResizerToggleIcon( iconName ) {

		const hResizerToggle = this.tour.dom.hResizerToggle;
		const currentIcon = hResizerToggle.querySelector( '[data-icon]' );
		if ( currentIcon && currentIcon.getAttribute( 'data-icon' ) === iconName ) return;
		hResizerToggle.innerHTML = `<i data-icon="${iconName}" style="width: 10px; height: 10px;"></i>`;
		this.tour.createIcons( hResizerToggle );

	}

	updateVResizerIcons( height ) {

		const isCollapsed = height === '0%' || height === '0px';
		const isEditorCollapsed = height === '100%';

		const iconName = isCollapsed ? 'chevron-down' : 'chevron-up';
		this.tour.setVResizerToggleIcon( iconName );

		const invertedIconName = isEditorCollapsed ? 'chevron-up' : 'chevron-down';
		this.tour.setVResizerToggleInvertedIcon( invertedIconName );

		if ( isCollapsed ) {

			this.tour.dom.vResizer.classList.add( 'collapsed' );
			document.body.classList.add( 'v-resizer-collapsed' );

			document.body.classList.add( 'preview-hidden' );
			this.tour.dom.headerPreviewToggle.innerHTML = `<i data-icon="eye-off" style="width: 1.25rem; height: 1.25rem;"></i>`;
			this.tour.createIcons( this.tour.dom.headerPreviewToggle );
			this.tour.isPreviewVisible = false;

		} else {

			this.tour.dom.vResizer.classList.remove( 'collapsed' );
			document.body.classList.remove( 'v-resizer-collapsed' );

			if ( ! isEditorCollapsed ) {

				document.body.classList.remove( 'preview-hidden' );
				this.tour.dom.headerPreviewToggle.innerHTML = `<i data-icon="eye" style="width: 1.25rem; height: 1.25rem;"></i>`;
				this.tour.createIcons( this.tour.dom.headerPreviewToggle );
				this.tour.isPreviewVisible = true;

			}

		}

		if ( isEditorCollapsed ) {

			this.tour.dom.vResizer.classList.add( 'editor-collapsed' );
			document.body.classList.add( 'v-resizer-editor-collapsed' );

		} else {

			this.tour.dom.vResizer.classList.remove( 'editor-collapsed' );
			document.body.classList.remove( 'v-resizer-editor-collapsed' );

		}

	}

	toggleConsole( forceState ) {

		const consolePanel = this.tour.dom.editorConsole;
		const toggleIcon = this.tour.dom.consoleToggleIcon;

		const isMinimized = forceState !== undefined ? forceState : ! consolePanel.classList.contains( 'minimized' );

		if ( isMinimized ) {

			consolePanel.classList.add( 'minimized' );
			toggleIcon.setAttribute( 'data-icon', 'chevron-up' );

		} else {

			consolePanel.classList.remove( 'minimized' );
			toggleIcon.setAttribute( 'data-icon', 'chevron-down' );

		}

		this.tour.createIcons( this.tour.dom.consoleToggleBtn );

		if ( this.tour.codeEditor ) this.tour.codeEditor.layout();
		if ( this.tour.debugCodeEditor ) this.tour.debugCodeEditor.layout();

	}

	setupResizer() {

		const MOBILE_BREAKPOINT = 768;

		this.tour.dom.hResizerToggle.addEventListener( 'pointerdown', ( e ) => {

			e.stopPropagation();

		} );

		this.tour.dom.hResizerToggle.addEventListener( 'click', ( e ) => {

			e.stopPropagation();

			if ( this.tour.isEditorCollapsed ) {

				document.body.classList.remove( 'collapsed-workspace' );
				if ( window.innerWidth < MOBILE_BREAKPOINT ) {

					this.tour.dom.contentCol.style.width = '0%';
					this.tour.dom.contentCol.style.display = 'none';
					this.tour.dom.editorCol.style.width = '100%';

				} else {

					this.tour.dom.contentCol.style.width = this.tour.lastContentWidth;
					this.tour.dom.contentCol.style.display = 'flex';
					this.tour.dom.editorCol.style.width = '';

				}

				this.tour.dom.editorCol.style.display = 'flex';
				this.tour.dom.hResizer.classList.remove( 'collapsed' );
				this.setResizerToggleIcon( 'chevron-right' );
				this.tour.isEditorCollapsed = false;

				this.tour.isPreviewVisible = true;
				document.body.classList.remove( 'preview-hidden' );
				this.tour.dom.headerPreviewToggle.innerHTML = '<i data-icon="eye" style="width: 1.25rem; height: 1.25rem;"></i>';
				this.tour.createIcons( this.tour.dom.headerPreviewToggle );

			} else {

				document.body.classList.add( 'collapsed-workspace' );
				if ( window.innerWidth < MOBILE_BREAKPOINT ) {

					this.tour.dom.contentCol.style.width = '100%';
					this.tour.dom.contentCol.style.display = 'flex';
					this.tour.dom.editorCol.style.width = '0%';

				} else {

					this.tour.lastContentWidth = this.tour.dom.contentCol.style.width || '50%';
					this.tour.dom.contentCol.style.width = '100%';
					this.tour.dom.contentCol.style.display = 'flex';
					this.tour.dom.editorCol.style.width = '';

				}

				this.tour.dom.editorCol.style.display = 'flex';
				this.tour.dom.hResizer.classList.add( 'collapsed' );
				this.setResizerToggleIcon( 'chevron-left' );
				this.tour.isEditorCollapsed = true;

				this.tour.isPreviewVisible = this.tour.lastReaderPreviewState;
				document.body.classList.toggle( 'preview-hidden', ! this.tour.isPreviewVisible );
				this.tour.dom.headerPreviewToggle.innerHTML = this.tour.isPreviewVisible
					? '<i data-icon="eye" style="width: 1.25rem; height: 1.25rem;"></i>'
					: '<i data-icon="eye-off" style="width: 1.25rem; height: 1.25rem;"></i>';
				this.tour.createIcons( this.tour.dom.headerPreviewToggle );

			}

			if ( this.tour.isPlaygroundActive ) {

				if ( this.tour.codeEditor ) this.tour.codeEditor.layout();
				if ( this.tour.debugCodeEditor ) this.tour.debugCodeEditor.layout();

			} else {

				const currentHash = window.location.hash.substring( 1 );
				const activeNode = currentHash.split( '&' )[ 1 ] || '';
				this.tour.renderPage( this.tour.currentPageIndex, activeNode, false );

			}

		} );

		this.tour.dom.vResizerToggle.addEventListener( 'pointerdown', ( e ) => {

			e.stopPropagation();

		} );

		this.tour.dom.vResizerToggle.addEventListener( 'click', ( e ) => {

			e.stopPropagation();

			const previewSection = this.tour.dom.previewSection;
			const currentHeight = previewSection.style.height;
			const isCollapsed = currentHeight === '0px' || currentHeight === '0%';

			if ( isCollapsed ) {

				const targetHeight = this.tour.lastPreviewHeight || '50%';
				previewSection.style.height = targetHeight;
				this.updateVResizerIcons( targetHeight );

			} else {

				this.tour.lastPreviewHeight = currentHeight;
				previewSection.style.height = '0%';
				this.updateVResizerIcons( '0%' );

			}

			if ( this.tour.codeEditor ) this.tour.codeEditor.layout();
			if ( this.tour.debugCodeEditor ) this.tour.debugCodeEditor.layout();

		} );

		this.tour.dom.vResizerToggleInverted.addEventListener( 'pointerdown', ( e ) => {

			e.stopPropagation();

		} );

		this.tour.dom.vResizerToggleInverted.addEventListener( 'click', ( e ) => {

			e.stopPropagation();

			const previewSection = this.tour.dom.previewSection;
			const currentHeight = previewSection.style.height;
			const isEditorCollapsed = currentHeight === '100%';

			if ( isEditorCollapsed ) {

				const targetHeight = this.tour.lastPreviewHeight || '50%';
				previewSection.style.height = targetHeight;
				this.updateVResizerIcons( targetHeight );

			} else {

				this.tour.lastPreviewHeight = currentHeight;
				previewSection.style.height = '100%';
				this.updateVResizerIcons( '100%' );

			}

			if ( this.tour.codeEditor ) this.tour.codeEditor.layout();
			if ( this.tour.debugCodeEditor ) this.tour.debugCodeEditor.layout();

		} );

		// Initial icon setup
		if ( window.innerWidth >= MOBILE_BREAKPOINT ) {

			this.updateVResizerIcons( this.tour.dom.previewSection.style.height || '50%' );

		} else {

			const height = this.tour.dom.previewSection.style.height || '50%';
			const isCollapsed = height === '0%' || height === '0px';
			const isEditorCollapsed = height === '100%';

			const iconName = isCollapsed ? 'chevron-down' : 'chevron-up';
			this.tour.setVResizerToggleIcon( iconName );

			const invertedIconName = isEditorCollapsed ? 'chevron-up' : 'chevron-down';
			this.tour.setVResizerToggleInvertedIcon( invertedIconName );

			if ( isCollapsed ) {

				this.tour.dom.vResizer.classList.add( 'collapsed' );
				document.body.classList.add( 'v-resizer-collapsed' );

			} else {

				this.tour.dom.vResizer.classList.remove( 'collapsed' );

			}

			if ( isEditorCollapsed ) {

				this.tour.dom.vResizer.classList.add( 'editor-collapsed' );
				document.body.classList.add( 'v-resizer-editor-collapsed' );

			} else {

				this.tour.dom.vResizer.classList.remove( 'editor-collapsed' );
				document.body.classList.remove( 'v-resizer-editor-collapsed' );

			}

		}

		let isResizingH = false;
		let isResizingV = false;

		this.tour.dom.hResizer.addEventListener( 'pointerdown', ( e ) => {

			if ( this.tour.isEditorCollapsed ) return;
			isResizingH = true;
			this.tour.dom.hResizer.classList.add( 'dragging' );
			this.tour.dom.hResizer.setPointerCapture( e.pointerId );
			document.body.style.userSelect = 'none';

		} );

		this.tour.dom.vResizer.addEventListener( 'pointerdown', ( e ) => {

			if ( this.tour.dom.vResizer.classList.contains( 'collapsed' ) || this.tour.dom.vResizer.classList.contains( 'editor-collapsed' ) ) return;
			isResizingV = true;
			this.tour.dom.vResizer.classList.add( 'dragging' );
			this.tour.dom.vResizer.setPointerCapture( e.pointerId );
			document.body.style.userSelect = 'none';

		} );

		this.onPointerMove = ( e ) => {

			if ( ! isResizingH && ! isResizingV ) return;

			if ( isResizingH ) {

				if ( window.innerWidth < MOBILE_BREAKPOINT ) return;

				const mainLayout = document.querySelector( '.main-layout' );
				const leftOffset = mainLayout.getBoundingClientRect().left;
				const newWidth = ( ( e.clientX - leftOffset ) / mainLayout.clientWidth ) * 100;

				if ( newWidth > 20 && newWidth < 80 ) {

					this.tour.dom.contentCol.style.width = `${ newWidth }%`;

				}

			}

			if ( isResizingV ) {

				const editorWorkspace = document.querySelector( '.editor-workspace' );
				const containerHeight = editorWorkspace.clientHeight;
				const topOffset = editorWorkspace.getBoundingClientRect().top;
				const pointerYRelative = e.clientY - topOffset;
				const newHeight = ( pointerYRelative / containerHeight ) * 100;

				if ( newHeight > 10 && newHeight < 90 ) {

					const targetHeight = `${ newHeight }%`;
					this.tour.dom.previewSection.style.height = targetHeight;
					this.updateVResizerIcons( targetHeight );

				}

			}

		};

		this.onPointerUp = () => {

			isResizingH = false;
			isResizingV = false;
			this.tour.dom.hResizer.classList.remove( 'dragging' );
			this.tour.dom.vResizer.classList.remove( 'dragging' );
			document.body.style.userSelect = '';

		};

		window.addEventListener( 'pointermove', this.onPointerMove );
		window.addEventListener( 'pointerup', this.onPointerUp );

	}

	dispose() {

		window.removeEventListener( 'pointermove', this.onPointerMove );
		window.removeEventListener( 'pointerup', this.onPointerUp );

	}

}

export { LayoutManager };
