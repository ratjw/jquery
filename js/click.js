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
		clearEditcellData("hide")
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
			clearEditcellData("hide")
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
			clearEditcellData("hide")
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
		case AGE:
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
	var $rowcell = $row.children("td")
	var cellindex = pointed.cellIndex
	var opdate = getOpdate($rowcell.eq(OPDATE).html())
	var qn = $rowcell.eq(QN).html()
	var oldContent = pointed.innerHTML

	pointed.innerHTML = content	//just for show instantly

	content = URIcomponent(content)	//take care of white space, double qoute, 
									//single qoute, and back slash
	if (!qn) {	//if new case, calculate waitnum
		waitnum = calculateWaitnum($row, opdate)
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
			updateBOOK(response);

			//fill qn of new case input in that row, either tbl or queuetbl
			if (!qn) {
				var NewRow = findNewBOOKrow(opdate)
				$rowcell.eq(QN).html(BOOK[NewRow].qn)
			}

			if (tableID == 'tbl') {	//is editing on tbl
				updateQueuetbl()
			} else {				//is editing on queuetbl
				updateTbl()
			}
		}
	}

	function updateQueuetbl()
	{
		if ($("#queuewrapper").css('display') == 'block') {	//staffqueue showing
			var staffname = $('#titlename').html()
			if ((column == "staffname")
			&& (content == staffname)) {	//if input is this staffname
				//New case or change staffname from tbl, update all queuetbl
				//because there is one more row inserted
				refillstaffqueue()
			} else {	//input is not staffname, but on this staffname row
				if (staffname == $rowcell.eq(STAFFNAME).html()) {
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
			refillall()		//New case input from queuetbl, update tbl all
		}					//because there is one more row inserted
	}
}

function saveHNinput(pointed, hn, content)
{
	var tableID = $(pointed).closest("table").attr("id")
	var $row = $(pointed).closest('tr')
	var $rowcell = $row.children("td")
	var cellindex = pointed.cellIndex
	var opdate = getOpdate($rowcell.eq(OPDATE).html())
	var qn = $rowcell.eq(QN).html()
	var oldContent = pointed.innerHTML

	pointed.innerHTML = content

	if (!qn) {	//if new case, calculate waitnum
		waitnum = calculateWaitnum($row, opdate)
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
		}
		else 
		{
			updateBOOK(response)

			var NewRow = findNewBOOKrow(opdate)
			var bookq = BOOK[NewRow]
			$rowcell.eq(NAME).html(bookq.patient)
			$rowcell.eq(AGE).html(putAgeOpdate(bookq.dob, bookq.opdate))
			if (!qn) {	//New case input
				$rowcell.eq(QN).html(BOOK[NewRow].qn)
			}

			if (tableID == 'tbl') {
				if (($("#queuewrapper").css('display') == 'block') && 
					($('#titlename').html() == $rowcell.eq(STAFFNAME).html())) {
					//input is on this staffname row
					refillanother('queuetbl', cellindex, qn)
				}
			} else {	//no need to refillall because new case row was already in tbl
				refillanother('tbl', cellindex, qn)
			}
		}
	}
}

function storePresentcell(pointing)
{
	createEditcell(pointing)

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
			fillSetTable(pointing)
			break
		case STAFFNAME:
			saveEditcellData(pointing)
			stafflist(pointing)
			break
		case HN:
			if (!pointing.innerHTML) {
				saveEditcellData(pointing)
				break
			}
		case NAME:
		case AGE:
			clearEditcellData("hide")
			break
		case DIAGNOSIS:
		case TREATMENT:
		case CONTACT:
			saveEditcellData(pointing)
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

function saveEditcellData(pointing)
{
	var $editcell = $("#editcell")
	$editcell.data("pointing", pointing)
	$editcell.html(pointing.innerHTML)
}	//the data is normal HTML, not jQuery

function clearEditcellData(display)
{
	var $editcell = $("#editcell")
	$editcell.data("pointing", "")
	$editcell.html("")
	if (display == "hide") {
		$editcell.hide()
	}
}
