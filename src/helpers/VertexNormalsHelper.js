import { Matrix3 } from '../math/Matrix3';
import { Vector3 } from '../math/Vector3';
import { LineSegments } from '../objects/LineSegments';
import { LineBasicMaterial } from '../materials/LineBasicMaterial';
import { Float32BufferAttribute } from '../core/BufferAttribute';
import { BufferGeometry } from '../core/BufferGeometry';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author WestLangley / http://github.com/WestLangley
*/

function VertexNormalsHelper( object, size, hex, linewidth ) {

	this.object = object;

	this.size = ( size !== undefined ) ? size : 1;

	var color = ( hex !== undefined ) ? hex : 0xff0000;

	var width = ( linewidth !== undefined ) ? linewidth : 1;

	//

	var nNormals = 0;

	var objGeometry = this.object.geometry;

	if ( objGeometry && objGeometry.isGeometry ) {

		nNormals = objGeometry.faces.length * 3;

	} else if ( objGeometry && objGeometry.isBufferGeometry ) {

		nNormals = objGeometry.attributes.normal.count;

	}

	//

	var geometry = new BufferGeometry();

	var positions = new Float32BufferAttribute( nNormals * 2 * 3, 3 );

	geometry.addAttribute( 'position', positions );

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

		var keys = [ 'a', 'b', 'c' ];

		this.object.updateMatrixWorld( true );

		normalMatrix.getNormalMatrix( this.object.matrixWorld );

		var matrixWorld = this.object.matrixWorld;

		var position = this.geometry.attributes.position;

		//

		var objGeometry = this.object.geometry;

		if ( objGeometry && objGeometry.isGeometry ) {

			var vertices = objGeometry.vertices;

			var faces = objGeometry.faces;

			var idx = 0;

			for ( var i = 0, l = faces.length; i < l; i ++ ) {

				var face = faces[ i ];

				for ( var j = 0, jl = face.vertexNormals.length; j < jl; j ++ ) {

					var vertex = vertices[ face[ keys[ j ] ] ];

					var normal = face.vertexNormals[ j ];

					v1.copy( vertex ).applyMatrix4( matrixWorld );

					v2.copy( normal ).applyMatrix3( normalMatrix ).normalize().multiplyScalar( this.size ).add( v1 );

					position.setXYZ( idx, v1.x, v1.y, v1.z );

					idx = idx + 1;

					position.setXYZ( idx, v2.x, v2.y, v2.z );

					idx = idx + 1;

				}

			}

		} else if ( objGeometry && objGeometry.isBufferGeometry ) {

			var objPos = objGeometry.attributes.position;

			var objNorm = objGeometry.attributes.normal;

			var idx = 0;

			// for simplicity, ignore index and drawcalls, and render every normal

			for ( var j = 0, jl = objPos.count; j < jl; j ++ ) {

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


export { VertexNormalsHelper };
