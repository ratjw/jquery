
function serviceReview()
{
	resetcountService()
	$('#servicehead').hide()
	$('#servicetbl').hide()
	$('#exportService').hide()
	$('#reportService').hide()
	$('#dialogService').dialog({
		title: 'Service Neurosurgery',
		closeOnEscape: true,
		modal: true,
		width: window.innerWidth * 95 / 100,
		height: window.innerHeight * 95 / 100
	})

	$('#monthpicker').show()
	$('#monthpicker').datepicker( {
		altField: $('#monthstart'),
		altFormat: "yy-mm-dd",
		autoSize: true,
		dateFormat: "MM yy",
		monthNames: [ "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", 
					  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม" ],
		onChangeMonthYear: function (year, month, inst) {
			$(this).datepicker('setDate', new Date(inst.selectedYear, inst.selectedMonth, 1))
		},
		beforeShow: function (input, obj) {
			$('.ui-datepicker-calendar').hide()
		}
	}).datepicker("setDate", new Date(new Date().getFullYear(), new Date().getMonth(), 1))

	$('#dialogService').on("click", '.ui-datepicker-title', function() {
		entireMonth($('#monthstart').val())
	})
}

function entireMonth(fromDate)
{
	var date = new Date(fromDate),
		toDate = new Date(date.getFullYear(), date.getMonth()+1, 0),
		$monthpicker = $('#monthpicker'),
		$exportService = $("#exportService"),
		$reportService = $("#reportService"),
		title = 'Service Neurosurgery เดือน ' + $monthpicker.val()

	// show month name before change $monthpicker.val to last date of this month
	$('#dialogService').dialog({
		title: title
	})
	toDate = $.datepicker.formatDate('yy-mm-dd', toDate)
	$monthpicker.val(toDate)

	getServiceOneMonth(fromDate, toDate).then( function (SERVICE) {
		gv.SERVICE = SERVICE
		showService(fromDate, toDate)
	}, function (title, message) {
		Alert(title, message)
	})

	$('#dialogService').off("click", '.ui-datepicker-title')
	$exportService.show()
	$exportService.on("click", function(e) {
		e.preventDefault()
		exportServiceToExcel()
	})
	$reportService.show()
	$reportService.on("click", function(e) {
		e.preventDefault()
		showReportToDept(title)
	})
}

//Retrieve the specified month from server
function getServiceOneMonth(fromDate, toDate)
{
	var defer = $.Deferred(),
		sql = "sqlReturnData=SELECT * FROM book "
			  + "WHERE opdate BETWEEN '" + fromDate + "' AND '" + toDate
			  + "' AND deleted=0 "
			  + "AND waitnum<>0 "
			  + "ORDER BY opdate, oproom, casenum, waitnum;";

	Ajax(MYSQLIPHP, sql, callbackGetService)

	return defer.promise()

	function callbackGetService(response)
	{
		/dob/.test(response)
			? defer.resolve( JSON.parse(response) )
			: defer.reject("getServiceOneMonth", response)
	}
}

function showService(fromDate, toDate)
{
	//delete previous servicetbl lest it accumulates
	var $servicetbl = $('#servicetbl'),
		$servicecells = $("#servicecells"),
		opDiffQN = []

	$servicetbl.find('tr').slice(1).remove()
	$servicetbl.show()

	$.each( gv.STAFF, function() {
		var staffname = this.staffname
		$servicecells.find('tr').clone()
			.appendTo($servicetbl.find('tbody'))
				.children("td").eq(OPDATE)
					.prop("colSpan", 9)
						.addClass("serviceStaff")
							.html(staffname)
								.siblings().hide()
		var scase = 0, classname
		$.each( gv.SERVICE, function() {
			if (this.staffname === staffname) {
				if (isOpDiff(this)) {
					this.operated = "Operation"
					opDiffQN.push(this.qn)
				}
				classname = countService(this, fromDate, toDate)
				scase++
				$servicecells.find('tr').clone()
					.appendTo($servicetbl.find('tbody'))
						.filldataService(this, scase, classname)
			}
		});
	})

	var $monthpicker = $('#monthpicker'),
		$dialogService = $('#dialogService')

	$monthpicker.hide()
	$('#servicehead').show()
	$dialogService.dialog({
		hide: 200,
		width: window.innerWidth * 95 / 100,
		height: window.innerHeight * 95 / 100,
		close: function() {
			clearEditcell()
			refillstaffqueue()
			refillall()
			$(".ui-dialog:visible").find(".ui-dialog-content").dialog("close");
			$(".fixed").remove()
			$(window).off("resize", resizeDialog)
		}
	})
	getAdmitDischargeDate(gv.SERVICE, fromDate, toDate)
	countAllServices()
	if (opDiffQN.length) {
		updateBookService(opDiffQN)
	}
	$servicetbl.fixMe($dialogService)
	hoverService()

	$dialogService.off("click").on("click", function (event) {
		resetTimer();
		gv.idleCounter = 0
		event.stopPropagation()
		var	target = event.target,
			editable = fromDate >= getStart(),
			$dialogRecord = $("#dialogRecord")
		if ($dialogRecord.is(":visible")) {
			if (!$(target).closest('#dialogRecord').length) {
				$dialogRecord.hide();
			}
		}
		if (target.nodeName !== "TD" || target.colSpan > 1) {
			clearEditcell()
		} else {
			clickservice(event, target, editable)
		}
	})

	//for resizing dialogs in landscape / portrait view
	$(window).on("resize", resizeDialog)
}

function resizeDialog()
{
	$dialogService.dialog({
		width: window.innerWidth * 95 / 100,
		height: window.innerHeight * 95 / 100
	})
	winResizeFix($servicetbl, $dialogService)
}

function refillService(fromDate, toDate)
{
	var i = 0
	$.each( gv.STAFF, function() {
		var staffname = this.staffname
		i++
		var $thisCase = $('#servicetbl tr').eq(i).children("td").eq(CASENUMSV)
		if ($thisCase.prop("colSpan") === 1) {
			$thisCase.prop("colSpan", 9)
				.addClass("serviceStaff")
					.siblings().hide()
		}
		$thisCase.html(staffname)

		var scase = 0
		$.each( gv.SERVICE, function() {
			if (this.staffname === staffname) {
				var classes = countService(this, fromDate, toDate)
				i++
				scase++
				var $cells = $('#servicetbl tr').eq(i).children("td")
				if ($cells.eq(CASENUMSV).prop("colSpan") > 1) {
					$cells.eq(CASENUMSV).prop("colSpan", 1)
						.nextUntil($cells.eq(QNSV)).show()
				}
				$('#servicetbl tr').eq(i)
						.filldataService(this, scase, classes)
			}
		});
	})
	if (i < ($('#servicetbl tr').length - 1)) {
		$('#servicetbl tr').slice(i+1).remove()
	}
	countAllServices()
}

jQuery.fn.extend({
	filldataService : function(bookq, scase, classes) {
		var cells = this[0].cells
		if (bookq.hn && gv.isPACS) { cells[HNSV].className = "pacs" }
		cells[NAMESV].className = "camera"
		cells[TREATMENTSV].className = putReoperate(classes)
		cells[ADMISSIONSV].className = putReadmit(classes)
		cells[FINALSV].className = "record"
		updateRowClasses(this, classes)

		cells[CASENUMSV].innerHTML = scase
		cells[HNSV].innerHTML = bookq.hn
		cells[NAMESV].innerHTML = putNameAge(bookq)
		cells[DIAGNOSISSV].innerHTML = bookq.diagnosis
		cells[TREATMENTSV].innerHTML = bookq.treatment
		cells[ADMISSIONSV].innerHTML = bookq.admission
		cells[FINALSV].innerHTML = bookq.final
		cells[ADMITSV].innerHTML = (bookq.admit? bookq.admit : "")
		cells[DISCHARGESV].innerHTML = (bookq.discharge? bookq.discharge : "")
		cells[QNSV].innerHTML = bookq.qn
	}
})

// Simulate hover on icon by changing background pics
function hoverService()
{
	var	paleClasses = ["pacs", "camera", "record", "Operation",
						"Admit", "Reoperation", "Readmission"
		],
		boldClasses = ["pacs2", "camera2", "record2", "Operation2",
						"Admit2", "Reoperation2", "Readmission2"
		]

	$("td.pacs, td.camera, td.record, td.Operation, td.Admit,\
		td.Reoperation, td.Readmission")
	.mousemove(function(event) {
		if (inPicArea(event, this)) {
			getClass(this, paleClasses, boldClasses)
		} else {
			getClass(this, boldClasses, paleClasses)
		}
	})
	.mouseout(function (event) {
		getClass(this, boldClasses, paleClasses)
	})
}

function putReoperate(classes)
{
	if (/Reoperation/.test(classes)) {
		return "Reoperation"
	}
	else if (/Operation/.test(classes)) {
		return "Operation"
	}

	return ""
}

function putReadmit(classes)
{
	if (/Readmission/.test(classes)) {
		return "Readmission"
	}
	else if (/Admit/.test(classes)) {
		return "Admit"
	}

	return ""
}

function updateRowClasses($this, classname)
{
	if (classname) {
		$this[0].className = classname
		var $cell = $this.children("td"),
			$admit = $cell.eq(ADMISSIONSV),
			$treat = $cell.eq(TREATMENTSV),
			$final = $cell.eq(FINALSV)

		// delete cell classes except "record"
		$admit[0].className = ""
		$treat[0].className = ""
		$final[0].className = "record"

		if (/Readmission/.test(classname)) {
			$admit.addClass("Readmission")
		}
		else if (/Admit/.test(classname)) {
			$admit.addClass("Admit")
		}
		if (/Reoperation/.test(classname)) {
			$treat.addClass("Reoperation")
		}
		else if (/Operation/.test(classname)) {
			$treat.addClass("Operation")
		}
		if (/Infection/.test(classname)) {
			$final.addClass("Infection")
		}
	}
}

function updateBookService(opDiffQN)
{
	var sql = "sqlnoReturn="

	opDiffQN.forEach(function(item) {
		sql += "UPDATE book SET "
			+ "operated='Operation',"
			+ "editor='auto' "
			+ "WHERE qn=" + item + ";"
	})

	Ajax(MYSQLIPHP, sql, callbackopDiff)

	function callbackopDiff(response)
	{
		if (response !== "success") {
			Alert("getAdmitDischargeDate", response)
		}
	}
}

function getAdmitDischargeDate(fromDate, toDate)
{
	Ajax(GETIPD, "from=" + fromDate + "&to=" + toDate, callbackgetipd)

	function callbackgetipd(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)
			fillAdmitDischargeDate()
		}
//		else {
//			Alert("getAdmitDischargeDate", response)
//		}
	}
}

