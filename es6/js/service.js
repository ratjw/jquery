
function serviceReview()
{
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

	document.getElementById("dialogService").addEventListener("wheel", function (event) {
		resetTimer();
		gv.idleCounter = 0
	})
	
	document.getElementById("dialogService").addEventListener("mousemove", function (event) {
		resetTimer();
		gv.idleCounter = 0
	})
}

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

	getServiceOneMonth(fromDate, toDate).then( function (service) {
		gv.SERVICE = service
		gv.SERVE = calcSERVE()
		showService(fromDate, toDate)
	}, function (title, message) {
		Alert(title, message)
	})

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

//Retrieve the specified month from server
async function getServiceOneMonth(fromDate, toDate)
{
	let sql = "sqlReturnData=" + sqlOneMonth(fromDate, toDate)

	let response = await postData(MYSQLIPHP, sql)
	if (typeof response === "object") {
		return response
	} else {
		return "getServiceOneMonth, " + response
	}
}

function sqlOneMonth(fromDate, toDate)
{
	return "SELECT b.* FROM book b left join staff s on b.staffname=s.staffname "
		  + "WHERE opdate BETWEEN '" + fromDate + "' AND '" + toDate
		  + "' AND deleted=0 "
		  + "AND waitnum<>0 "
		  + "AND hn "
		  + "ORDER BY s.number,opdate,oproom,casenum,waitnum;";
}

// gv.SERVE is a copy of gv.SERVICE which also calculates some values at run time
// namely - diagnosis, treatment, admit
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
function showService(fromDate, toDate)
{
	let	$dialogService = $("#dialogService"),
		$servicetbl = $("#servicetbl"),
		$servicecells = $("#servicecells"),
		staffname = "",
		scase = 0,
		classname = ""
			
	let resizeDialog = () => {
		$dialogService.dialog({
			width: winWidth(95),
			height: winHeight(95)
		})
		winResizeFix($servicetbl, $dialogService)
	}

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

	$('label:has(input[type=radio])').on('mousedown', function(e){
	  var radio = $(this).find('input[type=radio]');
	  var wasChecked = radio.prop('checked');
	  radio[0].turnOff = wasChecked;
	  radio.prop('checked', !wasChecked);
	});

	$('label:has(input[type=radio])').on('click', function(e){
	  var radio = $(this).find('input[type=radio]');
	  radio.prop('checked', !radio[0].turnOff);
	  radio[0]['turning-off'] = !radio[0].turnOff;
	});

	//for resizing dialogs in landscape / portrait view
	$(window).on("resize", resizeDialog)
}

function clickDialogService(event)
{
	let	$dialogService = $("#dialogService"),
		$servicetbl = $("#servicetbl")

	let	target = event.target,
		inCell = target.closest("td"),
		onProfile = !!target.closest(".divRecord"),
		onNormalCell = (target.nodeName === "TD" && target.colSpan === 1),
		pointed = $("#editcell").data("pointing"),
		isHideColumn = target.cellIndex === PROFILESV,
		onDivRecord = /divRecord/.test(target.className),
		onImage = target.nodeName === "IMG"

	resetTimer();
	gv.idleCounter = 0
	event.stopPropagation()

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
		  if (!!pointed && (inCell !== pointed)) {
			savePreviousCellService()
		  }
		  if (inCell !== pointed) {
		    storePresentCellService(event, inCell)
		  }
		}
		else if (SERVICECOLOR.includes(target.title)) {
		  showInputColor(target)
		}
	} else {
	  if (pointed) {
		  if (target === pointed) {
			  return
		  }
		  savePreviousCellService()
		  if (onNormalCell) {
			  storePresentCellService(event, target)
		  } else {
			  clearEditcell()
		  }
	  } else {
		  if (onNormalCell) {
			  storePresentCellService(event, target)
		  }
	  }
    }
}

function showProfile()
{
	$("#servicetbl").addClass("showColumn8")
	$("#dialogService .fixed").addClass("showColumn8")
	$("#servicetbl .divRecord").show()
	$("#servicetbl th #imgopen").hide()
	$("#servicetbl th #imgclose").show()
}

function hideProfile()
{
	$("#servicetbl").removeClass("showColumn8")
	$("#dialogService .fixed").removeClass("showColumn8")
	$("#servicetbl .divRecord").hide()
	$("#servicetbl th #imgopen").show()
	$("#servicetbl th #imgclose").hide()
}

