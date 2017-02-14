function GPUComputationRendererVariable(sizeX, sizeY, name) {
	this.name = name;
	this.sizeX = sizeX;
	this.sizeY = sizeY;
	this.magFilter = THREE.NearestFilter;
	this.minFilter = THREE.NearestFilter;
	this.wrapS = THREE.ClampToEdgeWrapping;
	this.wrapT = THREE.ClampToEdgeWrapping;

	// we need to initialize the uniforms in case another 
	// user wants to add properties (they will be left untouched)
	this.material = { uniforms: {} }; 

	this.computeShader = null;

	// properties for the render target
	this.format = THREE.RGBAFormat;
	this.type = ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) ? THREE.HalfFloatType : THREE.FloatType;
	this.stencilBuffer = false;

	// this will be set by the GPUComputationRenderer when we are added to the list of variables
	this.computationRenderer = null; 

	// the list of variables that we depend upon
	this.dependenciesVariables = [];

	this.currentBufferIndex = 0;
	this.buffers = [ null, null ]

	this.initializeRenderers = function() {
		// create the two render targets for buffering
		this.buffers[0] = new THREE.WebGLRenderTarget( this.sizeX, this.sizeY, this);
		this.buffers[1] = this.renderTargets[0].copy();
	}

	this.initializeWithShader = function(initialShader, uniforms) {
		this.material = this.compileShaderIntoMaterial(initialShader, uniforms);

		this.computationRenderer.renderVariable( this );
	}

	this.initializeWithTexture = function(initialTexture) {
		// we need a dummy shader to write into the render target
		this.material = this.compileShaderIntoMaterial(this.getPassThroughFragmentShader());
		// push the texture through the renderer.
		this.material.uniforms['texture'] = { value: initialTexture };

		this.computationRenderer.renderVariable( this );
	}

	/** Sets the shader we use for computing this variable. */
	this.setComputeShader = function(computeShader) {
		this.computeShader = computeShader;

		this.material = this.compileShaderIntoMaterial(computeShader);
	}

	this.addDependency = function(variable) {
		this.dependenciesVariables.push(variable);	

		// recompile the shader since we have new dependencies
		this.material = this.compileShaderIntoMaterial(this.updateShader);
	}

	/** renders this variable but does not render the dependencies also*/
	this.compute = function() {
		// flip between the two buffers (need to do this *before* rendering)
		this.currentBufferIndex = (this.currentBufferIndex + 1) % 2;

		// update the dependencies information (we don't force the variables to compute however)
		this.setDependentVariablesAsUniforms(this.material.uniforms);

		// finally render the variable
		this.computationRenderer.renderVariable( this );
	}

	/** gets the rendered output of this variable or null if it hasn't been rendered. */
	this.getRenderedOutput = function() {
		if (this.buffers[this.currentBufferIndex] !== null) {
			return this.buffers[this.currentBufferIndex].texture;
		}

		return null;
	}

	/** Compute this variable and its dependencies. We do a DFS of the graph but 
	* one must be aware of cycles.
	**/
	this.computeWithDependencies = function() {
		// flip between the two buffers
		this.currentBufferIndex = (this.currentBufferIndex + 1) % 2;

		// need to do a DFS of the graph
	}

	//////////////////////////////////////////
	/////// Internal functions ///////
	//////////////////////////////////////////
	/** generates the list of texture variables that we need to expose to this renderer */
	this.generateDependentVariableHeader = function() {
		var header =  "uniform sampler2D " + this.name + ";\n";

		for (var i = 0; i < this.dependenciesVariables.length; i++) {
			header += "uniform sampler2D " + this.dependenciesVariables[i].name + ";\n";
		}
	}

	this.getResolutionDefineString = function() {
		return "\n#define resolution vec2(" + this.sizeX.toFixed( 1 ) + ", " + this.sizeY.toFixed( 1 ) + ")\n";
	}

	this.setDependentVariablesAsUniforms = function(uniforms) {

		for (var i = 0; i < this.dependenciesVariables.length; i++) {
			var variable = this.dependenciesVariables[i];

			uniforms[variable.name] = { value: variable.getRenderedOutput() };
		}

		return uniforms;
	}

	/** Appends the variables and resolution then compiles into a material.
	* In Three.js, the compilation probably happens later.
	*/
	this.compileShaderIntoMaterial = function(shader, uniforms) {
		shader = [this.getResolutionDefineString(), this.generateDependentVariableHeader(), shader].join("\n");

		// the user might want custom uniforms
		if (uniforms === null) {
			uniforms = {};
		}

		return new THREE.ShaderMaterial( {
			uniforms: this.setDependentVariablesAsUniforms(uniforms), // add the output of other variables
			vertexShader: getPassThroughVertexShader(), // dummy vertex shader
			fragmentShader: shader
		} );

	}

	function getPassThroughVertexShader() {

		return	"void main()	{\n" +
				"\n" +
				"	gl_Position = vec4( position, 1.0 );\n" +
				"\n" +
				"}\n";

	}

	function getPassThroughFragmentShader() {

		return	getResolutionDefineString() +
				"\nuniform sampler2D texture;\n\n" +
				"void main() {\n" +
				"\n" +
				"	vec2 uv = gl_FragCoord.xy / resolution.xy;\n" +
				"\n" +
				"	gl_FragColor = texture2D(texture, uv);\n" +
				"\n" +
				"}\n";

	}

}