
import { fetchSearchDB } from "../model/search.js"
import { Alert, reposition, menustyle } from "../util/util.js"
import { viewSearchDB } from "../view/viewSearchDB.js"
import { clearAllEditing } from "../control/clearAllEditing.js"

export function searchCases()
{
  let $dialogInput = $("#dialogInput"),
    $stafflist = $('#stafflist')

  clearAllEditing()

  $dialogInput.dialog({
    title: "Search",
    closeOnEscape: true,
    modal: true,
    width: 500,
    height: 250,
    close: function() {
      $stafflist.hide()
    }
  })

  $dialogInput.off("click").on("click", (event) => {
    let target = event.target

    if ($stafflist.is(":visible")) {
      $stafflist.hide();
    } else {
      if ($(target).closest('input[name="staffname"]').length) {
        getSaffName(target)
      }
    }
  })
  .keydown(event => {
    let keycode = event.which || window.event.keyCode
    if (keycode === 13) { searchDB() }
  })
}

function getSaffName(pointing)
{
  let $stafflist = $("#stafflist"),
    $pointing = $(pointing)

  $stafflist.appendTo($pointing.closest('div')).show()
  $stafflist.menu({
    select: function( event, ui ) {
      pointing.value = ui.item.text()
      $stafflist.hide()
      event.stopPropagation()
    }
  })

  reposition($stafflist, "left top", "left bottom", $pointing)
  menustyle($stafflist, $pointing)
}

export function searchDB()
{
  let hn = $('input[name="hn"]').val(),
    staffname = $('input[name="staffname"]').val(),
    others = $('input[name="others"]').val(),
    search = ""

  // Close before open another dialog
  $("#dialogInput").dialog("close")

  // for dialog title
  search += hn
  search += (search && staffname ? ", " : "") + staffname
  search += (search && others ? ", " : "") + others
  if (search) {
	fetchSearchDB(hn, staffname, others).then(response => {
		typeof response === "object"
		? viewSearchDB(response, search)
		: Alert("Search: " + search, response)
	}).catch(error => {})
  } else {
    Alert("Search: ''", "<br><br>No Result")
  }
}
