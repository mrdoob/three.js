/**
 * https://github.com/sunag/flow
 */

function __flow__addCSS( css ) {

	try {

		const style = document.createElement( 'style' );

		style.setAttribute( 'type', 'text/css' );
		style.innerHTML = css;
		document.head.appendChild( style );

	} catch ( e ) {}

}

__flow__addCSS( '@keyframes f-animation-open { 0% { transform: scale(.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; }}f-canvas,f-canvas canvas.background,f-canvas canvas.frontground { position: absolute; top: 0; left: 0; margin: 0; padding: 0; width: 100%; height: 100%; -webkit-touch-callout: none; transition: opacity .17s;}f-canvas { cursor: grab;}f-canvas canvas.frontground { z-index: 10;}body.dragging *:not(.drag) { pointer-events: none !important;}f-canvas.grabbing * { cursor: grabbing; user-select: none;}f-canvas canvas.background,f-canvas canvas.frontground { position: fixed; overflow: hidden;}f-canvas canvas.frontground { pointer-events: none;}f-canvas::-webkit-scrollbar { width: 8px; height: 8px;}f-canvas::-webkit-scrollbar-thumb:hover{ background: #014fc5;}f-canvas::-webkit-scrollbar-track { background: #363636;}f-canvas::-webkit-scrollbar-thumb { background-color: #666666; border-radius: 10px; border: 0;}f-canvas f-content { left: 0; top: 0;}f-canvas f-content,f-canvas f-area { position: absolute; display: block;}f-canvas canvas.map { position: absolute; top: 10px; right: 10px; z-index: 50; backdrop-filter: blur( 10px ); background-color: rgba( 45, 45, 48, .8 );}f-node { position: absolute; margin: 0; padding: 0; user-select: none; width: 320px; z-index: 1; cursor: auto; filter: drop-shadow(0 0 10px #00000061); backdrop-filter: blur(4px);}f-node.selected { z-index: 2;}f-canvas.focusing canvas.background,f-canvas.focusing f-node:not(.selected),f-canvas.focusing f-element f-disconnect:not(.selected) { opacity: 0; pointer-events: none;}.dragging f-canvas f-element f-disconnect { opacity: 0;}.dragging.node f-canvas.focusing canvas.background,.dragging.node f-canvas.focusing f-node:not(.selected) { opacity: .5;}f-node.selected,f-canvas.dragging-rio f-node:hover,f-canvas.dragging-lio f-node:hover { filter: drop-shadow(0 0 10px #00000061) drop-shadow(0 0 8px #4444dd);}f-node.closed f-element:not(:first-child) { display: none;}f-node.center { top: 50%; left: 50%; transform: translate( -50%, -50% );}f-node.top-right { top: 0; right: 0;}f-node.top-center { top: 0; left: 50%; transform: translateX( -50% );}f-node.top-left { top: 0; left: 0;}f-node { transition: filter 0.2s ease, opacity 0.12s ease;}f-node { animation: .2s f-animation-open 1 alternate ease-out;}f-tips,f-drop,f-menu,f-menu input,f-menu button,f-element,f-element input,f-element select,f-element button,f-element textarea { font-family: \'Open Sans\', sans-serif; font-size: 13px; text-transform: capitalize; color: #eeeeee; outline: solid 0px #000; margin: 0; padding: 0; border: 0; user-select: none; -webkit-tap-highlight-color: transparent; transition: background 0.2s ease, filter 0.2s ease;}f-element input:read-only { color: #666;}f-element input,f-element textarea { text-transform: initial;}f-element input { transition: background 0.1s ease;}f-element input,f-element select,f-element button,f-element textarea { background-color: #232324d1;}f-element { position: relative; width: calc( 100% - 14px ); background: rgba(45, 45, 48, 0.95); pointer-events: auto; border-bottom: 2px solid #232323; display: flex; padding-left: 7px; padding-right: 7px; padding-top: 2px; padding-bottom: 2px;}f-element:after,f-element:before { transition: opacity .17s; opacity: 0; content: \'\';}f-element[tooltip]:hover:after,f-element[tooltip]:focus-within:after { font-size: 14px !important; display: flex; justify-content: center; position: fixed; margin-left: -7px; width: calc( 100% ); background: #1d1d1de8; border: 1px solid #444444a1; border-radius: 6px; color: #dadada; content: attr( tooltip ); margin-top: -41px; font-size: 16px; padding-top: 3px; padding-bottom: 3px; z-index: 10; opacity: 1; backdrop-filter: blur(4px); white-space: nowrap; overflow: hidden; text-shadow: 1px 1px 0px #0007;}f-element[tooltip]:hover:before,f-element[tooltip]:focus-within:before { border: solid; border-color: #1d1d1de8 transparent; border-width: 12px 6px 0 6px; left: calc( 50% - 6px ); bottom: 30px; position: absolute; opacity: 1; z-index: 11;}f-element[error] { background-color: #ff0000;}f-element[error]:hover:after,f-element[error]:focus-within:after { border: none; background-color: #ff0000bb; filter: drop-shadow( 2px 2px 5px #000 ); color: #fff;}f-element[error]:hover:before,f-element[error]:focus-within:before { border-color: #ff0000bb transparent;}f-element { height: 24px;}f-element input { margin-top: 2px; margin-bottom: 2px; box-shadow: inset 0px 1px 1px rgb(0 0 0 / 20%), 0px 1px 0px rgb(255 255 255 / 5%); margin-left: 2px; margin-right: 2px; width: 100%; padding-left: 4px; padding-right: 4px;}f-element input.number { cursor: col-resize;}f-element input:focus[type=\'text\'], f-element input:focus[type=\'range\'], f-element input:focus[type=\'color\'] { background: rgba( 0, 0, 0, 0.6 ); outline: solid 1px rgba( 0, 80, 200, 0.98 );}f-element input[type=\'color\'] { appearance: none; padding: 0; margin-left: 2px; margin-right: 2px; height: calc( 100% - 4px ); margin-top: 2px; border: none;}f-element input[type=\'color\']::-webkit-color-swatch-wrapper { padding: 2px;}f-element input[type=\'color\']::-webkit-color-swatch { border: none; cursor: alias;}f-element input[type=\'range\'] { appearance: none; width: 100%; overflow: hidden; padding: 0; cursor: ew-resize;}f-element input[type=\'range\']::-webkit-slider-runnable-track { appearance: none; height: 10px; color: #13bba4; margin: 0;}f-element input[type=\'range\']::-webkit-slider-thumb { appearance: none; width: 0; background: #434343; box-shadow: -500px 0 0 500px rgba( 0, 120, 255, 0.98 ); border-radius: 50%; border: 0 !important;}f-element input[type=\'range\']::-webkit-slider-runnable-track { margin-left: -4px; margin-right: -5px;}f-element input[type=\'checkbox\'] { appearance: none; cursor: pointer;}f-element input[type=\'checkbox\'].toggle { height: 20px; width: 45px; border-radius: 16px; display: inline-block; position: relative; margin: 0; margin-top: 2px; background: linear-gradient( 0deg, #292929 0%, #0a0a0ac2 100% ); transition: all 0.2s ease;}f-element input[type=\'checkbox\'].toggle:after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: white; box-shadow: 0 1px 2px rgba(44, 44, 44, 0.2); transition: all 0.2s cubic-bezier(0.5, 0.1, 0.75, 1.35);}f-element input[type=\'checkbox\'].toggle:checked { background: linear-gradient( 0deg, #0177fb 0%, #0177fb 100% );}f-element input[type=\'checkbox\'].toggle:checked:after { transform: translatex(25px);}f-element.auto-height { display: table;}f-element textarea { width: calc( 100% - 18px ); padding-top: 1px; padding-bottom: 3px; padding-left: 3px; padding-right: 8px; margin-top: 2px; margin-left: 2px; height: calc( 100% - 8px ); max-height: 300px; border-radius: 2px; resize: none; box-shadow: inset 0px 1px 1px rgb(0 0 0 / 20%), 0px 1px 0px rgb(255 255 255 / 5%);}f-element.auto-height textarea { resize: auto;}f-element select { width: 100%; margin-top: 2px; margin-bottom: 2px; margin-left: 2px; margin-right: 2px; cursor: pointer; box-shadow: inset 0px 1px 1px rgb(0 0 0 / 20%), 0px 1px 0px rgb(255 255 255 / 5%);}f-element f-toolbar { position: absolute; display: flex; top: 0; width: 100%; height: 100%; align-content: space-around;}f-element.input-right f-toolbar { right: 7px; float: right; justify-content: end;}f-element f-toolbar { margin-top: auto; margin-bottom: auto; margin-left: 3px; margin-right: 3px; font-size: 18px; line-height: 18px;}f-element f-toolbar button { opacity: .7; cursor: pointer; font-size: 14px; width: unset; height: unset; border-radius: unset; border: unset; outline: 0; background-color: unset; box-shadow: unset;}f-element f-toolbar button:hover,f-element f-toolbar button:active { opacity: 1; border: 0; background-color: unset;}f-element input.range-value { width: 60px; text-align: center;}f-menu.context button,f-element button { width: 100%; height: calc( 100% - 4px ); margin-left: 2px; margin-right: 2px; margin-top: 2px; border-radius: 3px; cursor: pointer;}f-element button { box-shadow: inset 1px 1px 1px 0 rgb(255 255 255 / 17%), inset -2px -2px 2px 0 rgb(0 0 0 / 26%);}f-element button:hover { color: #fff; background-color: #2a2a2a;}f-element button:active { border: 1px solid rgba( 0, 120, 255, 0.98 );}f-element f-inputs,f-element f-subinputs { display: flex; justify-content: flex-end; width: 100%;}f-element f-inputs { left: 100px; top: 50%; transform: translateY( -50% ); position: absolute; width: calc( 100% - 106px ); height: calc( 100% - 4px ); z-index: 1;}f-element.inputs-disable f-inputs { filter: grayscale(100%); opacity: .5;}f-element.inputs-disable f-inputs input { pointer-events: none;}f-element f-label,f-element span { margin: auto; text-shadow: 1px 1px 0px #0007;}f-element f-label { padding-left: 4px; white-space: nowrap; position: absolute; top: 50%; transform: translateY( -50% ); width: calc( 100% - 20px );}f-element.right f-label { text-align: right;}f-element.center f-label { text-align: center;}f-element f-label i { font-size: 18px; margin-right: 6px; vertical-align: sub;}f-element f-label.center { width: 100%; text-align: center; display: block;}f-element.title { height: 29px; background-color: #3a3a3ab0; background-color: #3b3b43ed; cursor: all-scroll; border-top-left-radius: 6px; border-top-right-radius: 6px;}f-element.blue { background-color: #014fc5;}f-element.red { background-color: #bd0b0b;}f-element.green { background-color: #148d05;}f-element.yellow { background-color: #d6b100;}f-element.title.left { text-align: left; display: inline-grid; justify-content: start;}f-element.title f-title { text-align: center; font-size: 15px; padding-top: 2px; position: absolute; top: 50%; transform: translateY( -50% ); width: 100%;}f-element.title i { font-size: 18px; position: absolute; right: 10px; top: 50%; transform: translateY( -50% ); opacity: .5;}f-element.title f-toolbar i { font-size: 20px; right: unset; left: 0px;}f-element.input-right.title i { left: 10px; right: unset;}f-element.title.left span { text-align: left;}f-element f-io { border: 2px solid #dadada; width: 7px; height: 7px; position: absolute; background: #242427; border-radius: 8px; float: left; left: -7px; top: calc( 50% - 5px ); cursor: alias; box-shadow: 0 0 3px 2px #0000005e; z-index: 1;}f-element f-io.connect,f-canvas.dragging-rio f-element:hover f-io.lio,f-canvas.dragging-lio f-element:hover f-io.rio { zoom: 1.4;}f-node.io-connect f-io:not(.connect) { border: 2px solid #dadada !important; zoom: 1 !important;}f-element f-io.rio { float: right; right: -7px; left: unset;}f-element f-disconnect { position: absolute; left: -35px; top: 50%; font-size: 22px; transform: translateY( -50% ); filter: drop-shadow(0 0 5px #000); text-shadow: 0px 0px 5px black; cursor: pointer; transition: all .2s;}f-element.input-right f-disconnect { right: -35px; left: unset;}f-element f-disconnect:hover { color: #ff3300;}f-element textarea::-webkit-scrollbar { width: 6px;}f-element textarea::-webkit-scrollbar-track { background: #111; } f-element textarea::-webkit-scrollbar-thumb { background: #0177fb; }f-element textarea::-webkit-scrollbar-thumb:hover { background: #1187ff; }f-element.small { height: 18px;}f-element.large { height: 36px;}f-canvas.dragging-lio f-node:not(.io-connect) f-element.rio:hover,f-canvas.dragging-rio f-node:not(.io-connect) f-element.lio:hover,f-element.select { background-color: rgba(61, 70, 82, 0.98);}f-element.invalid > f-io { zoom: 1 !important;}f-element.invalid::after { font-size: 14px !important; display: flex; justify-content: center; align-items:center; margin: auto; position: absolute; width: 100%; height: 100%; background: #bd0b0b77; vertical-align: middle; color: #fff; content: \'Not Compatible\'; opacity: .95; backdrop-filter: grayscale(100%); white-space: nowrap; overflow: hidden; left: 0; top: 0; text-transform: initial;}f-drop { width: 100%; height: 100%; position: sticky; left: 0; top: 0; background: #02358417; text-align: center; justify-content: center; align-items: center; display: flex; box-shadow: inset 0 0 20px 10px #464ace17; pointer-events: none; transition: all .07s; opacity: 0; visibility: hidden;}f-drop.visible { visibility: unset; opacity: unset; transition: all .23s;}f-drop span { opacity: .5; font-size: 40px; text-shadow: 0px 0px 5px #000; font-weight: bold;}f-tooltip { pointer-events: none;}f-tooltip { position: absolute; left: 0; top: 0; background: rgba(0,0,0,.8); backdrop-filter: blur(4px); font-size: 14px; padding: 7px; left: 50%; border-radius: 10px; transform: translateX(-50%); visibility: hidden; pointer-events: none; opacity: 0; transition: all 0.3s ease; z-index: 150; white-space: nowrap;}f-menu.context,f-menu.search { position: absolute;}f-menu.context { width: 170px; z-index: 110;}f-menu.search { bottom: 85px; left: 50%; transform: translateX(-50%); z-index: 10; width: 300px;}f-menu.context f-list { display: block; margin: 0; background: #171717e6; font-size: 12px; border-radius: 6px; backdrop-filter: blur(6px); border: 1px solid #7e7e7e45; box-shadow: 3px 3px 6px rgba(0,0,0,.2); transition: opacity 0.2s ease, transform 0.1s ease;}f-menu.search f-list { margin: 0 6px 0 6px; display: flex; flex-direction: column-reverse; margin-bottom: 5px;}f-menu.context.hidden { visibility: hidden; opacity: 0;}f-menu.context f-item,f-menu.search f-item { display: block; position: relative; margin: 0; padding: 0; white-space: nowrap;}f-menu.search f-item { opacity: 0;}f-menu.context f-item.submenu::after { content: ""; position: absolute; right: 6px; top: 50%; -webkit-transform: translateY( -50% ); transform: translateY( -50% ); border: 5px solid transparent; border-left-color: #808080;}f-menu.context f-item:hover > f-menu,f-menu.context f-item.active > f-menu { visibility: unset; transform: unset; opacity: unset;}f-menu.context f-menu { top: 0px; left: calc( 100% - 4px );}f-menu.context f-item button,f-menu.search f-item button { overflow: visible; display: block; width: calc( 100% - 6px ); text-align: left; cursor: pointer; white-space: nowrap; padding: 6px 8px; border-radius: 3px; background: rgba(45, 45, 48, 0.95); border: 0; color: #ddd; margin: 3px; text-shadow: 1px 1px 0px #0007;}f-menu.context f-item button i,f-menu.search f-item button i { float: left; font-size: 16px;}f-menu.context f-item button span,f-menu.search f-item button span { margin-left: 6px;}f-menu.context f-item:hover > button,f-menu.search f-item:hover > button,f-menu.search f-item.active > button { color: #fff; background-color: rgba(61, 70, 82, 0.98);}f-menu.search f-item:hover,f-menu.search f-item.active { opacity: 1 !important;}f-menu.context f-item button:active { outline: solid 1px rgba( 0, 80, 200, 0.98 );}f-menu.context f-item f-tooltip { margin-left: 85px; top: -50px;}f-menu.search f-item { display: none;}f-menu.search f-item:nth-child(1) { opacity: 1; display: unset;}f-menu.search f-item:nth-child(2) { opacity: .8; display: unset;}f-menu.search f-item:nth-child(3) { opacity: .6; display: unset;}f-menu.search f-item:nth-child(4) { opacity: .4; display: unset;}f-menu.search f-item button { border-radius: 14px;}f-tips { right: 10px; top: 10px; position: absolute; z-index: 100; pointer-events: none; display: flex; flex-direction: column;}f-tips f-tip { width: 450px; font-size: 13px; border-radius: 6px; text-align: center; display: block; height: auto; color: #ffffffe0; margin: 4px; padding: 4px; background: #17171794; border: 1px solid #7e7e7e38; line-height: 100%; backdrop-filter: blur(6px); transition: all 0.2s ease; text-transform: initial; opacity: 0;}f-tips f-tip:nth-child(1) { opacity: 1;}f-tips f-tip:nth-child(2) { opacity: .75;}f-tips f-tip:nth-child(3) { opacity: .25;}f-tips f-tip:nth-child(4) { opacity: .1;}f-tips f-tip.error { background: #b900005e;}f-menu.search input { width: calc( 100% - 28px ); height: 41px; position: absolute; z-index: 10; border-radius: 20px; padding-left: 14px; padding-right: 14px; font-size: 15px; background-color: #17171794; border: 1px solid #7e7e7e45; backdrop-filter: blur(6px); box-shadow: 3px 3px 6px rgb(0 0 0 / 20%); text-transform: initial;}f-menu.circle { position: absolute; z-index: 100;}f-menu.circle.top { top: 40px;}f-menu.circle.left { left: 40px;}f-menu.circle.bottom { bottom: 40px;}f-menu.circle.right { right: 40px;}f-menu.circle f-item { align-content: space-around; margin-right: 20px;}f-menu.circle f-item button { width: 47px; height: 47px; font-size: 22px; background: #17171794; border-radius: 50%; backdrop-filter: blur(6px); border: 1px solid #7e7e7e45; line-height: 100%; cursor: pointer; box-shadow: 3px 3px 6px rgba(0,0,0,.2);}f-menu.circle f-item f-tooltip { margin-top: -60px;}f-menu.circle.top f-item f-tooltip { margin-top: 50px;}.f-rounded f-node f-element,.f-rounded f-node f-element.title.left { border-radius: 10px 5px 10px 5px;}.f-rounded f-node f-element input, .f-rounded f-node f-element select,.f-rounded f-node f-element button,.f-rounded f-node f-element textarea,.f-rounded f-node f-element input[type=\'checkbox\'].toggle,.f-rounded f-node f-element input[type=\'checkbox\'].toggle:after { border-radius: 20px 10px;}.f-rounded f-node f-element input { padding-left: 7px; padding-right: 7px;}.f-rounded f-menu.context,.f-rounded f-menu.context f-item button { border-radius: 20px 10px;}@media (hover: hover) and (pointer: fine) { f-node:not(.selected):hover { filter: drop-shadow(0 0 6px #66666630); } f-element f-toolbar { visibility: hidden; opacity: 0; transition: opacity 0.2s ease; } body:not(.connecting) f-node:hover > f-element f-toolbar { visibility: visible; opacity: 1; } f-element f-io:hover { zoom: 1.4; } f-menu.circle f-item button:hover { background-color: #2a2a2a; } f-menu.search input:hover, f-menu.search input:focus { background-color: #1a1a1a; filter: drop-shadow(0 0 6px #66666630); } f-menu.search input:focus { filter: drop-shadow(0 0 8px #4444dd); } f-menu.circle f-item button:hover > f-tooltip, f-menu.context f-item button:hover > f-tooltip { visibility: visible; opacity: 1; } f-menu.circle f-item button:hover > f-tooltip { margin-top: -50px; } f-menu.circle.top f-item button:hover > f-tooltip { margin-top: 60px; } f-menu.context f-item button:hover > f-tooltip { top: -30px; } f-menu.circle f-item button:focus > f-tooltip, f-menu.context f-item button:focus > f-tooltip { visibility: hidden; opacity: 0; }}@media (hover: none) and (pointer: coarse) { body.dragging f-canvas, body.connecting f-canvas { overflow: hidden !important; }}f-element.invalid > f-inputs,f-element.invalid > f-label,f-element.invalid > f-title,f-element.invalid > f-toolbar,f-element.invalid > input,f-element.invalid > select { opacity: .1 !important;}f-canvas { will-change: top, left;}f-node { will-change: transform !important;}' );

