var UI = {};

UI.Element = function () {};

UI.Element.prototype = {

	setClass: function ( name ) {

		this.dom.className = name;

		return this;

	},

	setStyle: function ( style, array ) {

		for ( var i = 0; i < array.length; i ++ ) {

			this.dom.style[ style ] = array[ i ];

		}

	},

	setTextContent: function ( value ) {

		this.dom.textContent = value;

		return this;

	}

}

// properties

var properties = [ 'position', 'left', 'top', 'right', 'bottom', 'width', 'height', 'border', 'borderLeft',
'borderTop', 'borderRight', 'borderBottom', 'borderColor', 'display', 'overflow', 'margin', 'marginLeft', 'marginTop', 'marginRight', 'marginBottom', 'padding', 'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'color',
'backgroundColor', 'opacity', 'fontSize', 'fontWeight', 'textTransform', 'cursor' ];

properties.forEach( function ( property ) {

	var method = 'set' + property.substr( 0, 1 ).toUpperCase() + property.substr( 1, property.length );

	UI.Element.prototype[ method ] = function () {

		this.setStyle( property, arguments );
		return this;

	};

} );

// events

var events = [ 'MouseOver', 'MouseOut', 'Click' ];

events.forEach( function ( event ) {

	var method = 'on' + event;

	UI.Element.prototype[ method ] = function ( callback ) {

		this.dom.addEventListener( event.toLowerCase(), callback, false );
		return this;

	};

} );


// Panel

UI.Panel = function () {

	UI.Element.call( this );

	var dom = document.createElement( 'div' );
	dom.className = 'Panel';
	dom.style.userSelect = 'none';
	dom.style.WebkitUserSelect = 'none';
	dom.style.MozUserSelect = 'none';

	this.dom = dom;

	return this;
};

UI.Panel.prototype = Object.create( UI.Element.prototype );

UI.Panel.prototype.add = function () {

	for ( var i = 0; i < arguments.length; i ++ ) {

		this.dom.appendChild( arguments[ i ].dom );

	}

	return this;

};


UI.Panel.prototype.remove = function () {

	for ( var i = 0; i < arguments.length; i ++ ) {

		this.dom.removeChild( arguments[ i ].dom );

	}

	return this;

};

// Text

UI.Text = function ( text ) {

	UI.Element.call( this );

	var dom = document.createElement( 'span' );
	dom.className = 'Text';
	dom.style.cursor = 'default';
	dom.style.display = 'inline-block';
	dom.style.verticalAlign = 'top';

	this.dom = dom;
	this.setValue( text );

	return this;

};

UI.Text.prototype = Object.create( UI.Element.prototype );

UI.Text.prototype.setValue = function ( value ) {

	if ( value !== undefined ) {

		this.dom.textContent = value;

	}

	return this;

};


// Input

UI.Input = function () {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'input' );
	dom.className = 'Input';
	dom.style.padding = '2px';
	dom.style.marginTop = '-2px';
	dom.style.marginLeft = '-2px';
	dom.style.border = '1px solid #ccc';

	this.dom = dom;

	this.onChangeCallback = null;

	this.dom.addEventListener( 'change', function ( event ) {

		if ( scope.onChangeCallback ) scope.onChangeCallback();

	}, false );

	return this;

};

UI.Input.prototype = Object.create( UI.Element.prototype );

UI.Input.prototype.getValue = function () {

	return this.dom.value;

};

UI.Input.prototype.setValue = function ( value ) {

	this.dom.value = value;

	return this;

};

UI.Input.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};


// TextArea

UI.TextArea = function () {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'textarea' );
	dom.className = 'TextArea';
	dom.style.padding = '2px';
	dom.style.marginTop = '-2px';
	dom.style.marginLeft = '-2px';
	dom.style.border = '1px solid #ccc';

	this.dom = dom;

	this.onChangeCallback = null;

	this.dom.addEventListener( 'keyup', function ( event ) {

		if ( scope.onKeyUpCallback ) scope.onKeyUpCallback();

	}, false );

	this.dom.addEventListener( 'change', function ( event ) {

		if ( scope.onChangeCallback ) scope.onChangeCallback();

	}, false );

	return this;

};

