
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
	var tracing	= JSON.parse(response),
		$historytbl = $('#historytbl')
	
	// delete previous table lest it accumulates
	$('#historytbl tr').slice(1).remove()

	$.each( tracing, function() {
		$('#historycells tr').clone()
			.appendTo($('#historytbl tbody'))
				.filldataHistory(this)
	});

	var hn = row.cells[HN].innerHTML,
		nam = row.cells[NAME].innerHTML,
		name = nam && nam.replace('<br>', ' '),
		$dialogHistory = $("#dialogHistory")
	$dialogHistory.css("height", 0)
	$dialogHistory.dialog({
		title: hn +' '+ name,
		closeOnEscape: true,
		modal: true,
		hide: 200,
		width: window.innerWidth * 95 / 100,
		height: window.innerHeight * 95 / 100,
		close: function() {
			$(window).off("resize", resizeHistory )
			$(".fixed").remove()
		}
	})

	$historytbl.fixMe($dialogHistory);

	//for resizing dialogs in landscape / portrait view
	$(window).on("resize", resizeHistory )

	function resizeHistory() {
		$dialogHistory.dialog({
			width: window.innerWidth * 9 / 10,
			height: window.innerHeight * 8 / 10
		})
		winResizeFix($historytbl, $dialogHistory)
	}
}

jQuery.fn.extend({
	filldataHistory : function(q) {
		var cells = this[0].cells

		// Define colors for deleted and undeleted rows
		q.action === 'delete'
		? this.css("background-color", "#FFCCCC")
		: (q.action === 'undelete') && this.css("background-color", "#CCFFCC")

		cells[0].innerHTML = q.editdatetime
		cells[1].innerHTML = putOpdate(q.opdate)
		cells[2].innerHTML = q.oproom
		cells[3].innerHTML = putCasenumTime(q)
		cells[4].innerHTML = q.staffname
		cells[5].innerHTML = q.diagnosis
		cells[6].innerHTML = q.treatment
		cells[7].innerHTML = q.admission
		cells[8].innerHTML = q.final
		cells[9].innerHTML = showEquip(q.equipment)
		cells[10].innerHTML = q.contact
		cells[11].innerHTML = q.editor
	}
})

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
				+ "WHERE b.deleted > 0 AND bh.action = 'delete' GROUP BY b.qn) a "
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
	var deleted = JSON.parse(response),
		$deletedtbl = $('#deletedtbl')

	// delete previous table lest it accumulates
	$('#deletedtbl tr').slice(1).remove()

	$.each( deleted, function() {	// each === this
		$('#deletedcells tr').clone()
			.appendTo($('#deletedtbl tbody'))
				.filldataDeleted(this)
	});

	var $dialogDeleted = $("#dialogDeleted")
	$dialogDeleted.css("height", 0)
	$dialogDeleted.dialog({
		title: "All Deleted Cases",
		closeOnEscape: true,
		modal: true,
		hide: 200,
		width: window.innerWidth * 95 / 100,
		height: window.innerHeight * 95 / 100,
		close: function() {
			$(window).off("resize", resizeDeleted )
			$(".fixed").remove()
		}
	})
	$deletedtbl.fixMe($("#dialogDeleted"));

	var $undelete = $("#undelete")
	$undelete.hide()
	$undelete.off("click").on("click", function () { closeUndel() }).hide()
	$(".undelete").off("click").on("click", function () {
		undelete(this, deleted)
	})

	//for resizing dialogs in landscape / portrait view
	$(window).on("resize", resizeDeleted )

	function resizeDeleted() {
		$dialogDeleted.dialog({
			width: window.innerWidth * 9 / 10,
			height: window.innerHeight * 8 / 10
		})
		winResizeFix($deletedtbl, $dialogDeleted)
	}
}

jQuery.fn.extend({
	filldataDeleted : function(q) {
		let cells = this[0].cells

		cells[0].className = "undelete"
		cells[0].innerHTML = q.editdatetime
		cells[1].innerHTML = putOpdate(q.opdate)
		cells[2].innerHTML = q.staffname
		cells[3].innerHTML = q.hn
		cells[4].innerHTML = q.patient
		cells[5].innerHTML = q.diagnosis
		cells[6].innerHTML = q.treatment
		cells[7].innerHTML = q.contact
		cells[8].innerHTML = q.editor
		cells[9].innerHTML = q.qn
		cells[9].style.display = "none"
	}
})

