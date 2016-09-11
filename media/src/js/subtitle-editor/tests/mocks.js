(function() {

    var module = angular.module('amara.SubtitleEditor.mocks', []);

    module.factory('VideoPlayer', function() {
        var MockVideoPlayer = jasmine.createSpyObj('VideoPlayer', [
            'init',
            'play',
            'pause',
            'seek',
            'togglePlay',
            'currentTime',
            'duration',
            'isPlaying',
            'getVolume',
            'setVolume',
            'playChunk',
        ]);
        MockVideoPlayer.play.andCallFake(function() {
            MockVideoPlayer.playing = true;
        });
        MockVideoPlayer.pause.andCallFake(function() {
            MockVideoPlayer.playing = false;
        });
        MockVideoPlayer.seek.andCallFake(function(seekTo) {
            MockVideoPlayer.currentTimeValue = seekTo;
        });
        MockVideoPlayer.currentTimeValue = 0;
        MockVideoPlayer.currentTime.andCallFake(function() {
            return MockVideoPlayer.currentTimeValue;
        });
        MockVideoPlayer.playing = false;
        MockVideoPlayer.isPlaying.andCallFake(function() {
            return MockVideoPlayer.playing;
        });
        return MockVideoPlayer;
    });

    module.factory('SubtitleStorage', ["$q", function($q) {
        var methodNames = [
            'getLanguages',
            'getLanguage',
            'getSubtitles',
            'saveSubtitles',
            'performAction',
            'postNote'
        ];
        var SubtitleStorage = {
            deferreds: {},
        };
        _.each(methodNames, function(methodName) {
            var deferred = $q.defer();
            SubtitleStorage[methodName] = jasmine.createSpy(methodName).andReturn(deferred.promise);
            SubtitleStorage.deferreds[methodName] = deferred;
        });
        return SubtitleStorage;
    }]);

    module.factory('$timeout', function($q) {
        var mockTimeout = jasmine.createSpy('$timeout').andCallFake(function() {
            var promise = $q.defer().promise;
            mockTimeout.promisesReturned.push(promise);
            mockTimeout.lastPromiseReturned = promise;
            return promise;
        });
        mockTimeout.promisesReturned = [];
        mockTimeout.lastPromiseReturned = null;
        mockTimeout.cancel = jasmine.createSpy('cancel');
        return mockTimeout;
    });

    module.factory('DomWindow', function() {
        var mockObject = jasmine.createSpyObj('DomWindow', [
            'onDocumentEvent',
            'offDocumentEvent'
        ]);
        mockObject.caretPos = jasmine.createSpy('caretPos').andReturn(0);
        return mockObject;
    });

    module.factory('MockEvents', function() {
        function makeEvent(type, attrs) {
            evt = {
                type: type,
                preventDefault: jasmine.createSpy(),
                stopPropagation: jasmine.createSpy(),
            }
            return overrideEventAttributes(evt, attrs);
        }
        function overrideEventAttributes(evt, attrs) {
            if(attrs !== undefined) {
                for(key in attrs) {
                    evt[key] = attrs[key];
                }
            }
            return evt;
        }
        return {
            keydown: function(keyCode, attrs) {
                var evt = makeEvent('keydown');
                evt.keyCode = keyCode;
                evt.shiftKey = false;
                evt.ctrlKey = false;
                evt.altKey = false;
                evt.target = { type: 'div' };
                return overrideEventAttributes(evt, attrs);
            },
            click: function(attrs) {
                return makeEvent('click', attrs);
            },
        }
    });

    module.factory('EditorData', function() {
        return {
            "username": "testuser",
            "user_fullname": "Test User",
            "canSync": true,
            "canAddAndRemove": true,
            "languageCode": "en",
            "editingVersion": {
                "languageCode": "en",
                "versionNumber": null,
            },
            "video": {
                "id": "4oqOXzpPk5rU",
                "videoURLs": [
                    "http://vimeo.com/25082970"
                ],
            },
            "oldEditorURL": '/old-editor/test-url/',
            "languages": [
                {
                    "is_rtl": false,
                    "numVersions": 0,
                    "editingLanguage": true,
                    "language_code": "en",
                    "pk": 23,
                    "versions": [],
                    "is_primary_audio_language": true,
                    "name": "English"
                },
            ],
            'notes': [],
            'staticURL': 'http://example.com/',
            'playbackModes': [
                { id: 1, idStr: 'magic' },
                { id: 2, idStr: 'standard' },
                { id: 3, idStr: 'beginner' }
            ],
            'preferences': {
                playbackModeId: 2
            }
        };
    });
}).call(this);
