
import { PATIENT } from "../model/const.js"
import { viewEquip } from "./viewEquip.js"
import { putThdate } from "../util/date.js"
import { winWidth, winHeight, winResizeFix } from "../util/util.js"

// Make box dialog dialogHistory containing historytbl
export function viewCaseHistory(row, hn, tracing)
{
	let  $historytbl = $('#historytbl'),
		nam = row.cells[PATIENT].innerHTML,
		name = nam && nam.replace('<br>', ' '),
		$dialogHistory = $("#dialogHistory")
	
	// delete previous table lest it accumulates
	$('#historytbl tr').slice(1).remove()

	tracing.forEach(function(item) {
		$('#historycells tr').clone()
			.appendTo($('#historytbl tbody'))
				.filldataHistory(item)
	});

	$dialogHistory.dialog({
		title: `${hn} ${name}`,
		closeOnEscape: true,
		modal: true,
		show: 200,
		hide: 200,
		width: winWidth(95),
		height: winHeight(95),
		close: function() {
			$(window).off("resize", resizeHistory )
			$("#fixed").remove()
		}
	})
	$("#historytbl").fixMe($("#dialogHistory"));

	// for resizing dialogs in landscape / portrait view
	$(window).on("resize", resizeHistory )

	function resizeHistory() {
		$dialogHistory.dialog({
			width: winWidth(95),
			height: winHeight(95)
		})
		winResizeFix($historytbl, $dialogHistory)
	}
}

jQuery.fn.extend({
	filldataHistory : function(q) {
		let cells = this[0].cells

		// add colors for deleted and undeleted rows
		if (q.action === 'delete') { this.addClass("deleted") }
		if (q.action === 'undelete') { this.addClass("undelete") }

;		[	putThdate(q.opdate) || "",
			q.oproom || "",
			q.casenum || "",
			q.staffname,
			q.diagnosis,
			q.treatment,
			viewEquip(q.equipment),
			q.admission,
			q.final,
			q.contact,
			q.editor,
			q.editdatetime
		].forEach((item, i) => { cells[i].innerHTML = item })
	}
})
