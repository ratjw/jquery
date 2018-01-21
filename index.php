﻿<!DOCTYPE html>
<HTML>
<HEAD>
<meta charset="utf-8"/>
<title>Neurosurgery Service</title>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">

<link href="css/jquery-ui.min.css" rel="stylesheet">
<link href="css/CSS.css" rel="stylesheet">
<script src="js/jquery-1.12.4.min.js"></script>
<script src="js/jquery.mousewheel.min.js"></script>
<script src="js/jquery-ui.min.js"></script>
<script src="js/click.js"></script>
<script src="js/constant.js"></script>
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

<div id="wrapper">
 <div id="tblwrapper" style="display:none">
  <div id="tblcontainer">
   <table id="tbl">
    <tbody>
	 <tr>
     <th style="width:10%">Date</th>
     <th style="width:2%">Room</th>
     <th style="width:2%">Case</th>
     <th style="width:3%">Staff</th>
     <th style="width:3%">HN</th>
     <th style="width:10%">PatientName</th>
     <th style="width:20%">Diagnosis</th>
     <th style="width:30%">Treatment</th>
     <th style="width:20%">Note</th>
     <th style="display:none"></th>
	 </tr>
    </tbody>
   </table>
  </div>
 </div>

 <div id="queuewrapper" style="display:none">
  <div id="titlebar">
	<span id="titlename"></span>
	<span class="ui-icon ui-icon-closethick" onclick="closequeue()">
	</span>
  </div> 
  <div id="queuecontainer">
    <table id="queuetbl">
     <tbody>
	  <tr>
      <th style="width:10%">Date</th>
      <th style="width:2%">Room</th>
      <th style="width:2%">Case</th>
      <th style="width:3%">Staff</th>
      <th style="width:3%">HN</th>
      <th style="width:10%">PatientName</th>
      <th style="width:20%">Diagnosis</th>
      <th style="width:30%">Treatment</th>
      <th style="width:20%">Note</th>
      <th style="display:none"></th>
	  </tr>
     </tbody>
    </table>
  </div>
 </div>
</div>

<table id="tblcells" style="display:none">	<!-- Used as cells template -->
  <tbody>
   <tr>
    <td data-title="Date"></td>
    <td data-title="Room"></td>
    <td data-title="Case"></td>
    <td data-title="Staff"></td>
    <td data-title="HN"></td>
    <td data-title="PatientName"></td>
    <td data-title="Diagnosis"></td>
    <td data-title="Treatment"></td>
    <td data-title="Note"></td>
    <td style="display:none"></td>
   </tr>
  </tbody>
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
	  <span class="item Infection">Infection SSI : <span id="Infection"></span></span>
	  <span class="item Reoperation">Re-operation : <span id="Reoperation"></span></span>
	  <span class="item Dead">Dead : <span id="Dead"></span></span>
	</div>
  </div>
  <button id="exportService">Export to xls</button>
  <div id="monthpicker" style="margin-left:5px"></div>
  <div id="monthpicking" style="display:none"></div>
  <table id="servicetbl">
   <thead>
    <tr>
     <th style="width:2%">№</th>
     <th style="width:3%">HN</th>
     <th style="width:10%">Name</th>
     <th style="width:15%">Diagnosis</th>
     <th style="width:15%">Treatment</th>
     <th style="width:30%">Admission Status</th>
     <th style="width:15%">Final Status</th>
     <th style="width:5%">Admit</th>
     <th style="width:5%">D/C</th>
     <th style="display:none"></th>
    </tr>
   </thead>
   <tbody>
   </tbody>
  </table>
</div>

<!--template for "servicetbl"-->
<table id="servicecells" style="display:none">
  <tbody>
   <tr>
    <td data-title="№"></td>
    <td data-title="HN"></td>
    <td data-title="Name"></td>
    <td data-title="Diagnosis"></td>
    <td data-title="Treatment"></td>
    <td data-title="Admission Status"></td>
    <td data-title="Final Status"></td>
    <td data-title="Admit"></td>
    <td data-title="D/C"></td>
    <td style="display:none"></td>
   </tr>
  </tbody>
</table>

<div id="dialogHistory" style="display:none">
 <table id="historytbl">
  <thead>
   <tr>
	<th style="width:2%">Edited When</th>
	<th style="width:2%">Date</th>
	<th style="width:2%">Room</th>
	<th style="width:2%">Case</th>
	<th style="width:2%">Staff</th>
	<th style="width:15%">Diagnosis</th>
	<th style="width:15%">Treatment</th>
	<th style="width:15%">Admission</th>
	<th style="width:15%">Final Status</th>
	<th style="width:15%">Equipment</th>
	<th style="width:15%">Note</th>
	<th style="width:2%">Editor</th>
   </tr>
  </thead>
  <tbody>
  </tbody>
 </table>
