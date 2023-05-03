# Geo Picking Data

These tools were used to generate data for both
[the article on aligning HTML elements to 3D](https://threejs.org/manual/en/align-html-elements-to-3d.html)
and [the article on using indexed textures for picking and color](https://threejs.org/manual/en/indexed-textures.html)

I'm not going to go into details on how they work but you can look inside
and see them draw the images and extract the data. Maybe you can use them
to make or extract similar maps from other data.

The one I actually used is `make-geo-picking-texture.html`. To run it you need
to download the data from [here](http://thematicmapping.org/downloads/world_borders.php)
then unzip it and put it in this folder.

Then run a simple server. If you don't already know how to do that [here's a simple one](https://greggman.github.io/servez/)
that will take just a few clicks to use. Run it, point it at this folder, then load `make-geo-picking-texture.html`
in your browser.

There's also another one called `make-geo-picking-texture-ogc.html`. It works with data from
[here](https://gadm.org/download_world.html). To use that one download the database then use
a tool like [https://sqlitebrowser.org/](https://sqlitebrowser.org/). Open the database and
export the table called `level1` to a json file called `level1.json`

Then run a simple server like above and open `make-geo-picking-texture-ogc.html` in your browser.


