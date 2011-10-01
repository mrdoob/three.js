/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Material = function ( parameters ) {

	this.id = THREE.MaterialCount ++;

	parameters = parameters || {};

	this.opacity = parameters.opacity !== undefined ? parameters.opacity : 1;
	this.transparent = parameters.transparent !== undefined ? parameters.transparent : false;

	this.blending = parameters.blending !== undefined ? parameters.blending : THREE.NormalBlending;
	this.depthTest = parameters.depthTest !== undefined ? parameters.depthTest : true;

	this.polygonOffset = parameters.polygonOffset !== undefined ? parameters.polygonOffset : false;
	this.polygonOffsetFactor = parameters.polygonOffsetFactor !== undefined ? parameters.polygonOffsetFactor : 0;
	this.polygonOffsetUnits = parameters.polygonOffsetUnits !== undefined ? parameters.polygonOffsetUnits : 0;

	this.alphaTest = parameters.alphaTest !== undefined ? parameters.alphaTest : 0;

}

THREE.MaterialCount = 0;

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