UI.TextArea.prototype = Object.create( UI.Element.prototype );

UI.TextArea.prototype.getValue = function () {

	return this.dom.value;

};

UI.TextArea.prototype.setValue = function ( value ) {

	this.dom.value = value;

	return this;

};

UI.TextArea.prototype.onKeyUp = function ( callback ) {

	this.onKeyUpCallback = callback;

	return this;

};

UI.TextArea.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};


// Select

UI.Select = function () {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'select' );
	dom.className = 'Select';
	dom.style.width = '64px';
	dom.style.height = '16px';
	dom.style.border = '0px';
	dom.style.padding = '0px';

	this.dom = dom;

	this.onChangeCallback = null;

	this.dom.addEventListener( 'change', function ( event ) {

		if ( scope.onChangeCallback ) scope.onChangeCallback();

	}, false );

	return this;

};

UI.Select.prototype = Object.create( UI.Element.prototype );

UI.Select.prototype.setMultiple = function ( boolean ) {

	this.dom.multiple = boolean;

	return this;

};

UI.Select.prototype.setOptions = function ( options ) {

	while ( this.dom.children.length > 0 ) {

		this.dom.removeChild( this.dom.firstChild );

	}

	for ( var key in options ) {

		var option = document.createElement( 'option' );
		option.value = key;
		option.innerHTML = options[ key ];
		this.dom.appendChild( option );

	}

	return this;

};

UI.Select.prototype.getValue = function () {

	return this.dom.value;

};

UI.Select.prototype.setValue = function ( value ) {

	this.dom.value = value;

	return this;

};

UI.Select.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};

// FancySelect

UI.FancySelect = function () {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'div' );
	dom.className = 'FancySelect';
	dom.style.background = '#fff';
	dom.style.border = '1px solid #ccc';
	dom.style.padding = '0';
	dom.style.cursor = 'default';
	dom.style.overflow = 'auto';

	this.dom = dom;

	this.onChangeCallback = null;

	this.options = [];
	this.selectedValue = null;

	return this;

};

UI.FancySelect.prototype = Object.create( UI.Element.prototype );

UI.FancySelect.prototype.setOptions = function ( options ) {

	var scope = this;

	while ( scope.dom.children.length > 0 ) {

		scope.dom.removeChild( scope.dom.firstChild );

	}

	scope.options = [];

	var generateOptionCallback = function ( element, value ) {

		return function ( event ) {

			for ( var i = 0; i < scope.options.length; i ++ ) {

				scope.options[ i ].style.backgroundColor = '#f0f0f0';

			}

			element.style.backgroundColor = '#f0f0f0';

			scope.selectedValue = value;

			if ( scope.onChangeCallback ) scope.onChangeCallback();

		}

	};

	for ( var key in options ) {

		var option = document.createElement( 'div' );
		option.style.padding = '4px';
		option.style.whiteSpace = 'nowrap';
		option.innerHTML = options[ key ];
		option.value = key;
		scope.dom.appendChild( option );

		scope.options.push( option );
		option.addEventListener( 'click', generateOptionCallback( option, key ), false );

	}

	return scope;

};

UI.FancySelect.prototype.getValue = function () {

	return this.selectedValue;

};

UI.FancySelect.prototype.setValue = function ( value ) {

	// must convert raw value into string for compatibility with UI.Select
	// which uses string values (initialized from options keys)

	var key = value ? value.toString() : value;

	for ( var i = 0; i < this.options.length; i ++ ) {

		var element = this.options[ i ];

		if ( element.value === key ) {

			element.style.backgroundColor = '#f0f0f0';

		} else {

			element.style.backgroundColor = '';

		}

	}

	this.selectedValue = value;

	return this;

};

UI.FancySelect.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};

// Checkbox

UI.Checkbox = function ( boolean ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'input' );
	dom.className = 'Checkbox';
	dom.type = 'checkbox';

	this.dom = dom;
	this.setValue( boolean );

	this.onChangeCallback = null;

	this.dom.addEventListener( 'change', function ( event ) {

		if ( scope.onChangeCallback ) scope.onChangeCallback();

	}, false );

	return this;

};

