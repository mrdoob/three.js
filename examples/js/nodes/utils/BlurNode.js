/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.BlurNode = function( value, coord, radius, size ) {

	THREE.TempNode.call( this, 'v4' );

	this.requestUpdate = true;

	this.value = value;
	this.coord = coord || new THREE.UVNode();
	this.radius = new THREE.Vector2Node( 1, 1 );
	this.size = size;

	this.blurX = true;
	this.blurY = true;

	this.horizontal = new THREE.FloatNode( 1 / 64 );
	this.vertical = new THREE.FloatNode( 1 / 64 );

};

THREE.BlurNode.fBlurX = new THREE.FunctionNode( [
"vec4 blurX( sampler2D texture, vec2 uv, float s ) {",
"	vec4 sum = vec4( 0.0 );",
"	sum += texture2D( texture, vec2( uv.x - 4.0 * s, uv.y ) ) * 0.051;",
"	sum += texture2D( texture, vec2( uv.x - 3.0 * s, uv.y ) ) * 0.0918;",
"	sum += texture2D( texture, vec2( uv.x - 2.0 * s, uv.y ) ) * 0.12245;",
"	sum += texture2D( texture, vec2( uv.x - 1.0 * s, uv.y ) ) * 0.1531;",
"	sum += texture2D( texture, vec2( uv.x, uv.y ) ) * 0.1633;",
"	sum += texture2D( texture, vec2( uv.x + 1.0 * s, uv.y ) ) * 0.1531;",
"	sum += texture2D( texture, vec2( uv.x + 2.0 * s, uv.y ) ) * 0.12245;",
"	sum += texture2D( texture, vec2( uv.x + 3.0 * s, uv.y ) ) * 0.0918;",
"	sum += texture2D( texture, vec2( uv.x + 4.0 * s, uv.y ) ) * 0.051;",
"	return sum;",
"}"
].join( "\n" ) );

THREE.BlurNode.fBlurY = new THREE.FunctionNode( [
"vec4 blurY( sampler2D texture, vec2 uv, float s ) {",
"	vec4 sum = vec4( 0.0 );",
"	sum += texture2D( texture, vec2( uv.x, uv.y - 4.0 * s ) ) * 0.051;",
"	sum += texture2D( texture, vec2( uv.x, uv.y - 3.0 * s ) ) * 0.0918;",
"	sum += texture2D( texture, vec2( uv.x, uv.y - 2.0 * s ) ) * 0.12245;",
"	sum += texture2D( texture, vec2( uv.x, uv.y - 1.0 * s ) ) * 0.1531;",
"	sum += texture2D( texture, vec2( uv.x, uv.y ) ) * 0.1633;",
"	sum += texture2D( texture, vec2( uv.x, uv.y + 1.0 * s ) ) * 0.1531;",
"	sum += texture2D( texture, vec2( uv.x, uv.y + 2.0 * s ) ) * 0.12245;",
"	sum += texture2D( texture, vec2( uv.x, uv.y + 3.0 * s ) ) * 0.0918;",
"	sum += texture2D( texture, vec2( uv.x, uv.y + 4.0 * s ) ) * 0.051;",
"	return sum;",
"}"
].join( "\n" ) );

THREE.BlurNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.BlurNode.prototype.constructor = THREE.BlurNode;

THREE.BlurNode.prototype.updateFrame = function( delta ) {

	if ( this.size ) {

		this.horizontal.number = this.radius.x / this.size.x;
		this.vertical.number = this.radius.y / this.size.y;

	} else if ( this.value.value && this.value.value.image ) {

		var image = this.value.value.image;

		this.horizontal.number = this.radius.x / image.width;
		this.vertical.number = this.radius.y / image.height;

	}

};

THREE.BlurNode.prototype.generate = function( builder, output ) {

	var material = builder.material, blurX = THREE.BlurNode.fBlurX, blurY = THREE.BlurNode.fBlurY;

	builder.include( blurX );
	builder.include( blurY );

	if ( builder.isShader( 'fragment' ) ) {

		var blurCode = [], code;

		if ( this.blurX ) {

			blurCode.push( blurX.name + '(' + this.value.build( builder, 'sampler2D' ) + ',' + this.coord.build( builder, 'v2' ) + ',' + this.horizontal.build( builder, 'fv1' ) + ')' );

		}

		if ( this.blurY ) {

			blurCode.push( blurY.name + '(' + this.value.build( builder, 'sampler2D' ) + ',' + this.coord.build( builder, 'v2' ) + ',' + this.vertical.build( builder, 'fv1' ) + ')' );

		}

		if ( blurCode.length == 2 ) code = '(' + blurCode.join( '+' ) + '/2.0)';
		else if ( blurCode.length ) code = '(' + blurCode[ 0 ] + ')';
		else code = 'vec4( 0.0 )';

		return builder.format( code, this.getType( builder ), output );

	} else {

		console.warn( "THREE.BlurNode is not compatible with " + builder.shader + " shader." );

		return builder.format( 'vec4( 0.0 )', this.getType( builder ), output );

	}

};
