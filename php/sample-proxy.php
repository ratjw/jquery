<?php
//define ('HOSTNAME', 'http://surgery.rama.mahidol.ac.th/Qbook/');
define ('HOSTNAME', 'http://10.6.21.133/Qbook/');
//define ('HOSTNAME', 'http://192.168.1.40/Qbook/');
//define ('HOSTNAME', 'http://192.168.1.38/Qbook/');
//define ('HOSTNAME', 'http://192.168.1.35/Qbook/');
//define ('HOSTNAME', 'localhost/Qbook/');

$path = ($_GET['path']);
$path = encodeURI($path);
$url = HOSTNAME.$path;

$session = curl_init($url);

curl_setopt($session, CURLOPT_HEADER, false);
curl_setopt($session, CURLOPT_RETURNTRANSFER, true);

$xml = curl_exec($session);

echo $xml;
curl_close($session);
exit;

function encodeURI($uri)
{
	return preg_replace_callback("{[^0-9a-z_.!~*'();,/?:@&=+$#]}i", 
		function ($m)
		{
			return sprintf('%%%02x', ord($m[0]));
		}, 
		$uri);
}
