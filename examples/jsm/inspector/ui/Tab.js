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

	}

	hide() {

		this.content.style.display = 'none';
		this.button.style.display = 'none';

		this.isVisible = false;

	}

}