</div>

<table id="historycells" style="display:none">
  <tbody>
   <tr>
    <td data-title="Edited When"></td>
    <td data-title="Date"></td>
    <td data-title="Room"></td>
    <td data-title="Case"></td>
    <td data-title="Staff"></td>
    <td data-title="Diagnosis"></td>
    <td data-title="Treatment"></td>
    <td data-title="Admission"></td>
    <td data-title="Final Status"></td>
    <td data-title="Equipment"></td>
    <td data-title="Note"></td>
    <td data-title="Editor"></td>
   </tr>
  </tbody>
</table>

<div id="dialogDeleted" style="display:none">
 <table id="deletedtbl">
  <thead>
   <tr>
	<th style="width:10%">Edited When</th>
	<th style="width:5%">Date</th>
	<th style="width:5%">Staff</th>
	<th style="width:5%">HN</th>
	<th style="width:10%">Patient Name</th>
	<th style="width:20%">Diagnosis</th>
	<th style="width:20%">Treatment</th>
	<th style="width:20%">Note</th>
	<th style="width:5%">Editor</th>
   </tr>
  </thead>
  <tbody>
  </tbody>
 </table>
 <div id="undelete">
   <span id="undel" >Undelete</span>
   <span class="ui-icon ui-icon-circle-close" id="closeUndel"></span>
 </div>
</div>

<table id="deletedcells" style="display:none">
  <tbody>
   <tr>
    <td data-title="Edited When"></td>
    <td data-title="Date"></td>
    <td data-title="Staff"></td>
    <td data-title="HN"></td>
    <td data-title="Patient Name"></td>
    <td data-title="Diagnosis"></td>
    <td data-title="Treatment"></td>
    <td data-title="Note"></td>
    <td data-title="Editor"></td>
   </tr>
  </tbody>
</table>

<div id="dialogAll" style="display:none">
 <table id="alltbl">
  <tbody>
   <tr>
     <th style="width:10%">Date</th>
     <th style="width:2%">Room</th>
     <th style="width:2%">Case</th>
     <th style="width:3%">Staff</th>
     <th style="width:3%">HN</th>
     <th style="width:10%">PatientName</th>
     <th style="width:20%">Diagnosis</th>
     <th style="width:30%">Treatment</th>
     <th style="width:20%">Note</th>
   </tr>
  </tbody>
 </table>
</div>

<table id="allcells" style="display:none">
  <tbody>
   <tr>
    <td data-title="Date"></td>
    <td data-title="Room"></td>
    <td data-title="Case"></td>
    <td data-title="Staff"></td>
    <td data-title="HN"></td>
    <td data-title="PatientName Age"></td>
    <td data-title="Diagnosis"></td>
    <td data-title="Treatment"></td>
    <td data-title="Note"></td>
   </tr>
  </tbody>
</table>

<div id="dialogInput" style="display:none">
  <div id="find" class="dialogBox">
	<span style="width:90px;">HN:</span>
	<input type="text" name="hn" maxlength="7">
	<br>
	<br>
	<span style="width:90px;">Name:</span>
	<input type="text" name="patient">
	<br>
	<br>
	<span style="width:90px;">Staff:</span>
	<input type="text" name="staffname">
	<br>
	<br>
	<span style="width:90px;">Diagnosis:</span>
	<input type="text" name="diagnosis">
	<br>
	<br>
	<span style="width:90px;">Treatment:</span>
	<input type="text" name="treatment">
	<br>
	<br>
	<span style="width:90px;">Note:</span>
	<input type="text" name="note">
  </div>
</div>

<div id="dialogFind" style="display:none">
  <table id="findtbl">
  <thead>
   <tr>
	<th style="width:4%">Date</th>
	<th style="width:3%">Staff</th>
	<th style="width:3%">HN</th>
	<th style="width:10%">Patient Name</th>
	<th style="width:20%">Diagnosis</th>
	<th style="width:15%">Treatment</th>
	<th style="width:20%">Admission Status</th>
	<th style="width:15%">Final Status</th>
	<th style="width:10%">Note</th>
   </tr>
  </thead>
  <tbody>
  </tbody>
  </table>
</div>

