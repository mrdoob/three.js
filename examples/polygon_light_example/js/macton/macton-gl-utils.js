jQuery.glCheckError = function( gl, error_log ) 
{
  var error = gl.getError();
  if (error != gl.NO_ERROR) 
  {
    var error_str = "GL Error: " + error + " " + gl.enum_strings[error];

    if ( typeof error_log === 'function' ) 
    {
      error_log( error_str );
    }

    throw error_str;
  }
}

// jQuery.glProgram = function( gl, config, complete )
//
// Example config:
//
// var g_BumpReflectProgram = 
// {
//   VertexProgramURL:   '/shaders/bump_reflect.vs',
//   FragmentProgramURL: '/shaders/bump_reflect.fs',
//   ErrorLog:           error_log,
// };

jQuery.glProgram = function( gl, config, complete )
{
  this.Program           = null;
  this.UniformLocations  = { };
  this.AttributeIndices  = [];
  this.Uniforms          = [];
  this.UniformTypes      = { };
  this.Attributes        = [];
  this.AttributeTypes    = { };
  this.ErrorLog          = config.error_log;
  this.BoundTextureCount = 0;

  this.Use = function()
  {
    gl.useProgram( this.Program );

    this.BoundTextureCount = 0;
  }

  this.BindModel = function( model, bindings )
  {
    var attribute_ndx = this.AttributeIndices;

    gl.bindBuffer(gl.ARRAY_BUFFER, model.VertexBuffer );

    for ( var model_stream_name in bindings )
    {
      var program_stream_name = bindings[ model_stream_name ];
      var program_attribute   = this.AttributeIndices[ program_stream_name ];
      var model_stream_offset = model.VertexStreamBufferOffsets[ model_stream_name ];
      var model_stream_stride = model.VertexStreamBufferStrides[ model_stream_name ];
      var model_stream_type   = model.VertexStreamBufferGLTypes[ model_stream_name ];

      gl.vertexAttribPointer( program_attribute, model_stream_stride, model_stream_type, false, 0, model_stream_offset );
      gl.enableVertexAttribArray( program_attribute );
    }

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, model.IndexBuffer );

    $.glCheckError( gl, this.ErrorLog );

    this.Model = model;
  }

  this.BindUniform = function( uniform_name, value )
  { 
    var uniform_type = this.UniformTypes[ uniform_name ];
 
    switch (uniform_type)
    {
      case 'mat4':
      {
        gl.uniformMatrix4fv( this.UniformLocations[ uniform_name ], gl.FALSE, new Float32Array( value ) );
      }
      break;

      case 'sampler2D':
      {
        gl.activeTexture( gl[ 'TEXTURE' + this.BoundTextureCount ] );
 
        if ( value instanceof jQuery.glTexture )
        {
          gl.bindTexture( gl.TEXTURE_2D, value.Texture );
        }
        else
        {
          gl.bindTexture( gl.TEXTURE_2D, value );
        }

        gl.uniform1i( this.UniformLocations[ uniform_name ], this.BoundTextureCount );
        this.BoundTextureCount++;
      }
      break;

      case 'samplerCube':
      {
        gl.activeTexture( gl[ 'TEXTURE' + this.BoundTextureCount ] );
        gl.bindTexture( gl.TEXTURE_CUBE_MAP, value );
        gl.uniform1i( this.UniformLocations[ uniform_name ], this.BoundTextureCount );
        this.BoundTextureCount++;
      }
      break;
    }
  }

  this.DrawModel = function()
  {
    var model = this.Model; // Model must be bound with BindModel first.

    gl.drawElements( gl.TRIANGLES, model.IndexCount, model.IndexStreamGLType, 0 );
  }

  this.CreateBestVertexBindings = function( model )
  {
    var bindings = new Object();

    for (var i=0;i<model.VertexStreamNames.length;i++)
    {
      var vertex_stream_name = model.VertexStreamNames[i];
      var best_dist          = 1000;

      for (var j=0;j<this.Attributes.length;j++)
      {
        var attribute_name = this.Attributes[j];
        var dist           = vertex_stream_name.LD( attribute_name );
        if ( dist < best_dist )
        { 
          bindings[ vertex_stream_name ] = attribute_name;
          best_dist                      = dist;
        }
      }
    }

    return (bindings);
  }

  var vertex_shader   = null;
  var fragment_shader = null;

  var CompileShader = function( type, source )
  {
    var shader = gl.createShader(type);

    if (shader == null) 
    {
      return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
    {
      var infoLog = gl.getShaderInfoLog(shader);
      output("Error compiling shader:\n" + infoLog);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  var TryErrorLog = function( msg )
  {
    if ( typeof config.ErrorLog !== 'function' ) return;

    config.ErrorLog( msg );
  }

  var TryBuildProgram = function()
  {
    if ( vertex_shader   == null ) return;
    if ( fragment_shader == null ) return;

    this.Program = gl.createProgram();
    if (this.Program == null) 
    {
      TryErrorLog("Could not create GL program");
      return;
    }

    gl.attachShader( this.Program, vertex_shader );
    gl.attachShader( this.Program, fragment_shader );

    for (var i=0;i<this.Attributes.length;i++)
    {
      var attribute_name = this.Attributes[i];

      this.AttributeIndices[ attribute_name ] = i;

      gl.bindAttribLocation( this.Program, i, attribute_name );
    }

    gl.linkProgram( this.Program );

    var linked = gl.getProgramParameter( this.Program, gl.LINK_STATUS );
    if (!linked) 
    {
      var infoLog = gl.getProgramInfoLog(this.Program);

      TryErrorLog("GL program link failed: " + infoLog);

      gl.deleteProgram( this.Program );
      this.Program = null;

      return;
    }

    for (var i=0;i<this.Uniforms.length;i++)
    {
      var uniform_name = this.Uniforms[i];

      this.UniformLocations[ uniform_name ] = gl.getUniformLocation( this.Program, uniform_name );
    }

    $.glCheckError( gl, config.error_log );

    if ( typeof complete === 'function' ) complete( this );
  }

  var AddUniforms = function( source )
  {
    var uniform_match = /uniform\s+(\w+)\s+(\w+)\s*;/g
    var uniforms      = source.match( uniform_match );

    for (var i=0;i<uniforms.length;i++)
    {
      var uniform       = uniforms[i].split( uniform_match );
      var uniform_type  = uniform[1];
      var uniform_name  = uniform[2];
  
      this.Uniforms.push( uniform_name );
      this.UniformTypes[ uniform_name ] = uniform_type;
    }
  }

  var AddAttributes = function( source )
  {
    var attribute_match = /attribute\s+(\w+)\s+(\w+)\s*;/g
    var attributes      = source.match( attribute_match );

    for (var i=0;i<attributes.length;i++)
    {
      var attribute       = attributes[i].split( attribute_match );
      var attribute_type  = attribute[1];
      var attribute_name  = attribute[2];
  
      this.Attributes.push( attribute_name );
      this.AttributeTypes[ attribute_name ] = attribute_type;
    }
  }

  var LoadVertexShader = function( source )
  {
    vertex_shader = CompileShader.apply( this, [ gl.VERTEX_SHADER, source ] );

    AddUniforms.apply( this, [ source ] );
    AddAttributes.apply( this, [ source ] );

    TryBuildProgram.apply( this );
  }

  var LoadFragmentShader = function( source )
  {
    fragment_shader = CompileShader.apply( this, [ gl.FRAGMENT_SHADER, source ] );
   
    AddUniforms.apply( this, [ source ] );
    TryBuildProgram.apply( this );
  }

  var that = this;

  this.get = function( url, fn )
  {
	var request = new XMLHttpRequest();
	request.open( "GET", url, true );
	request.send( null );
	fn( request.responseText );
  }

  this.get( config.VertexProgramURL,   function( source ) { LoadVertexShader.apply( that, arguments ); } );
  this.get( config.FragmentProgramURL, function( source ) { LoadFragmentShader.apply( that, arguments ); } );

//  $.get( config.VertexProgramURL,   function( source ) { LoadVertexShader.apply( that, arguments ); } );
//  $.get( config.FragmentProgramURL, function( source ) { LoadFragmentShader.apply( that, arguments ); } );
}

// jQuery.glModel = function( gl, model_url, complete )
//
// Model JSON format:
// {
//   VertexStreams: [
//     {
//       Name: "position",
//       Type: "float",
//       Stride: 3,
//       Stream: [ 1.0, 1.0, 1.0, ... ]
//     }
//     ,...
//   ]
//   Indices:  
//   {
//     Type: "uint16_t",
//     Stream: [ 0, 1, 2, 2, 3, 4, ... ]
//     }
//   }
// }

jQuery.glModel = function( gl, model_url, complete )
{
  this.VertexStreamNames         = [];
  this.VertexStreamBuffers       = [];
  this.VertexStreamBufferOffsets = [];
  this.VertexStreamBufferStrides = [];
  this.VertexStreamBufferGLTypes = [];
  this.VertexBuffer              = null;
  this.IndexStreamBuffer         = null;
  this.IndexStreamGLType         = null;
  this.IndexBuffer               = null;
  this.IndexCount                = 0;

  var LoadModel = function( source )
  {
    var CreateArrayByStdType = function( type, source )
    {
      if (type == 'float')
      {
        return new Float32Array( source );
      }
      else if (type == 'uint16_t')
      {
        return new Uint16Array( source );
      }
      else if (type == 'uint32_t')
      {
        return new Uint32Array( source );
      }
      else if (type == 'uint8_t')
      {
        return new Uint8Array( source );
      }
    }

    var GLTypeByStdType = function( type )
    {
      if (type == 'float')
      {
        return gl.FLOAT;
      }
      else if (type == 'uint16_t')
      {
        return gl.UNSIGNED_SHORT;
      }
      else if (type == 'uint32_t')
      {
        return gl.UNSIGNED_INT;
      }
      else if (type == 'uint8_t')
      {
        return gl.UNSIGNED_BYTE;
      }
    }

    var vertex_stream_count = source.VertexStreams.length;
    var vertex_buffer_size  = 0;

    for (var i=0;i<vertex_stream_count;i++)
    {
      var stream_source  = source.VertexStreams[i];
      var stream_name    = stream_source.Name;
      var stream_buffer  = CreateArrayByStdType( stream_source.Type, stream_source.Stream );
      var stream_stride  = stream_source.Stride;
      var stream_type    = stream_source.Type;
      var stream_gl_type = GLTypeByStdType( stream_type );

      this.VertexStreamBuffers[i]                   = stream_buffer;
      this.VertexStreamNames[i]                     = stream_name;
      this.VertexStreamBufferOffsets[ stream_name ] = vertex_buffer_size;
      this.VertexStreamBufferStrides[ stream_name ] = stream_stride;
      this.VertexStreamBufferGLTypes[ stream_name ] = stream_gl_type;

      if ( stream_buffer )
      {
        vertex_buffer_size += stream_buffer.byteLength;
      }
    }  

    this.VertexBuffer = gl.createBuffer();

    gl.bindBuffer( gl.ARRAY_BUFFER, this.VertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, vertex_buffer_size, gl.STATIC_DRAW );

    for (var i=0;i<vertex_stream_count;i++)
    {
      var stream_source = source.VertexStreams[i];
      var stream_name   = stream_source.Name;

      gl.bufferSubData( gl.ARRAY_BUFFER, this.VertexStreamBufferOffsets[ stream_name ], this.VertexStreamBuffers[i] );
    }

    this.IndexBuffer       = gl.createBuffer();
    this.IndexStreamBuffer = CreateArrayByStdType( source.Indices.Type, source.Indices.Stream );
    this.IndexStreamGLType = GLTypeByStdType( source.Indices.Type );
    this.IndexCount        = source.Indices.Stream.length;

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.IndexBuffer );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, this.IndexStreamBuffer, gl.STATIC_DRAW );

    if ( typeof complete === 'function' ) complete( this );
  }

  var that = this;

	$.ajax({
		url: model_url,
		dataType: 'json',
		mimeType: 'application/json',
		success: function( source ) { LoadModel.apply( that, arguments ); }
	});

  //$.getJSON( model_url, function( source ) { LoadModel.apply( that, arguments ); } );
}


