
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

import { setConsoleFunction, REVISION } from 'three/webgpu';

class Inspector extends RendererInspector {

	constructor() {

		super();

		// init profiler

		const profiler = new Profiler( this );
		profiler.addEventListener( 'resize', ( e ) => this.dispatchEvent( e ) );

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
			}
		};

	}

	get domElement() {

		return this.profiler.domElement;

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

	getSize() {

		return this.profiler.getSize();

	}

	setActiveTab( tab ) {

		this.profiler.setActiveTab( tab.id );

		return this;

	}

	addTab( tab ) {

		this.profiler.addTab( tab );

		return this;

	}

	removeTab( tab ) {

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

	init() {

		const renderer = this.getRenderer();

		let sign = `THREE.WebGPURenderer: ${ REVISION } [ "`;

		if ( renderer.backend.isWebGPUBackend ) {

			sign += 'WebGPU';

		} else if ( renderer.backend.isWebGLBackend ) {

			sign += 'WebGL2';

		}

		sign += '" ]';

		this.console.addMessage( 'info', sign );

		//

		if ( renderer.inspector.domElement.parentElement === null && renderer.domElement.parentElement !== null ) {

			renderer.domElement.parentElement.appendChild( renderer.inspector.domElement );

		}

	}

	setRenderer( renderer ) {

		super.setRenderer( renderer );

		if ( renderer !== null ) {

			setConsoleFunction( this.resolveConsole.bind( this ) );

			if ( this.isAvailable ) {

				renderer.init().then( () => {

					renderer.backend.trackTimestamp = true;

					if ( renderer.hasFeature( 'timestamp-query' ) !== true ) {

						this.console.addMessage( 'error', 'THREE.Inspector: GPU Timestamp Queries not available.' );

					}

				} );

				this.timeline.setRenderer( renderer );

			}

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

		const nextFrame = this.getFrameById( frame.frameId + 1 );

		if ( ! nextFrame ) return;

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

		// improve stats using next frame

		frame.deltaTime = nextFrame.startTime - frame.startTime;
		frame.miscellaneous = frame.deltaTime - frame.total;

		if ( frame.miscellaneous < 0 ) {

			// Frame desync, probably due to async GPU timing.

			frame.miscellaneous = 0;

		}

		//

		this.updateCycle( this.displayCycle.text );
		this.updateCycle( this.displayCycle.graph );

		if ( this.displayCycle.text.needsUpdate ) {

			setText( 'fps-counter', this.fps.toFixed() );

			this.performance.updateText( this, frame );
			this.memory.updateText( this );

		}

		if ( this.displayCycle.graph.needsUpdate ) {

			this.performance.updateGraph( this, frame );
			this.memory.updateGraph( this );

		}

		this.displayCycle.text.needsUpdate = false;
		this.displayCycle.graph.needsUpdate = false;

	}

	updateCycle( cycle ) {

		cycle.time += this.nodeFrame.deltaTime;

		if ( cycle.time >= cycle.duration ) {

			cycle.needsUpdate = true;
			cycle.time = 0;

		}

	}

	static getItem( id ) {

		console.warn( 'Inspector.getItem is deprecated. Use getItem directly instead.' );
		return getItem( id );

	}

	static setItem( id, state ) {

		console.warn( 'Inspector.setItem is deprecated. Use setItem directly instead.' );
		setItem( id, state );

	}

}

function getItem( id ) {

	const data = JSON.parse( localStorage.getItem( 'threejs-inspector' ) || '{}' );
	return data[ id ] || {};

}

function setItem( id, state ) {

	const data = JSON.parse( localStorage.getItem( 'threejs-inspector' ) || '{}' );

	if ( state === null ) {

		delete data[ id ];

	} else {

		data[ id ] = state;

	}

	localStorage.setItem( 'threejs-inspector', JSON.stringify( data ) );

}

export { Inspector, getItem, setItem };
