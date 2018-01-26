
function serviceReview()
{
	resetcountService()
	$('#servicehead').hide()
	$('#servicetbl').hide()
	$('#exportService').hide()
	$('#dialogService').dialog({
		title: 'Service Neurosurgery',
		closeOnEscape: true,
		modal: true,
		width: window.innerWidth * 95 / 100,
		height: window.innerHeight * 95 / 100
	})

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
		beforeShow: function (input, obj) {
			$('.ui-datepicker-calendar').hide()
		}
	}).datepicker("setDate", new Date(new Date().getFullYear(), new Date().getMonth(), 1))

	$(document).on("click", '.ui-datepicker-title', function() {
		entireMonth($('#monthpicking').val())
	})
}

function entireMonth(fromDate)
{
	var date = new Date(fromDate),
		toDate = new Date(date.getFullYear(), date.getMonth()+1, 0),
		$monthpicker = $('#monthpicker')
	toDate = $.datepicker.formatDate('yy-mm-dd', toDate);	//end of this month
	$('#dialogService').dialog({
		title: 'Service Neurosurgery เดือน ' + $monthpicker.val()
	})
	$monthpicker.val(toDate)

	getServiceOneMonth(fromDate, toDate).then( function (SERVICE) {
		showService(SERVICE, fromDate, toDate)
	})

	$(document).off("click", '.ui-datepicker-title')
	$("#exportService").show()
	$("#exportService").on("click", function(e) {
		e.preventDefault();
		exportToExcel()
	})
}

//get 1st of last month
function getStart()
{
	var start = new Date()

	return new Date(start.getFullYear(), start.getMonth()-1, 1).ISOdate()
}

function getServiceOneMonth(fromDate, toDate) {
	var start = getStart()

	var deferService = $.Deferred()

	var beforeStart = function () {
		getfromServer(fromDate, toDate).then( function (SERVICE) {
			deferService.resolve(SERVICE)
		}, function (title, message) {
			deferService.reject(title, message)
		})
	}
	var afterStart = function () {
		deferService.resolve(getfromBOOKCONSULT(fromDate, toDate))
	}

	fromDate < start ? beforeStart() : afterStart()
	return deferService.promise()
}

//No data before last month in gv.BOOK, gv.CONSULT
//Retrieve the specified month from server
function getfromServer(fromDate, toDate)
{
	var sql = "sqlReturnData=SELECT * FROM book "
			  + "WHERE opdate BETWEEN '" + fromDate + "' AND '" + toDate
			  + "' AND deleted=0 "
			  + "AND waitnum<>0 "
			  + "ORDER BY opdate, oproom, casenum, waitnum;";

	var defer = $.Deferred()

	Ajax(MYSQLIPHP, sql, callbackgetfromServer)

	return defer.promise()

	function callbackgetfromServer(response)
	{
		/dob/.test(response)
			? defer.resolve( JSON.parse(response) )
			: Alert("getfromServer", response)
	}
}

function getfromBOOKCONSULT(fromDate, toDate)
{
	var book = gv.BOOK
	var consult = gv.CONSULT
	var SERV = []
	SERV = addfromRAM(book, fromDate, toDate, SERV)
	SERV = addfromRAM(consult, fromDate, toDate, SERV)
	return SERV.sort(function (a, b) {
		if (a.opdate < b.opdate) {
			return -1;
		}
		if (a.opdate > b.opdate) {
			return 1;
		}
		return 0;
	})
}

function addfromRAM(book, fromDate, toDate, serv)
{
	for (var q = 0; q < book.length; q++) {
		if (book[q].opdate <= toDate) {
			if (book[q].opdate >= fromDate) {
				serv.push(book[q])
			}
		} else {
			break
		}
	}
	return serv
}

