import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'; // Importing data from the module

let page = 1; // Initialize page number
let matches = books; // Set matches to the list of all books

/**
 * Creates a button element for a book preview.
 * This button includes the book's image, title, and author.
 */
const createBookPreview = (book) => {
    const { author, id, image, title } = book; // Destructure book properties
    const element = document.createElement('button'); // Create a button element
    element.classList = 'preview'; // Add the 'preview' class to the button
    element.setAttribute('data-preview', id); // Set data-preview attribute with the book ID

    // Set the inner HTML of the button with the book's image, title, and author
    element.innerHTML = `
        <img class="preview__image" src="${image}" alt="Book cover of ${title}">
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;
    return element; // Return the created button element
};

/**
 * Renders a list of book previews to the page.
 * The list starts from the specified index and includes up to BOOKS_PER_PAGE elements.
 */
const renderBooks = (bookList, startIndex = 0) => {
    const fragment = document.createDocumentFragment(); // Create a document fragment
    const slicedBooks = bookList.slice(startIndex, startIndex + BOOKS_PER_PAGE); // Get the slice of books to render

    // Append each book preview to the document fragment
    slicedBooks.forEach(book => fragment.appendChild(createBookPreview(book)));
    document.querySelector('[data-list-items]').appendChild(fragment); // Append the fragment to the list items container
};

/**
 * Populates a dropdown menu with options based on provided data.
 */
const populateDropdown = (data, dropdown) => {
    const fragment = document.createDocumentFragment(); // Create a document fragment
    const firstOption = document.createElement('option'); // Create the 'All' option
    firstOption.value = 'any'; // Set its value to 'any'
    firstOption.innerText = `All ${dropdown.dataset.type}`; // Set the text to 'All Genres' or 'All Authors'
    fragment.appendChild(firstOption); // Append the 'All' option to the fragment

    // Append each data entry as an option in the dropdown
    Object.entries(data).forEach(([id, name]) => {
        const option = document.createElement('option'); // Create an option element
        option.value = id; // Set the value to the entry's ID
        option.innerText = name; // Set the text to the entry's name
        fragment.appendChild(option); // Append the option to the fragment
    });

    dropdown.appendChild(fragment); // Append the fragment to the dropdown
};

/**
 * Toggles the theme of the page between 'day' and 'night'.
 */
const toggleTheme = (theme) => {
    if (theme === 'night') {
        // Set dark theme colors
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        // Set light theme colors
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
};

/**
 * Initializes the page with default settings and event listeners.
 */
const initPage = () => {
    renderBooks(matches); // Render initial set of books

    // Populate genre and author dropdowns
    populateDropdown(genres, document.querySelector('[data-search-genres]'));
    populateDropdown(authors, document.querySelector('[data-search-authors]'));

    // Set theme based on user preference
    const prefersDarkScheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; // Check if the user prefers dark scheme
    document.querySelector('[data-settings-theme]').value = prefersDarkScheme ? 'night' : 'day'; // Set the theme selector value
    toggleTheme(prefersDarkScheme ? 'night' : 'day'); // Apply the theme

    // Set show more button text and state
    const showMoreButton = document.querySelector('[data-list-button]');
    showMoreButton.innerText = `Show more (${books.length - BOOKS_PER_PAGE})`;
    showMoreButton.disabled = matches.length <= BOOKS_PER_PAGE;

    // Add event listeners for various actions
    document.querySelector('[data-search-cancel]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = false; // Close search overlay
    });

    document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = false; // Close settings overlay
    });

    document.querySelector('[data-header-search]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = true; // Open search overlay
        document.querySelector('[data-search-title]').focus(); // Focus on search input
    });

    document.querySelector('[data-header-settings]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = true; // Open settings overlay
    });

    document.querySelector('[data-list-close]').addEventListener('click', () => {
        document.querySelector('[data-list-active]').open = false; // Close active book detail overlay
    });

    document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent form from submitting
        const formData = new FormData(event.target); // Get form data
        const { theme } = Object.fromEntries(formData); // Extract theme value
        toggleTheme(theme); // Apply the selected theme
        document.querySelector('[data-settings-overlay]').open = false; // Close settings overlay
    });

    document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent form from submitting
        const formData = new FormData(event.target); // Get form data
        const filters = Object.fromEntries(formData); // Convert form data to an object
        matches = books.filter(book => {
            // Filter books based on the selected filters
            const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
            const titleMatch = !filters.title.trim() || book.title.toLowerCase().includes(filters.title.toLowerCase());
            const authorMatch = filters.author === 'any' || book.author === filters.author;
            return genreMatch && titleMatch && authorMatch;
        });

        page = 1; // Reset page number
        document.querySelector('[data-list-items]').innerHTML = ''; // Clear current book previews
        renderBooks(matches); // Render filtered books

        if (matches.length === 0) {
            document.querySelector('[data-list-message]').classList.add('list__message_show'); // Show no results message
        } else {
            document.querySelector('[data-list-message]').classList.remove('list__message_show'); // Hide no results message
        }

        showMoreButton.disabled = matches.length <= BOOKS_PER_PAGE; // Enable or disable show more button
        showMoreButton.innerHTML = `
            <span>Show more</span>
            <span class="list__remaining"> (${matches.length - BOOKS_PER_PAGE})</span>
        `;
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        document.querySelector('[data-search-overlay]').open = false; // Close search overlay
    });

    showMoreButton.addEventListener('click', () => {
        renderBooks(matches, page * BOOKS_PER_PAGE); // Render more books
        page += 1; // Increment page number
        showMoreButton.disabled = matches.length <= page * BOOKS_PER_PAGE; // Enable or disable show more button
    });

    document.querySelector('[data-list-items]').addEventListener('click', (event) => {
        const previewId = event.target.closest('.preview')?.dataset?.preview; // Get the preview ID
        if (previewId) {
            const activeBook = books.find(book => book.id === previewId); // Find the active book by ID
            if (activeBook) {
                // Display the active book details in the overlay
                document.querySelector('[data-list-active]').open = true;
                document.querySelector('[data-list-blur]').src = activeBook.image;
                document.querySelector('[data-list-image]').src = activeBook.image;
                document.querySelector('[data-list-title]').innerText = activeBook.title;
                document.querySelector('[data-list-subtitle]').innerText = `${authors[activeBook.author]} (${new Date(activeBook.published).getFullYear()})`;
                document.querySelector('[data-list-description]').innerText = activeBook.description;
            }
        }
    });
};

// Initialize the page
initPage();
