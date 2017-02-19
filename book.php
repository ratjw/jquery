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
<script src="js/control-edit.js"></script>
<script src="js/control-function.js"></script>
<script src="js/control-queuestaff.js"></script>
<script src="js/model-constant.js"></script>
<script src="js/model-start.js"></script>
<script src="js/view-fill.js"></script>
<script src="js/view-ui.js"></script>
</HEAD>
<BODY>

<TABLE id="tbl" data-role="table" class="ui-responsive" style="display:none">
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

<TABLE id="tbltemplate" data-role="table" class="ui-responsive" style="display:none">
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

<ul id="menu" style="display:none">
  <li><div id="item1"></div></li>
  <li><div id="item2"></div></li>
  <li><div id="item3"></div></li>
  <li><div id="item4" class="ui-state-disabled"></div>
	<ul id="item40" style="width:120px">
	</ul>
  </li>
  <li><div id="item5" class="ui-state-disabled"></div>
    <ul>
	  <li><div id="item51">อาทิตย์</div></li>
	  <li><div id="item52">จันทร์</div></li>
	  <li><div id="item53">อังคาร</div></li>
	  <li><div id="item54">พุธ</div></li>
	  <li><div id="item55">พฤหัส</div></li>
	  <li><div id="item56">ศุกร์</div></li>
	  <li><div id="item57">เสาร์</div></li>
    </ul>
  </li>
  <li><div id="item6"></div></li>
  <li><div id="item7"></div></li>
</ul>

<ul id="stafflist"></ul>

<div id="alert" ></div>

<div id="container"></div>

<div id="editcell" contenteditable="true"></div>

<TABLE id="queuetbl" data-role="table" class="ui-responsive" style="display:none">
  <TBODY>
    <TR>
     <th style="width:10%">Since</th>
     <th style="width:10%">HN</th>
     <th style="width:15%">ชื่อ นามสกุล</th>
     <th style="width:5%">อายุ</th>
     <th style="width:20%">Diagnosis</th>
     <th style="width:20%">Treatment</th>
     <th style="width:20%">Note</th>
     <th style="display:none"></th>
    </TR>
  </TBODY>
</TABLE>

<TABLE style="display:none">
  <TBODY>
    <TR id="qdatatitle">
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

<ul id="queuemenu" style="display:none">
  <li><div id="qitem1"></div></li>
  <li><div id="qitem2"></div></li>
</ul>

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
