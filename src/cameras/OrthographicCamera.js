import { Camera } from './Camera.js';
import { Object3D } from '../core/Object3D.js';

function OrthographicCamera( left, right, top, bottom, near, far ) {

	Camera.call( this );

	this.type = 'OrthographicCamera';

	this.zoom = 1;
	this.view = null;

	this.left = ( left !== undefined ) ? left : - 1;
	this.right = ( right !== undefined ) ? right : 1;
	this.top = ( top !== undefined ) ? top : 1;
	this.bottom = ( bottom !== undefined ) ? bottom : - 1;

	this.near = ( near !== undefined ) ? near : 0.1;
	this.far = ( far !== undefined ) ? far : 2000;

	this.updateProjectionMatrix();

}

OrthographicCamera.prototype = Object.assign( Object.create( Camera.prototype ), {

	constructor: OrthographicCamera,

	isOrthographicCamera: true,

	copy: function ( source, recursive ) {

		Camera.prototype.copy.call( this, source, recursive );

		this.left = source.left;
		this.right = source.right;
		this.top = source.top;
		this.bottom = source.bottom;
		this.near = source.near;
		this.far = source.far;

		this.zoom = source.zoom;
		this.view = source.view === null ? null : Object.assign( {}, source.view );

		return this;

	},

	setViewOffset: function ( fullWidth, fullHeight, x, y, width, height ) {

		if ( this.view === null ) {

			this.view = {
				enabled: true,
				fullWidth: 1,
				fullHeight: 1,
				offsetX: 0,
				offsetY: 0,
				width: 1,
				height: 1
			};

		}

		this.view.enabled = true;
		this.view.fullWidth = fullWidth;
		this.view.fullHeight = fullHeight;
		this.view.offsetX = x;
		this.view.offsetY = y;
		this.view.width = width;
		this.view.height = height;

		this.updateProjectionMatrix();

	},

	clearViewOffset: function () {

		if ( this.view !== null ) {

			this.view.enabled = false;

		}

		this.updateProjectionMatrix();

	},

	updateProjectionMatrix: function () {

		const dx = ( this.right - this.left ) / ( 2 * this.zoom );
		const dy = ( this.top - this.bottom ) / ( 2 * this.zoom );
		const cx = ( this.right + this.left ) / 2;
		const cy = ( this.top + this.bottom ) / 2;

		let left = cx - dx;
		let right = cx + dx;
		let top = cy + dy;
		let bottom = cy - dy;

		if ( this.view !== null && this.view.enabled ) {

			const scaleW = ( this.right - this.left ) / this.view.fullWidth / this.zoom;
			const scaleH = ( this.top - this.bottom ) / this.view.fullHeight / this.zoom;

			left += scaleW * this.view.offsetX;
			right = left + scaleW * this.view.width;
			top -= scaleH * this.view.offsetY;
			bottom = top - scaleH * this.view.height;

		}

		this.projectionMatrix.makeOrthographic( left, right, top, bottom, this.near, this.far );

		this.projectionMatrixInverse.getInverse( this.projectionMatrix );

	},

	toJSON: function ( meta ) {

		const data = Object3D.prototype.toJSON.call( this, meta );

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


export { OrthographicCamera };
