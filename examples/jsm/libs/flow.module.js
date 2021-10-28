/**
 * https://github.com/sunag/flow
 */

function __flow__addCSS( css ) {

	try {

		const style = document.createElement( 'style' );

		style.setAttribute( 'type', 'text/css' );
		style.innerHTML = css;
		document.head.appendChild( style );

	} catch( e ) {}

}

__flow__addCSS( `f-node { position: absolute; margin: 0; padding: 0; box-sizing: border-box; user-select: none; width: 320px; z-index: 1; padding-right: 14px;}f-node.center { top: 50%; left: 50%; transform: translate( -50%, -50% );}f-node.top-right { top: 0; right: 0;}f-node.top-center { top: 0; left: 50%; transform: translateX( -50% );}f-node.top-left { top: 0; left: 0;}f-element,f-element input,f-element select,f-element button,f-element textarea { font-family: 'Open Sans', sans-serif; font-size: 13px; color: #eeeeee; background-color: #242427; outline: 0; letter-spacing: .5px; margin: 0; padding: 0; border: 0; user-select: none;}f-element { position: relative; width: 100%; background: rgba(45, 45, 48, 0.98); pointer-events: auto; border-bottom: 2px solid #232323; display: flex; padding-left: 7px; padding-right: 7px; padding-top: 2px; padding-bottom: 2px;}f-element { height: 24px;}f-element input { margin-top: 2px; margin-bottom: 2px; box-shadow: inset 0px 1px 1px rgb(0 0 0 / 20%), 0px 1px 0px rgb(255 255 255 / 5%); margin-left: 2px; margin-right: 2px; width: inherit; padding-left: 4px; padding-right: 4px;}f-element input.number { cursor: col-resize;}f-element input:focus[type='text'], f-element input:focus[type='range'], f-element input:focus[type='color'] { background: rgba( 0, 0, 0, 0.6 ); outline: solid 1px rgba( 0, 80, 200, 0.98 );}f-element input[type='color'] { appearance: none; padding: 0; margin-left: 2px; margin-right: 2px; height: calc( 100% - 4px ); margin-top: 2px; border: none; }f-element input[type='color']::-webkit-color-swatch-wrapper { padding: 2px;}f-element input[type='color']::-webkit-color-swatch { border: none; cursor: alias;}f-element input[type='range'] { appearance: none; width: 100%; overflow: hidden; padding: 0; cursor: ew-resize;}f-element input[type='range']::-webkit-slider-runnable-track { appearance: none; height: 10px; color: #13bba4; margin: 0;}f-element input[type='range']::-webkit-slider-thumb { appearance: none; width: 0; background: #434343; box-shadow: -500px 0 0 500px rgba( 0, 120, 255, 0.98 ); border-radius: 50%; border: 0 !important;}f-element input[type='range']::-webkit-slider-runnable-track { margin-left: -4px; margin-right: -5px;}f-element input[type='checkbox'] { appearance: none; cursor: pointer;}f-element input[type='checkbox'].toggle { height: 20px; width: 45px; border-radius: 16px; display: inline-block; position: relative; margin: 0; margin-top: 3px; background: linear-gradient( 0deg, #292929 0%, #0a0a0ac2 100% ); transition: all 0.2s ease;}f-element input[type='checkbox'].toggle:after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: white; box-shadow: 0 1px 2px rgba(44, 44, 44, 0.2); transition: all 0.2s cubic-bezier(0.5, 0.1, 0.75, 1.35);}f-element input[type='checkbox'].toggle:checked { outline: solid 1px rgba( 0, 80, 200, 0.98 ); background: linear-gradient( 0deg, #0177fb 0%, #0177fb 100% );}f-element input[type='checkbox'].toggle:checked:after { transform: translatex(25px);}f-element.auto-height { display: table;}f-element textarea { width: calc( 100% - 18px ); padding-top: 4px; padding-left: 7px; padding-right: 7px; margin-top: 2px; margin-left: 2px; height: calc( 100% - 8px ); max-height: 300px; border-radius: 2px; resize: none;}f-element.auto-height textarea { resize: auto;}f-element select { width: 100%; margin-top: 2px; margin-bottom: 2px; margin-left: 2px; margin-right: 2px; padding-left: 5px; cursor: pointer; box-shadow: inset 0px 1px 1px rgb(0 0 0 / 20%), 0px 1px 0px rgb(255 255 255 / 5%);}f-element f-toolbar { position: absolute; display: flex; float: right; right: 7px; top: 0; width: 100%; height: 100%; justify-content: end; align-content: space-around;}f-element f-toolbar span { margin-top: auto; margin-bottom: auto; margin-left: 3px; margin-right: 3px; font-size: 18px; line-height: 18px;}f-element f-toolbar span.button { opacity: .7; cursor: pointer;}f-element f-toolbar span.button:hover { opacity: 1;}f-element input.range-value { width: 60px; text-align: center;}f-element button { width: 100%; height: calc( 100% - 4px ); margin-left: 2px; margin-right: 2px; margin-top: 2px; border-radius: 3px; border: 1px solid #7e7e7e99; cursor: pointer;}f-element button:hover { color: #fff; background-color: #2a2a2a;}f-element button:active { background: rgba( 0, 0, 0, 0.6 ); border: 1px solid rgba( 0, 120, 255, 0.98 );}f-element f-inputs,f-element f-subinputs { display: flex; width: 100%;}f-element f-inputs { padding-left: 30px;}f-element f-label, f-element span { text-shadow: 1px 1px 0px #0007; margin: auto; padding-left: 4px;}f-element f-label.center { width: 100%; text-align: center; display: block;}f-element f-label:first-child { width: 120px;}f-element.title { height: 30px; background-color: #014fc5; cursor: all-scroll; border-top-left-radius: 6px; border-top-right-radius: 6px;}f-element.title.left { text-align: left; display: inline-grid; justify-content: start;}f-element.title span { text-align: center; font-size: 15px; font-weight: bolder;}f-element.title.left span { text-align: left;}f-element f-io { border: 2px solid #dadada; width: 7px; height: 7px; position: absolute; background: #242427; border-radius: 8px; float: left; left: -7px; top: calc( 50% - 5px ); cursor: alias; box-shadow: 0 0 3px 2px #0000005e;}f-element f-io:hover { border: 2px solid #0177fb; zoom: 1.4;}f-element f-io.output { float: right; right: -7px; left: unset;}f-element textarea::-webkit-scrollbar { width: 6px;}f-element textarea::-webkit-scrollbar-track { background: #111; } f-element textarea::-webkit-scrollbar-thumb { background: #0177fb; }f-element textarea::-webkit-scrollbar-thumb:hover { background: #1187ff; }f-element.small { height: 18px;}f-element.large { height: 36px;}f-node.rounded f-element,f-node.rounded f-element.title.left { border-radius: 10px 5px 10px 5px;}f-node.rounded f-element input, f-node.rounded f-element select,f-node.rounded f-element button,f-node.rounded f-element textarea,f-node.rounded f-element input[type='checkbox'].toggle,f-node.rounded f-element input[type='checkbox'].toggle:after { border-radius: 20px 10px;}f-node.rounded f-element input { padding-left: 7px; padding-right: 7px;}f-node.glass f-element { background-color: rgb(48 48 48 / 75%); backdrop-filter: blur(3px);}f-node.glass f-element input,f-node.glass f-element select,f-node.glass f-element button,f-node.glass f-element textarea { background-color: rgb(20 20 20 / 85%);}f-node.glass f-element.title { background-color: #065ad9de;}` );