function fillAdmitDischargeDate()
{
	var i = 0
	$.each( gv.STAFF, function() {
		var staffname = this.staffname
		i++
		$.each( gv.SERVICE, function() {
			if (this.staffname === staffname) {
				i++
				var $thisRow = $('#servicetbl tr').eq(i),
					$cells = $thisRow.children("td")

				if (this.admit && 
					this.admit !== $cells.eq(ADMITSV).html()) {
					$cells.eq(ADMITSV).html(this.admit)
					if (!$cells.eq(ADMITSV).html()) {
						$cells.eq(ADMISSIONSV).addClass("Admit")
						$thisRow.addClass("Admit")
					}
				}
				if (this.discharge && 
					this.discharge !== $cells.eq(DISCHARGESV).html()) {
					$cells.eq(DISCHARGESV).html(this.discharge)
					$thisRow.addClass("Discharge")
				}
			}
		});
	})
}

function clickservice(evt, clickedCell, editable)
{
	savePreviousCellService()
	storePresentCellService(evt, clickedCell, editable)
}

function Skeyin(event, keycode, pointing)
{
	var SEDITABLE	= [DIAGNOSISSV, TREATMENTSV, ADMISSIONSV, FINALSV],
		fromDate = $('#monthstart').val(),
		start = getStart(),
		editable = (fromDate >= start),
		thiscell

	if (keycode === 27) {
		pointing.innerHTML = $("#editcell").data("oldcontent")
		clearEditcell()
		window.focus()
		event.preventDefault()
		return false
	}
	if (!pointing) {
		return
	}
	if (keycode === 9) {
		savePreviousCellService()
		if (event.shiftKey)
			thiscell = findPrevcell(event, SEDITABLE, pointing)
		else
			thiscell = findNextcell(event, SEDITABLE, pointing)
		if (thiscell) {
			storePresentCellService(event, thiscell, editable)
		} else {
			clearEditcell()
			window.focus()
		}
		event.preventDefault()
		return false
	}
	if (keycode === 13) {
		if (event.shiftKey || event.ctrlKey) {
			return
		}
		savePreviousCellService()
		thiscell = findNextRow(event, SEDITABLE, pointing)
		if (thiscell) {
			storePresentCellService(event, thiscell, editable)
		} else {
			clearEditcell()
			window.focus()
		}
		event.preventDefault()
		return false
	}
}

