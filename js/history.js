function editHistory(rowmain, qn)
{
	if (rowmain.cells[QN].innerHTML)
	{
		var sql = "sqlReturnData=SELECT * FROM bookhistory "
		sql += "WHERE qn="+ qn +" ORDER BY editdatetime DESC;"

		Ajax(MYSQLIPHP, sql, callbackeditHistory)
	}

	clearEditcellData()

	function callbackeditHistory(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert("editHistory", response)
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
	HTML_String += '<th style="width:3%">Date Time</th>';
	HTML_String += '<th style="width:2%">Room Time</th>';
	HTML_String += '<th style="width:3%">Staff</th>';
	HTML_String += '<th style="width:15%">Diagnosis</th>';
	HTML_String += '<th style="width:15%">Treatment</th>';
	HTML_String += '<th style="width:15%">Admission</th>';
	HTML_String += '<th style="width:15%">Final Status</th>';
	HTML_String += '<th style="width:15%">Equipment</th>';
	HTML_String += '<th style="width:15%">Contact</th>';
	HTML_String += '<th style="width:2%">Editor</th>';
	HTML_String += '</tr>';
	for (var j = 0; j < history.length; j++) 
	{
		if (history[j].action == 'delete') {
			HTML_String += '<tr style="background-color:#FFCCCC">';
		}
		else if (history[j].action == 'undelete') {
			HTML_String += '<tr style="background-color:#CCFFCC">';
		} else {
			HTML_String += '<tr>';
		}
		HTML_String += '<td>' + history[j].editdatetime +'</td>';
		HTML_String += '<td>' + history[j].oproom +' '+ history[j].optime +'</td>';
		HTML_String += '<td>' + history[j].staffname +'</td>';
		HTML_String += '<td>' + history[j].diagnosis +'</td>';
		HTML_String += '<td>' + history[j].treatment +'</td>';
		HTML_String += '<td>' + history[j].admission +'</td>';
		HTML_String += '<td>' + history[j].final +'</td>';
		HTML_String += '<td>' + showEquip(history[j].equipment) +'</td>';
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
		modal: true,
		width: window.innerWidth * 9 / 10,
		height: window.innerHeight * 8 / 10
	})
}

function showEquip(equipString)
{
	var equip = ""

	if (equipString) {
		var equipHistory = JSON.parse(equipString)
		$.each(equipHistory, function(key, value) {
			if (value == "checked") {
				var itemname = $('#' + key).parent().prevAll('div').first().html()
				equip += (itemname + ":" + key + ", ")
			} else {
				equip += (key + ":" + value + ", ")
			}
		} )
	}
	return equip
}

function deleteHistory()
{
	var sql = "sqlReturnData=SELECT editdatetime, b.opdate, b.staffname, "
		sql += "b.hn, b.patient, b.diagnosis, b.treatment, b.contact, b.editor, b.qn "
		sql += "FROM book b INNER JOIN bookhistory bh ON b.qn = bh.qn "
		sql += "WHERE b.waitnum IS NULL AND bh.action = 'delete' "
		sql += "ORDER BY editdatetime DESC;"
//To do eliminate repeated cases
	Ajax(MYSQLIPHP, sql, callbackdeleteHistory)

	clearEditcellData()

	function callbackdeleteHistory(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert("deleteHistory", response)
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
	HTML_String += '<th style="width:5%">Date</th>';
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
		modal: true,
		width: window.innerWidth * 9 / 10,
		height: window.innerHeight * 8 / 10
	})
}

