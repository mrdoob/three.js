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
	this.blendSrcAlpha = null;
	this.blendDstAlpha = null;
	this.blendEquationAlpha = null;

	this.depthTest = true;
	this.depthWrite = true;

	this.colorWrite = true;

	this.polygonOffset = false;
	this.polygonOffsetFactor = 0;
	this.polygonOffsetUnits = 0;

	this.alphaTest = 0;

	this.overdraw = 0; // Overdrawn pixels (typically between 0 and 1) for fixing antialiasing gaps in CanvasRenderer

	this.visible = true;

	this._needsUpdate = true;

};

THREE.Material.prototype = {

	constructor: THREE.Material,

	get needsUpdate () {

		return this._needsUpdate;

	},

	set needsUpdate ( value ) {

		if ( value === true ) this.update();

		this._needsUpdate = value;

	},

	setValues: function ( values ) {

		if ( values === undefined ) return;

		for ( var key in values ) {

			var newValue = values[ key ];

			if ( newValue === undefined ) {

				THREE.warn( "THREE.Material: '" + key + "' parameter is undefined." );
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

	toJSON: function() {

		// we will store all serialization data on 'data'
		var data = {};

		// add metadata
		data.metadata = {
			version: 4.4,
			type: 'Material',
			generator: 'Material.toJSON'
		}

		// standard Material serialization
		data.type = this.type;
		data.uuid = this.uuid;
		if ( this.name !== '' ) data.name = this.name;

		if ( this.opacity < 1 ) data.opacity = this.opacity;
		if ( this.transparent !== false ) data.transparent = this.transparent;
		if ( this.wireframe !== false ) data.wireframe = this.wireframe;

		return data;

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
		material.blendSrcAlpha = this.blendSrcAlpha;
		material.blendDstAlpha = this.blendDstAlpha;
		material.blendEquationAlpha = this.blendEquationAlpha;

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

	update: function () {

		this.dispatchEvent( { type: 'update' } );

	},

	dispose: function () {

		this.dispatchEvent( { type: 'dispose' } );

	},

    refreshUniformsCommon: function ( uniforms ) {

        uniforms.opacity.value = this.opacity;

        uniforms.diffuse.value = this.color;

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

        uniforms.reflectivity.value = this.reflectivity;
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

	refreshUniformsParticle: function ( uniforms, option ) {

        uniforms.psColor.value = this.color;
        uniforms.opacity.value = this.opacity;
        uniforms.size.value = this.size;
        uniforms.scale.value = option.canvas.height / 2.0; // TODO: Cache this.

        uniforms.map.value = this.map;

        if ( this.map !== null ) {

            var offset = this.map.offset;
            var repeat = this.map.repeat;

            uniforms.offsetRepeat.value.set( offset.x, offset.y, repeat.x, repeat.y );

        }

    },

	refreshUniformsPhong: function ( uniforms ) {

        uniforms.shininess.value = this.shininess;

        uniforms.emissive.value = this.emissive;
        uniforms.specular.value = this.specular;

        if ( this.wrapAround ) {

            uniforms.wrapRGB.value.copy( this.wrapRGB );

        }

	},

	refreshUniformsLambert: function ( uniforms ) {

        uniforms.emissive.value = this.emissive;

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
