/**
 * Tab class
 * @param {string} title - The title of the tab
 * @param {Object} options - Options for the tab
 * @param {boolean} [options.allowDetach=true] - Whether the tab can be detached into a separate window
 *
 * @example
 * // Create a tab that can be detached (default behavior)
 * const tab1 = new Tab('My Tab');
 *
 * // Create a tab that cannot be detached
 * const tab2 = new Tab('Fixed Tab', { allowDetach: false });
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

	}

}
