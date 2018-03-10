
function serviceReview()
{
	$("#servicehead").hide()
	$("#servicetbl").hide()
	$("#exportService").hide()
	$("#reportService").hide()
	$("#dialogService").dialog({
		title: "Service Neurosurgery",
		closeOnEscape: true,
		modal: true,
		width: window.innerWidth * 95 / 100,
		height: window.innerHeight * 95 / 100
	})

	$("#monthpicker").show()
	$("#monthpicker").datepicker( {
		altField: $("#monthstart"),
		altFormat: "yy-mm-dd",
		autoSize: true,
		dateFormat: "MM yy",
		monthNames: [ "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", 
					  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม" ],
		onChangeMonthYear: function (year, month, inst) {
			$(this).datepicker("setDate", new Date(inst.selectedYear, inst.selectedMonth, 1))
		},
		beforeShow: function (input, obj) {
			$(".ui-datepicker-calendar").hide()
		}
	}).datepicker("setDate", new Date(new Date().getFullYear(), new Date().getMonth(), 1))

	$("#dialogService").off("click").on("click", ".ui-datepicker-title", function() {
		entireMonth($("#monthstart").val())
	})
}

function entireMonth(fromDate)
{
	var date = new Date(fromDate),
		toDate = new Date(date.getFullYear(), date.getMonth()+1, 0),
		$monthpicker = $("#monthpicker"),
		$exportService = $("#exportService"),
		$reportService = $("#reportService"),
		title = "Service Neurosurgery เดือน " + $monthpicker.val()

	// show month name before change $monthpicker.val to last date of this month
	$("#dialogService").dialog({
		title: title
	})
	toDate = $.datepicker.formatDate("yy-mm-dd", toDate)
	$monthpicker.val(toDate)

	getServiceOneMonth(fromDate, toDate).then( function (SERVICE) {
		gv.SERVICE = SERVICE
		gv.SERVE = calcSERVE()
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
	return "SELECT b.* FROM book b left join staff s on b.staffname=s.staffname "
		  + "WHERE opdate BETWEEN '" + fromDate + "' AND '" + toDate
		  + "' AND deleted=0 "
		  + "AND waitnum<>0 "
		  + "ORDER BY s.number,opdate,oproom,casenum,waitnum;";
}

// Principle : gv.SERVE are implicitly in diagnosis, treatment, admit
// Some values in gv.SERVE are calculated at run time
// All service values are stored in the corresponding table row : $row.data()
// Operation is determined by operationFor() in JS
// Admission is updated by getAdmitDischargeDate in PHP
// Values in DB are use-defined to override runtime-calc values
// admitted : "", "No", "Readmission"					<- admit
// operated : "", "No", "Reoperation"					<- treatment
// doneby : "", "Staff", "Resident"				<- defaulted by treatment
// manner : "", "Elective", "Emergency"			<- defaulted by treatment
// scale : "", "Major", "Minor"					<- defaulted by treatment
// disease : "", "No", "Brain Tumor", "Brain Vascular",
//		"CSF related", "Trauma", "Spine", "etc" <- treatment + diagnosis
// radiosurgery : "", "No", "Radiosurgery"			<- treatment
// endovascular : "", "No", "Endovascular"			<- treatment
// infection : "", "Infection"					<- use-defined only
// morbid : "", "Morbidity"						<- use-defined only
// dead : "", "Dead"							<- use-defined only
function showService(fromDate, toDate)
{
	var $servicetbl = $("#servicetbl"),
		$servicecells = $("#servicecells"),
		staffname = "",
		scase = 0,
		classname = ""

	$("#monthpicker").hide()
	$("#servicehead").show()

	//delete previous servicetbl lest it accumulates
	$servicetbl.find("tr").slice(1).remove()
	$servicetbl.show()
	gv.editableSV = fromDate >= getStart()

	$.each( gv.SERVE, function() {
		if (this.staffname !== staffname) {
			staffname = this.staffname
			scase = 0
			$servicecells.find("tr").clone()
				.appendTo($servicetbl.find("tbody"))
					.children("td").eq(CASENUMSV)
						.prop("colSpan", 10)
							.addClass("serviceStaff")
								.html(staffname)
									.siblings().hide()
		}
		classname = countService(this, fromDate, toDate)
		scase++
		$servicecells.find("tr").clone()
			.appendTo($servicetbl.find("tbody"))
				.filldataService(this, scase, classname)
	});

	var	$dialogService = $("#dialogService"),
		$divRecord = $("#divRecord")

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
			$dialogService.off("click", clickDialogService)
			$divRecord.hide()
		}
	})
	getAdmitDischargeDate(fromDate, toDate)
	countAllServices()
	$servicetbl.fixMe($dialogService)
	hoverService()

	$dialogService.on("click", clickDialogService)

	//for resizing dialogs in landscape / portrait view
	$(window).on("resize", resizeDialog)

	function clickDialogService(event)
	{
		resetTimer();
		gv.idleCounter = 0
		event.stopPropagation()
		var	target = event.target

		if ($divRecord.is(":visible")) {
			if (!$(target).closest("#divRecord").length) {
				$divRecord.hide();
			}
		}
		if (target.nodeName !== "TD" || target.colSpan > 1) {
			clearEditcell()
		} else {
			clickservice(event, target)
		}
	}

	function resizeDialog()
	{
		$dialogService.dialog({
			width: window.innerWidth * 95 / 100,
			height: window.innerHeight * 95 / 100
		})
		winResizeFix($servicetbl, $dialogService)
	}
}