function showService(SERVICE, fromDate, toDate)
{
	//delete previous servicetbl lest it accumulates
	$('#servicetbl tr').slice(1).remove()
	$('#servicetbl').show()
	$("#servicetbl").on("click", function (event) {
		resetTimer();
		gv.idleCounter = 0
		event.stopPropagation()
		var target = event.target
		var editable = fromDate >= getStart()
		if (target.nodeName === "TH") {
			clearEditcell()
			return	
		} else {
			clickservice(target, editable)
		}
	})

	$.each( gv.STAFF, function() {
		// staffname fixed sequence is in patient column
		var staffname = this.staffname
		$('#servicecells tr').clone()
			.appendTo($('#servicetbl tbody'))
				.children("td").eq(OPDATE)
					.prop("colSpan", 8)
						.addClass("serviceStaff")
							.html(staffname)
								.siblings().hide()
		var scase = 0
		$.each( SERVICE, function() {
			if (this.staffname === staffname) {
				var color = countService(this, fromDate, toDate)
				scase++
				$('#servicecells tr').clone()
					.appendTo($('#servicetbl tbody'))
						.filldataService(this, scase, color)
			}
		});
	})

	var $monthpicker = $('#monthpicker')
	$monthpicker.hide()
	$('#servicehead').show()
	var $dialogService = $('#dialogService')
	$dialogService.dialog({
		hide: 200,
		width: window.innerWidth * 95 / 100,
		height: window.innerHeight * 95 / 100,
		close: function() {
			clearEditcell()
			refillstaffqueue()
			refillall()
			$(".fixed").remove()
			$(window).on("resize", function() {
				$dialogService.dialog("close")
			})
		}
	})
	getAdmitDischargeDate(SERVICE, fromDate, toDate)
	countAllServices()
	$("#servicetbl").fixMe($dialogService);

	//for resizing dialogs in landscape / portrait view
	$(window).resize(function() {
		$dialogService.dialog({
			width: window.innerWidth * 95 / 100,
			height: window.innerHeight * 95 / 100
		})
		winResizeFix($("#servicetbl"), $dialogService)
	})
}

