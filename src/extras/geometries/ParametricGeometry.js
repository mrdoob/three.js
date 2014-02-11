/**
 * @author zz85 / https://github.com/zz85
 * Parametric Surfaces Geometry
 * based on the brilliant article by @prideout http://prideout.net/blog/?p=44
 *
 * new THREE.ParametricGeometry( parametricFunction, uSegments, ySegements );
 *
 */

THREE.ParametricGeometry = function ( func, slices, stacks ) {

	THREE.Geometry.call( this );

	//Save the parameters that are passed in
	this.func = func;
	this.slices = slices;
	this.stacks = stacks;

	this.updateGeometry = function(){

		var verts = this.vertices;
		var faces = this.faces;
		var uvs = this.faceVertexUvs[ 0 ];

		//reset all to geometry
		var newFaces = [];
		var newVerts = [];
		var newUvs   = [];

		var i, il, j, p;
		var u, v;

		var stackCount = this.stacks + 1;
		var sliceCount = this.slices + 1;

		for ( i = 0; i <= this.stacks; i ++ ) {

			v = i / this.stacks;

			for ( j = 0; j <= this.slices; j ++ ) {

				u = j / this.slices;

				p = func( u, v );
				newVerts.push( p );

			}
		}

		var a, b, c, d;
		var uva, uvb, uvc, uvd;

		for ( i = 0; i < this.stacks; i ++ ) {

			for ( j = 0; j < this.slices; j ++ ) {

				a = i * sliceCount + j;
				b = i * sliceCount + j + 1;
				c = (i + 1) * sliceCount + j + 1;
				d = (i + 1) * sliceCount + j;

				uva = new THREE.Vector2( j / this.slices, i / this.stacks );
				uvb = new THREE.Vector2( ( j + 1 ) / this.slices, i / this.stacks );
				uvc = new THREE.Vector2( ( j + 1 ) / this.slices, ( i + 1 ) / this.stacks );
				uvd = new THREE.Vector2( j / this.slices, ( i + 1 ) / this.stacks );

				newFaces.push( new THREE.Face3( a, b, d ) );
				newUvs.push( [ uva, uvb, uvd ] );

				newFaces.push( new THREE.Face3( b, c, d ) );
				newUvs.push( [ uvb.clone(), uvc, uvd.clone() ] );

			}

		}

		//Set updated (recalculated) geometry
		this.vertices = newVerts;
		this.faces =newFaces;
		this.faceVertexUvs[ 0 ] = newUvs;

		// console.log(this);

		// magic bullet
		// var diff = this.mergeVertices();
		// console.log('removed ', diff, ' vertices by merging');

		this.computeCentroids();
		this.computeFaceNormals();
		this.computeVertexNormals();

		//flag all dirty geometry
		this.verticesNeedUpdate = true;
		this.elementsNeedUpdate = true;
		this.morphTargetsNeedUpdate = true;
		this.uvsNeedUpdate = true;
		this.normalsNeedUpdate = true;
		this.colorsNeedUpdate = true;
		this.tangentsNeedUpdate = true;
	}

	this.updateGeometry();
};

THREE.ParametricGeometry.prototype = Object.create( THREE.Geometry.prototype );
