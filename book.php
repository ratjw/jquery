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
<script src="js/control-fingermouse.js"></script>
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
    <td contenteditable data-title="Staff"></td>
    <td contenteditable data-title="HN"></td>
    <td data-title="ชื่อ นามสกุล"></td>
    <td data-title="อายุ"></td>
    <td contenteditable data-title="Diagnosis"></td>
    <td contenteditable data-title="Treatment"></td>
    <td contenteditable data-title="โทรศัพท์"></td>
    <td style="display:none"></td>
  </TR>
</TABLE>

<div id="menudiv" class="smallpic"></div>
 
<ul id="menu" style="display:none">
  <li><div id="item1"></div></li>
  <li><div id="item2"></div></li>
  <li><div id="item3"></div></li>
  <li><div id="item4"></div>
    <ul>
      <li><div id="item41"></div></li>
      <li><div id="item42"></div></li>
    </ul>
  </li>
  <li><div id="item5"></div></li>
</ul>
 
<ul id="stafflist" style="display:none">
  <li><div id="staff1"></div></li>
  <li><div id="staff2"></div></li>
  <li><div id="staff3"></div></li>
  <li><div id="staff4"></div></li>
  <li><div id="staff5"></div></li>
  <li><div id="staff6"></div></li>
  <li><div id="staff7"></div></li>
  <li><div id="staff8"></div></li>
  <li><div id="staff9"></div></li>
</ul>

<div id="paperdiv" ></div>

<div id="alert" ></div>

<div id="container"></div>

<div id="searchicd" class="smallpic">
  <div id="newicd" style="border:1px solid slategray"></div>
  <div id="oldicd" style="display:none"></div>
  <div id="undermed"></div>
  <div id="oundermed" style="display:none"></div>
  Search ICD : 
  <input type="text" id="commonname" size="30"/>
  <button style="width:100px; font-size:20px; font-weight: bold;" onClick="oksaveDxRx()">Save</button>
  <button style="width:60px" onClick="cancel()">Cancel</button>
  <div id="icdname" style="border:1px solid slategray; height:auto"></div>
</div>

<div id="finddiv" class="smallpic">
  <button onClick="getstring()">Find:</button>
  <input type="text" id="findstr" size="30"/>
  <button id="previous">previous</button>
  <button id="next">next</button>
  <button id="close">x</button>
  <button id="notfound" style="background-color:yellow;">Not found</button>
</div>

<div id="queuediv" class="smallpic">
 <div id="queueheader" style="height:25px">
  <span id="queuespan" onclick="changestaff(this, this.innerHTML)"></span>
  <button style="width:70px;position:absolute;right:5px" onClick="xqueue()">Close</button>
 </div>
 <div id="queuedivin">
  <TABLE id="queuetbl">
   <TBODY>
    <TR>
     <th style="width:3%">No.</th>
     <th style="width:5%">Since</th>
     <th style="width:5%">Staff</th>
     <th style="width:7%">HN</th>
     <th style="width:10%">ชื่อ นามสกุล</th>
     <th style="width:5%">อายุ</th>
     <th style="width:25%">Diagnosis</th>
     <th style="width:20%">Treatment</th>
     <th style="width:20%">โทรศัพท์</th>
     <th style="display:none"> </th>
    </TR>
   </TBODY>
  </TABLE>
 </div>
</div>

<DIV id="login">
	<h3>Queue book for Neurosurgery</h3>
	<form method="post" action="">
		<?php $userid = $password = $passworderr = "";?>
		Login ID: <input id="userid" type="text" maxlength="6" size="6" name="userid"
					value="<?php echo $userid;?>" oninput="namesix()" onpropertychange="namesix()">
		<br><br>
		Password: <input id="password" type="password" name="password" onkeyup="delwrong()"
					maxlength="16" size="8" value="<?php echo $password;?>">
		<br>
		<span id="span" style="color:blue;"><?php echo $passworderr;?></span>
		<br><br>
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
