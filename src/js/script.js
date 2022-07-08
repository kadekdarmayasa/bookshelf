const app = () => {
	let books = [];
	const UPDATE_UI = new Event('update-ui');
	const storageKey = 'book-datas-in-storage';

	const updateUI = () => {
		document.body.dispatchEvent(UPDATE_UI);
		saveToStorage();
	};

	const checkForStorage = () => (typeof Storage === 'function' ? true : false);

	const saveToStorage = () => {
		if (checkForStorage()) {
			localStorage.setItem(storageKey, JSON.stringify(books));
			document.body.dispatchEvent(UPDATE_UI);
		}
	};

	const loadDataFromStorage = () => {
		if (checkForStorage()) {
			if (books.length === 0 && localStorage.getItem(storageKey) !== null) {
				books = JSON.parse(localStorage.getItem(storageKey));
			}
			updateUI();
		}
	};

	const showAlert = (typeAlert) => {
		const information = document.querySelector('.information');
		const audio = document.querySelector('audio');

		switch (typeAlert) {
			case 'successAddedToShelf':
				information.firstElementChild.innerText = 'Buku berhasil ditambahkan ke dalam rak.';
				break;
			case 'successUpdate':
				information.firstElementChild.innerHTML = 'Data buku berhasil diperbaharui';
				break;
			case 'moveToUncmpoletedShelf':
				information.firstElementChild.innerHTML = 'Buku berhasil dipindahkan ke dalam <b>Rak Belum Selesai Dibaca</b>.';
			case 'moveToCompletedShelf':
				information.firstElementChild.innerHTML = 'Buku berhasil dipindahkan ke dalam <b>Rak Telah Selesai Dibaca</b>.';
				break;
			case 'deleteBookFromShelf':
				information.firstElementChild.innerHTML = 'Buku telah dihapus dari rak';
				break;
		}

		information.style.opacity = '1';
		information.style.bottom = '10px';
		audio.currentTime = 0;
		audio.play();

		setTimeout(() => {
			information.style.opacity = '0';
			information.style.bottom = '-100px';
		}, 2000);
	};

	const searchBooks = (keyword) => {
		if (keyword !== '') {
			for (const book of document.querySelectorAll('.book')) {
				for (const word of keyword.trim().split(' ')) {
					if (book.firstElementChild.innerText.split(' ').includes(word)) {
						book.style.display = 'block';
					} else {
						book.style.display = 'none';
					}
				}
			}

			const displayBooks = [];

			for (const book of document.querySelectorAll('.book')) {
				displayBooks.push(book.style.display);
			}

			const isNone = displayBooks.every((value) => {
				return value === 'none';
			});

			if (isNone) {
				alert('Buku yang anda cari tidak ada, mungkin ada belum memasukkannya atau sudah terhapus.');
				searchBooks('');
			}
		} else {
			for (const book of document.querySelectorAll('.book')) {
				book.style.display = 'block';
			}
		}
	};

	const makeBookItem = (bookObject) => {
		const bookItem = document.createElement('div');
		bookItem.className = 'book';

		const title = document.createElement('h3');
		title.className = 'title';
		title.innerText = bookObject.title;

		const id = document.createElement('p');
		id.className = 'book-id';
		id.innerText = bookObject.id;

		const author = document.createElement('p');
		author.className = 'author';
		author.innerText = bookObject.author;

		const year = document.createElement('p');
		year.className = 'year';
		year.innerText = bookObject.year;

		const actionButtons = document.createElement('action-buttons');
		actionButtons.className = 'action-buttons';

		const deleteBook = document.createElement('button');
		deleteBook.title = 'hapus buku';
		deleteBook.className = 'delete-book-button';
		deleteBook.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

		deleteBook.addEventListener('click', function () {
			let confirmToUser = confirm('Apakah kamu yakin ingin menghapus buku ini ? ');
			if (confirmToUser) {
				deleteBookFromShelf(bookObject.id);
			}
		});

		const updateBookButton = document.createElement('button');
		updateBookButton.title = 'perbarui buku';
		updateBookButton.className = 'update-book-button';
		updateBookButton.innerHTML = '<i class="fa-solid fa-pen-to-square"><i/>';

		updateBookButton.addEventListener('click', function () {
			updateBook(bookObject.id);
		});

		if (bookObject.isComplete == false) {
			const unCompletedReadButton = document.createElement('button');
			unCompletedReadButton.className = 'uncompleted-read';
			unCompletedReadButton.innerHTML = '<span>Selesai Dibaca</span>';
			actionButtons.append(unCompletedReadButton, deleteBook, updateBookButton);

			unCompletedReadButton.addEventListener('click', function () {
				moveToCompletedShelf(bookObject.id);
			});
		} else {
			const completedReadButton = document.createElement('button');
			completedReadButton.className = 'completed-read';
			completedReadButton.innerHTML = '<span>Belum Selesai Dibaca</span>';
			actionButtons.append(completedReadButton, deleteBook, updateBookButton);

			completedReadButton.addEventListener('click', function () {
				moveToUncompletedShelf(bookObject.id);
			});
		}

		bookItem.append(title, id, author, year, actionButtons);

		return bookItem;
	};

	const updateBook = (bookId) => {
		const book = books.filter((value) => value.id === bookId)[0];
		const updateBookContainer = document.querySelector('.update-book');
		let formElements = `<div class="form-element">
            <label for="title">Judul Buku</label>
            <input type="text" name="title" id="title" maxlength="50" value="${book.title}" required>
          </div>
          <div class="form-element">
            <label for="author">Penulis</label>
            <input type="text" id="author" name="author" value="${book.author}" maxlength="100" required>
          </div>
          <div class="form-element">
            <label for="year">Tahun Terbit</label>
            <input type="date" id="year" value="${book.year}" name="year" required>
          </div>
          <div class="form-element">
            <input type="checkbox" id="isRead" name="isRead" ${checkboxValue(book)}>
            <label for="isRead">Telah selesai dibaca</label>
          </div>
          <div class="form-element">
            <button id="close" type="button">Keluar</button>
            <button type="submit">Perbarui Buku</button>
          </div>`;

		const updateForm = document.getElementById('update-form');

		updateForm.innerHTML = formElements;
		updateBookContainer.style.display = 'flex';
		document.body.style.overflow = 'hidden';

		updateForm.onsubmit = function (e) {
			e.preventDefault();
			book.title = document.getElementById('title').value;
			book.author = document.getElementById('author').value;
			book.year = document.getElementById('year').value;
			book.isComplete = document.getElementById('isRead').checked;

			document.getElementById('close').click();
			showAlert('successUpdate');
			updateUI();
		};

		document.getElementById('close').addEventListener('click', function () {
			updateBookContainer.style.display = 'none';
			document.body.style.overflow = 'auto';
		});
	};

	const checkboxValue = (book) => (book.isComplete === false ? '' : 'checked');

	const moveToUncompletedShelf = (bookId) => {
		for (const book of books) {
			if (bookId === book.id) book.isComplete = false;
		}
		showAlert('moveToUncompletedShelf');
		updateUI();
	};

	const moveToCompletedShelf = (bookId) => {
		for (const book of books) {
			if (book.id == bookId) book.isComplete = true;
		}
		showAlert('moveToCompletedShelf');
		updateUI();
	};

	const deleteBookFromShelf = (bookId) => {
		for (const index in books) {
			if (books[index].id === bookId) books.splice(index, 1);
		}

		showAlert('deleteBookFromShelf');
		updateUI();
	};

	function renderBooks() {
		const unCompeletedBookShelf = document.querySelector('.uncompleted-books-shelf');
		const completedBookShelf = document.querySelector('.completed-books-shelf');
		unCompeletedBookShelf.innerHTML = '';
		completedBookShelf.innerHTML = '';

		for (const book of books) {
			book.isComplete === false ? unCompeletedBookShelf.append(makeBookItem(book)) : completedBookShelf.append(makeBookItem(book));
		}

		if (unCompeletedBookShelf.innerHTML == '') {
			unCompeletedBookShelf.innerHTML = '<p style="text-align: center;">Tidak terdapat buku yang <b>belum selesai dibaca</b>.</p>';
		}

		if (completedBookShelf.innerHTML == '') {
			completedBookShelf.innerHTML = '<p style="text-align: center;">Tidak terdapat buku yang <b>telah selesai dibaca</b>.</p>';
		}
	}

	document.body.addEventListener('update-ui', renderBooks);

	document.addEventListener('DOMContentLoaded', function () {
		const addForm = document.getElementById('addForm');
		const searchKeywordButton = document.getElementById('search-keyword-button');
		loadDataFromStorage();

		addForm.addEventListener('submit', function (event) {
			event.preventDefault();

			const bookTitle = document.getElementById('judul-buku').value;
			const author = document.getElementById('penulis').value;
			const year = document.getElementById('tahun-terbit').value;
			const isComplete = document.getElementById('isComplete').checked;

			books.push({
				id: +new Date(),
				title: bookTitle,
				author: author,
				year: year,
				isComplete: isComplete,
			});

			showAlert('successAddedToShelf');
			updateUI();
		});

		searchKeywordButton.addEventListener('click', function () {
			const searchKeyword = document.getElementById('search-keyword').value;
			searchBooks(searchKeyword);
		});

		document.getElementById('search-keyword').addEventListener('keypress', function (event) {
			if (event.key === 'Enter') {
				searchKeywordButton.click();
			}
		});
	});
};

app();
