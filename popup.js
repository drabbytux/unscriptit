/*
	POPUP.JS
	Does the tasks inside the clicking and switching
*/
var glDomains;
var specialScripts;

// create object to store listener functions for explicit instance removal
let funcs = {};

function fetchDomains(extDomains) {
  glDomains = extDomains;
	var isItChecked;

	// Get from Chrome Storage
	chrome.storage.sync.get(['appdomains'], function(stored_items) {
		$(".status").css({ display: "block" });
		$(".status").html('<div>');
		if( $.isArray( extDomains['domains'] ) && extDomains['domains'].length >= 1 ) {
      $(".status").append('<h4>Scripts found</h4>');
      $.each(extDomains['domains'], function(e, x) {
	      isItChecked = 'checked';
	      $(".status").append(
		      '<label class="switch"><input type="checkbox" class="domain-list-item" '
		      + isItChecked + ' id="' + e
		      + '"><div class="slider round"></div></label> ' + x + '<br>'
	      );
      });
		} else {
			$(".status").append('No app domains found.');
		}
		$(".status").append("</div>");
	});

	// Set the fetched domains into the chrome storage
	chrome.storage.sync.set( {'appdomains' : glDomains });
}

// function to add domains to disabled list in storage
function storeDisabledDomains(){
  chrome.storage.sync.set( {'disabledDomains' : funcs });
}

// function to reload page whenever necessary
function reloadPage(){
  // before re-loading, set the app icon badge to show the number of blocked scripts
  let numFuncs = Object.keys(funcs).length;
  if (numFuncs > 0) {
    chrome.browserAction.setBadgeBackgroundColor({color:"red"});
    chrome.browserAction.setBadgeText({text:numFuncs.toString()});
  } else {
    chrome.browserAction.setBadgeText({text:""});
  }
  chrome.tabs.getSelected(null, function(tab) {
    var code = 'window.location.reload();';
    chrome.tabs.executeScript(tab.id, {code: code});
  });
}

function blockStoredDomains(){
	chrome.storage.sync.get(['appdomains'], function(items) {
		if(items.appdomains){
			for (let i = 0; i < items.appdomains['domains'].length; i++) {
        // create a unique function name for each script
				let funcName = 'startBlocking' + i;
        // if the function doesn't already exist in the disabled script object (funcs) add it
				if ( !(funcName in funcs) ) {
					 funcs[funcName] = function (info) {
					  return {cancel: true};
					 };
           // add the new listener with function and script domain to the extension
			     let urlString = '*://'+items.appdomains['domains'][i]+'/*';
					 chrome.webRequest.onBeforeRequest.addListener(
					  funcs[funcName],
					  {urls: [urlString]},
					  ["blocking"]
					);
			  }
			}
      // update the stored disabled domains list
      storeDisabledDomains();
      // RELOAD the page after everything is done...
      reloadPage();
		}
	});
}

function unblockStoredDomains(){
	chrome.storage.sync.get(['appdomains'], function(items) {
    if(items.appdomains){
	    for (let i = 0; i < items.appdomains['domains'].length; i++) {
        // set a unique function name for each script on the store
		    let funcName = 'startBlocking' + i;
        // remove all listeners
		    chrome.webRequest.onBeforeRequest.removeListener( funcs[funcName] );
        // delete any disabled functions that may have been in the disabled script object (funcs)
		    if (funcName in funcs) {
		      delete funcs[funcName];
		    }
	    }
      // update the stored disabled domains list
      storeDisabledDomains();
      // RELOAD the page after everything is done...
      reloadPage();
    }
	});
}

function blockDomain(i){
	chrome.storage.sync.get(['appdomains'], function(items) {
	  if(items.appdomains){
      // set a unique function name for the requested script using its id number
			let funcName = 'startBlocking' + i;
      // add the function to the disabled functions object
			funcs[funcName] = function (info) {
				return {cancel: true};
			};
      // update the stored disabled domains list
			storeDisabledDomains();
      // add the new listener with function and script domain to the extension
	    let urlString = '*://'+items.appdomains['domains'][i]+'/*';
      chrome.webRequest.onBeforeRequest.addListener(
				funcs[funcName],
				{urls: [urlString]},
				["blocking"]
			);
      // RELOAD the page after everything is done...
      reloadPage();
	  }
	});
}

function unblockDomain(i){
      // set a unique function name for the requested script using its id number
			let funcName = 'startBlocking' + i;
      // remove the function's listener
      chrome.webRequest.onBeforeRequest.removeListener( funcs[funcName]);
      // delete the function from the disabled domains object
      if (funcName in funcs) {
        delete funcs[funcName];
      }
      // update the stored disabled domains list
      storeDisabledDomains();
      // RELOAD the page after everything is done...
      reloadPage();
}

$( function() {
	$('#workingstatus').css( {display: "none"} );
	// Generate the domain list
	chrome.tabs.query( {active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage( tabs[0].id, { action: "generateLinks" }, fetchDomains);
	});

	/*
		STOP and START ALL
	*/
	$('.main-content').on('click', '.btn', function() {
		// Display some things to let them know SOMETHING is going on...
		$('#workingstatus').css( {display: "block"} );
    if (this.id === 'StopAll') {
      $('#domainform :checkbox').prop("checked", false);
		  // Get existing Domain lists and block em
		  blockStoredDomains();
    } else if (this.id === 'StartAll') {
      $('#domainform :checkbox').prop("checked", true);
		  // Get existing Domain lists and unblock em
		  unblockStoredDomains();
    } else {
      return;
    }
		$('#workingstatus').css( {display: "none"} );
	});

  /*
	  TOGGLE switches
  */
	$('#domainform').on('change', ':checkbox', function () {
    $('#workingstatus').css( {display: "block"} );
	  if ($(this).prop('checked')) {
      // Unblock the domain at the provided index of appdomains domain array
      // (appdomain index is pulled from toggle ID attribute)
      unblockDomain(this.id);
	  } else {
      // Block the domain at the provided index of appdomains domain array
      // (appdomain index is pulled from toggle ID attribute)
      blockDomain(this.id);
	  }
    $('#workingstatus').css( {display: "none"} );
  });
});
