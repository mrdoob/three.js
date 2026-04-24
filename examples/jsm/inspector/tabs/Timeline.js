import { Tab } from '../ui/Tab.js';
import { Graph } from '../ui/Graph.js';
import { getItem, setItem } from '../Inspector.js';
import {
	ByteType,
	FloatType,
	HalfFloatType,
	IntType,
	ShortType,
	UnsignedByteType,
	UnsignedInt101111Type,
	UnsignedInt248Type,
	UnsignedInt5999Type,
	UnsignedIntType,
	UnsignedShort4444Type,
	UnsignedShort5551Type,
	UnsignedShortType,
	AlphaFormat,
	RGBFormat,
	RGBAFormat,
	DepthFormat,
	DepthStencilFormat,
	RedFormat,
	RedIntegerFormat,
	RGFormat,
	RGIntegerFormat,
	RGBIntegerFormat,
	RGBAIntegerFormat
} from 'three';

const LIMIT = 500;
const TRIANGLES_GRAPH_LIMIT = 60;

class Timeline extends Tab {

	constructor( options = {} ) {

		super( 'Timeline', options );

		this.isRecording = false;
		this.frames = []; // Array of { id: number, calls: [] }

		this.baseTriangles = 0;
		this.currentFrame = null;
		this.isHierarchicalView = true;
		this.callBlocks = new WeakMap();
		this.fallbackBlocks = [];
		this.originalBackend = null;
		this.originalMethods = new Map();
		this.renderer = null;

		this.graph = new Graph( LIMIT ); // Accommodate standard graph points
		// Make lines in timeline graph
		this.graph.addLine( 'fps', 'var( --color-fps )' );
		this.graph.addLine( 'calls', 'var( --color-call )' );
		this.graph.addLine( 'triangles', 'var( --color-red )' );

		const scrollWrapper = document.createElement( 'div' );
		scrollWrapper.className = 'list-scroll-wrapper';
		this.scrollWrapper = scrollWrapper;
		this.content.appendChild( scrollWrapper );

		this.buildHeader();
		this.buildUI();

		// Bind window resize to update graph bounds
		window.addEventListener( 'resize', () => {

			if ( ! this.isRecording && this.frames.length > 0 ) {

				this.renderSlider();

			}

		} );

	}

	buildHeader() {

		const header = document.createElement( 'div' );
		header.className = 'console-header';

		this.recordButton = document.createElement( 'button' );
		this.recordButton.className = 'console-copy-button'; // Reusing style
		this.recordButton.title = 'Record';
		this.recordButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4" fill="currentColor"></circle></svg>';
		this.recordButton.style.padding = '0 10px';
		this.recordButton.style.lineHeight = '24px'; // Match other buttons height
		this.recordButton.style.display = 'flex';
		this.recordButton.style.alignItems = 'center';
		this.recordButton.addEventListener( 'click', () => this.toggleRecording() );

		const clearButton = document.createElement( 'button' );
		clearButton.className = 'console-copy-button';
		clearButton.title = 'Clear';
		clearButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
		clearButton.style.padding = '0 10px';
		clearButton.style.lineHeight = '24px';
		clearButton.style.display = 'flex';
		clearButton.style.alignItems = 'center';
		clearButton.addEventListener( 'click', () => this.clear() );

		this.viewModeButton = document.createElement( 'button' );
		this.viewModeButton.className = 'console-copy-button';
		this.viewModeButton.title = 'Toggle View Mode';
		this.viewModeButton.textContent = 'Mode: Hierarchy';
		this.viewModeButton.style.padding = '0 10px';
		this.viewModeButton.style.lineHeight = '24px';
		this.viewModeButton.addEventListener( 'click', () => {

			this.isHierarchicalView = ! this.isHierarchicalView;
			this.viewModeButton.textContent = this.isHierarchicalView ? 'Mode: Hierarchy' : 'Mode: Counts';

			if ( this.selectedFrameIndex !== undefined && this.selectedFrameIndex !== - 1 ) {

				this.selectFrame( this.selectedFrameIndex );

			}

		} );

		this.recordRefreshButton = document.createElement( 'button' );
		this.recordRefreshButton.className = 'console-copy-button'; // Reusing style
		this.recordRefreshButton.title = 'Refresh & Record';
		this.recordRefreshButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><circle cx="12" cy="12" r="3" fill="currentColor"></circle></svg>';
		this.recordRefreshButton.style.padding = '0 10px';
		this.recordRefreshButton.style.lineHeight = '24px';
		this.recordRefreshButton.style.display = 'flex';
		this.recordRefreshButton.style.alignItems = 'center';
		this.recordRefreshButton.addEventListener( 'click', () => {

			const timelineSettings = getItem( 'timeline' );
			timelineSettings.recording = true;
			setItem( 'timeline', timelineSettings );

			window.location.reload();

		} );

		this.exportButton = document.createElement( 'button' );
		this.exportButton.className = 'console-copy-button';
		this.exportButton.title = 'Export';
		this.exportButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
		this.exportButton.style.padding = '0 10px';
		this.exportButton.style.lineHeight = '24px';
		this.exportButton.style.display = 'flex';
		this.exportButton.style.alignItems = 'center';
		this.exportButton.addEventListener( 'click', () => this.exportData() );

		const buttonsGroup = document.createElement( 'div' );
		buttonsGroup.className = 'console-buttons-group';
		buttonsGroup.appendChild( this.viewModeButton );
		buttonsGroup.appendChild( this.recordButton );
		buttonsGroup.appendChild( this.recordRefreshButton );
		buttonsGroup.appendChild( this.exportButton );
		buttonsGroup.appendChild( clearButton );

		header.style.display = 'flex';
		header.style.justifyContent = 'space-between';
		header.style.padding = '6px';
		header.style.borderBottom = '1px solid var(--border-color)';

		const titleElement = document.createElement( 'div' );
		titleElement.textContent = 'Backend Calls';
		titleElement.style.display = 'flex';
		titleElement.style.alignItems = 'center';
		titleElement.style.color = 'var(--text-primary)';
		titleElement.style.alignSelf = 'center';
		titleElement.style.paddingLeft = '5px';

		this.frameInfo = document.createElement( 'span' );
		this.frameInfo.style.display = 'inline-flex';
		this.frameInfo.style.alignItems = 'center';
		this.frameInfo.style.marginLeft = '15px';
		this.frameInfo.style.fontFamily = 'monospace';
		this.frameInfo.style.color = 'var(--text-secondary)';
		this.frameInfo.style.fontSize = '12px';
		titleElement.appendChild( this.frameInfo );

		header.appendChild( titleElement );
		header.appendChild( buttonsGroup );
		this.scrollWrapper.appendChild( header );

	}

