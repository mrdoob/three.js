/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeMath2 = function( a, b, method ) {
	
	THREE.NodeTemp.call( this );
	
	this.a = a;
	this.b = b;
	
	this.method = method || THREE.NodeMath2.DISTANCE;
	
};

THREE.NodeMath2.prototype = Object.create( THREE.NodeTemp.prototype );
THREE.NodeMath2.prototype.constructor = THREE.NodeMath2;

THREE.NodeMath2.MIN = 'min';
THREE.NodeMath2.MAX = 'max';
THREE.NodeMath2.MOD = 'mod';
THREE.NodeMath2.STEP = 'step';
THREE.NodeMath2.REFLECT = 'reflect';
THREE.NodeMath2.DISTANCE = 'distance';
THREE.NodeMath2.DOT = 'dot';
THREE.NodeMath2.CROSS = 'cross';
THREE.NodeMath2.POW = 'pow';

THREE.NodeMath2.prototype.getInputType = function( builder ) {
	
	// use the greater length vector
	if (builder.getFormatLength( this.b.getType( builder ) ) > builder.getFormatLength( this.a.getType( builder ) )) {
		return this.b.getType( builder );
	}
	
	return this.a.getType( builder );
	
};

THREE.NodeMath2.prototype.getType = function( builder ) {
	
	switch(this.method) {
		case THREE.NodeMath2.DISTANCE:
		case THREE.NodeMath2.DOT:
			return 'fv1';
		
		case THREE.NodeMath2.CROSS:
			return 'v3';
	}
	
	return this.getInputType( builder );
};

THREE.NodeMath2.prototype.generate = function( builder, output ) {
	
	var material = builder.material;
	
	var type = this.getInputType( builder );
	
	var a, b, 
		al = builder.getFormatLength( this.a.getType( builder ) ),
		bl = builder.getFormatLength( this.b.getType( builder ) );
	
	// optimzer
	
	switch(this.method) {
		case THREE.NodeMath2.CROSS:
			a = this.a.build( builder, 'v3' );
			b = this.b.build( builder, 'v3' );
			break;
		
		case THREE.NodeMath2.STEP:
			a = this.a.build( builder, al == 1 ? 'fv1' : type );
			b = this.b.build( builder, type );
			break;
			
		case THREE.NodeMath2.MIN:
		case THREE.NodeMath2.MAX:
		case THREE.NodeMath2.MODULO:
			a = this.a.build( builder, type );
			b = this.b.build( builder, bl == 1 ? 'fv1' : type );
			break;
			
		default:
			a = this.a.build( builder, type );
			b = this.b.build( builder, type );
			break;
	
	}
	
	return builder.format( this.method + '(' + a + ',' + b + ')', this.getType( builder ), output );

};