/**
 * @author mrdoob / http://mrdoob.com/
 * @author Dennis Wilson / http://www.abakia.de/
 */

UI.MenubarHelper = {

	/**
	 * Creates a first level menubar entry. Named by name
	 * and configured with optionsPanel entries, 
	 * generated with createOptionsPanel().
	 * 
	 * @param  {string} name        visible menubar caption
	 * @param  {array} optionsPanel instance of UI.Panel()
	 * @return {object}             instance of UI.Panel()
	 */
	createMenuContainer: function ( name, optionsPanel ) {

		var container = new UI.Panel();
		var title = new UI.Panel();

		title.setTextContent( name );
		title.setMargin( '0px' );
		title.setPadding( '8px' );

		container.setClass( 'menu' );
		container.add( title );
		container.add( optionsPanel );

		return container;

	},
	
	/**
	 * Assemblies a context menu for later use with createMenuContainer().
	 * Takes menuConfig as argument, which shall contain instances of UI.Panel
	 * only!
	 * 
	 * @param  {array} menuConfig configuration of the context menu
	 * @return {object}           UI.Panel
	 */
	createOptionsPanel: function ( menuConfig ) {

		var options = new UI.Panel();
		options.setClass( 'options' );

		menuConfig.forEach(function(option) {
			options.add(option);
		});

		return options;

	},

	/**
	 * Creates a single option/entry for a menubar context menu.
	 * Usually called during menu configuration.
	 * 
	 * @param  {string}   name            visible option/entry caption
	 * @param  {function} callbackHandler command/functionality to be executed
	 * @return {object}                   instance of UI.Panel
	 */
	createOption: function ( name, callbackHandler ) {

		var option = new UI.Panel();
		option.setClass( 'option' );
		option.setTextContent( name );
		option.onClick( callbackHandler );

		return option;

	},

	/**
	 * Creates a UI.HorizontalRule for visible option/entry seperation
	 * Usually called during menu configuration.
	 * 
	 * @return {object} UI.HorizontalRule
	 */
	createDivider: function () {

		return new UI.HorizontalRule();

	}

};