const draggableDOM = ( dom, callback = null ) => {

	let dragData = null;

	const onMouseDown = ( e ) => {

		dragData = {
			client: { x: e.clientX, y: e.clientY },
			delta: { x: 0, y: 0 },
			start: { x: dom.offsetLeft, y: dom.offsetTop },
			dragging: false
		};

		window.addEventListener( "mousemove", onGlobalMouseMove );
		window.addEventListener( "mouseup", onGlobalMouseUp );

	};

	const onGlobalMouseMove = ( e ) => {

		const { start, delta, client } = dragData;

		delta.x = e.clientX - client.x;
		delta.y = e.clientY - client.y;

		dragData.x = start.x + delta.x;
		dragData.y = start.y + delta.y;

		if ( dragData.dragging === true ) {

			e.preventDefault();

			if ( callback !== null ) {

				callback( dragData );

			} else {

				dom.style.cssText += `; left: ${ dragData.x }px; top: ${ dragData.y }px;`;

			}

		} else {

			if ( Math.abs( delta.x ) > 1 || Math.abs( delta.y ) > 1 ) {

				dragData.dragging = true;

			}

		}

	};

	const onGlobalMouseUp = () => {

		window.removeEventListener( "mousemove", onGlobalMouseMove );
		window.removeEventListener( "mouseup", onGlobalMouseUp );

		if ( dragData.dragging === true ) {

			dragData.dragging = false;

			if ( callback !== null ) {

				callback( dragData );

			} else {

				dom.removeEventListener( 'mousedown', onMouseDown );

			}

		}

	};

	dom.addEventListener( 'mousedown', onMouseDown );

};

