/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Material = function ( parameters ) {

	this.id = THREE.MaterialCounter.value ++;

	parameters = parameters || {};

	this.opacity = parameters.opacity !== undefined ? parameters.opacity : 1;
	this.transparent = parameters.transparent !== undefined ? parameters.transparent : false;

	this.blending = parameters.blending !== undefined ? parameters.blending : THREE.NormalBlending;
	this.depthTest = parameters.depthTest !== undefined ? parameters.depthTest : true;


}

THREE.NoShading = 0;
THREE.FlatShading = 1;
THREE.SmoothShading = 2;

THREE.NoColors = 0;
THREE.FaceColors = 1;
THREE.VertexColors = 2;

THREE.NormalBlending = 0;
THREE.AdditiveBlending = 1;
THREE.SubtractiveBlending = 2;
THREE.MultiplyBlending = 3;
THREE.AdditiveAlphaBlending = 4;


THREE.MaterialCounter = { value: 0 };
