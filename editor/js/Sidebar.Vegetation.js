/**
 * @author Clinton Freeman <freeman@cs.unc.edu>
 * @author Steven Love <slove13@cs.unc.edu>
 */

Sidebar.Vegetation = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();

    var veginfoPanel = new UI.Panel();
    var veglist = new UI.FancySelect().setId( 'veglist' ).onChange( function () {

        var vegInfo = this.locationData[ this.selectedIndex ];

        var vegAddButton = new UI.Button( 'Add' ).onClick( function() {

            var callback = function( obj3d ) {

            var treeTexture = THREE.ImageUtils.loadTexture( 'media/species/' + vegInfo.file + '/diffuse.png' );
            var uniforms = { texture:  { type: "t", value: treeTexture } };
        
                var fragmentShader = '' +
                    'uniform sampler2D texture;' +
                    'varying vec2 vUV;' +
                    'vec4 pack_depth( const in float depth ) {' +
                        'const vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );' +
                        'const vec4 bit_mask  = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );' +
                        'vec4 res = fract( depth * bit_shift );' +
                        'res -= res.xxyz * bit_mask;' +
                        'return res;' +
                    '}' +
                    'void main() {' +
                        'vec4 pixel = texture2D( texture, vUV );' +
                        'if ( pixel.a < 0.5 ) discard;' +
                        'gl_FragData[ 0 ] = pack_depth( gl_FragCoord.z );' +
                    '}';

                var vertexShader = '' +
                    'varying vec2 vUV;' +
                    'void main() {' +
                        'vUV = 0.75 * uv;' +
                        'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );' +
                        'gl_Position = projectionMatrix * mvPosition;' +
                    '}';

                var tree = obj3d.scene.children[0];
                //tree.name = "tree";
                tree.position.set( 128, -64, 256 );
                tree.scale.set( 1.5, 1.5, 1.5 );
                tree.castShadow = true;
                tree.receiveShadow = true;
                tree.material = new THREE.MeshLambertMaterial( {
                    map: treeTexture,
                    transparent: true,
                    side: THREE.DoubleSide
                } );
                tree.customDepthMaterial = new THREE.ShaderMaterial( { 
                    uniforms: uniforms, 
                    vertexShader: vertexShader, 
                    fragmentShader: fragmentShader 
                } );

                editor.addObject( tree );
                editor.select( tree );
            }
    
            var mloader = new THREE.ColladaLoader();
            mloader.load( 'media/species/' + vegInfo.file + '/mesh.DAE', callback );

        } );

        veginfoPanel.clear();
        veginfoPanel.add( new UI.Text( 'Latin name: ' + vegInfo.latin ) );
        veginfoPanel.add( new UI.Break() );
        veginfoPanel.add( new UI.Text( 'Common name: ' + vegInfo.common ) );
        veginfoPanel.add( new UI.Break() );
        veginfoPanel.add( vegAddButton );

    } );

    signals.locationChanged.add( function( data ) {

        veglist.locationData = data;

        var options = [];

        data.forEach( function( specie ) {
            //console.log( specie );
            options.push( 
                '<div><img src="media/species/' + specie.file + '/thumbnail.png" width="100%" /></div>' +
                specie.common
            );    
        } );
        
        veglist.setOptions( options );

    } );

    container.add( new UI.Text( 'NATIVE VEGETATION' ) );
    container.add( new UI.Break(), new UI.Break() );
    container.add( veglist );
    container.add( new UI.Break() );
    container.add( new UI.Text( 'PARAMETERS' ) );
    container.add( new UI.Break(), new UI.Break() );
    container.add( veginfoPanel );

	return container;
}
