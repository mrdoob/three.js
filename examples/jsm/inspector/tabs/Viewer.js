import { Tab } from '../ui/Tab.js';
import { List } from '../ui/List.js';
import { Item } from '../ui/Item.js';
import { splitPath, splitCamelCase } from '../ui/utils.js';

import { RendererUtils, NoToneMapping, LinearSRGBColorSpace, QuadMesh, NodeMaterial, CanvasTarget } from 'three/webgpu';
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

class Viewer extends Tab {

	constructor( options = {} ) {

		super( 'Viewer', options );

		const nodeList = new List( 'Viewer', 'Name' );
		nodeList.setGridStyle( '150px minmax(200px, 2fr)' );
		nodeList.domElement.style.minWidth = '400px';

		const scrollWrapper = document.createElement( 'div' );
		scrollWrapper.className = 'list-scroll-wrapper';
		scrollWrapper.appendChild( nodeList.domElement );
		this.content.appendChild( scrollWrapper );

		const nodes = new Item( 'Nodes' );
		nodeList.add( nodes );

		//

		this.itemLibrary = new Map();
		this.folderLibrary = new Map();
		this.canvasNodes = new Map();
		this.currentDataList = [];
		this.nodeList = nodeList;
		this.nodes = nodes;

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

	addNodeItem( canvasData ) {

		let item = this.itemLibrary.get( canvasData.id );

		if ( item === undefined ) {

			const name = canvasData.name;
			const domElement = canvasData.canvasTarget.domElement;

			item = new Item( domElement, name );
			item.itemRow.children[ 1 ].style[ 'justify-content' ] = 'flex-start';
			this.itemLibrary.set( canvasData.id, item );

		}

		return item;

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

			this.currentDataList = canvasDataList;

			//

			const state = RendererUtils.resetRendererState( renderer );

			renderer.toneMapping = NoToneMapping;
			renderer.outputColorSpace = LinearSRGBColorSpace;

			renderer.setCanvasTarget( canvasData.canvasTarget );

			canvasData.quad.render( renderer );

			renderer.setCanvasTarget( previousCanvasTarget );

			RendererUtils.restoreRendererState( renderer, state );

		}

	}

}

export { Viewer };
