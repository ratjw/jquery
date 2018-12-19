
import {
	OPDATE, STAFFNAME, HN, PATIENT, DIAGNOSIS, TREATMENT, CONTACT, QN,
	LARGESTDATE
} from "./const.js"

import { clearEditcell } from "./edit.js"
import { clearMouseoverTR } from "./menu.js"
import { modelSortable } from "./model.js"
import { getOpdate, calculateWaitnum, Alert, UndoManager, 
	updateBOOK, clearTimer, resetTimer, showUpload
} from "./util.js"
import { viewSortable } from "./view.js"

// Sortable 2 windows connected with each other
// Trace placeholder to determine moving up or down
export function sortable () {
	let prevplace,
		thisplace,
		sender

	$("#tbl tbody, #queuetbl tbody").sortable({
		items: "tr",
		connectWith: "#tbl tbody, #queuetbl tbody",
		forceHelperSize: true,
		forcePlaceholderSize: true,
		revert: true,
		delay: 300,
		cancel: "tr:has('th')",
		start: function(e, ui){

			clearTimer()
			clearMenu()
			clearEditcell()
			clearMouseoverTR()
			$(".borderfound").removeClass("borderfound")
			ui.placeholder.innerHeight(ui.item.outerHeight())
			prevplace = ui.placeholder.index()
			thisplace = ui.placeholder.index()
			sender = ui.item.closest('table').attr('id')
		},
		// Make scroll only the window that placeholder is in
		over: function(e, ui) {
			ui.item.data('sortableItem').scrollParent = ui.placeholder.closest("div");
			ui.item.data('sortableItem').overflowOffset = ui.placeholder.closest("div").offset();
		},
		// For determination of up or down
		change: function(e, ui){
			prevplace = thisplace
			thisplace = ui.placeholder.index()
		},
		stop: function(e, ui){
			let $item = ui.item
			let $itemcell = $item.children("td")
			let receiver = $item.closest('table').attr('id')
			let oldOpdate = getOpdate($itemcell.eq(OPDATE).html())
			let staffname = $itemcell.eq(STAFFNAME).html()
			let titlename = $('#titlename').html()

			// Allow drag to Consults, or same staff name
			// That is (titlename === "Consults") is allowed
			// To another staff name is not allowed
			//(titlename !== staffname, when titlename is not Consults)
			let illegal = ((sender === "tbl")
						&& (receiver === "queuetbl")
						&& (titlename !== "Consults")
						&& (titlename !== staffname))
			let noQN = !$itemcell.eq(QN).html()

			if (illegal || noQN) {
					stopsorting()
					return false
			}

			// Find nearest row by dropping position
			let $previtem = $item.prev()
			let $nextitem = $item.next()
			let helperpos = ui.offset.top		// ui.offset (no '()') = helper position
			let prevpos = $previtem.length && $previtem.offset().top
			let thispos = $item.offset().top
			let nextpos = $nextitem.length && $nextitem.offset().top
			let nearprev = Math.abs(helperpos - prevpos)
			let nearplace = Math.abs(helperpos - thispos)
			let nearnext = Math.abs(helperpos - nextpos)
			let nearest = Math.min(nearprev, nearplace, nearnext)

			// same place as before sorting
			if ((nearest === nearplace) && (prevplace === thisplace) && (sender === receiver)) {
					stopsorting()
					return false
			}
			let place = {}
				place[nearprev] = $previtem
				place[nearnext] = $nextitem
				place[nearplace] = (prevplace < thisplace) ? $previtem : $nextitem

			// Determine that the user intend to drop on prev or next row
			let $thisdrop = (!$previtem.length || $previtem.has('th').length)
							? $nextitem
							: (!$nextitem.length || $nextitem.has('th').length)
								? $previtem
								: place[nearest]

			let newOpdate = getOpdate($thisdrop.children("td").eq(OPDATE).html())
			let thisqn = $itemcell.eq(QN).html()

			// Check conflict, if no, get roomtime
			let roomtime = checkRoomTime($item, newOpdate, oldOpdate)
			if (roomtime.conflict) {
				Alert("Cancel Sorting", roomtime.conflict)
				stopsorting()
				return false
			}

			let oldWaitnum = $item[0].title
			let oldroomtime = {}
			let room = $item.children("td").eq(OPROOM).html()
				oldroomtime.roomtime = room ? room.split("<br>") : ""
			let finalWaitnum = calculateWaitnum( receiver, $item, newOpdate )
			let argmold = {
				finalWaitnum: oldWaitnum,
				thisOpdate: oldOpdate,
				roomtime: oldroomtime,
				thisqn: thisqn
			}
			let argmnew = {
				finalWaitnum: finalWaitnum,
				thisOpdate: newOpdate,
				roomtime: roomtime,
				thisqn: thisqn
			}
			let argvold = {
				receiver: sender,
				oldOpdate: newOpdate,
				thisOpdate: oldOpdate,
				titlename: titlename,
				staffname: staffname
			}
			let argvnew = {
				receiver: sender,
				oldOpdate: oldOpdate,
				thisOpdate: newOpdate,
				titlename: titlename,
				staffname: staffname
			}

			modelSort(argmnew, argvnew)

			// make undo-able
			UndoManager.add({
				undo: function() {
					modelSort(argmold, argvold)
				},
				redo: function() {
					modelSort(argmnew, argvnew)
				}
			})		

			stopsorting()
		}
	})
}

function modelSort(argm, argv) {
	modelSortable(argm).then(response => {
		let hasData = function () {
			updateBOOK(response)
			viewSortable(argv)
		}

		typeof response === "object"
		? hasData()
		: Alert("Sortable", response)
	}).catch(error => {})
}

let stopsorting = function () {
	// Return to original place so that reViewOneDay(oldOpdate)
	// will not render this row in wrong position
	$("#tbl tbody, #queuetbl tbody").sortable( "cancel" )

	// setTimeout 10 sec
	//  Editcell hide after 1 min (5 cycles) idling
	//  Logout after 10 min (50 cycles) idling
	resetTimer()

	//  after sorting, editcell was placed at row 0 column 1
	//  and display at placeholder position in entire width
	$('#editcell').hide()
}

let clearMenu = function() {
	$('#menu').hide();
	$('#stafflist').hide();
}
