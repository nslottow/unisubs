describe('The playback mode controller', function() {
    var $rootScope;
    var $scope;
    var $timeout;
    var EditorData;
    var VideoPlayer;

    var setPlaybackMode;

    beforeEach(function() {
        module('amara.SubtitleEditor.mocks');
        module('amara.SubtitleEditor.video.controllers');
    });

    beforeEach(function() {
        $rootScope = $injector.get('$rootScope');
        $scope = $rootScope.new();
        $timeout = $injector.get('$timeout');
        VideoPlayer = $injector.get('VideoPlayer');
        EditorData = $injector.get('EditorData');
        $controller('PlaybackModeController', {
            $scope: $scope
        });
    });

    beforeEach(function() {
        setPlaybackMode = function(idStr) {
            $.each(EditorData.playbackModes, function(index, mode) {
                if(mode.idStr === idStr) {
                    $scope.playbackMode = mode;
                    $scope.$digest();
                }
            });
        }
    });

    it('defaults to standard mode', function() {
        expect($scope.playbackMode.idStr).toBe('standard');
    });

    it('pauses the video when playback mode is changed', function() {
        setPlaybackMode('beginner');
        expect(VideoPlayer.pause).toHaveBeenCalled();
    });

    describe('beginner mode', function() {
        beforeEach(function() {
            setPlaybackMode('beginner');
            $timeout.reset();
        });

        it('pauses after 4 seconds of playback', function() {
            VideoPlayer.play();
            $rootScope.emit('video-playback-changes');
            expect($timeout).toHaveBeenCalledWith(jasmine.any(Function), 4000);

            VideoPlayer.pause.reset();
            $timeout.mostRecentCall.args[0]();
            expect(VideoPlayer.pause).toHaveBeenCalled();

            // we expect VideoPlayer.pause() to emit video-playback-changes
            $rootScope.emit('video-playback-changes');
            expect($timeout).not.toHaveBeenCalled();

            // make sure that it continues to work after the first pause
            $timeout.reset();
            VideoPlayer.play();
            $rootScope.emit('video-playback-changes');
            expect($timeout).toHaveBeenCalledWith(jasmine.any(Function), 4000);
        });
    });

    xdescribe('standard mode', function() {
    });

    xdescribe('magic mode', function() {
        beforeEach(function() {
            setPlaybackMode('magic');
            $timeout.reset();
        });
    });
});
