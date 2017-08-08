function editHistory(rowi, qn)
{
	if (rowi.cells[QN].innerHTML)
	{
		var sql = "sqlReturnData=SELECT * FROM bookhistory "
		sql += "WHERE qn="+ qn +" ORDER BY editdatetime DESC;"

		Ajax(MYSQLIPHP, sql, callbackeditHistory)
	}

	clearEditcell()

	function callbackeditHistory(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert("editHistory", response)
		else
			makehistory(rowi, response)
	}
}

function makehistory(rowi, response)
{
	var tracing	= JSON.parse(response)

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
	for (var j = 0; j < tracing.length; j++) 
	{
		if (tracing[j].action == 'delete') {
			HTML_String += '<tr style="background-color:#FFCCCC">';
		}
		else if (tracing[j].action == 'undelete') {
			HTML_String += '<tr style="background-color:#CCFFCC">';
		} else {
			HTML_String += '<tr>';
		}
		HTML_String += '<td>' + tracing[j].editdatetime +'</td>';
		HTML_String += '<td>' + tracing[j].oproom +' '+ tracing[j].optime +'</td>';
		HTML_String += '<td>' + tracing[j].staffname +'</td>';
		HTML_String += '<td>' + tracing[j].diagnosis +'</td>';
		HTML_String += '<td>' + tracing[j].treatment +'</td>';
		HTML_String += '<td>' + tracing[j].admission +'</td>';
		HTML_String += '<td>' + tracing[j].final +'</td>';
		HTML_String += '<td>' + showEquip(tracing[j].equipment) +'</td>';
		HTML_String += '<td>' + tracing[j].contact +'</td>';
		HTML_String += '<td>' + tracing[j].editor +'</td>';
		HTML_String += '</tr>';
	}
	HTML_String += '</table>';

	$("#dialogOplog").css("height", 0)
	$('#dialogOplog').html(HTML_String)
	$('#dialogOplog').dialog({
		title: rowi.cells[HN].innerHTML +' '+ rowi.cells[NAME].innerHTML,
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

function deletedCases()
{
	Ajax(MYSQLIPHP, "functionName=deletedCases", callbackdeletedCases)

	clearEditcell()

	function callbackdeletedCases(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert("deletedCases", response)
		else
			makedeletedCases(response)
	}
}

function makedeletedCases(response)
{
	var deleted = JSON.parse(response);

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
	for (var j = 0; j < deleted.length; j++) 
	{
		HTML_String += '<tr>';
		HTML_String += '<td onclick="undelete(this)">' + deleted[j].editdatetime +'</td>';
		HTML_String += '<td>' + deleted[j].opdate +'</td>';
		HTML_String += '<td>' + deleted[j].staffname +'</td>';
		HTML_String += '<td>' + deleted[j].hn +'</td>';
		HTML_String += '<td>' + deleted[j].patient +'</td>';
		HTML_String += '<td>' + deleted[j].diagnosis +'</td>';
		HTML_String += '<td>' + deleted[j].treatment +'</td>';
		HTML_String += '<td>' + deleted[j].contact +'</td>';
		HTML_String += '<td>' + deleted[j].editor +'</td>';
		HTML_String += '<td style="display:none">' + deleted[j].qn +'</td>';
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

	clearEditcell()

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
				if (!hn && !patient && !diagnosis && !treatment && !contact) {
					return
				}
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

	clearEditcell()

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
	var found = JSON.parse(response);

	var show = scrolltoThisCase(found[0].qn)
	if (!show || (found.length > 1)) {
		makeDialogFind(found, hn )
	}
}

function scrolltoThisCase(qn)
{
	var showtbl = showFind("tblcontainer", "tbl", qn)

	if ($("#queuewrapper").css('display') == 'block') {
		var showqueuetbl = showFind("queuecontainer", "queuetbl", qn)
	}
	return showtbl || showqueuetbl
}

function showFind(containerID, tableID, qn)
{
	$("#" + tableID + " tr.bordergroove").removeClass("bordergroove")
	var i = findTablerow(tableID, qn)
	if (i) {
		var rows = document.getElementById(tableID).rows
		rows[i].className = "bordergroove"
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
		return true
	}
}

function makeDialogFind(found, hn)
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
	for (var j = 0; j < found.length; j++) 
	{
		if (!found[j].waitnum) {
			HTML_String += '<tr style="background-color:#FFCCCC">';
		} else {
			HTML_String += '<tr>';
		}
		HTML_String += '<td>' + found[j].opdate +'</td>';
		HTML_String += '<td>' + found[j].staffname +'</td>';
		HTML_String += '<td>' + found[j].hn +'</td>';
		HTML_String += '<td>' + found[j].patient +'</td>';
		HTML_String += '<td>' + found[j].diagnosis +'</td>';
		HTML_String += '<td>' + found[j].treatment +'</td>';
		HTML_String += '<td>' + found[j].contact +'</td>';
		HTML_String += '<td>' + found[j].editor +'</td>';
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
		"width": "0px",
		"height": "0px",
		"fontSize":" 14px",
		"textAlign" : "center"
	})
	$('#dialogAlert').html(message)
	$('#dialogAlert').dialog({
		title: title,
		closeOnEscape: true,
		modal: true
	}).fadeIn();
}
