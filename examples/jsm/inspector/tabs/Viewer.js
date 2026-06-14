import { Tab } from '../ui/Tab.js';
import { List } from '../ui/List.js';
import { Item } from '../ui/Item.js';
import { splitPath, splitCamelCase } from '../ui/utils.js';
import { getItem, setItem } from '../Inspector.js';

import { RendererUtils, NoToneMapping, LinearSRGBColorSpace, QuadMesh, NodeMaterial, CanvasTarget, Vector2 } from 'three/webgpu';
import { renderOutput, vec2, vec3, vec4, Fn, screenUV, step, OnMaterialUpdate, uniform, float } from 'three/tsl';

const _size = /*@__PURE__*/ new Vector2();

const aspectRatioUV = /*@__PURE__*/ Fn( ( [ uv, textureNode, canvasAspect ] ) => {

	const textureAspect = uniform( 0 );

	OnMaterialUpdate( () => {

		const { width, height } = textureNode.value;

		textureAspect.value = width / height;

	} );

	const ratio = canvasAspect.div( textureAspect );

	const centered = uv.sub( 0.5 );

	// If canvasAspect > textureAspect:
	const uvWide = vec2( centered.x.mul( ratio ), centered.y ).add( 0.5 );

	// If canvasAspect <= textureAspect:
	const uvTall = vec2( centered.x, centered.y.div( ratio ) ).add( 0.5 );

	const finalUV = canvasAspect.greaterThan( textureAspect ).select( uvWide, uvTall );

	const inBounds = step( 0.0, finalUV.x ).mul( step( finalUV.x, 1.0 ) ).mul( step( 0.0, finalUV.y ) ).mul( step( finalUV.y, 1.0 ) );

	return vec3( finalUV, inBounds );

} );

class Viewer extends Tab {

	constructor( options = {} ) {

		super( 'Viewer', options );

		this.content.style.overflow = 'hidden';
		this.maximizedByFullscreenButton = false;

		// Toolbar
		const toolbar = document.createElement( 'div' );
		toolbar.className = 'toolbar';

		const backBtn = document.createElement( 'button' );
		backBtn.className = 'viewer-back-btn';
		backBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>';
		backBtn.title = 'Back to list';
		backBtn.style.display = 'none';
		toolbar.appendChild( backBtn );

		const label = document.createElement( 'span' );
		label.textContent = 'View:';
		toolbar.appendChild( label );

		const select = document.createElement( 'select' );
		select.className = 'select';
		select.style.width = '200px';

		const defaultOption = document.createElement( 'option' );
		defaultOption.value = 'list';
		defaultOption.textContent = 'List';
		select.appendChild( defaultOption );

		toolbar.appendChild( select );
		this.content.appendChild( toolbar );

		const nodeList = new List( 'Viewer', 'Name' );
		nodeList.setGridStyle( '150px minmax(200px, 2fr)' );
		nodeList.domElement.style.minWidth = '400px';

		const scrollWrapper = document.createElement( 'div' );
		scrollWrapper.className = 'list-scroll-wrapper';
		scrollWrapper.style.flexGrow = '1';
		scrollWrapper.style.overflowY = 'auto';
		scrollWrapper.style.minHeight = '0';
		scrollWrapper.appendChild( nodeList.domElement );
		this.content.appendChild( scrollWrapper );

		// Container for full screen view
		const fullViewerContainer = document.createElement( 'div' );
		fullViewerContainer.className = 'full-viewer-container';
		fullViewerContainer.style.touchAction = 'none';
		this.content.appendChild( fullViewerContainer );

		const nodes = new Item( 'User Defined' );
		nodeList.add( nodes );

		//

		this.itemLibrary = new Map();
		this.folderLibrary = new Map();
		this.canvasNodes = new Map();
		this.currentDataList = [];
		this.nodeList = nodeList;
		this.nodes = nodes;
		this.scrollWrapper = scrollWrapper;
		this.fullViewerContainer = fullViewerContainer;
		this.select = select;
		this.backBtn = backBtn;
		this.activeFullNodeId = null;
		this.pendingRestoreView = true;

		backBtn.addEventListener( 'click', () => {

			select.value = 'list';
			this.showListView();

			if ( this.maximizedByFullscreenButton ) {

				if ( this.profiler && this.profiler.panel.classList.contains( 'maximized' ) ) {

					this.profiler.toggleMaximize();

				}

				this.maximizedByFullscreenButton = false;

			}

			this.saveLastView();

		} );

		select.addEventListener( 'change', () => {

			const val = select.value;

			if ( val === 'list' ) {

				this.showListView();

			} else {

				this.showNodeView( val );

			}

			this.saveLastView();

		} );

		// Event forwarding setup for OrbitControls
		this.isDraggingThumbnail = false;
		this.activeSourceCanvas = null;
		this.activePointerIds = new Set();

		const handleGlobalPointer = ( e ) => {

			if ( ! this.isDraggingThumbnail || ! this.activeSourceCanvas ) return;

			const renderer = this.inspector.getRenderer();

			if ( ! renderer || ! renderer.domElement ) return;

			if ( e.isForwarded ) return;

			// Block native event from reaching other document-level listeners (OrbitControls)
			e.stopImmediatePropagation();
			e.preventDefault();

			// Project and dispatch forwarded event
			this.forwardEvent( e, this.activeSourceCanvas, renderer.domElement );

			if ( e.type === 'pointerup' || e.type === 'pointercancel' ) {

				this.activePointerIds.delete( e.pointerId );

				if ( this.activePointerIds.size === 0 ) {

					this.isDraggingThumbnail = false;
					this.activeSourceCanvas = null;

				}

			}

		};

		window.addEventListener( 'pointermove', handleGlobalPointer, true );
		window.addEventListener( 'pointerup', handleGlobalPointer, true );
		window.addEventListener( 'pointercancel', handleGlobalPointer, true );

	}

