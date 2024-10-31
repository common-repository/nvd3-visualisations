<?php
/**
 * @file
 * Create article/post/page from charts gallery's generated input request.
 *
 * Tags automatically new posts on WordPress properly.
 *
 * Security note: user must be logged in + have enough rights to publish.
 *
 * Inputs: type of new chart & URL path to the file of data set.
 */
 
$cms = $_GET['cms'];
// echo json_encode($_SERVER);
// echo 'http://'. $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'];
// echo 'http://' . $_SERVER['HTTP_HOST'] . "/wp-content/plugins/nvd3-visualisations/wordpress/postchart.php";
// var_dump($_GET);

if ($cms == 'wordpress') {
  // require_once "wordpress/security.php";
  // All WordPress functions active.
  require_once('../../../wp-load.php');
  $root = plugins_url() . '/nvd3-visualisations/';
//  if (nvd3_visualisations_verify_user())
//  echo $root . 'wordpress/postchart.php';
  require_once 'wordpress/postchart_wp.php';
  $dataset = $root . 'data/' . $_GET['filepath'];
//  echo nvd3_visualisations_build_new_chart($_GET['new'], $dataset, $_GET['type'], $_GET['filepath'], $_GET['template']);
  echo nvd3_visualisations_build_new_chart($_GET, $dataset);
//  echo hello_root($root);
  return;
}

if ($cms == 'drupal') {
  require_once "drupal/postchart.php";
  nvd3_visualisations_drupal_form();
  return;
}

// All common functions to both CMS systems: WordPress & Drupal 7.

/**
 * Cloning chart's example data set to the own directory.
 */
function nvd3_visualisations_copy_ex($dataset, $filename, $dirname) {

  if (!file_exists($dirname)) {
    mkdir($dirname, 0777);
  }
  $data = file_get_contents('data/' . $filename);
  // Test that filename is not existing yet.
  $addon = '';
  // Find random nro for new file name.
  if (file_exists($dirname . $filename)) {
    $filename = nvd3_visualisations_uniq_file($dirname, $filename);
  }
  $fpath = $dirname . $filename;
  file_put_contents($fpath, $data);

  return $fpath;
//  return 'charts_nvd3/' . $addon . $filename;
}

/**
 * Find unique data file name.
 */
function nvd3_visualisations_uniq_file($dirname, $filename) {
  // Make max bigger if much more data sets & charts are needed.
  $max = 10000;
  // Random guesses for new file name = fast way to build it.
  for ($i = 1; $i < 2 * $max; $i++) {
    $addon = mt_rand(1, $max);
    $filename = str_replace('.', $addon . '.', $filename);
    if (!file_exists($dirname . $filename)) {
      return $filename;
    }
  }
  return 0;
}
/**
 * Generating simple content about direct html element input data.
 *
 * $param string $cname
 *   containing name for class of html including input values.
 */
function nvd3_visualisations_get_cells($cname) {
  return '
  <b>Values come from next text</b>
  <br />
  <b>Our pets</b> are today:
  <b id="Out cats" class="' . $cname . '">2</b> cats, 
  <b id="Our dogs" class="' . $cname . '">5</b> dogs, and 
  <b id="Our frogs" class="' . $cname . '">12</b> frogs at home.
  Our other friends have totally only <span id="Pets of friends" class="' . $cname . '">7</span> pets.
  ';
}

/**
 * Generating simple table example of direct data.
 *
 * $param string $id
 *   containing id for direct data's template.
 */
function nvd3_visualisations_get_array($id) {

  return '
  <b>Simple table for values of chart</b>
  <br />
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
 *
 * $param string $id
 *   containing id for direct data's template.
 */
function nvd3_visualisations_get_big_array($id) {

  return '
  <b>Big table for values of chart</b>
  <br />
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
 *
 * $param string $type
 *   containing type of direct data used with its template.
 */
function nvd3_visualisations_get_help($type) {

  $t = '<b>Steps for Your Own Data</b><br />';
  $h = '';
  if ($type == 'table'  || $type == 'table2') {
    $h = $t . '<ol>
                  <li>Copy & Paste your table from <b>OpenOffice Calc</b> here.</li>
                  <li>Go Text mode and copy ID of tiny example table below for your imported new table.</li>
                  <li>Remove example table & this text.</li>
                  <li>Check: that 2nd row color of background is copied to chart from a table.</li>
                  <li>Improve the look by <b>autocoloring</b> option & edit rest of document ready + publish it.</li>
               </ol><br />';
  }
  if ($type == 'cells') {
    $h = $t . '<ol>
                  <li>Look at the text sample below (in Text mode).</li>
                  <li>You tell input values by giving them same class name of html. Pick up any class name for input numbers of one chart.</li>
                  <li>You create labels into chart by typing their names in id elements.</li>
                  <li>Write your text content normally in Text mode.</li>
                  <li>Note: you are free to use different HTML tags for input numbers.</li>
                  <li>Edit your own values in place by using these tips and publish to find a great chart!</li>
               </ol><br />';
  }
  if ($type == 'direct') {
    $h = $t . '<ol>
                  <li>This is a chart with responsive links to the web.</li>
                  <li>Edit in Text mode and check chart in Visual mode.</li>
                  <li>Copy & paste your own data between brackets (...) of values, labels, series, and links. If you use links, these can be: <ul><li>local files on the root of blog</li><li>standard full url to the net</il></ul></li>
                  <li>Link can be also call any javascript function (eq click birds slice on chart).</li>
                  <li>Edit rest of content normally & publish it.</li>
               </ol><br />';
  }
  $style = ' style="background-color:darkgray; color:navy; border: 3px outset gray " ';
  return '<div ' . $style . '>' . $h . '</div>';
}

/**
 * Returning official names of charts (look: nvd3.org).
 *
 * $param string $ctype
 *   containing name of type for the chart.
 */
function nvd3_visualisations_chart_name($ctype) {
  $names = array("simpleline" => "Simple Line", 
                 "scatterbubble" => "Scatter Bubble",
                 "stackedarea" => "Stacked / Stream / Expanded Area",
                 "discretebar" => "Discrete Bar",
                 "multibar" => "Grouped / Stacked Multi-Bar",
                 "horizontalmultibar" => "Horizontal Grouped Bar",
                 "lineplusbar" => "Line and Bar Combo",
                 "cumulativeline" => "Cumulative Line",
                 "viewfinder" => "Line with View Finder",
                 "pie" => "Pie Chart",
                 "donut" => "Donut",
                 "scatterbubble" => "Scatter Bubble",
                 );
  if ($names[$ctype])
    return $names[$ctype];
  return$ctype;
}