<table id="findcells" style="display:none">
  <tbody>
   <tr>
    <td data-title="Date"></td>
    <td data-title="Staff"></td>
    <td data-title="HN"></td>
    <td data-title="Patient Name"></td>
    <td data-title="Diagnosis"></td>
    <td data-title="Treatment"></td>
    <td data-title="Admission Status"></td>
    <td data-title="Final Status"></td>
    <td data-title="Note"></td>
   </tr>
  </tbody>
</table>

<div id="dialogScrub"></div>

<div id="dialogAlert"></div>

<ul id="menu" style="display:none">
  <li id="addrow"><div>Add a Row</div></li>
  <li id="itempost"><div>เลื่อนไป ไม่กำหนดวัน</div><ul>
    <li id="postpone"><div></div></li>
  </ul></li>
  <li id="changedate"><div>เปลี่ยนวัน / เปลี่ยนลำดับ</div></li>
  <li id="equip"><div>Equipment</div></li>
  <li id="history"><div>ประวัติการแก้ไข</div></li>
  <li id="itemdel"><div>Delete</div><ul>
    <li id="del"><div></div></li>
  </ul></li>
  <li><div>คิวของอาจารย์</div><ul id="staffmenu"></ul></li>
  <li id="service"><div>Service Review</div></li>
  <li><div>All Cases</div><ul id="allcases">
    <li id="deleted"><div>All Deleted Cases</div></li>
    <li id="notdeleted"><div>All Saved Cases</div></li>
  </ul></li>
  <li id="search"><div>Find</div></li>
  <li id="readme"><div>Readme</div></li>
</ul>

<ul id="stafflist" style="display:none"></ul>

<div id="editcell" contenteditable="true"></div>

