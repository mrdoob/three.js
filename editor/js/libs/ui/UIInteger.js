import { UIElement } from './UIElement.js';

var UIInteger = function ( number ) {

	UIElement.call( this );

	var scope = this;

	var dom = document.createElement( 'input' );
	dom.className = 'Number';
	dom.value = '0';

	dom.addEventListener( 'keydown', function ( event ) {

		event.stopPropagation();

	}, false );

	this.value = 0;

	this.min = - Infinity;
	this.max = Infinity;

	this.step = 1;

	this.dom = dom;

	this.setValue( number );

	var changeEvent = document.createEvent( 'HTMLEvents' );
	changeEvent.initEvent( 'change', true, true );

	var distance = 0;
	var onMouseDownValue = 0;

	var pointer = [ 0, 0 ];
	var prevPointer = [ 0, 0 ];

	function onMouseDown( event ) {

		event.preventDefault();

		distance = 0;

		onMouseDownValue = scope.value;

		prevPointer = [ event.clientX, event.clientY ];

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseMove( event ) {

		var currentValue = scope.value;

		pointer = [ event.clientX, event.clientY ];

		distance += ( pointer[ 0 ] - prevPointer[ 0 ] ) - ( pointer[ 1 ] - prevPointer[ 1 ] );

		var value = onMouseDownValue + ( distance / ( event.shiftKey ? 5 : 50 ) ) * scope.step;
		value = Math.min( scope.max, Math.max( scope.min, value ) ) | 0;

		if ( currentValue !== value ) {

			scope.setValue( value );
			dom.dispatchEvent( changeEvent );

		}

		prevPointer = [ event.clientX, event.clientY ];

	}

	function onMouseUp() {

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		if ( Math.abs( distance ) < 2 ) {

			dom.focus();
			dom.select();

		}

	}

	function onChange() {

		scope.setValue( dom.value );

	}

	function onFocus() {

		dom.style.backgroundColor = '';
		dom.style.cursor = '';

	}

	function onBlur() {

		dom.style.backgroundColor = 'transparent';
		dom.style.cursor = 'col-resize';

	}

	onBlur();

	dom.addEventListener( 'mousedown', onMouseDown, false );
	dom.addEventListener( 'change', onChange, false );
	dom.addEventListener( 'focus', onFocus, false );
	dom.addEventListener( 'blur', onBlur, false );

	return this;

};

UIInteger.prototype = Object.create( UIElement.prototype );
UIInteger.prototype.constructor = UIInteger;

UIInteger.prototype.getValue = function () {

	return this.value;

};

UIInteger.prototype.setValue = function ( value ) {

	if ( value !== undefined ) {

		value = parseInt( value );

		this.value = value;
		this.dom.value = value;

	}

	return this;

};

UIInteger.prototype.setStep = function ( step ) {

	this.step = parseInt( step );

	return this;

};

UIInteger.prototype.setRange = function ( min, max ) {

	this.min = min;
	this.max = max;

	return this;

};

export { UIInteger };