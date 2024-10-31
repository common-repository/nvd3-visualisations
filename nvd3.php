<?php
/*
Plugin Name: NVD3 Visualisations
Plugin URI: http://wordpress.org/extend/plugins/nvd3-visualisations/
Description: Draw business class interactive charts from many type of data sources.
Version: 2.4
Author: Jouni Santara
Organisation: TERE-tech ltd
Author URI: http://www.linkedin.com/in/santara
License: GPL2
  */

// Global of currently active CMS system, set: "wordpress" or "drupal".
$cms = 'wordpress';

if ($cms == 'wordpress') {
  require_once "wordpress/init.php";
}
else {
  require_once "drupal/init.php";
}

/**
 * Finding root directory for all JavaScript + major included libs.
 */
function nvd3_visualisations_myroot($cms) {
  if (!$cms) {
    $cms = 'wordpress';
  }
  nvd3_visualisations_write_headers($cms);
  nvd3_visualisations_set_root_dir($cms);
}
if ($cms == "wordpress") {
  add_shortcode("rootDir", "nvd3_visualisations_myroot");
  add_shortcode("loadNVD3", "nvd3_visualisations_myroot");
}

/**
 * Generating list or including all external libs and files.
 */
function nvd3_visualisations_write_headers($cms) {

  // This call does CMS specific things (eq Drupal/WordPress).
  return nvd3_visualisations_startup($cms);
}
/*
Uncomment next line & get lib files above on *every* WordPress blog's page/post.
add_action('wp_head', 'nvd3_visualisations_write_headers');

To make it faster libs NOT included on page/post with no charts & call to [loadNVD3] mandatory.
 */

/**
 * Generating of example charts gallery on WordPress.
 */
function nvd3_visualisations_gallery_wp($data) {
  // Libs for UX.
  $root = plugins_url() . '/nvd3-visualisations/lib/';
  echo '<!-- Start of Libs for NVD3 Visualisations -->';
  if (!$data['mode'] || $data['mode'] == 'local') {
    // Local libs.
    echo '<link rel="stylesheet" href="' . $root . 'styles/jquery-ui.css">';
    echo '<script src="' . $root . 'jquery-1.11.2.js"></script>';
    echo '<script src="' . $root . 'jquery-ui.js"></script>';
  } else {
    // Cloud's external libs.
    echo '<link rel="stylesheet" href="//code.jquery.com/ui/1.11.1/themes/smoothness/jquery-ui.css">';
    echo '<script src="//code.jquery.com/jquery-1.11.2.js"></script>';
    echo '<script src="//code.jquery.com/ui/1.11.4/jquery-ui.js"></script>';
  }
  echo '<!-- End of Libs -->';

  nvd3_visualisations_myroot('wordpress');
  $root = nvd3_visualisations_set_root_dir('wordpress');
  echo '<script src="' . $root . 'lib/jscolor.js"></script>';
  echo '<script src="' . $root . 'examples/gallery.js"></script>';

  $backgrounds = nvd3_visualisations_picts('wp-content/plugins/nvd3-visualisations/backgrounds/');

  echo '<span id="mycharts"></span>';
  echo '<script> nvd3Charter("mycharts", ' . $backgrounds  . '); </script>';
}
nvd3_visualisations_shortcode("NVD3Picker", "nvd3_visualisations_gallery_wp");
nvd3_visualisations_shortcode("demosGallery", "nvd3_visualisations_gallery_wp");
nvd3_visualisations_shortcode("Charts_Gallery", "nvd3_visualisations_gallery_wp");
/*
  add_shortcode("NVD3Picker", "nvd3_visualisations_gallery_wp");
  add_shortcode("demosGallery", "nvd3_visualisations_gallery_wp");
 */

 /**
 * Listing all available background picts for charts.
 */
 function nvd3_visualisations_picts($dir) {
  $files = scandir($dir);
  return json_encode($files); 
 }
 
/**
 * Generating of old charts gallery (table).
 */
function nvd3_visualisations_demo_charts($data) {
  nvd3_visualisations_write_headers(0);
  $skeleton = nvd3_visualisations_demo_containers();
  // How many demos to show.
  $count = $skeleton["count"];
  $root = nvd3_visualisations_set_root_dir('wordpress');
  echo '<script src="' . $root . 'examples/gallery.js"></script>';

  // $count = 11;
  if ($data['count']) {
    $count = $data['count'];
  }
  $xmldemo = 0;
  if ($data['xmldemo'] == 'true' || $data['xmldemo'] == 1) {
    $xmldemo = 1;
  }
  return $skeleton["places"] . '<script> nvd3Demos(' . $count . ', ' . $xmldemo . '); </script>';
}
nvd3_visualisations_shortcode("demosGallery_old", "nvd3_visualisations_demo_charts");
/*
  add_shortcode("demosGallery_old", "nvd3_visualisations_demo_charts");
 */

