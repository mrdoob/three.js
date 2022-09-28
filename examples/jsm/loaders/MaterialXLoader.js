import {
	FileLoader,
	Loader,
	TextureLoader,
	RepeatWrapping
} from 'three';

import {
	MeshPhysicalNodeMaterial,
	float, int, vec2, vec3, vec4, color, texture, uv, pow, sin, add, sub, mul, div,
	clamp, mix, normalMap, dot, mx_fractal_noise_float, positionLocal
} from 'three/nodes';

class MaterialXLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		new FileLoader( this.manager )
			.setPath( this.path )
			.load( url, async ( text ) => {

				try {

					onLoad( this.parse( text ) );

				} catch ( e ) {

					onError( e );

				}

			}, onProgress, onError );

		return this;

	}

	parse( text ) {

		return new MaterialX( this.manager, this.path ).parse( text );

	}

}

class MaterialXNode {

	constructor( materialX, nodeXML, nodePath = '' ) {

		this.materialX = materialX;
		this.nodeXML = nodeXML;
		this.nodePath = nodePath ? nodePath + '/' + this.name : this.name;

		this.parent = null;

		this.node = null;

		this.children = [];

	}

	get element() {

		return this.nodeXML.nodeName;

	}

	get nodeGraph() {

		return this.getAttribute( 'nodegraph' );

	}

	get nodeName() {

		return this.getAttribute( 'nodename' );

	}

	get interfaceName() {

		return this.getAttribute( 'interfacename' );

	}

	get output() {

		return this.getAttribute( 'output' );

	}

	get name() {

		return this.getAttribute( 'name' );

	}

	get type() {

		return this.getAttribute( 'type' );

	}

	get value() {

		return this.getAttribute( 'value' );

	}

	getNodeGraph() {

		let nodeX = this;

		while ( nodeX !== null ) {

			if ( nodeX.element === 'nodegraph' ) {

				break;

			}

			nodeX = nodeX.parent;

		}

		return nodeX;

	}

	get referencePath() {

		let referencePath = null;

		if ( this.nodeGraph !== null && this.output !== null ) {

			referencePath = this.nodeGraph + '/' + this.output;

		} else if ( this.nodeName !== null || this.interfaceName !== null ) {

			referencePath = this.getNodeGraph().nodePath + '/' + ( this.nodeName || this.interfaceName );

		}

		return referencePath;

	}

	get hasReference() {

		return this.referencePath !== null;

	}

	get isConst() {

		return this.element === 'input' && this.value !== null && this.type !== 'filename';

	}

	getTexture() {

		const filePrefix = this.getRecursiveAttribute( 'fileprefix' ) || '';

		const texture = this.materialX.textureLoader.load( filePrefix + this.value );
		texture.wrapS = texture.wrapT = RepeatWrapping;
		texture.flipY = false;

		return texture;

	}

	getClassFromType( type ) {

		let nodeClass = null;

		if ( type === 'integer' ) nodeClass = int;
		else if ( type === 'float' ) nodeClass = float;
		else if ( type === 'vector2' ) nodeClass = vec2;
		else if ( type === 'vector3' ) nodeClass = vec3;
		else if ( type === 'vector4' || type === 'color4' ) nodeClass = vec4;
		else if ( type === 'color3' ) nodeClass = color;

		return nodeClass;

	}

