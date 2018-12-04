<?php
	@session_start($_POST["sid"]);

	echo empty($_SESSION['userid']) ? '' : $_SESSION['userid'];
?>