function undelete(thiscase) 
{
	reposition($("#undelete"), "left center", "left center", thiscase)

	doUndelete = function() 
	{
		var $thiscase = $(thiscase).parent().children("td")
		var staffname = $thiscase.eq(HSTAFFNAME).html()
		var qn = $thiscase.eq(HQN).html()

		var sqlstring = "functionName=findwaitnum&qn="+ qn
		sqlstring += "&editor="+ THISUSER

		Ajax(MYSQLIPHP, sqlstring, callbackUndelete);

		$('#dialogDeleted').dialog("close")

		function callbackUndelete(response)
		{
			if (!response || response.indexOf("DBfailed") != -1)
			{
				alert("undelete", response)
			}
			else
			{
				updateBOOK(response);
				refillall(BOOK)
				if (($("#queuewrapper").css('display') == 'block') && 
					(($('#titlename').html() == staffname) || ($('#titlename').html() == "Consults"))) {
					refillstaffqueue()
				}
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

	clearEditcellData()

	function callbackCHECKPAC(response)
	{
		if (!response || response.indexOf("PAC") == -1) {
			alert("PACS", response)
		} else {
			open('http://synapse/explore.asp?path=/All Patients/InternalPatientUID='+hn);
		}
	}
} 

function find()
{
	var hn = ""
	var patient = ""
	var diagnosis = ""
	var treatment = ""
	var contact = ""

	$("#dialogFind").css("height", 0)
	$('#dialogFind').html($('#find').show())
	$('#dialogFind').dialog({
		title: "Find",
		closeOnEscape: true,
		modal: true,
		width: window.innerWidth * 5 / 10,
		height: window.innerHeight * 5 / 10,
		buttons: {
			'OK': function () {
				hn = $('input[name="hn"]').val()
				patient = $('input[name="patient"]').val()
				diagnosis = $('input[name="diagnosis"]').val()
				treatment = $('input[name="treatment"]').val()
				contact = $('input[name="contact"]').val()
				$("body").append($('#find').hide())
				sqlFind(hn, patient, diagnosis, treatment, contact)
				$(this).dialog('close')
			}
		}
	})
}

function sqlFind(hn, patient, diagnosis, treatment, contact)
{
	var sql = "sqlReturnData=SELECT * FROM book WHERE "
		if (hn) {
			sql += "hn = '" + hn + "' "
		}
		if (patient) {
			if (hn) {
				sql += " AND patient like '%" + patient + "%' "
			} else {
				sql += "patient like '%" + patient + "%' "
			}
		}
		if (diagnosis) {
			if (hn || patient) {
				sql += " AND diagnosis like '%" + diagnosis + "%' "
			} else {
				sql += "diagnosis like '%" + diagnosis + "%' "
			}
		}
		if (treatment) {
			if (hn || patient || diagnosis) {
				sql += " AND treatment like '%" + treatment + "%' "
			} else {
				sql += "treatment like '%" + treatment + "%' "
			}
		}
		if (contact) {
			if (hn || patient || diagnosis || treatment) {
				sql += " AND contact like '%" + contact + "%' "
			} else {
				sql += "contact like '%" + contact + "%' "
			}
		}
		sql += "ORDER BY opdate DESC;"

	Ajax(MYSQLIPHP, sql, callbackfind)

	clearEditcellData()

	function callbackfind(response)
	{
		if (!response || response.indexOf("DBfailed") != -1) {
			alert("Find", response)
		} else {
			makeFind(response, hn)
		}	
	}
}

function makeFind(response, hn)
{
	var history = JSON.parse(response);

	scrolltoThisCase(history[0].qn)
	makeDialogFind(history, hn )
}

function scrolltoThisCase(qn)
{
	showFind("tblcontainer", "tbl", qn)

	if ($("#queuewrapper").css('display') == 'block') {
		showFind("queuecontainer", "queuetbl", qn)
	}
}

function showFind(containerID, tableID, qn)
{
	var table = document.getElementById(tableID)
	var i = findTablerow(tableID, qn)
	if (i) {
		var rows = table.rows
		clearBorder(rows)
		rows[i].style.border = "7px groove skyblue"
		var scrolledTop = document.getElementById(containerID).scrollTop
		var offset = rows[i].offsetTop
		var winheight = window.innerHeight
		if (containerID == "queuecontainer") {
			winheight = winheight - 100
		}

		if ((offset < scrolledTop) || (offset > (scrolledTop + winheight))) {
			do {
				i--
			} while (i && ((offset - rows[i].offsetTop) < winheight / 2))

			fakeScrollAnimate(containerID, tableID, scrolledTop, rows[i])
		}
	}
}

function makeDialogFind(history, hn)
{
	$('#historytbl').attr('id', '')

	var HTML_String = '<table id = "historytbl">';
	HTML_String += '<tr>';
	HTML_String += '<th style="width:5%">Date</th>';
	HTML_String += '<th style="width:5%">Staff</th>';
	HTML_String += '<th style="width:5%">HN</th>';
	HTML_String += '<th style="width:10%">Patient Name</th>';
	HTML_String += '<th style="width:20%">Diagnosis</th>';
	HTML_String += '<th style="width:20%">Treatment</th>';
	HTML_String += '<th style="width:20%">Contact</th>';
	HTML_String += '<th style="width:5%">Editor</th>';
	HTML_String += '</tr>';
	for (var j = 0; j < history.length; j++) 
	{
		if (!history[j].waitnum) {
			HTML_String += '<tr style="background-color:#FFCCCC">';
		} else {
			HTML_String += '<tr>';
		}
		HTML_String += '<td>' + history[j].opdate +'</td>';
		HTML_String += '<td>' + history[j].staffname +'</td>';
		HTML_String += '<td>' + history[j].hn +'</td>';
		HTML_String += '<td>' + history[j].patient +'</td>';
		HTML_String += '<td>' + history[j].diagnosis +'</td>';
		HTML_String += '<td>' + history[j].treatment +'</td>';
		HTML_String += '<td>' + history[j].contact +'</td>';
		HTML_String += '<td>' + history[j].editor +'</td>';
		HTML_String += '</tr>';
	}
	HTML_String += '</table>';

	$("#dialogFind").css("height", 0)
	$('#dialogFind').html(HTML_String)
	$('#dialogFind').dialog({
		title: "HN " + hn,
		closeOnEscape: true,
		modal: true,
		width: window.innerWidth * 9 / 10,
		height: window.innerHeight * 8 / 10,
		buttons: []
	})
}

function clearBorder(rows)
{
	for (var i = 0; i < rows.length; i++) {
		if (rows[i].style.border) {
			rows[i].style.border = ""
		}
	}
}

function readme()
{
	$('#dialogReadme').show()
	$('#dialogReadme').dialog({
		title: "โปรแกรมฟังเตียง",
		closeOnEscape: true,
		modal: true,
		width: window.innerWidth * 5 / 10,
		minWidth: 400,
		height: window.innerHeight * 9 / 10
	}).fadeIn();
}

function alert(title, message)
{
	$("#dialogAlert").css({
		"height" : 0,
		"width" : 0,
		"textAlign" : "center"
	})
	$('#dialogAlert').html(message)
	$('#dialogAlert').dialog({
		title: title,
		closeOnEscape: true,
		modal: true,
		width: window.innerWidth * 5 / 10,
		height: window.innerHeight * 5 / 10
	}).fadeIn();
}
