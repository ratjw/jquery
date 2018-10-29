<!DOCTYPE html>
<HTML>
<HEAD>
<meta charset="utf-8"/>
<title>Neurosurgery Service</title>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">

<link href="css/css.css" rel="stylesheet">
<link href="css/menu.css" rel="stylesheet">
<link href="css/jquery-ui.min.css" rel="stylesheet">

<script src="js/jquery-3.3.1.min.js"></script>
<script src="js/jquery.mousewheel.min.js"></script>
<script src="js/jquery-ui.min.js"></script>

</HEAD>
<BODY>

<table id="capture">
    <tbody>
	 <tr>
     <th>Date</th>
     <th>OR</th>
     <th>ห้อง</th>
     <th>เวลา</th>
     <th>ลำดับ</th>
     <th>Staff</th>
     <th>HN</th>
     <th>Patient</th>
     <th>Diagnosis</th>
     <th>Treatment</th>
     <th>Equipment</th>
     <th>Contact</th>
     <th></th>
	 </tr>
    </tbody>
</table>

<div id="wrapper">
  <div id='cssmenu'>
   <ul>
    <li class='hassub'>
     <a nohref><span>Staff</span></a>
     <ul id="staffmenu"></ul>
    </li>
    <li>
	 <a href='javascript:serviceReview()'><span>Service Review</span></a>
    </li>
    <li class='hassub'>
     <a nohref><span>Search</span></a>
     <ul class='w170'>
      <li>
       <a href='javascript:search()'><span>Search Cases by Words</span></a>
      </li>
      <li>
       <a href='javascript:allCases()'><span>All Saved Cases</span></a>
      </li>
      <li>
       <a href='javascript:deletedCases()'><span>All Deleted Cases</span></a>
      </li>
     </ul>
    </li>
    <li class='floatright'><a href='javascript:readme()'><span>Readme</span></a></li>
    <li class='floatright hassub'><a nohref><span>Setting</span></a>
     <ul class='w120'>
      <li><a href='javascript:addStaff()'><span>Staff Setting</span></a></li>
      <li><a href='javascript:setHoliday()'><span>Holiday Setting</span></a></li>
     </ul>
    </li>
    <li id="addrow"><a href='javascript:addnewrow()'><span>Add</span></a></li>
    <li id="postpone">
     <a nohref><span>Postpone</span></a>
     <ul>
      <li>
	    <a href='javascript:postponeCase()'><span id="postponecase"></span></a>
      </li>
     </ul>
    </li>
    <li id="changedate">
	  <a href='javascript:changeDate()'><span>Move</span></a>
	</li>
    <li id="history">
     <a href='javascript:editHistory()'><span>Tracking</span></a>
    </li>
    <li id="delete"><a nohref><span>Delete</span></a>
     <ul>
      <li>
	    <a href='javascript:delCase()'><span id="delcase"></span></a>
	  </li>
     </ul>
    </li>
    <li id="EXCEL" class='floatright'>
     <a href='javascript:sendtoExcel()'>
      <img src="css/pic/general/Excel.png">
     </a>
    </li>
    <li id="LINE" class='floatright'>
     <a href='javascript:sendtoLINE()'>
      <img src="css/pic/general/LINE.png">
     </a>
    </li>
   </ul>
  </div>

  <div id="dialogNotify">
    <textarea placeholder="พิมพ์ข้อความ"></textarea>
    <button id="buttonLINE" onclick="toLINE()"></button>
  </div>

  <div id="tblcontainer">
   <table id="tbl">
    <tbody>
	 <tr>
     <th>Date</th>
     <th>OR</th>
     <th>ห้อง</th>
     <th>เวลา</th>
     <th>ลำดับ</th>
     <th>Staff</th>
     <th>HN</th>
     <th>Patient</th>
     <th>Diagnosis</th>
     <th>Treatment</th>
     <th>Equipment</th>
     <th>Contact</th>
     <th></th>
	 </tr>
    </tbody>
   </table>
  </div>

 <div id="queuewrapper">
  <div id="titlebar">
	<span id="titlename"></span>
	<span class="ui-icon ui-icon-closethick" onclick="closequeue()"></span>
  </div> 
  <div id="queuecontainer">
    <table id="queuetbl">
     <tbody>
     </tbody>
    </table>
  </div>
 </div>
