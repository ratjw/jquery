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
			break;
		case "1":
			if (qn)
				deletecase(rowmain, qn)
			break;
		case "2":
			deleteblankrow(rowmain)
			break;
		case "3":	// NORMAL
			STATE[1] = getSunday(opdate)
			fillupnormal(opdate)
			scrollview(table, opdate)
			break
		case "4":	// queue of a day of week
			STATE[1] = (new Date(opdate)).getDay()
			fillday()
			scrollview(table, opdate)
			break
		case "5":	// queue of a staff
			STATE[1] = staffname
			fillstaff()
			scrollview(table, opdate)
			break
		case "6":
			findq()
			break;
		case "7":
			if (hn)
				PACS (hn)
			break
		case "8":
			edithistory(rowmain, qn)
			break;
		case "9":
			staffqueue(staffname)
			break;
	}
	document.getElementById("menudiv").style.height = ""
	document.getElementById("menudiv").style.display = "none"
	document.getElementById("editcell").id = ""
}

function addnewrow(rowmain)
{
	if (rowmain.cells[QN].innerHTML)	//not empty
	{
		var table = document.getElementById("tbl")
		var clone = rowmain.cloneNode(true)	//cloneNode is faster than innerHTML
		var i = rowmain.rowIndex
		while (table.rows[i].cells[OPDATE].innerHTML == table.rows[i-1].cells[OPDATE].innerHTML)
			i--		
		rowmain.parentNode.insertBefore(clone,rowmain)
		rowmain.cells[0].id = ""
		for (i=1; i<rowmain.cells.length; i++)
			rowmain.cells[i].innerHTML = ""	
		DragDrop()
	}
}

function deletecase(rowmain, qn)
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
			updateBOOK(response);
			updateBOOKFILL()
			filldeleterow(rowmain)
		}
	}
}

function deleteblankrow(rowmain)
{
	var table = document.getElementById("tbl")
	rowmain.parentNode.removeChild(rowmain)
}

function movecaseQwaitToBook(movemode, OpDateTo)
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

	Ajax(MYSQLIPHP, sql, callbackmoveQwaitToBook);

	document.getElementById("calendar").style.display = ""
		
	function callbackmoveQwaitToBook(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert ("Move failed!\n" + response)
		else
		{
			updateBOOK(response);
			refillall()
		}
		$("queuediv").css("display", "")
		$("editcell").id = ""
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
		var sql = "sqlReturnData=SELECT * FROM bookhistory "
		sql += "WHERE qn="+ qn +";"

		Ajax(MYSQLIPHP, sql, callbackedithistory)
	}

	function callbackedithistory(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
		{
			$("#alert").text("Data history DBfailed!\n" + response);
			$("#alert").fadeIn();
		}
		else if (response.indexOf("editor") == -1)
		{
			$("#alert").text("ไม่มีการแก้ไข");
			$("#alert").fadeIn();
		}
		else
		{
			makehistory(rowmain, response)
		}
	}
}

function makehistory(rowmain, response)
{

	var container = document.getElementById("container");
	var history = JSON.parse(response);

	var HTML_head = '<tr><th colspan=9>';

	var HTML_String = '<table class="historytable">';
	HTML_String += HTML_head + rowmain.cells[HN].innerHTML + ' ' + rowmain.cells[NAME].innerHTML + '</th></tr>';
	HTML_String += '<tr>';
	HTML_String += '<th style="width:40px">Action</th>';
	HTML_String += '<th style="width:15px">ที่</th>';
	HTML_String += '<th style="width:105px">Edit Date Time</th>';
	HTML_String += '<th style="width:60px">วันผ่าตัด</th>';
	HTML_String += '<th style="width:35px">ห้อง</th>';
	HTML_String += '<th style="width:30px">เวลา</th>';
	HTML_String += '<th style="width:40px">Staff</th>';
	HTML_String += '<th style="width:100px">diagnosis</th>';
	HTML_String += '<th style="width:100px">treatment</th>';
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
		HTML_String += '<td>' + history[j].diagnosis +'</td>';
		HTML_String += '<td>' + history[j].treatment +'</td>';
		HTML_String += '<td>' + history[j].tel +'</td>';
		HTML_String += '<td>' + history[j].editor +'</td>';
		HTML_String += '</tr>';
	}
	HTML_String += '</table></td></tr>';
	HTML_String += '</table>';


	container.innerHTML = HTML_String;

	$( "#container" ).dialog({
	});
}