	buildUI() {

		const container = document.createElement( 'div' );
		container.style.display = 'flex';
		container.style.flexDirection = 'column';
		container.style.height = 'calc(100% - 37px)'; // Subtract header height
		container.style.width = '100%';

		// Top Player/Graph Slider using Graph.js SVG
		const graphContainer = document.createElement( 'div' );
		graphContainer.style.height = '60px';
		graphContainer.style.minHeight = '60px';
		graphContainer.style.borderBottom = '1px solid var(--border-color)';
		graphContainer.style.backgroundColor = 'var(--background-color)';

		this.graphSlider = document.createElement( 'div' );
		this.graphSlider.style.height = '100%';
		this.graphSlider.style.margin = '0 10px';
		this.graphSlider.style.position = 'relative';
		this.graphSlider.style.cursor = 'crosshair';

		graphContainer.appendChild( this.graphSlider );

		// Setup SVG from Graph
		this.graph.domElement.style.width = '100%';
		this.graph.domElement.style.height = '100%';
		this.graphSlider.appendChild( this.graph.domElement );

		// Hover indicator
		this.hoverIndicator = document.createElement( 'div' );
		this.hoverIndicator.style.position = 'absolute';
		this.hoverIndicator.style.top = '0';
		this.hoverIndicator.style.bottom = '0';
		this.hoverIndicator.style.width = '1px';
		this.hoverIndicator.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
		this.hoverIndicator.style.pointerEvents = 'none';
		this.hoverIndicator.style.display = 'none';
		this.hoverIndicator.style.zIndex = '9';
		this.hoverIndicator.style.transform = 'translateX(-50%)';
		this.graphSlider.appendChild( this.hoverIndicator );

		// Playhead indicator (vertical line)
		this.playhead = document.createElement( 'div' );
		this.playhead.style.position = 'absolute';
		this.playhead.style.top = '0';
		this.playhead.style.bottom = '0';
		this.playhead.style.width = '2px';
		this.playhead.style.backgroundColor = 'var(--color-red)';
		this.playhead.style.boxShadow = '0 0 4px rgba(255,0,0,0.5)';
		this.playhead.style.pointerEvents = 'none';
		this.playhead.style.display = 'none';
		this.playhead.style.zIndex = '10';
		this.playhead.style.transform = 'translateX(-50%)';
		this.graphSlider.appendChild( this.playhead );

		// Playhead handle (triangle/pointer)
		const playheadHandle = document.createElement( 'div' );
		playheadHandle.style.position = 'absolute';
		playheadHandle.style.top = '0';
		playheadHandle.style.left = '50%';
		playheadHandle.style.transform = 'translate(-50%, 0)';
		playheadHandle.style.width = '0';
		playheadHandle.style.height = '0';
		playheadHandle.style.borderLeft = '6px solid transparent';
		playheadHandle.style.borderRight = '6px solid transparent';
		playheadHandle.style.borderTop = '8px solid var(--color-red)';
		this.playhead.appendChild( playheadHandle );

		// Make it focusable to accept keyboard events
		this.graphSlider.tabIndex = 0;
		this.graphSlider.style.outline = 'none';

		// Mouse interactivity on the graph
		let isDragging = false;

		const updatePlayheadFromEvent = ( e ) => {

			if ( this.frames.length === 0 ) return;

			const rect = this.graphSlider.getBoundingClientRect();
			let x = e.clientX - rect.left;

			// Clamp
			x = Math.max( 0, Math.min( x, rect.width ) );

			this.fixedScreenX = x;

			// The graph stretches its points across the width
			// Find closest frame index based on exact point coordinates
			const pointCount = this.graph.lines[ 'calls' ].points.length;
			if ( pointCount === 0 ) return;

			const pointStep = rect.width / ( this.graph.maxPoints - 1 );
			const offset = rect.width - ( ( pointCount - 1 ) * pointStep );

			let localFrameIndex = Math.round( ( x - offset ) / pointStep );
			localFrameIndex = Math.max( 0, Math.min( localFrameIndex, pointCount - 1 ) );

			if ( localFrameIndex >= pointCount - 2 ) {

				this.isTrackingLatest = true;

			} else {

				this.isTrackingLatest = false;

			}

			let frameIndex = localFrameIndex;

			if ( this.frames.length > pointCount ) {

				frameIndex += this.frames.length - pointCount;

			}

			this.playhead.style.display = 'block';
			this.selectFrame( frameIndex );

		};

		this.graphSlider.addEventListener( 'mousedown', ( e ) => {

			isDragging = true;
			this.isManualScrubbing = true;
			this.graphSlider.focus();
			updatePlayheadFromEvent( e );

		} );

		this.graphSlider.addEventListener( 'mouseenter', () => {

			if ( this.frames.length > 0 && ! this.isRecording ) {

				this.hoverIndicator.style.display = 'block';

			}

		} );

		this.graphSlider.addEventListener( 'mouseleave', () => {

			this.hoverIndicator.style.display = 'none';

		} );

		this.graphSlider.addEventListener( 'mousemove', ( e ) => {

			if ( this.frames.length === 0 || this.isRecording ) return;

			const rect = this.graphSlider.getBoundingClientRect();
			let x = e.clientX - rect.left;
			x = Math.max( 0, Math.min( x, rect.width ) );

			const pointCount = this.graph.lines[ 'calls' ].points.length;
			if ( pointCount > 0 ) {

				const pointStep = rect.width / ( this.graph.maxPoints - 1 );
				const offset = rect.width - ( ( pointCount - 1 ) * pointStep );

				let localFrameIndex = Math.round( ( x - offset ) / pointStep );
				localFrameIndex = Math.max( 0, Math.min( localFrameIndex, pointCount - 1 ) );

				let snappedX = offset + localFrameIndex * pointStep;
				snappedX = Math.max( 1, Math.min( snappedX, rect.width - 1 ) );
				this.hoverIndicator.style.left = snappedX + 'px';

			} else {

				const clampedX = Math.max( 1, Math.min( x, rect.width - 1 ) );
				this.hoverIndicator.style.left = clampedX + 'px';

			}

		} );

		this.graphSlider.addEventListener( 'keydown', ( e ) => {

			if ( this.frames.length === 0 || this.isRecording ) return;

			let newIndex = this.selectedFrameIndex;

			if ( e.key === 'ArrowLeft' ) {

				newIndex = Math.max( 0, this.selectedFrameIndex - 1 );
				e.preventDefault();

			} else if ( e.key === 'ArrowRight' ) {

				newIndex = Math.min( this.frames.length - 1, this.selectedFrameIndex + 1 );
				e.preventDefault();

			}

			if ( newIndex !== this.selectedFrameIndex ) {

				this.selectFrame( newIndex );

				// Update playhead tracking state
				const pointCount = this.graph.lines[ 'calls' ].points.length;
				if ( pointCount > 0 ) {

					let localIndex = newIndex;
					if ( this.frames.length > pointCount ) {

						localIndex = newIndex - ( this.frames.length - pointCount );

					}

					if ( localIndex >= pointCount - 2 ) {

						this.isTrackingLatest = true;

					} else {

						this.isTrackingLatest = false;

					}

					const rect = this.graphSlider.getBoundingClientRect();
					const pointStep = rect.width / ( this.graph.maxPoints - 1 );
					const offset = rect.width - ( ( pointCount - 1 ) * pointStep );
					this.fixedScreenX = offset + localIndex * pointStep;

				}

			}

		} );

		window.addEventListener( 'mousemove', ( e ) => {

			if ( isDragging ) {

				updatePlayheadFromEvent( e );

				// Also move hover indicator to match playback
				const rect = this.graphSlider.getBoundingClientRect();
				let x = e.clientX - rect.left;
				x = Math.max( 0, Math.min( x, rect.width ) );

				const pointCount = this.graph.lines[ 'calls' ].points.length;
				if ( pointCount > 0 ) {

					const pointStep = rect.width / ( this.graph.maxPoints - 1 );
					const offset = rect.width - ( ( pointCount - 1 ) * pointStep );

					let localFrameIndex = Math.round( ( x - offset ) / pointStep );
					localFrameIndex = Math.max( 0, Math.min( localFrameIndex, pointCount - 1 ) );

					let snappedX = offset + localFrameIndex * pointStep;
					snappedX = Math.max( 1, Math.min( snappedX, rect.width - 1 ) );
					this.hoverIndicator.style.left = snappedX + 'px';

				} else {

					const clampedX = Math.max( 1, Math.min( x, rect.width - 1 ) );
					this.hoverIndicator.style.left = clampedX + 'px';

				}

			}

		} );

		window.addEventListener( 'mouseup', () => {

			isDragging = false;
			this.isManualScrubbing = false;

		} );

		container.appendChild( graphContainer );

		// Bottom Main Area (Timeline Sequence)
		const mainArea = document.createElement( 'div' );
		mainArea.style.flex = '1';
		mainArea.style.display = 'flex';
		mainArea.style.flexDirection = 'column';
		mainArea.style.overflow = 'hidden';

		// Timeline Track
		this.timelineTrack = document.createElement( 'div' );
		this.timelineTrack.style.flex = '1';
		this.timelineTrack.style.overflowY = 'auto';
		this.timelineTrack.style.margin = '10px';
		this.timelineTrack.style.backgroundColor = 'var(--background-color)';
		mainArea.appendChild( this.timelineTrack );

		container.appendChild( mainArea );
		this.scrollWrapper.appendChild( container );

	}

