
function serviceReview()
{
	var $monthpicker = $('#monthpicker')
	$monthpicker.show()
	$('#servicehead').hide()
	$monthpicker.datepicker( {
		altField: $( "#monthpicking" ),
		altFormat: "yy-mm-dd",
		autoSize: true,
		dateFormat: "MM yy",
		minDate: "-1y",
		maxDate: "+1y",
		monthNames: [ "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", 
					  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม" ],
		onChangeMonthYear: function (year, month, inst) {
			$(this).datepicker('setDate', new Date(inst.selectedYear, inst.selectedMonth, 1))
		},
		beforeShow: function () {
			$('.ui-datepicker-calendar').css('display', 'none')
		}
	}).datepicker("setDate", new Date(new Date().getFullYear(), new Date().getMonth(), 1))

	$('#dialogService').dialog({
		title: 'Service Neurosurgery เดือน : ',
		closeOnEscape: true,
		modal: true,
		width: window.innerWidth * 95 / 100,
		height: window.innerHeight * 95 / 100
	})
	var $uidatepicker = $('.ui-datepicker')
	$uidatepicker.click(function() {
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
}

function getfromBOOKCONSULT(fromDate, toDate)
{
	var SERV = []
	SERV = addfromRAM(BOOK, fromDate, toDate, SERV)
	SERV = addfromRAM(CONSULT, fromDate, toDate, SERV)
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
	resetcountService()

	//delete previous servicetbl lest it accumulates
	$('#servicetbl tr').slice(1).remove()
	$('#servicetbl').show()

	$.each( STAFF, function() {
		var staffname = this
		$('#servicecells tr').clone()
			.insertAfter($('#servicetbl tr:last'))
				.children("td").eq(OPDATE)
					.prop("colSpan", 8)
						.css({
							height: "40",
							fontWeight: "bold",
							fontSize: "14px",
							textAlign: "left",
							paddingLeft: "10px"
						})
						.html(staffname)
							.siblings().hide()
		var scase = 0
		$.each( SERVICE, function() {
			if (this.staffname == staffname) {
				var color = countService(this, fromDate, toDate)
				if (color) {
					var counter = document.getElementById(color)
					counter.innerHTML = Number(counter.innerHTML) + 1	
				}
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
		title: 'Service Neurosurgery เดือน : ' + $monthpicker.val(),
		close: function() {
			$('#datepicker').hide()
		}
	})
	getAdmitDischargeDate(SERVICE, fromDate, toDate)
}

function refillService(SERVICE, fromDate, toDate)
{
	resetcountService()

	var i = 0
	$.each( STAFF, function() {
		var staffname = this
		i++
		var $thisCase = $('#servicetbl tr').eq(i).children("td").eq(CASENUM)
		if ($thisCase.prop("colSpan") == 1) {
			$thisCase.prop("colSpan", 8)
				.css({
					height: "40",
					fontWeight: "bold",
					fontSize: "14px",
					textAlign: "left",
					paddingLeft: "10px"
				})
				.siblings().hide()
		}
		$thisCase.html(staffname)

		var scase = 0
		$.each( SERVICE, function() {
			if (this.staffname == staffname) {
				var color = countService(this, fromDate, toDate)
				if (color) {
					var counter = document.getElementById(color)
					counter.innerHTML = Number(counter.innerHTML) + 1	
				}
				var counter = document.getElementById(color)
				counter.innerHTML = Number(counter.innerHTML) + 1
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
	if (i < ($('#servicetbl tr').length - 1))
		$('#servicetbl tr').slice(i+1).remove()
}

jQuery.fn.extend({
	filldataService : function(bookq, scase, color) {
		this[0].className = color
		var cells = this[0].cells
		cells[CASENUM].innerHTML = scase
		cells[CASENAME].innerHTML = bookq.hn
			+ " " + bookq.patient
			+ " " + (bookq.dob? bookq.dob.getAge(bookq.opdate) : "")
		cells[SDIAGNOSIS].innerHTML = bookq.diagnosis
		cells[STREATMENT].innerHTML = bookq.treatment
		cells[ADMISSION].innerHTML = bookq.admission
		cells[FINAL].innerHTML = bookq.final
		cells[ADMIT].innerHTML = (bookq.admit? bookq.admit : "")
		cells[DISCHARGE].innerHTML = (bookq.discharge? bookq.discharge : "")
		cells[SQN].innerHTML = bookq.qn
	}
})

function getAdmitDischargeDate(SERVICE, fromDate, toDate)
{
	Ajax(GETIPD, "from=" + fromDate + "&to=" + toDate, callbackgetipd)

	function callbackgetipd(response)
	{
		if (!response) {
			return
		}
		if (response.indexOf("{") == -1) {
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
		var staffname = this
		i++
		$.each( SERVICE, function() {
			if (this.staffname == staffname) {
				i++
				var $thisRow = $('#servicetbl tr').eq(i).children("td")
				$thisRow.eq(ADMIT).html(this.admit)
				$thisRow.eq(DISCHARGE).html(this.discharge)
			}
		});
	})
}

function clickservice(clickedCell)
{
	savePreviouscellService()
	storePresentScell(clickedCell)
}

function Skeyin(event, keycode, pointing)
{
	var thiscell

	if (keycode == 27) {
		clearEditcellData()
		window.focus()
		event.preventDefault()
		return false
	}
	if (!pointing) {
		return
	}
	if (keycode == 9) {
		savePreviouscellService()
		if (event.shiftKey)
			thiscell = findPrevcell(event, SEDITABLE, pointing)
		else
			thiscell = findNextcell(event, SEDITABLE, pointing)
		if (thiscell) {
			storePresentScell(thiscell)
		} else {
			clearEditcellData()
			window.focus()
		}
		event.preventDefault()
		return false
	}
	if (keycode == 13) {
		if (event.shiftKey || event.ctrlKey) {
			return
		}
		savePreviouscellService()
		thiscell = findNextRow(event, SEDITABLE, pointing)
		if (thiscell) {
			storePresentScell(thiscell)
		} else {
			clearEditcellData()
			window.focus()
		}
		event.preventDefault()
		return false
	}
}

function savePreviouscellService()
{
	var editPoint = $("#editcell").data("pointing")
	if (editPoint && (editPoint.innerHTML != getEditcellHtml())) {
		saveEditPointDataService(editPoint)
	}
}

function saveEditPointDataService(pointed)
{
	var content = ""
	switch(pointed.cellIndex)
	{
		case CASENUM:
		case CASENAME:
			break
		case SDIAGNOSIS:
			content = getEditcellHtml()
			saveSContent(pointed, "diagnosis", content)
			break
		case STREATMENT:
			content = getEditcellHtml()
			saveSContent(pointed, "treatment", content)
			break
		case ADMISSION:
			content = getEditcellHtml()
			saveSContent(pointed, "admission", content)
			break
		case FINAL:
			content = getEditcellHtml()
			saveSContent(pointed, "final", content)
			break
		case ADMIT:
		case DISCHARGE:
			break
	}
}

function saveSContent(pointed, column, content)	//column name in MYSQL
{
	var rowi = $(pointed).closest('tr')[0]
	var qn = rowi.cells[SQN].innerHTML
	var oldContent = pointed.innerHTML

	pointed.innerHTML = content? content : ''	//just for show instantly

	if (content) {
		content = URIcomponent(content)	//take care of white space, double qoute, 
										//single qoute, and back slash
	}
	var sql = "sqlReturnbook=UPDATE book SET "
		sql += column +" = '"+ content
		sql += "', editor='"+ THISUSER
		sql += "' WHERE qn = "+ qn +";"

	Ajax(MYSQLIPHP, sql, callbacksaveSContent);

	function callbacksaveSContent(response)
	{
		if (!response || response.indexOf("BOOK") == -1)
		{
			alert("saveSContent", response)
			pointed.innerHTML = oldContent		//return to previous content
		} else {
			updateBOOK(response)

			var fromDate = $('#monthpicker').data('fromDate')
			var toDate = $('#monthpicker').data('toDate')
			var color = rowi.className
			var book = getfromBOOKCONSULT(fromDate, toDate)
			var row = findBOOKrow(book, qn)		//for countService of this case
			var newcolor = countService(book[row], fromDate, toDate)
			var counter
			var newcounter
			if (color) {
				if (newcolor) {
					if (color != newcolor) {
						counter = document.getElementById(color)
						counter.innerHTML = Number(counter.innerHTML) - 1
						newcounter = document.getElementById(newcolor)
						newcounter.innerHTML = Number(newcounter.innerHTML) + 1
					}
				} else {
					counter = document.getElementById(color)
					counter.innerHTML = Number(counter.innerHTML) - 1
				}
			} else {
				if (newcolor) {
					newcounter = document.getElementById(newcolor)
					newcounter.innerHTML = Number(newcounter.innerHTML) + 1
				}
			}

			rowi.className = newcolor

			//Not refill because it may make next editTD return to old value when fast entry
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
		case CASENAME:
			clearEditcellData()
			var hn = pointing.innerHTML
			if (hn.match(/\d{7}/)) {
				hn = hn.match(/\d{7}/)[0]
				PACS(hn)
			}
			break
		case SDIAGNOSIS:
		case STREATMENT:
		case ADMISSION:
		case FINAL:
			createEditcell(pointing)
			break
		case ADMIT:
		case DISCHARGE:
			clearEditcellData()
			break
	}
}
