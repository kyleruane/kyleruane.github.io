$(document).ready(function(){

    // Featured Photo
    $('.work .background').css('background-image', function(){
       return 'url(' + $(this).children('.bg').find('img').attr("src") + ')';
    });
    $('.work .feature').css('background-image', function(){
       return 'url(' + $(this).siblings('.thumb').find('img').attr("src") + ')';
    });
    $('.profile .feature .image').css('background-image', function(){
       return 'url(' + $(this).parent().find('img').attr("src") + ')';
    });

    // Replace SVG images with PNG versions if SVG is not supported
    if(!Modernizr.svg) {
        $('img[src*="svg"]').attr('src', function() {
            return $(this).attr('src').replace('.svg', '.png');
        });
    }

    // Duplicate navigation in mobile menu
    var $clonenav = $('.site-header nav ul').clone();
    $(".mobile-menu").append($clonenav);

    // Toggle for mobile nav & button
    $('.nav-toggle').click(function(e){
        e.preventDefault();
        $('.mobile-menu').fadeToggle();
        $(this).toggleClass('active');
        $('body').toggleClass('freeze');
        $('html').toggleClass('freeze');
    });

    // Change style for active nav link
    var section = window.location.pathname.split('/'),
        sectionPart = section[1];

    if ( typeof sectionPart === "undefined" || sectionPart == '' ) {
        sectionPart = 'projects';
        $('.main-nav ul li').first().addClass('active');
    }

    $('.main-nav ul li a[href*="'+sectionPart+'"]').parent().addClass('active');


    // Show/Hide Search Panel
    $('.search-link').click(function(e) {
        e.preventDefault();
        $('.search').fadeIn();
        $('body').addClass('freeze');
    });
    $('.search .search-close').click(function(e) {
        e.preventDefault();
        $('.search').fadeOut();
        $('body').removeClass('freeze');
    });

    // Work slide-y panel thing
    $('.panel-links .a-link').click(function(e) {
        e.preventDefault();
        $(this).closest('.work').removeClass('a-active b-active c-active')
        $(this).closest('.work').addClass('a-active');
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
    });
    $('.panel-links .b-link').click(function(e) {
        e.preventDefault();
        $(this).closest('.work').removeClass('a-active b-active c-active')
        $(this).closest('.work').addClass('b-active');
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
    });
    $('.panel-links .c-link').click(function(e) {
        e.preventDefault();
        $(this).closest('.work').removeClass('a-active b-active c-active')
        $(this).closest('.work').addClass('c-active');
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
    });

    // The function that sorts items
    /*
    (function($){
        $.fn.sortChildrenByDataKey = function(key, desc){
            var i, els = this.children().sort(function(a, b) {
                return (desc?1:-1)*($(a).data(key) - $(b).data(key));
            });
            for (i = 0; i < els.length; i++) {
                this.prepend($(els[i]).detach());
            }
            return this;
        };
    })(jQuery);

    // After the page loads, reorder the items based on the data-order attribute
    $('.work-panel#a .grid').sortChildrenByDataKey('order', false);
    $('.work-panel#b .grid').sortChildrenByDataKey('order', false);
    $('.work-panel#c .grid').sortChildrenByDataKey('order', false);
    */

    $('.grayscale').gray();

    // Password
    function TheLogin() {
    var password = 'keymaster';

    if (this.document.login.pass.value == password) {
      top.location.href="secret-project.html";
    }
    else {
      window.alert("Incorrect password, please try again.");
      }
    }

});