UI.Checkbox.prototype = Object.create( UI.Element.prototype );

UI.Checkbox.prototype.getValue = function () {

	return this.dom.checked;

};

UI.Checkbox.prototype.setValue = function ( value ) {

	if ( value !== undefined ) {

		this.dom.checked = value;

	}

	return this;

};

UI.Checkbox.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};


// Color

UI.Color = function () {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'input' );
	dom.className = 'Color';
	dom.style.width = '64px';
	dom.style.height = '16px';
	dom.style.border = '0px';
	dom.style.padding = '0px';
	dom.style.backgroundColor = 'transparent';

	try { dom.type = 'color'; } catch ( exception ) {}

	this.dom = dom;

	this.onChangeCallback = null;

	this.dom.addEventListener( 'change', function ( event ) {

		if ( scope.onChangeCallback ) scope.onChangeCallback();

	}, false );

	return this;

};

UI.Color.prototype = Object.create( UI.Element.prototype );

UI.Color.prototype.getValue = function () {

	return this.dom.value;

};

UI.Color.prototype.getHexValue = function () {

	return parseInt( this.dom.value.substr( 1 ), 16 );

};

UI.Color.prototype.setValue = function ( value ) {

	this.dom.value = value;

	return this;

};

UI.Color.prototype.setHexValue = function ( hex ) {

	this.dom.value = "#" + ( '000000' + hex.toString( 16 ) ).slice( -6 );

	return this;

};

UI.Color.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};


// Number

UI.Number = function ( number ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'input' );
	dom.className = 'Number';
	dom.style.color = '#0080f0';
	dom.style.fontSize = '12px';
	dom.style.backgroundColor = 'transparent';
	dom.style.border = '1px solid transparent';
	dom.style.marginTop = '-2px';
	dom.style.marginLegt = '-2px';
	dom.style.padding = '2px';
	dom.style.cursor = 'col-resize';
	dom.value = '0.00';

	this.min = - Infinity;
	this.max = Infinity;

	this.precision = 2;
	this.step = 1;

	this.dom = dom;
	this.setValue( number );

	this.onChangeCallback = null;

	var distance = 0;
	var onMouseDownValue = 0;

	var onMouseDown = function ( event ) {

		event.preventDefault();

		distance = 0;

		onMouseDownValue = parseFloat( dom.value );

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	};

	var onMouseMove = function ( event ) {

		var currentValue = dom.value;

		var movementX = event.movementX || event.webkitMovementX || event.mozMovementX || 0;
		var movementY = event.movementY || event.webkitMovementY || event.mozMovementY || 0;

		distance += movementX - movementY;

		var number = onMouseDownValue + ( distance / ( event.shiftKey ? 5 : 50 ) ) * scope.step;

		dom.value = Math.min( scope.max, Math.max( scope.min, number ) ).toFixed( scope.precision );

		if ( currentValue !== dom.value && scope.onChangeCallback ) scope.onChangeCallback();

	};

	var onMouseUp = function ( event ) {

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		if ( Math.abs( distance ) < 2 ) {

			dom.focus();
			dom.select();

		}

	};

	var onChange = function ( event ) {

		var number = parseFloat( dom.value );

		if ( isNaN( number ) === false ) {

			dom.value = number;

			if ( scope.onChangeCallback ) scope.onChangeCallback();

		}

	};

	var onFocus = function ( event ) {

		dom.style.backgroundColor = '';
		dom.style.borderColor = '#ccc';
		dom.style.cursor = '';

	};

	var onBlur = function ( event ) {

		dom.style.backgroundColor = 'transparent';
		dom.style.borderColor = 'transparent';
		dom.style.cursor = 'col-resize';

	};

	dom.addEventListener( 'mousedown', onMouseDown, false );
	dom.addEventListener( 'change', onChange, false );
	dom.addEventListener( 'focus', onFocus, false );
	dom.addEventListener( 'blur', onBlur, false );

	return this;

};

UI.Number.prototype = Object.create( UI.Element.prototype );

UI.Number.prototype.getValue = function () {

	return parseFloat( this.dom.value );

};

