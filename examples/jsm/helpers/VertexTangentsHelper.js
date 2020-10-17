/**
 * @author WestLangley / http://github.com/WestLangley
 */

import {
	BufferGeometry,
	Float32BufferAttribute,
	LineSegments,
	LineBasicMaterial,
	Vector3
} from '../../../build/three.module.js';

var _v1 = new Vector3();
var _v2 = new Vector3();

function VertexTangentsHelper( object, size, hex ) {

	this.object = object;

	this.size = ( size !== undefined ) ? size : 1;

	var color = ( hex !== undefined ) ? hex : 0x00ffff;

	//

	var objGeometry = this.object.geometry;

	if ( ! ( objGeometry && objGeometry.isBufferGeometry ) ) {

		console.error( 'THREE.VertexTangentsHelper: geometry not an instance of THREE.BufferGeometry.', objGeometry );
		return;

	}

	var nTangents = objGeometry.attributes.tangent.count;

	//

	var geometry = new BufferGeometry();

	var positions = new Float32BufferAttribute( nTangents * 2 * 3, 3 );

	geometry.setAttribute( 'position', positions );

	LineSegments.call( this, geometry, new LineBasicMaterial( { color: color, toneMapped: false } ) );

	this.type = 'VertexTangentsHelper';

	//

	this.matrixAutoUpdate = false;

	this.update();

}

VertexTangentsHelper.prototype = Object.create( LineSegments.prototype );
VertexTangentsHelper.prototype.constructor = VertexTangentsHelper;

VertexTangentsHelper.prototype.update = function () {

	this.object.updateMatrixWorld( true );

	var matrixWorld = this.object.matrixWorld;

	var position = this.geometry.attributes.position;

	//

	var objGeometry = this.object.geometry;

	var objPos = objGeometry.attributes.position;

	var objTan = objGeometry.attributes.tangent;

	var idx = 0;

	// for simplicity, ignore index and drawcalls, and render every tangent

	for ( var j = 0, jl = objPos.count; j < jl; j ++ ) {

		_v1.set( objPos.getX( j ), objPos.getY( j ), objPos.getZ( j ) ).applyMatrix4( matrixWorld );

		_v2.set( objTan.getX( j ), objTan.getY( j ), objTan.getZ( j ) );

		_v2.transformDirection( matrixWorld ).multiplyScalar( this.size ).add( _v1 );

		position.setXYZ( idx, _v1.x, _v1.y, _v1.z );

		idx = idx + 1;

		position.setXYZ( idx, _v2.x, _v2.y, _v2.z );

		idx = idx + 1;

	}

	position.needsUpdate = true;

};

export { VertexTangentsHelper };