const REVISION = '1';

const Styles = {
	icons: {
		close: '',
		unlink: ''
	}
};

let _id = 0;

class Serializer extends EventTarget {

	constructor() {

		super();

		this._id = _id ++;

		this._serializable = true;

	}

	get id() {

		return this._id;

	}

	setSerializable( value ) {

		this._serializable = value;

		return this;

	}

	getSerializable() {

		return this._serializable;

	}

	serialize( /*data*/ ) {

		console.warn( 'Serializer: Abstract function.' );

	}

	deserialize( /*data*/ ) {

		console.warn( 'Serializer: Abstract function.' );

	}

	toJSON( data = null ) {

		let object = null;

		const id = this.id;

		if ( data !== null ) {

			const objects = data.objects;

			object = objects[ id ];

			if ( object === undefined ) {

				object = { objects };

				this.serialize( object );

				delete object.objects;

				objects[ id ] = object;

			}

		} else {

			object = { objects: {} };

			this.serialize( object );

		}

		object.id = id;
		object.type = this.constructor.name;

		return object;

	}

}

class PointerMonitor {

	started = false;

	constructor() {

		this.x = 0;
		this.y = 0;

		this._onMoveEvent = ( e ) => {

			const event = e.touches ? e.touches[ 0 ] : e;

			this.x = event.clientX;
			this.y = event.clientY;

		};

	}

	start() {

		if ( this.started ) return;

		this.started = true;

		window.addEventListener( 'wheel', this._onMoveEvent, true );

		window.addEventListener( 'mousedown', this._onMoveEvent, true );
		window.addEventListener( 'touchstart', this._onMoveEvent, true );

		window.addEventListener( 'mousemove', this._onMoveEvent, true );
		window.addEventListener( 'touchmove', this._onMoveEvent, true );

		window.addEventListener( 'dragover', this._onMoveEvent, true );

		return this;

	}

}

const pointer = new PointerMonitor().start();

const draggableDOM = ( dom, callback = null, settings = {} ) => {

	settings = Object.assign( {
		className: 'dragging',
		click: false,
		bypass: false
	}, settings );

	let dragData = null;

	const { className, click, bypass } = settings;

	const getZoom = () => {

		let zoomDOM = dom;

		while ( zoomDOM && zoomDOM !== document ) {

			const zoom = zoomDOM.style.zoom;

			if ( zoom ) {

				return Number( zoom );

			}

			zoomDOM = zoomDOM.parentNode;

		}

		return 1;

	};

	const onMouseDown = ( e ) => {

		const event = e.touches ? e.touches[ 0 ] : e;

		if ( bypass === false ) e.stopImmediatePropagation();

		dragData = {
			client: { x: event.clientX, y: event.clientY },
			delta: { x: 0, y: 0 },
			start: { x: dom.offsetLeft, y: dom.offsetTop },
			frame: 0,
			isDown: true,
			dragging: false,
			isTouch: !! e.touches
		};

		if ( click === true ) {

			callback( dragData );

			dragData.frame ++;

		}

		window.addEventListener( 'mousemove', onGlobalMouseMove );
		window.addEventListener( 'mouseup', onGlobalMouseUp );

		window.addEventListener( 'touchmove', onGlobalMouseMove );
		window.addEventListener( 'touchend', onGlobalMouseUp );

	};

	const onGlobalMouseMove = ( e ) => {

		const { start, delta, client } = dragData;

		const event = e.touches ? e.touches[ 0 ] : e;

		const zoom = getZoom();

		delta.x = ( event.clientX - client.x ) / zoom;
		delta.y = ( event.clientY - client.y ) / zoom;

		dragData.x = start.x + delta.x;
		dragData.y = start.y + delta.y;

		if ( dragData.dragging === true ) {

			if ( callback !== null ) {

				callback( dragData );

				dragData.frame ++;

			} else {

				dom.style.cssText += `; left: ${ dragData.x }px; top: ${ dragData.y }px;`;

			}

			if ( bypass === false ) e.stopImmediatePropagation();

		} else {

			if ( Math.abs( delta.x ) > 2 || Math.abs( delta.y ) > 2 ) {

				dragData.dragging = true;

				dom.classList.add( 'drag' );

				if ( className ) document.body.classList.add( ...className.split( ' ' ) );

				if ( bypass === false ) e.stopImmediatePropagation();

			}

		}

	};

	const onGlobalMouseUp = ( e ) => {

		if ( bypass === false ) e.stopImmediatePropagation();

		dom.classList.remove( 'drag' );

		if ( className ) document.body.classList.remove( ...className.split( ' ' ) );

		window.removeEventListener( 'mousemove', onGlobalMouseMove );
		window.removeEventListener( 'mouseup', onGlobalMouseUp );

		window.removeEventListener( 'touchmove', onGlobalMouseMove );
		window.removeEventListener( 'touchend', onGlobalMouseUp );

		if ( callback === null ) {

			dom.removeEventListener( 'mousedown', onMouseDown );
			dom.removeEventListener( 'touchstart', onMouseDown );

		}

		dragData.dragging = false;
		dragData.isDown = false;

		if ( callback !== null ) {

			callback( dragData );

			dragData.frame ++;

		}

	};

	if ( dom instanceof Event ) {

		const e = dom;
		dom = e.target;

		onMouseDown( e );

	} else {

		dom.addEventListener( 'mousedown', onMouseDown );
		dom.addEventListener( 'touchstart', onMouseDown );

	}

};

