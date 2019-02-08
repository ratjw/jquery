
/* to do !!!!!!!!!!!!!
Search Exact Phrases       +
Exclude a word             -
Search in sepific column   :
Forgotten words            *
*/

import { sqlSearchDB } from "../model/sqlSearchDB.js"
import { Alert, reposition, menustyle } from "../util/util.js"
import { viewSearchDB } from "../view/viewSearchDB.js"
import { clearAllEditing } from "../control/clearAllEditing.js"

export function searchCases()
{
  let $dialogInput = $("#dialogInput"),
    $staffsearch = $('#stafflist').clone()

  clearAllEditing()
  $staffsearch.attr('id', 'staffsearch')
  $staffsearch.css('position', 'fixed')

  $dialogInput.dialog({
    title: "Search",
    closeOnEscape: true,
    modal: true,
    width: 500,
    height: 250,
    close: function() {
      $staffsearch.hide()
    }
  })

  $dialogInput.off("click").on("click", (event) => {
    let target = event.target

    if ($staffsearch.is(":visible")) {
      $staffsearch.hide();
    } else {
      if ($(target).closest('input[name="staffname"]').length) {
        getSaffName(target, $staffsearch)
      }
    }
  })
  .keydown(event => {
    let keycode = event.which || window.Event.keyCode
    if (keycode === 13) { searchDB() }
  })
}

function getSaffName(pointing, $staffsearch)
{
  let $pointing = $(pointing)

  $staffsearch.appendTo($pointing.closest('div')).show()
  $staffsearch.menu({
    select: function( event, ui ) {
      pointing.value = ui.item.text()
      $staffsearch.hide()
      event.stopPropagation()
    }
  })

  reposition($staffsearch, "left top", "left bottom", $pointing)
  menustyle($staffsearch, $pointing)
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
  sqlSearchDB(hn, staffname, others).then(response => {
    typeof response === "object"
    ? viewSearchDB(response, search)
    : Alert("Search: " + search, response)
  }).catch(error => {})
  } else {
    Alert("Search: ''", "<br><br>No Result")
  }
}
