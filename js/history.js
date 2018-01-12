
function editHistory(row, qn)
{
	if (row.cells[QN].innerHTML)
	{
		var sql = "sqlReturnData=SELECT * FROM bookhistory "
		sql += "WHERE qn="+ qn +" ORDER BY editdatetime DESC;"

		Ajax(MYSQLIPHP, sql, callbackeditHistory)
	}

	clearEditcell()

	function callbackeditHistory(response)
	{
		if (/dob/.test(response)) {
			makehistory(row, response)
		} else {
			alert("editHistory", response)
		}
	}
}

function makehistory(row, response)
{
	var tracing	= JSON.parse(response)

	$('#historytbl').attr('id', '')

	var HTML_String = '<table id = "historytbl">';
	HTML_String += '<thead><tr>';
	HTML_String += '<th style="width:2%">When</th>';
	HTML_String += '<th style="width:2%">Date</th>';
	HTML_String += '<th style="width:2%">Room</th>';
	HTML_String += '<th style="width:2%">№</th>';
	HTML_String += '<th style="width:2%">Staff</th>';
	HTML_String += '<th style="width:15%">Diagnosis</th>';
	HTML_String += '<th style="width:15%">Treatment</th>';
	HTML_String += '<th style="width:15%">Admission</th>';
	HTML_String += '<th style="width:15%">Final Status</th>';
	HTML_String += '<th style="width:15%">Equipment</th>';
	HTML_String += '<th style="width:15%">Contact</th>';
	HTML_String += '<th style="width:2%">Editor</th>';
	HTML_String += '</tr></thead><tbody>';
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
		HTML_String += '<td data-title="Edited When">' + tracing[j].editdatetime +'</td>';
		HTML_String += '<td data-title="Date">' + (tracing[j].opdate? tracing[j].opdate : "") +'</td>';
		HTML_String += '<td data-title="Room">' + tracing[j].oproom +'</td>';
		HTML_String += '<td data-title="№">' + tracing[j].casenum +'</td>';
		HTML_String += '<td data-title="Staff">' + tracing[j].staffname +'</td>';
		HTML_String += '<td data-title="Diagnosis">' + tracing[j].diagnosis +'</td>';
		HTML_String += '<td data-title="Treatment">' + tracing[j].treatment +'</td>';
		HTML_String += '<td data-title="Admission">' + tracing[j].admission +'</td>';
		HTML_String += '<td data-title="Final Status">' + tracing[j].final +'</td>';
		HTML_String += '<td data-title="Equipment">' + showEquip(tracing[j].equipment) +'</td>';
		HTML_String += '<td data-title="Contact">' + tracing[j].contact +'</td>';
		HTML_String += '<td data-title="Editor">' + tracing[j].editor +'</td>';
		HTML_String += '</tr>';
	}
	HTML_String += '</tbody></table>';

	var $dialogHistory = $("#dialogHistory")
	$dialogHistory.css("height", 0)
	$dialogHistory.html(HTML_String)
	$dialogHistory.dialog({
		title: row.cells[HN].innerHTML +' '+ row.cells[NAME].innerHTML,
		closeOnEscape: true,
		modal: true,
		width: window.innerWidth * 9 / 10,
		height: window.innerHeight * 8 / 10,
		close: function() {
			$(window).off("resize", resizeHistory )
			$(".fixed").remove()
		}
	})
   $("#historytbl").fixMe($dialogHistory);

	//for resizing dialogs in landscape / portrait view
	$(window).on("resize", resizeHistory )

	function resizeHistory() {
		$dialogHistory.dialog({
			width: window.innerWidth * 9 / 10,
			height: window.innerHeight * 8 / 10
		})
		winResizeFix($("#historytbl"), $dialogHistory)
	}
}