jQuery.glModel2 = function( gl, model, complete )
{
  this.VertexStreamNames         = [];
  this.VertexStreamBuffers       = [];
  this.VertexStreamBufferOffsets = [];
  this.VertexStreamBufferStrides = [];
  this.VertexStreamBufferGLTypes = [];
  this.VertexBuffer              = null;
  this.IndexStreamBuffer         = null;
  this.IndexStreamGLType         = null;
  this.IndexBuffer               = null;
  this.IndexCount                = 0;

  var LoadModel = function( source )
  {
    var CreateArrayByStdType = function( type, source )
    {
      if (type == 'float')
      {
        return new Float32Array( source );
      }
      else if (type == 'uint16_t')
      {
        return new Uint16Array( source );
      }
      else if (type == 'uint32_t')
      {
        return new Uint32Array( source );
      }
      else if (type == 'uint8_t')
      {
        return new Uint8Array( source );
      }
    }

    var GLTypeByStdType = function( type )
    {
      if (type == 'float')
      {
        return gl.FLOAT;
      }
      else if (type == 'uint16_t')
      {
        return gl.UNSIGNED_SHORT;
      }
      else if (type == 'uint32_t')
      {
        return gl.UNSIGNED_INT;
      }
      else if (type == 'uint8_t')
      {
        return gl.UNSIGNED_BYTE;
      }
    }

    var vertex_stream_count = source.VertexStreams.length;
    var vertex_buffer_size  = 0;

    for (var i=0;i<vertex_stream_count;i++)
    {
      var stream_source  = source.VertexStreams[i];
      var stream_name    = stream_source.Name;
      var stream_buffer  = CreateArrayByStdType( stream_source.Type, stream_source.Stream );
      var stream_stride  = stream_source.Stride;
      var stream_type    = stream_source.Type;
      var stream_gl_type = GLTypeByStdType( stream_type );

      this.VertexStreamBuffers[i]                   = stream_buffer;
      this.VertexStreamNames[i]                     = stream_name;
      this.VertexStreamBufferOffsets[ stream_name ] = vertex_buffer_size;
      this.VertexStreamBufferStrides[ stream_name ] = stream_stride;
      this.VertexStreamBufferGLTypes[ stream_name ] = stream_gl_type;

      if ( stream_buffer )
      {
        vertex_buffer_size += stream_buffer.byteLength;
      }
    }  

    this.VertexBuffer = gl.createBuffer();

    gl.bindBuffer( gl.ARRAY_BUFFER, this.VertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, vertex_buffer_size, gl.STATIC_DRAW );

    for (var i=0;i<vertex_stream_count;i++)
    {
      var stream_source = source.VertexStreams[i];
      var stream_name   = stream_source.Name;

      gl.bufferSubData( gl.ARRAY_BUFFER, this.VertexStreamBufferOffsets[ stream_name ], this.VertexStreamBuffers[i] );
    }

    this.IndexBuffer       = gl.createBuffer();
    this.IndexStreamBuffer = CreateArrayByStdType( source.Indices.Type, source.Indices.Stream );
    this.IndexStreamGLType = GLTypeByStdType( source.Indices.Type );
    this.IndexCount        = source.Indices.Stream.length;

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.IndexBuffer );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, this.IndexStreamBuffer, gl.STATIC_DRAW );

    if ( typeof complete === 'function' ) complete( this );
  }

  var that = this;
