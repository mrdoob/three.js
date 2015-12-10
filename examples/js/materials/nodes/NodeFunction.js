/**
 * @author sunag / http://www.sunag.com.br/
 * @thanks bhouston / https://clara.io/
 */

THREE.NodeFunction = function( src, includes, extensions ) {
	
	THREE.NodeGL.call( this );
	
	this.parse( src || '', includes, extensions );
	
};

THREE.NodeFunction.prototype = Object.create( THREE.NodeGL.prototype );
THREE.NodeFunction.prototype.constructor = THREE.NodeFunction;

THREE.NodeFunction.prototype.parseReference = function( name ) {
	
	switch(name) {
		case 'uv': return new THREE.NodeUV().name;
		case 'uv2': return new THREE.NodeUV(1).name;
		case 'position': return new THREE.NodePosition().name;
		case 'worldPosition': return new THREE.NodePosition( THREE.NodePosition.WORLD ).name;
		case 'normal': return new THREE.NodeNormal().name;
		case 'normalPosition': return new THREE.NodeNormal( THREE.NodeNormal.WORLD ).name;
		case 'viewPosition': return new THREE.NodePosition( THREE.NodeNormal.VIEW ).name;
		case 'viewNormal': return new THREE.NodeNormal( THREE.NodeNormal.VIEW ).name;
	}
	
	return name;
	
};

THREE.NodeFunction.prototype.getNodeType = function( builder, type ) {

	return builder.getType( type ) || type;

};

THREE.NodeFunction.prototype.getInputByName = function( name ) {
	
	var i = this.input.length;
	
	while(i--) {
	
		if (this.input[i].name === name)
			return this.input[i];
		
	}
	
};

THREE.NodeFunction.prototype.getType = function( builder ) {
	
	return this.getNodeType( builder, this.type );
	
};

THREE.NodeFunction.prototype.getInclude = function( name ) {
	
	var i = this.includes.length;
	
	while(i--) {
		
		if (this.includes[i].name === name)
			return this.includes[i];
	
	}
	
	return undefined;
	
};

THREE.NodeFunction.prototype.parse = function( src, includes, extensions ) {
	
	var rDeclaration = /^([a-z_0-9]+)\s([a-z_0-9]+)\s?\((.*?)\)/i;
	var rProperties = /[a-z_0-9]+/ig;
	
	this.includes = includes || [];
	this.extensions = extensions || {};
	
	var match = src.match( rDeclaration );
	
	this.input = [];
	
	if (match && match.length == 4) {
	
		this.type = match[1];
		this.name = match[2];
		
		var inputs = match[3].match( rProperties );
		
		if (inputs) {
		
			var i = 0;
			
			while(i < inputs.length) {
			
				var qualifier = inputs[i++];
				var type, name;
				
				if (qualifier == 'in' || qualifier == 'out' || qualifier == 'inout') {
				
					type = inputs[i++];
					
				}
				else {
					
					type = qualifier;
					qualifier = '';
				
				}
				
				name = inputs[i++];
				
				this.input.push({
					name : name,
					type : type,
					qualifier : qualifier
				});
			}
			
		}

		var match, offset = 0;
		
		while (match = rProperties.exec(src)) {
			
			var prop = match[0];
			var reference = this.parseReference( prop );
			
			if (prop != reference) {
				
				src = src.substring( 0, match.index + offset ) + reference + src.substring( match.index + prop.length + offset  );
				
				offset += reference.length - prop.length;
				
			}
			
			if (this.getInclude(reference) === undefined && THREE.NodeLib.contains(reference)) {
					
				this.includes.push( THREE.NodeLib.get(reference) );
				
			}
			
		}
		
		this.src = src;

	}
	else {
		
		this.type = '';
		this.name = '';
	
	}
};