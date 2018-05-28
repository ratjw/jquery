
function editHistory(row, qn)
{
	var sql = "sqlReturnData=SELECT * FROM bookhistory "
			+ "WHERE qn="+ qn +" ORDER BY editdatetime DESC;"

	Ajax(MYSQLIPHP, sql, callbackeditHistory)

	clearEditcell()

	function callbackeditHistory(response)
	{
		if (/dob/.test(response)) {
			makehistory(row, response)
		} else {
			Alert("editHistory", response)
		}
	}
}

function makehistory(row, response)
{
	var tracing	= JSON.parse(response),
		$historytbl = $('#historytbl'),
		hn = row.cells[HN].innerHTML,
		nam = row.cells[PATIENT].innerHTML,
		name = nam && nam.replace('<br>', ' '),
		$dialogHistory = $("#dialogHistory")
	
	// delete previous table lest it accumulates
	$historytbl.find('tr').slice(1).remove()

	$.each( tracing, function() {
		$('#historycells tr').clone()
			.appendTo($historytbl.find('tbody'))
				.filldataHistory(this)
	});

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
			width: window.innerWidth * 95 / 100,
			height: window.innerHeight * 95 / 100
		})
		winResizeFix($historytbl, $dialogHistory)
	}
}

jQuery.fn.extend({
	filldataHistory : function(q) {
		var cells = this[0].cells

		// Define colors for deleted and undeleted rows
		q.action === 'delete'
		? this.addClass("deleted")
		: (q.action === 'undelete') && this.addClass("undelete")

		cells[0].innerHTML = putThdate(q.opdate)
		cells[1].innerHTML = q.oproom
		cells[2].innerHTML = putCasenumTime(q)
		cells[3].innerHTML = q.staffname
		cells[4].innerHTML = q.diagnosis
		cells[5].innerHTML = q.treatment
		cells[6].innerHTML = q.admission
		cells[7].innerHTML = q.final
		cells[8].innerHTML = showEquip(q.equipment)
		cells[9].innerHTML = q.contact
		cells[10].innerHTML = q.editor
		cells[11].innerHTML = q.editdatetime
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
			+ "FROM (SELECT editdatetime, b.* "
				+ "FROM book b INNER JOIN bookhistory bh ON b.qn = bh.qn "
				+ "WHERE b.deleted > 0 AND bh.action = 'delete' GROUP BY b.qn) a "
			+ "ORDER BY a.editdatetime DESC;"

	Ajax(MYSQLIPHP, sql, callbackdeletedCases)

	function callbackdeletedCases(response)
	{
		if (/editdatetime/.test(response)) {
			makedeletedCases(response)
		} else {
			Alert("deletedCases", response)
		}
	}
}

function makedeletedCases(response)
{
	var deleted = JSON.parse(response),
		$deletedtbl = $('#deletedtbl')

	// delete previous table lest it accumulates
	$deletedtbl.find('tr').slice(1).remove()

	$.each( deleted, function() {	// each === this
		$('#deletedcells tr').clone()
			.appendTo($deletedtbl.find('tbody'))
				.filldataDeleted(this)
	});

	var $dialogDeleted = $("#dialogDeleted")
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
			$("#dialogInput").dialog("close")
		}
	})
	$deletedtbl.fixMe($dialogDeleted);

	var $undelete = $("#undelete")
	$undelete.hide()
	$undelete.off("click").on("click", function () { closeUndel() }).hide()
	$(".toUndelete").off("click").on("click", function () {
		toUndelete(this, deleted)
	})

	//for resizing dialogs in landscape / portrait view
	$(window).on("resize", resizeDeleted )

	function resizeDeleted() {
		$dialogDeleted.dialog({
			width: window.innerWidth * 95 / 100,
			height: window.innerHeight * 95 / 100
		})
		winResizeFix($deletedtbl, $dialogDeleted)
	}
}

jQuery.fn.extend({
	filldataDeleted : function(q) {
		let cells = this[0].cells

		cells[0].className = "toUndelete"
		cells[0].innerHTML = putThdate(q.opdate)
		cells[1].innerHTML = q.staffname
		cells[2].innerHTML = q.hn
		cells[3].innerHTML = q.patient
		cells[4].innerHTML = q.diagnosis
		cells[5].innerHTML = q.treatment
		cells[6].innerHTML = q.contact
		cells[7].innerHTML = q.editor
		cells[8].innerHTML = q.editdatetime
		cells[9].innerHTML = q.qn
	}
})

