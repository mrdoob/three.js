let _id = 0;

class BindGroup {

	constructor( name = '', bindings = [] ) {

		this.name = name;
		this.bindings = bindings;

		this.id = _id ++;

	}

}

export default BindGroup;
