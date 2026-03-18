import { Tab } from '../ui/Tab.js';
import { List } from '../ui/List.js';
import { Graph } from '../ui/Graph.js';
import { Item } from '../ui/Item.js';
import { createValueSpan, setText, formatBytes } from '../ui/utils.js';

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

		this.programs = new Item( 'Programs', createValueSpan(), 'N/A' );
		this.memoryStats.add( this.programs );

		this.renderTargets = new Item( 'Render Targets', createValueSpan(), 'N/A' );
		this.memoryStats.add( this.renderTargets );

		this.storageAttributes = new Item( 'Storage Attributes', createValueSpan(), createValueSpan() );
		this.memoryStats.add( this.storageAttributes );

		this.textures = new Item( 'Textures', createValueSpan(), createValueSpan() );
		this.memoryStats.add( this.textures );

		this.graph = graph;

	}

	updateGraph( inspector ) {

		const renderer = inspector.getRenderer();
		if ( ! renderer ) return;

		const memory = renderer.info.memory;

		this.graph.addPoint( 'total', memory.total );
		
		if ( this.graph.limit === 0 ) this.graph.limit = 1;

		this.graph.update();

	}

	updateText( inspector ) {

		const renderer = inspector.getRenderer();
		if ( ! renderer ) return;

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
		
		setText( this.renderTargets.data[ 1 ], memory.renderTargets.toString() );
		
		setText( this.storageAttributes.data[ 1 ], memory.storageAttributes.toString() );
		setText( this.storageAttributes.data[ 2 ], formatBytes( memory.storageAttributesSize ) );
		setText( this.textures.data[ 1 ], memory.textures.toString() );
		setText( this.textures.data[ 2 ], formatBytes( memory.texturesSize ) );

	}

}

export { Memory };
