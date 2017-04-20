<!DOCTYPE html>
<HTML>
<HEAD>
<!--meta charset="utf-8"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"-->
<meta name="viewport" content="width=device-width, initial-scale=1">

<link href="css/jquery-ui.css" rel="stylesheet">
<link href="css/CSS.css" rel="stylesheet">
<link href="css/NoMoreTable.css" rel="stylesheet">
<!--link href="css/jquery.mobile-1.4.5.css" rel="stylesheet"-->

<!--script src="js/jquery.mobile-1.4.5.js"></script-->
<!--script src="js/jquery-1.12.4.min.js"></script-->
<script src="js/jquery-3.1.1.js"></script>
<script src="js/jquery-ui.js"></script>
<script src="js/click.js"></script>
<script src="js/constant.js"></script>
<script src="js/countservice.js"></script>
<script src="js/equip.js"></script>
<script src="js/fill.js"></script>
<script src="js/function.js"></script>
<script src="js/history.js"></script>
<script src="js/menu.js"></script>
<script src="js/service.js"></script>
<script src="js/sortable.js"></script>
<script src="js/start.js"></script>
</HEAD>
<BODY>

<div id="wrapper"><!-- data-role="page"-->

 <div id="tblcontainer" style="display:none"><!-- role="main" class="ui-content"-->
  <table id="tbl"><!-- data-role="table" class="ui-responsive"-->
   <tbody id="tblbody">
	 <tr>
     <th style="width:10%">Op/Service</th>
     <th style="display:none"></th>
     <th style="width:6%">Staff</th>
     <th style="width:5%">HN</th>
     <th style="width:15%">ชื่อ นามสกุล</th>
     <th style="width:4%">อายุ</th>
     <th style="width:20%">Diagnosis</th>
     <th style="width:20%">Treatment</th>
     <th style="width:20%">Contact</th>
     <th style="display:none"></th>
	 </tr>
   </tbody>
  </table>
 </div>

 <div id="titlecontainer" style="display:none">
  <div id="titlebar"><!-- data-role="header"-->
	<span id="titlename"></span>
	<span class="ui-icon ui-icon-closethick" onclick="closequeue()">
	</span>
  </div> 
  <div id="queuecontainer"><!-- role="main" class="ui-content"-->
   <table id="queuetbl"><!-- data-role="table" class="ui-responsive"-->
    <tbody>
	  <tr>
      <th style="width:10%">Op/Service</th>
      <th style="width:4%">Since</th>
      <th style="display:none"></th>
      <th style="width:7%">HN</th>
      <th style="width:15%">ชื่อ นามสกุล</th>
      <th style="width:4%">อายุ</th>
      <th style="width:20%">Diagnosis</th>
      <th style="width:20%">Treatment</th>
      <th style="width:20%">Contact</th>
      <th style="display:none"></th>
	  </tr>
    </tbody>
   </table>
  </div>
 </div>
</div>

<table id="datatitle" style="display:none">	<!-- Used as cells template -->
  <TBODY>
   <TR>
    <td data-title="Op/Service"></td>
    <td style="display:none"></td>
    <td data-title="Staff"></td>
    <td data-title="HN"></td>
    <td data-title="ชื่อ นามสกุล"></td>
    <td data-title="อายุ"></td>
    <td data-title="Diagnosis"></td>
    <td data-title="Treatment"></td>
    <td data-title="Contact"></td>
    <td style="display:none"></td>
   </TR>
  </TBODY>
</table>

<table id="qdatatitle" style="display:none">	<!--template for "staffqueue"-->
  <TBODY>
    <TR>
     <td data-title="Op/Service"></td>
     <td data-title="Since"></td>
     <td style="display:none"></td>
     <td data-title="HN"></td>
     <td data-title="ชื่อ นามสกุล"></td>
     <td data-title="อายุ"></td>
     <td data-title="Diagnosis"></td>
     <td data-title="Treatment"></td>
     <td data-title="Contact"></td>
     <td style="display:none"></td>
	</TR>
  </TBODY>
</table>

<div id="dialogService" style="display:none">
  <div id="servicehead">
    <div>
	  <span class="item">Admit : <span id="Admit"></span></span>
	  <span class="item">Discharge : <span id="Discharge"></span></span>
	  <span class="item">Operation : <span id="Operation"></span></span>
	  <span class="item Morbidity">Morbidity : <span id="Morbidity"></span></span>
	</div>
	<div>
	  <span class="item Readmission">Re-admission : <span id="Readmission"></span></span>
	  <span class="item Infection">Infection : <span id="Infection"></span></span>
	  <span class="item Reoperation">Re-operation : <span id="Reoperation"></span></span>
	  <span class="item Dead">Dead : <span id="Dead"></span></span>
	</div>
  </div>
  <span id="month" style="margin:20px 0px 40px"> เดือน :</span>
  <input type="text" id="monthpicker" style="margin-left:5px">
  <input type="text" id="monthpicking" style="visibility:hidden">
  <table id="servicetbl"><!-- data-role="table" class="ui-responsive"-->
   <TBODY>
    <TR>
     <th style="width:2%">case</th>
     <th style="width:13%">HN Name</th>
     <th style="width:20%">Diagnosis</th>
     <th style="width:15%">Treatment</th>
     <th style="width:25%">Admission status</th>
     <th style="width:15%">Final status</th>
     <th style="width:5%">Admit</th>
     <th style="width:5%">D/C</th>
     <th style="display:none"></th>
    </TR>
   </TBODY>
  </table>
  <input type="text" id="datepicker" style="display:none">
  <input type="text" id="datepicking" style="display:none">
</div>

<table id="sdatatitle" style="display:none">	<!--template for "servicetbl"-->
  <TBODY>
   <TR>
    <td data-title="case"></td>
    <td data-title="HN Name"></td>
    <td data-title="Diagnosis"></td>
    <td data-title="Treatment"></td>
    <td data-title="Admission status"></td>
    <td data-title="Final status"></td>
    <td data-title="Admit"></td>
    <td data-title="D/C"></td>
    <td style="display:none"></td>
   </TR>
  </TBODY>
</table>

<div id="delete">
	<span id="del" onclick="doDelete()">Delete</span>
	<span class="ui-icon ui-icon-circle-close" onclick="closeDel()"></span>
</div>

<div id="dialogOplog"></div>

<div id="dialogDeleted">
  <table>
  </table>
  <div id="undelete">
    <span id="undel" onclick="doUndelete()">Undelete</span>
    <span class="ui-icon ui-icon-circle-close" onclick="closeUndel()"></span>
  </div>
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

<ul id="stafflist" style="display:none"></ul>

<div id="alert">
  <div style="height:40px">
	<span class="ui-icon ui-icon-closethick" onclick="closeAlert()"></span>
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
		echo "<SCRIPT type='text/javascript'>loadtable('".$userid."')</SCRIPT>";
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
