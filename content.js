/*
Content.js
Working in the DOM here!
*/

var arrDomainsToIgnore = ['cdn.shopify.com', 'ajax.googleapis.com'];


chrome.runtime.onMessage.addListener( function( request, sender, sendResponse ){
	if( request.action=="generateLinks"){
		$(".site-header__logo-link").append('-TEST');
		sendResponse({ domains: scrapePageForAppURLS() });
	}
});

chrome.runtime.sendMessage({ action: "show" });



function scrapePageForAppURLS(){
	var firstHref = "";
	var pat = '^([a-z]*//)[^/]*([^./]+\\.[^./]+)';
	var arrExternalDomains = [];
	var arrRemoveDuplicates = [];
	var arrSpecialScripts = [];

	/* This section just looks for script tags and fetches the src url from them */
	$( "script[src]" ).each(function( index ) {
		domain = $( this ).attr("src").split('/')[2];
		if (domain)
	    	arrExternalDomains.push( domain );
	});

	/* This section looks for meta data containing URLS that some apps use */
	var urlMatch = [];
	$( "script" ).each( function( index ) {
		if( $( this ).html().match(/var urls/g) ){
			urlMatch.push( $( this ).html().match(/[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/g) );
		}

	});

	// Gather the URLS -----------------------
	$.each(arrExternalDomains, function(i, el){
		if( $.inArray(el, arrDomainsToIgnore ) < 0 ) {
			if($.inArray(el, arrRemoveDuplicates) === -1) {
				arrRemoveDuplicates.push(el);
			}
		}
	});
	return arrRemoveDuplicates;
}
