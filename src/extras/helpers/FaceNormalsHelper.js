import { Matrix3 } from '../../math/Matrix3';
import { Vector3 } from '../../math/Vector3';
import { LineSegments } from '../../objects/LineSegments';
import { LineBasicMaterial } from '../../materials/LineBasicMaterial';
import { Float32Attribute } from '../../core/BufferAttribute';
import { BufferGeometry } from '../../core/BufferGeometry';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author WestLangley / http://github.com/WestLangley
*/

function FaceNormalsHelper ( object, size, hex, linewidth ) {
	this.isFaceNormalsHelper = this.isLineSegments = true;

	// FaceNormalsHelper only supports THREE.Geometry

	this.object = object;

	this.size = ( size !== undefined ) ? size : 1;

	var color = ( hex !== undefined ) ? hex : 0xffff00;

	var width = ( linewidth !== undefined ) ? linewidth : 1;

	//

	var nNormals = 0;

	var objGeometry = this.object.geometry;

	if ( (objGeometry && objGeometry.isGeometry) ) {

		nNormals = objGeometry.faces.length;

	} else {

		console.warn( 'THREE.FaceNormalsHelper: only THREE.Geometry is supported. Use THREE.VertexNormalsHelper, instead.' );

	}

	//

	var geometry = new BufferGeometry();

	var positions = new Float32Attribute( nNormals * 2 * 3, 3 );

	geometry.addAttribute( 'position', positions );

	LineSegments.call( this, geometry, new LineBasicMaterial( { color: color, linewidth: width } ) );

	//

	this.matrixAutoUpdate = false;
	this.update();

};

FaceNormalsHelper.prototype = Object.create( LineSegments.prototype );
FaceNormalsHelper.prototype.constructor = FaceNormalsHelper;

FaceNormalsHelper.prototype.update = ( function () {

	var v1 = new Vector3();
	var v2 = new Vector3();
	var normalMatrix = new Matrix3();

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


export { FaceNormalsHelper };