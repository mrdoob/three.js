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

	if ( values === undefined ) values = {};

	for ( var key in values ) {

		var value = values[ key ];

		if ( this[ key ] !== undefined ) {

			switch ( key ) {

				case "id":
					break;

				case "color":
				case "ambient":
				case "emissive":
				case "specular":

					if ( value instanceof THREE.Color ) {

						this[ key ].copy( value );

					} else {

						this[ key ].setHex( value );

					}

					break;

				case "wrapRGB":

					this[ key ].copy( value );

					break;

				default:

					this[ key ] = value;

			}

		}

	}

};

THREE.Material.prototype.clone = function () {

	return new THREE.Material( this );

};

THREE.MaterialCount = 0;
