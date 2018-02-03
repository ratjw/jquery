
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

	$(document).on("click", '.ui-datepicker-title', function() {
		entireMonth($('#monthstart').val())
	})
}

function entireMonth(fromDate)
{
	var date = new Date(fromDate),
		toDate = new Date(date.getFullYear(), date.getMonth()+1, 0),
		$monthpicker = $('#monthpicker'),
		$exportService = $("#exportService")

	// show month name before change $monthpicker.val to last date of this month
	$('#dialogService').dialog({
		title: 'Service Neurosurgery เดือน ' + $monthpicker.val()
	})
	toDate = $.datepicker.formatDate('yy-mm-dd', toDate)
	$monthpicker.val(toDate)

	getServiceOneMonth(fromDate, toDate).then( function (SERVICE) {
		gv.SERVICE = SERVICE
		showService(fromDate, toDate)
	}, function (title, message) {
		Alert(title, message)
	})

	$(document).off("click", '.ui-datepicker-title')
	$exportService.show()
	$exportService.on("click", function(e) {
		e.preventDefault()
		exportServiceToExcel()
	})
}

//Retrieve the specified month from server
function getServiceOneMonth(fromDate, toDate)
{
	var defer = $.Deferred(),
		sql = "sqlReturnData=SELECT * FROM book "
			  + "WHERE opdate BETWEEN '" + fromDate + "' AND '" + toDate
			  + "' AND deleted=0 "
			  + "AND waitnum<>0 "
			  + "ORDER BY opdate, oproom, casenum, waitnum;";

	Ajax(MYSQLIPHP, sql, callbackGetService)

	return defer.promise()

	function callbackGetService(response)
	{
		/dob/.test(response)
			? defer.resolve( JSON.parse(response) )
			: defer.reject("getServiceOneMonth", response)
	}
}