	getNode() {

		let node = this.node;

		if ( node === null ) {

			const type = this.type;

			if ( this.isConst ) {

				const nodeClass = this.getClassFromType( this.type );

				node = nodeClass( ...this.getVector() );

			} else if ( this.hasReference ) {

				node = this.materialX.getMaterialXNode( this.referencePath ).getNode();

			} else {

				const element = this.element;

				if ( element === 'convert' ) {

					const nodeClass = this.getClassFromType( type );

					node = nodeClass( this.getNodeByName( 'in' ) );

				} else if ( element === 'constant' ) {

					node = this.getNodeByName( 'value' );

				} else if ( element === 'position' ) {

					node = positionLocal;

				} else if ( element === 'tiledimage' ) {

					const textureFile = this.getChildByName( 'file' ).getTexture();
					const uvNode = uv();
					const uvTiling = mul( uvNode, this.getNodeByName( 'uvtiling' ) );

					node = texture( textureFile, uvTiling );

				} else if ( element === 'normalmap' ) {

					node = normalMap( this.getNodeByName( 'in' ), this.getNodeByName( 'scale' ) );

				} else if ( element === 'hsvtorgb' ) {

					// need to node related
					node = this.getNodeByName( 'in' );

				} else if ( element === 'rgbtohsv' ) {

					// need to node related
					node = this.getNodeByName( 'in' );

				} else if ( element === 'combine2' ) {

					node = vec3( ...this.getNodesByNames( 'in1', 'in2' ) );

				} else if ( element === 'combine3' ) {

					node = vec3( ...this.getNodesByNames( 'in1', 'in2', 'in3' ) );

				} else if ( element === 'combine4' ) {

					node = vec3( ...this.getNodesByNames( 'in1', 'in2', 'in3', 'in4' ) );

				} else if ( element === 'add' ) {

					node = add( ...this.getNodesByNames( 'in1', 'in2' ) );

				} else if ( element === 'subtract' ) {

					node = sub( ...this.getNodesByNames( 'in1', 'in2' ) );

				} else if ( element === 'multiply' ) {

					node = mul( ...this.getNodesByNames( 'in1', 'in2' ) );

				} else if ( element === 'divide' ) {

					node = div( ...this.getNodesByNames( 'in1', 'in2' ) );

				} else if ( element === 'clamp' ) {

					node = clamp( this.getNodeByName( 'in' ), this.getNodeByName( 'low' ) || 0, this.getNodeByName( 'high' ) || 1 );

				} else if ( element === 'mix' ) {

					node = mix( ...this.getNodesByNames( 'bg', 'fg', 'mix' ) );

				} else if ( element === 'power' ) {

					node = pow( ...this.getNodesByNames( 'in1', 'in2' ) );

				} else if ( element === 'sin' ) {

					node = sin( this.getNodeByName( 'in' ) );

				} else if ( element === 'dotproduct' ) {

					node = dot( ...this.getNodesByNames( 'in1', 'in2' ) );

				} else if ( element === 'fractal3d' ) {

					node = mx_fractal_noise_float( ...this.getNodesByNames( 'position', 'octaves', 'lacunarity', 'diminish', 'amplitude' ) );

				}

			}

			if ( node === null ) {

				console.warn( `THREE.MaterialXLoader: Unexpected node ${ new XMLSerializer().serializeToString( this.nodeXML ) }.` );

				node = float( 0 );

			}

			const nodeToTypeClass = this.getClassFromType( type );

			if ( nodeToTypeClass !== null ) {

				node = nodeToTypeClass( node );

			}

			node.name = this.name;

			this.node = node;

		}

		return node;

	}

	getChildByName( name ) {

		for ( const input of this.children ) {

			if ( input.name === name ) {

				return input;

			}

		}

	}

	getNodes() {

		const nodes = {};

		for ( const input of this.children ) {

			const node = input.getNode();

			nodes[ node.name ] = node;

		}

		return nodes;

	}

	getNodeByName( name ) {

		return this.getChildByName( name )?.getNode();

	}

	getNodesByNames( ...names ) {

		const nodes = [];

		for ( const name of names ) {

			const node = this.getNodeByName( name );

			if ( node ) nodes.push( node );

		}

		return nodes;

	}

	getValue() {

		return this.value.trim();

	}

	getVector() {

		const vector = [];

		for ( const val of this.getValue().split( /[,|\s]/ ) ) {

			if ( val !== '' ) {

				vector.push( Number( val.trim() ) );

			}

		}

		return vector;

	}

	getAttribute( name ) {

		return this.nodeXML.getAttribute( name );

	}

