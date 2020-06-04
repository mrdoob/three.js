console.warn( "THREE.SelectionHelper: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/index.html#manual/en/introduction/Import-via-modules." );
/**
 * @author HypnosNova / https://www.threejs.org.cn/gallery
 */

THREE.SelectionHelper = ( function () {

	function SelectionHelper( selectionBox, renderer, cssClassName ) {

		this.element = document.createElement( 'div' );
		this.element.classList.add( cssClassName );
		this.element.style.pointerEvents = 'none';

		this.renderer = renderer;

		this.startPoint = new THREE.Vector2();
		this.pointTopLeft = new THREE.Vector2();
		this.pointBottomRight = new THREE.Vector2();

		this.isDown = false;

		this.renderer.domElement.addEventListener( 'mousedown', function ( event ) {

			this.isDown = true;
			this.onSelectStart( event );

		}.bind( this ), false );

		this.renderer.domElement.addEventListener( 'mousemove', function ( event ) {

			if ( this.isDown ) {

				this.onSelectMove( event );

			}

		}.bind( this ), false );

		this.renderer.domElement.addEventListener( 'mouseup', function ( event ) {

			this.isDown = false;
			this.onSelectOver( event );

		}.bind( this ), false );

	}

	SelectionHelper.prototype.onSelectStart = function ( event ) {

		this.renderer.domElement.parentElement.appendChild( this.element );

		this.element.style.left = event.clientX + 'px';
		this.element.style.top = event.clientY + 'px';
		this.element.style.width = '0px';
		this.element.style.height = '0px';

		this.startPoint.x = event.clientX;
		this.startPoint.y = event.clientY;

	};

	SelectionHelper.prototype.onSelectMove = function ( event ) {

		this.pointBottomRight.x = Math.max( this.startPoint.x, event.clientX );
		this.pointBottomRight.y = Math.max( this.startPoint.y, event.clientY );
		this.pointTopLeft.x = Math.min( this.startPoint.x, event.clientX );
		this.pointTopLeft.y = Math.min( this.startPoint.y, event.clientY );

		this.element.style.left = this.pointTopLeft.x + 'px';
		this.element.style.top = this.pointTopLeft.y + 'px';
		this.element.style.width = ( this.pointBottomRight.x - this.pointTopLeft.x ) + 'px';
		this.element.style.height = ( this.pointBottomRight.y - this.pointTopLeft.y ) + 'px';

	};

	SelectionHelper.prototype.onSelectOver = function () {

		this.element.parentElement.removeChild( this.element );

	};

	return SelectionHelper;

} )();
