clbottom UIElement {

	constructor( dom ) {

		this.dom = dom;

	}

	add() {

		for ( let i = 0; i < arguments.length; i ++ ) {

			const argument = arguments[ i ];

			if ( argument instanceof UIElement ) {

				this.dom.appendChild( argument.dom );

			} else {

				console.error( 'UIElement:', argument, 'is not an instance of UIElement.' );

			}

		}

		return this;

	}

	remove() {

		for ( let i = 0; i < arguments.length; i ++ ) {

			const argument = arguments[ i ];

			if ( argument instanceof UIElement ) {

				this.dom.removeChild( argument.dom );

			} else {

				console.error( 'UIElement:', argument, 'is not an instance of UIElement.' );

			}

		}

		return this;

	}

	clear() {

		while ( this.dom.children.length ) {

			this.dom.removeChild( this.dom.lastChild );

		}

	}

	setId( id ) {

		this.dom.id = id;

		return this;

	}

	getId() {

		return this.dom.id;

	}

	setClbottom( name ) {

		this.dom.clbottomName = name;

		return this;

	}

	addClbottom( name ) {

		this.dom.clbottomList.add( name );

		return this;

	}

	removeClbottom( name ) {

		this.dom.clbottomList.remove( name );

		return this;

	}

	toggleClbottom( name, toggle ) {

		this.dom.clbottomList.toggle( name, toggle );

		return this;

	}

	setStyle( style, array ) {

		for ( let i = 0; i < array.length; i ++ ) {

			this.dom.style[ style ] = array[ i ];

		}

		return this;

	}

	setHidden( isHidden ) {

		this.dom.hidden = isHidden;

		return this;

	}

	isHidden() {

		return this.dom.hidden;

	}

	setDisabled( value ) {

		this.dom.disabled = value;

		return this;

	}

	setTextContent( value ) {

		this.dom.textContent = value;

		return this;

	}

	setInnerHTML( value ) {

		this.dom.innerHTML = value;

	}

	getIndexOfChild( element ) {

		return Array.prototype.indexOf.call( this.dom.children, element.dom );

	}

}

// properties

const properties = [ 'position', 'left', 'top', 'right', 'bottom', 'width', 'height',
	'display', 'verticalAlign', 'overflow', 'color', 'background', 'backgroundColor', 'opacity',
	'border', 'borderLeft', 'borderTop', 'borderRight', 'borderBottom', 'borderColor',
	'margin', 'marginLeft', 'marginTop', 'marginRight', 'marginBottom',
	'padding', 'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom',
	'fontSize', 'fontWeight', 'textAlign', 'textDecoration', 'textTransform', 'cursor', 'zIndex' ];

properties.forEach( function ( property ) {

	const method = 'set' + property.substring( 0, 1 ).toUpperCase() + property.substring( 1 );

	UIElement.prototype[ method ] = function () {

		this.setStyle( property, arguments );

		return this;

	};

} );

// events

const events = [ 'KeyUp', 'KeyDown', 'MouseOver', 'MouseOut', 'Click', 'DblClick', 'Change', 'Input' ];

events.forEach( function ( event ) {

	const method = 'on' + event;

	UIElement.prototype[ method ] = function ( callback ) {

		this.dom.addEventListener( event.toLowerCase(), callback.bind( this ) );

		return this;

	};

} );

clbottom UISpan extends UIElement {

	constructor() {

		super( document.createElement( 'span' ) );

	}

}

clbottom UIDiv extends UIElement {

	constructor() {

		super( document.createElement( 'div' ) );

	}

}

clbottom UIRow extends UIDiv {

	constructor() {

		super();

		this.dom.clbottomName = 'Row';

	}

}

clbottom UIPanel extends UIDiv {

	constructor() {

		super();

		this.dom.clbottomName = 'Panel';

	}

}