	setRenderer( renderer ) {

		this.renderer = renderer;

		const timelineSettings = getItem( 'timeline' );

		if ( timelineSettings.recording ) {

			timelineSettings.recording = false;
			setItem( 'timeline', timelineSettings );

			this.toggleRecording();

		}

	}

	toggleRecording() {

		if ( ! this.renderer ) {

			console.warn( 'Timeline: No renderer defined.' );
			return;

		}

		this.isRecording = ! this.isRecording;

		if ( this.isRecording ) {

			this.recordButton.title = 'Stop';
			this.recordButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>';
			this.recordButton.style.color = 'var(--color-red)';
			this.startRecording();

		} else {

			this.recordButton.title = 'Record';
			this.recordButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4" fill="currentColor"></circle></svg>';
			this.recordButton.style.color = '';
			this.stopRecording();
			this.renderSlider();

		}

	}

	startRecording() {

		this.frames = [];
		this.currentFrame = null;
		this.selectedFrameIndex = - 1;
		this.fixedScreenX = 0;
		this.isTrackingLatest = true;
		this.isManualScrubbing = false;
		this.clear();
		this.frameInfo.textContent = 'Recording...';

		const backend = this.renderer.backend;
		const methods = Object.getOwnPropertyNames( Object.getPrototypeOf( backend ) ).filter( prop => prop !== 'constructor' );

		for ( const prop of methods ) {

			const descriptor = Object.getOwnPropertyDescriptor( Object.getPrototypeOf( backend ), prop );

			if ( descriptor && ( descriptor.get || descriptor.set ) ) continue;

			const originalFunc = backend[ prop ];

			if ( typeof originalFunc === 'function' && typeof prop === 'string' ) {

				this.originalMethods.set( prop, originalFunc );

				backend[ prop ] = ( ...args ) => {

					if ( prop.toLowerCase().includes( 'timestamp' ) || prop.startsWith( 'get' ) || prop.startsWith( 'set' ) || prop.startsWith( 'has' ) || prop.startsWith( '_' ) || prop.startsWith( 'needs' ) ) {

						return originalFunc.apply( backend, args );

					}

					// Check for frame change
					const frameNumber = this.renderer.info.frame;

					if ( ! this.currentFrame || this.currentFrame.id !== frameNumber ) {

						if ( this.currentFrame ) {

							this.currentFrame.fps = this.renderer.inspector ? this.renderer.inspector.fps : 0;

							if ( ! isFinite( this.currentFrame.fps ) ) {

								this.currentFrame.fps = 0;

							}

							const t = this.currentFrame.triangles || 0;

							if ( t > this.baseTriangles ) {

								const oldBase = this.baseTriangles;
								this.baseTriangles = t;

								if ( oldBase > 0 ) {

									const ratio = oldBase / this.baseTriangles;
									const points = this.graph.lines[ 'triangles' ].points;

									for ( let i = 0; i < points.length; i ++ ) {

										points[ i ] *= ratio;

									}

								}

							}

							const normalizedTriangles = this.baseTriangles > 0 ? ( t / this.baseTriangles ) * TRIANGLES_GRAPH_LIMIT : 0;

							this.graph.addPoint( 'calls', this.currentFrame.calls.length );
							this.graph.addPoint( 'fps', this.currentFrame.fps );
							this.graph.addPoint( 'triangles', normalizedTriangles );
							this.graph.update();

						}

						this.currentFrame = { id: frameNumber, calls: [], fps: 0, triangles: 0 };
						this.frames.push( this.currentFrame );

						if ( this.frames.length > LIMIT ) {

							this.frames.shift();

						}

						// Sync playhead when new frames are added if user is actively watching a frame
						if ( ! this.isManualScrubbing ) {

							if ( this.isTrackingLatest ) {

								const targetIndex = this.frames.length > 1 ? this.frames.length - 2 : 0;
								this.selectFrame( targetIndex );

							} else if ( this.selectedFrameIndex !== - 1 ) {

								const pointCount = this.graph.lines[ 'calls' ].points.length;

								if ( pointCount > 0 ) {

									const rect = this.graphSlider.getBoundingClientRect();
									const pointStep = rect.width / ( this.graph.maxPoints - 1 );
									const offset = rect.width - ( ( pointCount - 1 ) * pointStep );

									let localFrameIndex = Math.round( ( this.fixedScreenX - offset ) / pointStep );
									localFrameIndex = Math.max( 0, Math.min( localFrameIndex, pointCount - 1 ) );

									let newFrameIndex = localFrameIndex;

									if ( this.frames.length > pointCount ) {

										newFrameIndex += this.frames.length - pointCount;

									}

									this.selectFrame( newFrameIndex );

								}

							}

						}

					}

					const call = { method: prop, target: args[ 0 ] };
					const details = this.getCallDetail( prop, args );

					if ( details ) {

						call.details = details;

						if ( details.triangles !== undefined ) {

							this.currentFrame.triangles += details.triangles;

						}

					}

					this.currentFrame.calls.push( call );

					return originalFunc.apply( backend, args );

				};

			}

		}

	}