const dispatchEventList = ( list, ...params ) => {

	for ( const callback of list ) {

		callback( ...params );

	}

};

const toPX = ( val ) => {

	if ( isNaN( val ) === false ) {

		val = `${ val }px`;

	}

	return val;

};

const toHex = ( val ) => {

	if ( isNaN( val ) === false ) {

		val = `#${ val.toString( 16 ).padStart( 6, '0' ) }`;

	}

	return val;

};

var Utils = /*#__PURE__*/Object.freeze({
	__proto__: null,
	draggableDOM: draggableDOM,
	dispatchEventList: dispatchEventList,
	toPX: toPX,
	toHex: toHex
});

class Element {

	constructor() {

		this.dom = document.createElement( 'f-element' );

	}

	add( input ) {

		this.dom.appendChild( input.dom );

		return this;

	}

	setHeight( val ) {

		this.dom.style.height = toPX( val );

		return this;

	}

	getHeight() {

		return this.style.height;

	}

}

class Input extends EventTarget {

	constructor( dom ) {

		super();

		this.dom = dom;

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

	onChange( callback ) {

		this.events.change.push( callback );

		return this;

	}

	onClick( callback ) {

		this.events.click.push( callback );

		return this;

	}

	set value( value ) {

		this.dom.value = value;

	}

	get value() {

		return this.dom.value;

	}

}

class Node {

	constructor() {

		this.dom = document.createElement( 'f-node' );

		this.style = 'rounded';
		this.align = '';

		this._updateClass();

	}

	setPosition( x, y ) {

		this.dom.style.cssText += `; left: ${ x }px; top: ${ y }px;`;

		return this;

	}

	setStyle( style ) {

		this.style = style;

		this._updateClass();

		return this;

	}

	setAlign( align ) {

		this.align = align;

		this._updateClass();

		return this;

	}

	setWidth( val ) {

		this.dom.style.width = toPX( val );

		return this;

	}

	getWidth() {

		return this.dom.style.width;

	}

	add( element ) {

		element.node = this;

		this.dom.appendChild( element.dom );

		return this;

	}

	_updateClass() {

		this.dom.className = `${ this.style } ${ this.align }`;

	}

}

class DraggableElement extends Element {

	constructor( dragabble = true ) {

		super();

		this.dragabble = dragabble;

		this.dom.onmousedown = () => {

			if ( dragabble === true ) {

				draggableDOM( this.node.dom );

			}

		};

	}

}

class LabelElement extends Element {

	constructor( label = '' ) {

		super();

		this.labelDOM = document.createElement( 'f-label' );
		this.inputsDOM = document.createElement( 'f-inputs' );

		this.dom.appendChild( this.labelDOM );
		this.dom.appendChild( this.inputsDOM );

		this.setLabel( label );

	}

