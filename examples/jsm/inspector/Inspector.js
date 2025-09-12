
import { RendererInspector } from './RendererInspector.js';
import { Profiler } from './ui/Profiler.js';
import { Performance } from './tabs/Performance.js';
import { Console } from './tabs/Console.js';
import { Parameters } from './tabs/Parameters.js';
import { setText, ease } from './ui/utils.js';

import { setConsoleFunction, REVISION } from 'three/webgpu';

class Inspector extends RendererInspector {

	constructor() {

		super();

		// init profiler

		const profiler = new Profiler();

		const parameters = new Parameters();
		parameters.hide();
		profiler.addTab( parameters );

		const performance = new Performance();
		profiler.addTab( performance );

		const console = new Console();
		profiler.addTab( console );

		profiler.setActiveTab( performance.id );

		//

		this.fps = 0;

		this.statsData = new Map();
		this.profiler = profiler;
		this.performance = performance;
		this.console = console;
		this.parameters = parameters;
		this.once = {};

		this.displayCycle = {
			text: {
				needsUpdate: false,
				duration: .25,
				time: 0
			},
			graph: {
				needsUpdate: false,
				duration: .1,
				time: 0
			}
		};

	}

	get domElement() {

		return this.profiler.domElement;

	}

	computeAsync() {

		const renderer = this.getRenderer();
		const animationLoop = renderer.getAnimationLoop();

		if ( renderer.info.frame > 1 && animationLoop !== null ) {

			this.resolveConsoleOnce( 'info', 'TIP: "computeAsync()" was called while a "setAnimationLoop()" is active. This is probably not necessary, use "compute()" instead.' );

		}

	}

	resolveConsoleOnce( type, message ) {

		const key = type + message;

		if ( this.once[ key ] !== true ) {

			this.resolveConsole( 'log', message );
			this.once[ key ] = true;

		}

	}

	resolveConsole( type, message ) {

		switch ( type ) {

			case 'log':

				this.console.addMessage( 'info', message );

				console.log( message );

				break;

			case 'warn':

				this.console.addMessage( 'warn', message );

				console.warn( message );

				break;

			case 'error':

				this.console.addMessage( 'error', message );

				console.error( message );

				break;

		}

	}

	init() {

		const renderer = this.getRenderer();

		let sign = `🚀 "WebGPURenderer" - ${ REVISION } [ "`;

		if ( renderer.backend.isWebGPUBackend ) {

			sign += 'WebGPU';

		} else if ( renderer.backend.isWebGLBackend ) {

			sign += 'WebGL2';

		}

		sign += '" ]';

		this.console.addMessage( 'info', sign );

	}

	setRenderer( renderer ) {

		if ( renderer !== null ) {

			setConsoleFunction( this.resolveConsole.bind( this ) );

			renderer.backend.trackTimestamp = true;

			renderer.hasFeatureAsync( 'timestamp-query' ).then( ( available ) => {

				if ( available !== true ) {

					this.console.addMessage( 'error', 'THREE.Inspector: GPU Timestamp Queries not available.' );

				}

			} );

		}

		return super.setRenderer( renderer );

	}

	createParameters( name ) {

		if ( this.parameters.isVisible === false ) {

			this.parameters.show();
			this.profiler.setActiveTab( this.parameters.id );

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

			data.initialized = true;

		}

		data.cpu = stats.cpu;
		data.gpu = stats.gpu;
		data.total = data.cpu + data.gpu;

		//

		for ( const child of stats.children ) {

			this.resolveStats( child );

		}

	}

	resolveFrame( frame ) {

		super.resolveFrame( frame );

		const deltaTime = frame.deltaTime / 1000; // to seconds

		const fps = ( deltaTime > 0 ) ? ( 1 / deltaTime ) : 0;

		this.fps = ease( this.fps, fps, deltaTime, .1 );

		this.resolveStats( frame );

		this.updateCycle( this.displayCycle.text );
		this.updateCycle( this.displayCycle.graph );

		if ( this.displayCycle.text.needsUpdate ) {

			setText( 'fps-counter', this.fps.toFixed() );

			this.performance.updateText( this, frame );

		}

		if ( this.displayCycle.graph.needsUpdate ) {

			this.performance.updateGraph( this, frame );

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

}

export { Inspector };
