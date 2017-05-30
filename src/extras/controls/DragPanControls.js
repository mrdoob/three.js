THREE.DragPanControls	= function(object, domElement)
{
	this._object	= object;
	this._domElement= domElement || document;

	// parameters that you can change after initialisation
	this.target	= new THREE.Vector3(0, 0, 0);
	this.speedX	= 0.03;
	this.speedY	= 0.03;
	this.rangeX	= -40;
	this.rangeY	= +40;

	// private variables
	this._mouseX	= 0;
	this._mouseY	= 0;

	var _this	= this;
	this._$onMouseMove	= function(){ _this._onMouseMove.apply(_this, arguments); };
	this._$onTouchStart	= function(){ _this._onTouchStart.apply(_this, arguments); };
	this._$onTouchMove	= function(){ _this._onTouchMove.apply(_this, arguments); };

	this._domElement.addEventListener( 'mousemove', this._$onMouseMove, false );
	this._domElement.addEventListener( 'touchstart', this._$onTouchStart,false );
	this._domElement.addEventListener( 'touchmove', this._$onTouchMove, false );
}

THREE.DragPanControls.prototype.destroy	= function()
{
	this._domElement.removeEventListener( 'mousemove', this._$onMouseMove, false );
	this._domElement.removeEventListener( 'touchstart', this._$onTouchStart,false );
	this._domElement.removeEventListener( 'touchmove', this._$onTouchMove, false );
}

THREE.DragPanControls.prototype.update	= function(event)
{
	this._object.position.x += ( this._mouseX * this.rangeX - this._object.position.x ) * this.speedX;
	this._object.position.y += ( this._mouseY * this.rangeY - this._object.position.y ) * this.speedY;
	this._object.lookAt( this.target );
}

THREE.DragPanControls.prototype._onMouseMove	= function(event)
{
	this._mouseX	= ( event.clientX / window.innerWidth ) - 0.5;
	this._mouseY	= ( event.clientY / window.innerHeight) - 0.5;
}

THREE.DragPanControls.prototype._onTouchStart	= function(event)
{
	if( event.touches.length != 1 )	return;

	// no preventDefault to get click event on ios

	this._mouseX	= ( event.touches[ 0 ].pageX / window.innerWidth ) - 0.5;
	this._mouseY	= ( event.touches[ 0 ].pageY / window.innerHeight) - 0.5;
}

THREE.DragPanControls.prototype._onTouchMove	= function(event)
{
	if( event.touches.length != 1 )	return;

	event.preventDefault();

	this._mouseX	= ( event.touches[ 0 ].pageX / window.innerWidth ) - 0.5;
	this._mouseY	= ( event.touches[ 0 ].pageY / window.innerHeight) - 0.5;
}

