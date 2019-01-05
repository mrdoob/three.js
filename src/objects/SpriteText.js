/**
 * @author anhr / https://github.com/anhr/
*/

//A sprite based text component.
//options:
//{
//	text: The text to be displayed on the sprite. Default is 'Sprite Text'
//	position: THREE.Vector3 - position of the text. Default is new THREE.Vector3(0,0,0)
//	textHeight: The height of the text. Default is 1
//	fontFace: CSS font-family - specifies the font of the text. Default is 'Arial'
//	fontColor: RGBA object or RGB object or HEX value. Default is 'rgba(255, 255, 255, 1)'
//			Examples 'rgba(0, 0, 255, 0.5)', '#00FF00'
//	bold: CSS font-weight. Equivalent of 700. Default is false.
//	italic: CSS font-style. Default is false.
//	fontProperties: string. Other font properties. The font property uses the same syntax as the CSS font property.
//		Default is empty string. Example "900", "oblique lighter".
//	center: THREE.Vector2 - The text's anchor point, and the point around which the text rotates.
//		A value of (0.5, 0.5) corresponds to the midpoint of the text.
//		A value of (0, 0) corresponds to the left lower corner of the text.
//		A value of (0, 1) corresponds to the left upper corner of the text.
//		Default is (0, 1).
//	rect: text rectangle.
//	{
//		displayRect: true - the rectangle around the text is visible. Default is false
//		backgroundColor: RGBA object or RGB object or HEX value. Default is 'rgba(100, 100, 100, 1)' - gray.
//			Examples 'rgba(0, 0, 255, 0.5)', '#00FF00'
//		borderColor: RGBA object or RGB object or HEX value. Default is 'rgba(0, 255, 0, 1)' - green
//		borderThickness: Default is 5
//		borderRadius: Default is 6
//	}
//}
//Thanks to / https://github.com/vasturiano/three-spritetext
function SpriteText (options) {

	var sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.Texture() }));

	options = options || {};
	options.text = options.text || 'Sprite Text';
	options.position = options.position || new THREE.Vector3(0,0,0);
	options.textHeight = options.textHeight || 1;
	options.fontFace = options.fontFace || 'Arial';
	options.fontColor = options.fontColor || 'rgba(255, 255, 255, 1)';
	options.bold = options.bold || false;
	options.italic = options.italic || false;
	options.fontProperties = options.fontProperties || '';
	options.center = options.center || new THREE.Vector2(0, 1);

	var canvas = document.createElement('canvas');
	sprite.material.map.minFilter = THREE.LinearFilter;
	var fontSize = 90;
	const context = canvas.getContext('2d');

	sprite.update = function(optionsUpdate){

		if(optionsUpdate != undefined)
			Object.keys(optionsUpdate).forEach(function (key) { options[key] = optionsUpdate[key]; });

		options.font = `${options.fontProperties ? options.fontProperties + ' ' : ''}${options.bold ? 'bold ' : ''}${options.italic ? 'italic ' : ''}${fontSize}px ${options.fontFace}`;

		context.font = options.font;
		const textWidth = context.measureText(options.text).width;
		canvas.width = textWidth;
		canvas.height = fontSize;

		context.font = options.font;

		//Rect
		//Thanks to http://stemkoski.github.io/Three.js/Sprite-Text-Labels.html

		var borderThickness = 0;
		options.rect = options.rect || {};
		options.rect.displayRect = options.rect.displayRect || false;
		if (options.rect.displayRect) {
			borderThickness = options.rect.borderThickness || 5;

			// background color
			context.fillStyle = options.rect.hasOwnProperty("backgroundColor") ?
				options.rect["backgroundColor"] : 'rgba(100, 100, 100, 1)';

			// border color
			context.strokeStyle = options.rect.hasOwnProperty("borderColor") ?
				options.rect["borderColor"] : 'rgba(0, 255, 0, 1)';

			context.lineWidth = borderThickness;

			// function for drawing rounded rectangles
			function roundRect(ctx, x, y, w, h, r) {
				ctx.beginPath();
				ctx.moveTo(x + r, y);
				ctx.lineTo(x + w - r, y);
				ctx.quadraticCurveTo(x + w, y, x + w, y + r);
				ctx.lineTo(x + w, y + h - r);
				ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
				ctx.lineTo(x + r, y + h);
				ctx.quadraticCurveTo(x, y + h, x, y + h - r);
				ctx.lineTo(x, y + r);
				ctx.quadraticCurveTo(x, y, x + r, y);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			}
			roundRect(context,
				borderThickness / 2,
				borderThickness / 2,
				textWidth - borderThickness,
				fontSize - borderThickness,
				options.rect.borderRadius == undefined ? 6 : options.rect.borderRadius
				);
		}

		context.fillStyle = options.fontColor;
		context.textBaseline = 'bottom';
		context.fillText(options.text, 0, canvas.height + borderThickness);

		// Inject canvas into sprite
		sprite.material.map.image = canvas;
		sprite.material.map.needsUpdate = true;

		if (options.hasOwnProperty('textHeight'))
			sprite.scale.set(options.textHeight * canvas.width / canvas.height, options.textHeight);
		if (options.hasOwnProperty('position'))
			sprite.position.copy(options.position);
		if (options.hasOwnProperty('center'))
			sprite.center = options.center;// == undefined ?  new THREE.Vector2(0, 1) : options.center;
	}
	sprite.update();

	return sprite;
}

export { SpriteText };
