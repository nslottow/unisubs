# Amara, universalsubtitles.org
#
# Copyright (C) 2015 Participatory Culture Foundation
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program. If not, see
# http://www.gnu.org/licenses/agpl-3.0.html.

"""utils.test_utils.monkeypatch -- Patch functions with the mock library

This module patches various functions that we don't want running during the
unittests.  We patch for a couple reasons

    - We don't want to make network requests during the tests
    - Operations related to search indexing are slow and not usually needed
      for the tests.

The objects used to patch the functions are available as module attributes.
They also have a run_original() method that can be used to run the original
function.  For example:

    > from utils.test_utils import monkeypatch
    > # run some code
    > monkeypatch.update_one_team_video.assert_called_with(...)
    > monkeypatch.update_one_team_video.run_original()
"""

import functools

from celery.task import Task
import mock
import externalsites.google

save_thumbnail_in_s3 = mock.Mock()
update_team_video = mock.Mock()
update_search_index = mock.Mock()

test_video_info = externalsites.google.VideoInfo(
    'test-channel-id', 'test-title', 'test-description', 60,
    'http://example.com/youtube-thumb.png')
youtube_get_video_info = mock.Mock(return_value=test_video_info)
youtube_get_user_info = mock.Mock(return_value=test_video_info)
youtube_get_new_access_token = mock.Mock(return_value='test-access-token')
youtube_revoke_auth_token = mock.Mock()
youtube_update_video_description = mock.Mock()
url_exists = mock.Mock(return_value=True)

current_locks = set()
acquire_lock = mock.Mock(
    side_effect=lambda c, name: current_locks.add(name))
release_lock = mock.Mock(
    side_effect=lambda c, name: current_locks.remove(name))
invalidate_widget_video_cache = mock.Mock()
update_subtitles = mock.Mock()
delete_subtitles = mock.Mock()
update_all_subtitles = mock.Mock()
fetch_subs_task = mock.Mock()
import_videos_from_feed = mock.Mock()
get_language_facet_counts = mock.Mock(return_value=([], []))

class MonkeyPatcher(object):
    """Replace a functions with mock objects for the tests.
    """
    def patch_functions(self):
        # list of (function, mock object tuples)
        patch_info = [
            ('videos.tasks.save_thumbnail_in_s3', save_thumbnail_in_s3),
            ('teams.tasks.update_one_team_video', update_team_video),
            ('utils.celery_search_index.update_search_index',
             update_search_index),
            ('externalsites.google.get_video_info', youtube_get_video_info),
            ('externalsites.google.get_youtube_user_info',
             youtube_get_user_info),
            ('externalsites.google.get_new_access_token',
             youtube_get_new_access_token),
            ('externalsites.google.revoke_auth_token',
             youtube_revoke_auth_token),
            ('externalsites.google.update_video_description',
             youtube_update_video_description),
            ('utils.applock.acquire_lock', acquire_lock),
            ('utils.applock.release_lock', release_lock),
            ('utils.http.url_exists', url_exists),
            ('widget.video_cache.invalidate_cache',
             invalidate_widget_video_cache),
            ('externalsites.tasks.update_subtitles', update_subtitles),
            ('externalsites.tasks.delete_subtitles', delete_subtitles),
            ('externalsites.tasks.update_all_subtitles', update_all_subtitles),
            ('externalsites.tasks.fetch_subs', fetch_subs_task),
            ('videos.tasks.import_videos_from_feed', import_videos_from_feed),
            ('search.forms._get_language_facet_counts',
             get_language_facet_counts)
        ]
        self.patches = []
        self.initial_side_effects = {}
        for func_name, mock_obj in patch_info:
            self.start_patch(func_name, mock_obj)

    def start_patch(self, func_name, mock_obj):
        patch = mock.patch(func_name, mock_obj)
        mock_obj = patch.start()
        self.setup_run_original(mock_obj, patch)
        self.initial_side_effects[mock_obj] = mock_obj.side_effect
        self.patches.append(patch)

    def setup_run_original(self, mock_obj, patch):
        mock_obj.original_func = patch.temp_original
        mock_obj.run_original = functools.partial(self.run_original,
                                                  mock_obj)
        mock_obj.run_original_for_test = functools.partial(
            self.run_original_for_test, mock_obj)

    def run_original(self, mock_obj):
        rv = [mock_obj.original_func(*args, **kwargs)
                for args, kwargs in mock_obj.call_args_list]
        if isinstance(mock_obj.original_func, Task):
            # for celery tasks, also run the delay() and apply() methods
            rv.extend(mock_obj.original_func.delay(*args, **kwargs)
                      for args, kwargs in mock_obj.delay.call_args_list)
            rv.extend(mock_obj.original_func.apply(*args, **kwargs)
                      for args, kwargs in mock_obj.apply.call_args_list)

        return rv

    def run_original_for_test(self, mock_obj):
        # set side_effect to be the original function.  We will undo this when
        # reset_mocks() is called at the end of the test
        mock_obj.side_effect = mock_obj.original_func

    def unpatch_functions(self):
        for patch in self.patches:
            patch.stop()

    def reset_mocks(self):
        for mock_obj, side_effect in self.initial_side_effects.items():
            mock_obj.reset_mock()
            # reset_mock doesn't reset the side effect, and we wouldn't want
            # it to anyways since we only want to reset side effects that the
            # unittests set.  So we save side_effect right after we create the
            # mock and restore it here
            mock_obj.side_effect = side_effect

def patch_for_test(spec):
    """Use mock to patch a function for the test case.

    Use this to decorate a TestCase test or setUp method.  It will call
    TestCase.addCleanup() so that the the patch will stop at the once the test
    is complete.  It will pass in the mock object used for the patch to the
    function.

    Example:

    class FooTest(TestCase):
        @patch_for_test('foo.bar')
        def setUp(self, mock_foo):
            ...
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(self, *args, **kwargs):
            mock_obj = mock.Mock()
            patcher = mock.patch(spec, mock_obj)
            patcher.start()
            self.addCleanup(patcher.stop)
            return func(self, mock_obj, *args, **kwargs)
        return wrapper
    return decorator
patch_for_test.__test__ = False
