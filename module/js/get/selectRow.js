
import { disableOneRowMenu } from '../control/clearSelection.js'

import { oneRowMenu } from '../menu/oneRowMenu.js'

export function selectRow(event, target)
{
  let $target = $(target).closest("tr"),
      $targetTRs = $(target).closest("table").find("tr"),
      $allTRs = $("tr")

  if (event.ctrlKey) {
    $targetTRs.removeClass("lastselected")
    $target.addClass("selected lastselected")
    disableOneRowMenu()
  } else if (event.shiftKey) {
    $targetTRs.not(".lastselected").removeClass("selected")
    shiftSelect($target)
    disableOneRowMenu()
  } else {
    $allTRs.removeClass("selected lastselected")
    $target.addClass("selected lastselected")
    oneRowMenu()
  }
}

function shiftSelect($target)
{
  let $lastselected = $(".lastselected").closest("tr"),
      lastIndex = $lastselected.index(),
      targetIndex = $target.index(),
      $select = {}

  if (targetIndex > lastIndex) {
    $select = $target.prevUntil('.lastselected')
  } else if (targetIndex < lastIndex) {
    $select = $target.nextUntil('.lastselected')
  } else {
    return
  }
  $select.addClass("selected")
  $target.addClass("selected")
}
