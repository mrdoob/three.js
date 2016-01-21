/**
 * @author arcanis / http://arcanis.fr/
 */

THREE.GridTexture = function ( cellWidth, cellHeight, cellCountX, cellCountY, format, type, mapping, magFilter, minFilter, anisotropy ) {

	var width = cellWidth * cellCountX;
	var height = cellHeight * cellCountY;

	var data = new Uint8Array( width * height * 4 );

	var wrapS = THREE.ClampToEdgeWrapping;
	var wrapT = THREE.ClampToEdgeWrapping;

	THREE.DataTexture.call( this, data, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy );

	this.gridSize = new THREE.Vector2( width, height );

	this.cellSize = new THREE.Vector2( cellWidth, cellHeight );
	this.cellUvSize = this.cellSize.clone().divide( this.gridSize );
	this.cellCount = new THREE.Vector2( cellCountX, cellCountY );

	this.availableCells = [];
	this.activeLocators = {};

	for ( var cellY = 0; cellY < cellCountY; ++ cellY )
		for ( var cellX = 0; cellX < cellCountX; ++ cellX )
			this.availableCells.push( new THREE.Vector2( cellX, cellY ) );

	this.needsUpdate = true;

};

THREE.GridTexture.prototype = Object.create( THREE.DataTexture.prototype );
THREE.GridTexture.prototype.constructor = THREE.GridTexture;

THREE.GridTexture.prototype.getLocator = function ( id ) {

	if ( Object.prototype.hasOwnProperty.call( this.activeLocators, id ) ) {

		var locator = this.activeLocators[ id ];
		locator.increaseRefCount();

		return [ locator, false ];

	} else {

		var position = this.findEmptyCell();
		var locator = this.activeLocators[ id ] = new THREE.GridTextureLocator( this, id, position );

		return [ locator, true ];

	}

};

THREE.GridTexture.prototype.destroyLocator = function ( locator ) {

	if ( locator.textureGrid !== this )
		throw new Error( );

	if ( locator.refCount !== 0 )
		throw new Error( );

	delete this.activeLocators[ locator.id ];
	this.availableCells.push( locator.position );

	locator.destroy();

};

THREE.GridTexture.prototype.findEmptyCell = function ( locator ) {

	if ( this.availableCells.length === 0 ) {

		var ids = Object.keys( this.activeLocators );
		var locator;

		for ( var i = 0; i < il; ++ i )
			if ( this.activeLocators[ ids[ i ] ].refCount === 0 )
				break ;

		if ( i == il )
			throw new Error( 'Slot allocation failed' );

		this.destroyLocator( this.activeLocators[ ids[ i ] ] );

	}

	return this.availableCells.shift();

};
