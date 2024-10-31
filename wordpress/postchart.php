<?php
/**
 * @file
 * Create post/page from charts gallery's generated input request on WordPress.
 *
 * Inputs: type of new chart & URL path to the file of data set.
 */

// All WordPress functions active.
require_once('../../../wp-load.php');

// User's role & level check.
$cabs = 0;
if (!is_user_logged_in()) {
  echo 'Sorry, you must be logged in for creating new charts.';
  return;
}

global $current_user;
get_currentuserinfo();

$role = $current_user->roles[0];
$role = $role == 'author'  || $role == 'editor' || $role == 'administrator';
$cabs = $current_user->allcaps;
$postable = $cabs[level_2] || $cabs[level_3] || $cabs[level_4];

$rightsok = 0;
// High enough role or high enough levels exist.
if ($role || $postable) {
  $rightsok = 1;
}
if (!$rightsok) {
  echo 'Sorry, your user rights are not enough to create & edit new charts (you need at least rights of Author and you are now: ' . json_encode($current_user->roles) . ').';
  return;
}

$role = $current_user->roles[0];
$rightsok = $role == 'editor' || $role == 'administrator';
if ($posttype == 'page') {
  // High enough role for edit pages.
  if (!$rightsok)  {
    echo 'Sorry, your user rights are not enough to create & edit pages of blog (you need at least rights of Editor and you are now: ' . json_encode($current_user->roles) . ').';
    return;
  }
}

// Old one: 'wp-content/plugins/nvd3-visualisations/'.
$root = plugins_url() . '/nvd3-visualisations/';

$posttype = 'post';
if ($_GET['new']) {
  $posttype = $_GET['new'];
}
$dataset = $root . 'data/simpleLineData.json';
if ($_GET['filepath']) {
  $dataset = $root . 'data/' . $_GET['filepath'];
}
$ctype = 'simpleline';
if ($_GET['type']) {
  $ctype = $_GET['type'];
}
$direct = '';
$filepath = $_GET['filepath'];
$template = $_GET['template'];
if ($filepath) {
  $owndata = nvd3_visualisations_copy_ex($dataset, $filepath, '../../../charts_nvd3/');
  // Direct input from document's cells case.
}
elseif ($template) {
  $direct = nvd3_visualisations_gen_template($template);
  $owndata = '';
}

// New Post/Page content built next from up -> down.
$title = '"Own Data Chart"';
$scolor = ' "Black" ';
$scaler = '"*1"';
$ctitle = '"Calculate:"';
$cunit = '"unit"';
$xaxis = ' xaxis:{ hide:false, labels:[] } ';
$labels = '"A,B,C"';

$shortcodes = "[loadNVD3] <br /> [jsChart type='" . $ctype . "' datafile='" . $owndata . "' " . $direct . " height=250  width=450 float='none' border='3px outset gray' backgroundcolor='darkgray' options='{ shadows:" . $scolor . ", showLegend: true, tooltips: true, showControls: true, noPopup: false, noResize: false, title: " . $title . ", chartpicker:true, exports:false, autocoloring:true, calculator:" . $scaler . ", calculatorlock:false, calculatorhide:false, calculatortitle:" . $ctitle . ", calculatorunit:" . $cunit . ",  xaxis:{ hide:false, style:\"font-size:10px; fill:navy\", transform:\"rotate(0 -20,0)\" }, yaxis:{ style:\"font-size:12px; fill:blue\", transform:\"rotate(0 -20,0)\"  }  }' ] ";

$datacells = '';
$editarea = '<br />[dataEditor type="' . $ctype . '" infile="' . $owndata . '"]';
// No file editor for templates inside doc.
if ($direct) {
  $editarea = '';

  // Template of table with its id (@todo: autocoloring fix).
  if ($_GET['template'] == 'table') {
    $datacells = nvd3_visualisations_get_help('table') . '<p><b>Example Array</b><br />' . nvd3_visualisations_get_array('mypets') . '</p>';
  }
  // Template of 2x2 table with its id.
  if ($_GET['template'] == 'table2') {
    $datacells = nvd3_visualisations_get_help('table2') . '<p><b>Example Array</b><br />' . nvd3_visualisations_get_big_array('mypets') . '</p>';
  }
  // Template of separate doc's data cells with their class & id tags.
  if ($_GET['template'] == 'cells') {
    $datacells = nvd3_visualisations_get_help('cells') . '<p><b>Example Sentence + its Live Data</b><br />I have <span id="Cats" class="mypets">14</span> cats and <span id="Cows" class="mypets">2</span> cows plus <span id="Birds" class="mypets">11</span> birds at my home as pets.</p>';
  }
  // Template of separate doc's data cells with their class & id tags.
  if ($_GET['template'] == 'direct') {
    $datacells = nvd3_visualisations_get_help('direct');
  }
  $datacells .= '<br />';
}