</div>

<!-- Used as cells template -->
<table id="tblcells">
 <tbody>
  <tr>
	<td data-title="Date"></td>
	<td data-title="Theatre"></td>
	<td data-title="Room"></td>
	<td data-title="Time"></td>
	<td data-title="Case"></td>
	<td data-title="Staff"></td>
	<td data-title="HN"></td>
	<td data-title="Patient"></td>
	<td data-title="Diagnosis"></td>
	<td data-title="Treatment"></td>
	<td data-title="Equipment"></td>
	<td data-title="Contact"></td>
	<td></td>
  </tr>
 </tbody>
</table>

<div id="dialogService">
  <div id="servicehead">
    <div>
	  <span class="item">Admission : <span id="Admission"></span></span>
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
  <br>
  <button id="exportService">Export to xls</button>
  <button id="reportService">Report to Dept.</button>
  <br>
  <div id="monthpicker"></div>
  <div id="monthstart"></div>
  <table id="servicetbl">
   <thead>
    <tr>
     <th>№</th>
     <th>HN</th>
     <th>Patient</th>
     <th>Diagnosis</th>
     <th>Treatment</th>
     <th>Admission Status</th>
     <th>Final Status</th>
     <th>Case Profile</th>
     <th>Admit</th>
     <th>Date</th>
     <th>D/C</th>
     <th></th>
    </tr>
   </thead>
   <tbody>
   </tbody>
  </table>

  <!--  name is the column in Mysql -->
  <!--  title is the value -->
  <div id="profileRecord" class="divRecord dialogBox">
	<br>
	<label class="w70">
		<input class="w40" type="radio" name="doneby" title="Staff">
		<span>Staff</span>
	</label>
	<label>
		<input class="w55" type="radio" name="doneby" title="Resident">
		<span>Resident</span>
	</label>
	<br>
	<label class="w70">
		<input class="w50" type="radio" name="manner" title="Elective">
		<span>Elective</span>
	</label>
	<label>
		<input class="w70" type="radio" name="manner" title="Emergency">
		<span>Emergency</span>
	</label>
	<br>
	<label class="w70">
		<input class="w40" type="radio" name="scale" title="Major">
		<span>Major</span>
	</label>
	<label>
		<input class="w40" type="radio" name="scale" title="Minor">
		<span>Minor</span>
	</label>
	<hr>
	<label class="w70">
		<input class="w55" type="radio" name="disease" title="Brain Tumor">
		<span>BTumor</span>
	</label>
	<label>
		<input class="w60" type="radio" name="disease" title="Brain Vascular">
		<span>BVascular</span>
	</label>
	<label>
		<input class="w40" type="radio" name="disease" title="CSF related">
		<span>CSF</span>
	</label>
	<br>
	<label class="w70">
		<input class="w55" type="radio" name="disease" title="Trauma">
		<span>Trauma</span>
	</label>
	<label class="w70">
		<input class="w40" type="radio" name="disease" title="Spine">
		<span>Spine</span>
	</label>
	<label>
		<input class="w30" type="radio" name="disease" title="etc">
		<span>etc</span>
	</label>
	<br>
	<label>
		<input class="w40" type="radio" name="disease" title="NoOp">
		<span>NoOp</span>
	</label>
	<hr>
	<label>
		<input class="w80" type="checkbox" name="radiosurgery" title="Radiosurgery">
		<span>RadioSurgery</span>
	</label>
	<label>
		<input class="w80" type="checkbox" name="endovascular" title="Endovascular">
		<span>Endovascular</span>
	</label>
	<br>
	<label>
		<input class="w80" type="checkbox" name="admitted" title="Readmission">
		<span>ReAdmission</span>
	</label>
	<label>
		<input class="w80" type="checkbox" name="operated" title="Reoperation">
		<span>ReOperation</span>
	</label>
	<br>
	<label>
		<input class="w55" type="checkbox" name="infection" title="Infection">
		<span>Infection</span>
	</label>
	<label>
		<input class="w50" type="checkbox" name="morbid" title="Morbidity">
		<span>Morbid</span>
	</label>
	<label>
		<input class="w50" type="checkbox" name="dead" title="Dead">
		<span>Mortal</span>
	</label>
  </div>