/**
 * Old gallery's container table.
 */
function nvd3_visualisations_demo_containers() {

  $html = '<style type="text/css" media="screen">';
  $html .= '.demo_nvd3 {vertical-align:bottom;} ';
  $html .= '.odds_nvd3 {background-color:#FFEBCD;} ';
  $html .= '.title_nvd3 {color: navy; text-shadow:2px 2px darkgray;} ';
  $html .= '</style>';

  $html .= '<table><tbody><tr class="demo_nvd3">';
  $html .= '<td id="chart1" class="odds_nvd3"></td>';
  $html .= '<td id="chart2"></td>';
  $html .= '</tr><tr class="demo_nvd3">';
  $html .= '<td id="chart3"></td>';
  $html .= '<td id="chart4" class="odds_nvd3"></td>';
  $html .= '</tr><tr class="demo_nvd3">';
  $html .= '<td id="chart5" class="odds_nvd3"></td>';
  $html .= '<td id="chart6"></td>';
  $html .= '</tr><tr class="demo_nvd3">';
  $html .= '<td id="chart7"></td>';
  $html .= '<td id="chart8" class="odds_nvd3"></td>';
  $html .= '</tr><tr class="demo_nvd3">';
  $html .= '<td id="chart9" class="odds_nvd3"></td>';
  $html .= '<td id="chart10"></td>';
  $html .= '</tr><tr class="demo_nvd3">';
  $html .= '<td id="chart11"></td>';
  $html .= '<td id="chart12" class="odds_nvd3"></td>';
  $html .= '</tr></tbody></table>';

  // Count of cells + their demos.
  return array("count" => 12, "places" => $html);
  // Demos - END.
}

/**
 * Filtering of direct data points, their labels, links, and series in uniform manner on WordPress.
 *
 * This is used if direct input is given from WP's shortcode.
 */
function nvd3_visualisations_filter_in($x, $name, $quotes) {

  $x = trim($x);
  $sep = ",";
  // rule: tab => ","
  if (strpos($x, "\t") > -1) {
    $x = str_replace("\t", $sep, $x);
  }
  // rule: ";" => ","
  if (strpos($x, ";") > -1) {
    $x = str_replace(";", $sep, $x);
  }
  // Automatic quotes of array elements: "x","y", etc.
  if ($quotes && strpos($x, "'") === FALSE && strpos($x, '"') === FALSE) {
    $x = '"' . str_replace($sep, '"' . $sep . '"', $x) . '"';
  }
  if (!strpos($x, "javascript:")) {
    $x = str_replace("(", " ", $x);
    $x = str_replace(")", " ", $x);
  }
  // Build valid JS array for JSON ready.
  $x = ' ' . $name . ':[' . $x . '] ';

  return $x;
}

/**
 * Check required external libs + links for them.
 */
function nvd3_visualisations_check_libs($data) {
  $root = plugins_url() . '/nvd3-visualisations/lib/';
  echo '<!-- Start of Libs for NVD3 Visualisations -->';
  if (!$data['mode'] || $data['mode'] == 'local') {
    // Local libs.
    echo '<link rel="stylesheet" href="' . $root . 'styles/jquery-ui.css">';
    echo '<script src="' . $root . 'jquery-1.11.2.js"></script>';
    echo '<script src="' . $root . 'jquery-ui.js"></script>';
  } else {
    // Cloud's external libs.
    echo '<link rel="stylesheet" href="//code.jquery.com/ui/1.11.1/themes/smoothness/jquery-ui.css">';
    echo '<script src="//code.jquery.com/jquery-1.11.2.js"></script>';
    echo '<script src="//code.jquery.com/ui/1.11.4/jquery-ui.js"></script>';
  }
  echo '<!-- End of Libs -->';
}

/**
 * API for whole shortcode [jsChart] on WordPress side.
 */
