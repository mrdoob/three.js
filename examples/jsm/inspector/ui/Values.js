import { EventDispatcher } from 'three';

class Value extends EventDispatcher {

	constructor() {

		super();

		this.domElement = document.createElement( 'div' );
		this.domElement.className = 'param-control';

		this._onChangeFunction = null;

		this.addEventListener( 'change', ( e ) => {

			if ( this._onChangeFunction ) this._onChangeFunction( e.value );

		} );

	}

	getValue() {

		return null;

	}

	dispatchChange() {

		this.dispatchEvent( { type: 'change', value: this.getValue() } );

	}

	onChange( callback ) {

		this._onChangeFunction = callback;

		return this;

	}

}

class ValueNumber extends Value {

	constructor( { value = 0, step = 0.1, min = - Infinity, max = Infinity } ) {

		super();

		this.input = document.createElement( 'input' );
		this.input.type = 'number';
		this.input.value = value;
		this.input.step = step;
		this.input.min = min;
		this.input.max = max;
		this.input.addEventListener( 'change', this._onChangeValue.bind( this ) );
		this.domElement.appendChild( this.input );
		this.addDragHandler();

	}

	_onChangeValue() {

		const value = parseFloat( this.input.value );
		const min = parseFloat( this.input.min );
		const max = parseFloat( this.input.max );

		if ( value > max ) {

			this.input.value = max;

		} else if ( value < min ) {

			this.input.value = min;

		} else if ( isNaN( value ) ) {

			this.input.value = min;

		}

		this.dispatchChange();

	}

	step( value ) {

		this.input.step = value;
		return this;

	}

	addDragHandler() {

		let isDragging = false;
		let startY, startValue;

		this.input.addEventListener( 'mousedown', ( e ) => {

			isDragging = true;
			startY = e.clientY;
			startValue = parseFloat( this.input.value );
			document.body.style.cursor = 'ns-resize';

		} );

		document.addEventListener( 'mousemove', ( e ) => {

			if ( isDragging ) {

				const deltaY = startY - e.clientY;
				const step = parseFloat( this.input.step ) || 1;
				const min = parseFloat( this.input.min );
				const max = parseFloat( this.input.max );

				let stepSize = step;

				if ( ! isNaN( max ) && isFinite( min ) ) {

					stepSize = ( max - min ) / 100;

				}

				const change = deltaY * stepSize;

				let newValue = startValue + change;
				newValue = Math.max( min, Math.min( newValue, max ) );

				const precision = ( String( step ).split( '.' )[ 1 ] || [] ).length;
				this.input.value = newValue.toFixed( precision );

				this.input.dispatchEvent( new Event( 'input' ) );

				this.dispatchChange();

			}

		} );

		document.addEventListener( 'mouseup', () => {

			if ( isDragging ) {

				isDragging = false;
				document.body.style.cursor = 'default';

			}

		} );

	}

	getValue() {

		return parseFloat( this.input.value );

	}

}

class ValueCheckbox extends Value {

	constructor( { value = false } ) {

		super();

		const label = document.createElement( 'label' );
		label.className = 'custom-checkbox';

		const checkbox = document.createElement( 'input' );
		checkbox.type = 'checkbox';
		checkbox.checked = value;
		this.checkbox = checkbox;

		const checkmark = document.createElement( 'span' );
		checkmark.className = 'checkmark';

		label.appendChild( checkbox );
		label.appendChild( checkmark );
		this.domElement.appendChild( label );

		checkbox.addEventListener( 'change', () => {

			this.dispatchChange();

		} );

	}

	getValue() {

		return this.checkbox.checked;

	}

}

class ValueSlider extends Value {

	constructor( { value = 0, min = 0, max = 1, step = 0.01 } ) {

		super();

		this.slider = document.createElement( 'input' );
		this.slider.type = 'range';
		this.slider.value = value;
		this.slider.min = min;
		this.slider.max = max;
		this.slider.step = step;

		const numberValue = new ValueNumber( { value, min, max, step } );
		this.numberInput = numberValue.input;
		this.numberInput.style.width = '70px';
		this.numberInput.style.flexShrink = '0';

		this.domElement.append( this.slider, this.numberInput );

		this.slider.addEventListener( 'input', () => {

			this.numberInput.value = this.slider.value;

			this.dispatchChange();

		} );

		numberValue.addEventListener( 'change', () => {

			this.slider.value = parseFloat( this.numberInput.value );

			this.dispatchChange();

		} );

	}

	getValue() {

		return parseFloat( this.slider.value );

	}

	step( value ) {

		this.slider.step = value;
		this.numberInput.step = value;

		return this;

	}

}

class ValueSelect extends Value {

	constructor( { options = [], value = '' } ) {

		super();

		const select = document.createElement( 'select' );
		const type = typeof value;

		const createOption = ( name, optionValue ) => {

			const optionEl = document.createElement( 'option' );
			optionEl.value = optionValue;
			optionEl.textContent = name;

			if ( optionValue == value ) optionEl.selected = true;

			select.appendChild( optionEl );

			return optionEl;

		};

		if ( Array.isArray( options ) ) {

			options.forEach( opt => createOption( opt, opt ) );

		} else {

			Object.entries( options ).forEach( ( [ key, value ] ) => createOption( key, value ) );

		}

		this.domElement.appendChild( select );

		//

		select.addEventListener( 'change', () => {

			this.dispatchChange();

		} );

		this.select = select;
		this.type = type;

	}

	getValue() {

		const value = this.select.value;
		const type = this.type;

		if ( type === 'number' ) return parseFloat( value );
		if ( type === 'boolean' ) return value === 'true';

		return this.select.value;

	}

}

export { Value, ValueNumber, ValueCheckbox, ValueSlider, ValueSelect };
