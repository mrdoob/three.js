import { Style } from './Style.js';

export class Profiler {

	constructor() {

		this.tabs = {};
		this.activeTabId = null;
		this.isResizing = false;
		this.lastHeightBottom = 350; // Height for bottom position
		this.lastWidthRight = 450; // Width for right position
		this.position = 'bottom'; // 'bottom' or 'right'
		this.detachedWindows = []; // Array to store detached tab windows
		this.isMobile = this.detectMobile();
		this.maxZIndex = 1002; // Track the highest z-index for detached windows (starts at base z-index from CSS)
		this.nextTabOriginalIndex = 0; // Track the original order of tabs as they are added

		Style.init();

		this.setupShell();
		this.setupResizing();

		// Setup orientation change listener for mobile devices
		if ( this.isMobile ) {

			this.setupOrientationListener();

		}

		// Setup window resize listener to constrain detached windows
		this.setupWindowResizeListener();

	}

	detectMobile() {

		// Check for mobile devices
		const userAgent = navigator.userAgent || navigator.vendor || window.opera;
		const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test( userAgent );
		const isTouchDevice = ( 'ontouchstart' in window ) || ( navigator.maxTouchPoints > 0 );
		const isSmallScreen = window.innerWidth <= 768;

		return isMobileUA || ( isTouchDevice && isSmallScreen );

	}

	setupOrientationListener() {

		const handleOrientationChange = () => {

			// Check if device is in landscape or portrait mode
			const isLandscape = window.innerWidth > window.innerHeight;

			// In landscape mode, use right position (vertical panel)
			// In portrait mode, use bottom position (horizontal panel)
			const targetPosition = isLandscape ? 'right' : 'bottom';

			if ( this.position !== targetPosition ) {

				this.setPosition( targetPosition );

			}

		};

		// Initial check
		handleOrientationChange();

		// Listen for orientation changes
		window.addEventListener( 'orientationchange', handleOrientationChange );
		window.addEventListener( 'resize', handleOrientationChange );

	}

	setupWindowResizeListener() {

		const constrainDetachedWindows = () => {

			this.detachedWindows.forEach( detachedWindow => {

				this.constrainWindowToBounds( detachedWindow.panel );

			} );

		};

		const constrainMainPanel = () => {

			// Skip if panel is maximized (it should always fill the screen)
			if ( this.panel.classList.contains( 'maximized' ) ) return;

			const windowWidth = window.innerWidth;
			const windowHeight = window.innerHeight;

			if ( this.position === 'bottom' ) {

				const currentHeight = this.panel.offsetHeight;
				const maxHeight = windowHeight - 50; // Leave 50px margin

				if ( currentHeight > maxHeight ) {

					this.panel.style.height = `${ maxHeight }px`;
					this.lastHeightBottom = maxHeight;

				}

			} else if ( this.position === 'right' ) {

				const currentWidth = this.panel.offsetWidth;
				const maxWidth = windowWidth - 50; // Leave 50px margin

				if ( currentWidth > maxWidth ) {

					this.panel.style.width = `${ maxWidth }px`;
					this.lastWidthRight = maxWidth;

				}

			}

		};

		// Listen for window resize events
		window.addEventListener( 'resize', () => {

			constrainDetachedWindows();
			constrainMainPanel();

		} );

	}

	constrainWindowToBounds( windowPanel ) {

		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;

		const panelWidth = windowPanel.offsetWidth;
		const panelHeight = windowPanel.offsetHeight;

		let left = parseFloat( windowPanel.style.left ) || windowPanel.offsetLeft || 0;
		let top = parseFloat( windowPanel.style.top ) || windowPanel.offsetTop || 0;

		// Allow window to extend half its width/height outside the screen
		const halfWidth = panelWidth / 2;
		const halfHeight = panelHeight / 2;

		// Constrain horizontal position (allow half width to extend beyond right edge)
		if ( left + panelWidth > windowWidth + halfWidth ) {

			left = windowWidth + halfWidth - panelWidth;

		}

		// Constrain horizontal position (allow half width to extend beyond left edge)
		if ( left < - halfWidth ) {

			left = - halfWidth;

		}

		// Constrain vertical position (allow half height to extend beyond bottom edge)
		if ( top + panelHeight > windowHeight + halfHeight ) {

			top = windowHeight + halfHeight - panelHeight;

		}

		// Constrain vertical position (allow half height to extend beyond top edge)
		if ( top < - halfHeight ) {

			top = - halfHeight;

		}

		// Apply constrained position
		windowPanel.style.left = `${ left }px`;
		windowPanel.style.top = `${ top }px`;

	}

	setupShell() {

		this.domElement = document.createElement( 'div' );
		this.domElement.id = 'profiler-shell';

		this.toggleButton = document.createElement( 'button' );
		this.toggleButton.id = 'profiler-toggle';
		this.toggleButton.innerHTML = `
<span id="builtin-tabs-container"></span>
<span id="toggle-text">
	<span id="fps-counter">-</span>
	<span class="fps-label">FPS</span>
</span>
<span id="toggle-icon">
	<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-device-ipad-horizontal-search"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.5 20h-6.5a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v5.5" /><path d="M9 17h2" /><path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M20.2 20.2l1.8 1.8" /></svg>
</span>
`;
		this.toggleButton.onclick = () => this.togglePanel();

		this.builtinTabsContainer = this.toggleButton.querySelector( '#builtin-tabs-container' );

		// Create mini-panel for builtin tabs (shown when panel is hidden)
		this.miniPanel = document.createElement( 'div' );
		this.miniPanel.id = 'profiler-mini-panel';
		this.miniPanel.className = 'profiler-mini-panel';

		this.panel = document.createElement( 'div' );
		this.panel.id = 'profiler-panel';

		const header = document.createElement( 'div' );
		header.className = 'profiler-header';
		this.tabsContainer = document.createElement( 'div' );
		this.tabsContainer.className = 'profiler-tabs';

		const controls = document.createElement( 'div' );
		controls.className = 'profiler-controls';

		this.floatingBtn = document.createElement( 'button' );
		this.floatingBtn.id = 'floating-btn';
		this.floatingBtn.title = 'Switch to Right Side';
		this.floatingBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="15" y1="3" x2="15" y2="21"></line></svg>';
		this.floatingBtn.onclick = () => this.togglePosition();

		// Hide position toggle button on mobile devices
		if ( this.isMobile ) {

			this.floatingBtn.style.display = 'none';
			this.panel.classList.add( 'hide-position-toggle' );

		}

		this.maximizeBtn = document.createElement( 'button' );
		this.maximizeBtn.id = 'maximize-btn';
		this.maximizeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
		this.maximizeBtn.onclick = () => this.toggleMaximize();

		const hideBtn = document.createElement( 'button' );
		hideBtn.id = 'hide-panel-btn';
		hideBtn.textContent = '-';
		hideBtn.onclick = () => this.togglePanel();

		controls.append( this.floatingBtn, this.maximizeBtn, hideBtn );
		header.append( this.tabsContainer, controls );

		this.contentWrapper = document.createElement( 'div' );
		this.contentWrapper.className = 'profiler-content-wrapper';

		const resizer = document.createElement( 'div' );
		resizer.className = 'panel-resizer';

		this.panel.append( resizer, header, this.contentWrapper );

		this.domElement.append( this.toggleButton, this.miniPanel, this.panel );

		// Set initial position class
		this.panel.classList.add( `position-${this.position}` );

	}