function nvd3_visualisations_new_chart($data) {

  nvd3_visualisations_check_libs($data);

  $id = mt_rand(10, 10000);
  // User's own defined ID of container.
  if ($data['id']) {
    $id = $data['id'];
  }
  // Default chart's type.
  $ctype = 'simpleline';
  if ($data['type']) {
    $ctype = $data['type'];
  }
  // Direct input values turns to options of input data.
  $values = '';
  // Input format: (1,2,3, ...).
  // @todo: ((1,2,3),(11,22,33), ...) direct input format.
  if ($data['values']) {
    // Special flag value of direct simple input set.
    $infile = 'foo';
    $values = nvd3_visualisations_filter_in($data['values'], 'values', FALSE);
    if ($data['labels']) {
      $values = $values . ', ' . nvd3_visualisations_filter_in($data['labels'], 'labels', TRUE);
    }
    if ($data['series']) {
      $values = $values . ', ' . nvd3_visualisations_filter_in($data['series'], 'series', TRUE);
    }
    if ($data['links']) {
      $values = $values . ', ' . nvd3_visualisations_filter_in($data['links'], 'links', TRUE);
    }
  }
  // Direct data coming from class (& ID's) of tags.
  elseif ($data['class']) {
    $values = ' class:"' . $data['class'] . '" ';
    // Object input: {id:"mytable", bgcolor:"blue"}.
    if (strpos($data['class'], 'id:') > 0) {
      $values = ' class:' . $data['class'] . ' ';
    }
    $infile = 'foo';
    // Direct data coming from  table.
  }
  elseif ($data['table']) {
    $values = ' table:"' . $data['table'] . '" ';
    $infile = 'foo';
  }

  // Default options for charts.
  $options = '';
  if ($data['options']) {
    $options = ', ###' . trim($data['options']);
    if ($values != '') {
      $values = $values . ',';
    }
    $options = str_replace('###{', '{' . $values . ' ', $options);
  }
  elseif ($infile = 'foo' && $values) {
    $options = ', { ' . $values . ' }';
    // End of direct input processing.
  }

  // Input data file name / relative path for it.
  if ($data['datafile']) {
    $infile = $data['datafile'];
    $infile = str_replace('../', '', $infile);
    $options = str_replace('}', ', infile:"' . $infile . '" }', $options);
  }

  // Default type of chart container.
  $container = 'div';
  // User's own choice.
  if ($data['container']) {
    $container = $data['container'];
  }
  // Default height of chart (must exist).
  $height = '250';
  // User's own choice.
  if ($data['height']) {
    $height = $data['height'];
  }
  // Default chart's width.
  $width = ' width:450';
  if ($data['width']) {
    $width = ' width:' . $data['width'];
  }
  // Background's color.
  $bgcolor = '';
  if ($data['backgroundcolor']) {
    $bgcolor = ' background-color:' . $data['backgroundcolor'] . ';';
  }
  $border = '';
  // Border's style around chart.
  if ($data['border']) {
    $border = ' border:' . $data['border'] . ';';
  }
  // Embed chart on right/left.
  $float = ' float:none; ';
  if ($data['float']) {
    if ($data['float'] == 'right' || $data['float'] == 'right') {
      $float = ' float:' . $data['float'] . ';';
      $container = 'span';
      // Borders not work well with span.
      $border = '';
    }
  }

  // Margins around charts.
  $margin = '';
  if ($data['margin']) {
    $margin = ' margin:' . $data['margin'] . '; ';
  }
  // Test if input is from JavaScript generated.
  $jsfunc = 0;
  if ($data['js']) {
    $jsfunc = 1;
  }
  $style = $float . $bgcolor . $border . $margin;
  $html = '<' . $container . ' id="chart' . $id . '" style="' . $style . ' ">';
  $html .= "<svg style='height:" . $height . "px;" . $width . "px;'/>";
  $html .= "</" . $container . ">";

  // File name to ext. data file is needed.
  if ($jsfunc == 0) {
    $infile = "'" . $infile . "'";
  }
  $js = "jsChart('" . $id . "', " . $infile . ", '" . $ctype
                  . "', {height:'" . $height . "', " . $width . "} " . $options . " );";
  $js_call = "<script>" . $js . "</script>";

  return $html . $js_call;
}
nvd3_visualisations_shortcode("jsChart", "nvd3_visualisations_new_chart");
/*
  add_shortcode("jsChart", "nvd3_visualisations_new_chart");
 */

/**
 * Print out data editor for a given data set on WordPress.
 */