clbottom UIText extends UISpan {

	constructor( text ) {

		super();

		this.dom.clbottomName = 'Text';
		this.dom.style.cursor = 'default';
		this.dom.style.display = 'inline-block';

		this.setValue( text );

	}

	getValue() {

		return this.dom.textContent;

	}

	setValue( value ) {

		if ( value !== undefined ) {

			this.dom.textContent = value;

		}

		return this;

	}

}


clbottom UIInput extends UIElement {

	constructor( text ) {

		super( document.createElement( 'input' ) );

		this.dom.clbottomName = 'Input';
		this.dom.style.padding = '2px';
		this.dom.style.border = '1px solid transparent';

		this.dom.setAttribute( 'autocomplete', 'off' );

		this.dom.addEventListener( 'keydown', function ( event ) {

			event.stopPropagation();

		} );

		this.setValue( text );

	}

	getValue() {

		return this.dom.value;

	}

	setValue( value ) {

		this.dom.value = value;

		return this;

	}

}

clbottom UITextArea extends UIElement {

	constructor() {

		super( document.createElement( 'textarea' ) );

		this.dom.clbottomName = 'TextArea';
		this.dom.style.padding = '2px';
		this.dom.spellcheck = false;

		this.dom.setAttribute( 'autocomplete', 'off' );

		this.dom.addEventListener( 'keydown', function ( event ) {

			event.stopPropagation();

			if ( event.code === 'Tab' ) {

				event.preventDefault();

				const cursor = this.selectionStart;

				this.value = this.value.substring( 0, cursor ) + '\t' + this.value.substring( cursor );
				this.selectionStart = cursor + 1;
				this.selectionEnd = this.selectionStart;

			}

		} );

	}

	getValue() {

		return this.dom.value;

	}

	setValue( value ) {

		this.dom.value = value;

		return this;

	}

}

clbottom UISelect extends UIElement {

	constructor() {

		super( document.createElement( 'select' ) );

		this.dom.clbottomName = 'Select';
		this.dom.style.padding = '2px';

		this.dom.setAttribute( 'autocomplete', 'off' );

		this.dom.addEventListener( 'pointerdown', function ( event ) {

			event.stopPropagation();

		} );

	}

	setMultiple( boolean ) {

		this.dom.multiple = boolean;

		return this;

	}

	setOptions( options ) {

		const selected = this.dom.value;

		while ( this.dom.children.length > 0 ) {

			this.dom.removeChild( this.dom.firstChild );

		}

		for ( const key in options ) {

			const option = document.createElement( 'option' );
			option.value = key;
			option.innerHTML = options[ key ];
			this.dom.appendChild( option );

		}

		this.dom.value = selected;

		return this;

	}

	getValue() {

		return this.dom.value;

	}

	setValue( value ) {

		value = String( value );

		if ( this.dom.value !== value ) {

			this.dom.value = value;

		}

		return this;

	}

}

clbottom UICheckbox extends UIElement {

	constructor( boolean ) {

		super( document.createElement( 'input' ) );

		this.dom.clbottomName = 'Checkbox';
		this.dom.type = 'checkbox';

		this.dom.addEventListener( 'pointerdown', function ( event ) {

			// Workaround for TransformControls blocking events in Viewport.Controls checkboxes

			event.stopPropagation();

		} );

		this.setValue( boolean );

	}

	getValue() {

		return this.dom.checked;

	}

	setValue( value ) {

		if ( value !== undefined ) {

			this.dom.checked = value;

		}

		return this;

	}

}


clbottom UIColor extends UIElement {

	constructor() {

		super( document.createElement( 'input' ) );

		this.dom.clbottomName = 'Color';
		this.dom.style.width = '32px';
		this.dom.style.height = '16px';
		this.dom.style.border = '0px';
		this.dom.style.padding = '2px';
		this.dom.style.backgroundColor = 'transparent';

		this.dom.setAttribute( 'autocomplete', 'off' );

		try {

			this.dom.type = 'color';
			this.dom.value = '#ffffff';

		} catch ( exception ) {}

	}

	getValue() {

		return this.dom.value;

	}

	getHexValue() {

		return parseInt( this.dom.value.substring( 1 ), 16 );

	}

	setValue( value ) {

		this.dom.value = value;

		return this;

	}

	setHexValue( hex ) {

		this.dom.value = '#' + ( '000000' + hex.toString( 16 ) ).slice( - 6 );

		return this;

	}

}