<div id="dialogEquip">
  <span style="width:100px;">
	ห้อง <span id="oproom" style="font-size: 16px; font-weight: bold;"></span>
  </span>
  <span style="width:80px;">
	Case <span id="casenum" style="font-size: 16px; font-weight: bold;"></span>
  </span>
  <span style="width:120px;">
	เวลา <span id="optime" style="font-size: 16px; font-weight: bold;"></span>
  </span>
  <span style="width:200px;">วัน<span id="opday"></span>ที่
	<span id="opdate" style="font-size: 16px; font-weight: bold;"></span>
  </span>
  <span style="width:150px;">
	Surgeon <span id="staffname" style="font-size: 16px; font-weight: bold;"></span>
  </span>
  <br>
  <br>
  <span style="width:110px;">ชื่อ-นามสกุล </span><span id="patientname"></span>
  <span style="width:20px;"></span>อายุ <span id="age"></span>
  <span style="width:20px;"></span>HN <span id="hn"></span>
  <br>
  <span style="width:110px;float:left;">Diagnosis</span>
  <span style="width:540px;" id="diagnosis"></span>
  <br>
  <span style="width:110px;float:left;">Operation</span>
  <span style="width:540px;" id="treatment"></span>
  <br>
  <br>
 <div title="ส่วนเกิน">
  <span style="width:110px;"></span>
  <span style="width:500px;">
	<input type="checkbox" id="selfpay">
	<label for="selfpay"><i>**ผู้ป่วยและญาติสามารถ<b><u>จ่ายส่วนเกินได้ </u></b>(เบิกไม่ได้)</i>**
	 <input type="text" style="width:100px;text-align:right" id="copay"> บาท
	</label>
  </span>
  <br>
  <br>
 </div>
 <div title="Position">
  <span id="clearPosition" style="width:110px;">Position <small>(คลิกลบ)</small></span>
  <span style="width:230px;">
	<input type="radio" name="pose" id="leftSupine">
	<label for="leftSupine">หงาย ซ้ายขึ้น หันหน้าไปทางขวา</label>
  </span>
  <span style="width:230px;">
	<input type="radio" name="pose" id="rightSupine">
	<label for="rightSupine">หงาย ขวาขึ้น หันหน้าไปทางซ้าย</label>
  </span>
  <span style="width:90px;">
	<input type="radio" name="pose" id="supine">
	<label for="supine">หงายตรง</label>
  </span>
  <br>
  <span style="width:110px;"></span>
  <span style="width:150px;">
	<input type="radio" name="pose" id="rightParkbench">
	<label for="rightParkbench">Parkbench ขวาลง</label>
  </span>
  <span style="width:140px;">
	<input type="radio" name="pose" id="rightLateral">
	<label for="rightLateral">Lateral ขวาลง</label>
  </span>
  <span style="width:140px;">
	<input type="radio" name="pose" id="right3quarter">
	<label for="right3quarter">3/4 ขวาลง</label>
  </span>
  <span style="width:100px;">
	<input type="radio" name="pose" id="Concorde">
	<label for="Concorde">Concorde</label>
  </span>
  <br>
  <span style="width:110px;"></span>
  <span style="width:150px;">
	<input type="radio" name="pose" id="leftParkbench">
	<label for="leftParkbench">Parkbench ซ้ายลง</label>
  </span>
  <span style="width:140px;">
	<input type="radio" name="pose" id="leftLateral">
	<label for="leftLateral">Lateral ซ้ายลง</label>
  </span>
  <span style="width:140px;">
	<input type="radio" name="pose" id="left3quarter">
	<label for="left3quarter">3/4 ซ้ายลง</label>
  </span>
  <span style="width:70px;">
	<input type="radio" name="pose" id="prone">
	<label for="prone">คว่ำ</label>
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" style="width:500px;" id="position">
  <br>
 </div>
 <div title="Imaging">
  <span style="width:110px;">Imaging</span>
  <span style="width:120px;">
	<input type="checkbox" id="Fluoroscope">
	<label for="Fluoroscope">Fluoroscope</label>
  </span>
  <span style="width:100px;">
	<input type="checkbox" id="Navigator">
	<label for="Navigator">Navigator</label>
  </span>
  <span style="width:70px;">
	<input type="checkbox" id="iMRI">
	<label for="iMRI">iMRI</label>
  </span>
  <span style="width:70px;">
	<input type="checkbox" id="iCT">
	<label for="iCT">iCT</label>
  </span>
  <span style="width:90px;">
	<input type="checkbox" id="Robotic">
	<label for="Robotic">Robotic</label>
  </span>
  <span style="width:70px;">
	<input type="checkbox" id="OArm">
	<label for="OArm">O-Arm</label>
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" style="width:500px;" id="Imaging">
  <br>
 </div>
 <div title="อุปกรณ์ยึดศีรษะ">
  <span style="width:110px;">อุปกรณ์ยึดศีรษะ</span>
  <span style="width:150px;">
	<input type="checkbox" id="Mayfield">
	<label for="Mayfield">Mayfield</label>
  </span>
  <span style="width:140px;">
	<input type="checkbox" id="GelHeadRing">
	<label for="GelHeadRing">Gel Head Ring</label>
  </span>
  <span style="width:110px;">
	<input type="checkbox" id="Horseshoe">
	<label for="Horseshoe">Horseshoe</label>
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" style="width:500px;" id="headHolder">
  <br>
 </div>
 <div title="เครื่องตัดกระดูก">
  <span style="width:110px;">เครื่องตัดกระดูก</span>
  <span style="width:150px;">
	<input type="checkbox" id="HighSpeedDrill">
	<label for="HighSpeedDrill">High Speed Drill</label>
  </span>
  <span style="width:140px;">
	<input type="checkbox" id="SagittalSaw">
	<label for="SagittalSaw">Sagittal Saw</label>
  </span>
  <span style="width:110px;">
	<input type="checkbox" id="Osteotome">
	<label for="Osteotome">Osteotome</label>
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" style="width:500px;" id="Craniotome">
  <br>
 </div>
 <div title="กล้อง">
  <span style="width:110px;">กล้อง</span>
  <span style="width:150px;">
	<input type="checkbox" id="Microscope">
	<label for="Microscope">Microscope</label>
  </span>
  <span style="width:140px;">
	<input type="checkbox" id="ICG">
	<label for="ICG">ICG</label>
  </span>
  <span style="width:110px;">
	<input type="checkbox" id="Endoscope">
	<label for="Endoscope">Endoscope</label>
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" placeholder="ระบุยี่ห้อ" style="width:500px;" id="scope">
  <br>
 </div>
 <div title="CUSA">
  <span style="width:110px;">CUSA</span>
  <span style="width:150px;">
	<input type="checkbox" id="Excell">
	<label for="Excell">Excell</label>
  </span>
  <span style="width:140px;">
	<input type="checkbox" id="Soring">
	<label for="Soring">Soring</label>
  </span>
  <span style="width:110px;">
	<input type="checkbox" id="Sonar">
	<label for="Sonar">Sonar</label>
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" style="width:500px;" id="CUSA">
  <br>
 </div>
 <div title="Retractor">
  <span style="width:110px;">Retractor</span>
  <span style="width:150px;">
	<input type="checkbox" id="Leylar">
	<label for="Leylar">Leylar</label>
  </span>
  <span style="width:140px;">
	<input type="checkbox" id="Halo">
	<label for="Halo">Halo</label>
  </span>
  <span style="width:110px;">
	<input type="checkbox" id="Greenberg">
	<label for="Greenberg">Greenberg</label>
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" style="width:500px;" id="Retractor">
  <br>
 </div>
 <div title="U/S">
  <span style="width:110px;">U/S</span>
  <span style="width:150px;">
	<input type="checkbox" id="ultrasound">
	<label for="ultrasound">Ultrasound</label>
  </span>
  <span style="width:140px;">
	<input type="checkbox" id="Doppler">
	<label for="Doppler">Doppler</label>
  </span>
  <span style="width:110px;">
	<input type="checkbox" id="Duplex">
	<label for="Duplex">Duplex</label>
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" style="width:500px;" id="US">
  <br>
 </div>
 <div title="Shunt">
  <span id="clearShunt" style="width:110px;">Shunt <small>(คลิกลบ)</small></span>
  <span style="width:70px;">Pudenz</span>
  <span style="width:22px;">หัว</span>
  <span style="width:50px;">
	<input type="radio" name="head" id="proximalLow">
	<label for="proximalLow">low</label>
  </span>
  <span style="width:55px;">
	<input type="radio" name="head" id="proximalMedium">
	<label for="proximalMedium">med</label>
  </span>
  <span style="width:85px;">
	<input type="radio" name="head" id="proximalHigh">
	<label for="proximalHigh">high</label>
  </span>
  <span style="width:30px;">ท้อง</span>
  <span style="width:50px;">
	<input type="radio" name="peritoneum" id="distalLow">
	<label for="distalLow">low</label>
  </span>
  <span style="width:55px;">
	<input type="radio" name="peritoneum" id="distalMedium">
	<label for="distalMedium">med</label>
  </span>
  <span>
	<input type="radio" name="peritoneum" id="distalHigh">
	<label for="distalHigh">high</label>
  </span>
  <br>
  <span style="width:110px;"></span>
  <span style="width:150px;">Programmable</span>
  <span style="width:140px;">
	<input type="radio" name="program" id="shuntMedtronic">
	<label for="shuntMedtronic">Medtronic</label>
  </span>
  <span style="width:110px;">
	<input type="radio" name="program" id="shuntCodman">
	<label for="shuntCodman">Codman</label>
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" style="width:500px;" id="Shunt">
  <br>
 </div>
 <div title="เครื่องมือบริษัท">
  <span style="width:110px;">เครื่องมือบริษัท </span>
  <span style="width:150px;">เวลาส่งเครื่อง 
	<input type="text" style="width:40px;text-align:right" id="equiptime"> น. 
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" placeholder="ชื่อบริษัท ชื่อเครื่องมือ" style="width:500px;" id="company">
  <br>
 </div>
 <div title="อุปกรณ์อื่นๆ">
  <span style="width:110px;">อุปกรณ์อื่นๆ</span>
  <span style="width:150px;">
	<input type="checkbox" id="cranioCement">
	<label for="cranioCement">Cranio cement</label>
  </span>
  <span style="width:120px;">
	<input type="checkbox" id="MTECSkull">
	<label for="MTECSkull">MTEC skull</label>
  </span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" style="width:500px;" id="other">
  <br>
 </div>
 <div title="Monitor">
  <span style="width:110px;">Monitor</span>
  <span style="width:73px;"><input type="checkbox" id="CN5"><label for="CN5">CN5</label></span>
  <span style="width:73px;"><input type="checkbox" id="CN6"><label for="CN6">CN6</label></span>
  <span style="width:70px;"><input type="checkbox" id="CN7"><label for="CN7">CN7</label></span>
  <span style="width:70px;"><input type="checkbox" id="CN8"><label for="CN8">CN8</label></span>
  <span style="width:70px;"><input type="checkbox" id="SSEP"><label for="SSEP">SSEP</label></span>
  <span style="width:65px;"><input type="checkbox" id="EMG"><label for="EMG">EMG</label></span>
  <span style="width:65px;"><input type="checkbox" id="MEP"><label for="MEP">MEP</label></span>
  <br>
  <span style="width:120px;"></span>
  <input type="text" placeholder="อื่นๆ" style="width:500px;" id="Monitor">
  <br>
  <br>
 </div>
 <div title="รายละเอียด">
  <span style="width:113px;float:left;">Notice</span>
  <span> <textarea placeholder="รายละเอียด"></textarea></span>
  <br>
  <br>
  <span style="width:300px;"></span>
  <span style="width:70px;"> Edited by </span>
  <span style="position:absolute" id="editedby"></span>
  <br>
  <br>
 </div>
