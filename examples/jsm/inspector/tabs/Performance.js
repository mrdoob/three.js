import { Tab } from '../ui/Tab.js';
import { List } from '../ui/List.js';
import { Graph } from '../ui/Graph.js';
import { Item } from '../ui/Item.js';
import { createValueSpan, setText } from '../ui/utils.js';

// creates the cell of a row in the timeline, with a bar for each type

function createTimelineCell( ...types ) {

	const cell = document.createElement( 'div' );
	cell.className = 'frame-timeline';

	for ( const type of types ) {

		const bar = document.createElement( 'div' );
		bar.className = type;
		cell.appendChild( bar );

	}

	return cell;

}

class Performance extends Tab {

	constructor( options = {} ) {

		super( 'Performance', options );

		const perfList = new List( 'Name', 'CPU', 'GPU', '' );
		perfList.setGridStyle( 'minmax(0, 1fr) 60px 60px var(--frame-timeline-width)' ); // the timeline is as wide in the nested rows
		perfList.domElement.style.containerType = 'inline-size';
		perfList.domElement.style.minWidth = '640px';

		const scrollWrapper = document.createElement( 'div' );
		scrollWrapper.className = 'list-scroll-wrapper';
		scrollWrapper.appendChild( perfList.domElement );
		this.content.appendChild( scrollWrapper );

		//

		const graphContainer = document.createElement( 'div' );
		graphContainer.className = 'graph-container';

		const graph = new Graph();
		graph.addLine( 'fps', 'var( --color-fps )' );
		graph.addLine( 'cpu', 'var( --color-yellow )' );
		graph.addLine( 'gpu', 'var( --color-green )' );
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

		this.graphFpsCounter = createValueSpan();
		this.graphMsCounter = createValueSpan();
		this.graphMsCounter.classList.add( 'secondary' );

		const graphCounters = document.createElement( 'div' );
		graphCounters.append( this.graphFpsCounter, this.graphMsCounter );

		const graphStats = new Item( 'Graph Stats', createValueSpan(), createValueSpan(), graphCounters );
		perfList.add( graphStats );

		const graphItem = new Item( graphContainer );
		graphItem.itemRow.childNodes[ 0 ].style.gridColumn = '1 / -1';
		graphItem.itemRow.classList.add( 'no-hover' ); // keep the background of the graph
		graphStats.add( graphItem );

		//

		const frameStats = new Item( 'Frame Stats', createValueSpan(), createValueSpan(), createTimelineCell() );
		frameStats.domElement.classList.add( 'frame-stats' );
		perfList.domElement.appendChild( perfList.domElement.querySelector( '.list-header' ) ); // move the header below the graph
		perfList.add( frameStats );

		const miscellaneous = new Item( 'Miscellaneous & Idle', createValueSpan(), createValueSpan() );
		miscellaneous.domElement.firstChild.style.backgroundColor = '#00ff0b1a';
		miscellaneous.domElement.firstChild.classList.add( 'no-hover' );
		frameStats.add( miscellaneous );

		//

		const timelineRuler = perfList.domElement.querySelector( '.list-header-cell:last-child' );
		timelineRuler.classList.add( 'frame-timeline-ruler' );

		//

		this.notInUse = new Map();
		this.perfList = perfList;
		this.timelineRuler = timelineRuler;
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

			item = new Item( createValueSpan(), createValueSpan(), createValueSpan(), createTimelineCell( 'cpu', 'gpu' ) );

			if ( stats.isGroupStats === true ) {

				item.itemRow.classList.add( 'group' );
				item.close();

			}

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

			if ( item.parent !== this.currentItem || item.parent.children.indexOf( item ) !== statsIndex ) {

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

		//

		const previousItem = this.currentItem;

		this.currentItem = item;

		for ( const child of stats.children ) {

			this.resolveStats( inspector, child );

		}

		this.currentItem = previousItem;

		this.frameItems.set( stats.cid, item );

	}

	updateTimeline( inspector, frame ) {

		const period = inspector.fps > 0 ? 1000 / inspector.fps : 0;
		const calls = [];

		// the CPU and GPU clocks are not comparable: the GPU is delayed, so no call starts on it before the CPU

		let gpuDelay = 0;

		for ( const [ cid, item ] of this.frameItems ) {

			const data = inspector.getStatsData( cid );

			if ( data.gpuOffset !== null ) gpuDelay = Math.max( gpuDelay, data.cpuOffset - data.gpuOffset );

			calls.push( { data, bars: item.data[ 3 ].children } );

		}

		// the timeline shows a frame period, or more if the calls end after it

		const duration = calls.reduce( ( end, { data } ) => Math.max( end, data.cpuOffset + data.cpu, data.gpuOffset !== null ? gpuDelay + data.gpuOffset + data.gpu : 0 ), Math.max( period, 1e-3 ) );
		const toPercent = ( time ) => ( time / duration ) * 100 + '%';

		const setBar = ( bar, start, time ) => {

			bar.style.left = toPercent( start );
			bar.style.width = toPercent( time );

		};

		for ( const { data, bars } of calls ) {

			setBar( bars[ 0 ], data.cpuOffset, data.cpu );

			bars[ 1 ].hidden = data.gpuOffset === null;

			if ( data.gpuOffset !== null ) setBar( bars[ 1 ], gpuDelay + data.gpuOffset, data.gpu );

		}

		// the frame has the bars of its calls

		const getBars = ( stats ) => Array.from( this.frameItems.get( stats.cid ).data[ 3 ].children );

		this.frameStats.data[ 3 ].replaceChildren( ...frame.children.flatMap( getBars ).map( ( bar ) => bar.cloneNode() ) );

		// the labels of the ruler are at a multiple of 1, 2 or 5, at least 80 pixels apart

		const count = Math.max( this.timelineRuler.clientWidth / 80, 1 );
		const magnitude = 10 ** Math.floor( Math.log10( duration / count ) );
		const step = magnitude * [ 1, 2, 5, 10 ].find( ( multiple ) => duration / ( magnitude * multiple ) <= count );

		const ticks = [];

		for ( let i = 0; i * step < duration; i ++ ) {

			const tick = document.createElement( 'span' );
			tick.textContent = parseFloat( ( i * step ).toFixed( 3 ) ) + ( i === 0 ? ' ms' : '' );
			tick.style.left = toPercent( i * step );
			ticks.push( tick );

		}

		this.timelineRuler.replaceChildren( ...ticks );
		this.perfList.domElement.style.setProperty( '--frame-timeline-step', toPercent( step ) );

	}

	updateGraph( inspector, frame ) {

		const fps = inspector.fps;

		this.graph.addPoint( 'fps', fps );

		if ( frame ) {

			const cpuValue = Math.min( ( ( frame.cpu || 0 ) * fps ) / 1000, 1.0 ) * fps;
			const gpuValue = Math.min( ( ( frame.gpu || 0 ) * fps ) / 1000, 1.0 ) * fps;

			this.graph.addPoint( 'cpu', cpuValue );
			this.graph.addPoint( 'gpu', gpuValue );

		}

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

		const hasTimestamp = inspector.getRenderer().backend.hasTimestamp;

		this.currentItem = this.frameStats;

		for ( const child of frame.children ) {

			this.resolveStats( inspector, child );

		}

		this.updateTimeline( inspector, frame );

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

		const fps = inspector.fps;

		setText( this.graphFpsCounter, fps.toFixed() + ' FPS' );
		setText( this.graphMsCounter, ( fps > 0 ? 1000 / fps : 0 ).toFixed( 2 ) + ' ms' );

		//

		setText( this.frameStats.data[ 1 ], frame.cpu.toFixed( 2 ) );
		setText( this.frameStats.data[ 2 ], hasTimestamp ? frame.gpu.toFixed( 2 ) : '-' );

		//

		setText( this.miscellaneous.data[ 1 ], frame.miscellaneous.toFixed( 2 ) );
		setText( this.miscellaneous.data[ 2 ], '-' );

		//

		this.currentItem = null;

	}

}

export { Performance };
