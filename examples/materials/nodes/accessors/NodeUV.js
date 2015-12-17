/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeUV = function( index ) {
	
	THREE.NodeTemp.call( this, 'v2', {shared:false} );
	
	this.index = index || 0;
	
};

THREE.NodeUV.prototype = Object.create( THREE.NodeTemp.prototype );
THREE.NodeUV.prototype.constructor = THREE.NodeUV;

THREE.NodeUV.vertexDict = ['uv', 'uv2'];
THREE.NodeUV.fragmentDict = ['vUv', 'vUv2'];

THREE.NodeUV.prototype.generate = function( builder, output ) {
	
	var material = builder.material;
	var result;
	
	material.requestAttrib.uv[this.index] = true; 
	
	if (builder.isShader('vertex')) result = THREE.NodeUV.vertexDict[this.index];
	else result = THREE.NodeUV.fragmentDict[this.index];
	
	return builder.format( result, this.getType( builder ), output );

};
