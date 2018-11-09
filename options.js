
function setBodyHeightWidth(){
    let width=window.innerWidth;
    let height=window.innerHeight;
    height -= 20; //Adjust for Save button and horizontal scroll bar
    //document.body.style.width=width; //Does not work
    //document.body.style.height=height; //Does not work
    document.body.setAttribute('style','height:' + height + 'px;width:' + width + 'px;');
}

function onDOMLoaded(){
    setBodyHeightWidth();
    //Anything else you need to do here.
}

document.addEventListener('DOMContentLoaded', onDOMLoaded);
/*
$(function() {

	chrome.storage.sync.get('goal', function( items ) {
		$('#Goal').val(items.goal);
	});

	$('#Save').click( function() {

		var goal = $('#Goal').val();
		if(goal){

			chrome.storage.sync.set( {'goal' : goal }, function() { 
				close();
			});
		}
	});

	$('#Reset').click( function() {
		chrome.storage.sync.set( { 'total': 0 }, function(){
			var opt = {
				type: "basic",
				title: "Total reset!",
				message: "Total has been reset back to zero.",
				iconUrl: "images/icon48.png"
			}
			chrome.notifications.create('reset', opt, function(){ });
		});
	});

});
*/