function undelete(thisWhen, deleted) 
{
//	var UNDELEDITDATETIME	= 0;
	var UNDELOPDATE			= 1;
	var UNDELSTAFFNAME		= 2;
//	var UNDELHN				= 3;
//	var UNDELPATIENT		= 4;
//	var UNDELDIAGNOSIS		= 5;
//	var UNDELTREATMENT		= 6;
//	var UNDELNOTE			= 7;
//	var UNDELEDITOR			= 8;
	var UNDELQN				= 9;

	reposition($("#undelete"), "left center", "left center", thisWhen)
	$("#undel").on("click", function() {
		var $thiscase = $(thisWhen).closest("tr").children("td"),
			opdateth = $thiscase.eq(UNDELOPDATE).html(),
			opdate = getOpdate(opdateth),
			staffname = $thiscase.eq(UNDELSTAFFNAME).html(),
			qn = $thiscase.eq(UNDELQN).html(),
			sql = "sqlReturnbook=",

			delrow = getBOOKrowByQN(deleted, qn),
			waitnum = delrow.waitnum || 1,
			oproom = delrow.oproom,
			casenum = delrow.casenum,

			book = (waitnum < 0)? gv.CONSULT : gv.BOOK,
			allCases = sameDateRoomBookQN(book, opdate, oproom),
			alllen

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
		
	})
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

		showPAC(hn, patient)
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
	$("#find").show()
	$("#findtbl").hide()
	var $dialogFind = $("#dialogFind"),
		$instanceFind = $dialogFind.dialog({
		title: "Find",
		closeOnEscape: true,
		modal: true,
		width: 420,
		height: 400,
		buttons: [
			{
				text: "OK",
				click: function() {
					var args = {
						hn: $('input[name="hn"]').val(),
						patient: $('input[name="patient"]').val(),
						staffname: $('input[name="staffname"]').val(),
						diagnosis: $('input[name="diagnosis"]').val(),
						treatment: $('input[name="treatment"]').val(),
						note: $('input[name="note"]').val()
					}
					
					var search = ""
					$.each(args, function(key, val) { search += val })
					if (search) {
						sqlFind(args)
					}
					$( this ).dialog( "close" );
				}
			}
		],
		close: function() {
			$('#stafflist').hide()
		}
	})
	$dialogFind.on("keydown", function(event) {
		var keycode = event.which || window.event.keyCode
		if (keycode === 13) {
			var buttons = $instanceFind.dialog('option', 'buttons')
			buttons[0].click.apply($instanceFind)
		}
	})
	$('input[name="staffname"]').on("click", function(event) {
		getSaffName(this)
		event.stopPropagation()
	})
	$dialogFind.on("click", function(event) {
		var target = event.target,
			$stafflist = $('#stafflist')
		if ($stafflist.is(":visible")) {
			if (!$(target).closest('#stafflist').length) {
				$stafflist.hide();
			}
		}
	})
}

function getSaffName(pointing)
{
	var $stafflist = $("#stafflist"),
		width = 0

	$stafflist.appendTo($(pointing).closest('div'))
	width = $stafflist.outerWidth()

	$stafflist.menu({
		select: function( event, ui ) {
			pointing.value = ui.item.text()
			$stafflist.hide()
			event.stopPropagation()
		}
	})

	reposition($stafflist, "left center", "right center", pointing)
	menustyle($stafflist, pointing)
}

function sqlFind(args)
{
	var sql = search = ""

	$.each(args, function(key, val) {
		if (val) {
			if (sql) { sql += " AND " }
			// '%51' will be changed to 'Q' (by PHP?)
			if (parseInt(val)) {
				sql += (key + " like '" + val + "%' ")
			} else {
				sql += (key + " like '%" + val + "%' ")
			}
			if (search) { search += ", " }
			search += val
		}
	})

	sql = "sqlReturnData=SELECT * FROM book WHERE "
		+ sql
		+ "ORDER BY opdate;"

	Ajax(MYSQLIPHP, sql, callbackfind)

	clearEditcell()

	function callbackfind(response)
	{
		if (/dob/.test(response)) {
			makeFind(response, search)
		} else {
			alert("Find: " + search, response)
		}
	}
}

