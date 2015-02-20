/**
* @author mrdoob / http://mrdoob.com/
*/

THREE.WebGLState = function ( gl, paramThreeToGL ) {

	var currentBlending = - 1;
	var currentBlendEquation = - 1;
	var currentBlendSrc = - 1;
	var currentBlendDst = - 1;
	var currentBlendEquationAlpha = - 1;
	var currentBlendSrcAlpha = - 1;
	var currentBlendDstAlpha = - 1;

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

	var currentDepthTest = - 1;

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

	var currentDepthWrite = - 1;

	this.setDepthWrite = function ( depthWrite ) {

		if ( currentDepthWrite !== depthWrite ) {

			gl.depthMask( depthWrite );
			currentDepthWrite = depthWrite;

		}

	};

	var currentLineWidth = null;

	this.setLineWidth = function ( width ) {

		if ( width !== currentLineWidth ) {

			gl.lineWidth( width );

			currentLineWidth = width;

		}

	};

	var currentPolygonOffset = null;
	var currentPolygonOffsetFactor = null;
	var currentPolygonOffsetUnits = null;

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

		currentBlending = - 1;
		currentDepthTest = - 1;
		currentDepthWrite = - 1;

	};

};
