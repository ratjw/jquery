
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

	var SERVICE = getfromBOOKCONSULT(fromDate, toDate)
	showService(SERVICE, fromDate, toDate)

	$(document).off("click", '.ui-datepicker-title')
	$("#btnExport").show()
	$("#btnExport").on("click", function(e) {
		e.preventDefault();
		exportToExcel()
	})

	$(window).resize(function() {	//for resizing dialogs in landscape / portrait view
		$("#dialogService").dialog({
			width: window.innerWidth * 95 / 100,
			height: window.innerHeight * 95 / 100
		})
	})
}

function getfromBOOKCONSULT(fromDate, toDate)
{
	var book = globalvar.BOOK
	var consult = globalvar.CONSULT
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
		globalvar.idleCounter = 0
		event.stopPropagation()
		var target = event.target
		if (target.nodeName === "TH") {
			clearEditcell()
			return	
		} else {
			clickservice(target, fromDate, toDate)
		}
	})

	$.each( STAFF, function() {
		var staffname = String(this)
		$('#servicecells tr').clone()
			.insertAfter($('#servicetbl tr:last'))
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
					.insertAfter($('#servicetbl tr:last'))
						.filldataService(this, scase, color)
			}
		});
	})

	var $monthpicker = $('#monthpicker')
	$monthpicker.hide()
//	$monthpicker.datepicker( "hide" )
	$('#servicehead').show()
	$('#dialogService').dialog({
		title: 'Service Neurosurgery เดือน ' + $monthpicker.val(),
		close: function() {
			clearEditcell()
			refillstaffqueue()
			refillall()
			$(window).off("resize")
		}
	})
	getAdmitDischargeDate(SERVICE, fromDate, toDate)
	countAllServices()
}