	add( input ) {

		this.inputsDOM.appendChild( input.dom );

		return this;

	}

	setLabel( val ) {

		this.labelDOM.innerText = val;

	}

	getLabel() {

		return this.labelDOM.innerText;

	}

}

class TitleElement extends DraggableElement {

	constructor( title, dragabble = true ) {

		super( dragabble );

		this.dom.className = 'title';

		const span = document.createElement( 'span' );
		span.innerText = title;

		this.dom.appendChild( span );

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

		const dispatchEvent = ( type ) => {

			this.dispatchEvent( new Event( type ) );

		};

		dom.onblur = () => {

			dispatchEvent( 'blur' );

		};

		dom.onkeydown = ( e ) => {

			if ( e.key.length === 1 && /\d|\/./.test( e.key ) !== true ) {

				return false;

			}

			dispatchEvent( 'change' );

			if ( e.keyCode === ENTER_KEY$1 ) {

				e.target.blur();

			}

			e.stopPropagation();

		};

		draggableDOM( dom, ( data ) => {

			const { delta } = data;

			if ( data.value === undefined ) {

				data.value = this.value;

			}

			const diff = delta.x - delta.y;

			const value = data.value + ( diff * this.step );

			this.dom.value = this._getString( value.toFixed( this.precision ) );

			dispatchEvent( 'change' );

		} );

	}

	setRange( min, max, step ) {

		this.min = min;
		this.max = max;
		this.step = step;

	}

	get precision() {

		if ( this.integer === true ) return 0;

		const fract = this.step % 1;

		return fract !== 0 ? fract.toString().split( '.' )[ 1 ].length : 1;

	}

	set value( val ) {

		this.dom.value = this._getString( val );

	}

	get value() {

		return Number( this.dom.value );

	}

	_getString( value ) {

		let num = Math.min( Math.max( Number( value ), this.min ), this.max );

		if ( this.integer === true ) {

			return Math.floor( num );

		} else {

			return num + ( num % 1 ? '' : '.0' );

		}

	}

}

class SliderInput extends Input {

	constructor( value = 0, min = 0, max = 100 ) {

		const dom = document.createElement( 'f-subinputs' );
		super( dom );

		value = Math.min( Math.max( value, min ), max );

		const sensibility = .001;
		const step = ( max - min ) * sensibility;

		const rangeDOM = document.createElement( 'input' );
		rangeDOM.type = 'range';
		rangeDOM.min = min;
		rangeDOM.max = max;
		rangeDOM.step = step;
		rangeDOM.value = value;

		const field = new NumberInput( value, min, max, step );
		field.dom.className = 'range-value';
		field.onChange( () => {

			rangeDOM.value = field.value;

		} );

		dom.appendChild( rangeDOM );
		dom.appendChild( field.dom );

		this.min = min;
		this.max = max;
		this.step = step;

		this.rangeDOM = rangeDOM;
		this.field = field;

		const dispatchEvent = ( type ) => {

			this.dispatchEvent( new Event( type ) );

		};

		const updateRangeValue = () => {

			let value = Number( rangeDOM.value );

			if ( value !== this.max && value + this.step >= this.max ) {

				// fix not end range fraction

				rangeDOM.value = value = this.max;

			}

			this.field.value = value;

		};

		const onGlobalMouseMove = ( ) => {

			updateRangeValue();

			dispatchEvent( 'change' );

		};

		const onGlobalMouseUp = () => {

			updateRangeValue();

			window.removeEventListener( "mousemove", onGlobalMouseMove );
			window.removeEventListener( "mouseup", onGlobalMouseUp );

		};

		rangeDOM.onmousedown = () => {

			updateRangeValue();

			window.addEventListener( "mousemove", onGlobalMouseMove );
			window.addEventListener( "mouseup", onGlobalMouseUp );

		};

	}

	set value( val ) {

		this.field.value = val;
		this.rangeDOM.value = this.field.value;

	}