</div>
<!-- dialogService ends here -->

<!--template for "servicetbl"-->
<table id="servicecells">
  <tbody>
   <tr>
    <td data-title="№"></td>
    <td data-title="HN"></td>
    <td data-title="Patient"></td>
    <td data-title="Diagnosis"></td>
    <td data-title="Treatment"></td>
    <td data-title="Admission Status"></td>
    <td data-title="Final Status"></td>
    <td data-title="Case Profile"></td>
    <td data-title="Admit"></td>
    <td data-title="Date"></td>
    <td data-title="D/C"></td>
    <td></td>
   </tr>
  </tbody>
</table>

<div id="dialogReview" class="dialogBox">
 <table id="reviewtbl">
  <thead>
   <tr>
     <th rowspan="3" class="first">OPERATION</th>
     <th colspan="4">STAFF</th>
     <th colspan="4">RESIDENT</th>
   </tr>
   <tr>
     <th colspan="2">MAJOR</th>
     <th colspan="2">MINOR</th>
     <th colspan="2">MAJOR</th>
     <th colspan="2">MINOR</th>
   </tr>
   <tr>
     <th class="elect">Elect</th><th class="emer">Emer</th>
     <th class="elect">Elect</th><th class="emer">Emer</th>
     <th class="elect">Elect</th><th class="emer">Emer</th>
     <th class="elect">Elect</th><th class="emer">Emer</th>
   </tr>
  </thead>
  <tbody>
   <tr>
     <td>Brain tumor</td>
     <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
   </tr>
   <tr>
     <td>Brain Vascular</td>
     <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
   </tr>
   <tr>
     <td>CSF related</td>
     <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
   </tr>
   <tr>
     <td>Trauma</td>
     <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
   </tr>
   <tr>
     <td>Spine++</td>
     <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
   </tr>
   <tr>
     <td><b>etc.</b>
		<small>(Lesionectomy, Tracheostomy, MVD, Change Batt., Sural n. Bx)</small>
	 </td>
     <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
   </tr>
   <tr class="notcount">
	 <th colspan="9">
		Non-surgical <small>(not included in total operation)</small>
	 </th>
   </tr>
  <tr class="notcount nonsurgical">
     <td>Radiosurgery</td>
     <td></td><td></td>
   </tr>
   <tr class="notcount nonsurgical">
     <td>Endovascular</td>
     <td></td><td></td>
   </tr>
   <tr class="notcount nonsurgical">
     <td><small>Not Operation, Not RS, Not Endovascular</small></td>
     <td></td><td></td>
   </tr>
   <tr id="Total" class="notcount">
     <td>Total Operation</td>
     <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
   </tr>
   <tr id="Grand" class="notcount">
     <td>Grand Total</td>
     <td colspan="2"></td><td colspan="2"></td><td colspan="2"></td><td colspan="2">
   </tr>
  </tbody>
 </table>
</div>

<div id="dialogHistory">
 <table id="historytbl">
  <thead>
   <tr>
	<th>Date</th>
	<th>Rm</th>
	<th>№</th>
	<th>Staff</th>
	<th>Diagnosis</th>
	<th>Treatment</th>
	<th>Equipment</th>
	<th>Admission Status</th>
	<th>Final Status</th>
	<th>Contact</th>
	<th>Editor</th>
	<th>Edited When</th>
   </tr>
  </thead>
  <tbody>
  </tbody>
 </table>