</div>

<div id="dialogReadme" class="dialogBox">
  <p style="margin:0px;">
    <span class="ui-icon ui-icon-info"></span> <b>Update 22 มค. 2561</b>
  </p>
	  <ol style="margin:0px;">
		<li>Confirm เมื่อ เลื่อนเคสไม่มีกำหนด, ลบเคส</li>
		<li>Equipment ช่องรายละเอียดยาวตลอดบรรทัด</li>
		<li>Find รวบรวมเคสของอาจารย์, ชื่อโรค, การผ่าตัด ฯลฯ ส่งออก Excel</li>
		<li>เรียงเคสตามห้องผ่าตัดและลำดับเคส เวลา-ไม่มีผลในการเรียง</li>
	  </ol>
  <p style="margin-bottom:0px;"><span class="ui-icon ui-icon-info"></span>
      ใช้ Browser : Chrome, Firefox, Edge หรือ IE 9+</p>
  <p style="margin:0px;"><span class="ui-icon ui-icon-info"></span>
  Login ID, Password ของโรงพยาบาล สำหรับพยาบาล ใช้ Login ID:000000</p>
  <p style="margin:0px;">
    <span class="ui-icon ui-icon-info"></span> การเปลี่ยนวันผ่าตัด (Date)
  </p>
	  <ol style="margin:0px;">
		<li>ใช้ Drag & Drop สามารถลากข้ามตารางได้</li>
		<li>ใช้ Menu เปลี่ยนวันที่ (ดูหัวข้อ Menu)</li>
	  </ol>
  <p style="margin:0px;"><span class="ui-icon ui-icon-info"></span>
       บันทึกข้อมูลที่ใส่ตามช่อง (cell)  โดย<br><span style="width:20px;"></span>
   1. อยู่นิ่งๆ 10 วินาที่<br><span style="width:20px;"></span>
   2. เลื่อนไปตำแหน่งอื่น<br><span style="width:30px;"></span>
