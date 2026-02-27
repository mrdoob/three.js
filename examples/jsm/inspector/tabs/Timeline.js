import { Tab } from '../ui/Tab.js';
import { Graph } from '../ui/Graph.js';

const LIMIT = 500;

class Timeline extends Tab {

	constructor( options = {} ) {

		super( 'Timeline', options );

		this.isRecording = false;
		this.frames = []; // Array of { id: number, calls: [] }
		this.currentFrame = null;
		this.isHierarchicalView = true;

		this.originalBackend = null;
		this.originalMethods = new Map();
		this.renderer = null;

		this.graph = new Graph( LIMIT ); // Accommodate standard graph points
		// Make lines in timeline graph
		this.graph.addLine( 'fps', '--accent-color' );
		this.graph.addLine( 'calls', '--color-yellow' );

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

			const storage = JSON.parse( localStorage.getItem( 'threejs-inspector' ) || '{}' );
			storage.timeline = storage.timeline || {};
			storage.timeline.recording = true;
			localStorage.setItem( 'threejs-inspector', JSON.stringify( storage ) );

			window.location.reload();

		} );

		const buttonsGroup = document.createElement( 'div' );
		buttonsGroup.className = 'console-buttons-group';
		buttonsGroup.appendChild( this.viewModeButton );
		buttonsGroup.appendChild( this.recordButton );
		buttonsGroup.appendChild( this.recordRefreshButton );
		buttonsGroup.appendChild( clearButton );

		header.style.display = 'flex';
		header.style.justifyContent = 'space-between';
		header.style.padding = '6px';
		header.style.borderBottom = '1px solid var(--border-color)';

		const titleElement = document.createElement( 'div' );
		titleElement.textContent = 'Backend Calls Timeline';
		titleElement.style.color = 'var(--text-primary)';
		titleElement.style.alignSelf = 'center';
		titleElement.style.paddingLeft = '5px';

		this.frameInfo = document.createElement( 'span' );
		this.frameInfo.style.marginLeft = '15px';
		this.frameInfo.style.fontFamily = 'monospace';
		this.frameInfo.style.color = 'var(--text-secondary)';
		this.frameInfo.style.fontSize = '12px';
		titleElement.appendChild( this.frameInfo );

		header.appendChild( titleElement );
		header.appendChild( buttonsGroup );
		this.content.appendChild( header );

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

				const snappedX = offset + localFrameIndex * pointStep;
				this.hoverIndicator.style.left = snappedX + 'px';

			} else {

				this.hoverIndicator.style.left = x + 'px';

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

					const snappedX = offset + localFrameIndex * pointStep;
					this.hoverIndicator.style.left = snappedX + 'px';

				} else {

					this.hoverIndicator.style.left = x + 'px';

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
		this.content.appendChild( container );

	}

	setRenderer( renderer ) {

		this.renderer = renderer;

		const storage = JSON.parse( localStorage.getItem( 'threejs-inspector' ) || '{}' );

		if ( storage.timeline && storage.timeline.recording ) {

			storage.timeline.recording = false;
			localStorage.setItem( 'threejs-inspector', JSON.stringify( storage ) );

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

							this.graph.addPoint( 'calls', this.currentFrame.calls.length );
							this.graph.addPoint( 'fps', this.currentFrame.fps );
							this.graph.update();

						}

						this.currentFrame = { id: frameNumber, calls: [], fps: 0 };
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

					let methodLabel = prop;

					if ( prop === 'beginRender' ) {

						if ( this.renderer.inspector && this.renderer.inspector.currentRender ) {

							methodLabel += ' - ' + this.renderer.inspector.currentRender.name;

						}

					} else if ( prop === 'beginCompute' ) {

						if ( this.renderer.inspector && this.renderer.inspector.currentCompute ) {

							methodLabel += ' - ' + this.renderer.inspector.currentCompute.name;

						}

					}

					// Only record method name as requested, skipping detail arguments
					this.currentFrame.calls.push( { method: methodLabel } );

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
		this.graph.lines[ 'calls' ].points = [];
		this.graph.lines[ 'fps' ].points = [];
		this.graph.resetLimit();
		this.graph.update();

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
		this.graph.resetLimit();

		// If recorded frames exceed SVG Graph maxPoints, we sample/slice it
		// (Graph.js inherently handles shifting for real-time,
		// but statically we want to visualize as much up to max bounds)
		let framesToRender = this.frames;
		if ( framesToRender.length > this.graph.maxPoints ) {

			framesToRender = framesToRender.slice( - this.graph.maxPoints );
			this.frames = framesToRender; // Adjust our internal array to match what's visible

		}

		for ( let i = 0; i < framesToRender.length; i ++ ) {

			// Adding calls length to the Graph SVG to visualize workload geometry
			this.graph.addPoint( 'calls', framesToRender[ i ].calls.length );
			this.graph.addPoint( 'fps', framesToRender[ i ].fps || 0 );

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
		this.frameInfo.textContent = 'Frame: ' + frame.id + ' [' + frame.calls.length + ' calls] [' + ( frame.fps || 0 ).toFixed( 1 ) + ' FPS]';

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
			const xPos = offset + ( localIndex * pointStep );

			this.playhead.style.left = xPos + 'px';
			this.playhead.style.display = 'block';

		}

	}

	renderTimelineTrack( frame ) {

		this.timelineTrack.innerHTML = '';

		if ( ! frame || frame.calls.length === 0 ) return;

		// Track collapsed states
		if ( ! this.collapsedGroups ) {

			this.collapsedGroups = new Set();

		}

		const frag = document.createDocumentFragment();

		if ( this.isHierarchicalView ) {

			const groupedCalls = [];
			let currentGroup = null;

			for ( let i = 0; i < frame.calls.length; i ++ ) {

				const call = frame.calls[ i ];
				const isStructural = call.method.startsWith( 'begin' ) || call.method.startsWith( 'finish' );

				if ( currentGroup && currentGroup.method === call.method && ! isStructural ) {

					currentGroup.count ++;

				} else {

					currentGroup = { method: call.method, count: 1 };
					groupedCalls.push( currentGroup );

				}

			}

			let currentIndent = 0;
			const indentSize = 24;

			// Stack to keep track of parent elements and their collapsed state
			const elementStack = [ { element: frag, isCollapsed: false, id: '' } ];

			for ( let i = 0; i < groupedCalls.length; i ++ ) {

				const call = groupedCalls[ i ];

				const block = document.createElement( 'div' );
				block.style.padding = '4px 8px';
				block.style.margin = '2px 0';
				block.style.marginLeft = ( currentIndent * indentSize ) + 'px';
				block.style.borderLeft = '4px solid ' + this.getColorForMethod( call.method );
				block.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
				block.style.fontFamily = 'monospace';
				block.style.fontSize = '12px';
				block.style.color = 'var(--text-primary)';
				block.style.whiteSpace = 'nowrap';
				block.style.overflow = 'hidden';
				block.style.textOverflow = 'ellipsis';
				block.style.display = 'flex';
				block.style.alignItems = 'center';

				const currentParent = elementStack[ elementStack.length - 1 ];

				// Only add to DOM if parent is not collapsed
				if ( ! currentParent.isCollapsed ) {

					frag.appendChild( block );

				}

				if ( call.method.startsWith( 'begin' ) ) {

					const groupId = currentParent.id + '/' + call.method + '-' + i;
					const isCollapsed = this.collapsedGroups.has( groupId );

					// Add toggle arrow
					const arrow = document.createElement( 'span' );
					arrow.textContent = isCollapsed ? '[ + ]' : '[ - ]';
					arrow.style.fontSize = '10px';
					arrow.style.marginRight = '10px';
					arrow.style.cursor = 'pointer';
					arrow.style.width = '26px';
					arrow.style.display = 'inline-block';
					arrow.style.textAlign = 'center';
					block.appendChild( arrow );

					block.style.cursor = 'pointer';

					// Title
					const title = document.createElement( 'span' );
					title.textContent = call.method + ( call.count > 1 ? ` ( ${call.count} )` : '' );
					block.appendChild( title );

					block.addEventListener( 'click', ( e ) => {

						e.stopPropagation();
						if ( isCollapsed ) {

							this.collapsedGroups.delete( groupId );

						} else {

							this.collapsedGroups.add( groupId );

						}

						// Re-render to apply changes
						this.renderTimelineTrack( this.frames[ this.selectedFrameIndex ] );

					} );

					currentIndent ++;
					elementStack.push( { element: block, isCollapsed: currentParent.isCollapsed || isCollapsed, id: groupId } );

				} else if ( call.method.startsWith( 'finish' ) ) {

					block.textContent = call.method + ( call.count > 1 ? ` ( ${call.count} )` : '' );

					currentIndent = Math.max( 0, currentIndent - 1 );
					elementStack.pop();

				} else {

					block.textContent = call.method + ( call.count > 1 ? ` ( ${call.count} )` : '' );

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

				const block = document.createElement( 'div' );
				block.style.padding = '4px 8px';
				block.style.margin = '2px 0';
				block.style.borderLeft = '4px solid ' + this.getColorForMethod( call.method );
				block.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
				block.style.fontFamily = 'monospace';
				block.style.fontSize = '12px';
				block.style.color = 'var(--text-primary)';
				block.style.whiteSpace = 'nowrap';
				block.style.overflow = 'hidden';
				block.style.textOverflow = 'ellipsis';

				block.textContent = call.method + ( call.count > 1 ? ` ( ${call.count} )` : '' );

				frag.appendChild( block );

			}

		}

		this.timelineTrack.appendChild( frag );

	}

	getColorForMethod( method ) {

		if ( method.startsWith( 'begin' ) ) return 'var(--color-green)';
		if ( method.startsWith( 'finish' ) || method.startsWith( 'destroy' ) ) return 'var(--color-red)';
		if ( method.startsWith( 'draw' ) || method.startsWith( 'compute' ) || method.startsWith( 'create' ) || method.startsWith( 'generate' ) ) return 'var(--color-yellow)';
		return 'var(--text-secondary)';

	}

}

export { Timeline };
