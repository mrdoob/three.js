class LayoutManager {

	constructor( guide ) {

		this.guide = guide;

	}

	toggleSidebar( force ) {

		this.guide.isSidebarOpen = force !== undefined ? force : ! this.guide.isSidebarOpen;
		if ( this.guide.isSidebarOpen ) {

			this.guide.dom.sidebar.classList.add( 'open' );
			this.guide.dom.menuToggleMain.style.display = 'none';
			this.guide.dom.headerSearchBtn.style.display = 'none';

		} else {

			this.guide.dom.sidebar.classList.remove( 'open' );
			this.guide.dom.menuToggleMain.style.display = 'flex';
			this.guide.dom.headerSearchBtn.style.display = 'flex';
			this.guide.openedViaHeaderSearch = false;

		}

	}

	setResizerToggleIcon( iconName ) {

		const hResizerToggle = this.guide.dom.hResizerToggle;
		const currentIcon = hResizerToggle.querySelector( '[data-icon]' );
		if ( currentIcon && currentIcon.getAttribute( 'data-icon' ) === iconName ) return;
		hResizerToggle.innerHTML = `<i data-icon="${iconName}" style="width: 10px; height: 10px;"></i>`;
		this.guide.createIcons( hResizerToggle );

	}

	updateVResizerIcons( height ) {

		const isCollapsed = height === '0%' || height === '0px';
		const isEditorCollapsed = height === '100%';

		const iconName = isCollapsed ? 'chevron-down' : 'chevron-up';
		this.guide.setVResizerToggleIcon( iconName );

		const invertedIconName = isEditorCollapsed ? 'chevron-up' : 'chevron-down';
		this.guide.setVResizerToggleInvertedIcon( invertedIconName );

		if ( isCollapsed ) {

			this.guide.dom.vResizer.classList.add( 'collapsed' );
			document.body.classList.add( 'v-resizer-collapsed' );

			document.body.classList.add( 'preview-hidden' );
			this.guide.dom.headerPreviewToggle.innerHTML = '<i data-icon="eye-off" style="width: 1.25rem; height: 1.25rem;"></i>';
			this.guide.createIcons( this.guide.dom.headerPreviewToggle );
			this.guide.isPreviewVisible = false;

		} else {

			this.guide.dom.vResizer.classList.remove( 'collapsed' );
			document.body.classList.remove( 'v-resizer-collapsed' );

			if ( ! isEditorCollapsed ) {

				document.body.classList.remove( 'preview-hidden' );
				this.guide.dom.headerPreviewToggle.innerHTML = '<i data-icon="eye" style="width: 1.25rem; height: 1.25rem;"></i>';
				this.guide.createIcons( this.guide.dom.headerPreviewToggle );
				this.guide.isPreviewVisible = true;

			}

		}

		if ( isEditorCollapsed ) {

			this.guide.dom.vResizer.classList.add( 'editor-collapsed' );
			document.body.classList.add( 'v-resizer-editor-collapsed' );

		} else {

			this.guide.dom.vResizer.classList.remove( 'editor-collapsed' );
			document.body.classList.remove( 'v-resizer-editor-collapsed' );

		}

	}

	toggleConsole( forceState ) {

		const consolePanel = this.guide.dom.editorConsole;
		const toggleIcon = this.guide.dom.consoleToggleIcon;

		const isMinimized = forceState !== undefined ? forceState : ! consolePanel.classList.contains( 'minimized' );

		if ( isMinimized ) {

			consolePanel.classList.add( 'minimized' );
			toggleIcon.setAttribute( 'data-icon', 'chevron-up' );

		} else {

			consolePanel.classList.remove( 'minimized' );
			toggleIcon.setAttribute( 'data-icon', 'chevron-down' );

		}

		this.guide.createIcons( this.guide.dom.consoleToggleBtn );

		if ( this.guide.codeEditor ) this.guide.codeEditor.layout();
		if ( this.guide.debugCodeEditor ) this.guide.debugCodeEditor.layout();

	}

	setupResizer() {

		const MOBILE_BREAKPOINT = 768;

		this.guide.dom.hResizerToggle.addEventListener( 'pointerdown', ( e ) => {

			e.stopPropagation();

		} );

		this.guide.dom.hResizerToggle.addEventListener( 'click', ( e ) => {

			e.stopPropagation();

			if ( this.guide.isEditorCollapsed ) {

				document.body.classList.remove( 'collapsed-workspace' );
				if ( window.innerWidth < MOBILE_BREAKPOINT ) {

					this.guide.dom.contentCol.style.width = '0%';
					this.guide.dom.contentCol.style.display = 'none';
					this.guide.dom.editorCol.style.width = '100%';

				} else {

					this.guide.dom.contentCol.style.width = this.guide.lastContentWidth;
					this.guide.dom.contentCol.style.display = 'flex';
					this.guide.dom.editorCol.style.width = '';

				}

				this.guide.dom.editorCol.style.display = 'flex';
				this.guide.dom.hResizer.classList.remove( 'collapsed' );
				this.setResizerToggleIcon( 'chevron-right' );
				this.guide.isEditorCollapsed = false;

				this.guide.isPreviewVisible = true;
				document.body.classList.remove( 'preview-hidden' );
				this.guide.dom.headerPreviewToggle.innerHTML = '<i data-icon="eye" style="width: 1.25rem; height: 1.25rem;"></i>';
				this.guide.createIcons( this.guide.dom.headerPreviewToggle );

			} else {

				document.body.classList.add( 'collapsed-workspace' );
				if ( window.innerWidth < MOBILE_BREAKPOINT ) {

					this.guide.dom.contentCol.style.width = '100%';
					this.guide.dom.contentCol.style.display = 'flex';
					this.guide.dom.editorCol.style.width = '0%';

				} else {

					this.guide.lastContentWidth = this.guide.dom.contentCol.style.width || '50%';
					this.guide.dom.contentCol.style.width = '100%';
					this.guide.dom.contentCol.style.display = 'flex';
					this.guide.dom.editorCol.style.width = '';

				}

				this.guide.dom.editorCol.style.display = 'flex';
				this.guide.dom.hResizer.classList.add( 'collapsed' );
				this.setResizerToggleIcon( 'chevron-left' );
				this.guide.isEditorCollapsed = true;

				this.guide.isPreviewVisible = this.guide.lastReaderPreviewState;
				document.body.classList.toggle( 'preview-hidden', ! this.guide.isPreviewVisible );
				this.guide.dom.headerPreviewToggle.innerHTML = this.guide.isPreviewVisible
					? '<i data-icon="eye" style="width: 1.25rem; height: 1.25rem;"></i>'
					: '<i data-icon="eye-off" style="width: 1.25rem; height: 1.25rem;"></i>';
				this.guide.createIcons( this.guide.dom.headerPreviewToggle );

			}

			if ( this.guide.isPlaygroundActive ) {

				if ( this.guide.codeEditor ) this.guide.codeEditor.layout();
				if ( this.guide.debugCodeEditor ) this.guide.debugCodeEditor.layout();

			} else {

				const currentHash = window.location.hash.substring( 1 );
				const activeNode = currentHash.split( '&' )[ 1 ] || '';
				this.guide.renderPage( this.guide.currentPageIndex, activeNode, false );

			}

		} );

		this.guide.dom.vResizerToggle.addEventListener( 'pointerdown', ( e ) => {

			e.stopPropagation();

		} );

		this.guide.dom.vResizerToggle.addEventListener( 'click', ( e ) => {

			e.stopPropagation();

			const previewSection = this.guide.dom.previewSection;
			const currentHeight = previewSection.style.height;
			const isCollapsed = currentHeight === '0px' || currentHeight === '0%';

			if ( isCollapsed ) {

				const targetHeight = this.guide.lastPreviewHeight || '50%';
				previewSection.style.height = targetHeight;
				this.updateVResizerIcons( targetHeight );

			} else {

				this.guide.lastPreviewHeight = currentHeight;
				previewSection.style.height = '0%';
				this.updateVResizerIcons( '0%' );

			}

			if ( this.guide.codeEditor ) this.guide.codeEditor.layout();
			if ( this.guide.debugCodeEditor ) this.guide.debugCodeEditor.layout();

		} );

		this.guide.dom.vResizerToggleInverted.addEventListener( 'pointerdown', ( e ) => {

			e.stopPropagation();

		} );

		this.guide.dom.vResizerToggleInverted.addEventListener( 'click', ( e ) => {

			e.stopPropagation();

			const previewSection = this.guide.dom.previewSection;
			const currentHeight = previewSection.style.height;
			const isEditorCollapsed = currentHeight === '100%';

			if ( isEditorCollapsed ) {

				const targetHeight = this.guide.lastPreviewHeight || '50%';
				previewSection.style.height = targetHeight;
				this.updateVResizerIcons( targetHeight );

			} else {

				this.guide.lastPreviewHeight = currentHeight;
				previewSection.style.height = '100%';
				this.updateVResizerIcons( '100%' );

			}

			if ( this.guide.codeEditor ) this.guide.codeEditor.layout();
			if ( this.guide.debugCodeEditor ) this.guide.debugCodeEditor.layout();

		} );

		// Initial icon setup
		if ( window.innerWidth >= MOBILE_BREAKPOINT ) {

			this.updateVResizerIcons( this.guide.dom.previewSection.style.height || '50%' );

		} else {

			const height = this.guide.dom.previewSection.style.height || '50%';
			const isCollapsed = height === '0%' || height === '0px';
			const isEditorCollapsed = height === '100%';

			const iconName = isCollapsed ? 'chevron-down' : 'chevron-up';
			this.guide.setVResizerToggleIcon( iconName );

			const invertedIconName = isEditorCollapsed ? 'chevron-up' : 'chevron-down';
			this.guide.setVResizerToggleInvertedIcon( invertedIconName );

			if ( isCollapsed ) {

				this.guide.dom.vResizer.classList.add( 'collapsed' );
				document.body.classList.add( 'v-resizer-collapsed' );

			} else {

				this.guide.dom.vResizer.classList.remove( 'collapsed' );

			}

			if ( isEditorCollapsed ) {

				this.guide.dom.vResizer.classList.add( 'editor-collapsed' );
				document.body.classList.add( 'v-resizer-editor-collapsed' );

			} else {

				this.guide.dom.vResizer.classList.remove( 'editor-collapsed' );
				document.body.classList.remove( 'v-resizer-editor-collapsed' );

			}

		}

		let isResizingH = false;
		let isResizingV = false;

		this.guide.dom.hResizer.addEventListener( 'pointerdown', ( e ) => {

			if ( this.guide.isEditorCollapsed ) return;
			isResizingH = true;
			this.guide.dom.hResizer.classList.add( 'dragging' );
			this.guide.dom.hResizer.setPointerCapture( e.pointerId );
			document.body.style.userSelect = 'none';

		} );

		this.guide.dom.vResizer.addEventListener( 'pointerdown', ( e ) => {

			if ( this.guide.dom.vResizer.classList.contains( 'collapsed' ) || this.guide.dom.vResizer.classList.contains( 'editor-collapsed' ) ) return;
			isResizingV = true;
			this.guide.dom.vResizer.classList.add( 'dragging' );
			this.guide.dom.vResizer.setPointerCapture( e.pointerId );
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

					this.guide.dom.contentCol.style.width = `${ newWidth }%`;

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
					this.guide.dom.previewSection.style.height = targetHeight;
					this.updateVResizerIcons( targetHeight );

				}

			}

		};

		this.onPointerUp = () => {

			isResizingH = false;
			isResizingV = false;
			this.guide.dom.hResizer.classList.remove( 'dragging' );
			this.guide.dom.vResizer.classList.remove( 'dragging' );
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