function calcSERVE()
{
	var gvserve = gv.SERVICE.slice()

	$.each(gvserve, function() {
		var	treatment = this.treatment

		if (!this.radiosurgery && isMatched(RADIOSURGERY, treatment)) {
			this.radiosurgery = "Radiosurgery"
		}

		if (!this.endovascular && isMatched(ENDOVASCULAR, treatment)) {
			this.endovascular = "Endovascular"
		}

		// If DB value is blank, calc the value
		this.disease = this.disease || operationFor(this)

		// "No" from DB or no matched
		if (this.disease !== "No") {
			if (!this.operated) { this.operated = "Operation" }
			if (!this.doneby) { this.doneby = "Staff" }
			if (!this.scale) { this.scale = "Major" }
			if (!this.manner) { this.manner = "Elective" }
		}
	})

	return gvserve
}

function operationFor(thisrow)
{
	var opfor = [
			"Brain Tumor",
			"Brain Vascular",
			"Trauma",
			"Spine",
			"CSF related",
			"etc"
		],
		diagnosis = thisrow.diagnosis,
		treatment = thisrow.treatment,
		endovascular = thisrow.endovascular === "Endovascular",
		opwhat
	// "No" from match NOOPERATION
	if (isMatched(NOOPERATION, treatment)) { return "No" }

	// "No" from no match
	opfor = isOpforOrNot(opfor, "Rx", treatment)
	if (opfor.length === 0) { opwhat = "No" }
	else if (opfor.length === 1) { opwhat = opfor[0] }
	else {
		opwhat = opfor[0]
		opfor = isOpforOrNot(opfor, "RxNo", treatment)
		if (opfor.length === 1) { opwhat = opfor[0] }
		else if (opfor.length > 1) {
			opfor = isOpforOrNot(opfor, "Dx", diagnosis)
			if (opfor.length === 0) { opwhat = "etc" }
			else if (opfor.length === 1) { opwhat = opfor[0] }
			else {
				// in case all cancelled each other out
				opwhat = opfor[0]
				opfor = isOpforOrNot(opfor, "DxNo", diagnosis)
				if (opfor.length > 0) { opwhat = opfor[0] }
			}
		}
	}
	if (opwhat === "Spine" && endovascular && !isMatched(SPINEOP, treatment)) {
		opwhat = "No"
	}
	return opwhat
}

function isMatched(keyword, diagtreat)
{
	var test = false

	$.each( keyword, function() {
		return !(test = this.test(diagtreat))
	})
	return test
}

function isOpforOrNot(opfor, RxDx, diagRx, logic)
{
	for (var i=opfor.length-1; i>=0; i--) {
		if (isMatched(KEYWORDS[opfor[i]][RxDx], diagRx) === logic) {
			opfor.splice(i, 1)
		}
	}
	return opfor
}

function isThisOperation(item, treatment)
{
	return !isMatched(KEYWORDS[item][Rx], treatment)
}

function notThisOperation(item, treatment)
{
	return isMatched(KEYWORDS[item][RxNo], treatment)
}

function isThisDiagnosis(item, diagnosis)
{
	return !isMatched(KEYWORDS[item][Dx], diagnosis)
}

