/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Material = function () {

	this.id = THREE.MaterialCount ++;

	this.name = '';

	this.side = THREE.FrontSide;

	this.opacity = 1;
	this.transparent = false;

	this.blending = THREE.NormalBlending;

	this.blendSrc = THREE.SrcAlphaFactor;
	this.blendDst = THREE.OneMinusSrcAlphaFactor;
	this.blendEquation = THREE.AddEquation;

	this.depthTest = true;
	this.depthWrite = true;

	this.polygonOffset = false;
	this.polygonOffsetFactor = 0;
	this.polygonOffsetUnits = 0;

	this.alphaTest = 0;

	this.overdraw = false; // Boolean for fixing antialiasing gaps in CanvasRenderer

	this.visible = true;

	this.needsUpdate = true;

};

THREE.Material.prototype.setValues = function ( values ) {

	if ( values === undefined ) return;

	for ( var key in values ) {

		if ( key === 'id' || key === 'setValues' || key === 'clone' ) continue;

		var value = values[ key ];

		if ( this[ key ] !== undefined ) {

			if ( this[ key ] instanceof THREE.Color ) {
				
				if ( value instanceof THREE.Color ) {

					this[ key ].copy( value );

				} else {

					this[ key ].setHex( value );

				}
				
			} else if ( this[ key ] instanceof THREE.Vector3 ) {

				this[ key ].copy( value );

			} else {

				this[ key ] = value;

			}

		}

	}

};

THREE.Material.prototype.clone = function () {

	return new THREE.Material( this );

};

THREE.MaterialCount = 0;
