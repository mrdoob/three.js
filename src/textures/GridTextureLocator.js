/**
 * @author arcanis / http://arcanis.fr/
 */

THREE.GridTextureLocator = function ( textureGrid, id, position ) {

	this.textureGrid = textureGrid;
	this.id = id;

	this.position = position;

	this.uvSystem = {};

	this.uvSystem.width = textureGrid.cellUvSize.width;
	this.uvSystem.height = textureGrid.cellUvSize.height;

	this.uvSystem.topLeft = position.clone().multiply( textureGrid.cellUvSize );
	this.uvSystem.bottomRight = this.uvSystem.topLeft.clone().add( textureGrid.cellUvSize );
	this.uvSystem.topRight = this.uvSystem.topLeft.clone().setX( this.uvSystem.bottomRight.x );
	this.uvSystem.bottomLeft = this.uvSystem.topLeft.clone().setY( this.uvSystem.bottomRight.y );

	this.refCount = 1;
	this.patch = null;

};

THREE.GridTextureLocator.prototype.increaseRefCount = function () {

	this.refCount += 1;

};

THREE.GridTextureLocator.prototype.dispose = function () {

	if ( this.refCount === 0 )
		throw new Error( 'An locator has been disposed too many times' );

	this.refCount -= 1;

};

THREE.GridTextureLocator.prototype.destroy = function () {

	if ( this.refCount !== 0 )
		throw new Error( 'A locator must be fully disposed before being destroyed' );

	if ( this.patch )
		this.patch.dispose( );

	this.textureGrid = null;

};

THREE.GridTextureLocator.prototype.setTexture = function ( texture ) {

	if ( this.textureGrid === null )
		return ;

	var x = this.position.x * this.textureGrid.cellSize.width;
	var y = this.position.y * this.textureGrid.cellSize.height;

	if ( this.patch )
		this.patch.dispose();

	this.patch = this.textureGrid.patchTexture( texture, x, y );

};
