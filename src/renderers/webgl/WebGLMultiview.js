
function err() {

	console.error( bgl.getError() );

}

var bgl;

function WebGLMultiview( gl, canvas, extensions ) {

	var NUM_MULTIVIEW_VIEWS = 2;
	bgl = gl;
	var width = canvas.width;
	var height = canvas.height;
	var g_multiviewFb; // multiview framebuffer.
	var g_multiviewViewFb; // single views inside the multiview framebuffer.
	var g_multiviewColorTexture; // Color texture for multiview framebuffer.
	var g_multiviewDepth; // Depth texture for multiview framebuffer.
	var g_multiviewFbWidth = 0;
	var g_multiviewFbHeight = 0;


  var ext = extensions.get( 'OVR_multiview2' );
  if (!ext) {
    return;
  }

	var texture = {
		color: null,
		depthStencil: null
	};

	var framebuffer = gl.createFramebuffer();
	var multiviewViewFb = null;

	this.createMultiviewRenderTargetTexture = function () {

    var halfWidth = Math.floor( canvas.width * 0.5 );

		framebuffer = gl.createFramebuffer();
		gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer );

		texture.color = gl.createTexture();
		gl.bindTexture( gl.TEXTURE_2D_ARRAY, texture.color );
		gl.texParameteri( gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
		gl.texImage3D( gl.TEXTURE_2D_ARRAY, 0, gl.RGBA8, halfWidth, canvas.height, NUM_MULTIVIEW_VIEWS, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );
		ext.framebufferTextureMultiviewOVR( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, texture.color, 0, 0, NUM_MULTIVIEW_VIEWS );

		texture.depthStencil = gl.createTexture();
		gl.bindTexture( gl.TEXTURE_2D_ARRAY, texture.depthStencil );
		gl.texParameteri( gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
		gl.texImage3D( gl.TEXTURE_2D_ARRAY, 0, gl.DEPTH24_STENCIL8, halfWidth, canvas.height, NUM_MULTIVIEW_VIEWS, 0, gl.DEPTH_STENCIL, gl.UNSIGNED_INT_24_8, null );
		ext.framebufferTextureMultiviewOVR( gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, texture.depthStencil, 0, 0, NUM_MULTIVIEW_VIEWS );

		multiviewViewFb = [ null, null ];
		for ( var viewIndex = 0; viewIndex < 2; ++ viewIndex ) {

			multiviewViewFb[ viewIndex ] = gl.createFramebuffer();
			gl.bindFramebuffer( gl.FRAMEBUFFER, multiviewViewFb[ viewIndex ] );
			gl.framebufferTextureLayer( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, texture.color, 0, viewIndex );

  }
		g_multiviewFbWidth = halfWidth;
		g_multiviewFbHeight = canvas.height;
};

	this.bindMultiviewFrameBuffer = function () {

    var halfWidth = Math.floor( canvas.width * 0.5 );
		if ( g_multiviewFbWidth < halfWidth || g_multiviewFbHeight < canvas.height ) {
			console.log( 'Updating multiview FBO with dimensions: ', halfWidth, canvas.height );
			gl.bindTexture( gl.TEXTURE_2D_ARRAY, texture.color );
      gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RGBA8, halfWidth, canvas.height, NUM_MULTIVIEW_VIEWS, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			gl.bindTexture( gl.TEXTURE_2D_ARRAY, texture.depthStencil );
			gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.DEPTH24_STENCIL8, halfWidth, canvas.height, NUM_MULTIVIEW_VIEWS, 0, gl.DEPTH_STENCIL, gl.UNSIGNED_INT_24_8, null);
			g_multiviewFbWidth = halfWidth;
			g_multiviewFbHeight = canvas.height;

    }
		// gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindFramebuffer( gl.DRAW_FRAMEBUFFER, framebuffer );

	};

	this.unbindMultiviewFrameBuffer = function () {

    var halfWidth = Math.floor( canvas.width * 0.5 );
  	gl.bindFramebuffer( gl.DRAW_FRAMEBUFFER, null );
		gl.bindFramebuffer( gl.READ_FRAMEBUFFER, multiviewViewFb[ 0 ] );
		gl.blitFramebuffer( 0, 0, halfWidth, canvas.height, 0, 0, halfWidth, canvas.height, gl.COLOR_BUFFER_BIT, gl.NEAREST );
		gl.bindFramebuffer( gl.READ_FRAMEBUFFER, multiviewViewFb[ 1 ] );
		gl.blitFramebuffer( 0, 0, halfWidth, canvas.height, halfWidth, 0, canvas.width, canvas.height, gl.COLOR_BUFFER_BIT, gl.NEAREST );

	};

	this.createMultiviewRenderTargetTexture();

}



export { WebGLMultiview };
