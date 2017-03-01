<!DOCTYPE html>
<HTML>
<HEAD>
<meta charset="utf-8"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">

<link href="css/jquery-ui.css" rel="stylesheet">
<link href="css/CSS.css" rel="stylesheet">
<link href="css/NoMoreTable.css" rel="stylesheet">
<!--link href="css/jquery.mobile-1.4.5.css" rel="stylesheet"-->

<!--script src="js/jquery.mobile-1.4.5.js"></script-->
<script src="js/jquery.js"></script>
<script src="js/jquery-ui.js"></script>
<script src="js/control-click.js"></script>
<script src="js/control-clickqueue.js"></script>
<script src="js/control-function.js"></script>
<script src="js/model-constant.js"></script>
<script src="js/model-start.js"></script>
<script src="js/view-fill.js"></script>
<script src="js/view-fillqueue.js"></script>
<script src="js/view-history.js"></script>
<script src="js/view-menu.js"></script>
<script src="js/view-ui.js"></script>
</HEAD>
<BODY>

<div id="wrapper">
</div>

<div id="tblcontainer" style="display:none">
 <TABLE id="tbl" data-role="table" class="ui-responsive">
  <TBODY>
   <TR>
    <th style="width:10%">วันผ่าตัด</th>
    <th style="width:6%">Staff</th>
    <th style="width:5%">HN</th>
    <th style="width:15%">ชื่อ นามสกุล</th>
    <th style="width:4%">อายุ</th>
    <th style="width:20%">Diagnosis</th>
    <th style="width:20%">Treatment</th>
    <th style="width:20%">Note</th>
    <th style="display:none"></th>
   </TR>
  </TBODY>
 </TABLE>
</div>

<TABLE style="display:none">	<!-- Used as cells template -->
  <TR id="datatitle">
    <td data-title="วันผ่าตัด"></td>
    <td data-title="Staff"></td>
    <td data-title="HN"></td>
    <td data-title="ชื่อ นามสกุล"></td>
    <td data-title="อายุ"></td>
    <td data-title="Diagnosis"></td>
    <td data-title="Treatment"></td>
    <td data-title="Note"></td>
    <td style="display:none"></td>
  </TR>
</TABLE>

<div id="queuecontainer" style="display:none">
  <div id="titlebar">
	<span style="width:20px;"></span>
	<span id="titlename"></span>
	<span class="ui-icon ui-icon-closethick" onclick="closequeue()">
	</span>
  </div> 

  <TABLE id="queuetbl" data-role="table" class="ui-responsive">
   <TBODY>
    <TR>
     <th style="width:3%">No.</th>
     <th style="width:10%">Since</th>
     <th style="width:7%">HN</th>
     <th style="width:15%">ชื่อ นามสกุล</th>
     <th style="width:5%">อายุ</th>
     <th style="width:20%">Diagnosis</th>
     <th style="width:20%">Treatment</th>
     <th style="width:20%">Note</th>
     <th style="display:none"></th>
    </TR>
   </TBODY>
  </TABLE>
</div>

<TABLE style="display:none">	<!--template "qdatatitle" for "staffqueue"-->
  <TBODY>
    <TR id="qdatatitle">
     <td data-title="No." style="text-align:right; padding-right:4px"></td>
     <td data-title="Since"></td>
     <td data-title="HN"></td>
     <td data-title="ชื่อ นามสกุล"></td>
     <td data-title="อายุ"></td>
     <td data-title="Diagnosis"></td>
     <td data-title="Treatment"></td>
     <td data-title="Note"></td>
     <td style="display:none"></td>
	</TR>
  </TBODY>
</TABLE>

<div id="tbldaycontainer" style="display:none">
 <TABLE id="tblday" data-role="table" class="ui-responsive">
  <TBODY>
   <TR>
    <th style="width:10%">วันผ่าตัด</th>
    <th style="width:6%">Staff</th>
    <th style="width:5%">HN</th>
    <th style="width:15%">ชื่อ นามสกุล</th>
    <th style="width:4%">อายุ</th>
    <th style="width:20%">Diagnosis</th>
    <th style="width:20%">Treatment</th>
    <th style="width:20%">Note</th>
    <th style="display:none"></th>
   </TR>
  </TBODY>
 </TABLE>
</div>

<ul id="menu" style="display:none">
  <li><div>คิวของอาจารย์</div>
	<ul id="item0" style="width:120px">
	</ul>
  </li>
  <li><div>คิวเฉพาะวัน</div>
    <ul>
	  <li><div id="item2">อาทิตย์</div></li>
	  <li><div id="item2">จันทร์</div></li>
	  <li><div id="item2">อังคาร</div></li>
	  <li><div id="item2">พุธ</div></li>
	  <li><div id="item2">พฤหัส</div></li>
	  <li><div id="item2">ศุกร์</div></li>
	  <li><div id="item2">เสาร์</div></li>
    </ul>
  </li>
  <li><div id="item3"></div></li>
  <li><div id="item4"></div></li>
  <li><div id="item5"></div></li>
  <li><div id="item6"></div></li>
  <li><div id="item7"></div></li>
  <li><div id="item8"></div></li>
  <li><div id="item9"></div></li>
</ul>

<ul id="queuemenu" style="display:none">
  <li><div id="qitem1"></div></li>
  <li><div id="qitem2"></div></li>
</ul>

<ul id="stafflist" style="display:none"></ul>

<div id="alert" ></div>

<div id="dialogContainer"></div>

<div id="editcell" contenteditable="true"></div>

<DIV id="login">
	<h3>Queue book for Neurosurgery</h3>
	<form method="post" action="">
		<?php $userid = $password = $passworderr = "";?>
		Login ID: <input id="userid" type="text" maxlength="6" size="6" name="userid"
					value="<?php echo $userid;?>" oninput="namesix()" onpropertychange="namesix()">
		<br><br>
		Password: <input id="password" type="password" name="password" onkeyup="delwrong()"
					maxlength="6" size="6" value="<?php echo $password;?>">
		<br>
		<span id="span" style="color:blue;"><?php echo $passworderr;?></span>
		<br>
		<input id="submit" type="submit" value="Submit">
		<br><br>
	</form>
</DIV>

<script type="text/javascript">
function namesix()
{
	var userid = document.getElementById("userid").value
	if (userid.length == 6 && /^\d+$/.test(userid))
		document.getElementById("password").focus()
	else
		document.getElementById("span").innerHTML = ""
}

function delwrong()
{
	document.getElementById("span").innerHTML = ""
}
</script>

<?php
	$begin = '<SCRIPT type="text/javascript">
			loadtable("';
	$end = '")</SCRIPT>';

	if ($_SERVER["REQUEST_METHOD"] == "POST") {
		$userid = $_POST["userid"];
		$password = $_POST["password"];
		echo $begin.$userid.$end;
	}
/*
		if (strpos($_SERVER["SERVER_NAME"], "surgery.rama") !== false)
		{
			$wsdl="http://appcenter/webservice/patientservice.wsdl";
			$client = new SoapClient($wsdl);
			$resultx = $client->Get_staff_detail($userid,$password);
			$resulty = simplexml_load_string($resultx);
			$resultz = $resulty->children()->children()->role;
		}
		else
		{
			$resultz = "S";
		}
		if ($resultz == "S" || $resultz == "R")
		{
			echo $begin.$userid.$end;
		}
		else
		{ 
			$passworderr = "Wrong password";
		}
*/
?>

</BODY>
</HTML>
