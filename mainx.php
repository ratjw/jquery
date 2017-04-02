<!DOCTYPE html>
<HTML>
<HEAD>
<meta charset="utf-8"/>
<meta http-equiv="X-UA-Compatible">
<meta name="viewport" content="width=device-width, initial-scale=1">

<link href="css/jquery-ui.css" rel="stylesheet">
<link href="css/CSS.css" rel="stylesheet">
<link href="css/NoMoreTable.css" rel="stylesheet">
<!--link href="css/jquery.mobile-1.4.5.css" rel="stylesheet"-->

<!--script src="js/jquery.mobile-1.4.5.js"></script-->
<!--script src="js/jquery-1.12.4.min.js"></script-->
<script src="js/jquery-3.1.1.js"></script>
<script src="js/jquery-ui.js"></script>
<script src="js/control-click.js"></script>
<script src="js/control-function.js"></script>
<script src="js/control-menu.js"></script>
<script src="js/model-constant.js"></script>
<script src="js/model-equip.js"></script>
<script src="js/model-start.js"></script>
<script src="js/view-fill.js"></script>
<script src="js/view-history.js"></script>
<script src="js/view-ui.js"></script>
</HEAD>
<BODY>

<div id="wrapper">

 <div id="tblcontainer" style="display:none">
  <TABLE id="tbl" data-role="table" class="ui-responsive">
   <TBODY class="connected">
    <TR>
     <th style="width:10%">วันผ่าตัด</th>
     <th style="display:none"></th>
     <th style="width:6%">Staff</th>
     <th style="width:5%">HN</th>
     <th style="width:15%">ชื่อ นามสกุล</th>
     <th style="width:4%">อายุ</th>
     <th style="width:20%">Diagnosis</th>
     <th style="width:20%">Treatment</th>
     <th style="width:20%">Note</th>
     <th style="display:none"></th>
    </TR>
  <TR id="datatitle">
    <td data-title="วันผ่าตัด">1a1</td>
    <td style="display:none">a2</td>
    <td data-title="Staff">a3</td>
    <td data-title="HN">a4</td>
    <td data-title="ชื่อ นามสกุล">a5</td>
    <td data-title="อายุ">a6</td>
    <td data-title="Diagnosis">a7</td>
    <td data-title="Treatment">a8</td>
    <td data-title="Note">a9</td>
    <td style="display:none">a10</td>
  </TR>
  <TR id="datatitle">
    <td data-title="วันผ่าตัด">2a1</td>
    <td style="display:none">a2</td>
    <td data-title="Staff">a3</td>
    <td data-title="HN">a4</td>
    <td data-title="ชื่อ นามสกุล">a5</td>
    <td data-title="อายุ">a6</td>
    <td data-title="Diagnosis">a7</td>
    <td data-title="Treatment">a8</td>
    <td data-title="Note">a9</td>
    <td style="display:none">a10</td>
  </TR>
  <TR id="datatitle">
    <td data-title="วันผ่าตัด">3a1</td>
    <td style="display:none">a2</td>
    <td data-title="Staff">a3</td>
    <td data-title="HN">a4</td>
    <td data-title="ชื่อ นามสกุล">a5</td>
    <td data-title="อายุ">a6</td>
    <td data-title="Diagnosis">a7</td>
    <td data-title="Treatment">a8</td>
    <td data-title="Note">a9</td>
    <td style="display:none">a10</td>
  </TR>
   </TBODY>
  </TABLE>
 </div>

  <div id="queuecontainer" style="display:none">
   <TABLE id="queuetbl" data-role="table" class="ui-responsive">
    <TBODY class="connected">
     <TR>
      <th style="width:10%">วันผ่าตัด</th>
      <th style="width:4%">Since</th>
      <th style="display:none"></th>
      <th style="width:7%">HN</th>
      <th style="width:15%">ชื่อ นามสกุล</th>
      <th style="width:4%">อายุ</th>
      <th style="width:20%">Diagnosis</th>
      <th style="width:20%">Treatment</th>
      <th style="width:20%">Note</th>
      <th style="display:none"></th>
     </TR>
    <TR>
     <td data-title="วันผ่าตัด">1q1</td>
     <td data-title="Since">q2</td>
     <td style="display:none">q3</td>
     <td data-title="HN">q4</td>
     <td data-title="ชื่อ นามสกุล">q5</td>
     <td data-title="อายุ">q6</td>
     <td data-title="Diagnosis">q7</td>
     <td data-title="Treatment">q8</td>
     <td data-title="Note">q9</td>
     <td style="display:none">q10</td>
	</TR>
     <TR>
     <td data-title="วันผ่าตัด">2q1</td>
     <td data-title="Since">q2</td>
     <td style="display:none">q3</td>
     <td data-title="HN">q4</td>
     <td data-title="ชื่อ นามสกุล">q5</td>
     <td data-title="อายุ">q6</td>
     <td data-title="Diagnosis">q7</td>
     <td data-title="Treatment">q8</td>
     <td data-title="Note">q9</td>
     <td style="display:none">q10</td>
	</TR>
    <TR>
     <td data-title="วันผ่าตัด">3q1</td>
     <td data-title="Since">q2</td>
     <td style="display:none">q3</td>
     <td data-title="HN">q4</td>
     <td data-title="ชื่อ นามสกุล">q5</td>
     <td data-title="อายุ">q6</td>
     <td data-title="Diagnosis">q7</td>
     <td data-title="Treatment">q8</td>
     <td data-title="Note">q9</td>
     <td style="display:none">q10</td>
	</TR>
   </TBODY>
   </TABLE>
  </div>
