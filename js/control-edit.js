﻿function addnewrow(rowmain)
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
			filluprefill()
		}
	}
}

function deleteblankrow(rowmain)
{
	var table = document.getElementById("tbl")
	rowmain.parentNode.removeChild(rowmain)
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
		else
		{
			makehistory(rowmain, response)
		}
		$("#editcell").hide()
	}
}

function makehistory(rowmain, response)
{
	var history = JSON.parse(response);

	var HTML_String = '<table class="historytable">';
	HTML_String += '<tr>';
	HTML_String += '<th style="width:10%">Date Time</th>';
	HTML_String += '<th style="width:30%">Diagnosis</th>';
	HTML_String += '<th style="width:30%">Treatment</th>';
	HTML_String += '<th style="width:25%">Notice</th>';
	HTML_String += '<th style="width:5%">Editor</th>';
	HTML_String += '</tr>';
	for (var j = 0; j < history.length; j++) 
	{
		if (!history[j].diagnosis && !history[j].treatment && !history[j].tel)
			continue
		HTML_String += '<tr>';
		HTML_String += '<td>' + history[j].editdatetime +'</td>';
		HTML_String += '<td>' + history[j].diagnosis +'</td>';
		HTML_String += '<td>' + history[j].treatment +'</td>';
		HTML_String += '<td>' + history[j].tel +'</td>';
		HTML_String += '<td>' + history[j].editor +'</td>';
		HTML_String += '</tr>';
	}
	HTML_String += '</table>';

	$("#container").html(HTML_String);
	$("#container").dialog({
		dialogClass: "dialog",
		title: rowmain.cells[HN].innerHTML +' '+ rowmain.cells[NAME].innerHTML,
		height: window.innerHeight * 50 / 100,
		width: window.innerWidth * 70 / 100
	});
}

function deletehistory(rowmain, qn)
{
	var sql = "sqlReturnData=SELECT * FROM bookhistory "
		sql += "WHERE waitnum=0;"

		Ajax(MYSQLIPHP, sql, callbackdeletehistory)

	function callbackdeletehistory(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
		{
			$("#alert").text("Delete history DBfailed!\n" + response);
			$("#alert").fadeIn();
		}
		else
		{
			makeDeleteHistory(rowmain, response)
		}
		$("#editcell").hide()
	}
}

function makeDeleteHistory(rowmain, response)
{
	var history = JSON.parse(response);

	var HTML_String = '<table class="historytable">';
	HTML_String += '<tr>';
	HTML_String += '<th style="width:10%">Date Time</th>';
	HTML_String += '<th style="width:5%">HN</th>';
	HTML_String += '<th style="width:10%">Patient Name</th>';
	HTML_String += '<th style="width:25%">Diagnosis</th>';
	HTML_String += '<th style="width:25%">Treatment</th>';
	HTML_String += '<th style="width:20%">Notice</th>';
	HTML_String += '<th style="width:5%">Editor</th>';
	HTML_String += '</tr>';
	for (var j = 0; j < history.length; j++) 
	{
		HTML_String += '<tr>';
		HTML_String += '<td>' + history[j].editdatetime +'</td>';
		HTML_String += '<td>' + history[j].hn +'</td>';
		HTML_String += '<td>' + history[j].patient +'</td>';
		HTML_String += '<td>' + history[j].diagnosis +'</td>';
		HTML_String += '<td>' + history[j].treatment +'</td>';
		HTML_String += '<td>' + history[j].tel +'</td>';
		HTML_String += '<td>' + history[j].editor +'</td>';
		HTML_String += '</tr>';
	}
	HTML_String += '</table>';

	$("#container").html(HTML_String);
	$("#container").dialog({
		dialogClass: "dialog",
		title: rowmain.cells[HN].innerHTML +' '+ rowmain.cells[NAME].innerHTML,
		height: window.innerHeight * 50 / 100,
		width: window.innerWidth * 70 / 100
	});
}