const dispatchEventList = ( list, ...params ) => {

	for ( const callback of list ) {

		if ( callback( ...params ) === false ) {

			return false;

		}

	}

	return true;

};

const numberToPX = ( val ) => {

	if ( isNaN( val ) === false ) {

		val = `${ val }px`;

	}

	return val;

};

const numberToHex = ( val ) => {

	if ( isNaN( val ) === false ) {

		val = `#${ val.toString( 16 ).padStart( 6, '0' ) }`;

	}

	return val;

};

const rgbaToArray = ( rgba ) => {

	const values = rgba.substring( rgba.indexOf( '(' ) + 1, rgba.indexOf( ')' ) )
		.split( ',' )
		.map( num => parseInt( num.trim() ) );

	return values;

};

const removeDOMClass = ( dom, classList ) => {

	if ( classList ) classList.split( ' ' ).forEach( alignClass => dom.classList.remove( alignClass ) );

};

const addDOMClass = ( dom, classList ) => {

	if ( classList ) classList.split( ' ' ).forEach( alignClass => dom.classList.add( alignClass ) );

};

var Utils = /*#__PURE__*/Object.freeze( {
	__proto__: null,
	pointer: pointer,
	draggableDOM: draggableDOM,
	dispatchEventList: dispatchEventList,
	numberToPX: numberToPX,
	numberToHex: numberToHex,
	rgbaToArray: rgbaToArray,
	removeDOMClass: removeDOMClass,
	addDOMClass: addDOMClass
} );

class Link {

	constructor( inputElement = null, outputElement = null ) {

		this.inputElement = inputElement;
		this.outputElement = outputElement;

	}

	get lioElement() {

		if ( Link.InputDirection === 'left' ) {

			return this.outputElement;

		} else {

			return this.inputElement;

		}

	}

	get rioElement() {

		if ( Link.InputDirection === 'left' ) {

			return this.inputElement;

		} else {

			return this.outputElement;

		}

	}

}

//Link.InputDirection = 'right';
Link.InputDirection = 'left';

let selected = null;

class Element extends Serializer {

	constructor( draggable = false ) {

		super();

		const dom = document.createElement( 'f-element' );
		dom.element = this;

		const onSelect = ( e ) => {

			let element = this;

			if ( e.changedTouches && e.changedTouches.length > 0 ) {

				const touch = e.changedTouches[ 0 ];

				let overDOM = document.elementFromPoint( touch.clientX, touch.clientY );

				while ( overDOM && ( ! overDOM.element || ! overDOM.element.isElement ) ) {

					overDOM = overDOM.parentNode;

				}

				element = overDOM ? overDOM.element : null;

			}

			const type = e.type;

			if ( ( type === 'mouseout' ) && selected === element ) {

				selected = null;

			} else {

				selected = element;

			}

		};

		if ( draggable === false ) {

			dom.ontouchstart = dom.onmousedown = ( e ) => {

				e.stopPropagation();

			};

		}

		dom.addEventListener( 'mouseup', onSelect, true );
		dom.addEventListener( 'mouseover', onSelect );
		dom.addEventListener( 'mouseout', onSelect );
		dom.addEventListener( 'touchmove', onSelect );
		dom.addEventListener( 'touchend', onSelect );

		this.inputs = [];

		this.links = [];

		this.dom = dom;

		this.lioLength = 0;
		this.rioLength = 0;

		this.events = {
			'connect': [],
			'connectChildren': [],
			'valid': []
		};

		this.node = null;

		this.style = '';
		this.color = null;

		this.object = null;
		this.objectCallback = null;

		this.enabledInputs = true;

		this.visible = true;

		this.inputsDOM = dom;

		this.disconnectDOM = null;

		this.lioDOM = this._createIO( 'lio' );
		this.rioDOM = this._createIO( 'rio' );

		this.dom.classList.add( `input-${ Link.InputDirection }` );

		this.addEventListener( 'connect', ( ) => {

			dispatchEventList( this.events.connect, this );

		} );

		this.addEventListener( 'connectChildren', ( ) => {

			dispatchEventList( this.events.connectChildren, this );

		} );

	}

	setAttribute( name, value ) {

		this.dom.setAttribute( name, value );

		return this;

	}

	onValid( callback ) {

		this.events.valid.push( callback );

		return this;

	}

	onConnect( callback, childrens = false ) {

		this.events.connect.push( callback );

		if ( childrens ) {

			this.events.connectChildren.push( callback );

		}

		return this;

	}

	setObjectCallback( callback ) {

		this.objectCallback = callback;

		return this;

	}

	setObject( value ) {

		this.object = value;

		return this;

	}

	getObject( output = null ) {

		return this.objectCallback ? this.objectCallback( output ) : this.object;

	}

	setVisible( value ) {

		this.visible = value;

		this.dom.style.display = value ? '' : 'none';

		return this;

	}

	getVisible() {

		return this.visible;

	}

	setEnabledInputs( value ) {

		const dom = this.dom;

		if ( ! this.enabledInputs ) dom.classList.remove( 'inputs-disable' );

		if ( ! value ) dom.classList.add( 'inputs-disable' );

		this.enabledInputs = value;

		return this;

	}

	getEnabledInputs() {

		return this.enabledInputs;

	}

	setColor( color ) {

		this.dom.style[ 'background-color' ] = numberToHex( color );
		this.color = null;

		return this;

	}

	getColor() {

		if ( this.color === null ) {

			const css = window.getComputedStyle( this.dom );

			this.color = css.getPropertyValue( 'background-color' );

		}

		return this.color;

	}

	setStyle( style ) {

		const dom = this.dom;

		if ( this.style ) dom.classList.remove( this.style );

		if ( style ) dom.classList.add( style );

		this.style = style;
		this.color = null;

		return this;

	}

	setInput( length ) {

		if ( Link.InputDirection === 'left' ) {

			return this.setLIO( length );

		} else {

			return this.setRIO( length );

		}

	}

	setInputColor( color ) {

		if ( Link.InputDirection === 'left' ) {

			return this.setLIOColor( color );

		} else {

			return this.setRIOColor( color );

		}

	}

	setOutput( length ) {

		if ( Link.InputDirection === 'left' ) {

			return this.setRIO( length );

		} else {

			return this.setLIO( length );

		}

	}

	setOutputColor( color ) {

		if ( Link.InputDirection === 'left' ) {

			return this.setRIOColor( color );

		} else {

			return this.setLIOColor( color );

		}

	}

	get inputLength() {

		if ( Link.InputDirection === 'left' ) {

			return this.lioLength;

		} else {

			return this.rioLength;

		}

	}

	get outputLength() {

		if ( Link.InputDirection === 'left' ) {

			return this.rioLength;

		} else {

			return this.lioLength;

		}

	}

	setLIOColor( color ) {

		this.lioDOM.style[ 'border-color' ] = numberToHex( color );

		return this;

	}

	setLIO( length ) {

		this.lioLength = length;

		this.lioDOM.style.visibility = length > 0 ? '' : 'hidden';

		if ( length > 0 ) {

			this.dom.classList.add( 'lio' );
			this.dom.prepend( this.lioDOM );

		} else {

			this.dom.classList.remove( 'lio' );
			this.lioDOM.remove();

		}

		return this;

	}

	getLIOColor() {

		return this.lioDOM.style[ 'border-color' ];

	}

	setRIOColor( color ) {

		this.rioDOM.style[ 'border-color' ] = numberToHex( color );

		return this;

	}

	getRIOColor() {

		return this.rioDOM.style[ 'border-color' ];

	}

	setRIO( length ) {

		this.rioLength = length;

		this.rioDOM.style.visibility = length > 0 ? '' : 'hidden';

		if ( length > 0 ) {

			this.dom.classList.add( 'rio' );
			this.dom.prepend( this.rioDOM );

		} else {

			this.dom.classList.remove( 'rio' );
			this.rioDOM.remove();

		}

		return this;

	}

	add( input ) {

		this.inputs.push( input );

		input.element = this;

		this.inputsDOM.append( input.dom );

		return this;

	}

	setHeight( val ) {

		this.dom.style.height = numberToPX( val );

		return this;

	}

	getHeight() {

		return this.dom.style.height;

	}

	connect( element = null ) {

		if ( this.disconnectDOM !== null ) {

			// remove the current input

			this.disconnectDOM.dispatchEvent( new Event( 'disconnect' ) );

		}

		if ( element !== null ) {

			element = element.baseElement || element;

			if ( dispatchEventList( this.events.valid, this, element, 'connect' ) === false ) {

				return false;

			}

			const link = new Link( this, element );

			this.links.push( link );

			if ( this.disconnectDOM === null ) {

				this.disconnectDOM = document.createElement( 'f-disconnect' );
				this.disconnectDOM.innerHTML = Styles.icons.unlink ? `<i class='${ Styles.icons.unlink }'></i>` : '✖';

				this.dom.append( this.disconnectDOM );

				const onDisconnect = () => {

					this.links = [];
					this.dom.removeChild( this.disconnectDOM );

					this.disconnectDOM.removeEventListener( 'mousedown', onClick, true );
					this.disconnectDOM.removeEventListener( 'touchstart', onClick, true );
					this.disconnectDOM.removeEventListener( 'disconnect', onDisconnect, true );

					element.removeEventListener( 'connect', onConnect );
					element.removeEventListener( 'connectChildren', onConnect );
					element.removeEventListener( 'nodeConnect', onConnect );
					element.removeEventListener( 'nodeConnectChildren', onConnect );
					element.removeEventListener( 'dispose', onDispose );

					this.disconnectDOM = null;

				};

				const onConnect = () => {

					this.dispatchEvent( new Event( 'connectChildren' ) );

				};

				const onDispose = () => {

					this.connect();

				};

				const onClick = ( e ) => {

					e.stopPropagation();

					this.connect();

				};

				this.disconnectDOM.addEventListener( 'mousedown', onClick, true );
				this.disconnectDOM.addEventListener( 'touchstart', onClick, true );
				this.disconnectDOM.addEventListener( 'disconnect', onDisconnect, true );

				element.addEventListener( 'connect', onConnect );
				element.addEventListener( 'connectChildren', onConnect );
				element.addEventListener( 'nodeConnect', onConnect );
				element.addEventListener( 'nodeConnectChildren', onConnect );
				element.addEventListener( 'dispose', onDispose );

			}

		}

		this.dispatchEvent( new Event( 'connect' ) );

		return true;

	}

	dispose() {

		this.dispatchEvent( new Event( 'dispose' ) );

	}

	serialize( data ) {

		const height = this.getHeight();

		const inputs = [];
		const links = [];

		for ( const input of this.inputs ) {

			inputs.push( input.toJSON( data ).id );

		}

		for ( const link of this.links ) {

			if ( link.inputElement !== null && link.outputElement !== null ) {

				links.push( link.outputElement.toJSON( data ).id );

			}

		}

		if ( this.inputLength > 0 ) data.inputLength = this.inputLength;
		if ( this.outputLength > 0 ) data.outputLength = this.outputLength;

		if ( inputs.length > 0 ) data.inputs = inputs;
		if ( links.length > 0 ) data.links = links;

		if ( this.style !== '' ) {

			data.style = this.style;

		}

		if ( height !== '' ) {

			data.height = height;

		}

	}

