<?php
$connection = ssh2_connect('med.mahidol.ac.th', 22);echo "1";
//ssh2_auth_password($connection, 'qbook', 'qbookPWD');echo "2";

//$sftp = ssh2_sftp($connection);echo "3";

//$stream = fopen('ssh2.sftp://' . intval($sftp) . '/surgery/qbook/line/info.php', 'r');echo "4";
?>