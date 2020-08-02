import { Object3D } from '../../core/Object3D.js';

function ImmediateRenderObject( material ) {

	Object3D.call( this );

	this.material = material;
	this.render = function ( /* renderCallback */ ) {};

	this.hasPositions = false;
	this.hasNormals = false;
	this.hasColors = false;
	this.hasUvs = false;

	this.positionArray = null;
	this.normalArray = null;
	this.colorArray = null;
	this.uvArray = null;

	this.count = 0;

}

ImmediateRenderObject.prototype = Object.create( Object3D.prototype );
ImmediateRenderObject.prototype.constructor = ImmediateRenderObject;

ImmediateRenderObject.prototype.isImmediateRenderObject = true;


export { ImmediateRenderObject };