function savePreviousCellService()
{
	var $editcell = $("#editcell"),
		oldcontent = $editcell.data("oldcontent"),
		newcontent = getText($editcell),
		pointed = $editcell.data("pointing")

	if (!pointed || (oldcontent === newcontent)) {
		return false
	}

	switch(pointed.cellIndex)
	{
		case CASENUMSV:
		case HNSV:
		case NAMESV:
			return false
		case DIAGNOSISSV:
			saveContentService(pointed, "diagnosis", newcontent)
			return true
		case TREATMENTSV:
			var updateOp = updateOperated(pointed, newcontent)
			saveContentService(pointed, "treatment", newcontent, updateOp)
			return true
		case ADMISSIONSV:
			saveContentService(pointed, "admission", newcontent)
			return true
		case FINALSV:
			saveContentService(pointed, "final", newcontent)
			return true
		case ADMITSV:
		case DISCHARGESV:
			return false
	}
}

function updateOperated(pointed, newcontent)
{
	var $row = $(pointed).closest('tr'),
		rowi = $row[0],
		qn = rowi.cells[QNSV].innerHTML,
		book = gv.SERVICE,
		bookq = getBOOKrowByQN(book, qn)

	return opChange(bookq, newcontent, qn)
}

//column matches column name in MYSQL
function saveContentService(pointed, column, content, updateOp)
{
	var qn = $(pointed).closest('tr').find('td').eq(QNSV).html()

	// Not refillService because it may make next cell back to old value
	// when fast entry, due to slow return from Ajax of previous input
	pointed.innerHTML = content? content : ''

	//take care of white space, double qoute, single qoute, and back slash
	if (/\W/.test(content)) {
		content = URIcomponent(content)
	}
	var sql = "sqlReturnService=UPDATE book SET "
			+ column + "='" + content
			+ "', editor='" + gv.user
			+ "' WHERE qn=" + qn + ";"
	if (updateOp) { sql = sql + updateOp }

	saveService(pointed, sql)
}