	getFolder( name ) {

		let folder = this.folderLibrary.get( name );

		if ( folder === undefined ) {

			folder = new Item( name );

			this.folderLibrary.set( name, folder );
			this.nodeList.add( folder );

		}

		return folder;

	}

	hide() {

		super.hide();
		this.maximizedByFullscreenButton = false;
		this.isDraggingThumbnail = false;
		this.activeSourceCanvas = null;
		this.activePointerIds.clear();

	}

	addNodeItem( canvasData ) {

		let item = this.itemLibrary.get( canvasData.id );

		if ( item === undefined ) {

			const name = canvasData.name;
			const domElement = canvasData.canvasTarget.domElement;

			// Create wrapper
			const wrapper = document.createElement( 'div' );
			wrapper.className = 'node-canvas-wrapper';
			wrapper.style.position = 'relative';
			wrapper.style.display = 'inline-block';
			wrapper.style.width = '140px';
			wrapper.style.height = '140px';
			wrapper.style.touchAction = 'none';

			// View full screen button
			const viewBtn = document.createElement( 'button' );
			viewBtn.className = 'node-canvas-detach-btn';
			viewBtn.title = 'View full size';
			viewBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>';

			viewBtn.onclick = ( e ) => {

				e.stopPropagation();
				this.select.value = canvasData.id;
				this.showNodeView( canvasData.id );
				this.saveLastView();

			};

			// Fullscreen and maximize button
			const fullscreenBtn = document.createElement( 'button' );
			fullscreenBtn.className = 'node-canvas-fullscreen-btn';
			fullscreenBtn.title = 'Fullscreen view';
			fullscreenBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';

			fullscreenBtn.onclick = ( e ) => {

				e.stopPropagation();
				this.select.value = canvasData.id;
				this.showNodeView( canvasData.id );

				if ( this.profiler && ! this.profiler.panel.classList.contains( 'maximized' ) ) {

					this.profiler.toggleMaximize();
					this.maximizedByFullscreenButton = true;

					if ( ! this._maximizeListenerAdded && this.profiler.maximizeBtn ) {

						this.profiler.maximizeBtn.addEventListener( 'click', () => {

							this.maximizedByFullscreenButton = false;

						} );
						this._maximizeListenerAdded = true;

					}

				}

				this.saveLastView();

			};

			wrapper.appendChild( domElement );
			wrapper.appendChild( viewBtn );
			wrapper.appendChild( fullscreenBtn );

			this.setupEventForwarding( domElement );

			// Store elements in canvasData for access
			canvasData.domElement = domElement;
			canvasData.wrapperElement = wrapper;

			item = new Item( wrapper, name );
			item.itemRow.children[ 1 ].style[ 'justify-content' ] = 'flex-start';
			this.itemLibrary.set( canvasData.id, item );

		}

		return item;

	}

