describe('Test the subtitle-repeat directive', function() {
    var subtitleList = null;
    var scope = null;
    var elm = null;
    var readOnlyScope = null;
    var readOnlyElm = null;
    var subtitles = null;
    var displayTime = null;

    beforeEach(function() {
        module('amara.SubtitleEditor.subtitles.directives');
        module('amara.SubtitleEditor.subtitles.filters');
        module('amara.SubtitleEditor.subtitles.models');
        module('amara.SubtitleEditor.dom');
        module('amara.SubtitleEditor.mocks');
    });

    beforeEach(inject(function($compile, $filter, $rootScope, SubtitleList) {
        displayTime = $filter('displayTime');
        subtitles = [];
        subtitleList = new SubtitleList();
        subtitleList.loadEmptySubs('en');
        for(var i = 0; i < 5; i++) {
            var sub = subtitleList.insertSubtitleBefore(null);
            subtitleList.updateSubtitleContent(sub, 'subtitle ' + i);
            subtitleList.updateSubtitleTime(sub, i * 1000, i * 1000 + 500);
            subtitleList.updateSubtitleParagraph(sub, false);
            subtitles.push(sub);
        }
        $rootScope.timeline = { shownSubtitle: null };
        $rootScope.currentEdit = {
            draft: null,
            isForSubtitle: jasmine.createSpy().andReturn(false)
        };

        scope = $rootScope.$new();
        scope.subtitleList = subtitleList;
        elm = angular.element(
            '<ul subtitle-repeat="subtitleList" />');
        $compile(elm)(scope);
        scope.$digest();

        readOnlyScope = $rootScope.$new();
        readOnlyScope.subtitleList = subtitleList;
        readOnlyElm = angular.element(
            '<ul subtitle-repeat="subtitleList" read-only="1" />');
        $compile(readOnlyElm)(readOnlyScope);

        this.addMatchers({
            'toHaveSubtitleContent': function(subtitle) {
                var li = this.actual;
                if($('.subtitle-text', li).html() != subtitle.content()) {
                    return false;
                }
                if($('.timing', li).html() != displayTime(subtitle.startTime)) {
                    return false;
                }
                return true;
            },
        });
    }));

    function childLIs() {
        return $(elm).children('li');
    }

    function readOnlyChildLIs() {
        return $(readOnlyElm).children('li');
    }

    it('creates an LI for each subtitle', function() {
        expect(childLIs().length).toEqual(5);
    });

    it('populates the LIs with content', function() {
        lis = childLIs();
        for(var i=0; i < subtitles.length; i++) {
            expect(lis[i]).toHaveSubtitleContent(subtitles[i]);
        }
    });

    it('adds conditional classes', function() {
        for(var i=0; i < subtitles.length; i++) {
            expect(childLIs().eq(i).hasClass('empty')).toBeFalsy();
            expect(childLIs().eq(0).hasClass('paragraph-start')).toBeFalsy();
            expect(childLIs().eq(0).hasClass('current-subtitle')).toBeFalsy();
        }
        subtitleList.updateSubtitleContent(subtitles[0], '');
        subtitleList.updateSubtitleParagraph(subtitles[1], true);
        scope.timeline.shownSubtitle = subtitles[2];
        scope.$digest();
        expect(childLIs().eq(0).hasClass('empty')).toBeTruthy();
        expect(childLIs().eq(1).hasClass('paragraph-start')).toBeTruthy();
        expect(childLIs().eq(2).hasClass('current-subtitle')).toBeTruthy();
    });

    it('updates the DOM on changes', function() {
        // test remove
        subtitleList.removeSubtitle(subtitles[0]);
        expect(childLIs().length).toEqual(4);
        expect(childLIs()[0]).toHaveSubtitleContent(subtitles[1]);
        // test update
        subtitleList.updateSubtitleContent(subtitles[1], 'new content');
        expect(childLIs().length).toEqual(4);
        expect(childLIs()[0]).toHaveSubtitleContent(subtitles[1]);
        expect(childLIs().length).toEqual(4);
        subtitleList.updateSubtitleTime(subtitles[1], 500, 1500);
        expect(childLIs()[0]).toHaveSubtitleContent(subtitles[1]);
        // test insert
        var newSub = subtitleList.insertSubtitleBefore(subtitles[1]);
        expect(childLIs().length).toEqual(5);
        expect(childLIs()[0]).toHaveSubtitleContent(newSub);
        var newSubAtBack = subtitleList.insertSubtitleBefore(null);
        expect(childLIs().length).toEqual(6);
        expect(childLIs()[5]).toHaveSubtitleContent(newSubAtBack);
    });

    it('creates the toolbox, except when in read-only mode', function() {
        var li = childLIs()[0];
        expect($('ul.sub-toolbox-menu', li).length).toBeTruthy();

        li = readOnlyChildLIs()[0];
        expect($('ul.sub-toolbox-menu', li).length).toBeFalsy();
    });

    it('handles clicks', function() {
        var li = childLIs()[0];
        var sub = subtitles[0];
        // If there is no click handler, the click event shouldn't cause an
        // exception.
        $('a.insert-top', li).click();
        // Test click handlers
        var clickActions = [];
        scope.onSubtitleClick = function(evt, subtitle, action) {
            expect(subtitle).toBe(sub);
            clickActions.push(action);
        }
        // Test clicks
        $('a.insert-top', li).click();
        expect(clickActions).toEqual(['insert-top']);
        $('a.remove', li).click();
        expect(clickActions).toEqual(['insert-top', 'remove']);
        $('a.note-time', li).click();
        expect(clickActions).toEqual(['insert-top', 'remove', 'note-time']);
        // Clicking outside a button should result in the edit action
        $('.timing', li).click();
        expect(clickActions).toEqual(['insert-top', 'remove', 'note-time', 'edit']);
        // Clicking on a read-only list shouldn't result in any action
        $('.timing', readOnlyChildLIs()[0]).click();
        expect(clickActions).toEqual(['insert-top', 'remove', 'note-time', 'edit']);
    });

    it('adds/removes a textarea based on bind-to-edit', function() {
        scope.currentEdit.draft = subtitles[0].draftSubtitle();
        scope.$digest();
        expect($('textarea', childLIs()[0]).length).toEqual(1);
        expect($('textarea', childLIs()[0]).val())
            .toEqual(subtitles[0].markdown);
        scope.currentEdit.draft = subtitles[1].draftSubtitle();
        scope.$digest();
        expect($('textarea', childLIs()[0]).length).toEqual(0);
        expect($('textarea', childLIs()[1]).length).toEqual(1);
        expect($('textarea', childLIs()[1]).val())
            .toEqual(subtitles[1].markdown);
        scope.currentEdit.draft = null;
        scope.$digest();
        expect($('textarea', childLIs()[1]).length).toEqual(0);
    });

    it('sets the caret position to the end of the text',
            inject(function(DomUtil) {
        spyOn(DomUtil, 'setSelectionRange');
        scope.currentEdit.draft = subtitles[0].draftSubtitle();
        scope.$digest();
        var textarea = $('textarea', elm)[0];
        expect(DomUtil.setSelectionRange).toHaveBeenCalledWith(textarea,
            subtitles[0].markdown.length, subtitles[0].markdown.length);

    }));

    it('sets the caret position to initialCaretPos if set',
            inject(function(DomUtil) {
        spyOn(DomUtil, 'setSelectionRange');
        scope.currentEdit.draft = subtitles[0].draftSubtitle();
        scope.currentEdit.draft.initialCaretPos = 2;
        scope.$digest();
        var textarea = $('textarea', elm)[0];
        expect(DomUtil.setSelectionRange).
            toHaveBeenCalledWith(textarea, 2, 2);
    }));

    it('calls focus on edits', function() {
        spyOn($.fn, 'focus').andCallFake(function() {
            expect(this.length).toEqual(1);
            expect(this[0]).toEqual($('textarea', elm)[0]);
        });
        scope.currentEdit.draft = subtitles[0].draftSubtitle();
        scope.$digest();
        expect($.fn.focus.callCount).toEqual(1);
    });

    it('calls autosize on edits', function() {
        spyOn($.fn, 'autosize').andCallFake(function() {
            expect(this.length).toEqual(1);
            expect(this[0]).toEqual($('textarea', elm)[0]);
        });
        scope.currentEdit.draft = subtitles[0].draftSubtitle();
        scope.$digest();
        expect($.fn.autosize.callCount).toEqual(1);
    });

    it('adds the edit class based on bind-to-edit', function() {
        scope.currentEdit.draft = subtitles[0].draftSubtitle();
        scope.$digest();
        expect(childLIs().eq(0).hasClass('edit')).toBeTruthy();
        scope.currentEdit.draft = subtitles[1].draftSubtitle();
        scope.$digest();
        expect(childLIs().eq(0).hasClass('edit')).toBeFalsy();
        expect(childLIs().eq(1).hasClass('edit')).toBeTruthy();
        scope.currentEdit.draft = null;
        scope.$digest();
        expect(childLIs().eq(1).hasClass('edit')).toBeFalsy();
    });

    it('updates the bind-to-edit var on keyup', function() {
        scope.currentEdit.draft = subtitles[0].draftSubtitle();
        scope.$digest();
        var textarea = $('textarea', childLIs()[0]);
        textarea.val('new content');
        textarea.keyup();
        expect(scope.currentEdit.draft.markdown).toEqual('new content');
    });

    it('emits edit-keydown in edit-mode', function() {
        scope.onEditKeydown = function(evt) {
            expect(evt.type).toEqual('keydown');
        };
        scope.currentEdit.draft = subtitles[0].draftSubtitle();
        scope.$digest();
        var textarea = $('textarea', childLIs()[0]);
        var spy = spyOn(scope, 'onEditKeydown');
        textarea.keydown();
        expect(spy.callCount).toEqual(1);
    });

    it('fetches list items for subtitles', function() {
        expect(scope.getSubtitleRepeatItem(subtitles[0]).get(0)).
            toEqual(childLIs().get(0));
    });

});
