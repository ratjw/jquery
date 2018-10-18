<?php
	if (isset($_GET['userid'])) {
		session_start();
		$userid = !empty($_SESSION['userid']) ? $_SESSION['userid'] : '';
		echo $userid;
	}
?>