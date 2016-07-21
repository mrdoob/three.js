/**
 * @author aymanhab based on mr. doob
 */

Sidebar.SceneSettings = function (editor) {

    var config = editor.config;
    var signals = editor.signals;

    var backdrops = {
        'nobackdrop': 'No Backdrop',
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

    // Backdrop

    var backdropTypeRow = new UI.Panel();
    var backdropType = new UI.Select().setOptions(backdrops).setWidth('150px').onChange(function () {

        var value = this.getValue();


        config.setKey('backdrop', value);

        // change  editor.config
        editor.updateBackdrop(value);
    });

    backdropTypeRow.add(new UI.Text('Backdrop').setWidth('90px'));
    backdropTypeRow.add(backdropType);

    container.add(backdropTypeRow);

    // Floor
    var floorTypeRow = new UI.Panel();
    var floorType = new UI.Select().setOptions(floorpatterns).setWidth('150px').onChange(function () {

        var value = this.getValue();


        config.setKey('floor', value);
        // change  editor.config
        editor.updateFloor(value);
    });

    floorTypeRow.add(new UI.Text('Floor').setWidth('90px'));
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