	setupResizing() {

		const resizer = this.panel.querySelector( '.panel-resizer' );

		const onStart = ( e ) => {

			this.isResizing = true;
			this.panel.classList.add( 'resizing' );
			resizer.setPointerCapture( e.pointerId );
			const startX = e.clientX;
			const startY = e.clientY;
			const startHeight = this.panel.offsetHeight;
			const startWidth = this.panel.offsetWidth;

			const onMove = ( moveEvent ) => {

				if ( ! this.isResizing ) return;
				moveEvent.preventDefault();
				const currentX = moveEvent.clientX;
				const currentY = moveEvent.clientY;

				if ( this.position === 'bottom' ) {

					// Vertical resize for bottom position
					const newHeight = startHeight - ( currentY - startY );

					if ( newHeight > 100 && newHeight < window.innerHeight - 50 ) {

						this.panel.style.height = `${ newHeight }px`;

					}

				} else if ( this.position === 'right' ) {

					// Horizontal resize for right position
					const newWidth = startWidth - ( currentX - startX );

					if ( newWidth > 200 && newWidth < window.innerWidth - 50 ) {

						this.panel.style.width = `${ newWidth }px`;

					}

				}

			};

			const onEnd = () => {

				this.isResizing = false;
				this.panel.classList.remove( 'resizing' );
				resizer.removeEventListener( 'pointermove', onMove );
				resizer.removeEventListener( 'pointerup', onEnd );
				resizer.removeEventListener( 'pointercancel', onEnd );
				if ( ! this.panel.classList.contains( 'maximized' ) ) {

					// Save dimensions based on current position
					if ( this.position === 'bottom' ) {

						this.lastHeightBottom = this.panel.offsetHeight;

					} else if ( this.position === 'right' ) {

						this.lastWidthRight = this.panel.offsetWidth;

					}

					// Save layout after resize
					this.saveLayout();

				}

			};

			resizer.addEventListener( 'pointermove', onMove );
			resizer.addEventListener( 'pointerup', onEnd );
			resizer.addEventListener( 'pointercancel', onEnd );

		};

		resizer.addEventListener( 'pointerdown', onStart );

	}

	toggleMaximize() {

		if ( this.panel.classList.contains( 'maximized' ) ) {

			this.panel.classList.remove( 'maximized' );

			// Restore size based on current position
			if ( this.position === 'bottom' ) {

				this.panel.style.height = `${ this.lastHeightBottom }px`;
				this.panel.style.width = '100%';

			} else if ( this.position === 'right' ) {

				this.panel.style.height = '100%';
				this.panel.style.width = `${ this.lastWidthRight }px`;

			}

			this.maximizeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';

		} else {

			// Save current size before maximizing
			if ( this.position === 'bottom' ) {

				this.lastHeightBottom = this.panel.offsetHeight;

			} else if ( this.position === 'right' ) {

				this.lastWidthRight = this.panel.offsetWidth;

			}

			this.panel.classList.add( 'maximized' );

			// Maximize based on current position
			if ( this.position === 'bottom' ) {

				this.panel.style.height = '100vh';
				this.panel.style.width = '100%';

			} else if ( this.position === 'right' ) {

				this.panel.style.height = '100%';
				this.panel.style.width = '100vw';

			}

			this.maximizeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>';

		}

	}

	addTab( tab ) {

		this.tabs[ tab.id ] = tab;

		// Assign a permanent original index to this tab
		tab.originalIndex = this.nextTabOriginalIndex ++;

		// Add visual indicator for tabs that cannot be detached
		if ( tab.allowDetach === false ) {

			tab.button.classList.add( 'no-detach' );

		}

		// Set visibility change callback
		tab.onVisibilityChange = () => this.updatePanelSize();

		this.setupTabDragAndDrop( tab );

		this.tabsContainer.appendChild( tab.button );
		this.contentWrapper.appendChild( tab.content );

		// Apply the current visibility state to the DOM elements
		if ( ! tab.isVisible ) {

			tab.button.style.display = 'none';
			tab.content.style.display = 'none';

		}

		// If tab is builtin, add it to the profiler-toggle button
		if ( tab.builtin ) {

			this.addBuiltinTab( tab );

		}

		// Update panel size when tabs change
		this.updatePanelSize();

	}

