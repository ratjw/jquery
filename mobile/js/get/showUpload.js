
// hnName is a pre-defined letiable in child window (Upload)
// uploadWindow is to be replaced by new window, used for showUpload only
let uploadWindow = null

export function showUpload(hn, patient) {
	uploadWindow && !uploadWindow.closed && uploadWindow.close();
	uploadWindow = window.open("../Upload/index.html", "_blank")
	uploadWindow.hnName = {"hn": hn, "patient": patient}
}
