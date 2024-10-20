class NodeLibrary {

	constructor() {

		this.lightNodes = new WeakMap();
		this.materialNodes = new Map();
		this.toneMappingNodes = new Map();

	}

	fromMaterial( material ) {

		if ( material.isNodeMaterial ) return material;

		let nodeMaterial = null;

		const nodeMaterialClass = this.getMaterialNodeClass( material.type );

		if ( nodeMaterialClass !== null ) {

			nodeMaterial = new nodeMaterialClass();

			for ( const key in material ) {

				nodeMaterial[ key ] = material[ key ];

			}

		}

		return nodeMaterial;

	}

	addToneMapping( toneMappingNode, toneMapping ) {

		this.addType( toneMappingNode, toneMapping, this.toneMappingNodes );

	}

	getToneMappingFunction( toneMapping ) {

		return this.toneMappingNodes.get( toneMapping ) || null;

	}

	getMaterialNodeClass( materialType ) {

		return this.materialNodes.get( materialType ) || null;

	}

	addMaterial( materialNodeClass, materialClass ) {

		this.addType( materialNodeClass, materialClass.type, this.materialNodes );

	}

	getLightNodeClass( light ) {

		return this.lightNodes.get( light ) || null;

	}

	addLight( lightNodeClass, lightClass ) {

		this.addClass( lightNodeClass, lightClass, this.lightNodes );

	}

	addType( nodeClass, type, library ) {

		if ( library.has( type ) ) {

			console.warn( `Redefinition of node ${ type }` );
			return;

		}

		if ( typeof nodeClass !== 'function' ) throw new Error( `Node class ${ nodeClass.name } is not a class.` );
		if ( typeof type === 'function' || typeof type === 'object' ) throw new Error( `Base class ${ type } is not a class.` );

		library.set( type, nodeClass );

	}

	addClass( nodeClass, baseClass, library ) {

		if ( library.has( baseClass ) ) {

			console.warn( `Redefinition of node ${ baseClass.name }` );
			return;

		}

		if ( typeof nodeClass !== 'function' ) throw new Error( `Node class ${ nodeClass.name } is not a class.` );
		if ( typeof baseClass !== 'function' ) throw new Error( `Base class ${ baseClass.name } is not a class.` );

		library.set( baseClass, nodeClass );

	}

}

export default NodeLibrary;