	deserialize( data ) {

		if ( data.inputLength !== undefined ) this.setInput( data.inputLength );
		if ( data.outputLength !== undefined ) this.setOutput( data.outputLength );

		if ( data.inputs !== undefined ) {

			const inputs = this.inputs;

			if ( inputs.length > 0 ) {

				let index = 0;

				for ( const id of data.inputs ) {

					data.objects[ id ] = inputs[ index ++ ];

				}

			} else {

				for ( const id of data.inputs ) {

					this.add( data.objects[ id ] );

				}

			}

		}

		if ( data.links !== undefined ) {

			for ( const id of data.links ) {

				this.connect( data.objects[ id ] );

			}

		}

		if ( data.style !== undefined ) {

			this.setStyle( data.style );

		}

		if ( data.height !== undefined ) {

			this.setHeight( data.height );

		}

	}

	getLinkedObject( output = null ) {

		const linkedElement = this.getLinkedElement();

		return linkedElement ? linkedElement.getObject( output ) : null;

	}

	getLinkedElement() {

		const link = this.getLink();

		return link ? link.outputElement : null;

	}

	getLink() {

		return this.links[ 0 ];

	}

	_createIO( type ) {

		const { dom } = this;

		const ioDOM = document.createElement( 'f-io' );
		ioDOM.style.visibility = 'hidden';
		ioDOM.className = type;

		const onConnectEvent = ( e ) => {

			e.preventDefault();

			e.stopPropagation();

			selected = null;

			const nodeDOM = this.node.dom;

			nodeDOM.classList.add( 'io-connect' );

			ioDOM.classList.add( 'connect' );
			dom.classList.add( 'select' );

			const defaultOutput = Link.InputDirection === 'left' ? 'lio' : 'rio';

			const link = type === defaultOutput ? new Link( this ) : new Link( null, this );
			const previewLink = new Link( link.inputElement, link.outputElement );

			this.links.push( link );

			draggableDOM( e, ( data ) => {

				if ( previewLink.outputElement )
					previewLink.outputElement.dom.classList.remove( 'invalid' );

				if ( previewLink.inputElement )
					previewLink.inputElement.dom.classList.remove( 'invalid' );

				previewLink.inputElement = link.inputElement;
				previewLink.outputElement = link.outputElement;

				if ( type === defaultOutput ) {

					previewLink.outputElement = selected;

				} else {

					previewLink.inputElement = selected;

				}

				const isInvalid = previewLink.inputElement !== null && previewLink.outputElement !== null &&
					previewLink.inputElement.inputLength > 0 && previewLink.outputElement.outputLength > 0 &&
					dispatchEventList( previewLink.inputElement.events.valid, previewLink.inputElement, previewLink.outputElement, data.dragging ? 'dragging' : 'dragged' ) === false;

				if ( data.dragging && isInvalid ) {

					if ( type === defaultOutput ) {

						if ( previewLink.outputElement )
							previewLink.outputElement.dom.classList.add( 'invalid' );

					} else {

						if ( previewLink.inputElement )
							previewLink.inputElement.dom.classList.add( 'invalid' );

					}

					return;

				}

				if ( ! data.dragging ) {

					nodeDOM.classList.remove( 'io-connect' );

					ioDOM.classList.remove( 'connect' );
					dom.classList.remove( 'select' );

					this.links.splice( this.links.indexOf( link ), 1 );

					if ( selected !== null && ! isInvalid ) {

						link.inputElement = previewLink.inputElement;
						link.outputElement = previewLink.outputElement;

						// check if is an is circular link

						if ( link.outputElement.node.isCircular( link.inputElement.node ) ) {

							return;

						}

						//

						if ( link.inputElement.inputLength > 0 && link.outputElement.outputLength > 0 ) {

							link.inputElement.connect( link.outputElement );

						}

					}

				}

			}, { className: 'connecting' } );

		};

		ioDOM.addEventListener( 'mousedown', onConnectEvent, true );
		ioDOM.addEventListener( 'touchstart', onConnectEvent, true );

		return ioDOM;

	}

}

Element.prototype.isElement = true;

class Input extends Serializer {

	constructor( dom ) {

		super();

		this.dom = dom;

		this.element = null;

		this.extra = null;

		this.tagColor = null;

		this.events = {
			'change': [],
			'click': []
		};

		this.addEventListener( 'change', ( ) => {

			dispatchEventList( this.events.change, this );

		} );

		this.addEventListener( 'click', ( ) => {

			dispatchEventList( this.events.click, this );

		} );

	}

	setExtra( value ) {

		this.extra = value;

		return this;

	}

	getExtra() {

		return this.extra;

	}

	setTagColor( color ) {

		this.tagColor = color;

		this.dom.style[ 'border-left' ] = `2px solid ${color}`;

		return this;

	}

	getTagColor() {

		return this.tagColor;

	}

	setToolTip( text ) {

		const div = document.createElement( 'f-tooltip' );
		div.innerText = text;

		this.dom.append( div );

		return this;

	}

	onChange( callback ) {

		this.events.change.push( callback );

		return this;

	}

	onClick( callback ) {

		this.events.click.push( callback );

		return this;

	}

	setReadOnly( value ) {

		this.dom.readOnly = value;

		return this;

	}

	getReadOnly() {

		return this.dom.readOnly;

	}

	setValue( value, dispatch = true ) {

		this.dom.value = value;

		if ( dispatch ) this.dispatchEvent( new Event( 'change' ) );

		return this;

	}

	getValue() {

		return this.dom.value;

	}

	serialize( data ) {

		data.value = this.getValue();

	}

	deserialize( data ) {

		this.setValue( data.value );

	}

}

Input.prototype.isInput = true;

class Node extends Serializer {

	constructor() {

		super();

		const dom = document.createElement( 'f-node' );

		const onDown = () => {

			const canvas = this.canvas;

			if ( canvas !== null ) {

				canvas.select( this );

			}

		};

		dom.addEventListener( 'mousedown', onDown, true );
		dom.addEventListener( 'touchstart', onDown, true );

		this._onConnect = ( e ) => {

			const { target } = e;

			for ( const element of this.elements ) {

				if ( element !== target ) {

					element.dispatchEvent( new Event( 'nodeConnect' ) );

				}

			}

		};

		this._onConnectChildren = ( e ) => {

			const { target } = e;

			for ( const element of this.elements ) {

				if ( element !== target ) {

					element.dispatchEvent( new Event( 'nodeConnectChildren' ) );

				}

			}

		};

		this.dom = dom;

		this.style = '';

		this.canvas = null;

		this.elements = [];

		this.events = {
			'focus': [],
			'blur': []
		};

		this.setWidth( 300 ).setPosition( 0, 0 );

	}

	get baseElement() {

		return this.elements[ 0 ];

	}

	onFocus( callback ) {

		this.events.focus.push( callback );

		return this;

	}

	onBlur( callback ) {

		this.events.blur.push( callback );

		return this;

	}

	setStyle( style ) {

		const dom = this.dom;

		if ( this.style ) dom.classList.remove( this.style );

		if ( style ) dom.classList.add( style );

		this.style = style;

		return this;

	}

	setPosition( x, y ) {

		const dom = this.dom;

		dom.style.left = numberToPX( x );
		dom.style.top = numberToPX( y );

		return this;

	}

	getPosition() {

		const dom = this.dom;

		return {
			x: parseInt( dom.style.left ),
			y: parseInt( dom.style.top )
		};

	}

	setWidth( val ) {

		this.dom.style.width = numberToPX( val );

		return this;

	}

	getWidth() {

		return parseInt( this.dom.style.width );

	}

	getHeight() {

		return this.dom.offsetHeight;

	}

	getBound() {

		const { x, y } = this.getPosition();
		const width = this.getWidth();
		const height = this.getHeight();

		return { x, y, width, height };

	}

	add( element ) {

		this.elements.push( element );

		element.node = this;
		element.addEventListener( 'connect', this._onConnect );
		element.addEventListener( 'connectChildren', this._onConnectChildren );

		this.dom.append( element.dom );

		return this;

	}

	remove( element ) {

		this.elements.splice( this.elements.indexOf( element ), 1 );

		element.node = null;
		element.removeEventListener( 'connect', this._onConnect );
		element.removeEventListener( 'connectChildren', this._onConnectChildren );

		this.dom.removeChild( element.dom );

		return this;

	}

	dispose() {

		const canvas = this.canvas;

		if ( canvas !== null ) canvas.remove( this );

		for ( const element of this.elements ) {

			element.dispose();

		}

		this.dispatchEvent( new Event( 'dispose' ) );

	}

	isCircular( node ) {

		if ( node === this ) return true;

		const links = this.getLinks();

		for ( const link of links ) {

			if ( link.outputElement.node.isCircular( node ) ) {

				return true;

			}

		}

		return false;

	}

	getLinks() {

		const links = [];

		for ( const element of this.elements ) {

			links.push( ...element.links );

		}

		return links;

	}

	getColor() {

		return ( this.elements[ 0 ] ) ? this.elements[ 0 ].getColor() : undefined;

	}

	serialize( data ) {

		const { x, y } = this.getPosition();

		const elements = [];

		for ( const element of this.elements ) {

			elements.push( element.toJSON( data ).id );

		}

		data.x = x;
		data.y = y;
		data.width = this.getWidth();
		data.elements = elements;

		if ( this.style !== '' ) {

			data.style = this.style;

		}

	}

	deserialize( data ) {

		this.setPosition( data.x, data.y );
		this.setWidth( data.width );

		if ( data.style !== undefined ) {

			this.setStyle( data.style );

		}

		const elements = this.elements;

		if ( elements.length > 0 ) {

			let index = 0;

			for ( const id of data.elements ) {

				data.objects[ id ] = elements[ index ++ ];

			}

		} else {

			for ( const id of data.elements ) {

				this.add( data.objects[ id ] );

			}

		}

	}

}

Node.prototype.isNode = true;

class DraggableElement extends Element {

	constructor( draggable = true ) {

		super( true );

		this.draggable = draggable;

		const onDrag = ( e ) => {

			e.preventDefault();

			if ( this.draggable === true ) {

				draggableDOM( this.node.dom, null, { className: 'dragging node' } );

			}

		};

		const { dom } = this;

		dom.addEventListener( 'mousedown', onDrag, true );
		dom.addEventListener( 'touchstart', onDrag, true );

	}

}

class TitleElement extends DraggableElement {

	constructor( title, draggable = true ) {

		super( draggable );

		const { dom } = this;

		dom.className = 'title';

		const dbClick = () => {

			this.node.canvas.focusSelected = ! this.node.canvas.focusSelected;

		};

		dom.addEventListener( 'dblclick', dbClick );

		const titleDOM = document.createElement( 'f-title' );
		titleDOM.innerText = title;

		const iconDOM = document.createElement( 'i' );

		const toolbarDOM = document.createElement( 'f-toolbar' );

		this.buttons = [];

		this.titleDOM = titleDOM;
		this.iconDOM = iconDOM;
		this.toolbarDOM = toolbarDOM;

		dom.append( titleDOM );
		dom.append( iconDOM );
		dom.append( toolbarDOM );

	}

	setIcon( value ) {

		this.iconDOM.className = value;

		return this;

	}

	getIcon() {

		return this.iconDOM.className;

	}

	setTitle( value ) {

		this.titleDOM.innerText = value;

		return this;

	}

	getTitle() {

		return this.titleDOM.innerText;

	}

	addButton( button ) {

		this.buttons.push( button );

		this.toolbarDOM.append( button.dom );

		return this;

	}

	serialize( data ) {

		super.serialize( data );

		const title = this.getTitle();
		const icon = this.getIcon();

		data.title = title;

		if ( icon !== '' ) {

			data.icon = icon;

		}

	}

	deserialize( data ) {

		super.deserialize( data );

		this.setTitle( data.title );

		if ( data.icon !== undefined ) {

			this.setIcon( data.icon );

		}

	}

}

const drawLine = ( p1x, p1y, p2x, p2y, invert, size, colorA, ctx, colorB = null ) => {

	const dx = p2x - p1x;
	const dy = p2y - p1y;
	const offset = Math.sqrt( ( dx * dx ) + ( dy * dy ) ) * ( invert ? - .3 : .3 );

	ctx.beginPath();

	ctx.moveTo( p1x, p1y );

	ctx.bezierCurveTo(
		p1x + offset, p1y,
		p2x - offset, p2y,
		p2x, p2y
	);

	if ( colorB !== null && colorA !== colorB ) {

		const gradient = ctx.createLinearGradient( p1x, p1y, p2x, p2y );
		gradient.addColorStop( 0, colorA );
		gradient.addColorStop( 1, colorB );

		ctx.strokeStyle = gradient;

	} else {

		ctx.strokeStyle = colorA;

	}

	ctx.lineWidth = size;
	ctx.stroke();

};

