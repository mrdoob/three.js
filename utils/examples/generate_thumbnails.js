/*
    @author callumprentice - https://callum.com (2019-11)

    Generates images for an alternative version of the 
    three.js examples page with thumbnail previews

    Requirements:
        node 10.16
        npm 6.13
        Google Puppeteer 2.0.0 (npm)
        Sharp 0.23.2 (npm)
*/

const puppeteer = require('puppeteer');
const sharp = require('sharp');
const vm = require('vm');
const fs = require('fs');

const screenshot_width = 1024;
const screenshot_height = 768;
const thumbnail_width = 320;
const thumbnail_height = parseInt((thumbnail_width / screenshot_width) * screenshot_height);
const default_delay_ms = 2500;
var dev_mode = false;

// This is a list of examples whose capture parameters need to be tweaked. Currently, the
// valid tweaks are 'delay' which changes the number of ms to wait before capture
// (some examples take a longer time to load and initialize) and 'click' which inserts
// a click event into the named selector (some examples - e.g. webaudio - need a click to
// start because of browser restrictions)
// Note: As examples change names or get deleted, the tweaks here might need to be updated.
var tweaked_examples = [];
tweaked_examples.push({name: 'webaudio_orientation', tweak: {click: 'button', delay: 2500}});
tweaked_examples.push({name: 'webaudio_visualizer', tweak: {click: 'button', delay: 2500}});
tweaked_examples.push({name: 'webaudio_timing', tweak: {click: 'button', delay: 2500}});
tweaked_examples.push({name: 'webaudio_sandbox', tweak: {click: 'button', delay: 2500}});
tweaked_examples.push({name: 'webgl_materials_video', tweak: {click: 'button', delay: 2500}});
tweaked_examples.push({name: 'webgl2_materials_texture2darray', tweak: {delay: 5000}});
tweaked_examples.push({name: 'webgl_animation_multiple', tweak: {delay: 5000}});
tweaked_examples.push({name: 'webgl_loader_3mf_materials', tweak: {delay: 5000}});
tweaked_examples.push({name: 'webgl_loader_collada_kinematics', tweak: {delay: 5000}});
tweaked_examples.push({name: 'webgl_loader_collada_skinning', tweak: {delay: 5000}});
tweaked_examples.push({name: 'webgl_animation_multiple', tweak: {delay: 5000}});
tweaked_examples.push({name: 'webgl_loader_draco', tweak: {delay: 5000}});
tweaked_examples.push({name: 'webgl_loader_fbx', tweak: {delay: 5000}});
tweaked_examples.push({name: 'webgl_loader_gltf', tweak: {delay: 7000}});
tweaked_examples.push({name: 'webgl_loader_gltf_extensions', tweak: {delay: 7000}});
tweaked_examples.push({name: 'webgl_loader_imagebitmap', tweak: {delay: 5000}});
tweaked_examples.push({name: 'webgl_loader_lwo', tweak: {delay: 5000}});
tweaked_examples.push({name: 'webgl_loader_mmd', tweak: {delay: 5000}});
tweaked_examples.push({name: 'webgl_loader_mmd_audio', tweak: {delay: 7000}});
tweaked_examples.push({name: 'webgl_loader_vrm', tweak: {delay: 7000}});
tweaked_examples.push({name: 'webgl_loader_x', tweak: {delay: 5000}});
tweaked_examples.push({name: 'webgl_materials_car', tweak: {delay: 5000}});
tweaked_examples.push({name: 'webgl_materials_envmaps_parallax', tweak: {delay: 5000}});
tweaked_examples.push({name: 'webgl_materials_translucency', tweak: {delay: 7000}});
tweaked_examples.push({name: 'webxr_vr_cubes', tweak: {delay: 5000}});

// This list of tweaked examples is to allow for testing individual (or more) example captures
// and useful when you are experimenting with a tweak - changing the delay or figuring out
// which selector to send a click to.
var tweaked_examples_dev = [];
tweaked_examples_dev.push({name: 'webaudio_orientation', tweak: {click: 'button', delay: 2500}});

function build_example_list() {
    // Read the JavaScript file that contains the primary list of example names
    const js_filename = '../../examples/files.js';
    var data = fs.readFileSync(js_filename);
    const script = new vm.Script(data);
    script.runInThisContext();

    // Create an array of example names and empty tweaks using the
    // entries we read from the JavaScript file we just loaded
    var file_js_examples = [];
    for (var key in files) {
        for (var i = 0; i < files[key].length; ++i) {
            const example_name = files[key][i];
            file_js_examples.push({
                name: example_name,
                tweak: {}
            });
        }
    }

    // This will be populated with a list of example names from the list
    // of tweaks that do not appear in the canonical list - usually this
    // happens because an example has been removed or renamed
    const invalid_example_names = [];

    // Step through list of tweaked examples and for each, either merge it into
    // the main list along with its tweak or add it to a list of invalid names
    // that no longer appear in the canonical list
    tweaked_examples.forEach(({name, tweak}) => {
        let index = file_js_examples.findIndex(x => x.name === name);

        index !== -1
            ? (file_js_examples[index] = {
                  name,
                  tweak
              })
            : invalid_example_names.push({
                  name,
                  tweak
              });
    });

    // Return both the merged canonical list as well the list of invalid names
    // so we can inform the user that there are some entries in the tweak list which
    // need their attention
    return {
        list: file_js_examples,
        invalid: invalid_example_names
    };
}

