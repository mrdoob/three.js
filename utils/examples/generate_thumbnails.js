/*
    @author callumprentice - https://callum.com (2019-11)

    Generates thumbnails for an alternative version
    of the three.js examples page.

    Requirements:
        Node 10.16
        Npm 6.13
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

async function grab_shot(filename_base, thumb_dir, tweak) {
    const browser = await puppeteer.launch({
        defaultViewport: {
            width: screenshot_width,
            height: screenshot_height
        }
    });

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

    console.log('Pausing for', delay_ms, 'ms');
    await new Promise((resolve, reject) => {
        setTimeout(() => resolve(), delay_ms);
    });
    console.log('    Pause complete');

    console.log('Taking screenshot');
    const shot_path = './' + filename_base + '_shot.png';
    await page.screenshot({path: shot_path});
    console.log('    Screenshot taken');

    console.log('Creating thumbnail size', thumbnail_width, ' x', thumbnail_height, ' in', thumb_dir);
    const thumb_path = thumb_dir + '/' + filename_base + '.jpg';
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

    console.log('Removing initial shot:', shot_path);
    fs.unlink(shot_path, err => {
        if (err) {
            console.error(err);
            return;
        }
    });
    console.log('    Initial shot removed');

    return shot_path;
}

async function grab_example(filename_base, thumb_dir, tweak) {
    await grab_shot(filename_base, thumb_dir, tweak);
}

async function grab_from_js(js_filename, thumb_dir) {
    var data = fs.readFileSync(js_filename);
    const script = new vm.Script(data);
    script.runInThisContext();

    var num_examples = 0;
    for (var key in files) {
        var section = files[key];

        for (var i = 0; i < files[key].length; ++i) {
            num_examples++;
        }
    }
    var example_count = 1;
    for (var key in files) {
        var section = files[key];

        for (var i = 0; i < files[key].length; ++i) {
            const filename_base = files[key][i];

            const tweak = {};

            console.log(
                '\n(',
                example_count,
                '/',
                num_examples,
                ') Grabbing shot of',
                filename_base,
                'with tweak',
                tweak
            );

            await grab_example(filename_base, thumb_dir, tweak);

            ++example_count;
        }
    }
}

var thumb_dir = '../../examples/thumbs/';
if (!fs.existsSync(thumb_dir)) {
    fs.mkdirSync(thumb_dir);
}

// grab everything using list of examples in files.js
//grab_from_js('../../examples/files.js', thumb_dir);

// run through the 'troublesome' ones and regrab with appropriate 'tweak'
(async () => {
    await grab_example('webaudio_orientation', thumb_dir, {click: 'button', delay: 2500});
    await grab_example('webaudio_visualizer', thumb_dir, {click: 'button', delay: 2500});
    await grab_example('webaudio_timing', thumb_dir, {click: 'button', delay: 2500});
    await grab_example('webaudio_sandbox', thumb_dir, {click: 'button', delay: 2500});
    await grab_example('webgl_materials_video', thumb_dir, {click: 'button', delay: 2500});

    await grab_example('webgl2_materials_texture2darray', thumb_dir, {delay: 5000});
    await grab_example('webgl_animation_multiple', thumb_dir, {delay: 5000});
    await grab_example('webgl_loader_3mf_materials', thumb_dir, {delay: 5000});
    await grab_example('webgl_loader_collada_kinematics', thumb_dir, {delay: 5000});
    await grab_example('webgl_loader_collada_skinning', thumb_dir, {delay: 5000});
    await grab_example('webgl_animation_multiple', thumb_dir, {delay: 5000});
    await grab_example('webgl_loader_draco', thumb_dir, {delay: 5000});
    await grab_example('webgl_loader_fbx', thumb_dir, {delay: 5000});
    await grab_example('webgl_loader_gltf', thumb_dir, {delay: 7000});
    await grab_example('webgl_loader_gltf_extensions', thumb_dir, {delay: 7000});
    await grab_example('webgl_loader_imagebitmap', thumb_dir, {delay: 5000});
    await grab_example('webgl_loader_lwo', thumb_dir, {delay: 5000});
    await grab_example('webgl_loader_mmd', thumb_dir, {delay: 5000});
    await grab_example('webgl_loader_mmd_audio', thumb_dir, {delay: 7000});
    await grab_example('webgl_loader_vrm', thumb_dir, {delay: 7000});
    await grab_example('webgl_loader_x', thumb_dir, {delay: 5000});
    await grab_example('webgl_materials_cars', thumb_dir, {delay: 5000});
    await grab_example('webgl_materials_envmaps_parallax', thumb_dir, {delay: 5000});
    await grab_example('webgl_materials_translucency', thumb_dir, {delay: 7000});
    await grab_example('webvr_cubes', thumb_dir, {delay: 5000});
})();