function notThisDiagnosis(item, diagnosis)
{
	return isMatched(KEYWORDS[item][DxNo], diagnosis)
}

function refillService(fromDate, toDate)
{
	var $servicetbl = $("#servicetbl"),
		$rows = $servicetbl.find("tr"),
		$servicecells = $("#servicecells"),
		len = $rows.length
		staffname = "",
		i = scase = 0,
		classname = ""

	$.each( gv.SERVE, function() {
		if (this.staffname !== staffname) {
			staffname = this.staffname
			scase = 0
			i++
			$staff = $rows.eq(i).children("td").eq(CASENUMSV)
			if ($staff.prop("colSpan") === 1) {
				$staff.prop("colSpan", 10)
					.addClass("serviceStaff")
						.siblings().hide()
			}
			$staff.html(staffname)
		}
		i++
		scase++
		if (i === len) {
			$("#servicecells").find("tr").clone()
				.appendTo($("#servicetbl").find("tbody"))
			len++
		}
		classname = countService(this, fromDate, toDate)
		$rowi = $rows.eq(i)
		$cells = $rowi.children("td")
		if ($cells.eq(CASENUMSV).prop("colSpan") > 1) {
			$cells.eq(CASENUMSV).prop("colSpan", 1)
				.nextUntil($cells.eq(QNSV)).show()
		}
		$rowi.filldataService(this, scase, classname)
	});
	if (i < (len - 1)) {
		$rows.slice(i+1).remove()
	}
	countAllServices()
}

jQuery.fn.extend({
	filldataService : function(bookq, scase, classes) {
		var cells = this[0].cells
		if (bookq.hn && gv.isPACS) { cells[HNSV].className = "pacs" }
		if (bookq.hn) { cells[NAMESV].className = "camera" }
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
		cells[ADMITSV].innerHTML = putThdate(bookq.admit)
		cells[OPDATESV].innerHTML = putThdate(bookq.opdate)
		cells[DISCHARGESV].innerHTML = putThdate(bookq.discharge)
		cells[QNSV].innerHTML = bookq.qn
	}
})

// Simulate hover on icon by changing background pics
function hoverService()
{
	var	tdClass = "td.pacs, td.camera, td.record"
				+ (gv.editableSV
				? ", td.Operation, td.Admission, td.Reoperation, td.Readmission"
				: "")

	hoverCell(tdClass)
}

function hoverCell(tdClass)
{
	var	paleClasses = ["pacs", "camera", "record", "Operation",
						"Admission", "Reoperation", "Readmission"
		],
		boldClasses = ["pacs2", "camera2", "record2", "Operation2",
						"Admission2", "Reoperation2", "Readmission2"
		]

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
		gv.editableSV && hoverCell("td.Readmission")
	}
	else if (/Admission/.test(classname)) {
		$admit.addClass("Admission")
		gv.editableSV && hoverCell("td.Readmission")
	}
	if (/Reoperation/.test(classname)) {
		$treat.addClass("Reoperation")
		gv.editableSV && hoverCell("td.Reoperation")
	}
	else if (/Operation/.test(classname)) {
		$treat.addClass("Operation")
		gv.editableSV && hoverCell("td.Operation")
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
	var sql = "from=" + fromDate
			+ "&to=" + toDate
			+ "&sql=" + sqlOneMonth(fromDate, toDate)

	Ajax(GETIPD, sql, callbackgetipd)

	function callbackgetipd(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)
			gv.SERVE = calcSERVE()
			fillAdmitDischargeDate()
		}
	}
}

function fillAdmitDischargeDate()
{
	var i = 0,
		staffname = "",
		$rows = $("#servicetbl tr")

	$.each( gv.SERVE, function() {
		if (this.staffname !== staffname) {
			staffname = this.staffname
			i++
		}
		i++
		var $thisRow = $rows.eq(i),
			$cells = $thisRow.children("td")

		if (this.admit && this.admit !== $cells.eq(ADMITSV).html()) {
			$cells.eq(ADMITSV).html(putThdate(this.admit))
			if (!/Admission/.test($cells.eq(ADMISSIONSV).className)) {
				$cells.eq(ADMISSIONSV).addClass("Admission")
				// for background pics
			}
			if (!/Admission|Readmission/.test($thisRow.className)) {
				$thisRow.addClass("Admission")
				// for counting
			}
		}
		if (this.discharge && this.discharge !== $cells.eq(DISCHARGESV).html()) {
			$cells.eq(DISCHARGESV).html(putThdate(this.discharge))
			if (!/Discharge/.test($thisRow.className)) {
				$thisRow.addClass("Discharge")
				// for counting
			}
		}
	});
}