function toUndelete(thisWhen, deleted) 
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
	var $thisWhen			= $(thisWhen)

	reposition($("#undelete"), "left center", "left center", $thisWhen)
	$("#undel").on("click", function() {
		var $thiscase = $thisWhen.closest("tr").children("td"),
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

		Ajax(MYSQLIPHP, sql, callbacktoUndelete);

		$('#dialogDeleted').dialog("close")

		function callbacktoUndelete(response)
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
				Alert("toUndelete", response)
			}
		}
		
	})
}

function closeUndel() 
{
	$('#undelete').hide()
}

// All cases (include consult cases, exclude deleted ones)
function allCases()
{
	var sql = "sqlReturnData=SELECT * FROM book WHERE deleted=0 ORDER BY opdate;"

	Ajax(MYSQLIPHP, sql, callbackAllCases)

	function callbackAllCases(response)
	{
		if (/dob/.test(response)) {
			makeAllCases(response)
		} else {
			Alert("allCases", response)
		}
	}
}

// Make box dialog dialogAll containing alltbl
function makeAllCases(response)
{
	var book = JSON.parse(response),

		start = book[0].opdate,
		k = findStartRowInBOOK(book, LARGESTDATE),
		until = book[k-1].opdate,

		$dialogAll = $("#dialogAll"),
		$alltbl = $("#alltbl"),
		alltbl = $alltbl[0]

	if (book.length === 0) { book.push({"opdate" : today.ISOdate()}) }

	$alltbl.find("tbody").html($("#tbl tbody tr:first").clone())

//	fillall(book, alltbl, start, until)

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
			$("#dialogInput").dialog("close")
		},
		buttons: [
			{
				text: "<<< Prev Year",
				width: "120",
				class: "Aqua",
				click: function () {
					fillForRoom(opdate.nextdays(-1))
				}
			},
			{
				text: "<< Prev Month",
				width: "120",
				class: "lightAqua",
				click: function () {
					fillForRoom(opdate.nextdays(-1))
				}
			},
			{
				text: "< Prev Week",
				width: "120",
				class: "marginright",
				click: function () {
					if (i > 0) {
						i = i-1
						showCase()
					}
				}
			},
			{
				width: "50",
				click: function () { return }
			},
			{
				text: "Next Week >",
				width: "120",
				click: function () {
					if (i < slen-1) {
						i = i+1
						showCase()
					}
				}
			},
			{
				text: "Next Month >>",
				width: "120",
				class: "lightAqua",
				click: function () {
					fillForRoom(opdate.nextdays(-1))
				}
			},
			{
				text: "Next Year >>>",
				width: "120",
				class: "Aqua",
				click: function () {
					fillForRoom(opdate.nextdays(+1))
				}
			}
		]
	})

	//for resizing dialogs in landscape / portrait view
	$(window).on("resize", resizeAll )

	function resizeAll() {
		$dialogAll.dialog({
			width: window.innerWidth * 95 / 100,
			height: window.innerHeight * 95 / 100
		})
		winResizeFix($alltbl, $dialogAll)
	}

	//scroll to today
	var today = new Date().ISOdate().thDate()
	var thishead = $alltbl.find("tr:contains(" + today + ")")[0]
	$dialogAll.animate({
		scrollTop: thishead.offsetTop
	}, 300);

	$dialogAll.find('.pacs').on("click", function() {
		if (gv.isPACS) {
			PACS(this.innerHTML)
		}
	})
	$dialogAll.find('.camera').on("click", function() {
		var patient = this.innerHTML
		// this.previousSibling.innerHTML -> #text !!!
		// this table is generated by browser so it has preceded #text
		// dialogFind table is generated by Javascript and has no preceded #text
		var hn = $(this).prev().html()

		showUpload(hn, patient)
	})
}

function search()
{
	var $dialogInput = $("#dialogInput"),
		$stafflist = $('#stafflist')

	$dialogInput.dialog({
		title: "Search",
		closeOnEscape: true,
		modal: true,
		width: 500,
		height: 350,
		buttons: [
			{
				text: "All Saved Cases",
				class: "undelete leftButton",
				width: "150",
				click: function () { allCases() }
			},
			{
				text: "All Deleted Cases",
				class: "deleted",
				width: "150",
				click: function () { deletedCases() }
			}
		],
		close: function() {
			$stafflist.hide()
		}
	})

	$dialogInput.off("click").on("click", function(event) {
		var target = event.target

		if ($stafflist.is(":visible")) {
			$stafflist.hide();
		} else {
			if ($(target).closest('input[name="staffname"]').length) {
				getSaffName(target)
			}
		}
	})
	.off("keydown").on("keydown", function(event) {
		var keycode = event.which || window.event.keyCode
		if (keycode === 13) { searchDB() }
	})
	.find("img").off("click").on("click", function(event) { searchDB() })
}

