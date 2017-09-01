/*
 * jQuery File Upload Plugin JS Example
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

/* global $, window */

$(function () {
    'use strict';

    // Initialize the jQuery File Upload widget:
    $('#fileupload').fileupload({
        // Uncomment the following to send cross-domain cookies:
        //xhrFields: {withCredentials: true},
        url: 'server/php/',
		maxChunkSize: 2000000, // 2 MB
		add: function (e, data) {
			var that = this;
			$.getJSON('server/php/', {file: data.files[0].name}, function (result) {
				var file = result.file;
				data.uploadedBytes = file && file.size;
				$.blueimp.fileupload.prototype
					.options.add.call(that, e, data);
			});
        }
    });

	// Load existing files:
	$('#fileupload').addClass('fileupload-processing');
	$.ajax({
		// Uncomment the following to send cross-domain cookies:
		//xhrFields: {withCredentials: true},
		//hn is a global variable from index.html
		//sent to PHP along with url by GET method
		//if standalone, no hn to be sent 
		url: $('#fileupload').fileupload('option', 'url') + (hn? ('?hn=' + hn) : ""),
		dataType: 'json',
		context: $('#fileupload')[0]
	}).always(function () {
		$(this).removeClass('fileupload-processing');
	}).done(function (result) {
		$(this).fileupload('option', 'done')
			.call(this, $.Event('done'), {result: result});
	});
});
