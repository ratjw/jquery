<?php
	$url = $_POST["PAC"];

	$ch = curl_init();                                  // set up curl
	curl_setopt( $ch, CURLOPT_URL, $url );              // the url to request

	if ( false===( $response = curl_exec( $ch ) ) ){    // fetch remote contents
		$error = curl_error( $ch );                  
		// doesn't exist
	} else {
		$error = "PAC";
	}
	curl_close( $ch );                                  // close the resource

	echo $error;

?>