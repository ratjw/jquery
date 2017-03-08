
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
		$("#item3").parent().removeClass(disabled)
	else
		$("#item3").parent().addClass(disabled)

	$("#item4").html("Delete Row " + casename)

	$("#item5").html("รายชื่อที่ถูกลบ")

	$("#item6").html("การแก้ไขของ " + casename)
	if (qn)
		$("#item6").parent().removeClass(disabled)
	else
		$("#item6").parent().addClass(disabled)

//	if ($('#moverow'))
//	{
//		$("#item7").html("วาง")
//	} else {
		$("#item7").html("To Move")
//		if (qn)
//			$("#item7").parent().removeClass(disabled)
//		else
			$("#item7").parent().addClass(disabled)
//	}
	$("#item8").html("Equipment")
	if (qn)
		$("#item8").parent().removeClass(disabled)
	else
		$("#item8").parent().addClass(disabled)

	$("#menu").menu({
		select: function( event, ui ) {

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
					deletecase(rowmain, opdate, qn)
					break
				case "item5":
					deleteHistory(rowmain, qn)
					break
				case "item6":
					editHistory(rowmain, qn)
					break
				case "item7":
					moveRow(rowmain, qn)
					break
				case "item8":
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
	var height = pos.top + $(pointing).outerHeight();	//bottom
	var width = pos.left + $(pointing).outerWidth();	//right

	if ((height + $(menuID).outerHeight()) > 
		$(window).innerHeight() + $(window).scrollTop())
	{
		height = pos.top - $(menuID).innerHeight()
	}
	$(menuID).css({
//		position: "absolute",
		top: height + "px",
		left: width + "px",
//		boxShadow: "10px 20px 30px slategray"
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
			return false	//beyond BOOK, do not delete
	}
	if (opdate == BOOK[q].opdate)
		return true	//there is this opdate case in another row, can delete
	else
		return false	//No this opdate case in another row, do not delete
}
