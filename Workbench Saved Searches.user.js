// ==UserScript==
// @name         Workbench Saved Searches
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Allows users to easily save searches and recall them
// @author       Alex Thomas
// @match        https://workbench.developerforce.com/query.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=developerforce.com
// @grant        none
// ==/UserScript==

(function() {
    // Get body element
    let bodyEl = document.getElementsByTagName('body')[0];

    // Create anchor link
    createAnchorLink();

    // If localStorage.savedSearchOpen is true, show modal
    if (localStorage.getItem('savedSearchOpen') === 'true') {
        showModal();
    }

    // Create anchor link and append to body
    function createAnchorLink() {
        let anchorLink = document.createElement('a');
        anchorLink.setAttribute('href', '#');
        anchorLink.setAttribute('id', 'back-to-top');
        anchorLink.setAttribute('style', 'position: absolute;top: 12px;right: 12px;');

        // Onclick, show modal if closed, closed modal if open
        anchorLink.onclick = function() {
            if (document.getElementById('modal')) {
                closeModal();
            } else {
                showModal();
            }
        };

        anchorLink.innerHTML = 'Save Searches';
        bodyEl.appendChild(anchorLink);
    }

    // Close modal
    function closeModal() {
        localStorage.setItem('savedSearchOpen', 'false');
        document.getElementById('modal').remove();
    }

    // Show modal and present user with text box
    function showModal() {
        localStorage.setItem('savedSearchOpen', 'true');

        // if modal already exists, destroy it
        if (document.getElementById('modal')) {
            closeModal();
        }

        let modal = document.createElement('div');
        modal.setAttribute('id', 'modal');
        modal.setAttribute('style', 'position: absolute;top: 38px;right: 48px;-webkit-box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.75);-moz-box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.75);box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.75);padding: 12px;text-align: left;background-color: white;z-index:9999;border-radius: 5px;');
        let innerHtmlString = '';

        innerHtmlString = '<div id="modal-content"><h2>New Saved Search</h2><input type="text" id="search"><br><br><button id="save">Save</button></div>';

        // Get Saved Searches from localStorage
        if (localStorage.getItem('savedSearches')) {
            let savedSearches = JSON.parse(localStorage.getItem('savedSearches'));
            if (savedSearches.length > 0) {
                innerHtmlString += '<div id="modal-content"><br><br><h2>Existing Saved Searches</h2><ul style="list-style:none;padding:0;" id="saved-searches">';

                // innerHtmlString += '<li style="padding-bottom: 4px;">';
                // innerHtmlString += '<a class="delete-all" href="#" style="float:right;">Delete All</a>';
                // innerHtmlString += '</li>';

                savedSearches.forEach((item) => {
                    innerHtmlString += '<li style="padding-bottom: 4px;">';

                    // Create anchor link to saved search
                    innerHtmlString += '<a href="' + item.url + '" style="margin-right: 8px;">' + item.name + '</a>';

                    // Append X icon to delete saved search based on slug
                    innerHtmlString += '<span class="delete-search" href="#" style="float: right;cursor: pointer;text-decoration:none;" data-slug="'+item.slug+'">X</span>';

                    innerHtmlString += '</li>';
                });
                innerHtmlString += '</ul></div>';

                // Delete all saved searches
                // document.getElementById('delete-all').onclick = function() {
                //     localStorage.setItem('savedSearches', undefined);
                //     showModal();
                // }
            }
        }

        modal.innerHTML = innerHtmlString;

        bodyEl.appendChild(modal);

        // Add onclick event listener on each delete-search item to remove saved search based on data-slug
        var items = document.querySelectorAll('div');
        [].forEach.call(items, function(element) {
            // Add event listener to each element
            element.addEventListener('click', function(e) {
                if (e.target && e.target.dataset.slug) {
                    deleteSavedSearch(e.target.dataset.slug);
                }
            });
        });

        // On submit, save name and current url to localStorage
        document.getElementById('save').onclick = function() {
            saveSearch();
        };

        // On input enter click, save name and current url to localStorage
        document.getElementById('search').onkeydown = function(e) {
            if (!e) e = window.event;
            var keyCode = e.key;
            if (keyCode == 'Enter'){
                saveSearch();
            }
        };

        function saveSearch() {
            let searchName = {'name':document.getElementById('search').value, 'url':window.location.href};

            // Add slug as id for item
            searchName.slug = searchName.name.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');

            if (!localStorage.getItem('savedSearches')) {
                localStorage.setItem('savedSearches', JSON.stringify([]));
            }

            let savedSearches = JSON.parse(localStorage.getItem('savedSearches'));
            if (savedSearches) {
                savedSearches.push(searchName);
            } else {
                savedSearches = [searchName];
            }

            localStorage.setItem('savedSearches', JSON.stringify(savedSearches));

            // Refresh data in modal
            showModal();
        }

        // Remove saved search from localStorage based on slug
        function deleteSavedSearch(item) {
            let savedSearches = JSON.parse(localStorage.getItem('savedSearches'));
            if (savedSearches) {
                for (let i = 0; i < savedSearches.length; i++) {
                    if (savedSearches[i].slug === item) {
                        savedSearches.splice(i, 1);
                    }
                }
            }

            localStorage.setItem('savedSearches', JSON.stringify(savedSearches));

            // Refresh data in modal
            showModal();
        }
    }
})();