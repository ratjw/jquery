
import { countAllServices } from "./countAllServices.js"
import { showInputColor, operationToDisease } from "./clickProfile.js"

export function profileHandler()
{
  // before radio input value changed, save what the number it change from  
  // when operated is 1, show prevDisease if changed from 0, not from other number
  $('#servicetbl input[type=number]').on('mousedown keydown mousewheel', function(e) {
    if (this.value) { this.prevVal = this.value }
  })
  .on('input', function(e) {
    if (/operated/.test(this.name)) {
      operationToDisease(this)
    }
    showInputColor(e.target)
    countAllServices()
  })

  // hack for click to uncheck a radio input
  $('#servicetbl label:has(input[type=radio])').on('mousedown', function(e) {
    var radios = $(this).find('input[type=radio]')
    var wasChecked = radios.prop('checked')

    radios[0].turnOff = wasChecked
    radios.prop('checked', !wasChecked)

    // check all disease radios input before changed
  // to determine whether there was a previous disease or not
    let inCell = this.closest("td")
    let qn = inCell.parentElement.dataset.qn
    let inputDisease = inCell.querySelectorAll("input[name='disease" + qn + "']")

    radios[0].beforeDz = Array.from(inputDisease).filter(i => i.checked).length
  })
  .on('click', function(e) {
    var radios = $(this).find('input[type=radio]')
    radios.prop('checked', !radios[0].turnOff)
  })
}