const colors = [
	'#ff4444',
	'#44ff44',
	'#4444ff'
];

const dropNode = new Node().add( new TitleElement( 'File' ) ).setWidth( 250 );

class Canvas extends Serializer {

	constructor() {

		super();

		const dom = document.createElement( 'f-canvas' );
		const contentDOM = document.createElement( 'f-content' );
		const areaDOM = document.createElement( 'f-area' );
		const dropDOM = document.createElement( 'f-drop' );

		const canvas = document.createElement( 'canvas' );
		const frontCanvas = document.createElement( 'canvas' );
		const mapCanvas = document.createElement( 'canvas' );

		const context = canvas.getContext( '2d' );
		const frontContext = frontCanvas.getContext( '2d' );
		const mapContext = mapCanvas.getContext( '2d' );

		this.dom = dom;

		this.contentDOM = contentDOM;
		this.areaDOM = areaDOM;
		this.dropDOM = dropDOM;

		this.canvas = canvas;
		this.frontCanvas = frontCanvas;
		this.mapCanvas = mapCanvas;

		this.context = context;
		this.frontContext = frontContext;
		this.mapContext = mapContext;

		this.clientX = 0;
		this.clientY = 0;

		this.relativeClientX = 0;
		this.relativeClientY = 0;

		this.nodes = [];

		this.selected = null;

		this.updating = false;

		this.droppedItems = [];

		this.events = {
			'drop': []
		};

		this._scrollLeft = 0;
		this._scrollTop = 0;
		this._zoom = 1;
		this._width = 0;
		this._height = 0;
		this._focusSelected = false;
		this._mapInfo = {
			scale: 1,
			screen: {}
		};

		canvas.className = 'background';
		frontCanvas.className = 'frontground';
		mapCanvas.className = 'map';

		dropDOM.innerHTML = '<span>drop your file</span>';

		dom.append( dropDOM );
		dom.append( canvas );
		dom.append( frontCanvas );
		dom.append( contentDOM );
		dom.append( areaDOM );
		dom.append( mapCanvas );

		const zoomTo = ( zoom, clientX = this.clientX, clientY = this.clientY ) => {

			zoom = Math.min( Math.max( zoom, .2 ), 1 );

			this.scrollLeft -= ( clientX / this.zoom ) - ( clientX / zoom );
			this.scrollTop -= ( clientY / this.zoom ) - ( clientY / zoom );
			this.zoom = zoom;

		};

		let touchData = null;

		const onTouchStart = () => {

			touchData = null;

		};

		const onMouseZoom = ( e ) => {

			e.preventDefault();

			e.stopImmediatePropagation();

			const delta = e.deltaY * .003;

			zoomTo( this.zoom - delta );

		};

		const onTouchZoom = ( e ) => {

			if ( e.touches && e.touches.length === 2 ) {

				e.preventDefault();

				e.stopImmediatePropagation();

				const clientX = ( e.touches[ 0 ].clientX + e.touches[ 1 ].clientX ) / 2;
				const clientY = ( e.touches[ 0 ].clientY + e.touches[ 1 ].clientY ) / 2;

				const distance = Math.hypot(
					e.touches[ 0 ].clientX - e.touches[ 1 ].clientX,
					e.touches[ 0 ].clientY - e.touches[ 1 ].clientY
				);

				if ( touchData === null ) {

					touchData = {
						distance
					};

				}

				const delta = ( touchData.distance - distance ) * .003;
				touchData.distance = distance;

				zoomTo( this.zoom - delta, clientX, clientY );

			}

		};

		const onTouchMove = ( e ) => {

			if ( e.touches && e.touches.length === 1 ) {

				e.preventDefault();

				e.stopImmediatePropagation();

				const clientX = e.touches[ 0 ].clientX;
				const clientY = e.touches[ 0 ].clientY;

				if ( touchData === null ) {

					const { scrollLeft, scrollTop } = this;

					touchData = {
						scrollLeft,
						scrollTop,
						clientX,
						clientY
					};

				}

				const zoom = this.zoom;

				this.scrollLeft = touchData.scrollLeft + ( ( clientX - touchData.clientX ) / zoom );
				this.scrollTop = touchData.scrollTop + ( ( clientY - touchData.clientY ) / zoom );

			}

		};

		dom.addEventListener( 'wheel', onMouseZoom );
		dom.addEventListener( 'touchmove', onTouchZoom );
		dom.addEventListener( 'touchstart', onTouchStart );
		canvas.addEventListener( 'touchmove', onTouchMove );

		let dropEnterCount = 0;

		const dragState = ( enter ) => {

			if ( enter ) {

				if ( dropEnterCount ++ === 0 ) {

					this.droppedItems = [];

					dropDOM.classList.add( 'visible' );

					this.add( dropNode );

				}

			} else if ( -- dropEnterCount === 0 ) {

				dropDOM.classList.remove( 'visible' );

				this.remove( dropNode );

			}

		};

		dom.addEventListener( 'dragenter', () => {

 			dragState( true );

		} );

		dom.addEventListener( 'dragleave', () => {

			dragState( false );

		} );

		dom.addEventListener( 'dragover', ( e ) => {

			e.preventDefault();

			const { relativeClientX, relativeClientY } = this;

			const centerNodeX = dropNode.getWidth() / 2;

			dropNode.setPosition( relativeClientX - centerNodeX, relativeClientY - 20 );

		} );

		dom.addEventListener( 'drop', ( e ) => {

			e.preventDefault();

			dragState( false );

			this.droppedItems = e.dataTransfer.items;

			dispatchEventList( this.events.drop, this );

		} );

		draggableDOM( dom, ( data ) => {

			const { delta, isTouch } = data;

			if ( ! isTouch ) {

				if ( data.scrollTop === undefined ) {

					data.scrollLeft = this.scrollLeft;
					data.scrollTop = this.scrollTop;

				}

				const zoom = this.zoom;

				this.scrollLeft = data.scrollLeft + ( delta.x / zoom );
				this.scrollTop = data.scrollTop + ( delta.y / zoom );

			}

			if ( data.dragging ) {

				dom.classList.add( 'grabbing' );

			} else {

				dom.classList.remove( 'grabbing' );

			}

		}, { className: 'dragging-canvas' } );


		draggableDOM( mapCanvas, ( data ) => {

			const { scale, screen } = this._mapInfo;

			if ( data.scrollLeft === undefined ) {

				const rect = this.mapCanvas.getBoundingClientRect();

				const clientMapX = data.client.x - rect.left;
				const clientMapY = data.client.y - rect.top;

				const overMapScreen =
					clientMapX > screen.x && clientMapY > screen.y &&
					clientMapX < screen.x + screen.width && clientMapY < screen.y + screen.height;

				if ( overMapScreen === false ) {

					const scaleX = this._mapInfo.width / this.mapCanvas.width;

					let scrollLeft = - this._mapInfo.left - ( clientMapX * scaleX );
					let scrollTop = - this._mapInfo.top - ( clientMapY * ( this._mapInfo.height / this.mapCanvas.height ) );

					scrollLeft += ( screen.width / 2 ) / scale;
					scrollTop += ( screen.height / 2 ) / scale;

					this.scrollLeft = scrollLeft;
					this.scrollTop = scrollTop;

				}

				data.scrollLeft = this.scrollLeft;
				data.scrollTop = this.scrollTop;

			}

			this.scrollLeft = data.scrollLeft - ( data.delta.x / scale );
			this.scrollTop = data.scrollTop - ( data.delta.y / scale );

		}, { click: true } );

		this._onMoveEvent = ( e ) => {

			const event = e.touches ? e.touches[ 0 ] : e;
			const { zoom, rect } = this;

			this.clientX = event.clientX;
			this.clientY = event.clientY;

			const rectClientX = ( this.clientX - rect.left ) / zoom;
			const rectClientY = ( this.clientY - rect.top ) / zoom;

			this.relativeClientX = rectClientX - this.scrollLeft;
			this.relativeClientY = rectClientY - this.scrollTop;

		};

		this._onUpdate = () => {

			this.update();

		};

		this.start();

	}

	getBounds() {

		const bounds = { x: Infinity, y: Infinity, width: - Infinity, height: - Infinity };

		for ( const node of this.nodes ) {

			const { x, y, width, height } = node.getBound();

			bounds.x = Math.min( bounds.x, x );
			bounds.y = Math.min( bounds.y, y );
			bounds.width = Math.max( bounds.width, x + width );
			bounds.height = Math.max( bounds.height, y + height );

		}

		bounds.x = Math.round( bounds.x );
		bounds.y = Math.round( bounds.y );
		bounds.width = Math.round( bounds.width );
		bounds.height = Math.round( bounds.height );

		return bounds;

	}

	get width() {

		return this._width;

	}

	get height() {

		return this._height;

	}

	get rect() {

		return this.dom.getBoundingClientRect();

	}

	get zoom() {

		return this._zoom;

	}

	set zoom( val ) {

		this._zoom = val;
		this.contentDOM.style.zoom = val;

	}

	set scrollLeft( val ) {

		this._scrollLeft = val;
		this.contentDOM.style.left = numberToPX( val );

	}

	get scrollLeft() {

		return this._scrollLeft;

	}

	set scrollTop( val ) {

		this._scrollTop = val;
		this.contentDOM.style.top = numberToPX( val );

	}

	get scrollTop() {

		return this._scrollTop;

	}

	set focusSelected( value ) {

		if ( this._focusSelected === value ) return;

		const classList = this.dom.classList;

		this._focusSelected = value;

		if ( value ) {

			classList.add( 'focusing' );

		} else {

			classList.remove( 'focusing' );

		}

	}

	get focusSelected() {

		return this._focusSelected;

	}

	onDrop( callback ) {

		this.events.drop.push( callback );

		return this;

	}

	start() {

		this.updating = true;

		document.addEventListener( 'wheel', this._onMoveEvent, true );

		document.addEventListener( 'mousedown', this._onMoveEvent, true );
		document.addEventListener( 'touchstart', this._onMoveEvent, true );

		document.addEventListener( 'mousemove', this._onMoveEvent, true );
		document.addEventListener( 'touchmove', this._onMoveEvent, true );

		document.addEventListener( 'dragover', this._onMoveEvent, true );

		requestAnimationFrame( this._onUpdate );

	}

	stop() {

		this.updating = false;

		document.removeEventListener( 'wheel', this._onMoveEvent, true );

		document.removeEventListener( 'mousedown', this._onMoveEvent, true );
		document.removeEventListener( 'touchstart', this._onMoveEvent, true );

		document.removeEventListener( 'mousemove', this._onMoveEvent, true );
		document.removeEventListener( 'touchmove', this._onMoveEvent, true );

		document.removeEventListener( 'dragover', this._onMoveEvent, true );

	}

	add( node ) {

		if ( node.canvas === this ) return;

		this.nodes.push( node );

		node.canvas = this;

		this.contentDOM.append( node.dom );

		return this;

	}

	remove( node ) {

		if ( node === this.selected ) {

			this.select();

		}

		this.unlink( node );

		const nodes = this.nodes;

		nodes.splice( nodes.indexOf( node ), 1 );

		node.canvas = null;

		this.contentDOM.removeChild( node.dom );

		node.dispatchEvent( new Event( 'remove' ) );

		return this;

	}

	clear() {

		const nodes = this.nodes;

		while ( nodes.length > 0 ) {

			this.remove( nodes[ 0 ] );

		}

		return this;

	}

	unlink( node ) {

		const links = this.getLinks();

		for ( const link of links ) {

			if ( link.inputElement && link.outputElement ) {

				if ( link.inputElement.node === node ) {

					link.inputElement.connect();

				} else if ( link.outputElement.node === node ) {

					link.inputElement.connect();

				}

			}

		}

	}

	getLinks() {

		const links = [];

		for ( const node of this.nodes ) {

			links.push( ...node.getLinks() );

		}

		return links;

	}

	centralize() {

		const bounds = this.getBounds();

		this.scrollLeft = ( this.canvas.width / 2 ) - ( ( - bounds.x + bounds.width ) / 2 );
		this.scrollTop = ( this.canvas.height / 2 ) - ( ( - bounds.y + bounds.height ) / 2 );

		return this;

	}

