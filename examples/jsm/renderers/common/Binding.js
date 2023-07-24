class Binding {

	constructor( name = '' ) {

		this.name = name;

		this.visibility = 0;

	}

	setVisibility( visibility ) {

		this.visibility |= visibility;

	}

}

export default Binding;
