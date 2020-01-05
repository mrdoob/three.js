/**
 * @author mrdoob / http://mrdoob.com/
 */

var UIElement = function ( dom ) {

	this.dom = dom;

};

UIElement.prototype = {

	add: function () {

		for ( var i = 0; i < arguments.length; i ++ ) {

			var argument = arguments[ i ];

			if ( argument instanceof UIElement ) {

				this.dom.appendChild( argument.dom );

			} else {

				console.error( 'UIElement:', argument, 'is not an instance of UIElement.' );

			}

		}

		return this;

	},

	remove: function () {

		for ( var i = 0; i < arguments.length; i ++ ) {

			var argument = arguments[ i ];

			if ( argument instanceof UIElement ) {

				this.dom.removeChild( argument.dom );

			} else {

				console.error( 'UIElement:', argument, 'is not an instance of UIElement.' );

			}

		}

		return this;

	},

	clear: function () {

		while ( this.dom.children.length ) {

			this.dom.removeChild( this.dom.lastChild );

		}

	},

	setId: function ( id ) {

		this.dom.id = id;

		return this;

	},

	getId: function () {

		return this.dom.id;

	},

	setClass: function ( name ) {

		this.dom.className = name;

		return this;

	},

	addClass: function ( name ) {

		this.dom.classList.add( name );

		return this;

	},

	removeClass: function ( name ) {

		this.dom.classList.remove( name );

		return this;

	},

	setStyle: function ( style, array ) {

		for ( var i = 0; i < array.length; i ++ ) {

			this.dom.style[ style ] = array[ i ];

		}

		return this;

	},

	setDisabled: function ( value ) {

		this.dom.disabled = value;

		return this;

	},

	setTextContent: function ( value ) {

		this.dom.textContent = value;

		return this;

	}

};

// properties

var properties = [ 'position', 'left', 'top', 'right', 'bottom', 'width', 'height', 'border', 'borderLeft',
	'borderTop', 'borderRight', 'borderBottom', 'borderColor', 'display', 'overflow', 'margin', 'marginLeft', 'marginTop', 'marginRight', 'marginBottom', 'padding', 'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'color',
	'background', 'backgroundColor', 'opacity', 'fontSize', 'fontWeight', 'textAlign', 'textDecoration', 'textTransform', 'cursor', 'zIndex' ];

properties.forEach( function ( property ) {

	var method = 'set' + property.substr( 0, 1 ).toUpperCase() + property.substr( 1, property.length );

	UIElement.prototype[ method ] = function () {

		this.setStyle( property, arguments );

		return this;

	};

} );

// events

var events = [ 'KeyUp', 'KeyDown', 'MouseOver', 'MouseOut', 'Click', 'DblClick', 'Change' ];

events.forEach( function ( event ) {

	var method = 'on' + event;

	UIElement.prototype[ method ] = function ( callback ) {

		this.dom.addEventListener( event.toLowerCase(), callback.bind( this ), false );

		return this;

	};

} );

export { UIElement };