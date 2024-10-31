<?php
/**
 * @file
 * Create article/page from charts gallery's generated input request on Drupal 7.
 *
 * Security note: user's rights to publish are checked based on md5() hash tags always.
 *
 * Inputs: type of new chart & URL path to the file of data set.
 */

/**
 * New gallery of charts for Drupal 7.
 */
function nvd3_visualisations_drupal_form() {


  // All Drupal 7 functions visible.
  $path = getcwd() . '/../../../../';
  // Set the base path for the root of CMS.
  define('DRUPAL_ROOT', $path);
  require_once DRUPAL_ROOT . '/includes/bootstrap.inc';
  // Include the bootstrap file for using all DRUPAL functions in our file.
  drupal_bootstrap(DRUPAL_BOOTSTRAP_FULL);

  // Security functions for logged in users.
  require_once 'security.php';
  // Security check of posting user.
  $user = $_GET['uid'];
  $key = $_GET['k'];
  if (!nvd3_visualisations_verify_user($user, $key)) {
    echo "Sorry, you must be registered & logged in to create a new chart.";
    return 0;
  }

  $root = '../' . drupal_get_path('module', 'nvd3_visualisations') . '/';

  $posttype = 'page';
  if ($_GET['new']) {
    $posttype = $_GET['new'];
  }
  if ($posttype == 'post') {
    $posttype = 'article';
  }
  $dataset = $root . 'data/simpleLineData.json';
  if ($_GET['filepath']) {
    $dataset = $root . 'data/' . $_GET['filepath'];
  }
  $ctype = 'simpleline';
  if ($_GET['type']) {
    $ctype = $_GET['type'];
  }
  $direct_data = '';
  // Direct input of data from page/article content itself.
  if ($_GET['template']) {
    $direct_data = nvd3_visualisations_gen_template($_GET['template']);
    $owndata = '';
  }
  // Data comes from web site's linked file.
  elseif ($_GET['filepath']) {
    $owndata = nvd3_visualisations_copy_ex($dataset, $_GET['filepath'], DRUPAL_ROOT . 'charts_nvd3/');
  }

  // New Article/Normal Page content: call of JavaScript for NVD3.
  $title = 'NVD3 Chart: ' . nvd3_visualisations_chart_name($ctype);
  $scolor = ' "Black" ';
  $scaler = '"*1"';
  $ctitle = '"Calculate:"';
  $cunit = '"unit"';
  $xaxis = ' xaxis:{ hide:false, labels:[] } ';

  /*
  Syntax:  jsChart(id, infile, type, dims, options)
  Example: jsChart("chart777", 'mydata.json', 'pie', {height:'250', width:'150'}, { ... } );
   */
  $id = mt_rand(1, 1000);
  $envelope = '<div id="chart' . $id . '"></div>';
  $dims = " {height:'250', width:'450'} ";
  $options = "{" . $direct_data .  " shadows:" . $scolor . ", showLegend: true, tooltips: true, showControls: true, noPopup: false, noResize: false, title: '" . $title . "', chartpicker:true, exports:false, autocoloring:true, xaxis:{ hide:false, style:\"font-size:10px; fill:navy\", transform:\"rotate(0 -20,0)\" }, yaxis:{ style:\"font-size:12px; fill:blue\", transform:\"rotate(0 -20,0)\"  }  }";
  /*
  @todo: activate calculator too.
  calculator:".$scaler.", calculatorlock:false, calculatorhide:false, calculatortitle:".$ctitle.", calculatorunit:".$cunit.",
   */
  $filepath = '../' . $owndata;
  $js_chart = " jsChart( '" . $id . "', '" . $filepath . "', '" . $ctype . "', " . $dims . ", " . $options . " )";
  $js_chart = '<script>' . $js_chart . '</script>';

  $editor = '';
  $test_data = '';
  $msg = '<b>New Cloned Chart</b><br />';
  if (!$direct_data) {
    $editor = nvd3_visualisations_drupal_editor($owndata, $ctype, '../../../../');
    $url = '<a href="' . $filepath . '" target="_blank">' . $owndata . '</a>';
    $msg .= 'You can find own data set of this chart from file: <b title="This path is under your root of site & available normally by FTP or other similar tools">' . $url;
    $msg .= '</b><br /><ul><li>By editing data you can get shape of this chart to follow own data set.</li>';
    $msg .= '<li>By editing content of this new article/page you can change look & behavior of chart.</li></ul>';
  }
  else {
    // Help texts for all direct data sources.
    $msg .= nvd3_visualisations_get_help($_GET['template']);
    if ($_GET['template'] == 'cells') {
      $test_data = nvd3_visualisations_get_cells("mypets");
    }
    elseif ($_GET['template'] == 'table') {
      $test_data = nvd3_visualisations_get_array("mypets");
    }
    elseif ($_GET['template'] == 'table2') {
      $test_data = nvd3_visualisations_get_big_array("mypets");
    }
  }

  // Ready to publish new article/page out.
  $summary = 'Chart of NVD3 visualisations';
  $body = $test_data . $envelope . $js_chart . $msg . $editor;
  nvd3_visualisations_drupal_page($title, $body, $summary, $posttype);
}
return;

