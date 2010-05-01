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
		
		this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		this.gl.clearDepth(1.0);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LESS);
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA);
		this.gl.clearColor(0,0,0,0);
		this.createProgram();
		this.initParticles(32);
	},
	
	setSize: function( width, height )
	{
		this._super( width, height );

		this.viewport.width = this.width;
		this.viewport.height = this.height;
		this.gl.viewport(0,0,this.width,this.height);
	},
	
	initParticles: function (segments)
	{
		var gl=this.gl;
		var x,y;
		var vertexArray=[0,0,0];
		var faceArray=[];
		piStep=6.282/segments;
		for(var i=0;i<segments;i++){
			x=Math.sin(piStep*i);
			y=Math.cos(piStep*i);
			vertexArray.push(x,y,0);
			if(i>0)
			{
				faceArray.push(0,i,i+1);
			}
		}
		faceArray.push(0,i,1);
		
		var vtxShader=[
		"attribute vec3 position;",
		"uniform vec3 location;",
		"uniform mat4 cameraMatrix;",
		"uniform mat4 pMatrix;",
		"uniform float size;",
		"void main(){",
		"vec4 pos=cameraMatrix*vec4(location,1.0);",
		"pos=vec4(position*vec3(size),0.0)+pos;",
		"gl_Position = pMatrix*pos;",
		"}"
		].join("");
		
		frgShader=[
		"uniform vec4 color;",
		"void main(){",
		"gl_FragColor=color;",
		"}"
		].join("");
		
		var vertexShader=gl.createShader(gl.VERTEX_SHADER);
		var fragmentShader=gl.createShader(gl.FRAGMENT_SHADER);

		gl.shaderSource(vertexShader, vtxShader);
		gl.compileShader(vertexShader);
				
		gl.shaderSource(fragmentShader,frgShader);
		gl.compileShader(fragmentShader);
		
		this.particleProgram = gl.createProgram();
		gl.attachShader(this.particleProgram, vertexShader);
		gl.attachShader(this.particleProgram, fragmentShader);
		gl.linkProgram(this.particleProgram);
		
		this.particleProgram.cameraMatrix=gl.getUniformLocation(this.particleProgram, "cameraMatrix");
		this.particleProgram.pMatrix=gl.getUniformLocation(this.particleProgram, "pMatrix");
		this.particleProgram.color=gl.getUniformLocation(this.particleProgram, "color");
		this.particleProgram.size=gl.getUniformLocation(this.particleProgram, "size");
		this.particleProgram.location=gl.getUniformLocation(this.particleProgram, "location");
		this.particleProgram.position=gl.getAttribLocation(this.particleProgram, "position");
		
		this.particleProgram.mvMatrixArray=new WebGLFloatArray(16);
		this.particleProgram.pMatrixArray=new WebGLFloatArray(16);
		
		this.particleProgram.webGLVertexBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, this.particleProgram.webGLVertexBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new WebGLFloatArray(vertexArray), gl.STATIC_DRAW );
					
		this.particleProgram.webGLFaceBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.particleProgram.webGLFaceBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new WebGLUnsignedShortArray(faceArray), gl.STATIC_DRAW );	
		this.particleProgram.faceNum=faceArray.length;
		
		this.particleProgram.cameraMatrixArray=new WebGLFloatArray(16);
		this.particleProgram.pMatrixArray=new WebGLFloatArray(16);
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
		gl.compileShader(vertexShader);
	
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
		array[2]=matrix.n13;
		array[3]=matrix.n14;
		array[4]=matrix.n21;
		array[5]=matrix.n22;
		array[6]=matrix.n23;
		array[7]=matrix.n24;
		array[8]=matrix.n31;
		array[9]=matrix.n32;
		array[10]=matrix.n33;
		array[11]=matrix.n34;
		array[12]=matrix.n41;
		array[13]=matrix.n42;
		array[14]=matrix.n43;
		array[15]=matrix.n44;
	},
	
	render: function( scene, camera )
	{		
		var gl=this.gl;
		var vertexArray,colorArray,faceArray;
		
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
					if (object.material instanceof ColorMaterial)
					{
						color=object.material.color;
					}
					else if (object.material instanceof FaceColorMaterial)
					{
						color = face.color;
					}
					if (face instanceof Face3)
					{
						vertexArray.push( face.a.x, face.a.y, face.a.z );
						vertexArray.push( face.b.x, face.b.y, face.b.z );
						vertexArray.push( face.c.x, face.c.y, face.c.z );
						colorArray.push( color.r/255, color.g/255, color.b/255, color.a/255 );
						colorArray.push( color.r/255, color.g/255, color.b/255, color.a/255 );
						colorArray.push( color.r/255, color.g/255, color.b/255, color.a/255 );
						faceArray.push( vertexIndex, vertexIndex+1, vertexIndex+2 );
						vertexIndex += 3;
					}
					else if (face instanceof Face4)
					{					
						vertexArray.push( face.a.x, face.a.y, face.a.z );
						vertexArray.push( face.b.x, face.b.y, face.b.z );
						vertexArray.push( face.c.x, face.c.y, face.c.z );
						vertexArray.push( face.d.x, face.d.y, face.d.z );
						colorArray.push( color.r/255, color.g/255, color.b/255, color.a/255 );
						colorArray.push( color.r/255, color.g/255, color.b/255, color.a/255 );
						colorArray.push( color.r/255, color.g/255, color.b/255, color.a/255 );
						colorArray.push( color.r/255, color.g/255, color.b/255, color.a/255 );
						faceArray.push( vertexIndex, vertexIndex+1, vertexIndex+2 );
						faceArray.push( vertexIndex, vertexIndex+2, vertexIndex+3 );
						vertexIndex += 4;
					}
				}

				vertexArray = new WebGLFloatArray(vertexArray);
				colorArray = new WebGLFloatArray(colorArray);
				faceArray = new WebGLUnsignedShortArray(faceArray);
				
				
				if (!object.WebGLVertexBuffer) object.WebGLVertexBuffer = gl.createBuffer();
				gl.bindBuffer( gl.ARRAY_BUFFER, object.WebGLVertexBuffer );
				gl.bufferData( gl.ARRAY_BUFFER, vertexArray, gl.DYNAMIC_DRAW );
					
				if (!object.WebGLColorBuffer) object.WebGLColorBuffer = gl.createBuffer();
				gl.bindBuffer( gl.ARRAY_BUFFER, object.WebGLColorBuffer );
				gl.bufferData( gl.ARRAY_BUFFER, colorArray, gl.DYNAMIC_DRAW );
					
				if(!object.WebGLFaceBuffer) object.WebGLFaceBuffer = gl.createBuffer();
				gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, object.WebGLFaceBuffer );
				gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, faceArray, gl.DYNAMIC_DRAW );
					
				gl.useProgram(this.program);
			
				this.matrix.multiply( camera.matrix, object.matrix );
				
				this.matrix2Array( this.matrix, this.program.mvMatrixArray );
				this.matrix2Array( camera.projectionMatrix, this.program.pMatrixArray );
				
				gl.uniformMatrix4fv(this.program.pMatrix, true, this.program.pMatrixArray);
				gl.uniformMatrix4fv(this.program.mvMatrix, true, this.program.mvMatrixArray);
				
				for(var n=0; n<8; n++) gl.disableVertexAttribArray(i);
				
				gl.bindBuffer(gl.ARRAY_BUFFER, object.WebGLVertexBuffer);
				gl.enableVertexAttribArray(this.program.position);
				gl.vertexAttribPointer(this.program.position, 3, gl.FLOAT, false, 0, 0);
				
				gl.bindBuffer(gl.ARRAY_BUFFER, object.WebGLColorBuffer);
				gl.enableVertexAttribArray(this.program.color);
				gl.vertexAttribPointer(this.program.color, 4, gl.FLOAT, false, 0, 0);
				
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.WebGLFaceBuffer);
				gl.drawElements(gl.TRIANGLES,faceArray.length, gl.UNSIGNED_SHORT, 0);
				
			}
			else if (object instanceof Particle)
			{	
				var color
				if (object.material instanceof ColorMaterial)
				{
					color=object.material.color;
				}
				else if (object.material instanceof FaceColorMaterial)
				{
					color = face.color;
				}
					
				gl.useProgram(this.particleProgram);
				
				gl.bindBuffer(gl.ARRAY_BUFFER, this.particleProgram.webGLVertexBuffer);
				gl.enableVertexAttribArray(this.particleProgram.position);
				gl.vertexAttribPointer(this.particleProgram.position, 3, gl.FLOAT, false, 0, 0);
				
				gl.uniform3f( this.particleProgram.location, object.position.x, object.position.y, object.position.z );
				gl.uniform4f( this.particleProgram.color, color.r/255, color.g/255, color.b/255, color.a/255 );
				gl.uniform1f( this.particleProgram.size, object.size);
				
				this.matrix2Array( camera.matrix, this.particleProgram.cameraMatrixArray );
				this.matrix2Array( camera.projectionMatrix, this.particleProgram.pMatrixArray );
				
				gl.uniformMatrix4fv(this.particleProgram.pMatrix, true, this.particleProgram.pMatrixArray);
				gl.uniformMatrix4fv(this.particleProgram.cameraMatrix, true, this.particleProgram.cameraMatrixArray);
				
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.particleProgram.webGLFaceBuffer);
				gl.drawElements(gl.TRIANGLES,this.particleProgram.faceNum, gl.UNSIGNED_SHORT, 0);
				
			}
			
		}
	}
});
	
	
