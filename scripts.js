import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

let page = 0;
let matches = books;

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

class DOMHelper {
    static querySelectorAndAppend(selector, append) {
        const element = document.querySelector(selector);
        if (append !== null && append !== undefined) {
            element.appendChild(append);
        }
        return element;
    }

    static updateText(selector, text) {
        const element = document.querySelector(selector);
        element.innerText = text;
        return element;
    }

    static updateInnerHTML(selector, html) {
        const element = document.querySelector(selector);
        element.innerHTML = html;
        return element;
    }

    static setElementVisibility(selector, isVisible) {
        const element = document.querySelector(selector);
        element.open = isVisible;
        return element;
    }
}

class BookList extends HTMLElement {
    constructor() {
        super();
        this.books = [];
        this.authors = {};
        this.genres = {};
        this.booksPerPage = 0;
        this.page = 0;
        this.matches = [];
    }

    connectedCallback() {
        this.init();
    }

    init() {
        // Fetch data from data.js or any other source if needed
        this.books = books;
        this.authors = authors;
        this.genres = genres;
        this.booksPerPage = BOOKS_PER_PAGE;
        
        // Initialize the book list
        this.loadInitialBooks();
        this.loadGenres();
        this.loadAuthors();
        this.setupTheme();
        this.addEventListeners();
    }


    loadInitialBooks() {
        const fragment = document.createDocumentFragment();
        for (const { author, id, image, title } of this.matches.slice(0, this.booksPerPage)) {
            const element = this.createBookElement(id, image, title, author);
            fragment.appendChild(element);
        }
        DOMHelper.querySelectorAndAppend(DOMSelectors.listItems, fragment);
        this.updateShowMoreButton();
    }

    createBookElement(id, image, title, author) {
        const element = document.createElement('button');
        element.classList = 'preview';
        element.setAttribute('data-preview', id);
        element.innerHTML = `
            <img class="preview__image" src="${image}" />
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${this.authors[author]}</div>
            </div>
        `;
        return element;
    }

    loadGenres() {
        const fragment = document.createDocumentFragment();
        const allGenresOption = this.createOptionElement('any', 'All Genres');
        fragment.appendChild(allGenresOption);

        for (const [id, name] of Object.entries(this.genres)) {
            const element = this.createOptionElement(id, name);
            fragment.appendChild(element);
        }
        DOMHelper.querySelectorAndAppend(DOMSelectors.searchGenres, fragment);
    }

    loadAuthors() {
        const fragment = document.createDocumentFragment();
        const allAuthorsOption = this.createOptionElement('any', 'All Authors');
        fragment.appendChild(allAuthorsOption);

        for (const [id, name] of Object.entries(this.authors)) {
            const element = this.createOptionElement(id, name);
            fragment.appendChild(element);
        }
        DOMHelper.querySelectorAndAppend(DOMSelectors.searchAuthors, fragment);
    }

    createOptionElement(value, text) {
        const element = document.createElement('option');
        element.value = value;
        element.innerText = text;
        return element;
    }