	addBuiltinTab( tab ) {

		// Create a button for the builtin tab in the profiler-toggle
		const builtinButton = document.createElement( 'button' );
		builtinButton.className = 'builtin-tab-btn';

		// Use icon if provided, otherwise use first letter
		if ( tab.icon ) {

			builtinButton.innerHTML = tab.icon;

		} else {

			builtinButton.textContent = tab.button.textContent.charAt( 0 ).toUpperCase();

		}

		builtinButton.title = tab.button.textContent;

		// Create mini-panel content container for this tab
		const miniContent = document.createElement( 'div' );
		miniContent.className = 'mini-panel-content';
		miniContent.style.display = 'none';

		// Store references in the tab object
		tab.builtinButton = builtinButton;
		tab.miniContent = miniContent;

		this.miniPanel.appendChild( miniContent );

		builtinButton.onclick = ( e ) => {

			e.stopPropagation(); // Prevent toggle panel from triggering

			const isPanelVisible = this.panel.classList.contains( 'visible' );

			if ( isPanelVisible ) {

				// Panel is visible - navigate to tab
				if ( ! tab.isVisible ) {

					tab.show();

				}

				if ( tab.isDetached ) {

					// If tab is detached, just bring its window to front
					if ( tab.detachedWindow ) {

						this.bringWindowToFront( tab.detachedWindow.panel );

					}

				} else {

					// Activate the tab
					this.setActiveTab( tab.id );

				}

			} else {

				// Panel is hidden - toggle mini-panel for this tab
				const isCurrentlyActive = miniContent.style.display !== 'none' && miniContent.children.length > 0;

				// Hide all other mini-panel contents
				this.miniPanel.querySelectorAll( '.mini-panel-content' ).forEach( content => {

					content.style.display = 'none';

				} );

				// Remove active state from all builtin buttons
				this.builtinTabsContainer.querySelectorAll( '.builtin-tab-btn' ).forEach( btn => {

					btn.classList.remove( 'active' );

				} );

				if ( isCurrentlyActive ) {

					// Toggle off - hide mini-panel and move content back
					this.miniPanel.classList.remove( 'visible' );
					miniContent.style.display = 'none';

					// Move content back to main panel
					if ( miniContent.firstChild ) {

						tab.content.appendChild( miniContent.firstChild );

					}

				} else {

					// Toggle on - show mini-panel with this tab's content
					builtinButton.classList.add( 'active' );

					// Move actual content to mini-panel (not clone) if not already there
					if ( ! miniContent.firstChild ) {

						const actualContent = tab.content.querySelector( '.list-scroll-wrapper' ) || tab.content.firstElementChild;

						if ( actualContent ) {

							miniContent.appendChild( actualContent );

						}

					}

					// Show after content is moved
					miniContent.style.display = 'block';
					this.miniPanel.classList.add( 'visible' );

				}

			}

		};

		this.builtinTabsContainer.appendChild( builtinButton );

		// Store references
		tab.builtinButton = builtinButton;
		tab.miniContent = miniContent;
		tab.profiler = this;

		// If the tab was hidden before being added, hide the builtin button
		if ( ! tab.isVisible ) {

			builtinButton.style.display = 'none';
			miniContent.style.display = 'none';

			// Hide the builtin-tabs-container if all builtin buttons are hidden
			const hasVisibleBuiltinButtons = Array.from( this.builtinTabsContainer.querySelectorAll( '.builtin-tab-btn' ) )
				.some( btn => btn.style.display !== 'none' );

			if ( ! hasVisibleBuiltinButtons ) {

				this.builtinTabsContainer.style.display = 'none';

			}

		}

	}

	updatePanelSize() {

		// Check if there are any visible tabs in the panel
		const hasVisibleTabs = Object.values( this.tabs ).some( tab => ! tab.isDetached && tab.isVisible );

		// Add or remove CSS class to indicate no tabs state
		if ( ! hasVisibleTabs ) {

			this.panel.classList.add( 'no-tabs' );

			// If maximized and no tabs, restore to normal size
			if ( this.panel.classList.contains( 'maximized' ) ) {

				this.panel.classList.remove( 'maximized' );
				this.maximizeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';

			}

			// No tabs visible - set to minimum size
			if ( this.position === 'bottom' ) {

				this.panel.style.height = '38px';

			} else if ( this.position === 'right' ) {

				// 45px = width of one button column
				this.panel.style.width = '45px';

			}

		} else {

			this.panel.classList.remove( 'no-tabs' );

			if ( Object.keys( this.tabs ).length > 0 ) {

				// Has tabs - restore to saved size only if we had set it to minimum before
				if ( this.position === 'bottom' ) {

					const currentHeight = parseInt( this.panel.style.height );
					if ( currentHeight === 38 ) {

						this.panel.style.height = `${ this.lastHeightBottom }px`;

					}

				} else if ( this.position === 'right' ) {

					const currentWidth = parseInt( this.panel.style.width );
					if ( currentWidth === 45 ) {

						this.panel.style.width = `${ this.lastWidthRight }px`;

					}

				}

			}

		}

	}

	setupTabDragAndDrop( tab ) {

		// Disable drag and drop on mobile devices
		if ( this.isMobile ) {

			tab.button.addEventListener( 'click', () => {

				this.setActiveTab( tab.id );

			} );

			return;

		}

		// Disable drag and drop if tab doesn't allow detach
		if ( tab.allowDetach === false ) {

			tab.button.addEventListener( 'click', () => {

				this.setActiveTab( tab.id );

			} );

			tab.button.style.cursor = 'default';

			return;

		}

		let isDragging = false;
		let startX, startY;
		let hasMoved = false;
		let previewWindow = null;
		const dragThreshold = 10; // pixels to move before starting drag

		const onDragStart = ( e ) => {

			startX = e.clientX;
			startY = e.clientY;
			isDragging = false;
			hasMoved = false;
			tab.button.setPointerCapture( e.pointerId );

		};

		const onDragMove = ( e ) => {

			const currentX = e.clientX;
			const currentY = e.clientY;

			const deltaX = Math.abs( currentX - startX );
			const deltaY = Math.abs( currentY - startY );

			if ( ! isDragging && ( deltaX > dragThreshold || deltaY > dragThreshold ) ) {

				isDragging = true;
				tab.button.style.cursor = 'grabbing';
				tab.button.style.opacity = '0.5';
				tab.button.style.transform = 'scale(1.05)';

				previewWindow = this.createPreviewWindow( tab, currentX, currentY );
				previewWindow.style.opacity = '0.8';

			}

			if ( isDragging && previewWindow ) {

				hasMoved = true;
				e.preventDefault();

				previewWindow.style.left = `${ currentX - 200 }px`;
				previewWindow.style.top = `${ currentY - 20 }px`;

			}

		};

		const onDragEnd = () => {

			if ( isDragging && hasMoved && previewWindow ) {

				if ( previewWindow.parentNode ) {

					previewWindow.parentNode.removeChild( previewWindow );

				}

				const finalX = parseInt( previewWindow.style.left ) + 200;
				const finalY = parseInt( previewWindow.style.top ) + 20;

				this.detachTab( tab, finalX, finalY );

			} else if ( ! hasMoved ) {

				this.setActiveTab( tab.id );

				if ( previewWindow && previewWindow.parentNode ) {

					previewWindow.parentNode.removeChild( previewWindow );

				}

			} else if ( previewWindow ) {

				if ( previewWindow.parentNode ) {

					previewWindow.parentNode.removeChild( previewWindow );

				}

			}

			tab.button.style.opacity = '';
			tab.button.style.transform = '';
			tab.button.style.cursor = '';
			isDragging = false;
			hasMoved = false;
			previewWindow = null;

			tab.button.removeEventListener( 'pointermove', onDragMove );
			tab.button.removeEventListener( 'pointerup', onDragEnd );
			tab.button.removeEventListener( 'pointercancel', onDragEnd );

		};

		tab.button.addEventListener( 'pointerdown', ( e ) => {

			onDragStart( e );
			tab.button.addEventListener( 'pointermove', onDragMove );
			tab.button.addEventListener( 'pointerup', onDragEnd );
			tab.button.addEventListener( 'pointercancel', onDragEnd );

		} );

		// Set cursor to grab for tabs that can be detached
		tab.button.style.cursor = 'grab';

	}