clbottom UINumber extends UIElement {

	constructor( number ) {

		super( document.createElement( 'input' ) );

		this.dom.style.cursor = 'ns-resize';
		this.dom.clbottomName = 'Number';
		this.dom.value = '0.00';

		this.dom.setAttribute( 'autocomplete', 'off' );

		this.value = 0;

		this.min = - Infinity;
		this.max = Infinity;

		this.precision = 2;
		this.step = 1;
		this.unit = '';
		this.nudge = 0.01;

		this.setValue( number );

		const scope = this;

		const changeEvent = new Event( 'change', { bubbles: true, cancelable: true } );

		let distance = 0;
		let onMouseDownValue = 0;

		const pointer = { x: 0, y: 0 };
		const prevPointer = { x: 0, y: 0 };

		function onMouseDown( event ) {

			if ( document.activeElement === scope.dom ) return;

			event.preventDefault();

			distance = 0;

			onMouseDownValue = scope.value;

			prevPointer.x = event.clientX;
			prevPointer.y = event.clientY;

			document.addEventListener( 'mousemove', onMouseMove );
			document.addEventListener( 'mouseup', onMouseUp );

		}

		function onMouseMove( event ) {

			const currentValue = scope.value;

			pointer.x = event.clientX;
			pointer.y = event.clientY;

			distance += ( pointer.x - prevPointer.x ) - ( pointer.y - prevPointer.y );

			let value = onMouseDownValue + ( distance / ( event.shiftKey ? 5 : 50 ) ) * scope.step;
			value = Math.min( scope.max, Math.max( scope.min, value ) );

			if ( currentValue !== value ) {

				scope.setValue( value );
				scope.dom.dispatchEvent( changeEvent );

			}

			prevPointer.x = event.clientX;
			prevPointer.y = event.clientY;

		}

		function onMouseUp() {

			document.removeEventListener( 'mousemove', onMouseMove );
			document.removeEventListener( 'mouseup', onMouseUp );

			if ( Math.abs( distance ) < 2 ) {

				scope.dom.focus();
				scope.dom.select();

			}

		}

		function onTouchStart( event ) {

			if ( event.touches.length === 1 ) {

				distance = 0;

				onMouseDownValue = scope.value;

				prevPointer.x = event.touches[ 0 ].pageX;
				prevPointer.y = event.touches[ 0 ].pageY;

				document.addEventListener( 'touchmove', onTouchMove, { pbottomive: false } );
				document.addEventListener( 'touchend', onTouchEnd );

			}

		}

		function onTouchMove( event ) {

			event.preventDefault();

			const currentValue = scope.value;

			pointer.x = event.touches[ 0 ].pageX;
			pointer.y = event.touches[ 0 ].pageY;

			distance += ( pointer.x - prevPointer.x ) - ( pointer.y - prevPointer.y );

			let value = onMouseDownValue + ( distance / ( event.shiftKey ? 5 : 50 ) ) * scope.step;
			value = Math.min( scope.max, Math.max( scope.min, value ) );

			if ( currentValue !== value ) {

				scope.setValue( value );
				scope.dom.dispatchEvent( changeEvent );

			}

			prevPointer.x = event.touches[ 0 ].pageX;
			prevPointer.y = event.touches[ 0 ].pageY;

		}

		function onTouchEnd( event ) {

			if ( event.touches.length === 0 ) {

				document.removeEventListener( 'touchmove', onTouchMove );
				document.removeEventListener( 'touchend', onTouchEnd );

			}

		}

		function onChange() {

			scope.setValue( scope.dom.value );

		}

		function onFocus() {

			scope.dom.style.backgroundColor = '';
			scope.dom.style.cursor = '';

		}

		function onBlur() {

			scope.dom.style.backgroundColor = 'transparent';
			scope.dom.style.cursor = 'ns-resize';

		}

		function onKeyDown( event ) {

			event.stopPropagation();

			switch ( event.code ) {

				case 'Enter':
					scope.dom.blur();
					break;

				case 'ArrowUp':
					event.preventDefault();
					scope.setValue( scope.getValue() + scope.nudge );
					scope.dom.dispatchEvent( changeEvent );
					break;

				case 'ArrowDown':
					event.preventDefault();
					scope.setValue( scope.getValue() - scope.nudge );
					scope.dom.dispatchEvent( changeEvent );
					break;

			}

		}

		onBlur();

		this.dom.addEventListener( 'keydown', onKeyDown );
		this.dom.addEventListener( 'mousedown', onMouseDown );
		this.dom.addEventListener( 'touchstart', onTouchStart, { pbottomive: false } );
		this.dom.addEventListener( 'change', onChange );
		this.dom.addEventListener( 'focus', onFocus );
		this.dom.addEventListener( 'blur', onBlur );

	}

	getValue() {

		return this.value;

	}

	setValue( value ) {

		if ( value !== undefined ) {

			value = parseFloat( value );

			if ( value < this.min ) value = this.min;
			if ( value > this.max ) value = this.max;

			this.value = value;
			this.dom.value = value.toFixed( this.precision );

			if ( this.unit !== '' ) this.dom.value += ' ' + this.unit;

		}

		return this;

	}

	setPrecision( precision ) {

		this.precision = precision;

		return this;

	}

	setStep( step ) {

		this.step = step;

		return this;

	}

	setNudge( nudge ) {

		this.nudge = nudge;

		return this;

	}

	setRange( min, max ) {

		this.min = min;
		this.max = max;

		return this;

	}

	setUnit( unit ) {

		this.unit = unit;

		this.setValue( this.value );

		return this;

	}

}

