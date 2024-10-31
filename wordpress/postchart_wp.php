<?php
/**
 * @file
 * Create post/page from charts gallery's generated input request on WordPress.
 *
 * Inputs: type of new chart & URL path to the file of data set.
 */
 
// All WordPress functions active.
// require_once('../../../wp-load.php');

// User's role & level check.
$cabs = 0;
if (!is_user_logged_in()) {
  echo '<script>alert("Sorry, you must be logged in for creating new charts.")</script>';
  return;
}

global $current_user;
get_currentuserinfo();

$role = $current_user -> roles[0];
$role = $role == 'author'  || $role == 'editor' || $role == 'administrator';
$cabs = $current_user -> allcaps;
$postable = $cabs[level_2] || $cabs[level_3] || $cabs[level_4];

$rightsok = 0;
// High enough role or high enough levels exist.
if ($role || $postable) {
  $rightsok = 1;
}
if (!$rightsok) {
  echo '<script>alert("Sorry, your user rights are not enough to create & edit new charts (you need at least rights of Author and you are now: ' . json_encode($current_user -> roles) . ').")</script>';
  return;
}

$role = $current_user -> roles[0];
$rightsok = $role == 'editor' || $role == 'administrator';
if ($posttype == 'page') {
  // High enough role for edit pages.
  if (!$rightsok)  {
    echo '<script>alert("Sorry, your user rights are not enough to create & edit pages of blog (you need at least rights of Editor and you are now: ' . json_encode($current_user -> roles) . ').")</script>';
    return;
  }
}

/**
 * Generating new chart from data set on the back-end side.
 */
function nvd3_visualisations_build_new_chart($opts, $dataset) {

$posttype = $opts['new'];
$ctype = $opts['type'];
$filepath = $opts['filepath'];
$template = $opts['template'];

$all_options = array();
// $changer = '":' . $opts['chartNro'];
$array_nro = (string) $opts['chartNro'];
foreach ($opts['opts'] as $key => $val) {
  $all_options[substr($key, 0, strpos($key, $array_nro))] = $val;
}
// return json_encode($all_options);

if ($opts['template'] == 'url') {
  $curl = curl_init($filepath);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.10 (KHTML, like Gecko) Chrome/8.0.552.224 Safari/534.10');
  $dataset = curl_exec($curl);
  curl_close($curl);
  $filepath = explode('/', $filepath);
  $filepath = $filepath[count($filepath) - 1];
//  return $dataset; // json_encode($filepath) . $filepath[count($filepath) - 1];
  $owndata = nvd3_visualisations_copy_ex($dataset, $filepath, '../../../charts_nvd3/');
//  echo $data_set;
//  return;
}
elseif ($filepath) {
  // Input from templates of gallery.
  $owndata = nvd3_visualisations_copy_ex($dataset, $filepath, '../../../charts_nvd3/');
}
elseif ($template) {
  // Direct input from document's cells case (elements & html tables).
  $direct = nvd3_visualisations_gen_template($template);
  $owndata = '';
}

// New Post/Page content built next from up -> down in html.
$title = 'Own Data Chart: ' . $ctype;
$scolor = ' "Black" ';
$xaxis = ' xaxis:{ hide:false, labels:[] } ';
$labels = '"A,B,C"';

$mode = " mode='local'";
if (strpos(plugins_url(), 'localhost:') == FALSE) {
  $mode = " mode='remote'";
}

$trend_line = 'false ';
if ($opts['trends'] == 1) { // $ctype != 'discretebar' && $ctype != 'multibar') {
  $trend_line = 'true ';
}

$calculator = '';
if ($opts['calculator'] == 1) {
  $scaler = '"*1"';
  $ctitle = '"Calculate:"';
  $cunit = '"unit"';
  $calculator = "calculator:" . $scaler . ", calculatortitle:" . $ctitle . ", calculatorunit:" . $cunit . ",  calculatorlock:false, calculatorhide:false, ";
}
/*
$shortcodes = "[loadNVD3] <br /> [jsChart type='" . $ctype . "' datafile='" . $owndata . "' " . $direct . " height=250  width=450 float='none' border='3px outset gray' backgroundcolor='darkgray' options='{shadows:" . $scolor . ", showLegend: true, tooltips:true, showControls:true, noPopup:false, noResize:false, title:" . $title . ", chartpicker:true, exports:false, autocoloring:true, xaxis:{ hide:false, style:\"font-size:10px; fill:navy\", transform:\"rotate(0 -20,0)\" }, yaxis:{ style:\"font-size:12px; fill:blue\", transform:\"rotate(0 -20,0)\"  }, " . $calculator . " trendLine:" . $trend_line . "}' " . $mode . "] ";

noPopup:false, noResize:false, title:" . $title . ", xaxis:{ hide:false, style:\"font-size:10px; fill:navy\", transform:\"rotate(0 -20,0)\" }, yaxis:{ style:\"font-size:12px; fill:blue\", transform:\"rotate(0 -20,0)\"  }, 

{"colors":"red,green,blue,#FFFF00","backgroundimage":"http:\/\/localhost:40769\/wp-content\/plugins\/nvd3-visualisations\/data\/..\/backgrounds\/sky.jpg","chartPicker":"1","showControls":"1","toolTips":"1","showLegend":"1","calculator":"0","trendLine":"0","autoColors":"1","exports":"1","shadows":"Black","gmenu":"post","gformat":"json"}

*/
// $all_options

$height = 250;
$width = 450;
if ($all_options['height'] && $all_options['width']) {
  $height = $all_options['height'];
  $width = $all_options['width'];
}

$bcolor = 'darkgray';
if ($opts['opts']['backgroundcolor']) {
  $bcolor = $opts['opts']['backgroundcolor'];
}

// Missing options from JS options data from GUI.

$all_options['noPopup'] = "1";
if ($all_options['Popup'] == 1) {
  $all_options['noPopup'] = "0";
}
$all_options['inPopup'] = false;

$all_options['noResize'] = true;
$all_options['title'] = $title;

$all_options['xaxis'] = array(
  'hide'      => FALSE,
  'style'     => "font-size:10px; fill:navy",
  'transform' => "rotate(0 -20,0)",
);
$all_options['yaxis'] = array(
  'hide'      => FALSE,
  'style'     => "font-size:12px; fill:blue",
  'transform' => "rotate(0 -20,0)",
);

// return json_encode($all_options);

$shortcodes = "[loadNVD3] <br /> [jsChart type='" . $ctype . "' datafile='" . $owndata . "' " . $direct . " height=" . $height . "  width=" . $width . " float='none' border='3px outset gray' backgroundcolor='" . $bcolor . "' options='" . json_encode($all_options) . "' " . $mode . "] ";

$datacells = '';
$editarea = '<br />[dataEditor type="' . $ctype . '" infile="' . $owndata . '"]';
// No file editor for templates inside doc.
if ($direct) {
  $editarea = '';

  // Template of table with its id (@todo: autocoloring fix).
  if ($template == 'table') {
    $datacells = nvd3_visualisations_get_help('table') . '<p><b>Example Array</b><br />' . nvd3_visualisations_get_array('mypets') . '</p>';
  }
  // Template of 2x2 table with its id.
  if ($template == 'table2') {
    $datacells = nvd3_visualisations_get_help('table2') . '<p><b>Example Array</b><br />' . nvd3_visualisations_get_big_array('mypets') . '</p>';
  }
  // Template of separate doc's data cells with their class & id tags.
  if ($template == 'cells') {
    $datacells = nvd3_visualisations_get_help('cells') . '<br /><p><h4>Draw a Chart from Normal Text</h4><br />I have <b id="Cats" class="mypets">14</b> cats and <span id="Cows" class="mypets">2</span> cows plus <b id="Birds" class="mypets">11</b> birds at my home as pets.</p>';
  }
  // Template of separate doc's data cells with their class & id tags.
  if ($template == 'direct') {
    $datacells = nvd3_visualisations_get_help('direct');
  }
  $datacells .= '<br />';
}

$my_post = array(
  'post_title'    => $ctype . ' chart',
  'post_content'  => $datacells . $shortcodes . $editarea,
  'post_status'   => 'draft',
  'post_type'     => $posttype,
  'tags_input'    => array('NVD3', 'charts', 'SVG'),
);

// Insert the post into the database.
$error = wp_insert_post($my_post);
/*
echo json_encode($error);
return;
*/
if ($error == 0) {
  return 'You were denied to publish NVD3 chart - contact admin of blog !';
}
else {
//  $msg = 'Done! You are moving next to see chart automatically. If not, click here: ';
  return nvd3_visualisations_link_chart($error, $posttype); // $msg . nvd3_visualisations_move2js($error, $posttype);
}

return;
}