	createPreviewWindow( tab, x, y ) {

		const windowPanel = document.createElement( 'div' );
		windowPanel.className = 'detached-tab-panel';
		windowPanel.style.left = `${ x - 200 }px`;
		windowPanel.style.top = `${ y - 20 }px`;
		windowPanel.style.pointerEvents = 'none'; // Preview only

		// Set z-index for preview window to be on top
		this.maxZIndex ++;
		windowPanel.style.setProperty( 'z-index', this.maxZIndex, 'important' );

		const windowHeader = document.createElement( 'div' );
		windowHeader.className = 'detached-tab-header';

		const title = document.createElement( 'span' );
		title.textContent = tab.button.textContent.replace( '⇱', '' ).trim();
		windowHeader.appendChild( title );

		const headerControls = document.createElement( 'div' );
		headerControls.className = 'detached-header-controls';

		const reattachBtn = document.createElement( 'button' );
		reattachBtn.className = 'detached-reattach-btn';
		reattachBtn.innerHTML = '↩';
		headerControls.appendChild( reattachBtn );
		windowHeader.appendChild( headerControls );

		const windowContent = document.createElement( 'div' );
		windowContent.className = 'detached-tab-content';

		const resizer = document.createElement( 'div' );
		resizer.className = 'detached-tab-resizer';

		windowPanel.appendChild( resizer );
		windowPanel.appendChild( windowHeader );
		windowPanel.appendChild( windowContent );

		document.body.appendChild( windowPanel );

		return windowPanel;

	}

	detachTab( tab, x, y ) {

		if ( tab.isDetached ) return;

		// Check if tab allows detachment
		if ( tab.allowDetach === false ) return;

		const allButtons = Array.from( this.tabsContainer.children );

		const tabIdsInOrder = allButtons.map( btn => {

			return Object.keys( this.tabs ).find( id => this.tabs[ id ].button === btn );

		} ).filter( id => id !== undefined );

		const currentIndex = tabIdsInOrder.indexOf( tab.id );

		let newActiveTab = null;

		if ( this.activeTabId === tab.id ) {

			tab.setActive( false );

			const remainingTabs = tabIdsInOrder.filter( id =>
				id !== tab.id &&
				! this.tabs[ id ].isDetached &&
				this.tabs[ id ].isVisible
			);

			if ( remainingTabs.length > 0 ) {

				for ( let i = currentIndex - 1; i >= 0; i -- ) {

					if ( remainingTabs.includes( tabIdsInOrder[ i ] ) ) {

						newActiveTab = tabIdsInOrder[ i ];
						break;

					}

				}

				if ( ! newActiveTab ) {

					for ( let i = currentIndex + 1; i < tabIdsInOrder.length; i ++ ) {

						if ( remainingTabs.includes( tabIdsInOrder[ i ] ) ) {

							newActiveTab = tabIdsInOrder[ i ];
							break;

						}

					}

				}

				if ( ! newActiveTab ) {

					newActiveTab = remainingTabs[ 0 ];

				}

			}

		}

		if ( tab.button.parentNode ) {

			tab.button.parentNode.removeChild( tab.button );

		}

		if ( tab.content.parentNode ) {

			tab.content.parentNode.removeChild( tab.content );

		}

		const detachedWindow = this.createDetachedWindow( tab, x, y );
		this.detachedWindows.push( detachedWindow );

		tab.isDetached = true;
		tab.detachedWindow = detachedWindow;

		if ( newActiveTab ) {

			this.setActiveTab( newActiveTab );

		} else if ( this.activeTabId === tab.id ) {

			this.activeTabId = null;

		}

		// Update panel size after detaching
		this.updatePanelSize();

		this.saveLayout();

	}

