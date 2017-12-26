
function serviceReview()
{
	resetcountService()
	$('#servicehead').hide()
	$('#servicetbl').hide()
	$('#btnExport').hide()
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
	var date = new Date(fromDate)
	var toDate = new Date(date.getFullYear(), date.getMonth()+1, 0)
	toDate = $.datepicker.formatDate('yy-mm-dd', toDate);	//end of this month
	$('#monthpicker').val(toDate)

	getServiceOneMonth(fromDate, toDate).then( function (SERVICE) {
			showService(SERVICE, fromDate, toDate)
		})

	$(document).off("click", '.ui-datepicker-title')
	$("#btnExport").show()
	$("#btnExport").on("click", function(e) {
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
			  + "' AND waitnum<>0 "
			  + "ORDER BY opdate, oproom='', oproom, optime, waitnum;";

	var defer = $.Deferred()

	Ajax(MYSQLIPHP, sql, callbackgetfromServer)

	return defer.promise()

	function callbackgetfromServer(response)
	{
		/dob/.test(response)
			? defer.resolve( JSON.parse(response) )
			: alert("getfromServer", response)
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
	var i = serv.length
	for (var q = 0; q < book.length; q++) {
		if ((book[q].opdate >= fromDate) && (book[q].opdate <= toDate)) {
			serv[i] = book[q]
			i++
		}
		if (book[q].opdate > toDate) {
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
//	$monthpicker.datepicker( "hide" )
	$('#servicehead').show()
	var $dialogService = $('#dialogService')
	$dialogService.dialog({
		title: 'Service Neurosurgery เดือน ' + $monthpicker.val(),
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
		var staffname = this.staffname
		i++
		var $thisCase = $('#servicetbl tr').eq(i).children("td").eq(CASENUMSERVICE)
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
				if ($thisRow.eq(CASENUMSERVICE).prop("colSpan") > 1) {
					$thisRow.eq(CASENUMSERVICE).prop("colSpan", 1)
						.nextUntil($thisRow.eq(QNSERVICE)).show()
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
		cells[CASENUMSERVICE].innerHTML = scase
		cells[HNSERVICE].innerHTML = bookq.hn
		if (bookq.hn && gv.isPACS) {
			cells[HNSERVICE].className = "pacs"
		}
		cells[NAMESERVICE].innerHTML = bookq.patient
			+ (bookq.dob? ("<br>อายุ " + putAgeOpdate(bookq.dob, bookq.opdate)) : "")
		cells[NAMESERVICE].className = "camera"
		cells[DIAGNOSISSERVICE].innerHTML = bookq.diagnosis
		cells[TREATMENTSERVICE].innerHTML = bookq.treatment
		cells[ADMISSIONSERVICE].innerHTML = bookq.admission
		cells[FINALSERVICE].innerHTML = bookq.final
		cells[ADMITSERVICE].innerHTML = (bookq.admit? bookq.admit : "")
		cells[DISCHARGESERVICE].innerHTML = (bookq.discharge? bookq.discharge : "")
		cells[QNSERVICE].innerHTML = bookq.qn
	}
})

function addColorService($this, color)
{
	if (color) {
		$this[0].className = color
		var $cell = $this.children("td")
		var $final = $cell.eq(FINALSERVICE)
		if (/Readmission/.test(color)) {
			$cell.eq(ADMISSIONSERVICE).addClass("Readmission")
		}
		if (/Reoperation/.test(color)) {
			$cell.eq(TREATMENTSERVICE).addClass("Reoperation")
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
//			alert("getAdmitDischargeDate", response)
//		}
	}
}

function fillAdmitDischargeDate(SERVICE)
{
	var i = 0
	$.each( gv.STAFF, function() {
		var staffname = this.staffname
		i++
		$.each( SERVICE, function() {
			if (this.staffname === staffname) {
				i++
				var $thisRow = $('#servicetbl tr').eq(i).children("td")
				if (this.admit && !$thisRow.eq(ADMITSERVICE).html()) {
					document.getElementById("Admit").innerHTML++
				}
				$thisRow.eq(ADMITSERVICE).html(this.admit)
				if (this.discharge && !$thisRow.eq(DISCHARGESERVICE).html()) {
					document.getElementById("Discharge").innerHTML++
				}
				$thisRow.eq(DISCHARGESERVICE).html(this.discharge)
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
	var SEDITABLE	= [DIAGNOSISSERVICE, TREATMENTSERVICE, ADMISSIONSERVICE, FINALSERVICE]
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
	var oldcontent = $("#editcell").data("oldcontent")
	var newcontent = getEditcellHtml()
	var pointed = $("#editcell").data("pointing")
	if (!pointed || (oldcontent === newcontent)) {
		return false
	}
	var content = ""
	switch(pointed.cellIndex)
	{
		case CASENUMSERVICE:
		case HNSERVICE:
		case NAMESERVICE:
			return false
		case DIAGNOSISSERVICE:
			content = getEditcellHtml()
			saveContentService(pointed, "diagnosis", content)
			return true
		case TREATMENTSERVICE:
			content = getEditcellHtml()
			saveContentService(pointed, "treatment", content)
			return true
		case ADMISSIONSERVICE:
			content = getEditcellHtml()
			saveContentService(pointed, "admission", content)
			return true
		case FINALSERVICE:
			content = getEditcellHtml()
			saveContentService(pointed, "final", content)
			return true
		case ADMITSERVICE:
		case DISCHARGESERVICE:
			return false
	}
}

function saveContentService(pointed, column, content)	//column name in MYSQL
{
	var $rowi = $(pointed).closest('tr')
	var rowi = $rowi[0]
	var qn = rowi.cells[QNSERVICE].innerHTML
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
					addColorService($rowi, newcolor)	//td.newclass
			})
		} else {
			alert("saveContentService", response)
			pointed.innerHTML = oldcontent		//return to previous content
		}
	}
}

function storePresentCellService(pointing, editable)
{
	var cindex = pointing.cellIndex

	switch(cindex)
	{
		case CASENUMSERVICE:
			break
		case HNSERVICE:
			clearEditcell()
			if (gv.isPACS) {
				PACS(pointing.innerHTML)
			}
			break
		case NAMESERVICE:
			var hn = $(pointing).closest('tr').children("td").eq(HNSERVICE).html()
			var patient = pointing.innerHTML

			clearEditcell()
			if (hn) {
				if (gv.uploadWindow && !gv.uploadWindow.closed) {
					gv.uploadWindow.close();
				}
				gv.uploadWindow = window.open("jQuery-File-Upload", "_blank")
				gv.uploadWindow.hnName = {"hn": hn, "patient": patient}
				//hnName is a pre-defined variable in child window (jQuery-File-Upload)
			}
			break
		case DIAGNOSISSERVICE:
		case TREATMENTSERVICE:
		case ADMISSIONSERVICE:
		case FINALSERVICE:
			editable
			? createEditcell(pointing)
			: clearEditcell()
			break
		case ADMITSERVICE:
		case DISCHARGESERVICE:
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

	if (msie > 0 || edge > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) // If Internet Explorer
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
