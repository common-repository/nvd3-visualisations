<?php
/**
 * @file
 * Making sure that updates of data sets into server are secure.
 */
 
function nvd3_visualisations_verify_user($user, $key) {
 $profile = user_load($user);
 $my_guess = md5($profile->created);
 return $my_guess == $key;
}

/**
 * Getting data set from its file back to editor.
 *
 * @param string $data_file
 *   containing path to the file for data set.
 *
 * @return string
 *   whole data set.
 */
function nvd3_visualisations_fetch($data_file) {
  echo json_encode(file_get_contents($data_file));
 }

function nvd3_visualisations_new_user() {
  global $user;
  echo $user->uid;
  return drupal_get_token($user->uid);
}
 