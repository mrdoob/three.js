import { Tab } from '../ui/Tab.js';
import { List } from '../ui/List.js';
import { Item } from '../ui/Item.js';

import { RendererUtils, NoToneMapping, LinearSRGBColorSpace } from 'three/webgpu';

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

	update( renderer, canvasDataList ) {

		if ( ! this.isActive && ! this.isDetached ) return;

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
