/**
 * Automatic node cache
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeTemp = function( type, params ) {
	
	THREE.NodeGL.call( this, type );
	
	params = params || {};
	
	this.shared = params.shared !== undefined ? params.shared : true;
	this.unique = params.unique !== undefined ? params.unique : false;
	
};

THREE.NodeTemp.prototype = Object.create( THREE.NodeGL.prototype );
THREE.NodeTemp.prototype.constructor = THREE.NodeTemp;

THREE.NodeTemp.prototype.build = function( builder, output, uuid ) {
	
	var material = builder.material;
	
	if (this.isShared()) {
		
		var isUnique = this.isUnique();
		
		if (isUnique && this.constructor.uuid === undefined) {
			
			this.constructor.uuid = THREE.Math.generateUUID();
		
		}
		
		uuid = builder.getUuid( uuid || this.constructor.uuid || this.uuid, !isUnique );
		
		var data = material.getNodeData( uuid );
		
		if (builder.isShader('verify')) {
		
			if (data.deps || 0 > 0) {
				this.verifyNodeDeps( builder, data, output );
				return '';
			}
			
			return THREE.NodeGL.prototype.build.call( this, builder, output, uuid );
			
		}
		else if (data.deps == 1) {
		
			return THREE.NodeGL.prototype.build.call( this, builder, output, uuid );
			
		}
		
		var name = this.getTemp( builder, uuid );
		var type = data.output || this.getType( builder );
		
		if (name) {
		
			return builder.format( name, type, output );
			
		}
		else {
			
			name = THREE.NodeTemp.prototype.generate.call( this, builder, output, uuid, data.output );
			
			var code = this.generate( builder, type, uuid );
			
			if (builder.isShader('vertex')) material.addVertexNode(name + '=' + code + ';');
			else material.addFragmentNode(name + '=' + code + ';');
			
			return builder.format( name, type, output );
		
		}
		
	}
	else {
		
		return builder.format( this.generate( builder, this.getType( builder ), uuid ), type, output );
	
	}
	
};

THREE.NodeTemp.prototype.isShared = function() {
	
	return this.shared;
	
};

THREE.NodeTemp.prototype.isUnique = function() {
	
	return this.unique;
	
};

THREE.NodeTemp.prototype.getTemp = function( builder, uuid ) {
	
	uuid = uuid || this.uuid;
	
	var material = builder.material;
	
	if (builder.isShader('vertex') && material.vertexTemps[ uuid ]) return material.vertexTemps[ uuid ].name;
	else if (material.fragmentTemps[ uuid ]) return material.fragmentTemps[ uuid ].name;

};

THREE.NodeTemp.prototype.generate = function( builder, output, uuid, type ) {
	
	if (!this.isShared()) console.error("THREE.NodeTemp is not shared!");
	
	uuid = uuid || this.uuid;
	
	if (builder.isShader('vertex')) return builder.material.getVertexTemp( uuid, type || this.getType( builder ) ).name;
	else return builder.material.getFragmentTemp( uuid, type || this.getType( builder ) ).name;

};