<?php
/**
 * @file
 * Update chart's look and data file on WordPress.
 */

// All WordPress functions active.
require_once('../../../wp-load.php');

if (!is_user_logged_in()) {
  echo "Sorry, you must be logged in to update a chart.";
  return;
}
else {
  global $current_user;
  get_currentuserinfo();

  $role = $current_user->roles[0];
  // Remove last role if not like anybody who logged in to edit charts of draft posts.
  $role = 'author'  || $role == 'editor' || $role == 'administrator' || $role == 'subscriber';
  $cabs = $current_user->allcaps;
  $postable = $cabs[level_2] || $cabs[level_3] || $cabs[level_4];

  $rightsok = 0;
  if ($role || $postable) {
    $rightsok = 1;
  }
  if (!$rightsok) {
    echo 'Sorry, not enough user rights to update data & chart.';
    return;
  }
}

// Browser sends output file name & chart's data content.
$infile = $_POST['infile'];
$indata = $_POST['indata'];
$data = rawurldecode($indata);

// Filtering white spaces out from Excel type data.
if (strpos($infile, '.tsv') || strpos($infile, '.csv')) {
  $data = trim($data);
}
$wrote = file_put_contents('../../../' . $infile, $data);

// Signal browser's JavaScript how it all ended up on server.
if ($wrote) {
  echo 1;
  return;
}
echo 0;