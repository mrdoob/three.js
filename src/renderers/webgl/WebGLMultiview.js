/**
 * @author fernandojsg / http://fernandojsg.com
 * @author Takahiro https://github.com/takahirox
 */
import { Matrix3 } from '../../math/Matrix3.js';
import { Matrix4 } from '../../math/Matrix4.js';


class WebGLMultiview {

	 constructor( renderer, extensions, gl ) {

		 this.renderer = renderer;

		 this.DEFAULT_NUMVIEWS = 2;
		 this.maxNumViews = 0;
		 this.gl = gl;

		 this.extensions = extensions;

		 this.available = this.extensions.has( 'OCULUS_multiview' );

		 if ( this.available ) {

			 const extension = this.extensions.get( 'OCULUS_multiview' );

			 this.maxNumViews = this.gl.getParameter( extension.MAX_VIEWS_OVR );

			 this.mat4 = [];
			 this.mat3 = [];
			 this.cameraArray = [];

			 for ( var i = 0; i < this.maxNumViews; i ++ ) {

				 this.mat4[ i ] = new Matrix4();
				 this.mat3[ i ] = new Matrix3();

			 }

		 }

	 }

	 //
	 getCameraArray( camera ) {

		 if ( camera.isArrayCamera ) return camera.cameras;

		 this.cameraArray[ 0 ] = camera;

		 return this.cameraArray;

	 }

	 updateCameraProjectionMatricesUniform( camera, uniforms ) {

		 var cameras = this.getCameraArray( camera );

		 for ( var i = 0; i < cameras.length; i ++ ) {

			 this.mat4[ i ].copy( cameras[ i ].projectionMatrix );

		 }

		 uniforms.setValue( this.gl, 'projectionMatrices', this.mat4 );

	 }

	 updateCameraViewMatricesUniform( camera, uniforms ) {

		 var cameras = this.getCameraArray( camera );

		 for ( var i = 0; i < cameras.length; i ++ ) {

			 this.mat4[ i ].copy( cameras[ i ].matrixWorldInverse );

		 }

		 uniforms.setValue( this.gl, 'viewMatrices', this.mat4 );

	 }

	 updateObjectMatricesUniforms( object, camera, uniforms ) {

		 var cameras = this.getCameraArray( camera );

		 for ( var i = 0; i < cameras.length; i ++ ) {

			 this.mat4[ i ].multiplyMatrices( cameras[ i ].matrixWorldInverse, object.matrixWorld );
			 this.mat3[ i ].getNormalMatrix( this.mat4[ i ] );

		 }

		 uniforms.setValue( this.gl, 'modelViewMatrices', this.mat4 );
		 uniforms.setValue( this.gl, 'normalMatrices', this.mat3 );

	 }

}

export { WebGLMultiview };
