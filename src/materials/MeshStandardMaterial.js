/**
 * @author WestLangley / http://github.com/WestLangley
 * @author Ben Houston / bhouston / http://clara.io
 *
 * parameters = {
 *  color: <hex>,
 *  roughness: <float>,
 *  metalness: <float>,
 *  opacity: <float>,
 *
 *  map: new THREE.Texture( <Image> ),
 *
 *  lightMap: new THREE.Texture( <Image> ),
 *  lightMapIntensity: <float>
 *
 *  aoMap: new THREE.Texture( <Image> ),
 *  aoMapIntensity: <float>
 *
 *  emissive: <hex>,
 *  emissiveIntensity: <float>
 *  emissiveMap: new THREE.Texture( <Image> ),
 *
 *  bumpMap: new THREE.Texture( <Image> ),
 *  bumpScale: <float>,
 *
 *  normalMap: new THREE.Texture( <Image> ),
 *  normalScale: <Vector2>,
 *
 *  displacementMap: new THREE.Texture( <Image> ),
 *  displacementScale: <float>,
 *  displacementBias: <float>,
 *
 *  roughnessMap: new THREE.Texture( <Image> ),
 *
 *  metalnessMap: new THREE.Texture( <Image> ),
 *
 *  alphaMap: new THREE.Texture( <Image> ),
 *
 *  envMap: new THREE.CubeTexture( [posx, negx, posy, negy, posz, negz] ),
 *  envMapIntensity: <float>
 *
 *  refractionRatio: <float>,
 *
 *  shading: THREE.SmoothShading,
 *  blending: THREE.PremultipliedAlphaNormalBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 *
 *  vertexColors: THREE.NoColors / THREE.VertexColors / THREE.FaceColors,
 *
 *  skinning: <bool>,
 *  morphTargets: <bool>,
 *  morphNormals: <bool>,
 *
 *	fog: <bool>
 * }
 */

THREE.MeshStandardMaterial = function ( parameters ) {

	THREE.Material.call( this );

	this.type = 'MeshStandardMaterial';

	this.color = new THREE.Color( 0xffffff ); // diffuse
	//this.map = null;
	this.mapSlot = new THREE.TextureSlot( "map", 0, false, false );

	this.roughness = 0.5;
	//this.roughnessMap = null;
	this.roughnessMapSlot = new THREE.TextureSlot( "roughnessMap", 0, false, false );

	this.metalness = 0.5;
	//this.metalnessMap = null;
	this.metalnessMapSlot = new THREE.TextureSlot( "metalnessMap", 0, false, false );

	this.emissive = new THREE.Color( 0x000000 );
	this.emissiveIntensity = 1.0;
	//this.emissiveMap = null;
	this.emissiveMapSlot = new THREE.TextureSlot( "emissiveMap", 0, false, false );

	//this.bumpMap = null;
	//this.bumpScale = 1;
	this.bumpMapSlot = new THREE.TextureSlot( "bumpMap", 0, false, true );

	//this.normalMap = null;
	this.normalScale = new THREE.Vector2( 1, 1 );
	this.normalMapSlot = new THREE.TextureSlot( "normalMap", 0, false, false );

	//this.displacementMap = null;
	//this.displacementScale = 1;
	//this.displacementBias = 0;
	this.displacementMapSlot = new THREE.TextureSlot( "displacementMap", 0, false, true );

	//this.lightMap = null;
	//this.lightMapIntensity = 1.0;
	this.lightMapSlot = new THREE.TextureSlot( "lightMap", 1, false, true );

	//this.aoMap = null;
	this.aoMapIntensity = 1.0;
	this.aoMapSlot = new THREE.TextureSlot( "aoMap", 1, false, true );

	//this.alphaMap = null;
	this.alphaMapSlot = new THREE.TextureSlot( "alphaMap", 0, false, false );

	this.envMap = null;
	this.envMapIntensity = 1.0;

	this.refractionRatio = 0.98;

	this.fog = true;

	this.shading = THREE.SmoothShading;
	this.blending = THREE.PremultipliedAlphaBlending;

	this.wireframe = false;
	this.wireframeLinewidth = 1;
	this.wireframeLinecap = 'round';
	this.wireframeLinejoin = 'round';

	this.vertexColors = THREE.NoColors;

	this.skinning = false;
	this.morphTargets = false;
	this.morphNormals = false;

	this.setValues( parameters );

};

THREE.MeshStandardMaterial.prototype = Object.create( THREE.Material.prototype );
THREE.MeshStandardMaterial.prototype.constructor = THREE.MeshStandardMaterial;