1. คลิกช่องอื่น<br><span style="width:30px;"></span>
2. กด Tab (ช่องต่อไป) <br><span style="width:30px;"></span>
3. กด Shift+Tab (ช่องย้อนหลัง)<br><span style="width:30px;"></span>
4. กด Enter</p>
  <ul style="margin:0px;">
    <li>Enter ขึ้นบรรทัดใหม่บนตาราง</li>
    <li>Shift+Enter ขึ้นบรรทัดใหม่ภายในช่องนั้น</li>
  </ul>
  <p style="margin-top:0px;"><span class="ui-icon ui-icon-info"></span>
       ยกเลิก กด Esc</p>

  <h3>ตาราง</h3>
  <ul style="margin-top:0px;">
	<li>คอลัมน์ <b>Date</b></li>
	<dt>: คลิกช่องนี้ จะปรากฏ Popup Menu</dt>
	<dt>: วันผ่าตัด หรือ วันที่รับ consult ไม่ใช่วันนัดมา admit</dt>
	<li>คอลัมน์ <b>Room</b></li>
	<dt>: คลิกเลือกห้องผ่าตัด โดยใช้ล้อหมุนของเมาส์</dt>
	<dt>: ลบห้องผ่าตัดโดยใช้เลข 0</dt>
	<li>คอลัมน์ <b>Case</b></li>
	<dt>: คลิกเลือกลำดับเคสและเวลา โดยใช้ล้อหมุนของเมาส์</dt>
	<dt>: ลบเวลาผ่าตัดโดยใช้เลข 00.00</dt>
	<li>คอลัมน์ <b>Staff</b></li>
	<dt>: คลิกเลือกชื่ออาจารย์เจ้าของไข้</dt>
	<li>คอลัมน์ <b>HN</b></li>
	<dt>: เมื่อว่าง ใส่ hn เลข 7 หลัก</dt>
	<dt>: เมื่อมีเคส คลิกดู PACS</dt>
	<li>คอลัมน์ <b>PatientName</b></li>
	<dt>: ปรากฏเองตาม HN</dt>
	<dt>: เมื่อมีเคส คลิกไป upload files</dt>
	<li>คอลัมน์ <b>Diagnosis</b></li>
	<dt>: รวมทั้ง underlying disease</dt>
	<li>คอลัมน์ <b>Treatment</b></li>
	<dt>: เครื่องมือผ่าตัด ให้ใส่ที่ Equipment</dt>
	<li>คอลัมน์ <b>Note</b></li>
	<dt>: หมายเลขโทรศัพท์ ภูมิลำเนา หมายเหตุอื่นๆ</dt>
  </ul>

  <h3>Menu</h3>
  <ul style="margin-top:0px;">
	<li><b>เพิ่ม case</b></li>
	<dt>: มีวันเดียวกันกับเคสที่คลิก</dt>
	<li><b>เลื่อนไป ไม่กำหนดวัน</b> -> Confirm</li>
	<dt>: ต้องมีชื่อ  <b>Staff </b> ก่อน</dt>
	<li><b>เปลี่ยนวันที่</b></li>
	<dt>: เลือกโดยเลื่อนเมาส์ไปตามตาราง แล้วคลิกตรงวันที่ต้องการ</dt>
	<li><b>Equipment</b></li>
	<dt>: <button>Print</button> พิมพ์ลงกระดาษ</dt>
	<li><b>ประวัติการแก้ไข</b></li>
	<dt>: ดูย้อนหลังการเปลี่ยนข้อมูล</dt>
	<li><b>Delete -> Confirm</b></li>
	<dt>: ถ้าต้องการกลับคืน Undelete ได้ที่ <b>All Deleted Cases</b></dt>
	<li><b>คิวของอาจารย์</b></li>
	  <dt>: มี submenu เลือกชื่ออาจารย์</dt>
	  <dt>: เมื่อเลือกอาจารย์แล้ว จะแบ่งหน้าจอเป็น 2 ส่วน</dt>
		<ul><li>ครึ่งซ้าย เป็นตารางรวม</li></ul>
		<ul><li>ครึ่งขวา เป็นตารางของอาจารย์ท่านเดียว</li></ul>
		<ul><li>resizable ซ้าย <b>|</b> ขวา เลื่อนที่เส้นแบ่งกลาง</li></ul>
	<li><b>Service Review</b></li>
	  <dt>: ทั้งเคสผ่าตัด และเคส consult</dt>
	  <dt>: ต้องลงเคสที่ตารางรวมก่อน</dt>
	<li><b>ดูเคสทั้งหมด</b>
	  <dt>: ตั้งแต่เริ่มต้นถึงปัจจุบัน</dt>
	  <dt><b>- All Deleted Cases</b></dt>
	  <dt>: เรียงวันที่ทำการลบ ไม่ใช่เรียงวันผ่าตัด</dt>
		<ul><li>ต้องการ Undelete คลิกช่อง <b>Date Time</b> ของเคสนั้น</li></ul>
	  <dt><b>- All Saved Cases</b></dt>
	  <dt>: เหมือนตารางรวม ย้อนหลังไปทุกเคส</dt>
	</li>
	<li><b>Find</b></li>
	  <dt>: หาผู้ป่วย ด้วย HN หรือคำใดๆ ตามช่องที่ต้องการ</dt>
	  <dt>: เป็นการหาผู้ป่วยทั้งหมด รวมทั้งที่ไม่ปรากฏในตาราง</dt>
	  <dt>: ถ้าใช้ Ctrl-F เป็นการหาคำ เฉพาะที่ปรากฏในตาราง</dt>
	<li><b>Readme</b></li>
  </ul>

  <h3>Equipment</h3>
  <ul style="margin-top:0px;">
	<li>แบบฟอร์มที่เคยใส่ข้อมูลแล้ว</li>
	<dt>: ต้องคลิก <button>แก้ไข</button></dt>
	<li>ยกเลิกเลือกปุ่มการจัดท่า</b></li>
	<dt>: คลิก <b>Position</b> (คลิกลบ)</dt>
	<li>ยกเลิกเลือกปุ่มชนิด shunt</li>
	<dt>: คลิก <b>Shunt</b> (คลิกลบ)</dt>
	<li>ข้อความท้ายอุปกรณ์</li>
	<dt>: เป็นบรรทัดเดียว ยาวๆได้ ถ้าเกิน จะซ่อนอยู่ ต้องเลื่อนดู</dt>
	<li>ช่องใส่ข้อความสุดท้าย</li>
	<dt>: ได้หลายบรรทัดไม่จำกัด แต่ถ้าเกิน 3 บรรทัด ต้องเลื่อนดู</dt>
  </ul>

  <h3>Service Review</h3>
  <ul style="margin-top:0px;">
	<li>ต้องการเปลี่ยนเดือน</li>
	<dt>: คลิกหัวลูกศร ซ้าย ขวา</dt>
	<li>เข้าดู Service Review</li>
	<dt>: คลิกแถบชื่อเดือน</dt>
	<li><button>Export to xls</button></li>
	<dt>: โอนข้อมูลไป Excel แต่ยังไม่ใช่ไฟล์ Excel</dt>
	<dt>: <b>ต้อง Save ข้อมูลที่ Excel อีกที</b></dt>
	<li>ช่อง <b>№</b></li>
	<dt>: ลำดับเคสของอาจารย์แต่ละท่าน</dt>
	<li>ช่อง <b>HN</b></li>
	<dt>: คลิกดู PACS ได้เฉพาะเครื่องที่เชื่อมกับ PACS</dt>
	<li>ช่อง <b>Name</b></li>
	<dt>: คลิกดูภาพถ่ายหรือไฟล์ที่ upload</dt>
	<li>ช่อง <b>Diagnosis</b></li>
	<li>ช่อง <b>Treatment</b></li>
	<dt>: มีผลต่อจำนวน Operation, และ Re-operation</dt>
	<dt>: ถ้าโปรแกรมนับจำนวน Operation ขาดไป ให้ใส่คำว่า op(eration)</dt>
	<dt>: เคสที่มีการผ่าตัดซ้ำ ใส่คำว่า re-op(eration)</dt>
	<li>ช่อง <b>Admission Status</b></li>
	<dt>: มีผลต่อจำนวน Re-admission</dt>
	<dt>: เคสที่ admit ซ้ำ ใส่คำว่า re-ad(mission)</dt>
	<li>ช่อง <b>Final Status</b></li>
	<dt>: มีผลต่อจำนวน Infection, Morbidity, และ Dead</dt>
	<dt>: เคสที่มี Infection ใส่คำว่า Infect(ion) หรือ SSI</dt>
	<dt>: เคสที่มี Morbidity ใส่คำว่า Morbid</dt>
	<dt>: เคส Dead ใส่คำว่า Dead หรือ  passed away</dt>
	<li>ช่อง <b>Admit</b></li>
	<dt>: ข้อมูลของโรงพยาบาล</dt>
	<li>ช่อง <b>D/C</b></li>
	<dt>: ข้อมูลของโรงพยาบาล</dt>
  </ul>
