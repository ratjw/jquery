
//////////////////////////////// editmode = no scroll ///////////////////////

function swipefinger()
{
	var fingerCount = 0;
	var startX = 0;
	var startY = 0;
	var curX = 0;
	var curY = 0;
	var minLength = 72; // the shortest distance the user may swipe
	var swipeLength = 0;
	var swipeAngle = null;
	var swipeDirection = null;

	if (document.addEventListener) /* Chrome, Safari, Firefox */
	{
		document.addEventListener('touchstart', touchStart, false);
		document.addEventListener('touchmove', touchMove, false);
		document.addEventListener('touchend', touchEnd, false);
		document.addEventListener('touchcancel', touchEnd, false);
	}
	else
	{
		document.ontouchstart = touchStart
		document.ontouchmove = touchMove
		document.ontouchend = touchEnd
		document.ontouchcancel = touchEnd
	}

	// The 4 Touch Event Handlers
	function touchStart(event) {
		// disable the standard ability to select the touched object
//		event.preventDefault();
		// get the total number of fingers touching the screen
		fingerCount = event.touches.length;
		// since we're looking for a swipe (single finger) and not a gesture (multiple fingers),
		// check that only one finger was used
		if ( fingerCount == 1 ) {
			// get the coordinates of the touch
			startX = event.touches[0].pageX;
			startY = event.touches[0].pageY;
		} else {
			// more than one finger touched so cancel
			touchCancel(event);
		}
	}

	function touchMove(event) {
//		event.preventDefault();
		if ( event.touches.length == 1 ) {
			curX = event.touches[0].pageX;
			curY = event.touches[0].pageY;
		} else {
			touchCancel(event);
		}
	}

	function touchEnd(event) {
//		event.preventDefault();
		// check to see if more than one finger was used and that there is an ending coordinate
		if ( fingerCount == 1 && curX != 0 ) {
			// use the Distance Formula to determine the length of the swipe
			swipeLength = Math.round(Math.sqrt(Math.pow(curX - startX,2) + Math.pow(curY - startY,2)));
			// if the user swiped more than the minimum length, perform the appropriate action
			if ( swipeLength >= minLength ) {
				calculateAngle();
				determineSwipeDirection();
				processingRoutine();
			}
		}
		touchCancel(event);
	}

	function touchCancel(event) {
		// reset the variables back to default values
		fingerCount = 0;
		startX = 0;
		startY = 0;
		curX = 0;
		curY = 0;
		swipeLength = 0;
		swipeAngle = null;
		swipeDirection = null;
	}

	function calculateAngle() {
		var X = curX-startX;
		var Y = startY-curY; //screen Y-axis is reversed
		var r = Math.atan2(Y,X); //angle in radians (Cartesian system)
		swipeAngle = Math.round(r*180/Math.PI); //angle in degrees
		if ( swipeAngle < 0 ) { swipeAngle =  360 + swipeAngle }
	}

	function determineSwipeDirection() {
		if ( (swipeAngle >= 45) && (swipeAngle < 135) ) {
			swipeDirection = 'up';
		} else if ( (swipeAngle >= 135) && (swipeAngle < 225) ) {
			swipeDirection = 'left';
		} else if ( (swipeAngle >= 225) && (swipeAngle < 315) ) {
			swipeDirection = 'down';
		} else {
			swipeDirection = 'right';
		}
	}

	function processingRoutine() {
		if (document.getElementById("editmode") == null)	//prevent fillup when editing
		{
			if (STATE[0] == "FILLUP")
			{ 
				var tableheight = document.getElementById("tbl").offsetHeight
				var scrolly = Yscrolled()
				if ((swipeDirection == 'down') && (scrolly == 0))
				{
					fillupscroll(-1)
				}
				else if ((swipeDirection == 'up') && (tableheight <= $(window).height() + scrolly))
				{
					fillupscroll(+1)
				}
			}
		}
	}
}

function initMouseWheel()
{
	// cross-browser wheel delta
	if (document.addEventListener)
	{
		// IE9, Chrome, Safari, Opera
		document.addEventListener("mousewheel", MouseWheelHandler, false);
		// Firefox
		document.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
	}
	else 
	{
		// IE 6/7/8
		document.attachEvent("onmousewheel", MouseWheelHandler);
	}
}

function MouseWheelHandler(e) 
{
	var delta
	var tableheight = document.getElementById("tbl").offsetHeight
	var scrolly = Yscrolled()

	e = window.event || e	 // old IE support
	delta = Math.max(-1, Math.min(1, (-e.wheelDelta || e.detail)))

	if (STATE[0] == "FILLUP")
	{ 
		if ((delta == -1) && (scrolly == 0))
		{
			fillupscroll(delta)
		}
		else if ((delta == +1) && (tableheight <= window.innerHeight + scrolly))
		{
			fillupscroll(delta)
		}
	}
}

function scrollUpDown()
{
	var tableheight = document.getElementById("tbl").offsetHeight
	var scrolly = Yscrolled()

	if (STATE[0] == "FILLUP")
	{ 
		if ($(window).scrollTop() < 10)
		{
			fillupscroll(-1)
		}
		else if (tableheight <= window.innerHeight + scrolly)
		{
			fillupscroll(+1)
		}
	}
}
