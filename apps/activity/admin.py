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

from django.contrib import admin

from activity.models import ActivityRecord

class ActivityRecordAdmin(admin.ModelAdmin):
    list_display = ('type', 'user', 'team', 'video', 'language_code',
                    'message',)

    def message(self, record):
        return record.get_message()

    class Meta:
        model = ActivityRecord

admin.site.register(ActivityRecord, ActivityRecordAdmin)