	createDetachedWindow( tab, x, y ) {

		// Constrain initial position to window bounds
		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;
		const estimatedWidth = 400; // Default detached window width
		const estimatedHeight = 300; // Default detached window height

		let constrainedX = x - 200;
		let constrainedY = y - 20;

		if ( constrainedX + estimatedWidth > windowWidth ) {

			constrainedX = windowWidth - estimatedWidth;

		}

		if ( constrainedX < 0 ) {

			constrainedX = 0;

		}

		if ( constrainedY + estimatedHeight > windowHeight ) {

			constrainedY = windowHeight - estimatedHeight;

		}

		if ( constrainedY < 0 ) {

			constrainedY = 0;

		}

		const windowPanel = document.createElement( 'div' );
		windowPanel.className = 'detached-tab-panel';
		windowPanel.style.left = `${ constrainedX }px`;
		windowPanel.style.top = `${ constrainedY }px`;

		if ( ! this.panel.classList.contains( 'visible' ) ) {

			windowPanel.style.opacity = '0';
			windowPanel.style.visibility = 'hidden';
			windowPanel.style.pointerEvents = 'none';

		}

		// Hide detached window if tab is not visible
		if ( ! tab.isVisible ) {

			windowPanel.style.display = 'none';

		}

		const windowHeader = document.createElement( 'div' );
		windowHeader.className = 'detached-tab-header';

		const title = document.createElement( 'span' );
		title.textContent = tab.button.textContent.replace( '⇱', '' ).trim();
		windowHeader.appendChild( title );

		const headerControls = document.createElement( 'div' );
		headerControls.className = 'detached-header-controls';

		const reattachBtn = document.createElement( 'button' );
		reattachBtn.className = 'detached-reattach-btn';
		reattachBtn.innerHTML = '↩';
		reattachBtn.title = 'Reattach to main panel';
		reattachBtn.onclick = () => this.reattachTab( tab );

		headerControls.appendChild( reattachBtn );
		windowHeader.appendChild( headerControls );

		const windowContent = document.createElement( 'div' );
		windowContent.className = 'detached-tab-content';
		windowContent.appendChild( tab.content );

		// Make sure content is visible
		tab.content.style.display = 'block';
		tab.content.classList.add( 'active' );

		// Create resize handles for all edges
		const resizerTop = document.createElement( 'div' );
		resizerTop.className = 'detached-tab-resizer-top';

		const resizerRight = document.createElement( 'div' );
		resizerRight.className = 'detached-tab-resizer-right';

		const resizerBottom = document.createElement( 'div' );
		resizerBottom.className = 'detached-tab-resizer-bottom';

		const resizerLeft = document.createElement( 'div' );
		resizerLeft.className = 'detached-tab-resizer-left';

		const resizerCorner = document.createElement( 'div' );
		resizerCorner.className = 'detached-tab-resizer';

		windowPanel.appendChild( resizerTop );
		windowPanel.appendChild( resizerRight );
		windowPanel.appendChild( resizerBottom );
		windowPanel.appendChild( resizerLeft );
		windowPanel.appendChild( resizerCorner );
		windowPanel.appendChild( windowHeader );
		windowPanel.appendChild( windowContent );

		document.body.appendChild( windowPanel );

		// Setup window dragging
		this.setupDetachedWindowDrag( windowPanel, windowHeader, tab );

		// Setup window resizing
		this.setupDetachedWindowResize( windowPanel, resizerTop, resizerRight, resizerBottom, resizerLeft, resizerCorner );

		// Use the same z-index that was set on the preview window
		windowPanel.style.setProperty( 'z-index', this.maxZIndex, 'important' );

		return { panel: windowPanel, tab: tab };

	}

	bringWindowToFront( windowPanel ) {

		// Increment the max z-index and apply it to the clicked window
		this.maxZIndex ++;
		windowPanel.style.setProperty( 'z-index', this.maxZIndex, 'important' );

	}

	setupDetachedWindowDrag( windowPanel, header, tab ) {

		let isDragging = false;
		let startX, startY, startLeft, startTop;

		// Bring window to front when clicking anywhere on it
		windowPanel.addEventListener( 'pointerdown', () => {

			this.bringWindowToFront( windowPanel );

		} );

		const onDragStart = ( e ) => {

			if ( e.target.classList.contains( 'detached-reattach-btn' ) ) {

				return;

			}

			// Bring window to front when starting to drag
			this.bringWindowToFront( windowPanel );

			isDragging = true;
			header.style.cursor = 'grabbing';
			header.setPointerCapture( e.pointerId );

			startX = e.clientX;
			startY = e.clientY;

			const rect = windowPanel.getBoundingClientRect();
			startLeft = rect.left;
			startTop = rect.top;

		};

		const onDragMove = ( e ) => {

			if ( ! isDragging ) return;

			e.preventDefault();

			const currentX = e.clientX;
			const currentY = e.clientY;

			const deltaX = currentX - startX;
			const deltaY = currentY - startY;

			let newLeft = startLeft + deltaX;
			let newTop = startTop + deltaY;

			// Constrain to window bounds (allow half width/height to extend outside)
			const windowWidth = window.innerWidth;
			const windowHeight = window.innerHeight;
			const panelWidth = windowPanel.offsetWidth;
			const panelHeight = windowPanel.offsetHeight;
			const halfWidth = panelWidth / 2;
			const halfHeight = panelHeight / 2;

			// Allow window to extend half its width beyond right edge
			if ( newLeft + panelWidth > windowWidth + halfWidth ) {

				newLeft = windowWidth + halfWidth - panelWidth;

			}

			// Allow window to extend half its width beyond left edge
			if ( newLeft < - halfWidth ) {

				newLeft = - halfWidth;

			}

			// Allow window to extend half its height beyond bottom edge
			if ( newTop + panelHeight > windowHeight + halfHeight ) {

				newTop = windowHeight + halfHeight - panelHeight;

			}

			// Allow window to extend half its height beyond top edge
			if ( newTop < - halfHeight ) {

				newTop = - halfHeight;

			}

			windowPanel.style.left = `${ newLeft }px`;
			windowPanel.style.top = `${ newTop }px`;

			// Check if cursor is over the inspector panel
			const panelRect = this.panel.getBoundingClientRect();
			const isOverPanel = currentX >= panelRect.left && currentX <= panelRect.right &&
								currentY >= panelRect.top && currentY <= panelRect.bottom;

			if ( isOverPanel ) {

				windowPanel.style.opacity = '0.5';
				this.panel.style.outline = '2px solid var(--accent-color)';

			} else {

				windowPanel.style.opacity = '';
				this.panel.style.outline = '';

			}

		};

		const onDragEnd = ( e ) => {

			if ( ! isDragging ) return;

			isDragging = false;
			header.style.cursor = '';
			windowPanel.style.opacity = '';
			this.panel.style.outline = '';

			// Check if dropped over the inspector panel
			const currentX = e.clientX;
			const currentY = e.clientY;

			if ( currentX !== undefined && currentY !== undefined ) {

				const panelRect = this.panel.getBoundingClientRect();
				const isOverPanel = currentX >= panelRect.left && currentX <= panelRect.right &&
									currentY >= panelRect.top && currentY <= panelRect.bottom;

				if ( isOverPanel && tab ) {

					// Reattach the tab
					this.reattachTab( tab );

				} else {

					// Save layout after moving detached window
					this.saveLayout();

				}

			}

			header.removeEventListener( 'pointermove', onDragMove );
			header.removeEventListener( 'pointerup', onDragEnd );
			header.removeEventListener( 'pointercancel', onDragEnd );

		};

		header.addEventListener( 'pointerdown', ( e ) => {

			onDragStart( e );
			header.addEventListener( 'pointermove', onDragMove );
			header.addEventListener( 'pointerup', onDragEnd );
			header.addEventListener( 'pointercancel', onDragEnd );

		} );

		header.style.cursor = 'grab';

	}

