<?php
	$url = $_POST["PACS"];

	$ch = curl_init();                                 // set up curl
	curl_setopt( $ch, CURLOPT_URL, $url );             // the url to request

	if ( false===( $response = curl_exec( $ch ) ) ) {	// fetch remote contents
		echo curl_error( $ch );                  		// doesn't exist
	}
	curl_close( $ch );                                 // close the resource

?>