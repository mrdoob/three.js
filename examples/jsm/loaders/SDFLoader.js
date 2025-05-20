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
    const lines = text.split( /\r?\n/ );
    let i = 3; // skip header
    const counts = lines[ i++ ].trim().split( /\s+/ );
    const natoms = parseInt( counts[ 0 ] );
    const nbonds = parseInt( counts[ 1 ] );

    const atoms = [];
    for ( let k = 0; k < natoms; k ++, i ++ ) {
      const l = lines[ i ];
      atoms.push( {
        position: new Vector3(
          parseFloat( l.substr( 0, 10 ) ),
          parseFloat( l.substr( 10, 10 ) ),
          parseFloat( l.substr( 20, 10 ) )
        ),
        element: l.substr( 31, 3 ).trim() || 'C'
      } );
    }

    const bonds = [];
    for ( let k = 0; k < nbonds; k ++, i ++ ) {
      const l = lines[ i ];
      bonds.push( [
        parseInt( l.substr( 0, 3 ) ) - 1,
        parseInt( l.substr( 3, 3 ) ) - 1
      ] );
    }

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

    bonds.forEach( ( [ a, b ], idx ) => {
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