async function grab_shot(filename_base, thumb_dir, tweak, force_overwrite) {
    // The path to the 'thumbs' folder and filename where the
    // thumbnail will be saved - if it exists, we don't overwrite.
    // Exception to this is if force_overwrite flag is true, the thumbnail
    // will always be overwritten
    const thumb_path = thumb_dir + '/' + filename_base + '.jpg';
    if (!force_overwrite) {
        if (fs.existsSync(thumb_path)) {
            console.warn("Thumb already exists - won't overwrite: ", thumb_path);
            return;
        }
    }

    const browser = await puppeteer.launch({
        defaultViewport: {
            width: screenshot_width,
            height: screenshot_height
        }
    });

    // need a URL vs file:/// to open in Puppeteer - problem is, some of the
    // new examples are only in dev and not yet present on the web site so
    // will 404 - not sure yet how to deal with this without a 2 stage approach
    const url = 'https://threejs.org/examples/' + filename_base + '.html';

    const page = await browser.newPage();

    console.log('Navigating to URL:', url);
    await page.goto(url);
    console.log('    Navigation complete');

    let delay_ms = default_delay_ms;

    if (tweak.delay != undefined) {
        console.log('Tweak: delay set to', tweak.delay, 'ms');
        delay_ms = tweak.delay;
    }

    if (tweak.click != undefined) {
        console.log('Tweak: injecting a click to selector', tweak.click);
        page.waitForSelector(tweak.click);
        page.click(tweak.click);
    }

    // delay for N milliseconds - I think there is a better way to
    // do this in node but this seems to work
    console.log('Pausing for', delay_ms, 'ms');
    await new Promise((resolve, reject) => {
        setTimeout(() => resolve(), delay_ms);
    });
    console.log('    Pause complete');

    console.log('Taking screenshot');
    const shot_path = './' + filename_base + '_shot.png';
    await page.screenshot({
        path: shot_path
    });
    console.log('    Screenshot taken');

    // use Sharp to resize the image and convert to a JPG (from PNG)
    console.log('Creating thumbnail size', thumbnail_width, 'x', thumbnail_height, 'in', thumb_dir);
    await sharp(shot_path)
        .resize(thumbnail_width, thumbnail_height)
        .toFile(thumb_path)
        .then(info => {
            console.log(info);
        })
        .catch(err => {
            console.error(err);
        });
    console.log('    Thumbnail created');

    console.log('Waiting for browser to close');
    await browser.close();
    console.log('    Browser is closed');

    // the initial full-size shot is saved in the same folder as the script and once
    // we have created the thumbnail, we no longer need it so it can be removed.
    console.log('Removing initial shot:', shot_path);
    fs.unlink(shot_path, err => {
        if (err) {
            console.error(err);
            return;
        }
    });
    console.log('    Initial shot removed');
}

// async aware version of array.forEach along with some
// helpful log display
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        var log_line =
            '\n' +
            '(' +
            (index + 1).toString() +
            '/' +
            array.length.toString() +
            ') Grabbing shot of ' +
            array[index].name +
            ' with tweak ' +
            JSON.stringify(array[index].tweak);
        console.log(log_line);

        await callback(array[index], index, array);
    }
}

function grab_all_examples() {
    // create a master list of example names/tweaks to capture based off
    // the list in files.js and the tweaks listed at the top of this file
    var result = build_example_list();

    // sometimes there are 'orphans' - tweaks to examples that have been
    // renamed or removed - highlight these - they won't be captured.
    if (result.invalid.length) {
        console.error("There are tweaks with names not found in main list - these won't be used");
        console.table(result.invalid);
    }

    // make the folder to store the thumbnails in
    const thumb_dir = '../../examples/thumbs/';
    if (!fs.existsSync(thumb_dir)) {
        fs.mkdirSync(thumb_dir);
    }

    const grab_all_shots = async () => {
        await asyncForEach(result.list, async example => {
            const force_overwrite = false;
            await grab_shot(example.name, thumb_dir, example.tweak, force_overwrite);
        });
    };

    // only grab all the shots if we are NOT in dev mode
    if (!dev_mode) {
        grab_all_shots();
    }

    const grab_all_shots_dev = async () => {
        await asyncForEach(tweaked_examples_dev, async example => {
            const force_overwrite = true;
            await grab_shot(example.name, thumb_dir, example.tweak, force_overwrite);
        });
    };

    // only grab all the dev shots if we ARE in dev mode
    if (dev_mode) {
        grab_all_shots_dev();
    }
}

// Set 'dev' mode if '--dev' flag appears in command line args
// Main effect currently is to NOT grab main list, grab shots listed
// in tweaked_examples_dev[] and overwrite existing thumbnails.
for (let j = 0; j < process.argv.length; j++) {
    if (process.argv[j] == '--dev') {
        dev_mode = true;
    }
}

grab_all_examples();