	stopRecording() {

		if ( this.originalMethods.size > 0 ) {

			const backend = this.renderer.backend;

			for ( const [ prop, originalFunc ] of this.originalMethods.entries() ) {

				backend[ prop ] = originalFunc;

			}

			this.originalMethods.clear();

			if ( this.currentFrame ) {

				this.currentFrame.fps = this.renderer.inspector ? this.renderer.inspector.fps : 0;

			}

		}

	}

	clear() {

		this.frames = [];
		this.timelineTrack.innerHTML = '';
		this.playhead.style.display = 'none';
		this.frameInfo.textContent = '';
		this.baseTriangles = 0;
		this.graph.lines[ 'calls' ].points = [];
		this.graph.lines[ 'fps' ].points = [];
		this.graph.lines[ 'triangles' ].points = [];
		this.graph.resetLimit();
		this.graph.update();

	}

	exportData() {

		if ( this.frames.length === 0 ) return;

		const data = JSON.stringify( this.frames, null, '\t' );
		const blob = new Blob( [ data ], { type: 'application/json' } );
		const url = URL.createObjectURL( blob );
		const a = document.createElement( 'a' );
		a.href = url;
		a.download = 'threejs-timeline.json';
		a.click();
		URL.revokeObjectURL( url );

	}

	getRenderTargetDetails( renderTarget ) {

		const textures = renderTarget.textures;
		const attachments = [];

		const getBPC = ( texture ) => {

			switch ( texture.type ) {

				case ByteType:
				case UnsignedByteType:
					return '8';
				case ShortType:
				case UnsignedShortType:
				case HalfFloatType:
				case UnsignedShort4444Type:
				case UnsignedShort5551Type:
					return '16';
				case IntType:
				case UnsignedIntType:
				case FloatType:
				case UnsignedInt248Type:
				case UnsignedInt5999Type:
				case UnsignedInt101111Type:
					return '32';
				default:
					return '?';

			}

		};

		const getFormat = ( texture ) => {

			switch ( texture.format ) {

				case AlphaFormat:
					return 'a';
				case RedFormat:
				case RedIntegerFormat:
					return 'r';
				case RGFormat:
				case RGIntegerFormat:
					return 'rg';
				case RGBFormat:
				case RGBIntegerFormat:
					return 'rgb';
				case DepthFormat:
					return 'depth';
				case DepthStencilFormat:
					return 'depth-stencil';
				case RGBAFormat:
				case RGBAIntegerFormat:
				default:
					return 'rgba';

			}

		};

		for ( let i = 0; i < textures.length; i ++ ) {

			const texture = textures[ i ];

			const bpc = getBPC( texture );
			const format = getFormat( texture );

			let description = `[${ i }]`;

			if ( texture.name && ! ( texture.isDepthTexture && texture.name === 'depth' ) ) {

				description += ` ${ texture.name }`;

			}

			description += ` ${ format } ${ bpc } bpc`;

			attachments.push( description );

		}

		const details = {
			target: renderTarget.name || 'RenderTarget',
			[ `attachments(${ textures.length })` ]: attachments.join( ', ' )
		};

		if ( renderTarget.depthTexture ) {

			details.depth = `${ getBPC( renderTarget.depthTexture ) } bpc`;

		}

		return details;

	}

