THREE.TexturePatch = function ( baseTexture, patchVersion, patchTexture, x, y ) {

	this.baseTexture = baseTexture;

	this.patchVersion = patchVersion;
	this.patchTexture = patchTexture;

	this.x = x;
	this.y = y;

};

THREE.TexturePatch.prototype.dispose = function ( ) {

	var index = this.baseTexture.patchSet.indexOf( this );

	if ( index === -1 )
		return ;

	this.baseTexture.patchSet.splice( index, 1 );

};
