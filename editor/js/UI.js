var UI = {};

UI.Element = function () {};

UI.Element.prototype = {

	setClass: function ( name ) {

		this.dom.className = name;

		return this;

	},

	// styles

	setStyle: function ( style, array ) {

		for ( var i = 0; i < array.length; i ++ ) {

			this.dom.style[ style ] = array[ i ];

		}

	},

	setLeft: function () {

		this.setStyle( 'left', arguments );

		return this;

	},

	setTop: function () {

		this.setStyle( 'top', arguments );

		return this;

	},

	setRight: function () {

		this.setStyle( 'right', arguments );

		return this;

	},

	setBottom: function () {

		this.setStyle( 'bottom', arguments );

		return this;

	},

	setWidth: function () {

		this.setStyle( 'width', arguments );

		return this;

	},

	setHeight: function () {

		this.setStyle( 'height', arguments );

		return this;

	},

	//

	setBorder: function () {

		this.setStyle( 'border', arguments );

		return this;

	},

	setBorderTop: function () {

		this.setStyle( 'borderTop', arguments );

		return this;

	},

	setBorderBottom: function () {

		this.setStyle( 'borderBottom', arguments );

		return this;

	},

	setBorderLeft: function () {

		this.setStyle( 'borderLeft', arguments );

		return this;

	},

	setBorderRight: function () {

		this.setStyle( 'borderRight', arguments );

		return this;

	},

	//

	setMargin: function () {

		this.setStyle( 'margin', arguments );

		return this;

	},

	setMarginTop: function () {

		this.setStyle( 'marginTop', arguments );

		return this;

	},

	setMarginBottom: function () {

		this.setStyle( 'marginBottom', arguments );

		return this;

	},

	setMarginLeft: function () {

		this.setStyle( 'marginLeft', arguments );

		return this;

	},

	setMarginRight: function () {

		this.setStyle( 'marginRight', arguments );

		return this;

	},

	//

	setPadding: function () {

		this.setStyle( 'padding', arguments );

		return this;

	},

	//

	setFloat: function () {

		this.setStyle( 'float', arguments );

		return this;

	},

	//

	setFontSize: function () {

		this.setStyle( 'fontSize', arguments );

		return this;

	},

	setFontWeight: function () {

		this.setStyle( 'fontWeight', arguments );

		return this;

	},

	//

	setColor: function () {

		this.setStyle( 'color', arguments );

		return this;

	},

	setBackgroundColor: function () {

		this.setStyle( 'backgroundColor', arguments );

		return this;

	},

	setDisplay: function () {

		this.setStyle( 'display', arguments );

		return this;

	},

	setOverflow: function () {

		this.setStyle( 'overflow', arguments );

		return this;

	},

	//

	setCursor: function () {

		this.setStyle( 'cursor', arguments );

		return this;

	},

	// content

	setTextContent: function ( value ) {

		this.dom.textContent = value;

		return this;

	},

	// events

	onMouseOver: function ( callback ) {

		this.dom.addEventListener( 'mouseover', callback, false );

		return this;

	},

	onMouseOut: function ( callback ) {

		this.dom.addEventListener( 'mouseout', callback, false );

		return this;

	},

	onClick: function ( callback ) {

		this.dom.addEventListener( 'click', callback, false );

		return this;

	}

}


// Panel

UI.Panel = function ( position ) {

	UI.Element.call( this );

	var dom = document.createElement( 'div' );
	dom.style.position = position || 'relative';
	dom.style.marginBottom = '10px';

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


// Text

UI.Text = function ( position ) {

	UI.Element.call( this );

	var dom = document.createElement( 'span' );
	dom.style.position = position || 'relative';
	dom.style.cursor = 'default';

	this.dom = dom;

	return this;

};

UI.Text.prototype = Object.create( UI.Element.prototype );

UI.Text.prototype.setValue = function ( value ) {

	this.dom.textContent = value;

	return this;

};


// Input

UI.Input = function ( position ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'input' );
	dom.style.position = position || 'relative';
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


// Select

UI.Select = function ( position ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'select' );
	dom.style.position = position || 'relative';
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

UI.FancySelect = function ( position ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'div' );
	dom.style.position = position || 'relative';
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

UI.Checkbox = function ( position ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'input' );
	dom.type = 'checkbox';
	dom.style.position = position || 'relative';

	this.dom = dom;

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

	this.dom.checked = value;

	return this;

};

UI.Checkbox.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};


// Color

UI.Color = function ( position ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'input' );
	dom.type = 'color';
	dom.style.position = position || 'relative';
	dom.style.width = '64px';
	dom.style.height = '16px';
	dom.style.border = '0px';
	dom.style.padding = '0px';
	dom.style.backgroundColor = 'transparent';

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

UI.Number = function ( position ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'input' );
	dom.style.position = position || 'relative';
	dom.style.color = '#0080f0';
	dom.style.fontSize = '12px';
	dom.style.backgroundColor = 'transparent';
	dom.style.border = '1px solid transparent';
	dom.style.marginTop = '-2px';
	dom.style.marginLegt = '-2px';
	dom.style.padding = '2px';
	dom.style.cursor = 'col-resize';
	dom.value = '0.00';

	this.dom = dom;

	this.min = - Infinity;
	this.max = Infinity;

	this.precision = 2;
	this.step = 1;

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

		var movementX = event.movementX || event.webkitMovementX || event.mozMovementX || 0;
		var movementY = event.movementY || event.webkitMovementY || event.mozMovementY || 0;

		distance += movementX - movementY;

		var number = onMouseDownValue + ( distance / ( event.shiftKey ? 10 : 100 ) ) * scope.step;

		dom.value = Math.min( scope.max, Math.max( scope.min, number ) ).toFixed( scope.precision );

		if ( scope.onChangeCallback ) scope.onChangeCallback();

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

	this.dom.value = value.toFixed( this.precision );

	return this;

};

UI.Number.prototype.setRange = function ( min, max ) {

	this.min = min;
	this.max = max;

	return this;

};

UI.Number.prototype.setPrecision = function ( precision ) {

	this.precision = precision;

	if ( precision > 2 ) {

		this.step = Math.pow( 10, -( precision - 1 ) );

	}

	return this;

};

UI.Number.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};


// Break

UI.Break = function () {

	UI.Element.call( this );

	var dom = document.createElement( 'br' );

	this.dom = dom;

	return this;

};

UI.Break.prototype = Object.create( UI.Element.prototype );


// HorizontalRule

UI.HorizontalRule = function ( position ) {

	UI.Element.call( this );

	var dom = document.createElement( 'hr' );
	dom.style.position = position || 'relative';

	this.dom = dom;

	return this;

};

UI.HorizontalRule.prototype = Object.create( UI.Element.prototype );


// Button

UI.Button = function ( position ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'button' );
	dom.style.position = position || 'relative';

	this.dom = dom;

	this.onClickCallback = null;

	this.dom.addEventListener( 'click', function ( event ) {

		scope.onClickCallback();

	}, false );

	return this;

};

UI.Button.prototype = Object.create( UI.Element.prototype );

UI.Button.prototype.setLabel = function ( value ) {

	this.dom.textContent = value;

	return this;

};

UI.Button.prototype.onClick = function ( callback ) {

	this.onClickCallback = callback;

	return this;

};
