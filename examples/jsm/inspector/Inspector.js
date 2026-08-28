
import { RendererInspector } from './RendererInspector.js';
import { Profiler } from './ui/Profiler.js';
import { Performance } from './tabs/Performance.js';
import { Memory } from './tabs/Memory.js';
import { Console } from './tabs/Console.js';
import { Parameters } from './tabs/Parameters.js';
import { Settings } from './tabs/Settings.js';
import { Viewer } from './tabs/Viewer.js';
import { Timeline } from './tabs/Timeline.js';
import { setText } from './ui/utils.js';

import { setConsoleFunction, getConsoleFunction, REVISION } from 'three/webgpu';

class Inspector extends RendererInspector {

	constructor( options = {} ) {

		super();

		const {
			nonce = null
		} = options;

		this.nonce = nonce;

		// init profiler

		const profiler = new Profiler( this, options );
		profiler.addEventListener( 'resize', ( e ) => this.dispatchEvent( e ) );
		profiler.addEventListener( 'orientationchange', ( e ) => this.dispatchEvent( e ) );
		profiler.addEventListener( 'layoutchange', ( e ) => this.dispatchEvent( e ) );

		const parameters = new Parameters( {
			builtin: true,
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M4 6l8 0" /><path d="M16 6l4 0" /><path d="M8 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M4 12l2 0" /><path d="M10 12l10 0" /><path d="M17 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M4 18l11 0" /><path d="M19 18l1 0" /></svg>'
		} );
		parameters.hide();
		profiler.addTab( parameters );

		const viewer = new Viewer();
		viewer.hide();
		profiler.addTab( viewer );

		const performance = new Performance();
		profiler.addTab( performance );

		const memory = new Memory();
		profiler.addTab( memory );

		const timeline = new Timeline();
		profiler.addTab( timeline );

		const consoleTab = new Console();
		profiler.addTab( consoleTab );

		const settings = new Settings();
		profiler.addTab( settings );

		profiler.loadLayout();

		if ( ! profiler.activeTabId ) {

			profiler.setActiveTab( performance.id );

		}

		this.statsData = new Map();
		this.profiler = profiler;
		this.performance = performance;
		this.memory = memory;
		this.console = consoleTab;
		this.parameters = parameters;
		this.viewer = viewer;
		this.timeline = timeline;
		this.settings = settings;
		this.once = {};
		this.extensionsData = new WeakMap();
		this.previousConsoleFunction = null;
		this._domObserver = null;

		this.displayCycle = {
			text: {
				needsUpdate: false,
				duration: .25,
				time: 0
			},
			graph: {
				needsUpdate: false,
				duration: .02,
				time: 0
			},
			toggleGraph: {
				needsUpdate: false,
				duration: .02,
				time: 0
			}
		};

	}

	get domElement() {

		return this.profiler.domElement;

	}

	isVertical() {

		return this.profiler ? this.profiler.isVertical() : false;

	}

	onExtension( name, callback ) {

		const extensionAdded = ( e ) => {

			if ( e.name === name ) {

				callback( e.tab );

				this.settings.removeEventListener( 'extensionadded', extensionAdded );

			}

		};

		if ( this.settings.extensions[ name ] && this.settings.extensions[ name ].loaded ) {

			callback( this.settings.extensions[ name ] );

		} else {

			this.settings.addEventListener( 'extensionadded', extensionAdded );

		}

		return this;

	}

	hide() {

		this.profiler.hide();

	}

	show() {

		this.profiler.show();

	}

	setVisible( value ) {

		this.domElement.style.display = value ? '' : 'none';

		return this;

	}

	getVisible() {

		return this.domElement.style.display !== 'none';

	}

	getSize() {

		return this.profiler.getSize();

	}

	setActiveTab( tab ) {

		this.profiler.setActiveTab( tab.id );

		return this;

	}

	setHorizontalAlign( value ) {

		this.profiler.setHorizontalAlign( value );

		return this;

	}

	setVerticalAlign( value ) {

		this.profiler.setVerticalAlign( value );

		return this;

	}

	addTab( tab ) {

		this.profiler.addTab( tab );

		return this;

	}

	removeTab( tab ) {

		tab.dispose();

		this.profiler.removeTab( tab );

		return this;

	}