	setSize( width, height ) {

		this._width = width;
		this._height = height;

		this.update();

		return this;

	}

	select( node = null ) {

		if ( node === this.selected ) return;

		const previousNode = this.selected;

		if ( previousNode !== null ) {

			this.focusSelected = false;

			previousNode.dom.classList.remove( 'selected' );

			this.selected = null;

			dispatchEventList( previousNode.events.blur, previousNode );

		}

		if ( node !== null ) {

			node.dom.classList.add( 'selected' );

			this.selected = node;

			dispatchEventList( node.events.focus, node );

		}

	}

	updateMap() {

		const { nodes, mapCanvas, mapContext, scrollLeft, scrollTop, canvas, zoom, _mapInfo } = this;

		const bounds = this.getBounds();

		mapCanvas.width = 300;
		mapCanvas.height = 200;

		mapContext.clearRect( 0, 0, mapCanvas.width, mapCanvas.height );

		mapContext.fillStyle = 'rgba( 0, 0, 0, 0 )';
		mapContext.fillRect( 0, 0, mapCanvas.width, mapCanvas.height );

		const boundsWidth = - bounds.x + bounds.width;
		const boundsHeight = - bounds.y + bounds.height;

		const mapScale = Math.min( mapCanvas.width / boundsWidth, mapCanvas.height / boundsHeight ) * .5;

		const boundsMapWidth = boundsWidth * mapScale;
		const boundsMapHeight = boundsHeight * mapScale;

		const boundsOffsetX = ( mapCanvas.width / 2 ) - ( boundsMapWidth / 2 );
		const boundsOffsetY = ( mapCanvas.height / 2 ) - ( boundsMapHeight / 2 );

		let selectedNode = null;

		for ( const node of nodes ) {

			const nodeBound = node.getBound();
			const nodeColor = node.getColor();

			nodeBound.x += - bounds.x;
			nodeBound.y += - bounds.y;

			nodeBound.x *= mapScale;
			nodeBound.y *= mapScale;
			nodeBound.width *= mapScale;
			nodeBound.height *= mapScale;

			nodeBound.x += boundsOffsetX;
			nodeBound.y += boundsOffsetY;

			if ( node !== this.selected ) {

				mapContext.fillStyle = nodeColor;
				mapContext.fillRect( nodeBound.x, nodeBound.y, nodeBound.width, nodeBound.height );

			} else {

				selectedNode = {
					nodeBound,
					nodeColor
				};

			}

		}

		if ( selectedNode !== null ) {

			const { nodeBound, nodeColor } = selectedNode;

			mapContext.fillStyle = nodeColor;
			mapContext.fillRect( nodeBound.x, nodeBound.y, nodeBound.width, nodeBound.height );

		}

		const screenMapX = ( - ( scrollLeft + bounds.x ) * mapScale ) + boundsOffsetX;
		const screenMapY = ( - ( scrollTop + bounds.y ) * mapScale ) + boundsOffsetY;
		const screenMapWidth = ( canvas.width * mapScale ) / zoom;
		const screenMapHeight = ( canvas.height * mapScale ) / zoom;

		mapContext.fillStyle = 'rgba( 200, 200, 200, 0.1 )';
		mapContext.fillRect( screenMapX, screenMapY, screenMapWidth, screenMapHeight );

		//

		_mapInfo.scale = mapScale;
		_mapInfo.left = ( - boundsOffsetX / mapScale ) + bounds.x;
		_mapInfo.top = ( - boundsOffsetY / mapScale ) + bounds.y;
		_mapInfo.width = mapCanvas.width / mapScale;
		_mapInfo.height = mapCanvas.height / mapScale;
		_mapInfo.screen.x = screenMapX;
		_mapInfo.screen.y = screenMapY;
		_mapInfo.screen.width = screenMapWidth;
		_mapInfo.screen.height = screenMapHeight;

	}

	updateLines() {

		const { dom, zoom, canvas, frontCanvas, frontContext, context, _width, _height } = this;

		const domRect = this.rect;

		if ( canvas.width !== _width || canvas.height !== _height ) {

			canvas.width = _width;
			canvas.height = _height;

			frontCanvas.width = _width;
			frontCanvas.height = _height;

		}

		context.clearRect( 0, 0, _width, _height );
		frontContext.clearRect( 0, 0, _width, _height );

		//

		context.globalCompositeOperation = 'lighter';
		frontContext.globalCompositeOperation = 'source-over';

		const links = this.getLinks();

		const aPos = { x: 0, y: 0 };
		const bPos = { x: 0, y: 0 };

		const offsetIORadius = 10;

		let dragging = '';

		for ( const link of links ) {

			const { lioElement, rioElement } = link;

			let draggingLink = '';
			let length = 0;

			if ( lioElement !== null ) {

				const rect = lioElement.dom.getBoundingClientRect();

				length = Math.max( length, lioElement.rioLength );

				aPos.x = rect.x + rect.width;
				aPos.y = rect.y + ( rect.height / 2 );

			} else {

				aPos.x = this.clientX;
				aPos.y = this.clientY;

				draggingLink = 'lio';

			}

			if ( rioElement !== null ) {

				const rect = rioElement.dom.getBoundingClientRect();

				length = Math.max( length, rioElement.lioLength );

				bPos.x = rect.x;
				bPos.y = rect.y + ( rect.height / 2 );

			} else {

				bPos.x = this.clientX;
				bPos.y = this.clientY;

				draggingLink = 'rio';

			}

			dragging = dragging || draggingLink;

			const drawContext = draggingLink ? frontContext : context;

			if ( draggingLink || length === 1 ) {

				let colorA = null,
					colorB = null;

				if ( draggingLink === 'rio' ) {

					colorA = colorB = lioElement.getRIOColor();

					aPos.x += offsetIORadius;
					bPos.x /= zoom;
					bPos.y /= zoom;

				} else if ( draggingLink === 'lio' ) {

					colorA = colorB = rioElement.getLIOColor();

					bPos.x -= offsetIORadius;
					aPos.x /= zoom;
					aPos.y /= zoom;

				} else {

					colorA = lioElement.getRIOColor();
					colorB = rioElement.getLIOColor();

				}

				drawLine(
					aPos.x * zoom, aPos.y * zoom,
					bPos.x * zoom, bPos.y * zoom,
					false, 2, colorA || '#ffffff', drawContext, colorB || '#ffffff'
				);

			} else {

				length = Math.min( length, 4 );

				for ( let i = 0; i < length; i ++ ) {

					const color = colors[ i ] || '#ffffff';

					const marginY = 4;

					const rioLength = Math.min( lioElement.rioLength, length );
					const lioLength = Math.min( rioElement.lioLength, length );

					const colorA = lioElement.getRIOColor() || color;
					const colorB = rioElement.getLIOColor() || color;

					const aCenterY = ( ( rioLength * marginY ) * .5 ) - ( marginY / 2 );
					const bCenterY = ( ( lioLength * marginY ) * .5 ) - ( marginY / 2 );

					const aIndex = Math.min( i, rioLength - 1 );
					const bIndex = Math.min( i, lioLength - 1 );

					const aPosY = ( aIndex * marginY ) - 1;
					const bPosY = ( bIndex * marginY ) - 1;

					drawLine(
						aPos.x * zoom, ( ( aPos.y + aPosY ) - aCenterY ) * zoom,
						bPos.x * zoom, ( ( bPos.y + bPosY ) - bCenterY ) * zoom,
						false, 2, colorA, drawContext, colorB
					);

				}

			}

		}

		context.globalCompositeOperation = 'destination-in';

		context.fillRect( domRect.x, domRect.y, domRect.width, domRect.height );

		if ( dragging !== '' ) {

			dom.classList.add( 'dragging-' + dragging );

		} else {

			dom.classList.remove( 'dragging-lio' );
			dom.classList.remove( 'dragging-rio' );

		}

	}


	update() {

		if ( this.updating === false ) return;

		requestAnimationFrame( this._onUpdate );

		this.updateLines();
		this.updateMap();

	}

	serialize( data ) {

		const nodes = [];

		for ( const node of this.nodes ) {

			nodes.push( node.toJSON( data ).id );

		}

		data.nodes = nodes;

	}

	deserialize( data ) {

		for ( const id of data.nodes ) {

			this.add( data.objects[ id ] );

		}

	}

}

class ButtonInput extends Input {

	constructor( innterText = '' ) {

		const dom = document.createElement( 'button' );

		const spanDOM = document.createElement( 'span' );
		dom.append( spanDOM );

		const iconDOM = document.createElement( 'i' );
		dom.append( iconDOM );

		super( dom );

		this.spanDOM = spanDOM;
		this.iconDOM = iconDOM;

		spanDOM.innerText = innterText;

		dom.onmouseover = () => {

			this.dispatchEvent( new Event( 'mouseover' ) );

		};

		dom.onclick = dom.ontouchstart = ( e ) => {

			e.preventDefault();

			e.stopPropagation();

			this.dispatchEvent( new Event( 'click' ) );

		};

	}

	setIcon( className ) {

		this.iconDOM.className = className;

		return this;

	}

	setValue( val ) {

		this.spanDOM.innerText = val;

		return this;

	}

	getValue() {

		return this.spanDOM.innerText;

	}

}

class ObjectNode extends Node {

	constructor( name, inputLength, callback = null, width = 300 ) {

		super();

		this.setWidth( width );

		const title = new TitleElement( name )
			.setObjectCallback( callback )
			.setSerializable( false )
			.setOutput( inputLength );

		const closeButton = new ButtonInput( Styles.icons.close || '✕' ).onClick( () => {

			this.dispose();

		} ).setIcon( Styles.icons.close );

		title.addButton( closeButton );

		this.add( title );

		this.title = title;
		this.closeButton = closeButton;

	}

	setName( value ) {

		this.title.setTitle( value );

		return this;

	}

	getName() {

		return this.title.getTitle();

	}

	setObjectCallback( callback ) {

		this.title.setObjectCallback( callback );

		return this;

	}

	getObject( callback ) {

		return this.title.getObject( callback );

	}

	setColor( color ) {

		return this.title.setColor( color );

	}

	setOutputColor( color ) {

		return this.title.setOutputColor( color );

	}

	invalidate() {

		this.title.dispatchEvent( new Event( 'connect' ) );

	}

}

const ENTER_KEY$2 = 13;

class StringInput extends Input {

	constructor( value = '' ) {

		const dom = document.createElement( 'input' );
		super( dom );

		dom.type = 'text';
		dom.value = value;
		dom.spellcheck = false;
		dom.autocomplete = 'off';

		dom.onblur = () => {

			this.dispatchEvent( new Event( 'blur' ) );

		};

		dom.onchange = () => {

			this.dispatchEvent( new Event( 'change' ) );

		};

		dom.onkeyup = ( e ) => {

			if ( e.keyCode === ENTER_KEY$2 ) {

				e.target.blur();

			}

			e.stopPropagation();

			this.dispatchEvent( new Event( 'change' ) );

		};

	}

}

const ENTER_KEY$1 = 13;

class NumberInput extends Input {

	constructor( value = 0, min = - Infinity, max = Infinity, step = .01 ) {

		const dom = document.createElement( 'input' );
		super( dom );

		this.min = min;
		this.max = max;
		this.step = step;

		this.integer = false;

		dom.type = 'text';
		dom.className = 'number';
		dom.value = this._getString( value );
		dom.spellcheck = false;
		dom.autocomplete = 'off';

		dom.ondragstart = dom.oncontextmenu = ( e ) => {

			e.preventDefault();

			e.stopPropagation();

		};

		dom.onfocus = dom.onclick = () => {

			dom.select();

		};

		dom.onblur = () => {

			this.dom.value = this._getString( this.dom.value );

			this.dispatchEvent( new Event( 'blur' ) );

		};

		dom.onchange = () => {

			this.dispatchEvent( new Event( 'change' ) );

		};

		dom.onkeydown = ( e ) => {

			if ( e.key.length === 1 && /\d|\./.test( e.key ) !== true ) {

				return false;

			}

			if ( e.keyCode === ENTER_KEY$1 ) {

				e.target.blur();

			}

			e.stopPropagation();

		};

		draggableDOM( dom, ( data ) => {

			const { delta } = data;

			if ( dom.readOnly === true ) return;

			if ( data.value === undefined ) {

				data.value = this.getValue();

			}

			const diff = delta.x - delta.y;

			const value = data.value + ( diff * this.step );

			dom.value = this._getString( value.toFixed( this.precision ) );

			this.dispatchEvent( new Event( 'change' ) );

		} );

	}