	setupDetachedWindowResize( windowPanel, resizerTop, resizerRight, resizerBottom, resizerLeft, resizerCorner ) {

		const minWidth = 250;
		const minHeight = 150;

		const setupResizer = ( resizer, direction ) => {

			let isResizing = false;
			let startX, startY, startWidth, startHeight, startLeft, startTop;

			const onResizeStart = ( e ) => {

				e.preventDefault();
				e.stopPropagation();
				isResizing = true;

				// Bring window to front when resizing
				this.bringWindowToFront( windowPanel );

				resizer.setPointerCapture( e.pointerId );

				startX = e.clientX;
				startY = e.clientY;
				startWidth = windowPanel.offsetWidth;
				startHeight = windowPanel.offsetHeight;
				startLeft = windowPanel.offsetLeft;
				startTop = windowPanel.offsetTop;

			};

			const onResizeMove = ( e ) => {

				if ( ! isResizing ) return;

				e.preventDefault();

				const currentX = e.clientX;
				const currentY = e.clientY;

				const deltaX = currentX - startX;
				const deltaY = currentY - startY;

				const windowWidth = window.innerWidth;
				const windowHeight = window.innerHeight;

				if ( direction === 'right' || direction === 'corner' ) {

					const newWidth = startWidth + deltaX;
					const maxWidth = windowWidth - startLeft;

					if ( newWidth >= minWidth && newWidth <= maxWidth ) {

						windowPanel.style.width = `${ newWidth }px`;

					}

				}

				if ( direction === 'bottom' || direction === 'corner' ) {

					const newHeight = startHeight + deltaY;
					const maxHeight = windowHeight - startTop;

					if ( newHeight >= minHeight && newHeight <= maxHeight ) {

						windowPanel.style.height = `${ newHeight }px`;

					}

				}

				if ( direction === 'left' ) {

					const newWidth = startWidth - deltaX;
					const maxLeft = startLeft + startWidth - minWidth;

					if ( newWidth >= minWidth ) {

						const newLeft = startLeft + deltaX;

						if ( newLeft >= 0 && newLeft <= maxLeft ) {

							windowPanel.style.width = `${ newWidth }px`;
							windowPanel.style.left = `${ newLeft }px`;

						}

					}

				}

				if ( direction === 'top' ) {

					const newHeight = startHeight - deltaY;
					const maxTop = startTop + startHeight - minHeight;

					if ( newHeight >= minHeight ) {

						const newTop = startTop + deltaY;

						if ( newTop >= 0 && newTop <= maxTop ) {

							windowPanel.style.height = `${ newHeight }px`;
							windowPanel.style.top = `${ newTop }px`;

						}

					}

				}

			};

			const onResizeEnd = () => {

				isResizing = false;

				resizer.removeEventListener( 'pointermove', onResizeMove );
				resizer.removeEventListener( 'pointerup', onResizeEnd );
				resizer.removeEventListener( 'pointercancel', onResizeEnd );

				// Save layout after resizing detached window
				this.saveLayout();

			};

			resizer.addEventListener( 'pointerdown', ( e ) => {

				onResizeStart( e );
				resizer.addEventListener( 'pointermove', onResizeMove );
				resizer.addEventListener( 'pointerup', onResizeEnd );
				resizer.addEventListener( 'pointercancel', onResizeEnd );

			} );

		};

		// Setup all resizers
		setupResizer( resizerTop, 'top' );
		setupResizer( resizerRight, 'right' );
		setupResizer( resizerBottom, 'bottom' );
		setupResizer( resizerLeft, 'left' );
		setupResizer( resizerCorner, 'corner' );

	}

	reattachTab( tab ) {

		if ( ! tab.isDetached ) return;

		if ( tab.detachedWindow ) {

			const index = this.detachedWindows.indexOf( tab.detachedWindow );

			if ( index > - 1 ) {

				this.detachedWindows.splice( index, 1 );

			}

			if ( tab.detachedWindow.panel.parentNode ) {

				tab.detachedWindow.panel.parentNode.removeChild( tab.detachedWindow.panel );

			}

			tab.detachedWindow = null;

		}

		tab.isDetached = false;

		// Get all tabs and sort by their original index to determine the correct order
		const allTabs = Object.values( this.tabs );
		const allTabsSorted = allTabs
			.filter( t => t.originalIndex !== undefined && t.isVisible )
			.sort( ( a, b ) => a.originalIndex - b.originalIndex );

		// Get currently attached tab buttons
		const currentButtons = Array.from( this.tabsContainer.children );

		// Find the correct position for this tab
		let insertIndex = 0;
		for ( const t of allTabsSorted ) {

			if ( t.id === tab.id ) {

				break;

			}

			// Count only non-detached tabs that come before this one
			if ( ! t.isDetached ) {

				insertIndex ++;

			}

		}

		// Insert the button at the correct position
		if ( insertIndex >= currentButtons.length || currentButtons.length === 0 ) {

			// If insert index is beyond current buttons, or no buttons exist, append at the end
			this.tabsContainer.appendChild( tab.button );

		} else {

			// Insert before the button at the insert index
			this.tabsContainer.insertBefore( tab.button, currentButtons[ insertIndex ] );

		}

		this.contentWrapper.appendChild( tab.content );

		this.setActiveTab( tab.id );

		// Update panel size after reattaching
		this.updatePanelSize();

		this.saveLayout();

	}

	setActiveTab( id ) {

		if ( this.activeTabId && this.tabs[ this.activeTabId ] && ! this.tabs[ this.activeTabId ].isDetached ) {

			this.tabs[ this.activeTabId ].setActive( false );

		}

		this.activeTabId = id;

		if ( this.tabs[ id ] ) {

			this.tabs[ id ].setActive( true );

		}

	}

