import { Camera } from './Camera.js';

class OrthographicCamera extends Camera {

	constructor( left = - 1, right = 1, top = 1, bottom = - 1, near = 0.1, far = 2000 ) {

		super();

		this.type = 'OrthographicCamera';

		this.zoom = 1;
		this.view = null;

		this.left = left;
		this.right = right;
		this.top = top;
		this.bottom = bottom;

		this.near = near;
		this.far = far;

		this.updateProjectionMatrix();

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.left = source.left;
		this.right = source.right;
		this.top = source.top;
		this.bottom = source.bottom;
		this.near = source.near;
		this.far = source.far;

		this.zoom = source.zoom;

		this.projectionOffset = { ...source.projectionOffset };

		this.view = source.view === null ? null : { ...source.view };

		return this;

	}

	setViewOffset( fullWidth, fullHeight, x, y, width, height ) {

		if ( this.view === null ) {

			const scope = this;

			const viewHandler = {
				set: function ( target, property, value ) {

					scope.clearProjectionOffset();

					target[ property ] = value;

					if ( target.enabled ) {

						// calculate projection offset
						const { fullWidth, fullHeight, offsetX, offsetY, width, height } = target;
						const { right, left, top, bottom } = scope.projectionParams;
						const projectionHeight = top - bottom;
						const projectionwidth = right - left;

						const leftOffset = offsetX * projectionwidth / fullWidth;
						const rightOffset = left + leftOffset + projectionwidth * width / fullWidth - right;
						const topOffset = - offsetY * projectionHeight / fullHeight;
						const bottomOffset = top + topOffset - projectionHeight * height / fullHeight - bottom;

						scope.setProjectionOffset( rightOffset, leftOffset, topOffset, bottomOffset );

					}

					return true;

				},
			};

			this.view = new Proxy( {
				enabled: true,
				fullWidth: 1,
				fullHeight: 1,
				offsetX: 0,
				offsetY: 0,
				width: 1,
				height: 1
			}, viewHandler );

		}

		this.view.enabled = true;
		this.view.fullWidth = fullWidth;
		this.view.fullHeight = fullHeight;
		this.view.offsetX = x;
		this.view.offsetY = y;
		this.view.width = width;
		this.view.height = height;

	}

	clearViewOffset() {

		if ( this.view !== null ) {

			this.view.enabled = false;

		}

	}

	setProjectionOffset( right, left, top, bottom ) {

		this.projectionOffset = {
			right,
			left,
			top,
			bottom,
		};

		this.updateProjectionMatrix();

	}

	clearProjectionOffset() {

		this.projectionOffset = {
			right: 0,
			left: 0,
			top: 0,
			bottom: 0,
		};

		this.updateProjectionMatrix();

	}

	updateProjectionMatrix() {

		const dx = ( this.right - this.left ) / ( 2 * this.zoom );
		const dy = ( this.top - this.bottom ) / ( 2 * this.zoom );
		const cx = ( this.right + this.left ) / 2;
		const cy = ( this.top + this.bottom ) / 2;

		let left = cx - dx;
		let right = cx + dx;
		let top = cy + dy;
		let bottom = cy - dy;

		const projectionOffset = this.projectionOffset;
		top += projectionOffset.top;
		bottom += projectionOffset.bottom;
		left += projectionOffset.left;
		right += projectionOffset.right;

		this.projectionMatrix.makeOrthographic( left, right, top, bottom, this.near, this.far );

		this.projectionMatrixInverse.copy( this.projectionMatrix ).invert();

		this.projectionParams.right = right;
		this.projectionParams.left = left;
		this.projectionParams.top = top;
		this.projectionParams.bottom = bottom;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.zoom = this.zoom;
		data.object.left = this.left;
		data.object.right = this.right;
		data.object.top = this.top;
		data.object.bottom = this.bottom;
		data.object.near = this.near;
		data.object.far = this.far;

		data.object.projectionOffset = { ...this.projectionOffset };

		if ( this.view !== null ) data.object.view = { ...this.view };

		return data;

	}

}

OrthographicCamera.prototype.isOrthographicCamera = true;

export { OrthographicCamera };
