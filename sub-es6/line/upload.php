<?php
/*
 * Remote File Copy PHP Script 2.0.0
 *
 * Copyright 2012, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

$upload_dir = __DIR__."/info.php";

if (empty($_REQUEST["url"])) {
?><!DOCTYPE HTML>
<html lang="en">
<head>
<!--[if IE]><meta http-equiv="X-UA-Compatible" content="IE=edge"><![endif]-->
<meta charset="utf-8">
<title>Remote File Copy</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
<form>
<input type="url" placeholder="URL" required>
<button type="submit">Start</button>
</form>
<ul></ul>
<progress value="0" max="100" style="display:none;"></progress>
<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
<script>
function callback(message) {
    if (!message) {
        console.error('Empty event callback response.');
        return;
    }
    $.each(message, function (key, value) {
        switch (key) {
            case 'send':
                $('progress').show();
                break;
            case 'progress':
                if (value && value.total) {
                    $('progress').val(value.loaded / value.total * 100);
                }
                break;
            case 'done':
                $('<li style="color:green;">').text(value && value.name).appendTo('ul');
                $('progress').hide();
                break;
            case 'fail':
                $('<li style="color:red;">').text(value && value.message).appendTo('ul');
                $('progress').hide();
                break;
        }
    });
}
$('form').on('submit', function (e) {
    e.preventDefault();
    $('<iframe src="javascript:false;" style="display:none;"></iframe>')
        .prop('src', '?url=' + encodeURIComponent($(this).find('input').val()))
        .appendTo(document.body);
});
</script>
</body> 
</html><?php
    exit;
}
echo "0";
    exit;
/*$url = !empty($_REQUEST["url"]) && preg_match("|^http(s)?://.+$|", stripslashes($_REQUEST["url"])) ?
    stripslashes($_REQUEST["url"]) : null;

$callback = !empty($_REQUEST["callback"]) && preg_match("|^\w+$|", $_REQUEST["callback"]) ?
    $_REQUEST["callback"] : "callback";

$use_curl = false;defined("CURLOPT_PROGRESSFUNCTION");

$temp_file = tempnam(sys_get_temp_dir(), "upload-");

$fileinfo = new stdClass();
$fileinfo->name = trim(basename($url), ".\x00..\x20");

// 1KB of initial data, required by Webkit browsers:
echo "<span>".str_repeat("0", 1000)."</span>";

function event_callback ($message) {
    global $callback;
    echo "<script>parent.".$callback."(".json_encode($message).");</script>";
}

function get_file_path () {
    global $upload_dir, $fileinfo, $temp_file;
    return $upload_dir."/".basename($fileinfo->name).'.'.basename($temp_file).'.dat';
}

function stream_notification_callback ($notification_code, $severity, $message, $message_code, $bytes_transferred, $bytes_max) {
    global $fileinfo;
    switch($notification_code) {
        case STREAM_NOTIFY_FILE_SIZE_IS:
            $fileinfo->size = $bytes_max;
            break;
        case STREAM_NOTIFY_MIME_TYPE_IS:
            $fileinfo->type = $message;
            break;
        case STREAM_NOTIFY_PROGRESS:
            if (!$bytes_transferred) {
                event_callback(array("send" => $fileinfo));
            }
            event_callback(array("progress" => array("loaded" => $bytes_transferred, "total" => $bytes_max)));
            break;
    }
}

function curl_progress_callback ($curl_resource, $total, $loaded) {
    global $fileinfo;
    if (!$loaded) {
        if (!isset($fileinfo->size)) {
            $fileinfo->size = $total;
            event_callback(array("send" => $fileinfo));
        }
    }
    event_callback(array("progress" => array("loaded" => $loaded, "total" => $total)));
}

if (!$url) {
    $success = false;
	echo "1";exit;
} else if ($use_curl) {
	echo "2";exit;
/*    $fp = fopen($temp_file, "w");
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_NOPROGRESS, false );
    curl_setopt($ch, CURLOPT_PROGRESSFUNCTION, "curl_progress_callback");
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_FILE, $fp);
    $success = curl_exec($ch);
    $curl_info = curl_getinfo($ch);
    if (!$success) {
        $err = array("message" => curl_error($ch));
    }
    curl_close($ch);
    fclose($fp);
    $fileinfo->size = $curl_info["size_download"];
    $fileinfo->type = $curl_info["content_type"];
} else {
    $ctx = stream_context_create();
    stream_context_set_params($ctx, array("notification" => "stream_notification_callback"));
    $success = copy($url, $temp_file, $ctx);
    if (!$success) {
        $err = error_get_last();
    }
}

if ($success) {
    $success = rename($temp_file, get_file_path());
}

if ($success) {
    event_callback(array("done" => $fileinfo));
} else {
    unlink($temp_file);
    if (!$err) {
        $err = array("message" => "Invalid url parameter");
    }
    event_callback(array("fail" => $err));*/
//}