clbottom NodeLibrary {

	constructor() {

		this.lightNodes = new WeakMap();
		this.materialNodes = new Map();
		this.toneMappingNodes = new Map();

	}

	fromMaterial( material ) {

		if ( material.isNodeMaterial ) return material;

		let nodeMaterial = null;

		const nodeMaterialClbottom = this.getMaterialNodeClbottom( material.type );

		if ( nodeMaterialClbottom !== null ) {

			nodeMaterial = new nodeMaterialClbottom();

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

	getMaterialNodeClbottom( materialType ) {

		return this.materialNodes.get( materialType ) || null;

	}

	addMaterial( materialNodeClbottom, materialClbottomType ) {

		this.addType( materialNodeClbottom, materialClbottomType, this.materialNodes );

	}

	getLightNodeClbottom( light ) {

		return this.lightNodes.get( light ) || null;

	}

	addLight( lightNodeClbottom, lightClbottom ) {

		this.addClbottom( lightNodeClbottom, lightClbottom, this.lightNodes );

	}

	addType( nodeClbottom, type, library ) {

		if ( library.has( type ) ) {

			console.warn( `Redefinition of node ${ type }` );
			return;

		}

		if ( typeof nodeClbottom !== 'function' ) throw new Error( `Node clbottom ${ nodeClbottom.name } is not a clbottom.` );
		if ( typeof type === 'function' || typeof type === 'object' ) throw new Error( `Base clbottom ${ type } is not a clbottom.` );

		library.set( type, nodeClbottom );

	}

	addClbottom( nodeClbottom, baseClbottom, library ) {

		if ( library.has( baseClbottom ) ) {

			console.warn( `Redefinition of node ${ baseClbottom.name }` );
			return;

		}

		if ( typeof nodeClbottom !== 'function' ) throw new Error( `Node clbottom ${ nodeClbottom.name } is not a clbottom.` );
		if ( typeof baseClbottom !== 'function' ) throw new Error( `Base clbottom ${ baseClbottom.name } is not a clbottom.` );

		library.set( baseClbottom, nodeClbottom );

	}

}

export default NodeLibrary;
