import {
	Loader,
	FileLoader,
	Group,
	Vector3,
	Color,
	SphereGeometry,
	CylinderGeometry,
	MeshLambertMaterial,
	InstancedMesh,
	Matrix4,
	Quaternion
} from 'three';

const DEFAULT_VDW_RADIUS = {
	H: 0.31, C: 0.76, N: 0.71, O: 0.66, F: 0.57,
	P: 1.07, S: 1.05, Cl: 1.02, Br: 1.2, I: 1.39
};

const DEFAULT_ELEMENT_COLOR = {
	H: 0xffffff, C: 0x909090, N: 0x3050f8, O: 0xff0d0d, F: 0x90e050,
	P: 0xff8000, S: 0xffff30, Cl: 0x1ff01f, Br: 0xa62929, I: 0x940094
};

/**
	* SDFLoader — A loader for MDL Molfile / SDF chemical structure files.
	*
	* The loader parses the textual SDF data and returns a `THREE.Group` containing two
	* `THREE.InstancedMesh` children: one for the atoms (spheres) and one for the bonds (cylinders).
	*
	* In addition to efficient rendering via instancing, the loader allows customisation of element
	* colours and van-der-Waals radii via the `setElementData` method.
	*
	* Example usage:
	* ```js
	* import { SDFLoader } from 'three/addons/loaders/SDFLoader.js';
	*
	* const loader = new SDFLoader();
	* loader.load( 'models/sdf/benzene.sdf', group => {
	*     scene.add( group );
	* } );
	* ```
	*
	* @see examples/webgl_loader_sdf
	*/
class SDFLoader extends Loader {

	constructor( manager ) {

		super( manager );
		this.elementRadii = { ...DEFAULT_VDW_RADIUS };
		this.elementColors = { ...DEFAULT_ELEMENT_COLOR };

	}

	setElementData( colors, radii ) {

		if ( colors ) Object.assign( this.elementColors, colors );
		if ( radii ) Object.assign( this.elementRadii, radii );
		return this;

	}

	load( url, onLoad, onProgress, onError ) {

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );
		loader.setResponseType( 'text' );
		loader.load( url, text => {

			try {

				onLoad( this.parse( text ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				this.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	parse( text ) {

		// Use internal lightweight parser so loader is self-contained
		/* eslint-disable padded-blocks */
		const { atoms, bonds } = ( () => {

			const lines = text.split( /\r?\n/ );
			let i = 3;
			const counts = lines[ i ++ ].trim().split( /\s+/ );
			const natoms = parseInt( counts[ 0 ] );
			const nbonds = parseInt( counts[ 1 ] );
			if ( isNaN( natoms ) || isNaN( nbonds ) ) throw new Error( 'SDFLoader: invalid counts line' );
			const atoms = [];

			for ( let k = 0; k < natoms; k ++, i ++ ) {
				const l = lines[ i ];
				if ( ! l || l.length < 31 ) throw new Error( `SDFLoader: invalid atom line ${ i + 1 }` );
				const x = parseFloat( l.substr( 0, 10 ) );
				const y = parseFloat( l.substr( 10, 10 ) );
				const z = parseFloat( l.substr( 20, 10 ) );
				const element = l.substr( 31, 3 ).trim() || 'C';
				atoms.push( { position: new Vector3( x, y, z ), element } );
			}

			const bonds = [];
			while ( bonds.length < nbonds && i < lines.length ) {
				const l = lines[ i ++ ];
				if ( ! l ) continue;
				if ( l.startsWith( 'M' ) ) break;
				if ( l.length < 9 ) continue;
				const a1 = parseInt( l.slice( 0, 3 ) ) - 1;
				const a2 = parseInt( l.slice( 3, 6 ) ) - 1;
				const type = parseInt( l.slice( 6, 9 ) ) || 1;
				if ( isNaN( a1 ) || isNaN( a2 ) || a1 < 0 || a2 < 0 || a1 >= natoms || a2 >= natoms ) continue;
				bonds.push( [ a1, a2, type ] );
			}

			return { atoms, bonds };

		} )();
		/* eslint-enable padded-blocks */

		return this._buildSceneGraph( atoms, bonds );

	}

	_buildSceneGraph( atoms, bonds ) {

		const group = new Group();

		const sphereGeo = new SphereGeometry( 1, 16, 16 );
		const atomMat = new MeshLambertMaterial();
		const atomMesh = new InstancedMesh( sphereGeo, atomMat, atoms.length );
		const m = new Matrix4();

		atoms.forEach( ( atom, idx ) => {

			const r = ( this.elementRadii[ atom.element ] || 0.75 ) * 0.2;
			m.makeScale( r, r, r );
			m.setPosition( atom.position );
			atomMesh.setMatrixAt( idx, m );
			const color = this.elementColors[ atom.element ] || 0xcccccc;
			atomMesh.setColorAt( idx, new Color( color ) );

		} );
		atomMesh.instanceMatrix.needsUpdate = true;
		atomMesh.instanceColor.needsUpdate = true;
		group.add( atomMesh );

		const cylGeo = new CylinderGeometry( 0.05, 0.05, 1, 8 );
		const bondMat = new MeshLambertMaterial( { color: 0xaaaaaa } );
		const bondMesh = new InstancedMesh( cylGeo, bondMat, bonds.length );
		const up = new Vector3( 0, 1, 0 );
		const q = new Quaternion();

		bonds.forEach( ( [ a, b, bondType ], idx ) => {

			const v1 = atoms[ a ].position;
			const v2 = atoms[ b ].position;
			const mid = v1.clone().add( v2 ).multiplyScalar( 0.5 );
			const dir = v2.clone().sub( v1 );
			const len = dir.length();
			q.setFromUnitVectors( up, dir.clone().normalize() );
			m.makeRotationFromQuaternion( q );
			m.setPosition( mid );
			m.scale( new Vector3( 1, len, 1 ) );
			bondMesh.setMatrixAt( idx, m );

		} );
		bondMesh.instanceMatrix.needsUpdate = true;
		group.add( bondMesh );

		return group;

	}

}

export { SDFLoader };
