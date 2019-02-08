
import { updateBOOK } from "../util/updateBOOK.js"
import { sqlSaveContentNoQN } from "../model/sqlSaveContent.js"
import { viewSaveContentNoQN } from "../view/viewSaveContentNoQN.js"
import { OLDCONTENT, reCreateEditcell } from "../control/edit.js"
import { Alert } from "../util/util.js"

export function saveContentNoQN(pointed, column, newcontent)
{
  sqlSaveContentNoQN(pointed, column, newcontent).then(response => {
    let hasData = function () {
      updateBOOK(response)

  reCreateEditcell()
//      viewSaveContentNoQN(pointed, column)
    }
    let noData = function () {
      Alert("saveContentNoQN", response)

      // return to previous content
      pointed.innerHTML = OLDCONTENT
    };

    typeof response === "object" ? hasData() : noData()
  }).catch(error => {  })
}