	setupEventForwarding( sourceCanvas ) {

		sourceCanvas.style.touchAction = 'none';

		const onPointerDown = ( e ) => {

			const renderer = this.inspector.getRenderer();

			if ( ! renderer || ! renderer.domElement ) return;

			const targetCanvas = renderer.domElement;

			this.isDraggingThumbnail = true;
			this.activeSourceCanvas = sourceCanvas;
			this.activePointerIds.add( e.pointerId );

			// Project and dispatch pointerdown
			this.forwardEvent( e, sourceCanvas, targetCanvas );

		};

		sourceCanvas.addEventListener( 'pointerdown', onPointerDown );

		// Wheel event support for zooming
		const onWheel = ( e ) => {

			const renderer = this.inspector.getRenderer();

			if ( ! renderer || ! renderer.domElement ) return;

			e.preventDefault();
			e.stopPropagation();

			this.forwardEvent( e, sourceCanvas, renderer.domElement );

		};

		sourceCanvas.addEventListener( 'wheel', onWheel, { passive: false } );

		// Click, dblclick, contextmenu
		const onMouseShortcut = ( e ) => {

			const renderer = this.inspector.getRenderer();

			if ( ! renderer || ! renderer.domElement ) return;

			e.stopPropagation();

			if ( e.type === 'contextmenu' ) {

				e.preventDefault();

			}

			this.forwardEvent( e, sourceCanvas, renderer.domElement );

		};

		sourceCanvas.addEventListener( 'click', onMouseShortcut );
		sourceCanvas.addEventListener( 'dblclick', onMouseShortcut );
		sourceCanvas.addEventListener( 'contextmenu', onMouseShortcut );

	}

	forwardEvent( event, sourceCanvas, targetCanvas ) {

		const sourceRect = sourceCanvas.getBoundingClientRect();
		const targetRect = targetCanvas.getBoundingClientRect();

		const localX = ( event.clientX - sourceRect.left ) / sourceRect.width;
		const localY = ( event.clientY - sourceRect.top ) / sourceRect.height;

		const targetClientX = targetRect.left + localX * targetRect.width;
		const targetClientY = targetRect.top + localY * targetRect.height;
		const targetPageX = targetClientX + window.scrollX;
		const targetPageY = targetClientY + window.scrollY;

		let newEvent;

		const eventInit = {
			bubbles: true,
			cancelable: true,
			view: window,
			clientX: targetClientX,
			clientY: targetClientY,
			screenX: targetClientX + window.screenX,
			screenY: targetClientY + window.screenY,
			pageX: targetPageX,
			pageY: targetPageY,
			ctrlKey: event.ctrlKey,
			shiftKey: event.shiftKey,
			altKey: event.altKey,
			metaKey: event.metaKey,
			buttons: event.buttons,
			button: event.button
		};

		if ( event instanceof WheelEvent ) {

			newEvent = new WheelEvent( event.type, {
				...eventInit,
				deltaX: event.deltaX,
				deltaY: event.deltaY,
				deltaZ: event.deltaZ,
				deltaMode: event.deltaMode
			} );

		} else if ( window.PointerEvent && event instanceof PointerEvent ) {

			newEvent = new PointerEvent( event.type, {
				...eventInit,
				pointerId: event.pointerId,
				width: event.width,
				height: event.height,
				pressure: event.pressure,
				tiltX: event.tiltX,
				tiltY: event.tiltY,
				pointerType: event.pointerType,
				isPrimary: event.isPrimary
			} );

		} else {

			newEvent = new MouseEvent( event.type, eventInit );

		}

		newEvent.isForwarded = true;
		targetCanvas.dispatchEvent( newEvent );

	}

	showListView() {

		if ( this.activeFullNodeId ) {

			const canvasData = Array.from( this.canvasNodes.values() ).find( data => String( data.id ) === String( this.activeFullNodeId ) );

			if ( canvasData ) {

				// Move canvas back to wrapper
				canvasData.wrapperElement.appendChild( canvasData.domElement );

				// Reset size
				canvasData.domElement.style.width = '';
				canvasData.domElement.style.height = '';
				canvasData.canvasTarget.setSize( 140, 140 );

				const renderer = this.inspector.getRenderer();

				renderer.backend.delete( canvasData.canvasTarget );

			}

			this.activeFullNodeId = null;

		}

		this.scrollWrapper.style.display = '';
		this.fullViewerContainer.style.display = 'none';
		this.backBtn.style.display = 'none';

	}