/*
	$.ajax({
		url: model_url,
		dataType: 'json',
		mimeType: 'application/json',
		success: function( source ) { LoadModel.apply( that, arguments ); }
	});
*/
  LoadModel.apply( this, [ model ] );
}


// jQuery.glTexture = function( gl, config, complete )
// 
// Example config:
// 
//   var g_BumpTextureConfig =
//   {
//     Type:      'TEXTURE_2D',
//     ImageURL:  './images/bump.jpg',
//     TexParameters: 
//     {
//       TEXTURE_MIN_FILTER: 'LINEAR',
//       TEXTURE_MAG_FILTER: 'LINEAR',
//       TEXTURE_WRAP_S:     'REPEAT',
//       TEXTURE_WRAP_T:     'REPEAT'
//     },
//     PixelStoreParameters:
//     {
//       UNPACK_FLIP_Y_WEBGL: true
//     }
//   };

jQuery.glTexture = function( gl, config, complete )
{
  this.Texture  = gl.createTexture();
  this.ErrorLog = config.ErrorLog;

  var texture_type = gl[ config.Type ];
  var images_remaining;
  var that = this;

  if ( this.Texture == null )
  {
    return null;
  }

  gl.bindTexture( texture_type, this.Texture );

  for ( var pname in config.TexParameters )
  {
    var pvalue          = config.TexParameters[ pname ];
    var parameter_name  = gl[ pname ]; 
    var parameter_value = gl[ pvalue ];

    gl.texParameteri( texture_type, parameter_name, parameter_value );
    $.glCheckError( gl, this.ErrorLog );
  }

  var ImageLoaded = function( image, image_type, mip )
  {
    gl.bindTexture( texture_type, this.Texture );
    $.glCheckError( gl, this.ErrorLog );

    for ( var pname in config.PixelStoreParameters )
    {
      var parameter_name  = gl[ pname ];
      var parameter_value = config.PixelStoreParameters[ pname ];

      gl.pixelStorei( parameter_name, parameter_value );
      $.glCheckError( gl, this.ErrorLog );
    }

    gl.texImage2D( image_type, mip, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image );

    $.glCheckError( gl, this.ErrorLog );

	if ( texture_type === gl.TEXTURE_CUBE_MAP && image_type === gl.TEXTURE_CUBE_MAP_NEGATIVE_Z )
		gl.generateMipmap( texture_type );

	if ( texture_type === gl.TEXTURE_2D && config.MipURL == undefined )
		gl.generateMipmap( texture_type );

    $.glCheckError( gl, this.ErrorLog );

    images_remaining--;

    if ( images_remaining == 0 ) 
    {
    	if ( typeof complete === 'function' ) complete( this );
    }
  }

  var LoadImage = function( src, image_type, mip )
  {
    var image        = new Image();
    image.onload     = function() { ImageLoaded.apply( that, [ image, image_type, mip ] ); };
    image.src        = src;
  }

  if ( typeof config.ImageURL == 'string' )
  {
    images_remaining = 1;
    
    if ( config.MipURL !== undefined )
    {
    	images_remaining += config.MipURL.length;
    }
    
    LoadImage( config.ImageURL, gl[ config.Type ], 0 );

	if ( config.MipURL !== undefined )
	{
		for (var i=0;i<config.MipURL.length;i++)
		{
		  LoadImage( config.MipURL[i], gl[ config.Type ], i + 1 );
		}
	}
  }
  else
  {
    images_remaining = config.ImageURL.length;
    for (var i=0;i<config.ImageURL.length;i++)
    {
      LoadImage( config.ImageURL[i], gl[ config.ImageType[i] ], 0 );
    }
  }
}
