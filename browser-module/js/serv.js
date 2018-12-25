
import { CASENUMSV, HNSV, NAMESV, DIAGNOSISSV, TREATMENTSV, ADMISSIONSV,
  FINALSV, PROFILESV, ADMITSV, OPDATESV, DISCHARGESV, QNSV,

  BRAINDX, BRAINTUMORDX, BRAINVASCULARDX, CSFDX, TRAUMADX, SPINEDX, ETCDX,
  BRAINTUMORDXNO, BRAINVASCULARDXNO, CSFDXNO, TRAUMADXNO, SPINEDXNO, ETCDXNO,
  BRAINTUMORRX, BRAINVASCULARRX, CSFRX, TRAUMARX, SPINERX, SPINEOP, ETCRX,
  BRAINTUMORRXNO, BRAINVASCULARRXNO, CSFRXNO, TRAUMARXNO, SPINERXNO, ETCRXNO,
  NOOPERATION, RADIOSURGERY, ENDOVASCULAR,

  ROWREPORT, COLUMNREPORT, SPECIALTY
} from "./const.js"

import { PACS, resetTimer, fillConsults } from "./control.js"
import {
	getPointer, getOldcontent, getNewcontent, clearEditcell, createEditcell
} from "./edit.js"

import { modelGetServiceOneMonth, modelGetIPD, modelSaveService } from "./model.js"

import {
	getSTAFF, isPACS, START,
	putAgeOpdate, getBOOKrowByQN, URIcomponent,
	updateBOOK, showUpload, getClass,
	Alert, winWidth, winHeight, UndoManager, winResizeFix
} from "./util.js"

import { reViewAll, reViewStaffqueue } from "./view.js"

export { reViewService, savePreviousCellService, editPresentCellService }

// SERVICE is retrieved from DB by getServiceOneMonth
// SERVE is calculated from SERVICE by calcSERVE
let SERVICE = [],
  SERVE = [],
  fromDate = "",
  toDate = "",
  editableSV = true

document.getElementById("clickserviceReview").onclick = serviceReview

