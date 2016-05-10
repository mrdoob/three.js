/**
 * @author mrdoob / http://mrdoob.com/
 * @author WestLangley / http://github.com/WestLangley
*/

THREE.FaceNormalsHelper = function ( object, size, hex, linewidth ) {

	// FaceNormalsHelper only supports THREE.Geometry

	this.object = object;

	this.size = ( size !== undefined ) ? size : 1;

	var color = ( hex !== undefined ) ? hex : 0xffff00;

	var width = ( linewidth !== undefined ) ? linewidth : 1;

	//

	var nNormals = 0;

	var objGeometry = this.object.geometry;

	if ( objGeometry instanceof THREE.Geometry ) {

		nNormals = objGeometry.faces.length;

	} else {

		console.warn( 'THREE.FaceNormalsHelper: only THREE.Geometry is supported. Use THREE.VertexNormalsHelper, instead.' );

	}

	//

	var geometry = new THREE.BufferGeometry();

	var positions = new THREE.Float32Attribute( nNormals * 2 * 3, 3 );

	geometry.addAttribute( 'position', positions );

	THREE.LineSegments.call( this, geometry, new THREE.LineBasicMaterial( { color: color, linewidth: width } ) );

	//

	this.matrixAutoUpdate = false;
	this.update();

};

THREE.FaceNormalsHelper.prototype = Object.create( THREE.LineSegments.prototype );
THREE.FaceNormalsHelper.prototype.constructor = THREE.FaceNormalsHelper;

THREE.FaceNormalsHelper.prototype.update = ( function () {

	var v1 = new THREE.Vector3();
	var v2 = new THREE.Vector3();
	var normalMatrix = new THREE.Matrix3();

	return function update() {

		this.object.updateMatrixWorld( true );

		normalMatrix.getNormalMatrix( this.object.matrixWorld );

		var matrixWorld = this.object.matrixWorld;

		var position = this.geometry.attributes.position;

		//

		var objGeometry = this.object.geometry;

		var vertices = objGeometry.vertices;

		var faces = objGeometry.faces;

		var idx = 0;

		for ( var i = 0, l = faces.length; i < l; i ++ ) {

			var face = faces[ i ];

			var normal = face.normal;

			v1.copy( vertices[ face.a ] )
				.add( vertices[ face.b ] )
				.add( vertices[ face.c ] )
				.divideScalar( 3 )
				.applyMatrix4( matrixWorld );

			v2.copy( normal ).applyMatrix3( normalMatrix ).normalize().multiplyScalar( this.size ).add( v1 );

			position.setXYZ( idx, v1.x, v1.y, v1.z );

			idx = idx + 1;

			position.setXYZ( idx, v2.x, v2.y, v2.z );

			idx = idx + 1;

		}

		position.needsUpdate = true;

		return this;

	};

}() );
