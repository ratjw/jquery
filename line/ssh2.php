<?php

set_include_path(get_include_path() . PATH_SEPARATOR . 'phpseclib1.0.11');

include('Net/SSH2.php');

$sftp = new Net_SFTP('med.mahidol.ac.th', 22);

if (!$sftp->login('qbook', 'qbookPWD')) { //if you can't log on...
    exit('sftp Login Failed');
}
echo "1";
/*
exit;

echo $sftp->pwd();

$output = $sftp->put('/root/1_yum_stuff.sh', '1_yum_stuff.txt');
echo $output;
$output = $sftp->exec('ls -a');
//$output = $sftp->exec('./1_yum_stuff.sh & 1>1.txt');
echo $output;
$output = $sftp->exec('pwd');
echo $output;
echo("3rd try!");
*/
?>