function refillService(SERVICE, fromDate, toDate)
{
	var i = 0
	$.each( gv.STAFF, function() {
		// staffname fixed sequence is in patient column
		var staffname = this.staffname
		i++
		var $thisCase = $('#servicetbl tr').eq(i).children("td").eq(CASENUMSV)
		if ($thisCase.prop("colSpan") === 1) {
			$thisCase.prop("colSpan", 8)
				.addClass("serviceStaff")
					.siblings().hide()
		}
		$thisCase.html(staffname)

		var scase = 0
		$.each( SERVICE, function() {
			if (this.staffname === staffname) {
				var color = countService(this, fromDate, toDate)
				i++
				scase++
				var $thisRow = $('#servicetbl tr').eq(i).children("td")
				if ($thisRow.eq(CASENUMSV).prop("colSpan") > 1) {
					$thisRow.eq(CASENUMSV).prop("colSpan", 1)
						.nextUntil($thisRow.eq(QNSV)).show()
				}
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
	filldataService : function(bookq, scase, color) {
		var cells = this[0].cells
		addColorService(this, color)
		cells[CASENUMSV].innerHTML = scase
		cells[HNSV].innerHTML = bookq.hn
		if (bookq.hn && gv.isPACS) {
			cells[HNSV].className = "pacs"
		}
		cells[NAMESV].innerHTML = bookq.patient
			+ (bookq.dob? ("<br>อายุ " + putAgeOpdate(bookq.dob, bookq.opdate)) : "")
		cells[NAMESV].className = "camera"
		cells[DIAGNOSISSV].innerHTML = bookq.diagnosis
		cells[TREATMENTSV].innerHTML = bookq.treatment
		cells[ADMISSIONSV].innerHTML = bookq.admission
		cells[FINALSV].innerHTML = bookq.final
		cells[ADMITSV].innerHTML = (bookq.admit? bookq.admit : "")
		cells[DISCHARGESV].innerHTML = (bookq.discharge? bookq.discharge : "")
		cells[QNSV].innerHTML = bookq.qn
	}
})

function addColorService($this, color)
{
	if (color) {
		$this[0].className = color
		var $cell = $this.children("td")
		var $final = $cell.eq(FINALSV)
		if (/Readmission/.test(color)) {
			$cell.eq(ADMISSIONSV).addClass("Readmission")
		}
		if (/Reoperation/.test(color)) {
			$cell.eq(TREATMENTSV).addClass("Reoperation")
		}
		if (/Infection/.test(color)) {
			$final.addClass("Infection")
		}
		if (/Morbidity/.test(color)) {
			if ($final.attr("class") !== "Infection") {	//still show Infection
				$final.addClass("Morbidity")
			}
		}
		if (/Dead/.test(color)) {
			if ($final.attr("class") !== "Infection") {	//still show Infection
				$final.addClass("Dead")
			}
		}
	}
}

function getAdmitDischargeDate(SERVICE, fromDate, toDate)
{
	Ajax(GETIPD, "from=" + fromDate + "&to=" + toDate, callbackgetipd)

	function callbackgetipd(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)
			var SERVICE = getfromBOOKCONSULT(fromDate, toDate)
			fillAdmitDischargeDate(SERVICE)
		}
//		else {
//			Alert("getAdmitDischargeDate", response)
//		}
	}
}

function fillAdmitDischargeDate(SERVICE)
{
	var i = 0
	$.each( gv.STAFF, function() {
		// staffname fixed sequence is in patient column
		var staffname = this.staffname
		i++
		$.each( SERVICE, function() {
			if (this.staffname === staffname) {
				i++
				var $thisRow = $('#servicetbl tr').eq(i).children("td")
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

function countAllServices()
{
	resetcountService()

	$.each( $('#servicetbl tr'), function() {
		var counter = this.className.split(" ")
		$.each(counter, function() {
			if (this.length) {
				document.getElementById(this).innerHTML++
			}
		})
	})
}

function clickservice(clickedCell, editable)
{
	savePreviousCellService()
	storePresentCellService(clickedCell, editable)
}

function Skeyin(event, keycode, pointing)
{
	var SEDITABLE	= [DIAGNOSISSV, TREATMENTSV, ADMISSIONSV, FINALSV]
	var thiscell

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
			storePresentCellService(thiscell)
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
			storePresentCellService(thiscell)
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

function saveContentService(pointed, column, content)	//column name in MYSQL
{
	var $row = $(pointed).closest('tr')
	var rowi = $row[0]
	var qn = rowi.cells[QNSV].innerHTML
	var oldcontent = $("#editcell").data("oldcontent")

	pointed.innerHTML = content? content : ''	//just for show instantly

	if (content) {
		content = URIcomponent(content)	//take care of white space, double qoute, 
										//single qoute, and back slash
	}
	var sql = "sqlReturnbook=UPDATE book SET "
		sql += column +" = '"+ content
		sql += "', editor='"+ gv.user
		sql += "' WHERE qn = "+ qn +";"

	Ajax(MYSQLIPHP, sql, callbacksaveScontent);

	function callbacksaveScontent(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)

			//Not refillService because it may make next editTD back to old value when fast entry
			//due to slow return from Ajax of previous input
			var fromDate = $('#monthpicking').val()
			var toDate = $('#monthpicker').val()
			var color = rowi.className
			getServiceOneMonth(fromDate, toDate).then( function (book) {
				var bookq = getBOOKrowByQN(book, qn)		//for countService of this case
				var newcolor = countService(bookq, fromDate, toDate)
				var colorArray = color.split(" ")
				var newcolorArray = newcolor.split(" ")
				var counter
				var newcounter
				if (color) {
					if (newcolor) {
						if (color !== newcolor) {
							$.each( colorArray, function(i, each) {
								counter = document.getElementById(each)
								counter.innerHTML = Number(counter.innerHTML) - 1
							})
							$.each( newcolorArray, function(i, each) {
								newcounter = document.getElementById(each)
								newcounter.innerHTML = Number(newcounter.innerHTML) + 1
							})
						}
					} else {
						$.each( colorArray, function(i, each) {
							counter = document.getElementById(each)
							counter.innerHTML = Number(counter.innerHTML) - 1
						})
					}
					} else {
						if (newcolor) {
							$.each( newcolorArray, function(i, each) {
								newcounter = document.getElementById(each)
								newcounter.innerHTML = Number(newcounter.innerHTML) + 1
							})
						}
					}

					rowi.className = newcolor			//tr.newclass
					$(pointed).removeClass(color)		//prevent remained unused class
					addColorService($row, newcolor)	//td.newclass
			})
		} else {
			Alert("saveContentService", response)
			pointed.innerHTML = oldcontent		//return to previous content
		}
	}
}

function storePresentCellService(pointing, editable)
{
	var cindex = pointing.cellIndex

	switch(cindex)
	{
		case CASENUMSV:
			break
		case HNSV:
			clearEditcell()
			if (gv.isPACS) {
				PACS(pointing.innerHTML)
			}
			break
		case NAMESV:
			var hn = $(pointing).closest('tr').children("td").eq(HNSV).html()
			var patient = pointing.innerHTML

			clearEditcell()
			showUpload(hn, patient)
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

function countService(thiscase, fromDate, toDate)
{
	var color = ""

	if (isAdmit(thiscase, fromDate, toDate)) {
		color += "Admit"
	}
	if (isDischarge(thiscase, fromDate, toDate)) {
		color += color? " Discharge" : "Discharge"
	}
	if (isOperation(thiscase)) {
		color += color? " Operation" : "Operation"
	}
	if (isReadmission(thiscase)) {
		color += color? " Readmission" : "Readmission"
	}
	if (isReoperation(thiscase)) {
		color += color? " Reoperation" : "Reoperation"
	}
	if (isInfection(thiscase)) {
		color += color? " Infection" : "Infection"
	}
	if (isMorbidity(thiscase)) {
		color += color? " Morbidity" : "Morbidity"
	}
	if (isDead(thiscase)) {
		color += color? " Dead" : "Dead"
	}
	return color
}

function isAdmit(thiscase, fromDate, toDate)
{
	if ((thiscase.admit >= fromDate)
	&& (thiscase.admit <= toDate)
	&& (thiscase.waitnum > 0)) {
		return true
	}
}

function isDischarge(thiscase, fromDate, toDate)
{
	if ((thiscase.discharge >= fromDate)
	&& (thiscase.discharge <= toDate)
	&& (thiscase.waitnum > 0)) {
		return true
	}
}

function isOperation(thiscase)
{

	var neuroSxOp = [
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
	var Operation = false
	$.each( neuroSxOp, function(i, each) {
		if (each.test(thiscase.treatment)) {
			Operation = true
			return false
		}
	})
	return Operation
}

function isReadmission(thiscase)
{
	if (/\b[Rr]e-ad/.test(thiscase.admission)) {
		return true
	}
}

function isReoperation(thiscase)
{
	if (/\b[Rr]e-op/.test(thiscase.treatment)) {
		return true
	}
}

function isInfection(thiscase)
{
	if (/SSI/.test(thiscase.final)) {
		return true
	}
	if (/Infect/.test(thiscase.final)) {
		return true
	}
}

function isMorbidity(thiscase)
{
	if (/Morbid/.test(thiscase.final)) {
		return true
	}
}

function isDead(thiscase)
{
	if (/Dead/.test(thiscase.final)) {
		return true
	}
	if (/passed away/i.test(thiscase.final)) {
		return true
	}
}

function exportToExcel()
{
	//getting data from our table
	var data_type = 'data:application/vnd.ms-excel';	//Chrome, FF, not IE
	var title = $('#dialogService').dialog( "option", "title" )
	var style = '\
		<style type="text/css">\
			#exceltbl {\
				border-right: solid 1px slategray;\
				border-collapse: collapse;\
			}\
			#exceltbl tr:nth-child(odd) {\
				background-color: #E0FFE0;\
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
		</style>'
	var head = '\
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

	if ($("#exceltbl").length) {
		$("#exceltbl").remove()
	}
	$("#servicetbl").clone(true).attr("id", "exceltbl").appendTo("body")
	$.each( $("#exceltbl tr"), function() {
		var multiclass = this.className.split(" ")
		if (multiclass.length > 1) {
			this.className = multiclass[multiclass.length-1]
		}	//use only the last class because excel not accept multiple classes
	})
	$.each( $("#exceltbl tr td, #exceltbl tr th"), function() {
		if ($(this).css("display") === "none") {
			$(this).remove()
		}	//remove trailing hidden cells in excel
	})
	var table = $("#exceltbl")[0].outerHTML
	table = table.replace(/<br>/g, " ")	//excel split <br> to another cell inside that cell 

	var tableToExcel = '<!DOCTYPE html><HTML><HEAD><meta charset="utf-8"/>' + style + '</HEAD><BODY>'
	tableToExcel += head + table
	tableToExcel += '</BODY></HTML>'
	var month = $("#monthpicking").val()
	month = month.substring(0, month.lastIndexOf("-"))	//use yyyy-mm for filename
	var filename = 'Service Neurosurgery ' + month + '.xls'

	var ua = window.navigator.userAgent;
	var msie = ua.indexOf("MSIE")
	var edge = ua.indexOf("Edge"); 

	if (msie > 0 || edge > 0 || navigator.userAgent.match(/Trident.*rv\:11\./)) // If Internet Explorer
	{
	  if (typeof Blob !== "undefined") {
		//use blobs if we can
		tableToExcel = [tableToExcel];
		//convert to array
		var blob1 = new Blob(tableToExcel, {
		  type: "text/html"
		});
		window.navigator.msSaveBlob(blob1, filename);	//tested with Egde
	  } else {
		txtArea1.document.open("txt/html", "replace");
		txtArea1.document.write(tableToExcel);
		txtArea1.document.close();
		txtArea1.focus();
		sa = txtArea1.document.execCommand("SaveAs", true, filename);
		return (sa);	//not tested
	  }
	} else {
		var a = document.createElement('a');
		document.body.appendChild(a);  // You need to add this line in FF
		a.href = data_type + ', ' + encodeURIComponent(tableToExcel);
		a.download = filename
		a.click();		//tested with Chrome and FF
	}
}