	getCallDetail( method, args ) {

		switch ( method ) {

			case 'draw': {

				const renderObject = args[ 0 ];

				const details = {
					object: renderObject.object.name || renderObject.object.type,
					material: renderObject.material.name || renderObject.material.type,
					geometry: renderObject.geometry.name || renderObject.geometry.type
				};

				if ( renderObject.getDrawParameters ) {

					const drawParams = renderObject.getDrawParameters();

					if ( drawParams ) {

						if ( renderObject.object.isMesh || renderObject.object.isSprite ) {

							details.triangles = drawParams.vertexCount / 3;

							if ( renderObject.object.count > 1 ) {

								details.instance = renderObject.object.count;

								details[ 'triangles per instance' ] = details.triangles;
								details.triangles *= details.instance;

							}

						}

					}

				}

				return details;

			}

			case 'beginRender': {

				const renderContext = args[ 0 ];

				const details = {
					scene: this.renderer.inspector.currentRender.name || 'unknown',
					camera: renderContext.camera.name || renderContext.camera.type
				};

				if ( renderContext.renderTarget && ! renderContext.renderTarget.isPostProcessingRenderTarget ) {

					Object.assign( details, this.getRenderTargetDetails( renderContext.renderTarget ) );

				} else {

					details.target = 'CanvasTarget';

				}

				return details;

			}

			case 'beginCompute': {

				const details = {
					compute: this.renderer.inspector.currentCompute.name || 'unknown'
				};

				return details;

			}

			case 'compute': {

				const computeNode = args[ 1 ];
				const bindings = args[ 2 ];
				const dispatchSize = args[ 4 ] || computeNode.dispatchSize || computeNode.count;

				const node = computeNode.name || computeNode.type || 'unknown';

				// bindings

				let bindingsCount = 0;

				if ( bindings ) {

					bindingsCount = bindings.length;

				}

				// dispatch

				let dispatch;

				if ( dispatchSize.isIndirectStorageBufferAttribute ) {

					dispatch = 'indirect';

				} else if ( Array.isArray( dispatchSize ) ) {

					dispatch = dispatchSize.join( ', ' );

				} else {

					dispatch = dispatchSize;

				}

				// details

				return {
					node,
					bindings: bindingsCount,
					dispatch
				};

			}

			case 'updateBinding': {

				const binding = args[ 0 ];

				return { group: binding.name || 'unknown' };

			}

			case 'clear': {

				const renderContext = args[ 3 ];

				const details = {
					color: args[ 0 ],
					depth: args[ 1 ],
					stencil: args[ 2 ]
				};

				if ( renderContext.renderTarget && ! renderContext.renderTarget.isPostProcessingRenderTarget ) {

					const renderTargetDetails = this.getRenderTargetDetails( renderContext.renderTarget );

					if ( renderTargetDetails.depth ) {

						renderTargetDetails[ 'depth texture' ] = renderTargetDetails.depth;

						delete renderTargetDetails.depth;

					}

					Object.assign( details, renderTargetDetails );

				} else {

					details.target = 'CanvasTarget';

				}

				return details;

			}

			case 'updateViewport': {

				const renderContext = args[ 0 ];
				const { x, y, width, height } = renderContext.viewportValue;

				return { x, y, width, height };

			}

			case 'updateScissor': {

				const renderContext = args[ 0 ];
				const { x, y, width, height } = renderContext.scissorValue;

				return { x, y, width, height };

			}

			case 'createProgram':
			case 'destroyProgram': {

				const program = args[ 0 ];
				return { stage: program.stage, name: program.name || 'unknown' };

			}

			case 'createRenderPipeline': {

				const renderObject = args[ 0 ];
				const details = {
					object: renderObject.object ? ( renderObject.object.name || renderObject.object.type || 'unknown' ) : 'unknown',
					material: renderObject.material ? ( renderObject.material.name || renderObject.material.type || 'unknown' ) : 'unknown'
				};

				return details;

			}

			case 'createComputePipeline':
			case 'destroyComputePipeline': {

				const pipeline = args[ 0 ];
				return { name: pipeline.name || 'unknown' };

			}

			case 'createBindings':
			case 'updateBindings': {

				const bindGroup = args[ 0 ];

				const details = {
					group: bindGroup.name || 'unknown',
					count: bindGroup.bindings.length
				};

				return details;

			}

			case 'createUniformBuffer':
			case 'destroyUniformBuffer': {

				const binding = args[ 0 ];

				const details = {
					group: binding.groupNode.name || 'unknown',
					size: binding.byteLength + ' bytes'
				};

				if ( binding.name !== details.group ) {

					details.name = binding.name;

				}

				return details;

			}

			case 'createNodeBuilder': {

				const object = args[ 0 ];
				const details = { object: object.name || object.type || 'unknown' };

				if ( object.material ) {

					details.material = object.material.name || object.material.type || 'unknown';

				}

				return details;

			}

			case 'createAttribute':
			case 'createIndexAttribute':
			case 'createStorageAttribute':
			case 'destroyAttribute':
			case 'destroyIndexAttribute':
			case 'destroyStorageAttribute': {

				const attribute = args[ 0 ];
				const details = {};

				if ( attribute.name ) details.name = attribute.name;
				if ( attribute.count !== undefined ) details.count = attribute.count;
				if ( attribute.itemSize !== undefined ) details.itemSize = attribute.itemSize;

				return details;

			}

			case 'copyFramebufferToTexture': {

				const target = args[ 0 ];
				const rectangle = args[ 2 ];

				const details = {
					target: this.getTextureName( target ),
					width: rectangle.z,
					height: rectangle.w
				};

				return details;

			}

			case 'copyTextureToTexture': {

				const srcTexture = args[ 0 ];
				const dstTexture = args[ 1 ];

				const details = {
					source: this.getTextureName( srcTexture ),
					destination: this.getTextureName( dstTexture )
				};

				return details;

			}

			case 'updateSampler': {

				const texture = args[ 0 ];

				const details = {
					magFilter: this.getTextureFilterName( texture.magFilter ),
					minFilter: this.getTextureFilterName( texture.minFilter ),
					wrapS: this.getTextureWrapName( texture.wrapS ),
					wrapT: this.getTextureWrapName( texture.wrapT ),
					anisotropy: texture.anisotropy
				};

				return details;

			}

			case 'updateTexture':
			case 'generateMipmaps':
			case 'createTexture':
			case 'destroyTexture': {

				const texture = args[ 0 ];
				const name = this.getTextureName( texture );
				const details = { texture: name };

				if ( texture.image ) {

					if ( texture.image.width !== undefined ) details.width = texture.image.width;
					if ( texture.image.height !== undefined ) details.height = texture.image.height;

				}

				return details;

			}

		}

		return null;

	}

