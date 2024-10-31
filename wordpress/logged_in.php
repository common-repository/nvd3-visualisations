<?php

// Fetch offers of properties from the portals of real estate.

/* All WP functions env. */
require_once('../../../../wp-load.php');

global $current_user;
get_currentuserinfo();

$admin = false;
$myrights = (array) $current_user -> caps;
echo json_encode($current_user);

?>