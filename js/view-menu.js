
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
	$("#item1").html("เพิ่ม case วันที่ " + opdateth)
	if (qn)
		$("#item1").removeClass(disabled)
	else
		$("#item1").addClass(disabled)
	$("#item2").html("ลบ case " + casename)
	if (qn)
		$("#item2").removeClass(disabled)
	else
		$("#item2").addClass(disabled)
	$("#item3").html("Delete Blank Row")
	if (checkblank(opdate, qn))
		$("#item3").removeClass(disabled)
	else
		$("#item3").addClass(disabled)
	$("#item4").html("คิวของอาจารย์")
	$("#item5").html("คิวเฉพาะวัน")
	$("#item6").html("การแก้ไขของ " + casename)
	if (qn)
		$("#item6").removeClass(disabled)
	else
		$("#item6").addClass(disabled)
	$("#item7").html("รายชื่อที่ถูกลบ")

	$("#menu").menu({
		select: function( event, ui ) {

			var item = $(ui.item).find("div").attr("id")

			switch(item)
			{
				case "item1":
					addnewrow(rowmain)
					break
				case "item2":
					deletecase(rowmain, qn)
					break
				case "item3":
					deleteblankrow(rowmain)
					break
				case "item4":
				case "item5":
					return false
				case "item51":
				case "item52":
				case "item53":
				case "item54":
				case "item55":
				case "item56":
				case "item57":
					fillday($('#'+item).html())
					break
				case "item6":
					edithistory(rowmain, qn)
					break
				case "item7":
					deletehistory(rowmain, qn)
					break
				default :
					staffqueue(ui.item.text())
			}

			$("#editcell").hide()	//to disappear after selection
			$("#menu").hide()		//to disappear after selection
			$( "#item4" ).removeClass( "ui-state-active" )
			$( "#item4" ).prepend('<span class="ui-menu-icon ui-icon  ui-icon-caret-1-e"></span>')
			$( "#item40" ).hide()
			$( "#item40" ).attr("aria-hidden", "true")
			$( "#item40" ).attr("aria-expanded", "false")
			event.stopPropagation()
			event.preventDefault()
			return false
		}
	});

	showup(pointing, '#menu')
}

function stafflist(pointing)
{
	$("#stafflist").menu({
		select: function( event, ui ) {
			var staffname = ui.item.text()
			$(pointing).html(staffname)
			saveContent("staffname", staffname)
			$("#editcell").data("located", "")
			$("#editcell").hide()	//to disappear after selection
			$('#stafflist').hide()	//to disappear after selection
			event.stopPropagation()
			event.preventDefault()
			return false
		}
	});

	showup(pointing, '#stafflist')
}

function showup(pointing, menuID)
{
	var pos = $(pointing).position();
	var height = pos.top + $(pointing).outerHeight();
	var width = pos.left + $(pointing).outerWidth();

	if ((height + $(menuID).outerHeight()) > $(window).innerHeight() + $(window).scrollTop())
	{
		height = pos.top - $(menuID).innerHeight()
	}
	$(menuID).css({
		position: "absolute",
		top: height + "px",
		left: width + "px",
		boxShadow: "10px 20px 30px slategray"
	}).show()
}
