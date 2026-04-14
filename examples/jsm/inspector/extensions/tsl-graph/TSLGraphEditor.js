import { Raycaster, Vector2, BoxHelper, error, warn } from 'three/webgpu';
import { Extension } from 'three/addons/inspector/Extension.js';
import { TSLGraphLoader } from './TSLGraphLoader.js';

const HOST_SOURCE = 'tsl-graph-host';
const EDITOR_SOURCE = 'tsl-graph-editor';

const _resposeByCommand = {
	'tsl:command:get-code': 'tsl:response:get-code',
	'tsl:command:set-root-material': 'tsl:response:set-root-material',
	'tsl:command:get-graph': 'tsl:response:get-graph',
	'tsl:command:load': 'tsl:response:load',
	'tsl:command:clear-graph': 'tsl:response:clear-graph'
};

const _refMaterials = new WeakMap();

class TSLGraphEditor extends Extension {

	constructor( options = {} ) {

		super( 'TSL Graph', options );

		const editorUrl = new URL( 'https://www.tsl-graph.xyz/editor/standalone' );
		editorUrl.searchParams.set( 'graphs', 'material' );
		editorUrl.searchParams.set( 'targetOrigin', '*' );

		// UI Setup
		this.content.style.display = 'flex';
		this.content.style.flexDirection = 'column';
		this.content.style.position = 'relative';

		const headerDiv = document.createElement( 'div' );
		headerDiv.style.padding = '4px';
		headerDiv.style.backgroundColor = 'var(--profiler-header-bg, #2a2a33aa)';
		headerDiv.style.borderBottom = '1px solid var(--profiler-border, #4a4a5a)';
		headerDiv.style.display = 'flex';
		headerDiv.style.justifyContent = 'center';
		headerDiv.style.gap = '4px';
		headerDiv.style.position = 'relative';

		const importBtn = document.createElement( 'button' );
		importBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>';
		importBtn.className = 'panel-action-btn';
		importBtn.title = 'Import';
		importBtn.style.padding = '5px 8px';
		importBtn.onclick = () => this._importData();

		const exportBtn = document.createElement( 'button' );
		exportBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
		exportBtn.className = 'panel-action-btn';
		exportBtn.title = 'Export';
		exportBtn.style.padding = '5px 8px';
		exportBtn.onclick = () => this._exportData();

		const manageBtn = document.createElement( 'button' );
		manageBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="3" width="7" height="7" rx="1"></rect><path d="M14 4h7"></path><path d="M14 9h7"></path><path d="M14 15h7"></path><path d="M14 20h7"></path></svg>';
		manageBtn.className = 'panel-action-btn';
		manageBtn.title = 'Saved Materials';
		manageBtn.style.padding = '5px 8px';
		manageBtn.onclick = () => this._showManagerModal();

		const autoIdBtn = document.createElement( 'button' );
		autoIdBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c.132 5.466 2.534 7.868 8 8-5.466.132-7.868 2.534-8 8-.132-5.466-2.534-7.868-8-8 5.466-.132 7.868-2.534 8-8z"></path></svg>';
		autoIdBtn.className = 'panel-action-btn';
		autoIdBtn.title = 'Auto-Generate Graph ID';
		autoIdBtn.style.padding = '5px 8px';
		autoIdBtn.style.position = 'absolute';
		autoIdBtn.style.right = '4px';
		autoIdBtn.style.top = '4px';

		this.autoGraphId = false;

		autoIdBtn.onclick = () => {

			this.autoGraphId = ! this.autoGraphId;

			if ( this.autoGraphId ) {

				autoIdBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
				autoIdBtn.style.color = '#fff';

			} else {

				autoIdBtn.style.backgroundColor = '';
				autoIdBtn.style.color = '';

			}

		};

		headerDiv.appendChild( importBtn );
		headerDiv.appendChild( exportBtn );
		headerDiv.appendChild( manageBtn );
		headerDiv.appendChild( autoIdBtn );

		this.content.appendChild( headerDiv );

		this.iframe = document.createElement( 'iframe' );
		this.iframe.style.width = '100%';
		this.iframe.style.height = '100%';
		this.iframe.style.border = 'none';
		this.iframe.src = editorUrl.toString();
		this.editorOrigin = new URL( this.iframe.src ).origin;

		this.content.appendChild( this.iframe );

		this.material = null;
		this.uniforms = null;

		this.isReady = false;

		this._codeData = null;
		this._codeSaveTimeout = null;

		this._pending = new Map();

		this._resolveReady = null;
		this._editorReady = new Promise( ( resolve ) => {

			this._resolveReady = resolve;

		} );

		window.addEventListener( 'message', this.onMessage.bind( this ) );

	}

