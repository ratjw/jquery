
import { OPDATE } from "../model/const.js"
import { clearEditcell } from "../control/edit.js"
import { fetchChangeOncall } from "../model/fetch.js"
import { getOpdate } from "../util/date.js"
import { setONCALL } from "../util/variables.js"
import { reposition, menustyle, Alert } from "../util/util.js"

export function exchangeOncall(pointing)
{
  let $stafflist = $("#stafflist")
  let $pointing = $(pointing)

  $stafflist.menu({
    select: ( event, ui ) => {
      let staffname = ui.item.text()
      let opdateth = $pointing.closest('tr').find("td")[OPDATE].innerHTML
      let opdate = getOpdate(opdateth)

      changeOncall(pointing, opdate, staffname)
      $stafflist.hide()
    }
  })

  $stafflist.show()
  reposition($stafflist, "left top", "left bottom", $pointing)
  menustyle($stafflist, $pointing)
  clearEditcell()
}

function changeOncall(pointing, opdate, staffname)
{
  fetchChangeOncall(pointing, opdate, staffname).then(response => {
    if (typeof response === "object") {
      pointing.innerHTML = htmlwrap(staffname)
      setONCALL(response)
    } else {
      Alert("changeOncall", response)
    }
  })
}
