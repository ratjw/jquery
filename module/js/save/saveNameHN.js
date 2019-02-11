
import { sqlGetNameHN } from "../model/sqlsavehn.js"
import { updateBOOK } from "../util/updateBOOK.js"
import { Alert } from "../util/util.js"
import { reCreateEditcell } from "../control/edit.js"

export function saveNameHN(pointed, content)
{
  sqlGetNameHN(pointed, content).then(response => {
    let hasData = function () {
      updateBOOK(response)
      reCreateEditcell()
    }
    let noData = function () {
      Alert("saveNameHN", response)
      pointed.innerHTML = ""
      // unsuccessful entry
    };

    typeof response === "object" ? hasData() : noData()
  }).catch(error => { })
}