	get hasGraphs() {

		return TSLGraphLoader.hasGraphs;

	}

	_initPicker( inspector ) {

		const renderer = inspector.getRenderer();

		let boundingBox = null;

		const raycaster = new Raycaster();
		const pointer = new Vector2();

		const removeBoundingBox = () => {

			if ( boundingBox ) {

				boundingBox.removeFromParent();
				boundingBox.dispose();
				boundingBox = null;

			}

		};

		this.addEventListener( 'change', ( { material } ) => {

			if ( material === null ) {

				removeBoundingBox();

			}

		} );

		this.addEventListener( 'remove', ( { graphId } ) => {

			const frame = inspector.getFrame();
			const scene = frame && frame.renders.length > 0 ? frame.renders[ 0 ].scene : null;

			if ( scene ) {

				scene.traverse( ( object ) => {

					if ( object.material && object.material.userData && object.material.userData.graphId === graphId ) {

						this.restoreMaterial( object.material );

					}

				} );

			}

		} );

		const pointerDownPosition = new Vector2();

		renderer.domElement.addEventListener( 'pointerdown', ( e ) => {

			pointerDownPosition.set( e.clientX, e.clientY );

		} );

		renderer.domElement.addEventListener( 'pointerup', ( e ) => {

			const frame = inspector.getFrame();

			for ( const render of frame.renders ) {

				const scene = render.scene;

				if ( scene.isScene !== true ) continue;

				const camera = render.camera;

				if ( pointerDownPosition.distanceTo( pointer.set( e.clientX, e.clientY ) ) > 2 ) return;

				const rect = renderer.domElement.getBoundingClientRect();
				pointer.x = ( ( e.clientX - rect.left ) / rect.width ) * 2 - 1;
				pointer.y = - ( ( e.clientY - rect.top ) / rect.height ) * 2 + 1;

				raycaster.setFromCamera( pointer, camera );

				const intersects = raycaster.intersectObjects( scene.children, true );

				let graphMaterial = null;

				if ( intersects.length > 0 ) {

					for ( const intersect of intersects ) {

						const object = intersect.object;
						const material = object.material;

						if ( material && material.isNodeMaterial ) {

							removeBoundingBox();

							boundingBox = new BoxHelper( object, 0xffff00 );
							scene.add( boundingBox );

							graphMaterial = material;

						}

						if ( object.isMesh || object.isSprite ) {

							break;

						}

					}

				}

				this.setMaterial( graphMaterial );

			}

		} );

	}

	apply( scene ) {

		const loader = new TSLGraphLoader();
		const applier = loader.parse( TSLGraphLoader.getCodes() );
		applier.apply( scene );

		return this;

	}

	restoreMaterial( material ) {

		material.copy( new material.constructor() );
		material.needsUpdate = true;

	}

	init( inspector ) {

		this._initPicker( inspector );

	}

	async setMaterial( material ) {

		if ( this.material === material ) return;

		await this._setMaterial( material );

		this.dispatchEvent( { type: 'change', material } );

	}

	async loadGraph( graphData ) {

		await this.command( 'load', { graphData } );

	}

	async command( type, payload ) {

		type = 'tsl:command:' + type;

		await this._editorReady;

		const requestId = this._makeRequestId();
		const expectedType = _resposeByCommand[ type ];

		return new Promise( ( resolve, reject ) => {

			const timer = window.setTimeout( () => {

				if ( ! this._pending.has( requestId ) ) return;
				this._pending.delete( requestId );
				reject( new Error( `Timeout for ${type}` ) );

			}, 5000 );

			this._pending.set( requestId, { expectedType, resolve, reject, timer } );

			const message = { source: HOST_SOURCE, type, requestId };
			if ( payload !== undefined ) message.payload = payload;

			this._post( message );

		} );

	}