	getTextureName( texture ) {

		if ( texture.name ) return texture.name;

		const types = [
			'isFramebufferTexture', 'isDepthTexture', 'isDataArrayTexture',
			'isData3DTexture', 'isDataTexture', 'isCompressedArrayTexture',
			'isCompressedTexture', 'isCubeTexture', 'isVideoTexture',
			'isCanvasTexture', 'isTexture'
		];

		for ( const type of types ) {

			if ( texture[ type ] ) return type.replace( 'is', '' );

		}

		return 'Texture';

	}

	getTextureFilterName( filter ) {

		const filters = {
			1003: 'Nearest',
			1004: 'NearestMipmapNearest',
			1005: 'NearestMipmapLinear',
			1006: 'Linear',
			1007: 'LinearMipmapNearest',
			1008: 'LinearMipmapLinear'
		};

		return filters[ filter ] || filter;

	}

	getTextureWrapName( wrap ) {

		const wrappings = {
			1000: 'Repeat',
			1001: 'ClampToEdge',
			1002: 'MirroredRepeat'
		};

		return wrappings[ wrap ] || wrap;

	}

	formatDetails( details ) {

		const parts = [];

		for ( const key in details ) {

			if ( details[ key ] !== undefined ) {

				parts.push( `<span style="opacity: 0.5">${key}:</span> <span style="color: var(--text-secondary); opacity: 1">${details[ key ]}</span>` );

			}

		}

		if ( parts.length === 0 ) return '';

		return `<span style="font-size: 11px; margin-left: 8px; color: var(--text-secondary); opacity: 1;">{ ${parts.join( '<span style="opacity: 0.5">, </span>' )} }</span>`;

	}