	togglePanel() {

		this.panel.classList.toggle( 'visible' );
		this.toggleButton.classList.toggle( 'hidden' );

		const isVisible = this.panel.classList.contains( 'visible' );

		if ( isVisible ) {

			// Save mini-panel state before hiding
			this.savedMiniPanelState = {
				isVisible: this.miniPanel.classList.contains( 'visible' ),
				activeTabId: null,
				contentMap: {}
			};

			// Find which tab was active in mini-panel
			this.miniPanel.querySelectorAll( '.mini-panel-content' ).forEach( content => {

				if ( content.style.display !== 'none' && content.firstChild ) {

					// Find the tab that owns this content
					Object.values( this.tabs ).forEach( tab => {

						if ( tab.miniContent === content ) {

							this.savedMiniPanelState.activeTabId = tab.id;
							// Move content back to main panel
							tab.content.appendChild( content.firstChild );

						}

					} );

				}

			} );

			// Hide mini-panel temporarily
			this.miniPanel.classList.remove( 'visible' );

			// Hide all mini-panel contents
			this.miniPanel.querySelectorAll( '.mini-panel-content' ).forEach( content => {

				content.style.display = 'none';

			} );

			// Remove active state from builtin buttons
			this.builtinTabsContainer.querySelectorAll( '.builtin-tab-btn' ).forEach( btn => {

				btn.classList.remove( 'active' );

			} );

		} else {

			// Restore mini-panel state when minimizing
			if ( this.savedMiniPanelState && this.savedMiniPanelState.isVisible && this.savedMiniPanelState.activeTabId ) {

				const tab = this.tabs[ this.savedMiniPanelState.activeTabId ];

				if ( tab && tab.miniContent && tab.builtinButton ) {

					// Restore mini-panel visibility
					this.miniPanel.classList.add( 'visible' );
					tab.miniContent.style.display = 'block';
					tab.builtinButton.classList.add( 'active' );

					// Move content back to mini-panel
					const actualContent = tab.content.querySelector( '.list-scroll-wrapper, .profiler-content > *' );

					if ( actualContent ) {

						tab.miniContent.appendChild( actualContent );

					}

				}

			}

		}

		this.detachedWindows.forEach( detachedWindow => {

			if ( isVisible ) {

				detachedWindow.panel.style.opacity = '';
				detachedWindow.panel.style.visibility = '';
				detachedWindow.panel.style.pointerEvents = '';

			} else {

				detachedWindow.panel.style.opacity = '0';
				detachedWindow.panel.style.visibility = 'hidden';
				detachedWindow.panel.style.pointerEvents = 'none';

			}

		} );

	}

	togglePosition() {

		const newPosition = this.position === 'bottom' ? 'right' : 'bottom';
		this.setPosition( newPosition );

	}

	setPosition( targetPosition ) {

		if ( this.position === targetPosition ) return;

		this.panel.style.transition = 'none';

		// Check if panel is currently maximized
		const isMaximized = this.panel.classList.contains( 'maximized' );

		if ( targetPosition === 'right' ) {

			this.position = 'right';
			this.floatingBtn.classList.add( 'active' );
			this.floatingBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M3 15h18"></path></svg>';
			this.floatingBtn.title = 'Switch to Bottom';

			// Apply right position styles
			this.panel.classList.remove( 'position-bottom' );
			this.panel.classList.add( 'position-right' );
			this.panel.style.bottom = '';
			this.panel.style.top = '0';
			this.panel.style.right = '0';
			this.panel.style.left = '';

			// Apply size based on maximized state
			if ( isMaximized ) {

				this.panel.style.width = '100vw';
				this.panel.style.height = '100%';

			} else {

				this.panel.style.width = `${ this.lastWidthRight }px`;
				this.panel.style.height = '100%';

			}

		} else {

			this.position = 'bottom';
			this.floatingBtn.classList.remove( 'active' );
			this.floatingBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="15" y1="3" x2="15" y2="21"></line></svg>';
			this.floatingBtn.title = 'Switch to Right Side';

			// Apply bottom position styles
			this.panel.classList.remove( 'position-right' );
			this.panel.classList.add( 'position-bottom' );
			this.panel.style.top = '';
			this.panel.style.right = '';
			this.panel.style.bottom = '0';
			this.panel.style.left = '0';

			// Apply size based on maximized state
			if ( isMaximized ) {

				this.panel.style.width = '100%';
				this.panel.style.height = '100vh';

			} else {

				this.panel.style.width = '100%';
				this.panel.style.height = `${ this.lastHeightBottom }px`;

			}

		}

		// Re-enable transition after a brief delay
		setTimeout( () => {

			this.panel.style.transition = '';

		}, 50 );

		// Update panel size based on visible tabs
		this.updatePanelSize();

		// Save layout after position change
		this.saveLayout();

	}

	saveLayout() {

		const layout = {
			position: this.position,
			lastHeightBottom: this.lastHeightBottom,
			lastWidthRight: this.lastWidthRight,
			activeTabId: this.activeTabId,
			detachedTabs: []
		};

		// Save detached windows state
		this.detachedWindows.forEach( detachedWindow => {

			const tab = detachedWindow.tab;
			const panel = detachedWindow.panel;

			// Get position values, ensuring they're valid numbers
			const left = parseFloat( panel.style.left ) || panel.offsetLeft || 0;
			const top = parseFloat( panel.style.top ) || panel.offsetTop || 0;
			const width = panel.offsetWidth;
			const height = panel.offsetHeight;

			layout.detachedTabs.push( {
				tabId: tab.id,
				originalIndex: tab.originalIndex !== undefined ? tab.originalIndex : 0,
				left: left,
				top: top,
				width: width,
				height: height
			} );

		} );

		try {

			localStorage.setItem( 'profiler-layout', JSON.stringify( layout ) );

		} catch ( e ) {

			console.warn( 'Failed to save profiler layout:', e );

		}

	}

