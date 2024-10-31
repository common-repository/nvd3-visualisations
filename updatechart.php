<?php
/**
 * @file
 * Update chart's data file by request of data editor.
 */

$cms = $_POST['cms'];
if (!$cms)
  $cms = $_GET['cms'];

$root_path = '../../../';
if ($cms == 'wordpress') {
  require_once "wordpress/security.php";
}
elseif ($cms == 'drupal') {
  require_once "drupal/security.php";
  $root_path = '../../../../';
  $data_file = $_GET['file'];
  if ($data_file) {
    return nvd3_visualisations_fetch($root_path . $data_file);
  }
}

// Browser sends output file name & chart's data content.
$infile = $_POST['infile'];
$indata = $_POST['indata'];
$data = rawurldecode($indata);
// Clean data from possible html tags.
$data = str_replace('<br />', '', $data);
$data = str_replace('</p>', '', $data);
$data = str_replace('<p>', '', $data);

// Filtering white spaces out from Excel type data.
if (strpos($infile, '.tsv') || strpos($infile, '.csv')) {
  $data = trim($data);
}
$wrote = file_put_contents($root_path . $infile, $data);

// Signal browser's JS how it ended up.
if ($wrote) {
  echo 1;
  return;
}
echo 0;
