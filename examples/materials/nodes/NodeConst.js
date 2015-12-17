/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeConst = function(name, useDefine) {
	
	name = name || THREE.NodeConst.PI;
	
	var rDeclaration = /^([a-z_0-9]+)\s([a-z_0-9]+)\s?\=(.*?)\;/i;
	var type = 'fv1';
	
	var match = name.match( rDeclaration );
	
	if (match && match.length > 1) {
	
		type = match[1];
		name = match[2];
		
		if (useDefine) {
			
			this.src = '#define ' + name + ' ' + match[3];
		
		}
		else {
			
			this.src = 'const ' + type + ' ' + name + ' = ' + match[3] + ';';
		
		}
	
	}
	
	this.name = name;
	
	THREE.NodeTemp.call( this, type );
	
};

THREE.NodeConst.prototype = Object.create( THREE.NodeTemp.prototype );
THREE.NodeConst.prototype.constructor = THREE.NodeConst;

THREE.NodeConst.PI = 'PI';
THREE.NodeConst.PI2 = 'PI2';
THREE.NodeConst.RECIPROCAL_PI = 'RECIPROCAL_PI';
THREE.NodeConst.RECIPROCAL_PI2 = 'RECIPROCAL_PI2';
THREE.NodeConst.LOG2 = 'LOG2';
THREE.NodeConst.EPSILON = 'EPSILON';

THREE.NodeConst.prototype.generate = function( builder, output ) {
	
	return builder.format( this.name, this.getType( builder ), output );

};