
export function PACS(hn) { 
	let pacs = 'http://synapse/explore.asp?path=/All Patients/InternalPatientUID='+hn,
		ua = window.navigator.userAgent,
		msie = ua.indexOf("MSIE"),
		edge = ua.indexOf("Edge"),
		IE = navigator.userAgent.match(/Trident.*rv\:11\./),

		// Chrome, FF send html for download and open by default browser (IE)
		// The html contains javascript to open a window with PACS url
		data_type = 'data:application/vnd.ms-internet explorer',
		openMSIE = function () {
			let html = '<!DOCTYPE html><HTML><HEAD><script>function opener(){window.open("'
					 + pacs
					 + '", "_self")}</script><body onload="opener()"></body></HEAD></HTML>',
				a = document.createElement('a');
			document.body.appendChild(a);  // You need to add this line in FF
			a.href = data_type + ', ' + encodeURIComponent(html);
			a.download = "index.html"
			a.click()
		};

	(msie > 0 || edge > 0 || IE) ? window.open(pacs) : openMSIE()
}
