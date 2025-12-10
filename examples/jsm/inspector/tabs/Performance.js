import { Tab } from '../ui/Tab.js';
import { List } from '../ui/List.js';
import { Graph } from '../ui/Graph.js';
import { Item } from '../ui/Item.js';
import { createValueSpan, setText } from '../ui/utils.js';

class Performance extends Tab {

	constructor( options = {} ) {

		super( 'Performance', options );

		const perfList = new List( 'Name', 'CPU', 'GPU', 'Total' );
		perfList.setGridStyle( 'minmax(200px, 2fr) 80px 80px 80px' );
		perfList.domElement.style.minWidth = '600px';

		const scrollWrapper = document.createElement( 'div' );
		scrollWrapper.className = 'list-scroll-wrapper';
		scrollWrapper.appendChild( perfList.domElement );
		this.content.appendChild( scrollWrapper );

		//

		const graphContainer = document.createElement( 'div' );
		graphContainer.className = 'graph-container';

		const graph = new Graph();
		graph.addLine( 'fps', '--accent-color' );
		//graph.addLine( 'gpu', '--color-yellow' );
		graphContainer.append( graph.domElement );

		//

		/*
		const label = document.createElement( 'label' );
		label.className = 'custom-checkbox';

		const checkbox = document.createElement( 'input' );
		checkbox.type = 'checkbox';

		const checkmark = document.createElement( 'span' );
		checkmark.className = 'checkmark';

		label.appendChild( checkbox );
		label.appendChild( checkmark );
		*/

		const graphStats = new Item( 'Graph Stats', createValueSpan(), createValueSpan(), createValueSpan( 'graph-fps-counter' ) );
		perfList.add( graphStats );

		const graphItem = new Item( graphContainer );
		graphItem.itemRow.childNodes[ 0 ].style.gridColumn = '1 / -1';
		graphStats.add( graphItem );

		//

		const frameStats = new Item( 'Frame Stats', createValueSpan(), createValueSpan(), createValueSpan() );
		perfList.add( frameStats );

		const miscellaneous = new Item( 'Miscellaneous & Idle', createValueSpan(), createValueSpan(), createValueSpan() );
		miscellaneous.domElement.firstChild.style.backgroundColor = '#00ff0b1a';
		miscellaneous.domElement.firstChild.classList.add( 'no-hover' );
		frameStats.add( miscellaneous );

		//

		this.notInUse = new Map();
		this.frameStats = frameStats;
		this.graphStats = graphStats;
		this.graph = graph;
		this.miscellaneous = miscellaneous;

		//

		this.currentRender = null;
		this.currentItem = null;
		this.frameItems = new Map();

	}

	resolveStats( inspector, stats ) {

		const data = inspector.getStatsData( stats.cid );

		let item = data.item;

		if ( item === undefined ) {

			item = new Item( createValueSpan(), createValueSpan(), createValueSpan(), createValueSpan() );

			if ( stats.name ) {

				if ( stats.isComputeStats === true ) {

					stats.name = `${ stats.name } [ Compute ]`;

				}

			} else {

				stats.name = `Unnamed ${ stats.cid }`;

			}

			item.userData.name = stats.name;

			this.currentItem.add( item );
			data.item = item;

		} else {

			item.userData.name = stats.name;

			if ( this.notInUse.has( stats.cid ) ) {

				item.domElement.firstElementChild.classList.remove( 'alert' );

				this.notInUse.delete( stats.cid );

			}

			const statsIndex = stats.parent.children.indexOf( stats );

			if ( item.parent === null || item.parent.children.indexOf( item ) !== statsIndex ) {

				this.currentItem.add( item, statsIndex );

			}

		}

		let name = item.userData.name;

		if ( stats.isComputeStats ) {

			name += ' [ Compute ]';

		}

		setText( item.data[ 0 ], name );
		setText( item.data[ 1 ], data.cpu.toFixed( 2 ) );
		setText( item.data[ 2 ], stats.gpuNotAvailable === true ? '-' : data.gpu.toFixed( 2 ) );
		setText( item.data[ 3 ], data.total.toFixed( 2 ) );

		//

		const previousItem = this.currentItem;

		this.currentItem = item;

		for ( const child of stats.children ) {

			this.resolveStats( inspector, child );

		}

		this.currentItem = previousItem;

		this.frameItems.set( stats.cid, item );

	}

	updateGraph( inspector/*, frame*/ ) {

		this.graph.addPoint( 'fps', inspector.fps );
		this.graph.update();

	}

	addNotInUse( cid, item ) {

		item.domElement.firstElementChild.classList.add( 'alert' );

		this.notInUse.set( cid, {
			item,
			time: performance.now()
		} );

		this.updateNotInUse( cid );

	}

	updateNotInUse( cid ) {

		const { item, time } = this.notInUse.get( cid );

		const current = performance.now();
		const duration = 5;
		const remaining = duration - Math.floor( ( current - time ) / 1000 );

		if ( remaining >= 0 ) {

			const counter = '*'.repeat( Math.max( 0, remaining ) );
			const element = item.domElement.querySelector( '.list-item-cell .value' );

			setText( element, item.userData.name + ' (not in use) ' + counter );

		} else {

			item.domElement.firstElementChild.classList.remove( 'alert' );
			item.parent.remove( item );

			this.notInUse.delete( cid );

		}

	}

	updateText( inspector, frame ) {

		const oldFrameItems = new Map( this.frameItems );

		this.frameItems.clear();
		this.currentItem = this.frameStats;

		for ( const child of frame.children ) {

			this.resolveStats( inspector, child );

		}

		// remove unused frame items

		for ( const [ cid, item ] of oldFrameItems ) {

			if ( ! this.frameItems.has( cid ) ) {

				this.addNotInUse( cid, item );

				oldFrameItems.delete( cid );

			}

		}

		// update not in use items

		for ( const cid of this.notInUse.keys() ) {

			this.updateNotInUse( cid );

		}

		//

		setText( 'graph-fps-counter', inspector.fps.toFixed() + ' FPS' );

		//

		setText( this.frameStats.data[ 1 ], frame.cpu.toFixed( 2 ) );
		setText( this.frameStats.data[ 2 ], frame.gpu.toFixed( 2 ) );
		setText( this.frameStats.data[ 3 ], frame.total.toFixed( 2 ) );

		//

		setText( this.miscellaneous.data[ 1 ], frame.miscellaneous.toFixed( 2 ) );
		setText( this.miscellaneous.data[ 2 ], '-' );
		setText( this.miscellaneous.data[ 3 ], frame.miscellaneous.toFixed( 2 ) );

		//

		this.currentItem = null;

	}

}

export { Performance };