	renderSlider() {

		if ( this.frames.length === 0 ) {

			this.playhead.style.display = 'none';
			this.frameInfo.textContent = '';
			return;

		}

		// Reset graph safely to fit recorded frames exactly up to maxPoints
		this.graph.lines[ 'calls' ].points = [];
		this.graph.lines[ 'fps' ].points = [];
		this.graph.lines[ 'triangles' ].points = [];
		this.graph.resetLimit();

		// If recorded frames exceed SVG Graph maxPoints, we sample/slice it
		// (Graph.js inherently handles shifting for real-time,
		// but statically we want to visualize as much up to max bounds)
		let framesToRender = this.frames;
		if ( framesToRender.length > this.graph.maxPoints ) {

			framesToRender = framesToRender.slice( - this.graph.maxPoints );
			this.frames = framesToRender; // Adjust our internal array to match what's visible

		}

		let maxTriangles = 0;

		for ( let i = 0; i < framesToRender.length; i ++ ) {

			const t = framesToRender[ i ].triangles || 0;
			if ( t > maxTriangles ) {

				maxTriangles = t;

			}

		}

		for ( let i = 0; i < framesToRender.length; i ++ ) {

			const t = framesToRender[ i ].triangles || 0;
			const normalizedTriangles = maxTriangles > 0 ? ( t / maxTriangles ) * TRIANGLES_GRAPH_LIMIT : 0;

			// Adding calls length to the Graph SVG to visualize workload geometry
			this.graph.addPoint( 'calls', framesToRender[ i ].calls.length );
			this.graph.addPoint( 'fps', framesToRender[ i ].fps || 0 );
			this.graph.addPoint( 'triangles', normalizedTriangles );

		}

		this.graph.update();

		this.playhead.style.display = 'block';

		// Select the previously selected frame, or the last one if tracking, or 0
		let targetFrame = 0;
		if ( this.selectedFrameIndex !== - 1 && this.selectedFrameIndex < this.frames.length ) {

			targetFrame = this.selectedFrameIndex;

		} else if ( this.frames.length > 0 ) {

			targetFrame = this.frames.length - 1;

		}

		this.selectFrame( targetFrame );

	}

	selectFrame( index ) {

		if ( index < 0 || index >= this.frames.length ) return;

		this.selectedFrameIndex = index;

		const frame = this.frames[ index ];
		this.renderTimelineTrack( frame );

		// Update UI texts
		const group = ( c, text ) => `<span style="display:inline-flex;align-items:center;margin-left:12px;"><span style="width:6px;height:6px;border-radius:50%;background-color:${c};margin-right:6px;"></span>${text}</span>`;
		const maxTriangles = Math.max( this.baseTriangles, frame.triangles || 0 );
		this.frameInfo.innerHTML = 'Frame: ' + frame.id + group( 'var(--color-fps)', ( frame.fps || 0 ).toFixed( 1 ) + ' FPS' ) + group( 'var(--color-call)', frame.calls.length + ' calls' ) + group( 'var(--color-red)', ( frame.triangles || 0 ) + ' / ' + maxTriangles + ' triangles' );

		// Update playhead position
		const rect = this.graphSlider.getBoundingClientRect();
		const pointCount = this.graph.lines[ 'calls' ].points.length;

		if ( pointCount > 0 ) {

			// Calculate point width step
			const pointStep = rect.width / ( this.graph.maxPoints - 1 );

			let localIndex = index;

			if ( this.frames.length > pointCount ) {

				localIndex = index - ( this.frames.length - pointCount );

			}

			// x offset calculation from SVG update logic
			// The graph translates (slides) back if points length < maxPoints
			// which means point 0 is at offset
			const offset = rect.width - ( ( pointCount - 1 ) * pointStep );
			let xPos = offset + ( localIndex * pointStep );
			xPos = Math.max( 1, Math.min( xPos, rect.width - 1 ) );

			this.playhead.style.left = xPos + 'px';
			this.playhead.style.display = 'block';

		}

	}

	getCallBlock( call, fallbackIndex, instanceIndex = 0 ) {

		const target = call.target;
		let block;

		if ( target && typeof target === 'object' ) {

			let blocks = this.callBlocks.get( target );

			if ( ! blocks ) {

				blocks = [];
				this.callBlocks.set( target, blocks );

			}

			block = blocks[ instanceIndex ];

		} else {

			block = this.fallbackBlocks[ fallbackIndex ];

		}

		if ( ! block ) {

			block = document.createElement( 'div' );
			block.style.padding = '4px 8px';
			block.style.margin = '2px 0';
			block.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
			block.style.fontFamily = 'monospace';
			block.style.fontSize = '12px';
			block.style.color = 'var(--text-primary)';
			block.style.whiteSpace = 'nowrap';
			block.style.overflow = 'hidden';
			block.style.textOverflow = 'ellipsis';
			block.style.display = 'flex';
			block.style.alignItems = 'center';

			block.arrow = document.createElement( 'span' );
			block.arrow.style.fontSize = '10px';
			block.arrow.style.marginRight = '10px';
			block.arrow.style.cursor = 'pointer';
			block.arrow.style.width = '26px';
			block.arrow.style.textAlign = 'center';
			block.appendChild( block.arrow );

			block.titleSpan = document.createElement( 'span' );
			block.appendChild( block.titleSpan );

			block.addEventListener( 'click', ( e ) => {

				if ( ! block._groupId ) return;

				e.stopPropagation();

				if ( this.collapsedGroups.has( block._groupId ) ) {

					this.collapsedGroups.delete( block._groupId );

				} else {

					this.collapsedGroups.add( block._groupId );

				}

				this.renderTimelineTrack( this.frames[ this.selectedFrameIndex ] );

			} );

			if ( target && typeof target === 'object' ) {

				this.callBlocks.get( target )[ instanceIndex ] = block;

			} else {

				this.fallbackBlocks[ fallbackIndex ] = block;

			}

		}

		block.style.cursor = 'default';
		block._groupId = null;
		block.arrow.style.display = 'none';

		return block;

	}

