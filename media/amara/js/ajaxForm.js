// Simple ajax form implementation

(function($) {
    $.behaviors('form.ajax', ajaxForm);

    function ajaxForm(form) {
        var submitting = false;
        var sawSecondSubmit = false;
        form = $(form);
        form.ajaxForm({
            beforeSubmit: function() {
                if(submitting) {
                    sawSecondSubmit = true;
                    return false;
                } else {
                    submitting = true;
                }
            },
            complete: function() {
                submitting = false;
                if(sawSecondSubmit) {
                    sawSecondSubmit = false;
                    form.submit();
                }
            },
            success: function(data, statusText, xhr) {
                if(data && data.replace) {
                    $.each(data.replace, function(selector, html) {
                        var newContent = $(html);
                        var container = $(selector);
                        container.empty().append(newContent);
                        container.updateBehaviors();
                        if(data.clearForm) {
                            $(form).clearForm();
                        }
                        if(data.hideModal) {
                            $.each(data.hideModal, function(i, selector) {
                                $(selector).modal('hide');
                            });
                        }
                    });
                }
            }
        });

        if(form.hasClass('update-on-change')) {
            $('select, input, textbox', form).change(submitIfChanged);
            $('input[type=text]', form).keyup(submitIfChanged);
        }

        var lastSerialize = form.formSerialize();
        function submitIfChanged() {
            var newSerialize = form.formSerialize();
            if(newSerialize != lastSerialize) {
                lastSerialize = newSerialize;
                form.submit();
            }
        }
    }
})(jQuery);