</div>

<TABLE style="display:none">	<!-- Used as cells template -->
  <TR id="datatitle">
    <td data-title="วันผ่าตัด"></td>
    <td style="display:none"></td>
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

<TABLE id="qdatatitle" style="display:none">	<!--template for "staffqueue"-->
  <TBODY>
    <TR>
     <td data-title="วันผ่าตัด"></td>
     <td data-title="Since"></td>
     <td style="display:none"></td>
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

<TABLE id="servicetbl" data-role="table" class="ui-responsive" style="display:none">
  <TBODY>
    <TR>
     <th style="width:10%">วันผ่าตัด</th>
     <th style="display:none"></th>
     <th style="display:none"></th>
     <th style="width:5%">HN</th>
     <th style="width:15%">ชื่อ นามสกุล</th>
     <th style="width:4%">อายุ</th>
     <th style="width:20%">Diagnosis</th>
     <th style="width:20%">Treatment</th>
     <th style="display:none"></th>
     <th style="display:none"></th>
    </TR>
  </TBODY>
</TABLE>

<TABLE id="sdatatitle" style="display:none">	<!--template for "servicetable"-->
  <TBODY>
   <TR>
    <td data-title="วันผ่าตัด"></td>
    <td style="display:none"></td>
    <td style="display:none"></td>
    <td data-title="HN"></td>
    <td data-title="ชื่อ นามสกุล"></td>
    <td data-title="อายุ"></td>
    <td data-title="Diagnosis"></td>
    <td data-title="Treatment"></td>
    <td style="display:none"></td>
    <td style="display:none"></td>
   </TR>
  </TBODY>
</TABLE>

<div id="delete">
	<span id="del" onclick="doDelete()">Delete</span>
	<span class="ui-icon ui-icon-circle-close" onclick="closeDel()"></span>
</div>

<div id="dialogContainer"></div>

<div id="nondelete" style="display:none">
  <span id="undel" onclick="doUndelete()">Undelete</span>
  <span class="ui-icon ui-icon-circle-close" onclick="closeUndel()"></span>
</div>


<ul id="menu" style="display:none">
  <li><div>คิวของอาจารย์</div>
	<ul id="item0" style="width:120px">
	</ul>
  </li>
  <li><div id="item2"></div></li>
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

<div id="alert">
  <div>
	<span class="ui-icon ui-icon-closethick" style="float: right;height:20px;" onclick="closeAlert()"></span>
  </div>
  <div id="message"></div>
</div>

<div id="editcell" contenteditable="true"></div>

<div id="paperdiv" class="paper"></div>

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
	if ($_SERVER["REQUEST_METHOD"] == "POST") {
		$userid = $_POST["userid"];
		$password = $_POST["password"];
		echo '<SCRIPT type="text/javascript">loadtable('.$userid.')</SCRIPT>';
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
