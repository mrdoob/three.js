function getToolbarBtnHintText( optionText, shortcutText ) {

	let result = optionText;

	if ( shortcutText ) {

		result += ' ' + '(' + shortcutText.toUpperCase() + ')';

	}

	return result;

}

export { getToolbarBtnHintText };