	setStep( step ) {

		this.step = step;

		return this;

	}

	setRange( min, max, step ) {

		this.min = min;
		this.max = max;
		this.step = step;

		this.dispatchEvent( new Event( 'range' ) );

		return this.setValue( this.getValue() );

	}

	get precision() {

		if ( this.integer === true ) return 0;

		const fract = this.step % 1;

		return fract !== 0 ? fract.toString().split( '.' )[ 1 ].length : 1;

	}

	setValue( val, dispatch = true ) {

		return super.setValue( this._getString( val ), dispatch );

	}

	getValue() {

		return Number( this.dom.value );

	}

	serialize( data ) {

		const { min, max } = this;

		if ( min !== - Infinity && max !== Infinity ) {

			data.min = this.min;
			data.max = this.max;
			data.step = this.step;

		}

		super.serialize( data );

	}

	deserialize( data ) {

		if ( data.min !== undefined ) {

			const { min, max, step } = this;

			this.setRange( min, max, step );

		}

		super.deserialize( data );

	}

	_getString( value ) {

		const num = Math.min( Math.max( Number( value ), this.min ), this.max );

		if ( this.integer === true ) {

			return Math.floor( num );

		} else {

			return num + ( num % 1 ? '' : '.0' );

		}

	}

}

const getStep = ( min, max ) => {

	const sensibility = .001;

	return ( max - min ) * sensibility;

};

class SliderInput extends Input {

	constructor( value = 0, min = 0, max = 100 ) {

		const dom = document.createElement( 'f-subinputs' );
		super( dom );

		value = Math.min( Math.max( value, min ), max );

		const step = getStep( min, max );

		const rangeDOM = document.createElement( 'input' );
		rangeDOM.type = 'range';
		rangeDOM.min = min;
		rangeDOM.max = max;
		rangeDOM.step = step;
		rangeDOM.value = value;

		const field = new NumberInput( value, min, max, step );
		field.dom.className = 'range-value';
		field.onChange( () => {

			rangeDOM.value = field.getValue();

			this.dispatchEvent( new Event( 'change' ) );

		} );

		field.addEventListener( 'range', () => {

			rangeDOM.min = field.min;
			rangeDOM.max = field.max;
			rangeDOM.step = field.step;
			rangeDOM.value = field.getValue();

		} );

		dom.append( rangeDOM );
		dom.append( field.dom );

		this.rangeDOM = rangeDOM;
		this.field = field;

		const updateRangeValue = () => {

			let value = Number( rangeDOM.value );

			if ( value !== this.max && value + this.step >= this.max ) {

				// fix not end range fraction

				rangeDOM.value = value = this.max;

			}

			this.field.setValue( value );

		};

		draggableDOM( rangeDOM, () => {

			updateRangeValue();

			this.dispatchEvent( new Event( 'change' ) );

		}, { className: '' } );

	}

	get min() {

		return this.field.min;

	}

	get max() {

		return this.field.max;

	}

	get step() {

		return this.field.step;

	}

	setRange( min, max ) {

		this.field.setRange( min, max, getStep( min, max ) );

		this.dispatchEvent( new Event( 'range' ) );
		this.dispatchEvent( new Event( 'change' ) );

		return this;

	}

	setValue( val, dispatch = true ) {

		this.field.setValue( val );
		this.rangeDOM.value = val;

		if ( dispatch ) this.dispatchEvent( new Event( 'change' ) );

		return this;

	}

	getValue() {

		return this.field.getValue();

	}

	serialize( data ) {

		data.min = this.min;
		data.max = this.max;

		super.serialize( data );

	}

	deserialize( data ) {

		const { min, max } = data;

		this.setRange( min, max );

		super.deserialize( data );

	}

}

class ColorInput extends Input {

	constructor( value = 0x0099ff ) {

		const dom = document.createElement( 'input' );
		super( dom );

		dom.type = 'color';
		dom.value = numberToHex( value );

		dom.oninput = () => {

			this.dispatchEvent( new Event( 'change' ) );

		};

	}

	setValue( value, dispatch = true ) {

		return super.setValue( numberToHex( value ), dispatch );

	}

	getValue() {

		return parseInt( super.getValue().substr( 1 ), 16 );

	}

}

const ENTER_KEY = 13;

class TextInput extends Input {

	constructor( innerText = '' ) {

		const dom = document.createElement( 'textarea' );
		super( dom );

		dom.innerText = innerText;

		dom.onblur = () => {

			this.dispatchEvent( new Event( 'blur' ) );

		};

		dom.onchange = () => {

			this.dispatchEvent( new Event( 'change' ) );

		};

		dom.onkeyup = ( e ) => {

			if ( e.keyCode === ENTER_KEY ) {

				e.target.blur();

			}

			e.stopPropagation();

			this.dispatchEvent( new Event( 'change' ) );

		};

	}

}

class LabelElement extends Element {

	constructor( label = '', align = '' ) {

		super();

		this.labelDOM = document.createElement( 'f-label' );
		this.inputsDOM = document.createElement( 'f-inputs' );

		const spanDOM = document.createElement( 'span' );

		this.spanDOM = spanDOM;
		this.iconDOM = null;

		this.labelDOM.append( spanDOM );

		this.dom.append( this.labelDOM );
		this.dom.append( this.inputsDOM );

		this.serializeLabel = false;

		this.setLabel( label );
		this.setAlign( align );

	}

	setIcon( value ) {

		this.iconDOM = this.iconDOM || document.createElement( 'i' );
		this.iconDOM.className = value;

		if ( value ) this.labelDOM.prepend( this.iconDOM );
		else this.iconDOM.remove();

		return this;

	}

	getIcon() {

		return this.iconDOM ? this.iconDOM.className : undefined;

	}

	setAlign( align ) {

		this.labelDOM.className = align;

	}

	setLabel( val ) {

		this.spanDOM.innerText = val;

	}

	getLabel() {

		return this.spanDOM.innerText;

	}

	serialize( data ) {

		super.serialize( data );

		if ( this.serializeLabel ) {

			const label = this.getLabel();
			const icon = this.getIcon();

			data.label = label;

			if ( icon !== '' ) {

				data.icon = icon;

			}

		}

	}

	deserialize( data ) {

		super.deserialize( data );

		if ( this.serializeLabel ) {

			this.setLabel( data.label );

			if ( data.icon !== undefined ) {

				this.setIcon( data.icon );

			}

		}

	}

}

class PanelNode extends Node {

	constructor( title = 'Panel', align = 'top-right' ) {

		super();

		const titleElement = new TitleElement( title );
		this.add( titleElement );

		const collapseButton = new ButtonInput( '🗕' );
		collapseButton.onClick( () => {

			this.setCollapse( ! this.collapsed );

		} );

		titleElement.addButton( collapseButton );

		this.collapseButton = collapseButton;
		this.titleElement = titleElement;
		this.align = align;
		this.collapsed = false;

		this.setAlign( align );
		this.setStyle( 'rouded' );

	}

	setCollapse( value ) {

		const cssClass = 'closed';

		this.dom.classList.remove( cssClass );

		this.collapsed = value;

		this.collapseButton.value = value ? '🗖' : '🗕';

		if ( value === true ) {

			this.dom.classList.add( cssClass );

		}

		return this;

	}

	setAlign( align ) {

		if ( this.align ) this.dom.classList.remove( this.align );
		this.dom.classList.add( align );

		this.align = align;

		return this;

	}

	addInput( inputClass, object, property, ...params ) {

		const value = object[ property ];

		const input = new inputClass( value, ...params );
		input.onChange( () => {

			object[ property ] = input.value;

		} );

		this.add( new LabelElement( property ).add( input ) );

		return input;

	}

	addSlider( object, property, min, max ) {

		return this.addInput( SliderInput, object, property, min, max );

	}

	addNumber( object, property ) {

		return this.addInput( NumberInput, object, property );

	}

	addColor( object, property ) {

		return this.addInput( ColorInput, object, property );

	}

	addString( object, property ) {

		return this.addInput( StringInput, object, property );

	}

	addText( object, property ) {

		const input = this.addInput( TextInput, object, property );
		input.element.setHeight( 70 );

		return input;

	}

	addButton( name ) {

		const input = new ButtonInput( name );

		this.add( new Element().setHeight( 34 ).add( input ) );

		return input;

	}

}

class Menu extends EventTarget {

	constructor( className ) {

		super();

		const dom = document.createElement( 'f-menu' );
		dom.className = className + ' bottom left hidden';

		const listDOM = document.createElement( 'f-list' );

		dom.append( listDOM );

		this.dom = dom;
		this.listDOM = listDOM;

		this.visible = false;

		this.align = 'bottom left';

		this.subMenus = new WeakMap();
		this.domButtons = new WeakMap();

		this.buttons = [];

		this.events = {};

	}

	onContext( callback ) {

		this.events.context.push( callback );

		return this;

	}

	setAlign( align ) {

		const dom = this.dom;

		removeDOMClass( dom, this.align );
		addDOMClass( dom, align );

		this.align = align;

		return this;

	}

	getAlign() {

		return this.align;

	}

	show() {

		this.dom.classList.remove( 'hidden' );

		this.visible = true;

		this.dispatchEvent( new Event( 'show' ) );

		return this;

	}

	hide() {

		this.dom.classList.add( 'hidden' );

		this.dispatchEvent( new Event( 'hide' ) );

		this.visible = false;

	}

	add( button, submenu = null ) {

		const liDOM = document.createElement( 'f-item' );

		if ( submenu !== null ) {

			liDOM.classList.add( 'submenu' );

			liDOM.append( submenu.dom );

			this.subMenus.set( button, submenu );

			button.dom.addEventListener( 'mouseover', () => submenu.show() );
			button.dom.addEventListener( 'mouseout', () => submenu.hide() );

		}

		liDOM.append( button.dom );

		this.buttons.push( button );

		this.listDOM.append( liDOM );

		this.domButtons.set( button, liDOM );

		return this;

	}

	clear() {

		this.buttons = [];

		this.subMenus = new WeakMap();
		this.domButtons = new WeakMap();

		while ( this.listDOM.firstChild ) {

			this.listDOM.firstChild.remove();

		}

	}

}

let lastContext = null;

const onCloseLastContext = ( e ) => {

	if ( lastContext && lastContext.visible === true && e.target.closest( 'f-menu.context' ) === null ) {

		lastContext.hide();

	}

};

document.body.addEventListener( 'mousedown', onCloseLastContext, true );
document.body.addEventListener( 'touchstart', onCloseLastContext, true );

class ContextMenu extends Menu {

	constructor( target = null ) {

		super( 'context', target );

		this.events.context = [];

		this._lastButtonClick = null;

		this._onButtonClick = ( e = null ) => {

			const button = e ? e.target : null;

			if ( this._lastButtonClick ) {

				this._lastButtonClick.dom.parentElement.classList.remove( 'active' );

			}

			this._lastButtonClick = button;

			if ( button ) {

				if ( this.subMenus.has( button ) ) {

					this.subMenus.get( button )._onButtonClick();

				}

				button.dom.parentElement.classList.add( 'active' );

			}

		};

		this._onButtonMouseOver = ( e ) => {

			const button = e.target;

			if ( this.subMenus.has( button ) && this._lastButtonClick !== button ) {

				this._onButtonClick();

			}

		};

		this.addEventListener( 'context', ( ) => {

			dispatchEventList( this.events.context, this );

		} );

		this.setTarget( target );

	}

	openFrom( dom ) {

		const rect = dom.getBoundingClientRect();

		return this.open( rect.x + ( rect.width / 2 ), rect.y + ( rect.height / 2 ) );

	}

	open( x = pointer.x, y = pointer.y ) {

		if ( lastContext !== null ) {

			lastContext.hide();

		}

		lastContext = this;

		this.setPosition( x, y );

		document.body.append( this.dom );

		return this.show();

	}

	setPosition( x, y ) {

		const dom = this.dom;

		dom.style.left = numberToPX( x );
		dom.style.top = numberToPX( y );

		return this;

	}

	setTarget( target = null ) {

		if ( target !== null ) {

			const onContextMenu = ( e ) => {

				e.preventDefault();

				if ( e.pointerType !== 'mouse' || ( e.pageX === 0 && e.pageY === 0 ) ) return;

				this.dispatchEvent( new Event( 'context' ) );

				this.open();

			};

			this.target = target;

			target.addEventListener( 'contextmenu', onContextMenu, false );

		}

		return this;

	}

