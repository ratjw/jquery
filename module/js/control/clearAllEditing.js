
import { clearEditcell } from "./edit.js"
import { clearMouseoverTR } from "../menu/moveCase.js"
import { clearSelection } from "./clearSelection.js"

export function clearAllEditing()
{
  $('#stafflist').hide();
  clearEditcell()
  clearMouseoverTR()
  clearSelection()
  if ($("#dialogNotify").hasClass('ui-dialog-content')) {
    $("#dialogNotify").dialog("close")
  }
  $(".marker").removeClass("marker")
}
