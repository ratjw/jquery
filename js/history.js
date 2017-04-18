function editHistory(rowmain, qn)
{
	if (rowmain.cells[QN].innerHTML)
	{
		var sql = "sqlReturnData=SELECT * FROM bookhistory "
		sql += "WHERE qn="+ qn +";"

		Ajax(MYSQLIPHP, sql, callbackeditHistory)
	}

	clearEditcellData("hide")

	function callbackeditHistory(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert("Data history DBfailed!\n" + response)
		else
			makehistory(rowmain, response)
	}
}

function makehistory(rowmain, response)
{
	var history = JSON.parse(response)

	$('#historytbl').attr('id', '')

	var HTML_String = '<table id = "historytbl">';
	HTML_String += '<tr>';
	HTML_String += '<th style="width:10%">Date Time</th>';
	HTML_String += '<th style="width:30%">Diagnosis</th>';
	HTML_String += '<th style="width:30%">Treatment</th>';
	HTML_String += '<th style="width:25%">Notice</th>';
	HTML_String += '<th style="width:5%">Editor</th>';
	HTML_String += '</tr>';
	for (var j = 0; j < history.length; j++) 
	{
		if ((history[j].action == 'insert' || history[j].action == 'update') && 
			!history[j].diagnosis && 
			!history[j].treatment && 
			!history[j].contact)
			continue
		if (history[j].action == 'delete') {
			HTML_String += '<tr style="background-color:#FFCCCC">';
		}
		else if (history[j].action == 'undelete') {
			HTML_String += '<tr style="background-color:#CCFFCC">';
		} else {
			HTML_String += '<tr>';
		}
		HTML_String += '<td>' + history[j].editdatetime +'</td>';
		HTML_String += '<td>' + history[j].diagnosis +'</td>';
		HTML_String += '<td>' + history[j].treatment +'</td>';
		HTML_String += '<td>' + history[j].contact +'</td>';
		HTML_String += '<td>' + history[j].editor +'</td>';
		HTML_String += '</tr>';
	}
	HTML_String += '</table>';

	$("#dialogOplog").css("height", 0)
	$('#dialogOplog').html(HTML_String)
	$('#dialogOplog').dialog({
		title: rowmain.cells[HN].innerHTML +' '+ rowmain.cells[NAME].innerHTML,
		closeOnEscape: true,
		modal: true
	})

	$('#dialogOplog').dialog({
		width: window.innerWidth * 9 / 10,
		height: window.innerHeight * 8 / 10
	})
}

function deleteHistory()
{
	var sql = "sqlReturnData=SELECT editdatetime, b.opdate, b.staffname, "
		sql += "b.hn, b.patient, b.diagnosis, b.treatment, b.contact, b.editor, b.qn "
		sql += "FROM book b INNER JOIN bookhistory bh ON b.qn = bh.qn "
		sql += "WHERE b.waitnum IS NULL AND bh.waitnum IS NULL "
		sql += "ORDER BY editdatetime DESC;"

	Ajax(MYSQLIPHP, sql, callbackdeleteHistory)

	clearEditcellData("hide")

	function callbackdeleteHistory(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert("Delete history DBfailed!\n" + response)
		else
			makeDeleteHistory(response)
	}
}

function makeDeleteHistory(response)
{
	var history = JSON.parse(response);

	$('#historytbl').attr('id', '')

	var HTML_String = '<table id = "historytbl">';
	HTML_String += '<tr>';
	HTML_String += '<th style="width:10%">Date Time</th>';
	HTML_String += '<th style="width:5%">Op.Date</th>';
	HTML_String += '<th style="width:5%">Staff</th>';
	HTML_String += '<th style="width:5%">HN</th>';
	HTML_String += '<th style="width:10%">Patient Name</th>';
	HTML_String += '<th style="width:20%">Diagnosis</th>';
	HTML_String += '<th style="width:20%">Treatment</th>';
	HTML_String += '<th style="width:20%">Contact</th>';
	HTML_String += '<th style="width:5%">Editor</th>';
	HTML_String += '<th style="display:none"></th>';
	HTML_String += '</tr>';
	for (var j = 0; j < history.length; j++) 
	{
		HTML_String += '<tr>';
		HTML_String += '<td onclick="undelete(this)">' + history[j].editdatetime +'</td>';
		HTML_String += '<td>' + history[j].opdate +'</td>';
		HTML_String += '<td>' + history[j].staffname +'</td>';
		HTML_String += '<td>' + history[j].hn +'</td>';
		HTML_String += '<td>' + history[j].patient +'</td>';
		HTML_String += '<td>' + history[j].diagnosis +'</td>';
		HTML_String += '<td>' + history[j].treatment +'</td>';
		HTML_String += '<td>' + history[j].contact +'</td>';
		HTML_String += '<td>' + history[j].editor +'</td>';
		HTML_String += '<td style="display:none">' + history[j].qn +'</td>';
		HTML_String += '</tr>';
	}
	HTML_String += '</table>';

	$("#dialogDeleted").css("height", 0)
	$('#dialogDeleted').find('table').replaceWith(HTML_String)
	$("#undelete").hide()
	$('#dialogDeleted').dialog({
		title: "Deleted Cases",
		closeOnEscape: true,
		modal: true
	})

	$('#dialogDeleted').dialog({
		width: window.innerWidth * 9 / 10,
		height: window.innerHeight * 8 / 10
	})
}

function undelete(thiscase) 
{
	reposition("#undelete", "left center", "left center", thiscase)

	doUndelete = function() 
	{
		var qn = $(thiscase).siblings(":last").html()

		var sqlstring = "sqlReturnbook=UPDATE book SET "
		sqlstring += "waitnum = 1"
		sqlstring += ", editor = '"+ THISUSER
		sqlstring += "' WHERE qn = " + qn + ";"

		Ajax(MYSQLIPHP, sqlstring, callbackUndelete);

		$('#dialogDeleted').dialog("close")

		function callbackUndelete(response)
		{
			if (!response || response.indexOf("DBfailed") != -1)
			{
				alert("Failed! update database \n\n" + response)
			}
			else
			{
				updateBOOK(response);
				refillall()
			}
		}
	}
}

function closeUndel() 
{
	$('#undelete').hide()
}

function PACS(hn) 
{ 
	var sql = "PAC=http://synapse/explore.asp"

	Ajax(CHECKPAC, sql, callbackCHECKPAC)

	clearEditcellData("hide")

	function callbackCHECKPAC(response)
	{
		if (!response || response.indexOf("PAC") == -1)
			alert(response)
		else
			open('http://synapse/explore.asp?path=/All Patients/InternalPatientUID='+hn);
	}
} 
