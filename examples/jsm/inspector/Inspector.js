
import { RendererInspector } from './RendererInspector.js';
import { Profiler } from './ui/Profiler.js';
import { Performance } from './tabs/Performance.js';
import { Console } from './tabs/Console.js';
import { Parameters } from './tabs/Parameters.js';
import { Viewer } from './tabs/Viewer.js';
import { setText, splitPath, splitCamelCase } from './ui/utils.js';

import { QuadMesh, NodeMaterial, CanvasTarget, setConsoleFunction, REVISION, NoToneMapping } from 'three/webgpu';
import { renderOutput, vec2, vec3, vec4, Fn, screenUV, step, OnMaterialUpdate, uniform } from 'three/tsl';

const aspectRatioUV = /*@__PURE__*/ Fn( ( [ uv, textureNode ] ) => {

	const aspect = uniform( 0 );

	OnMaterialUpdate( () => {

		const { width, height } = textureNode.value;

		aspect.value = width / height;

	} );

	const centered = uv.sub( 0.5 );
	const corrected = vec2( centered.x.div( aspect ), centered.y );
	const finalUV = corrected.add( 0.5 );

	const inBounds = step( 0.0, finalUV.x ).mul( step( finalUV.x, 1.0 ) ).mul( step( 0.0, finalUV.y ) ).mul( step( finalUV.y, 1.0 ) );

	return vec3( finalUV, inBounds );

} );

class Inspector extends RendererInspector {

	constructor() {

		super();

		// init profiler

		const profiler = new Profiler();

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

		const consoleTab = new Console();
		profiler.addTab( consoleTab );

		profiler.loadLayout();

		if ( ! profiler.activeTabId ) {

			profiler.setActiveTab( performance.id );

		}

		this.statsData = new Map();
		this.canvasNodes = new Map();
		this.profiler = profiler;
		this.performance = performance;
		this.console = consoleTab;
		this.parameters = parameters;
		this.viewer = viewer;
		this.once = {};

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

				renderer.backend.trackTimestamp = true;

				renderer.init().then( () => {

					if ( renderer.hasFeature( 'timestamp-query' ) !== true ) {

						this.console.addMessage( 'error', 'THREE.Inspector: GPU Timestamp Queries not available.' );

					}

				} );

			}

		}

		return this;

	}

	createParameters( name ) {

		if ( this.parameters.isVisible === false ) {

			this.parameters.show();

			if ( this.parameters.isDetached === false ) {

				this.profiler.setActiveTab( this.parameters.id );

			}

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

	getCanvasDataByNode( node ) {

		let canvasData = this.canvasNodes.get( node );

		if ( canvasData === undefined ) {

			const renderer = this.getRenderer();

			const canvas = document.createElement( 'canvas' );

			const canvasTarget = new CanvasTarget( canvas );
			canvasTarget.setPixelRatio( window.devicePixelRatio );
			canvasTarget.setSize( 140, 140 );

			const id = node.id;

			const { path, name } = splitPath( splitCamelCase( node.getName() || '(unnamed)' ) );

			const target = node.context( { getUV: ( textureNode ) => {

				const uvData = aspectRatioUV( screenUV, textureNode );
				const correctedUV = uvData.xy;
				const mask = uvData.z;

				return correctedUV.mul( mask );

			} } );

			let output = vec4( vec3( target ), 1 );
			output = renderOutput( output, NoToneMapping, renderer.outputColorSpace );
			output = output.context( { inspector: true } );

			const material = new NodeMaterial();
			material.outputNode = output;

			const quad = new QuadMesh( material );
			quad.name = 'Viewer - ' + name;

			canvasData = {
				id,
				name,
				path,
				node,
				quad,
				canvasTarget,
				material
			};

			this.canvasNodes.set( node, canvasData );

		}

		return canvasData;

	}

	resolveViewer() {

		const nodes = this.currentNodes;
		const renderer = this.getRenderer();

		if ( nodes.length === 0 ) return;

		if ( ! renderer.backend.isWebGPUBackend ) {

			this.resolveConsoleOnce( 'warn', 'Inspector: Viewer is only available with WebGPU.' );

			return;

		}

		//

		if ( ! this.viewer.isVisible ) {

			this.viewer.show();

		}

		const canvasDataList = nodes.map( node => this.getCanvasDataByNode( node ) );

		this.viewer.update( renderer, canvasDataList );

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