	showNodeView( nodeId ) {

		// First restore previous full screen node if any
		if ( this.activeFullNodeId && String( this.activeFullNodeId ) !== String( nodeId ) ) {

			this.showListView();

		}

		const canvasData = Array.from( this.canvasNodes.values() ).find( data => String( data.id ) === String( nodeId ) );

		if ( canvasData ) {

			this.addNodeItem( canvasData );

			this.activeFullNodeId = nodeId;
			this.backBtn.style.display = 'flex';

			// Hide list, show full screen container
			this.scrollWrapper.style.display = 'none';
			this.fullViewerContainer.style.display = 'flex';

			// Move canvas to the full viewer container
			this.fullViewerContainer.appendChild( canvasData.domElement );
			canvasData.domElement.style.width = '100%';
			canvasData.domElement.style.height = '100%';

			// Resize canvas to fit full viewer container
			const rect = this.fullViewerContainer.getBoundingClientRect();
			const contentWidth = rect.width || this.content.clientWidth;
			const contentHeight = rect.height || ( this.content.clientHeight - 38 ); // minus toolbar
			canvasData.canvasTarget.setSize( contentWidth, contentHeight );

			const renderer = this.inspector.getRenderer();

			renderer.backend.delete( canvasData.canvasTarget );

		}

	}

	getCanvasDataByNode( renderer, node ) {

		let canvasData = this.canvasNodes.get( node );

		if ( canvasData === undefined ) {

			const canvas = document.createElement( 'canvas' );

			const canvasTarget = new CanvasTarget( canvas );
			canvasTarget.setPixelRatio( window.devicePixelRatio );
			canvasTarget.setSize( 140, 140 );

			const id = node.id;

			const { path, name } = splitPath( splitCamelCase( node.getName() || '(unnamed)' ) );

			const canvasAspect = uniform( 1 );
			const mask = float( 1 );

			const target = node.context( { getUV: ( textureNode ) => {

				const uvData = aspectRatioUV( screenUV, textureNode, canvasAspect );
				const correctedUV = uvData.xy;
				mask.assign( uvData.z );

				return correctedUV;

			} } );

			let output = vec4( vec3( target ), 1 ).mul( mask );
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
				material,
				canvasAspect
			};

			this.canvasNodes.set( node, canvasData );

		}

