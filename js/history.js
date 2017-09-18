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
		if (/dob/.test(response)) {
			makehistory(rowi, response)
		} else {
			alert("editHistory", response)
		}
	}
}

function makehistory(rowi, response)
{
	var tracing	= JSON.parse(response)

	$('#historytbl').attr('id', '')

	var HTML_String = '<table id = "historytbl">';
	HTML_String += '<tr>';
	HTML_String += '<th style="width:2%">When</th>';
	HTML_String += '<th style="width:2%">Date</th>';
	HTML_String += '<th style="width:2%">Room Time</th>';
	HTML_String += '<th style="width:2%">Staff</th>';
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
		if (tracing[j].action === 'delete') {
			HTML_String += '<tr style="background-color:#FFCCCC">';
		}
		else if (tracing[j].action === 'undelete') {
			HTML_String += '<tr style="background-color:#CCFFCC">';
		} else {
			HTML_String += '<tr>';
		}
		HTML_String += '<td>' + tracing[j].editdatetime +'</td>';
		HTML_String += '<td>' + (tracing[j].opdate? tracing[j].opdate : "") +'</td>';
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

	$dialogTraceBack = $("#dialogTraceBack")
	$dialogTraceBack.css("height", 0)
	$dialogTraceBack.html(HTML_String)
	$dialogTraceBack.dialog({
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
			if (value === "checked") {
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
		if (/editdatetime/.test(response)) {
			makedeletedCases(response)
		} else {
			alert("deletedCases", response)
		}
	}
}

function makedeletedCases(response)
{
	var deleted = JSON.parse(response);

	$('#historytbl').attr('id', '')

	var HTML_String = '<table id = "historytbl">';
	HTML_String += '<tr>';
	HTML_String += '<th style="width:10%">When</th>';
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
//	var EDITDATETIME	= 0;
	var OPDATE		= 1;
	var STAFFNAME		= 2;
//	var HN			= 3;
//	var PATIENT		= 4;
//	var DIAGNOSIS		= 5;
//	var TREATMENT		= 6;
//	var CONTACT		= 7;
//	var EDITOR		= 8;
	var QN			= 9;

	reposition($("#undelete"), "left center", "left center", thiscase)

	doUndelete = function() 
	{
		var $thiscase = $(thiscase).parent().children("td")
		var opdate = $thiscase.eq(OPDATE).html()
		var staffname = $thiscase.eq(STAFFNAME).html()
		var qn = $thiscase.eq(QN).html()

		var sqlstring = "functionName=findwaitnum&qn="+ qn
		sqlstring += "&editor="+ getUser()

		Ajax(MYSQLIPHP, sqlstring, callbackUndelete);

		$('#dialogDeleted').dialog("close")

		function callbackUndelete(response)
		{
			if (/BOOK/.test(response)) {
				updateBOOK(response);
				refillOneDay(opdate)
				if (($("#queuewrapper").css('display') === 'block') && 
					(($('#titlename').html() === staffname) || ($('#titlename').html() === "Consults"))) {
					refillstaffqueue()	//undelete this staff's case or a Consults case
				}
			} else {
				alert("undelete", response)
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
	var pacs = 'http://synapse/explore.asp?path=/All Patients/InternalPatientUID='+hn
	var sql = 'PAC=http://synapse/explore.asp'
	var ua = window.navigator.userAgent;
	var msie = ua.indexOf("MSIE")
	var edge = ua.indexOf("Edge")
	var IE = !!navigator.userAgent.match(/Trident.*rv\:11\./)
	var data_type = 'data:application/vnd.ms-internet explorer'

	if (msie > 0 || edge > 0 || IE) { // If Internet Explorer
		open(pacs);
	} else {
		var html = '<!DOCTYPE html><HTML><HEAD><script>function opener(){window.open("'
		html += pacs + '", "_self")}</script><body onload="opener()"></body></HEAD></HTML>'
		var a = document.createElement('a');
		document.body.appendChild(a);  // You need to add this line in FF
		a.href = data_type + ', ' + encodeURIComponent(html);
		a.download = "index.html"
		a.click();		//to test with Chrome and FF
	}
}

function find()
{
	var hn = ""
	var patient = ""
	var diagnosis = ""
	var treatment = ""
	var contact = ""

	var $dialogFind = $("#dialogFind")
		$dialogFind.css("height", 0)
		$dialogFind.html($("#find").show())
	var dialogFind	= $dialogFind.dialog({
		title: "Find",
		closeOnEscape: true,
		modal: true,
		width: 350,
		height: 350,
		buttons: [
			{
				text: "OK",
				click: function() {
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
					$( this ).dialog( "close" );
				}
			}
		]
	})
	$dialogFind.on("keydown", function(event) {
		var keycode = event.which || window.event.keyCode
		if (keycode === 13) {
			var buttons = dialogFind.dialog('option', 'buttons')
			buttons[0].click.apply(dialogFind)
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
		if (/dob/.test(response)) {
			makeFind(response, hn)
		} else {
			alert("Find", response)
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

	if ($("#queuewrapper").css('display') === 'block') {
		var showqueuetbl = showFind("queuecontainer", "queuetbl", qn)
	}
	return showtbl || showqueuetbl
}

function showFind(containerID, tableID, qn)
{
	$("#" + tableID + " tr.bordergroove").removeClass("bordergroove")
	var rowi
	$.each($("#" + tableID + " tr:has(td)"), function() {
		rowi = this
		return (this.cells[QN].innerHTML !== qn);
	})
	if (rowi.cells[QN].innerHTML === qn) {
		$(rowi).addClass("bordergroove")
		var scrolledTop = document.getElementById(containerID).scrollTop
		var offset = rowi.offsetTop
		var winheight = window.innerHeight
		if (containerID === "queuecontainer") {
			winheight = winheight - 100
		}

		if ((offset < scrolledTop) || (offset > (scrolledTop + winheight))) {
			do {
				rowi = rowi.previousSibling
			} while ((offset - rowi.offsetTop) < winheight / 2)

			fakeScrollAnimate(containerID, tableID, scrolledTop, rowi.offsetTop)
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
		title: "ReadMe",
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