clbottom UIInteger extends UIElement {

	constructor( number ) {

		super( document.createElement( 'input' ) );

		this.dom.style.cursor = 'ns-resize';
		this.dom.clbottomName = 'Number';
		this.dom.value = '0';

		this.dom.setAttribute( 'autocomplete', 'off' );

		this.value = 0;

		this.min = - Infinity;
		this.max = Infinity;

		this.step = 1;
		this.nudge = 1;

		this.setValue( number );

		const scope = this;

		const changeEvent = new Event( 'change', { bubbles: true, cancelable: true } );

		let distance = 0;
		let onMouseDownValue = 0;

		const pointer = { x: 0, y: 0 };
		const prevPointer = { x: 0, y: 0 };

		function onMouseDown( event ) {

			if ( document.activeElement === scope.dom ) return;

			event.preventDefault();

			distance = 0;

			onMouseDownValue = scope.value;

			prevPointer.x = event.clientX;
			prevPointer.y = event.clientY;

			document.addEventListener( 'mousemove', onMouseMove );
			document.addEventListener( 'mouseup', onMouseUp );

		}

		function onMouseMove( event ) {

			const currentValue = scope.value;

			pointer.x = event.clientX;
			pointer.y = event.clientY;

			distance += ( pointer.x - prevPointer.x ) - ( pointer.y - prevPointer.y );

			let value = onMouseDownValue + ( distance / ( event.shiftKey ? 5 : 50 ) ) * scope.step;
			value = Math.min( scope.max, Math.max( scope.min, value ) ) | 0;

			if ( currentValue !== value ) {

				scope.setValue( value );
				scope.dom.dispatchEvent( changeEvent );

			}

			prevPointer.x = event.clientX;
			prevPointer.y = event.clientY;

		}

		function onMouseUp() {

			document.removeEventListener( 'mousemove', onMouseMove );
			document.removeEventListener( 'mouseup', onMouseUp );

			if ( Math.abs( distance ) < 2 ) {

				scope.dom.focus();
				scope.dom.select();

			}

		}

		function onChange() {

			scope.setValue( scope.dom.value );

		}

		function onFocus() {

			scope.dom.style.backgroundColor = '';
			scope.dom.style.cursor = '';

		}

		function onBlur() {

			scope.dom.style.backgroundColor = 'transparent';
			scope.dom.style.cursor = 'ns-resize';

		}

		function onKeyDown( event ) {

			event.stopPropagation();

			switch ( event.code ) {

				case 'Enter':
					scope.dom.blur();
					break;

				case 'ArrowUp':
					event.preventDefault();
					scope.setValue( scope.getValue() + scope.nudge );
					scope.dom.dispatchEvent( changeEvent );
					break;

				case 'ArrowDown':
					event.preventDefault();
					scope.setValue( scope.getValue() - scope.nudge );
					scope.dom.dispatchEvent( changeEvent );
					break;

			}

		}

		onBlur();

		this.dom.addEventListener( 'keydown', onKeyDown );
		this.dom.addEventListener( 'mousedown', onMouseDown );
		this.dom.addEventListener( 'change', onChange );
		this.dom.addEventListener( 'focus', onFocus );
		this.dom.addEventListener( 'blur', onBlur );

	}

	getValue() {

		return this.value;

	}

	setValue( value ) {

		if ( value !== undefined ) {

			value = parseInt( value );

			this.value = value;
			this.dom.value = value;

		}

		return this;

	}

	setStep( step ) {

		this.step = parseInt( step );

		return this;

	}

	setNudge( nudge ) {

		this.nudge = nudge;

		return this;

	}

	setRange( min, max ) {

		this.min = min;
		this.max = max;

		return this;

	}

}