/**
 * Creating new article/page.
 */
function nvd3_visualisations_drupal_page($title, $body, $summary, $pagetype) {

  // We create a new node object.
  $node = new stdClass();
  // Could be "page" or any other content type you have in use.
  $node->type = $pagetype;
  $node->title = $title;
  // Or any language code if Locale module is enabled.
  $node->language = LANGUAGE_NONE;
  // Unpublished draft (0/1).
  $node->status = 0;
  // Promoted to front page or not (0/1).
  $node->promote = 0;
  /*
  Writers's ID. $todo: how.
  Is here: $node->uid = $user->uid; .
   */
  /*
  $node->path = array('alias' => 'xxx/xxx/x'); // Setting a node path.
  @todo: "tags", array('NVD3', 'charts', 'SVG')
   */

  // Set some default values.
  node_object_prepare($node);

  // Let's add standard body's fields.
  $node->body[$node->language][0]['value'] = $body;
  $node->body[$node->language][0]['summary'] = $summary;
  $node->body[$node->language][0]['format'] = 'full_html';

  // Prepare node for a submit.
  $node = node_submit($node);
  // After this call we'll get a node's nid.
  node_save($node);

  $nid = $node->nid;
  $msg = 'Done! You are moving next to see chart automatically. If not, click here: ';
  if (!$nid) {
    echo 'You were denied to publish NVD3 chart - contact admin for more info !';
  }
  else {
    echo $msg . nvd3_visualisations_move2chart($nid);
  }
}

/**
 * Redirecting user to the new chart its node.
 */
function nvd3_visualisations_move2chart($nid) {

  $link = '../../../../node/' . $nid . '#overlay-context=node/80';
  echo '<script> window.location.href="' . $link . '"; </script>';
  return '<a href="' . $link . '"> OPEN NEW CHART </a>';
}

/**
 * Chart's data editor for Drupal 7.
 *
 * Next code is a template from WordPress side.
 * @todo: debug & print out this data editor.
 */
function nvd3_visualisations_drupal_editor($owndata, $ctype, $root) {

  $chartdata = file_get_contents($root . $owndata);

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
  $msg = '<br /><br /><br /><p><b>Data Editor</b></p> ';
  // Old: $datalink = 'Data File: <a href="' . $owndata . '" target="_blank"><b>' . $owndata . '</b></a>'; .
  $datatitle = 'Data File: ' . $owndata;

  // Next JavaScript updates data box of editor automatically.
  $refresh_update = '<script>updateDataSet("' . $owndata . '", "dataset")</script>';

  // Return whole editor for an article/page.
  return $msg . '<link rel="stylesheet" href="//code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css">
  <script src="//code.jquery.com/ui/1.10.4/jquery-ui.js"></script>
  <br />
  <div id="dataedit-1">
  <div class="nvd3_editor">
  <button title=' . $datatitle . '" onclick="' . $jscall . '" style="cursor:pointer">Save & Refresh Chart
  </button>
  <br />
  <textarea id="dataset" class="nvd3_editor_text" cols="70" rows="240">
  ' . $chartdata . '
  </textarea>
  <span id="xmlheader" style="display: none;">' . $header . '</span>
  </div>
  </div>
  ' . $refresh_update;
}

/**
 * Generating all direct data examples.
 */
function nvd3_visualisations_gen_template($type) {
  if ($type == 'direct') {
    $values = ' values:[177, 77, 17], ';
    $labels = ' labels:["cats", "dogs", "birds"], ';
    $series = ' series:["Pets"], ';
    $links = ' links:["http://en.wikipedia.org/wiki/Cat", "http://en.wikipedia.org/wiki/Dog", "javascript:window.alert(\'Hitting birds!\')"], ';
    return $values . $labels . $series . $links;
  }
  if ($type == 'table' || $type == 'table2') {
    return ' table:"mypets", ';
  }
  if ($type == 'cells') {
    return ' class:"mypets", ';
  }
}