// Includes all serviced cases, operated or not (consulted)
// Then count complications and morbid/mortal
// Button click Export to Excel
// PHP Getipd retrieves admit/discharge dates
function serviceReview() {
	let	$dialogService = $("#dialogService"),
		$monthpicker = $("#monthpicker"),
		$monthstart = $("#monthstart"),
		selectedYear = new Date().getFullYear(),
		BuddhistYear = Number(selectedYear) + 543

	$("#servicehead").hide()
	$("#servicetbl").hide()
	$("#exportService").hide()
	$("#reportService").hide()
	$(".divRecord").hide()
	
	$dialogService.dialog({
		title: "Service Neurosurgery",
		closeOnEscape: true,
		modal: true,
		width: winWidth(95),
		height: winHeight(95)
	})

	$monthpicker.show()
	$monthpicker.datepicker({
		altField: $monthstart,
		altFormat: "yy-mm-dd",
		autoSize: true,
		dateFormat: "MM yy",
		monthNames: [ "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", 
					  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม" ],
		yearSuffix: new Date().getFullYear() +  543,
		onChangeMonthYear: function (year, month, inst) {
			$(this).datepicker("setDate", new Date(inst.selectedYear, inst.selectedMonth, 1))
			inst.settings.yearSuffix = inst.selectedYear + 543
		},
		beforeShow: function (input, obj) {
			$(".ui-datepicker-calendar").hide()
		}
	}).datepicker("setDate", new Date(new Date().getFullYear(), new Date().getMonth(), 1))

	$dialogService.off("click").on("click", ".ui-datepicker-title", function() {
		entireMonth($monthstart.val())
	})
}

// new Date(yyyy, mm+1, 0) is the day before 1st date of next month === last date of this month
function entireMonth(fromDate)
{
	let date = new Date(fromDate),
		toDate = new Date(date.getFullYear(), date.getMonth()+1, 0),
		$dialogService = $("#dialogService"),
		$monthpicker = $("#monthpicker"),
		$exportService = $("#exportService"),
		$reportService = $("#reportService"),
		inputval = $monthpicker.val(),
		titledate = inputval.slice(0, -4) + (Number(inputval.slice(-4)) + 543),
		title = "Service Neurosurgery เดือน " + titledate

	$dialogService.dialog({ title: title })
	toDate = $.datepicker.formatDate("yy-mm-dd", toDate)
	$monthpicker.val(toDate)

	modelGetServiceOneMonth(fromDate, toDate).then(response => {
		if (typeof response === "object") {
			SERVICE = response
			SERVE = calcSERVE()
			showService(fromDate, toDate)
		} else {
			Alert("getServiceOneMonth", response)
		}
	}).catch(error => {})

	$exportService.show()
	$exportService.on("click", event => {
		event.preventDefault()
		exportServiceToExcel()
	})

	$reportService.show()
	$reportService.on("click", event => {
		event.preventDefault()
		showReportToDept(title)
	})
}

// SERVE is a copy of SERVICE but also contains some calculated values at run time
//    i.e. - diagnosis, treatment, admit
// All service values are stored in the corresponding table row : $row.data()
// Operation is determined by operationFor() in JS
// Admission is updated by getAdmitDischargeDate in PHP
// Values in DB are user-defined to override runtime-calc values
// admitted : "", "No", "Readmission"			<- admit
// operated : "", "No", "Reoperation"			<- treatment
// doneby : "", "Staff", "Resident"				<- default "Staff"
// manner : "", "Elective", "Emergency"			<- default "Elective"
// scale : "", "Major", "Minor"					<- default "Major"
// disease : "", "No", "Brain Tumor", "Brain Vascular",
//		"CSF related", "Trauma", "Spine", "etc" <- treatment + diagnosis
// radiosurgery : "", "No", "Radiosurgery"		<- treatment
// endovascular : "", "No", "Endovascular"		<- treatment
// infection : "", "Infection"					<- user-defined only
// morbid : "", "Morbidity"						<- user-defined only
// dead : "", "Dead"							<- user-defined only
let showService = function () {
	let	$dialogService = $("#dialogService"),
		$servicetbl = $("#servicetbl"),
		$servicecells = $("#servicecells"),
		$imgopen = $("#servicetbl th #imgopen"),
		$imgclose = $("#servicetbl th #imgclose"),
		$divRecord = $("#servicetbl .divRecord"),
		staffname = "",
		scase = 0,
		classname = ""

	$("#monthpicker").hide()
	$("#servicehead").show()

	// delete previous servicetbl lest it accumulates
	$('#servicetbl tr').slice(1).remove()
	$('#servicetbl').show()
	editableSV = fromDate >= START

	//delete previous servicetbl lest it accumulates
	$servicetbl.find("tr").slice(1).remove()
	$servicetbl.show()
	editableSV = fromDate >= getStart()

	$.each( SERVE, function() {
		if (this.staffname !== staffname) {
			staffname = this.staffname
			scase = 0
			$servicecells.find("tr").clone()
				.appendTo($servicetbl.find("tbody"))
					.children("td").eq(CASENUMSV)
						.prop("colSpan", QNSV - CASENUMSV)
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

	$dialogService.dialog({
		hide: 200,
		width: winWidth(95),
		height: winHeight(95),
		close: function() {
			refillstaffqueue()
			refillall()
            fillConsults()
			$(".ui-dialog:visible").find(".ui-dialog-content").dialog("close");
			$(".fixed").remove()
			hideProfile()
			$(window).off("resize", resizeDialog)
			$dialogService.off("click", clickDialogService)
			if ($("#editcell").data("pointing")) {
				savePreviousCellService()
			}
			clearEditcell()
			clearSelection()
		}
	})
	
	if (/surgery\.rama/.test(location.hostname)) {
		getAdmitDischargeDate(fromDate, toDate)
	}
	countAllServices()
	$servicetbl.fixMe($dialogService)
	hoverService()

	$dialogService.on("click", clickDialogService)

	//for resizing dialogs in landscape / portrait view
	$(window).on("resize", resizeDialog)

	function clickDialogService(event)
	{
		resetTimer();
		idleCounter = 0
		event.stopPropagation()
		let	target = event.target,
			$target = $(target),
			onProfile = $target.closest(".divRecord").length,
			onNormalCell = (target.nodeName === "TD" && target.colSpan === 1),
			pointed = $("#editcell").data("pointing"),
			isHideColumn = target.cellIndex === PROFILESV,
			onDivRecord = /divRecord/.test(target.className),
			onImage = target.nodeName === "IMG"

		if (isHideColumn || onDivRecord || onImage) {
		  if ($servicetbl.find("th").eq(PROFILESV).width() < 200) {
			showProfile()
		  } else {
			hideProfile()
		  }
		  $("#dialogService .fixed").refixMe($servicetbl)
		}

		// click a button on divRecord gives 2 events => first SPAN and then INPUT
		// INPUT event comes after INPUT value was changed
		if (onProfile) {
			if (target.nodeName !== "INPUT") {
				return
			}
			showInputColor($target, target)
			target = $target.closest('td')[0]
		}
		if (pointed) {
			if (target === pointed) {
				return
			}
			savePreviousCellService()
			if (onNormalCell || onProfile) {
				editPresentCellService(event, target)
			} else {
				clearEditcell()
			}
		} else {
			if (onNormalCell || onProfile) {
				editPresentCellService(event, target)
			}
		}
	}

	function showProfile() {
		$servicetbl.addClass("showColumn8")
		$dialogService.find(".fixed").addClass("showColumn8")
		$(".divRecord").show()
		$imgopen.hide()
		$imgclose.show()
	}

	function hideProfile() {
		$servicetbl.removeClass("showColumn8")
		$dialogService.find(".fixed").removeClass("showColumn8")
		$(".divRecord").hide()
		$imgopen.show()
		$imgclose.hide()
	}
			
	function resizeDialog()
	{
		$dialogService.dialog({
			width: winWidth(95),
			height: winHeight(95)
		})
		winResizeFix($servicetbl, $dialogService)
	}
}

function calcSERVE()
{
	let gvserve = SERVICE.slice()

	$.each(gvserve, function() {
		let	treatment = this.treatment

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
	let	KEYWORDS = {
			"Brain Tumor": [ BRAINTUMORRX, BRAINTUMORRXNO, BRAINTUMORDX, BRAINTUMORDXNO ],
			"Brain Vascular": [ BRAINVASCULARRX, BRAINVASCULARRXNO, BRAINVASCULARDX, BRAINVASCULARDXNO ],
			"Trauma": [ TRAUMARX, TRAUMARXNO, TRAUMADX, TRAUMADXNO ],
			"Spine": [ SPINERX, SPINERXNO, SPINEDX, SPINEDXNO.concat(BRAINDX) ],
			"CSF related": [ CSFRX, CSFRXNO, CSFDX, CSFDXNO ],
			"etc": [ ETCRX, ETCRXNO, ETCDX, ETCDXNO ]
		},
		Rx = 0, RxNo = 1, Dx = 2, DxNo = 3, 
		opfor = Object.keys(KEYWORDS),
		diagnosis = thisrow.diagnosis,
		treatment = thisrow.treatment,
		endovascular = thisrow.endovascular === "Endovascular",
		opwhat
	// "No" from match NOOPERATION
	if (isMatched(NOOPERATION, treatment)) { return "No" }

	// "No" from no match
	opfor = isOpfor(KEYWORDS, opfor, Rx, treatment)
	if (opfor.length === 0) { opwhat = "No" }
	else if (opfor.length === 1) { opwhat = opfor[0] }
	else {
		opfor = isNotOpfor(KEYWORDS, opfor, RxNo, treatment)
		if (opfor.length === 1) { opwhat = opfor[0] }
		else {
			opfor = isOpfor(KEYWORDS, opfor, Dx, diagnosis)
			if (opfor.length === 0) { opwhat = "etc" }
			else if (opfor.length === 1) { opwhat = opfor[0] }
			else {
				// in case all cancelled each other out
				opwhat = opfor[0]
				opfor = isNotOpfor(KEYWORDS, opfor, DxNo, diagnosis)
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
	let test = false

	$.each( keyword, function() {
		return !(test = this.test(diagtreat))
	})
	return test
}

function isOpfor(keyword, opfor, RxDx, diagRx)
{
	for (let i=opfor.length-1; i>=0; i--) {
		if (!isMatched(keyword[opfor[i]][RxDx], diagRx)) {
			opfor.splice(i, 1)
		}
	}
	return opfor
}

function isNotOpfor(keyword, opfor, RxDx, diagRx)
{
	for (let i=opfor.length-1; i>=0; i--) {
		if (isMatched(keyword[opfor[i]][RxDx], diagRx)) {
			opfor.splice(i, 1)
		}
	}
	return opfor
}

// Use existing DOM table to refresh when editing
function reViewService(fromDate, toDate) {
	let $servicetbl = $("#servicetbl"),
		$rows = $servicetbl.find("tr"),
		$servicecells = $("#servicecells"),
		len = $rows.length
		staffname = "",
		i = 0, scase = 0,
		classname = ""

	$.each( SERVE, function() {
		if (this.staffname !== staffname) {
			staffname = this.staffname
			scase = 0
			i++
			$staff = $rows.eq(i).children("td").eq(CASENUMSV)
			if ($staff.prop("colSpan") === 1) {
				$staff.prop("colSpan", QNSV - CASENUMSV)
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
		$row = $rows.eq(i)
		$cells = $row.children("td")
		if ($cells.eq(CASENUMSV).prop("colSpan") > 1) {
			$cells.eq(CASENUMSV).prop("colSpan", 1)
				.nextUntil($cells.eq(QNSV)).show()
		}
		$row.filldataService(this, scase, classname)
	});
	if (i < (len - 1)) {
		$rows.slice(i+1).remove()
	}
	countAllServices()
}

jQuery.fn.extend({
	filldataService : function(bookq, scase, classes) {
		let	row = this[0],
			cells = row.cells

		row.className = classes
		if (bookq.hn && isPACS) { cells[HNSV].className = "pacs" }
		if (bookq.hn) { cells[NAMESV].className = "upload" }

		cells[CASENUMSV].innerHTML = scase
		cells[HNSV].innerHTML = bookq.hn
		cells[NAMESV].innerHTML = putNameAge(bookq)
		cells[DIAGNOSISSV].innerHTML = bookq.diagnosis
		cells[TREATMENTSV].innerHTML = bookq.treatment
		cells[ADMISSIONSV].innerHTML = bookq.admission
		cells[FINALSV].innerHTML = bookq.final
		while(cells[PROFILESV].firstChild) cells[PROFILESV].firstChild.remove()
		cells[PROFILESV].appendChild(showRecord(bookq))
		cells[ADMITSV].innerHTML = putThdate(bookq.admit)
		cells[OPDATESV].innerHTML = putThdate(bookq.opdate)
		cells[DISCHARGESV].innerHTML = putThdate(bookq.discharge)
		cells[QNSV].innerHTML = bookq.qn
	}
})

// Simulate hover on icon by changing background pics
function hoverService()
{
	let	tdClass = "td.pacs, td.upload"

	hoverCell(tdClass)
}

function hoverCell(tdClass)
{
	let	paleClasses = ["pacs", "upload"],
		boldClasses = ["pacs2", "upload2"]

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

function showInputColor($target, target)
{
	let	$row = $target.closest("tr"),
		classname = target.title

	if (target.checked) {
		$row.addClass(classname)
	} else {
		$row.removeClass(classname)
	}
}

let getAdmitDischargeDate = function (fromDate, toDate) {

	modelGetIPD(fromDate, toDate).then(response => {
		if (typeof response === "object") {
			updateBOOK(response)
			SERVICE = response.SERVICE
			SERVE = calcSERVE()
			fillAdmitDischargeDate()
		}
	}).catch(error => {})
}

let fillAdmitDischargeDate = function () {
	let i = 0,
		staffname = "",
		$rows = $("#servicetbl tr")

	$.each( SERVE, function() {
		if (this.staffname !== staffname) {
			staffname = this.staffname
			i++
		}
		i++
		let $thisRow = $rows.eq(i),
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

function savePreviousCellService() {
	let pointed = getPointer(),
		oldcontent = getOldcontent(),
		newcontent = getNewcontent()

	if (!pointed || (oldcontent === newcontent)) {
		return
	}

	switch(pointed.cellIndex)
	{
		case CASENUMSV:
		case HNSV:
		case NAMESV:
			break
		case DIAGNOSISSV:
			saveContentService(pointed, "diagnosis", newcontent)
			break
		case TREATMENTSV:
			saveContentService(pointed, "treatment", newcontent)
			break
		case ADMISSIONSV:
			saveContentService(pointed, "admission", newcontent)
			break
		case FINALSV:
			saveContentService(pointed, "final", newcontent)
			break
		case PROFILESV:
			saveProfileService(pointed)
			break
		case ADMITSV:
		case DISCHARGESV:
			break
	}
}

//column matches column name in MYSQL
let saveContentService = function (pointed, column, content) {

	// Not refillService because it may make next cell back to old value
	// when fast entry, due to slow return from Ajax of previous input
	pointed.innerHTML = content || ''

	// take care of white space, double qoute, single qoute, and back slash
	content = URIcomponent(content)

	saveService(pointed, column, content)
}

let saveService = function (pointed, column, newcontent) {
	let $row = $(pointed).closest("tr"),
		row = $row[0],
		qn = row.cells[QNSV].innerHTML,
		oldcontent = getOldcontent(),
		fromDate = $("#monthstart").val(),
		toDate = $("#monthpicker").val()

	saveServiceManager(newcontent, oldcontent)

	// make undo-able
	UndoManager.add({
		undo: function() {
			saveServiceManager(oldcontent, newcontent)
			pointed.innerHTML = oldcontent
		},
		redo: function() {
			saveServiceManager(newcontent, oldcontent)
			pointed.innerHTML = newcontent
		}
	})

	let saveServiceManager = function (newdata, olddata) {
		modelSaveService(column, newdata, qn, fromDate, toDate).then(response => {
			let hasResponse = function () {
				updateBOOK(response)
				SERVICE = response.SERVICE

				// other user may add a row
				let servelen = SERVE.length
				SERVE = calcSERVE()
				if (SERVE.length !== servelen) {
					reviewService(fromDate, toDate)
				}

				// Calc countService of this case only
				let oldclass = row.className,
					bookq = getBOOKrowByQN(SERVE, qn),
					newclass = countService(bookq, fromDate, toDate),
					oldclassArray = oldclass.split(" "),
					newclassArray = newclass.split(" "),
					counter,
					updateCounter = function (classArray, add) {
						$.each( classArray, function(i, each) {
							let counter = document.getElementById(each)
							counter.innerHTML = Number(counter.innerHTML) + add
						})
					};

				if (oldclass !== newclass) {
					updateCounter(oldclassArray, -1)
					updateCounter(newclassArray, 1)
					row.className = newclass
				}
			},
			noResponse = function () {
				Alert("saveService", response)
				pointed.innerHTML = olddata
				// return to previous content
			};

			typeof response === "object" ? hasResponse() : noResponse()
		}).catch(error => {})
	}
}

// Set up editcell for keyin
// redirect click to openPACS or file upload
function editPresentCellService(event, pointing) {
	let cindex = pointing.cellIndex

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
		case TREATMENTSV:
		case ADMISSIONSV:
		case FINALSV:
			editableSV && createEditcell(pointing)
			break
		case PROFILESV:
			editableSV && editcellSaveData(pointing, getRecord(pointing))
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
	if (isPACS) {
		if (inPicArea(evt, pointing)) {
			PACS(pointing.innerHTML)
		}
	}
}

function getNAMESV(evt, pointing)
{
	let hn = $(pointing).closest("tr").children("td").eq(HNSV).html()
	let patient = pointing.innerHTML

	clearEditcell()
	if (inPicArea(evt, pointing)) {
		showUpload(hn, patient)
	}
}

function showRecord(bookq)
{
	let $divRecord = $("#profileRecord > div").clone()

	initRecord(bookq, $divRecord)
	inputEditable($divRecord)
	return $divRecord[0]
}

// this.name === column in Mysql
// this.title === value of this item
// add qn to this.name to make it unique
// next sibling (span) right = wide pixels, to make it (span) contained in input box
function initRecord(bookq, $divRecord)
{
	let $input = $divRecord.find("input"),
		inputName = "",
		wide = ""

	$input.each(function() {
		inputName = this.name
		this.checked = this.title === bookq[inputName]
		this.name = inputName + bookq.qn
		wide = this.className.replace("w", "") + "px"
		this.nextElementSibling.style.right = wide
	})
}

function inputEditable($divRecord)
{
	if (editableSV) {
		$divRecord.find("input").prop("disabled", false)
	} else {
		$divRecord.find("input").prop("disabled", true)
	}
}

function getRecord(pointing)
{
	let	record = {},
		$input = $(pointing).find(".divRecord input")

	$input.each(function() {
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

function saveProfileService(pointed)
{
	let newRecord = getRecord(pointed),
		oldRecord = getOldcontent(),
		setRecord = {},
		$pointing = $(pointed),
		sql,
		newkey

	$.each(newRecord, function(key, val) {
		if (val === oldRecord[key]) {
			delete newRecord[key]
		}
	})
	if ( Object.keys(newRecord).length ) {
		$.each(newRecord, function(key, val) {
		   newkey = key.replace(/\d+/g, "");
		   setRecord[newkey] = newRecord[key];
		})
		sql = sqlRecord($pointing, setRecord)
		saveService($pointing[0], sql)
	}
}

function sqlRecord($pointing, setRecord)
{
	let qn = $pointing.closest("tr").find("td").eq(QNSV).html(),
		sql = "sqlReturnService="

	$.each(setRecord, function(column, content) {
		if (column === "disease" && content === "No") {
			sql += sqlDefaults(qn)			
		}
		sql += sqlItem(column, content, qn)
	})

	return sql
}

function showReportToDept(title)
{
	let sumColumn = [0, 0, 0, 0, 0, 0, 0, 0]

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
	$.each(SERVE, function() {
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
	let row = ROWREPORT[thisitem],
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
	let row = ROWREPORT[thisitem],
		manner = thisrow.manner ? thisrow.manner : "Elective",
		column = 1 + COLUMNREPORT[manner]

	if (row && column) {
		$("#reviewtbl tr")[row].cells[column].innerHTML++
	}
}

let resetcountService = function () {
	[ "Admission", "Discharge", "Operation", "Readmission",
	   "Reoperation", "Infection", "Morbidity", "Dead"
	].forEach(function(item) {
		document.getElementById(item).innerHTML = 0
	})
}

let countService = function (thiscase, fromDate, toDate) {
	let classname = "",
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

let countAllServices = function () {
	resetcountService()

	$.each( $("#servicetbl tr"), function() {
		let counter = this.className.split(" "),
			id

		$.each(counter, function() {
			if (id = String(this)) {
				if (document.getElementById(id)) {
					document.getElementById(id).innerHTML++
				}
				if (id === "Readmission") {
					document.getElementById("Admission").innerHTML++
				}
				if (id === "Reoperation") {
					document.getElementById("Operation").innerHTML++
				}
			}
		})
	})
}
