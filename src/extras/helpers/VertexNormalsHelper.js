/**
 * @author mrdoob / http://mrdoob.com/
 * @author WestLangley / http://github.com/WestLangley
 */

module.exports = VertexNormalsHelper;

var BufferAttribute = require( "../../core/BufferAttribute" ),
	BufferGeometry = require( "../../core/BufferGeometry" ),
	Geometry = require( "../../core/Geometry" ),
	LineSegments = require( "../../objects/LineSegments" ),
	LineBasicMaterial = require( "../../materials/LineBasicMaterial" ),
	Matrix3 = require( "../../math/Matrix3" ),
	Vector3 = require( "../../math/Vector3" );

function VertexNormalsHelper( object, size, hex, linewidth ) {

	this.object = object;

	this.size = ( size !== undefined ) ? size : 1;

	var color = ( hex !== undefined ) ? hex : 0xff0000;

	var width = ( linewidth !== undefined ) ? linewidth : 1;

	//

	var nNormals = 0;

	var objGeometry = this.object.geometry;

	if ( objGeometry instanceof Geometry ) {

		nNormals = objGeometry.faces.length * 3;

	} else if ( objGeometry instanceof BufferGeometry ) {

		nNormals = objGeometry.attributes.normal.count;

	}

	//

	var geometry = new BufferGeometry();

	var positions = new BufferAttribute.Float32Attribute( nNormals * 2 * 3, 3 );

	geometry.addAttribute( "position", positions );

	LineSegments.call( this, geometry, new LineBasicMaterial( { color: color, linewidth: width } ) );

	//

	this.matrixAutoUpdate = false;

	this.update();

}

VertexNormalsHelper.prototype = Object.create( LineSegments.prototype );
VertexNormalsHelper.prototype.constructor = VertexNormalsHelper;

VertexNormalsHelper.prototype.update = ( function () {

	var v1 = new Vector3();
	var v2 = new Vector3();
	var normalMatrix = new Matrix3();

	return function update() {

		var keys = [ "a", "b", "c" ];

		this.object.updateMatrixWorld( true );

		normalMatrix.getNormalMatrix( this.object.matrixWorld );

		var matrixWorld = this.object.matrixWorld;

		var position = this.geometry.attributes.position;

		//

		var objGeometry = this.object.geometry;

		var vertices, faces, face, idx,
			i, j, l, jl,
			vertex, normal,
			objPos, objNorm;

		if ( objGeometry instanceof Geometry ) {

			vertices = objGeometry.vertices;

			faces = objGeometry.faces;

			idx = 0;

			for ( i = 0, l = faces.length; i < l; i ++ ) {

				face = faces[ i ];

				for ( j = 0, jl = face.vertexNormals.length; j < jl; j ++ ) {

					vertex = vertices[ face[ keys[ j ] ] ];

					normal = face.vertexNormals[ j ];

					v1.copy( vertex ).applyMatrix4( matrixWorld );

					v2.copy( normal ).applyMatrix3( normalMatrix ).normalize().multiplyScalar( this.size ).add( v1 );

					position.setXYZ( idx, v1.x, v1.y, v1.z );

					idx = idx + 1;

					position.setXYZ( idx, v2.x, v2.y, v2.z );

					idx = idx + 1;

				}

			}

		} else if ( objGeometry instanceof BufferGeometry ) {

			objPos = objGeometry.attributes.position;

			objNorm = objGeometry.attributes.normal;

			idx = 0;

			// for simplicity, ignore index and drawcalls, and render every normal

			for ( j = 0, jl = objPos.count; j < jl; j ++ ) {

				v1.set( objPos.getX( j ), objPos.getY( j ), objPos.getZ( j ) ).applyMatrix4( matrixWorld );

				v2.set( objNorm.getX( j ), objNorm.getY( j ), objNorm.getZ( j ) );

				v2.applyMatrix3( normalMatrix ).normalize().multiplyScalar( this.size ).add( v1 );

				position.setXYZ( idx, v1.x, v1.y, v1.z );

				idx = idx + 1;

				position.setXYZ( idx, v2.x, v2.y, v2.z );

				idx = idx + 1;

			}

		}

		position.needsUpdate = true;

		return this;

	};

}() );
