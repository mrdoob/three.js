var UI = {};

UI.Element = function () {};

UI.Element.prototype = {

	setX: function ( value ) {

		this.dom.style.left = value;

		return this;

	},

	setY: function ( value ) {

		this.dom.style.top = value;

		return this;		

	},

	setWidth: function ( value ) {

		this.dom.style.width = value;
		return this;

	},

	setHeight: function ( value ) {

		this.dom.style.height = value;
		return this;

	},

	// border

	setBorder: function ( value ) {

		this.dom.style.border = value;
		return this;

	},

	setBorderTop: function ( value ) {

		this.dom.style.borderTop = value;
		return this;

	},

	setBorderBottom: function ( value ) {

		this.dom.style.borderBottom = value;
		return this;

	},

	setBorderLeft: function ( value ) {

		this.dom.style.borderLeft = value;
		return this;

	},

	setBorderRight: function ( value ) {

		this.dom.style.borderRight = value;
		return this;

	},

	// margin

	setMargin: function ( value ) {

		this.dom.style.margin = value;
		return this;

	},

	setMarginTop: function ( value ) {

		this.dom.style.marginTop = value;
		return this;

	},

	setMarginBottom: function ( value ) {

		this.dom.style.marginBottom = value;
		return this;

	},

	setMarginLeft: function ( value ) {

		this.dom.style.marginLeft = value;
		return this;

	},

	setMarginRight: function ( value ) {

		this.dom.style.marginRight = value;
		return this;

	},

	// padding

	setPadding: function ( value ) {

		this.dom.style.padding = value;
		return this;

	},

	//

	setFontWeight: function ( value ) {

		this.dom.style.fontWeight = value;
		return this;

	},

	setColor: function ( value ) {

		this.dom.style.color = value;
		return this;

	},

	setBackgroundColor: function ( value ) {

		this.dom.style.backgroundColor = value;
		return this;

	}

}


// Panel

UI.Panel = function ( position ) {

	UI.Element.call( this );

	this.dom = document.createElement( 'div' );
	this.dom.style.position = position || 'relative';

	this.dom.addEventListener( 'mousedown', function ( event ) { event.preventDefault() }, false );

	return this;
};

UI.Panel.prototype = new UI.Element();
UI.Panel.prototype.constructor = UI.Panel;

UI.Panel.prototype.add = function ( node ) {

	this.dom.appendChild( node.dom );
	return this;

};


// Text

UI.Text = function ( position ) {

	UI.Element.call( this );

	this.dom = document.createElement( 'span' );
	this.dom.style.position = position || 'relative';

	return this;

};

UI.Text.prototype = new UI.Element();
UI.Text.prototype.constructor = UI.Text;

UI.Text.prototype.setText = function ( value ) {

	this.dom.innerText = value;
	return this;

};


// IntNumber

UI.IntNumber = function ( position ) {

	UI.Element.call( this );

	this.dom = document.createElement( 'span' );
	this.dom.style.position = position || 'relative';
	this.dom.innerText = '0.00';
	this.dom.style.marginTop = '2px';
	this.dom.style.color = '#0080f0';
	this.dom.style.fontSize = '12px';
	this.dom.style.textDecoration = 'underline';

	var scope = this;
	var onMouseDownValue, onMouseDownScreenX, onMouseDownScreenY;

	var onMouseDown = function ( event ) {

		event.preventDefault();

		onMouseDownValue = parseFloat( scope.dom.innerText );
		onMouseDownScreenX = event.screenX;
		onMouseDownScreenY = event.screenY;

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	}

	var onMouseMove = function ( event ) {

		var dx = event.screenX - onMouseDownScreenX;
		var dy = event.screenY - onMouseDownScreenY;

		scope.dom.innerText = ( onMouseDownValue - ( dx - dy ) ).toFixed( 0 ); 

	}

	var onMouseUp = function ( event ) {

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

	}

	this.dom.addEventListener( 'mousedown', onMouseDown, false );

	return this;

};

UI.IntNumber.prototype = new UI.Element();
UI.IntNumber.prototype.constructor = UI.IntNumber;

UI.IntNumber.prototype.setNumber = function ( value ) {

	this.dom.innerText = value.toFixed( 0 );
	return this;

};


// FloatNumber

UI.FloatNumber = function ( position ) {

	UI.Element.call( this );

	this.dom = document.createElement( 'span' );
	this.dom.style.position = position || 'relative';
	this.dom.innerText = '0.00';
	this.dom.style.marginTop = '2px';
	this.dom.style.color = '#0080f0';
	this.dom.style.fontSize = '12px';
	this.dom.style.textDecoration = 'underline';

	var scope = this;
	var onMouseDownValue, onMouseDownScreenX, onMouseDownScreenY;

	var onMouseDown = function ( event ) {

		event.preventDefault();

		onMouseDownValue = parseFloat( scope.dom.innerText );
		onMouseDownScreenX = event.screenX;
		onMouseDownScreenY = event.screenY;

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	}

	var onMouseMove = function ( event ) {

		var dx = event.screenX - onMouseDownScreenX;
		var dy = event.screenY - onMouseDownScreenY;

		scope.dom.innerText = ( onMouseDownValue + ( dx - dy ) / 100 ).toFixed( 2 ); 

	}

	var onMouseUp = function ( event ) {

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

	}

	this.dom.addEventListener( 'mousedown', onMouseDown, false );

	return this;

};

UI.FloatNumber.prototype = new UI.Element();
UI.FloatNumber.prototype.constructor = UI.FloatNumber;

UI.FloatNumber.prototype.setNumber = function ( value ) {

	this.dom.innerText = value.toFixed( 2 );
	return this;

};


// Break

UI.Break = function () {

	UI.Element.call( this );

	this.dom = document.createElement( 'br' );

	return this;

};

UI.Break.prototype = new UI.Element();
UI.Break.prototype.constructor = UI.Break;


// HorizontalRule

UI.HorizontalRule = function ( position ) {

	UI.Element.call( this );

	this.dom = document.createElement( 'hr' );
	this.dom.style.position = position || 'relative';

	return this;

};

UI.HorizontalRule.prototype = new UI.Element();
UI.HorizontalRule.prototype.constructor = UI.HorizontalRule;

// Button

UI.Button = function ( position ) {

	UI.Element.call( this );

	this.dom = document.createElement( 'button' );
	this.dom.style.position = position || 'relative';

	return this;

};

UI.Button.prototype = new UI.Element();
UI.Button.prototype.constructor = UI.Button;

UI.Button.prototype.setText = function ( value ) {

	this.dom.innerText = value;
	return this;

};
