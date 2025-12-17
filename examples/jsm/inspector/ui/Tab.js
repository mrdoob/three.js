/**
 * Tab class
 * @param {string} title - The title of the tab
 * @param {Object} options - Options for the tab
 * @param {boolean} [options.allowDetach=true] - Whether the tab can be detached into a separate window
 * @param {boolean} [options.builtin=false] - Whether the tab should appear in the profiler-toggle button
 * @param {string} [options.icon] - SVG icon HTML for the builtin button
 *
 * @example
 * // Create a tab that can be detached (default behavior)
 * const tab1 = new Tab('My Tab');
 *
 * // Create a tab that cannot be detached
 * const tab2 = new Tab('Fixed Tab', { allowDetach: false });
 *
 * // Create a builtin tab that appears in the profiler-toggle
 * const tab3 = new Tab('Builtin Tab', { builtin: true });
 *
 * // Create a builtin tab with custom icon
 * const tab4 = new Tab('Settings', { builtin: true, icon: '<svg>...</svg>' });
 *
 * // Control builtin tab visibility
 * tab3.showBuiltin(); // Show the builtin button and mini-content
 * tab3.hideBuiltin(); // Hide the builtin button and mini-content
 */
export class Tab {

	constructor( title, options = {} ) {

		this.id = title.toLowerCase();
		this.button = document.createElement( 'button' );
		this.button.className = 'tab-btn';
		this.button.textContent = title;

		this.content = document.createElement( 'div' );
		this.content.id = `${this.id}-content`;
		this.content.className = 'profiler-content';

		this.isActive = false;
		this.isVisible = true;
		this.isDetached = false;
		this.detachedWindow = null;
		this.allowDetach = options.allowDetach !== undefined ? options.allowDetach : true;
		this.builtin = options.builtin !== undefined ? options.builtin : false;
		this.icon = options.icon || null;
		this.builtinButton = null; // Reference to the builtin button in profiler-toggle
		this.miniContent = null; // Reference to the mini-panel content container
		this.profiler = null; // Reference to the profiler instance
		this.onVisibilityChange = null; // Callback for visibility changes

	}

	setActive( isActive ) {

		this.button.classList.toggle( 'active', isActive );
		this.content.classList.toggle( 'active', isActive );

		this.isActive = isActive;

	}

	show() {

		this.content.style.display = '';
		this.button.style.display = '';

		this.isVisible = true;

		// Show detached window if tab is detached
		if ( this.isDetached && this.detachedWindow ) {

			this.detachedWindow.panel.style.display = '';

		}

		// Notify profiler of visibility change
		if ( this.onVisibilityChange ) {

			this.onVisibilityChange();

		}

		this.showBuiltin();

	}

	hide() {

		this.content.style.display = 'none';
		this.button.style.display = 'none';

		this.isVisible = false;

		// Hide detached window if tab is detached
		if ( this.isDetached && this.detachedWindow ) {

			this.detachedWindow.panel.style.display = 'none';

		}

		// Notify profiler of visibility change
		if ( this.onVisibilityChange ) {

			this.onVisibilityChange();

		}

		this.hideBuiltin();

	}

	showBuiltin() {

		if ( ! this.builtin ) return;

		// Show the builtin-tabs-container
		if ( this.profiler && this.profiler.builtinTabsContainer ) {

			this.profiler.builtinTabsContainer.style.display = '';

		}

		// Show the button
		if ( this.builtinButton ) {

			this.builtinButton.style.display = '';

		}

		// Show and activate the mini-panel with content
		if ( this.miniContent && this.profiler ) {

			// Hide all other mini-panel contents
			this.profiler.miniPanel.querySelectorAll( '.mini-panel-content' ).forEach( content => {

				content.style.display = 'none';

			} );

			// Remove active state from all builtin buttons
			this.profiler.builtinTabsContainer.querySelectorAll( '.builtin-tab-btn' ).forEach( btn => {

				btn.classList.remove( 'active' );

			} );

			// Activate this tab's button
			if ( this.builtinButton ) {

				this.builtinButton.classList.add( 'active' );

			}

			// Move content to mini-panel if not already there
			if ( ! this.miniContent.firstChild ) {

				const actualContent = this.content.querySelector( '.list-scroll-wrapper' ) || this.content.firstElementChild;

				if ( actualContent ) {

					this.miniContent.appendChild( actualContent );

				}

			}

			// Show the mini-panel and content
			this.miniContent.style.display = 'block';
			this.profiler.miniPanel.classList.add( 'visible' );

		}

	}

	hideBuiltin() {

		if ( ! this.builtin ) return;

		// Hide the button
		if ( this.builtinButton ) {

			this.builtinButton.style.display = 'none';

		}

		// Hide the mini-panel content
		if ( this.miniContent ) {

			this.miniContent.style.display = 'none';

			// Move content back to main panel
			if ( this.miniContent.firstChild ) {

				this.content.appendChild( this.miniContent.firstChild );

			}

		}

		// Deactivate button
		if ( this.builtinButton ) {

			this.builtinButton.classList.remove( 'active' );

		}

		// Hide mini-panel if no content is visible
		if ( this.profiler ) {

			const hasVisibleContent = Array.from( this.profiler.miniPanel.querySelectorAll( '.mini-panel-content' ) )
				.some( content => content.style.display !== 'none' );

			if ( ! hasVisibleContent ) {

				this.profiler.miniPanel.classList.remove( 'visible' );

			}

			// Hide the builtin-tabs-container if all builtin buttons are hidden
			const hasVisibleBuiltinButtons = Array.from( this.profiler.builtinTabsContainer.querySelectorAll( '.builtin-tab-btn' ) )
				.some( btn => btn.style.display !== 'none' );

			if ( ! hasVisibleBuiltinButtons ) {

				this.profiler.builtinTabsContainer.style.display = 'none';

			}

		}

	}

}
