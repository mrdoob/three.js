/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.GLNode = function( type ) {

	this.uuid = THREE.Math.generateUUID();

	this.allow = {};
	this.requestUpdate = false;

	this.type = type;

};

THREE.GLNode.prototype.verify = function( builder ) {

	builder.isVerify = true;

	var material = builder.material;

	this.build( builder, 'v4' );

	material.clearVertexNode();
	material.clearFragmentNode();

	builder.setCache(); // reset cache

	builder.isVerify = false;

};

THREE.GLNode.prototype.verifyAndBuildCode = function( builder, output, cache ) {

	this.verify( builder.setCache( cache ) );

	return this.buildCode( builder.setCache( cache ), output );

};

THREE.GLNode.prototype.buildCode = function( builder, output, uuid ) {

	var material = builder.material;
	var data = { result : this.build( builder, output, uuid ) };

	if ( builder.isShader( 'vertex' ) ) data.code = material.clearVertexNode();
	else data.code = material.clearFragmentNode();

	builder.setCache(); // reset cache

	return data;

};

THREE.GLNode.prototype.verifyDepsNode = function( builder, data, output ) {

	data.deps = ( data.deps || 0 ) + 1;

	var outputLen = builder.getFormatLength( output );

	if ( outputLen > data.outputMax || this.getType( builder ) ) {

		data.outputMax = outputLen;
		data.output = output;

	}

};

THREE.GLNode.prototype.build = function( builder, output, uuid ) {

	var material = builder.material;
	var data = material.getDataNode( uuid || this.uuid );

	if ( builder.isShader( 'verify' ) ) this.verifyDepsNode( builder, data, output );

	if ( this.allow[ builder.shader ] === false ) {

		throw new Error( 'Shader ' + shader + ' is not compatible with this node.' );

	}

	if ( this.requestUpdate && ! data.requestUpdate ) {

		material.requestUpdate.push( this );
		data.requestUpdate = true;

	}

	return this.generate( builder, output, uuid );

};

THREE.GLNode.prototype.getType = function( builder ) {

	return this.type;

};