</div>

<table id="historycells">
  <tbody>
   <tr>
    <td data-title="Date"></td>
    <td data-title="Room"></td>
    <td data-title="Case"></td>
    <td data-title="Staff"></td>
    <td data-title="Diagnosis"></td>
    <td data-title="Treatment"></td>
    <td data-title="Equipment"></td>
    <td data-title="Admission Status"></td>
    <td data-title="Final Status"></td>
    <td data-title="Contact"></td>
    <td data-title="Editor"></td>
    <td data-title="Edited When"></td>
   </tr>
  </tbody>
</table>

<div id="dialogDeleted">
 <table id="deletedtbl">
  <thead>
   <tr>
	<th>Date</th>
	<th>Staff</th>
	<th>HN</th>
	<th>Patient</th>
	<th>Diagnosis</th>
	<th>Treatment</th>
	<th>Contact</th>
	<th>Editor</th>
	<th>Edited When</th>
	<th></th>
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

<table id="deletedcells">
  <tbody>
   <tr>
	<td data-title="Date"></td>
	<td data-title="Staff"></td>
	<td data-title="HN"></td>
	<td data-title="Patient"></td>
	<td data-title="Diagnosis"></td>
	<td data-title="Treatment"></td>
	<td data-title="Contact"></td>
	<td data-title="Editor"></td>
	<td data-title="Edited When"></td>
	<td></td>
   </tr>
  </tbody>
</table>

<div id="dialogAll">
 <table id="alltbl">
  <thead>
   <tr>
	<th>Date</th>
	<th>Staff</th>
	<th>HN</th>
	<th>Patient</th>
	<th>Diagnosis</th>
	<th>Treatment</th>
	<th>Equipment</th>
	<th>Admission Status</th>
	<th>Final Status</th>
	<th>Contact</th>
   </tr>
  </thead>
  <tbody>
  </tbody>
 </table>
</div>

<table id="allcells">
  <tbody>
   <tr>
    <td data-title="Date"></td>
    <td data-title="Staff"></td>
    <td data-title="HN"></td>
    <td data-title="Patient"></td>
    <td data-title="Diagnosis"></td>
    <td data-title="Treatment"></td>
    <td data-title="Equipment"></td>
    <td data-title="Admission Status"></td>
    <td data-title="Final Status"></td>
    <td data-title="Contact"></td>
   </tr>
  </tbody>
</table>

<div id="dialogInput" class="dialogBox">
	<span>HN:</span>
	<input type="text" name="hn" maxlength="7">
	<br>
	<br>
	<span>Staff:</span>
	<input type="text" name="staffname">
	<br>
	<br>
	<span>Others:</span>
	<br>
	<input type="text" name="others"
		placeholder="Dx, Rx, Adm & Final Status">
	<br>
	<br>
	<img src="css/pic/general/find.png" onclick="searchDB()">
</div>

<div id="dialogFind">
  <table id="findtbl">
  <thead>
   <tr>
	<th>Date</th>
	<th>Staff</th>
	<th>HN</th>
	<th>Patient</th>
	<th>Diagnosis</th>
	<th>Treatment</th>
	<th>Equipment</th>
	<th>Admission Status</th>
	<th>Final Status</th>
	<th>Contact</th>
   </tr>
  </thead>
  <tbody>
  </tbody>
  </table>
</div>

<table id="findcells">
  <tbody>
   <tr>
    <td data-title="Date"></td>
    <td data-title="Staff"></td>
    <td data-title="HN"></td>
    <td data-title="Patient"></td>
    <td data-title="Diagnosis"></td>
    <td data-title="Treatment"></td>
    <td data-title="Equipment"></td>
    <td data-title="Admission Status"></td>
    <td data-title="Final Status"></td>
    <td data-title="Contact"></td>
   </tr>
  </tbody>