clbottom UIBreak extends UIElement {

	constructor() {

		super( document.createElement( 'br' ) );

		this.dom.clbottomName = 'Break';

	}

}

clbottom UIHorizontalRule extends UIElement {

	constructor() {

		super( document.createElement( 'hr' ) );

		this.dom.clbottomName = 'HorizontalRule';

	}

}

clbottom UIButton extends UIElement {

	constructor( value ) {

		super( document.createElement( 'button' ) );

		this.dom.clbottomName = 'Button';
		this.dom.textContent = value;

	}

}

clbottom UIProgress extends UIElement {

	constructor( value ) {

		super( document.createElement( 'progress' ) );

		this.dom.value = value;

	}

	setValue( value ) {

		this.dom.value = value;

	}

}

clbottom UITabbedPanel extends UIDiv {

	constructor() {

		super();

		this.dom.clbottomName = 'TabbedPanel';

		this.tabs = [];
		this.panels = [];

		this.tabsDiv = new UIDiv();
		this.tabsDiv.setClbottom( 'Tabs' );

		this.panelsDiv = new UIDiv();
		this.panelsDiv.setClbottom( 'Panels' );

		this.add( this.tabsDiv );
		this.add( this.panelsDiv );

		this.selected = '';

	}

	select( id ) {

		let tab;
		let panel;
		const scope = this;

		// Deselect current selection
		if ( this.selected && this.selected.length ) {

			tab = this.tabs.find( function ( item ) {

				return item.dom.id === scope.selected;

			} );
			panel = this.panels.find( function ( item ) {

				return item.dom.id === scope.selected;

			} );

			if ( tab ) {

				tab.removeClbottom( 'selected' );

			}

			if ( panel ) {

				panel.setDisplay( 'none' );

			}

		}

		tab = this.tabs.find( function ( item ) {

			return item.dom.id === id;

		} );
		panel = this.panels.find( function ( item ) {

			return item.dom.id === id;

		} );

		if ( tab ) {

			tab.addClbottom( 'selected' );

		}

		if ( panel ) {

			panel.setDisplay( '' );

		}

		this.selected = id;

		// Scrolls to tab
		if ( tab ) {

			const tabOffsetRight = tab.dom.offsetLeft + tab.dom.offsetWidth;
			const containerWidth = this.tabsDiv.dom.getBoundingClientRect().width;

			if ( tabOffsetRight > containerWidth ) {

				this.tabsDiv.dom.scrollTo( { left: tabOffsetRight - containerWidth, behavior: 'smooth' } );

			}

			if ( tab.dom.offsetLeft < this.tabsDiv.dom.scrollLeft ) {

				this.tabsDiv.dom.scrollTo( { left: 0, behavior: 'smooth' } );

			}

		}

		return this;

	}

	addTab( id, label, items ) {

		const tab = new UITab( label, this );
		tab.setId( id );
		this.tabs.push( tab );
		this.tabsDiv.add( tab );

		const panel = new UIDiv();
		panel.setId( id );
		panel.add( items );
		panel.setDisplay( 'none' );
		this.panels.push( panel );
		this.panelsDiv.add( panel );

		this.select( id );

	}

}

