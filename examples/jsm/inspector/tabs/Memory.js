import { Tab } from '../ui/Tab.js';
import { List } from '../ui/List.js';
import { Graph } from '../ui/Graph.js';
import { Item } from '../ui/Item.js';
import { createValueSpan, setText, formatBytes, splitCamelCase } from '../ui/utils.js';

class Memory extends Tab {

	constructor( options = {} ) {

		super( 'Memory', options );

		const memoryList = new List( 'Name', 'Count', 'Size' );
		memoryList.setGridStyle( 'minmax(200px, 2fr) 60px 100px' );
		memoryList.domElement.style.minWidth = '300px';

		const scrollWrapper = document.createElement( 'div' );
		scrollWrapper.className = 'list-scroll-wrapper';
		scrollWrapper.appendChild( memoryList.domElement );
		this.content.appendChild( scrollWrapper );

		// graph

		const graphContainer = document.createElement( 'div' );
		graphContainer.className = 'graph-container';

		const graph = new Graph();
		graph.addLine( 'total', 'var( --color-yellow )' );
		graphContainer.append( graph.domElement );

		// stats

		const graphStats = new Item( 'Graph Stats', '', '' );
		memoryList.add( graphStats );

		const graphItem = new Item( graphContainer );
		graphItem.itemRow.childNodes[ 0 ].style.gridColumn = '1 / -1';
		graphItem.itemRow.classList.add( 'no-hover' ); // keep the background of the graph
		graphStats.add( graphItem );

		// info

		this.memoryStats = new Item( 'Renderer Info', '', createValueSpan() );
		this.memoryStats.domElement.firstChild.classList.add( 'no-hover' );
		memoryList.add( this.memoryStats );

		this.attributes = new Item( 'Attributes', createValueSpan(), createValueSpan() );
		this.memoryStats.add( this.attributes );

		this.geometries = new Item( 'Geometries', createValueSpan(), 'N/A' );
		this.memoryStats.add( this.geometries );

		this.indexAttributes = new Item( 'Index Attributes', createValueSpan(), createValueSpan() );
		this.memoryStats.add( this.indexAttributes );

		this.indirectStorageAttributes = new Item( 'Indirect Storage Attributes', createValueSpan(), createValueSpan() );
		this.memoryStats.add( this.indirectStorageAttributes );

		this.programs = new Item( 'Programs', createValueSpan(), createValueSpan() );
		this.memoryStats.add( this.programs );

		this.readbackBuffers = new Item( 'Readback Buffers', createValueSpan(), createValueSpan() );
		this.memoryStats.add( this.readbackBuffers );

		this.renderTargets = new Item( 'Render Targets', createValueSpan(), 'N/A' );
		this.memoryStats.add( this.renderTargets );

		this.storageAttributes = new Item( 'Storage Attributes', createValueSpan(), createValueSpan() );
		this.memoryStats.add( this.storageAttributes );

		this.textures = new Item( 'Textures', createValueSpan(), createValueSpan() );
		this.memoryStats.add( this.textures );

		this.uniformBuffers = new Item( 'Uniform Buffers', createValueSpan(), createValueSpan() );
		this.memoryStats.add( this.uniformBuffers );

		// creators

		this.creators = new Item( 'Creators', createValueSpan(), createValueSpan() );
		this.creators.domElement.firstChild.classList.add( 'no-hover' );
		memoryList.add( this.creators );

		this.creatorItems = new Map();

		this.graph = graph;

	}

	// tree of the render and compute calls which created the resources, the allocations are grouped by type and name

