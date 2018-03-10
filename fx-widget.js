;(function() {
	// Localize jQuery variable
	var jQuery;

	// Load jQuery if not present
	if (window.jQuery === undefined || window.jQuery.fn.jquery !== '1.11.3') {
		var script_tag = document.createElement('script');
		script_tag.setAttribute("type","text/javascript");
		script_tag.setAttribute("src",
			"https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js");
		if (script_tag.readyState) {
			// For old versions of IE
			script_tag.onreadystatechange = function () {
				if (this.readyState == 'complete' || this.readyState == 'loaded') {
					scriptLoadHandler();
				}
			};
		} else {
			script_tag.onload = scriptLoadHandler;
		}

		// Try to find the head, otherwise default to the documentElement
		(document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
	} else {
		// The jQuery version on the window is the one we want to use
		jQuery = window.jQuery;
		loadCurrencyWidget();
	}

	// Called after jQuery has loaded
	function scriptLoadHandler() {
		// Restore $ and window.jQuery to their previous values and store the
		// new jQuery in our local jQuery variable
		jQuery = window.jQuery.noConflict(true);
		// Call our main function
		loadCurrencyWidget(); 
	}

	// Our main function
	function loadCurrencyWidget() { 
		jQuery(document).ready(function($) {
			BASE_URL = "https://www.warrenasia.com/widgets/fx/";
			// Load CSS
			var css_link = $("<link>", { 
				rel: "stylesheet", 
				type: "text/css", 
				href: BASE_URL+"fx-widget.css"
			});
			css_link.appendTo('head');

			// Get an array of key=value strings of params
			var pa = $('#fxcwJS').attr('src').split("#").pop().split("&");
			// Split each key=value into array, the construct js object
			var p = {};
			for(var j=0; j<pa.length; j++) {
				var kv = pa[j].split("=");
				p[kv[0]] = kv[1];
			}

			var jsonp_url = BASE_URL+"fx-widget.php?";
			if (typeof(p['baseValue']) !== 'undefined') {
				jsonp_url += "baseValue="+p['baseValue']+"&";
			}
			if (typeof(p['currencyList']) !== 'undefined') {
				jsonp_url += "currencyList="+p['currencyList']+"&";
			}
			jsonp_url += "callback=?";

			// Load HTML
			$.getJSON(jsonp_url, function(data) {
				$('#forex-widget-container').html(data.html);
				function fxConvert(){
					var rateData = [];
					for(var currencyCode in data.rateData) {
						rateData[currencyCode] = data.rateData[currencyCode];
					}

					baseValue = $('#fxFrom').val().replace(/[^0-9\.]+/g,'');
					$('#fxFrom').val(baseValue);
					if (!isNaN(p['precision'])) {
						precision = p['precision'];
					} else {
						precision = 2; // Default precision
					}
					for(var key in rateData) {
						$('#fx'+key).text((baseValue*rateData[key]).toFixed(precision));
					}
				}

				// Initialize currencies
				fxConvert();

				// Update all currencies when base value changes
				$('#fxFrom').keyup(function(){
					fxConvert();
				});
			});
		});
	}
})(); // Call anonymous function immediately