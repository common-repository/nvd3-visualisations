<?php
/**
 * @file
 * Reading standard mySQL table and building its chart.
 *
 * This converts it into simple text file & returns the name of tmp file back.
 *
 */

$host = $_GET['host'];
$host = nvd3_visualisations_special_letters($host);
$user = $_GET['user'];
$user = nvd3_visualisations_special_letters($user);
$pwd = $_GET['pwd'];
$pwd = nvd3_visualisations_special_letters($pwd);
$db = $_GET['db'];
$db = nvd3_visualisations_special_letters($db);
$table = $_GET['table'];
$table = nvd3_visualisations_special_letters($table);

$lastrows = $_GET['rows'];
if (!$lastrows) {
  $lastrows = 0;
}
/**
 * Converting encoded letters back to normal from URL path.
 *
 */
function nvd3_visualisations_special_letters($str) {
  return utf8_decode($str);
};

// Uncomment next line(s) & fill own mySQL login info, if necessary by security
// $user = 'your_account';
// $pwd =   'your_password';
mysql_connect($host, $user, $pwd);
@mysql_select_db($db) or die("Unable to select database");

$datarows = '';
$sep = "\t";
$newline = "\n";
$qry = mysql_query("SELECT * FROM " . $table);

$titles = array();
while ($row = mysql_fetch_assoc($qry)) {
  if (empty($titles)) {
    $titles = array_keys($row);
  }
  $datarows .= implode($sep, $row) . $newline;
}
$stuff = implode($sep, $titles) . $newline . $datarows;
$file = 'mysql' . mt_rand(1, 10) . '.tsv';
file_put_contents('data/tmp/' . $file, $stuff);

echo json_encode('tmp/' . $file);