function saveService(pointed, sql)
{
	var $row = $(pointed).closest('tr'),
		rowi = $row[0],
		qn = rowi.cells[QNSV].innerHTML,
		oldcontent = $("#editcell").data("oldcontent"),
		fromDate = $('#monthstart').val(),
		toDate = $('#monthpicker').val()

	sql	+= "SELECT * FROM book "
		+ "WHERE opdate BETWEEN '" + fromDate + "' AND '" + toDate
		+ "' AND deleted=0 "
		+ "AND waitnum<>0 "
		+ "ORDER BY opdate, oproom, casenum, waitnum;";

	Ajax(MYSQLIPHP, sql, callbacksaveScontent);

	function callbacksaveScontent(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)

			// Calc countService of this case only
			var oldclass = rowi.className
			var bookq = getBOOKrowByQN(gv.SERVICE, qn)
			var newclass = countService(bookq, fromDate, toDate)
			var oldclassArray = oldclass.split(" ")
			var newclassArray = newclass.split(" ")
			var counter
			var newcounter

			if (oldclass !== newclass) {
				updateCounter(oldclassArray, -1)
				updateCounter(newclassArray, 1)
				updateRowClasses($row, newclass)
			}
		} else {
			Alert("saveContentService", response)
			pointed.innerHTML = oldcontent
			//return to previous content
		}
	}
}

function updateCounter(classArray, one)
{
	var counter

	$.each( classArray, function(i, each) {
		if (counter = document.getElementById(each)) {
			counter.innerHTML = Number(counter.innerHTML) + one
		}
	})
}

