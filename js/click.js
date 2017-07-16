function clicktable(clickedCell)
{
	savePreviouscell()
	storePresentcell(clickedCell)
}

function keyin(event)
{
	var keycode = event.which || window.event.keyCode
	var pointing = $("#editcell").data("pointing")
	var thiscell

	if (keycode == 27)	{
		$('#menu').hide();
		$('#stafflist').hide();
		clearEditcellData()
		window.focus()
		event.preventDefault()
		return false
	}
	if (!pointing) {
		return
	}
	if (keycode == 9) {
		$('#menu').hide();
		$('#stafflist').hide();
		savePreviouscell()
		if (event.shiftKey) {
			thiscell = findPrevcell(event, EDITABLE, pointing)
			if ((thiscell.cellIndex == HN) && (thiscell.innerHTML != "")) {
				thiscell = findPrevcell(event, EDITABLE, $(thiscell))
			}
		} else {
			thiscell = findNextcell(event, EDITABLE, pointing)
			if ((thiscell.cellIndex == HN) && (thiscell.innerHTML != "")) {
				thiscell = findNextcell(event, EDITABLE, $(thiscell))
			}
		}
		if (thiscell) {
			storePresentcell(thiscell)
		} else {
			clearEditcellData()
			window.focus()
		}
		event.preventDefault()
		return false
	}
	if (keycode == 13) {
		$('#menu').hide();
		$('#stafflist').hide();
		if (event.shiftKey || event.ctrlKey) {
			return
		}
		savePreviouscell()
		thiscell = findNextRow(event, EDITABLE, pointing)
		if ((thiscell.cellIndex == HN) && (thiscell.innerHTML != "")) {
			thiscell = findNextcell(event, EDITABLE, $(thiscell))
		}
		if (thiscell) {
			storePresentcell(thiscell)
		} else {
			clearEditcellData()
			window.focus()
		}
		event.preventDefault()
		return false
	}
}

function savePreviouscell() 
{
	var editPoint = $("#editcell").data("pointing")
	if (editPoint && (editPoint.innerHTML != getEditcellHtml())) {
		saveEditPointData(editPoint)
	}
}

function saveEditPointData(pointed)
{
	var content = ""
	switch(pointed.cellIndex)
	{
		case OPDATE:
			break
		case STAFFNAME:
			content = getEditcellHtml()
			saveContent(pointed, "staffname", content)
			break
		case HN:
			content = getEditcellHtml()
			if (content.length != 7) {
				return
			}
			saveHNinput(pointed, "hn", content)
			break
		case NAME:
			break
		case DIAGNOSIS:
			content = getEditcellHtml()
			saveContent(pointed, "diagnosis", content)
			break
		case TREATMENT:
			content = getEditcellHtml()
			saveContent(pointed, "treatment", content)
			break
		case CONTACT:
			content = getEditcellHtml()
			saveContent(pointed, "contact", content)
			break
	}
}
 
function getEditcellHtml()
{
	return $("#editcell").html()
			.replace(TRIMHTML, '')
			.replace(HTMLNOTBR, '')
}

function saveContent(pointed, column, content)	//use only "pointed" to save data
{
	var tableID = $(pointed).closest("table").attr("id")
	var $row = $(pointed).closest('tr')
	var $cells = $row.children("td")
	var cellindex = pointed.cellIndex
	var opdate = getOpdate($cells.eq(OPDATE).html())
	var qn = $cells.eq(QN).html()
	var oldContent = pointed.innerHTML

	pointed.innerHTML = content	//just for show instantly

	content = URIcomponent(content)	//take care of white space, double qoute, 
									//single qoute, and back slash
	if (!qn) {	//if new case, calculate waitnum
		waitnum = calculateWaitnum(tableID, $row, opdate)
		$row[0].title = waitnum		//store waitnum in row title
		var sql = "sqlReturnbook=INSERT INTO book ("
			sql += "waitnum, opdate, "+ column +", editor) VALUES ("
			sql += waitnum + ", '" + opdate +"', '"+ content +"', '"+ THISUSER +"');"
	} else {
		var sql = "sqlReturnbook=UPDATE book SET "
			sql += column +" = '"+ content
			sql += "', editor='"+ THISUSER
			sql += "' WHERE qn = "+ qn +";"
	}

	Ajax(MYSQLIPHP, sql, callbacksaveContent);

	function callbacksaveContent(response)
	{
 		if (!response || response.indexOf("DBfailed") != -1)
		{
			alert("saveContent", response)
			pointed.innerHTML = oldContent
			//return to previous content
		}
		else
		{
			updateBOOK(response)

			//fill qn of new case input in that row, either tbl or queuetbl
			if (!qn) {
				var book = BOOK
				if ((tableID == "queuetbl") && ($('#titlename').html() == "Consults")) {
					book = CONSULT
				}
				var NewRow = findNewBOOKrow(book, opdate)
				$cells.eq(QN).html(book[NewRow].qn)
			}

			if (tableID == 'tbl') {	//is editing on tbl
				updateQueuetbl()
			} else {				//is editing on queuetbl
				if ($('#titlename').html() != "Consults") {
					updateTbl()
				}
			}
		}
	}

	function updateQueuetbl()
	{
		if ($("#queuewrapper").css('display') == 'block') {	//staffqueue showing
			var staffname = $('#titlename').html()
			if ((column == "staffname")
			&& (pointed.innerHTML == staffname)) {	//if input is this staffname
				//New case or change staffname from tbl, update all queuetbl
				//because there is one more row inserted
				refillstaffqueue()
			} else {	//input is not staffname, but on this staffname row
				if (staffname == $cells.eq(STAFFNAME).html()) {
					refillanother('queuetbl', cellindex, qn)
				}
			}
		}
	}

	function updateTbl()
	{
		if (qn) {	//is editing on existing row, just fill corresponding row
			refillanother('tbl', cellindex, qn)
		} else {
			refillall(BOOK)		//New case input from queuetbl, update tbl all
		}						//because there is one more row inserted
	}
}

