var UI = {};

UI.Element = function () {};

UI.Element.prototype = {

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

	// border

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

	// margin

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

	// padding

	setPadding: function () {

		this.setStyle( 'padding', arguments );

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

	}


}


// Panel

UI.Panel = function ( position ) {

	UI.Element.call( this );

	this.dom = document.createElement( 'div' );
	this.dom.style.position = position || 'relative';
	this.dom.style.marginBottom = '10px';

	// this.dom.addEventListener( 'mousedown', function ( event ) { event.preventDefault() }, false );

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

	this.dom = document.createElement( 'span' );
	this.dom.style.position = position || 'relative';

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

	this.dom = document.createElement( 'input' );
	this.dom.style.position = position || 'relative';
	this.dom.style.marginTop = '-2px';
	this.dom.style.marginLeft = '-2px';

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

	this.dom = document.createElement( 'select' );
	this.dom.style.position = position || 'relative';
	this.dom.style.width = '64px';
	this.dom.style.height = '16px';
	this.dom.style.border = '0px';
	this.dom.style.padding = '0px';

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


// Checkbox

UI.Checkbox = function ( position ) {

	UI.Element.call( this );

	var scope = this;

	this.dom = document.createElement( 'input' );
	this.dom.type = 'checkbox';
	this.dom.style.position = position || 'relative';

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

	this.dom = document.createElement( 'input' );
	this.dom.type = 'color';
	this.dom.style.position = position || 'relative';
	this.dom.style.width = '64px';
	this.dom.style.height = '16px';
	this.dom.style.border = '0px';
	this.dom.style.padding = '0px';
	this.dom.style.backgroundColor = 'transparent';

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

UI.Color.prototype.setValue = function ( value ) {

	this.dom.value = value;

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

	this.dom = document.createElement( 'span' );
	this.dom.style.position = position || 'relative';

	var display = document.createElement( 'span' );
	display.style.color = '#0080f0';
	display.style.fontSize = '12px';
	display.style.cursor = 'col-resize';
	display.textContent = '0.00';
	this.dom.appendChild( display );

	var input = document.createElement( 'input' );
	input.style.display = 'none';
	input.style.width = '100%';
	input.style.marginTop = '-2px';
	input.style.marginLeft = '-2px';
	input.style.fontSize = '12px';
	this.dom.appendChild( input );

	this.min = - Infinity;
	this.max = Infinity;

	this.onChangeCallback = null;

	var distance = 0;
	var onMouseDownValue = 0;

	var onMouseDown = function ( event ) {

		event.preventDefault();

		distance = 0;

		onMouseDownValue = parseFloat( display.textContent );

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	};

	var onMouseMove = function ( event ) {

		var movementX = event.movementX || event.webkitMovementX || event.mozMovementX || 0;
		var movementY = event.movementY || event.webkitMovementY || event.mozMovementY || 0;

		distance += movementX - movementY;

		var number = onMouseDownValue + ( distance / ( event.shiftKey ? 10 : 100 ) );

		display.textContent = Math.min( scope.max, Math.max( scope.min, number ) ).toFixed( 2 );

		if ( scope.onChangeCallback ) scope.onChangeCallback();

	};

	var onMouseUp = function ( event ) {

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		if ( Math.abs( distance ) < 1 ) {

			display.style.display = 'none';

			input.value = display.textContent;

			input.addEventListener( 'change', onInputChange, false );
			input.addEventListener( 'blur', onInputBlur, false );
			input.addEventListener( 'keyup', onInputKeyUp, false );

			input.style.display = '';

			input.focus();
			input.select();

		}

	};

	var onInputChange = function ( event ) {

		var number = parseFloat( input.value );

		if ( isNaN( number ) === false ) {

			display.textContent = number.toFixed( 2 );

			if ( scope.onChangeCallback ) scope.onChangeCallback();

		}

	};

	var onInputBlur = function ( event ) {

		display.style.display = '';

		input.removeEventListener( 'change', onInputChange );
		input.removeEventListener( 'blur', onInputBlur );
		input.removeEventListener( 'keyup', onInputKeyUp );
		input.style.display = 'none';

	};

	var onInputKeyUp = function ( event ) {

		if ( event.keyCode == 13 ) {

			display.style.display = '';

			input.removeEventListener( 'change', onInputChange );
			input.removeEventListener( 'blur', onInputBlur );
			input.removeEventListener( 'keyup', onInputKeyUp );
			input.style.display = 'none';

		}

	};

	display.addEventListener( 'mousedown', onMouseDown, false );

	return this;

};

UI.Number.prototype = Object.create( UI.Element.prototype );

UI.Number.prototype.getValue = function () {

	return parseFloat( this.dom.children[ 0 ].textContent );

};

UI.Number.prototype.setValue = function ( value ) {

	this.dom.children[ 0 ].textContent = value.toFixed( 2 );

	return this;

};

UI.Number.prototype.setRange = function ( min, max ) {

	this.min = min;
	this.max = max;

	return this;

};

UI.Number.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};


// Break

UI.Break = function () {

	UI.Element.call( this );

	this.dom = document.createElement( 'br' );

	return this;

};

UI.Break.prototype = Object.create( UI.Element.prototype );


// HorizontalRule

UI.HorizontalRule = function ( position ) {

	UI.Element.call( this );

	this.dom = document.createElement( 'hr' );
	this.dom.style.position = position || 'relative';

	return this;

};

UI.HorizontalRule.prototype = Object.create( UI.Element.prototype );


// Button

UI.Button = function ( position ) {

	UI.Element.call( this );

	var scope = this;

	this.dom = document.createElement( 'button' );
	this.dom.style.position = position || 'relative';

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