$my_post = array(
  'post_title'    => 'NVD3 Chart',
  'post_content'  => $datacells . $shortcodes . $editarea,
  'post_status'   => 'draft',
  'post_type'     => $posttype,
  'tags_input'    => array('NVD3', 'charts', 'SVG'),
);

// Insert the post into the database.
$error = wp_insert_post($my_post);
if ($error == 0) {
  echo 'You were denied to publish NVD3 chart - contact admin of blog !';
}
else {
  $msg = 'Done! You are moving next to see chart automatically. If not, click here: ';
  echo $msg . nvd3_visualisations_move2js($error, $posttype);
}

return;

/**
 * Automatic redirecting to the new publication of chart.
 */
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

/**
 * Generating simple table example of direct data.
 */
function nvd3_visualisations_get_array($id) {

  return '
  <table id="' . $id . '">
  <tbody>
  <tr>
  <td></td>
  <td align="LEFT" bgcolor="#C5000B">Cats</td>
  </tr>
  <tr>
  <td align="LEFT" bgcolor="#66CC99">Year 2000</td>
  <td align="RIGHT" bgcolor="#C5000B">7</td>
  </tr>
  <tr>
  <td align="LEFT" bgcolor="#66CC99">Year 2005</td>
  <td align="RIGHT" bgcolor="#C5000B">2</td>
  </tr>
  <tr>
  <td align="LEFT" bgcolor="#66CC99">Year 2010</td>
  <td align="RIGHT" bgcolor="#C5000B">12</td>
  </tr>
  </tbody>
  </table>
  ';

}

/**
 * Generating 2x2 table example of direct data.
 */
function nvd3_visualisations_get_big_array($id) {

  return '
  <table id="' . $id . '"><tbody>
  <tr>
    <td height="17"></td>
    <td bgcolor="yellow">Cats</td>
    <td bgcolor="lime">Cows</td>
    <td bgcolor="blue">Birds</td>
  </tr>
  <tr>
    <td bgcolor="pink" height="17">Year 2000</td>
    <td bgcolor="yellow">7</td>
    <td bgcolor="lime">18</td>
    <td bgcolor="blue">1</td>
  </tr>
  <tr>
    <td bgcolor="pink" height="17">Year 2005</td>
    <td bgcolor="yellow">2</td>
    <td bgcolor="lime">9</td>
    <td bgcolor="blue">2</td>
  </tr>
  <tr>
    <td bgcolor="pink" height="17">Year 2010</td>
    <td bgcolor="yellow">12</td>
    <td bgcolor="lime">4</td>
    <td bgcolor="blue">3</td>
  </tr>
  </tbody></table>
  ';
}

/**
 * Printing out help of user based on asked direct data type.
 */
function nvd3_visualisations_get_help($type) {

  $t = '<b>Steps for Your Own Data</b><br />';

  $h = '';
  if ($type == 'table'  || $type == 'table2') {
    $h = $t . '<ol>
                  <li>Copy & Paste your table from <b>OpenOffice Calc</b> here.</li>
                  <li>Go HTML mode and copy ID of tiny example table below for your imported new table.</li>
                  <li>Remove example table & this text.</li>
                  <li>Check: that 2nd row colors of background of table are copied to chart properly from your table.</li>
                  <li>Refine the look by <b>autocoloring</b> option & edit rest of document normally ready + publish.</li>
               </ol><br />';
  }
  if ($type == 'cells') {
    $h = $t . '<ol>
                  <li>Write / copy your text content normally into this page.</li>
                  <li>Move to HTML mode and copy <b>span tag</b> from one number of example below.</li>
                  <li>Use this html to mark your own embedded numbers.</li>
                  <li>Update each ID to name your data cell as you wish.</li>
                  <li>Edit rest of document normally ready & publish it.</li>
               </ol><br />';
  }
  if ($type == 'direct') {
    $h = $t . '<ol>
                  <li>Move to HTML mode and check call of shortcode for its chart below.</li>
                  <li>Copy & paste your own data between "(" and ")" brackets of values, labels, series, and links. If you decide to use links, you could create local files on the root of blog or use standard full url path for them. Link can be also be a call to javascript function (see birds below).</li>
                  <li>Edit rest of document normally ready & publish it.</li>
               </ol><br />';
  }

  $style = ' style="background-color:darkgray; color:navy; border: 3px outset gray " ';
  return '<div ' . $style . '>' . $h . '</div>';
}
