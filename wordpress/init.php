<?php
/**
 * @file
 * Containing all Wordpress specific functions.
 */
 
 /**
 * Setting all used external libraries for WP's plugin.
 */
function nvd3_visualisations_startup($cms) {
  // Single, MU-site, and SSL setups of WP (http://codex.wordpress.org/Function_Reference/plugins_url).
  $root = plugins_url() . '/nvd3-visualisations/';

  $incs = '<!-- Start of NVD3 -->';

  // Comment then the next one.
  $incs = $incs . '<script src="' . $root . 'lib/d3.min.js"></script>';
  // NVD3.js lib.
  $incs = $incs . '<link href="' . $root . 'lib/styles/nv.d3.css" rel="stylesheet" type="text/css">';

  // Comment this line if you need to develop NVD3 core lib.
  $incs = $incs . '<script src="' . $root . 'lib/nv.d3.min.js"></script>';
  /*
  Activate & edit this source file.
  $incs = $incs . '<script src="'.$root.'nv.d3.js"></script>';
   */

  // Used for XML data sets reading.
  $incs = $incs . '<script src="' . $root . 'xml2json.js"></script>';
  // Used for JSON -> XML conversions.
  $incs = $incs . '<script src="' . $root . 'json2xml.js"></script>';
  // Used for TSV -> JSON converting tool.
  $incs = $incs . '<script src="' . $root . 'tsv2json.js"></script>';

  // Predefined pretty coloring sets of palettes.
  $incs = $incs . '<script src="' . $root . 'colorbrewer.js"></script>';

  // NVD3 Visualisations main routines.
  $incs = $incs . '<script src="' . $root . 'locale.js"></script>';
  $incs = $incs . '<script src="' . $root . 'wpcharts.js"></script>';

  global $current_user;
  get_currentuserinfo();
  if ($current_user->ID) {
    $incs = $incs . '<script>u_id = ' . $current_user->ID . '</script>';
  } else {
    $incs = $incs . '<script>u_id = 0</script>';
  }
  $incs = $incs . '<script>u_k = 0</script>';

  $incs = $incs . '<!-- End of NVD3 -->';

  echo $incs;
  return 1;
}

/**
 * Setting root path for CMS and JavaScript environments.
 */
function nvd3_visualisations_set_root_dir($cms) {

  $path = plugins_url() . '/nvd3-visualisations/';

  // Set globals for JavaScript use.
  $jsroot = $path . 'data/';
  echo '<script>rootpath = "' . $jsroot . '"; cms = "' . $cms . '"</script>';

  return $path;
}

/**
 * Setting shortcodes on WordPress.
 */
function nvd3_visualisations_shortcode($wp_shortcode, $func_name) {
  add_shortcode($wp_shortcode, $func_name);
}