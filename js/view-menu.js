
function fillSetTable(rownum, pointing)
{
	var table = document.getElementById("tbl")
	var rowmain = table.rows[rownum]
	var tcell = table.rows[rownum].cells
	var opdateth = tcell[OPDATE].innerHTML	//Thai date
	var opdate = opdateth.numDate()		//Thai to mysql date
	var staffname = tcell[STAFFNAME].innerHTML
	var casename = tcell[NAME].innerHTML
	var opday = table.rows[rownum].className
	var hn = tcell[HN].innerHTML
	var qn = tcell[QN].innerHTML
	var disabled = "ui-state-disabled"

	var i = 0
	while (opday.indexOf(NAMEOFDAYFULL[i]) == -1)
		i++
	opday = NAMEOFDAYTHAI[i]

	casename = casename.substring(0, casename.indexOf(' '))

	$("#item3").html("เพิ่ม case วันที่ " + opdateth)
	if (qn)
		$("#item3").removeClass(disabled)
	else
		$("#item3").addClass(disabled)

	$("#item4").html("ลบ case " + casename)
	if (qn)
		$("#item4").removeClass(disabled)
	else
		$("#item4").addClass(disabled)

	$("#item5").html("Delete Blank Row")
	if (checkblank(opdate, qn))
		$("#item5").removeClass(disabled)
	else
		$("#item5").addClass(disabled)

	$("#item6").html("การแก้ไขของ " + casename)
	if (qn)
		$("#item6").removeClass(disabled)
	else
		$("#item6").addClass(disabled)

	$("#item7").html("รายชื่อที่ถูกลบ")

	if ($('#moverow'))
	{
		$("#item8").html("วาง")
	} else {
		$("#item8").html("To Move")
		if (qn)
			$("#item8").removeClass(disabled)
		else
			$("#item8").addClass(disabled)
	}
	$("#item9").html("Equipment")
	if (qn)
		$("#item9").removeClass(disabled)
	else
		$("#item9").addClass(disabled)

	$("#menu").menu({
		select: function( event, ui ) {
			if ($(this).attr("class") == "disabled")
				return

			var item = $(ui.item).find("div").attr("id")

			switch(item)
			{
				case "item1":
					staffqueue(ui.item.text())
					SplitPane()
					break
				case "item2":
					fillday(ui.item.text())
					break
				case "item3":
					addnewrow(rowmain)
					break
				case "item4":
					deletecase(rowmain, qn)
					break
				case "item5":
					deleteblankrow(rowmain)
					break
				case "item6":
					editHistory(rowmain, qn)
					break
				case "item7":
					deleteHistory(rowmain, qn)
					break
				case "item8":
					moveRow(rowmain, qn)
					break
				case "item9":
					fillEquipTable(rownum, qn)
					break
			}

			$("#editcell").hide()		//to disappear after selection
			$(".ui-menu").hide()		//to disappear after selection
		}
	});

	showup(pointing, '#menu', '#tblcontainer')
}

function stafflist(pointing)
{
	$("#stafflist").menu({
		select: function( event, ui ) {
			var staffname = ui.item.text()
			$(pointing).html(staffname)
			saveContent("staffname", staffname)
			$("#editcell").data("located", "")
			$("#editcell").hide()		//to disappear after selection
			$('#stafflist').hide()		//to disappear after selection
			event.stopPropagation()
			event.preventDefault()
			return false
		}
	});

	showup(pointing, '#stafflist', "#tblcontainer")
}

function showup(pointing, menuID, container)
{
	var pos = $(pointing).position();
	var height = pos.top + $(pointing).outerHeight();
	var width = pos.left + $(pointing).outerWidth();

	if ((height + $(menuID).outerHeight()) > 
		$(container).innerHeight() + $(container).scrollTop())
	{
		height = pos.top - $(menuID).innerHeight()
	}
	$(menuID).css({
		position: "absolute",
		top: height + "px",
		left: width + "px",
		boxShadow: "10px 20px 30px slategray"
	})
	$(menuID).show()
}

function checkblank(opdate, qn)
{	//No case in this date? 
	var q = 0

	if (qn)
		return false	//No, it's not empty
	while (opdate > BOOK[q].opdate)
	{
		q++
		if (q >= BOOK.length)
			return false
	}
	if (opdate == BOOK[q].opdate)
		return true	//Yes, there is none
	else
		return false
}
