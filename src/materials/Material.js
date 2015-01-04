/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Material = function () {

	Object.defineProperty( this, 'id', { value: THREE.MaterialIdCount ++ } );

	this.uuid = THREE.Math.generateUUID();

	this.name = '';
	this.type = 'Material';

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

	this.overdraw = 0; // Overdrawn pixels (typically between 0 and 1) for fixing antialiasing gaps in CanvasRenderer

	this.visible = true;

	this.needsUpdate = true;

};

THREE.Material.prototype = {

	constructor: THREE.Material,

	setValues: function ( values ) {

		if ( values === undefined ) return;

		for ( var key in values ) {

			var newValue = values[ key ];

			if ( newValue === undefined ) {

				console.warn( "THREE.Material: '" + key + "' parameter is undefined." );
				continue;

			}

			if ( key in this ) {

				var currentValue = this[ key ];

				if ( currentValue instanceof THREE.Color ) {

					currentValue.set( newValue );

				} else if ( currentValue instanceof THREE.Vector3 && newValue instanceof THREE.Vector3 ) {

					currentValue.copy( newValue );

				} else if ( key == 'overdraw' ) {

					// ensure overdraw is backwards-compatable with legacy boolean type
					this[ key ] = Number( newValue );

				} else {

					this[ key ] = newValue;

				}

			}

		}

	},

	toJSON: function () {

		var output = {
			metadata: {
				version: 4.2,
				type: 'material',
				generator: 'MaterialExporter'
			},
			uuid: this.uuid,
			type: this.type
		};

		if ( this.name !== "" ) output.name = this.name;

		if ( this instanceof THREE.MeshBasicMaterial ) {

			output.color = this.color.getHex();
			if ( this.vertexColors !== THREE.NoColors ) output.vertexColors = this.vertexColors;
			if ( this.blending !== THREE.NormalBlending ) output.blending = this.blending;
			if ( this.side !== THREE.FrontSide ) output.side = this.side;

		} else if ( this instanceof THREE.MeshLambertMaterial ) {

			output.color = this.color.getHex();
			output.ambient = this.ambient.getHex();
			output.emissive = this.emissive.getHex();
			if ( this.vertexColors !== THREE.NoColors ) output.vertexColors = this.vertexColors;
			if ( this.blending !== THREE.NormalBlending ) output.blending = this.blending;
			if ( this.side !== THREE.FrontSide ) output.side = this.side;

		} else if ( this instanceof THREE.MeshPhongMaterial ) {

			output.color = this.color.getHex();
			output.ambient = this.ambient.getHex();
			output.emissive = this.emissive.getHex();
			output.specular = this.specular.getHex();
			output.shininess = this.shininess;
			if ( this.vertexColors !== THREE.NoColors ) output.vertexColors = this.vertexColors;
			if ( this.blending !== THREE.NormalBlending ) output.blending = this.blending;
			if ( this.side !== THREE.FrontSide ) output.side = this.side;

		} else if ( this instanceof THREE.MeshNormalMaterial ) {

			if ( this.shading !== THREE.FlatShading ) output.shading = this.shading;
			if ( this.blending !== THREE.NormalBlending ) output.blending = this.blending;
			if ( this.side !== THREE.FrontSide ) output.side = this.side;

		} else if ( this instanceof THREE.MeshDepthMaterial ) {

			if ( this.blending !== THREE.NormalBlending ) output.blending = this.blending;
			if ( this.side !== THREE.FrontSide ) output.side = this.side;

		} else if ( this instanceof THREE.ShaderMaterial ) {

			output.uniforms = this.uniforms;
			output.vertexShader = this.vertexShader;
			output.fragmentShader = this.fragmentShader;

		} else if ( this instanceof THREE.SpriteMaterial ) {

			output.color = this.color.getHex();

		}

		if ( this.opacity < 1 ) output.opacity = this.opacity;
		if ( this.transparent !== false ) output.transparent = this.transparent;
		if ( this.wireframe !== false ) output.wireframe = this.wireframe;

		return output;

	},

	clone: function ( material ) {

		if ( material === undefined ) material = new THREE.Material();

		material.name = this.name;

		material.side = this.side;

		material.opacity = this.opacity;
		material.transparent = this.transparent;

		material.blending = this.blending;

		material.blendSrc = this.blendSrc;
		material.blendDst = this.blendDst;
		material.blendEquation = this.blendEquation;

		material.depthTest = this.depthTest;
		material.depthWrite = this.depthWrite;

		material.polygonOffset = this.polygonOffset;
		material.polygonOffsetFactor = this.polygonOffsetFactor;
		material.polygonOffsetUnits = this.polygonOffsetUnits;

		material.alphaTest = this.alphaTest;

		material.overdraw = this.overdraw;

		material.visible = this.visible;

		return material;

	},

	dispose: function () {

		this.dispatchEvent( { type: 'dispose' } );

	},
	refreshUniformsCommon: function ( uniforms, gammaInput ) {

		uniforms.opacity.value = this.opacity;

		if ( gammaInput ) {

			uniforms.diffuse.value.copyGammaToLinear( this.color );

		} else {

			uniforms.diffuse.value = this.color;

		}

		uniforms.map.value = this.map;
		uniforms.lightMap.value = this.lightMap;
		uniforms.specularMap.value = this.specularMap;
		uniforms.alphaMap.value = this.alphaMap;

		if ( this.bumpMap ) {

			uniforms.bumpMap.value = this.bumpMap;
			uniforms.bumpScale.value = this.bumpScale;

		}

		if ( this.normalMap ) {

			uniforms.normalMap.value = this.normalMap;
			uniforms.normalScale.value.copy( this.normalScale );

		}

		// uv repeat and offset setting priorities
		//  1. color map
		//  2. specular map
		//  3. normal map
		//  4. bump map
		//  5. alpha map

		var uvScaleMap;

		if ( this.map ) {

			uvScaleMap = this.map;

		} else if ( this.specularMap ) {

			uvScaleMap = this.specularMap;

		} else if ( this.normalMap ) {

			uvScaleMap = this.normalMap;

		} else if ( this.bumpMap ) {

			uvScaleMap = this.bumpMap;

		} else if ( this.alphaMap ) {

			uvScaleMap = this.alphaMap;

		}

		if ( uvScaleMap !== undefined ) {

			var offset = uvScaleMap.offset;
			var repeat = uvScaleMap.repeat;

			uniforms.offsetRepeat.value.set( offset.x, offset.y, repeat.x, repeat.y );

		}

		uniforms.envMap.value = this.envMap;
		uniforms.flipEnvMap.value = ( this.envMap instanceof THREE.WebGLRenderTargetCube ) ? 1 : - 1;

		if ( gammaInput ) {

			//uniforms.reflectivity.value = this.reflectivity * this.reflectivity;
			uniforms.reflectivity.value = this.reflectivity;

		} else {

			uniforms.reflectivity.value = this.reflectivity;

		}

		uniforms.refractionRatio.value = this.refractionRatio;

	},
	refreshUniformsLine: function ( uniforms ) {

		uniforms.diffuse.value = this.color;
		uniforms.opacity.value = this.opacity;

	},

	refreshUniformsDash: function ( uniforms ) {

		uniforms.dashSize.value = this.dashSize;
		uniforms.totalSize.value = this.dashSize + this.gapSize;
		uniforms.scale.value = this.scale;

	},

	refreshUniformsParticle: function ( uniforms, scale ) {

		uniforms.psColor.value = this.color;
		uniforms.opacity.value = this.opacity;
		uniforms.size.value = this.size;
		uniforms.scale.value = scale;

		uniforms.map.value = this.map;

	},

	refreshUniformsPhong: function ( uniforms, gammaInput ) {

		uniforms.shininess.value = this.shininess;

		if ( gammaInput ) {

			uniforms.ambient.value.copyGammaToLinear( this.ambient );
			uniforms.emissive.value.copyGammaToLinear( this.emissive );
			uniforms.specular.value.copyGammaToLinear( this.specular );

		} else {

			uniforms.ambient.value = this.ambient;
			uniforms.emissive.value = this.emissive;
			uniforms.specular.value = this.specular;

		}

		if ( this.wrapAround ) {

			uniforms.wrapRGB.value.copy( this.wrapRGB );

		}

	},

	refreshUniformsLambert: function ( uniforms, gammaInput ) {

		if ( gammaInput ) {

			uniforms.ambient.value.copyGammaToLinear( this.ambient );
			uniforms.emissive.value.copyGammaToLinear( this.emissive );

		} else {

			uniforms.ambient.value = this.ambient;
			uniforms.emissive.value = this.emissive;

		}

		if ( this.wrapAround ) {

			uniforms.wrapRGB.value.copy( this.wrapRGB );

		}

	},

	refreshUniforms: function ( uniforms, renderer, camera ) {
		console.warn( "THREE.Material: refreshUniforms() is not implemented." );
	},

	useEnvMap: function () {
		return false; //false as default
	},

	useSkinning: function () {
		return false; //false as default
	},

	useLights: function () {
		return false; //false as default
	},

	getShaderID: function () {
		return null;
	},

	getWebglShader: function () {
		var shaderID = this.getShaderID();
		var webglShader;
		if ( shaderID ) {

			var shader = THREE.ShaderLib[ shaderID ];

			webglShader = {
				uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
				vertexShader: shader.vertexShader,
				fragmentShader: shader.fragmentShader
			};

		} else {

			webglShader = {
				uniforms: this.uniforms,
				vertexShader: this.vertexShader,
				fragmentShader: this.fragmentShader
			};

		}
		return webglShader;
	}


};

THREE.EventDispatcher.prototype.apply( THREE.Material.prototype );

THREE.MaterialIdCount = 0;
