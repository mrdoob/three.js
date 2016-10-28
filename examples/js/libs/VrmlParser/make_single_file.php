<?php
/**
 * This builds a single *.wrl (VRML) file from files that previously used
 * Inline nodes to include seperates files.
 *
 * The output file is named after the input file, using a prefix of single_.
 *
 * For example house.wrl will become single_house.wrl.
 *
 * The Inline nodes specify a url that is relative to the file being read.
 * Therefore, while descending down the file tree, the relative path must be
 * respected in order to load the correct wrl content in lieu of the Inline node.
 *
 * Usage:
 * php make_single_file.php filepath [output_path] (convert a file)
 * php make_single_file.php help (display this help text)
 *
 * The filepath is required. This is the path to the root *.wrl file, the file
 * that includes all other Inline wrl files.
 *
 * The output_path is optional. If you omit this argument, the output file will be written
 * in the same directory where the input file lives.
 *
 * @author Bart McLeod (mcleod@spaceweb.nl)
 * @since 18-10-13 13:04
 */

if (!isset($argv[1])) {
    throw new DomainException('The first argument is required and must specify the input *.wrl file.');
}

$rootFile = $argv[1];

if (!file_exists($rootFile)) {
    throw new DomainException('The input file does not exist or is not accessible.');
}

$outputPath = isset($argv[2]) ? $argv[2] : dirname($rootFile);

if (false !== $outputPath && !is_dir($outputPath)) {
    throw new DomainException('The second argument must be a path to a directory. The specified path is not a directory.');
}

if (false !== $outputPath && !is_writable($outputPath)) {
    throw new DomainException('The specified output directory is not writable.');
}

$outputFile = $outputPath . '/single_' . basename($rootFile);


function replace_wrl($file) {
    $path = dirname($file);
    $content = file_get_contents($file);

    // disable animations for now, because the VRMLLoader of 3 js will choke on it if there is a rotation in it, thinking it is a rotation inside a transform
    // $content = str_replace('ROUTE', '#ROUTE', $content);
    // remove vrml header
    $content = str_replace('#VRML V2.0 utf8', '', $content);

    // @todo: this code will also include Inline wrl files that are commented out (if the files can be found), it might be hard to keep those out.
    $content = preg_replace_callback(
        '/Inline\s?{\s+?url\s+?\["([^"]*)"\]\s+?}/i',
        function($matches) use ($path) {
            $filename =  $matches[1];
//            if ($filename === 'boven/boven.wrl') {
//                echo PHP_EOL, "Skipped boven", PHP_EOL;
//                return;
//            }
//            if ($filename === 'beneden/beneden.wrl') {
//                echo PHP_EOL, "Skipped beneden", PHP_EOL;
//                return;
//            }
            $output = replace_wrl($path . DIRECTORY_SEPARATOR . $filename);
            // mark beginning and end of original include with the filename
            $output = '# ' . $filename . PHP_EOL . PHP_EOL . $output . PHP_EOL . PHP_EOL . '# /' . $filename;
            return $output;
        }
        ,
        $content
    );

    return $content;
};


$content = '#VRML V2.0 utf8' . PHP_EOL . replace_wrl($rootFile);
file_put_contents($outputFile, $content);

echo 'Conversion of ' . $rootFile . ' succeeded, the file was written to ' . $outputFile, PHP_EOL, 0;
