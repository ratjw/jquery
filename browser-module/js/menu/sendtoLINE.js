
import { USER } from "../main.js"

const LINEBOT	= "line/lineBot.php"
const LINENOTIFY = "line/lineNotify.php"

export function sendtoLINE()
{
  $('#dialogNotify').dialog({
    title: `<img src="css/pic/general/linenotify.png" width="40" style="float:left">
            <span style="font-size:20px">Qbook: ${USER}</span>`,
    closeOnEscape: true,
    modal: true,
    show: 200,
    hide: 200,
    width: 270,
    height: 300
  })
}

export function toLINE()
{
  let capture = document.querySelector("#capture")
  let $capture = $("#capture")
  let $captureTRs = $capture.find('tr')
  let $selected = $(".selected")
  let row = ""
  let hide = [1, 3, 4, 12]
  let $dialogNotify = $('#dialogNotify')
  let message


  message = $dialogNotify.find('textarea').val()
  $dialogNotify.dialog('close')

  $captureTRs.slice(1).remove()
  $capture.show()
  $.each($selected, function() {
    $capture.find("tbody").append($(this).clone())
  })
  $captureTRs = $capture.find('tr')
  $captureTRs.removeClass('selected lastselected')

  hide.forEach(function(i) {
    $.each($captureTRs, function() {
      this.cells[i].style.display = 'none'
    })
  })

  html2canvas(capture).then(function(canvas) {
    $.post(LINENOTIFY, {
        'user': USER,
        'message': message,
        'image': canvas.toDataURL('image/png', 1.0)
    })
    $capture.hide()
  })
}