	renderTimelineTrack( frame ) {

		if ( ! frame || frame.calls.length === 0 ) {

			this.timelineTrack.innerHTML = '';
			return;

		}

		// Track collapsed states
		if ( ! this.collapsedGroups ) {

			this.collapsedGroups = new Set();

		}

		let blockIndex = 0;
		const trackChildren = this.timelineTrack.children;
		let childIndex = 0;
		const instanceCounts = new WeakMap();

		if ( this.isHierarchicalView ) {

			const groupedCalls = [];
			let currentGroup = null;

			for ( let i = 0; i < frame.calls.length; i ++ ) {

				const call = frame.calls[ i ];
				const isStructural = call.method.startsWith( 'begin' ) || call.method.startsWith( 'finish' );
				const formatedDetails = call.details ? this.formatDetails( call.details ) : '';

				if ( currentGroup && currentGroup.method === call.method && currentGroup.formatedDetails === formatedDetails && ! isStructural ) {

					currentGroup.count ++;

				} else {

					currentGroup = { method: call.method, count: 1, formatedDetails, target: call.target };
					groupedCalls.push( currentGroup );

				}

			}

			let currentIndent = 0;
			const indentSize = 24;

			// Stack to keep track of parent elements and their collapsed state
			const elementStack = [ { element: this.timelineTrack, isCollapsed: false, id: '', beginCount: 0 } ];

			for ( let i = 0; i < groupedCalls.length; i ++ ) {

				const call = groupedCalls[ i ];

				let instanceIndex = 0;

				if ( call.target && typeof call.target === 'object' ) {

					instanceIndex = instanceCounts.get( call.target ) || 0;
					instanceCounts.set( call.target, instanceIndex + 1 );

				}

				const block = this.getCallBlock( call, blockIndex ++, instanceIndex );
				block.style.marginLeft = ( currentIndent * indentSize ) + 'px';
				block.style.borderLeft = '4px solid ' + this.getColorForMethod( call.method );

				const currentParent = elementStack[ elementStack.length - 1 ];

				// Only add to DOM if parent is not collapsed
				if ( ! currentParent.isCollapsed ) {

					if ( trackChildren[ childIndex ] !== block ) {

						this.timelineTrack.insertBefore( block, trackChildren[ childIndex ] );

					}

					childIndex ++;

				}

				if ( call.method.startsWith( 'begin' ) ) {

					const beginIndex = currentParent.beginCount ++;
					const groupId = currentParent.id + '/' + call.method + '-' + beginIndex;
					const isCollapsed = this.collapsedGroups.has( groupId );

					block._groupId = groupId;
					block.style.cursor = 'pointer';

					block.arrow.style.display = 'inline-block';
					block.arrow.textContent = isCollapsed ? '[ + ]' : '[ - ]';

					block.titleSpan.innerHTML = call.method + ( call.formatedDetails ? call.formatedDetails : '' ) + ( call.count > 1 ? ` <span style="opacity: 0.5">( ${call.count} )</span>` : '' );

					currentIndent ++;
					elementStack.push( { element: block, isCollapsed: currentParent.isCollapsed || isCollapsed, id: groupId, beginCount: 0 } );

				} else if ( call.method.startsWith( 'finish' ) ) {

					block.titleSpan.innerHTML = call.method + ( call.formatedDetails ? call.formatedDetails : '' ) + ( call.count > 1 ? ` <span style="opacity: 0.5">( ${call.count} )</span>` : '' );

					currentIndent = Math.max( 0, currentIndent - 1 );
					elementStack.pop();

				} else {

					block.titleSpan.innerHTML = call.method + ( call.formatedDetails ? call.formatedDetails : '' ) + ( call.count > 1 ? ` <span style="opacity: 0.5">( ${call.count} )</span>` : '' );

				}

			}

		} else {

			const callCounts = {};

			for ( let i = 0; i < frame.calls.length; i ++ ) {

				const method = frame.calls[ i ].method;

				if ( method.startsWith( 'finish' ) ) continue;

				callCounts[ method ] = ( callCounts[ method ] || 0 ) + 1;

			}

			const sortedCalls = Object.keys( callCounts ).map( method => ( { method, count: callCounts[ method ] } ) );
			sortedCalls.sort( ( a, b ) => b.count - a.count );

			for ( let i = 0; i < sortedCalls.length; i ++ ) {

				const call = sortedCalls[ i ];

				const block = this.getCallBlock( call, blockIndex ++ );
				block.style.marginLeft = '0px';
				block.style.borderLeft = '4px solid ' + this.getColorForMethod( call.method );

				block.titleSpan.innerHTML = call.method + ( call.count > 1 ? ` <span style="opacity: 0.5">( ${call.count} )</span>` : '' );

				if ( trackChildren[ childIndex ] !== block ) {

					this.timelineTrack.insertBefore( block, trackChildren[ childIndex ] );

				}

				childIndex ++;

			}

		}

		while ( this.timelineTrack.children.length > childIndex ) {

			this.timelineTrack.removeChild( this.timelineTrack.lastChild );

		}

	}

	getColorForMethod( method ) {

		if ( method.startsWith( 'begin' ) ) return 'var(--color-green)';
		if ( method.startsWith( 'finish' ) || method.startsWith( 'destroy' ) ) return 'var(--color-red)';
		if ( method.startsWith( 'draw' ) || method.startsWith( 'compute' ) || method.startsWith( 'create' ) || method.startsWith( 'generate' ) ) return 'var(--color-yellow)';
		return 'var(--text-secondary)';

	}

}

export { Timeline };