function showService(fromDate, toDate)
{
	//delete previous servicetbl lest it accumulates
	var $servicetbl = $('#servicetbl'),
		$servicecells = $("#servicecells")

	$servicetbl.find('tr').slice(1).remove()
	$servicetbl.show()
	$servicetbl.on("click", function (event) {
		resetTimer();
		gv.idleCounter = 0
		event.stopPropagation()
		var target = event.target
		var editable = fromDate >= getStart()
		if (target.nodeName === "TH") {
			clearEditcell()
			return	
		} else {
			clickservice(event, target, editable)
		}
	})

	$.each( gv.STAFF, function() {
		var staffname = this.staffname
		$servicecells.find('tr').clone()
			.appendTo($servicetbl.find('tbody'))
				.children("td").eq(OPDATE)
					.prop("colSpan", 9)
						.addClass("serviceStaff")
							.html(staffname)
								.siblings().hide()
		var scase = 0
		$.each( gv.SERVICE, function() {
			if (this.staffname === staffname) {
				var classname = countService(this, fromDate, toDate)
				scase++
				$servicecells.find('tr').clone()
					.appendTo($servicetbl.find('tbody'))
						.filldataService(this, scase, classname)
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
	getAdmitDischargeDate(gv.SERVICE, fromDate, toDate)
	countAllServices()
	$servicetbl.fixMe($dialogService)
	hoverService()

	//for resizing dialogs in landscape / portrait view
	$(window).resize(function() {
		$dialogService.dialog({
			width: window.innerWidth * 95 / 100,
			height: window.innerHeight * 95 / 100
		})
		winResizeFix($servicetbl, $dialogService)
	})
}

function refillService(fromDate, toDate)
{
	var i = 0
	$.each( gv.STAFF, function() {
		var staffname = this.staffname
		i++
		var $thisCase = $('#servicetbl tr').eq(i).children("td").eq(CASENUMSV)
		if ($thisCase.prop("colSpan") === 1) {
			$thisCase.prop("colSpan", 9)
				.addClass("serviceStaff")
					.siblings().hide()
		}
		$thisCase.html(staffname)

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
		addClassService(this, classes)
		if (bookq.hn && gv.isPACS) {
			cells[HNSV].className = "pacs"
		}
		cells[NAMESV].className = "camera"
		cells[TREATMENTSV].className = putReoperate(classes)
		cells[ADMISSIONSV].className = putReadmit(classes)
		cells[FINALSV].className = bookq.final? "record" : ""

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

// hover on background pics
function hoverService()
{
	$("td.pacs, td.camera, td.record").mousemove(function(event) {
		var classname = this.className
		if (inPicArea(event, this)) {
			this.className = /2/.test(classname.substr(-1))
								? classname
								: classname + "2"
		} else {
			this.className = classname.replace("2", "")
		}
	})
	.mouseout(function (event) {
		this.className = this.className.replace("2", "")
	})
}

function putReoperate(classes)
{
	var operate = ""

	if (/Reoperation/.test(classes)) {
		operate = "Reoperation"
	}
	else if (/Operation/.test(classes)) {
		operate = "Operation"
	}

	return operate
}

function putReadmit(classes)
{
	var admit = ""

	if (/Readmission/.test(classes)) {
		admit = "Readmission"
	}
	else if (/Admit/.test(classes)) {
		admit = "Admit"
	}

	return admit
}

function addClassService($this, classname)
{
	if (classname) {
		$this[0].className = classname
		var $cell = $this.children("td"),
			$admit = $cell.eq(ADMISSIONSV),
			$treat = $cell.eq(TREATMENTSV),
			$final = $cell.eq(FINALSV)

		if (/Admit/.test(classname)) {
			$admit.eq(ADMISSIONSV).addClass("Admit")
		}
		if (/Operation/.test(classname)) {
			$treat.eq(TREATMENTSV).addClass("Operation")
		}
		if (/Readmission/.test(classname)) {
			$admit.eq(ADMISSIONSV).addClass("Readmission")
		}
		if (/Reoperation/.test(classname)) {
			$treat.eq(TREATMENTSV).addClass("Reoperation")
		}
		if (/Infection/.test(classname)) {
			$final.addClass("Infection")
		}
		//still show Infection
		if (/Morbidity/.test(classname)) {
			if ($final.attr("class") !== "Infection") {
				$final.addClass("Morbidity")
			}
		}
		if (/Dead/.test(classname)) {
			if ($final.attr("class") !== "Infection") {
				$final.addClass("Dead")
			}
		}
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
//		else {
//			Alert("getAdmitDischargeDate", response)
//		}
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
						$cells.eq(ADMISSIONSV).addClass("Admit")
						$thisRow.addClass("Admit")
					}
				}
				if (this.discharge && 
					this.discharge !== $cells.eq(DISCHARGESV).html()) {
					$cells.eq(DISCHARGESV).html(this.discharge)
				}
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
			if (document.getElementById(this)) {
				document.getElementById(this).innerHTML++
			}
		})
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
	var $row = $(pointed).closest('tr')
	var rowi = $row[0]
	var qn = rowi.cells[QNSV].innerHTML
	var oldcontent = $("#editcell").data("oldcontent")
	var fromDate = $('#monthstart').val()
	var toDate = $('#monthpicker').val()

	if (!(column === "readmit" || column === "reoperate")) {
		// Not refillService because it may make next cell back to old value
		// when fast entry, due to slow return from Ajax of previous input
		pointed.innerHTML = content? content : ''
	}

	//take care of white space, double qoute, single qoute, and back slash
	if (/\W/.test(content)) {
		content = URIcomponent(content)
	}
	var sql = "sqlReturnService=UPDATE book SET "
			+ column + "='" + content
			+ "', editor='" + gv.user
			+ "' WHERE qn=" + qn
			+ ";SELECT opdate,staffname,hn,patient,dob,diagnosis,treatment,"
			+ "admit,discharge,opday,readmit,reoperate,elective,doneby,"
			+ "major,disease,infection,morbid,dead,qn,editor"
			+ " FROM book"
			+ " WHERE opdate BETWEEN '" + fromDate + "' AND '" + toDate
			+ "' AND deleted=0"
			+ " AND waitnum<>0"
			+ " ORDER BY opdate, oproom, casenum, waitnum;";

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

			if (oldclass) {
				if (newclass) {
					if (oldclass !== newclass) {
						$.each( oldclassArray, function(i, each) {
							if (counter = document.getElementById(each)) {
								counter.innerHTML = Number(counter.innerHTML) - 1
							}
						})
						$.each( newclassArray, function(i, each) {
							if (newcounter = document.getElementById(each)) {
								newcounter.innerHTML = Number(newcounter.innerHTML) + 1
							}
						})
					}
				} else {
					$.each( oldclassArray, function(i, each) {
						if (counter = document.getElementById(each)) {
							counter.innerHTML = Number(counter.innerHTML) - 1
						}
					})
				}
			} else {
				if (newclass) {
					$.each( newclassArray, function(i, each) {
						if (newcounter = document.getElementById(each)) {
							newcounter.innerHTML = Number(newcounter.innerHTML) + 1
						}
					})
				}
			}

			//tr.newclass
			//remove self cell class to prevent remained unused class
			//td.newclass
			rowi.className = newclass
			$(pointed).removeClass(oldclass)
			addClassService($row, newclass)
		} else {
			Alert("saveContentService", response)
			pointed.innerHTML = oldcontent
			//return to previous content
		}
	}
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

function getHNSV(evt, pointing) {
	clearEditcell()
	if (gv.isPACS) {
		if (inPicArea(evt, pointing)) {
			PACS(pointing.innerHTML)
		}
	}
}

function getNAMESV(evt, pointing) {
	var hn = $(pointing).closest('tr').children("td").eq(HNSV).html()
	var patient = pointing.innerHTML

	clearEditcell()
	if (inPicArea(evt, pointing)) {
		showUpload(hn, patient)
	}
}

// reoperate = null => no operation
// reoperate = 0 => Operation but no Reoperation
// reoperate = 1 => Reoperation
function getTREATMENTSV(evt, pointing, editable) {
	if (editable) {
		var reoperate = null

		if (/Reoperation/.test(pointing.className)) {
			reoperate = 1
		}
		else if (/Operation/.test(pointing.className)) {
			reoperate = 0
		}

		// reoperate = null has no PicArea, is skipped
		// null >= 0 is true in Javascript!?!?!?
		// clear null out
		// click toggle 0, 1
		if ((reoperate || reoperate === 0) && inPicArea(evt, pointing)) {
			clearEditcell()
			saveContentService(pointing, "reoperate", 1 - reoperate)
		} else {
			createEditcell(pointing)
		}
	}
}

// readmit = null => no admission
// readmit = 0 => Admit but no Readmission
// readmit = 1 => Readmission
function getADMISSIONSV(evt, pointing, editable) {
	if (editable) {
		var readmit = null

		if (/Readmission/.test(pointing.className)) {
			readmit = 1
		}
		else if (/Admit/.test(pointing.className)) {
			readmit = 0
		}

		if ((readmit || readmit === 0) && inPicArea(evt, pointing)) {
			clearEditcell()
			saveContentService(pointing, "readmit", 1 - readmit)
		} else {
			createEditcell(pointing)
		}
	}
}

function getFINALSV(evt, pointing, editable) {
	if (editable) {
		if (inPicArea(evt, pointing)) {
			setFINALSV(pointing)
		} else {
			createEditcell(pointing)
		}
	}
}

function setFINALSV(pointing) {
	if (editable) {
		if (inPicArea(evt, pointing)) {
			saveService(pointing, "final")
		} else {
			createEditcell(pointing)
		}
	}
}

function saveService(pointing, column, content) {
	var sql = this.className
	if (inPicArea(event, this)) {
		this.className = /2/.test(classname.substr(-1))
							? classname
							: classname + "2"
	} else {
		this.className = classname.replace("2", "")
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
	var classname = ""

	if (isAdmit(thiscase, fromDate, toDate) || isadmitted(thiscase)) {
		classname += "Admit"
	}
	if (isDischarge(thiscase, fromDate, toDate)) {
		classname += " Discharge"
	}
	if (isOperation(thiscase) || isoperated(thiscase)) {
		classname += " Operation"
	}
	if (isReadmission(thiscase)) {
		classname += " Readmission"
	}
	if (isReoperation(thiscase)) {
		classname += " Reoperation"
	}
	if (isInfection(thiscase)) {
		classname += " Infection"
	}
	if (isMorbidity(thiscase)) {
		classname += " Morbidity"
	}
	if (isDead(thiscase)) {
		classname += " Dead"
	}
	return $.trim(classname)
}

// Consult cases (waitnum < 0) are admitted in another service
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
		/ACDF/, /ALIF/, /[Aa]nast/, /[Aa]pproa/, /[Aa]spirat/, /[Aa]dvance/,
		/[Bb]iop/, /[Bb]lock/, /[Bb]urr/, /[Bb]x/, /[Bb]ypass/, /[Bb]alloon/,
		/[Cc]lip/, 
		/[Dd]ecom/, /DBS/, /[Dd]rain/, /[Dd]isconnect/,
		/[Ee]ctomy/, /[Ee]ndo/, /ESI/, /ETS/, /ETV/, /EVD/, /[Ee]xcis/, /ECOG/,
		/[Ff]ix/, /[Ff]usion/,
		/[Gg]rid/,
		/[Ii]nsert/,
		/[Ll]esion/, /[Ll]ysis/, 
		/MIDLIF/, /MVD/,
		/[Nn]eurot/, /Navigator/,
		/OLIF/, /[Oo]cclu/, /[Oo]perat/, /ostom/, /otom/,
		/plast/, /PLF/, /PLIF/,
		/[Rr]econs/, /[Rr]emov/, /[Rr]epa/, /[Rr]evis/, /[Rr]obot/,
		/scope/, /[Ss]crew/, /[Ss]hunt/, /[Ss]tim/, /SNRB/,
		/TSP/, /TLIF/, /[Tt]rans/,
		/[Uu]ntether/,
		/VNS/
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

function isadmitted(thiscase)
{
	return thiscase.readmit === "0"
}

function isoperated(thiscase)
{
	return thiscase.reoperate === "0"
}

function isReadmission(thiscase)
{
	return thiscase.readmit > 0
}

function isReoperation(thiscase)
{
	return thiscase.reoperate > 0
}

function isInfection(thiscase)
{
	return thiscase.infection > 0
}

function isMorbidity(thiscase)
{
	return thiscase.morbid > 0
}

function isDead(thiscase)
{
	return thiscase.dead > 0
}

function exportServiceToExcel()
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
	var month = $("#monthstart").val()
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