    setupTheme() {
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

    updateShowMoreButton() {
        const remainingBooks = this.matches.length - (this.page * this.booksPerPage);
        const showMoreText = `Show more (${remainingBooks})`;
        const showMoreButton = DOMHelper.updateText(DOMSelectors.listButton, showMoreText);
        showMoreButton.disabled = remainingBooks <= 0;
        showMoreButton.innerHTML = `
            <span>Show more</span>
            <span class="list__remaining"> (${remainingBooks > 0 ? remainingBooks : 0})</span>
        `;
    }

    addEventListeners() {
        this.addCancelListeners();
        this.addHeaderListeners();
        this.addFormListeners();
        this.addShowMoreButtonListener();
        this.addListItemsListener();
    }

    addCancelListeners() {
        DOMHelper.querySelectorAndAppend(DOMSelectors.searchCancel, null).addEventListener('click', () => {
            DOMHelper.setElementVisibility(DOMSelectors.searchOverlay, false);
        });

        DOMHelper.querySelectorAndAppend(DOMSelectors.settingsCancel, null).addEventListener('click', () => {
            DOMHelper.setElementVisibility(DOMSelectors.settingsOverlay, false);
        });
    }

    addHeaderListeners() {
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

    addFormListeners() {
        DOMHelper.querySelectorAndAppend(DOMSelectors.settingsForm, null).addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const { theme } = Object.fromEntries(formData);
            localStorage.setItem('theme', theme);
            this.applyTheme(theme);
            DOMHelper.setElementVisibility(DOMSelectors.settingsOverlay, false);
        });

        DOMHelper.querySelectorAndAppend(DOMSelectors.searchForm, null).addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const filters = Object.fromEntries(formData);
            this.filterBooks(filters);
            this.renderFilteredBooks();
            DOMHelper.setElementVisibility(DOMSelectors.searchOverlay, false);
        });
    }

    applyTheme(theme) {
        if (theme === 'night') {
            document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
            document.documentElement.style.setProperty('--color-light', '10, 10, 20');
        } else {
            document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
            document.documentElement.style.setProperty('--color-light', '255, 255, 255');
        }
    }

    filterBooks(filters) {
        const result = [];

        for (const book of this.books) {
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

        this.page = 1;
        this.matches = result;
        this.updateShowMoreButton();
    }

    renderFilteredBooks() {
        const fragment = document.createDocumentFragment();

        if (this.matches.length < 1) {
            DOMHelper.querySelectorAndAppend(DOMSelectors.listMessage, null).classList.add('list__message_show');
        } else {
            DOMHelper.querySelectorAndAppend(DOMSelectors.listMessage, null).classList.remove('list__message_show');
        }

        DOMHelper.querySelectorAndAppend(DOMSelectors.listItems, null).innerHTML = '';

        for (const { author, id, image, title } of this.matches.slice(0, this.booksPerPage)) {
            const element = this.createBookElement(id, image, title, author);
            fragment.appendChild(element);
        }

        DOMHelper.querySelectorAndAppend(DOMSelectors.listItems, fragment);
    }

    addShowMoreButtonListener() {
        DOMHelper.querySelectorAndAppend(DOMSelectors.listButton, null).addEventListener('click', () => {
            const fragment = document.createDocumentFragment();

            for (const { author, id, image, title } of this.matches.slice(this.page * this.booksPerPage, (this.page + 1) * this.booksPerPage)) {
                const element = this.createBookElement(id, image, title, author);
                fragment.appendChild(element);
            }

            DOMHelper.querySelectorAndAppend(DOMSelectors.listItems, fragment);
            this.page += 1;
            this.updateShowMoreButton();
        });
    }

    addListItemsListener() {
        DOMHelper.querySelectorAndAppend(DOMSelectors.listItems, null).addEventListener('click', (event) => {
            const pathArray = Array.from(event.composedPath());
            let activeBook = null;

            for (const node of pathArray) {
                if (activeBook) break;
                if (node?.dataset?.preview) {
                    activeBook = this.books.find(book => book.id === node.dataset.preview);
                }
            }

            if (activeBook) {
                this.showBookDetails(activeBook);
            }
        });
    }

    showBookDetails(book) {
        DOMHelper.querySelectorAndAppend(DOMSelectors.listImage, null).src = book.image;
        DOMHelper.querySelectorAndAppend(DOMSelectors.listBlur, null).src = book.image;
        DOMHelper.updateText(DOMSelectors.listTitle, book.title);
        DOMHelper.updateText(DOMSelectors.listSubtitle, `${this.authors[book.author]} (${new Date(book.published).getFullYear()})`);
        DOMHelper.updateText(DOMSelectors.listDescription, book.description);
        DOMHelper.setElementVisibility(DOMSelectors.listActive, true);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const bookList = new BookList(books, authors, genres, BOOKS_PER_PAGE);
    bookList.init();
});