		return canvasData;

	}

	update( inspector ) {

		const renderer = inspector.getRenderer();
		const nodes = inspector.getNodes();

		if ( nodes.length > 0 ) {

			if ( ! renderer.backend.isWebGPUBackend ) {

				inspector.resolveConsoleOnce( 'warn', 'Inspector: Viewer is only available with WebGPU.' );

				return;

			}

			if ( ! this.isVisible ) {

				this.show();

			}

		}

		if ( ! this.isActive ) return;

		const canvasDataList = nodes.map( node => this.getCanvasDataByNode( renderer, node ) );

		// Check if the list of nodes has changed
		let nodesChanged = canvasDataList.length !== this.currentDataList.length;

		if ( ! nodesChanged ) {

			for ( let i = 0; i < canvasDataList.length; i ++ ) {

				if ( canvasDataList[ i ].id !== this.currentDataList[ i ].id ) {

					nodesChanged = true;
					break;

				}

			}

		}

		if ( nodesChanged ) {

			const currentSelectedValue = this.select.value;

			// Clear options except the first one ('list')
			while ( this.select.options.length > 1 ) {

				this.select.remove( 1 );

			}

			// Add options for each node in canvasDataList
			for ( const canvasData of canvasDataList ) {

				const option = document.createElement( 'option' );
				option.value = canvasData.id;
				option.textContent = canvasData.path ? `${ canvasData.path } / ${ canvasData.name }` : canvasData.name;
				this.select.appendChild( option );

			}

			// Try to restore from saved view first on initial load
			let restored = false;

			if ( this.pendingRestoreView ) {

				const savedView = getItem( 'viewerLastView' );

				if ( savedView !== 'list' ) {

					for ( let i = 0; i < this.select.options.length; i ++ ) {

						if ( this.select.options[ i ].textContent === savedView ) {

							this.select.selectedIndex = i;
							const nodeId = this.select.options[ i ].value;
							this.showNodeView( nodeId );
							restored = true;
							this.pendingRestoreView = false;
							break;

						}

					}

				} else {

					this.pendingRestoreView = false;

				}

			}

			if ( ! restored ) {

				// Restore selection if still valid
				let hasSelectedValue = false;

				for ( let i = 0; i < this.select.options.length; i ++ ) {

					if ( this.select.options[ i ].value === currentSelectedValue ) {

						this.select.selectedIndex = i;
						hasSelectedValue = true;
						break;

					}

				}

				if ( ! hasSelectedValue ) {

					this.select.value = 'list';
					this.showListView();

				}

			}

		}

		// Real-time resize of active full-screen node canvas target
		if ( this.activeFullNodeId ) {

			const canvasData = canvasDataList.find( data => String( data.id ) === String( this.activeFullNodeId ) );

			if ( canvasData ) {

				const rect = this.fullViewerContainer.getBoundingClientRect();
				const contentWidth = rect.width || this.content.clientWidth;
				const contentHeight = rect.height || ( this.content.clientHeight - 38 );

				if ( canvasData.canvasTarget.domElement.width !== contentWidth || canvasData.canvasTarget.domElement.height !== contentHeight ) {

					canvasData.canvasTarget.setSize( contentWidth, contentHeight );

					renderer.backend.delete( canvasData.canvasTarget );

				}

			}

		}

		//

		const previousDataList = [ ...this.currentDataList ];

		// remove old

		for ( const canvasData of previousDataList ) {

			if ( this.itemLibrary.has( canvasData.id ) && canvasDataList.indexOf( canvasData ) === - 1 ) {

				const item = this.itemLibrary.get( canvasData.id );
				const parent = item.parent;

				parent.remove( item );

				if ( this.folderLibrary.has( parent.data[ 0 ] ) && parent.children.length === 0 ) {

					parent.parent.remove( parent );

					this.folderLibrary.delete( parent.data[ 0 ] );

				}

				this.itemLibrary.delete( canvasData.id );

			}

		}

		//

		const indexes = {};

		for ( const canvasData of canvasDataList ) {

			const item = this.addNodeItem( canvasData );
			const previousCanvasTarget = renderer.getCanvasTarget();

			const path = canvasData.path;

			if ( path ) {

				const folder = this.getFolder( path );

				if ( indexes[ path ] === undefined ) {

					indexes[ path ] = 0;

				}

				if ( folder.parent === null || item.parent !== folder || folder.children.indexOf( item ) !== indexes[ path ] ) {

					folder.add( item );

				}

				indexes[ path ] ++;

			} else {

				if ( ! item.parent ) {

					this.nodes.add( item );

				}

			}

			const rttNodes = [];

			const mainSize = previousCanvasTarget.getDrawingBufferSize( _size );

			canvasData.node.traverse( ( child ) => {

				if ( child.isRTTNode && child.autoResize === true ) {

					const oldWidth = child.width;
					const oldHeight = child.height;

					child.width = mainSize.width;
					child.height = mainSize.height;

					child.setSize( mainSize.width, mainSize.height );

					rttNodes.push( {
						node: child,
						oldWidth,
						oldHeight
					} );

				}

			} );

			const state = RendererUtils.resetRendererState( renderer );

			renderer.toneMapping = NoToneMapping;
			renderer.outputColorSpace = LinearSRGBColorSpace;

			renderer.setCanvasTarget( canvasData.canvasTarget );

			if ( canvasData.canvasAspect ) {

				canvasData.canvasAspect.value = canvasData.canvasTarget.domElement.width / canvasData.canvasTarget.domElement.height;

			}

			canvasData.quad.render( renderer );

			renderer.setCanvasTarget( previousCanvasTarget );

			RendererUtils.restoreRendererState( renderer, state );

			for ( const rtt of rttNodes ) {

				rtt.node.width = rtt.oldWidth;
				rtt.node.height = rtt.oldHeight;

			}

		}

		this.currentDataList = canvasDataList;

	}

	setActive( isActive ) {

		super.setActive( isActive );

	}

	saveLastView() {

		const selectedValue = this.select.value;

		if ( selectedValue === 'list' ) {

			setItem( 'viewerLastView', 'list' );

		} else {

			const selectedOption = this.select.options[ this.select.selectedIndex ];

			if ( selectedOption ) {

				setItem( 'viewerLastView', selectedOption.textContent );

			}

		}

	}

}

export { Viewer };
