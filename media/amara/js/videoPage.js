(function($) {
    $.behaviors('table.video_urls button[data-toggle=url-modal]', openUrlModalButton);

    function openUrlModalButton(button) {
        button = $(button);
        button.click(function(evt) {
            var row = $(this).closest('tr');
            var dialog = $(button.data('target'));
            dialog.modal('show');
            $('.url', dialog).text(row.data('url'));
            $('input[name=id]', dialog).val(row.data('id'));
        });
    }

})(jQuery);

