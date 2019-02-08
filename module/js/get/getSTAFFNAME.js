
import { createEditcell, clearEditcell } from "../control/edit.js"
import { saveContent } from "../save/saveContent.js"
import { reposition, menustyle } from "../util/util.js"

export function getSTAFFNAME(pointing)
{
  let $stafflist = $("#stafflist"),
    $pointing = $(pointing)

  createEditcell(pointing)
  $stafflist.appendTo($pointing.closest('div')).show()

  $stafflist.menu({
    select: function( event, ui ) {
      saveContent(pointing, "staffname", ui.item.text())
      clearEditcell()
      $stafflist.hide()
      event.stopPropagation()
    }
  });

  // reposition from main menu to determine shadow
  reposition($stafflist, "left top", "left bottom", $pointing)
  menustyle($stafflist, $pointing)
}
