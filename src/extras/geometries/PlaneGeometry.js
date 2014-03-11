/**
 * @author mrdoob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Plane.as
 */

THREE.PlaneGeometry = function ( width, height, widthSegments, heightSegments ) {

	THREE.PlaneBufferGeometry.call( this, width, height, widthSegments, heightSegments );

	var length = this.attributes.position.array.length;

	this.vertices = [];
	this.normals = [];
	this.uvs = [];

	for ( var i = 0, l = length / 3; i < l; i ++ ) {

		this.vertices.push( new THREE.TypedVector3( this.attributes.position.array, i * 3 ) );
		this.normals.push( new THREE.TypedVector3( this.attributes.normal.array, i * 3 ) );
		this.uvs.push( new THREE.TypedVector2( this.attributes.uv.array, i * 2 ) );

	}

};

THREE.PlaneGeometry.prototype = Object.create( THREE.PlaneBufferGeometry.prototype );