</div>

<!-- For IE that not support <a download>, used in Export to Excel -->
<iframe id="txtArea1" style="display:none"></iframe>

<div id="images_preview"></div>

<p id="logo" style="text-align:center;"><img width="170" height="150" src="css/pic/logoRama.png"></p>

<div id="login">
	<br>
	<h3>Neurosurgery Service</h3>

	<form method="post" action="">

		<?php 
			$userid = $password = "";
		?>

		Login ID: <input id="userid" type="text" maxlength="6" size="6" name="userid"
					value="<?php echo $userid;?>" oninput="namesix()" 
					onpropertychange="namesix()">
		<br>
		<br>
		Password: <input id="password" type="password" name="password"
					maxlength="16" size="8" value="<?php echo $password;?>">
		<br>
		<br>
		<input type="submit" value="Sign in">
		<br><br>
	</form>
</div>

<script type="text/javascript">

function namesix()
{
	var userid = $("#userid").val()
	if (/^\d{6}$/.test(userid)) {	//six digits only
		$("#password").focus()
	}
}

</script>

<?php
	if ($_SERVER["REQUEST_METHOD"] === "POST") {
		$userid = $_POST["userid"];
		$password = $_POST["password"];

		if (preg_match('/^\d{6}$/', $userid)) {	//six digits only
			if (strpos($_SERVER["SERVER_NAME"], "surgery.rama") !== false) {
				$wsdl="http://appcenter/webservice/patientservice.wsdl";
				$client = new SoapClient($wsdl);
				$resultx = $client->Get_staff_detail($userid, $password);
				$resulty = simplexml_load_string($resultx);
				$resultz = (string)$resulty->children()->children()->role;
			}
			elseif (strpos($_SERVER["SERVER_NAME"], "localhost") !== false)  {
				$resultz = "S";
			}
			elseif (strpos($_SERVER["SERVER_NAME"], "10.6.166.92") !== false)  {
				$resultz = "S";
			}
			elseif (strpos($_SERVER["SERVER_NAME"], "192.168") !== false)  {
				$resultz = "S";
			}

			if ($resultz === "S" || $resultz === "R" || $userid === "000000") {
				echo "<SCRIPT type='text/javascript'>initialize('".$userid."')</SCRIPT>";
			}
		}
	}
?>

</BODY>
</HTML>
