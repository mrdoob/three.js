/**
 * @author Tony Parisi / http://www.tonyparisi.com/
 */


THREE.glTFLoader = function (showStatus) {
	this.useBufferGeometry = (THREE.glTFLoader.useBufferGeometry !== undefined ) ?
			THREE.glTFLoader.useBufferGeometry : true;
    this.meshesRequested = 0;
    this.meshesLoaded = 0;
    this.pendingMeshes = [];
    this.animationsRequested = 0;
    this.animationsLoaded = 0;
    this.animations = [];
    this.shadersRequested = 0;
    this.shadersLoaded = 0;
    this.shaders = {};
    THREE.Loader.call( this, showStatus );
}

THREE.glTFLoader.prototype = new THREE.Loader();
THREE.glTFLoader.prototype.constructor = THREE.glTFLoader;

THREE.glTFLoader.prototype.load = function( url, callback ) {
	
	var theLoader = this;
	// Utilities

    function RgbArraytoHex(colorArray) {
        if(!colorArray) return 0xFFFFFFFF;
        var r = Math.floor(colorArray[0] * 255),
            g = Math.floor(colorArray[1] * 255),
            b = Math.floor(colorArray[2] * 255),
            a = 255;

        var color = (a << 24) + (r << 16) + (g << 8) + b;

        return color;
    }
    
    function convertAxisAngleToQuaternion(rotations, count)
    {
    	var q = new THREE.Quaternion;
    	var axis = new THREE.Vector3;
    	var euler = new THREE.Vector3;
    	
    	var i;
    	for (i = 0; i < count; i++) {
    		axis.set(rotations[i * 4], rotations[i * 4 + 1],
    				rotations[i * 4 + 2]).normalize();
    		var angle = rotations[i * 4 + 3];
    		q.setFromAxisAngle(axis, angle);
    		rotations[i * 4] = q.x;
    		rotations[i * 4 + 1] = q.y;
    		rotations[i * 4 + 2] = q.z;
    		rotations[i * 4 + 3] = q.w;
    	}
    }

    function componentsPerElementForGLType(glType) {
        switch (glType) {
            case WebGLRenderingContext.FLOAT :
            case WebGLRenderingContext.UNSIGNED_BYTE :
            case WebGLRenderingContext.UNSIGNED_SHORT :
                return 1;
            case WebGLRenderingContext.FLOAT_VEC2 :
                return 2;
            case WebGLRenderingContext.FLOAT_VEC3 :
                return 3;
            case WebGLRenderingContext.FLOAT_VEC4 :
                return 4;
            case WebGLRenderingContext.FLOAT_MAT4 :
                return 16;
            default:
                return null;
        }
    }


    function LoadTexture(src) {
        if(!src) { return null; }
        return THREE.ImageUtils.loadTexture(src);
    }

    // Geometry processing

    var ClassicGeometry = function() {

    	if (theLoader.useBufferGeometry) {
    		this.geometry = new THREE.BufferGeometry;
    	}
    	else {
    		this.geometry = new THREE.Geometry;
    	}
        this.totalAttributes = 0;
        this.loadedAttributes = 0;
        this.indicesLoaded = false;
        this.finished = false;

        this.onload = null;

        this.uvs = null;
        this.indexArray = null;
    };

    ClassicGeometry.prototype.constructor = ClassicGeometry;

    ClassicGeometry.prototype.buildArrayGeometry = function() {

    	// Build indexed mesh
        var geometry = this.geometry;
        var normals = geometry.normals;
        var indexArray = this.indexArray;
        var uvs = this.uvs;
        var a, b, c;
        var i, l;
        var faceNormals = null;
        var faceTexcoords = null;
        
        for(i = 0, l = this.indexArray.length; i < l; i += 3) {
            a = indexArray[i];
            b = indexArray[i+1];
            c = indexArray[i+2];
            if(normals) {
                faceNormals = [normals[a], normals[b], normals[c]];
            }
            geometry.faces.push( new THREE.Face3( a, b, c, faceNormals, null, null ) );
            if(uvs) {
                geometry.faceVertexUvs[0].push([ uvs[a], uvs[b], uvs[c] ]);
            }
        }

        // Allow Three.js to calculate some values for us
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        geometry.computeCentroids();
        geometry.computeFaceNormals();
        if(!normals) {
            geometry.computeVertexNormals();
        }

    }

    ClassicGeometry.prototype.buildBufferGeometry = function() {
        // Build indexed mesh
        var geometry = this.geometry;
        geometry.attributes.index = {
        		itemSize: 1,
        		array : this.indexArray
        };

		var offset = {
				start: 0,
				index: 0,
				count: this.indexArray.length
			};

		geometry.offsets.push( offset );

        geometry.computeBoundingSphere();
    }
    
    ClassicGeometry.prototype.checkFinished = function() {
        if(this.indexArray && this.loadedAttributes === this.totalAttributes) {
        	
        	if (theLoader.useBufferGeometry) {
        		this.buildBufferGeometry();
        	}
        	else {
        		this.buildArrayGeometry();
        	}
        	
            this.finished = true;

            if(this.onload) {
                this.onload();
            }
        }
    };

    // Delegate for processing index buffers
    var IndicesDelegate = function() {};

    IndicesDelegate.prototype.handleError = function(errorCode, info) {
        // FIXME: report error
        console.log("ERROR(IndicesDelegate):"+errorCode+":"+info);
    };

    IndicesDelegate.prototype.convert = function(resource, ctx) {
        return new Uint16Array(resource, 0, ctx.indices.count);
    };

    IndicesDelegate.prototype.resourceAvailable = function(glResource, ctx) {
        var geometry = ctx.geometry;
        geometry.indexArray = glResource;
        geometry.checkFinished();
        return true;
    };

    var indicesDelegate = new IndicesDelegate();

    var IndicesContext = function(indices, geometry) {
        this.indices = indices;
        this.geometry = geometry;
    };
    
    // Delegate for processing vertex attribute buffers
    var VertexAttributeDelegate = function() {};

    VertexAttributeDelegate.prototype.handleError = function(errorCode, info) {
        // FIXME: report error
        console.log("ERROR(VertexAttributeDelegate):"+errorCode+":"+info);
    };

    VertexAttributeDelegate.prototype.convert = function(resource, ctx) {
        return resource;
    };



    VertexAttributeDelegate.prototype.arrayResourceAvailable = function(glResource, ctx) {
        var geom = ctx.geometry;
        var attribute = ctx.attribute;
        var semantic = ctx.semantic;
        var floatArray;
        var i, l;
        //FIXME: Float32 is assumed here, but should be checked.

        if(semantic == "POSITION") {
            // TODO: Should be easy to take strides into account here
            floatArray = new Float32Array(glResource, 0, attribute.count * componentsPerElementForGLType(attribute.type));
            for(i = 0, l = floatArray.length; i < l; i += 3) {
                geom.geometry.vertices.push( new THREE.Vector3( floatArray[i], floatArray[i+1], floatArray[i+2] ) );
            }
        } else if(semantic == "NORMAL") {
            geom.geometry.normals = [];
            floatArray = new Float32Array(glResource, 0, attribute.count * componentsPerElementForGLType(attribute.type));
            for(i = 0, l = floatArray.length; i < l; i += 3) {
                geom.geometry.normals.push( new THREE.Vector3( floatArray[i], floatArray[i+1], floatArray[i+2] ) );
            }
        } else if ((semantic == "TEXCOORD_0") || (semantic == "TEXCOORD" )) {
        	geom.uvs = [];
            floatArray = new Float32Array(glResource, 0, attribute.count * componentsPerElementForGLType(attribute.type));
            for(i = 0, l = floatArray.length; i < l; i += 2) {
                geom.uvs.push( new THREE.Vector2( floatArray[i], 1.0 - floatArray[i+1] ) );
            }
        }
        else if (semantic == "WEIGHT") {
        	nComponents = componentsPerElementForGLType(attribute.type);
            floatArray = new Float32Array(glResource, 0, attribute.count * nComponents);
            for(i = 0, l = floatArray.length; i < l; i += 4) {
            	geom.geometry.skinWeights.push( new THREE.Vector4( floatArray[i], floatArray[i+1], floatArray[i+2], floatArray[i+3] ) );
            }
        }
        else if (semantic == "JOINT") {
        	nComponents = componentsPerElementForGLType(attribute.type);
            floatArray = new Float32Array(glResource, 0, attribute.count * nComponents);
            for(i = 0, l = floatArray.length; i < l; i += 4) {
            	geom.geometry.skinIndices.push( new THREE.Vector4( floatArray[i], floatArray[i+1], floatArray[i+2], floatArray[i+3] ) );
            }
        }
    }
    
    VertexAttributeDelegate.prototype.bufferResourceAvailable = function(glResource, ctx) {
        var geom = ctx.geometry;
        var attribute = ctx.attribute;
        var semantic = ctx.semantic;
        var floatArray;
        var i, l;
        var nComponents;
        //FIXME: Float32 is assumed here, but should be checked.

        if(semantic == "POSITION") {
            // TODO: Should be easy to take strides into account here
            floatArray = new Float32Array(glResource, 0, attribute.count * componentsPerElementForGLType(attribute.type));
            geom.geometry.attributes.position = {
            		itemSize: 3,
            		array : floatArray
            };
        } else if(semantic == "NORMAL") {
            floatArray = new Float32Array(glResource, 0, attribute.count * componentsPerElementForGLType(attribute.type));
            geom.geometry.attributes.normal = {
            		itemSize: 3,
            		array : floatArray
            };
        } else if ((semantic == "TEXCOORD_0") || (semantic == "TEXCOORD" )) {
        	
        	nComponents = componentsPerElementForGLType(attribute.type);
            floatArray = new Float32Array(glResource, 0, attribute.count * nComponents);
            // N.B.: flip Y value... should we just set texture.flipY everywhere?
            for (i = 0; i < floatArray.length / 2; i++) {
            	floatArray[i*2+1] = 1.0 - floatArray[i*2+1];
            }
            geom.geometry.attributes.uv = {
            		itemSize: nComponents,
            		array : floatArray
            };
        }
        else if (semantic == "WEIGHT") {
        	nComponents = componentsPerElementForGLType(attribute.type);
            floatArray = new Float32Array(glResource, 0, attribute.count * nComponents);
            geom.geometry.attributes.skinWeight = {
            		itemSize: nComponents,
            		array : floatArray
            };        	
        }
        else if (semantic == "JOINT") {
        	nComponents = componentsPerElementForGLType(attribute.type);
            floatArray = new Float32Array(glResource, 0, attribute.count * nComponents);
            geom.geometry.attributes.skinIndex = {
            		itemSize: nComponents,
            		array : floatArray
            };        	
        }
    }
    
    VertexAttributeDelegate.prototype.resourceAvailable = function(glResource, ctx) {
    	if (theLoader.useBufferGeometry) {
    		this.bufferResourceAvailable(glResource, ctx);
    	}
    	else {
    		this.arrayResourceAvailable(glResource, ctx);
    	}
    	
        var geom = ctx.geometry;
        geom.loadedAttributes++;
        geom.checkFinished();
        return true;
    };

    var vertexAttributeDelegate = new VertexAttributeDelegate();

    var VertexAttributeContext = function(attribute, semantic, geometry) {
        this.attribute = attribute;
        this.semantic = semantic;
        this.geometry = geometry;
    };

    var Mesh = function() {
        this.primitives = [];
        this.materialsPending = [];
        this.loadedGeometry = 0;
        this.onCompleteCallbacks = [];
    };

    Mesh.prototype.addPrimitive = function(geometry, material) {
        
    	var self = this;
        geometry.onload = function() {
            self.loadedGeometry++;
            self.checkComplete();
        };
        
        this.primitives.push({
            geometry: geometry,
            material: material,
            mesh: null
        });
    };

    Mesh.prototype.onComplete = function(callback) {
        this.onCompleteCallbacks.push(callback);
        this.checkComplete();
    };

    Mesh.prototype.checkComplete = function() {
        var self = this;
        if(this.onCompleteCallbacks.length && this.primitives.length == this.loadedGeometry) {
            this.onCompleteCallbacks.forEach(function(callback) {
                callback(self);
            });
            this.onCompleteCallbacks = [];
        }
    };

    Mesh.prototype.attachToNode = function(threeNode) {
        // Assumes that the geometry is complete
        this.primitives.forEach(function(primitive) {
            /*if(!primitive.mesh) {
                primitive.mesh = new THREE.Mesh(primitive.geometry, primitive.material);
            }*/
        	var material = primitive.material;
        	if (!(material instanceof THREE.Material)) {
        		material = theLoader.createShaderMaterial(material);
        	}

        	var threeMesh = new THREE.Mesh(primitive.geometry.geometry, material);
            threeMesh.castShadow = true;
            threeNode.add(threeMesh);
        });
    };

    // Delayed-loaded material
    var Material = function(params) {
    	this.params = params;
    };
    
    // Delegate for processing animation parameter buffers
    var AnimationParameterDelegate = function() {};

    AnimationParameterDelegate.prototype.handleError = function(errorCode, info) {
        // FIXME: report error
        console.log("ERROR(AnimationParameterDelegate):"+errorCode+":"+info);
    };

    AnimationParameterDelegate.prototype.convert = function(resource, ctx) {
    	var parameter = ctx.parameter;

    	var glResource = null;
    	switch (parameter.type) {
	        case WebGLRenderingContext.FLOAT :
	        case WebGLRenderingContext.FLOAT_VEC2 :
	        case WebGLRenderingContext.FLOAT_VEC3 :
	        case WebGLRenderingContext.FLOAT_VEC4 :
	        	glResource = new Float32Array(resource, 0, parameter.count * componentsPerElementForGLType(parameter.type));
	        	break;
	        default:
	        	break;
    	}
    	
        return glResource;
    };

    AnimationParameterDelegate.prototype.resourceAvailable = function(glResource, ctx) {
    	var animation = ctx.animation;
    	var parameter = ctx.parameter;
    	parameter.data = glResource;
    	animation.handleParameterLoaded(parameter);
        return true;
    };

    var animationParameterDelegate = new AnimationParameterDelegate();

    var AnimationParameterContext = function(parameter, animation) {
        this.parameter = parameter;
        this.animation = animation;
    };

    // Animations
    var Animation = function() {

    	// create Three.js keyframe here
        this.totalParameters = 0;
        this.loadedParameters = 0;
        this.parameters = {};
        this.finishedLoading = false;
        this.onload = null;

    };

    Animation.prototype.constructor = Animation;

    Animation.prototype.handleParameterLoaded = function(parameter) {
    	this.parameters[parameter.name] = parameter;
    	this.loadedParameters++;
    	this.checkFinished();
    };
    
    Animation.prototype.checkFinished = function() {
        if(this.loadedParameters === this.totalParameters) {
            // Build animation
            this.finishedLoading = true;

            if (this.onload) {
                this.onload();
            }
        }
    };
    
    // Delegate for processing inverse bind matrices buffer
    var InverseBindMatricesDelegate = function() {};

    InverseBindMatricesDelegate.prototype.handleError = function(errorCode, info) {
        // FIXME: report error
        console.log("ERROR(InverseBindMatricesDelegate):"+errorCode+":"+info);
    };

    InverseBindMatricesDelegate.prototype.convert = function(resource, ctx) {
    	var parameter = ctx.parameter;

    	var glResource = null;
    	switch (parameter.type) {
	        case WebGLRenderingContext.FLOAT_MAT4 :
	        	glResource = new Float32Array(resource, 0, parameter.count * componentsPerElementForGLType(parameter.type));
	        	break;
	        default:
	        	break;
    	}
    	
        return glResource;
    };

    InverseBindMatricesDelegate.prototype.resourceAvailable = function(glResource, ctx) {
    	var skin = ctx.skin;
    	skin.inverseBindMatrices = glResource;
        return true;
    };

    var inverseBindMatricesDelegate = new InverseBindMatricesDelegate();

    var InverseBindMatricesContext = function(param, skin) {
    	this.parameter = param;
        this.skin = skin;
    };

    // Delegate for processing shaders from external files
    var ShaderDelegate = function() {};

    ShaderDelegate.prototype.handleError = function(errorCode, info) {
        // FIXME: report error
        console.log("ERROR(ShaderDelegate):"+errorCode+":"+info);
    };

    ShaderDelegate.prototype.convert = function(resource, ctx) {
    	return resource; 
    }
    
    ShaderDelegate.prototype.resourceAvailable = function(data, ctx) {
        theLoader.shadersLoaded++;
        theLoader.shaders[ctx.id] = data;
        return true;
    };

    var shaderDelegate = new ShaderDelegate();

    var ShaderContext = function(id, path) {
    	this.id = id;
    	this.path = path;
    };
    
    // Resource management

    var ResourceEntry = function(entryID, object, description) {
        this.entryID = entryID;
        this.object = object;
        this.description = description;
    };

    var Resources = function() {
        this._entries = {};
    };

    Resources.prototype.setEntry = function(entryID, object, description) {
        if (!entryID) {
            console.error("No EntryID provided, cannot store", description);
            return;
        }

        if (this._entries[entryID]) {
            console.warn("entry["+entryID+"] is being overwritten");
        }
    
        this._entries[entryID] = new ResourceEntry(entryID, object, description );
    };
    
    Resources.prototype.getEntry = function(entryID) {
        return this._entries[entryID];
    };

    Resources.prototype.clearEntries = function() {
        this._entries = {};
    };

    LoadDelegate = function() {
    }
    
    LoadDelegate.prototype.loadCompleted = function(callback, obj) {
    	callback.call(Window, obj);
    }
    
    // Loader

    var ThreeGLTFLoader = Object.create(glTFParser, {

        load: {
            enumerable: true,
            value: function(userInfo, options) {
                this.resources = new Resources();
                this.cameras = [];
                this.lights = [];
                this.animations = [];
                this.joints = {};
                this.skeltons = {};
                THREE.GLTFLoaderUtils.init();
                glTFParser.load.call(this, userInfo, options);
            }
        },

        cameras: {
        	enumerable: true,
        	writable: true,
        	value : []
        },

        lights: {
        	enumerable: true,
        	writable: true,
        	value : []
        },
        
        animations: {
        	enumerable: true,
        	writable: true,
        	value : []
        },
        
        // Implement WebGLTFLoader handlers

        handleBuffer: {
            value: function(entryID, description, userInfo) {
                this.resources.setEntry(entryID, null, description);
                description.type = "ArrayBuffer";
                return true;
            }
        },

        handleBufferView: {
            value: function(entryID, description, userInfo) {
                this.resources.setEntry(entryID, null, description);

                var buffer =  this.resources.getEntry(description.buffer);
                description.type = "ArrayBufferView";

                var bufferViewEntry = this.resources.getEntry(entryID);
                bufferViewEntry.buffer = buffer;
                return true;
            }
        },

        handleShader: {
            value: function(entryID, description, userInfo) {
        		this.resources.setEntry(entryID, null, description);
        		var shaderRequest = {
        				id : entryID,
        				path : description.path,
        		};

                var shaderContext = new ShaderContext(entryID, description.path);

                theLoader.shadersRequested++;
        		THREE.GLTFLoaderUtils.getFile(shaderRequest, shaderDelegate, shaderContext);
        		
                return true;
            }
        },

        handleProgram: {
            value: function(entryID, description, userInfo) {
        		this.resources.setEntry(entryID, null, description);
                return true;
            }
        },

        handleTechnique: {
            value: function(entryID, description, userInfo) {
        		this.resources.setEntry(entryID, null, description);
                return true;
            }
        },

        createShaderMaterial : {
        	value: function(material) {
        		
        		var fragmentShader = theLoader.shaders[material.params.fragmentShader];
        		if (!fragmentShader) {
                    console.log("ERROR: Missing fragment shader definition:", material.params.fragmentShader);
            		return new THREE.MeshPhongMaterial;
        		}
        		
        		var vertexShader = theLoader.shaders[material.params.vertexShader];
        		if (!fragmentShader) {
                    console.log("ERROR: Missing vertex shader definition:", material.params.vertexShader);
            		return new THREE.MeshPhongMaterial;
        		}
        		
        		var uniforms = {};
        		var shaderMaterial = new THREE.ShaderMaterial( {

        			fragmentShader: fragmentShader,
        			vertexShader: vertexShader,
        			uniforms: uniforms,

        		} );

        		return new THREE.MeshPhongMaterial(material.params);
        	}
        },
        
        createShaderParams : {
        	value: function(materialId, values, params, instanceProgram) {
				var program = this.resources.getEntry(instanceProgram.program);
				
				if (program) {
					params.fragmentShader = program.description.fragmentShader;
					params.vertexShader = program.description.vertexShader;
					params.attributes = instanceProgram.attributes;
					params.uniforms = instanceProgram.uniforms;
				}
        	}
        },
        
        threeJSMaterialType : {
            value: function(materialId, technique, values, params) {
        	
        		var materialType = THREE.MeshPhongMaterial;
        		var defaultPass = null;
        		if (technique && technique.description && technique.description.passes)
        			defaultPass = technique.description.passes.defaultPass;
        		
        		if (defaultPass) {
        			if (defaultPass.details && defaultPass.details.commonProfile) {
	            		var profile = technique.description.passes.defaultPass.details.commonProfile;
	            		if (profile)
	            		{
		            		switch (profile.lightingModel)
		            		{
		            			case 'Blinn' :
		            			case 'Phong' :
		            				materialType = THREE.MeshPhongMaterial;
		            				break;
	
		            			case 'Lambert' :
		            				materialType = THREE.MeshLambertMaterial;
		            				break;
		            				
		            			default :
		            				materialType = THREE.MeshBasicMaterial;
		            				break;
		            		}
		            		
		            		if (profile.extras && profile.extras.doubleSided)
		            		{
		            			params.side = THREE.DoubleSide;
		            		}
	            		}
        			}
        			else if (defaultPass.instanceProgram) {
        				
        				var instanceProgram = defaultPass.instanceProgram;

    					this.createShaderParams(materialId, values, params, instanceProgram);
    					
    					var loadshaders = true;
    					
    					if (loadshaders) {
    						materialType = Material;
    					}
        			}
        		}
        		
                var texturePath = null;
                var textureParams = null;
                var diffuse = values.diffuse;
                if (diffuse)
                {
                	var texture = diffuse;
                    if (texture) {
                        var textureEntry = this.resources.getEntry(texture);
                        if (textureEntry) {
                        	{
                        		var imageEntry = this.resources.getEntry(textureEntry.description.source);
                        		if (imageEntry) {
                        			texturePath = imageEntry.description.path;
                        		}
                        		
                        		var samplerEntry = this.resources.getEntry(textureEntry.description.sampler);
                        		if (samplerEntry) {
                        			textureParams = samplerEntry.description;
                        		}
                        	}
                        }
                    }                    
                }

                var texture = LoadTexture(texturePath);
                if (texture && textureParams) {
                	
                	if (textureParams.wrapS == WebGLRenderingContext.REPEAT)
                		texture.wrapS = THREE.RepeatWrapping;

                	if (textureParams.wrapT == WebGLRenderingContext.REPEAT)
                		texture.wrapT = THREE.RepeatWrapping;
                	
                	if (textureParams.magFilter == WebGLRenderingContext.LINEAR)
                		texture.magFilter = THREE.LinearFilter;

//                	if (textureParams.minFilter == "LINEAR")
//               		texture.minFilter = THREE.LinearFilter;
                	
                    params.map = texture;
                }

                var envMapPath = null;
                var envMapParams = null;
                var reflective = values.reflective;
                if (reflective)
                {
                	var texture = reflective;
                    if (texture) {
                        var textureEntry = this.resources.getEntry(texture);
                        if (textureEntry) {
                        	{
                        		var imageEntry = this.resources.getEntry(textureEntry.description.source);
                        		if (imageEntry) {
                        			envMapPath = imageEntry.description.path;
                        		}
                        		
                        		var samplerEntry = this.resources.getEntry(textureEntry.description.sampler);
                        		if (samplerEntry) {
                        			envMapParams = samplerEntry.description;
                        		}
                        	}
                        }
                    }                    
                }

                var texture = LoadTexture(envMapPath);
                if (texture && envMapParams) {
                	
                	if (envMapParams.wrapS == WebGLRenderingContext.REPEAT)
                		texture.wrapS = THREE.RepeatWrapping;

                	if (envMapParams.wrapT == WebGLRenderingContext.REPEAT)
                		texture.wrapT = THREE.RepeatWrapping;
                	
                	if (envMapParams.magFilter == WebGLRenderingContext.LINEAR)
                		texture.magFilter = THREE.LinearFilter;

//                	if (envMapParams.minFilter == WebGLRenderingContext.LINEAR)
//               		texture.minFilter = THREE.LinearFilter;
                	
                    params.envMap = texture;
                }
                
                var shininess = values.shininesss || values.shininess; // N.B.: typo in converter!
                if (shininess)
                {
                	shininess = shininess;
                }
                
                var diffuseColor = !texturePath ? diffuse : null;
                var opacity = 1.0;
                if (values.hasOwnProperty("transparency"))
                {
                	var USE_A_ONE = true; // for now, hack because file format isn't telling us
                	opacity =  USE_A_ONE ? values.transparency : (1.0 - values.transparency);
                }
                
                // if (diffuseColor) diffuseColor = [0, 1, 0];
                                    
                params.color = RgbArraytoHex(diffuseColor);
                params.opacity = opacity;
                params.transparent = opacity < 1.0;
                // hack hack hack
                if (texturePath && texturePath.toLowerCase().indexOf(".png") != -1)
                	params.transparent = true;
                
                if (!(shininess === undefined))
                {
                	params.shininess = shininess;
                }
                
                if (!(values.ambient === undefined) && !(typeof(values.ambient) == 'string'))
                {
                	params.ambient = RgbArraytoHex(values.ambient);
                }

                if (!(values.emission === undefined))
                {
                	params.emissive = RgbArraytoHex(values.emission);
                }
                
                if (!(values.specular === undefined))
                {
                	params.specular = RgbArraytoHex(values.specular);
                }

        		return materialType;
        		
        	}
        },
        
        handleMaterial: {
            value: function(entryID, description, userInfo) {
                //this should be rewritten using the meta datas that actually create the shader.
                //here we will infer what needs to be pass to Three.js by looking inside the technique parameters.
                var technique = this.resources.getEntry(description.instanceTechnique.technique);
                var materialParams = {};
                var values = description.instanceTechnique.values;
                
                var materialType = this.threeJSMaterialType(entryID, technique, values, materialParams);

                var material = new materialType(materialParams);
                
                this.resources.setEntry(entryID, material, description);

                return true;
            }
        },

        handleMesh: {
            value: function(entryID, description, userInfo) {
                var mesh = new Mesh();
                this.resources.setEntry(entryID, mesh, description);
                var primitivesDescription = description.primitives;
                if (!primitivesDescription) {
                    //FIXME: not implemented in delegate
                    console.log("MISSING_PRIMITIVES for mesh:"+ entryID);
                    return false;
                }

                for (var i = 0 ; i < primitivesDescription.length ; i++) {
                    var primitiveDescription = primitivesDescription[i];
                    
                    if (primitiveDescription.primitive === WebGLRenderingContext.TRIANGLES) {

                        var geometry = new ClassicGeometry();
                        var materialEntry = this.resources.getEntry(primitiveDescription.material);

                        mesh.addPrimitive(geometry, materialEntry.object);

                        var indices = this.resources.getEntry(primitiveDescription.indices);
                        var bufferEntry = this.resources.getEntry(indices.description.bufferView);
                        var indicesObject = {
                        		bufferView : bufferEntry,
                        		byteOffset : indices.description.byteOffset,
                        		count : indices.description.count,
                        		id : indices.entryID,
                        		type : indices.description.type
                        };
                        
                        var indicesContext = new IndicesContext(indicesObject, geometry);
                        var alreadyProcessedIndices = THREE.GLTFLoaderUtils.getBuffer(indicesObject, indicesDelegate, indicesContext);
                        /*if(alreadyProcessedIndices) {
                            indicesDelegate.resourceAvailable(alreadyProcessedIndices, indicesContext);
                        }*/

                        // Load Vertex Attributes
                        var allAttributes = Object.keys(primitiveDescription.attributes);
                        allAttributes.forEach( function(semantic) {
                            geometry.totalAttributes++;

                            var attribute;
                            var attributeID = primitiveDescription.attributes[semantic];
                            var attributeEntry = this.resources.getEntry(attributeID);
                            if (!attributeEntry) {
                                //let's just use an anonymous object for the attribute
                                attribute = description.attributes[attributeID];
                                attribute.id = attributeID;
                                this.resources.setEntry(attributeID, attribute, attribute);
            
                                var bufferEntry = this.resources.getEntry(attribute.bufferView);
                                attributeEntry = this.resources.getEntry(attributeID);

                            } else {
                                attribute = attributeEntry.object;
                                attribute.id = attributeID;
                                var bufferEntry = this.resources.getEntry(attribute.bufferView);
                            }

                            var attributeObject = {
                            		bufferView : bufferEntry,
                            		byteOffset : attribute.byteOffset,
                            		byteStride : attribute.byteStride,
                            		count : attribute.count,
                            		max : attribute.max,
                            		min : attribute.min,
                            		type : attribute.type,
                            		id : attributeID             
                            };
                            
                            var attribContext = new VertexAttributeContext(attributeObject, semantic, geometry);

                            var alreadyProcessedAttribute = THREE.GLTFLoaderUtils.getBuffer(attributeObject, vertexAttributeDelegate, attribContext);
                            /*if(alreadyProcessedAttribute) {
                                vertexAttributeDelegate.resourceAvailable(alreadyProcessedAttribute, attribContext);
                            }*/
                        }, this);
                    }
                }
                return true;
            }
        },

        handleCamera: {
            value: function(entryID, description, userInfo) {
                var camera;
                if (description.type == "perspective")
                {
            		var znear = description.perspective.znear;
            		var zfar = description.perspective.zfar;
                	var yfov = description.perspective.yfov;                	
                	var xfov = description.perspective.xfov;
            		var aspect_ratio = description.perspective.aspect_ratio;

            		if (!aspect_ratio)
            			aspect_ratio = 1; 
            		
                	if (yfov === undefined)
                	{
                		if (xfov)
                		{
                			// According to COLLADA spec...
                			// aspect_ratio = xfov / yfov
                			yfov = xfov / aspect_ratio;
                		}
                		
                	}
                	
                	if (yfov)
                	{
                		camera = new THREE.PerspectiveCamera(yfov, aspect_ratio, znear, zfar);
                	}
                }
                else
                {
    				camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, znear, zfar );
                }
                
                if (camera)
                {
                	this.resources.setEntry(entryID, camera, description);
                }
                
                return true;
            }
        },

        handleLight: {
            value: function(entryID, description, userInfo) {

        		var light = null;
        		var type = description.type;
        		if (type && description[type])
        		{
        			var lparams = description[type];
            		var color = RgbArraytoHex(lparams.color);
            		
            		switch (type) {
            			case "directional" :
            				light = new THREE.DirectionalLight(color);
    						light.position.set(0, 0, 1);
            			break;
            			
            			case "point" :
            				light = new THREE.PointLight(color);
            			break;
            			
            			case "spot " :
            				light = new THREE.SpotLight(color);
    						light.position.set(0, 0, 1);
            			break;
            			
            			case "ambient" : 
            				light = new THREE.AmbientLight(color);
            			break;
            		}
        		}

        		if (light)
        		{
                	this.resources.setEntry(entryID, light, description);	
        		}
        		
        		return true;
            }
        },

        addPendingMesh: {
            value: function(mesh, threeNode) {
        		theLoader.pendingMeshes.push({
        			mesh: mesh,
        			node: threeNode
        		});
        	}
        },
        
        handleNode: {
            value: function(entryID, description, userInfo) {

        		var threeNode = null;
	            if (description.jointId) {
	                threeNode = new THREE.Bone();
	                threeNode.jointId = description.jointId;
	                this.joints[description.jointId] = entryID;
	            }
	            else {
	                threeNode = new THREE.Object3D();
	            }
	            
                threeNode.name = description.name;
                
                this.resources.setEntry(entryID, threeNode, description);

                var m = description.matrix;
                if(m) {
                    threeNode.matrixAutoUpdate = false;
                    threeNode.applyMatrix(new THREE.Matrix4(
                        m[0],  m[4],  m[8],  m[12],
                        m[1],  m[5],  m[9],  m[13],
                        m[2],  m[6],  m[10], m[14],
                        m[3],  m[7],  m[11], m[15]
                    ));                    
                }
                else {
                	var t = description.translation;
                	var r = description.rotation;
                	var s = description.scale;
                	
                	var position = t ? new THREE.Vector3(t[0], t[1], t[2]) :
                		new THREE.Vector3;
                	if (r) {
                		convertAxisAngleToQuaternion(r, 1);
                	}
                	var rotation = r ? new THREE.Quaternion(r[0], r[1], r[2], r[3]) :
                		new THREE.Quaternion;
                	var scale = s ? new THREE.Vector3(s[0], s[1], s[2]) :
                		new THREE.Vector3;
                	
                	var matrix = new THREE.Matrix4;
                	matrix.compose(position, rotation, scale);
                    threeNode.matrixAutoUpdate = false;
                    threeNode.applyMatrix(matrix);                    
                }

                var self = this;
                
                // Iterate through all node meshes and attach the appropriate objects
                //FIXME: decision needs to be made between these 2 ways, probably meshes will be discarded.
                var meshEntry;
                if (description.mesh) {
                    meshEntry = this.resources.getEntry(description.mesh);
                    theLoader.meshesRequested++;
                    meshEntry.object.onComplete(function(mesh) {
                    	self.addPendingMesh(mesh, threeNode);
                        theLoader.meshesLoaded++;
                        theLoader.checkComplete();
                    });
                }

                if (description.meshes) {
                    description.meshes.forEach( function(meshID) {
                        meshEntry = this.resources.getEntry(meshID);
                        theLoader.meshesRequested++;
                        meshEntry.object.onComplete(function(mesh) {
                        	self.addPendingMesh(mesh, threeNode);
                            theLoader.meshesLoaded++;
                            theLoader.checkComplete();
                        });
                    }, this);
                }

                if (description.instanceSkin) {

                	var skinEntry =  this.resources.getEntry(description.instanceSkin.skin);
                	
                	if (skinEntry) {

                		var skin = skinEntry.object;
                		description.instanceSkin.skin = skin;
                        threeNode.instanceSkin = description.instanceSkin;

                		var sources = description.instanceSkin.sources;
                		skin.meshes = [];
                        sources.forEach( function(meshID) {
                            meshEntry = this.resources.getEntry(meshID);
                            theLoader.meshesRequested++;
                            meshEntry.object.onComplete(function(mesh) {
                            	
                            	skin.meshes.push(mesh);
                                theLoader.meshesLoaded++;
                                theLoader.checkComplete();
                            });
                        }, this);
                        
                	}
                }
                                
                if (description.camera) {
                    var cameraEntry = this.resources.getEntry(description.camera);
                    if (cameraEntry) {
                    	threeNode.add(cameraEntry.object);
                    	this.cameras.push(cameraEntry.object);
                    }
                }

                if (description.light) {
                    var lightEntry = this.resources.getEntry(description.light);
                    if (lightEntry) {
                    	threeNode.add(lightEntry.object);
                    	this.lights.push(lightEntry.object);
                    }
                }
                
                return true;
            }
        },
        
        buildNodeHirerachy: {
            value: function(nodeEntryId, parentThreeNode) {
                var nodeEntry = this.resources.getEntry(nodeEntryId);
                var threeNode = nodeEntry.object;
                parentThreeNode.add(threeNode);

                var children = nodeEntry.description.children;
                if (children) {
                    children.forEach( function(childID) {
                        this.buildNodeHirerachy(childID, threeNode);
                    }, this);
                }

                return threeNode;
            }
        },

        buildSkin: {
            value: function(node) {
        	
                var skin = node.instanceSkin.skin;
                if (skin) {
                    node.instanceSkin.skeletons.forEach(function(skeleton) {
                        var nodeEntry = this.resources.getEntry(skeleton);
                        if (nodeEntry) {

                        	var rootSkeleton = nodeEntry.object;

                            var dobones = true;

                            var i, len = skin.meshes.length;
                            for (i = 0; i < len; i++) {
                            	var mesh = skin.meshes[i];
                            	var threeMesh = null;
                                mesh.primitives.forEach(function(primitive) {

                                	var material = primitive.material;
                                	if (!(material instanceof THREE.Material)) {
                                		material = this.createShaderMaterial(material);
                                	}

                                	threeMesh = new THREE.SkinnedMesh(primitive.geometry.geometry, material, false);
                            		threeMesh.add(rootSkeleton);
                                	
                                    var geometry = primitive.geometry.geometry;
                                    var j;
                                    if (geometry.vertices) {
	                            		for ( j = 0; j < geometry.vertices.length; j ++ ) {
	                            			geometry.vertices[j].applyMatrix4( skin.bindShapeMatrix );	
	                            		}
                                    }
                                    else if (geometry.attributes.position) {
                                    	var a = geometry.attributes.position.array;
                                    	var v = new THREE.Vector3;
	                            		for ( j = 0; j < a.length / 3; j++ ) {
	                            			v.set(a[j * 3], a[j * 3 + 1], a[j * 3 + 2]);
	                            			v.applyMatrix4( skin.bindShapeMatrix );
	                            			a[j * 3] = v.x;
	                            			a[j * 3 + 1] = v.y;
	                            			a[j * 3 + 2] = v.z;
	                            		}
                                    }

                                    if (threeMesh && dobones) {

                                    	material.skinning = true;
        	                            
                                    	threeMesh.boneInverses = [];
        	                            var jointsIds = skin.jointsIds;
        	                            var joints = [];
        	                            var i, len = jointsIds.length;
        	                            for (i = 0; i < len; i++) {
        	                            	var jointId = jointsIds[i];
        	                                var nodeForJoint = this.joints[jointId];
        	                                var joint = this.resources.getEntry(nodeForJoint).object;
        	                                if (joint) {
        	                                	
        	                                	joint.skin = threeMesh;
        	                                    joints.push(joint);
        	                                    threeMesh.bones.push(joint);
        	                                    
        	                                    var m = skin.inverseBindMatrices;
        	                    	            var mat = new THREE.Matrix4(
        	                                            m[i * 16 + 0],  m[i * 16 + 4],  m[i * 16 + 8],  m[i * 16 + 12],
        	                                            m[i * 16 + 1],  m[i * 16 + 5],  m[i * 16 + 9],  m[i * 16 + 13],
        	                                            m[i * 16 + 2],  m[i * 16 + 6],  m[i * 16 + 10], m[i * 16 + 14],
        	                                            m[i * 16 + 3],  m[i * 16 + 7],  m[i * 16 + 11], m[i * 16 + 15]
        	                                        );
        	                                    threeMesh.boneInverses.push(mat);
        	                                    threeMesh.pose();
        	                                    
        	                                } else {
        	                                    console.log("WARNING: jointId:"+jointId+" cannot be found in skeleton:"+skeleton);
        	                                }
        	                            }
                                    }
                                    
                                    if (threeMesh) {
                                    	threeMesh.castShadow = true;
                                    	node.add(threeMesh);
                                    }
                                    
                                }, this);                            	
                            }
                            
                        }

                    
                    }, this);
                    
                }
            }
        },
         
        buildSkins: {
            value: function(node) {

        		if (node.instanceSkin)
        			this.buildSkin(node);
        		
                var children = node.children;
                if (children) {
                    children.forEach( function(child) {
                        this.buildSkins(child);
                    }, this);
                }
            }
        },
        
        createMeshAnimations : {
        	value : function(root) {
        			this.buildSkins(root);
        		}
        },        

        handleScene: {
            value: function(entryID, description, userInfo) {

                if (!description.nodes) {
                    console.log("ERROR: invalid file required nodes property is missing from scene");
                    return false;
                }

                description.nodes.forEach( function(nodeUID) {
                    this.buildNodeHirerachy(nodeUID, userInfo.rootObj);
                }, this);

                if (this.delegate) {
                    this.delegate.loadCompleted(userInfo.callback, userInfo.rootObj);
                }

                return true;
            }
        },

        handleImage: {
            value: function(entryID, description, userInfo) {
                this.resources.setEntry(entryID, null, description);
                return true;
            }
        },
        
        addNodeAnimationChannel : {
        	value : function(name, channel, interp) {
        		if (!this.nodeAnimationChannels)
        			this.nodeAnimationChannels = {};
        		
        		if (!this.nodeAnimationChannels[name]) {
        			this.nodeAnimationChannels[name] = [];
        		}
        		
        		this.nodeAnimationChannels[name].push(interp);
        	},
        },
        
        createAnimations : {
        	value : function() {
        		for (var name in this.nodeAnimationChannels) {
        			var nodeAnimationChannels = this.nodeAnimationChannels[name];
        			var i, len = nodeAnimationChannels.length;
        			//console.log(" animation channels for node " + name);
        			//for (i = 0; i < len; i++) {
        			//	console.log(nodeAnimationChannels[i]);
        			//}
	            	var anim = new THREE.glTFAnimation(nodeAnimationChannels);
	            	anim.name = "animation_" + name;
	            	this.animations.push(anim);        				
        		}
        	}
        },
        
        buildAnimation: {
        	value : function(animation) {
        	
        		var interps = [];
	            var i, len = animation.channels.length;
	            for (i = 0; i < len; i++) {
	            	
	            	var channel = animation.channels[i];
	            	var sampler = animation.samplers[channel.sampler];
	            	if (sampler) {
	
	            		var input = animation.parameters[sampler.input];
	            		if (input && input.data) {
	            			
	            			var output = animation.parameters[sampler.output];
	            			if (output && output.data) {
	            				
	            				var target = channel.target;
	            				var node = this.resources.getEntry(target.id);
	            				if (node) {

	            					var path = target.path;
		            				
		            				if (path == "rotation")
		            				{
		            					convertAxisAngleToQuaternion(output.data, output.count);
		            				}
		            				
			            			var interp = {
			            					keys : input.data,
			            					values : output.data,
			            					count : input.count,
			            					target : node.object,
			            					path : path,
			            					type : sampler.interpolation
			            			};
			            			
			            			this.addNodeAnimationChannel(target.id, channel, interp);
			            			interps.push(interp);
	            				}
	            			}
	            		}
	            	}
	            }	            
        	}
        },
        
        handleAnimation: {
            value: function(entryID, description, userInfo) {
        	
        		var self = this;
	            theLoader.animationsRequested++;
	            var animation = new Animation();
                animation.name = entryID;
	            animation.onload = function() {
	            	// self.buildAnimation(animation);
	            	theLoader.animationsLoaded++;
	            	theLoader.animations.push(animation);
                    theLoader.checkComplete();
	            };	            
	            
	            animation.channels = description.channels;
	            animation.samplers = description.samplers;
	            this.resources.setEntry(entryID, animation, description);
	            var parameters = description.parameters;
	            if (!parameters) {
	                //FIXME: not implemented in delegate
	                console.log("MISSING_PARAMETERS for animation:"+ entryID);
	                return false;
	            }
	
                // Load parameter buffers
                var params = Object.keys(parameters);
                params.forEach( function(param) {

                	animation.totalParameters++;
                    var parameter = parameters[param];
                    var accessor = this.resources.getEntry(parameter);
                    if (!accessor)
                    	debugger;
                    accessor = accessor.object;
                    var bufferView = this.resources.getEntry(accessor.bufferView);
                    var paramObject = {
                    		bufferView : bufferView,
                    		byteOffset : accessor.byteOffset,
                    		count : accessor.count,
                    		type : accessor.type,
                    		id : accessor.bufferView,
                    		name : param             
                    };
                    
                    var paramContext = new AnimationParameterContext(paramObject, animation);

                    var alreadyProcessedAttribute = THREE.GLTFLoaderUtils.getBuffer(paramObject, animationParameterDelegate, paramContext);
                    /*if(alreadyProcessedAttribute) {
                        vertexAttributeDelegate.resourceAvailable(alreadyProcessedAttribute, attribContext);
                    }*/
                }, this);

	            return true;
            }
        },

        handleAccessor: {
            value: function(entryID, description, userInfo) {
	    		// Save attribute entry
	    		this.resources.setEntry(entryID, description, description);
                return true;
            }
        },

        handleSkin: {
            value: function(entryID, description, userInfo) {
	    		// Save skin entry
        	
        		var skin = {
        		};
        		
                var m = description.bindShapeMatrix;
	            skin.bindShapeMatrix = new THREE.Matrix4(
                        m[0],  m[4],  m[8],  m[12],
                        m[1],  m[5],  m[9],  m[13],
                        m[2],  m[6],  m[10], m[14],
                        m[3],  m[7],  m[11], m[15]
                    );
	            
	            skin.jointsIds = description.joints;
	            var inverseBindMatricesDescription = description.inverseBindMatrices;
	            skin.inverseBindMatricesDescription = inverseBindMatricesDescription;
	            skin.inverseBindMatricesDescription.id = entryID + "_inverseBindMatrices";

                var bufferEntry = this.resources.getEntry(inverseBindMatricesDescription.bufferView);

                var paramObject = {
                		bufferView : bufferEntry,
                		byteOffset : inverseBindMatricesDescription.byteOffset,
                		count : inverseBindMatricesDescription.count,
                		type : inverseBindMatricesDescription.type,
                		id : inverseBindMatricesDescription.bufferView,
                		name : skin.inverseBindMatricesDescription.id             
                };
                
	            var context = new InverseBindMatricesContext(paramObject, skin);

                var alreadyProcessedAttribute = THREE.GLTFLoaderUtils.getBuffer(paramObject, inverseBindMatricesDelegate, context);

	            var bufferView = this.resources.getEntry(skin.inverseBindMatricesDescription.bufferView);
	            skin.inverseBindMatricesDescription.bufferView = 
	            	bufferView.object;
	    		this.resources.setEntry(entryID, skin, description);
                return true;
            }
        },

        handleSampler: {
            value: function(entryID, description, userInfo) {
	    		// Save attribute entry
	    		this.resources.setEntry(entryID, description, description);
                return true;
            }
        },

        handleTexture: {
            value: function(entryID, description, userInfo) {
	    		// Save attribute entry
	    		this.resources.setEntry(entryID, null, description);
                return true;
            }
        },
        
        handleError: {
            value: function(msg) {

        		throw new Error(msg);
        		return true;
        	}
        },
        
        _delegate: {
            value: new LoadDelegate,
            writable: true
        },

        delegate: {
            enumerable: true,
            get: function() {
                return this._delegate;
            },
            set: function(value) {
                this._delegate = value;
            }
        }
    });


    // Loader

    var Context = function(rootObj, callback) {
        this.rootObj = rootObj;
        this.callback = callback;
    };

    var rootObj = new THREE.Object3D();

    var self = this;
    
    var loader = Object.create(ThreeGLTFLoader);
    loader.initWithPath(url);
    loader.load(new Context(rootObj, 
    					function(obj) {
    					}), 
    			null);

    this.loader = loader;
    this.callback = callback;
    this.rootObj = rootObj;
    return rootObj;
}

THREE.glTFLoader.prototype.callLoadedCallback = function() {
	var result = {
			scene : this.rootObj,
			cameras : this.loader.cameras,
			animations : this.loader.animations,
	};
	
	this.callback(result);
}

THREE.glTFLoader.prototype.checkComplete = function() {
	if (this.meshesLoaded == this.meshesRequested 
			&& this.shadersLoaded == this.shadersRequested
			&& this.animationsLoaded == this.animationsRequested)
	{
		
		for (var i = 0; i < this.pendingMeshes.length; i++) {
			var pending = this.pendingMeshes[i];
			pending.mesh.attachToNode(pending.node);
		}
		
		for (var i = 0; i < this.animationsLoaded; i++) {
			var animation = this.animations[i];
			this.loader.buildAnimation(animation);
		}

		this.loader.createAnimations();
		this.loader.createMeshAnimations(this.rootObj);
        
		this.callLoadedCallback();
	}
}



