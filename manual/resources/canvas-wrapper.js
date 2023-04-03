/*
 * Copyright 2014, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* global define */

(function(root, factory) {  // eslint-disable-line
	if ( typeof define === 'function' && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ './transform' ], factory );

	} else {

		// Browser globals
		const lib = factory();
		root.wrapCanvasRenderingContext2D = lib.wrap;

	}

}( this, function () {

  'use strict';  // eslint-disable-line

	function duplicate( src ) {

		const d = new window.DOMMatrix();
		d.a = src.a;
		d.b = src.b;
		d.c = src.c;
		d.d = src.d;
		d.e = src.e;
		d.f = src.f;
		return d;

	}

	function patchCurrentTransform( ctx ) {

		if ( ctx.currentTransform ) {

			return ctx;

		}

		const stack = [];

		ctx.scale = function ( scale ) {

			return function ( x, y ) {

				ctx.currentTransform.scaleSelf( x, y );
				scale( x, y );

			};

		}( ctx.scale.bind( ctx ) );

		ctx.rotate = function ( rotate ) {

			return function ( r ) {

				ctx.currentTransform.rotateSelf( r * 180 / Math.PI );
				rotate( r );

			};

		}( ctx.rotate.bind( ctx ) );

		ctx.translate = function ( translate ) {

			return function ( x, y ) {

				ctx.currentTransform.translateSelf( x, y );
				translate( x, y );

			};

		}( ctx.translate.bind( ctx ) );

		ctx.save = function ( save ) {

			return function () {

				stack.push( duplicate( ctx.currentTransform ) );
				save();

			};

		}( ctx.save.bind( ctx ) );

		ctx.restore = function ( restore ) {

			return function () {

				if ( stack.length ) {

					ctx.currentTransform = stack.pop();

				} else {

					throw new Error( '"transform stack empty!' );

				}

				restore();

			};

		}( ctx.restore.bind( ctx ) );

		ctx.transform = function ( transform ) {

			return function ( m11, m12, m21, m22, dx, dy ) {

				const m = new DOMMatrix();
				m.a = m11;
				m.b = m12;
				m.c = m21;
				m.d = m22;
				m.e = dx;
				m.f = dy;
				ctx.currentTransform.multiplySelf( m );
				transform( m11, m12, m21, m22, dx, dy );

			};

		}( ctx.transform.bind( ctx ) );

		ctx.setTransform = function ( setTransform ) {

			return function ( m11, m12, m21, m22, dx, dy ) {

				const d = ctx.currentTransform;
				d.a = m11;
				d.b = m12;
				d.c = m21;
				d.d = m22;
				d.e = dx;
				d.f = dy;
				setTransform( m11, m12, m21, m22, dx, dy );

			};

		}( ctx.setTransform.bind( ctx ) );

		ctx.currentTransform = new DOMMatrix();

		ctx.validateTransformStack = function () {

			if ( stack.length !== 0 ) {

				throw new Error( 'transform stack not 0' );

			}

		};

		return ctx;

	}

	function wrap( ctx ) {

		//patchDOMMatrix();
		return patchCurrentTransform( ctx );

	}

	return {
		wrap: wrap,
	};

} ) );


