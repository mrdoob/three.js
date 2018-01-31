/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.Math3Node = function ( a, b, c, method ) {

	THREE.TempNode.call( this );

	this.a = a;
	this.b = b;
	this.c = c;

	this.method = method || THREE.Math3Node.MIX;

};

THREE.Math3Node.MIX = 'mix';
THREE.Math3Node.REFRACT = 'refract';
THREE.Math3Node.SMOOTHSTEP = 'smoothstep';
THREE.Math3Node.FACEFORWARD = 'faceforward';

THREE.Math3Node.prototype = Object.create( THREE.TempNode.prototype );
THREE.Math3Node.prototype.constructor = THREE.Math3Node;
THREE.Math3Node.prototype.nodeType = "Math3";

THREE.Math3Node.prototype.getType = function ( builder ) {

	var a = builder.getFormatLength( this.a.getType( builder ) );
	var b = builder.getFormatLength( this.b.getType( builder ) );
	var c = builder.getFormatLength( this.c.getType( builder ) );

	if ( a > b && a > c ) return this.a.getType( builder );
	else if ( b > c ) return this.b.getType( builder );

	return this.c.getType( builder );

};

THREE.Math3Node.prototype.generate = function ( builder, output ) {

	var material = builder.material;

	var type = this.getType( builder );

	var a, b, c,
		al = builder.getFormatLength( this.a.getType( builder ) ),
		bl = builder.getFormatLength( this.b.getType( builder ) ),
		cl = builder.getFormatLength( this.c.getType( builder ) );

	// optimzer

	switch ( this.method ) {

		case THREE.Math3Node.REFRACT:
			a = this.a.build( builder, type );
			b = this.b.build( builder, type );
			c = this.c.build( builder, 'fv1' );
			break;

		case THREE.Math3Node.MIX:
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

THREE.Math3Node.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.a = this.a.toJSON( meta ).uuid;
		data.b = this.b.toJSON( meta ).uuid;
		data.c = this.c.toJSON( meta ).uuid;
		data.method = this.method;

	}

	return data;

};