function makeFind(response, search)
{
	var found = JSON.parse(response);

	var show = scrolltoThisCase(found[found.length-1].qn)
	if (!show || (found.length > 1)) {
		makeDialogFound(found, search )
	}
}

function scrolltoThisCase(qn)
{
	var showtbl, showqueuetbl

	showtbl = showFind("tblcontainer", "tbl", qn)
	if (isSplited()) {
		showqueuetbl = showFind("queuecontainer", "queuetbl", qn)
	}
	return showtbl || showqueuetbl
}

function showFind(containerID, tableID, qn)
{
	var container = document.getElementById(containerID),
		row = getTableRowByQN(tableID, qn),
		scrolledTop = container.scrollTop,
		offset = row && row.offsetTop,
		height = container.offsetHeight

	$("#" + tableID + " tr.bordergroove").removeClass("bordergroove")
	if (row) {
		$(row).addClass("bordergroove")
		if (containerID === "queuecontainer") {
			height = height - 100
		}

		if ((offset < scrolledTop) || (offset > (scrolledTop + height))) {
			do {
				row = row.previousSibling
			}
			while ((offset - row.offsetTop) < height / 2)

			fakeScrollAnimate(containerID, tableID, scrolledTop, row.offsetTop)
		}
		return true
	}
}

function makeDialogFound(found, search)
{
	$("#find").hide()
	$("#findtbl").show()
	
	// delete previous table lest it accumulates
	$('#findtbl tr').slice(1).remove()

	$.each( found, function() {	// each === this
		$('#findcells tr').clone()
			.appendTo($('#findtbl tbody'))
				.filldataFind(this)
	});

	var $dialogFind = $("#dialogFind"),
		$findtbl = $("#findtbl")
	$dialogFind.css("height", 0)
	$dialogFind.dialog({
		title: "Find: " + search,
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
	$findtbl.fixMe($dialogFind);

	//for resizing dialogs in landscape / portrait view
	$(window).on("resize", resizeFind )

	function resizeFind() {
		$dialogFind.dialog({
			width: window.innerWidth * 9 / 10,
			height: window.innerHeight * 8 / 10
		})
		winResizeFix($findtbl, $dialogFind)
	}

	$('#dialogFind .pacs').on("click", function() {
		if (gv.isPACS) {
			PACS(this.innerHTML)
		}
	})
	$('#dialogFind .camera').on("click", function() {
		var patient = this.innerHTML
		var hn = this.previousSibling.innerHTML

		showPAC(hn)
	})

	//scroll to todate when there many cases
	var today = new Date(),
		todate = today.ISOdate(),
		thishead

	$("#findtbl tr").each(function() {
		thishead = this
		return this.cells[OPDATE].innerHTML.numDate() < todate
	})
	$('#dialogFind').animate({
		scrollTop: $(thishead).offset().top - $dialogFind.height()
	}, 300);
}

jQuery.fn.extend({
	filldataFind : function(q) {
		var cells = this[0].cells

		Number(q.deleted) && this.css("background-color", "#FFCCCC")
		q.hn && gv.isPACS && (cells[2].className = "pacs")
		q.patient && (cells[3].className = "camera")

		cells[0].innerHTML = putOpdate(q.opdate)
		cells[1].innerHTML = q.staffname
		cells[2].innerHTML = q.hn
		cells[3].innerHTML = q.patient
		cells[4].innerHTML = q.diagnosis
		cells[5].innerHTML = q.treatment
		cells[6].innerHTML = q.contact
		cells[7].innerHTML = q.editor
	}
})

function showPAC(hn, patient)
{
	var win = gv.uploadWindow
	if (hn) {
		if (win && !win.closed) {
			win.close();
		}
		gv.uploadWindow = win = window.open("jQuery-File-Upload", "_blank")
		win.hnName = {"hn": hn, "patient": patient}
		//hnName is a pre-defined variable in child window (jQuery-File-Upload)
	}
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
