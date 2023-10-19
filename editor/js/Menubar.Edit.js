import { Box3, Vector3 } from 'three';

import { UIPanel, UIRow, UIHorizontalRule } from './libs/ui.js';

import { AddObjectCommand } from './commands/AddObjectCommand.js';
import { RemoveObjectCommand } from './commands/RemoveObjectCommand.js';
import { SetPositionCommand } from './commands/SetPositionCommand.js';
import { clone } from '../../examples/jsm/utils/SkeletonUtils.js';

function MenubarEdit( editor ) {

	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu' );

	const title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/edit' ) );
	container.add( title );

	const options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );

	// Undo

	const undo = new UIRow();
	undo.setClass( 'option' );
	undo.setTextContent( strings.getKey( 'menubar/edit/undo' ) );
	undo.onClick( function () {

		editor.undo();

	} );
	options.add( undo );

	// Redo

	const redo = new UIRow();
	redo.setClass( 'option' );
	redo.setTextContent( strings.getKey( 'menubar/edit/redo' ) );
	redo.onClick( function () {

		editor.redo();

	} );
	options.add( redo );

	// Clear History

	let option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/edit/clear_history' ) );
	option.onClick( function () {

		if ( confirm( 'The Undo/Redo History will be cleared. Are you sure?' ) ) {

			editor.history.clear();

		}

	} );
	options.add( option );


	editor.signals.historyChanged.add( function () {

		const history = editor.history;

		undo.setClass( 'option' );
		redo.setClass( 'option' );

		if ( history.undos.length == 0 ) {

			undo.setClass( 'inactive' );

		}

		if ( history.redos.length == 0 ) {

			redo.setClass( 'inactive' );

		}

	} );

	// ---

	options.add( new UIHorizontalRule() );

	// Center

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/edit/center' ) );
	option.onClick( function () {

		const object = editor.selected;

		if ( object === null || object.parent === null ) return; // avoid centering the camera or scene

		const aabb = new Box3().setFromObject( object );
		const center = aabb.getCenter( new Vector3() );
		const newPosition = new Vector3();

		newPosition.x = object.position.x + ( object.position.x - center.x );
		newPosition.y = object.position.y + ( object.position.y - center.y );
		newPosition.z = object.position.z + ( object.position.z - center.z );

		editor.execute( new SetPositionCommand( editor, object, newPosition ) );

	} );
	options.add( option );

	// Clone

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/edit/clone' ) );
	option.onClick( function () {

		let object = editor.selected;

		if ( object === null || object.parent === null ) return; // avoid cloning the camera or scene

		object = clone( object );

		editor.execute( new AddObjectCommand( editor, object ) );

	} );
	options.add( option );
	
	// Delete

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/edit/delete' ) );
	option.onClick( function () {

		const object = editor.selected;

		if ( object !== null && object.parent !== null ) {

			editor.execute( new RemoveObjectCommand( editor, object ) );

		}

	} );
	options.add( option );
	
	//

	options.add( new UIHorizontalRule() );
	
	// Skin

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/edit/skin' ) );
	option.onClick( function () {

		let object = editor.selected;

		if ( object === null || object.parent === null || !object.isMesh ) return; // avoid cloning the camera or scene
		
		var i=0;
		var bones = [];
    object.traverse( function( o ) {
      if ( o.isBone ) {
        bones[i] = o;
        i++;
      }
    } );
		const skeleton = new THREE.Skeleton( bones );
		
		const positions = object.geometry.attributes.position;
    const vertex = new THREE.Vector3();
    const center = new THREE.Vector3();
        
    const skinIndices = [];
    const skinWeights = [];
        
    for ( let i = 0; i < positions.count; i ++ ) {
        
      vertex.fromBufferAttribute( positions, i );
      var d = 0;
      var dist = 0;
      var indx = [];
      indx[0] = 0; indx[1] = 0; indx[2] = 0; indx[3] = 0;
        					
      for (var j=0; j<skeleton.bones.length; j++) {
        					  
        skeleton.bones[ j ].getWorldPosition( center );
        					  
        d = Math.abs( center.distanceTo( vertex ) );
        if ( j == 0 || d < dist ) {
        					    
          dist = d;
        	if ( skeleton.bones[ j ].children.length == 0 ) {
        		for (var k=0; k<4; k++) {
        			indx[k] = j;
        		}
        		skeleton.bones[ j ].name = 'Endsite';
        	} else {
        		indx[0] = j;
        		for (var k=1; k<4; k++) {
        			for (var l=0; l<skeleton.bones.length; l++) {
        				if ( skeleton.bones[ indx[k-1] ].parent && skeleton.bones[ indx[k-1] ].parent == skeleton.bones[ l ] ) {
          				indx[k] = l;
          			}
        			}
      			}
    			}
        					    
    		}
      }
      skinIndices.push( indx[0], indx[1], indx[2], indx[3] );
      skinWeights.push( 0.4, 0.3, 0.2, 0.1 ); //have to add up to 1
    }
    object.geometry.setAttribute( 'skinIndex', new THREE.Uint16BufferAttribute( skinIndices, 4 ) );
    object.geometry.setAttribute( 'skinWeight', new THREE.Float32BufferAttribute( skinWeights, 4 ) );

		const mesh = new THREE.SkinnedMesh( object.geometry, object.material );
		mesh.name = 'SkinnedMesh';
		mesh.add( bones[ 0 ] );
		mesh.bind( skeleton );

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );


	// Set textures to sRGB. See #15903

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/edit/fixcolormaps' ) );
	option.onClick( function () {

		editor.scene.traverse( fixColorMap );

	} );
	options.add( option );

	const colorMaps = [ 'map', 'envMap', 'emissiveMap' ];

	function fixColorMap( obj ) {

		const material = obj.material;

		if ( material !== undefined ) {

			if ( Array.isArray( material ) === true ) {

				for ( let i = 0; i < material.length; i ++ ) {

					fixMaterial( material[ i ] );

				}

			} else {

				fixMaterial( material );

			}

			editor.signals.sceneGraphChanged.dispatch();

		}

	}

	function fixMaterial( material ) {

		let needsUpdate = material.needsUpdate;

		for ( let i = 0; i < colorMaps.length; i ++ ) {

			const map = material[ colorMaps[ i ] ];

			if ( map ) {

				map.colorSpace = THREE.SRGBColorSpace;
				needsUpdate = true;

			}

		}

		material.needsUpdate = needsUpdate;

	}

	return container;

}

export { MenubarEdit };
