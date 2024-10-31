<?php
/**
 * @file
 * Containing all Drupal 7 specific functions.
 */

/**
 * Setting & returning all used external libraries for module.
 */
function nvd3_visualisations_startup($cms) {
    nvd3_visualisations_set_root_dir($cms);
    $root = '../' . drupal_get_path('module', 'nvd3_visualisations') . '/';
    $libs = array(
      $root . 'xml2json.js',
      $root . 'json2xml.js',
      $root . 'tsv2json.js',
      $root . 'colorbrewer.js',
      $root . 'locale.js',
      $root . 'wpcharts.js',
      /* Uncomment if you download NVD3 locally.
         $root . 'lib/styles/nv.d3.css',
         $root . 'lib/nv.d3.min.js',
       */
      // Use next for further development work.
      // $root . 'lib/nv.d3.js',
      $root . 'examples/gallery.js',
      // Uncomment next to use local copy of D3 lib.
      // $root . 'lib/d3.min.js', 
    );
    // External 3rd party lib of frameworks & styles, comment if you download local into your lib/ folder.
    echo '<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>';
    echo '<link type="text/css" rel="stylesheet" href="http://tere-tech.eu/nvd3/nv.d3.css" media="all">';
    echo '<script src="http://tere-tech.eu/nvd3/nv.d3.min.js"></script>';
    // List of libs ready for Drupal.
    return $libs;
 }

/**
 * Setting root path for CMS and JavaScript environments.
 */
function nvd3_visualisations_set_root_dir($cms) {

  global $user;
  $my_k = "0";
  if ($user)  {
    if ($user->uid > 0) {
      $my_k = md5($user->created);
    }
  }
  $path = '../' . drupal_get_path('module', 'nvd3_visualisations') . '/';

  $js = ' console.info(' . json_encode($user) . ') ';
  // Set globals for JavaScript use.
  $jsroot = $path . 'data/';
  echo '<script>rootpath = "' . $jsroot . '"; cms = "' . $cms . '"; u_id = "' . 
    $user->uid . '"; u_k="' . $my_k . '"</script>';

  return $path;
}

/**
 * Fake shortcode function for Drupal: doing nothing.
 */
function nvd3_visualisations_shortcode($wp_shortcode, $func_name) {
  return;
}