	updateCreators( inspector ) {

		const createNode = ( isAllocation ) => ( { count: 0, size: 0, ownCount: 0, ownSize: 0, isAllocation, children: new Map() } );
		const root = createNode( false );

		for ( const { type, name, size, creator } of inspector.getRenderer().info.resources ) {

			const path = creator !== null ? inspector.getCreatorPath( creator ) : [ 'Miscellaneous' ];
			const labels = type === 'textures' || type === 'programs' ? name.trim().split( /\s*\/\s*/ ).filter( ( key ) => key !== '' ) : ( name.trim() !== '' ? [ name ] : [] );
			const keys = [ ...path, splitCamelCase( type[ 0 ].toUpperCase() + type.slice( 1, - 1 ) ), ...labels ];

			let node = root;

			for ( let i = 0; i < keys.length; i ++ ) {

				node.count ++;
				node.size += size;

				if ( node.children.has( keys[ i ] ) === false ) node.children.set( keys[ i ], createNode( i >= path.length ) );

				node = node.children.get( keys[ i ] );

			}

			node.count ++;
			node.size += size;
			node.ownCount ++;
			node.ownSize += size;

		}

		// returns the rows of a node: a group of a single allocation name is a single row, like "Texture / output"

		const getRows = ( node ) => {

			const rows = [];

			for ( let [ name, child ] of node.children ) {

				while ( child.isAllocation && child.ownCount === 0 && child.children.size === 1 ) {

					const [ childName, grandchild ] = child.children.entries().next().value;

					name += ' / ' + childName;
					child = grandchild;

				}

				rows.push( [ name, child ] );

			}

			if ( node.ownCount > 0 && rows.length > 0 ) {

				rows.push( [ 'Unnamed', { count: node.ownCount, size: node.ownSize, children: new Map() } ] );

			}

			return rows;

		};

		const unused = new Map( this.creatorItems );

		const update = ( item, node, path ) => {

			setText( item.data[ 1 ], node.count.toString() );
			setText( item.data[ 2 ], formatBytes( node.size ) );

			for ( const [ name, child ] of getRows( node ) ) {

				const childPath = [ ...path, name ];
				const childKey = JSON.stringify( childPath );

				let childItem = this.creatorItems.get( childKey );

				if ( childItem === undefined ) {

					childItem = new Item( createValueSpan(), createValueSpan(), createValueSpan() ).close();
					childItem.data[ 0 ].title = name;
					setText( childItem.data[ 0 ], name );

					item.add( childItem );
					this.creatorItems.set( childKey, childItem );

				}

				childItem.itemRow.classList.toggle( 'group', child.children.size > 0 );

				unused.delete( childKey );

				update( childItem, child, childPath );

			}

		};

		update( this.creators, root, [] );

		for ( const [ path, item ] of unused ) {

			item.parent.remove( item );
			this.creatorItems.delete( path );

		}

	}

	updateGraph( inspector ) {

		const renderer = inspector.getRenderer();

		const memory = renderer.info.memory;

		this.graph.addPoint( 'total', memory.total );

		if ( this.graph.limit === 0 ) this.graph.limit = 1;

		this.graph.update();

	}

	updateText( inspector ) {

		const renderer = inspector.getRenderer();

		const memory = renderer.info.memory;

		setText( this.memoryStats.data[ 2 ], formatBytes( memory.total ) );

		setText( this.attributes.data[ 1 ], memory.attributes.toString() );
		setText( this.attributes.data[ 2 ], formatBytes( memory.attributesSize ) );

		setText( this.geometries.data[ 1 ], memory.geometries.toString() );

		setText( this.indexAttributes.data[ 1 ], memory.indexAttributes.toString() );
		setText( this.indexAttributes.data[ 2 ], formatBytes( memory.indexAttributesSize ) );

		setText( this.indirectStorageAttributes.data[ 1 ], memory.indirectStorageAttributes.toString() );
		setText( this.indirectStorageAttributes.data[ 2 ], formatBytes( memory.indirectStorageAttributesSize ) );

		setText( this.programs.data[ 1 ], memory.programs.toString() );
		setText( this.programs.data[ 2 ], formatBytes( memory.programsSize ) );

		setText( this.readbackBuffers.data[ 1 ], memory.readbackBuffers.toString() );
		setText( this.readbackBuffers.data[ 2 ], formatBytes( memory.readbackBuffersSize ) );

		setText( this.renderTargets.data[ 1 ], memory.renderTargets.toString() );

		setText( this.storageAttributes.data[ 1 ], memory.storageAttributes.toString() );
		setText( this.storageAttributes.data[ 2 ], formatBytes( memory.storageAttributesSize ) );

		setText( this.textures.data[ 1 ], memory.textures.toString() );
		setText( this.textures.data[ 2 ], formatBytes( memory.texturesSize ) );

		setText( this.uniformBuffers.data[ 1 ], memory.uniformBuffers.toString() );
		setText( this.uniformBuffers.data[ 2 ], formatBytes( memory.uniformBuffersSize ) );

		this.updateCreators( inspector );

	}

}

export { Memory };
