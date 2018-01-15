
// Replace SVG images with PNG versions if SVG is not supported
if(!Modernizr.svg) {
    $('img[src*="svg"]').attr('src', function() {
        return $(this).attr('src').replace('.svg', '.png');
    });
}

// BS Tooltips
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

// Number Input UI
$("input[type=number]").number();

// Select Replacement
$("select").dropdown();

// Checkbox & Radio Replacement
$("input[type=checkbox].toggle").checkbox({
    toggle: true
});
$("input[type=checkbox], input[type=radio]").checkbox();
