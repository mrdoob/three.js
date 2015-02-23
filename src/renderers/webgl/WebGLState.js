/**
* @author mrdoob / http://mrdoob.com/
*/

THREE.WebGLState = function ( gl, paramThreeToGL ) {

	var newAttributes = new Uint8Array( 16 );
	var enabledAttributes = new Uint8Array( 16 );

	var currentBlending = null;
	var currentBlendEquation = null;
	var currentBlendSrc = null;
	var currentBlendDst = null;
	var currentBlendEquationAlpha = null;
	var currentBlendSrcAlpha = null;
	var currentBlendDstAlpha = null;

	var currentDepthTest = null;
	var currentDepthWrite = null;

	var currentColorWrite = null;

	var currentDoubleSided = null;
	var currentFlipSided = null;

	var currentLineWidth = null;

	var currentPolygonOffset = null;
	var currentPolygonOffsetFactor = null;
	var currentPolygonOffsetUnits = null;

	this.initAttributes = function () {

		for ( var i = 0, l = newAttributes.length; i < l; i ++ ) {

			newAttributes[ i ] = 0;

		}

	};

	this.enableAttribute = function ( attribute ) {

		newAttributes[ attribute ] = 1;

		if ( enabledAttributes[ attribute ] === 0 ) {

			gl.enableVertexAttribArray( attribute );
			enabledAttributes[ attribute ] = 1;

		}

	};

	this.disableUnusedAttributes = function () {

		for ( var i = 0, l = enabledAttributes.length; i < l; i ++ ) {

			if ( enabledAttributes[ i ] !== newAttributes[ i ] ) {

				gl.disableVertexAttribArray( i );
				enabledAttributes[ i ] = 0;

			}

		}

	};

	this.setBlending = function ( blending, blendEquation, blendSrc, blendDst, blendEquationAlpha, blendSrcAlpha, blendDstAlpha ) {

		if ( blending !== currentBlending ) {

			if ( blending === THREE.NoBlending ) {

				gl.disable( gl.BLEND );

			} else if ( blending === THREE.AdditiveBlending ) {

				gl.enable( gl.BLEND );
				gl.blendEquation( gl.FUNC_ADD );
				gl.blendFunc( gl.SRC_ALPHA, gl.ONE );

			} else if ( blending === THREE.SubtractiveBlending ) {

				// TODO: Find blendFuncSeparate() combination
				gl.enable( gl.BLEND );
				gl.blendEquation( gl.FUNC_ADD );
				gl.blendFunc( gl.ZERO, gl.ONE_MINUS_SRC_COLOR );

			} else if ( blending === THREE.MultiplyBlending ) {

				// TODO: Find blendFuncSeparate() combination
				gl.enable( gl.BLEND );
				gl.blendEquation( gl.FUNC_ADD );
				gl.blendFunc( gl.ZERO, gl.SRC_COLOR );

			} else if ( blending === THREE.CustomBlending ) {

				gl.enable( gl.BLEND );

			} else {

				gl.enable( gl.BLEND );
				gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
				gl.blendFuncSeparate( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA );

			}

			currentBlending = blending;

		}

		if ( blending === THREE.CustomBlending ) {

			blendEquationAlpha = blendEquationAlpha || blendEquation;
			blendSrcAlpha = blendSrcAlpha || blendSrc;
			blendDstAlpha = blendDstAlpha || blendDst;

			if ( blendEquation !== currentBlendEquation || blendEquationAlpha !== currentBlendEquationAlpha ) {

				gl.blendEquationSeparate( paramThreeToGL( blendEquation ), paramThreeToGL( blendEquationAlpha ) );

				currentBlendEquation = blendEquation;
				currentBlendEquationAlpha = blendEquationAlpha;

			}

			if ( blendSrc !== currentBlendSrc || blendDst !== currentBlendDst || blendSrcAlpha !== currentBlendSrcAlpha || blendDstAlpha !== currentBlendDstAlpha ) {

				gl.blendFuncSeparate( paramThreeToGL( blendSrc ), paramThreeToGL( blendDst ), paramThreeToGL( blendSrcAlpha ), paramThreeToGL( blendDstAlpha ) );

				currentBlendSrc = blendSrc;
				currentBlendDst = blendDst;
				currentBlendSrcAlpha = blendSrcAlpha;
				currentBlendDstAlpha = blendDstAlpha;

			}

		} else {

			currentBlendEquation = null;
			currentBlendSrc = null;
			currentBlendDst = null;
			currentBlendEquationAlpha = null;
			currentBlendSrcAlpha = null;
			currentBlendDstAlpha = null;

		}

	};

	this.setDepthTest = function ( depthTest ) {

		if ( currentDepthTest !== depthTest ) {

			if ( depthTest ) {

				gl.enable( gl.DEPTH_TEST );

			} else {

				gl.disable( gl.DEPTH_TEST );

			}

			currentDepthTest = depthTest;

		}

	};

	this.setDepthWrite = function ( depthWrite ) {

		if ( currentDepthWrite !== depthWrite ) {

			gl.depthMask( depthWrite );
			currentDepthWrite = depthWrite;

		}

	};

	this.setColorWrite = function ( colorWrite ) {

		if ( currentColorWrite !== colorWrite ) {

			gl.colorMask( colorWrite, colorWrite, colorWrite, colorWrite );
			currentColorWrite = colorWrite;

		}

	};

	this.setDoubleSided = function ( doubleSided ) {

		if ( currentDoubleSided !== doubleSided ) {

			if ( doubleSided ) {

				gl.disable( gl.CULL_FACE );

			} else {

				gl.enable( gl.CULL_FACE );

			}

			currentDoubleSided = doubleSided;

		}

	};

	this.setFlipSided = function ( flipSided ) {

		if ( currentFlipSided !== flipSided ) {

			if ( flipSided ) {

				gl.frontFace( gl.CW );

			} else {

				gl.frontFace( gl.CCW );

			}

			currentFlipSided = flipSided;

		}

	};

	this.setLineWidth = function ( width ) {

		if ( width !== currentLineWidth ) {

			gl.lineWidth( width );

			currentLineWidth = width;

		}

	};

	this.setPolygonOffset = function ( polygonoffset, factor, units ) {

		if ( currentPolygonOffset !== polygonoffset ) {

			if ( polygonoffset ) {

				gl.enable( gl.POLYGON_OFFSET_FILL );

			} else {

				gl.disable( gl.POLYGON_OFFSET_FILL );

			}

			currentPolygonOffset = polygonoffset;

		}

		if ( polygonoffset && ( currentPolygonOffsetFactor !== factor || currentPolygonOffsetUnits !== units ) ) {

			gl.polygonOffset( factor, units );

			currentPolygonOffsetFactor = factor;
			currentPolygonOffsetUnits = units;

		}

	};

	this.reset = function () {

		for ( var i = 0; i < enabledAttributes.length; i ++ ) {

			enabledAttributes[ i ] = 0;

		}

		currentBlending = null;
		currentDepthTest = null;
		currentDepthWrite = null;
		currentColorWrite = null;
		currentDoubleSided = null;
		currentFlipSided = null;

	};

};