function calcSERVE()
{
	let gvserve = gv.SERVICE.slice()

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

function refillService(fromDate, toDate)
{
	let $servicetbl = $("#servicetbl"),
		$rows = $servicetbl.find("tr"),
		$servicecells = $("#servicecells"),
		len = $rows.length
		staffname = "",
		i = 0, scase = 0,
		classname = ""

	$.each( gv.SERVE, function() {
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
		if (bookq.hn && gv.isPACS) { cells[HNSV].className = "pacs" }
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
	let	tdClass = "td.pacs, td.upload",
		paleClasses = ["pacs", "upload"],
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

function showInputColor(target)
{
	let	row = target.closest("tr"),
		classname = target.title

	if (target.checked) {
		row.classList.add(classname)
	} else {
		row.classList.remove(classname)
	}
}

async function getAdmitDischargeDate(fromDate, toDate)
{
	let sql = "from=" + fromDate
			+ "&to=" + toDate
			+ "&sql=" + sqlOneMonth(fromDate, toDate)

	let response = await postData(GETIPD, sql)
	if (typeof response === "object") {
		updateBOOK(response)
		gv.SERVE = calcSERVE()
		fillAdmitDischargeDate()
	}
}

function fillAdmitDischargeDate()
{
	let i = 0,
		staffname = "",
		$rows = $("#servicetbl tr")

	$.each( gv.SERVE, function() {
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

function Skeyin(event, keycode, pointing)
{
	let SEDITABLE	= [DIAGNOSISSV, TREATMENTSV, ADMISSIONSV, FINALSV],
		fromDate = $("#monthstart").val(),
		start = getStart(),
		thiscell

	if (!pointing) {
		return
	}
	if (keycode === 9) {
		savePreviousCellService()
		if (event.shiftKey)
			thiscell = findPrevcell(SEDITABLE, pointing)
		else
			thiscell = findNextcell(SEDITABLE, pointing)
		if (thiscell) {
			storePresentCellService(event, thiscell)
		} else {
			clearEditcell()
		}
		event.preventDefault()
		return false
	}
	if (keycode === 13) {
		if (event.shiftKey || event.ctrlKey) {
			return
		}
		savePreviousCellService()
		thiscell = findNextRow(SEDITABLE, pointing)
		if (thiscell) {
			storePresentCellService(event, thiscell)
		} else {
			clearEditcell()
		}
		event.preventDefault()
		return false
	}
}

function savePreviousCellService()
{
	let $editcell = $("#editcell"),
		oldcontent = $editcell.data("oldcontent"),
		newcontent = getText($editcell),
		pointed = $editcell.data("pointing")

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
function saveContentService(pointed, column, content)
{
	// Not refillService because it may make next cell back to old value
	// when fast entry, due to slow return from Ajax of previous input
	pointed.innerHTML = content? content : ""

	//take care of white space, double qoute, single qoute, and back slash
	content = URIcomponent(content)

	let sql = sqlColumn(pointed, column, content)

	saveService(pointed, sql)
}

async function saveService(pointed, sql)
{
	let $row = $(pointed).closest("tr"),
		row = $row[0],
		qn = row.cells[QNSV].innerHTML,
		oldcontent = $("#editcell").data("oldcontent"),
		fromDate = $("#monthstart").val(),
		toDate = $("#monthpicker").val()

	sql	+= sqlOneMonth(fromDate, toDate)

	let response = await postData(MYSQLIPHP, sql)
	if (typeof response === "object") {
		updateBOOK(response)

		// other user may add a row
		let servelen = gv.SERVE.length
		gv.SERVE = calcSERVE()
		if (gv.SERVE.length !== servelen) {
			refillService(fromDate, toDate)
		}

		// Calc countService of this case only
		let oldclass = row.className
		let bookq = getBOOKrowByQN(gv.SERVE, qn)
		let newclass = countService(bookq, fromDate, toDate)
		let oldclassArray = oldclass.split(" ")
		let newclassArray = newclass.split(" ")
		let counter

		if (oldclass !== newclass) {
			updateCounter(oldclassArray, -1)
			updateCounter(newclassArray, 1)
			row.className = newclass
		}
	} else {
		Alert("saveService", response)
		pointed.innerHTML = oldcontent
		//return to previous content
	}
}

function updateCounter(classArray, one)
{
	let counter

	$.each( classArray, function(i, each) {
		if (counter = document.getElementById(each)) {
			counter.innerHTML = Number(counter.innerHTML) + one
		}
	})
}

function storePresentCellService(evt, pointing)
{
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
			gv.editableSV && createEditcell(pointing)
			break
		case PROFILESV:
			gv.editableSV && getPROFILESV(pointing)
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
	let hn = $(pointing).closest("tr").children("td").eq(HNSV).html()
	let patient = pointing.innerHTML

	clearEditcell()
	if (inPicArea(evt, pointing)) {
		showUpload(hn, patient)
	}
}

function getPROFILESV(pointing)
{
	let oldRecord = getRecord(pointing),
		$editcell = $("#editcell")

	$editcell.data("pointing", pointing)
	$editcell.data("oldcontent", oldRecord)
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
	if (gv.editableSV) {
		$divRecord.find("input").off("click", returnFalse)
		$divRecord.find("input[type=text]").prop("disabled", false)
	} else {
		$divRecord.find("input").on("click", returnFalse)
		$divRecord.find("input[type=text]").prop("disabled", true)
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

// each key is of different column in database
// select only the changed columns to save
function saveProfileService(pointed)
{
	let newRecord = getRecord(pointed),
		oldRecord = $("#editcell").data("oldcontent"),
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

function sqlColumn(pointing, column, content)
{
	let qn = $(pointing).closest("tr").find("td").eq(QNSV).html()

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

function countAllServices()
{
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
