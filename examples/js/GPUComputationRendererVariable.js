function GPUComputationRendererVariable(sizeX, sizeY, name, updateShader) {

	this.sizeX = sizeX;
	this.sizeY = sizeY;
	this.magFilter = THREE.NearestFilter;
	this.minFilter = THREE.NearestFilter;

	this.computationRenderer = null;

	// the list of variables that we depend upon
	this.dependenciesVariables = [];

	this.initializeWithShader = function(initialShader) {

	}

	this.initializeWithTexture = function(initialTexture) {

	}

	this.addDependency = function(variable) {

	}

	//////////////////////////////////////////
	/////// Internal functions ///////
	//////////////////////////////////////////
	function getResolutionDefineString() {

		return "\n#define resolution vec2(" + this.sizeX.toFixed( 1 ) + ", " + this.sizeY.toFixed( 1 ) + ")\n";

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