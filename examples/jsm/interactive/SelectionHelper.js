import { Vector2 } from 'three';

class SelectionHelper {

	constructor( renderer, cssClassName ) {

		this.element = document.createElement( 'div' );
		this.element.classList.add( cssClassName );
		this.element.style.pointerEvents = 'none';

		this.renderer = renderer;

		this.startPoint = new Vector2();
		this.pointTopLeft = new Vector2();
		this.pointBottomRight = new Vector2();

		this.isDown = false;
		this.enabled = true;

		this.onPointerDown = function ( event ) {

			if ( this.enabled === false ) return;

			this.isDown = true;
			this.onSelectStart( event );

		}.bind( this );

		this.onPointerMove = function ( event ) {

			if ( this.enabled === false ) return;

			if ( this.isDown ) {

				this.onSelectMove( event );

			}

		}.bind( this );

		this.onPointerUp = function ( ) {

			if ( this.enabled === false ) return;

			this.isDown = false;
			this.onSelectOver();

		}.bind( this );

		this.renderer.domElement.addEventListener( 'pointerdown', this.onPointerDown );
		this.renderer.domElement.addEventListener( 'pointermove', this.onPointerMove );
		this.renderer.domElement.addEventListener( 'pointerup', this.onPointerUp );

	}

	dispose() {

		this.renderer.domElement.removeEventListener( 'pointerdown', this.onPointerDown );
		this.renderer.domElement.removeEventListener( 'pointermove', this.onPointerMove );
		this.renderer.domElement.removeEventListener( 'pointerup', this.onPointerUp );

		this.element.remove(); // in case disposal happens while dragging

	}

	onSelectStart( event ) {

		this.element.style.display = 'none';

		this.renderer.domElement.parentElement.appendChild( this.element );

		this.element.style.left = event.clientX + 'px';
		this.element.style.top = event.clientY + 'px';
		this.element.style.width = '0px';
		this.element.style.height = '0px';

		this.startPoint.x = event.clientX;
		this.startPoint.y = event.clientY;

	}

	onSelectMove( event ) {

		this.element.style.display = 'block';

		this.pointBottomRight.x = Math.max( this.startPoint.x, event.clientX );
		this.pointBottomRight.y = Math.max( this.startPoint.y, event.clientY );
		this.pointTopLeft.x = Math.min( this.startPoint.x, event.clientX );
		this.pointTopLeft.y = Math.min( this.startPoint.y, event.clientY );

		this.element.style.left = this.pointTopLeft.x + 'px';
		this.element.style.top = this.pointTopLeft.y + 'px';
		this.element.style.width = ( this.pointBottomRight.x - this.pointTopLeft.x ) + 'px';
		this.element.style.height = ( this.pointBottomRight.y - this.pointTopLeft.y ) + 'px';

	}

	onSelectOver() {

		this.element.remove();

	}

}

export { SelectionHelper };
