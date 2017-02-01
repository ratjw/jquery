function FirstColumn(saveval, rownum)
{
	var table = document.getElementById("tbl")
	var rowmain = table.rows[rownum]
	var qn = rowmain.cells[QN].innerHTML
	var hn = rowmain.cells[HN].innerHTML
	var opdate = rowmain.cells[OPDATE].innerHTML.numDate()	//mysql date
	var staffname = rowmain.cells[STAFFNAME].innerHTML

	switch(saveval)
	{
		case "0":
			addnewrow(rowmain)
			return;
		case "1":
			if (qn)
				deletecase(rowmain, opdate, qn)
			break;
		case "2":
			deleteblankrow(rowmain)
			break;
		case "3":
			premovecase(rowmain, qn)
			return;
		case "4":
			premovetoWaitingList(rowmain, staffname)
			return;
		case "5":
			precopycase(rowmain, qn)
			return;
		case "6":	// NORMAL
			STATE[1] = getSunday(opdate)
			fillupnormal(opdate)
			scrollview(table, opdate)
			break
		case "7":	// queue of a day of week
			STATE[1] = opdate.mysqltojsdate().getDay()
			fillday()
			scrollview(table, opdate)
			break
		case "8":	// queue of a staff
			STATE[1] = staffname
			fillstaff()
			scrollview(table, opdate)
			break
		case "9":
			findq()
			break;
		case "10":
			fillEquipTable(rownum, qn)
			break
		case "11":
			if (hn)
				PACS (hn)
			break
		case "12":
			if (hn)
				getlab(hn)
			break
		case "13":
			addUp()
			return;
		case "14":
			ConsultCalendar()
			break;
		case "15":
			edithistory(rowmain, qn)
			break;
		case "16":
			staffqueue(staffname)
			break;
	}
	document.getElementById("menudiv").style.height = ""
	document.getElementById("menudiv").style.display = ""
	stopEditmode()
}

function addnewrow(rowmain)
{
	stopEditmode()	//editmode of FirstColumn Cell was started by popup
	if (rowmain.cells[QN].innerHTML)	//not empty
	{
		var table = document.getElementById("tbl")
		var clone = rowmain.cloneNode(true)	//cloneNode is faster than innerHTML
		var i = rowmain.rowIndex
		while (table.rows[i].cells[OPDATE].innerHTML == table.rows[i-1].cells[OPDATE].innerHTML)
			i--		
		rowmain.parentNode.insertBefore(clone,rowmain)
		for (i=1; i<rowmain.cells.length; i++)
			rowmain.cells[i].innerHTML = ""	
	}
	document.getElementById("menudiv").style.display = ""	//put out the menu
	HNinput(rowmain.cells[HN])	//ready for new case
}

function deletecase(rowmain, opdate, qn)
{
	//not actually delete the case but set waitnum=0
	var sql = "sqlReturnbook=UPDATE book SET waitnum=0 WHERE qn="+ qn +";"

	Ajax(MYSQLIPHP, sql, callbackdeleterow)

	function callbackdeleterow(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert ("Delete & Refresh failed!\n" + response)
		else
		{
			updateQBOOK(response);
			updateQBOOKFILL()
			filldeleterow(rowmain, opdate, qn)
		}
	}
}

function deleteblankrow(rowmain)
{
	var table = document.getElementById("tbl")
	rowmain.parentNode.removeChild(rowmain)
}

function premovecase(rowmain, qn)
{
	stopEditmode()	//editmode of FirstColumn was started by popup
	rowmain.id = "movemode"	//start "movemode" of the "row"
	document.getElementById("menudiv").style.display = ""
//	MoveCalendar(rowmain.cells[OPDATE].innerHTML.numDate(), qn)	//show calendar for date selection
}

function premovetoWaitingList(rowmain, staffname)
{
	stopEditmode()	//editmode of FirstColumn was started by popup
	rowmain.id = "movemode"	//start "movemode" of the "row"
	document.getElementById("menudiv").style.display = ""
	staffqueue(staffname)
}

function movecaseQbookToQbook(QNfrom, OpDateTo)
{
	var table = document.getElementById("tbl")
	var sql = ""

	table.style.cursor = 'wait'
	sql = "sqlReturnbook=UPDATE book SET opdate='" + OpDateTo
	sql += "', editor='"+ THISUSER
	sql += "' WHERE qn="+ QNfrom +";"

	Ajax(MYSQLIPHP, sql, callbackmove);

	document.getElementById("calendar").style.display = ""
		
	function callbackmove(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert ("Move failed!\n" + response)
		else
		{
			updateQBOOK(response);
			updateQBOOKFILL()
			refillall()
		}
		stopEditmode()
		table.style.cursor = 'default'
	}	
}

function movecaseQwaitToQbook(movemode, OpDateTo)
{
	var table = document.getElementById("queuetbl")
	var waitnum = movemode.cells[QWAITNUM].innerHTML
	var staffname = movemode.cells[QSTAFFNAME].innerHTML
	var QNfrom = movemode.cells[QQN].innerHTML
	var sql = ""

	table.style.cursor = 'wait'
	sql = "sqlReturnbook=UPDATE book SET waitnum=null, opdate='" + OpDateTo
	sql += "', editor='"+ THISUSER
	sql += "' WHERE qn="+ QNfrom +";"
	sql += "UPDATE book SET waitnum=waitnum"+ encodeURIComponent("-")
	sql += "1 WHERE waitnum>=" + waitnum
	sql += " AND staffname='"+ staffname +"';"

	Ajax(MYSQLIPHP, sql, callbackmoveQwaitToQbook);

	document.getElementById("calendar").style.display = ""
		
	function callbackmoveQwaitToQbook(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert ("Move failed!\n" + response)
		else
		{
			updateQBOOK(response);
			refillall()
		}
		document.getElementById("queuediv").style.display = ""
		stopEditmode()
		table.style.cursor = 'default'
	}	
}