function storePresentCellService(evt, pointing, editable)
{
	var cindex = pointing.cellIndex

	switch(cindex)
	{
		case CASENUMSV:
			break
		case HNSV:
			getHNSV(evt, pointing)
			break
		case NAMESV:
			getNAMESV(evt, pointing)
			break
		case DIAGNOSISSV:
			editable && createEditcell(pointing)
			break
		case TREATMENTSV:
			getTREATMENTSV(evt, pointing, editable)
			break
		case ADMISSIONSV:
			getADMISSIONSV(evt, pointing, editable)
			break
		case FINALSV:
			getFINALSV(evt, pointing, editable)
			break
		case ADMITSV:
		case DISCHARGESV:
			clearEditcell()
			break
	}
}

function getHNSV(evt, pointing)
{
	clearEditcell()
	if (gv.isPACS) {
		if (inPicArea(evt, pointing)) {
			PACS(pointing.innerHTML)
		}
	}
}

function getNAMESV(evt, pointing)
{
	var hn = $(pointing).closest('tr').children("td").eq(HNSV).html()
	var patient = pointing.innerHTML

	clearEditcell()
	if (inPicArea(evt, pointing)) {
		showUpload(hn, patient)
	}
}

function getTREATMENTSV(evt, pointing, editable)
{
	if (editable) {
		var operated = sql = ""

		if (inPicArea(evt, pointing)) {
			clearEditcell()
			// click toggle Operation, Reoperation
			if (/Reoperation/.test(pointing.className)) {
				operated = "Operation"
			} else if (/Operation/.test(pointing.className)) {
				operated = "Reoperation"
			}
			sql = sqlColumn(pointing, "operated", operated)
			saveService(pointing, sql)
		} else {
			createEditcell(pointing)
		}
	}
}

// readmit = null => no admission
// readmit = 0 => Admit but no Readmission
// readmit = 1 => Readmission
function getADMISSIONSV(evt, pointing, editable)
{
	if (editable) {
		var admitted = sql = ""

		if (inPicArea(evt, pointing)) {
			clearEditcell()
			// click toggle Admit, Readmission
			if (/Readmission/.test(pointing.className)) {
				admitted = "Admit"
			} else if (/Admit/.test(pointing.className)) {
				admitted = "Readmission"
			}
			sql = sqlColumn(pointing, "admitted", admitted)
			saveService(pointing, sql)
		} else {
			createEditcell(pointing)
		}
	}
}

function getFINALSV(evt, pointing, editable)
{
	if (inPicArea(evt, pointing)) {
		clearEditcell()
		showRecord(pointing, editable)
	} else {
		if (editable) { createEditcell(pointing) }
	}
}

function showRecord(pointing, editable)
{
	$('#doneday').datepicker({
		dateFormat: "yy-mm-dd"
	})
	var $pointing = $(pointing),
		$dialogRecord = $("#dialogRecord"),
		oldRecord,
		keycode

	setRecord($pointing)
	oldRecord = getRecord()

	// Enter key = OK
	$dialogRecord.off("keydown").on("keydown", function(event) {
		keycode = event.which || window.event.keyCode
		event.preventDefault()
		if (keycode === 13) {
			if (editable) { saveRecord($pointing, oldRecord) }
			$("#dialogRecord").hide()
		}
	})

	// must off("click") lest it remember all previous clicks
	$("#closeRecord").off("click").on("click", function(event) {
		event.stopPropagation()
		if (editable) { saveRecord($pointing, oldRecord) }
		$("#dialogRecord").hide()
	})
	$("#cancelRecord").off("click").on("click", function() {
		$("#dialogRecord").hide()
	})

	reposition($dialogRecord, "right top", "right bottom", $pointing)
	menustyle($dialogRecord, $pointing)

	if (editable) {
		$dialogRecord.find('input').off("click", returnFalse)
		$dialogRecord.find('input[type=text]').prop('disabled', false)
	} else {
		$dialogRecord.find('input').on("click", returnFalse)
		$dialogRecord.find('input[type=text]').prop('disabled', true)
	}
}

