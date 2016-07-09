import { LineSegments } from '../../objects/LineSegments';
import { LineBasicMaterial } from '../../materials/LineBasicMaterial';
import { EdgesGeometry } from '../geometries/EdgesGeometry';

/**
 * @author WestLangley / http://github.com/WestLangley
 * @param object THREE.Mesh whose geometry will be used
 * @param hex line color
 * @param thresholdAngle the minimum angle (in degrees),
 * between the face normals of adjacent faces,
 * that is required to render an edge. A value of 10 means
 * an edge is only rendered if the angle is at least 10 degrees.
 */

function EdgesHelper ( object, hex, thresholdAngle ) {
	this.isEdgesHelper = this.isLineSegments = true;

	var color = ( hex !== undefined ) ? hex : 0xffffff;

	LineSegments.call( this, new EdgesGeometry( object.geometry, thresholdAngle ), new LineBasicMaterial( { color: color } ) );

	this.matrix = object.matrixWorld;
	this.matrixAutoUpdate = false;

};

EdgesHelper.prototype = Object.create( LineSegments.prototype );
EdgesHelper.prototype.constructor = EdgesHelper;


export { EdgesHelper };