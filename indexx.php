<?php
function shapeSpace_check_https() {
	
	if ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == 443) {
		
		return true; 
	}
	return false;
}

	if (shapeSpace_check_https()) {
		include "indexhttps.php";
	} else {
		include "indexhttp.php";
	}
?>