// can't use dialog, it will be hijacked to document body
// and not sticky to pointing while scrolling
function setRecord($pointing)
{
	var	$cell = $pointing.closest("tr").find("td"),
		operated = $cell.eq(TREATMENTSV).prop("class"),
		qn = $cell.eq(QNSV).html(),
		book = gv.SERVICE,
		bookq = getBOOKrowByQN(book, qn),
		$dialogRecord = $("#dialogRecord"),
		recordItems = {
			"manner": "Elective",
			"doneby": "Staff",
			"scale": "Major",
			"disease": "",
			"admitted": "",
			"operated": operated,
			"nonsurgical": "",
			"infection": "",
			"morbid": "",
			"dead": ""
		},
		bookValue

	$dialogRecord.find('input[type=text]').val('')
	$dialogRecord.find('input').prop('checked', false)

	document.getElementsByName("doneday")[0].value = bookq.doneday
													? bookq.doneday
													: bookq.opdate
	$.each(recordItems, function(key, val) {
		bookValue = bookq[key] ? bookq[key] : val
		$dialogRecord.find('input').each(function() {
			if (this.name === key) {
				this.checked = this.title === bookValue
			}
		})
	})
}

function getRecord()
{
	var	record = {}

	record.doneday = document.getElementsByName("doneday")[0].value
	$("#dialogRecord input").each(function() {
		if (this.checked) {
			if (record[this.name]) {
				record[this.name] += " " + this.title
			} else {
				record[this.name] = this.title
			}
		}
		else if (this.type === "checkbox") {
			if (!record.hasOwnProperty(this.name)) {
				record[this.name] = ""
			}
		}
	})

	return record
}

function saveRecord($pointing, oldRecord)
{
	var newrecord = getRecord(),
		sql

	$.each(newrecord, function(key, val) {
		if (val === oldRecord[key]) {
			delete newrecord[key]
		}
	})
	if ( Object.keys(newrecord).length ) {
		sql = sqlRecord($pointing, newrecord)
		saveService($pointing[0], sql)
	}
}

function sqlRecord($pointing, newrecord)
{
	var qn = $pointing.closest("tr").find("td").eq(QNSV).html(),
		sql = "sqlReturnService="

	$.each(newrecord, function(column, content) {
		if (column === "nonsurgical") {
			sql += sqlnonSurgical(content, qn)
		}
		sql += sqlItem(column, content, qn)
	})

	return sql
}

function sqlColumn(pointing, column, content)
{
	var qn = $(pointing).closest("tr").find("td").eq(QNSV).html()

	return "sqlReturnService=" + sqlItem(column, content, qn)
}

function sqlItem(column, content, qn) {
	return "UPDATE book SET "
		+ column + "='" + content
		+ "',editor='" + gv.user
		+ "' WHERE qn=" + qn + ";"
}

function sqlnonSurgical(content, qn) {
	if (content) {
		return "UPDATE book SET "
			+ "doneby='No',"
			+ "manner='No',"
			+ "scale='No',"
			+ "operated='No',"
			+ "editor='auto' "
			+ "WHERE qn=" + qn + ";"
	} else {
		return "UPDATE book SET "
			+ "doneby='',"
			+ "manner='',"
			+ "scale='',"
			+ "operated='',"
			+ "editor='auto' "
			+ "WHERE qn=" + qn + ";"
	}
}

function showReportToDept(title)
{
	var sumColumn = [0, 0, 0, 0, 0, 0, 0, 0]

	$("#dialogReview").dialog({
		title: title,
		closeOnEscape: true,
		modal: true,
		width: 550,
		buttons: [{
			text: "Export to Excel",
			click: function() {
				exportReportToExcel(title)
				$( this ).dialog( "close" );
			}
		}]
	})

	$("#reviewtbl tr:not('th')").each(function() {
		$.each($(this).find("td:not(:first-child)"), function() {
			this.innerHTML = 0
		})
	})
	$.each(gv.SERVICE, function() {
		countCase(this, this.disease)
		countCase(this, this.nonsurgical)
	})
	$("#reviewtbl tr:not('th, .notcount')").each(function(i) {
		$.each($(this).find("td:not(:first-child)"), function(j) {
			sumColumn[j] += Number(this.innerHTML)
		})
	})
	$("#Total").find("td:not(:first-child)").each(function(i) {
		this.innerHTML = sumColumn[i]
	})
	$("#Grand").find("td:not(:first-child)").each(function(i) {
		i = i * 2
		this.innerHTML = sumColumn[i] + sumColumn[i+1]
	})
}

