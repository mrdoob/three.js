/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeColors = function( index ) {
	
	THREE.NodeTemp.call( this, 'v4', {share:false} );
	
	this.index = index || 0;
	
};

THREE.NodeColors.prototype = Object.create( THREE.NodeTemp.prototype );
THREE.NodeColors.prototype.constructor = THREE.NodeColors;

THREE.NodeColors.vertexDict = ['color', 'color2'];
THREE.NodeColors.fragmentDict = ['vColor', 'vColor2'];

THREE.NodeColors.prototype.generate = function( builder, output ) {
	
	var material = builder.material;
	var result;
	
	material.requestAttrib.color[this.index] = true; 
	
	if (builder.isShader('vertex')) result = THREE.NodeColors.vertexDict[this.index];
	else result = THREE.NodeColors.fragmentDict[this.index];
	
	return builder.format( result, this.getType( builder ), output );

};
