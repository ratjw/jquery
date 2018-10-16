
export const
	//servicetbl
	CASENUMSV	= 0,
	HNSV		= 1,
	NAMESV		= 2,
	DIAGNOSISSV	= 3,
	TREATMENTSV	= 4,
	ADMISSIONSV	= 5,
	FINALSV		= 6,
	ADMITSV		= 7,
	OPDATESV	= 8,
	DISCHARGESV	= 9,
	QNSV		= 10

import {
	BOOK, CONSULT, STAFF, isPACS, START,
	updateBOOK, resetTimer, uploadWindow, PACS
} from "./control.js"

import {
	getPointer, getOldcontent, getNewcontent, clearEditcell, createEditcell
} from "./edit.js"

import { modelGetfromServer, modelGetIPD, modelSaveService } from "./model.js"

import {
	putAgeOpdate, getBOOKrowByQN, URIcomponent,
	Alert, winWidth, winHeight, UndoManager
} from "./util.js"

import { reViewAll, reViewStaffqueue, winResizeFix } from "./view.js"

export { serviceReview, reViewService, savePreviousCellService, editPresentCellService }

let SERVICE = {}, fromDate = "", toDate = "", editable = true

// function declaration (definition ) : public
// function expression (literal) : local

// Service table use SERVICE which is generated from BOOK + CONSULT
// for a specified month in each call to serviceReview
// Includes all serviced cases, operated or not (consulted)
// Then count complications and morbid/mortal
// Button click Export to Excel
// PHP Getipd retrieves admit/discharge dates
function serviceReview() {
	resetcountService()
	$('#servicehead').hide()
	$('#servicetbl').hide()
	$('#exportService').hide()
	let $dialogService = $('#dialogService')
	$dialogService.dialog({
		title: 'Service Neurosurgery',
		closeOnEscape: true,
		modal: true,
		width: winWidth() * 95 / 100,
		height: winHeight() * 95 / 100
	})

	// Div monthpicker has Thai month
	// Div monthpicking has ISO date
	//	val: begin date of the month
	//	title: end date of the month
	$('#monthpicker').show()
	$('#monthpicker').datepicker( {
		altField: $('#monthpicking'),
		altFormat: "yy-mm-dd",
		autoSize: true,
		dateFormat: "MM yy",
		monthNames: [ "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", 
					  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม" ],
		onChangeMonthYear: function (year, month, inst) {
			$(this).datepicker('setDate', new Date(inst.selectedYear, inst.selectedMonth, 1))
		},
		// Hide date calendar, show only header
		beforeShow: function (input, obj) {
			$('.ui-datepicker-calendar').hide()
		}
	}).datepicker("setDate", new Date(new Date().getFullYear(), new Date().getMonth(), 1))

	$(document).off("click", ".ui-datepicker-title")
				.on("click", ".ui-datepicker-title", function() {
		fromDate = $('#monthpicking').val()
		editable = fromDate >= START
		toDate = calEndOfMonth()

		getServiceOneMonth().then(function(service) {
			SERVICE = service
			showService()
		}).catch(error => {})

		$(document).off("click", '.ui-datepicker-title')
		$("#exportService").show()
		$("#exportService").off("click").on("click", function(e) {
			e.preventDefault();
			exportToExcel()
		})

		// for resizing dialogs in landscape / portrait view
		$(window).resize(function() {
			$dialogService.dialog({
				width: winWidth() * 95 / 100,
				height: winHeight() * 95 / 100
			})
			winResizeFix($("#servicetbl"), $dialogService)
		})
	})
}

let getServiceOneMonth = function() {

	return new Promise((resolve, reject) => {
		let beforeStart = function () {
			getfromServer().then( function (service) {
				resolve(service)
			}).catch(error => {})
		},
		afterStart = function () {
			resolve(getfromBOOKCONSULT())
		}

		fromDate < START ? beforeStart() : afterStart()
	})
}

// No data before last month in BOOK, CONSULT
// Retrieve the specified month from server
let getfromServer = function () {

	return new Promise((resolve, reject) => {

		modelGetfromServer(fromDate, toDate).then(response => {
			;/dob/.test(response)
				? resolve( JSON.parse(response) )
				: reject( "getfromServer", response )
		}).catch(error => {})
	})
}

// Get only cases in specified month
// Merge book & service then sort by date
let getfromBOOKCONSULT = function() {
	let	addFromRAM = function (bookconsult) {
		return $.grep( bookconsult, function (e) {
			return e.opdate >= fromDate && e.opdate <= toDate
		} )
	},
	servicebook = addFromRAM(BOOK),
	serviceconsult = addFromRAM(CONSULT),
	service = servicebook.concat(serviceconsult),
	data = service.sort(function (a, b) {
		return (a.opdate < b.opdate)
			? -1
			: a.opdate > b.opdate ? 1 : 0;
	})

	return data
}

// new Date(yyyy, mm, 1) is 1st date of month
// new Date(yyyy, mm, 0) is 1 day before 1st date of month === last date of this month
let calEndOfMonth = function () {
	let date = new Date(fromDate),
		last = new Date(date.getFullYear(), date.getMonth()+1, 0)

	return $.datepicker.formatDate('yy-mm-dd', last)
}

// Iterate through each staff with his own cases numbers
// Get admit/discharge if vacant
// Count morbid/mortal
let showService = function () {
	// delete previous servicetbl lest it accumulates
	$('#servicetbl tr').slice(1).remove()
	$('#servicetbl').show()
	$("#servicetbl").off("click").on("click", function (event) {

		// Editcell hide after 1 min (5 cycles) idling
		// Logout after 10 min (50 cycles) idling
		resetTimer(true, true);

		event.stopPropagation()
		let target = event.target
		return (target.nodeName === "TH") || (target.className === "serviceStaff")
				? clearEditcell()
				: clickservice(target)
	})

	$.each( STAFF, function() {
		let staffname = String(this),
			scase = 0
		$('#servicecells tr').clone()
			.appendTo($('#servicetbl tbody'))
				.children("td").eq(CASENUMSV)
					.prop("colSpan", 8)
						.addClass("serviceStaff")
							.html(staffname)
								.siblings().hide()
		$.each( SERVICE, function() {
			if (this.staffname === staffname) {
				let color = countService(this)
				scase++
				$('#servicecells tr').clone()
					.appendTo($('#servicetbl tbody'))
						.filldataService(this, scase, color)
			}
		});
	})

	let $monthpicker = $('#monthpicker')

	$monthpicker.hide()
	$('#servicehead').show()
	$('#dialogService').dialog({
		title: 'Service Neurosurgery เดือน ' + $monthpicker.val(),

		// Animation helps dialog disappear more quickly
		// than waiting for reViewAll to finish
		hide: 500,
		close: function() {
			reViewAll()
			reViewStaffqueue()
			clearEditcell()
			$(window).off("resize")
			$("#fixheader").remove()
		}
	})
	getAdmitDischargeDate()
	countAllServices()
	$("#servicetbl").fixMe($("#dialogService"));
}

// Use existing DOM table to refresh when editing
function reViewService() {
	let i = 0
	$.each( STAFF, function() {
		i++
		let staffname = String(this),
			$thisCase = $('#servicetbl tr').eq(i).children("td").eq(CASENUMSV),
			scase = 0

		$thisCase.prop("colSpan") === 1 &&
			$thisCase.prop("colSpan", 8)
				.addClass("serviceStaff")
					.siblings().hide()

		$thisCase.html(staffname)

		$.each( SERVICE, function() {
			if (this.staffname === staffname) {
				i++
				scase++
				let color = countService(this),
					$thisRow = $('#servicetbl tr').eq(i).children("td")
				$thisRow.eq(CASENUMSV).prop("colSpan") > 1 &&
					$thisRow.eq(CASENUMSV).prop("colSpan", 1)
						.nextUntil($thisRow.eq(QNSV)).show()
				$('#servicetbl tr').eq(i)
					.filldataService(this, scase, color)
			}
		});
	})
	if (i < ($('#servicetbl tr').length - 1)) {
		$('#servicetbl tr').slice(i+1).remove()
	}
	countAllServices()
}

jQuery.fn.extend({
	filldataService : function(q, scase, color) {
		let cells = this[0].cells
		addColorService(this, color)
		cells[CASENUMSV].innerHTML = scase
		cells[HNSV].innerHTML = q.hn
		q.hn && isPACS && (cells[HNSV].className = "pacs")
		cells[NAMESV].innerHTML = q.patient
			+ (q.dob ? ("<br>อายุ " + putAgeOpdate(q.dob, q.opdate)) : "")
		cells[NAMESV].className = "camera"
		cells[DIAGNOSISSV].innerHTML = q.diagnosis
		cells[TREATMENTSV].innerHTML = q.treatment
		cells[ADMISSIONSV].innerHTML = q.admission
		cells[FINALSV].innerHTML = q.final
		cells[ADMITSV].innerHTML = (q.admit ? q.admit : "")
		cells[DISCHARGESV].innerHTML = (q.discharge ? q.discharge : "")
		cells[QNSV].innerHTML = q.qn
	}
})

// add classes of morbid/mortal
// 1. The cell producing the color class
// 2. The row with all producing classes, row color is the last class
let addColorService = function ($this, color) {
	if (color) {
		$this[0].className = color
		let $cell = $this.children("td"),
			$final = $cell.eq(FINALSV)
		if (/Readmission/.test(color)) {
			$cell.eq(ADMISSIONSV).addClass("Readmission")
		}
		if (/Reoperation/.test(color)) {
			$cell.eq(TREATMENTSV).addClass("Reoperation")
		}
		if (/Infection/.test(color)) {
			$final.addClass("Infection")
		}
		// still show Infection
		if ($final.attr("class") !== "Infection") {
			if (/Morbidity/.test(color)) {
				$final.addClass("Morbidity")
			}
			if (/Dead/.test(color)) {
				$final.addClass("Dead")
			}
		}
	}
}

let getAdmitDischargeDate = function () {

	modelGetIPD(fromDate, toDate).then(response => {
		if (/BOOK/.test(response)) {
			updateBOOK(response)
			fillAdmitDischargeDate()
		}
	}).catch(error => {})
}

let fillAdmitDischargeDate = function () {
	let i = 0
	$.each( STAFF, function() {
		let staffname = String(this)
		i++
		$.each( SERVICE, function() {
			if (this.staffname === staffname) {
				i++
				let $thisRow = $('#servicetbl tr').eq(i).children("td")
				if (this.admit && !$thisRow.eq(ADMITSV).html()) {
					document.getElementById("Admit").innerHTML++
				}
				$thisRow.eq(ADMITSV).html(this.admit)
				if (this.discharge && !$thisRow.eq(DISCHARGESV).html()) {
					document.getElementById("Discharge").innerHTML++
				}
				$thisRow.eq(DISCHARGESV).html(this.discharge)
			}
		});
	})
}

let countAllServices = function () {
	resetcountService()

	$.each( $('#servicetbl tr'), function() {
		let counter = this.className.split(" ")

		!!counter[0] &&
		$.each(counter, function() {
			document.getElementById(this).innerHTML++
		})
	})
}

let clickservice = function (clickedCell) {
	savePreviousCellService()
	editPresentCellService(clickedCell)
}

// Return true/false for function onChange() when idling
function savePreviousCellService() {
	let pointed = getPointer(),
		oldcontent = getOldcontent(),
		newcontent = getNewcontent(),
		cell = function ()	{
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

	return pointed && (oldcontent !== newcontent) && cell()
}

let modelSaveServ = function (pointed, column, content, oldcontent, rowi, $rowi, qn) {
	modelSaveService(column, content, qn).then(response => {
		let hasData = function () {
			updateBOOK(response)

			getServiceOneMonth().then(function (service) {
				SERVICE = service
				let bookq = getBOOKrowByQN(service, qn),
					color = rowi.className,
					newcolor = countService(bookq),
					colorArray = color.split(" "),
					newcolorArray = newcolor.split(" "),
					counter,
					updateCounter = function (classColors, count) {
						$.each( classColors, function(i, each) {
							let counter = document.getElementById(each)
							counter.innerHTML = Number(counter.innerHTML) + count
						})
					};

				// Not reViewService because it may make next editTD back to old value
				// when fast entry, due to slow return from Ajax of previous input
				!color && newcolor
				? updateCounter(newcolorArray, 1)	
				: color && !newcolor
				? updateCounter(colorArray, -1)		
				: color && newcolor && (color !== newcolor)
					&& (updateCounter(colorArray, -1), updateCounter(newcolorArray, 1))

				// Update tr.newclass, td.newclass
				// Remove unused class
				rowi.className = newcolor
				$(pointed).removeClass(color)
				addColorService($rowi, newcolor)
			})
		},
		noData = function () {
			Alert("saveContentService", response)
			pointed.innerHTML = oldcontent		// return to previous content
		};

		;/BOOK/.test(response) ? hasData() : noData()
	}).catch(error => {})
}

let saveContentService = function (pointed, column, content) {
	let $rowi = $(pointed).closest('tr'),
		rowi = $rowi[0],
		qn = rowi.cells[QNSV].innerHTML,
		oldcontent = getOldcontent()

	pointed.innerHTML = content || ''

	content = URIcomponent(content)	// take care of white space, double qoute, 
												// single qoute, and back slash
	modelSaveServ(pointed, column, content, oldcontent, rowi, $rowi, qn)

	// make undo-able
	UndoManager.add({
		undo: function() {
			modelSaveServ(pointed, column, oldcontent, content, rowi, $rowi, qn)
			pointed.innerHTML = oldcontent
		},
		redo: function() {
			modelSaveServ(pointed, column, content, oldcontent, rowi, $rowi, qn)
			pointed.innerHTML = content
		}
	})		
}

// Set up editcell for keyin
// redirect click to openPACS or file upload
function editPresentCellService(pointing) {
	let cindex = pointing.cellIndex

	switch(cindex)
	{
		case CASENUMSV:
			break
		case HNSV:
			clearEditcell()
			pointing.className === "pacs" && PACS(pointing.innerHTML)
			break
		case NAMESV:
			let hn = $(pointing).closest('tr').children("td").eq(HNSV).html(),
				patient = pointing.innerHTML

			clearEditcell()
			hn && uploadWindow(hn, patient)
			break
		case DIAGNOSISSV:
		case TREATMENTSV:
		case ADMISSIONSV:
		case FINALSV:
			editable
			? createEditcell(pointing)
			: clearEditcell()
			break
		case ADMITSV:
		case DISCHARGESV:
			clearEditcell()
			break
	}
}

let resetcountService = function () {
	[ "Admit", "Discharge", "Operation", "Readmission",
	   "Reoperation", "Infection", "Morbidity", "Dead"
	].forEach(function(item) {
		document.getElementById(item).innerHTML = 0
	})
}

let countService = function (thiscase) {
	let color = "";

	[ Admit, Discharge, Operation, Readmission, Reoperation,
	   Infection, Morbidity, Dead
	].forEach(function(func) {
		if (func(thiscase)) {
			let str = func.name
			color += color ? " " + str : str
		}
	})

	return color
}

let Admit = function (thiscase) {
	return ((thiscase.admit >= fromDate)
			&& (thiscase.admit <= toDate)
			&& (thiscase.waitnum > 0))
}

let Discharge = function (thiscase) {
	return ((thiscase.discharge >= fromDate)
			&& (thiscase.discharge <= toDate)
			&& (thiscase.waitnum > 0))
}

let Operation = function (thiscase) {

	let neuroSxOp = [
		/ACDF/, /ALIF/, /[Aa]nast/, /[Aa]pproa/, /[Aa]spirat/, /advance/,
		/[Bb]iop/, /[Bb]lock/, /[Bb]urr/, /[Bb]x/, /[Bb]ypass/, /[Cc]lip/, 
		/[Dd]ecom/, /DBS/, /[Dd]rain/,
		/[Ee]ctomy/, /[Ee]ndo/, /ESI/, /ETS/, /ETV/, /EVD/, /[Ee]xcis/,
		/[Ff]ix/, /[Ff]usion/, /[Ii]nsert/, /[Ll]esion/, /[Ll]ysis/, 
		/MIDLIF/, /MVD/, /OLIF/, /[Oo]cclu/, /[Oo]p/, /ostom/, /otom/,
		/plast/, /PLF/, /PLIF/,
		/[Rr]emov/, /[Rr]epa/, /[Rr]evis/, /[Rr]obot/,
		/scope/, /[Ss]crew/, /[Ss]hunt/, /[Ss]tim/, /SNRB/, /TSP/,
		/TLIF/, /[Tt]rans/, /[Uu]ntether/
	]

	return !!($.grep( neuroSxOp, function(each) {
				return each.test(thiscase.treatment)
			}))[0]
}

let Readmission = function (thiscase) {
	return (/\b[Rr]e-ad/.test(thiscase.admission))
}

let Reoperation = function (thiscase) {
	return (/\b[Rr]e-op/.test(thiscase.treatment))
}

let Infection = function (thiscase) {
	return (/SSI/.test(thiscase.final)) || (/Infect/.test(thiscase.final))
}

let Morbidity = function (thiscase) {
	return (/Morbid/.test(thiscase.final))
}

let Dead = function (thiscase) {
	return (/Dead/.test(thiscase.final)) || (/passed away/i.test(thiscase.final))
}

// Copy servicetbl to exceltbl along the head (MM counter and color classes)
let exportToExcel = function () {
	// getting data from our table
	// IE uses msSaveBlob
	// Chrome, FF use data_type download
	let data_type = 'data:application/vnd.ms-excel',
		title = $('#dialogService').dialog( "option", "title" ),
		style = '\
		<style type="text/css">\
			#exceltbl {\
				border-right: solid 1px slategray;\
				border-collapse: collapse;\
			}\
			#exceltbl th {\
				font-size: 16px;\
				font-weight: bold;\
				height: 40px;\
				background-color: #7799AA;\
				color: white;\
				border: solid 1px silver;\
			}\
			#exceltbl td {\
				font-size: 14px;\
				vertical-align: middle;\
				padding-left: 3px;\
				border-left: solid 1px silver;\
				border-bottom: solid 1px silver;\
			}\
			#excelhead td {\
				height: 30px; \
				vertical-align: middle;\
				font-size: 22px;\
				text-align: center;\
			}\
			#excelhead td.Readmission,\
			#exceltbl tr.Readmission,\
			#exceltbl td.Readmission { background-color: #AACCCC; }\
			#excelhead td.Reoperation,\
			#exceltbl tr.Reoperation,\
			#exceltbl td.Reoperation { background-color: #CCCCAA; }\
			#excelhead td.Infection,\
			#exceltbl tr.Infection,\
			#exceltbl td.Infection { background-color: #CCAAAA; }\
			#excelhead td.Morbidity,\
			#exceltbl tr.Morbidity,\
			#exceltbl td.Morbidity { background-color: #AAAACC; }\
			#excelhead td.Dead,\
			#exceltbl tr.Dead,\
			#exceltbl td.Dead { background-color: #AAAAAA; }\
		</style>',
		head = '\
		  <table id="excelhead">\
			<tr>\
			  <td></td>\
			  <td></td>\
			  <td colspan="4" style="font-weight:bold;font-size:24px">' + title + '</td>\
			</tr>\
			<tr></tr>\
			<tr></tr>\
			<tr>\
			  <td></td>\
			  <td></td>\
			  <td>Admit : ' + $("#Admit").html() + '</td>\
			  <td>Discharge : ' + $("#Discharge").html() + '</td>\
			  <td>Operation : ' + $("#Operation").html() + '</td>\
			  <td class="Morbidity">Morbidity : ' + $("#Morbidity").html() + '</td>\
			</tr>\
			<tr>\
			  <td></td>\
			  <td></td>\
			  <td class="Readmission">Re-admission : ' + $("#Readmission").html() + '</td>\
			  <td class="Infection">Infection SSI : ' + $("#Infection").html() + '</td>\
			  <td class="Reoperation">Re-operation : ' + $("#Reoperation").html() + '</td>\
			  <td class="Dead">Dead : ' + $("#Dead").html() + '</td>\
			</tr>\
			<tr></tr>\
			<tr></tr>\
		  </table>'

	$("#exceltbl").length && $("#exceltbl").remove()

	// Copy table and change id
	$("#servicetbl").clone(true).attr("id", "exceltbl").appendTo("body")

	// use only the last class because excel not accept multiple classes
	$.each( $("#exceltbl tr"), function() {
		let multiclass = this.className.split(" ")
		if (multiclass.length > 1) {
			this.className = multiclass[multiclass.length-1]
		}
	})

	// remove trailing hidden cells (QNSV, under colspan) in excel
	$.each( $("#exceltbl tr td, #exceltbl tr th"), function() {
		if ($(this).css("display") === "none") {
			$(this).remove()
		}
	})

	let table = $("#exceltbl")[0].outerHTML

	// excel split <br> to multiple cells inside that cell 
	table = table.replace(/<br>/g, " ")

	let tableToExcel = '<!DOCTYPE html><HTML><HEAD><meta charset="utf-8"/>' + style + '</HEAD><BODY>'
	tableToExcel += head + table
	tableToExcel += '</BODY></HTML>'
	let month = $("#monthpicking").val()
	month = month.substring(0, month.lastIndexOf("-"))	// use yyyy-mm for filename
	let filename = 'Service Neurosurgery ' + month + '.xls',
		ua = window.navigator.userAgent,
		msie = ua.indexOf("MSIE"),
		edge = ua.indexOf("Edge"),
		ie = function () {
			if (typeof Blob !== "undefined") {
				// use blobs if we can
				tableToExcel = [tableToExcel];
				// convert to array
				let blob1 = new Blob(tableToExcel, {
				  type: "text/html"
				});
				window.navigator.msSaveBlob(blob1, filename);
			} else {
				txtArea1.document.open("txt/html", "replace");
				txtArea1.document.write(tableToExcel);
				txtArea1.document.close();
				txtArea1.focus();
				sa = txtArea1.document.execCommand("SaveAs", true, filename);
				return (sa);	// not tested
			}
		},
		chromeFF = function () {
			let a = document.createElement('a');
			document.body.appendChild(a);  // You need to add this line in FF
			a.href = data_type + ', ' + encodeURIComponent(tableToExcel);
			a.download = filename
			a.click();		// tested with Chrome and FF
		};

	(msie > 0 || edge > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) ? ie() : chromeFF()
}
