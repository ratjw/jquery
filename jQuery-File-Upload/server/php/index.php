<?php
/*
 * jQuery File Upload Plugin PHP Example
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

error_reporting(E_ALL | E_STRICT);
require('UploadHandler.php');
//$upload_handler = new UploadHandler();

//On first call, main.js sends $_GET['hn'] for user_dirs (php/files/user_dirs)
//On subsequent call, there is  no $_GET['hn']
if (isset($_GET['hn'])) {
	session_id($_GET['hn']);
	session_start();
	//If id is specified, it will replace the current session id. 
	//session_id() needs to be called before session_start() for that purpose.
}

$upload_handler = new UploadHandler(array(
    'user_dirs' => true
));
