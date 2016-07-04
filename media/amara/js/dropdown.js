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

$.behaviors('.dropdown', dropdown);

function dropdown(select) {
    select = $(select);
    var options = { theme: "bootstrap" };

    if(select.hasClass('languages')) {
        options.data = languageChoiceData(select);
    }
    if(select.hasClass('nosearchbox')) {
        options.minimumResultsForSearch = Infinity;
    }
    select.select2(options);
}

function languageChoiceData(select) {
    var data = [];
    if(select.hasClass('with-any')) {
        data.push({
            id: 'any',
            text: gettext('Any language')
        });
    }
    data.push({
        text: gettext('Popular Languages'),
        children: _.map(popularLanguages, languageChoice)
    });
    data.push({
        text: gettext('All Languages'),
        children: _.map(allLanguages, languageChoice)
    });
    return data;
}

function languageChoice(code) {
    return { id: code, text: getLanguageName(code) };
}

})(jQuery);
