import { Style } from './Style.js';

export class Profiler {

	constructor() {

		this.tabs = {};
		this.activeTabId = null;
		this.isResizing = false;
		this.lastHeight = 350;

		Style.init();

		this.setupShell();
		this.setupResizing();

	}

	setupShell() {

		this.domElement = document.createElement( 'div' );
		this.domElement.id = 'profiler-shell';

		this.toggleButton = document.createElement( 'button' );
		this.toggleButton.id = 'profiler-toggle';
		this.toggleButton.innerHTML = `
<span id="toggle-text">
	<span id="fps-counter">-</span>
	<span class="fps-label">FPS</span>
</span>
<!-- <span class="toggle-separator"></span> -->
<span id="toggle-icon">
	<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-device-ipad-horizontal-search"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.5 20h-6.5a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v5.5" /><path d="M9 17h2" /><path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M20.2 20.2l1.8 1.8" /></svg>
</span>
`;
		this.toggleButton.onclick = () => this.togglePanel();

		this.panel = document.createElement( 'div' );
		this.panel.id = 'profiler-panel';

		const header = document.createElement( 'div' );
		header.className = 'profiler-header';
		this.tabsContainer = document.createElement( 'div' );
		this.tabsContainer.className = 'profiler-tabs';

		const controls = document.createElement( 'div' );
		controls.className = 'profiler-controls';

		this.maximizeBtn = document.createElement( 'button' );
		this.maximizeBtn.id = 'maximize-btn';
		this.maximizeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
		this.maximizeBtn.onclick = () => this.toggleMaximize();

		const hideBtn = document.createElement( 'button' );
		hideBtn.id = 'hide-panel-btn';
		hideBtn.textContent = '-';
		hideBtn.onclick = () => this.togglePanel();

		controls.append( this.maximizeBtn, hideBtn );
		header.append( this.tabsContainer, controls );

		this.contentWrapper = document.createElement( 'div' );
		this.contentWrapper.className = 'profiler-content-wrapper';

		const resizer = document.createElement( 'div' );
		resizer.className = 'panel-resizer';

		this.panel.append( resizer, header, this.contentWrapper );

		this.domElement.append( this.toggleButton, this.panel );

	}

	setupResizing() {

		const resizer = this.panel.querySelector( '.panel-resizer' );

		const onStart = ( e ) => {

			this.isResizing = true;
			this.panel.classList.add( 'resizing' );
			const startY = e.clientY || e.touches[ 0 ].clientY;
			const startHeight = this.panel.offsetHeight;

			const onMove = ( moveEvent ) => {

				if ( ! this.isResizing ) return;
				moveEvent.preventDefault();
				const currentY = moveEvent.clientY || moveEvent.touches[ 0 ].clientY;
				const newHeight = startHeight - ( currentY - startY );
				if ( newHeight > 100 && newHeight < window.innerHeight - 50 ) {

					this.panel.style.height = `${newHeight}px`;

				}

			};

			const onEnd = () => {

				this.isResizing = false;
				this.panel.classList.remove( 'resizing' );
				document.removeEventListener( 'mousemove', onMove );
				document.removeEventListener( 'mouseup', onEnd );
				document.removeEventListener( 'touchmove', onMove );
				document.removeEventListener( 'touchend', onEnd );
				if ( ! this.panel.classList.contains( 'maximized' ) ) {

					this.lastHeight = this.panel.offsetHeight;

				}

			};

			document.addEventListener( 'mousemove', onMove );
			document.addEventListener( 'mouseup', onEnd );
			document.addEventListener( 'touchmove', onMove, { passive: false } );
			document.addEventListener( 'touchend', onEnd );

		};

		resizer.addEventListener( 'mousedown', onStart );
		resizer.addEventListener( 'touchstart', onStart );

	}

	toggleMaximize() {

		if ( this.panel.classList.contains( 'maximized' ) ) {

			this.panel.classList.remove( 'maximized' );
			this.panel.style.height = `${ this.lastHeight }px`;
			this.maximizeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';

		} else {

			this.lastHeight = this.panel.offsetHeight;
			this.panel.classList.add( 'maximized' );
			this.panel.style.height = '100vh';
			this.maximizeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>';

		}

	}

	addTab( tab ) {

		this.tabs[ tab.id ] = tab;
		tab.button.onclick = () => this.setActiveTab( tab.id );
		this.tabsContainer.appendChild( tab.button );
		this.contentWrapper.appendChild( tab.content );

	}

	setActiveTab( id ) {

		if ( this.activeTabId ) this.tabs[ this.activeTabId ].setActive( false );
		this.activeTabId = id;
		this.tabs[ id ].setActive( true );

	}

	togglePanel() {

		this.panel.classList.toggle( 'visible' );
		this.toggleButton.classList.toggle( 'hidden' );

	}

}
