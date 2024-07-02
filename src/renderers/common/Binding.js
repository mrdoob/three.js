class Binding {

	constructor( name = '' ) {

		this.name = name;

		this.visibility = 0;

	}

	setVisibility( visibility ) {

		this.visibility |= visibility;

	}

	clone() {

		return Object.assign( new this.constructor(), this );

	}

}

export default Binding;