	async getCode() {

		return this.command( 'get-code' );

	}

	async getTSLFunction() {

		const graphLoader = new TSLGraphLoader();
		const applier = graphLoader.parse( await this.getCode() );

		return applier.tslGraphFns[ 'tslGraph' ];

	}

	async getGraph() {

		return ( await this.command( 'get-graph' ) ).graphData;

	}

	async onResponse( /*type, payload*/ ) {



	}

	async onEvent( type, payload ) {

		if ( type === 'ready' ) {

			if ( ! this.isReady ) {

				this.isReady = true;

				this._resolveReady();

			}

		} else if ( type === 'graph-changed' ) {

			if ( this.material === null ) return;

			await this._updateMaterial();

			const graphData = await this.getGraph();

			const graphId = this.material.userData.graphId;

			TSLGraphLoader.setGraph( graphId, graphData );

		} else if ( type === 'uniforms-changed' ) {

			this._updateUniforms( payload.uniforms );

		}

	}

	async onMessage( event ) {

		if ( event.origin !== this.editorOrigin ) return;
		if ( ! this._isEditorMessage( event.data ) ) return;

		const msg = event.data;

		if ( msg.requestId && msg.type.startsWith( 'tsl:response:' ) ) {

			const waiter = this._pending.get( msg.requestId );
			if ( ! waiter ) return;
			if ( msg.type !== waiter.expectedType ) return;

			this._pending.delete( msg.requestId );
			window.clearTimeout( waiter.timer );

			if ( msg.error ) waiter.reject( new Error( msg.error ) );
			else waiter.resolve( msg.payload );

			this.onResponse( msg.type.substring( 'tsl:response:'.length ), msg.payload );

		} else if ( msg.type.startsWith( 'tsl:event:' ) ) {

			this.onEvent( msg.type.substring( 'tsl:event:'.length ), msg.payload );

		}

	}

	async _setMaterial( material ) {

		if ( ! material ) {

			this.material = null;
			this.materialDefault = null;
			this.uniforms = null;

			await this.command( 'clear-graph' );

			return;

		}

		if ( material.isNodeMaterial !== true ) {

			error( 'TSLGraphEditor: "Material" needs be a "NodeMaterial".' );

			return;

		}

		if ( material.userData.graphId === undefined ) {

			if ( this.autoGraphId ) {

				material.userData.graphId = material.name || 'id:' + material.id;

			} else {

				warn( 'TSLGraphEditor: "NodeMaterial" has no graphId. Set a "graphId" for the material in "material.userData.graphId".' );

				return;

			}

		}

		let materialDefault = _refMaterials.get( material );

		if ( materialDefault === undefined ) {

			//materialDefault = material.clone();
			materialDefault = new material.constructor();
			materialDefault.userData = material.userData;

			_refMaterials.set( material, materialDefault );

		}

		this.material = material;
		this.materialDefault = materialDefault;
		this.uniforms = null;

		const graphData = TSLGraphLoader.getGraph( this.material.userData.graphId );

		if ( graphData ) {

			await this.loadGraph( graphData );

		} else {

			await this.command( 'clear-graph' );

			await this.command( 'set-root-material', { materialType: this._getGraphType( this.material ) } );

		}

	}

	_getGraphType( material ) {

		if ( material.isMeshPhysicalNodeMaterial ) return 'material/physical';
		if ( material.isMeshStandardNodeMaterial ) return 'material/standard';
		if ( material.isMeshPhongNodeMaterial ) return 'material/phong';
		if ( material.isMeshBasicNodeMaterial ) return 'material/basic';
		if ( material.isSpriteNodeMaterial ) return 'material/sprite';

		return 'material/node';

	}