function refillService(SERVICE, fromDate, toDate)
{
	var i = 0
	$.each( STAFF, function() {
		var staffname = String(this)
		i++
		var $thisCase = $('#servicetbl tr').eq(i).children("td").eq(STCASENUM)
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
				if ($thisRow.eq(STCASENUM).prop("colSpan") > 1) {
					$thisRow.eq(STCASENUM).prop("colSpan", 1)
						.nextUntil($thisRow.eq(STQN)).show()
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
		cells[STCASENUM].innerHTML = scase
		cells[STHN].innerHTML = bookq.hn
		if (bookq.hn && globalvar.isPACS) {
			cells[STHN].className = "pacs"
		}
		cells[STNAME].innerHTML = bookq.patient
			+ (bookq.dob? ("<br>อายุ " + putAgeOpdate(bookq.dob, bookq.opdate)) : "")
		cells[STNAME].className = "camera"
		cells[STDIAGNOSIS].innerHTML = bookq.diagnosis
		cells[STTREATMENT].innerHTML = bookq.treatment
		cells[STADMISSION].innerHTML = bookq.admission
		cells[STFINAL].innerHTML = bookq.final
		cells[STADMIT].innerHTML = (bookq.admit? bookq.admit : "")
		cells[STDISCHARGE].innerHTML = (bookq.discharge? bookq.discharge : "")
		cells[STQN].innerHTML = bookq.qn
	}
})

function addColorService($this, color)
{
	if (color) {
		$this[0].className = color
		var $cell = $this.children("td")
		var $final = $cell.eq(STFINAL)
		if (/Readmission/.test(color)) {
			$cell.eq(STADMISSION).addClass("Readmission")
		}
		if (/Reoperation/.test(color)) {
			$cell.eq(STTREATMENT).addClass("Reoperation")
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
	$.each( STAFF, function() {
		var staffname = String(this)
		i++
		$.each( SERVICE, function() {
			if (this.staffname === staffname) {
				i++
				var $thisRow = $('#servicetbl tr').eq(i).children("td")
				if (this.admit && !$thisRow.eq(STADMIT).html()) {
					document.getElementById("Admit").innerHTML++
				}
				$thisRow.eq(STADMIT).html(this.admit)
				if (this.discharge && !$thisRow.eq(STDISCHARGE).html()) {
					document.getElementById("Discharge").innerHTML++
				}
				$thisRow.eq(STDISCHARGE).html(this.discharge)
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

function clickservice(clickedCell)
{
	savePreviouscellService()
	storePresentScell(clickedCell)
}

function Skeyin(event, keycode, pointing)
{
	var SEDITABLE	= [STDIAGNOSIS, STTREATMENT, STADMISSION, STFINAL]
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
		savePreviouscellService()
		if (event.shiftKey)
			thiscell = findPrevcell(event, SEDITABLE, pointing)
		else
			thiscell = findNextcell(event, SEDITABLE, pointing)
		if (thiscell) {
			storePresentScell(thiscell)
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
		savePreviouscellService()
		thiscell = findNextRow(event, SEDITABLE, pointing)
		if (thiscell) {
			storePresentScell(thiscell)
		} else {
			clearEditcell()
			window.focus()
		}
		event.preventDefault()
		return false
	}
}

function savePreviouscellService()
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
		case STCASENUM:
		case STHN:
		case STNAME:
			return false
		case STDIAGNOSIS:
			content = getEditcellHtml()
			saveScontent(pointed, "diagnosis", content)
			return true
		case STTREATMENT:
			content = getEditcellHtml()
			saveScontent(pointed, "treatment", content)
			return true
		case STADMISSION:
			content = getEditcellHtml()
			saveScontent(pointed, "admission", content)
			return true
		case STFINAL:
			content = getEditcellHtml()
			saveScontent(pointed, "final", content)
			return true
		case STADMIT:
		case STDISCHARGE:
			return false
	}
}

function saveScontent(pointed, column, content)	//column name in MYSQL
{
	var $rowi = $(pointed).closest('tr')
	var rowi = $rowi[0]
	var qn = rowi.cells[STQN].innerHTML
	var oldcontent = $("#editcell").data("oldcontent")

	pointed.innerHTML = content? content : ''	//just for show instantly

	if (content) {
		content = URIcomponent(content)	//take care of white space, double qoute, 
										//single qoute, and back slash
	}
	var sql = "sqlReturnbook=UPDATE book SET "
		sql += column +" = '"+ content
		sql += "', editor='"+ globalvar.user
		sql += "' WHERE qn = "+ qn +";"

	Ajax(MYSQLIPHP, sql, callbacksaveScontent);

	function callbacksaveScontent(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)

			var fromDate = $('#monthpicking').val()
			var toDate = $('#monthpicker').val()
			var color = rowi.className
			var book = getfromBOOKCONSULT(fromDate, toDate)
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

			rowi.className = newcolor		//tr.newclass
			$(pointed).removeClass(color)	//prevent remained unused class
			addColorService($rowi, newcolor)		//td.newclass

			//Not refillService because it may make next editTD back to old value when fast entry
			//due to slow return from Ajax of previous input
		} else {
			alert("saveScontent", response)
			pointed.innerHTML = oldcontent		//return to previous content
		}
	}
}

function storePresentScell(pointing)
{
	var cindex = pointing.cellIndex

	switch(cindex)
	{
		case STCASENUM:
			break
		case STHN:
			clearEditcell()
			if (globalvar.isPACS) {
				PACS(pointing.innerHTML)
			}
			break
		case STNAME:
			var hn = $(pointing).closest('tr').children("td").eq(STHN).html()
			var patient = pointing.innerHTML

			clearEditcell()
			if (hn) {
				if (globalvar.uploadWindow && !globalvar.uploadWindow.closed) {
					globalvar.uploadWindow.close();
				}
				globalvar.uploadWindow = window.open("jQuery-File-Upload", "_blank")
				globalvar.uploadWindow.hnName = {"hn": hn, "patient": patient}
				//hnName is a pre-defined variable in child window (jQuery-File-Upload)
			}
			break
		case STDIAGNOSIS:
		case STTREATMENT:
		case STADMISSION:
		case STFINAL:
			createEditcell(pointing)
			break
		case STADMIT:
		case STDISCHARGE:
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
