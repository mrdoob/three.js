/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.UVTransformNode = function ( uv, transform ) {

	THREE.FunctionNode.call( this, "( uvTransform * vec3( uvNode, 1 ) ).xy", "vec2" );

	this.uv = uv || new THREE.UVNode();
	this.transform = transform || new THREE.Matrix3Node();

};

THREE.UVTransformNode.prototype = Object.create( THREE.FunctionNode.prototype );
THREE.UVTransformNode.prototype.constructor = THREE.UVTransformNode;
THREE.UVTransformNode.prototype.nodeType = "UVTransform";

THREE.UVTransformNode.prototype.generate = function ( builder, output ) {

	this.keywords[ "uvNode" ] = this.uv;
	this.keywords[ "uvTransform" ] = this.transform;

	return THREE.FunctionNode.prototype.generate.call( this, builder, output );

};

THREE.UVTransformNode.prototype.setUvTransform = function ( tx, ty, sx, sy, rotation, cx, cy ) {

	cx = cx !== undefined ? cx : .5;
	cy = cy !== undefined ? cy : .5;

	this.transform.value.setUvTransform( tx, ty, sx, sy, rotation, cx, cy );

};

THREE.UVTransformNode.prototype.copy = function ( source ) {
			
	THREE.GLNode.prototype.copy.call( this, source );
	
	this.uv = source.uv;
	this.transform = source.transform;
					
};

THREE.UVTransformNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.uv = this.uv.toJSON( meta ).uuid;
		data.transform = this.transform.toJSON( meta ).uuid;

	}

	return data;

};