	setActiveExtension( name, value ) {

		this.settings.setActiveExtension( name, value );

		return this;

	}

	resolveConsoleOnce( type, message ) {

		const key = type + message;

		if ( this.once[ key ] !== true ) {

			this.resolveConsole( type, message );
			this.once[ key ] = true;

		}

	}

	resolveConsole( type, message, stackTrace = null ) {

		switch ( type ) {

			case 'log':

				this.console.addMessage( 'info', message );

				console.log( message );

				break;

			case 'warn':

				this.console.addMessage( 'warn', message );

				if ( stackTrace && stackTrace.isStackTrace ) {

					console.warn( stackTrace.getError( message ) );

				} else {

					console.warn( message );

				}

				break;

			case 'error':

				this.console.addMessage( 'error', message );

				if ( stackTrace && stackTrace.isStackTrace ) {

					console.error( stackTrace.getError( message ) );

				} else {

					console.error( message );

				}

				break;

		}

	}

	setRenderer( renderer ) {

		super.setRenderer( renderer );

		if ( renderer !== null ) {

			const previousConsoleFunction = getConsoleFunction();

			this.previousConsoleFunction = previousConsoleFunction;

			setConsoleFunction( ( type, message, ...params ) => {

				if ( previousConsoleFunction ) {

					previousConsoleFunction( type, message, ...params );

				}

				this.resolveConsole( type, message, ...params );

			} );

			if ( this.isAvailable ) {

				const init = async () => {

					if ( renderer.hasInitialized() === false ) await renderer.init();

					renderer.backend.trackTimestamp = true;

					if ( renderer.hasFeature( 'timestamp-query' ) !== true ) {

						this.console.addMessage( 'error', 'THREE.Inspector: GPU Timestamp Queries not available.' );

					}

					let sign = `THREE.WebGPURenderer: ${ REVISION } [ "`;

					if ( renderer.backend.isWebGPUBackend ) {

						sign += 'WebGPU';

					} else if ( renderer.backend.isWebGLBackend ) {

						sign += 'WebGL2';

					}

					sign += '" ]';

					this.console.addMessage( 'info', sign );

					//

					const domElement = this.domElement;

					if ( domElement.parentElement === null ) {

						if ( renderer.domElement.parentElement !== null ) {

							renderer.domElement.parentElement.appendChild( domElement );

						} else {

							if ( this._domObserver !== null ) {

								this._domObserver.disconnect();

							}

							this._domObserver = new MutationObserver( () => {

								if ( renderer.domElement && renderer.domElement.parentElement !== null ) {

									renderer.domElement.parentElement.appendChild( domElement );

									if ( this._domObserver !== null ) {

										this._domObserver.disconnect();
										this._domObserver = null;

									}

								}

							} );

							this._domObserver.observe( document.body || document.documentElement, { childList: true, subtree: true } );

						}

					}

				};

				init();

				this.timeline.setRenderer( renderer );

			}

		} else {

			if ( this.previousConsoleFunction ) {

				setConsoleFunction( this.previousConsoleFunction );
				this.previousConsoleFunction = undefined;

			}

			if ( this._domObserver !== null ) {

				this._domObserver.disconnect();
				this._domObserver = null;

			}

			this.profiler.dispose();

			this.statsData.clear();

			super.dispose();

		}

		return this;

	}

	createParameters( name ) {

		if ( this.parameters.isVisible === false ) {

			this.parameters.show();

		}

		return this.parameters.createGroup( name );

	}

	getStatsData( cid ) {

		let data = this.statsData.get( cid );

		if ( data === undefined ) {

			data = {};

			this.statsData.set( cid, data );

		}

		return data;

	}

	resolveStats( stats ) {

		const data = this.getStatsData( stats.cid );

		if ( data.initialized !== true ) {

			data.cpu = stats.cpu;
			data.gpu = stats.gpu;
			data.stats = [];

			data.initialized = true;

		}

		// store stats

		if ( data.stats.length > this.maxFrames ) {

			data.stats.shift();

		}

		data.stats.push( stats );

		// compute averages

		data.cpu = this.getAverageDeltaTime( data, 'cpu' );
		data.gpu = this.getAverageDeltaTime( data, 'gpu' );
		data.total = data.cpu + data.gpu;

		// children

		for ( const child of stats.children ) {

			this.resolveStats( child );

			const childData = this.getStatsData( child.cid );

			data.cpu += childData.cpu;
			data.gpu += childData.gpu;
			data.total += childData.total;

		}

	}

