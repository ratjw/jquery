
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

	$('#dialogService').off("click").on("click", '.ui-datepicker-title', function() {
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
		sql = "sqlReturnData=" + sqlOneMonth(fromDate, toDate)

	Ajax(MYSQLIPHP, sql, callbackGetService)

	return defer.promise()

	function callbackGetService(response)
	{
		/dob/.test(response)
			? defer.resolve( JSON.parse(response) )
			: defer.reject("getServiceOneMonth", response)
	}
}

function sqlOneMonth(fromDate, toDate)
{
	return "SELECT * FROM book "
		  + "WHERE opdate BETWEEN '" + fromDate + "' AND '" + toDate
		  + "' AND deleted=0 "
		  + "AND waitnum<>0 "
		  + "ORDER BY opdate, oproom, casenum, waitnum;";
}

// Operation is updated in JS by isOperation() => updateDiff (before filldataService)
// Admission is updated in PHP by getAdmitDischargeDate => getipd.php (after filldataService)
function showService(fromDate, toDate)
{
	//delete previous servicetbl lest it accumulates
	var $servicetbl = $('#servicetbl'),
		$servicecells = $("#servicecells"),
		opDiff = {},
		endoDiff = {},
		radioDiff = {}

	// check all treatment details
	$.each(gv.SERVICE, function() {
		var	treatment = this.treatment,
			operated = this.operated,
			radiosurgery = this.radiosurgery,
			endovascular = this.endovascular,
			qn = this.qn

		// diff when data in db are not the same as keywords
		if (!operated || (operated === 'Operation')) {
			if (!!operated !== isOperation(treatment)) {
				opDiff[qn] = this.operated = operated ? "" : 'Operation'
			}
			if (!!radiosurgery !== isRadiosurgery(treatment)) {
				radioDiff[qn] = this.radiosurgery = radiosurgery ? "" : 'Radiosurgery'
			}
			if (!!endovascular !== isEndovascular(treatment)) {
				endoDiff[qn] = this.endovascular = endovascular ? "" : "Endovascular"
			}
		}
	})
	
	updateDiff(opDiff, radioDiff, endoDiff, fromDate, toDate)

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
				classname = countService(this, fromDate, toDate)
				scase++
				$servicecells.find('tr').clone()
					.appendTo($servicetbl.find('tbody'))
						.filldataService(this, scase, classname)
			}
		});
	})

	var $monthpicker = $('#monthpicker'),
		editable = fromDate >= getStart(),
		$dialogService = $('#dialogService'),
		$divRecord = $("#divRecord")

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
			$divRecord.hide()
		}
	})
	getAdmitDischargeDate(fromDate, toDate)
	countAllServices()
	$servicetbl.fixMe($dialogService)
	hoverService(editable)

	$dialogService.off("click").on("click", function (event) {
		resetTimer();
		gv.idleCounter = 0
		event.stopPropagation()
		var	target = event.target

		if ($divRecord.is(":visible")) {
			if (!$(target).closest('#divRecord').length) {
				$divRecord.hide();
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

function updateDiff(opDiff, radioDiff, endoDiff, fromDate, toDate)
{
	var sql = ""

	// opDiff is the last, to overwrite if have both Operation and Radio/Endo
	sql += updateCase(radioDiff, "radiosurgery", "", "", "")
	sql += updateCase(endoDiff, "endovascular", "", "", "")
	sql += updateCase(opDiff, "operated", "Elective", "Staff", "Major")

	if (sql) {
		sql = "sqlReturnData=" + sql + sqlOneMonth(fromDate, toDate)

		Ajax(MYSQLIPHP, sql, callbackopDiff)

		function callbackopDiff(response)
		{
			if (/dob/.test(response)) {
				gv.SERVICE = JSON.parse(response)
			} else {
				Alert("updateDiff", response)
			}
		}
	}
}

// Also update related defaults
function updateCase(diff, column, manner, doneby, scale)
{
	var sql = ""

	$.each(diff, function(key, val) {
		sql += "UPDATE book SET "
			+ column +"='" + val
			+ "',manner='" + manner
			+ "',doneby='" + doneby
			+ "',scale='" + scale
			+ "',editor='updateDiff' "
			+ "WHERE qn=" + key + ";"
	})

	return sql
}

function resizeDialog()
{
	var	$dialogService = $('#dialogService')
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
		var $staff = $('#servicetbl tr').eq(i).children("td").eq(CASENUMSV)
		if ($staff.prop("colSpan") === 1) {
			$staff.prop("colSpan", 9)
				.addClass("serviceStaff")
					.siblings().hide()
		}
		$staff.html(staffname)

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
function hoverService(editable)
{
	var	paleClasses = ["pacs", "camera", "record", "Operation",
						"Admission", "Reoperation", "Readmission"
		],
		boldClasses = ["pacs2", "camera2", "record2", "Operation2",
						"Admission2", "Reoperation2", "Readmission2"
		],
		tdClass = "td.pacs, td.camera, td.record"
				+ (editable
				? ", td.Operation, td.Admission, td.Reoperation, td.Readmission"
				: "")

	$(tdClass)
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
	var classname = ""

	if (/Reoperation/.test(classes)) {
		classname += "Reoperation "
	}
	else if (/Operation/.test(classes)) {
		classname += "Operation "
	}
	if (/Radiosurgery/.test(classes)) {
		classname += "Radiosurgery "
	}
	if (/Endovascular/.test(classes)) {
		classname += "Endovascular"
	}

	return $.trim(classname)
}

function putReadmit(classes)
{
	if (/Readmission/.test(classes)) {
		return "Readmission"
	}
	else if (/Admission/.test(classes)) {
		return "Admission"
	}

	return ""
}

function updateRowClasses($this, classname)
{
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
	else if (/Admission/.test(classname)) {
		$admit.addClass("Admission")
	}
	if (/Reoperation/.test(classname)) {
		$treat.addClass("Reoperation")
	}
	else if (/Operation/.test(classname)) {
		$treat.addClass("Operation")
	}
	if (/Radiosurgery/.test(classname)) {
		$treat.addClass("Radiosurgery")
	}
	if (/Endovascular/.test(classname)) {
		$treat.addClass("Endovascular")
	}
	if (/Infection/.test(classname)) {
		$final.addClass("Infection")
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
						$cells.eq(ADMISSIONSV).addClass("Admission")
						$thisRow.addClass("Admission")
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
			saveContentService(pointed, "treatment", newcontent)
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

//column matches column name in MYSQL
function saveContentService(pointed, column, content)
{
	var qn = $(pointed).closest('tr').find('td').eq(QNSV).html()

	// Not refillService because it may make next cell back to old value
	// when fast entry, due to slow return from Ajax of previous input
	pointed.innerHTML = content? content : ''

	//take care of white space, double qoute, single qoute, and back slash
	if (/\W/.test(content)) {
		content = URIcomponent(content)
	}
	// after edit, treatment keyword may be changed from non-operation
	// to operation || radiosurgery || endovascular
	if (column === "treatment") {
		var updateOp = updateOperated(qn, content)
	}
	var sql = "sqlReturnService=UPDATE book SET "
			+ column + "='" + content
			+ "', editor='" + gv.user
			+ "' WHERE qn=" + qn + ";"
	if (updateOp) { sql = sql + updateOp }

	saveService(pointed, sql)
}

function updateOperated(qn, content)
{
	var	bookq = getBOOKrowByQN(gv.SERVICE, qn),
		operated = isOperation(content),
		radiosurgery = isRadiosurgery(content),
		endovascular = isEndovascular(content),
		sql = "",
		oper = radi = endo = null

	if (bookq.operated && !operated) { oper = "" }
	if (!bookq.operated && operated) { oper = 'Operation' }
	if (bookq.radiosurgery && !radiosurgery) { radi = "" }
	if (!bookq.radiosurgery && radiosurgery) { radi = 'Radiosurgery' }
	if (bookq.endovascular && !endovascular) { endo = "" }
	if (!bookq.endovascular && endovascular) { endo = 'Endovascular' }

	if (oper !== null) { sql += "operated='" + oper + "'," }
	if (radi !== null) { sql += "radiosurgery='" + radi + "'," }
	if (endo !== null) { sql += "endovascular='" + endo + "'," }

	if (sql) {
		sql = "UPDATE book SET "
			+ sql
			+ "editor='updateOper' "
			+ "WHERE qn=" + qn + ";"
	}

	return sql
}

function saveService(pointed, sql)
{
	var $row = $(pointed).closest('tr'),
		rowi = $row[0],
		qn = rowi.cells[QNSV].innerHTML,
		oldcontent = $("#editcell").data("oldcontent"),
		fromDate = $('#monthstart').val(),
		toDate = $('#monthpicker').val()

	sql	+= sqlOneMonth(fromDate, toDate)

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

// operated has 3 possibility : "", Operation, Reoperation
// Operation is determined by keywords in isOperation()
function getTREATMENTSV(evt, pointing, editable)
{
	if (editable) {
		var operated = sql = ""

		if (inPicArea(evt, pointing) && pointing.className) {
			clearEditcell()
			// click toggle Operation, Reoperation
			if (/\bReoperation/.test(pointing.className)) {
				operated = "Operation"
			} else if (/\bOperation/.test(pointing.className)) {
				operated = "Reoperation"
			}
			sql = sqlColumn(pointing, "operated", operated)
			saveService(pointing, sql)
		} else {
			createEditcell(pointing)
		}
	}
}

// admitted has 3 possibility : "", Admission, Readmission
// Admission depends on hospital IT
function getADMISSIONSV(evt, pointing, editable)
{
	if (editable) {
		var admitted = sql = ""

		if (inPicArea(evt, pointing) && pointing.className) {
			clearEditcell()
			// click toggle Admission, Readmission
			if (/\bReadmission/.test(pointing.className)) {
				admitted = "Admission"
			} else if (/\bAdmission/.test(pointing.className)) {
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

// can't use dialog, it will be hijacked to document body
// and not sticky to pointing while scrolling
function showRecord(pointing, editable)
{
	$('#doneday').datepicker({
		dateFormat: "yy-mm-dd"
	})
	var $pointing = $(pointing),
		$divRecord = $("#divRecord"),
		oldRecord,
		keycode

	setRecord($pointing)
	oldRecord = getRecord()

	// Enter key = OK
	$divRecord.off("keydown").on("keydown", function(event) {
		keycode = event.which || window.event.keyCode
		event.preventDefault()
		if (keycode === 13) {
			if (editable) { saveRecord($pointing, oldRecord) }
			$("#divRecord").hide()
		}
	})

	// must off("click") lest it remember all previous clicks
	$("#closeRecord").off("click").on("click", function(event) {
		event.stopPropagation()
		if (editable) { saveRecord($pointing, oldRecord) }
		$("#divRecord").hide()
	})
	$("#cancelRecord").off("click").on("click", function() {
		$("#divRecord").hide()
	})

	reposition($divRecord, "right top", "right bottom", $pointing)
	menustyle($divRecord, $pointing)

	if (editable) {
		$divRecord.find('input').off("click", returnFalse)
		$divRecord.find('input[type=text]').prop('disabled', false)
	} else {
		$divRecord.find('input').on("click", returnFalse)
		$divRecord.find('input[type=text]').prop('disabled', true)
	}
}

// this.name === column in Mysql
// this.title === possible value
function setRecord($pointing)
{
	var	qn = $pointing.closest("tr").find("td").eq(QNSV).html(),
		bookq = getBOOKrowByQN(gv.SERVICE, qn),
		$divRecord = $("#divRecord")

	$divRecord.find('input[type=text]').val('')
	$divRecord.find('input').prop('checked', false)

	document.getElementsByName("doneday")[0].value = bookq.doneday
													? bookq.doneday
													: bookq.opdate
	$divRecord.find('input').each(function() {
		this.checked = this.title === bookq[this.name]
	})
}

function getRecord()
{
	var	record = {}

	record.doneday = document.getElementsByName("doneday")[0].value
	$("#divRecord input").each(function() {
		if (this.type === "checkbox" && !this.checked) {
			record[this.name] = ""
		} else {
			if (this.checked) {
				record[this.name] = this.title
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
		sql += sqlItem(column, content, qn)
	})

	return sql
}

function sqlColumn(pointing, column, content)
{
	var qn = $(pointing).closest("tr").find("td").eq(QNSV).html()

	return "sqlReturnService=" + sqlItem(column, content, qn)
}

function sqlItem(column, content, qn)
{
	return "UPDATE book SET "
		+ column + "='" + content
		+ "',editor='" + gv.user
		+ "' WHERE qn=" + qn + ";"
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
		countCase(this, this.radiosurgery)
		countCase(this, this.endovascular)
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
	document.getElementById("Admission").innerHTML = 0
	document.getElementById("Discharge").innerHTML = 0
	document.getElementById("Operation").innerHTML = 0
	document.getElementById("Readmission").innerHTML = 0
	document.getElementById("Reoperation").innerHTML = 0
	document.getElementById("Infection").innerHTML = 0
	document.getElementById("Morbidity").innerHTML = 0
	document.getElementById("Dead").innerHTML = 0
}

function isOperation(treatment)
{
	var Operation = false,
		Neurosurgery = [
			/ACDF/, /ALIF/, /[Aa]nast/, /[Aa]pproa/, /[Aa]spirat/, /[Aa]dvance/,
			/[Bb]iop/, /[Bb]lock/, /[Bb]urr/, /[Bb]x/, /[Bb]ypass/, /[Bb]alloon/,
			/[Cc]lip/, 
			/[Dd]ecom/, /DBS/, /[Dd]rain/, /[Dd]isconnect/,
			/ECOG/, /[Ee]ctom/, /[Ee]ndoscop/, /ESI/, /ETS/, /ETV/, /EVD/, /[Ee]xcis/,
			/[Ff]ix/, /[Ff]usion/,
			/[Gg]rid/,
			/[Ii]nsert/,
			/[Ll]esion/, /[Ll]ysis/, 
			/MIDLIF/, /MVD/,
			/[Nn]eurot/, /Navigator/,
			/OLIF/, /[Oo]cclu/, /[Oo]perat/, /ostom/, /otom/,
			/plast/, /PLF/, /PLIF/,
			/[Rr]econs/, /[Rr]edo/, /[Rr]emov/, /[Rr]epa/, /[Rr]evis/, /[Rr]obot/,
			/scope/, /[Ss]crew/, /[Ss]hunt/, /[Ss]tim/, /SNRB/, /[Ss]uture/,
			/TSP/, /TSS/, /TLIF/, /[Tt]rans/,
			/[Uu]ntether/,
			/VNS/
		],
		NotNeurosurgery = [
			/[Aa]djust/, /[Cc]onservative/, /[Oo]bserve/,
			/[Tt]ransart/, /[Tt]ransven/
		]

	$.each( NotNeurosurgery, function() {
		return !(Operation = this.test(treatment))
	})
	// NotNeurosurgery takes priority
	if (Operation) {
		return false
	}

	$.each( Neurosurgery, function() {
		return !(Operation = this.test(treatment))
	})
	return Operation
}

function isRadiosurgery(treatment)
{
	var Operation = false,
		Radiosurgery = [
			/conformal radiotherapy/i, /CRT/, /CyberKnife/i,
			/Gamma [Kk]nife/, /GKS/, /Linac/i,
			/[Rr]adiosurgery/, /RS/,
			/SRS/, /SRT/, /[Ss]tereotactic radiotherapy/,
			/Tomotherapy/
		]

	$.each( Radiosurgery, function() {
		return !(Operation = this.test(treatment))
	})
	return Operation
}

function isEndovascular(treatment)
{
	var Operation = false,
		Endovascular = [
			/[Bb]alloon/, /[Cc]oil/, /[Ee]mboli[zs]/, /[Ee]ndovasc/, /[Ii]ntervention/,
			/[Ss]tent/, /[Tt]ransart/, /[Tt]ransven/
		]

	$.each( Endovascular, function() {
		return !(Operation = this.test(treatment))
	})
	return Operation
}

// Service Review of one case
function countService(thiscase, fromDate, toDate)
{
	var classname = "",
		items = ["admitted", "operated", "radiosurgery", "endovascular", "infection", "morbid", "dead"]

	$.each(items, function() {
		if (thiscase[this]) {
			classname += thiscase[this] + " "
		}
	})
	// Assume consult cases (waitnum < 0) are admitted in another service ???
	if ((thiscase.waitnum > 0)
		&& (thiscase.admit >= fromDate)
		&& (thiscase.admit <= toDate)) {
		if (!/Admission/.test(classname)) {
			classname += "Admission "
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