	show() {

		if ( ! this.opened ) {

			this.dom.style.left = '';
			this.dom.style.transform = '';

		}

		const domRect = this.dom.getBoundingClientRect();

		let offsetX = Math.min( window.innerWidth - ( domRect.x + domRect.width + 10 ), 0 );
		let offsetY = Math.min( window.innerHeight - ( domRect.y + domRect.height + 10 ), 0 );

		if ( this.opened ) {

			if ( offsetX < 0 ) offsetX = - domRect.width;
			if ( offsetY < 0 ) offsetY = - domRect.height;

			this.setPosition( domRect.x + offsetX, domRect.y + offsetY );

		} else {

			// flip submenus

			if ( offsetX < 0 ) this.dom.style.left = '-100%';
			if ( offsetY < 0 ) this.dom.style.transform = 'translateY( calc( 32px - 100% ) )';

		}

		return super.show();

	}

	hide() {

		if ( this.opened ) {

			lastContext = null;

		}

		return super.hide();

	}

	add( button, submenu = null ) {

		button.addEventListener( 'click', this._onButtonClick );
		button.addEventListener( 'mouseover', this._onButtonMouseOver );

		return super.add( button, submenu );

	}

	get opened() {

		return lastContext === this;

	}

}

class CircleMenu extends Menu {

	constructor( target = null ) {

		super( 'circle', target );

	}

}

class Tips extends EventTarget {

	constructor() {

		super();

		const dom = document.createElement( 'f-tips' );

		this.dom = dom;

		this.time = 0;
		this.duration = 3000;

	}

	message( str ) {

		return this.tip( str );

	}

	error( str ) {

		return this.tip( str, 'error' );

	}

	tip( html, className = '' ) {

		const dom = document.createElement( 'f-tip' );
		dom.className = className;
		dom.innerHTML = html;

		this.dom.prepend( dom );

		//requestAnimationFrame( () => dom.style.opacity = 1 );

		this.time = Math.min( this.time + this.duration, this.duration );

		setTimeout( () => {

			this.time = Math.max( this.time - this.duration, 0 );

			dom.style.opacity = 0;

			setTimeout( () => dom.remove(), 250 );

		}, this.time );

		return this;

	}

}

const filterString = ( str ) => {

	return str.trim().toLowerCase().replace( /\s\s+/g, ' ' );

};

class Search extends Menu {

	constructor() {

		super( 'search' );

		this.events.submit = [];
		this.events.filter = [];

		this.tags = new WeakMap();

		const inputDOM = document.createElement( 'input' );
		inputDOM.placeholder = 'Type here';

		let filter = true;
		let filterNeedUpdate = true;

		inputDOM.addEventListener( 'focusout', () => {

			filterNeedUpdate = true;

			this.setValue( '' );

		} );

		inputDOM.onkeydown = ( e ) => {

			const keyCode = e.keyCode;

			if ( keyCode === 38 ) {

				const index = this.filteredIndex;

				if ( this.forceAutoComplete ) {

					this.filteredIndex = index !== null ? ( index + 1 ) % ( this.filtered.length || 1 ) : 0;

				} else {

					this.filteredIndex = index !== null ? Math.min( index + 1, this.filtered.length - 1 ) : 0;

				}

				e.preventDefault();

				filter = false;

			} else if ( keyCode === 40 ) {

				const index = this.filteredIndex;

				if ( this.forceAutoComplete ) {

					this.filteredIndex = index - 1;

					if ( this.filteredIndex === null ) this.filteredIndex = this.filtered.length - 1;

				} else {

					this.filteredIndex = index !== null ? index - 1 : null;

				}

				e.preventDefault();

				filter = false;

			} else if ( keyCode === 13 ) {

				this.value = this.currentFiltered ? this.currentFiltered.button.getValue() : inputDOM.value;

				this.submit();

				e.preventDefault();

				filter = false;

			} else {

				filter = true;

			}

		};

		inputDOM.onkeyup = () => {

			if ( filter ) {

				if ( filterNeedUpdate ) {

					this.dispatchEvent( new Event( 'filter' ) );

					filterNeedUpdate = false;

				}

				this.filter( inputDOM.value );

			}

		};

		this.filtered = [];
		this.currentFiltered = null;

		this.value = '';

		this.forceAutoComplete = false;

		this.dom.append( inputDOM );

		this.inputDOM = inputDOM;

		this.addEventListener( 'filter', ( ) => {

			dispatchEventList( this.events.filter, this );

		} );

		this.addEventListener( 'submit', ( ) => {

			dispatchEventList( this.events.submit, this );

		} );

	}

	submit() {

		this.dispatchEvent( new Event( 'submit' ) );

		return this.setValue( '' );

	}

	setValue( value ) {

		this.inputDOM.value = value;

		this.filter( value );

		return this;

	}

	getValue() {

		return this.value;

	}

	onFilter( callback ) {

		this.events.filter.push( callback );

		return this;

	}

	onSubmit( callback ) {

		this.events.submit.push( callback );

		return this;

	}

	getFilterByButton( button ) {

		for ( const filter of this.filtered ) {

			if ( filter.button === button ) {

				return filter;

			}

		}

		return null;

	}

	add( button ) {

		super.add( button );

		const onDown = () => {

			const filter = this.getFilterByButton( button );

			this.filteredIndex = this.filtered.indexOf( filter );
			this.value = button.getValue();

			this.submit();

		};

		button.dom.addEventListener( 'mousedown', onDown );
		button.dom.addEventListener( 'touchstart', onDown );

		this.domButtons.get( button ).remove();

		return this;

	}

	set filteredIndex( index ) {

		if ( this.currentFiltered ) {

			const buttonDOM = this.domButtons.get( this.currentFiltered.button );

			buttonDOM.classList.remove( 'active' );

			this.currentFiltered = null;

		}

		const filteredItem = this.filtered[ index ];

		if ( filteredItem ) {

			const buttonDOM = this.domButtons.get( filteredItem.button );

			buttonDOM.classList.add( 'active' );

			this.currentFiltered = filteredItem;

		}

		this.updateFilter();

	}

	get filteredIndex() {

		return this.currentFiltered ? this.filtered.indexOf( this.currentFiltered ) : null;

	}

	setTag( button, tags ) {

		this.tags.set( button, tags );

	}

	filter( text ) {

		text = filterString( text );

		const tags = this.tags;
		const filtered = [];

		for ( const button of this.buttons ) {

			const buttonDOM = this.domButtons.get( button );

			buttonDOM.remove();

			const buttonTags = tags.has( button ) ? ' ' + tags.get( button ) : '';

			const label = filterString( button.getValue() + buttonTags );

			if ( text && label.includes( text ) === true ) {

				const score = text.length / label.length;

				filtered.push( {
					button,
					score
				} );

			}

		}

		filtered.sort( ( a, b ) => b.score - a.score );

		this.filtered = filtered;
		this.filteredIndex = this.forceAutoComplete ? 0 : null;

	}

	updateFilter() {

		const filteredIndex = Math.min( this.filteredIndex, this.filteredIndex - 3 );

		for ( let i = 0; i < this.filtered.length; i ++ ) {

			const button = this.filtered[ i ].button;
			const buttonDOM = this.domButtons.get( button );

			buttonDOM.remove();

			if ( i >= filteredIndex ) {

				this.listDOM.append( buttonDOM );

			}

		}

	}

}

class SelectInput extends Input {

	constructor( options = [], value = null ) {

		const dom = document.createElement( 'select' );
		super( dom );

		dom.onchange = () => {

			this.dispatchEvent( new Event( 'change' ) );

		};

		dom.onmousedown = dom.ontouchstart = () => {

			this.dispatchEvent( new Event( 'click' ) );

		};

		this.setOptions( options, value );

	}

	setOptions( options, value = null ) {

		const dom = this.dom;
		const defaultValue = dom.value;

		let containsDefaultValue = false;

		this.options = options;
		dom.innerHTML = '';

		for ( let index = 0; index < options.length; index ++ ) {

			let opt = options[ index ];

			if ( typeof opt === 'string' ) {

				opt = { name: opt, value: index };

			}

			const option = document.createElement( 'option' );
			option.innerText = opt.name;
			option.value = opt.value;

			if ( containsDefaultValue === false && defaultValue === opt.value ) {

				containsDefaultValue = true;

			}

			dom.append( option );

		}

		dom.value = value !== null ? value : containsDefaultValue ? defaultValue : '';

		return this;

	}

	getOptions() {

		return this._options;

	}

	serialize( data ) {

		data.options = [ ...this.options ];

		super.serialize( data );

	}

	deserialize( data ) {

		const currentOptions = this.options;

		if ( currentOptions.length === 0 ) {

			this.setOptions( data.options );

		}

		super.deserialize( data );

	}

}

class ToggleInput extends Input {

	constructor( value = false ) {

		const dom = document.createElement( 'input' );
		super( dom );

		dom.type = 'checkbox';
		dom.className = 'toggle';
		dom.checked = value;

		dom.onclick = () => this.dispatchEvent( new Event( 'click' ) );
		dom.onchange = () => this.dispatchEvent( new Event( 'change' ) );

	}

	setValue( val ) {

		this.dom.checked = val;

		this.dispatchEvent( new Event( 'change' ) );

		return this;

	}

	getValue() {

		return this.dom.checked;

	}

}

var Flow = /*#__PURE__*/Object.freeze( {
	__proto__: null,
	Element: Element,
	Input: Input,
	Node: Node,
	Canvas: Canvas,
	Serializer: Serializer,
	Styles: Styles,
	ObjectNode: ObjectNode,
	PanelNode: PanelNode,
	Menu: Menu,
	ContextMenu: ContextMenu,
	CircleMenu: CircleMenu,
	Tips: Tips,
	Search: Search,
	DraggableElement: DraggableElement,
	LabelElement: LabelElement,
	TitleElement: TitleElement,
	ButtonInput: ButtonInput,
	ColorInput: ColorInput,
	NumberInput: NumberInput,
	SelectInput: SelectInput,
	SliderInput: SliderInput,
	StringInput: StringInput,
	TextInput: TextInput,
	ToggleInput: ToggleInput
} );

class Loader extends EventTarget {

	constructor( parseType = Loader.DEFAULT ) {

		super();

		this.parseType = parseType;

		this.events = {
			'load': []
		};

	}

	setParseType( type ) {

		this.parseType = type;

		return this;

	}

	getParseType() {

		return this.parseType;

	}

	onLoad( callback ) {

		this.events.load.push( callback );

		return this;

	}

	async load( url, lib = null ) {

		return await fetch( url )
			.then( response => response.json() )
			.then( result => {

				this.data = this.parse( result, lib );

				dispatchEventList( this.events.load, this );

				return this.data;

			} )
			.catch( err => {

				console.error( 'Loader:', err );

			} );

	}

	parse( json, lib = null ) {

		json = this._parseObjects( json, lib );

		const parseType = this.parseType;

		if ( parseType === Loader.DEFAULT ) {

			const flowObj = new Flow[ json.type ]();

			if ( flowObj.getSerializable() ) {

				flowObj.deserialize( json );

			}

			return flowObj;

		} else if ( parseType === Loader.OBJECTS ) {

			return json;

		}

	}

	_parseObjects( json, lib = null ) {

		json = { ...json };

		const objects = {};

		for ( const id in json.objects ) {

			const obj = json.objects[ id ];
			obj.objects = objects;

			const Class = lib && lib[ obj.type ] ? lib[ obj.type ] : Flow[ obj.type ];

			if ( ! Class ) {

				console.error( `Class "${ obj.type }" not found!` );

			}

			objects[ id ] = new Class();

		}

		const ref = new WeakMap();

		const deserializePass = ( prop = null ) => {

			for ( const id in json.objects ) {

				const newObject = objects[ id ];

				if ( ref.has( newObject ) === false && ( prop === null || newObject[ prop ] === true ) ) {

					ref.set( newObject, true );

					if ( newObject.getSerializable() ) {

						newObject.deserialize( json.objects[ id ] );

					}

				}

			}

		};

		deserializePass( 'isNode' );
		deserializePass( 'isElement' );
		deserializePass( 'isInput' );
		deserializePass();

		json.objects = objects;

		return json;

	}

}

Loader.DEFAULT = 'default';
Loader.OBJECTS = 'objects';

export { ButtonInput, Canvas, CircleMenu, ColorInput, ContextMenu, DraggableElement, Element, Input, LabelElement, Loader, Menu, Node, NumberInput, ObjectNode, PanelNode, REVISION, Search, SelectInput, Serializer, SliderInput, StringInput, Styles, TextInput, Tips, TitleElement, ToggleInput, Utils };
