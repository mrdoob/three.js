class Node {

	constructor( type ) {
		
		this.type = type;
		
		this.isNode = true;
		
	}
	
	getType( builder ) {
		
		return this.type;
		
	}
	
	generate( builder, output ) {
		
		console.warn("Abstract function");
		
	}
	
	build( builder, output ) {
		
		return this.generate( builder, output );
		
	}
	
}

export default Node;
