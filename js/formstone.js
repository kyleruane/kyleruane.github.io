
/**
 * @plugin
 * @name Core
 * @description Formstone Library core. Required for all plugins.
 */

var Formstone = this.Formstone = (function ($, window, document, undefined) {

	/* global ga */

	"use strict";

	// Namespace

	var Core = function() {
			this.Plugins = {};
			this.ResizeHandlers = [];

			// Globals

			this.window               = window;
			this.$window              = $(window);
			this.document             = document;
			this.$document            = $(document);
			this.$body                = null;

			this.windowWidth          = 0;
			this.windowHeight         = 0;
			this.userAgent            = window.navigator.userAgent || window.navigator.vendor || window.opera;
			this.isFirefox            = /Firefox/i.test(this.userAgent);
			this.isChrome             = /Chrome/i.test(this.userAgent);
			this.isSafari             = /Safari/i.test(this.userAgent) && !this.isChrome;
			this.isMobile             = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test( this.userAgent );
			this.isFirefoxMobile      = (this.isFirefox && this.isMobile);
			this.transform            = null;
			this.transition           = null;

			this.support = {
				file          : !!(window.File && window.FileList && window.FileReader),
				history       : !!(window.history && window.history.pushState && window.history.replaceState),
				matchMedia    : !!(window.matchMedia || window.msMatchMedia),
				raf           : !!(window.requestAnimationFrame && window.cancelAnimationFrame),
				touch         : !!(("ontouchstart" in window) || window.DocumentTouch && document instanceof window.DocumentTouch),
				transition    : false,
				transform     : false
			};
		},

		Functions = {

			/**
			 * @method private
			 * @name killEvent
			 * @description Stops event action and bubble.
			 * @param e [object] "Event data"
			 */

			killEvent: function(e, immediate) {
				try {
					e.preventDefault();
					e.stopPropagation();

					if (immediate) {
						e.stopImmediatePropagation();
					}
				} catch(error) {
					//
				}
			},

			/**
			 * @method private
			 * @name startTimer
			 * @description Starts an internal timer.
			 * @param timer [int] "Timer ID"
			 * @param time [int] "Time until execution"
			 * @param callback [function] "Function to execute"
			 * @return [int] "Timer ID"
			 */

			startTimer: function(timer, time, callback, interval) {
				Functions.clearTimer(timer);

				return (interval) ? setInterval(callback, time) : setTimeout(callback, time);
			},

			/**
			 * @method private
			 * @name clearTimer
			 * @description Clears an internal timer.
			 * @param timer [int] "Timer ID"
			 */

			clearTimer: function(timer, interval) {
				if (timer) {
					if (interval) {
						clearInterval(timer);
					} else {
						clearTimeout(timer);
					}

					timer = null;
				}
			},

			/**
			 * @method private
			 * @name sortAsc
			 * @description Sorts an array (ascending).
			 * @param a [mixed] "First value"
			 * @param b [mixed] "Second value"
			 * @return Difference between second and first values
			 */

			sortAsc: function(a, b) {
				return (parseInt(b) - parseInt(a));
			},

			/**
			 * @method private
			 * @name sortDesc
			 * @description Sorts an array (descending).
			 * @param a [mixed] "First value"
			 * @param b [mixed] "Second value"
			 * @return Difference between second and first values
			 */

			sortDesc: function(a, b) {
				return (parseInt(b) - parseInt(a));
			}
		},

		Formstone = new Core(),

		// Classes

		Classes = {
			base                 : "{ns}",
			element              : "{ns}-element"
		},

		// Events

		Events = {
			namespace            : ".{ns}",
			blur                 : "blur.{ns}",
			change               : "change.{ns}",
			click                : "click.{ns}",
			dblClick             : "dblclick.{ns}",
			drag                 : "drag.{ns}",
			dragEnd              : "dragend.{ns}",
			dragEnter            : "dragenter.{ns}",
			dragLeave            : "dragleave.{ns}",
			dragOver             : "dragover.{ns}",
			dragStart            : "dragstart.{ns}",
			drop                 : "drop.{ns}",
			error                : "error.{ns}",
			focus                : "focus.{ns}",
			focusIn              : "focusin.{ns}",
			focusOut             : "focusout.{ns}",
			input                : "input.{ns}",
			keyDown              : "keydown.{ns}",
			keyPress             : "keypress.{ns}",
			keyUp                : "keyup.{ns}",
			load                 : "load.{ns}",
			mouseDown            : "mousedown.{ns}",
			mouseEnter           : "mouseenter.{ns}",
			mouseLeave           : "mouseleave.{ns}",
			mouseMove            : "mousemove.{ns}",
			mouseOut             : "mouseout.{ns}",
			mouseOver            : "mouseover.{ns}",
			mouseUp              : "mouseup.{ns}",
			resize               : "resize.{ns}",
			scroll               : "scroll.{ns}",
			select               : "select.{ns}",
			touchCancel          : "touchcancel.{ns}",
			touchEnd             : "touchend.{ns}",
			touchLeave           : "touchleave.{ns}",
			touchMove            : "touchmove.{ns}",
			touchStart           : "touchstart.{ns}"
		};

	/**
	 * @method
	 * @name Plugin
	 * @description Builds a plugin and registers it with jQuery.
	 * @param namespace [string] "Plugin namespace"
	 * @param settings [object] "Plugin settings"
	 * @return [object] "Plugin properties. Includes `defaults`, `classes`, `events`, `functions`, `methods` and `utilities` keys"
	 * @example Formstone.Plugin("namespace", { ... });
	 */

	Core.prototype.Plugin = function(namespace, settings) {
		Formstone.Plugins[namespace] = (function(namespace, settings) {

			var namespaceDash = "fs-" + namespace,
				namespaceDot  = "fs." + namespace;

			/**
			 * @method private
			 * @name initialize
			 * @description Creates plugin instance by adding base classname, creating data and scoping a _construct call.
			 * @param options [object] <{}> "Instance options"
			 */

			function initialize(options) {
				// Extend Defaults

				var hasOptions = $.type(options) === "object";

				options = $.extend(true, {}, settings.defaults || {}, (hasOptions ? options : {}));

				// Maintain Chain

				var $targets = this;

				for (var i = 0, count = $targets.length; i < count; i++) {
					var $element = $targets.eq(i);

					// Gaurd Against Exiting Instances

					if (!getData($element)) {

						// Extend w/ Local Options

						var localOptions = $element.data(namespace + "-options"),
							data = $.extend(true, {
								$el : $element
							}, options, ($.type(localOptions) === "object" ? localOptions : {}) );

						// Cache Instance

						$element.addClass(settings.classes.raw.element)
						        .data(namespaceDash, data);

						// Constructor

						settings.methods._construct.apply($element, [ data ].concat(Array.prototype.slice.call(arguments, (hasOptions ? 1 : 0) )));
					}

				}

				return $targets;
			}

			/**
			 * @method private
			 * @name destroy
			 * @description Removes plugin instance by scoping a _destruct call, and removing the base classname and data.
			 * @param data [object] <{}> "Instance data"
			 */

			/**
			 * @method widget
			 * @name destroy
			 * @description Removes plugin instance.
			 * @example $(".target").{ns}("destroy");
			 */

			function destroy(data) {
				settings.functions.iterate.apply(this, [ settings.methods._destruct ].concat(Array.prototype.slice.call(arguments, 1)));

				this.removeClass(settings.classes.raw.element)
					.removeData(namespaceDash);
			}

			/**
			 * @method private
			 * @name getData
			 * @description Creates class selector from text.
			 * @param $element [jQuery] "Target jQuery object"
			 * @return [object] "Instance data"
			 */

			function getData($element) {
				return $element.data(namespaceDash);
			}

			/**
			 * @method private
			 * @name delegateWidget
			 * @description Delegates public methods.
			 * @param method [string] "Method to execute"
			 * @return [jQuery] "jQuery object"
			 */

			function delegateWidget(method) {

				// If jQuery object

				if (this instanceof $) {

					var _method = settings.methods[method];

					// Public method OR false

					if ($.type(method) === "object" || !method) {

						// Initialize

						return initialize.apply(this, arguments);
					} else if (_method && method.indexOf("_") !== 0) {

						// Wrap Public Methods

						return settings.functions.iterate.apply(this, [ _method ].concat(Array.prototype.slice.call(arguments, 1)));
					}

					return this;
				}
			}

			/**
			 * @method private
			 * @name delegateUtility
			 * @description Delegates utility methods.
			 * @param method [string] "Method to execute"
			 */

			function delegateUtility(method) {

				// public utility OR utility init OR false

				var _method = settings.utilities[method] || settings.utilities._initialize || false;

				if (_method) {

					// Wrap Utility Methods

					return _method.apply(window, Array.prototype.slice.call(arguments, ($.type(method) === "object" ? 0 : 1) ));
				}
			}

			/**
			 * @method utility
			 * @name defaults
			 * @description Extends plugin default settings; effects instances created hereafter.
			 * @param options [object] <{}> "New plugin defaults"
			 * @example $.{ns}("defaults", { ... });
			 */

			function defaults(options) {
				settings.defaults = $.extend(true, settings.defaults, options || {});
			}

			/**
			 * @method private
			 * @name iterate
			 * @description Loops scoped function calls over jQuery object with instance data as first parameter.
			 * @param func [function] "Function to execute"
			 * @return [jQuery] "jQuery object"
			 */

			function iterate(fn) {
				var $targets = this;

				for (var i = 0, count = $targets.length; i < count; i++) {
					var $element = $targets.eq(i),
						data = getData($element) || {};

					if ($.type(data.$el) !== "undefined") {
						fn.apply($element, [ data ].concat(Array.prototype.slice.call(arguments, 1)));
					}
				}

				return $targets;
			}

			// Locals

			settings.initialized = false;
			settings.priority    = settings.priority || 10;

			// Namespace Classes & Events

			settings.classes   = namespaceProperties("classes", namespaceDash, Classes, settings.classes);
			settings.events    = namespaceProperties("events",  namespace,     Events,  settings.events);

			// Extend Functions

			settings.functions = $.extend({
				getData    : getData,
				iterate    : iterate
			}, Functions, settings.functions);

			// Extend Methods

			settings.methods = $.extend(true, {

				// Private Methods

				_setup         : $.noop,    // Document ready
				_construct     : $.noop,    // Constructor
				_destruct      : $.noop,    // Destructor
				_resize        : false,    // Window resize

				// Public Methods

				destroy        : destroy

			}, settings.methods);

			// Extend Utilities

			settings.utilities = $.extend(true, {

				// Private Utilities

				_initialize    : false,    // First Run
				_delegate      : false,    // Custom Delegation

				// Public Utilities

				defaults       : defaults

			}, settings.utilities);

			// Register Plugin

			// Widget

			if (settings.widget) {

				// Widget Delegation: $(".target").plugin("method", ...);
				$.fn[namespace] = delegateWidget;
			}

			// Utility

				// Utility Delegation: $.plugin("method", ... );
				$[namespace] = settings.utilities._delegate || delegateUtility;

			// Run Setup

			settings.namespace = namespace;

			// Resize handler

			if (settings.methods._resize) {
				Formstone.ResizeHandlers.push({
					namespace: namespace,
					priority: settings.priority,
					callback: settings.methods._resize
				});

				// Sort handlers on push
				Formstone.ResizeHandlers.sort(sortPriority);
			}

			return settings;
		})(namespace, settings);

		return Formstone.Plugins[namespace];
	};

	// Namespace Properties

	function namespaceProperties(type, namespace, globalProps, customProps) {
		var _props = {
				raw: {}
			},
			i;

		customProps = customProps || {};

		for (i in customProps) {
			if (customProps.hasOwnProperty(i)) {
				if (type === "classes") {

					// Custom classes
					_props.raw[ customProps[i] ] = namespace + "-" + customProps[i];
					_props[ customProps[i] ]     = "." + namespace + "-" + customProps[i];
				} else {
					// Custom events
					_props.raw[ i ] = customProps[i];
					_props[ i ]     = customProps[i] + "." + namespace;
				}
			}
		}

		for (i in globalProps) {
			if (globalProps.hasOwnProperty(i)) {
				if (type === "classes") {

					// Global classes
					_props.raw[ i ] = globalProps[i].replace(/{ns}/g, namespace);
					_props[ i ]     = globalProps[i].replace(/{ns}/g, "." + namespace);
				} else {
					// Global events
					_props.raw[ i ] = globalProps[i].replace(/.{ns}/g, "");
					_props[ i ]     = globalProps[i].replace(/{ns}/g, namespace);
				}
			}
		}

		return _props;
	}

	// Set Transition Information

	function setTransitionInformation() {
		var transitionEvents = {
				"transition"          : "transitionend",
				"MozTransition"       : "transitionend",
				"OTransition"         : "otransitionend",
				"WebkitTransition"    : "webkitTransitionEnd"
			},
			transitionProperties = [
				"transition",
				"-webkit-transition"
			],
			transformProperties = {
				'transform'          : 'transform',
				'MozTransform'       : '-moz-transform',
				'OTransform'         : '-o-transform',
				'msTransform'        : '-ms-transform',
				'webkitTransform'    : '-webkit-transform'
			},
			transitionEvent       = "transitionend",
			transitionProperty    = "",
			transformProperty     = "",
			test                  = document.createElement("div"),
			i;


		for (i in transitionEvents) {
			if (transitionEvents.hasOwnProperty(i) && i in test.style) {
				transitionEvent = transitionEvents[i];
				Formstone.support.transition = true;
				break;
			}
		}

		Events.transitionEnd = transitionEvent + ".{ns}";

		for (i in transitionProperties) {
			if (transitionProperties.hasOwnProperty(i) && transitionProperties[i] in test.style) {
				transitionProperty = transitionProperties[i];
				break;
			}
		}

		Formstone.transition = transitionProperty;

		for (i in transformProperties) {
			if (transformProperties.hasOwnProperty(i) && transformProperties[i] in test.style) {
				Formstone.support.transform = true;
				transformProperty = transformProperties[i];
				break;
			}
		}

		Formstone.transform = transformProperty;
	}

	// Window resize

	var ResizeTimer = null,
		Debounce = 20;

	function onWindowResize() {
		Formstone.windowWidth  = Formstone.$window.width();
		Formstone.windowHeight = Formstone.$window.height();

		ResizeTimer = Functions.startTimer(ResizeTimer, Debounce, handleWindowResize);
	}

	function handleWindowResize() {
		for (var i in Formstone.ResizeHandlers) {
			if (Formstone.ResizeHandlers.hasOwnProperty(i)) {
				Formstone.ResizeHandlers[i].callback.call(window, Formstone.windowWidth, Formstone.windowHeight);
			}
		}
	}

	Formstone.$window.on("resize.fs", onWindowResize);
	onWindowResize();

	// Sort Priority

	function sortPriority(a, b) {
		return (parseInt(a.priority) - parseInt(b.priority));
	}

	// Document Ready

	$(function() {
		Formstone.$body = $("body");

		for (var i in Formstone.Plugins) {
			if (Formstone.Plugins.hasOwnProperty(i) && !Formstone.Plugins[i].initialized) {
				Formstone.Plugins[i].methods._setup.call(document);
				Formstone.Plugins[i].initialized = true;
			}
		}
	});

	// Custom Events

	Events.clickTouchStart = Events.click + " " + Events.touchStart;

	// Transitions

	setTransitionInformation();

	return Formstone;

})(jQuery, this, document);
;(function ($, Formstone, undefined) {

	/* global ga */

	"use strict";
	/**
	 * @method private
	 * @name initialize
	 * @description Initializes plugin.
	 * @param opts [object] "Plugin options"
	 */

	function initialize(options) {
		if (Instance) {
			return;
		}

		// Check for push/pop support
		if (!Formstone.support.history) {
			return;
		}

		$Body = Formstone.$body;

		Instance = $.extend(Defaults, options);

		Instance.$container = $(Instance.container);

		if (Instance.render === $.noop) {
			Instance.render = renderState;
		}

		if (Instance.transitionOut === $.noop) {
			Instance.transitionOut = function() {
				return $.Deferred().resolve();
			};
		}

		// Capture current url & state
		CurrentURL = window.location.href;

		// Set initial state
		// saveState();

		// Bind state events
		$Window.on(Events.popState, onPop);

		enable();
	}

	/**
	 * @method private
	 * @name disable
	 * @description Disable ASAP
	 * @example $.asap("enable");
	 */

	function disable() {
		if ($Body && $Body.hasClass(RawClasses.base)) {
			$Body.off(Events.click)
				 .removeClass(RawClasses.base);
		}
	}

	/**
	 * @method private
	 * @name enable
	 * @description Enables ASAP
	 * @example $.asap("enable");
	 */

	function enable() {
		if ($Body && !$Body.hasClass(RawClasses.base)) {
			$Body.on(Events.click, Defaults.selector, onClick)
				 .addClass(RawClasses.base);
		}
	}

	/**
	 * @method
	 * @name load
	 * @description Loads new page
	 * @param opts [url] <''> "URL to load"
	 * @example $.asap("load", "http://website.com/page/");
	 */

	/**
	 * @method private
	 * @name load
	 * @description Loads new page
	 * @param opts [url] <''> "URL to load"
	 */

	function load(url) {
		if (!Instance || !Formstone.support.history) {
			window.location.href = url;
		} else if (url) {
			requestURL(url);
		}

		return;
	}

	/**
	 * @method private
	 * @name onClick
	 * @description Handles click events
	 * @param e [object] "Event data"
	 */

	function onClick(e) {
		var url = e.currentTarget;

		// Ignore everything but normal click
		if (  (e.which > 1 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) || (window.location.protocol !== url.protocol || window.location.host !== url.host) || url.target === "_blank" ) {
			return;
		}

		// Update state on hash change
		if (url.hash && (url.href.replace(url.hash, "") === window.location.href.replace(location.hash, "") || url.href === window.location.href + "#")) {
			// saveState();
			return;
		}

		Functions.killEvent(e);
		e.stopImmediatePropagation();

		if (url.href === CurrentURL) {
			// saveState();
		} else {
			requestURL(url.href);
		}
	}

	/**
	 * @method private
	 * @name onPop
	 * @description Handles history navigation events
	 * @param e [object] "Event data"
	 */

	function onPop(e) {
		var data = e.originalEvent.state;

		if (data) {
			if (Instance.modal && Visited === 0 && data.url && !data.initial) {
				// If opening content in a 'modal', return to original page on reload->back
				window.location.href = data.url;
			} else {
				// Check if data exists
				if (data.url !== CurrentURL) {
					if (Instance.force) {
						// Force a new request, even if navigating back
						requestURL(data.url);
					} else {
						// Fire request event
						$Window.trigger(Events.request, [ true ]);

						process(data.url, data.hash, data.data, data.scroll, false);
					}
				}
			}
		}
	}

	/**
	 * @method private
	 * @name requestURL
	 * @description Requests new content via AJAX
	 * @param url [string] "URL to load"
	 */

	function requestURL(url) {
		if (Request) {
			Request.abort();
		}

		// Fire request event
		$Window.trigger(Events.request, [ false ]);

		// Get transition out deferred
		Instance.transitionOutDeferred = Instance.transitionOut.apply(Window, [ false ]);

		var queryIndex = url.indexOf("?"),
			hashIndex  = url.indexOf("#"),
			data       = {},
			hash       = "",
			cleanURL   = url,
			error      = "User error",
			response   = null,
			requestDeferred = $.Deferred();

		if (hashIndex > -1) {
			hash = url.slice(hashIndex);
			cleanURL = url.slice(0, hashIndex);
		}

		if (queryIndex > -1) {
			data = getQueryParams( url.slice(queryIndex + 1, ((hashIndex > -1) ? hashIndex : url.length)) );
			cleanURL = url.slice(0, queryIndex);
		}

		data[ Instance.requestKey ] = true;

		// Request new content
		Request = $.ajax({
			url: cleanURL,
			data: data,
			dataType: "json",
			cache: Instance.cache,
			xhr: function() {
				// custom xhr
				var xhr = new Window.XMLHttpRequest();

				/*
				//Upload progress ?
				xhr.upload.addEventListener("progress", function(e) {
					if (e.lengthComputable) {
						var percent = (e.loaded / e.total) / 2;
						$window.trigger(Events.progress, [ percent ]);
					}
				}, false);
				*/

				//Download progress
				xhr.addEventListener("progress", function(e) {
					if (e.lengthComputable) {
						var percent = e.loaded / e.total;
						$Window.trigger(Events.progress, [ percent ]);
					}
				}, false);

				return xhr;
			},
			success: function(resp, status, jqXHR) {
				response  = ($.type(resp) === "string") ? $.parseJSON(resp) : resp;

				// handle redirects - requires passing new location with json response
				if (resp.location) {
					url = resp.location;
				}

				requestDeferred.resolve();
			},
			error: function(jqXHR, status, err) {
				error = err;

				requestDeferred.reject();
			}
		});

		$.when(requestDeferred, Instance.transitionOutDeferred).done(function() {
			process(url, hash, response, (Instance.jump ? 0 : false), true);
		}).fail(function() {
			$Window.trigger(Events.error, [ error ]);
		});
	}

	/**
	 * @method private
	 * @name process
	 * @description Processes a state
	 * @param url [string] "State URL"
	 * @param data [object] "State Data"
	 * @param scrollTop [int] "Current scroll position"
	 * @param doPush [boolean] "Flag to replace or add state"
	 */

	function process(url, hash, data, scrollTop, doPush) {
		// Fire load event
		$Window.trigger(Events.load, [ data ]);

		// Trigger analytics page view
		track(url);

		// Update current state before rendering new state
		saveState(data);

		// Render before updating
		Instance.render.call(this, data, hash);

		// Update current url
		CurrentURL = url;

		if (doPush) {
			// Push new states to the stack
			history.pushState({
				url: CurrentURL,
				data: data,
				scroll: scrollTop,
				hash: hash
			}, "state-" + CurrentURL, CurrentURL);

			Visited++;
		} else {
			// Update state with history data
			saveState(data);
		}

		$Window.trigger(Events.render, [ data ]);

		if (hash !== "") {
			var $el = $(hash);

			if ($el.length) {
				scrollTop = $el.offset().top;
			}
		}

		if (scrollTop !== false) {
			$Window.scrollTop(scrollTop);
		}
	}

	/**
	 * @method private
	 * @name renderState
	 * @description Renders a new state
	 * @param data [object] "State Data"
	 * @param hash [string] "Hash"
	 */

	function renderState(data, hash) {
		// Update DOM
		if ($.type(data) !== "undefined") {
			var $target;

			for (var key in data) {
				if (data.hasOwnProperty(key)) {
					$target = $(key);

					if ($target.length) {
						$target.html(data[key]);
					}
				}
			}
		}
	}

	/**
	 * @method private
	 * @name saveState
	 * @description Saves the current state
	 * @param data [object] "State Data"
	 */

	function saveState(data) {
		var cache = [];

		if ($.type(data) !== "undefined") {
			var $target;

			for (var key in data) {
				if (data.hasOwnProperty(key)) {
					$target = $(key);

					if ($target.length) {
						cache[key] = $target.html();
					}
				}
			}
		}

		// Update state
		history.replaceState({
			url: CurrentURL,
			data: cache,
			scroll: $Window.scrollTop()
		}, "state-" + CurrentURL, CurrentURL);
	}

	/**
	 * @method private
	 * @name unescape
	 * @description Unescapes HTML
	 * @param text [string] "Text to unescape"
	 */

	function unescape(text) {
		return text.replace(/&lt;/g, "<")
				   .replace(/&gt;/g, ">")
				   .replace(/&nbsp;/g, " ")
				   .replace(/&amp;/g, "&")
				   .replace(/&quot;/g, '"')
				   .replace(/&#039;/g, "'");
	}

	/**
	 * @method private
	 * @name track
	 * @description Pushes new page view to the Google Analytics (Legacy or Universal)
	 * @param url [string] "URL to track"
	 */

	function track(url) {
		// Strip domain
		url = url.replace(window.location.protocol + "//" + window.location.host, "");

		if (Instance.tracking.legacy) {
			// Legacy Analytics
			Window._gaq = Window._gaq || [];
			Window._gaq.push(["_trackPageview", url]);
		} else {
			// Universal Analytics
			if (Instance.tracking.manager) {
				// Tag Manager
				var page = {};
				page[Instance.tracking.variable] = url;
				Window.dataLayer = window.dataLayer || [];

				// Push new url to varibale then tracking event
				Window.dataLayer.push(page);
				Window.dataLayer.push({ "event": Instance.tracking.event });
			} else {
				// Basic
				// if ($.type(ga) !== "undefined") {
				// 	ga("send", "pageview", url);
				// }

				// Specific tracker - only needed if using mutiple and/or tag manager
				// var t = ga.getAll();
				// ga(t[0].get('name')+'.send', 'pageview', '/mimeo/');
			}
		}
	}

	/**
	 * @method private
	 * @name getQueryParams
	 * @description Returns keyed object containing all GET query parameters
	 * @param url [string] "URL to parse"
	 * @return [object] "Keyed query params"
	 */

	function getQueryParams(url) {
		var params = {},
			parts = url.slice( url.indexOf("?") + 1 ).split("&");

		for (var i = 0; i < parts.length; i++) {
			var part = parts[i].split("=");
			params[ part[0] ] = part[1];
		}

		return params;
    }

	/**
	 * @plugin
	 * @name ASAP
	 * @description A jQuery plugin for faster page loads.
	 * @type utility
	 * @dependency core.js
	 */

	var Plugin = Formstone.Plugin("asap", {
			utilities: {
				_initialize    : initialize,

				load           : load
			},

			/**
			 * @events
			 * @event request.asap "Before request is made; triggered on window. Second parameter 'true' if pop event"
			 * @event progress.asap "As request is loaded; triggered on window"
			 * @event load.asap "After request is loaded; triggered on window"
			 * @event render.asap "After state is rendered; triggered on window"
			 * @event error.asap "After load error; triggered on window"
			 */

			events: {
				popState    : "popstate",
				request     : "request",
				// load        : "load",
				render      : "render"
				// error       : "error"
			}
		}),

		/**
		 * @options
		 * @param cache [boolean] <true> "Cache AJAX responses"
		 * @param force [boolean] <false> "Forces new requests when navigating back/forward"
		 * @param jump [boolean] <true> "Jump page to top on render"
		 * @param modal [boolean] <false> "Flag for content loaded into modal"
		 * @param selector [string] <'a'> "Target DOM Selector"
		 * @param render [function] <$.noop> "Custom render function"
		 * @param requestKey [string] <'fs-asap'> "GET variable for requests"
		 * @param tracking.legacy [boolean] <false> "Flag for legacy Google Analytics tracking"
		 * @param tracking.manager [boolean] <false> "Flag for Tag Manager tracking"
		 * @param tracking.variable [string] <'currentURL'> "Tag Manager dataLayer variable name (macro in Tag Manager)"
		 * @param tracking.event [string] <'PageView'> "Tag Manager event name (rule in Tag Manager)"
		 * @param transitionOut [function] <$.noop> "Transition timing callback; should return user defined $.Deferred object, which must eventually resolve"
		 */

		Defaults = {
			cache         : true,
			force         : false,
			jump          : true,
			modal         : false,
			selector      : "a",
			render        : $.noop,
			requestKey    : "fs-asap",
			tracking: {
				legacy      : false,        // Use legacy ga code
				manager     : false,        // Use tag manager events
				variable    : "currentURL", // data layer variable name - macro in tag manager
				event       : "PageView"    // event name - rule in tag manager
			},
			transitionOut   : $.noop
		},

		// Localize References

		$Window       = Formstone.$window,
		Window        = $Window[0],
		$Body,

		Functions     = Plugin.functions,
		Events        = Plugin.events,
		RawClasses    = Plugin.classes.raw,

		// Internal

		CurrentURL    = '',
		Visited       = 0,
		Request,
		Instance;

})(jQuery, Formstone);
;(function ($, Formstone, undefined) {

	"use strict";

	/**
	 * @method private
	 * @name resize
	 * @description Handles window resize
	 */

	function resize(windowWidth) {
		Functions.iterate.call($Instances, resizeInstance);
	}

	/**
	 * @method private
	 * @name cacheInstances
	 * @description Caches active instances
	 */

	function cacheInstances() {
		$Instances = $(Classes.base);
	}

	/**
	 * @method private
	 * @name construct
	 * @description Builds instance.
	 * @param data [object] "Instance data"
	 */

	function construct(data) {
		// guid
		data.guid         = "__" + (GUID++);
		data.youTubeGuid  = 0;
		data.eventGuid    = Events.namespace + data.guid;
		data.rawGuid      = RawClasses.base + data.guid;
		data.classGuid    = "." + data.rawGuid;

		data.$container = $('<div class="' + RawClasses.container + '"></div>').appendTo(this);

		this.addClass( [RawClasses.base, data.customClass].join(" ") );

		var source = data.source;
		data.source = null;

		loadMedia(data, source, true);

		cacheInstances();
	}

	/**
	 * @method private
	 * @name destruct
	 * @description Tears down instance.
	 * @param data [object] "Instance data"
	 */

	function destruct(data) {
		data.$container.remove();

		this.removeClass( [RawClasses.base, data.customClass].join(" ") )
			.off(Events.namespace);

		cacheInstances();
	}

	/**
	 * @method
	 * @name load
	 * @description Loads source media
	 * @param source [string OR object] "Source image (string) or video (object) or YouTube (object);"
	 * @example $(".target").background("load", "path/to/image.jpg");
	 */

	/**
	 * @method private
	 * @name loadMedia
	 * @description Determines how to handle source media
	 * @param data [object] "Instance data"
	 * @param source [string OR object] "Source image (string) or video (object)"
	 * @param firstLoad [boolean] "Flag for first load"
	 */

	function loadMedia(data, source, firstLoad) {
		// Check if the source is new
		if (source !== data.source) {
			data.source        = source;
			data.responsive    = false;
			data.isYouTube     = false;

			// Check YouTube
			if ($.type(source) === "object" && $.type(source.video) === "string") {
				// var parts = source.match( /^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/ );
				var parts = source.video.match( /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i );

				if (parts && parts.length >= 1) {
					data.isYouTube = true;
					data.videoId = parts[1];
				}
			}

			if (data.isYouTube) {
				// youtube video
				data.playing = false;
				data.playerReady = false;
				data.posterLoaded = false;

				loadYouTube(data, source, firstLoad);
			} else if ($.type(source) === "object" && source.hasOwnProperty("poster")) {
				// html5 video
				loadVideo(data, source, firstLoad);
			} else {
				var newSource = source;

				// Responsive image handling
				if ($.type(source) === "object") {
					var sources    = {},
						keys       = [],
						i;

					for (i in source) {
						if (source.hasOwnProperty(i)) {
							keys.push(i);
						}
					}

					keys.sort(Functions.sortAsc);

					for (i in keys) {
						if (keys.hasOwnProperty(i)) {
							sources[ keys[i] ] = {
								width    : parseInt( keys[i] ),
								url      : source[ keys[i] ]
							};
						}
					}

					data.responsive = true;
					data.sources = sources;

					newSource = calculateSource(data);
				}

				loadImage(data, newSource, false, firstLoad);
			}
		} else {
			data.$el.trigger(Events.loaded);
		}
	}

	/**
	 * @method private
	 * @name calculateSource
	 * @description Determines responsive source
	 * @param data [object] "Instance data"
	 * @return [string] "New source url"
	 */

	function calculateSource(data) {
		if (data.responsive) {
			for (var i in data.sources) {
				if (data.sources.hasOwnProperty(i) && Formstone.windowWidth >= data.sources[i].width) {
					return data.sources[i].url;
				}
			}
		}

		return data.source;
	}

	/**
	 * @method private
	 * @name loadImage
	 * @description Loads source image
	 * @param data [object] "Instance data",
	 * @param source [string] "Source image"
	 * @param poster [boolean] "Flag for video poster"
	 * @param firstLoad [boolean] "Flag for first load"
	 */

	function loadImage(data, source, poster, firstLoad) {
		var imageClasses = [RawClasses.media, RawClasses.image, (firstLoad !== true ? RawClasses.animated : '')].join(" "),
			$media = $('<div class="' + imageClasses + '"><img></div>'),
			$img = $media.find("img"),
			newSource = source;

		// Load image
		$img.one(Events.load, function() {
			if (BGSupport) {
				$media.addClass(RawClasses.native)
					  .css({ backgroundImage: "url('" + newSource + "')" });
			}

			// YTransition in
			$media.transition({
				property: "opacity"
			},
			function() {
				if (!poster) {
					cleanMedia(data);
				}
			}).css({ opacity: 1 });

			doResizeInstance(data);

			if (!poster || firstLoad) {
				data.$el.trigger(Events.loaded);
			}
		}).attr("src", newSource);

		if (data.responsive) {
			$media.addClass(RawClasses.responsive);
		}

		data.$container.append($media);

		// Check if image is cached
		if ($img[0].complete || $img[0].readyState === 4) {
			$img.trigger(Events.load);
		}

		data.currentSource = newSource;
	}

	/**
	 * @method private
	 * @name loadVideo
	 * @description Loads source video
	 * @param data [object] "Instance data"
	 * @param source [object] "Source video"
	 * @param firstLoad [boolean] "Flag for first load"
	 */

	function loadVideo(data, source, firstLoad) {
		if (data.source && data.source.poster) {
			loadImage(data, data.source.poster, true, true);

			firstLoad = false;
		}

		if (!Formstone.isMobile) {
			var videoClasses = [RawClasses.media, RawClasses.video, (firstLoad !== true ? RawClasses.animated : '')].join(" "),
				html = '<div class="' + videoClasses + '">';

			html += '<video';
			if (data.loop) {
				html += ' loop';
			}
			if (data.mute) {
				html += ' muted';
			}
			html += '>';
			if (data.source.webm) {
				html += '<source src="' + data.source.webm + '" type="video/webm" />';
			}
			if (data.source.mp4) {
				html += '<source src="' + data.source.mp4 + '" type="video/mp4" />';
			}
			if (data.source.ogg) {
				html += '<source src="' + data.source.ogg + '" type="video/ogg" />';
			}
			html += '</video>';
			html += '</div>';

			var $media = $(html),
				$video = $media.find("video");

			$video.one(Events.loadedMetaData, function(e) {
				$media.transition({
					property: "opacity"
				},
				function() {
					cleanMedia(data);
				}).css({ opacity: 1 });

				doResizeInstance(data);

				data.$el.trigger(Events.loaded);

				// Events
				if (data.autoPlay) {
					this.play();
				}
			});

			data.$container.append($media);
		}
	}

	/**
	 * @method private
	 * @name loadYouTube
	 * @description Loads YouTube video
	 * @param data [object] "Instance data"
	 * @param source [string] "YouTube URL"
	 */

	function loadYouTube(data, source, firstLoad) {
		if (!data.videoId) {
			var parts = source.match( /^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/ );
			data.videoId = parts[1];
		}

		if (!data.posterLoaded) {
			if (!data.source.poster) {
				// data.source.poster = "http://img.youtube.com/vi/" + data.videoId + "/maxresdefault.jpg";
				data.source.poster = "http://img.youtube.com/vi/" + data.videoId + "/0.jpg";
			}

			data.posterLoaded = true;
			loadImage(data, data.source.poster, true, firstLoad);

			firstLoad = false;
		}

		if (!Formstone.isMobile) {
			if (!$("script[src*='youtube.com/iframe_api']").length) {
				// $("head").append('<script src="' + window.location.protocol + '//www.youtube.com/iframe_api"></script>');
				$("head").append('<script src="//www.youtube.com/iframe_api"></script>');
			}

			if (!YouTubeReady) {
				YouTubeQueue.push({
					data: data,
					source: source
				});
			} else {
				var guid = data.guid + "_" + (data.youTubeGuid++),
					youTubeClasses = [RawClasses.media, RawClasses.embed, (firstLoad !== true ? RawClasses.animated : '')].join(" "),
					html = '<div class="' + youTubeClasses + '">';

				html += '<div id="' + guid + '"></div>';
				html += '</div>';

				var $media = $(html);

				data.$container.append($media);

				if (data.player) {
					data.oldPlayer = data.player;
					data.player = null;
				}

				data.player = new Window.YT.Player(guid, {
					videoId: data.videoId,
					playerVars: {
						controls: 0,
						rel: 0,
						showinfo: 0,
						wmode: "transparent",
						enablejsapi: 1,
						version: 3,
						playerapiid: guid,
						loop: (data.loop) ? 1 : 0,
						autoplay: 1,
						origin: Window.location.protocol + "//" + Window.location.host
					},
					events: {
						onReady: function (e) {
							/* console.log("onReady", e); */

							data.playerReady = true;
							/* data.player.setPlaybackQuality("highres"); */

							if (data.mute) {
								data.player.mute();
							}

							if (data.autoPlay) {
								// make sure the video plays
								data.player.playVideo();
							}
						},
						onStateChange: function (e) {
							/* console.log("onStateChange", e); */

							if (!data.playing && e.data === Window.YT.PlayerState.PLAYING) {
								data.playing = true;

								if (!data.autoPlay) {
									data.player.pauseVideo();
								}

								$media.transition({
									property: "opacity"
								},
								function() {
									cleanMedia(data);
								}).css({ opacity: 1 });

								doResizeInstance(data);

								data.$el.trigger(Events.loaded);
							} else if (data.loop && data.playing && e.data === Window.YT.PlayerState.ENDED) {
								// fix looping option
								data.player.playVideo();
							}

							/* if (!isSafari) { */
								// Fix for Safari's overly secure security settings...
								data.$el.find(Classes.embed)
										.addClass(RawClasses.ready);
							/* } */
						},
						onPlaybackQualityChange: function(e) {
							/* console.log("onPlaybackQualityChange", e); */
						},
						onPlaybackRateChange: function(e) {
							/* console.log("onPlaybackRateChange", e); */
						},
						onError: function(e) {
							/* console.log("onError", e); */
						},
						onApiChange: function(e) {
							/* console.log("onApiChange", e); */
						}
					}
		        });

				// Resize
				doResizeInstance(data);
			}
		}
	}

	/**
	 * @method private
	 * @name cleanMedia
	 * @description Cleans up old media
	 * @param data [object] "Instance data"
	 */

	function cleanMedia(data) {
		var $media = data.$container.find(Classes.media);

		if ($media.length >= 1) {
			$media.not(":last").remove();
			data.oldPlayer = null;
		}
	}

	/**
	 * @method
	 * @name unload
	 * @description Unloads current media
	 * @example $(".target").background("unload");
	 */

	/**
	 * @method private
	 * @name uploadMedia
	 * @description Unloads current media
	 * @param data [object] "Instance data"
	 */

	function unloadMedia(data) {
		var $media = data.$container.find(Classes.media);

		if ($media.length >= 1) {
			$media.transition({
				property: "opacity"
			},
			function() {
				$media.remove();
				delete data.source;
			}).css({ opacity: 0 });
		}
	}

	/**
	 * @method
	 * @name pause
	 * @description Pauses target video
	 * @example $(".target").background("pause");
	 */

	function pause(data) {
		if (data.isYouTube && data.playerReady) {
			data.player.pauseVideo();
		} else {
			var $video = data.$container.find("video");

			if ($video.length) {
				$video[0].pause();
			}
		}
	}

	/**
	 * @method
	 * @name play
	 * @description Plays target video
	 * @example $(".target").background("play");
	 */

	function play(data) {
		if (data.isYouTube && data.playerReady) {
			data.player.playVideo();
		} else {
			var $video = data.$container.find("video");

			if ($video.length) {
				$video[0].play();
			}
		}
	}

	/**
	 * @method private
	 * @name resizeInstance
	 * @description Handle window resize event
	 * @param data [object] "Instance data"
	 */

	function resizeInstance(data) {
		if (data.responsive) {
			var newSource = calculateSource(data);

			if (newSource !== data.currentSource) {
				loadImage(data, newSource, false, true);
			} else {
				doResizeInstance(data);
			}
		} else {
			doResizeInstance(data);
		}
	}

	/**
	 * @method private
	 * @name resize
	 * @description Resize target instance
	 * @example $(".target").background("resize");
	 */

	/**
	 * @method private
	 * @name doResizeInstance
	 * @description Resize target instance
	 * @param data [object] "Instance data"
	 */

	function doResizeInstance(data) {
		// Target all media
		var $all = data.$container.find(Classes.media);

		for (var i = 0, count = $all.length; i < count; i++) {
			var $m = $all.eq(i),
				type = (data.isYouTube) ? "iframe" : ($m.find("video").length ? "video" : "img"),
				$media = $m.find(type);

			// If media found and scaling is not natively support
			if ($media.length && !(type === "img" && BGSupport)) {
				var frameWidth     = data.$el.outerWidth(),
					frameHeight    = data.$el.outerHeight(),
					frameRatio     = frameWidth / frameHeight,
					nSize          = naturalSize(data, $media);

				data.width     = nSize.width;
				data.height    = nSize.height;
				data.left      = 0;
				data.top       = 0;

				var mediaRatio = (data.isYouTube) ? data.embedRatio : (data.width / data.height);

				// First check the height
				data.height = frameHeight;
				data.width = data.height * mediaRatio;

				// Next check the width
				if (data.width < frameWidth) {
					data.width     = frameWidth;
					data.height    = data.width / mediaRatio;
				}

				// Position the media
				data.left    = -(data.width - frameWidth) / 2;
				data.top     = -(data.height - frameHeight) / 2;

				$m.css({
					height    : data.height,
					width     : data.width,
					left      : data.left,
					top       : data.top
				});
			}
		}
	}

	/**
	 * @method private
	 * @name naturalSize
	 * @description Determines natural size of target media
	 * @param data [object] "Instance data"
	 * @param $media [jQuery object] "Source media object"
	 * @return [object OR boolean] "Object containing natural height and width values or false"
	 */

	function naturalSize(data, $media) {
		if (data.isYouTube) {
			return {
				height: 500,
				width:  500 / data.embedRatio
			};
		} else if ($media.is("img")) {
			var node = $media[0];

			if ($.type(node.naturalHeight) !== "undefined") {
				return {
					height: node.naturalHeight,
					width:  node.naturalWidth
				};
			} else {
				var img = new Image();
				img.src = node.src;
				return {
					height: img.height,
					width:  img.width
				};
			}
		} else {
			return {
				height: $media[0].videoHeight,
				width:  $media[0].videoWidth
			};
		}
		return false;
	}

	/**
	 * @plugin
	 * @name Background
	 * @description A jQuery plugin for full-frame image and video backgrounds.
	 * @type widget
	 * @dependency core.js
	 * @dependency transition.js
	 */

	var Plugin = Formstone.Plugin("background", {
			widget: true,

			/**
			 * @options
			 * @param autoPlay [boolean] <true> "Autoplay video"
			 * @param customClass [string] <''> "Class applied to instance"
			 * @param embedRatio [number] <1.777777> "Video / embed ratio (16/9)"
			 * @param loop [boolean] <true> "Loop video"
			 * @param mute [boolean] <true> "Mute video"
			 * @param source [string OR object] <null> "Source image (string or object) or video (object) or YouTube (object)"
			 */
			defaults: {
				autoPlay       : true,
				customClass    : "",
				embedRatio     : 1.777777,
				loop           : true,
				mute           : true,
				source         : null
			},

			classes: [
				"container",
				"media",
				"animated",
				"responsive",
				"native",
				"fixed",
				"ready"
			],

			/**
			 * @events
			 * @event loaded.background "Background media loaded"
			 * @event ready.background "Background media ready"
			 */

			events: {
				loaded    : "loaded",
				ready     : "ready",
				loadedMetaData : "loadedmetadata"
			},

			methods: {
				_construct    : construct,
				_destruct     : destruct,
				_resize       : resize,

				play          : play,
				pause         : pause,
				resize        : doResizeInstance,
				load          : loadMedia,
				unload        : unloadMedia
			}
		}),

		// Localize References

		Classes         = Plugin.classes,
		RawClasses      = Classes.raw,
		Events          = Plugin.events,
		Functions       = Plugin.functions,

		Window          = Formstone.window,
		$Instances      = [],
		GUID            = 0,

		BGSupport       = ("backgroundSize" in Formstone.document.documentElement.style),
		YouTubeReady    = false,
		YouTubeQueue    = [];

	/**
	 * @method private global
	 * @name window.onYouTubeIframeAPIReady
	 * @description Attaches YouTube players to active instances
	 */
	Window.onYouTubeIframeAPIReady = function() {
		YouTubeReady = true;

		for (var i in YouTubeQueue) {
			if (YouTubeQueue.hasOwnProperty(i)) {
				loadYouTube(YouTubeQueue[i].data, YouTubeQueue[i].source);
			}
		}

		YouTubeQueue = [];
	};

})(jQuery, Formstone);
;(function ($, Formstone, undefined) {

	"use strict";

	/**
	 * @method private
	 * @name construct
	 * @description Builds instance.
	 * @param data [object] "Instance data"
	 */

	function construct(data) {
		var $parent      = this.closest("label"),
			$label       = $parent.length ? $parent.eq(0) : $("label[for=" + this.attr("id") + "]"),
			baseClass    = [RawClasses.base, data.customClass].join(" "),
			html         = "";

		data.radio = (this.attr("type") === "radio");
		data.group = this.attr("name");

		html += '<div class="' + RawClasses.marker + '">';
		html += '<div class="' + RawClasses.flag + '"></div>';

		if (data.toggle) {
			baseClass += " " + RawClasses.toggle;
			html += '<span class="' + [RawClasses.state, RawClasses.state_on].join(" ") + '">'  + data.labels.on  + '</span>';
			html += '<span class="' + [RawClasses.state, RawClasses.state_off].join(" ") + '">' + data.labels.off + '</span>';
		}

		if (data.radio) {
			baseClass += " " + RawClasses.radio;
		}

		html += '</div>';

		// Modify DOM

		if ($label.length) {
			$label.addClass(RawClasses.label)
				  .wrap('<div class="' + baseClass + '"></div>')
				  .before(html);
		} else {
			this.before('<div class=" ' + baseClass + '">' + html + '</div>');
		}

		// Store plugin data
		data.$checkbox    = ($label.length) ? $label.parents(Classes.base) : this.prev(Classes.base);
		data.$marker      = data.$checkbox.find(Classes.marker);
		data.$states      = data.$checkbox.find(Classes.state);
		data.$label       = $label;

		// Check checked
		if (this.is(":checked")) {
			data.$checkbox.addClass(RawClasses.checked);
		}

		// Check disabled
		if (this.is(":disabled")) {
			data.$checkbox.addClass(RawClasses.disabled);
		}

		// Bind click events
		this.on(Events.focus, data, onFocus)
			.on(Events.blur, data, onBlur)
			.on(Events.change, data, onChange)
			.on(Events.click, data, onClick)
			.on(Events.deselect, data, onDeselect);

		data.$checkbox.touch({
			tap: true
		}).on(Events.tap, data, onClick);
	}

	/**
	 * @method private
	 * @name destruct
	 * @description Tears down instance.
	 * @param data [object] "Instance data"
	 */

	function destruct(data) {
		data.$checkbox.off(Events.namespace)
					  .touch("destroy");

		data.$marker.remove();
		data.$states.remove();
		data.$label.unwrap()
				   .removeClass(RawClasses.label);

		this.off(Events.namespace);
	}

	/**
	 * @method
	 * @name enable
	 * @description Enables target instance
	 * @example $(".target").checkbox("enable");
	 */

	function enable(data) {
		this.prop("disabled", false);
		data.$checkbox.removeClass(RawClasses.disabled);
	}

	/**
	 * @method
	 * @name disable
	 * @description Disables target instance
	 * @example $(".target").checkbox("disable");
	 */

	function disable(data) {
		this.prop("disabled", true);
		data.$checkbox.addClass(RawClasses.disabled);
	}

	/**
	 * @method private
	 * @name onClick
	 * @description Handles click
	 */

	function onClick(e) {
		e.stopPropagation();

		var data = e.data;

		if (!$(e.target).is(data.$el)) {
			e.preventDefault();

			data.$el.trigger("click");
		}
	}

	/**
	 * @method private
	 * @name onChange
	 * @description Handles external changes
	 * @param e [object] "Event data"
	 */

	function onChange(e) {
		var data        = e.data,
			disabled    = data.$el.is(":disabled"),
			checked     = data.$el.is(":checked");

		if (!disabled) {
			if (data.radio) {
				// radio
				// if (checked || (isIE8 && !checked)) {
					onSelect(e);
				// }
			} else {
				// Checkbox change events fire after state has changed
				if (checked) {
					onSelect(e);
				} else {
					onDeselect(e);
				}
			}
		}
	}

	/*
	 * @method private
	 * @name onSelect
	 * @description Changes input to "checked"
	 * @param e [object] "Event data"
	 */
	function onSelect(e) {
		if (e.data.radio) {
			$('input[name="' + e.data.group + '"]').not(e.data.$el).trigger("deselect");
		}

		e.data.$checkbox.addClass(RawClasses.checked);
	}

	/**
	 * @method private
	 * @name onDeselect
	 * @description Changes input to "checked"
	 * @param e [object] "Event data"
	 */
	function onDeselect(e) {
		e.data.$checkbox.removeClass(RawClasses.checked);
	}

	/**
	 * @method private
	 * @name onFocus
	 * @description Handles instance focus
	 * @param e [object] "Event data"
	 */

	function onFocus(e) {
		e.data.$checkbox.addClass(RawClasses.focus);
	}

	/**
	 * @method private
	 * @name onBlur
	 * @description Handles instance blur
	 * @param e [object] "Event data"
	 */

	function onBlur(e) {
		e.data.$checkbox.removeClass(RawClasses.focus);
	}

	/**
	 * @plugin
	 * @name Checkbox
	 * @description A jQuery plugin for replacing checkboxes.
	 * @type widget
	 * @dependency core.js
	 * @dependency touch.js
	 */

	var Plugin = Formstone.Plugin("checkbox", {
			widget: true,

			/**
			 * @options
			 * @param customClass [string] <''> "Class applied to instance"
			 * @param toggle [boolean] <false> "Render 'toggle' styles"
			 * @param labels.on [string] <'ON'> "Label for 'On' position; 'toggle' only"
			 * @param labels.off [string] <'OFF'> "Label for 'Off' position; 'toggle' only"
			 */

			defaults: {
				customClass    : "",
				toggle         : false,
				labels : {
					on         : "ON",
					off        : "OFF"
				}
			},

			classes: [
				"label",
				"marker",
				"flag",
				"radio",
				"focus",
				"checked",
				"disabled",
				"toggle",
				"state",
				"state_on",
				"state_off"
			],

			methods: {
				_construct    : construct,
				_destruct     : destruct,

				// Public Methods

				enable        : enable,
				disable       : disable
			},

			events: {
				deselect : "deselect",
				tap      : "tap"
			}
		}),

		// Localize References

		Classes       = Plugin.classes,
		RawClasses    = Classes.raw,
		Events        = Plugin.events,
		Functions     = Plugin.functions;

})(jQuery, Formstone);
;(function ($, Formstone, undefined) {

	"use strict";

	/**
	 * @method private
	 * @name delegate
	 * @param key [string] "Cookie key"
	 * @param value [string] "Cookie value"
	 * @param options [object] "Options object"
	 * @return [null || string] "Cookie value, if 'read'"
	 */

	function delegate(key, value, options) {
		if ($.type(key) === "object") {

			// Set defaults

			Defaults = $.extend(Defaults, key);
		} else {

			// Delegate intent

			options = $.extend({}, Defaults, options || {});

			if ($.type(key) !== "undefined") {
				if ($.type(value) !== "undefined") {
					if (value === null) {
						eraseCookie(key);
					} else {
						createCookie(key, value, options);
					}
				} else {
					return readCookie(key);
				}
			}
		}

		return null;
	}

	/**
	 * @method
	 * @name create
	 * @description Creates a cookie.
	 * @param key [string] "Cookie key"
	 * @param value [string] "Cookie value"
	 * @param options [object] "Options object"
	 * @example $.cookie(key, value, options);
	 */

	function createCookie(key, value, options) {
		var expiration = false,
			date = new Date();

		// Check Expiration Date

		if (options.expires && $.type(options.expires) === "number") {
			date.setTime( date.getTime() + options.expires );
			expiration = date.toGMTString();
		}

		var domain     = (options.domain)    ? "; domain=" + options.domain : "",
			expires    = (expiration)        ? "; expires=" + expiration : "",
			maxAge     = (expiration)        ? "; max-age=" + (options.expires / 1000) : "", // to seconds
			path       = (options.path)      ? "; path=" + options.path : "",
			secure     = (options.secure)    ? "; secure" : "";

		// Set Cookie

		Document.cookie = key + "=" + value + expires + maxAge + domain + path + secure;
	}

	/**
	 * @method
	 * @name read
	 * @description Returns a cookie's value, or null.
	 * @param key [string] "Cookie key"
	 * @return [string | null] "Cookie's value, or null"
	 * @example var value = $.cookie(key);
	 */

	function readCookie(key) {
		var keyString    = key + "=",
			cookies      = Document.cookie.split(';');

		// Loop Cookies

		for(var i = 0; i < cookies.length; i++) {
			var cookie = cookies[i];

			while (cookie.charAt(0) === ' ') {
				cookie = cookie.substring(1, cookie.length);
			}

			// Return Match

			if (cookie.indexOf(keyString) === 0) {
				return cookie.substring(keyString.length, cookie.length);
			}
		}

		return null;
	}

	/**
	 * @method
	 * @name erase
	 * @description Deletes a cookie.
	 * @param key [string] "Cookie key"
	 * @example $.cookie(key, null);
	 */

	function eraseCookie(key) {
		createCookie(key, "", {
			expires: -604800000 // -7 days
		});
	}

	/**
	 * @plugin
	 * @name Cookie
	 * @description A jQuery plugin for simple access to browser cookies.
	 * @type utility
	 * @dependency core.js
	 */

	var Plugin = Formstone.Plugin("cookie", {
			utilities: {
				_delegate:     delegate
			}
		}),

		/**
		 * @options
		 * @param domain [string] "Cookie domain"
		 * @param expires [int] <604800000> "Time until cookie expires"
		 * @param path [string] "Cookie path"
		 */

		Defaults = {
			domain:     null,
			expires:    604800000, // 7 days
			path:       null,
			secure:     null
		},

		// Localize References

		Document = Formstone.document;

})(jQuery, Formstone);
;(function ($, Formstone, undefined) {

	"use strict";

	/**
	 * @method private
	 * @name setup
	 * @description Setup plugin.
	 */

	function setup() {
		$Body = Formstone.$body;
	}

	/**
	 * @method private
	 * @name construct
	 * @description Builds instance.
	 * @param data [object] "Instance data"
	 */

	function construct(data) {
		data.multiple = this.prop("multiple");
		data.disabled = this.is(":disabled");

		if (data.multiple) {
			data.links = false;
		} else if (data.external) {
			data.links = true;
		}

		// Grab true original index, only if selected attribute exits
		var $originalOption = this.find(":selected").not(":disabled"),
			originalLabel = $originalOption.text(),
			originalIndex = this.find("option").index($originalOption);

		if (!data.multiple && data.label !== "") {
			$originalOption = this.prepend('<option value="" class="' + RawClasses.item_placeholder + '" selected>' + data.label + '</option>');
			originalLabel = data.label;
			originalIndex = 0;
		} else {
			data.label = "";
		}

		// Build options array
		var $allOptions = this.find("option, optgroup"),
			$options = $allOptions.filter("option");

		// Swap tab index, no more interacting with the actual select!
		data.tabIndex = this[0].tabIndex;
		this[0].tabIndex = -1;

		// Build wrapper
		var wrapperClasses = [
			RawClasses.base,
			data.customClass
		];

		if (data.mobile || Formstone.isMobile) {
			wrapperClasses.push(RawClasses.mobile);
		} else if (data.cover) {
			wrapperClasses.push(RawClasses.cover);
		}
		if (data.multiple) {
			wrapperClasses.push(RawClasses.multiple);
		}
		if (data.disabled) {
			wrapperClasses.push(RawClasses.disabled);
		}

		// Build html
		var wrapperHtml = '<div class="' + wrapperClasses.join(" ") + '" tabindex="' + data.tabIndex + '"></div>',
			innerHtml = "";

		// Build inner
		if (!data.multiple) {
			innerHtml += '<button type="button" class="' + RawClasses.selected + '">';
			innerHtml += $('<span></span>').text( trimText(originalLabel, data.trim) ).html();
			innerHtml += '</button>';
		}
		innerHtml += '<div class="' + RawClasses.options + '">';
		innerHtml += '</div>';

		// Modify DOM
		this.wrap(wrapperHtml)
			.after(innerHtml);

		// Store plugin data
		data.$dropdown        = this.parent(Classes.base);
		data.$allOptions      = $allOptions;
		data.$options         = $options;
		data.$selected        = data.$dropdown.find(Classes.selected);
		data.$wrapper         = data.$dropdown.find(Classes.options);
		data.$placeholder     = data.$dropdown.find(Classes.placeholder);
		data.index            = -1;
		data.guid             = GUID++;
		data.closed           = true;

		data.keyDownGUID      = Events.keyDown + data.guid;
		data.clickGUID        = Events.click + data.guid;

		buildOptions(data);

		if (!data.multiple) {
			updateOption(originalIndex, data);
		}

		/*
		// Scroller support
		if ($.fn.scroller !== undefined) {
			data.$wrapper.scroller();
		}
		*/

		// Bind events
		data.$selected.touch({
			tap: true
		}).on(Events.tap, data, onClick);

		data.$dropdown.on(Events.click, Classes.item, data, onSelect)
					  .on(Events.close, data, onClose);

		// Change events
		this.on(Events.change, data, onChange);

		// Focus/Blur events
		if (!Formstone.isMobile) {
			data.$dropdown.on(Events.focus, data, onFocus)
						  .on(Events.blur, data, onBlur);

			// Handle clicks to associated labels
			this.on(Events.focus, data, function(e) {
				e.data.$dropdown.trigger(Events.raw.focus);
			});
		}
	}

	/**
	 * @method private
	 * @name destruct
	 * @description Tears down instance.
	 * @param data [object] "Instance data"
	 */

	function destruct(data) {
		if (data.$dropdown.hasClass(RawClasses.open)) {
			data.$selected.trigger(Events.click);
		}

		// Scrollbar support
		/*
		if ($.fn.scroller !== undefined) {
			data.$dropdown.find(".selecter-options").scroller("destroy");
		}
		*/

		data.$el[0].tabIndex = data.tabIndex;

		data.$dropdown.off(Events.namespace);
		data.$options.off(Events.namespace);

		data.$placeholder.remove();
		data.$selected.remove();
		data.$wrapper.remove();

		data.$el.off(Events.namespace)
				.show()
				.unwrap();
	}

	/**
	 * @method
	 * @name disable
	 * @description Disables target instance or option.
	 * @param option [string] <null> "Target option value"
	 * @example $(".target").dropdown("disable", "1");
	 */

	function disableDropdown(data, option) {
		if (typeof option !== "undefined") {
			var index = data.$items.index( data.$items.filter("[data-value=" + option + "]") );

			data.$items.eq(index).addClass(RawClasses.item_disabled);
			data.$options.eq(index).prop("disabled", true);
		} else {
			if (data.$dropdown.hasClass(RawClasses.open)) {
				data.$selected.trigger(Events.click);
			}

			data.$dropdown.addClass(RawClasses.disabled);
			data.$el.prop("disabled", true);

			data.disabled = true;
		}
	}

	/**
	 * @method
	 * @name enable
	 * @description Enables target instance or option.
	 * @param option [string] <null> "Target option value"
	 * @example $(".target").dropdown("enable", "1");
	 */

	function enableDropdown(data, option) {
		if (typeof option !== "undefined") {
			var index = data.$items.index( data.$items.filter("[data-value=" + option + "]") );
			data.$items.eq(index).removeClass(RawClasses.item_disabled);
			data.$options.eq(index).prop("disabled", false);
		} else {
			data.$dropdown.removeClass(RawClasses.disabled);
			data.$el.prop("disabled", false);

			data.disabled = false;
		}
	}

	/**
	* @method
	* @name update
	* @description Updates instance.
	* @example $(".target").dropdown("update");
	*/

	function updateDropdown(data) {
		var index = data.index;

		data.$allOptions = data.$el.find("option, optgroup");
		data.$options = data.$allOptions.filter("option");
		data.index = -1;

		index = data.$options.index(data.$options.filter(":selected"));

		buildOptions(data);

		if (!data.multiple) {
			updateOption(index, data);
		}
	}

	/**
	 * @method private
	 * @name buildOptions
	 * @description Builds instance's option set.
	 * @param data [object] "Instance data"
	 */

	function buildOptions(data) {
		var html = '',
			j = 0;

		for (var i = 0, count = data.$allOptions.length; i < count; i++) {
			var $option = data.$allOptions.eq(i),
				classes = [];

			// Option group
			if ($option[0].tagName === "OPTGROUP") {
				classes.push(RawClasses.group);

				// Disabled groups
				if ($option.is(":disabled")) {
					classes.push(RawClasses.disabled);
				}

				html += '<span class="' + classes.join(" ") + '">' + $option.attr("label") + '</span>';
			} else {
				var opVal = $option.val();

				if (!$option.attr("value")) {
					$option.attr("value", opVal);
				}

				classes.push(RawClasses.item);

				if ($option.hasClass(RawClasses.item_placeholder)) {
					classes.push(RawClasses.item_placeholder);
				}
				if ($option.is(":selected")) {
					classes.push(RawClasses.item_selected);
				}
				if ($option.is(":disabled")) {
					classes.push(RawClasses.item_disabled);
				}

				html += '<button type="button" class="' + classes.join(" ") + '" ';
				html += 'data-value="' + opVal + '">';
				html += $("<span></span>").text( trimText($option.text(), data.trim) ).html();
				html += '</button>';

				j++;
			}
		}

		data.$items = data.$wrapper.html(html)
								   .find(Classes.item);
	}

	/**
	 * @method private
	 * @name onClick
	 * @description Handles click to selected item.
	 * @param e [object] "Event data"
	 */

	function onClick(e) {
		Functions.killEvent(e);

		var data = e.data;

		if (!data.disabled) {
			// Handle mobile, but not Firefox, unless desktop forced
			if (!data.mobile && Formstone.isMobile && !Formstone.isFirefoxMobile) {
				var el = data.$el[0];

				if (Document.createEvent) { // All
					var evt = Document.createEvent("MouseEvents");
					evt.initMouseEvent("mousedown", false, true, Window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
					el.dispatchEvent(evt);
				} else if (el.fireEvent) { // IE
					el.fireEvent("onmousedown");
				}
			} else {
				// Delegate intent
				if (data.closed) {
					openOptions(data);
				} else {
					closeOptions(data);
				}
			}
		}
	}

	/**
	 * @method private
	 * @name openOptions
	 * @description Opens option set.
	 * @param data [object] "Instance data"
	 */

	/**
	 * @method
	 * @name open
	 * @description Opens target instance.
	 * @example $(".target").dropdown("open");
	 */

	function openOptions(data) {
		// Make sure it's not already open
		if (data.closed) {
			$(Classes.base).not(data.$dropdown).trigger(Events.close, [ data ]);

			var offset = data.$dropdown.offset(),
				bodyHeight = $Body.outerHeight(),
				optionsHeight = data.$wrapper.outerHeight(true),
				selectedOffset = (data.index >= 0) ? data.$items.eq(data.index).position() : { left: 0, top: 0 };

			// Calculate bottom of document
			if (offset.top + optionsHeight > bodyHeight) {
				data.$dropdown.addClass(RawClasses.bottom);
			}

			// Bind Events
			$Body.on(data.clickGUID, ":not(" + Classes.options + ")", data, closeOptionsHelper);

			data.$dropdown.addClass(RawClasses.open);
			scrollOptions(data);

			data.closed = false;
		}
	}

	/**
	 * @method private
	 * @name closeOptions
	 * @description Closes option set.
	 * @param data [object] "Instance data"
	 */

	/**
	 * @method
	 * @name close
	 * @description Closes target instance.
	 * @example $(".target").dropdown("close");
	 */

	function closeOptions(data) {
		// Make sure it's actually open
		if (data && !data.closed) {
			$Body.off(data.clickGUID);

			data.$dropdown.removeClass( [RawClasses.open, RawClasses.bottom].join(" ") );

			data.closed = true;
		}
	}

	/**
	 * @method private
	 * @name closeOptionsHelper
	 * @description Determines if event target is outside instance before closing
	 * @param e [object] "Event data"
	 */

	function closeOptionsHelper(e) {
		Functions.killEvent(e);

		var data = e.data;

		if (data && $(e.currentTarget).parents(Classes.base).length === 0) {
			closeOptions(data);
		}
	}

	/**
	 * @method private
	 * @name onClose
	 * @description Handles close event.
	 * @param e [object] "Event data"
	 */

	function onClose(e) {
		var data = e.data;

		if (data) {
			closeOptions(data);
		}
	}

	/**
	 * @method private
	 * @name onSelect
	 * @description Handles option select.
	 * @param e [object] "Event data"
	 */

	function onSelect(e) {
		Functions.killEvent(e);

		var $target = $(this),
			data = e.data;

		if (!data.disabled) {
			if (data.$wrapper.is(":visible")) {
				// Update
				var index = data.$items.index($target);

				if (index !== data.index) {
					updateOption(index, data);
					handleChange(data);
				}
			}

			if (!data.multiple) {
				// Clean up
				closeOptions(data);
			}
		}
	}

	/**
	 * @method private
	 * @name onChange
	 * @description Handles external changes.
	 * @param e [object] "Event data"
	 */

	function onChange(e, internal) {
		var $target = $(this),
			data = e.data;

		if (!internal && !data.multiple) {
			var index = data.$options.index( data.$options.filter("[value='" + escapeText($target.val()) + "']") );

			updateOption(index, data);
			handleChange(data);
		}
	}

	/**
	 * @method private
	 * @name onFocus
	 * @description Handles instance focus.
	 * @param e [object] "Event data"
	 */

	function onFocus(e) {
		Functions.killEvent(e);

		var data = e.data;

		if (!data.disabled && !data.multiple) {
			data.$dropdown.addClass(RawClasses.focus)
						  .on(data.keyDownGUID, data, onKeypress);
		}
	}

	/**
	 * @method private
	 * @name onBlur
	 * @description Handles instance blur.
	 * @param e [object] "Event data"
	 */

	function onBlur(e, internal) {
		Functions.killEvent(e);

		var data = e.data;

		data.$dropdown.removeClass(RawClasses.focus)
					  .off(data.keyDownGUID);

		if (!data.multiple) {
			// Clean up
			closeOptions(data);
		}
	}

	/**
	 * @method private
	 * @name onKeypress
	 * @description Handles instance keypress, once focused.
	 * @param e [object] "Event data"
	 */

	function onKeypress(e) {
		var data = e.data;

		if (e.keyCode === 13) {
			if (!data.closed) {
				closeOptions(data);
				updateOption(data.index, data);
			}
			handleChange(data);
		} else if (e.keyCode !== 9 && (!e.metaKey && !e.altKey && !e.ctrlKey && !e.shiftKey)) {
			// Ignore modifiers & tabs
			Functions.killEvent(e);

			var total = data.$items.length - 1,
				index = (data.index < 0) ? 0 : data.index;

			// Firefox left/right support thanks to Kylemade
			if ($.inArray(e.keyCode, (Formstone.isFirefox) ? [38, 40, 37, 39] : [38, 40]) > -1) {
				// Increment / decrement using the arrow keys
				index = index + ((e.keyCode === 38 || (Formstone.isFirefox && e.keyCode === 37)) ? -1 : 1);

				if (index < 0) {
					index = 0;
				}
				if (index > total) {
					index = total;
				}
			} else {
				var input = String.fromCharCode(e.keyCode).toUpperCase(),
					letter,
					i;

				// Search for input from original index
				for (i = data.index + 1; i <= total; i++) {
					letter = data.$options.eq(i).text().charAt(0).toUpperCase();
					if (letter === input) {
						index = i;
						break;
					}
				}

				// If not, start from the beginning
				if (index < 0 || index === data.index) {
					for (i = 0; i <= total; i++) {
						letter = data.$options.eq(i).text().charAt(0).toUpperCase();
						if (letter === input) {
							index = i;
							break;
						}
					}
				}
			}

			// Update
			if (index >= 0) {
				updateOption(index, data);
				scrollOptions(data);
			}
		}
	}

	/**
	 * @method private
	 * @name updateOption
	 * @description Updates instance based on new target index.
	 * @param index [int] "Selected option index"
	 * @param data [object] "instance data"
	 */

	function updateOption(index, data) {
		var $item      = data.$items.eq(index),
			$option    = data.$options.eq(index),
			isSelected = $item.hasClass(RawClasses.item_selected),
			isDisabled = $item.hasClass(RawClasses.item_disabled);

		// Check for disabled options
		if (!isDisabled) {
			if (data.multiple) {
				if (isSelected) {
					$option.prop("selected", null);
					$item.removeClass(RawClasses.item_selected);
				} else {
					$option.prop("selected", true);
					$item.addClass(RawClasses.item_selected);
				}
			} else if (index > -1 && index < data.$items.length) {
				var label = $option.data("label") || $item.html();

				data.$selected.html(label)
							  .removeClass(Classes.item_placeholder);

				data.$items.filter(Classes.item_selected)
						   .removeClass(RawClasses.item_selected);

				data.$el[0].selectedIndex = index;

				$item.addClass(RawClasses.item_selected);
				data.index = index;
			} else if (data.label !== "") {
				data.$selected.html(data.label);
			}
		}
	}

	/**
	 * @method private
	 * @name scrollOptions
	 * @description Scrolls options wrapper to specific option.
	 * @param data [object] "Instance data"
	 */

	function scrollOptions(data) {
		var $selected = data.$items.eq(data.index),
			selectedOffset = (data.index >= 0 && !$selected.hasClass(Classes.item_placeholder)) ? $selected.position() : { left: 0, top: 0 };

		/*
		if ($.fn.scroller !== undefined) {
			data.$wrapper.scroller("scroll", (data.$wrapper.find(".scroller-content").scrollTop() + selectedOffset.top), 0)
							  .scroller("reset");
		} else {
		*/
			data.$wrapper.scrollTop( data.$wrapper.scrollTop() + selectedOffset.top );
		// }
	}

	/**
	 * @method private
	 * @name handleChange
	 * @description Handles change events.
	 * @param data [object] "Instance data"
	 */

	function handleChange(data) {
		if (data.links) {
			launchLink(data);
		} else {
			data.$el.trigger(Events.raw.change, [ true ]);
		}
	}

	/**
	 * @method private
	 * @name launchLink
	 * @description Launches link.
	 * @param data [object] "Instance data"
	 */

	function launchLink(data) {
		var url = data.$el.val();

		if (data.external) {
			// Open link in a new tab/window
			Window.open(url);
		} else {
			// Open link in same tab/window
			Window.location.href = url;
		}
	}

	/**
	 * @method private
	 * @name trimText
	 * @description Trims text, if specified length is greater then 0.
	 * @param length [int] "Length to trim at"
	 * @param text [string] "Text to trim"
	 * @return [string] "Trimmed string"
	 */

	function trimText(text, length) {
		if (length === 0) {
			return text;
		} else {
			if (text.length > length) {
				return text.substring(0, length) + "...";
			} else {
				return text;
			}
		}
	}

	/**
	 * @method private
	 * @name escapeText
	 * @description Escapes text.
	 * @param text [string] "Text to escape"
	 */

	function escapeText(text) {
		return (typeof text === "string") ? text.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1') : text;
	}

	/**
	 * @plugin
	 * @name Dropdown
	 * @description A jQuery plugin for custom select elements.
	 * @type widget
	 * @dependency core.js
	 * @dependency touch.js
	 */

	var Plugin = Formstone.Plugin("dropdown", {
			widget: true,

			/**
			 * @options
			 * @param cover [boolean] <false> "Cover handle with option set"
			 * @param customClass [string] <''> "Class applied to instance"
			 * @param label [string] <''> "Label displayed before selection"
			 * @param external [boolean] <false> "Open options as links in new window"
			 * @param links [boolean] <false> "Open options as links in same window"
			 * @param mobile [boolean] <false> "Force desktop interaction on mobile"
			 * @param trim [int] <0> "Trim options to specified length; 0 to disable”
			 */
			defaults: {
				cover          : false,
				customClass    : "",
				label          : "",
				external       : false,
				links          : false,
				mobile         : false,
				trim           : 0
			},

			methods: {
				_setup        : setup,
				_construct    : construct,
				_destruct     : destruct,

				disable       : disableDropdown,
				enable        : enableDropdown,
				update        : updateDropdown,
				open          : openOptions,
				close         : closeOptions
			},

			classes: [
				"cover",
				"bottom",
				"multiple",
				"mobile",

				"open",
				"disabled",
				"focus",

				"selected",
				"options",
				"group",
				"item",

				"item_disabled",
				"item_selected",
				"item_placeholder"
			],

			events: {
				tap:   "tap",
				close: "close"
			}
		}),

		// Localize References

		Classes       = Plugin.classes,
		RawClasses    = Classes.raw,
		Events        = Plugin.events,
		Functions     = Plugin.functions,

		// Local

		GUID          = 0,
		Window        = Formstone.window,
		$Window       = Formstone.$window,
		Document      = Formstone.document,
		$Body         = null;

})(jQuery, Formstone);
;(function ($, Formstone, undefined) {

	"use strict";

	/**
	 * @method private
	 * @name resize
	 * @description Handles window resize
	 */

	function resize(windowWidth) {
		Functions.iterate.call($Instances, resizeInstance);
	}

	/**
	 * @method private
	 * @name cacheInstances
	 * @description Caches active instances
	 */

	function cacheInstances() {
		$Instances = $(Classes.element);
	}

	/**
	 * @method private
	 * @name construct
	 * @description Builds instance.
	 * @param data [object] "Instance Data"
	 */

	function construct(data) {
		data.maxWidth = (data.maxWidth === Infinity ? "100000px" : data.maxWidth);
		data.mq       = "(min-width:" + data.minWidth + ") and (max-width:" + data.maxWidth + ")";
		data.mqGuid   = RawClasses.base + "__" + (GUID++);

		$.mediaquery("bind", data.mqGuid, data.mq, {
			enter: function() {
				enable.call(data.$el, data);
			},
			leave: function() {
				disable.call(data.$el, data);
			}
		});

		resizeInstance(data);

		cacheInstances();
	}

	/**
	 * @method private
	 * @name destruct
	 * @description Tears down instance.
	 * @param data [object] "Instance data"
	 */

	function destruct(data) {
		cacheInstances();
	}

	/**
	 * @method private
	 * @name resizeInstance
	 * @description Handle window resize event
	 * @param data [object] "Instance data"
	 */

	function resizeInstance(data) {
		if (data.enabled) {
			var $targets = data.target ? data.$el.find(data.target) : data.$el.children(),
				type     = (data.property === "height") ? "outerHeight" : "outerWidth",
				value    = 0,
				check    = 0;

			$targets.css(data.property, "");

			for (var i = 0; i < $targets.length; i++) {
				check = $targets.eq(i)[type]();

				if (check > value) {
					value = check;
				}
			}

			$targets.css(data.property, value);
		}
	}

	/**
	 * @method
	 * @name disable
	 * @description Disables instance of plugin
	 * @example $(".target").equalize("disable");
	 */

	function disable(data) {
		if (data.enabled) {
			data.enabled = false;

			var $targets = data.target ? data.$el.find(data.target) : data.$el.children(),
				type     = (data.property === "height") ? "outerHeight" : "outerWidth";

			$targets.css(data.property, "");
		}
	}

	/**
	 * @method
	 * @name enable
	 * @description Enables instance of plugin
	 * @example $(".target").equalize("enable");
	 */

	function enable(data) {
		if (!data.enabled) {
			data.enabled = true;

			resizeInstance(data);
		}
	}

	/**
	 * @plugin
	 * @name Equalize
	 * @description A jQuery plugin for equal dimensions.
	 * @type widget
	 * @dependency core.js
	 * @dependency mediaquery.js
	 */

	var Plugin = Formstone.Plugin("equalize", {
			widget: true,
			priority: 5,

			/**
			 * @options
			 * @param maxWidth [string] <'Infinity'> "Width at which to auto-disable plugin"
			 * @param minWidth [string] <'0'> "Width at which to auto-disable plugin"
			 * @param property [string] <"height"> "Property to size; 'height' or 'width'"
			 * @param target [string] <null> "Target child selector"
			 */

			defaults: {
				maxWidth    : Infinity,
				minWidth    : '0px',
				property    : "height",
				target      : null
			},

			methods : {
				_construct    : construct,
				_destruct     : destruct,
				_resize       : resize
			}
		}),

		// Localize References

		Classes        = Plugin.classes,
		RawClasses     = Classes.raw,
		Functions      = Plugin.functions,
		GUID           = 0,

		$Instances     = [];

})(jQuery, Formstone);
;(function ($, Formstone, undefined) {

	"use strict";

	/**
	 * @method private
	 * @name setup
	 * @description Setup plugin.
	 */

	function setup() {
		$Body = Formstone.$body;
		$Locks = $("html, body");
	}

	/**
	 * @method private
	 * @name resize
	 * @description Handles window resize
	 */

	function resize() {
		if (Instance) {
			resizeLightbox();
		}
	}

	/**
	 * @method private
	 * @name construct
	 * @description Builds instance.
	 * @param data [object] "Instance data"
	 */

	function construct(data) {
		this.on(Events.click, data, buildLightbox);
	}

	/**
	 * @method private
	 * @name destruct
	 * @description Tears down instance.
	 * @param data [object] "Instance data"
	 */

	function destruct(data) {
		closeLightbox();

		this.off(Events.namespace);
	}

	/**
	 * @method private
	 * @name initialize
	 * @description Builds instance from $target.
	 * @param $target [jQuery] "Target jQuery object"
	 */

	function initialize($target, options) {
		if ($target instanceof $) {

			// Emulate event

			buildLightbox.apply(Window, [{ data: $.extend({}, {
				$object: $target
			}, Defaults, options || {}) }]);
		}
	}

	/**
	 * @method private
	 * @name buildLightbox
	 * @description Builds new lightbox.
	 * @param e [object] "Event data"
	 */

	function buildLightbox(e) {
		if (!Instance) {
			// Check target type
			var data           = e.data,
				$el            = data.$el,
				$object        = data.$object,
				source         = ($el && $el[0].href) ? $el[0].href || "" : "",
				hash           = ($el && $el[0].hash) ? $el[0].hash || "" : "",
				sourceParts    = source.toLowerCase().split(".").pop().split(/\#|\?/),
				extension      = sourceParts[0],
				type           = ($el) ? $el.data(Namespace + "-type") : "",
				isImage	       = ( (type === "image") || ($.inArray(extension, data.extensions) > -1 || source.substr(0, 10) === "data:image") ),
				isVideo	       = ( source.indexOf("youtube.com/embed") > -1 || source.indexOf("player.vimeo.com/video") > -1 ),
				isUrl	       = ( (type === "url") || (!isImage && !isVideo && source.substr(0, 4) === "http" && !hash) ),
				isElement      = ( (type === "element") || (!isImage && !isVideo && !isUrl && (hash.substr(0, 1) === "#")) ),
				isObject       = ( (typeof $object !== "undefined") );

			if (isElement) {
				source = hash;
			}

			// Retain default click
			if ( !(isImage || isVideo || isUrl || isElement || isObject) ) {
				return;
			}

			// Kill event
			Functions.killEvent(e);

			// Cache internal data
			Instance = $.extend({}, {
				visible            : false,
				gallery: {
					active         : false
				},
				isMobile           : (Formstone.isMobile || data.mobile),
				isAnimating        : true,
				oldContentHeight   : 0,
				oldContentWidth    : 0
			}, data);

			// Double the margin
			Instance.margin *= 2;

			if (isImage) {
				Instance.type = "image";
			} else if (isVideo) {
				Instance.type = "video";
			} else {
				Instance.type = "element";
			}

			if (isImage || isVideo) {
				// Check for gallery
				var id = $el.data(Namespace + "-gallery");

				if (id) {
					Instance.gallery.active    = true;
					Instance.gallery.id        = id;
					Instance.gallery.$items    = $("a[data-lightbox-gallery= " + Instance.gallery.id + "], a[rel= " + Instance.gallery.id + "]"); // backwards compatibility
					Instance.gallery.index     = Instance.gallery.$items.index(Instance.$el);
					Instance.gallery.total     = Instance.gallery.$items.length - 1;
				}
			}

			// Assemble HTML
			var html = '';
			if (!Instance.isMobile) {
				html += '<div class="' + [Classes.raw.overlay, Instance.customClass].join(" ") + '"></div>';
			}
			var lightboxClasses = [
				Classes.raw.base,
				Classes.raw.loading,
				Classes.raw.animating,
				Instance.customClass
			];

			if (Instance.fixed) {
				lightboxClasses.push(Classes.raw.fixed);
			}
			if (Instance.isMobile) {
				lightboxClasses.push(Classes.raw.mobile);
			}
			if (isUrl) {
				lightboxClasses.push(Classes.raw.iframed);
			}
			if (isElement || isObject) {
				lightboxClasses.push(Classes.raw.inline);
			}

			html += '<div class="' + lightboxClasses.join(" ") + '">';
			html += '<button type="button" class="' + Classes.raw.close + '">' + Instance.labels.close + '</button>';
			html += '<span class="' + Classes.raw.loading_icon + '"></span>';
			html += '<div class="' + Classes.raw.container + '">';
			html += '<div class="' + Classes.raw.content + '">';
			if (isImage || isVideo) {
				html += '<div class="' + Classes.raw.meta + '">';

				if (Instance.gallery.active) {
					html += '<button type="button" class="' + [Classes.raw.control, Classes.raw.control_previous].join(" ") + '">' + Instance.labels.previous + '</button>';
					html += '<button type="button" class="' + [Classes.raw.control, Classes.raw.control_next].join(" ") + '">' + Instance.labels.next + '</button>';
					html += '<p class="' + Classes.raw.position + '"';
					if (Instance.gallery.total < 1) {
						html += ' style="display: none;"';
					}
					html += '>';
					html += '<span class="' + Classes.raw.position_current + '">' + (Instance.gallery.index + 1) + '</span> ';
					html += Instance.labels.count;
					html += ' <span class="' + Classes.raw.position_total + '">' + (Instance.gallery.total + 1) + '</span>';
					html += '</p>';
				}

				html += '<div class="' + Classes.raw.caption + '">';
				html += Instance.formatter.call($el, data);
				html += '</div></div>'; // caption, meta
			}
			html += '</div></div></div>'; //container, content, lightbox

			// Modify Dom
			$Body.append(html);

			// Cache jquery objects
			Instance.$overlay          = $(Classes.overlay);
			Instance.$lightbox         = $(Classes.base);
			Instance.$close            = $(Classes.close);
			Instance.$container        = $(Classes.container);
			Instance.$content          = $(Classes.content);
			Instance.$meta             = $(Classes.meta);
			Instance.$position         = $(Classes.position);
			Instance.$caption          = $(Classes.caption);
			Instance.$controls         = $(Classes.control);

			Instance.paddingVertical   = (!Instance.isMobile) ? (parseInt(Instance.$lightbox.css("paddingTop"), 10)  + parseInt(Instance.$lightbox.css("paddingBottom"), 10)) : (Instance.$close.outerHeight() / 2);
			Instance.paddingHorizontal = (!Instance.isMobile) ? (parseInt(Instance.$lightbox.css("paddingLeft"), 10) + parseInt(Instance.$lightbox.css("paddingRight"), 10))  : 0;
			Instance.contentHeight     = Instance.$lightbox.outerHeight() - Instance.paddingVertical;
			Instance.contentWidth      = Instance.$lightbox.outerWidth()  - Instance.paddingHorizontal;
			Instance.controlHeight     = Instance.$controls.outerHeight();

			// Center
			centerLightbox();

			// Update gallery
			if (Instance.gallery.active) {
				updateGalleryControls();
			}

			// Bind events
			$Window.on(Events.keyDown, onKeyDown);

			$Body.on(Events.clickTouchStart, [Classes.overlay, Classes.close].join(", "), closeLightbox);

			if (Instance.gallery.active) {
				Instance.$lightbox.on(Events.clickTouchStart, Classes.control, advanceGallery);
			}

			Instance.$lightbox.transition({
				property: "opacity"
			},
			function() {
				if (isImage) {
					loadImage(source);
				} else if (isVideo) {
					loadVideo(source);
				} else if (isUrl) {
					loadURL(source);
				} else if (isElement) {
					cloneElement(source);
				} else if (isObject) {
					appendObject(Instance.$object);
				}
			}).addClass(Classes.raw.open);

			Instance.$overlay.addClass(Classes.raw.open);
		}
	}

	/**
	 * @method
	 * @name resize
	 * @description Resizes lightbox.
	 * @example $.lightbox("resize");
	 * @param height [int | false] "Target height or false to auto size"
	 * @param width [int | false] "Target width or false to auto size"
	 */

	/**
	 * @method private
	 * @name resizeLightbox
	 * @description Triggers resize of instance.
	 */

	function resizeLightbox(e) {
		if (typeof e !== "object") {
			Instance.targetHeight = arguments[0];
			Instance.targetWidth  = arguments[1];
		}

		if (Instance.type === "element") {
			sizeContent(Instance.$content.find("> :first-child"));
		} else if (Instance.type === "image") {
			sizeImage();
		} else if (Instance.type === "video") {
			sizeVideo();
		}

		sizeLightbox();
	}

	/**
	 * @method
	 * @name close
	 * @description Closes active instance.
	 * @example $.lightbox("close");
	 */

	/**
	 * @method private
	 * @name closeLightbox
	 * @description Closes active instance.
	 * @param e [object] "Event data"
	 */

	function closeLightbox(e) {
		Functions.killEvent(e);

		if (Instance) {
			Instance.$lightbox.transition("destroy");
			Instance.$container.transition("destroy");

			Instance.$lightbox.addClass(Classes.raw.animating).transition({
				property: "opacity"
			},
			function(e) {
				// Clean up
				Instance.$lightbox.off(Events.namespace);
				Instance.$container.off(Events.namespace);
				$Window.off(Events.namespace);
				$Body.off(Events.namespace);

				Instance.$overlay.remove();
				Instance.$lightbox.remove();

				// Reset Instance
				Instance = null;

				$Window.trigger(Events.close);
			});

			Instance.$lightbox.removeClass(Classes.raw.open);
			Instance.$overlay.removeClass(Classes.raw.open);

			if (Instance.isMobile) {
				$Locks.removeClass(RawClasses.lock);
			}
		}
	}

	/**
	 * @method private
	 * @name openLightbox
	 * @description Opens active instance.
	 */

	function openLightbox() {
		var position = calculatePosition(),
			durration = Instance.isMobile ? 0 : Instance.duration;

		if (!Instance.isMobile) {
			Instance.$controls.css({
				marginTop: ((Instance.contentHeight - Instance.controlHeight - Instance.metaHeight) / 2)
			});
		}

		if (!Instance.visible && Instance.isMobile && Instance.gallery.active) {
			Instance.$content.touch({
				axis: "x",
				swipe: true
			}).on(Events.swipe, onSwipe);
		}

		Instance.$lightbox.transition({
			property: (Instance.contentHeight !== Instance.oldContentHeight) ? "height" : "width"
		},
		function() {
			Instance.$container.transition({
				property: "opacity"
			},
			function() {
				Instance.$lightbox.removeClass(Classes.raw.animating);
				Instance.isAnimating = false;
			});

			Instance.$lightbox.removeClass(Classes.raw.loading);

			Instance.visible = true;

			// Fire open event
			$Window.trigger(Events.open);

			// Start preloading
			if (Instance.gallery.active) {
				preloadGallery();
			}
		});

		if (!Instance.isMobile) {
			Instance.$lightbox.css({
				height: Instance.contentHeight + Instance.paddingVertical,
				width:  Instance.contentWidth  + Instance.paddingHorizontal,
				top:    (!Instance.fixed) ? position.top : 0
			});
		}

		// Trigger event in case the content size hasn't changed
		var contentHasChanged = (Instance.oldContentHeight !== Instance.contentHeight || Instance.oldContentWidth !== Instance.contentWidth);

		if (Instance.isMobile || !contentHasChanged) {
			Instance.$lightbox.transition("resolve");
		}

		// Track content size changes
		Instance.oldContentHeight = Instance.contentHeight;
		Instance.oldContentWidth  = Instance.contentWidth;

		if (Instance.isMobile) {
			$Locks.addClass(RawClasses.lock);
		}
	}

	/**
	 * @method private
	 * @name sizeLightbox
	 * @description Sizes active instance.
	 */

	function sizeLightbox() {
		if (Instance.visible && !Instance.isMobile) {
			var position = calculatePosition();

			Instance.$controls.css({
				marginTop: ((Instance.contentHeight - Instance.controlHeight - Instance.metaHeight) / 2)
			});

			Instance.$lightbox.css({
				height: Instance.contentHeight + Instance.paddingVertical,
				width:  Instance.contentWidth  + Instance.paddingHorizontal,
				top:    (!Instance.fixed) ? position.top : 0
			});
		}
	}

	/**
	 * @method private
	 * @name centerLightbox
	 * @description Centers instance.
	 */

	function centerLightbox() {
		var position = calculatePosition();

		Instance.$lightbox.css({
			top: (!Instance.fixed) ? position.top : 0
		});
	}

	/**
	 * @method private
	 * @name calculatePosition
	 * @description Calculates positions.
	 * @return [object] "Object containing top and left positions"
	 */

	function calculatePosition() {
		if (Instance.isMobile) {
			return {
				left: 0,
				top: 0
			};
		}

		var pos = {
			left: (Formstone.windowWidth - Instance.contentWidth - Instance.paddingHorizontal) / 2,
			top: (Instance.top <= 0) ? ((Formstone.windowHeight - Instance.contentHeight - Instance.paddingVertical) / 2) : Instance.top
		};

		if (Instance.fixed !== true) {
			pos.top += $Window.scrollTop();
		}

		return pos;
	}

	/**
	 * @method private
	 * @name formatCaption
	 * @description Formats caption.
	 * @param $target [jQuery object] "Target element"
	 */

	function formatCaption() {
		var title = this.attr("title"),
			t = (title !== undefined && title) ? title.replace(/^\s+|\s+$/g,'') : false;

		return t ? '<p class="caption">' + t + '</p>' : "";
	}

	/**
	 * @method private
	 * @name loadImage
	 * @description Loads source image.
	 * @param source [string] "Source image URL"
	 */

	function loadImage(source) {
		// Cache current image
		Instance.$image = $("<img>");

		Instance.$image.one(Events.load, function() {
			var naturalSize = calculateNaturalSize(Instance.$image);

			Instance.naturalHeight = naturalSize.naturalHeight;
			Instance.naturalWidth  = naturalSize.naturalWidth;

			if (Instance.retina) {
				Instance.naturalHeight /= 2;
				Instance.naturalWidth  /= 2;
			}

			Instance.$content.prepend(Instance.$image);

			if (Instance.$caption.html() === "") {
				Instance.$caption.hide();
			} else {
				Instance.$caption.show();
			}

			// Size content to be sure it fits the viewport
			sizeImage();

			openLightbox();

		}).error(loadError)
		  .attr("src", source)
		  .addClass(Classes.raw.image);

		// If image has already loaded into cache, trigger load event
		if (Instance.$image[0].complete || Instance.$image[0].readyState === 4) {
			Instance.$image.trigger(Events.load);
		}
	}

	/**
	 * @method private
	 * @name sizeImage
	 * @description Sizes image to fit in viewport.
	 * @param count [int] "Number of resize attempts"
	 */

	function sizeImage() {
		var count = 0;

		Instance.windowHeight = Instance.viewportHeight = Formstone.windowHeight - Instance.paddingVertical;
		Instance.windowWidth  = Instance.viewportWidth  = Formstone.windowWidth  - Instance.paddingHorizontal;

		Instance.contentHeight = Infinity;
		Instance.contentWidth = Infinity;

		Instance.imageMarginTop  = 0;
		Instance.imageMarginLeft = 0;

		while (Instance.contentHeight > Instance.viewportHeight && count < 2) {
			Instance.imageHeight = (count === 0) ? Instance.naturalHeight : Instance.$image.outerHeight();
			Instance.imageWidth  = (count === 0) ? Instance.naturalWidth  : Instance.$image.outerWidth();
			Instance.metaHeight  = (count === 0) ? 0 : Instance.metaHeight;

			if (count === 0) {
				Instance.ratioHorizontal = Instance.imageHeight / Instance.imageWidth;
				Instance.ratioVertical   = Instance.imageWidth  / Instance.imageHeight;

				Instance.isWide = (Instance.imageWidth > Instance.imageHeight);
			}

			// Double check min and max
			if (Instance.imageHeight < Instance.minHeight) {
				Instance.minHeight = Instance.imageHeight;
			}
			if (Instance.imageWidth < Instance.minWidth) {
				Instance.minWidth = Instance.imageWidth;
			}

			if (Instance.isMobile) {
				// Get meta height before sizing
				Instance.$meta.css({
					width: Instance.windowWidth
				});
				Instance.metaHeight = Instance.$meta.outerHeight(true);

				// Content match viewport
				Instance.contentHeight = Instance.viewportHeight - Instance.paddingVertical;
				Instance.contentWidth  = Instance.viewportWidth  - Instance.paddingHorizontal;

				fitImage();

				Instance.imageMarginTop  = (Instance.contentHeight - Instance.targetImageHeight - Instance.metaHeight) / 2;
				Instance.imageMarginLeft = (Instance.contentWidth  - Instance.targetImageWidth) / 2;
			} else {
				// Viewport should match window, less margin, padding and meta
				if (count === 0) {
					Instance.viewportHeight -= (Instance.margin + Instance.paddingVertical);
					Instance.viewportWidth  -= (Instance.margin + Instance.paddingHorizontal);
				}
				Instance.viewportHeight -= Instance.metaHeight;

				fitImage();

				Instance.contentHeight = Instance.targetImageHeight;
				Instance.contentWidth  = Instance.targetImageWidth;
			}

			// Modify DOM

			Instance.$meta.css({
				width: Instance.contentWidth
			});

			Instance.$image.css({
				height: Instance.targetImageHeight,
				width:  Instance.targetImageWidth,
				marginTop:  Instance.imageMarginTop,
				marginLeft: Instance.imageMarginLeft
			});

			if (!Instance.isMobile) {
				Instance.metaHeight = Instance.$meta.outerHeight(true);
				Instance.contentHeight += Instance.metaHeight;
			}

			count ++;
		}
	}

	/**
	 * @method private
	 * @name fitImage
	 * @description Calculates target image size.
	 */

	function fitImage() {
		var height = (!Instance.isMobile) ? Instance.viewportHeight : Instance.contentHeight - Instance.metaHeight,
			width  = (!Instance.isMobile) ? Instance.viewportWidth  : Instance.contentWidth;

		if (Instance.isWide) {
			//WIDE
			Instance.targetImageWidth  = width;
			Instance.targetImageHeight = Instance.targetImageWidth * Instance.ratioHorizontal;

			if (Instance.targetImageHeight > height) {
				Instance.targetImageHeight = height;
				Instance.targetImageWidth  = Instance.targetImageHeight * Instance.ratioVertical;
			}
		} else {
			//TALL
			Instance.targetImageHeight = height;
			Instance.targetImageWidth  = Instance.targetImageHeight * Instance.ratioVertical;

			if (Instance.targetImageWidth > width) {
				Instance.targetImageWidth  = width;
				Instance.targetImageHeight = Instance.targetImageWidth * Instance.ratioHorizontal;
			}
		}

		// MAX
		if (Instance.targetImageWidth > Instance.imageWidth || Instance.targetImageHeight > Instance.imageHeight) {
			Instance.targetImageHeight = Instance.imageHeight;
			Instance.targetImageWidth  = Instance.imageWidth;
		}

		// MIN
		if (Instance.targetImageWidth < Instance.minWidth || Instance.targetImageHeight < Instance.minHeight) {
			if (Instance.targetImageWidth < Instance.minWidth) {
				Instance.targetImageWidth  = Instance.minWidth;
				Instance.targetImageHeight = Instance.targetImageWidth * Instance.ratioHorizontal;
			} else {
				Instance.targetImageHeight = Instance.minHeight;
				Instance.targetImageWidth  = Instance.targetImageHeight * Instance.ratioVertical;
			}
		}
	}

	/**
	 * @method private
	 * @name loadVideo
	 * @description Loads source video.
	 * @param source [string] "Source video URL"
	 */

	function loadVideo(source) {
		Instance.$videoWrapper = $('<div class="' + Classes.raw.videoWrapper + '"></div>');
		Instance.$video = $('<iframe class="' + Classes.raw.video + '" seamless="seamless"></iframe>');

		Instance.$video.attr("src", source)
				   .addClass(Classes.raw.video)
				   .prependTo(Instance.$videoWrapper);

		Instance.$content.prepend(Instance.$videoWrapper);

		sizeVideo();
		openLightbox();
	}

	/**
	 * @method private
	 * @name sizeVideo
	 * @description Sizes video to fit in viewport.
	 */

	function sizeVideo() {
		// Set initial vars
		Instance.windowHeight = Instance.viewportHeight = Instance.contentHeight = Formstone.windowHeight - Instance.paddingVertical;
		Instance.windowWidth  = Instance.viewportWidth  = Instance.contentWidth  = Formstone.windowWidth  - Instance.paddingHorizontal;
		Instance.videoMarginTop = 0;
		Instance.videoMarginLeft = 0;

		if (Instance.isMobile) {
			Instance.$meta.css({
				width: Instance.windowWidth
			});
			Instance.metaHeight = Instance.$meta.outerHeight(true);
			Instance.viewportHeight -= Instance.metaHeight;

			Instance.targetVideoWidth  = Instance.viewportWidth;
			Instance.targetVideoHeight = Instance.targetVideoWidth * Instance.videoRatio;

			if (Instance.targetVideoHeight > Instance.viewportHeight) {
				Instance.targetVideoHeight = Instance.viewportHeight;
				Instance.targetVideoWidth  = Instance.targetVideoHeight / Instance.videoRatio;
			}

			Instance.videoMarginTop = (Instance.viewportHeight - Instance.targetVideoHeight) / 2;
			Instance.videoMarginLeft = (Instance.viewportWidth - Instance.targetVideoWidth) / 2;
		} else {
			Instance.viewportHeight = Instance.windowHeight - Instance.margin;
			Instance.viewportWidth  = Instance.windowWidth - Instance.margin;

			Instance.targetVideoWidth  = (Instance.videoWidth > Instance.viewportWidth) ? Instance.viewportWidth : Instance.videoWidth;
			if (Instance.targetVideoWidth < Instance.minWidth) {
				Instance.targetVideoWidth = Instance.minWidth;
			}
			Instance.targetVideoHeight = Instance.targetVideoWidth * Instance.videoRatio;

			Instance.contentHeight = Instance.targetVideoHeight;
			Instance.contentWidth  = Instance.targetVideoWidth;
		}

		// Update dom

		Instance.$meta.css({
			width: Instance.contentWidth
		});

		Instance.$videoWrapper.css({
			height: Instance.targetVideoHeight,
			width: Instance.targetVideoWidth,
			marginTop: Instance.videoMarginTop,
			marginLeft: Instance.videoMarginLeft
		});

		if (!Instance.isMobile) {
			Instance.metaHeight = Instance.$meta.outerHeight(true);
			Instance.contentHeight = Instance.targetVideoHeight + Instance.metaHeight;
		}
	}

	/**
	 * @method private
	 * @name preloadGallery
	 * @description Preloads previous and next images in gallery for faster rendering.
	 * @param e [object] "Event Data"
	 */

	function preloadGallery(e) {
		var source = '';

		if (Instance.gallery.index > 0) {
			source = Instance.gallery.$items.eq(Instance.gallery.index - 1).attr("href");
			if (source.indexOf("youtube.com/embed") < 0 && source.indexOf("player.vimeo.com/video") < 0) {
				$('<img src="' + source + '">');
			}
		}
		if (Instance.gallery.index < Instance.gallery.total) {
			source = Instance.gallery.$items.eq(Instance.gallery.index + 1).attr("href");
			if (source.indexOf("youtube.com/embed") < 0 && source.indexOf("player.vimeo.com/video") < 0) {
				$('<img src="' + source + '">');
			}
		}
	}

	/**
	 * @method private
	 * @name advanceGallery
	 * @description Advances gallery base on direction.
	 * @param e [object] "Event Data"
	 */

	function advanceGallery(e) {
		Functions.killEvent(e);

		var $control = $(e.currentTarget);

		if (!Instance.isAnimating && !$control.hasClass(Classes.raw.control_disabled)) {
			Instance.isAnimating = true;

			Instance.gallery.index += ($control.hasClass(Classes.raw.control_next)) ? 1 : -1;
			if (Instance.gallery.index > Instance.gallery.total) {
				Instance.gallery.index = (Instance.infinite) ? 0 : Instance.gallery.total;
			}
			if (Instance.gallery.index < 0) {
				Instance.gallery.index = (Instance.infinite) ? Instance.gallery.total : 0;
			}

			Instance.$lightbox.addClass( [Classes.raw.loading, Classes.raw.animating].join(" "));

			Instance.$container.transition({
				property: "opacity"
			},
			function() {
				if (typeof Instance.$image !== 'undefined') {
					Instance.$image.remove();
				}
				if (typeof Instance.$videoWrapper !== 'undefined') {
					Instance.$videoWrapper.remove();
				}
				Instance.$el = Instance.gallery.$items.eq(Instance.gallery.index);

				Instance.$caption.html(Instance.formatter.call(Instance.$el, Instance));
				Instance.$position.find(Classes.position_current).html(Instance.gallery.index + 1);

				var source = Instance.$el.attr("href"),
					isVideo = ( source.indexOf("youtube.com/embed") > -1 || source.indexOf("player.vimeo.com/video") > -1 );

				if (isVideo) {
					loadVideo(source);
				} else {
					loadImage(source);
				}

				updateGalleryControls();

			});
		}
	}

	/**
	 * @method private
	 * @name updateGalleryControls
	 * @description Updates gallery control states.
	 */

	function updateGalleryControls() {
		Instance.$controls.removeClass(Classes.raw.control_disabled);

		if (!Instance.infinite) {
			if (Instance.gallery.index === 0) {
				Instance.$controls.filter(Classes.control_previous).addClass(RawClasses.control_disabled);
			}
			if (Instance.gallery.index === Instance.gallery.total) {
				Instance.$controls.filter(Classes.control_next).addClass(RawClasses.control_disabled);
			}
		}
	}

	/**
	 * @method private
	 * @name onKeyDown
	 * @description Handles keypress in gallery.
	 * @param e [object] "Event data"
	 */

	function onKeyDown(e) {
		if (Instance.gallery.active && (e.keyCode === 37 || e.keyCode === 39)) {
			Functions.killEvent(e);

			Instance.$controls.filter((e.keyCode === 37) ? Classes.control_previous : Classes.control_next).trigger(Events.click);
		} else if (e.keyCode === 27) {
			Instance.$close.trigger(Events.click);
		}
	}

	/**
	 * @method private
	 * @name cloneElement
	 * @description Clones target inline element.
	 * @param id [string] "Target element id"
	 */

	function cloneElement(id) {
		var $clone = $(id).find("> :first-child").clone();
		appendObject($clone);
	}

	/**
	 * @method private
	 * @name loadURL
	 * @description Load URL into iframe.
	 * @param source [string] "Target URL"
	 */

	function loadURL(source) {
		source = source + ((source.indexOf("?") > -1) ? "&" + Instance.requestKey + "=true" : "?" + Instance.requestKey + "=true");
		var $iframe = $('<iframe class="' + Classes.raw.iframe + '" src="' + source + '"></iframe>');
		appendObject($iframe);
	}

	/**
	 * @method private
	 * @name appendObject
	 * @description Appends and sizes object.
	 * @param $object [jQuery Object] "Object to append"
	 */

	function appendObject($object) {
		Instance.$content.append($object);
		sizeContent($object);
		openLightbox();
	}

	/**
	 * @method private
	 * @name sizeContent
	 * @description Sizes jQuery object to fir in viewport.
	 * @param $object [jQuery Object] "Object to size"
	 */

	function sizeContent($object) {
		Instance.windowHeight	  = Formstone.windowHeight - Instance.paddingVertical;
		Instance.windowWidth	  = Formstone.windowWidth  - Instance.paddingHorizontal;
		Instance.objectHeight	  = $object.outerHeight(true);
		Instance.objectWidth	  = $object.outerWidth(true);
		Instance.targetHeight	  = Instance.targetHeight || (Instance.$el ? Instance.$el.data(Namespace + "-height") : null);
		Instance.targetWidth	  = Instance.targetWidth  || (Instance.$el ? Instance.$el.data(Namespace + "-width")  : null);
		Instance.maxHeight		  = (Instance.windowHeight < 0) ? Instance.minHeight : Instance.windowHeight;
		Instance.isIframe		  = $object.is("iframe");
		Instance.objectMarginTop  = 0;
		Instance.objectMarginLeft = 0;

		if (!Instance.isMobile) {
			Instance.windowHeight -= Instance.margin;
			Instance.windowWidth  -= Instance.margin;
		}

		Instance.contentHeight = (Instance.targetHeight) ? Instance.targetHeight : (Instance.isIframe || Instance.isMobile) ? Instance.windowHeight : Instance.objectHeight;
		Instance.contentWidth  = (Instance.targetWidth)  ? Instance.targetWidth  : (Instance.isIframe || Instance.isMobile) ? Instance.windowWidth  : Instance.objectWidth;

		if ((Instance.isIframe || Instance.isObject) && Instance.isMobile) {
			Instance.contentHeight = Instance.windowHeight;
			Instance.contentWidth  = Instance.windowWidth;
		} else if (Instance.isObject) {
			Instance.contentHeight = (Instance.contentHeight > Instance.windowHeight) ? Instance.windowHeight : Instance.contentHeight;
			Instance.contentWidth  = (Instance.contentWidth  > Instance.windowWidth)  ? Instance.windowWidth  : Instance.contentWidth;
		}
	}

	/**
	 * @method private
	 * @name loadError
	 * @description Error when resource fails to load.
	 * @param e [object] "Event data"
	 */

	function loadError(e) {
		var $error = $('<div class="' + Classes.raw.error + '"><p>Error Loading Resource</p></div>');

		// Clean up
		Instance.type = "element";
		Instance.$meta.remove();

		Instance.$image.off(Events.namespace);

		appendObject($error);
	}

	/**
	 * @method private
	 * @name onSwipe
	 * @description Handles swipe event
	 * @param e [object] "Event data"
	 */

	function onSwipe(e) {
		Instance.$controls.filter((e.directionX === "left") ? Classes.control_next : Classes.control_previous).trigger(Events.click);
	}

	/**
	 * @method private
	 * @name calculateNaturalSize
	 * @description Determines natural size of target image.
	 * @param $img [jQuery object] "Source image object"
	 * @return [object | boolean] "Object containing natural height and width values or false"
	 */

	function calculateNaturalSize($img) {
		var node = $img[0],
			img = new Image();

		if (typeof node.naturalHeight !== "undefined") {
			return {
				naturalHeight: node.naturalHeight,
				naturalWidth:  node.naturalWidth
			};
		} else {
			if (node.tagName.toLowerCase() === 'img') {
				img.src = node.src;
				return {
					naturalHeight: img.height,
					naturalWidth:  img.width
				};
			}
		}

		return false;
	}

	/**
	 * @plugin
	 * @name Lightbox
	 * @description A jQuery plugin for simple modals.
	 * @type widget
	 * @dependency core.js
	 * @dependency transition.js
	 */

	var Plugin = Formstone.Plugin("lightbox", {
			widget: true,

			/**
			 * @options
			 * @param customClass [string] <''> "Class applied to instance"
			 * @param extensions [array] <"jpg", "sjpg", "jpeg", "png", "gif"> "Image type extensions"
			 * @param fixed [boolean] <false> "Flag for fixed positioning"
			 * @param formatter [function] <$.noop> "Caption format function"
			 * @param infinite [boolean] <false> "Flag for infinite galleries"
			 * @param labels.close [string] <'Close'> "Close button text"
			 * @param labels.count [string] <'of'> "Gallery count separator text"
			 * @param labels.next [string] <'Next'> "Gallery control text"
			 * @param labels.previous [string] <'Previous'> "Gallery control text"
			 * @param margin [int] <50> "Margin used when sizing (single side)"
			 * @param minHeight [int] <100> "Minimum height of modal"
			 * @param minWidth [int] <100> "Minimum width of modal"
			 * @param mobile [boolean] <false> "Flag to force 'mobile' rendering"
			 * @param retina [boolean] <false> "Flag to use 'retina' sizing (halves natural sizes)"
			 * @param requestKey [string] <'fs-lightbox'> "GET variable for ajax / iframe requests"
			 * @param top [int] <0> "Target top position; over-rides centering"
			 * @param videoRadio [number] <0.5625> "Video height / width ratio (9 / 16 = 0.5625)"
			 * @param videoWidth [int] <600> "Video target width"
			 */

			defaults: {
				customClass    : "",
				extensions     : [ "jpg", "sjpg", "jpeg", "png", "gif" ],
				fixed          : false,
				formatter      : formatCaption,
				infinite       : false,
				labels: {
					close      : "Close",
					count      : "of",
					next       : "Next",
					previous   : "Previous"
				},
				margin         : 50,
				minHeight      : 100,
				minWidth       : 100,
				mobile         : false,
				retina         : false,
				requestKey     : "fs-lightbox",
				top            : 0,
				videoRatio     : 0.5625,
				videoWidth     : 600
			},

			classes: [
				"loading",
				"animating",
				"fixed",
				"mobile",
				"inline",
				"iframed",
				"open",
				"overlay",
				"close",
				"loading_icon",
				"container",
				"content",
				"image",
				"video",
				"video_wrapper",
				"meta",
				"control",
				"control_previous",
				"control_next",
				"control_disabled",
				"position",
				"position_current",
				"position_total",
				"caption",
				"iframe",
				"error",
				"lock"
			],

			/**
			 * @events
			 * @event open.lightbox "Lightbox opened; Triggered on window"
			 * @event close.lightbox "Lightbox closed; Triggered on window"
			 */

			events: {
				open     : "open",
				close    : "close",

				swipe    : "swipe"
			},

			methods: {
				_setup        : setup,
				_construct    : construct,
				_destruct     : destruct,
				_resize       : resize,

				resize        : resizeLightbox
			},

			utilities: {
				_initialize    : initialize,

				close          : closeLightbox
			}
		}),

		// Localize References

		Namespace     = Plugin.namespace,
		Defaults      = Plugin.defaults,
		Classes       = Plugin.classes,
		RawClasses    = Classes.raw,
		Events        = Plugin.events,
		Functions     = Plugin.functions,
		Window        = Formstone.window,
		$Window       = Formstone.$window,
		$Body         = null,

		// Internal

		$Locks        = null,

		// Singleton

		Instance      = null;

})(jQuery, Formstone);
;(function ($, Formstone, undefined) {

	"use strict";

	/**
	 * @method private
	 * @name initialize
	 * @description Initializes plugin.
	 * @param opts [object] "Plugin options"
	 */

	function initialize(options) {
		options = options || {};

		// Build Media Queries

		for (var i in MQStrings) {
			if (MQStrings.hasOwnProperty(i)) {
				Defaults[i] = (options[i]) ? $.merge(options[i], Defaults[i]) : Defaults[i];
			}
		}

		Defaults = $.extend(Defaults, options);

		// Sort

		Defaults.minWidth.sort(Functions.sortDesc);
		Defaults.maxWidth.sort(Functions.sortAsc);
		Defaults.minHeight.sort(Functions.sortDesc);
		Defaults.maxHeight.sort(Functions.sortAsc);

		// Bind Media Query Matches

		for (var j in MQStrings) {
			if (MQStrings.hasOwnProperty(j)) {
				MQMatches[j] = {};
				for (var k in Defaults[j]) {
					if (Defaults[j].hasOwnProperty(k)) {
						var mq = window.matchMedia( "(" + MQStrings[j] + ": " + (Defaults[j][k] === Infinity ? 100000 : Defaults[j][k]) + Defaults.unit + ")" );
						mq.addListener( onStateChange );
						MQMatches[j][ Defaults[j][k] ] = mq;
					}
				}
			}
		}

		// Initial Trigger

		onStateChange();
	}

	/**
	 * @method
	 * @name bind
	 * @description Binds callbacks to media query matching.
	 * @param key [string] "Instance key"
	 * @param media [string] "Media query to match"
	 * @param data [object] "Object containing 'enter' and 'leave' callbacks"
	 * @example $.mediaquery("bind", "key", "(min-width: 500px)", { ... });
	 */

	function bind(key, media, data) {
		var mq = Window.matchMedia(media),
			mqKey = createKey(mq.media);

		if (!Bindings[mqKey]) {
			Bindings[mqKey] = {
				mq        : mq,
				active    : true,
				enter     : {},
				leave     : {}
			};

			Bindings[mqKey].mq.addListener(onBindingChange);
		}

		for (var i in data) {
			if (data.hasOwnProperty(i) && Bindings[mqKey].hasOwnProperty(i)) {
				Bindings[mqKey][i][key] = data[i];
			}
		}

		onBindingChange(Bindings[mqKey].mq);
	}

	/**
	 * @method
	 * @name unbind
	 * @description Unbinds all callbacks from media query.
	 * @param key [string] "Instance key"
	 * @param media [string] "Media query to unbind; defaults to all"
	 * @example $.mediaquery("unbind", "key");
	 */

	function unbind(key, media) {
		if (!key) {
			return;
		}

		if (media) {
			// unbind specific query
			var mqKey = createKey(media);

			if (Bindings[mqKey]) {
				if (Bindings[mqKey].enter[key]) {
					delete Bindings[mqKey].enter[key];
				}

				if (Bindings[mqKey].leave[key]) {
					delete Bindings[mqKey].leave[key];
				}
			}
		} else {
			// unbind all
			for (var i in Bindings) {
				if (Bindings.hasOwnProperty(i)) {
					if (Bindings[i].enter[key]) {
						delete Bindings[i].enter[key];
					}

					if (Bindings[i].leave[key]) {
						delete Bindings[i].leave[key];
					}
				}
			}
		}
	}

	/**
	 * @method private
	 * @name setState
	 * @description Sets current media query match state.
	 */

	function setState() {
		State = {
			unit: Defaults.unit
		};

		for (var i in MQStrings) {
			if (MQStrings.hasOwnProperty(i)) {

				for (var j in MQMatches[i]) {
					if (MQMatches[i].hasOwnProperty(j) && MQMatches[i][j].matches) {

						var state = (j === "Infinity") ? Infinity : parseInt(j, 10);

						if (i.indexOf("max") > -1) {
							if (!State[i] || state < State[i]) {
								State[i] = state;
							}
						} else {
							if (!State[i] || state > State[i]) {
								State[i] = state;
							}
						}

					}
				}

			}
		}
	}

	/**
	 * @method private
	 * @name onStateChange
	 * @description Handles media query changes.
	 */

	function onStateChange() {
		setState();

		$Window.trigger(Events.mqChange, [ State ]);
	}

	/**
	 * @method private
	 * @name onBindingChange
	 * @description Handles a binding's media query change.
	 */

	function onBindingChange(mq) {
		var mqkey      = createKey(mq.media),
			binding    = Bindings[mqkey],
			event      = mq.matches ? Events.enter : Events.leave;

		if (binding && binding.active || (!binding.active && mq.matches)) {
			for (var i in binding[event]) {
				if (binding[event].hasOwnProperty(i)) {
					binding[event][i].apply(binding.mq);
				}
			}

			binding.active = true;
		}
	}

	/**
	 * @method private
	 * @name createKey
	 * @description Creates valid object key from string.
	 * @param text [String] "String to create key from"
	 * @return [string] Valid object key
	 */

	function createKey(text) {
		return text.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '').replace(/^\s+|\s+$/g,'');
	}

	/**
	 * @method
	 * @name state
	 * @description Returns the current state.
	 * @return [object] "Current state object"
	 * @example var state = $.mediaquery("state");
	 */

	/**
	 * @method private
	 * @name getState
	 * @description Returns the current state.
	 * @return [object] "Current state object"
	 */

	function getState() {
		return State;
	}

	/**
	 * @plugin
	 * @name Media Query
	 * @description A jQuery plugin for responsive media query events.
	 * @type utility
	 * @dependency core.js
	 */

	var Plugin = Formstone.Plugin("mediaquery", {
			utilities: {
				_initialize    : initialize,
				state          : getState,
				bind           : bind,
				unbind         : unbind
			},

			/**
			 * @events
			 * @event mqchange.mediaquery "Change to a media query match; Triggered on window"
			 */

			events: {
				mqChange    : "mqchange"
			}
		}),

		/**
		 * @options
		 * @param minWidth [array] <[ 0 ]> "Array of min-widths"
		 * @param maxWidth [array] <[ Infinity ]> "Array of max-widths"
		 * @param minHeight [array] <[ 0 ]> "Array of min-heights"
		 * @param maxHeight [array] <[ Infinity ]> "Array of max-heights"
		 * @param unit [string] <'px'> "Unit to use when matching widths and heights"
		 */

		Defaults = {
			minWidth     : [ 0 ],
			maxWidth     : [ Infinity ],
			minHeight    : [ 0 ],
			maxHeight    : [ Infinity ],
			unit         : "px"
		},

		// Raw events for switch
		Events = $.extend(Plugin.events, {
			enter       : "enter",
			leave       : "leave"
		}),

		// Localize References

		$Window        = Formstone.$window,
		Window         = $Window[0],

		Functions      = Plugin.functions,

		// Internal

		State          = null,
		Bindings       = [],
		MQMatches      = {},
		MQStrings      = {
			minWidth:     "min-width",
			maxWidth:     "max-width",
			minHeight:    "min-height",
			maxHeight:    "max-height"
		};

})(jQuery, Formstone);
;(function ($, Formstone, undefined) {

	"use strict";

	/**
	 * @method private
	 * @name setup
	 * @description Setup plugin.
	 */

	function setup() {
		$Locks = $("html, body");
	}

	/**
	 * @method private
	 * @name construct
	 * @description Builds instance.
	 * @param data [object] "Instance data"
	 */

	function construct(data) {
		// guid
		data.guid         = "__" + (GUID++);
		data.eventGuid    = Events.namespace + data.guid;
		data.rawGuid      = RawClasses.base + data.guid;
		data.classGuid    = "." + data.rawGuid;

		data.isToggle     = (data.type === "toggle");

		if (data.isToggle) {
			data.gravity  = "";
		}

		var baseClass     = RawClasses.base,
			typeClass     = [baseClass, data.type].join("-"),
			gravityClass  = data.gravity ? [typeClass, data.gravity].join("-") : "",
			classGroup    = [data.rawGuid, data.customClass].join(" ");

		data.handle       = this.data(Namespace + "-handle");
		data.content      = this.data(Namespace + "-content");

		data.handleClasses = [
			RawClasses.handle,
			RawClasses.handle.replace(baseClass, typeClass),
			RawClasses.handle.replace(baseClass, gravityClass),
			classGroup
		].join(" ");

		data.navClasses = [
			RawClasses.nav.replace(baseClass, typeClass),
			RawClasses.nav.replace(baseClass, gravityClass),
			classGroup
		].join(" ");

		data.contentClasses = [
			RawClasses.content.replace(baseClass, typeClass),
			RawClasses.content.replace(baseClass, gravityClass),
			classGroup
		].join(" ");

		// DOM

		data.$nav        = this.addClass(data.navClasses);
		data.$handle     = $(data.handle).addClass(data.handleClasses);
		data.$content    = $(data.content).addClass(data.contentClasses);
		data.$animate    = $().add(data.$nav).add(data.$content);

		if (data.label) {
			data.originalLabel = data.$handle.text();
		}

		// toggle

		data.$handle.attr("data-swap-target", data.classGuid)
					.on("activate.swap" + data.eventGuid, data, onOpen)
					.on("deactivate.swap" + data.eventGuid, data, onClose)
					.on("enable.swap" + data.eventGuid, data, onEnable)
					.on("disable.swap" + data.eventGuid, data, onDisable)
					.swap({
						maxWidth: data.maxWidth,
						classes: {
							target  : data.classGuid,
							enabled : Classes.enabled,
							active  : Classes.open,
							raw: {
								target  : data.rawGuid,
								enabled : RawClasses.enabled,
								active  : RawClasses.open
							}
						}
					});
	}

	/**
	 * @method private
	 * @name destruct
	 * @description Tears down instance.
	 * @param data [object] "Instance data"
	 */

	function destruct(data) {
		data.$content.removeClass(data.contentClasses)
					 .off(Events.namespace);

		data.$handle.attr("data-swap-target", "")
					.removeClass(data.handleClasses)
					.off(data.eventGuid)
					.text(data.originalLabel)
					.swap("destroy");

		this.removeClass(data.navClasses)
			.off(Events.namespace);
	}

	/**
	 * @method
	 * @name open
	 * @description Opens instance.
	 * @example $(".target").navigation("open");
	 */

	function open(data) {
		data.$handle.swap("activate");
	}

	/**
	 * @method
	 * @name close
	 * @description Closes instance.
	 * @example $(".target").navigation("close");
	 */

	function close(data) {
		data.$handle.swap("deactivate");
	}

	/**
	 * @method
	 * @name enable
	 * @description Enables instance.
	 * @example $(".target").navigation("enable");
	 */

	function enable(data) {
		data.$handle.swap("enable");
	}

	/**
	 * @method
	 * @name disable
	 * @description Disables instance.
	 * @example $(".target").navigation("disable");
	 */

	function disable(data) {
		data.$handle.swap("disable");
	}

	/**
	 * @method private
	 * @name onOpen
	 * @description Handles nav open event.
	 * @param e [object] "Event data"
	 */

	function onOpen(e) {
		var data = e.data;

		data.$el.trigger(Events.open);

		data.$content.addClass(RawClasses.open)
					 .one(Events.clickTouchStart, function() {
						close(data);
					 });

		if (data.label) {
			data.$handle.text(data.labels.open);
		}

		if (!data.isToggle) {
			$Locks.addClass(RawClasses.lock);
		}
	}

	/**
	 * @method private
	 * @name onClose
	 * @description Handles nav close event.
	 * @param e [object] "Event data"
	 */

	function onClose(e) {
		var data = e.data;

		data.$el.trigger(Events.close);

		data.$content.removeClass(RawClasses.open)
					 .off(Events.namespace);

		if (data.label) {
			data.$handle.text(data.labels.closed);
		}

		if (!data.isToggle) {
			$Locks.removeClass(RawClasses.lock);
		}
	}

	/**
	 * @method private
	 * @name onEnable
	 * @description Handles nav enable event.
	 * @param e [object] "Event data"
	 */

	function onEnable(e) {
		var data = e.data;

		data.$content.addClass(RawClasses.enabled);

		setTimeout(function() {
			data.$animate.addClass(RawClasses.animated);
		}, 0);

		if (data.label) {
			data.$handle.text(data.labels.closed);
		}
	}

	/**
	 * @method private
	 * @name onDisable
	 * @description Handles nav disable event.
	 * @param e [object] "Event data"
	 */

	function onDisable(e) {
		var data = e.data;

		data.$content.removeClass(RawClasses.enabled, RawClasses.animated);
		data.$animate.removeClass(RawClasses.animated);

		if (data.label) {
			data.$handle.text(data.originalLabel);
		}
	}

	/**
	 * @plugin
	 * @name Navigation
	 * @description A jQuery plugin for simple responsive navigation.
	 * @type widget
	 * @dependency core.js
	 * @dependency mediaquery.js
	 * @dependency swap.js
	 * @dependency touch.js
	 */

	var Plugin = Formstone.Plugin("navigation", {
			widget: true,

			/**
			 * @options
			 * @param customClass [string] <''> "Class applied to instance"
			 * @param gravity [string] <'left'> "Gravity of 'push' and 'overlay' navigation; 'right', 'left'"
			 * @param label [boolean] <true> "Display handle width label"
			 * @param labels.closed [string] <'Menu'> "Closed state text"
			 * @param labels.open [string] <'Close'> "Open state text"
			 * @param maxWidth [string] <'980px'> "Width at which to auto-disable plugin"
			 * @param type [string] <'toggle'> "Type of navigation; 'toggle', 'push', 'overlay'"
			 */

			defaults: {
				customClass    : "",
				gravity        : "left",
				label          : true,
				labels: {
					closed     : "Menu",
					open       : "Close"
				},
				maxWidth       : "980px",
				type           : "toggle"
			},

			classes: [
				"handle",
				"nav",
				"content",
				"animated",
				"enabled",
				"open",
				"toggle",
				"push",
				"overlay",
				"left",
				"right",
				"lock"
			],

			/**
			 * @events
			 * @event open.navigation "Navigation opened"
			 * @event close.navigation "Navigation closed"
			 */

			events: {
				tap      : "tap",
				open     : "open",
				close    : "close"
			},

			methods: {
				_setup        : setup,
				_construct    : construct,
				_destruct     : destruct,

				// Public Methods

				open          : open,
				close         : close,
				enable        : enable,
				disable       : disable
			}
		}),

		// Localize References

		Namespace     = Plugin.namespace,
		Classes       = Plugin.classes,
		RawClasses    = Classes.raw,
		Events        = Plugin.events,
		Functions     = Plugin.functions,

		// Internal

		GUID          = 0,
		$Locks        = null;

})(jQuery, Formstone);
;(function ($, Formstone, undefined) {

	"use strict";

	/**
	 * @method private
	 * @name setup
	 * @description Setup plugin.
	 */

	function setup() {
		$Body = Formstone.$body;
	}

	/**
	 * @method private
	 * @name construct
	 * @description Builds instance.
	 * @param data [object] "Instance data"
	 */

	function construct(data) {
		var min = parseFloat(this.attr("min")),
			max = parseFloat(this.attr("max"));

		data.min  = (min || min === 0) ? min : false;
		data.max  = (max || max === 0) ? max : false;
		data.step = parseFloat(this.attr("step")) || 1;
		data.timer        = null;
		data.digits       = significantDigits(data.step);
		data.disabled     = this.prop("disabled");

		var html = "";
		html += '<button type="button" class="' + [RawClasses.arrow, RawClasses.up].join(" ") + '">'   + data.labels.up + '</button>';
		html += '<button type="button" class="' + [RawClasses.arrow, RawClasses.down].join(" ") + '">' + data.labels.down + '</button>';

		// Modify DOM
		this.wrap('<div class="' + [RawClasses.base, data.customClass, (data.disabled) ? RawClasses.disabled : ""].join(" ") + '"></div>')
			.after(html);

		// Store data
		data.$container    = this.parent(Classes.base);
		data.$arrows       = data.$container.find(Classes.arrow);

		// Bind keyboard events
		this.on(Events.keyPress, Classes.element, data, onKeyup);

		// Bind click events
		data.$container.on( [Events.touchStart, Events.mouseDown].join(" "), Classes.arrow, data, onMouseDown);
	}

	/**
	 * @method private
	 * @name destruct
	 * @description Tears down instance.
	 * @param data [object] "Instance data"
	 */

	function destruct(data) {
		data.$arrows.remove();

		this.unwrap()
			.off(Events.namespace);
	}

	/**
	 * @method
	 * @name enable
	 * @description Enables target instance
	 * @example $(".target").number("enable");
	 */

	function enable(data) {
		if (data.disabled) {
			this.prop("disabled", false);

			data.$container.removeClass(RawClasses.disabled);

			data.disabled = false;
		}
	}

	/**
	 * @method
	 * @name disable
	 * @description Disables target instance
	 * @example $(".target").number("disable");
	 */

	function disable(data) {
		if (!data.disabled) {
			this.prop("disabled", true);

			data.$container.addClass(RawClasses.disabled);

			data.disabled = true;
		}
	}

	/**
	 * @method private
	 * @name onKeyup
	 * @description Handles keypress event on inputs
	 * @param e [object] "Event data"
	 */

	function onKeyup(e) {
		var data = e.data;

		// If arrow keys
		if (e.keyCode === 38 || e.keyCode === 40) {
			e.preventDefault();

			step(data, (e.keyCode === 38) ? data.step : -data.step);
		}
	}

	/**
	 * @method private
	 * @name onMouseDown
	 * @description Handles mousedown event on instance arrows
	 * @param e [object] "Event data"
	 */

	function onMouseDown(e) {
		Functions.killEvent(e);

		// Make sure we reset the states
		onMouseUp(e);

		var data = e.data;

		if (!data.disabled) {
			var change = $(e.target).hasClass(RawClasses.up) ? data.step : -data.step;

			data.timer = Functions.startTimer(data.timer, 110, function() {
				step(data, change, false);
			}, true);

			step(data, change);

			$Body.on( [Events.touchEnd, Events.mouseUp].join(" "), data, onMouseUp);
		}
	}

	/**
	 * @method private
	 * @name onMouseUp
	 * @description Handles mouseup event on instance arrows
	 * @param e [object] "Event data"
	 */

	function onMouseUp(e) {
		Functions.killEvent(e);

		var data = e.data;

		Functions.clearTimer(data.timer, true);

		$Body.off(Events.namespace);
	}

	/**
	 * @method private
	 * @name step
	 * @description Steps through values
	 * @param e [object] "Event data"
	 * @param change [string] "Change value"
	 */

	function step(data, change) {
		var oValue = parseFloat(data.$el.val()),
			value = change;

		if ($.type(oValue) === "undefined" || isNaN(oValue)) {
			if (data.min !== false) {
				value = data.min;
			} else {
				value = 0;
			}
		} else if (data.min !== false && oValue < data.min) {
			value = data.min;
		} else {
			value += oValue;
		}

		var diff = (value - data.min) % data.step;
		if (diff !== 0) {
			value -= diff;
		}

		if (data.min !== false && value < data.min) {
			value = data.min;
		}
		if (data.max !== false && value > data.max) {
			value -= data.step;
		}

		if (value !== oValue) {
			value = round(value, data.digits);

			data.$el.val(value)
					.trigger(Events.raw.change);
		}
	}

	/**
	 * @method private
	 * @name significantDigits
	 * @description Analyzes and returns significant digit count
	 * @param value [float] "Value to analyze"
	 * @return [int] "Number of significant digits"
	 */
	function significantDigits(value) {
		var test = String(value);

		if (test.indexOf(".") > -1) {
			return test.length - test.indexOf(".") - 1;
		} else {
			return 0;
		}
	}

	/**
	 * @method private
	 * @name round
	 * @description Rounds a number to a sepcific significant digit count
	 * @param value [float] "Value to round"
	 * @param digits [float] "Digits to round to"
	 * @return [number] "Rounded number"
	 */

	function round(value, digits) {
		var exp = Math.pow(10, digits);
		return Math.round(value * exp) / exp;
	}

	/**
	 * @plugin
	 * @name Number
	 * @description A jQuery plugin for cross browser number inputs.
	 * @type widget
	 * @dependency core.js
	 */

	var Plugin = Formstone.Plugin("number", {
			widget: true,

			/**
			 * @options
			 * @param customClass [string] <''> "Class applied to instance"
			 * @param labels.up [string] <'Up'> "Up arrow label"
			 * @param labels.down [string] <'Down'> "Down arrow label"
			 */

			defaults: {
				customClass    : "",
				labels : {
					up         : "Up",
					down       : "Down"
				}
			},

			classes: [
				"arrow",
				"up",
				"down",
				"disabled"
			],

			methods: {
				_setup        : setup,
				_construct    : construct,
				_destruct     : destruct,

				// Public Methods

				enable        : enable,
				disable       : disable
			},

			events: {
				tap    : "tap"
			}
		}),

		// Localize References

		Classes       = Plugin.classes,
		RawClasses    = Classes.raw,
		Events        = Plugin.events,
		Functions     = Plugin.functions,

		$Body    = null;

})(jQuery, Formstone);
;(function ($, Formstone, undefined) {

	"use strict";

	/**
	 * @method private
	 * @name construct
	 * @description Builds instance.
	 * @param data [object] "Instance data"
	 */

	function construct(data) {
		data.mq       = "(max-width:" + (data.maxWidth === Infinity ? "100000px" : data.maxWidth) + ")";
		data.mqGuid   = RawClasses.base + "__" + (GUID++);

		var html = "";
		html += '<button type="button" class="' + [RawClasses.control, RawClasses.control_previous].join(" ") + '">' + data.labels.previous + '</button>';
		html += '<button type="button" class="' + [RawClasses.control, RawClasses.control_next].join(" ") + '">' + data.labels.next + '</button>';
		html += '<div class="' + RawClasses.position + '">';
		html += '<span class="' + RawClasses.current + '">0</span>';
		html += ' ' + data.labels.count + ' ';
		html += '<span class="' + RawClasses.total + '">0</span>';
		html += '</div>';
		html += '<select class="' + RawClasses.select + '" tab-index="-1"></select>';

		this.addClass(RawClasses.base)
			.wrapInner('<div class="' + RawClasses.pages + '"></div>')
			.prepend(html);

		data.$controls  = this.find(Classes.control);
		data.$pages     = this.find(Classes.pages);
		data.$items     = data.$pages.children().addClass(RawClasses.page);
		data.$position  = this.find(Classes.position);
		data.$select    = this.find(Classes.select);
		data.index      = -1;

		data.total = data.$items.length - 1;

		var index = data.$items.index(data.$items.filter(Classes.active));

		data.$items.eq(0)
				   .addClass(RawClasses.first)
				   .after('<span class="' + RawClasses.ellipsis + '">&hellip;</span>')
				   .end()
				   .eq(data.total)
				   .addClass(RawClasses.last)
				   .before('<span class="' + RawClasses.ellipsis + '">&hellip;</span>');

		data.$ellipsis = data.$pages.find(Classes.ellipsis);

		buildMobilePages(data);

		this.on(Events.clickTouchStart, Classes.page, data, onPageClick)
			.on(Events.clickTouchStart, Classes.control, data, onControlClick)
			.on(Events.clickTouchStart, Classes.position, data, onPositionClick)
			.on(Events.change, Classes.select, onPageSelect);

		$.mediaquery("bind", data.mqGuid, data.mq, {
			enter: function() {
				data.$el.addClass(RawClasses.mobile);
			},
			leave: function() {
				data.$el.removeClass(RawClasses.mobile);
			}
		});

		updatePage(data, index);
	}

	/**
	 * @method private
	 * @name destruct
	 * @description Tears down instance.
	 * @param data [object] "Instance data"
	 */

	function destruct(data) {
		$.mediaquery("unbind", data.mqGuid, data.mq);

		data.$controls.remove();
		data.$ellipsis.remove();
		data.$select.remove();
		data.$position.remove();
		data.$items.removeClass( [RawClasses.page, RawClasses.active, RawClasses.visible, RawClasses.first, RawClasses.last].join(" ") )
				   .unwrap();

		this.removeClass(RawClasses.base)
			.off(Events.namespace);
	}

	/**
	 * @method
	 * @name jump
	 * @description Jump instance of plugin to specific page
	 * @example $(".target").pagination("jump", 1);
	 */

	function jump(data, index) {
		data.$items.eq(index).trigger(Events.raw.click);
	}

	/**
	 * @method private
	 * @name onControlClick
	 * @description Traverses pages
	 * @param e [object] "Event data"
	 */

	function onControlClick(e) {
		Functions.killEvent(e);

		var data = e.data,
			index = data.index + ( $(e.currentTarget).hasClass(RawClasses.control_previous) ? -1 : 1 );

		if (index >= 0) {
			data.$items.eq(index).trigger(Events.raw.click);
		}
	}

	/**
	 * @method private
	 * @name onPageSelect
	 * @description Jumps to a page
	 * @param e [object] "Event data"
	 */

	function onPageSelect(e) {
		Functions.killEvent(e);

		var data = e.data,
			$target = $(e.currentTarget),
			index = parseInt($target.val(), 10);

		data.$items.eq(index).trigger(Events.raw.click);
	}

	/**
	 * @method private
	 * @name onPageClick
	 * @description Jumps to a page
	 * @param e [object] "Event data"
	 */

	function onPageClick(e) {
		Functions.killEvent(e);

		var data = e.data,
			index = data.$items.index( $(e.currentTarget) );

		/*
		if (data.ajax) {
			Functions.killEvent(e);
		}
		*/

		updatePage(data, index);
	}

	/**
	 * @method private
	 * @name onPositionClick
	 * @description Opens mobile select
	 * @param e [object] "Event data"
	 */

	function onPositionClick(e) {
		Functions.killEvent(e);

		var data = e.data;

		if (Formstone.isMobile && !Formstone.isFirefoxMobile) {
			// Only open select on non-firefox mobile
			var el = data.$select[0];
			if (window.document.createEvent) { // All
				var evt = window.document.createEvent("MouseEvents");
				evt.initMouseEvent("mousedown", false, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
				el.dispatchEvent(evt);
			} else if (el.fireEvent) { // IE
				el.fireEvent("onmousedown");
			}
		}
	}

	/**
	 * @method private
	 * @name updatePage
	 * @description Updates pagination state
	 * @param data [object] "Instance data"
	 * @param index [int] "New page index"
	 */

	function updatePage(data, index) {
		if (index < 0) {
			index = 0;
		}
		if (index > data.total) {
			index = data.total;
		}

		if (index !== data.index) {
			data.index = index;

			var start = data.index - data.visible,
				end = data.index + (data.visible + 1);

			if (start < 0) {
				start = 0;
			}
			if (end > data.total) {
				end = data.total;
			}

			data.$items.removeClass(RawClasses.visible)
					   .filter(Classes.active)
					   .removeClass(RawClasses.active)
					   .end()
					   .eq(data.index)
					   .addClass(RawClasses.active)
					   .end()
					   .slice(start, end)
					   .addClass(RawClasses.visible);

			data.$position.find(Classes.current)
						  .text(data.index + 1)
						  .end()
						  .find(Classes.total)
						  .text(data.total + 1);

			data.$select.val(data.index);

			// controls
			data.$controls.removeClass(Classes.disabled);

			if (index === 0) {
				data.$controls.filter(Classes.control_previous).addClass(RawClasses.disabled);
			}
			if (index === data.total) {
				data.$controls.filter(Classes.control_next).addClass(RawClasses.disabled);
			}

			// elipsis
			data.$ellipsis.removeClass(RawClasses.visible);
			if (index > data.visible + 1) {
				data.$ellipsis.eq(0).addClass(RawClasses.visible);
			}
			if (index < data.total - data.visible - 1) {
				data.$ellipsis.eq(1).addClass(RawClasses.visible);
			}

			// Update
			data.$el.trigger(Events.update, [ data.index ]);
		}
	}

	/**
	 * @method private
	 * @name buildMobilePages
	 * @description Builds options for mobile select
	 * @param data [object] "Instance data"
	 */

	function buildMobilePages(data) {
		var html = '';

		for (var i = 0; i <= data.total; i++) {
			html += '<option value="' + i + '"';
			if (i === data.index) {
				html += 'selected="selected"';
			}
			html += '>Page ' + (i+1) + '</option>';
		}

		data.$select.html(html);
	}

	/**
	 * @plugin
	 * @name Pagination
	 * @description A jQuery plugin for simple pagination.
	 * @type widget
	 * @dependency core.js
	 * @dependency mediaquery.js
	 */

	var Plugin = Formstone.Plugin("pagination", {
			widget: true,

			/**
			 * @options
			 * @param ajax [boolean] <false> "Flag to disable default click actions"
			 * @param customClass [string] <''> "Class applied to instance"
			 * @param labels.close [string] <'Close'> "Close button text"
			 * @param labels.count [string] <'of'> "Gallery count separator text"
			 * @param labels.next [string] <'Next'> "Gallery control text"
			 * @param labels.previous [string] <'Previous'> "Gallery control text"
			 * @param maxWidth [string] <'980px'> "Width at which to auto-disable plugin"
			 * @param visible [int] <2> "Visible pages before and after current page"
			 */

			defaults: {
				ajax            : false,
				customClass     : "",
				labels: {
					count       : "of",
					next        : "Next",
					previous    : "Previous"
				},
				maxWidth        : "740px",
				visible         : 2
			},

			classes: [
				"pages",
				"page",

				"active",
				"first",
				"last",
				"visible",
				"ellipsis",

				"control",
				"control_previous",
				"control_next",

				"position",
				"select",

				"mobile",

				"current",
				"total"
			],

			/**
			 * @events
			 * @event update.pagination "Page updated"
			 */

			events: {
				update    : "update"
			},

			methods: {
				_construct    : construct,
				_destruct     : destruct
			}
		}),

		// Localize References

		Classes       = Plugin.classes,
		RawClasses    = Classes.raw,
		Events        = Plugin.events,
		Functions     = Plugin.functions,
		GUID          = 0;

})(jQuery, Formstone);
;(function ($, Formstone, undefined) {

	"use strict";

	/**
	 * @method private
	 * @name resize
	 * @description Handles window resize
	 */

	function resize(windowWidth) {
		Functions.iterate.call($Instances, resizeInstance);
	}

	/**
	 * @method private
	 * @name cacheInstances
	 * @description Caches active instances
	 */

	function cacheInstances() {
		$Instances = $(Classes.element);
	}

	/**
	 * @method private
	 * @name construct
	 * @description Builds instance.
	 * @param data [object] "Instance data"
	 */

	function construct(data) {
		if (!data.formatter) {
			data.formatter = formatNumber;
		}

		data.min       = parseFloat(this.attr("min"))  || 0;
		data.max       = parseFloat(this.attr("max"))  || 100;
		data.step      = parseFloat(this.attr("step")) || 1;
		data.digits    = data.step.toString().length - data.step.toString().indexOf(".");
		data.value     = parseFloat(this.val()) || (data.min + ((data.max - data.min) / 2));

		var html = "";

		// Not valid in the spec
		data.disbaled = this.is(":disabled");
		data.vertical = this.attr("orient") === "vertical" || data.vertical;

		html += '<div class="' + RawClasses.track + '">';
		html += '<div class="' + RawClasses.handle + '">';
		html += '<span class="' + RawClasses.marker + '"></span>';
		html += '</div>';
		html += '</div>';

		var baseClasses = [
			RawClasses.base,
			data.customClass,
			(data.vertical) ? RawClasses.vertical : "",
			(data.labels)   ? RawClasses.labels   : "",
			(data.disabled) ? RawClasses.disabled : ""
		];

		this.addClass(RawClasses.element)
			.wrap('<div class="' + baseClasses.join(" ") + '"></div>')
			.after(html);

		data.$container = this.parents(Classes.base);
		data.$track     = data.$container.find(Classes.track);
		data.$handle    = data.$container.find(Classes.handle);
		data.$output    = data.$container.find(Classes.output);

		if (data.labels) {
			var labelMax = '<span class="' + [RawClasses.label, RawClasses.label_max].join(" ") + '">' + data.formatter.call(this, (data.labels.max) ? data.labels.max : data.max) + '</span>',
				labelMin = '<span class="' + [RawClasses.label, RawClasses.label_min].join(" ") + '">' + data.formatter.call(this, (data.labels.max) ? data.labels.min : data.min) + '</span>';

			data.$container.prepend((data.vertical) ? labelMax : labelMin)
						   .append( (data.vertical) ? labelMin : labelMax);
		}

		data.$labels = data.$container.find(Classes.label);

		// Bind click events
		this.on(Events.focus, data, onFocus)
			.on(Events.blur, data, onBlur)
			.on(Events.change, data, onChange);

		data.$container.touch({
			pan: true,
			axis: data.vertical ? "y" : "x"
		}).on(Events.panStart, data, onPanStart)
		  .on(Events.pan, data, onPan)
		  .on(Events.panEnd, data, onPanEnd);

		cacheInstances();

		resizeInstance.call(this, data);
	}

	/**
	 * @method private
	 * @name destruct
	 * @description Tears down instance.
	 * @param data [object] "Instance data"
	 */

	function destruct(data) {
		data.$container.off(Events.namespace)
					   .touch("destroy");

		data.$track.remove();
		data.$labels.remove();

		this.unwrap()
			.removeClass(RawClasses.element)
			.off(Events.namespace);

		cacheInstances();
	}

	/**
	 * @method
	 * @name enable
	 * @description Enables target instance
	 * @example $(".target").range("enable");
	 */

	function enable(data) {
		if (data.disabled) {
			this.prop("disabled", false);

			data.$container.removeClass(RawClasses.disabled);

			data.disabled = false;
		}
	}

	/**
	 * @method
	 * @name disable
	 * @description Disables target instance
	 * @example $(".target").range("disable");
	 */

	function disable(data) {
		if (!data.disabled) {
			this.prop("disabled", true);

			data.$container.addClass(RawClasses.disabled);

			data.disabled = true;
		}
	}

	/**
	 * @method
	 * @name resize
	 * @description Resizes instance
	 * @example $(".target").range("resize");
	 */

	/**
	 * @method private
	 * @name resizeInstance
	 * @description Resizes each instance
	 * @param data [object] "Instance data"
	 */

	function resizeInstance(data) {
		data.stepCount = (data.max - data.min) / data.step;
		data.offset = data.$track.offset();

		if (data.vertical) {
			data.trackHeight  = data.$track.outerHeight();
			data.handleHeight = data.$handle.outerHeight();
			data.increment    = data.trackHeight / data.stepCount;
		} else {
			data.trackWidth  = data.$track.outerWidth();
			data.handleWidth = data.$handle.outerWidth();
			data.increment   = data.trackWidth / data.stepCount;
		}

		var percent = (data.$el.val() - data.min) / (data.max - data.min);

		position(data, percent, true); // isResize
	}

	/**
	 * @method private
	 * @name onTrackDown
	 * @description Handles panstart event to track
	 * @param e [object] "Event data"
	 */

	function onPanStart(e) {
		Functions.killEvent(e);

		var data = e.data;

		if (!data.disbaled) {
			onPan(e);

			data.$container.addClass(RawClasses.focus);
		}
	}

	/**
	 * @method private
	 * @name onPan
	 * @description Handles pan event
	 * @param e [object] "Event data"
	 */

	function onPan(e) {
		Functions.killEvent();

		var data = e.data,
			percent = 0;

		if (data.vertical) {
			percent = 1 - (e.pageY - data.offset.top) / data.trackHeight;
		} else {
			percent = (e.pageX - data.offset.left) / data.trackWidth;
		}

		position(data, percent);
	}

	/**
	 * @method private
	 * @name onPanEnd
	 * @description Handles panend event
	 * @param e [object] "Event data"
	 */

	function onPanEnd(e) {
		Functions.killEvent(e);

		var data = e.data;

		data.$container.removeClass(RawClasses.focus);
	}

	/**
	 * @method private
	 * @name onFocus
	 * @description Handles instance focus
	 * @param e [object] "Event data"
	 */

	function onFocus(e) {
		e.data.$container.addClass("focus");
	}

	/**
	 * @method private
	 * @name onBlur
	 * @description Handles instance blur
	 * @param e [object] "Event data"
	 */

	function onBlur(e) {
		e.data.$container.removeClass("focus");
	}

	/**
	 * @method private
	 * @name position
	 * @description Positions handle
	 * @param data [object] "Instance Data"
	 * @param perc [number] "Position precentage"
	 * @param isResize [boolean] "Called from resize"
	 */

	function position(data, perc, isResize) {
		if (data.increment > 1) {
			if (data.vertical) {
				perc = (Math.round(perc * data.stepCount) * data.increment) / data.trackHeight;
			} else {
				perc = (Math.round(perc * data.stepCount) * data.increment) / data.trackWidth;
			}
		}

		if (perc < 0) {
			perc = 0;
		}
		if (perc > 1) {
			perc = 1;
		}

		var value = ((data.min - data.max) * perc);
		value = -parseFloat(value.toFixed(data.digits));

		data.$handle.css((data.vertical) ? "bottom" : "left", (perc * 100) + "%");
		value += data.min;

		if (value !== data.value && value && isResize !== true) {
			data.$el.val(value)
					.trigger(Events.change, [ true ]);

			data.value = value;
		}
	}

	/**
	 * @method private
	 * @name onChange
	 * @description Handles change events
	 * @param e [object] "Event data"
	 * @param internal [boolean] "Flag for internal change"
	 */

	function onChange(e, internal) {
		var data = e.data;

		if (!internal && !data.disabled) {
			var percent = (data.$el.val() - data.min) / (data.max - data.min);

			position(data, percent);
		}
	}

	/**
	 * @method private
	 * @name formatNumber
	 * @description Formats provided number
	 * @param number [number] "Number to format"
	 */

	function formatNumber(number) {
		var parts = number.toString().split(".");

		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

		return parts.join(".");
	}

	/**
	 * @plugin
	 * @name Range
	 * @description A jQuery plugin for cross browser range inputs.
	 * @type widget
	 * @dependency core.js
	 * @dependency touch.js
	 */

	var Plugin = Formstone.Plugin("range", {
			widget: true,

			/**
			 * @options
			 * @param customClass [string] <''> "Class applied to instance"
			 * @param formatter [function] <false> "Value format function"
			 * @param labels [boolean] <true> "Draw labels"
			 * @param labels.max [string] "Max value label; defaults to max value"
			 * @param labels.min [string] "Min value label; defaults to min value"
			 * @param vertical [boolean] <false> "Flag to render vertical range; Deprecated use 'orientation' attribute instead
			 */

			defaults: {
				customClass    : "",
				formatter      : false,
				labels: {
					max        : false,
					min        : false
				},
				vertical       : false
			},

			classes: [
				"track",
				"handle",
				"marker",
				"labels",
				"label",
				"label_min",
				"label_max",
				"vertical",
				"focus",
				"disabled"
			],

			methods: {
				_construct    : construct,
				_destruct     : destruct,
				_resize       : resize,

				// Public Methods

				enable        : enable,
				disable       : disable,
				resize        : resizeInstance
			},

			events: {
				panStart    : "panstart",
				pan         : "pan",
				panEnd      : "panend"
			}
		}),

		// Localize References

		Classes       = Plugin.classes,
		RawClasses    = Classes.raw,
		Events        = Plugin.events,
		Functions     = Plugin.functions,

		$Instances    = [];

})(jQuery, Formstone);
;(function ($, Formstone, undefined) {

	"use strict";

	/**
	 * @method private
	 * @name setup
	 * @description Setup plugin.
	 */

	function setup() {
		$Body = Formstone.$body;
	}

	/**
	 * @method private
	 * @name resize
	 * @description Handles window resize
	 */

	function resize(windowWidth) {
		Functions.iterate.call($Instances, resizeInstance);
	}

	/**
	 * @method private
	 * @name cacheInstances
	 * @description Caches active instances
	 */

	function cacheInstances() {
		$Instances = $(Classes.base);
	}

	/**
	 * @method private
	 * @name construct
	 * @description Builds instance.
	 * @param data [object] "Instance data"
	 */

	function construct(data) {
		var html = '';

		html += '<div class="' + RawClasses.bar + '">';
		html += '<div class="' + RawClasses.track + '">';
		html += '<span class="' + RawClasses.handle + '"></span>';
		html += '</div></div>';

		data.paddingRight     = parseInt(this.css("padding-right"), 10);
		data.paddingBottom    = parseInt(this.css("padding-bottom"), 10);

		this.addClass( [RawClasses.base, data.customClass, (data.horizontal ? RawClasses.horizontal : "")].join(" ") )
			.wrapInner('<div class="' + RawClasses.content + '" />')
			.prepend(html);

		data.$content    = this.find(Classes.content);
		data.$bar        = this.find(Classes.bar);
		data.$track      = this.find(Classes.track);
		data.$handle     = this.find(Classes.handle);

		data.trackMargin = parseInt(data.trackMargin, 10);

		data.$content.on(Events.scroll, data, onScroll);

		this.on(Events.touchMouseDown, Classes.track, data, onTrackDown)
			.on(Events.touchMouseDown, Classes.handle, data, onHandleDown);

		resizeInstance(data);

		cacheInstances();
	}

	/**
	 * @method private
	 * @name destruct
	 * @description Tears down instance.
	 * @param data [object] "Instance data"
	 */

	function destruct(data) {
		data.$bar.remove();
		data.$content.off(Events.namespace)
					 .contents()
					 .unwrap();

		this.removeClass( [RawClasses.base, RawClasses.active, data.customClass].join(" ") )
			.off(Events.namespace);
	}

	/**
	 * @method
	 * @name scroll
	 * @description Scrolls instance of plugin to element or position
	 * @param position [string || int] <null> "Target element selector or static position"
	 * @param duration [int] <null> "Optional scroll duration"
	 * @example $(".target").scrollbar("scroll", position, duration);
	 */

	function scroll(data, position, dur) {
		var duration = dur || data.duration,
			styles = {};

		if ($.type(position) !== "number") {
			var $target = $(position);

			if ($target.length > 0) {
				var offset = $target.position();

				if (data.horizontal) {
					position = offset.left + data.$content.scrollLeft();
				} else {
					position = offset.top + data.$content.scrollTop();
				}
			} else {
				position = data.$content.scrollTop();
			}
		}

		styles[ (data.horizontal ? "scrollLeft" : "scrollTop") ] = position;

		data.$content.stop()
					 .animate(styles, duration);
	}

	/**
	 * @method
	 * @name resizeInstance
	 * @description Resizes layout on instance of plugin
	 * @example $(".target").scrollbar("resize");
	 */

	function resizeInstance(data)  {
		data.$el.addClass(RawClasses.isSetup);

		var barStyles = {},
			trackStyles = {},
			handleStyles = {},
			handlePosition = 0,
			active = true;

		if (data.horizontal) {
			// Horizontal
			data.barHeight       = data.$content[0].offsetHeight - data.$content[0].clientHeight;
			data.frameWidth      = data.$content.outerWidth();
			data.trackWidth      = data.frameWidth - (data.trackMargin * 2);
			data.scrollWidth     = data.$content[0].scrollWidth;
			data.ratio           = data.trackWidth / data.scrollWidth;
			data.trackRatio      = data.trackWidth / data.scrollWidth;
			data.handleWidth     = (data.handleSize > 0) ? data.handleSize : data.trackWidth * data.trackRatio;
			data.scrollRatio     = (data.scrollWidth - data.frameWidth) / (data.trackWidth - data.handleWidth);
			data.handleBounds    = {
				left: 0,
				right: data.trackWidth - data.handleWidth
			};

			data.$content.css({
				paddingBottom: data.barHeight + data.paddingBottom
			});

			var scrollLeft = data.$content.scrollLeft();

			handlePosition = scrollLeft * data.ratio;
			active = (data.scrollWidth <= data.frameWidth);

			barStyles = {
				width: data.frameWidth
			};

			trackStyles = {
				width: data.trackWidth,
				marginLeft: data.trackMargin,
				marginRight: data.trackMargin
			};

			handleStyles = {
				width: data.handleWidth
			};
		} else {
			// Vertical
			data.barWidth = data.$content[0].offsetWidth - data.$content[0].clientWidth;
			data.frameHeight = data.$content.outerHeight();
			data.trackHeight = data.frameHeight - (data.trackMargin * 2);
			data.scrollHeight = data.$content[0].scrollHeight;
			data.ratio = data.trackHeight / data.scrollHeight;
			data.trackRatio = data.trackHeight / data.scrollHeight;
			data.handleHeight = (data.handleSize > 0) ? data.handleSize : data.trackHeight * data.trackRatio;
			data.scrollRatio = (data.scrollHeight - data.frameHeight) / (data.trackHeight - data.handleHeight);
			data.handleBounds = {
				top: 0,
				bottom: data.trackHeight - data.handleHeight
			};

			var scrollTop = data.$content.scrollTop();

			handlePosition = scrollTop * data.ratio;
			active = (data.scrollHeight <= data.frameHeight);

			barStyles = {
				height: data.frameHeight
			};

			trackStyles = {
				height: data.trackHeight,
				marginBottom: data.trackMargin,
				marginTop: data.trackMargin
			};

			handleStyles = {
				height: data.handleHeight
			};
		}

		// Updates

		if (active) {
			data.$el.removeClass(RawClasses.active);
		} else {
			data.$el.addClass(RawClasses.active);
		}

		data.$bar.css(barStyles);
		data.$track.css(trackStyles);
		data.$handle.css(handleStyles);

		positionContent(data, handlePosition);

		data.$el.removeClass(RawClasses.setup);
	}

	/**
	 * @method private
	 * @name onScroll
	 * @description Handles scroll event
	 * @param e [object] "Event data"
	 */

	function onScroll(e) {
		Functions.killEvent(e);

		var data = e.data,
			handleStyles = {};

		if (data.horizontal) {
			// Horizontal
			var scrollLeft = data.$content.scrollLeft();

			if (scrollLeft < 0) {
				scrollLeft = 0;
			}

			data.handleLeft = scrollLeft / data.scrollRatio;

			if (data.handleLeft > data.handleBounds.right) {
				data.handleLeft = data.handleBounds.right;
			}

			handleStyles = {
				left: data.handleLeft
			};
		} else {
			// Vertical
			var scrollTop = data.$content.scrollTop();

			if (scrollTop < 0) {
				scrollTop = 0;
			}

			data.handleTop = scrollTop / data.scrollRatio;

			if (data.handleTop > data.handleBounds.bottom) {
				data.handleTop = data.handleBounds.bottom;
			}

			handleStyles = {
				top: data.handleTop
			};
		}

		data.$handle.css(handleStyles);
	}

	/**
	 * @method private
	 * @name getPointer
	 * @description Normalizes touch and mouse events
	 * @param e [object] "Event data"
	 * @return [object] "Pointer poisition data"
	 */

	function getPointer(e) {
		var oe = e.originalEvent,
			touch = ($.type(oe.targetTouches) !== "undefined") ? oe.targetTouches[0] : null;

		return {
			pageX: (touch) ? touch.pageX : e.clientX,
			pageY: (touch) ? touch.pageY : e.clientY
		};
	}

	/**
	 * @method private
	 * @name onTrackDown
	 * @description Handles mousedown/touchstart event on track
	 * @param e [object] "Event data"
	 */

	function onTrackDown(e) {
		Functions.killEvent(e);

		var data       = e.data,
			pointer    = getPointer(e),
			offset     = data.$track.offset();

		if (data.horizontal) {
			// Horizontal
			data.pointerStart = pointer.pageX;
			data.handleLeft = pointer.pageX - offset.left + $Window.scrollLeft() - (data.handleWidth / 2);

			positionContent(data, data.handleLeft);
		} else {
			// Vertical
			data.pointerStart = pointer.pageY;
			data.handleTop = pointer.pageY - offset.top + $Window.scrollTop() - (data.handleHeight / 2);

			positionContent(data, data.handleTop);
		}

		onPointerStart(data);
	}

	/**
	 * @method private
	 * @name onHandleDown
	 * @description Handles mousedown/touchstart event on handle
	 * @param e [object] "Event data"
	 */

	function onHandleDown(e) {
		Functions.killEvent(e);

		var data       = e.data,
			pointer    = getPointer(e);

		if (data.horizontal) {
			// Horizontal
			data.pointerStart = pointer.pageX;
			data.handleLeft = parseInt(data.$handle.css("left"), 10);
		} else {
			// Vertical
			data.pointerStart = pointer.pageY;
			data.handleTop = parseInt(data.$handle.css("top"), 10);
		}

		onPointerStart(data);
	}

	/**
	 * @method private
	 * @name onStart
	 * @description Handles mousedown/touchstart event
	 * @param data [object] "Instance data"
	 */

	function onPointerStart(data) {
		data.$content.off(Events.namespace);

		$Body.on(Events.touchMouseMove, data, onPointerMove)
			 .on(Events.touchMouseUp, data, onPointerEnd);
	}

	/**
	 * @method private
	 * @name onPointerMove
	 * @description Handles mousemove/touchmove event
	 * @param e [object] "Event data"
	 */

	function onPointerMove(e) {
		Functions.killEvent(e);

		var data        = e.data,
			pointer     = getPointer(e),
			position    = 0;

		if (data.horizontal) {
			// Horizontal
			position = data.handleLeft - (data.pointerStart - pointer.pageX);
		} else {
			// Vertical
			position = data.handleTop - (data.pointerStart - pointer.pageY);
		}

		positionContent(data, position);
	}

	/**
	 * @method private
	 * @name onPointerEnd
	 * @description Handles mouseup/touchend event
	 * @param e [object] "Event data"
	 */

	function onPointerEnd(e) {
		Functions.killEvent(e);

		e.data.$content.on(Events.scroll, e.data, onScroll);
		$Body.off(Events.namespace);
	}

	/**
	 * @method private
	 * @name position
	 * @description Position handle based on scroll
	 * @param data [object] "Instance data"
	 * @param position [int] "Scroll position"
	 */

	function positionContent(data, position) {
		var handleStyles = {};

		if (data.horizontal) {
			// Horizontal
			if (position < data.handleBounds.left) {
				position = data.handleBounds.left;
			}

			if (position > data.handleBounds.right) {
				position = data.handleBounds.right;
			}

			handleStyles = {
				left: position
			};

			data.$content.scrollLeft(Math.round(position * data.scrollRatio));
		} else {
			// Vertical
			if (position < data.handleBounds.top) {
				position = data.handleBounds.top;
			}

			if (position > data.handleBounds.bottom) {
				position = data.handleBounds.bottom;
			}

			handleStyles = {
				top: position
			};

			data.$content.scrollTop(Math.round(position * data.scrollRatio));
		}

		data.$handle.css(handleStyles);
	}

	/**
	 * @plugin
	 * @name Scrollbar
	 * @description A jQuery plugin for .
	 * @type widget
	 * @dependency core.js
	 */

	var Plugin = Formstone.Plugin("scrollbar", {
			widget: true,

			/**
			 * @options
			 * @param customClass [string] <''> "Class applied to instance"
			 * @param duration [int] <0> "Scroll animation length"
			 * @param handleSize [int] <0> "Handle size; 0 to auto size"
			 * @param horizontal [boolean] <false> "Scroll horizontally"
			 * @param trackMargin [int] <0> "Margin between track and handle edge”
			 */

			defaults: {
				customClass: "",
				duration: 0,
				handleSize: 0,
				horizontal: false,
				trackMargin: 0
			},

			classes: [
				"content",
				"bar",
				"track",
				"handle",
				"horizontal",
				"setup",
				"active"
			],

			methods: {
				_setup        : setup,
				_construct    : construct,
				_destruct     : destruct,
				_resize       : resize,

				// Public Methods
				scroll        : scroll,
				resize        : resizeInstance
			}
		}),

		// Localize References

		Classes        = Plugin.classes,
		RawClasses     = Classes.raw,
		Events         = Plugin.events,
		Functions      = Plugin.functions,

		$Body,
		$Window        = Formstone.$window,
		$Instances     = [];

		Events.touchMouseDown    = [Events.touchStart, Events.mouseDown].join(" ");
		Events.touchMouseMove    = [Events.touchMove,  Events.mouseMove].join(" ");
		Events.touchMouseUp      = [Events.touchEnd,   Events.mouseUp].join(" ");

})(jQuery, Formstone);
;(function ($, window) {
	"use strict";

	/**
	 * @options
	 * @param customClass [string] <''> "Class applied to instance"
	 * @param lables.up [string] <'Up'> "Up arrow label"
	 * @param lables.down [string] <'Down'> "Down arrow label"
	 */
	var options = {
		customClass: "",
		labels: {
			up: "Up",
			down: "Down"
		}
	};

	var pub = {

		/**
		 * @method
		 * @name defaults
		 * @description Sets default plugin options
		 * @param opts [object] <{}> "Options object"
		 * @example $.stepper("defaults", opts);
		 */
		defaults: function(opts) {
			options = $.extend(options, opts || {});
			return (typeof this === 'object') ? $(this) : true;
		},

		/**
		 * @method
		 * @name destroy
		 * @description Removes instance of plugin
		 * @example $(".target").stepper("destroy");
		 */
		destroy: function() {
			return $(this).each(function(i) {
				var data = $(this).data("stepper");

				if (data) {
					// Unbind click events
					data.$stepper.off(".stepper")
								 .find(".stepper-arrow")
								 .remove();

					// Restore DOM
					data.$input.unwrap()
							   .removeClass("stepper-input");
				}
			});
		},

		/**
		 * @method
		 * @name disable
		 * @description Disables target instance
		 * @example $(".target").stepper("disable");
		 */
		disable: function() {
			return $(this).each(function(i) {
				var data = $(this).data("stepper");

				if (data) {
					data.$input.attr("disabled", "disabled");
					data.$stepper.addClass("disabled");
				}
			});
		},

		/**
		 * @method
		 * @name enable
		 * @description Enables target instance
		 * @example $(".target").stepper("enable");
		 */
		enable: function() {
			return $(this).each(function(i) {
				var data = $(this).data("stepper");

				if (data) {
					data.$input.attr("disabled", null);
					data.$stepper.removeClass("disabled");
				}
			});
		}
	};

	/**
	 * @method private
	 * @name _init
	 * @description Initializes plugin
	 * @param opts [object] "Initialization options"
	 */
	function _init(opts) {
		// Local options
		opts = $.extend({}, options, opts || {});

		// Apply to each element
		var $items = $(this);
		for (var i = 0, count = $items.length; i < count; i++) {
			_build($items.eq(i), opts);
		}
		return $items;
	}

	/**
	 * @method private
	 * @name _build
	 * @description Builds each instance
	 * @param $select [jQuery object] "Target jQuery object"
	 * @param opts [object] <{}> "Options object"
	 */
	function _build($input, opts) {
		if (!$input.hasClass("stepper-input")) {
			// EXTEND OPTIONS
			opts = $.extend({}, opts, $input.data("stepper-options"));

			// HTML5 attributes
			var min = parseFloat($input.attr("min")),
				max = parseFloat($input.attr("max")),
				step = parseFloat($input.attr("step")) || 1;

			// Modify DOM
			$input.addClass("stepper-input")
				  .wrap('<div class="stepper ' + opts.customClass + '" />')
				  .after('<span class="stepper-arrow up">' + opts.labels.up + '</span><span class="stepper-arrow down">' + opts.labels.down + '</span>');

			// Store data
			var $stepper = $input.parent(".stepper"),
				data = $.extend({
					$stepper: $stepper,
					$input: $input,
					$arrow: $stepper.find(".stepper-arrow"),
					min: (typeof min !== undefined && !isNaN(min)) ? min : false,
					max: (typeof max !== undefined && !isNaN(max)) ? max : false,
					step: (typeof step !== undefined && !isNaN(step)) ? step : 1,
					timer: null
				}, opts);

			data.digits = _digits(data.step);

			// Check disabled
			if ($input.is(":disabled")) {
				$stepper.addClass("disabled");
			}

			// Bind keyboard events
			$stepper.on("keypress", ".stepper-input", data, _onKeyup);

			// Bind click events
			$stepper.on("touchstart.stepper mousedown.stepper", ".stepper-arrow", data, _onMouseDown)
					.data("stepper", data);
		}
	}

	/**
	 * @method private
	 * @name _onKeyup
	 * @description Handles keypress event on inputs
	 * @param e [object] "Event data"
	 */
	function _onKeyup(e) {
		var data = e.data;

		// If arrow keys
		if (e.keyCode === 38 || e.keyCode === 40) {
			e.preventDefault();

			_step(data, (e.keyCode === 38) ? data.step : -data.step);
		}
	}

	/**
	 * @method private
	 * @name _onMouseDown
	 * @description Handles mousedown event on instance arrows
	 * @param e [object] "Event data"
	 */
	function _onMouseDown(e) {
		e.preventDefault();
		e.stopPropagation();

		// Make sure we reset the states
		_onMouseUp(e);

		var data = e.data;

		if (!data.$input.is(':disabled') && !data.$stepper.hasClass("disabled")) {
			var change = $(e.target).hasClass("up") ? data.step : -data.step;

			data.timer = _startTimer(data.timer, 125, function() {
				_step(data, change, false);
			});
			_step(data, change);

			$("body").on("touchend.stepper mouseup.stepper", data, _onMouseUp);
		}
	}

	/**
	 * @method private
	 * @name _onMouseUp
	 * @description Handles mouseup event on instance arrows
	 * @param e [object] "Event data"
	 */
	function _onMouseUp(e) {
		e.preventDefault();
		e.stopPropagation();

		var data = e.data;

		_clearTimer(data.timer);

		$("body").off(".stepper");
	}

	/**
	 * @method private
	 * @name _step
	 * @description Steps through values
	 * @param e [object] "Event data"
	 * @param change [string] "Change value"
	 */
	function _step(data, change) {
		var originalValue = parseFloat(data.$input.val()),
			value = change;

		if (typeof originalValue === undefined || isNaN(originalValue)) {
			if (data.min !== false) {
				value = data.min;
			} else {
				value = 0;
			}
		} else if (data.min !== false && originalValue < data.min) {
			value = data.min;
		} else {
			value += originalValue;
		}

		var diff = (value - data.min) % data.step;
		if (diff !== 0) {
			value -= diff;
		}

		if (data.min !== false && value < data.min) {
			value = data.min;
		}
		if (data.max !== false && value > data.max) {
			value -= data.step;
		}

		if (value !== originalValue) {
			value = _round(value, data.digits);

			data.$input.val(value)
					   .trigger("change");
		}
	}

	/**
	 * @method private
	 * @name _startTimer
	 * @description Starts an internal timer
	 * @param timer [int] "Timer ID"
	 * @param time [int] "Time until execution"
	 * @param callback [int] "Function to execute"
	 */
	function _startTimer(timer, time, callback) {
		_clearTimer(timer);
		return setInterval(callback, time);
	}

	/**
	 * @method private
	 * @name _clearTimer
	 * @description Clears an internal timer
	 * @param timer [int] "Timer ID"
	 */
	function _clearTimer(timer) {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	}

	/**
	 * @method private
	 * @name _digits
	 * @description Analyzes and returns significant digit count
	 * @param value [float] "Value to analyze"
	 * @return [int] "Number of significant digits"
	 */
	function _digits(value) {
		var test = String(value);
		if (test.indexOf(".") > -1) {
			return test.length - test.indexOf(".") - 1;
		} else {
			return 0;
		}
	}

	/**
	 * @method private
	 * @name _round
	 * @description Rounds a number to a sepcific significant digit count
	 * @param value [float] "Value to round"
	 * @param digits [float] "Digits to round to"
	 * @return [number] "Rounded number"
	 */
	function _round(value, digits) {
		var exp = Math.pow(10, digits);
		return Math.round(value * exp) / exp;
	}

	$.fn.stepper = function(method) {
		if (pub[method]) {
			return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return _init.apply(this, arguments);
		}
		return this;
	};

	$.stepper = function(method) {
		if (method === "defaults") {
			pub.defaults.apply(this, Array.prototype.slice.call(arguments, 1));
		}
	};
})(jQuery, this);

;(function ($, Formstone, undefined) {

	"use strict";

	/**
	 * @method private
	 * @name construct
	 * @description Builds instance.
	 * @param data [object] "Instance data"
	 */

	function construct(data) {
		data.enabled    = false;
		data.active     = false;

		data.classes    = $.extend(true, {}, Classes, data.classes);

		data.target     = this.data(Namespace + "-target");
		data.$target    = $(data.target).addClass(data.classes.raw.target);

		data.linked     = this.data(Namespace + "-linked");

		data.mq         = "(max-width:" + (data.maxWidth === Infinity ? "100000px" : data.maxWidth) + ")";
		data.mqGuid     = data.classes.raw.base + "__" + (GUID++);

		// live query for the group to avoid missing new elements
		var group       = this.data(Namespace + "-group");
		data.group      = group ? '[data-' + Namespace + '-group="' + group + '"]' : false;

		if (!data.collapse && data.group) {
			$(data.group).eq(0).attr("data-" + Namespace + "-active", "true");
		}

		// Should be activate when enabled
		data.onEnable = this.data(Namespace + "-active");

		data.$swaps = $().add(this).add(data.$target);

		this.touch({
				tap: true
			})
			.on(Events.tap, data, onClick);


		// Media Query support
		$.mediaquery("bind", data.mqGuid, data.mq, {
			enter: function() {
				enable.call(data.$el, data);
			},
			leave: function() {
				disable.call(data.$el, data);
			}
		});
	}

	/**
	 * @method private
	 * @name destruct
	 * @description Tears down instance.
	 * @param data [object] "Instance data"
	 */

	function destruct(data) {
		$.mediaquery("unbind", data.mqGuid, data.mq);

		data.$swaps.removeClass( [data.classes.raw.enabled, data.classes.raw.active].join(" ") )
				   .off(Events.namespace);

		this.touch("destroy");
	}

	/**
	 * @method
	 * @name activate
	 * @description Activate instance.
	 * @example $(".target").swap("activate");
	 */

	function activate(data, fromLinked) {
		if (data.enabled && !data.active) {
			// Deactivates grouped instances
			$(data.group).not(data.$el)[Plugin.namespace]("deactivate");

			// index in group
			var index = (data.group) ? $(data.group).index(data.$el) : null;

			data.$swaps.addClass(data.classes.raw.active);

			if (!fromLinked) {
				// Linked handles
				$(data.linked).not(data.$el).swap("activate", true);
			}

			this.trigger(Events.activate, [index]);

			data.active = true;
		}
	}

	/**
	 * @method
	 * @name deactivate
	 * @description Deactivates instance.
	 * @example $(".target").swap("deactivate");
	 */

	function deactivate(data, fromLinked) {
		if (data.enabled && data.active) {
			data.$swaps.removeClass(data.classes.raw.active);

			if (!fromLinked) {
				// Linked handles
				$(data.linked).not(data.$el).swap("deactivate", true);
			}

			this.trigger(Events.deactivate);

			data.active = false;
		}
	}

	/**
	 * @method
	 * @name enable
	 * @description Enables instance.
	 * @example $(".target").swap("enable");
	 */

	function enable(data, fromLinked) {
		if (!data.enabled) {
			data.$swaps.addClass(data.classes.raw.enabled);

			if (!fromLinked) {
				// Linked handles
				$(data.linked).not(data.$el).swap("enable");
			}

			data.enabled = true;

			this.trigger(Events.enable);

			if (data.onEnable) {
				data.active = true;
				data.$swaps.addClass(data.classes.raw.active);
				// activate.call(this, data);
			} else {
				data.active = true;
				deactivate.call(this, data);
			}
		}
	}

	/**
	 * @method
	 * @name disable
	 * @description Disables instance.
	 * @example $(".target").swap("disable");
	 */

	function disable(data, fromLinked) {
		if (data.enabled) {
			data.$swaps.removeClass( [data.classes.raw.enabled, data.classes.raw.active].join(" ") );

			if (!fromLinked) {
				// Linked handles
				$(data.linked).not(data.$el).swap("disable");
			}

			this.trigger(Events.disable);

			data.enabled = false;
		}
	}

	/**
	 * @method private
	 * @name onClick
	 * @description Handles click nav click.
	 * @param e [object] "Event data"
	 */

	function onClick(e) {
		Functions.killEvent(e);

		var data = e.data;

		if (data.active && data.collapse) {
			deactivate.call(data.$el, data);
		} else {
			activate.call(data.$el, data);
		}
	}

	/**
	 * @plugin
	 * @name Swap
	 * @description A jQuery plugin for toggling states.
	 * @type widget
	 * @dependency core.js
	 * @dependency mediaquery.js
	 * @dependency touch.js
	 */

	var Plugin = Formstone.Plugin("swap", {
			widget: true,

			/**
			 * @options
			 * @param collapse [boolean] <true> "Allow swap to collapse it's target"
			 * @param maxWidth [string] <Infinity> "Width at which to auto-disable plugin"
			 */

			defaults: {
				collapse       : true,
				maxWidth       : Infinity
			},

			classes: [
				"target",
				"enabled",
				"active"
			],

			/**
			 * @events
			 * @event activate.swap "Swap activated"
			 * @event deactivate.swap "Swap deactivated"
			 * @event enable.swap "Swap enabled"
			 * @event disable.swap "Swap diabled"
			 */

			events: {
				tap           : "tap",
				activate      : "activate",
				deactivate    : "deactivate",
				enable        : "enable",
				disable       : "disable"
			},

			methods: {
				_construct    : construct,
				_destruct     : destruct,

				// Public Methods

				activate      : activate,
				deactivate    : deactivate,
				enable        : enable,
				disable       : disable
			}
		}),

		// Localize References

		Namespace     = Plugin.namespace,
		Classes       = Plugin.classes,
		Events        = Plugin.events,
		Functions     = Plugin.functions,
		GUID          = 0;

})(jQuery, Formstone);
;(function ($, Formstone, undefined) {

	"use strict";

	/**
	 * @method private
	 * @name construct
	 * @description Builds instance.
	 * @param data [object] "Instance data"
	 */

	function construct(data) {
		// guid
		var guid         = "__" + (GUID++);

		data.eventGuid    = Events.namespace + guid;
		data.rawGuid      = RawClasses.base + guid;
		data.classGuid    = "." + data.rawGuid;

		data.mq           = "(max-width:" + (data.mobileMaxWidth === Infinity ? "100000px" : data.mobileMaxWidth) + ")";

		data.content      = this.attr("href");
		data.group        = this.data(Namespace + "-group");

		data.tabClasses          = [RawClasses.tab, data.rawGuid].join(" ");
		data.mobileTabClasses    = [RawClasses.tab, RawClasses.tab_mobile, data.rawGuid].join(" ");
		data.contentClasses      = [RawClasses.content, data.rawGuid].join(" ");

		// DOM

		data.$mobileTab    = $('<button type="button" class="' + data.mobileTabClasses + '">' + this.text() + '</button>');
		data.$content      = $(data.content).addClass(data.contentClasses);

		data.$content.before(data.$mobileTab);

		// toggle

		this.attr("data-swap-target", data.content)
			.attr("data-swap-group", data.group)
			.addClass(data.tabClasses)
			.on("activate.swap" + data.eventGuid, data, onActivate)
			.on("deactivate.swap" + data.eventGuid, data, onDeactivate)
			.on("enable.swap" + data.eventGuid, data, onEnable)
			.on("disable.swap" + data.eventGuid, data, onDisable)
			.swap({
				maxWidth: data.maxWidth,
				classes: {
					target  : data.classGuid,
					enabled : Classes.enabled,
					active  : Classes.active,
					raw: {
						target  : data.rawGuid,
						enabled : RawClasses.enabled,
						active  : RawClasses.active
					}
				},
				collapse: false
			});

		data.$mobileTab.touch({
			tap: true
		}).on("tap" + data.eventGuid, data, onMobileActivate);

		// Media Query support
		$.mediaquery("bind", data.rawGuid, data.mq, {
			enter: function() {
				mobileEnable.call(data.$el, data);
			},
			leave: function() {
				mobileDisable.call(data.$el, data);
			}
		});
	}

	/**
	 * @method private
	 * @name destruct
	 * @description Tears down instance.
	 * @param data [object] "Instance data"
	 */

	function destruct(data) {
		$.mediaquery("unbind", data.rawGuid, data.mq);

		data.$mobileTab.off(Events.namespace)
					   .touch("destroy")
					   .remove();

		data.$content.removeClass(RawClasses.content);

		this.attr("data-swap-target", "")
			.attr("data-swap-group", "")
			.removeClass(RawClasses.tab)
			.off(Events.namespace)
			.swap("destroy");
	}

	/**
	 * @method
	 * @name activate
	 * @description Activates instance.
	 * @example $(".target").tabs("open");
	 */

	function activate(data) {
		this.swap("activate");
	}

	/**
	 * @method
	 * @name enable
	 * @description Enables instance.
	 * @example $(".target").tabs("enable");
	 */

	function enable(data) {
		this.swap("enable");
	}

	/**
	 * @method
	 * @name disable
	 * @description Disables instance.
	 * @example $(".target").tabs("disable");
	 */

	function disable(data) {
		this.swap("disable");
	}

	/**
	 * @method private
	 * @name onActivate
	 * @description Handles tab open event.
	 * @param e [object] "Event data"
	 */

	function onActivate(e) {
		var data = e.data,
			index = 0;

		data.$el.trigger(Events.update, [ index ]);

		data.$mobileTab.addClass(RawClasses.active);
		data.$content.addClass(RawClasses.active);
	}

	/**
	 * @method private
	 * @name onDeactivate
	 * @description Handles tab close event.
	 * @param e [object] "Event data"
	 */

	function onDeactivate(e) {
		var data = e.data;

		// data.$el.trigger(Events.close);

		data.$mobileTab.removeClass(RawClasses.active);
		data.$content.removeClass(RawClasses.active);
	}

	/**
	 * @method private
	 * @name onEnable
	 * @description Handles tab enable event.
	 * @param e [object] "Event data"
	 */

	function onEnable(e) {
		var data = e.data;

		data.$mobileTab.addClass(RawClasses.enabled);
		data.$content.addClass(RawClasses.enabled);
	}

	/**
	 * @method private
	 * @name onDisable
	 * @description Handles tab disable event.
	 * @param e [object] "Event data"
	 */

	function onDisable(e) {
		var data = e.data;

		data.$mobileTab.removeClass(RawClasses.enabled);
		data.$content.removeClass(RawClasses.enabled);
	}

	/**
	 * @method private
	 * @name onMobileActivate
	 * @description Activates instance.
	 * @param e [object] "Event data"
	 */

	function onMobileActivate(e) {
		e.data.$el.swap("activate");
	}

	/**
	 * @method private
	 * @name mobileEnable
	 * @description Handles mobile enable event.
	 * @param data [object] "Instance data"
	 */

	function mobileEnable(data) {
		data.$el.addClass(RawClasses.mobile);
		data.$mobileTab.addClass(RawClasses.mobile);
	}

	/**
	 * @method private
	 * @name mobileDisable
	 * @description Handles mobile disable event.
	 * @param data [object] "Instance data"
	 */

	function mobileDisable(data) {
		data.$el.removeClass(RawClasses.mobile);
		data.$mobileTab.removeClass(RawClasses.mobile);
	}

	/**
	 * @plugin
	 * @name Tabs
	 * @description A jQuery plugin for simple tabs.
	 * @type widget
	 * @dependency core.js
	 * @dependency mediaquery.js
	 * @dependency swap.js
	 * @dependency touch.js
	 */

	var Plugin = Formstone.Plugin("tabs", {
			widget: true,

			/**
			 * @options
			 * @param customClass [string] <''> "Class applied to instance"
			 * @param maxWidth [string] <Infinity> "Width at which to auto-disable plugin"
			 * @param mobileMaxWidth [string] <'740px'> "Width at which to auto-disable mobile styles"
			 * @param vertical [boolean] <false> "Flag to draw vertical tab set"
			 */

			defaults: {
				customClass       : "",
				maxWidth          : Infinity,
				mobileMaxWidth    : "740px",
				vertical          : false
			},

			classes: [
				"tab",
				"tab_mobile",
				"mobile",
				"content",
				"enabled",
				"active"
			],

			/**
			 * @events
			 * @event update.tabs "Tab activated"
			 */

			events: {
				tap      : "tap",
				update   : "update"
			},

			methods: {
				_construct    : construct,
				_destruct     : destruct,

				// Public Methods

				activate      : activate,
				enable        : enable,
				disable       : disable
			}
		}),

		// Localize References

		Namespace     = Plugin.namespace,
		Classes       = Plugin.classes,
		RawClasses    = Classes.raw,
		Events        = Plugin.events,
		Functions     = Plugin.functions,
		GUID          = 0;

})(jQuery, Formstone);
;(function ($, Formstone, undefined) {

	"use strict";

	/**
	 * @method private
	 * @name construct
	 * @description Builds instance.
	 * @param data [object] "Instance data"
	 */

	function construct(data) {
		this.on(Events.mouseEnter, data, onMouseEnter);
	}

	/**
	 * @method private
	 * @name destruct
	 * @description Tears down instance.
	 * @param data [object] "Instance data"
	 */

	function destruct(data) {
		removeTooltip();

		this.off(Events.namespace);
	}

	/**
	 * @method private
	 * @name onMouseEnter
	 * @description Handles mouse enter event.
	 * @param e [object] "Event data"
	 */

	function onMouseEnter(e) {
		removeTooltip();

		var data = e.data;

		data.left = e.pageX;
		data.top  = e.pageY;

		buildTooltip(data);
	}

	/**
	 * @method private
	 * @name onMouseLeave
	 * @description Handles mouse leave event.
	 * @param e [object] "Event data"
	 */

	function onMouseLeave(e) {
		var data = e.data;

		Functions.clearTimer(data.timer);

		removeTooltip();
	}

	/**
	 * @method private
	 * @name onMouseLeave
	 * @description Handles mouse move event.
	 * @param e [object] "Event data"
	 */

	function onMouseMove(e) {
		positionTooltip(e.pageX, e.pageY);
	}

	/**
	 * @method private
	 * @name buildTooltip
	 * @description Builds new tooltip instance.
	 * @param data [object] "Instance data"
	 */

	function buildTooltip(data) {
		removeTooltip();

		var html = '';

		html += '<div class="';
		html += [RawClasses.base, RawClasses[data.direction] ].join(" ");
		html += '">';
		html += '<div class="' + RawClasses.content + '">';
		html += data.formatter.call(data.$el, data);
		html += '<span class="' + RawClasses.caret + '"></span>';
		html += '</div>';
		html += '</div>';

		Instance = {
			$tooltip    : $(html),
			$el         : data.$el
		};

		Formstone.$body.append(Instance.$tooltip);

		var $content = Instance.$tooltip.find(Classes.content),
			$caret   = Instance.$tooltip.find(Classes.caret),

			offset = data.$el.offset(),
			height = data.$el.outerHeight(),
			width  = data.$el.outerWidth(),

			tooltipLeft     = 0,
			tooltipTop      = 0,
			contentLeft     = 0,
			contentTop      = 0,
			caretLeft       = false,
			caretTop        = false,

			caretHeight     = $caret.outerHeight(true),
			caretWidth      = $caret.outerWidth(true),
			contentHeight   = $content.outerHeight(true),
			contentWidth    = $content.outerWidth(true);

		// position content
		if (data.direction === "right" || data.direction === "left") {
			caretTop   = (contentHeight - caretHeight) / 2;
			contentTop = -contentHeight / 2;

			if (data.direction === "right") {
				contentLeft = data.margin;
			} else if (data.direction === "left") {
				contentLeft = -(contentWidth + data.margin);
			}
		} else {
			caretLeft = (contentWidth - caretWidth) / 2;
			contentLeft = -contentWidth / 2;

			if (data.direction === "bottom") {
				contentTop = data.margin;
			} else if (data.direction === "top") {
				contentTop = -(contentHeight + data.margin);
			}
		}

		// Modify Dom
		$content.css({
			top:  contentTop,
			left: contentLeft
		});

		$caret.css({
			top:  caretTop,
			left: caretLeft
		});

		// Position tooltip
		if (data.follow) {
			data.$el.on(Events.mouseMove, data, onMouseMove);
		} else {
			if (data.match) {
				if (data.direction === "right" || data.direction === "left") {
					tooltipTop = data.top; // mouse pos

					if (data.direction === "right") {
						tooltipLeft = offset.left + width;
					} else if (data.direction === "left") {
						tooltipLeft = offset.left;
					}
				} else {
					tooltipLeft = data.left; // mouse pos

					if (data.direction === "bottom") {
						tooltipTop = offset.top + height;
					} else if (data.direction === "top") {
						tooltipTop = offset.top;
					}
				}
			} else {
				if (data.direction === "right" || data.direction === "left") {
					tooltipTop = offset.top + (height / 2);

					if (data.direction === "right") {
						tooltipLeft = offset.left + width;
					} else if (data.direction === "left") {
						tooltipLeft = offset.left;
					}
				} else {
					tooltipLeft = offset.left + (width / 2);

					if (data.direction === "bottom") {
						tooltipTop = offset.top + height;
					} else if (data.direction === "top") {
						tooltipTop = offset.top;
					}
				}
			}

			positionTooltip(tooltipLeft, tooltipTop);
		}

		data.timer = Functions.startTimer(data.timer, data.delay, function() {
			Instance.$tooltip.addClass(RawClasses.visible);
		});

		data.$el.one(Events.mouseLeave, data, onMouseLeave);
	}

	/**
	 * @method private
	 * @name positionTooltip
	 * @description Positions active tooltip instance.
	 * @param left [int] "Left position"
	 * @param top [int] "Top position"
	 */

	function positionTooltip(left, top) {
		if (Instance) {
			Instance.$tooltip.css({
				left : left,
				top  : top
			});
		}
	}

	/**
	 * @method private
	 * @name removeTooltip
	 * @description Removes active tooltip instance.
	 */

	function removeTooltip() {
		if (Instance) {
			Instance.$el.off( [Events.mouseMove, Events.mouseLeave].join(" ") );

			Instance.$tooltip.remove();
			Instance = null;
		}
	}

	/**
	 * @method private
	 * @name format
	 * @description Formats tooltip text.
	 * @return [string] "Tooltip text"
	 */

	function format(data) {
		return this.data("title");
	}

	/**
	 * @plugin
	 * @name Tooltip
	 * @description A jQuery plugin for simple tooltips.
	 * @type widget
	 * @dependency core.js
	 */

	var Plugin = Formstone.Plugin("tooltip", {
			widget: true,

			/**
			 * @options
			 * @param delay [int] <0> "Hover delay"
			 * @param direction [string] <'top'> "Tooltip direction"
			 * @param follow [boolean] <false> "Flag to follow mouse"
			 * @param formatter [function] <$.noop> "Text format function"
			 * @param margin [int] <15> "Tooltip margin"
			 * @param match [boolean] <false> "Flag to match mouse position"
			 */

			defaults: {
				delay        : 0,
				direction    : "top",
				follow       : false,
				formatter    : format,
				margin       : 15,
				match        : false
			},

			classes: [
				"content",
				"caret",
				"visible",
				"top",
				"bottom",
				"right",
				"left"
			],

			methods: {
				_construct    : construct,
				_destruct     : destruct
			}
		}),

		// Localize References

		Classes       = Plugin.classes,
		RawClasses    = Classes.raw,
		Events        = Plugin.events,
		Functions     = Plugin.functions,

		// Singleton

		Instance     = null;

})(jQuery, Formstone);
;(function ($, Formstone, undefined) {

	"use strict";

	/**
	 * @method private
	 * @name construct
	 * @description Builds instance.
	 * @param data [object] "Instance data"
	 */

	function construct(data) {
		data.touches     = [];
		data.touching    = false;

		if (data.tap) {
			// Tap

			data.pan   = false;
			data.scale = false;
			data.swipe = false;

			this.on( [Events.touchStart, Events.pointerDown].join(" "), data, onPointerStart)
				.on(Events.click, data, onClick);
		} else if (data.pan || data.swipe || data.scale) {
			// Pan / Swipe / Scale

			data.tap = false;

			if (data.swipe) {
				data.pan = true;
			}

			if (data.scale) {
				data.axis = false;
			}

			if (data.axis) {
				data.axisX = data.axis === "x";
				data.axisY = data.axis === "y";

				// touchAction(this, "pan-" + (data.axisY ? "y" : "x"));
			} else {
				touchAction(this, "none");
			}

			this.on( [Events.touchStart, Events.pointerDown].join(" "), data, onTouch);

			if (data.pan) {
				this.on( Events.mouseDown, data, onPointerStart);
			}
		}
	}

	/**
	 * @method private
	 * @name destruct
	 * @description Tears down instance.
	 * @param data [object] "Instance data"
	 */

	function destruct(data) {
		touchAction(this.off(Events.namespace), "");
	}

	/**
	 * @method private
	 * @name onTouch
	 * @description Delegates touch events.
	 * @param e [object] "Event data"
	 */

	function onTouch(e) {
		// Stop panning and zooming
		if (e.preventManipulation) {
			e.preventManipulation();
		}

		var data    = e.data,
			oe      = e.originalEvent;

		if (oe.type.match(/(up|end)$/i)) {
			onPointerEnd(e);
			return;
		}

		if (oe.pointerId) {
			// Normalize MS pointer events back to standard touches
			var activeTouch = false;
			for (var i in data.touches) {
				if (data.touches[i].id === oe.pointerId) {
					activeTouch = true;
					data.touches[i].pageX    = oe.clientX;
					data.touches[i].pageY    = oe.clientY;
				}
			}
			if (!activeTouch) {
				data.touches.push({
					id       : oe.pointerId,
					pageX    : oe.clientX,
					pageY    : oe.clientY
				});
			}
		} else {
			// Alias normal touches
			data.touches = oe.touches;
		}

		// Delegate touch actions
		if (oe.type.match(/(down|start)$/i)) {
			onPointerStart(e);
		} else if (oe.type.match(/move$/i)) {
			onPointerMove(e);
		}
	}

	/**
	 * @method private
	 * @name onPointerStart
	 * @description Handles pointer start.
	 * @param e [object] "Event data"
	 */

	function onPointerStart(e) {
		var data     = e.data,
			touch    = ($.type(data.touches) !== "undefined") ? data.touches[0] : null;

		if (!data.touching) {
			data.startE      = e.originalEvent;
			data.startX      = (touch) ? touch.pageX : e.pageX;
			data.startY      = (touch) ? touch.pageY : e.pageY;
			data.startT      = new Date().getTime();
			data.scaleD      = 1;
			data.passed      = false;
		}

		if (data.tap) {
			// Tap

			data.clicked = false;

			data.$el.on( [Events.touchMove, Events.pointerMove].join(" "), data, onTouch)
					.on( [Events.touchEnd, Events.touchCancel, Events.pointerUp, Events.pointerCancel].join(" ") , data, onTouch);

		} else if (data.pan || data.scale) {
			// Clear old click events

			if (data.$links) {
				data.$links.off(Events.click);
			}

			// Pan / Scale

			var newE = buildEvent(data.scale ? Events.scaleStart : Events.panStart, e, data.startX, data.startY, data.scaleD, 0, 0, "", "");

			if (data.scale && data.touches && data.touches.length >= 2) {
				var t = data.touches;

				data.pinch = {
					startX     : midpoint(t[0].pageX, t[1].pageX),
					startY     : midpoint(t[0].pageY, t[1].pageY),
					startD     : pythagorus((t[1].pageX - t[0].pageX), (t[1].pageY - t[0].pageY))
				};

				newE.pageX    = data.startX   = data.pinch.startX;
				newE.pageY    = data.startY   = data.pinch.startY;
			}

			// Only bind at first touch
			if (!data.touching) {
				data.touching = true;

				if (data.pan) {
					$Window.on(Events.mouseMove, data, onPointerMove)
						   .on(Events.mouseUp, data, onPointerEnd);
				}

				$Window.on( [
					Events.touchMove,
					Events.touchEnd,
					Events.touchCancel,
					Events.pointerMove,
					Events.pointerUp,
					Events.pointerCancel
				].join(" ") , data, onTouch);

				data.$el.trigger(newE);
			}
		}
	}

	/**
	 * @method private
	 * @name onPointerMove
	 * @description Handles pointer move.
	 * @param e [object] "Event data"
	 */

	function onPointerMove(e) {
		var data      = e.data,
			touch     = ($.type(data.touches) !== "undefined") ? data.touches[0] : null,
			newX      = (touch) ? touch.pageX : e.pageX,
			newY      = (touch) ? touch.pageY : e.pageY,
			deltaX    = newX - data.startX,
			deltaY    = newY - data.startY,
			dirX      = (deltaX > 0) ? "right" : "left",
			dirY      = (deltaY > 0) ? "down"  : "up",
			movedX    = Math.abs(deltaX) > TouchThreshold,
			movedY    = Math.abs(deltaY) > TouchThreshold;

		if (data.tap) {
			// Tap

			if (movedX || movedY) {
				data.$el.off( [
					Events.touchMove,
					Events.touchEnd,
					Events.touchCancel,
					Events.pointerMove,
					Events.pointerUp,
					Events.pointerCancel
				].join(" ") );
			}
		} else if (data.pan || data.scale) {
			if (!data.passed && data.axis && ((data.axisX && movedY) || (data.axisY && movedX)) ) {
				// if axis and moved in opposite direction
				onPointerEnd(e);
			} else {
				if (!data.passed && (!data.axis || (data.axis && (data.axisX && movedX) || (data.axisY && movedY)))) {
					// if has axis and moved in same direction
					data.passed = true;
				}

				if (data.passed) {
					Functions.killEvent(e);
					Functions.killEvent(data.startE);
				}

				// Pan / Scale

				var fire    = true,
					newE    = buildEvent(data.scale ? Events.scale : Events.pan, e, newX, newY, data.scaleD, deltaX, deltaY, dirX, dirY);

				if (data.scale) {
					if (data.touches && data.touches.length >= 2) {
						var t = data.touches;

						data.pinch.endX     = midpoint(t[0].pageX, t[1].pageX);
						data.pinch.endY     = midpoint(t[0].pageY, t[1].pageY);
						data.pinch.endD     = pythagorus((t[1].pageX - t[0].pageX), (t[1].pageY - t[0].pageY));
						data.scaleD    = (data.pinch.endD / data.pinch.startD);
						newE.pageX     = data.pinch.endX;
						newE.pageY     = data.pinch.endY;
						newE.scale     = data.scaleD;
						newE.deltaX    = data.pinch.endX - data.pinch.startX;
						newE.deltaY    = data.pinch.endY - data.pinch.startY;
					} else if (!data.pan) {
						fire = false;
					}
				}

				if (fire) {
					data.$el.trigger( newE );
				}
			}
		}
	}

	/**
	 * @method private
	 * @name bindLink
	 * @description Bind events to internal links
	 * @param $link [object] "Object to bind"
	 * @param data [object] "Instance data"
	 */

	function bindLink($link, data) {
		$link.on(Events.click, data, onLinkClick);

		// http://www.elijahmanor.com/how-to-access-jquerys-internal-data/
		var events = $._data($link[0], "events")["click"];
		events.unshift(events.pop());
	}

	/**
	 * @method private
	 * @name onLinkClick
	 * @description Handles clicks to internal links
	 * @param e [object] "Event data"
	 */

	function onLinkClick(e) {
		Functions.killEvent(e, true);
		e.data.$links.off(Events.click);
	}

	/**
	 * @method private
	 * @name onPointerEnd
	 * @description Handles pointer end / cancel.
	 * @param e [object] "Event data"
	 */

	function onPointerEnd(e) {
		var data = e.data;

		if (data.tap) {
			// Tap

			data.$el.off( [
				Events.touchMove,
				Events.touchEnd,
				Events.touchCancel,
				Events.pointerMove,
				Events.pointerUp,
				Events.pointerCancel,
				Events.mouseMove,
				Events.mouseUp
			].join(" ") );

			data.startE.preventDefault();

			onClick(e);
		} else if (data.pan || data.scale) {

			// Pan / Swipe / Scale

			var touch     = ($.type(data.touches) !== "undefined") ? data.touches[0] : null,
				newX      = (touch) ? touch.pageX : e.pageX,
				newY      = (touch) ? touch.pageY : e.pageY,
				deltaX    = newX - data.startX,
				deltaY    = newY - data.startY,
				endT      = new Date().getTime(),
				eType     = data.scale ? Events.scaleEnd : Events.panEnd,
				dirX      = (deltaX > 0) ? "right" : "left",
				dirY      = (deltaY > 0) ? "down"  : "up",
				movedX    = Math.abs(deltaX) > 1,
				movedY    = Math.abs(deltaY) > 1;

			// Swipe

			if (data.swipe && Math.abs(deltaX) > TouchThreshold && (endT - data.startT) < TouchTime) {
				eType = Events.swipe;
			}

			// Kill clicks to internal links

			if ( (data.axis && ((data.axisX && movedY) || (data.axisY && movedX))) || (movedX || movedY) ) {
				data.$links = data.$el.find("a");

				for (var i = 0, count = data.$links.length; i < count; i++) {
					bindLink(data.$links.eq(i), data);
				}
			}

			var newE = buildEvent(eType, e, newX, newY, data.scaleD, deltaX, deltaY, dirX, dirY);

			$Window.off( [
				Events.touchMove,
				Events.touchEnd,
				Events.touchCancel,
				Events.mouseMove,
				Events.mouseUp,
				Events.pointerMove,
				Events.pointerUp,
				Events.pointerCancel
			].join(" ") );

			data.$el.trigger(newE);

			data.touches = [];

			if (data.scale) {
				/*
				if (e.originalEvent.pointerId) {
					for (var i in data.touches) {
						if (data.touches[i].id === e.originalEvent.pointerId) {
							data.touches.splice(i, 1);
						}
					}
				} else {
					data.touches = e.originalEvent.touches;
				}
				*/

				/*
				if (data.touches.length) {
					onPointerStart($.extend(e, {
						data: data,
						originalEvent: {
							touches: data.touches
						}
					}));
				}
				*/
			}
		}

		data.touching = false;
	}

	/**
	 * @method private
	 * @name onClick
	 * @description Handles click.
	 * @param e [object] "Event data"
	 */

	function onClick(e) {
		Functions.killEvent(e);

		var data = e.data;

		if (!data.clicked) {
			if (e.type !== "click") {
				data.clicked = true;
			}

			var newX    = (data.startE) ? data.startX : e.pageX,
				newY    = (data.startE) ? data.startY : e.pageY,
				newE    = buildEvent(Events.tap, e.originalEvent, newX, newY, 1, 0, 0);

			data.$el.trigger( newE );
		}
	}

	/**
	 * @method private
	 * @name buildEvents
	 * @description Builds new event.
	 * @param type [type] "Event type"
	 * @param oe [object] "Original event"
	 * @param x [int] "X value"
	 * @param y [int] "Y value"
	 * @param scale [float] "Scale value"
	 * @param dx [float] "Delta X value"
	 * @param dy [float] "Delta Y value"
	 */

	function buildEvent(type, oe, px, py, s, dx, dy, dirx, diry) {
		return $.Event(type, {
			originalEvent : oe,
			bubbles       : true,
			pageX         : px,
			pageY         : py,
			scale         : s,
			deltaX        : dx,
			deltaY        : dy,
			directionX    : dirx,
			directionY    : diry
		});
	}

	/**
	 * @method private
	 * @name midpoint
	 * @description Calculates midpoint.
	 * @param a [float] "Value 1"
	 * @param b [float] "Value 2"
	 */

	function midpoint(a, b) {
		return (a + b) / 2.0;
	}

	/**
	 * @method private
	 * @name pythagorus
	 * @description Pythagorean theorem.
	 * @param a [float] "Value 1"
	 * @param b [float] "Value 2"
	 */

	function pythagorus(a, b) {
		return Math.sqrt((a * a) + (b * b));
	}

	/**
	 * @method private
	 * @name touchAction
	 * @description Set ms touch action on target.
	 * @param action [string] "Touch action value"
	 */

	function touchAction($target, action) {
		$target.css({
			"-ms-touch-action": action,
			    "touch-action": action
		});
	}

	/**
	 * @plugin
	 * @name Touch
	 * @description A jQuery plugin for multi-touch events.
	 * @type widget
	 * @dependency core.js
	 */

	var legacyPointer = !(Formstone.window.PointerEvent),
		Plugin = Formstone.Plugin("touch", {
			widget: true,

			/**
			 * @options
			 * @param axis [string] <null> "Limit axis for pan and swipe; 'x' or 'y'"
			 * @param pan [boolean] <false> "Pan events"
			 * @param scale [boolean] <false> "Scale events"
			 * @param swipe [boolean] <false> "Swipe events"
			 * @param tap [boolean] <false> "'Fastclick' event"
			 */

			defaults : {
				axis     : false,
				pan      : false,
				scale    : false,
				swipe    : false,
				tap      : false
			},

			methods : {
				_construct    : construct,
				_destruct     : destruct
			},

			events: {
				pointerDown    : legacyPointer ? "MSPointerDown"   : "pointerdown",
				pointerUp      : legacyPointer ? "MSPointerUp"     : "pointerup",
				pointerMove    : legacyPointer ? "MSPointerMove"   : "pointermove",
				pointerCancel  : legacyPointer ? "MSPointerCancel" : "pointercancel"
			}
		}),

		// Localize References

		Events        = Plugin.events,
		Functions     = Plugin.functions,

		// Local

		$Window           = Formstone.$window,
		TouchThreshold    = 5,
		TouchTime         = 200;

		/**
		 * @events
		 * @event tap "'Fastclick' event; Prevents ghost clicks on mobile"
		 * @event panstart "Panning started"
		 * @event pan "Panning"
		 * @event panend "Panning ended"
		 * @event scalestart "Scaling started"
		 * @event scale "Scaling"
		 * @event scaleend "Scaling ended"
		 * @event swipe "Swipe"
		 */

		Events.tap           = "tap";
		Events.pan           = "pan";
		Events.panStart      = "panstart";
		Events.panEnd        = "panend";
		Events.scale         = "scale";
		Events.scaleStart    = "scalestart";
		Events.scaleEnd      = "scaleend";
		Events.swipe         = "swipe";

})(jQuery, Formstone);
;(function ($, Formstone, undefined) {

	"use strict";

	/**
	 * @method private
	 * @name construct
	 * @description Builds instance.
	 * @param data [object] "Instance Data"
	 * @param callback [object] "Function to call"
	 */

	function construct(data, callback) {
		if (callback) {
			// Target child element, for event delegation

			data.$target     = this.find(data.target);
			data.$check      = data.target ? data.$target : this;
			data.callback    = callback;
			data.styles      = getStyles(data.$check);
			data.timer       = null;

			var duration = data.$check.css( Formstone.transition + "-duration" ),
				durationValue = parseFloat(duration);

			if (Formstone.support.transition && duration && durationValue) {
				// If transitions supported and active

				this.on(Events.transitionEnd, data, onTranistionEnd);
			} else {
				data.timer = Functions.startTimer(data.timer, 50, function() {
					checkStyles(data);
				}, true);
			}
		}
	}

	/**
	 * @method private
	 * @name destruct
	 * @description Tears down instance.
	 * @param data [object] "Instance data"
	 */

	function destruct(data) {
		Functions.clearTimer(data.timer, true);

		this.off(Events.namespace);
	}

	/**
	 * @method private
	 * @name onTransitionEnd
	 * @description Handles transition end events.
	 * @param e [object] "Event data"
	 */

	function onTranistionEnd(e) {
		e.stopPropagation();
		e.preventDefault();

		var data           = e.data,
			oe             = e.originalEvent,
			$target        = data.target ? data.$target : data.$el;

		// Check property and target
		if ( (!data.property || oe.propertyName === data.property) && $(oe.target).is($target) ) {
			resolve(data);
		}
	}

	/**
	 * @method private
	 * @name resolve
	 * @description Resolves transition end events.
	 * @param e [object] "Event data"
	 */
	/**
	 * @method
	 * @name resolve
	 * @description Resolves current transition end events.
	 * @example $(".target").transition("resolve");
	 */

	function resolve(data) {
		if (!data.always) {
			// Unbind events, clear timers, similiar to .one()

			data.$el[Plugin.namespace]("destroy"); // clean up old data?
		}

		// fire callback

		data.callback.apply(data.$el);
	}

	/**
	 * @method private
	 * @name checkStyles
	 * @description Compares current CSS to previous styles.
	 * @param data [object] "Instance data"
	 */

	function checkStyles(data) {
		var styles = getStyles(data.$check);

		if (!isEqual(data.styles, styles)) {
			resolve(data);
		}

		data.styles = styles;
	}

	/**
	 * @method private
	 * @name getStyles
	 * @description Returns element's styles.
	 * @param el [DOM] "Element to check"
	 */

	function getStyles(el) {
		var computed,
			styles = {},
			prop,
			val;

		if (el instanceof $) {
			el = el[0];
		}

		if (Window.getComputedStyle) {
			// FireFox, Chrome, Safari

			computed = Window.getComputedStyle(el, null);

			for (var i = 0, count = computed.length; i < count; i++) {
				prop = computed[i];
				val = computed.getPropertyValue(prop);

				styles[prop] = val;
			}
		} else if (el.currentStyle) {
			// IE, Opera

			computed = el.currentStyle;

			for (prop in computed) {
				if (computed[prop]) { // ie8...
					styles[prop] = computed[prop];
				}
			}
		}

		return styles;
	}

	/**
	 * @method private
	 * @name isEqual
	 * @description Compares two obejcts.
	 * @param a [object] "Object to compare"
	 * @param b [object] "Object to compare"
	 */

	function isEqual(a, b) {
		if ($.type(a) !== $.type(b)) {
			return false;
		}

		for (var i in a) {
			if ( !(a.hasOwnProperty(i) && b.hasOwnProperty(i) && a[i] === b[i]) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * @plugin
	 * @name Transition
	 * @description A jQuery plugin for CSS transition events.
	 * @type widget
	 * @dependency core.js
	 */

	var Plugin = Formstone.Plugin("transition", {
			widget: true,

			/**
			 * @options
			 * @param always [boolean] <False> "Flag to always react to transition end (.on vs .one)"
			 * @param property [string] <null> "Property to react to"
			 * @param target [string] <null> "Target child selector"
			 */

			defaults: {
				always      : false,
				property    : null,
				target      : null
			},

			methods : {
				_construct    : construct,
				_destruct     : destruct,
				resolve       : resolve
			}
		}),

		// Localize References

		Events       = Plugin.events,
		Functions    = Plugin.functions,

		Window       = Formstone.window;

})(jQuery, Formstone);
;(function ($, Formstone, undefined) {

	"use strict";

	/**
	 * @method private
	 * @name construct
	 * @description Builds instance.
	 * @param data [object] "Instance data"
	 */

	function construct(data) {
		if (Formstone.support.file) {
			var html = "";

			html += '<div class="' + RawClasses.target + '">';
			html += data.label;
			html += '</div>';
			html += '<input class="' + RawClasses.input + '" type="file"';
			if (data.maxQueue > 1) {
				html += ' ' + RawClasses.multiple;
			}
			html += '>';

			this.addClass(RawClasses.base)
				.append(html);

			data.$input       = this.find(Classes.input);
			data.queue        = [];
			data.total        = 0;
			data.uploading    = false;

			this.on(Events.click, Classes.target, data, onClick)
				.on(Events.dragEnter, data, onDragEnter)
				.on(Events.dragOver, data, onDragOver)
				.on(Events.dragLeave, data, onDragOut)
				.on(Events.drop, Classes.target, data, onDrop);

			data.$input.on(Events.change, data, onChange);
		}
	}

	/**
	 * @method private
	 * @name destruct
	 * @description Tears down instance.
	 * @param data [object] "Instance data"
	 */

	function destruct(data) {
		if (Formstone.support.file) {
			data.$input.off(Events.namespace);

			this.off( [Events.click, Events.dragEnter, Events.dragOver, Events.dragLeave, Events.drop].join(" ") )
				.removeClass(RawClasses.base)
				.html("");
		}
	}

	/**
	 * @method private
	 * @name onClick
	 * @description Handles click to target.
	 * @param e [object] "Event data"
	 */
	function onClick(e) {
		e.stopPropagation();
		e.preventDefault();

		var data = e.data;

		data.$input.trigger(Events.click);
	}

	/**
	 * @method private
	 * @name onChange
	 * @description Handles change to hidden input.
	 * @param e [object] "Event data"
	 */
	function onChange(e) {
		e.stopPropagation();
		e.preventDefault();

		var data = e.data,
			files = data.$input[0].files;

		if (files.length) {
			handleUpload(data, files);
		}
	}

	/**
	 * @method private
	 * @name onDragEnter
	 * @description Handles dragenter to target.
	 * @param e [object] "Event data"
	 */
	function onDragEnter(e) {
		e.stopPropagation();
		e.preventDefault();

		var data = e.data;

		data.$el.addClass(RawClasses.dropping);
	}

	/**
	 * @method private
	 * @name onDragOver
	 * @description Handles dragover to target.
	 * @param e [object] "Event data"
	 */
	function onDragOver(e) {
		e.stopPropagation();
		e.preventDefault();

		var data = e.data;

		data.$el.addClass(RawClasses.dropping);
	}

	/**
	 * @method private
	 * @name onDragOut
	 * @description Handles dragout to target.
	 * @param e [object] "Event data"
	 */
	function onDragOut(e) {
		e.stopPropagation();
		e.preventDefault();

		var data = e.data;

		data.$el.removeClass(RawClasses.dropping);
	}

	/**
	 * @method private
	 * @name onDrop
	 * @description Handles drop to target.
	 * @param e [object] "Event data"
	 */
	function onDrop(e) {
		e.preventDefault();

		var data = e.data,
			files = e.originalEvent.dataTransfer.files;

		data.$el.removeClass(RawClasses.dropping);

		handleUpload(data, files);
	}

	/**
	 * @method private
	 * @name handleUpload
	 * @description Handles new files.
	 * @param data [object] "Instance data"
	 * @param files [object] "File list"
	 */
	function handleUpload(data, files) {
		var newFiles = [];

		for (var i = 0; i < files.length; i++) {
			var file = {
				index: data.total++,
				file: files[i],
				name: files[i].name,
				size: files[i].size,
				started: false,
				complete: false,
				error: false,
				transfer: null
			};

			newFiles.push(file);
			data.queue.push(file);
		}

		if (!data.uploading) {
			$Window.on(Events.beforeUnload, function(){
				return data.leave;
			});

			data.uploading = true;
		}

		data.$el.trigger(Events.start, [ newFiles ]);

		checkQueue(data);
	}

	/**
	 * @method private
	 * @name checkQueue
	 * @description Checks and updates file queue.
	 * @param data [object] "Instance data"
	 */
	function checkQueue(data) {
		var transfering = 0,
			newQueue = [];

		// remove lingering items from queue
		for (var i in data.queue) {
			if (data.queue.hasOwnProperty(i) && !data.queue[i].complete && !data.queue[i].error) {
				newQueue.push(data.queue[i]);
			}
		}

		data.queue = newQueue;

		for (var j in data.queue) {
			if (data.queue.hasOwnProperty(j)) {
				if (!data.queue[j].started) {
					var formData = new FormData();

					formData.append(data.postKey, data.queue[j].file);

					for (var k in data.postData) {
						if (data.postData.hasOwnProperty(k)) {
							formData.append(k, data.postData[k]);
						}
					}

					uploadFile(data, data.queue[j], formData);
				}

				transfering++;

				if (transfering >= data.maxQueue) {
					return;
				} else {
					i++;
				}
			}
		}

		if (transfering === 0) {
			$Window.off(Events.beforeUnload);

			data.uploading = false;

			data.$el.trigger(Events.complete);
		}
	}

	/**
	 * @method private
	 * @name uploadFile
	 * @description Uploads file.
	 * @param data [object] "Instance data"
	 * @param file [object] "Target file"
	 * @param formData [object] "Target form"
	 */
	function uploadFile(data, file, formData) {
		if (file.size >= data.maxSize) {
			file.error = true;
			data.$el.trigger(Events.fileError, [ file, "Too large" ]);

			checkQueue(data);
		} else {
			file.started = true;
			file.transfer = $.ajax({
				url: data.action,
				data: formData,
				type: "POST",
				contentType:false,
				processData: false,
				cache: false,
				xhr: function() {
					var $xhr = $.ajaxSettings.xhr();

					if ($xhr.upload) {
						// Clean progress event
						$xhr.upload.addEventListener("progress", function(e) {
							var percent = 0,
								position = e.loaded || e.position,
								total = e.total;

							if (e.lengthComputable) {
								percent = Math.ceil(position / total * 100);
							}

							data.$el.trigger(Events.fileProgress, [ file, percent ]);
						}, false);
					}

					return $xhr;
				},
				beforeSend: function(e) {
					data.$el.trigger(Events.fileStart, [ file ]);
				},
				success: function(response, status, jqXHR) {
					file.complete = true;
					data.$el.trigger(Events.fileComplete, [ file, response ]);

					checkQueue(data);
				},
				error: function(jqXHR, status, error) {
					file.error = true;
					data.$el.trigger(Events.fileError, [ file, error ]);

					checkQueue(data);
				}
			});
		}
	}

	/**
	 * @plugin
	 * @name Upload
	 * @description A jQuery plugin for simple drag and drop uploads.
	 * @type widget
	 * @dependency core.js
	 */

	var Plugin = Formstone.Plugin("upload", {
			widget: true,

			/**
			 * @options
			 * @param action [string] "Where to submit uploads"
			 * @param label [string] <'Drag and drop files or click to select'> "Drop target text"
			 * @param leave [string] <'You have uploads pending, are you sure you want to leave this page?'> "Before leave message"
			 * @param maxQueue [int] <2> "Number of files to simultaneously upload"
			 * @param maxSize [int] <5242880> "Max file size allowed"
			 * @param postData [object] "Extra data to post with upload"
			 * @param postKey [string] <'file'> "Key to upload file as"
			 */

			defaults: {
				customClass    : "",
				action         : "",
				label          : "Drag and drop files or click to select",
				leave          : "You have uploads pending, are you sure you want to leave this page?",
				maxQueue       : 2,
				maxSize        : 5242880, // 5 mb
				postData       : {},
				postKey        : "file"
			},

			classes: [
				"input",
				"target",
				"multiple",
				"dropping"
			],

			methods: {
				_construct    : construct,
				_destruct     : destruct
			}
		}),

		// Localize References

		Classes       = Plugin.classes,
		RawClasses    = Classes.raw,
		Events        = Plugin.events,
		Functions     = Plugin.functions,

		$Window       = Formstone.$window;

		/**
		 * @events
		 * @event complete "All uploads are complete"
		 * @event filecomplete "Specific upload complete"
		 * @event fileerror "Specific upload error"
		 * @event filestart "Specific upload starting"
		 * @event fileprogress "Specific upload progress"
		 * @event start "Uploads starting"
		 */

		Events.complete        = "complete";
		Events.fileStart       = "filestart";
		Events.fileProgress    = "fileprogress";
		Events.fileComplete    = "filecomplete";
		Events.fileError       = "fileerror";
		Events.start           = "start";

})(jQuery, Formstone);