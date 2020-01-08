# Alternative three.js examples page with thumbnails #

### Purpose ###

Generates an alternative examples page that has an automatically generated thumbnail of each example as a visual reference. Google Puppeteer is used to capture a screen shot of each example. 

After installing Node and the relevant npm packages (see below), run `node generate_thumbnails.js` and a new set of thumbnail images will be created in the `<three.js repo>/examples/thumbs` folder. 

Visit `<three.js repo>/examples/thumbs/index_thumbs.html` to see the page.

### Comprised of 2 parts: ###

1/ The example page itself
  * Visually easy to find examples by name or thumbnail
  * Input allows selection filtering by name

2/ A node.js script to generate thumbnails for all the examples
* Found in `./utils/examples/generate_thumbanils.js`
* Developed using:
  * Node 10.16
  * npm 6.13
  * Google Puppeteer 2.0.0 (npm)
  * Sharp 0.23.2 (npm)
  * Capture a thumbnail from `files.js` (created as part of the three.js build)
  * Specify tweaks for individual experiments
    * Needed to generate a thumbnail that wasn't representative (E.G. loader takes too longer to render and captured thumbnail is blank)
    * In the latter case, you can apply "Tweaks" to help get a good capture. Current tweaks are:
        * `delay: <n>` add a delay before capture in ms
        * `click: <selector>` inject a "click" event in the given HTML selector once it loads (E.G. useful for the webaudio examples that need interaction before they start)
        * more to come (consider inject JavaScript to control an experiment more accurately)
  * Can add a `--dev` command line parameter and this will force generation of examples in the tweaked_examples_dev array instead of the master list - see code for details

### Future enhancements ###
* Consider a way to allow new or updated examples to be selected.
* Consider other ways to improve the 'fidelity' of the captured thumbnails. Given browser/network/rendering differences, what you end up with is still pretty random.  Perhaps consider a "screen shot" mode in each example, triggered by a JavaScript "tweak" that forces display of a representative visual?
* Consider a way to combined the default examples view with a thumbnail option.  Seems bad to have two versions.