	loadLayout() {

		try {

			const savedLayout = localStorage.getItem( 'profiler-layout' );

			if ( ! savedLayout ) return;

			const layout = JSON.parse( savedLayout );

			// Constrain detached tabs positions to current screen bounds
			if ( layout.detachedTabs && layout.detachedTabs.length > 0 ) {

				const windowWidth = window.innerWidth;
				const windowHeight = window.innerHeight;

				layout.detachedTabs = layout.detachedTabs.map( detachedTabData => {

					let { left, top, width, height } = detachedTabData;

					// Ensure width and height are within bounds
					if ( width > windowWidth ) {

						width = windowWidth - 100; // Leave some margin

					}

					if ( height > windowHeight ) {

						height = windowHeight - 100; // Leave some margin

					}

					// Allow window to extend half its width/height outside the screen
					const halfWidth = width / 2;
					const halfHeight = height / 2;

					// Constrain horizontal position (allow half width to extend beyond right edge)
					if ( left + width > windowWidth + halfWidth ) {

						left = windowWidth + halfWidth - width;

					}

					// Constrain horizontal position (allow half width to extend beyond left edge)
					if ( left < - halfWidth ) {

						left = - halfWidth;

					}

					// Constrain vertical position (allow half height to extend beyond bottom edge)
					if ( top + height > windowHeight + halfHeight ) {

						top = windowHeight + halfHeight - height;

					}

					// Constrain vertical position (allow half height to extend beyond top edge)
					if ( top < - halfHeight ) {

						top = - halfHeight;

					}

					return {
						...detachedTabData,
						left,
						top,
						width,
						height
					};

				} );

			}

			// Restore position and dimensions
			if ( layout.position ) {

				this.position = layout.position;

			}

			if ( layout.lastHeightBottom ) {

				this.lastHeightBottom = layout.lastHeightBottom;

			}

			if ( layout.lastWidthRight ) {

				this.lastWidthRight = layout.lastWidthRight;

			}

			// Constrain saved dimensions to current screen bounds
			const windowWidth = window.innerWidth;
			const windowHeight = window.innerHeight;

			if ( this.lastHeightBottom > windowHeight - 50 ) {

				this.lastHeightBottom = windowHeight - 50;

			}

			if ( this.lastWidthRight > windowWidth - 50 ) {

				this.lastWidthRight = windowWidth - 50;

			}

			// Apply the saved position after shell is set up
			if ( this.position === 'right' ) {

				this.floatingBtn.classList.add( 'active' );
				this.floatingBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M3 15h18"></path></svg>';
				this.floatingBtn.title = 'Switch to Bottom';

				this.panel.classList.remove( 'position-bottom' );
				this.panel.classList.add( 'position-right' );
				this.panel.style.bottom = '';
				this.panel.style.top = '0';
				this.panel.style.right = '0';
				this.panel.style.left = '';
				this.panel.style.width = `${ this.lastWidthRight }px`;
				this.panel.style.height = '100%';

			} else {

				this.panel.style.height = `${ this.lastHeightBottom }px`;

			}

			if ( layout.activeTabId ) {

				const willBeDetached = layout.detachedTabs &&
					layout.detachedTabs.some( dt => dt.tabId === layout.activeTabId );

				if ( willBeDetached ) {

					this.setActiveTab( layout.activeTabId );

				}

			}

			if ( layout.detachedTabs && layout.detachedTabs.length > 0 ) {

				this.pendingDetachedTabs = layout.detachedTabs;
				this.restoreDetachedTabs();

			}

			// Update panel size after loading layout
			this.updatePanelSize();

		} catch ( e ) {

			console.warn( 'Failed to load profiler layout:', e );

		}

	}

	restoreDetachedTabs() {

		if ( ! this.pendingDetachedTabs || this.pendingDetachedTabs.length === 0 ) return;

		this.pendingDetachedTabs.forEach( detachedTabData => {

			const tab = this.tabs[ detachedTabData.tabId ];

			if ( ! tab || tab.isDetached ) return;

			// Restore originalIndex if saved
			if ( detachedTabData.originalIndex !== undefined ) {

				tab.originalIndex = detachedTabData.originalIndex;

			}

			if ( tab.button.parentNode ) {

				tab.button.parentNode.removeChild( tab.button );

			}

			if ( tab.content.parentNode ) {

				tab.content.parentNode.removeChild( tab.content );

			}

			const detachedWindow = this.createDetachedWindow( tab, 0, 0 );

			detachedWindow.panel.style.left = `${ detachedTabData.left }px`;
			detachedWindow.panel.style.top = `${ detachedTabData.top }px`;
			detachedWindow.panel.style.width = `${ detachedTabData.width }px`;
			detachedWindow.panel.style.height = `${ detachedTabData.height }px`;

			// Constrain window to bounds after restoring position and size
			this.constrainWindowToBounds( detachedWindow.panel );

			this.detachedWindows.push( detachedWindow );

			tab.isDetached = true;
			tab.detachedWindow = detachedWindow;

		} );

		this.pendingDetachedTabs = null;

		// Update maxZIndex to be higher than all existing windows
		this.detachedWindows.forEach( detachedWindow => {

			const currentZIndex = parseInt( getComputedStyle( detachedWindow.panel ).zIndex ) || 0;
			if ( currentZIndex > this.maxZIndex ) {

				this.maxZIndex = currentZIndex;

			}

		} );

		const needsNewActiveTab = ! this.activeTabId ||
			! this.tabs[ this.activeTabId ] ||
			this.tabs[ this.activeTabId ].isDetached ||
			! this.tabs[ this.activeTabId ].isVisible;

		if ( needsNewActiveTab ) {

			const tabIds = Object.keys( this.tabs );
			const availableTabs = tabIds.filter( id =>
				! this.tabs[ id ].isDetached &&
				this.tabs[ id ].isVisible
			);

			if ( availableTabs.length > 0 ) {

				const buttons = Array.from( this.tabsContainer.children );
				const orderedTabIds = buttons.map( btn => {

					return Object.keys( this.tabs ).find( id => this.tabs[ id ].button === btn );

				} ).filter( id =>
					id !== undefined &&
					! this.tabs[ id ].isDetached &&
					this.tabs[ id ].isVisible
				);

				this.setActiveTab( orderedTabIds[ 0 ] || availableTabs[ 0 ] );

			} else {

				this.activeTabId = null;

			}

		}

		// Update panel size after restoring detached tabs
		this.updatePanelSize();

	}

}
