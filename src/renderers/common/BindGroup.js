let _id = 0;

class BindGroup {

	constructor( name = '', bindings = [], index = 0, cacheKey ) {

		this.name = name;
		this.bindings = bindings;
		this.index = index;
		this.cacheKey = cacheKey;

		this.id = _id ++;

	}

}

export default BindGroup;
