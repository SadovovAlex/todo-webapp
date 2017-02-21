/**
 * Tooltips Class File.
 * Adds custom tooltips to elements on the page.
 *
 * @author     Rainner Lins <http://rainnerlins.com/>
 * @copyright  (c) All Rights Reserved
 * @license    See included LICENSE file
 */
"use strict";

(function( name, factory ) {

    if( typeof define === "function" ) { define( factory ); } else
    if( typeof exports === "object" ) { module.exports = factory(); } else
    if( typeof window === "object" ) { window[ name ] = factory(); }

})( "Tooltip", function() {

    var _w = window,
        _d = document.documentElement,
        _b = document.body;

    // get view and scroll data
    var View = {

        clientWidth : function() {
            return Math.max( 0, _w.innerWidth || _d.clientWidth || _b.clientWidth || 0 );
        },
        clientHeight : function() {
            return Math.max( 0, _w.innerHeight || _d.clientHeight || _b.clientHeight || 0 );
        },
        scrollLeft : function() {
            return Math.max( 0, _w.pageXOffset || _d.scrollLeft || _b.scrollLeft || 0 ) - ( _d.clientLeft || _b.clientLeft || 0 );
        },
        scrollTop : function() {
            return Math.max( 0, _w.pageYOffset || _d.scrollTop || _b.scrollTop || 0 ) - ( _d.clientTop || _b.clientTop || 0 );
        },
    };

    // class constructor
    var Factory = function( selector, options )
    {
        this._options = Object.assign( {
            // class to apply to tooltip element
            tipClass : "tooltip-wrap",
            // class to apply when tooltip is placed on the left
            leftClass : "tooltip-left",
            // class to apply when tooltip is placed on the right
            rightClass : "tooltip-right",
            // class to apply when tooltip is placed on the top
            topClass : "tooltip-top",
            // class to apply when tooltip is placed on the bottom
            bottomClass : "tooltip-bottom",
            // delay to show the tooltip
            showDelay : 200,
            // ...
        }, options );

        this._tooltip  = null;
        this._hovItem  = null;
        this._timeout  = null;
        this._autohide = null;
        this._visible  = false;
        this._elements = [];
        this._onScroll = this._onScroll.bind( this );

        this.select( selector );
        this._init();
    };

    // class prototype
    Factory.prototype = {
        constructor: Factory,

        // set target elements
        select: function( selector )
        {
            if( typeof selector === "string" )
            {
                this._elements = document.querySelectorAll( selector ) || [];
            }
            else if( typeof selector === "object" && selector instanceof Element )
            {
                this._elements.push( selector );
            }
            for( var i = 0; i < this._elements.length; ++i )
            {
                this._setupItem( this._elements[ i ] );
            }
            this._hideTooltip();
        },

        // remove element from the list
        unselect: function( element )
        {
            if( typeof element === "object" && element instanceof Element )
            {
                for( var i = 0, t = this._elements.length; i < t; ++i )
                {
                    if( this._elements[ i ] === element )
                    {
                        this._resetItem( this._elements[ i ] );
                        this._elements.splice( i, 1 );
                        break;
                    }
                }
                this._hideTooltip();
            }
        },

        // cleanup this instance
        destroy: function()
        {
            for( var i = 0; i < this._elements.length; ++i )
            {
                this._resetItem( this._elements[ i ] );
            }
            if( document.body.contains( this._tooltip ) )
            {
                document.body.removeChild( this._tooltip );
            }
            window.removeEventListener( "scroll", this._onScroll );
            this._elements = [];
            this._tooltip = null;
        },

        // initlaize elements
        _init: function()
        {
            this._tooltip = document.createElement( "div" );
            this._tooltip.className = this._options.tipClass;
            this._tooltip.style["display"] = "block";
            this._tooltip.style["position"] = "absolute";
            this._tooltip.style["pointer-events"] = "none";
            this._hideTooltip();
            document.body.appendChild( this._tooltip );
            window.addEventListener( "scroll", this._onScroll );
        },

        // set an element to have tooltip, if not alredy setup
        _setupItem: function( item )
        {
            if( item && item instanceof Element )
            {
                if( item.hasAttribute( "title" ) )
                {
                    var tip  = item.getAttribute( "title" ) || "",
                        self = this;

                    item.setAttribute( "data-tip", tip );
                    item.removeAttribute( "title" );
                    item.addEventListener( "mouseenter", function( e ){ self._onEnter( e, this ); } );
                    item.addEventListener( "mouseleave", function( e ){ self._onLeave( e, this ); } );
                }
            }
        },

        // remove tooltip events from element, if needed
        _resetItem: function( item )
        {
            if( item && item instanceof Element )
            {
                if( item.hasAttribute( "data-tip" ) )
                {
                    var tip  = item.getAttribute( "data-tip" ) || "",
                        self = this;

                    item.setAttribute( "title", tip );
                    item.removeAttribute( "data-tip" );
                    item.removeEventListener( "mouseenter", function( e ){ self._onEnter( e, this ); } );
                    item.removeEventListener( "mouseleave", function( e ){ self._onLeave( e, this ); } );
                }
            }
        },

        // decides where to place the tooltip in relation to item and screen bounds
        _showTooltip: function()
        {
            if( this._tooltip && this._hovItem )
            {
                var box       = this._hovItem.getBoundingClientRect(),
                    centerX   = box.left + ( this._hovItem.offsetWidth - this._tooltip.offsetWidth ) / 2,
                    centerY   = box.top + ( this._hovItem.offsetHeight - this._tooltip.offsetHeight ) / 2,
                    leftPos   = box.left - this._tooltip.offsetWidth,
                    rightPos  = box.left + this._hovItem.offsetWidth,
                    topPos    = box.top - this._tooltip.offsetHeight,
                    bottomPos = box.top + this._hovItem.offsetHeight,
                    tipHalf   = this._tooltip.offsetWidth / 2,
                    clss      = this._options.topClass,
                    left      = centerX,
                    top       = topPos;

                if( box.left < tipHalf ) // move to the right
                {
                    clss = this._options.rightClass;
                    left = rightPos;
                    top  = centerY;
                }
                else if( ( View.clientWidth() - rightPos ) < tipHalf ) // move to the left
                {
                    clss = this._options.leftClass;
                    left = leftPos;
                    top  = centerY;
                }
                else if( topPos < 0 ) // move to the bottom
                {
                    clss = this._options.bottomClass;
                    left = centerX;
                    top  = bottomPos;
                }
                this._tooltip.className = this._options.tipClass + " " + clss;
                this._tooltip.style["left"] = ( View.scrollLeft() + left ) +"px";
                this._tooltip.style["top"] = ( View.scrollTop() + top ) +"px";
                this._tooltip.style["z-index"] = "666";
                this._visible = true;
            }
        },

        // move tooltip object off screen, reset content and class
        _hideTooltip: function()
        {
            if( this._tooltip )
            {
                this._tooltip.innerHTML = "";
                this._tooltip.className = this._options.tipClass;
                this._tooltip.style["left"] = "-1000px";
                this._tooltip.style["top"] = "-1000px";
                this._tooltip.style["z-index"] = "-666";
                this._visible = false;
            }
        },

        // when mouse enters target element
        _onEnter: function( e, item )
        {
            e.preventDefault();
            e.stopPropagation();

            var title = item.getAttribute( "data-tip" );
            if( title )
            {
                this._hovItem = item;
                this._tooltip.innerHTML = title;

                if( this._timeout ) clearTimeout( this._timeout );
                this._timeout = setTimeout( this._showTooltip.bind( this ), this._options.showDelay );

                if( this._autohide ) clearTimeout( this._autohide );
                this._autohide = setTimeout( this._hideTooltip.bind( this ), 8000 );
            }
        },

        // when mouse leaves target element
        _onLeave: function( e, item )
        {
            e.preventDefault();
            e.stopPropagation();

            if( this._timeout )
            {
                clearTimeout( this._timeout );
                this._timeout = null;
            }
            this._hovItem = null;
            this._hideTooltip();
        },

        // hide tooltip over fixed elements when scrolled
        _onScroll: function( e )
        {
            if( this._visible )
            {
                this._hideTooltip();
            }
        },

    };

    // export
    return Factory;
});