document.addEventListener('DOMContentLoaded', () => {
    const books = [];
    const RENDER_EVENT = 'render-book';
    const STORAGE_KEY = 'BOOKSHELF_APPS';

    //Submission form event listener
    document.getElementById('inputBook').addEventListener('submit', (event) => {
        event.preventDefault();
        addBook();
    });

    //Search form event listener
    document.getElementById('searchBook').addEventListener('submit', (event) => {
        event.preventDefault();
        searchBook();
    });

    //Add book funtion
    function addBook() {
        const title = document.getElementById('inputBookTitle').value;
        const author = document.getElementById('inputBookAuthor').value;
        const year = document.getElementById('inputBookYear').value;
        const isComplete = document.getElementById('inputBookIsComplete').checked;

        const id = +new Date();
        const bookObject = { id, title, author, year: parseInt(year), isComplete };

        books.push(bookObject);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    //make book element
    function makeBook(bookObject) {
        const bookTitle = document.createElement('h3');
        bookTitle.innerText = bookObject.title;

        const bookAuthor = document.createElement('p');
        bookAuthor.innerText = `Penulis: ${bookObject.author}`;

        const bookYear = document.createElement('p');
        bookYear.innerText = `Tahun: ${bookObject.year}`;

        const bookElement = document.createElement('article');
        bookElement.classList.add('book_item');

        bookElement.append(bookTitle, bookAuthor, bookYear);

        const actionContainer = document.createElement('div');
        actionContainer.classList.add('action');

        if (bookObject.isComplete) {
            const unreadButton = document.createElement('button');
            unreadButton.classList.add('green');
            unreadButton.innerHTML = '<i class="ph ph-arrow-counter-clockwise"></i>';
            unreadButton.addEventListener('click', () => {
                undoBookFromCompleted(bookObject.id);
            });

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('red');
            deleteButton.innerHTML = '<i class="ph ph-trash"></i>';
            deleteButton.addEventListener('click', () => {
                showDialog(bookObject.id);
            });

            actionContainer.append(unreadButton, deleteButton);
        } else {
            const completeButton = document.createElement('button');
            completeButton.classList.add('green');
            completeButton.innerHTML = '<i class="ph ph-check-square"></i>';
            completeButton.addEventListener('click', () => {
                addBookToCompleted(bookObject.id);
            });

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('red');
            deleteButton.innerHTML = '<i class="ph ph-trash"></i>';
            deleteButton.addEventListener('click', () => {
                showDialog(bookObject.id);
            });

            actionContainer.append(completeButton, deleteButton);
        }

        bookElement.append(actionContainer);
        return bookElement;
    }

    //funtion to fill edit form
    function fillEditForm(bookId) {
        const bookTarget = findBook(bookId);

        if (bookTarget !== null) return;
        document.getElementById('inputBookTitle').value = bookObject.title;
        document.getElementById('inputBookAuthor').value = bookObject.author;
        document.getElementById('inputBookYear').value = bookObject.year;
        document.getElementById('inputBookIsComplete').checked = bookObject.isComplete;

        const submitButton = document.getElementById('bookSubmit');
        submitButton.innerText = 'Update Buku';
        submitButton.removeEventListener('click', addBook);
        submitButton.addEventListener('click', (event) => {
            event.preventDefault();
            updateBook(bookId)
        });
    }

    //function to update book
    function updateBook(bookId) {
        const bookTarget = findBook(bookId);

        if (bookTarget !== null) return;
        bookTarget.title = document.getElementById('inputBookTitle').value;
        bookTarget.author = document.getElementById('inputBookAuthor').value;
        bookTarget.year = document.getElementById('inputBookYear').value;
        bookTarget.isComplete = document.getElementById('inputBookIsComplete').checked;

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();

        resetForm();
        const submitButton = document.getElementById('bookSubmit');
        submitButton.innerText = 'Tambah Buku';
        submitButton.removeEventListener('click', updateBook);
        submitButton.addEventListener('click', addBook);
    }

    //function to reset form
    function resetForm() {
        document.getElementById('inputBookTitle').value = '';
        document.getElementById('inputBookAuthor').value = '';
        document.getElementById('inputBookYear').value = '';
        document.getElementById('inputBookIsComplete').checked = false;
    }

    //function add book to completed
    function addBookToCompleted(bookId) {
        const bookTarget = findBook(bookId);

        if (bookTarget === null) return;

        bookTarget.isComplete = true;

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    //function to undo book from completed
    function undoBookFromCompleted(bookId) {
        const bookTarget = findBook(bookId);

        if (bookTarget === null) return;

        bookTarget.isComplete = false;

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    function showDialog(bookId) {
        const dialog = document.getElementById('deleteDialog');
        dialog.style.display = 'flex';
    
        const confirmButton = document.getElementById('confirmDelete');
        confirmButton.onclick = () => {
          removeBook(bookId);
          dialog.style.display = 'none';
        };
    
        const cancelButton = document.getElementById('cancelDelete');
        cancelButton.onclick = () => {
          dialog.style.display = 'none';
        };
      }

    //function to remove book
    function removeBook(bookId) {
        const bookIndex = findBookIndex(bookId);

        if (bookIndex === -1) return;

        books.splice(bookIndex, 1);

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    //function to find book
    function findBook(bookId) {
        for (const book of books) {
            if (book.id === bookId) {
                return book;
            }
        }
        return null;
    }

    //function to find book index
    function findBookIndex(bookId) {
        for (const index in books) {
            if (books[index].id === bookId) {
                return index;
            }
        }
        return -1;
    }

    //function to search book
    function searchBook() {
        const searchQuery = document.getElementById('searchBookTitle').value.toLowerCase();;
        const filteredBooks = books.filter((book) => {
            return book.title.toLowerCase().includes(searchQuery.toLowerCase());
        });

        renderBooks(filteredBooks);
    }

    //function to render books
    function renderBooks(books) {
        const incompleteBookshelfList = document.getElementById('incompleteBookshelfList'); // Incomplete Bookshelf List
        const completeBookshelfList = document.getElementById('completeBookshelfList'); // Complete Bookshelf List

        incompleteBookshelfList.innerHTML = '';
        completeBookshelfList.innerHTML = '';

        for (const book of books) {
            const newBook = makeBook(book);

            if (book.isComplete) {
                completeBookshelfList.append(newBook);
            } else {
                incompleteBookshelfList.append(newBook);
            }
        }
    }

    //Save data
    function saveData() {
        if (isStorageExist()) {
            const parsed = JSON.stringify(books);
            localStorage.setItem(STORAGE_KEY, parsed);
            document.dispatchEvent(new Event(RENDER_EVENT));
        }
    }

    //check if storage exists
    function isStorageExist() {
        if (typeof (Storage) === undefined) {
            alert('Browser kamu tidak mendukung local storage');
            return false;
        }
        return true;
    }

    //add event listener to render event
    document.addEventListener(RENDER_EVENT, () => {
        const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
        const completeBookshelfList = document.getElementById('completeBookshelfList');

        incompleteBookshelfList.innerHTML = '';
        completeBookshelfList.innerHTML = '';

        for (const bookItem of books) {
            const bookElement = makeBook(bookItem);

            if (!bookItem.isComplete) {
                incompleteBookshelfList.append(bookElement);
            } else {
                completeBookshelfList.append(bookElement);
            }
        }
    });

    //function to load data from storage
    function loadDataFromStorage() {
        const serializedData = localStorage.getItem(STORAGE_KEY);
        let data = JSON.parse(serializedData);

        if (data !== null) {
            for (const book of data) {
                books.push(book);
            }
        }

        document.dispatchEvent(new Event(RENDER_EVENT));
    }

    // Load data from storage when page loads
    if (isStorageExist()) {
        loadDataFromStorage();
    }

});