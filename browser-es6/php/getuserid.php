<?php
	session_start();
	echo empty($_SESSION['userid']) ? '' : $_SESSION['userid'];
?>