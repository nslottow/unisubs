# Amara, universalsubtitles.org
#
# Copyright (C) 2016 Participatory Culture Foundation
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see
# http://www.gnu.org/licenses/agpl-3.0.html.

"""Ajax-related functionality."""

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.template.loader import render_to_string

class AJAXResponseRenderer(object):
    """Render a AJAX response

    This class helps build up AJAX responses for our views.  Typical use is to
    create an AJAXResponseRenderer object.  Call replace() one or more times,
    then call return the results of render().
    """

    def __init__(self, request):
        self.request_context = RequestContext(request)
        self.should_clear_form = False
        self.hide_modal_list= []
        self.replacements = {}

    def replace(self, selector, template, context):
        """Add a replement to the response

        Args:
            selector: CSS selector of the element to replace
            template: template name to use to render the content
            context: context dict to pass to the template
        """
        self.replacements[selector] = render_to_string(template, context,
                                                       self.request_context)

    def hide_modal(self, selector):
        """Hide a modal dialog."""
        self.hide_modal_list.append(selector)

    def clear_form(self, should_clear_form=True):
        self.should_clear_form = should_clear_form

    def render(self):
        data = {}
        if self.should_clear_form:
            data['clearForm'] = True
        if self.replacements:
            data['replace'] = self.replacements
        if self.hide_modal_list:
            data['hideModal'] = self.hide_modal_list
        return HttpResponse(json.dumps(data), content_type='application/json')