var closure = function () {
	var propertyMappings = {
		"map": {
		  get: function() {
				return this.mapSlot.texture;
		  },
			set: function( value ) {
				this.mapSlot.texture = value;
			}
		},
		"lightMap": {
		  get: function() {
				return this.lightMapSlot.texture;
		  },
			set: function( value ) {
				this.lightMapSlot.texture = value;
			}
		},
		"lightMapIntensity": {
		  get: function() {
				return this.lightMapSlot.texelScale;
		  },
			set: function( value ) {
				this.lightMapSlot.texelTransform = true;
				this.lightMapSlot.texelScale = value;
			}
		},
		"aoMap": {
		  get: function() {
				return this.aoMapSlot.texture;
		  },
			set: function( value ) {
				this.aoMapSlot.texture = value;
			}
		},
		"emissiveMap": {
		  get: function() {
				return this.emissiveMapSlot.texture;
		  },
			set: function( value ) {
				this.emissiveMapSlot.texture = value;
			}
		},
		"bumpMap": {
		  get: function() {
				return this.bumpMapSlot.texture;
		  },
			set: function( value ) {
				this.bumpMapSlot.texture = value;
			}
		},
		"bumpScale": {
		  get: function() {
				return this.bumpMapSlot.texelScale;
		  },
			set: function( value ) {
				this.bumpMapSlot.texelTransform = true;
				this.bumpMapSlot.texelScale = value;
			}
		},
		"normalMap": {
		  get: function() {
				return this.normalMapSlot.texture;
		  },
			set: function( value ) {
				this.normalMapSlot.texture = value;
			}
		},
		"displacementMap": {
		  get: function() {
				return this.displacementMapSlot.texture;
		  },
			set: function( value ) {
				this.displacementMapSlot.texture = value;
			}
		},
		"displacementScale": {
		  get: function() {
				return this.displacementMapSlot.texelScale;
		  },
			set: function( value ) {
				this.displacementMapSlot.texelTransform = true;
				this.displacementMapSlot.texelScale = value;
			}
		},
		"displacementBias": {
		  get: function() {
				return this.displacementMapSlot.texelOffset;
		  },
			set: function( value ) {
				this.displacementMapSlot.texelTransform = true;
				this.displacementMapSlot.texelOffset = value;
			}
		},
		"roughnessMap": {
		  get: function() {
				return this.roughnessMapSlot.texture;
		  },
			set: function( value ) {
				this.roughnessMapSlot.texture = value;
			}
		},
		"metalnessMap": {
		  get: function() {
				return this.metalnessMapSlot.texture;
		  },
			set: function( value ) {
				this.metalnessMapSlot.texture = value;
			}
		},
		"alphaMap": {
		  get: function() {
				return this.alphaMapSlot.texture;
		  },
			set: function( value ) {
				this.alphaMapSlot.texture = value;
			}
		}
	};
	for( var propertyName in propertyMappings ) {
		Object.defineProperty(THREE.MeshStandardMaterial.prototype, propertyName, propertyMappings[ propertyName ] );
	}
}();

THREE.MeshStandardMaterial.prototype.copy = function ( source ) {

	THREE.Material.prototype.copy.call( this, source );

	this.color.copy( source.color );
	this.mapSlot.copy( source.mapSlot );

	this.roughness = source.roughness;
	this.roughnessMapSlot.copy( source.roughnessMapSlot );

	this.metalness = source.metalness;
	this.metalnessMapSlot.copy( source.metalnessMapSlot );

	this.lightMapSlot.copy( source.lightMapSlot );

	this.aoMapIntensity = source.aoMapIntensity;
	this.aoMapSlot.copy( source.aoMapSlot );

	this.emissive.copy( source.emissive );
	this.emissiveIntensity = source.emissiveIntensity;
	this.emissiveMapSlot.copy( source.emissiveMapSlot );

	this.bumpMapSlot.copy( source.bumpMapSlot );

	this.normalScale.copy( source.normalScale );
	this.normalMapSlot.copy( source.normalMapSlot );

	this.displacementMapSlot.copy( source.displacementMapSlot );

	this.alphaMapSlot.copy( source.alphaMapSlot );

	this.envMap = source.envMap;
	this.envMapIntensity = source.envMapIntensity;

	this.refractionRatio = source.refractionRatio;

	this.fog = source.fog;

	this.shading = source.shading;

	this.wireframe = source.wireframe;
	this.wireframeLinewidth = source.wireframeLinewidth;
	this.wireframeLinecap = source.wireframeLinecap;
	this.wireframeLinejoin = source.wireframeLinejoin;

	this.vertexColors = source.vertexColors;

	this.skinning = source.skinning;
	this.morphTargets = source.morphTargets;
	this.morphNormals = source.morphNormals;

	return this;

};
