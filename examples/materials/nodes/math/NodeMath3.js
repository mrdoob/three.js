/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeMath3 = function( a, b, c, method ) {
	
	THREE.NodeTemp.call( this );
	
	this.a = a;
	this.b = b;
	this.c = c;
	
	this.method = method || THREE.NodeMath3.MIX;
	
};

THREE.NodeMath3.prototype = Object.create( THREE.NodeTemp.prototype );
THREE.NodeMath3.prototype.constructor = THREE.NodeMath3;

THREE.NodeMath3.MIX = 'mix';
THREE.NodeMath3.REFRACT = 'refract';
THREE.NodeMath3.SMOOTHSTEP = 'smoothstep';
THREE.NodeMath3.FACEFORWARD = 'faceforward';

THREE.NodeMath3.prototype.getType = function( builder ) {
	
	var a = builder.getFormatLength( this.a.getType( builder ) );
	var b = builder.getFormatLength( this.b.getType( builder ) );
	var c = builder.getFormatLength( this.c.getType( builder ) );
	
	if (a > b) {
		if (a > c) return this.a.getType( builder );
		return this.c.getType( builder );
	} 
	else {
		if (b > c) return this.b.getType( builder );
	
		return this.c.getType( builder );
	}
	
};

THREE.NodeMath3.prototype.generate = function( builder, output ) {
	
	var material = builder.material;
	
	var type = this.getType( builder );
	
	var a, b, c,
		al = builder.getFormatLength( this.a.getType( builder ) ),
		bl = builder.getFormatLength( this.b.getType( builder ) ),
		cl = builder.getFormatLength( this.c.getType( builder ) )
	
	// optimzer
	
	switch(this.method) {
		case THREE.NodeMath3.REFRACT:
			a = this.a.build( builder, type );
			b = this.b.build( builder, type );
			c = this.c.build( builder, 'fv1' );
			break;
		
		case THREE.NodeMath3.MIX:
		case THREE.NodeMath3.SMOOTHSTEP:
			a = this.a.build( builder, type );
			b = this.b.build( builder, type );
			c = this.c.build( builder, cl == 1 ? 'fv1' : type );
			break;
			
		default:
			a = this.a.build( builder, type );
			b = this.b.build( builder, type );
			c = this.c.build( builder, type );
			break;
	
	}
	
	return builder.format( this.method + '(' + a + ',' + b + ',' + c + ')', type, output );

};