	getNodes() {

		return this.currentNodes;

	}

	getAverageDeltaTime( statsData, property, frames = this.fps ) {

		const statsArray = statsData.stats;

		let sum = 0;
		let count = 0;

		for ( let i = statsArray.length - 1; i >= 0 && count < frames; i -- ) {

			const stats = statsArray[ i ];
			const value = stats[ property ];

			if ( value > 0 ) {

				// ignore invalid values

				sum += value;
				count ++;

			}

		}

		return count > 0 ? sum / count : 0;

	}

	updateTabs() {

		// tabs

		const tabs = Object.values( this.profiler.tabs );

		for ( const tab of tabs ) {

			let tabData = this.extensionsData.get( tab );

			if ( tabData === undefined ) {

				tab.init( this );

				tabData = {};

				this.extensionsData.set( tab, tabData );

			}

			tab.update( this );

		}

	}

	resolveFrame( frame ) {

		const previousFrame = this.getFrameById( frame.frameId - 1 );

		if ( ! previousFrame ) return;

		frame.cpu = 0;
		frame.gpu = 0;
		frame.total = 0;

		for ( const stats of frame.children ) {

			this.resolveStats( stats );

			const data = this.getStatsData( stats.cid );

			frame.cpu += data.cpu;
			frame.gpu += data.gpu;
			frame.total += data.total;

		}

		// improve stats using previous frame

		frame.deltaTime = frame.startTime - previousFrame.startTime;
		frame.miscellaneous = frame.deltaTime - frame.total;

		if ( frame.miscellaneous < 0 ) {

			// Frame desync, probably due to async GPU timing.

			frame.miscellaneous = 0;

		}

		//

		this.updateCycle( this.displayCycle.text );
		this.updateCycle( this.displayCycle.graph );
		this.updateCycle( this.displayCycle.toggleGraph );

		if ( this.displayCycle.text.needsUpdate ) {

			setText( this.profiler.toggleButton.querySelector( '.fps-counter' ), this.fps.toFixed() );

			this.performance.updateText( this, frame );
			this.memory.updateText( this );

		}

		if ( this.displayCycle.toggleGraph.needsUpdate ) {

			if ( this.profiler.toggleGraph ) {

				this.profiler.toggleGraph.addPoint( 'fps', this.fps );
				this.profiler.toggleGraph.update();

			}

		}

		if ( this.displayCycle.graph.needsUpdate ) {

			this.performance.updateGraph( this, frame );
			this.memory.updateGraph( this );

		}

		this.displayCycle.text.needsUpdate = false;
		this.displayCycle.graph.needsUpdate = false;
		this.displayCycle.toggleGraph.needsUpdate = false;

	}

	updateCycle( cycle ) {

		cycle.time += this.nodeFrame.deltaTime;

		if ( cycle.time >= cycle.duration ) {

			cycle.needsUpdate = true;
			cycle.time = 0;

		}

	}

	dispose() {

		super.dispose();

		this.setRenderer( null );

	}

}

function getItem( id ) {

	const data = JSON.parse( localStorage.getItem( 'threejs-inspector' ) || '{}' );

	if ( data.version !== REVISION ||
		 data.settings && ( data.settings.storage === 'url' && data.settings.url !== location.href ) ) {

		localStorage.removeItem( 'threejs-inspector' );

		return {};

	}

	return data[ id ] || {};

}

function setItem( id, state ) {

	const data = JSON.parse( localStorage.getItem( 'threejs-inspector' ) || '{}' );

	if ( state === null ) {

		delete data[ id ];

	} else {

		data[ id ] = state;

	}

	data.settings = data.settings || {};
	data.settings.url = data.settings.url || location.href;
	data.settings.storage = data.settings.storage || 'url';
	data.version = REVISION;

	localStorage.setItem( 'threejs-inspector', JSON.stringify( data ) );

}

export { Inspector, getItem, setItem };
