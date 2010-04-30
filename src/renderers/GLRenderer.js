var GLRenderer = Renderer.extend
({
	
	init: function()
	{
		this._super();
		
		this.viewport = document.createElement("canvas");
		this.viewport.style.position = "absolute";
		
		try {
			this.gl = this.viewport.getContext("experimental-webgl");
		} catch(e) {}
			
		if (!this.gl) {
			alert("WebGL not supported");
			throw "cannot create webgl context";
		}
		
		this.gl.enable(this.gl.DEPTH_TEST);
		
		this.createProgram();
	},
	
	createProgram: function()
	{
		var gl=this.gl;
		
		var vtxShader=[
		"attribute vec3 position;",
		"attribute vec4 color;",
		"uniform mat4 mvMatrix;",
		"uniform mat4 pMatrix;",
		"varying vec4 vcolor;",
		"void main(){",
		"vcolor=color;",
		"gl_Position = pMatrix*mvMatrix*vec4(position,1.0);",
		"}"
		].join("");
		
		frgShader=[
		"varying vec4 vcolor;",
		"void main(){",
		"gl_FragColor=vcolor;",
		"}"
		].join("");
		
		var vertexShader=gl.createShader(gl.VERTEX_SHADER);
		var fragmentShader=gl.createShader(gl.FRAGMENT_SHADER);

		gl.shaderSource(vertexShader, vtxShader);
		
		gl.shaderSource(fragmentShader,frgShader);
		gl.compileShader(fragmentShader);
		
		this.program = gl.createProgram();
		gl.attachShader(this.program, vertexShader);
		gl.attachShader(this.program, fragmentShader);
		gl.linkProgram(this.program);
		
		this.program.mvMatrix=gl.getUniformLocation(this.program, "mvMatrix");
		this.program.pMatrix=gl.getUniformLocation(this.program, "pMatrix");
		this.program.position=gl.getAttribLocation(this.program, "position");
		this.program.color=gl.getAttribLocation(this.program, "color");
		
		this.program.mvMatrixArray=new WebGLFloatArray(16);
		this.program.pMatrixArray=new WebGLFloatArray(16);
	},
	
	matrix2Array: function( matrix, array )
	{
		array[0]=matrix.n11;
		array[1]=matrix.n12;
		array[3]=matrix.n13;
		array[4]=matrix.n14;
		array[5]=matrix.n21;
		array[6]=matrix.n22;
		array[7]=matrix.n23;
		array[8]=matrix.n24;
		array[9]=matrix.n31;
		array[10]=matrix.n32;
		array[11]=matrix.n33;
		array[12]=matrix.n34;
		array[13]=matrix.n41;
		array[14]=matrix.n42;
		array[15]=matrix.n43;
		array[16]=matrix.n44;
	},
	
	render: function( scene, camera )
	{		
		var gl=this.gl;

		gl.viewport(0,0,this.width,this.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		for (var i = 0; i < scene.objects.length; i++)
		{
			object = scene.objects[i];
			
			if (object instanceof Mesh)
			{
				// Very inefficient but easiest way initially
				var vertexArray = [];
				var faceArray = [];
				var colorArray = [];
				var vertexIndex = 0;
				var color;
				
				for (j = 0; j < object.geometry.faces.length; j++)
				{
					face = object.geometry.faces[j];
					color = face.color;
					
					if (face instanceof Face3){
						vertexArray.push( face.a.x, face.a.y, face.a.z );
						vertexArray.push( face.b.x, face.b.y, face.b.z );
						vertexArray.push( face.c.x, face.c.y, face.c.z );
						colorArray.push( color.r, color.g, color.b, color.a );
						colorArray.push( color.r, color.g, color.b, color.a );
						colorArray.push( color.r, color.g, color.b, color.a );
						faceArray.push( vertexIndex, vertexIndex+1, vertexIndex+2 );
						vertexIndex += 3;
					}
					else if (face instanceof Face4)
					{
						vertexArray.push( face.a.x, face.a.y, face.a.z );
						vertexArray.push( face.b.x, face.b.y, face.b.z );
						vertexArray.push( face.c.x, face.c.y, face.c.z );
						vertexArray.push( face.d.x, face.d.y, face.d.z );
						colorArray.push( color.r, color.g, color.b, color.a );
						colorArray.push( color.r, color.g, color.b, color.a );
						colorArray.push( color.r, color.g, color.b, color.a );
						colorArray.push( color.r, color.g, color.b, color.a );
						faceArray.push( vertexIndex, vertexIndex+1, vertexIndex+2 );
						faceArray.push( vertexIndex, vertexIndex+3, vertexIndex+3 );
						vertexIndex += 4;
					}
				}
				
				
				var vertexArray = new WebGLFloatArray(vertexArray);
				var colorArray = new WebGLFloatArray(colorArray);
				var faceArray = new WebGLUnsignedShortArray(faceArray);
					
				if (!object.WebGLVertexBuffer) object.WebGLVertexBuffer = gl.createBuffer();
				gl.bindBuffer( gl.ARRAY_BUFFER, object.WebGLVertexBuffer );
				gl.bufferData( gl.ARRAY_BUFFER, vertexArray, gl.DYNAMIC_DRAW );
					
				if (!object.WebGLColorBuffer) object.WebGLColorBuffer = gl.createBuffer();
				gl.bindBuffer( gl.ARRAY_BUFFER, object.WebGLColorBuffer );
				gl.bufferData( gl.ARRAY_BUFFER, vertexArray, gl.DYNAMIC_DRAW );
					
				if(!object.WebGLFaceBuffer) object.WebGLFaceBuffer = gl.createBuffer();
				
				gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, object.WebGLFaceBuffer );
				gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, faceArray, gl.DYNAMIC_DRAW );
				
				
				gl.useProgram(this.program);
			
				this.matrix.multiply( camera.matrix, object.matrix );
				
				this.matrix2Array( this.matrix, this.program.mvMatrixArray );
				this.matrix2Array( camera.projectionMatrix, this.program.pMatrixArray );
				
				gl.uniformMatrix4fv(this.program.pMatrix, true, this.program.pMatrixArray);
				gl.uniformMatrix4fv(this.program.mvMatrix, true, this.program.mvMatrixArray);
				
				for(var i=0; i<8; i++) gl.disableVertexAttribArray(i);
				
				gl.bindBuffer(gl.ARRAY_BUFFER, object.WebGLVertexBuffer);
				gl.enableVertexAttribArray(this.program.position);
				gl.vertexAttribPointer(this.program.position, 3, gl.FLOAT, false, 0, 0);
				
				gl.bindBuffer(gl.ARRAY_BUFFER, object.WebGLColorBuffer);
				gl.enableVertexAttribArray(this.program.color);
				gl.vertexAttribPointer(this.program.color, 4, gl.FLOAT, false, 0, 0);
				
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.WebGLFaceBuffer);
				alert(faceArray.length);
				gl.drawElements(gl.TRIANGLES,faceArray.length, gl.UNSIGNED_SHORT, 0);
			}
			//TODO Particles!!
		}
	}
});
	
	
