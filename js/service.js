
function serviceReview()
{
	$("#btnExport").hide()
	var $monthpicker = $('#monthpicker')
	$monthpicker.show()
	$('#servicehead').hide()
	$monthpicker.datepicker( {
		altField: $( "#monthpicking" ),
		altFormat: "yy-mm-dd",
		autoSize: true,
		dateFormat: "MM yy",
		monthNames: [ "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", 
					  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม" ],
		onChangeMonthYear: function (year, month, inst) {
			$(this).datepicker('setDate', new Date(inst.selectedYear, inst.selectedMonth, 1))
		},
		beforeShow: function (input, obj) {
			$('.ui-datepicker-calendar').css('display', 'none')
		},
		onClose: function (date, obj) {
			$('.ui-datepicker').off("click")
		}
	}).datepicker("setDate", new Date(new Date().getFullYear(), new Date().getMonth(), 1))

	$('#dialogService').dialog({
		title: 'Service Neurosurgery',
		closeOnEscape: true,
		modal: true,
		width: window.innerWidth * 95 / 100,
		height: window.innerHeight * 95 / 100,
		close: function( event, ui ) {
			$uidatepicker.off("click")
		}
	})
	var $uidatepicker = $('.ui-datepicker')
	$uidatepicker.on("click", function() {
		if (!$monthpicker.is(":focus")) {	//click on month name
			entireMonth($('#monthpicking').val())
		} else {
			$('.ui-datepicker-calendar').css('display', 'none')
			//click on <prev next> month
			//display the month without date
		}
	})
	$monthpicker.click(function() { //setDate follows input box
		$monthpicker.datepicker(
			"setDate", $('#monthpicking').val()
						? new Date($('#monthpicking').val())
						: new Date()
		)
		$('.ui-datepicker-calendar').css('display', 'none')
	})
	$monthpicker.datepicker('setDate', new Date($('#monthpicking').val()))
	$('.ui-datepicker-calendar').css('display', 'none')
	$('#servicetbl').hide()
	resetcountService()
	reposition($uidatepicker, 'left center', 'left center', $monthpicker)
}

function entireMonth(fromDate)
{
	var fromdate = new Date(fromDate)
	var toDate = new Date(fromdate.getFullYear(), fromdate.getMonth()+1, 0)
	toDate = $.datepicker.formatDate('yy-mm-dd', toDate);	//end of this month
	$('#dialogService input[type=button]').hide()
	$('#monthpicker').data({
		fromDate: fromDate,
		toDate: toDate
	})

	var SERVICE = getfromBOOKCONSULT(fromDate, toDate)
	showService(SERVICE, fromDate, toDate)

	$("#btnExport").show()
}

function getfromBOOKCONSULT(fromDate, toDate)
{
	var book = getBOOK()
	var consult = getCONSULT()
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
	$monthpicker.datepicker( "hide" )
	$('#servicehead').show()
	$('#dialogService').dialog({
		title: 'Service Neurosurgery เดือน ' + $monthpicker.val(),
		close: function() {
			$('#datepicker').hide()
			clearEditcell()
			refillstaffqueue()
			refillall()
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
		var $thisCase = $('#servicetbl tr').eq(i).children("td").eq(CASENUM)
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
				if ($thisRow.eq(CASENUM).prop("colSpan") > 1) {
					$thisRow.eq(CASENUM).prop("colSpan", 1)
						.nextUntil($thisRow.eq(SQN)).show()
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
		addColor(this, color)
		cells[CASENUM].innerHTML = scase
		cells[SHN].innerHTML = bookq.hn
		if (isPACS()) {
			cells[SHN].className = "pacs"
		}
		cells[SNAME].innerHTML = bookq.patient
			+ (bookq.dob? ("<br>อายุ " + putAgeOpdate(bookq.dob, bookq.opdate)) : "")
		cells[SNAME].className = "camera"
		cells[SDIAGNOSIS].innerHTML = bookq.diagnosis
		cells[STREATMENT].innerHTML = bookq.treatment
		cells[ADMISSION].innerHTML = bookq.admission
		cells[FINAL].innerHTML = bookq.final
		cells[ADMIT].innerHTML = (bookq.admit? bookq.admit : "")
		cells[DISCHARGE].innerHTML = (bookq.discharge? bookq.discharge : "")
		cells[SQN].innerHTML = bookq.qn
	}
})

function addColor($this, color)
{
	if (color) {
		$this[0].className = color
		var $cell = $this.children("td")
		var $final = $cell.eq(FINAL)
		if (/Readmission/.test(color)) {
			$cell.eq(ADMISSION).addClass("Readmission")
		}
		if (/Reoperation/.test(color)) {
			$cell.eq(STREATMENT).addClass("Reoperation")
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
	Ajax("php/getipd.php", "from=" + fromDate + "&to=" + toDate, callbackgetipd)

	function callbackgetipd(response)
	{
		if (!response) {
			return
		}
		if (response.indexOf("{") === -1) {
			alert("getAdmitDischargeDate", response)
		} else {
			updateBOOK(response)
			var SERVICE = getfromBOOKCONSULT(fromDate, toDate)
			fillAdmitDischargeDate(SERVICE)
		}
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
				if (this.admit && !$thisRow.eq(ADMIT).html()) {
					document.getElementById("Admit").innerHTML++
				}
				$thisRow.eq(ADMIT).html(this.admit)
				if (this.discharge && !$thisRow.eq(DISCHARGE).html()) {
					document.getElementById("Discharge").innerHTML++
				}
				$thisRow.eq(DISCHARGE).html(this.discharge)
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
	const SEDITABLE	= [SDIAGNOSIS, STREATMENT, ADMISSION, FINAL]
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
	var editPoint = $("#editcell").data("pointing")
	if (editPoint && (oldcontent !== newcontent)) {
		saveEditPointDataService(editPoint)
	}
}

function saveEditPointDataService(pointed)
{
	var content = ""
	switch(pointed.cellIndex)
	{
		case CASENUM:
		case SHN:
		case SNAME:
			break
		case SDIAGNOSIS:
			content = getEditcellHtml()
			saveScontent(pointed, "diagnosis", content)
			break
		case STREATMENT:
			content = getEditcellHtml()
			saveScontent(pointed, "treatment", content)
			break
		case ADMISSION:
			content = getEditcellHtml()
			saveScontent(pointed, "admission", content)
			break
		case FINAL:
			content = getEditcellHtml()
			saveScontent(pointed, "final", content)
			break
		case ADMIT:
		case DISCHARGE:
			break
	}
}

function saveScontent(pointed, column, content)	//column name in MYSQL
{
	var $rowi = $(pointed).closest('tr')
	var rowi = $rowi[0]
	var qn = rowi.cells[SQN].innerHTML
	var oldcontent = $("#editcell").data("oldcontent")

	pointed.innerHTML = content? content : ''	//just for show instantly

	if (content) {
		content = URIcomponent(content)	//take care of white space, double qoute, 
										//single qoute, and back slash
	}
	var sql = "sqlReturnbook=UPDATE book SET "
		sql += column +" = '"+ content
		sql += "', editor='"+ getUser()
		sql += "' WHERE qn = "+ qn +";"

	Ajax(MYSQLIPHP, sql, callbacksaveScontent);

	function callbacksaveScontent(response)
	{
		if (!response || response.indexOf("BOOK") === -1)
		{
			alert("saveScontent", response)
			pointed.innerHTML = oldcontent		//return to previous content
		} else {
			updateBOOK(response)

			var fromDate = $('#monthpicker').data('fromDate')
			var toDate = $('#monthpicker').data('toDate')
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
			addColor($rowi, newcolor)		//td.newclass

			//Not refillService because it may make next editTD back to old value when fast entry
			//due to slow return from Ajax of previous input
		}
	}
}

function storePresentScell(pointing)
{
	var cindex = pointing.cellIndex

	switch(cindex)
	{
		case CASENUM:
			break
		case SHN:
			clearEditcell()
			if (isPACS()) {
				PACS(pointing.innerHTML)
			}
			break
		case SNAME:
			var hn = $(pointing).closest('tr').children("td").eq(SHN).html()
			var patient = pointing.innerHTML

			clearEditcell()
			createWindow(hn, patient)
			break
		case SDIAGNOSIS:
		case STREATMENT:
		case ADMISSION:
		case FINAL:
			createEditcell(pointing)
			break
		case ADMIT:
		case DISCHARGE:
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
	if (/SSI/i.test(thiscase.final)) {
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
	if (/passed away/.test(thiscase.final)) {
		return true
	}
}
