/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.Math2Node = function ( a, b, method ) {

	THREE.TempNode.call( this );

	this.a = a;
	this.b = b;

	this.method = method || THREE.Math2Node.DISTANCE;

};

THREE.Math2Node.MIN = 'min';
THREE.Math2Node.MAX = 'max';
THREE.Math2Node.MOD = 'mod';
THREE.Math2Node.STEP = 'step';
THREE.Math2Node.REFLECT = 'reflect';
THREE.Math2Node.DISTANCE = 'distance';
THREE.Math2Node.DOT = 'dot';
THREE.Math2Node.CROSS = 'cross';
THREE.Math2Node.POW = 'pow';

THREE.Math2Node.prototype = Object.create( THREE.TempNode.prototype );
THREE.Math2Node.prototype.constructor = THREE.Math2Node;
THREE.Math2Node.prototype.nodeType = "Math2";

THREE.Math2Node.prototype.getInputType = function ( builder ) {

	// use the greater length vector
	if ( builder.getFormatLength( this.b.getType( builder ) ) > builder.getFormatLength( this.a.getType( builder ) ) ) {

		return this.b.getType( builder );

	}

	return this.a.getType( builder );

};

THREE.Math2Node.prototype.getType = function ( builder ) {

	switch ( this.method ) {

		case THREE.Math2Node.DISTANCE:
		case THREE.Math2Node.DOT:
			return 'fv1';

		case THREE.Math2Node.CROSS:
			return 'v3';

	}

	return this.getInputType( builder );

};

THREE.Math2Node.prototype.generate = function ( builder, output ) {

	var material = builder.material;

	var type = this.getInputType( builder );

	var a, b,
		al = builder.getFormatLength( this.a.getType( builder ) ),
		bl = builder.getFormatLength( this.b.getType( builder ) );

	// optimzer

	switch ( this.method ) {

		case THREE.Math2Node.CROSS:
			a = this.a.build( builder, 'v3' );
			b = this.b.build( builder, 'v3' );
			break;

		case THREE.Math2Node.STEP:
			a = this.a.build( builder, al == 1 ? 'fv1' : type );
			b = this.b.build( builder, type );
			break;

		case THREE.Math2Node.MIN:
		case THREE.Math2Node.MAX:
		case THREE.Math2Node.MOD:
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

THREE.Math2Node.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.a = this.a.toJSON( meta ).uuid;
		data.b = this.b.toJSON( meta ).uuid;
		data.method = this.method;

	}

	return data;

};
