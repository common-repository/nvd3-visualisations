<?php
/**
 * @file
 * Update chart's look and data file on Drupal 7.
 */

   // All Drupal 7 functions visible.
  $path = getcwd() . '/../../../../';
  // Set the base path for the root of CMS.
  define('DRUPAL_ROOT', $path);
  require_once DRUPAL_ROOT . '/includes/bootstrap.inc';
  // Include the bootstrap file for using all DRUPAL functions in our file.
  drupal_bootstrap(DRUPAL_BOOTSTRAP_FULL);

  // Security functions for CSRF token.
  require_once 'security.php';
  // Security check of posting user.
  $user = $_GET['uid'];
  $key = $_GET['k'];
  if (!nvd3_visualisations_verify_user($user, $key)) {
    echo 0;
    return;
  }
 