function saveHNinput(pointed, hn, content)
{
	var tableID = $(pointed).closest("table").attr("id")
	var $row = $(pointed).closest('tr')
	var $cells = $row.children("td")
	var cellindex = pointed.cellIndex
	var opdate = getOpdate($cells.eq(OPDATE).html())
	var qn = $cells.eq(QN).html()
	var oldContent = pointed.innerHTML

	pointed.innerHTML = content

	if (!qn) {	//if new case, calculate waitnum
		waitnum = calculateWaitnum(tableID, $row, opdate)
		$row[0].title = waitnum		//store waitnum in row title
		var sql = "hn=" + content
		sql += "&waitnum="+ waitnum
		sql += "&opdate="+ opdate
		sql += "&qn="+ qn
		sql += "&username="+ THISUSER
	} else {
		var sql = "hn=" + content
		sql += "&opdate="+ opdate
		sql += "&qn="+ qn
		sql += "&username="+ THISUSER
	}

	Ajax(GETNAMEHN, sql, callbackgetByHN)

	function callbackgetByHN(response)
	{
		if ((!response) || (response.indexOf("patient") == -1) || (response.indexOf("{") == -1)) 
		{
			alert("saveHNinput", response)
			pointed.innerHTML = oldContent		//return to previous content
		} else {
			updateBOOK(response)

			var book = BOOK
			if ((tableID == "queuetbl") && ($('#titlename').html() == "Consults")) {
				book = CONSULT
			}
			var NewRow = findNewBOOKrow(book, opdate)
			$cells.eq(QN).html(book[NewRow].qn)

			var bookq = book[NewRow]
			$cells.eq(STAFFNAME).html(bookq.staffname)
			$cells.eq(NAME).html(bookq.patient 
				+ "<br>อายุ " + putAgeOpdate(bookq.dob, bookq.opdate))
			$cells.eq(DIAGNOSIS).html(bookq.diagnosis)
			$cells.eq(TREATMENT).html(bookq.treatment)
			$cells.eq(CONTACT).html(bookq.contact)
			if (!qn) {	//New case input
				$cells.eq(QN).html(book[NewRow].qn)
			}

			if (tableID == 'tbl') {
				if (($("#queuewrapper").css('display') == 'block') && 
					($('#titlename').html() == $cells.eq(STAFFNAME).html())) {
					//input is on this staffname row
					refillanother('queuetbl', cellindex, qn)
				}
			} else {	//no need to refillall because new case row was already in tbl
				if ($('#titlename').html() != "Consults") {
					refillanother('tbl', cellindex, qn)
				}
			}
		}
	}
}

function storePresentcell(pointing)
{
	switch(pointing.cellIndex)
	{
		case OPDATE:
			clearEditcellData()
			var context = ""
			//to show Thai name of day in editcell div
			if ($(pointing).closest('table').attr('id') == 'tbl') {
				context = window.getComputedStyle(pointing,':before').content
				context = context.replace(/\"/g, "")
			}
			context = context + pointing.innerHTML
			$("#editcell").html(context)
			$("#editcell").css({
				height: $(pointing).height() + "px",
				width: $(pointing).width() + "px",
				fontSize: $(pointing).css("fontSize")
			})
			$("#editcell").appendTo($(pointing).closest('div'))
			reposition("#editcell", "center", "center", pointing)
			fillSetTable(pointing)
			break
		case STAFFNAME:
			createEditcell(pointing)
			stafflist(pointing)
			break
		case HN:
			if (!pointing.innerHTML) {
				createEditcell(pointing)
				break
			}
		case NAME:
			clearEditcellData()
			break
		case DIAGNOSIS:
		case TREATMENT:
		case CONTACT:
			createEditcell(pointing)
			break
	}
}

function createEditcell(pointing)
{
	var $editcell = $("#editcell")
	$editcell.css({
		height: $(pointing).height() + "px",
		width: $(pointing).width() + "px",
		fontSize: $(pointing).css("fontSize")
	})
	$editcell.data("pointing", pointing)
	$editcell.html(pointing.innerHTML)
	$editcell.appendTo($(pointing).closest('div'))
	reposition("#editcell", "center", "center", pointing)
	$editcell.focus()
}

function reposition(me, mypos, atpos, target)
{
	$(me).position({
		my: mypos,
		at: atpos,
		of: target
	}).show()
	$(me).position({
		my: mypos,
		at: atpos,
		of: target
	}).show()
}	//Don't know why have to repeat 2 times

function clearEditcellData()
{
	var $editcell = $("#editcell")
	$editcell.data("pointing", "")
	$editcell.html("")
	$editcell.hide()
}