function movetoQbook(movemode, pointDate)
{
	var fromtable = gettable(movemode)
	var pointDate = pointDate.numDate()

	if (fromtable.id == "tbl")
	{
		if (movemode.cells[OPDATE].innerHTML != pointDate)
		{	//to move must click not the same day
			movecaseQbookToQbook(movemode.cells[QN].innerHTML, pointDate)
		}
	}
	else if (fromtable.id == "queuetbl")
	{
		movecaseQwaitToQbook(movemode, pointDate)
	}
}

function precopycase(rowmain, qn)
{
	stopEditmode()	//editmode of FirstColumn was started by popup
	rowmain.id = "copymode"	//start "copymode" of the "row"
	document.getElementById("menudiv").style.display = ""
//	MoveCalendar(rowmain.cells[OPDATE].innerHTML.numDate(), qn)	//show calendar for date selection
}

function copycase(OpDateTo)
{
	var table = document.getElementById("tbl")
	var CPfrom = document.getElementById("copymode")
	var HNFrom = CPfrom.cells[HN].innerHTML
	var QNfrom = CPfrom.cells[QN].innerHTML
	var teltext = ""
	var sql = ""

	//Find OPDATE of FIRSTROW from the start of QBOOKFILL
	q = 0
	while (QBOOKFILL[q] && (QBOOKFILL[q].qn != QNfrom))
		q++
	teltext = QBOOKFILL[q].tel
	table.style.cursor = 'wait'
	sql = "sqlReturnbook=INSERT INTO book SET opdate='" + OpDateTo
	sql += "', staffname='"+ QBOOKFILL[q].staffname
	sql += "', hn='"+ HNFrom
	sql += "', tel='"+ teltext
	sql += "', editor='"+ THISUSER +"';"
	sql += "INSERT INTO qbookdx SELECT LAST_INSERT_ID(),code,diagnosis,side,level,'"+ THISUSER
	sql += "' FROM qbookdx WHERE qn="+ QNfrom +";"

	Ajax(MYSQLIPHP, sql, callbackcopy);

	document.getElementById("calendar").style.display = ""
		
	function callbackcopy(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert ("Copy failed!\n" + response)
		else
		{
			updateQBOOK(response);
			refillall()
		}
		stopEditmode()
		table.style.cursor = 'default'
	}	
}

function PACS(hn) 
{ 
	open('http://synapse/explore.asp?path=/All Patients/InternalPatientUID='+hn);
} 

function edithistory(rowmain, qn)
{
	if (rowmain.cells[QN].innerHTML)
	{
		var sql = "sqlReturnData=SELECT * FROM qbookhistory "
		sql += "WHERE qn="+ qn +";"

		Ajax(MYSQLIPHP, sql, callbackedithistory)
	}

	function callbackedithistory(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert ("SELECT Data history failed!\n" + response)
		else if (response.indexOf("editor") == -1)
			alert ("ไม่มีการแก้ไข")
		else
			makehistory(rowmain, response)
	}
}

function makehistory(rowmain, response)
{
	var calendar = document.getElementById("calendar");
	var calendarin = document.getElementById("calendarin");
	var history
	if (!this.JSON)
		history = eval("("+ response +")");
	else
		history = JSON.parse(response);

	var HTML_head = '<tr><th colspan=9>';

	var HTML_String = '<table class="calendartable">';
	HTML_String += HTML_head + rowmain.cells[HN].innerHTML + ' ' + rowmain.cells[NAME].innerHTML + '</th></tr>';
	HTML_String += '<tr>';
	HTML_String += '<th style="width:40px">Action</th>';
	HTML_String += '<th style="width:15px">ที่</th>';
	HTML_String += '<th style="width:105px">Edit Date Time</th>';
	HTML_String += '<th style="width:60px">วันผ่าตัด</th>';
	HTML_String += '<th style="width:35px">ห้อง</th>';
	HTML_String += '<th style="width:30px">เวลา</th>';
	HTML_String += '<th style="width:40px">Staff</th>';
	HTML_String += '<th style="width:100px">โทรศัพท์</th>';
	HTML_String += '<th style="width:40px">editor</th>';
	HTML_String += '</tr>';
	for (var j = 0; j < history.length; j++) 
	{
		HTML_String += '<tr>';
		HTML_String += '<td>' + history[j].action +'</td>';
		HTML_String += '<td>' + history[j].revision +'</td>';
		HTML_String += '<td>' + history[j].editdatetime +'</td>';
		HTML_String += '<td>' + history[j].opdate +'</td>';
		HTML_String += '<td>' + history[j].oproom +'</td>';
		HTML_String += '<td>' + history[j].optime +'</td>';
		HTML_String += '<td>' + history[j].staffname +'</td>';
		HTML_String += '<td>' + history[j].tel +'</td>';
		HTML_String += '<td>' + history[j].editor +'</td>';
		HTML_String += '</tr>';
	}
	HTML_String += '</table></td></tr>';
	HTML_String += '</table>';

	calendar.style.display = "block";
	calendar.style.overflowY = "hidden";
	calendar.style.height = ""
	calendar.style.width = ""
	calendar.onmousedown = dragHandler;
	calendarin.style.height = ""
	calendarin.style.width = ""
	calendarin.innerHTML = HTML_String;
	if (calendarin.offsetHeight > $(window).height())
	{	//<button>+<br>+<hr> is about 50px
		calendarin.style.height = $(window).height() - 70 +"px"
		calendarin.style.overflowX = "hidden"
		calendarin.style.overflowY = "scroll"
	}
}