	getRecursiveAttribute( name ) {

		let attribute = this.nodeXML.getAttribute( name );

		if ( attribute === null && this.parent !== null ) {

			attribute = this.parent.getRecursiveAttribute( name );

		}

		return attribute;

	}

	setStandardSurfaceToGltfPBR( material ) {

		const inputs = this.getNodes();

		//

		let colorNode = null;

		if ( inputs.base && inputs.base_color ) colorNode = mul( inputs.base, inputs.base_color );
		else if ( inputs.base ) colorNode = inputs.base;
		else if ( inputs.base_color ) colorNode = inputs.base_color;

		//

		let roughnessNode = null;

		if ( inputs.specular_roughness ) roughnessNode = inputs.specular_roughness;

		//

		let metalnessNode = null;

		if ( inputs.metalness ) metalnessNode = inputs.metalness;

		//

		let clearcoatNode = null;
		let clearcoatRoughnessNode = null;

		if ( inputs.coat ) clearcoatNode = inputs.coat;
		if ( inputs.coat_roughness ) clearcoatRoughnessNode = inputs.coat_roughness;

		if ( inputs.coat_color ) {

			colorNode = colorNode ? mul( colorNode, inputs.coat_color ) : colorNode;

		}

		//

		material.colorNode = colorNode || color( 0.8, 0.8, 0.8 );
		material.roughnessNode = roughnessNode || float( 0.2 );
		material.metalnessNode = metalnessNode || float( 0 );
		material.clearcoatNode = clearcoatNode || float( 0 );
		material.clearcoatRoughnessNode = clearcoatRoughnessNode || float( 0 );

	}
	/*
	setGltfPBR( material ) {

		const inputs = this.getNodes();

		console.log( inputs );

	}
*/
	setMaterial( material ) {

		const element = this.element;

		if ( element === 'gltf_pbr' ) {

			//this.setGltfPBR( material );

		} else if ( element === 'standard_surface' ) {

			this.setStandardSurfaceToGltfPBR( material );

		}

	}

	toMaterial() {

		const material = new MeshPhysicalNodeMaterial();
		material.name = this.name;

		for ( const nodeX of this.children ) {

			const shaderProperties = this.materialX.getMaterialXNode( nodeX.nodeName );
			shaderProperties.setMaterial( material );

		}

		return material;

	}

	toMaterials() {

		const materials = {};

		for ( const nodeX of this.children ) {

			if ( nodeX.element === 'surfacematerial' ) {

				const material = nodeX.toMaterial();

				materials[ material.name ] = material;

			}

		}

		return materials;

	}

	add( materialXNode ) {

		materialXNode.parent = this;

		this.children.push( materialXNode );

	}

}

class MaterialX {

	constructor( manager, path ) {

		this.manager = manager;
		this.path = path;
		this.resourcePath = '';

		this.nodesXLib = new Map();
		//this.nodesXRefLib = new WeakMap();

		this.textureLoader = new TextureLoader( manager );

	}

	addMaterialXNode( materialXNode ) {

		this.nodesXLib.set( materialXNode.nodePath, materialXNode );

	}
/*
    getMaterialXNodeFromXML( xmlNode ) {

        return this.nodesXRefLib.get( xmlNode );

    }
*/
	getMaterialXNode( ...names ) {

		return this.nodesXLib.get( names.join( '/' ) );

	}

	parseNode( nodeXML, nodePath = '' ) {

		const materialXNode = new MaterialXNode( this, nodeXML, nodePath );
		if ( materialXNode.nodePath ) this.addMaterialXNode( materialXNode );

		for ( const childNodeXML of nodeXML.children ) {

			const childMXNode = this.parseNode( childNodeXML, materialXNode.nodePath );
			materialXNode.add( childMXNode );

		}

		return materialXNode;

	}

	parse( text ) {

		const rootXML = new DOMParser().parseFromString( text, 'application/xml' ).documentElement;

		this.textureLoader.setPath( this.path );

		//

		const materials = this.parseNode( rootXML ).toMaterials();

		return { materials };

	}

}

export { MaterialXLoader };