function showEquip(equipString)
{
	var equip = ""

	if (equipString) {
		var equipHistory = JSON.parse(equipString)
		$.each(equipHistory, function(key, value) {
			if (value === "checked") {
					var itemname = $('#' + key).closest('div').prop("title")
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
	var sql = "sqlReturnData=SELECT a.* "
			+ "FROM (SELECT editdatetime, revision, b.* "
				+ "FROM book b INNER JOIN bookhistory bh ON b.qn = bh.qn "
				+ "WHERE b.deleted > 0 AND bh.action = 'delete') a "
			+ "ORDER BY a.editdatetime DESC;"

	Ajax(MYSQLIPHP, sql, callbackdeletedCases)

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
	HTML_String += '<thead><tr>';
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
	HTML_String += '</tr></thead><tbody>';
	for (var j = 0; j < deleted.length; j++) 
	{
		HTML_String += '<tr>';
		HTML_String += '<td data-title="Edited When" class="undelete">' + deleted[j].editdatetime +'</td>';
		HTML_String += '<td data-title="Date">' + deleted[j].opdate +'</td>';
		HTML_String += '<td data-title="Staff">' + deleted[j].staffname +'</td>';
		HTML_String += '<td data-title="HN">' + deleted[j].hn +'</td>';
		HTML_String += '<td data-title="Patient Name">' + deleted[j].patient +'</td>';
		HTML_String += '<td data-title="Diagnosis">' + deleted[j].diagnosis +'</td>';
		HTML_String += '<td data-title="Treatment">' + deleted[j].treatment +'</td>';
		HTML_String += '<td data-title="Contact">' + deleted[j].contact +'</td>';
		HTML_String += '<td data-title="Editor">' + deleted[j].editor +'</td>';
		HTML_String += '<td style="display:none">' + deleted[j].qn +'</td>';
		HTML_String += '</tr>';
	}
	HTML_String += '</tbody></table>';

	var $dialogDeleted = $("#dialogDeleted")
	$dialogDeleted.css("height", 0)
	$dialogDeleted.find('table').replaceWith(HTML_String)
	$("#undelete").hide()
	$dialogDeleted.dialog({
		title: "Deleted Cases",
		closeOnEscape: true,
		modal: true,
		width: window.innerWidth * 9 / 10,
		height: window.innerHeight * 8 / 10,
		close: function() {
			$(window).off("resize", resizeDeleted )
			$(".fixed").remove()
		}
	})
	$("#historytbl").fixMe($dialogDeleted)
	$(".undelete").on("click", function() {
		undelete(this, deleted)
	})

	//for resizing dialogs in landscape / portrait view
	$(window).on("resize", resizeDeleted )

	function resizeDeleted() {
		$dialogDeleted.dialog({
			width: window.innerWidth * 9 / 10,
			height: window.innerHeight * 8 / 10
		})
		winResizeFix($("#historytbl"), $dialogDeleted)
	}
}

function undelete(thiscase, deleted) 
{
//	var UNDELEDITDATETIME	= 0;
	var UNDELOPDATE			= 1;
	var UNDELSTAFFNAME		= 2;
//	var UNDELHN				= 3;
//	var UNDELPATIENT		= 4;
//	var UNDELDIAGNOSIS		= 5;
//	var UNDELTREATMENT		= 6;
//	var UNDELCONTACT		= 7;
//	var UNDELEDITOR			= 8;
	var UNDELQN				= 9;

	reposition($("#undelete"), "left center", "left center", thiscase)

	doUndelete = function() 
	{
		var $thiscase = $(thiscase).parent().children("td"),
			opdate = $thiscase.eq(UNDELOPDATE).html(),
			staffname = $thiscase.eq(UNDELSTAFFNAME).html(),
			qn = $thiscase.eq(UNDELQN).html(),
			sql = "sqlReturnbook=",

			delrow = getBOOKrowByQN(deleted, qn),
			waitnum = delrow.waitnum,
			oproom = delrow.oproom,
			casenum = delrow.casenum,

			book = (waitnum > 0)? gv.BOOK : gv.CONSULT,
			allCases = sameDateRoomBookQN(book, opdate, oproom),
			alllen = 0

		allCases.splice(casenum, 0, qn)
		alllen = allCases.length

		for (var i=0; i<alllen; i++) {
			if (allCases[i] === qn) {
				sql += "UPDATE book SET "
					+  "deleted=0,"
					+  "editor='" + gv.user
					+  "' WHERE qn="+ qn + ";"
			} else {
				sql += sqlCaseNum(i + 1, allCases[i])
			}
		}

		Ajax(MYSQLIPHP, sql, callbackUndelete);

		$('#dialogDeleted').dialog("close")

		function callbackUndelete(response)
		{
			if (/BOOK/.test(response)) {
				updateBOOK(response);
				refillOneDay(opdate)
				//undelete this staff's case or a Consults case
				if (isSplited() && (isStaffname(staffname) || isConsults())) {
					refillstaffqueue()
				}
				scrolltoThisCase(qn)
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

// All cases (include consult caes, exclude deleted ones)
function allCases() {
	var sql = "sqlReturnData=SELECT * FROM book "
			+ "WHERE waitnum <> 0 "
			+ "ORDER BY opdate;"

	Ajax(MYSQLIPHP, sql, callbackAllCases)

	clearEditcell()

	function callbackAllCases(response)
	{
		if (/dob/.test(response)) {
			makeAllCases(response)
		} else {
			alert("allCases", response)
		}
	}
}

// Make box dialog dialogAll containing alltbl
function makeAllCases(response) {
	var book = JSON.parse(response)

	var start = book[0].opdate
	var k = findStartRowInBOOK(book, LARGESTDATE)	//Stop row in BOOK
	var until = book[k-1].opdate

	var alltbl = document.getElementById("alltbl")

	// Delete all rows except first
	alltbl.getElementsByTagName("tbody")[0].innerHTML = alltbl.rows[0].outerHTML;

	fillall(book, alltbl, start, until)

	var $dialogAll = $("#dialogAll")
	$dialogAll.css("height", 0)
	$dialogAll.dialog({
		title: "All Cases",
		closeOnEscape: true,
		modal: true,
		hide: 200,
		width: window.innerWidth * 95 / 100,
		height: window.innerHeight * 95 / 100,
		close: function() {
			$(window).off("resize", resizeAll )
			$(".fixed").remove()
		}
	})

	//for resizing dialogs in landscape / portrait view
	$(window).on("resize", resizeAll )

	function resizeAll() {
		$dialogAll.dialog({
			width: window.innerWidth * 9 / 10,
			height: window.innerHeight * 8 / 10
		})
		winResizeFix($("#alltbl"), $dialogAll)
	}

	//scroll to today
	var today = new Date().ISOdate().thDate()
	var thishead = $("#alltbl tr:contains(" + today + ")")[0]
	$('#dialogAll').animate({
		scrollTop: thishead.offsetTop
	}, 300);

	$('#dialogAll .pacs').on("click", function() {
		if (gv.isPACS) {
			PACS(this.innerHTML)
		}
	})
	$('#dialogAll .camera').on("click", function() {
		var patient = this.innerHTML
		// this.previousSibling.innerHTML -> #text !!!
		// this table is generated by browser so it has preceded #text
		// dialogFind table is generated by Javascript and has no preceded #text
		var hn = $(this).prev().html()
		var win = gv.uploadWindow

		if (hn) {
			if (win && !win.closed) {
				win.close();
			}
			gv.uploadWindow = win = window.open("jQuery-File-Upload", "_blank")
			win.hnName = {"hn": hn, "patient": patient}
			//hnName is a pre-defined variable in child window (jQuery-File-Upload)
		}
	})
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
		makeDialogFound(found, hn )
	}
}

function scrolltoThisCase(qn)
{
	var showtbl = showFind("tblcontainer", "tbl", qn)

	if (isSplited()) {
		var showqueuetbl = showFind("queuecontainer", "queuetbl", qn)
	}
	return showtbl || showqueuetbl
}

function showFind(containerID, tableID, qn)
{
	$("#" + tableID + " tr.bordergroove").removeClass("bordergroove")
	var row = getTableRowByQN(tableID, qn)
	if (row) {
		$(row).addClass("bordergroove")
		var scrolledTop = document.getElementById(containerID).scrollTop
		var offset = row.offsetTop
		var winheight = window.innerHeight
		if (containerID === "queuecontainer") {
			winheight = winheight - 100
		}

		if ((offset < scrolledTop) || (offset > (scrolledTop + winheight))) {
			do {
				row = row.previousSibling
			} while ((offset - row.offsetTop) < winheight / 2)

			fakeScrollAnimate(containerID, tableID, scrolledTop, row.offsetTop)
		}
		return true
	}
}

function makeDialogFound(found, hn)
{
	$('#historytbl').attr('id', '')

	var HTML_String = '<table id = "historytbl">';
	HTML_String += '<thead><tr>';
	HTML_String += '<th style="width:5%">Date</th>';
	HTML_String += '<th style="width:5%">Staff</th>';
	HTML_String += '<th style="width:5%">HN</th>';
	HTML_String += '<th style="width:10%">Patient Name</th>';
	HTML_String += '<th style="width:20%">Diagnosis</th>';
	HTML_String += '<th style="width:20%">Treatment</th>';
	HTML_String += '<th style="width:20%">Contact</th>';
	HTML_String += '<th style="width:5%">Editor</th>';
	HTML_String += '</tr></thead><tbody>';
	for (var j = 0; j < found.length; j++) 
	{
		if (found[j].deleted > 0) {
			HTML_String += '<tr style="background-color:#FFCCCC">';
		} else {
			HTML_String += '<tr>';
		}
		HTML_String += '<td data-title="Date">' + found[j].opdate +'</td>';
		HTML_String += '<td data-title="Staff">' + found[j].staffname +'</td>';
		HTML_String += '<td data-title="HN"'  + (found[j].hn && gv.isPACS ? ' class="pacs"' : '')
						+ '>' + found[j].hn +'</td>';
		HTML_String += '<td data-title="Patient Name"'  + (found[j].patient ? ' class="camera"' : '')
						+ '>' + found[j].patient +'</td>';
		HTML_String += '<td data-title="Diagnosis">' + found[j].diagnosis +'</td>';
		HTML_String += '<td data-title="Treatment">' + found[j].treatment +'</td>';
		HTML_String += '<td data-title="Contact">' + found[j].contact +'</td>';
		HTML_String += '<td data-title="Editor">' + found[j].editor +'</td>';
		HTML_String += '</tr>';
	}
	HTML_String += '</tbody></table>';

	var $dialogFind = $("#dialogFind")
	$dialogFind.css("height", 0)
	$dialogFind.html(HTML_String)
	$dialogFind.dialog({
		title: "HN " + hn,
		closeOnEscape: true,
		modal: true,
		width: window.innerWidth * 9 / 10,
		height: window.innerHeight * 8 / 10,
		buttons: [],
		close: function() {
			$(window).off("resize", resizeFind )
			$(".fixed").remove()
		}
	})
	$("#historytbl").fixMe($dialogFind);

	//for resizing dialogs in landscape / portrait view
	$(window).on("resize", resizeFind )

	function resizeFind() {
		$dialogFind.dialog({
			width: window.innerWidth * 9 / 10,
			height: window.innerHeight * 8 / 10
		})
		winResizeFix($("#historytbl"), $dialogFind)
	}

	$('#dialogFind .pacs').on("click", function() {
		if (gv.isPACS) {
			PACS(this.innerHTML)
		}
	})
	$('#dialogFind .camera').on("click", function() {
		var patient = this.innerHTML
		var hn = this.previousSibling.innerHTML
		var win = gv.uploadWindow

		if (hn) {
			if (win && !win.closed) {
				win.close();
			}
			gv.uploadWindow = win = window.open("jQuery-File-Upload", "_blank")
			win.hnName = {"hn": hn, "patient": patient}
			//hnName is a pre-defined variable in child window (jQuery-File-Upload)
		}
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
		"fontSize":" 14px",
		"textAlign" : "center"
	})
	$('#dialogAlert').html(message)
	$('#dialogAlert').dialog({
		title: title,
		closeOnEscape: true,
		modal: true,
		minWidth: 400,
		height: 230
	}).fadeIn();
}