function countCase(thisrow, thisitem)
{
	var row = ROWREPORT[thisitem],
		column = COLUMNREPORT[thisrow.doneby]
			   + COLUMNREPORT[thisrow.scale]
			   + COLUMNREPORT[thisrow.manner]

	if (row && column) {
		$("#reviewtbl tr")[row].cells[column].innerHTML++
	}
}

function resetcountService()
{
	document.getElementById("Admit").innerHTML = 0
	document.getElementById("Discharge").innerHTML = 0
	document.getElementById("Operation").innerHTML = 0
	document.getElementById("Readmission").innerHTML = 0
	document.getElementById("Reoperation").innerHTML = 0
	document.getElementById("Infection").innerHTML = 0
	document.getElementById("Morbidity").innerHTML = 0
	document.getElementById("Dead").innerHTML = 0
}

function opChange(bookq, newcontent, qn)
{
	var sql = ""

	if (bookq.operated) {
		if (!isOperation(newcontent)) {
			sql += "UPDATE book SET "
				+ "operated='',"
				+ "editor='auto' "
				+ "WHERE qn=" + qn + ";"
		}
	} else {
		if (isOperation(newcontent)) {
			sql += "UPDATE book SET "
				+ "operated='Operation',"
				+ "editor='auto' "
				+ "WHERE qn=" + qn + ";"
		}
	}

	return sql
}

function isOpDiff(thiscase)
{
	return !thiscase.operated && isOperation(thiscase.treatment)
}

function isOperation(treatment)
{
	var Operation = false,
		neuroSxOp = [
		/ACDF/, /ALIF/, /[Aa]nast/, /[Aa]pproa/, /[Aa]spirat/, /[Aa]dvance/,
		/[Bb]iop/, /[Bb]lock/, /[Bb]urr/, /[Bb]x/, /[Bb]ypass/, /[Bb]alloon/,
		/[Cc]lip/, 
		/[Dd]ecom/, /DBS/, /[Dd]rain/, /[Dd]isconnect/,
		/[Ee]ctom/, /[Ee]ndo/, /ESI/, /ETS/, /ETV/, /EVD/, /[Ee]xcis/, /ECOG/,
		/[Ff]ix/, /[Ff]usion/,
		/[Gg]rid/,
		/[Ii]nsert/,
		/[Ll]esion/, /[Ll]ysis/, 
		/MIDLIF/, /MVD/,
		/[Nn]eurot/, /Navigator/,
		/OLIF/, /[Oo]cclu/, /[Oo]perat/, /ostom/, /otom/,
		/plast/, /PLF/, /PLIF/,
		/[Rr]econs/, /[Rr]emov/, /[Rr]epa/, /[Rr]evis/, /[Rr]obot/,
		/scope/, /[Ss]crew/, /[Ss]hunt/, /[Ss]tim/, /SNRB/,
		/TSP/, /TLIF/, /[Tt]rans/,
		/[Uu]ntether/,
		/VNS/
	]

	$.each( neuroSxOp, function(i, each) {
		return !(Operation = each.test(treatment))
	})
	return Operation
}

// Service Review of one case
function countService(thiscase, fromDate, toDate)
{
	var classname = "",
		items = ["admitted", "operated", "infection", "morbid", "dead"]

	$.each(items, function() {
		if (thiscase[this]) {
			classname += thiscase[this] + " "
		}
	})
	// Assume consult cases (waitnum < 0) are admitted in another service ???
	if ((thiscase.waitnum > 0)
		&& (thiscase.admit >= fromDate)
		&& (thiscase.admit <= toDate)) {
		if (!/Admit/.test(classname)) {
			classname += "Admit "
		}
	}
	if ((thiscase.discharge >= fromDate)
		&& (thiscase.discharge <= toDate)
		&& (thiscase.waitnum > 0)) {
		classname += "Discharge "
	}

	return $.trim(classname)
}

function countAllServices()
{
	resetcountService()

	$.each( $('#servicetbl tr'), function() {
		var counter = this.className.split(" ")
		$.each(counter, function() {
			if (document.getElementById(this)) {
				document.getElementById(this).innerHTML++
			}
		})
	})
}
