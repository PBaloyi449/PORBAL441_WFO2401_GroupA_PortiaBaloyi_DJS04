   // Import data and constants
import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

// Initialize page and matches variables
let page = 0;
let matches = books;

// Define DOM selectors for easy access
const DOMSelectors = {
    listItems: '[data-list-items]',
    searchGenres: '[data-search-genres]',
    searchAuthors: '[data-search-authors]',
    listButton: '[data-list-button]',
    settingsTheme: '[data-settings-theme]',
    searchCancel: '[data-search-cancel]',
    settingsCancel: '[data-settings-cancel]',
    headerSearch: '[data-header-search]',
    headerSettings: '[data-header-settings]',
    listClose: '[data-list-close]',
    settingsForm: '[data-settings-form]',
    searchForm: '[data-search-form]',
    searchOverlay: '[data-search-overlay]',
    settingsOverlay: '[data-settings-overlay]',
    listActive: '[data-list-active]',
    listBlur: '[data-list-blur]',
    listImage: '[data-list-image]',
    listTitle: '[data-list-title]',
    listSubtitle: '[data-list-subtitle]',
    listDescription: '[data-list-description]',
    listMessage: '[data-list-message]',
};

// Define DOM manipulation helper functions
const DOMHelper = {
    // Function to query selector and append an element
    querySelectorAndAppend(selector, append) {
        const element = document.querySelector(selector);
        if (append !== null && append !== undefined) {
            element.appendChild(append);
        }
        return element;
    },
    // Function to update text content of an element
    updateText(selector, text) {
        const element = document.querySelector(selector);
        element.innerText = text;
        return element;
    },
    // Function to update inner HTML of an element
    updateInnerHTML(selector, html) {
        const element = document.querySelector(selector);
        element.innerHTML = html;
        return element;
    },
    // Function to set element visibility
    setElementVisibility(selector, isVisible) {
        const element = document.querySelector(selector);
        element.open = isVisible;
        return element;
    }
};

// Function to create a book element
function createBookElement(id, image, title, author) {
    const element = document.createElement('button');
    element.classList = 'preview';
    element.setAttribute('data-preview', id);
    element.innerHTML = `
        <img class="preview__image" src="${image}" />
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;
    return element;
}

// Function to load initial books
function loadInitialBooks(books, booksPerPage) {
    const fragment = document.createDocumentFragment();
    for (const { author, id, image, title } of books.slice(0, booksPerPage)) {
        const element = createBookElement(id, image, title, author);
        fragment.appendChild(element);
    }
    DOMHelper.querySelectorAndAppend(DOMSelectors.listItems, fragment);
    updateShowMoreButton(books);
}

// Function to create an option element for genres and authors
function createOptionElement(value, text) {
    const element = document.createElement('option');
    element.value = value;
    element.innerText = text;
    return element;
}

// Function to load genres into the search dropdown
function loadGenres(genres) {
    const fragment = document.createDocumentFragment();
    const allGenresOption = createOptionElement('any', 'All Genres');
    fragment.appendChild(allGenresOption);

    for (const [id, name] of Object.entries(genres)) {
        const element = createOptionElement(id, name);
        fragment.appendChild(element);
    }
    DOMHelper.querySelectorAndAppend(DOMSelectors.searchGenres, fragment);
}

// Function to load authors into the search dropdown
function loadAuthors(authors) {
    const fragment = document.createDocumentFragment();
    const allAuthorsOption = createOptionElement('any', 'All Authors');
    fragment.appendChild(allAuthorsOption);

    for (const [id, name] of Object.entries(authors)) {
        const element = createOptionElement(id, name);
        fragment.appendChild(element);
    }
    DOMHelper.querySelectorAndAppend(DOMSelectors.searchAuthors, fragment);
}

// Function to set up the theme based on localStorage
function setupTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'night') {
        document.querySelector(DOMSelectors.settingsTheme).value = 'night';
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
}

// Function to update the show more button based on remaining books
function updateShowMoreButton(books) {
    const remainingBooks = books.length - (page * BOOKS_PER_PAGE);
    const showMoreText = `Show more (${remainingBooks})`;
    const showMoreButton = DOMHelper.updateText(DOMSelectors.listButton, showMoreText);
    showMoreButton.disabled = remainingBooks <= 0;
    showMoreButton.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${remainingBooks > 0 ? remainingBooks : 0})</span>
    `;
}