function getSaffName(pointing)
{
	var $stafflist = $("#stafflist"),
		$pointing = $(pointing)

	$stafflist.appendTo($pointing.closest('div'))
	$stafflist.menu({
		select: function( event, ui ) {
			pointing.value = ui.item.text()
			$stafflist.hide()
			event.stopPropagation()
		}
	})

	reposition($stafflist, "left top", "left bottom", $pointing)
	menustyle($stafflist, $pointing)
}

function searchDB()
{
	var hn = $('input[name="hn"]').val(),
		staffname = $('input[name="staffname"]').val(),
		others = $('input[name="others"]').val(),
		$dialogInput = $("#dialogInput"),
		sql = "", search = ""

	// for dialog title
	search += hn
	search += (search && staffname ? ", " : "") + staffname
	search += (search && others ? ", " : "") + others
	if (search) {
		sql = "hn=" + hn
			+ "&staffname=" + staffname
			+ "&others=" + others

		Ajax(SEARCH, sql, callbackfind)

	} else {
		Alert("Search: ''", "<br><br>No Result")
	}

	function callbackfind(response)
	{
		if (/dob/.test(response)) {
			makeFind(response, search)
		} else {
			Alert("Search: " + search, response)
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

	var $dialogFind = $("#dialogFind"),
		$findtbl = $("#findtbl")
	
	$dialogFind.dialog({
		title: "Search: " + search,
		closeOnEscape: true,
		modal: true,
		width: window.innerWidth*95/100,
		height: window.innerHeight*95/100,
		buttons: [
			{
				text: "Export to xls",
				click: function() {
					exportFindToExcel(search)
				}
			}
		],
		close: function() {
			$(window).off("resize", resizeFind )
			$(".fixed").remove()
			$("#dialogInput").dialog("close")
			$(".bordergroove").removeClass("bordergroove")
		}
	})

	// delete previous table lest it accumulates
	$findtbl.find('tr').slice(1).remove()

	$.each( found, function() {	// each === this
		$('#findcells tr').clone()
			.appendTo($findtbl.find('tbody'))
				.filldataFind(this)
	});
	$findtbl.fixMe($dialogFind);

	//for resizing dialogs in landscape / portrait view
	$(window).on("resize", resizeFind )

	function resizeFind() {
		$dialogFind.dialog({
			width: window.innerWidth,
			height: window.innerHeight
		})
		winResizeFix($findtbl, $dialogFind)
	}

	$dialogFind.find('.pacs').on("click", function() {
		if (gv.isPACS) {
			PACS(this.innerHTML)
		}
	})
	$dialogFind.find('.camera').on("click", function() {
		var patient = this.innerHTML
		var hn = this.previousSibling.innerHTML

		showUpload(hn)
	})

	//scroll to todate when there many cases
	var today = new Date(),
		todate = today.ISOdate(),
		thishead

	$findtbl.find("tr").each(function() {
		thishead = this
		return this.cells[OPDATE].innerHTML.numDate() < todate
	})
	$dialogFind.animate({
		scrollTop: $(thishead).offset().top - $dialogFind.height()
	}, 300);
}

jQuery.fn.extend({
	filldataFind : function(q) {
		var cells = this[0].cells

		Number(q.deleted) && this.addClass("deleted")
		q.hn && gv.isPACS && (cells[2].className = "pacs")
		q.patient && (cells[3].className = "camera")

		cells[0].innerHTML = putThdate(q.opdate)
		cells[1].innerHTML = q.staffname
		cells[2].innerHTML = q.hn
		cells[3].innerHTML = q.patient
		cells[4].innerHTML = q.diagnosis
		cells[5].innerHTML = q.treatment
		cells[6].innerHTML = q.admission
		cells[7].innerHTML = q.final
		cells[8].innerHTML = q.contact
	}
})

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

function showUpload(hn, patient)
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
	var $dialogReadme = $('#dialogReadme')
	$dialogReadme.show()
	$dialogReadme.dialog({
		title: "ReadMe",
		closeOnEscape: true,
		modal: true,
		width: window.innerWidth * 5 / 10,
		minWidth: 400,
		height: window.innerHeight * 9 / 10
	}).fadeIn();
}

function Alert(title, message)
{
	var $dialogAlert = $("#dialogAlert")
	$dialogAlert.css({
		"fontSize":" 14px",
		"textAlign" : "center"
	})
	$dialogAlert.html(message)
	$dialogAlert.dialog({
		title: title,
		closeOnEscape: true,
		modal: true,
		minWidth: 400,
		height: 230
	}).fadeIn();
}