	_showManagerModal() {

		const overlay = document.createElement( 'div' );
		overlay.style.position = 'absolute';
		overlay.style.top = '0';
		overlay.style.left = '0';
		overlay.style.width = '100%';
		overlay.style.height = '100%';
		overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
		overlay.style.zIndex = '100';
		overlay.style.display = 'flex';
		overlay.style.justifyContent = 'center';
		overlay.style.alignItems = 'center';
		overlay.onclick = ( e ) => {

			if ( e.target === overlay ) {

				this.content.removeChild( overlay );

			}

		};

		const modal = document.createElement( 'div' );
		modal.style.width = '80%';
		modal.style.maxWidth = '500px';
		modal.style.height = '400px';
		modal.style.backgroundColor = 'var(--profiler-bg, #1e1e24f5)';
		modal.style.border = '1px solid var(--profiler-border, #4a4a5a)';
		modal.style.borderRadius = '8px';
		modal.style.display = 'flex';
		modal.style.flexDirection = 'column';

		const header = document.createElement( 'div' );
		header.style.padding = '15px';
		header.style.borderBottom = '1px solid var(--profiler-border, #4a4a5a)';
		header.style.display = 'flex';
		header.style.justifyContent = 'space-between';
		header.style.alignItems = 'center';
		header.style.gap = '15px';

		const filterInput = document.createElement( 'input' );
		filterInput.type = 'text';
		filterInput.className = 'console-filter-input';
		filterInput.placeholder = 'Filter...';
		filterInput.style.flex = '1';

		const closeBtn = document.createElement( 'button' );
		closeBtn.innerHTML = '&#x2715;';
		closeBtn.style.background = 'transparent';
		closeBtn.style.border = 'none';
		closeBtn.style.color = 'var(--text-secondary, #9a9aab)';
		closeBtn.style.cursor = 'pointer';
		closeBtn.style.fontSize = '16px';
		closeBtn.onmouseover = () => closeBtn.style.color = 'var(--text-primary, #e0e0e0)';
		closeBtn.onmouseout = () => closeBtn.style.color = 'var(--text-secondary, #9a9aab)';
		closeBtn.onclick = () => this.content.removeChild( overlay );

		header.appendChild( filterInput );
		header.appendChild( closeBtn );

		const codes = this.getCodes();
		const materialIds = Object.keys( codes.materials || {} );

		if ( materialIds.length === 0 ) {

			const listContainer = document.createElement( 'div' );
			listContainer.style.padding = '10px';
			listContainer.style.flex = '1';

			const emptyMsg = document.createElement( 'div' );
			emptyMsg.textContent = 'No saved materials found.';
			emptyMsg.style.color = 'var(--text-secondary, #9a9aab)';
			emptyMsg.style.padding = '10px';
			emptyMsg.style.textAlign = 'center';
			emptyMsg.style.fontFamily = 'var(--font-family, sans-serif)';
			emptyMsg.style.fontSize = '12px';
			listContainer.appendChild( emptyMsg );

			modal.appendChild( header );
			modal.appendChild( listContainer );

		} else {

			const listHeaderContainer = document.createElement( 'div' );
			listHeaderContainer.style.display = 'grid';
			listHeaderContainer.style.gridTemplateColumns = '1fr 80px';
			listHeaderContainer.style.gap = '10px';
			listHeaderContainer.style.padding = '10px 15px 8px 15px';
			listHeaderContainer.style.borderBottom = '1px solid var(--profiler-border, #4a4a5a)';
			listHeaderContainer.style.backgroundColor = 'var(--profiler-bg, #1e1e24f5)';
			listHeaderContainer.style.fontFamily = 'var(--font-family, sans-serif)';
			listHeaderContainer.style.fontSize = '11px';
			listHeaderContainer.style.fontWeight = 'bold';
			listHeaderContainer.style.textTransform = 'uppercase';
			listHeaderContainer.style.letterSpacing = '0.5px';
			listHeaderContainer.style.color = 'var(--text-secondary, #9a9aab)';
			listHeaderContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
			listHeaderContainer.style.zIndex = '1';

			const col1 = document.createElement( 'div' );
			col1.textContent = 'Material Name / ID';
			const col2 = document.createElement( 'div' );
			col2.textContent = 'Action';
			col2.style.textAlign = 'right';

			listHeaderContainer.appendChild( col1 );
			listHeaderContainer.appendChild( col2 );

			const scrollWrapper = document.createElement( 'div' );
			scrollWrapper.style.flex = '1';
			scrollWrapper.style.overflowY = 'auto';
			scrollWrapper.style.padding = '0';

			const rows = [];

			for ( const id of materialIds ) {

				const itemRow = document.createElement( 'div' );
				itemRow.style.display = 'grid';
				itemRow.style.gridTemplateColumns = '1fr 80px';
				itemRow.style.gap = '10px';
				itemRow.style.alignItems = 'center';
				itemRow.style.padding = '8px 15px';
				itemRow.style.borderBottom = '1px solid rgba(74, 74, 90, 0.4)';
				itemRow.onmouseover = () => itemRow.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
				itemRow.onmouseout = () => itemRow.style.backgroundColor = 'transparent';

				const nameSpan = document.createElement( 'span' );
				const materialData = codes.materials[ id ];
				const materialName = materialData.name || id;
				nameSpan.textContent = materialName;
				nameSpan.style.fontFamily = 'var(--font-mono, monospace)';
				nameSpan.style.fontSize = '12px';
				nameSpan.style.color = 'var(--text-primary, #e0e0e0)';
				nameSpan.style.userSelect = 'all';
				nameSpan.style.overflow = 'hidden';
				nameSpan.style.textOverflow = 'ellipsis';
				nameSpan.style.whiteSpace = 'nowrap';

				const actionContainer = document.createElement( 'div' );
				actionContainer.style.textAlign = 'right';

				const removeBtn = document.createElement( 'button' );
				removeBtn.textContent = 'Remove';
				removeBtn.style.background = 'rgba(244, 67, 54, 0.1)';
				removeBtn.style.border = '1px solid var(--color-red, #f44336)';
				removeBtn.style.color = 'var(--color-red, #f44336)';
				removeBtn.style.borderRadius = '4px';
				removeBtn.style.padding = '4px 8px';
				removeBtn.style.cursor = 'pointer';
				removeBtn.style.fontSize = '11px';
				removeBtn.onmouseover = () => removeBtn.style.background = 'rgba(244, 67, 54, 0.2)';
				removeBtn.onmouseout = () => removeBtn.style.background = 'rgba(244, 67, 54, 0.1)';

				actionContainer.appendChild( removeBtn );

				itemRow.appendChild( nameSpan );
				itemRow.appendChild( actionContainer );

				scrollWrapper.appendChild( itemRow );

				rows.push( { element: itemRow, text: materialName.toLowerCase() } );

				removeBtn.onclick = async () => {

					delete codes.materials[ id ];
					TSLGraphLoader.setCodes( codes );
					TSLGraphLoader.deleteGraph( id );
					scrollWrapper.removeChild( itemRow );

					const index = rows.findIndex( r => r.element === itemRow );
					if ( index > - 1 ) rows.splice( index, 1 );

					if ( rows.length === 0 ) {

						modal.removeChild( listHeaderContainer );
						modal.removeChild( scrollWrapper );

						const listContainer = document.createElement( 'div' );
						listContainer.style.padding = '10px';
						listContainer.style.flex = '1';

						const emptyMsg = document.createElement( 'div' );
						emptyMsg.textContent = 'No saved materials found.';
						emptyMsg.style.color = 'var(--text-secondary, #9a9aab)';
						emptyMsg.style.padding = '10px';
						emptyMsg.style.textAlign = 'center';
						emptyMsg.style.fontFamily = 'var(--font-family, sans-serif)';
						emptyMsg.style.fontSize = '12px';

						listContainer.appendChild( emptyMsg );
						modal.appendChild( listContainer );

					}

					_refMaterials.delete( this.material );

					if ( this.material && this.material.userData.graphId === id ) {

						this.restoreMaterial( this.material );

						await this.setMaterial( null );

					}

					this.dispatchEvent( { type: 'remove', graphId: id } );

				};

			}

			filterInput.addEventListener( 'input', ( e ) => {

				const term = e.target.value.toLowerCase();
				for ( const row of rows ) {

					row.element.style.display = row.text.includes( term ) ? 'grid' : 'none';

				}

			} );

			modal.appendChild( header );
			modal.appendChild( listHeaderContainer );
			modal.appendChild( scrollWrapper );

		}

		overlay.appendChild( modal );

		this.content.appendChild( overlay );

	}

