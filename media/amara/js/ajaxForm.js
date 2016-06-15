// Simple ajax form implementation

(function($) {
    $.behaviors('form.ajax', ajaxForm);

    function ajaxForm(form) {
        $(form).ajaxForm({
            success: function(data, statusText, xhr) {
                if(data && data.replace) {
                    $.each(data.replace, function(selector, html) {
                        var newContent = $(html)
                        var container = $(selector);
                        container.empty().append(newContent);
                        container.updateBehaviors();
                        if(data.success) {
                            $(form).clearForm();
                        }
                        if(data.hideModal) {
                            $(data.hideModal).modal('hide');
                        }
                    });
                }
            }
        });
    }
})(jQuery);