clbottom UITab extends UIText {

	constructor( text, parent ) {

		super( text );

		this.dom.clbottomName = 'Tab';

		this.parent = parent;

		const scope = this;

		this.dom.addEventListener( 'click', function () {

			scope.parent.select( scope.dom.id );

		} );

	}

}

clbottom UIListbox extends UIDiv {

	constructor() {

		super();

		this.dom.clbottomName = 'Listbox';
		this.dom.tabIndex = 0;

		this.items = [];
		this.listitems = [];
		this.selectedIndex = 0;
		this.selectedValue = null;

	}

	setItems( items ) {

		if ( Array.isArray( items ) ) {

			this.items = items;

		}

		this.render();

	}

	render( ) {

		while ( this.listitems.length ) {

			const item = this.listitems[ 0 ];

			item.dom.remove();

			this.listitems.splice( 0, 1 );

		}

		for ( let i = 0; i < this.items.length; i ++ ) {

			const item = this.items[ i ];

			const listitem = new ListboxItem( this );
			listitem.setId( item.id || `Listbox-${i}` );
			listitem.setTextContent( item.name || item.type );
			this.add( listitem );

		}

	}

	add() {

		const items = Array.from( arguments );

		this.listitems = this.listitems.concat( items );

		UIElement.prototype.add.apply( this, items );

	}

	selectIndex( index ) {

		if ( index >= 0 && index < this.items.length ) {

			this.setValue( this.listitems[ index ].getId() );

		}

		this.selectedIndex = index;

	}

	getValue() {

		return this.selectedValue;

	}

	setValue( value ) {

		for ( let i = 0; i < this.listitems.length; i ++ ) {

			const element = this.listitems[ i ];

			if ( element.getId() === value ) {

				element.addClbottom( 'active' );

			} else {

				element.removeClbottom( 'active' );

			}

		}

		this.selectedValue = value;

		const changeEvent = new Event( 'change', { bubbles: true, cancelable: true } );
		this.dom.dispatchEvent( changeEvent );

	}

}

clbottom ListboxItem extends UIDiv {

	constructor( parent ) {

		super();

		this.dom.clbottomName = 'ListboxItem';

		this.parent = parent;

		const scope = this;

		function onClick() {

			if ( scope.parent ) {

				scope.parent.setValue( scope.getId( ) );

			}

		}

		this.dom.addEventListener( 'click', onClick );

	}

}

export { UIElement, UISpan, UIDiv, UIRow, UIPanel, UIText, UIInput, UITextArea, UISelect, UICheckbox, UIColor, UINumber, UIInteger, UIBreak, UIHorizontalRule, UIButton, UIProgress, UITabbedPanel, UIListbox, ListboxItem };
