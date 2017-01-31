import { Camera } from './Camera';
import { Object3D } from '../core/Object3D';

/**
 * @author alteredq / http://alteredqualia.com/
 * @author arose / http://github.com/arose
 */

function AutoSizingOrthographicCamera( height, near, far ) {

	Camera.call( this );

	this.type = 'AutoSizingOrthographicCamera';

	this.zoom = 1;
	this.view = null;

	this.height = height;
    this.aspect = 1;

	this.near = ( near !== undefined ) ? near : 0.1;
	this.far = ( far !== undefined ) ? far : 2000;

	this.updateProjectionMatrix();

}

AutoSizingOrthographicCamera.prototype = Object.assign( Object.create( Camera.prototype ), {

	constructor: AutoSizingOrthographicCamera,

	isOrthographicCamera: true,

	copy: function ( source ) {

		Camera.prototype.copy.call( this, source );

		this.height = source.height;
		this.near = source.near;
		this.far = source.far;

		this.zoom = source.zoom;
		this.view = source.view === null ? null : Object.assign( {}, source.view );

		return this;

	},

	updateProjectionMatrix: function () {

		var base = this.height;
		var halfHeight =  base / 2;
		var halfWidth = halfHeight * this.aspect;
		var top = halfHeight;
		var bottom = -halfHeight;
		var left = -halfWidth;
		var right = halfWidth;

		var dx = ( right - left ) / ( 2 * this.zoom );
		var dy = ( top - bottom ) / ( 2 * this.zoom );
		var cx = ( right + left ) / 2;
		var cy = ( top + bottom ) / 2;

		var left = cx - dx;
		var right = cx + dx;
		var top = cy + dy;
		var bottom = cy - dy;

		this.projectionMatrix.makeOrthographic( left, right, top, bottom, this.near, this.far );

	},

	updateCameraBasedOnRenderSizes: function ( width, height ) {

		this.aspect = width / height;
		camera.updateProjectionMatrix();

	}

	toJSON: function ( meta ) {

		var data = Object3D.prototype.toJSON.call( this, meta );

		data.object.zoom = this.zoom;
		data.object.left = this.left;
		data.object.right = this.right;
		data.object.top = this.top;
		data.object.bottom = this.bottom;
		data.object.near = this.near;
		data.object.far = this.far;

		if ( this.view !== null ) data.object.view = Object.assign( {}, this.view );

		return data;

	}

} );


export { AutoSizingOrthographicCamera };
