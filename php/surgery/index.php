<?php
if(isset($_REQUEST['url']) && isset($_REQUEST['folder'])) {
	//set "max_execution_time" to 0 so you can copy large files
	ini_set('max_execution_time', 0);
	
	//require the downloadfile class
	require_once("Rcopy-downloadFile-class.php");

	//create an instance of it
	$save = new downloadFile();

	//get the size of the file to be copied
	$filesize = $save->getSize($url);

	//here is where we actually copy the file
	$returnData = $save->saveFile($url, $folder);

	//next lets log the download to a file called "logs.php.inc"
	$save->logDownload($returnData, 'logs.php.inc');

	//print the returned data
	print_r($returnData);

	//print the filesize
	print_r($filesize);
}
?>

<form action="index.php" method="post">
	<input type="url" placeholder="url" name="url" />
	<input type="text" value="images" name="folder" />
	<input type="submit" value="copy" />
</form>