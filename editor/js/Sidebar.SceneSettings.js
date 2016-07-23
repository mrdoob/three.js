/**
 * @author aymanhab based on mr. doob
 */

Sidebar.SceneSettings = function (editor) {

    var config = editor.config;
    var signals = editor.signals;

    var backgrounds = {
        'nobackground': 'No Background',
        'sky': 'Sky',
        'desert': 'Desert'
    };

    var floorpatterns = {
        'nofloor': 'No Floor',
        'redbricks': 'Red Bricks',
        'graybricks': 'Gray Bricks',
        'wood-floor': 'Wood',
        'tile': 'Tiles'
    };

    var container = new UI.CollapsiblePanel();
    container.setCollapsed(config.getKey('ui/sidebar/scenesettings/collapsed'));
    container.onCollapsedChange(function (boolean) {

        config.setKey('ui/sidebar/scenesettings/collapsed', boolean);

    });

    container.addStatic(new UI.Text('SCENE SETTINGS'));
    container.add(new UI.Break());

    // Background

    var backgroundTypeRow = new UI.Panel();
    var backgroundType = new UI.Select().setOptions(backgrounds).setWidth('150px').onChange(function () {

        var value = this.getValue();


        config.setKey('background', value);

        // change  editor.config
        editor.updateBackground(value);
    });

    backgroundTypeRow.add(new UI.Text('Background').setWidth('90px'));
    backgroundTypeRow.add(backgroundType);

    container.add(backgroundTypeRow);

    // Floor
    var floorTypeRow = new UI.Panel();
    var floorType = new UI.Select().setOptions(floorpatterns).setWidth('150px').onChange(function () {

        var value = this.getValue();


        config.setKey('floor', value);
        // change  editor.config
        editor.updateGroundPlane(value);
    });

    floorTypeRow.add(new UI.Text('Ground').setWidth('90px'));
    floorTypeRow.add(floorType);

    container.add(floorTypeRow);

    // shadow
    /*
        var rendererShadowsSpan = new UI.Span();
        var rendererShadows = new UI.Checkbox( config.getKey( 'project/renderer/shadows' ) ).setLeft( '100px' ).onChange( function () {
    
            config.setKey( 'project/renderer/shadows', this.getValue() );
            updateRenderer();
    
        } );
    
        rendererShadowsSpan.add( rendererShadows );
        rendererShadowsSpan.add( new UI.Text( 'shadows' ).setMarginLeft( '3px' ) );
    
        rendererPropertiesRow.add( rendererShadowsSpan );
    
        container.add( rendererPropertiesRow );
    */
    return container;

};
