export class Tab {

	constructor( title ) {

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

	}

	hide() {

		this.content.style.display = 'none';
		this.button.style.display = 'none';

		this.isVisible = false;

		// Hide detached window if tab is detached
		if ( this.isDetached && this.detachedWindow ) {

			this.detachedWindow.panel.style.display = 'none';

		}

	}

}