</table>

<div id="dialogStaff">
  <table id="stafftbl">
  <thead>
	<tr>
	 <td>Name : <input type="text" id="sname" size="10">
	 </td>
	 <td>Specialty : <select id="scbb"><option style="display:none"></option>
		</select>
	 </td>
	 <td>Date Oncall : <input type="text" id="sdate" size="10" readonly>
	 </td>
	 <input id="shidden" type="hidden">
	</tr>
	<tr>
	<td><button onClick=doadddata()>AddStaff</button></td>
	<td><button onClick=doupdatedata()>UpdateStaff</button></td>
	<td><button onClick=dodeletedata()>DeleteStaff</button></td>
	</tr>
   <tr>
	<th>Staff</th>
	<th>Specialty</th>
	<th>Start Date Oncall</th>
   </tr>
  </thead>
  <tbody>
  </tbody>
  </table>
</div>

<table id="staffcells">
  <tbody>
   <tr>
    <td data-title="Staff"></td>
    <td data-title="Specialty"></td>
    <td data-title="Start Date Oncall"></td>
   </tr>
  </tbody>
</table>

<div id="dialogHoliday">
  <table id="holidaytbl">
  <thead>
   <tr>
	<th>Date</th>
	<th>Holiday Name
	 <button id="addholiday" onClick=addHoliday(this)>+</button>
	</th>
   </tr>
  </thead>
  <tbody>
  </tbody>
  </table>
</div>

<table id="holidaycells">
  <tbody>
	<tr>
	 <td data-title="Date"></td>
	 <td data-title="Holiday Name"></td>
	</tr>
	<button class="delholiday" onClick=delHoliday(this)>-</button>
  </tbody>
</table>

<table id="holidayInput">
  <tbody>
	<tr>
	 <td>
	  <input type="text" id="holidateth" readonly></td>
	 <td>
	  <select id="holidayname">
	  </select>
	  <button class="delholiday" onClick=delHoliday(this)>-</button>
	 </td>
	</tr>
  </tbody>
</table>

<div id="dialogMoveCase">
  <table id="movetbl">
  <tbody>
	<tr id="movefrom"><td>มีแล้วใน Waiting List</td></tr>
	<tr></tr>
	<tr id="moveto"><td>ต้องการ</td></tr>
	<tr></tr>
  </tbody>
  </table>
</div>

<ul id="stafflist"></ul>
<ul id="oncallList"></ul>

<div id="dialogAlert"></div>

<div id="editcell" contenteditable="true"></div>