UI.Number.prototype.setValue = function ( value ) {

	if ( value !== undefined ) {

		this.dom.value = value.toFixed( this.precision );

	}

	return this;

};

UI.Number.prototype.setRange = function ( min, max ) {

	this.min = min;
	this.max = max;

	return this;

};

UI.Number.prototype.setPrecision = function ( precision ) {

	this.precision = precision;

	return this;

};

UI.Number.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};


// Integer

UI.Integer = function ( number ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'input' );
	dom.className = 'Number';
	dom.style.color = '#0080f0';
	dom.style.fontSize = '12px';
	dom.style.backgroundColor = 'transparent';
	dom.style.border = '1px solid transparent';
	dom.style.marginTop = '-2px';
	dom.style.marginLegt = '-2px';
	dom.style.padding = '2px';
	dom.style.cursor = 'col-resize';
	dom.value = '0.00';

	this.min = - Infinity;
	this.max = Infinity;

	this.step = 1;

	this.dom = dom;
	this.setValue( number );

	this.onChangeCallback = null;

	var distance = 0;
	var onMouseDownValue = 0;

	var onMouseDown = function ( event ) {

		event.preventDefault();

		distance = 0;

		onMouseDownValue = parseFloat( dom.value );

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	};

	var onMouseMove = function ( event ) {

		var currentValue = dom.value;

		var movementX = event.movementX || event.webkitMovementX || event.mozMovementX || 0;
		var movementY = event.movementY || event.webkitMovementY || event.mozMovementY || 0;

		distance += movementX - movementY;

		var number = onMouseDownValue + ( distance / ( event.shiftKey ? 5 : 50 ) ) * scope.step;

		dom.value = Math.min( scope.max, Math.max( scope.min, number ) ) | 0;

		if ( currentValue !== dom.value && scope.onChangeCallback ) scope.onChangeCallback();

	};

	var onMouseUp = function ( event ) {

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		if ( Math.abs( distance ) < 2 ) {

			dom.focus();
			dom.select();

		}

	};

	var onChange = function ( event ) {

		var number = parseInt( dom.value );

		if ( isNaN( number ) === false ) {

			dom.value = number;

			if ( scope.onChangeCallback ) scope.onChangeCallback();

		}

	};

	var onFocus = function ( event ) {

		dom.style.backgroundColor = '';
		dom.style.borderColor = '#ccc';
		dom.style.cursor = '';

	};

	var onBlur = function ( event ) {

		dom.style.backgroundColor = 'transparent';
		dom.style.borderColor = 'transparent';
		dom.style.cursor = 'col-resize';

	};

	dom.addEventListener( 'mousedown', onMouseDown, false );
	dom.addEventListener( 'change', onChange, false );
	dom.addEventListener( 'focus', onFocus, false );
	dom.addEventListener( 'blur', onBlur, false );

	return this;

};

UI.Integer.prototype = Object.create( UI.Element.prototype );

UI.Integer.prototype.getValue = function () {

	return parseInt( this.dom.value );

};

UI.Integer.prototype.setValue = function ( value ) {

	if ( value !== undefined ) {

		this.dom.value = value | 0;

	}

	return this;

};

UI.Integer.prototype.setRange = function ( min, max ) {

	this.min = min;
	this.max = max;

	return this;

};

UI.Integer.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};


// Break

UI.Break = function () {

	UI.Element.call( this );

	var dom = document.createElement( 'br' );
	dom.className = 'Break';

	this.dom = dom;

	return this;

};

UI.Break.prototype = Object.create( UI.Element.prototype );


// HorizontalRule

UI.HorizontalRule = function () {

	UI.Element.call( this );

	var dom = document.createElement( 'hr' );
	dom.className = 'HorizontalRule';

	this.dom = dom;

	return this;

};

UI.HorizontalRule.prototype = Object.create( UI.Element.prototype );


// Button

UI.Button = function () {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'button' );
	dom.className = 'Button';

	this.dom = dom;

	return this;

};

UI.Button.prototype = Object.create( UI.Element.prototype );

UI.Button.prototype.setLabel = function ( value ) {

	this.dom.textContent = value;

	return this;

};
