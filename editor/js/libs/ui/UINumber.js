import { UIElement } from './UIElement.js';

var UINumber = function ( number ) {

	UIElement.call( this );

	var scope = this;

	var dom = document.createElement( 'input' );
	dom.className = 'Number';
	dom.value = '0.00';

	dom.addEventListener( 'keydown', function ( event ) {

		event.stopPropagation();

		if ( event.keyCode === 13 ) dom.blur();

	}, false );

	this.value = 0;

	this.min = - Infinity;
	this.max = Infinity;

	this.precision = 2;
	this.step = 1;
	this.unit = '';

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
		value = Math.min( scope.max, Math.max( scope.min, value ) );

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

	function onTouchStart( event ) {

		if ( event.touches.length === 1 ) {

			distance = 0;

			onMouseDownValue = scope.value;

			prevPointer = [ event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ];

			document.addEventListener( 'touchmove', onTouchMove, false );
			document.addEventListener( 'touchend', onTouchEnd, false );

		}

	}

	function onTouchMove( event ) {

		var currentValue = scope.value;

		pointer = [ event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ];

		distance += ( pointer[ 0 ] - prevPointer[ 0 ] ) - ( pointer[ 1 ] - prevPointer[ 1 ] );

		var value = onMouseDownValue + ( distance / ( event.shiftKey ? 5 : 50 ) ) * scope.step;
		value = Math.min( scope.max, Math.max( scope.min, value ) );

		if ( currentValue !== value ) {

			scope.setValue( value );
			dom.dispatchEvent( changeEvent );

		}

		prevPointer = [ event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ];

	}

	function onTouchEnd( event ) {

		if ( event.touches.length === 0 ) {

			document.removeEventListener( 'touchmove', onTouchMove, false );
			document.removeEventListener( 'touchend', onTouchEnd, false );

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
	dom.addEventListener( 'touchstart', onTouchStart, false );
	dom.addEventListener( 'change', onChange, false );
	dom.addEventListener( 'focus', onFocus, false );
	dom.addEventListener( 'blur', onBlur, false );

	return this;

};

UINumber.prototype = Object.create( UIElement.prototype );
UINumber.prototype.constructor = UINumber;

UINumber.prototype.getValue = function () {

	return this.value;

};

UINumber.prototype.setValue = function ( value ) {

	if ( value !== undefined ) {

		value = parseFloat( value );

		if ( value < this.min ) value = this.min;
		if ( value > this.max ) value = this.max;

		this.value = value;
		this.dom.value = value.toFixed( this.precision );

		if ( this.unit !== '' ) this.dom.value += ' ' + this.unit;

	}

	return this;

};

UINumber.prototype.setPrecision = function ( precision ) {

	this.precision = precision;

	return this;

};

UINumber.prototype.setStep = function ( step ) {

	this.step = step;

	return this;

};

UINumber.prototype.setRange = function ( min, max ) {

	this.min = min;
	this.max = max;

	return this;

};

UINumber.prototype.setUnit = function ( unit ) {

	this.unit = unit;

	return this;

};

export { UINumber };