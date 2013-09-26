/*	
 * lingsTooltip.js
 * @version 2.0
 * @requires jQuery v1.7 or later
 * @author Elliot Lings
 * 
 * The following copyright notice and license information must stay intact.
 * Copyright Elliot Lings 2012 - elliotlings.com/jquery/tooltip
 * This work is licensed under the Creative Commons Attribution-NonCommercial 3.0 Unported License - http://creativecommons.org/licenses/by-nc/3.0/
 */
;(function($, window, document, undefined){
	"use strict";

	var W = $(document);

	$.fn.extend({
        tooltip: function(options, arg) {
        	options = options || {};
            if (options && typeof(options) == 'object') {
                options = $.extend( {}, $.tooltip.defaults, options );
            }

            this.each(function() {
            	new $.tooltip(this, options, arg);
            });
            return;
        }
    });

    $.tooltip = function(ele, options, arg) {

    	var ele,
    		options,
    		arg,
    		method,
    		methods = {
		        open: function(){
			       	if(typeof options.onOpen == 'function'){
			        	options.onOpen.call(this, ele, options);
			      	}

		        	if(options.unique) this.closeAllTooltips();
		        	this.bindCloseEvent();
		        	if(options.autoPosition) this.position();
		        	if(options.ajax&&!options.preload) this.ajaxRequest(); 

	        		options.tooltip.stop(true).fadeTo(options.fade, 1, function(){
				       	if(typeof options.onOpened == 'function'){
				        	options.onOpened.call(this, ele, options);
				      	}
	        		});

		        },
		        close: function(){
			       	if(typeof options.onClose == 'function'){
			        	options.onClose.call(this, ele, options);
			      	}

		        	this.bindOpenEvent();
	        		options.tooltip.stop(true).fadeTo(options.fade, 0, function(){
				       	if(typeof options.onClosed == 'function'){
				        	options.onClosed.call(this, ele, options);
				      	}
	        		});

		        },
		        closeAllTooltips: function(){
		        	$($.tooltip.tips).each(function(){
		        		var data = $(this).data('tooltip');
		        		if(!data.stayOpen) $(this).tooltip('close');
		        	});
		        },
		        position: function(animate,g,prevent){
		        	options.gravity = g || options.gravity;
		        	animate = animate || false;

		        	var	anchor = $(ele),
						anchorX = anchor.offset().left,
						anchorY = anchor.offset().top,
						anchorW = anchor.outerWidth(),
						anchorH = anchor.outerHeight(),
						anchorHalfW = anchorW/2;

					var	tooltip = options.tooltip,
						tooltipW = tooltip.outerWidth(),
						tooltipH = tooltip.outerHeight(),
						tooltipHalfW = tooltipW/2;


					if(options.autoGravity){
						var windowWidth  = W.width(),
							windowHeight = W.height();
							if((anchorY + anchorH + tooltipH + options.offsetY < windowHeight) && ((tooltipHalfW - anchorHalfW)<=anchorX)){
								options.gravity = 'n';
							}
							else if((tooltipW + options.offsetX < anchorX) && (tooltipH/2 + anchorY + anchorH/2 < windowHeight)){
								options.gravity = 'e';
							}
							else if((tooltipH + options.offsetY < anchorY) && (tooltipHalfW - anchorHalfW<=anchorX)){
								options.gravity = 's';
							}
							else if((tooltipW + options.offsetX + anchorW + anchorX < windowWidth) && (tooltipH/2 + anchorY + anchorH/2 < windowHeight)){
								options.gravity = 'w';
							}
					}

					if(tooltip.hasClass(options.gravity)&&prevent) return;

						tooltip.removeClass('n e w s');
						tooltip.addClass(options.gravity);

					if(animate){
						switch(options.gravity){
								case 'n': default: tooltip.stop().animate({'top': anchorY + anchorH + options.offsetY, 'left': anchorX + anchorW/2 - tooltipHalfW}); break;
								case 's': tooltip.stop().animate({'top': anchorY - tooltipH - options.offsetY, 'left': anchorX + anchorW/2 - tooltipHalfW }); break;
								case 'w': tooltip.stop().animate({'top': anchorY + anchorH/2 - tooltipH/2, 'left': anchorX + anchorW + options.offsetX }); break;
								case 'e': tooltip.stop().animate({'top': anchorY + anchorH/2 - tooltipH/2, 'left': anchorX - tooltipW - options.offsetX }); break;
							}
					}
					else {
						switch(options.gravity){
							case 'n': default: tooltip.css({'top': anchorY + anchorH + options.offsetY, 'left': anchorX + anchorW/2 - tooltipHalfW}); break;
							case 's': tooltip.css({'top': anchorY - tooltipH - options.offsetY, 'left': anchorX + anchorW/2 - tooltipHalfW }); break;
							case 'w': tooltip.css({'top': anchorY + anchorH/2 - tooltipH/2, 'left': anchorX + anchorW + options.offsetX }); break;
							case 'e': tooltip.css({'top': anchorY + anchorH/2 - tooltipH/2, 'left': anchorX - tooltipW - options.offsetX }); break;
						}
					}

			       	if(typeof options.onPosition == 'function'){
			        	options.onPosition.call(this, ele, options);
			      	}

		        },
		        bindCloseEvent: function(){
		        	$(ele).off('.lingstip');
		        	if(options.closeTrigger){
		        		$(ele).on((options.closeTrigger+'.lingstip'), function(e){
		        			if(options.preventDefault) e.preventDefault();
		        			$(ele).tooltip('close');
		        		});
	        		}		        		
		        },
		        bindOpenEvent: function(){
		        	$(ele).off('.lingstip');
		        	if(options.openTrigger){
		        		$(ele).on((options.openTrigger+'.lingstip'), function(e){
		        			if(options.preventDefault) e.preventDefault();
		        			$(ele).tooltip('open');
		        		});
	        		}
		        },
		        ajaxRequest: function(ajaxObject){
		        	var that = this;
		        	ajaxObject = ajaxObject || options.ajax;
		        	$.ajax(ajaxObject).done(function(msg){
		        		options.content = msg;
		        		that.updateContent(msg);
		        	}).fail(function(jqXHR, textStatus){
		        		options.content = textStatus;
		        		that.updateContent(textStatus);		        		
		        	});
		        	options.preload = true;
		        },
		        updateOptions: function(updated){
		        	$.extend(options, updated);
		        },
		        updateContent: function(content){
		        	options.tooltip.find('.tooltip-contents').html(content);
		        	this.position();
		        },
		        remove: function(){
		        	options.tooltip.remove();
		        	$(ele).removeData(options.closeTrigger+'.lingstip,'+options.openTrigger+'.lingstip');
		        	$(ele).off(options.closeTrigger)
		        	$.tooltip.tips.splice(options.tid,1);
		        	$.tooltip.iterator--;
		        	return false;
		        }
    		};

        if (options && typeof(options) == 'string') {
        	if(typeof $(ele).data('tooltip') == 'undefined'){
				console.log("Cannot apply this method to tooltip. Tooltip doesn't exist.");
				return;
			}
			method = options;
			options = $(ele).data('tooltip');
           	methods[method](arg);
           	return this;
        }
        else if(options && typeof(options) == 'object'){

	       	if(typeof options.onCreate == 'function'){
	        	options.onCreate.call(this, ele, options);
	      	}

	      	options.tid = $.tooltip.iterator;

	      	$.tooltip.tips[$.tooltip.iterator] = ele;

	      	if(options.ajax){
	      		if(options.preload) methods.ajaxRequest();
	      	}

        	var tooltip = $(options.template.replace('{{content}}', options.content)).addClass('tooltip-' + options.tid + (options.classes != null ? ' ' + options.classes : '')).attr('id',options.id);
        	if(options.closeButton) tooltip.prepend($(options.closeButtonContents).click(function(e){ e.preventDefault(); methods.close(); }));
        	options.tooltip = tooltip.hide();
	      	options.fade = options.fade || 0;

        	methods.bindOpenEvent();

        	if(options.autoPosition){
        		$(window).on('resize', function(){
        			$($.tooltip.tips).each(function(){
        				var me = this;
        				if(typeof timer == 'undefined'){
		        			var timer = setTimeout(function(){ $(me).tooltip('position', false,'',true) }, 2000);
		        		}
        			});
        		});
        	}

			if(options.wrap){ $(ele).wrap('<div />').append(options.tooltip); }
			else { $('body').append(options.tooltip); }

        	methods.position();

        	$.tooltip.iterator++;

        }

    	$(ele).data('tooltip', options);


    };

    $.tooltip.iterator = 0;
    $.tooltip.tips = [];
    $.tooltip.reposition = function(animate){
    	animate = animate || false;
    	$($.tooltip.tips).each(function(){
    		$(this).tooltip('position',animate);
    	});
    };

    $.tooltip.defaults = {
		'content':"Empty",
		'classes':null,
		'id':null,
		'wrap':false,
		'openTrigger':'click',
		'closeTrigger':'click',
		'preventDefault':true,
		'closeButton':false,
		'fade':500,
		'gravity':'n',
		'autoGravity':true,
		'autoPosition':true,
    	'unique':true,
    	'stayOpen':false,
		'offsetY': 10,
		'offsetX': 15,
		'ajax':null,
		'preload':false,
		'template':'\
			<div class="tooltip-container">\
				<div class="tooltip-contents">{{content}}</div>\
				<div class="arrow"></div>\
			</div>',
		'closeButtonContents':'<a href="#" class="tooltip-close">Close</a>',
		'onCreate':function(){},
		'onOpen':function(){},
		'onOpened':function(){},
		'onClose':function(){},
		'onClosed':function(){},
		'onPosition':function(){}
    };

    $.tooltip.autoTipDefaults = {
		'autoTip':true,
		'autoTipSelector':'.tip'
    };

    $.tooltip.setDefaults = function(defaults){
    	$.extend($.tooltip.defaults, defaults);
    };

    $.tooltip.autoTip = function(){
    	var createTooltip = function(selector){
    		$(selector).tooltip({
    			'unique':false,
				'openTrigger':'mouseover',
				'closeTrigger':'mouseout',
				'stayOpen':true,
				'closeButton':false,
				'onCreate': function(ele, options){
					options.content = $(ele).attr("title");
					$(ele).attr("title",null);
				}
			});   		
    	}
    	$($.tooltip.autoTipDefaults.autoTipSelector).each(function(){ createTooltip(this); });

	    $($.tooltip.autoTipDefaults.autoTipSelector).live('DOMNodeInserted', function(){
	    	if($.tooltip.autoTipDefaults.autoTip) createTooltip(this);
	    });

    }

    $(document).ready($.tooltip.autoTip);

})(jQuery, window, document);
