var createfont = (function () {
        var opentype = require('./opentype/opentype.js');
        var fs = require('fs');

        var createFontJS = function (font) {

            var JSONobj = new Object();
            JSONobj.glyphs = new Object();

            for (var i = 21; i < 127; i++) {

                var glyph = font.charToGlyph(String.fromCharCode(i));

                JSONobj.glyphs[String.fromCharCode(i)] = new Object();
                JSONobj.glyphs[String.fromCharCode(i)].x_min = glyph.xMin;
                JSONobj.glyphs[String.fromCharCode(i)].x_max = glyph.xMax;
                JSONobj.glyphs[String.fromCharCode(i)].ha = glyph.advanceWidth;

                var command = "";

                for (var j = 0; j < glyph.path.commands.length; j++) {

                    switch (glyph.path.commands[j].type) {
                    case 'M':
                        {
                            command = command.concat(glyph.path.commands[j].type.toLowerCase());
                            command += " ";
                            command = command.concat(glyph.path.commands[j].x);
                            command += " ";
                            command = command.concat(glyph.path.commands[j].y);
                            command += " ";
                            break;
                        }
                    case 'L':
                        {
                            command = command.concat(glyph.path.commands[j].type.toLowerCase());
                            command += " ";
                            command = command.concat(glyph.path.commands[j].x);
                            command += " ";
                            command = command.concat(glyph.path.commands[j].y);
                            command += " ";
                            break;
                        }
                    case 'Q':
                        {
                            command = command.concat(glyph.path.commands[j].type.toLowerCase());
                            command += " ";
                            command = command.concat(glyph.path.commands[j].x);
                            command += " ";
                            command = command.concat(glyph.path.commands[j].y);
                            command += " ";
                            command = command.concat(glyph.path.commands[j].x1);
                            command += " ";
                            command = command.concat(glyph.path.commands[j].y1);
                            command += " ";
                            break;
                        }
                    case 'C':
                        {
                            command = command.concat('b'); // opentype return 'C' for bezier curve, Font utils.js expects 'b' for the same
                            command += " ";
                            command = command.concat(glyph.path.commands[j].x);
                            command += " ";
                            command = command.concat(glyph.path.commands[j].y);
                            command += " ";
                            command = command.concat(glyph.path.commands[j].x1);
                            command += " ";
                            command = command.concat(glyph.path.commands[j].y1);
                            command += " ";
                            command = command.concat(glyph.path.commands[j].x2);
                            command += " ";
                            command = command.concat(glyph.path.commands[j].y2);
                            command += " ";
                            break;
                        }
                    case 'Z':
                        {
                            command = command.concat('z');
                            command += " ";
                            break;
                        }

                    default:
                        {
                            //                    console.log("Unsupported font directive");
                            break;
                        }

                    }
                }
                JSONobj.glyphs[String.fromCharCode(i)].o = command;

            }
            JSONobj.cssFontWeight = (font.styleName === "Regular") ? "normal" : "bold";
            JSONobj.cssFontStyle = (font.styleName === "Regular" || !font.styleName) ? "normal" : "italic";
            JSONobj.ascender = font.ascender;
            JSONobj.underlinePosition = font.tables.post.underlinePosition;
            JSONobj.underlineThickness = font.tables.post.underlineThickness;
            JSONobj.boundingBox = new Object();
            JSONobj.boundingBox.xMax = font.tables.head.xMax;
            JSONobj.boundingBox.xMin = font.tables.head.xMin;
            JSONobj.boundingBox.yMax = font.tables.head.yMax;
            JSONobj.boundingBox.yMin = font.tables.head.yMin;
            JSONobj.familyName = font.familyName.toLowerCase(); // THREE.FontUtils explicitly makes family name lowercase
            JSONobj.descender = font.descender;
            JSONobj.resolution = 1000;
            JSONobj.format = font.outlinesFormat;
            JSONobj.original_font_information = new Object();

            var FontJS = "if (_typeface_js && _typeface_js.loadFace) _typeface_js.loadFace(";
            FontJS = FontJS.concat(JSON.stringify(JSONobj));
            FontJS = FontJS.concat(");")
            return FontJS;
        }
        
        opentype.load(process.argv[2], function (err, font) {
            var FontJS = createFontJS(font);
            fs.writeFile("./" + font.familyName + ".js", FontJS, function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("Font JS created");
            });
        });
})();