function nvd3_visualisations_gen_editor($data) {

  // Hide editor from public if post is public.
  if (get_post_status() == 'publish') {
    return;
  }

  $owndata = $data["infile"];

  $ctype = $data["type"];

  $owndata = str_replace('../', '', $owndata);
  $chartdata = file_get_contents($owndata);  // plugins_url() . '/' . 

  $jscall = "saveData('xmlheader', 'dataset', '" . $owndata . "')";
  $json2xml = "dataConvert('json', 'jsonset', 'xmlset', '" . $ctype . "')";
  $xml2json = "dataConvert('xml', 'xmlset', 'jsonset', '" . $ctype . "')";
  $tsv2json = "dataConvert('tsv', 'jsonset', 'xmlset', '" . $ctype . "')";
  $csv2json = "dataConvert('csv', 'jsonset', 'xmlset', '" . $ctype . "')";
  $json2tsv = "json2tsv('jsonset')";

  $syntax = '';
  $syntaxedit = '';
  $converter = '';
  $convertbox = '';
  $jsondata = '';
  $xmldata = '';
  $header = '';
  if (strpos($owndata, '.json') || strpos($owndata, '.tsv') || strpos($owndata, '.csv')) {
    $syntaxedit = '<div class="nvd3_editor">Edit your data set here and check syntax of JSON.
    <iframe name="(c) 2013 Jos de Jong" src="http://www.jsoneditoronline.org/" width="100%" height="500"></iframe></div>';
    $syntax = 'JSON Editor';

    $converter = 'Data Converter';
    $jsondata = $chartdata;
  }
  if (strpos($owndata, '.xml')) {
    $header = explode("<root>", $chartdata);
    $chartdata = "<root>" . $header[1];
    $header = $header[0];

    $syntaxedit = '<div class="nvd3_editor">Edit your data set here and check syntax of XML.
    <iframe src="http://www.freeformatter.com/xml-formatter.html" width="100%" height="500"></iframe></div>';
    $syntax = 'XML Editor';

    $converter = 'Data Converter</sup>';
    $xmldata = $chartdata;
  }
  $msg = '<br /><p>Here is your new chart created by NVD3 Visualisations: <b>edit, publish & enjoy it!</b></p> ';
  // $datalink = 'Data File: <a href="'.$owndata.'" target="_blank"><b>'.$owndata.'</b></a>';
  $datatitle = 'Data File: ' . $owndata;
  /* Old ones.
  echo '<link rel="stylesheet" href="//code.jquery.com/ui/1.11.1/themes/smoothness/jquery-ui.css">';
  echo '<script src="//code.jquery.com/jquery-1.11.2.js"></script>';
  echo '<script src="//code.jquery.com/ui/1.11.4/jquery-ui.js"></script>';
   */
  // Return whole editor for a post/page
  return $msg . '<link rel="stylesheet" href="//code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css">
  <script src="//code.jquery.com/ui/1.10.4/jquery-ui.js"></script>
  <br />

  <script>
    $(function() { $( "#tabs" ).tabs(); });
  </script>

  <div id="tabs">
    <ul>
      <li><a href="#dataedit-1" title="' . $datatitle . '">Chart Data Set</a></li>
      <li><a href="#dataedit-2">' . $syntax . '</a></li>
      <li><a href="#dataedit-3">' . $converter . '</a></li>
    </ul>

  <div id="dataedit-1">
  <div class="nvd3_editor">
    <button onclick="' . $jscall . '" style="cursor:pointer" title="Update file: ' . $owndata . '">Save Data & Refresh Chart</button><br />
    <textarea id="dataset" class="nvd3_editor_text" cols="70" rows="240">
      ' . $chartdata . '
    </textarea>
    <span id="xmlheader" style="display: none;">' . $header . '</span>
  </div>
  </div>

  <div id="dataedit-2">
    ' . $syntaxedit . '
  </div>

  <div id="dataedit-3">
  <textarea id="jsonset" class="nvd3_editor_text" cols="40" rows="240">
    ' . $jsondata . '
  </textarea>
  <br />
  <button onclick="' . $json2xml . '" style="cursor:pointer">JSON to XML</button>
  <button onclick="' . $xml2json . '" style="cursor:pointer">XML to JSON</button>
  <br />
  <button onclick="' . $tsv2json . '" style="cursor:pointer" title="Data columns separated by TABs">TSV to JSON</button>
  <button onclick="' . $csv2json . '" style="cursor:pointer" title="Data columns separated by ; or , letters">CSV to JSON</button>
  <br />
  <textarea id="xmlset" class="nvd3_editor_text" cols="40" rows="240">
    ' . $xmldata . '
  </textarea>
  </div>

  </div>
  ';
}
nvd3_visualisations_shortcode("dataEditor", "nvd3_visualisations_gen_editor");
/*
  add_shortcode("dataEditor", "nvd3_visualisations_gen_editor");
 */