// Function to apply the selected theme
function applyTheme(theme) {
    if (theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
}

// Function to filter books based on search criteria
function filterBooks(filters, books) {
    const result = [];

    for (const book of books) {
        let genreMatch = filters.genre === 'any';
        for (const singleGenre of book.genres) {
            if (genreMatch) break;
            if (singleGenre === filters.genre) { genreMatch = true; }
        }

        if (
            (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
            (filters.author === 'any' || book.author === filters.author) &&
            genreMatch
        ) {
            result.push(book);
        }
    }

    page = 1;
    matches = result;
    updateShowMoreButton(matches);
}

// Function to render filtered books on the page
function renderFilteredBooks(matches, booksPerPage) {
    const fragment = document.createDocumentFragment();

    if (matches.length < 1) {
        DOMHelper.querySelectorAndAppend(DOMSelectors.listMessage, null).classList.add('list__message_show');
    } else {
        DOMHelper.querySelectorAndAppend(DOMSelectors.listMessage, null).classList.remove('list__message_show');
    }

    DOMHelper.querySelectorAndAppend(DOMSelectors.listItems, null).innerHTML = '';

    for (const { author, id, image, title } of matches.slice(0, booksPerPage)) {
            const element = createBookElement(id, image, title, author);
            fragment.appendChild(element);
        }
    
        DOMHelper.querySelectorAndAppend(DOMSelectors.listItems, fragment);
    }

    
    // Function to add event listeners to various elements
    function addEventListeners() {
        addCancelListeners();
        addHeaderListeners();
        addFormListeners();
        addShowMoreButtonListener();
        addListItemsListener();
    }
    
    // Function to add cancel listeners to search and settings overlays
    function addCancelListeners() {
        DOMHelper.querySelectorAndAppend(DOMSelectors.searchCancel, null).addEventListener('click', () => {
            DOMHelper.setElementVisibility(DOMSelectors.searchOverlay, false);
        });
    
        DOMHelper.querySelectorAndAppend(DOMSelectors.settingsCancel, null).addEventListener('click', () => {
            DOMHelper.setElementVisibility(DOMSelectors.settingsOverlay, false);
        });
    }
    
    // Function to add listeners to header elements
    function addHeaderListeners() {
        DOMHelper.querySelectorAndAppend(DOMSelectors.headerSearch, null).addEventListener('click', () => {
            DOMHelper.setElementVisibility(DOMSelectors.searchOverlay, true);
            DOMHelper.querySelectorAndAppend(DOMSelectors.searchTitle, null).focus();
        });
    
        DOMHelper.querySelectorAndAppend(DOMSelectors.headerSettings, null).addEventListener('click', () => {
            DOMHelper.setElementVisibility(DOMSelectors.settingsOverlay, true);
        });
    
        DOMHelper.querySelectorAndAppend(DOMSelectors.listClose, null).addEventListener('click', () => {
            DOMHelper.setElementVisibility(DOMSelectors.listActive, false);
        });
    }
    
    // Function to add form listeners for search and settings forms
    function addFormListeners() {
        DOMHelper.querySelectorAndAppend(DOMSelectors.settingsForm, null).addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const { theme } = Object.fromEntries(formData);
            localStorage.setItem('theme', theme);
            applyTheme(theme);
            DOMHelper.setElementVisibility(DOMSelectors.settingsOverlay, false);
        });
    
        DOMHelper.querySelectorAndAppend(DOMSelectors.searchForm, null).addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const filters = Object.fromEntries(formData);
            filterBooks(filters, books);
            renderFilteredBooks(matches, BOOKS_PER_PAGE);
            DOMHelper.setElementVisibility(DOMSelectors.searchOverlay, false);
        });
    }
    
    // Function to add listener to the show more button
    function addShowMoreButtonListener() {
        DOMHelper.querySelectorAndAppend(DOMSelectors.listButton, null).addEventListener('click', () => {
            const fragment = document.createDocumentFragment();
    
            for (const { author, id, image, title } of matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)) {
                const element = createBookElement(id, image, title, author);
                fragment.appendChild(element);
            }
    
            DOMHelper.querySelectorAndAppend(DOMSelectors.listItems, fragment);
            page += 1;
            updateShowMoreButton(matches);
        });
    }
    
    // Function to add listener to book items
    function addListItemsListener() {
        document.querySelector(DOMSelectors.listItems).addEventListener('click', (event) => {
            const pathArray = Array.from(event.composedPath());
            let activeBook = null;
    
            for (const node of pathArray) {
                if (activeBook) break;
                if (node?.dataset?.preview) {
                    activeBook = books.find(book => book.id === node.dataset.preview);
                }
            }
    
            if (activeBook) {
                showBookDetails(activeBook);
            }
        });
    }
    
    // Function to show details of a selected book
    function showBookDetails(book) {
        const bookPreview = document.querySelector('book-preview-component');
        
        // Set the attributes for the book preview
        bookPreview.querySelector('[data-list-image]').src = book.image;
        bookPreview.querySelector('[data-list-blur]').src = book.image;
        bookPreview.querySelector('[data-list-title]').innerText = book.title;
        bookPreview.querySelector('[data-list-subtitle]').innerText = `${authors[book.author]} (${new Date(book.published).getFullYear()})`;
        bookPreview.querySelector('[data-list-description]').innerText = book.description;
    
        // Display the dialog
        bookPreview.querySelector('dialog').showModal();
        
        // Add event listener to close the dialog
        bookPreview.querySelector('[data-list-close]').addEventListener('click', () => {
            bookPreview.querySelector('dialog').close();
        });
    }
    // Event listener to initialize the book list when the DOM content is loaded
    document.addEventListener('DOMContentLoaded', () => {
        loadInitialBooks(matches, BOOKS_PER_PAGE);
        loadGenres(genres);
        loadAuthors(authors);
        setupTheme();
        addEventListeners();
    });
    