<div id="dialogEquip" class="dialogBox">
  <span class="w70">ห้อง <span id="oproom"></span></span>
  <span class="w70">Case <span id="casenum"></span></span>
  <span class="w120">เวลา <span id="optime"></span></span>
  <span class="w200">วัน<span id="opday"></span>ที่ <span id="opdate"></span></span>
  <span class="w150">Surgeon <span id="staffname"></span></span>
 <br>
 <br>
  <span class="w110">ชื่อ-นามสกุล </span><span id="patientname"></span>
  <span class="w20"></span>อายุ <span id="age"></span>
  <span class="w20"></span>HN <span id="hn"></span>
  <br>
  <!-- floatleft makes subsequent rows go downward -->
  <span class="w110 floatleft">Diagnosis</span>
  <span class="w540" id="diagnosis"></span>
  <br>
  <span class="w110 floatleft">Operation</span>
  <span class="w540" id="treatment"></span>
 <br>
 <br>
 <div title="ส่วนเกิน">
  <span class="w110"></span>
  <span class="w500">
	<span class="red"> ***</span>
	<i>ผู้ป่วยและญาติสามารถ<b><u>จ่ายส่วนเกินได้ </u></b></i> 
	<input type="text" class="w110 textcenter" id="copay"> บาท
	<span class="red"> ***</span>
  </span>
 </div>
 <br>
 <div title="position">
  <span class="w110" id="clearPosition">Position <small>(คลิกลบ)</small></span>
  <span class="w150">
	<input type="radio" name="pose" id="Supine_left">
	<label for="Supine_left">Supine left</label>
  </span>
  <span class="w140">
	<input type="radio" name="pose" id="Supine_right">
	<label for="Supine_right">Supine right</label>
  </span>
  <span class="w90">
	<input type="radio" name="pose" id="Supine">
	<label for="Supine">Supine</label>
  </span>
  <span class="w100">
	<input type="radio" name="pose" id="Concorde">
	<label for="Concorde">Concorde</label>
  </span>
  <span class="w70">
	<input type="radio" name="pose" id="Prone">
	<label for="Prone">Prone</label>
  </span>
  <br>
  <span class="w110"></span>
  <span class="w150">
	<input type="radio" name="pose" id="Parkbench_ขวาลง">
	<label for="Parkbench_ขวาลง">Parkbench ขวาลง</label>
  </span>
  <span class="w140">
	<input type="radio" name="pose" id="Lateral_ขวาลง">
	<label for="Lateral_ขวาลง">Lateral ขวาลง</label>
  </span>
  <span>
	<input type="radio" name="pose" id="Semiprone_ขวาลง">
	<label for="Semiprone_ขวาลง">Semiprone ขวาลง</label>
  </span>
  <br>
  <span class="w110"></span>
  <span class="w150">
	<input type="radio" name="pose" id="Parkbench_ซ้ายลง">
	<label for="Parkbench_ซ้ายลง">Parkbench ซ้ายลง</label>
  </span>
  <span class="w140">
	<input type="radio" name="pose" id="Lateral_ซ้ายลง">
	<label for="Lateral_ซ้ายลง">Lateral ซ้ายลง</label>
  </span>
  <span>
	<input type="radio" name="pose" id="Semiprone_ซ้ายลง">
	<label for="Semiprone_ซ้ายลง">Semiprone ซ้ายลง</label>
  </span>
  <br>
  <span class="w120"></span>
  <span><input type="text" class="w500" id="position"></span>
 </div>
 <br>
 <div title="Imaging">
  <span class="w110">Imaging</span>
  <span class="w150">
	<input type="checkbox" id="Fluoroscope">
	<label for="Fluoroscope">Fluoroscope</label>
  </span>
  <span class="w170">
	<input type="checkbox" id="Navigator_frameless">
	<label for="Navigator_frameless">Navigator frameless</label>
  </span>
  <span>
	<input type="checkbox" id="Navigator_frame-based">
	<label for="Navigator_frame-based">Navigator frame-based</label>
  </span>
  <br>
  <span class="w110"></span>
  <span class="w90">
	<input type="checkbox" id="Robotics">
	<label for="Robotics">Robotics</label>
  </span>
  <span class="w55">
	<input type="checkbox" id="iMRI">
	<label for="iMRI">iMRI</label>
  </span>
  <span class="w77">
	<input type="checkbox" id="iCT">
	<label for="iCT">iCT</label>
  </span>
  <span class="w90">
	<input type="checkbox" id="O-arm">
	<label for="O-arm">O-arm</label>
  </span>
  <span>
	<input type="checkbox" id="Stereotactic_frame-based">
	<label for="Stereotactic_frame-based">Stereotactic frame-based</label>
  </span>
  <br>
  <span class="w120"></span>
  <span><input type="text" class="w500" id="Imaging"></span>
 </div>
 <br>
 <div title="อุปกรณ์ยึดผู้ป่วย">
  <span class="w110">อุปกรณ์ยึดผู้ป่วย</span>
  <span class="w150">
	<input type="checkbox" id="Mayfield">
	<label for="Mayfield">Mayfield</label>
  </span>
  <span class="w140">
	<input type="checkbox" id="GelHeadRing">
	<label for="GelHeadRing">Gel Head Ring</label>
  </span>
  <span class="w110">
	<input type="checkbox" id="Horseshoe">
	<label for="Horseshoe">Horseshoe</label>
  </span>
  <br>
  <span class="w120"></span>
  <span><input type="text" class="w500" id="อุปกรณ์ยึดผู้ป่วย"></span>
 </div>
 <br>
 <div title="เครื่องตัดกระดูก">
  <span class="w110">เครื่องตัดกระดูก</span>
  <span class="w150">
	<input type="checkbox" id="HighSpeedDrill">
	<label for="HighSpeedDrill">High Speed Drill</label>
  </span>
  <span class="w140">
	<input type="checkbox" id="SagittalSaw">
	<label for="SagittalSaw">Sagittal Saw</label>
  </span>
  <span class="w110">
	<input type="checkbox" id="Osteotome">
	<label for="Osteotome">Osteotome</label>
  </span>
  <br>
  <span class="w120"></span>
  <span><input type="text" class="w500" id="เครื่องตัดกระดูก"></span>
 </div>
 <br>
 <div title="กล้อง">
  <span class="w110">กล้อง</span>
  <span class="w150">
	<input type="checkbox" id="Microscope">
	<label for="Microscope">Microscope</label>
  </span>
  <span class="w140">
	<input type="checkbox" id="ICG">
	<label for="ICG">ICG</label>
  </span>
  <span class="w110">
	<input type="checkbox" id="Endoscope">
	<label for="Endoscope">Endoscope</label>
  </span>
  <br>
  <span class="w120"></span>
  <span><input type="text" placeholder="ระบุยี่ห้อ" class="w500" id="กล้อง"></span>
 </div>
 <br>
 <div title="Retractor">
  <span class="w110">Retractor</span>
  <span class="w150">
	<input type="checkbox" id="Leylar">
	<label for="Leylar">Leylar</label>
  </span>
  <span class="w140">
	<input type="checkbox" id="Halo">
	<label for="Halo">Halo</label>
  </span>
  <span class="w110">
	<input type="checkbox" id="Greenberg">
	<label for="Greenberg">Greenberg</label>
  </span>
  <br>
  <span class="w120"></span>
  <span><input type="text" class="w500" id="Retractor"></span>
 </div>
 <br>
 <div title="CUSA">
  <span class="w110">CUSA</span>
  <span class="w150">
	<input type="checkbox" id="Excell">
	<label for="Excell">Excell</label>
  </span>
  <span class="w140">
	<input type="checkbox" id="Soring">
	<label for="Soring">Soring</label>
  </span>
  <span class="w110">
	<input type="checkbox" id="Sonar">
	<label for="Sonar">Sonar</label>
  </span>
  <br>
  <span class="w120"></span>
  <span><input type="text" class="w500" id="CUSA"></span>
 </div>
 <br>
 <div title="U/S">
  <span class="w110">U/S</span>
  <span class="w150">
	<input type="checkbox" id="ultrasound">
	<label for="ultrasound">Ultrasound</label>
  </span>
  <span class="w140">
	<input type="checkbox" id="Doppler">
	<label for="Doppler">Doppler</label>
  </span>
  <span class="w110">
	<input type="checkbox" id="Duplex">
	<label for="Duplex">Duplex</label>
  </span>
  <br>
  <span class="w120"></span>
  <span><input type="text" class="w500" id="U/S"></span>
 </div>
 <br>
 <div title="Shunt">
  <span class="w110" id="clearShunt">Shunt <small>(คลิกลบ)</small></span>
  <span class="w70">Pudenz</span>
  <span class="w22">หัว</span>
  <span class="w50">
	<input type="radio" name="head" id="Pudenz_proximalLow">
	<label for="Pudenz_proximalLow">low</label>
  </span>
  <span class="w55">
	<input type="radio" name="head" id="Pudenz_proximalMedium">
	<label for="Pudenz_proximalMedium">med</label>
  </span>
  <span class="w85">
	<input type="radio" name="head" id="Pudenz_proximalHigh">
	<label for="Pudenz_proximalHigh">high</label>
  </span>
  <span class="w30">ท้อง</span>
  <span class="w50">
	<input type="radio" name="peritoneum" id="Pudenz_distalLow">
	<label for="Pudenz_distalLow">low</label>
  </span>
  <span class="w55">
	<input type="radio" name="peritoneum" id="Pudenz_distalMedium">
	<label for="Pudenz_distalMedium">med</label>
  </span>
  <span>
	<input type="radio" name="peritoneum" id="Pudenz_distalHigh">
	<label for="Pudenz_distalHigh">high</label>
  </span>
  <br>
  <span class="w110"></span>
  <span class="w150">Programmable</span>
  <span class="w140">
	<input type="radio" name="program" id="shunt_Medtronic">
	<label for="shunt_Medtronic">Medtronic</label>
  </span>
  <span class="w100">
	<input type="radio" name="program" id="shunt_Codman">
	<label for="shunt_Codman">Codman</label>
  </span>
  <span class="w100">
	<input type="radio" name="program" id="shunt_proGAV">
	<label for="shunt_proGAV">proGAV</label>
  </span>
  <br>
  <span class="w120"></span>
  <span><input type="text" class="w500" id="Shunt"></span>
 </div>
 <br>
 <div title="เครื่องมือบริษัท">
  <span class="w110">เครื่องมือบริษัท </span>
  <span class="w150">เวลาส่งเครื่อง 
	<input type="text" class="w40 textcenter" id="เวลาส่งเครื่อง"> น. 
  </span>
  <br>
  <span class="w120"></span>
  <span><input type="text" placeholder="ชื่อบริษัท ชื่อเครื่องมือ" class="w500" id="เครื่องมือบริษัท"></span>
 </div>
 <br>
 <div title="อุปกรณ์อื่นๆ">
  <span class="w110">อุปกรณ์อื่นๆ</span>
  <span class="w200">
	<input type="checkbox" id="cranioplastic_Cement">
	<label for="cranioplastic_Cement">Cranioplastic cement</label>
  </span>
  <span class="w120">
	<input type="checkbox" id="MTEC_skull">
	<label for="MTEC_skull">MTEC skull</label>
  </span>
  <br>
  <span class="w120"></span>
  <span><input type="text" class="w500" id="อุปกรณ์อื่นๆ"></span>
 </div>
 <br>
 <div title="Monitor">
  <span class="w110">Monitor</span>
  <span class="w73"><input type="checkbox" id="CN5"><label for="CN5">CN5</label></span>
  <span class="w73"><input type="checkbox" id="CN6"><label for="CN6">CN6</label></span>
  <span class="w70"><input type="checkbox" id="CN7"><label for="CN7">CN7</label></span>
  <span class="w70"><input type="checkbox" id="CN8"><label for="CN8">CN8</label></span>
  <span class="w70"><input type="checkbox" id="SSEP"><label for="SSEP">SSEP</label></span>
  <span class="w65"><input type="checkbox" id="EMG"><label for="EMG">EMG</label></span>
  <span class="w65"><input type="checkbox" id="MEP"><label for="MEP">MEP</label></span>
  <br>
  <span class="w120"></span>
  <span><input type="text" placeholder="อื่นๆ" class="w500" id="Monitor"></span>
 </div>
 <br>
 <div title="Notice">
  <span class="w110 floatleft">Notice</span>
  <span> <textarea placeholder="เครื่องมือพิเศษอื่นๆ" id="Notice"></textarea></span>
 </div>
 <br>
 <div>
  <span class="w350"></span>
  <span class="w70"> Edited by </span>
  <span style="position:absolute" id="editedby"></span>
 </div>
 <br>
</div>

<div id="dialogReadme"></div>

<!-- For IE that not support <a download>, used in Export to Excel -->
<iframe id="txtArea1"></iframe>

</BODY>
</HTML>