	get value() {

		return this.field.value;

	}

}

const fromProperty$1 = ( object, property, ...params ) => {

	const ref = object[ property ];
	const type = typeof ref;

	let input = null;

	if ( type === 'number' ) {

		if ( params.length > 0 ) {

			input = new SliderInput( ref, ...params );
			input.onChange( () => {

				object[ property ] = input.value;

			} );

		} else {

			input = new NumberInput( ref );
			input.onChange( () => {

				object[ property ] = input.value;

			} );

		}

	}

	return input;

};

class PropertyInput extends Input {

	constructor( object, property, ...params ) {

		const dom = document.createElement( 'f-subinputs' );
		super( dom );

		const field = fromProperty$1( object, property, ...params );

		this.object = object;
		this.property = property;
		this.field = field;

		dom.appendChild( field.dom );

	}

}

const fromProperty = ( object, property, ...params ) => {

	const element = new LabelElement( property );
	element.add( new PropertyInput( object, property, ...params ) );

	return element;

};

class ButtonInput extends Input {

	constructor( innterText = '' ) {

		const dom = document.createElement( 'button' );
		super( dom );

		dom.innerText = innterText;

		const dispatchEvent = ( type ) => {

			this.dispatchEvent( new Event( type ) );

		};

		dom.onclick = () => {

			dispatchEvent( 'click' );

		};

	}

	onChange( callback ) {

		this.changeEvents.push( callback );

		return this;

	}

	set innterText( val ) {

		this.dom.innerText = val;

	}

	get innterText() {

		return this.dom.innerText;

	}

}

class ColorInput extends Input {

	constructor( value = 0x0099ff ) {

		const dom = document.createElement( 'input' );
		super( dom );

		dom.type = 'color';
		dom.value = toHex( value );

	}

}

class SelectInput extends Input {

	constructor( options = [] ) {

		const dom = document.createElement( 'select' );
		super( dom );

		const dispatchEvent = ( type ) => {

			this.dispatchEvent( new Event( type ) );

		};

		dom.onchange = () => {

			dispatchEvent( 'change' );

		};

		this.options = options;

	}

	set options( list ) {

		const dom = this.dom;

		this._options = list;

		dom.innerHTML = '';

		for ( let index = 0; index < list.length; index ++ ) {

			let opt = list[ index ];

			if ( typeof opt === 'string' ) {

				opt = { name: opt, value: index };

			}

			const option = document.createElement( 'option' );
			option.innerText = opt.name;
			option.value = opt.value;

			dom.appendChild( option );

		}

	}

	get options() {

		return this._options;

	}

}

const ENTER_KEY = 13;

class StringInput extends Input {

	constructor( value = '' ) {

		const dom = document.createElement( 'input' );
		super( dom );

		dom.type = 'text';
		dom.value = value;
		dom.spellcheck = false;
		dom.autocomplete = 'off';

		const dispatchEvent = ( type ) => {

			this.dispatchEvent( new Event( type ) );

		};

		dom.onblur = () => {

			dispatchEvent( 'blur' );

		};

		dom.onchange = () => {

			dispatchEvent( 'change' );

		};

		dom.onkeydown = ( e ) => {

			if ( e.keyCode === ENTER_KEY ) {

				e.target.blur();

			}

			e.stopPropagation();

		};

	}

}

class TextInput extends Input {

	constructor( innerText = '' ) {

		const dom = document.createElement( 'textarea' );
		super( dom );

		dom.innerText = innerText;

	}

	set value( val ) {

		this.dom.innerText = val;

	}

	get value() {

		return this.dom.innerText;

	}

}

class ToggleInput extends Input {

	constructor( value = false ) {

		const dom = document.createElement( 'input' );
		super( dom );

		dom.type = 'checkbox';
		dom.className = 'toggle';
		dom.checked = value;

	}

	set value( val ) {

		this.dom.checked = val;

	}

	get value() {

		return this.dom.checked;

	}

}

export { ButtonInput, ColorInput, DraggableElement, Element, Input, LabelElement, Node, NumberInput, PropertyInput, SelectInput, SliderInput, StringInput, TextInput, TitleElement, ToggleInput, Utils, fromProperty };
