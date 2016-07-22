/*
 * Amara, universalsubtitles.org
 *
 * Copyright (C) 2016 Participatory Culture Foundation
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see
 * http://www.gnu.org/licenses/agpl-3.0.html.
 */

(function($) {

$.behaviors('select.dropdown', dropdown);

function dropdown(select) {
    select = $(select);
    var options = { theme: "bootstrap" };

    if(select.data('languageOptions')) {
        options.data = languageChoiceData(select);
    }
    if(select.hasClass('nosearchbox')) {
        options.minimumResultsForSearch = Infinity;
    }
    select.select2(options);
}

function languageChoiceData(select) {
    var data = [];
    var enabledSelections = select.data('languageOptions').split(" ");
    function sectionEnabled(name) {
        return enabledSelections.indexOf(name) > -1;
    }
    if(sectionEnabled('any')) {
        data.push({
            id: 'any',
            text: gettext('Any language')
        });
    }
    if(sectionEnabled('my')) {
        data.push({
            text: gettext('My Languages'),
            children: _.map(userLanguages, languageChoice)
        });
    }
    if(sectionEnabled('popular')) {
        data.push({
            text: gettext('Popular Languages'),
            children: _.map(popularLanguages, languageChoice)
        });
    }
    if(sectionEnabled('all')) {
        data.push({
            text: gettext('All Languages'),
            children: _.map(allLanguages, languageChoice)
        });
    }
    return data;
}

function languageChoice(code) {
    return { id: code, text: getLanguageName(code) };
}

})(jQuery);
