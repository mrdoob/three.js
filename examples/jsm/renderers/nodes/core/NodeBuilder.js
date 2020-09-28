const VERSION = '1';

class NodeBuilder {

	constructor() {
		
		this.slots = { vertex: [], fragment: [] };
		this.defines = { vertex: {}, fragment: {} };
		
		this.nodesData = new WeakMap();
		
		this.shader = undefined;
		
	}
	
	setMaterial( material ) {
		
		this.material = material;
		
	}
	
	addSlot( shader, slot ) {
		
		this.slots[ shader ].push( slot );
		
	}
	
	addDefine( shader, name, value ) {
		
		this.defines[ shader ][ name ] = value || '';
		
	}
	
	generateVec3( x, y, z ) {
		
		return `vec3( ${x}, ${y}, ${z} )`;
		
	}
	
	generateFloat( value ) {
		
		return value + ( value % 1 ? '' : '.0' );
		
	}
	/*
	createDataFromNode( node ) {
		
		return this.nodesData[ node ] = this.nodesData[ node ] || {};
		
	}
	*/
	createUniformFromNode( node ) {
		
		
		
	}
	/*
	analyzeNode( node ) {
		
		
	}
	*/
	flowNode( node, output ) {
		
		let flowData = {};
		flowData.result = node.build( this, output );
		
		return flowData;
		
	}
	
	buildDefines( shader ) {
		
		const defines = this.defines[ shader ];
		
		let code = '';
		
		for ( let name in defines ) {
			
			code += `#define NODE_${name} ${defines[name]}\n`;
			
		}
		
		return code;
		
	}
	
	build( shader ) {
		
		const slots = this.slots[ shader ];
		
		if ( slots.length ) {
			
			this.addDefine( shader, 'NODE', VERSION );
			
			for( let i = 0; i < slots.length; i++) {
			
				let slot = slots[i];
				
				let flowData = this.flowNode( slot.node );
				
				this.addDefine( shader, slot.name, flowData.result );
				
			}
			
		}
		
		let defines = this.buildDefines( shader );
		
		return {
			defines
		};
		
	}
	
	format( code, fromType, toType ) {

		const typeToType = toType + ' <- ' + fromType;

		switch ( typeToType ) {

			case 'f <- v2' : return code + '.x';
			case 'f <- v3' : return code + '.x';
			case 'f <- v4' : return code + '.x';
			case 'f <- i' :
			case 'f <- b' :	return 'float( ' + code + ' )';

			case 'v2 <- f' : return 'vec2( ' + code + ' )';
			case 'v2 <- v3': return code + '.xy';
			case 'v2 <- v4': return code + '.xy';
			case 'v2 <- i' :
			case 'v2 <- b' : return 'vec2( float( ' + code + ' ) )';

			case 'v3 <- f' : return 'vec3( ' + code + ' )';
			case 'v3 <- v2': return 'vec3( ' + code + ', 0.0 )';
			case 'v3 <- v4': return code + '.xyz';
			case 'v3 <- i' :
			case 'v3 <- b' : return 'vec2( float( ' + code + ' ) )';

			case 'v4 <- f' : return 'vec4( ' + code + ' )';
			case 'v4 <- v2': return 'vec4( ' + code + ', 0.0, 1.0 )';
			case 'v4 <- v3': return 'vec4( ' + code + ', 1.0 )';
			case 'v4 <- i' :
			case 'v4 <- b' : return 'vec4( float( ' + code + ' ) )';

			case 'i <- f' :
			case 'i <- b' : return 'int( ' + code + ' )';
			case 'i <- v2' : return 'int( ' + code + '.x )';
			case 'i <- v3' : return 'int( ' + code + '.x )';
			case 'i <- v4' : return 'int( ' + code + '.x )';

			case 'b <- f' : return '( ' + code + ' != 0.0 )';
			case 'b <- v2' : return '( ' + code + ' != vec2( 0.0 ) )';
			case 'b <- v3' : return '( ' + code + ' != vec3( 0.0 ) )';
			case 'b <- v4' : return '( ' + code + ' != vec4( 0.0 ) )';
			case 'b <- i' : return '( ' + code + ' != 0 )';

		}

		return code;

	}
	
}

export default NodeBuilder;
