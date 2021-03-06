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

from django.db import models, IntegrityError
from django.db.models import Max

from utils import dates
from teams.models import Team

class TeamNotificationSettings(models.Model):
    team = models.OneToOneField(Team)
    type = models.CharField(max_length=30)
    url = models.URLField(max_length=512)

    class Meta:
        verbose_name_plural = 'Team notification settings'

    @classmethod
    def lookup(cls, team):
        try:
            return TeamNotificationSettings.objects.get(team=team)
        except TeamNotificationSettings.DoesNotExist:
            return None

class TeamNotification(models.Model):
    """Records a sent notication."""
    team = models.ForeignKey(Team)
    number = models.IntegerField() # per-team, auto-increment
    data = models.CharField(max_length=5120)
    url = models.URLField(max_length=512)
    timestamp = models.DateTimeField()
    response_status = models.IntegerField(null=True, blank=True)
    error_message = models.CharField(max_length=256, null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.timestamp is None:
            self.timestamp = dates.now()
        if self.number is None:
            self.set_number()
        # There is a potential race condition here where another thread also
        # creates a TeamNotification and takes our number.  If that happens,
        # then try with the next number.
        for i in range(10):
            try:
                return super(TeamNotification, self).save(*args, **kwargs)
            except IntegrityError:
                self.number = self.number + 1
        raise IntegrityError("Couldn't find unused number")

    def set_number(self):
        self.number = TeamNotification.next_number_for_team(self.team)

    def is_in_progress(self):
        return self.response_status is None and self.error_message is None

    @classmethod
    def next_number_for_team(cls, team):
        qs = (cls.objects
              .filter(team=team)
              .aggregate(max_number=Max('number')))
        max_number = qs['max_number']
        return max_number + 1 if max_number is not None else 1

    class Meta:
        unique_together = [
            ('team', 'number'),
        ]
