<?php
//include "connect.php";
	$servername = "localhost";
	$username = "root";
	$password = "Zaq1@wsx";
	$dbname = "neurosurgery";
	$conn = mysqli_connect($servername, $username, $password, $dbname);

	$upload_dir = "uploads/";
	$uploaded_images = array();
	$upload_images = $_FILES['upload_images'];
	foreach($upload_images['name'] as $key=>$val){
		$ext = explode('.', basename( $upload_images['name'][$key] ));
		$filename = date("Ymd_His") . "." . $ext[count($ext)-1];
		$upload_file = $upload_dir . $filename; 
		if(move_uploaded_file($upload_images['tmp_name'][$key], $upload_file)){
			$uploaded_images[] = $upload_file;
			$insert_sql = "INSERT INTO uploads(file_name, upload_time)
							VALUES('".$filename."', '".time()."')";
			mysqli_query($conn, $insert_sql) or die("database error: ". mysqli_error($conn));
		}
	}

    $images_arr = array();
    foreach($upload_images['name'] as $key=>$val){
//**********
	//display images without stored
	//for what???
	//After move_uploaded_file, the tmp_name was vanished!!!
//**********
        $extra_info = getimagesize($upload_images['tmp_name'][$key]);
        $images_arr[] = "data:" . $extra_info["mime"] . ";base64," . base64_encode(file_get_contents($upload_images['tmp_name'][$key]));
    }

	//Generate images view
	//After uploading the images we need to generate the view. This view will display at the target div.

	if(!empty($images_arr)){ 
		foreach($images_arr as $image_src){
?>
			<ul>
				<li >
					<img src="<?php echo $image_src; ?>" alt="">
				</li>
			</ul>
			<?php
		}
	}
			?>
<!--Now we will use below code in upload.php to display uploaded images preview.-->

<div class="row">
  <div class="gallery">
	<?php
	if(!empty($uploaded_images)){
		foreach($uploaded_images as $image){
	?>
			<ul>
			  <li >
				<img class="images" src="<?php echo $image; ?>" alt="">
			  </li>
			</ul>
	<?php
		}
	}
	?>
  </div>
</div>
