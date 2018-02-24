
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
// Operation is determined by isOperation() in JS
// Admission is updated by getAdmitDischargeDate in PHP
// Values in DB are use-defined to override runtime-calc values
// admitted : "", "Readmission"					<- admit
// operated : "", "Reoperation"					<- treatment
// doneby : "", "Staff", "Resident"				<- defaulted by treatment
// manner : "", "Elective", "Emergency"			<- defaulted by treatment
// scale : "", "Major", "Minor"					<- defaulted by treatment
// disease : "", "Brain Tumor", "Brain Vascular",
//		"CSF related", "Trauma", "Spine", "etc" <- treatment + diagnosis
// radiosurgery : "", "Radiosurgery"			<- treatment
// endovascular : "", "Endovascular"			<- treatment
// infection : "", "Infection"					<- use-defined only
// morbid : "", "Morbidity"						<- use-defined only
// dead : "", "Dead"							<- use-defined only
function showService(fromDate, toDate)
{
	//delete previous servicetbl lest it accumulates
	var $servicetbl = $("#servicetbl"),
		$servicecells = $("#servicecells")

	$("#monthpicker").hide()
	$("#servicehead").show()

	$servicetbl.find("tr").slice(1).remove()
	$servicetbl.show()

	var staffname = "",
		scase = 0,
		classname = ""

	$.each( gv.SERVE, function() {
		if (this.staffname !== staffname) {
			staffname = this.staffname
			scase = 0
			$servicecells.find("tr").clone()
				.appendTo($servicetbl.find("tbody"))
					.children("td").eq(OPDATE)
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

	var	editable = fromDate >= getStart(),
		$dialogService = $("#dialogService"),
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
			$divRecord.hide()
		}
	})
	resetcountService()
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
			if (!$(target).closest("#divRecord").length) {
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

function calcSERVE()
{
	var gvserve = gv.SERVICE.slice()

	$.each(gvserve, function() {

		var	treatment = this.treatment,
			operate = isOperation(treatment)

		// If DB value is blank, calc the value
		// if don't know opfor what, but it is an operation, then default to etc
		if (!this.disease) {
			var	opfor = operationFor(treatment, this.diagnosis)
			if (!opfor && operate) { opfor = "etc" }
			if (opfor) { this.disease = opfor }
		}

		if (!this.operated && operate) {
			this.operated = "Operation"
			this.doneby = "Staff"
			this.scale = "Major"
			this.manner = "Elective"
		}

		if (!this.radiosurgery && isRadiosurgery(treatment)) {
			this.radiosurgery = "Radiosurgery"
		}

		if (!this.endovascular && isEndovascular(treatment)) {
			this.endovascular = "Endovascular"
		}
	})

	return gvserve
}

function operationFor(treatment, diagnosis)
{
	var opfor = ""

	opfor = isEtcRx(treatment) ? "etc" : opfor
	opfor = isCSFRx(treatment) ? "CSF related" : opfor
	opfor = isSpineRx(treatment) ? "Spine" : opfor
	opfor = isTraumaRx(treatment, diagnosis) ? "Trauma" : opfor
	opfor = isVascularRx(treatment) ? "Brain Vascular" : opfor
	opfor = isTumorRx(treatment) ? "Brain Tumor" : opfor

	return opfor
}

function resizeDialog()
{
	var	$dialogService = $("#dialogService")
	$dialogService.dialog({
		width: window.innerWidth * 95 / 100,
		height: window.innerHeight * 95 / 100
	})
	winResizeFix($("#servicetbl"), $dialogService)
}

function refillService(fromDate, toDate)
{
	var i = 0
	$.each( gv.STAFF, function() {
		var staffname = this.staffname
		i++
		var $staff = $("#servicetbl tr").eq(i).children("td").eq(CASENUMSV)
		if ($staff.prop("colSpan") === 1) {
			$staff.prop("colSpan", 10)
				.addClass("serviceStaff")
					.siblings().hide()
		}
		$staff.html(staffname)

		var scase = 0
		$.each( gv.SERVE, function() {
			if (this.staffname === staffname) {
				var classes = countService(this, fromDate, toDate)
				i++
				scase++
				var $cells = $("#servicetbl tr").eq(i).children("td")
				if ($cells.eq(CASENUMSV).prop("colSpan") > 1) {
					$cells.eq(CASENUMSV).prop("colSpan", 1)
						.nextUntil($cells.eq(QNSV)).show()
				}
				$("#servicetbl tr").eq(i)
						.filldataService(this, scase, classes)
			}
		});
	})
	if (i < ($("#servicetbl tr").length - 1)) {
		$("#servicetbl tr").slice(i+1).remove()
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
		cells[ADMITSV].innerHTML = putOpdate(bookq.admit)
		cells[OPDATESV].innerHTML = putOpdate(bookq.opdate)
		cells[DISCHARGESV].innerHTML = putOpdate(bookq.discharge)
		cells[QNSV].innerHTML = bookq.qn
	}
})

// Simulate hover on icon by changing background pics
function hoverService(editable)
{
	var	tdClass = "td.pacs, td.camera, td.record"
				+ (editable
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
		hoverCell("td.Readmission")
	}
	else if (/Admission/.test(classname)) {
		$admit.addClass("Admission")
		hoverCell("td.Readmission")
	}
	if (/Reoperation/.test(classname)) {
		$treat.addClass("Reoperation")
		hoverCell("td.Reoperation")
	}
	else if (/Operation/.test(classname)) {
		$treat.addClass("Operation")
		hoverCell("td.Operation")
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
		$.each( gv.SERVE, function() {
			if (this.staffname === staffname) {
				i++
				var $thisRow = $("#servicetbl tr").eq(i),
					$cells = $thisRow.children("td")

				if (this.admit &&  this.admit !== $cells.eq(ADMITSV).html()) {
					$cells.eq(ADMITSV).html(this.admit)
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
					$cells.eq(DISCHARGESV).html(this.discharge)
					if (!/Discharge/.test($thisRow.className)) {
						$thisRow.addClass("Discharge")
						// for counting
					}
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
		fromDate = $("#monthstart").val(),
		start = getStart(),
		editable = (fromDate >= start),
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
	var qn = $(pointed).closest("tr").find("td").eq(QNSV).html()

	// Not refillService because it may make next cell back to old value
	// when fast entry, due to slow return from Ajax of previous input
	pointed.innerHTML = content? content : ""

	//take care of white space, double qoute, single qoute, and back slash
	if (/\W/.test(content)) {
		content = URIcomponent(content)
	}
	// after edit, treatment keyword may be changed
	// from non-operation <-> operation <-> radiosurgery <-> endovascular
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
	var	bookq = getBOOKrowByQN(gv.SERVE, qn),
		operated = isOperation(content),
		radiosurgery = isRadiosurgery(content),
		endovascular = isEndovascular(content),
		sql = "",
		oper = radi = endo = null

	if (bookq.operated && !operated) { oper = "" }
	if (!bookq.operated && operated) { oper = "Operation" }
	if (bookq.radiosurgery && !radiosurgery) { radi = "" }
	if (!bookq.radiosurgery && radiosurgery) { radi = "Radiosurgery" }
	if (bookq.endovascular && !endovascular) { endo = "" }
	if (!bookq.endovascular && endovascular) { endo = "Endovascular" }

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
			gv.SERVE = calcSERVE()

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
	var hn = $(pointing).closest("tr").children("td").eq(HNSV).html()
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
//	$("#donedate").datepicker({
//		dateFormat: "yy-mm-dd"
//	})
	var $pointing = $(pointing),
		$divRecord = $("#divRecord"),
		oldRecord,
		keycode

	setRecord($pointing)
	oldRecord = getRecord()

	// Enter key = OK
	$divRecord.on("keydown", keyRecord)

	$("#checkRecord").on("click", checkRecord)
	$("#cancelRecord").on("click", closeDivRecord)

	reposition($divRecord, "right top", "right bottom", $pointing, $("#dialogService"))
	menustyle($divRecord, $pointing)

	if (editable) {
		$divRecord.find("input").off("click", returnFalse)
		$divRecord.find("input[type=text]").prop("disabled", false)
	} else {
		$divRecord.find("input").on("click", returnFalse)
		$divRecord.find("input[type=text]").prop("disabled", true)
	}
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
		if (editable) { saveRecord($pointing, oldRecord) }
		closeDivRecord()
	}

	function closeDivRecord()
	{
		$divRecord.hide()
		$divRecord.off("keydown", keyRecord)
		$("#dialogService").focus()
	}
}

// this.name === column in Mysql
// this.title === possible value
function setRecord($pointing)
{
	var	qn = $pointing.closest("tr").find("td").eq(QNSV).html(),
		bookq = getBOOKrowByQN(gv.SERVE, qn),
		$divRecord = $("#divRecord")

	$divRecord.find("input[type=text]").val("")
	$divRecord.find("input").prop("checked", false)

//	document.getElementById("donedate").value = bookq.donedate
//												? bookq.donedate
//												: bookq.opdate
	$divRecord.find("input").each(function() {
		this.checked = this.title === bookq[this.name]
	})
}

function getRecord()
{
	var	record = {}

//	record.donedate = document.getElementById("donedate").value
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
		doneby = thisrow.doneby ? thisrow.doneby : "Staff"
		scale = thisrow.scale ? thisrow.scale : "Major"
		manner = thisrow.manner ? thisrow.manner : "Elective"
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
		manner = thisrow.manner ? thisrow.manner : "Elective"
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
			if (this === "Readmission") {
				document.getElementById("Admission").innerHTML++
			}
			if (this === "Reoperation") {
				document.getElementById("Operation").innerHTML++
			}
		})
	})
}

function isTumorRx(treatment)
{
	var TumorRx = false

//	$.each( NOTTUMOR, function() {
//		return !(Tumor = this.test(treatment))
//	})
	// NOTTUMOR takes priority
//	if (TumorRx) { return false }
	$.each( TUMORRX, function() {
		return !(TumorRx = this.test(treatment))
	})
	return TumorRx
}

function isVascularRx(treatment)
{
	var VascularRx = false

	$.each( VASCULARRX, function() {
		return !(VascularRx = this.test(treatment))
	})
	return VascularRx
}

function isCSFRx(treatment)
{
	var csfRx = false

	$.each( CSFRX, function() {
		return !(csfRx = this.test(treatment))
	})
	return csfRx
}

function isTraumaRx(treatment, diagnosis)
{
	var TraumaRx = false

	if (/chronic|csdh/i.test(diagnosis)) {
		return false
	}
	$.each( TRAUMARX, function() {
		return !(TraumaRx = this.test(treatment))
	})
	return TraumaRx
}

function isSpineRx(treatment)
{
	var SpineRx = false

	$.each( SPINERX, function() {
		return !(SpineRx = this.test(treatment))
	})
	return SpineRx
}

function isEtcRx(treatment)
{
	var EtcRx = false

	$.each( ETCRX, function() {
		return !(EtcRx = this.test(treatment))
	})
	return EtcRx
}

function isOperation(treatment)
{
	var Operation = false

	$.each( NOTOPERATION, function() {
		return !(Operation = this.test(treatment))
	})
	// NOTOPERATION takes priority
	if (Operation) { return false }

	$.each( OPERATION, function() {
		return !(Operation = this.test(treatment))
	})
	return Operation
}

function isRadiosurgery(treatment)
{
	var Radiosurgery = false

	$.each( RADIOSURGERY, function() {
		return !(Radiosurgery = this.test(treatment))
	})
	return Radiosurgery
}

function isEndovascular(treatment)
{
	var Endovascular = false

	$.each( ENDOVASCULAR, function() {
		return !(Endovascular = this.test(treatment))
	})
	return Endovascular
}
