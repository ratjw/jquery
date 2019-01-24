
import { UndoManager } from "../model/UndoManager.js"
import { OPDATE, THEATRE, OPROOM, STAFFNAME, QN } from "../model/const.js"
import { fetchmoveCase } from "../model/move.js"
import { calcWaitnum } from "../util/calcWaitnum.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomTableQN } from "../util/getrows.js"
import { updateBOOK } from "../util/variables.js"
import { Alert } from "../util/util.js"
import { viewmoveCase } from "../view/viewmoveCase.js"
import { clearSelection } from "../control/clearSelection.js"

// Mark the case and initiate mouseoverTR underline the date to move to
export function moveCase()
{
	let $allRows = $("#tbl tr:has('td'), #queuetbl tr:has('td')")
	let	$selected = $(".selected")

	$allRows.mouseover(function() {
		$(this).addClass("pasteDate")
	})
	$allRows.mouseout(function() {
		$(this).removeClass("pasteDate")
	})
	$allRows.off("click").on("click", function(event) {
		clickDate(event, $selected, this)
	})

	$(".selected").removeClass("selected").addClass("moveCase")
}

function clickDate(event, $selected, cell)
{
	let	$moverow = $selected.closest('tr'),
		$movecell = $moverow.find("td"),
		moveOpdateth = $movecell.eq(OPDATE).html(),
		moveOpdate = getOpdate(moveOpdateth),
		staffname = $movecell.eq(STAFFNAME).html(),
		moveqn = $movecell.eq(QN).html(),
		moveWaitnum = $moverow[0].title,
		movetheatre = $moverow.find("td").eq(THEATRE).html(),
		moveroom = $moverow.find("td").eq(OPROOM).html(),

		$thisrow = $(cell).closest("tr"),
		$thiscell = $thisrow.children("td"),
		thisOpdateth = $thiscell.eq(OPDATE).html(),
		thisOpdate = getOpdate(thisOpdateth),
		thistheatre = $thiscell.eq(THEATRE).html(),
		thisroom = $thiscell.eq(OPROOM).html(),
		thisqn = $thiscell.eq(QN).html(),
		thisWaitnum = calcWaitnum(thisOpdateth, $thisrow, $thisrow.next()),
		allOldCases,
		allNewCases,
		thisindex

	// remove itself from old sameDateRoom
	allOldCases = sameDateRoomTableQN(moveOpdateth, moveroom, movetheatre)
					.filter(e => e !== moveqn)

	// remove itself in new sameDateRoom, in case new === old
	allNewCases = sameDateRoomTableQN(thisOpdateth, thisroom, thistheatre)

	// new === old
	if (!!allNewCases.find(e => e === moveqn)) {
		allNewCases = allOldCases
		allOldCases = []
	}

	// insert itself into new sameDateRoom after the clicked row
	thisindex = allNewCases.indexOf(thisqn)
	allNewCases.splice(thisindex + 1, 0, moveqn)
	let arg = {
		allOldCases: allOldCases,
		allNewCases: allNewCases,
		waitnum: thisWaitnum,
		thisdate: thisOpdate,
		thistheatre: thistheatre,
		moveroom: moveroom,
		thisroom: thisroom,
		moveqn: moveqn
	}

	let domoveCase = function (waitnum, movedate, thisdate, oproom) {
		fetchmoveCase(arg).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewmoveCase(movedate, thisdate, staffname)
			}

			typeof response === "object"
			? hasData()
			: Alert ("moveCase", response)
		}).catch(error => {})
	}

	event.stopPropagation()
	clearMouseoverTR()
    clearSelection()

	// click the same case
	if (thisqn === moveqn) { return }

	domoveCase(thisWaitnum, moveOpdate, thisOpdate, thisroom)

/*	UndoManager.add({
		undo: function() {
			domoveCase(moveWaitnum, thisOpdate, moveOpdate, moveroom)
		},
		redo: function() {
			domoveCase(thisWaitnum, moveOpdate, thisOpdate, thisroom)
		}
	})*/
}

export function clearMouseoverTR()
{
	$("#tbl tr:has('td'), #queuetbl tr:has('td')")
		.off("mouseover")
		.off("mouseout")
		.off("click")
	$(".pasteDate").removeClass("pasteDate")
	$(".moveCase").removeClass("moveCase")
}