	_exportData() {

		const codes = this.getCodes();
		const materialIds = Object.keys( codes.materials || {} );

		const exportPayload = {
			codes: codes,
			graphs: {}
		};

		for ( const id of materialIds ) {

			const graphData = TSLGraphLoader.getGraph( id );

			if ( graphData ) {

				exportPayload.graphs[ id ] = graphData;

			}

		}

		const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent( JSON.stringify( exportPayload, null, '\t' ) );
		const downloadAnchorNode = document.createElement( 'a' );
		downloadAnchorNode.setAttribute( 'href', dataStr );
		downloadAnchorNode.setAttribute( 'download', 'tsl-graphs.json' );
		document.body.appendChild( downloadAnchorNode );
		downloadAnchorNode.click();
		downloadAnchorNode.remove();

	}

	_importData() {

		const fileInput = document.createElement( 'input' );
		fileInput.type = 'file';
		fileInput.accept = '.json';

		fileInput.onchange = e => {

			const file = e.target.files[ 0 ];

			if ( ! file ) return;

			const reader = new FileReader();
			reader.onload = async ( event ) => {

				try {

					const importedData = TSLGraphLoader.setGraphs( JSON.parse( event.target.result ) );

					this._codeData = importedData.codes;

					// Reload visual state if we have a material open
					if ( this.material ) {

						// refresh material
						await this._setMaterial( this.material );

					}

				} catch ( err ) {

					error( 'TSLGraphEditor: Failed to parse or load imported JSON.', err );

				}

			};

			reader.readAsText( file );

		};

		fileInput.click();

	}

