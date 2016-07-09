import { LineSegments } from '../../objects/LineSegments';
import { LineBasicMaterial } from '../../materials/LineBasicMaterial';
import { WireframeGeometry } from '../geometries/WireframeGeometry';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function WireframeHelper ( object, hex ) {
	this.isWireframeHelper = this.isLineSegments = true;

	var color = ( hex !== undefined ) ? hex : 0xffffff;

	LineSegments.call( this, new WireframeGeometry( object.geometry ), new LineBasicMaterial( { color: color } ) );

	this.matrix = object.matrixWorld;
	this.matrixAutoUpdate = false;

};

WireframeHelper.prototype = Object.create( LineSegments.prototype );
WireframeHelper.prototype.constructor = WireframeHelper;


export { WireframeHelper };