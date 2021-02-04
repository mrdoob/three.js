import {
	BufferGeometry,
	Float32BufferAttribute,
	LineSegments,
	LineBasicMaterial,
	Matrix3,
	Vector3
} from '../../../build/three.module.js';

var _v1 = new Vector3();
var _v2 = new Vector3();
var _normalMatrix = new Matrix3();

function VertexNormalsHelper( object, size, hex ) {

	this.object = object;

	this.size = ( size !== undefined ) ? size : 0.1;

	var color = ( hex !== undefined ) ? hex : 0xff0000;

	//

	var nNormals = 0;

	var objGeometry = this.object.geometry;

	if ( objGeometry && objGeometry.isGeometry ) {

		console.error( 'THREE.VertexNormalsHelper no longer supports Geometry. Use BufferGeometry instead.' );
		return;

	} else if ( objGeometry && objGeometry.isBufferGeometry ) {

		nNormals = objGeometry.attributes.normal.count;

	}

	//

	var geometry = new BufferGeometry();

	var positions = new Float32BufferAttribute( nNormals * 2 * 3, 3 );

	geometry.setAttribute( 'position', positions );

	LineSegments.call( this, geometry, new LineBasicMaterial( { color: color, toneMapped: false } ) );

	this.type = 'VertexNormalsHelper';

	//

	this.matrixAutoUpdate = false;

	this.update();

}

VertexNormalsHelper.prototype = Object.create( LineSegments.prototype );
VertexNormalsHelper.prototype.constructor = VertexNormalsHelper;

VertexNormalsHelper.prototype.update = function () {

	this.object.updateMatrixWorld( true );

	_normalMatrix.getNormalMatrix( this.object.matrixWorld );

	var matrixWorld = this.object.matrixWorld;

	var position = this.geometry.attributes.position;

	//

	var objGeometry = this.object.geometry;

	if ( objGeometry && objGeometry.isGeometry ) {

		console.error( 'THREE.VertexNormalsHelper no longer supports Geometry. Use BufferGeometry instead.' );
		return;

	} else if ( objGeometry && objGeometry.isBufferGeometry ) {

		var objPos = objGeometry.attributes.position;

		var objNorm = objGeometry.attributes.normal;

		var idx = 0;

		// for simplicity, ignore index and drawcalls, and render every normal

		for ( var j = 0, jl = objPos.count; j < jl; j ++ ) {

			_v1.set( objPos.getX( j ), objPos.getY( j ), objPos.getZ( j ) ).applyMatrix4( matrixWorld );

			_v2.set( objNorm.getX( j ), objNorm.getY( j ), objNorm.getZ( j ) );

			_v2.applyMatrix3( _normalMatrix ).normalize().multiplyScalar( this.size ).add( _v1 );

			position.setXYZ( idx, _v1.x, _v1.y, _v1.z );

			idx = idx + 1;

			position.setXYZ( idx, _v2.x, _v2.y, _v2.z );

			idx = idx + 1;

		}

	}

	position.needsUpdate = true;

};


export { VertexNormalsHelper };