	getCodes() {

		if ( this._codeData === null ) {

			this._codeData = TSLGraphLoader.getCodes();

		}

		return this._codeData;

	}

	_saveCode() {

		const graphId = this.material.userData.graphId;

		clearTimeout( this._codeSaveTimeout );

		this._codeSaveTimeout = setTimeout( async () => {

			if ( this.material === null || graphId !== this.material.userData.graphId ) return;

			const codes = this.getCodes();
			const codeData = await this.getCode();

			codes.materials[ graphId ] = codeData.material;

			TSLGraphLoader.setCodes( codes );

		}, 1000 );

	}

	_restoreMaterial() {

		this.material.copy( this.materialDefault );

	}

	async _updateMaterial() {

		this._restoreMaterial();

		const applyNodes = await this.getTSLFunction();

		const { uniforms } = applyNodes( this.material );

		this.uniforms = uniforms;
		this.material.needsUpdate = true;

		this._saveCode();

	}

	_updateUniforms( uniforms ) {

		if ( this.uniforms === null ) return;

		for ( const uniform of uniforms ) {

			const uniformNode = this.uniforms[ uniform.name ];
			const uniformType = uniform.uniformType;

			const value = uniform.value;

			if ( uniformType.startsWith( 'vec' ) ) {

				uniformNode.value.fromArray( value );

			} else if ( uniformType.startsWith( 'color' ) ) {

				uniformNode.value.setHex( parseInt( value.slice( 1 ), 16 ) );

			} else {

				uniformNode.value = value;

			}

		}

		this._saveCode();

	}

	_isEditorMessage( value ) {

		if ( ! value || typeof value !== 'object' ) return false;
		return value.source === EDITOR_SOURCE && typeof value.type === 'string';

	}

	_makeRequestId() {

		return `${Date.now()}-${Math.random().toString( 36 ).slice( 2, 10 )}`;

	}

	_post( message ) {

		if ( this.iframe.contentWindow ) {

			this.iframe.contentWindow.postMessage( message, this.editorOrigin );

		}

	}

}

export default TSLGraphEditor;
