export class SplitscreenManager {

	constructor( editor ) {

		this.editor = editor;
		this.renderer = editor.renderer;
		this.composer = editor.composer;

		this.gutter = null;
		this.gutterMoving = false;
		this.gutterOffset = 0.6;

	}

	setSplitview( value ) {

		const nodeDOM = this.editor.domElement;
		const rendererContainer = this.renderer.domElement.parentNode;

		if ( value ) {

			this.addGutter( rendererContainer, nodeDOM );

		} else {

			this.removeGutter( rendererContainer, nodeDOM );

		}

	}

	addGutter( rendererContainer, nodeDOM ) {

		rendererContainer.style[ 'z-index' ] = 20;

		this.gutter = document.createElement( 'f-gutter' );

		nodeDOM.parentNode.appendChild( this.gutter );

		const onGutterMovement = () => {

			const offset = this.gutterOffset;

			this.gutter.style[ 'left' ] = 100 * offset + '%';
			rendererContainer.style[ 'left' ] = 100 * offset + '%';
			rendererContainer.style[ 'width' ] = 100 * ( 1 - offset ) + '%';
			nodeDOM.style[ 'width' ] = 100 * offset + '%';

		};

		this.gutter.addEventListener( 'mousedown', () => {

			this.gutterMoving = true;

		} );

		document.addEventListener( 'mousemove', ( event ) => {

			if ( this.gutter && this.gutterMoving ) {

				this.gutterOffset = Math.max( 0, Math.min( 1, event.clientX / window.innerWidth ) );
				onGutterMovement();

			}

		} );

		document.addEventListener( 'mouseup', () => {

			this.gutterMoving = false;

		} );

		onGutterMovement();

	}

	removeGutter( rendererContainer, nodeDOM ) {

		rendererContainer.style[ 'z-index' ] = 0;

		this.gutter.remove();
		this.gutter = null;

		rendererContainer.style[ 'left' ] = '0%';
		rendererContainer.style[ 'width' ] = '100%';
		nodeDOM.style[ 'width' ] = '100%';

	}

}