function clickservice(evt, clickedCell)
{
	savePreviousCellService()
	storePresentCellService(evt, clickedCell)
}

function Skeyin(event, keycode, pointing)
{
	var SEDITABLE	= [DIAGNOSISSV, TREATMENTSV, ADMISSIONSV, FINALSV],
		fromDate = $("#monthstart").val(),
		start = getStart(),
		thiscell

	if (keycode === 27) {
		pointing.innerHTML = $("#editcell").data("oldcontent")
		clearEditcell()
		$("#dialogService").focus()
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
			storePresentCellService(event, thiscell)
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
			storePresentCellService(event, thiscell)
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
	// Not refillService because it may make next cell back to old value
	// when fast entry, due to slow return from Ajax of previous input
	pointed.innerHTML = content? content : ""

	//take care of white space, double qoute, single qoute, and back slash
	if (/\W/.test(content)) {
		content = URIcomponent(content)
	}

	var sql = sqlColumn(pointed, column, content)

	saveService(pointed, sql)
}

function saveService(pointed, sql)
{
	var $row = $(pointed).closest("tr"),
		rowi = $row[0],
		qn = rowi.cells[QNSV].innerHTML,
		oldcontent = $("#editcell").data("oldcontent"),
		fromDate = $("#monthstart").val(),
		toDate = $("#monthpicker").val()

	sql	+= sqlOneMonth(fromDate, toDate)

	Ajax(MYSQLIPHP, sql, callbacksaveScontent);

	function callbacksaveScontent(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)

			// other user may add a row
			var servelen = gv.SERVE.length
			gv.SERVE = calcSERVE()
			if (gv.SERVE.length !== servelen) {
				refillService(fromDate, toDate)
			}

			// Calc countService of this case only
			var oldclass = rowi.className
			var bookq = getBOOKrowByQN(gv.SERVE, qn)
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
			Alert("saveService", response)
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

function storePresentCellService(evt, pointing)
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
			gv.editableSV && createEditcell(pointing)
			break
		case TREATMENTSV:
			getTREATMENTSV(evt, pointing)
			break
		case ADMISSIONSV:
			getADMISSIONSV(evt, pointing)
			break
		case FINALSV:
			getFINALSV(evt, pointing)
			break
		case ADMITSV:
		case OPDATESV:
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
	var hn = $(pointing).closest("tr").children("td").eq(HNSV).html()
	var patient = pointing.innerHTML

	clearEditcell()
	if (inPicArea(evt, pointing)) {
		showUpload(hn, patient)
	}
}

// operated has 2 possibilities : "", Reoperation
// Operation is determined by keywords in operationFor()
function getTREATMENTSV(evt, pointing)
{
	if (gv.editableSV) {
		var operated = sql = ""

		if (inPicArea(evt, pointing) && pointing.className) {
			clearEditcell()
			// click toggle Operation, Reoperation
			// Operation is not saved in DB. Use runtime operationFor
			if (/\bReoperation/.test(pointing.className)) {
				operated = ""
			}
			else if (/\bOperation/.test(pointing.className)) {
				operated = "Reoperation"
			}
		}
		if (operated) {
			sql = sqlColumn(pointing, "operated", operated)
			saveService(pointing, sql)
		} else {
			createEditcell(pointing)
		}
	}
}

// admitted has 2 possibilities : "", Readmission
// Admission depends on hospital IT
function getADMISSIONSV(evt, pointing)
{
	if (gv.editableSV) {
		var admitted = sql = ""

		if (inPicArea(evt, pointing) && pointing.className) {
			clearEditcell()
			// click toggle Admission, Readmission
			// Admission is not saved in DB. Use Admit column values
			if (/\bReadmission/.test(pointing.className)) {
				admitted = ""
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

function getFINALSV(evt, pointing)
{
	if (inPicArea(evt, pointing)) {
		clearEditcell()
		showRecord(pointing)
	} else {
		if (gv.editableSV) { createEditcell(pointing) }
	}
}

// can't use dialog, it will be hijacked to document body
// and not sticky to pointing while scrolling
function showRecord(pointing)
{
	var $pointing = $(pointing),
		$divRecord = $("#divRecord"),
		$checkRecord = $("#checkRecord"),
		$cancelRecord = $("#cancelRecord"),
		$dialogService = $("#dialogService"),
		oldRecord,
		keycode

	setRecord($pointing)
	oldRecord = getRecord()

	// off all previous listeners
	// Enter key = click checkRecord
	$divRecord.off("keydown").on("keydown", keyRecord)
	$checkRecord.off("click").on("click", checkRecord)
	$cancelRecord.off("click").on("click", closeDivRecord)
	if (gv.editableSV) {
		enableInput()
	} else {
		disableInput()
	}

	reposition($divRecord, "right top", "right bottom", $pointing, $dialogService)
	menustyle($divRecord, $pointing)
	$divRecord.find("input").focus()

	function keyRecord(event)
	{
		keycode = event.which || window.event.keyCode
		event.preventDefault()
		if (keycode === 13) { checkRecord() }
		if (keycode === 27) { closeDivRecord() }
	}

	function checkRecord()
	{
		if (gv.editableSV) { saveRecord($pointing, oldRecord) }
		closeDivRecord()
	}

	function closeDivRecord()
	{
		$divRecord.hide()
		$dialogService.focus()
	}

	function enableInput()
	{
		$divRecord.find("input").off("click", returnFalse)
		$divRecord.find("input[type=text]").prop("disabled", false)
	}

	function disableInput()
	{
		$divRecord.find("input").on("click", returnFalse)
		$divRecord.find("input[type=text]").prop("disabled", true)
	}
}

// this.name === column in Mysql
// this.title === possible values
function setRecord($pointing)
{
	var	qn = $pointing.closest("tr").find("td").eq(QNSV).html(),
		bookq = getBOOKrowByQN(gv.SERVE, qn),
		$divRecord = $("#divRecord")

	$divRecord.find("input[type=text]").val("")
	$divRecord.find("input").prop("checked", false)

	$divRecord.find("input").each(function() {
		this.checked = this.title === bookq[this.name]
	})
}

function getRecord()
{
	var	record = {}

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
		if ((column === "radiosurgery" && content === "") ||
			(column === "endovascular" && content === "")) {
			content = "No"
		}
		if (column === "disease" && content === "No") {
			sql += sqlDefaults(qn)			
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

function sqlDefaults(qn)
{
	return "UPDATE book SET "
		+ "operated='',"
		+ "doneby='',"
		+ "scale='',"
		+ "manner='',"
		+ "editor='" + gv.user
		+ "' WHERE qn=" + qn + ";"
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
	$.each(gv.SERVE, function() {
		if (this.operated) { countOpCase(this, this.disease) }
		if (this.radiosurgery) { countNonOpCase(this, this.radiosurgery) }
		if (this.endovascular) { countNonOpCase(this, this.endovascular) }
		if (!this.operated && !this.radiosurgery && !this.endovascular) {
			countNonOpCase(this, "Conservative")
		}
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

function countOpCase(thisrow, thisitem)
{
	var row = ROWREPORT[thisitem],
		doneby = thisrow.doneby ? thisrow.doneby : "Staff",
		scale = thisrow.scale ? thisrow.scale : "Major",
		manner = thisrow.manner ? thisrow.manner : "Elective",
		column = COLUMNREPORT[doneby]
			   + COLUMNREPORT[scale]
			   + COLUMNREPORT[manner]

	if (row && column) {
		$("#reviewtbl tr")[row].cells[column].innerHTML++
	}
}

function countNonOpCase(thisrow, thisitem)
{
	var row = ROWREPORT[thisitem],
		manner = thisrow.manner ? thisrow.manner : "Elective",
		column = 1 + COLUMNREPORT[manner]

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

	$.each( $("#servicetbl tr"), function() {
		var counter = this.className.split(" ")
		$.each(counter, function() {
			if (document.getElementById(this)) {
				document.getElementById(this).innerHTML++
			}
			if (String(this) === "Readmission") {
				document.getElementById("Admission").innerHTML++
			}
			if (String(this) === "Reoperation") {
				document.getElementById("Operation").innerHTML++
			}
		})
	})
}
