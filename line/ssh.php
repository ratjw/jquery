<?php
set_include_path(get_include_path() . PATH_SEPARATOR . 'phpseclib1.0.11');

include('Net/SFTP.php');

$sftp = new Net_SFTP('med.mahidol.ac.th');
if ($sftp->login('qbook', 'qbookPWD')) {
    echo('Login Success');
} else {
    exit('Login Failed');
}

// puts a three-byte file named filename.remote on the SFTP server
//$sftp->put('/surgery/qbook/line/001198-1538725095.png', '001198-1538725095.png');

// puts an x-byte file named filename.remote on the SFTP server,
// where x is the size of filename.local
$sftp->put('web/line/001198-1538725095.png', '001198-1538725095.png', NET_SFTP_LOCAL_FILE);
/*
echo('Transfer Success<br>');

$output = $sftp->exec('ls -a');
//$output = $sftp->exec('./1_yum_stuff.sh & 1>1.txt');
echo $output;

$output = $sftp->exec('pwd');
echo '<br>pwd: '.$output;*/
?>