/**
 * Build a link to the new post/page of WP.
 */
function nvd3_visualisations_link_chart($post, $type) {
  if ($type == 'post') {
    $post = 'p=' . $post;
  }
  else {
    $post = 'page_id=' . $post;
  }
  $link = $post . '&preview=true';
  return site_url() . '?' . $link;
/*
  echo '<script> window.location.href="' . $link . '"; </script>';
  return '<a href="' . $link . '"> OPEN NEW CHART </a>';
  */
}

/**
 * Automatic redirecting to the new publication of chart.
 */
/*
function nvd3_visualisations_move2js($post, $type) {

  if ($type == 'post') {
    $post = 'p=' . $post;
  }
  else {
    $post = 'page_id=' . $post;
  }
  $link = '../../../?' . $post . '&preview=true';
  echo '<script> window.location.href="' . $link . '"; </script>';

  return '<a href="' . $link . '"> OPEN NEW CHART </a>';
}
*/

/**
 * Generating all direct data examples for shortcode.
 */
function nvd3_visualisations_gen_template($type) {

  if ($type == 'direct') {
    $values = ' values="(177,77,17)" ';
    $labels = ' labels="(cats,dogs,birds)" ';
    $series = ' series="(Pets)" ';
    $links = ' links="http://en.wikipedia.org/wiki/Cat,http://en.wikipedia.org/wiki/Dog,javascript:window.alert(17)" ';
    return $values . $labels . $series . $links;
  }
  if ($type == 'table' || $type == 'table2') {
    return ' table="mypets" ';
  }
  if ($type == 'cells') {
    return ' class="mypets" ';
  }
}

