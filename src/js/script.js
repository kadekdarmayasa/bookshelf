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
				document.body.dispatchEvent(UPDATE_UI);
			}
		}
	};

	const showAlert = (typeAlert) => {
		const information = document.querySelector('.information');
		const audio = document.querySelector('audio');

		switch (typeAlert) {
			case 'successAddedToShelf':
				information.firstElementChild.innerText = 'Buku berhasil ditambahkan ke dalam rak.';
				break;
			case 'moveToUncompletedShelf':
				information.firstElementChild.innerHTML = 'Buku berhasil dipindahkan ke dalam <b>Rak Belum Selesai Dibaca</b>.';
				break;
			case 'moveToCompletedShelf':
				information.firstElementChild.innerHTML = 'Buku berhasil dipindahkan ke dalam <b>Rak Telah Selesai Dibaca</b>.';
				break;
			case 'deleteBookFromShelf':
				information.firstElementChild.innerHTML = 'Buku telah dihapus dari rak';
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
		deleteBook.className = 'delete-book';
		deleteBook.innerHTML = '<span>Hapus Buku</span>';

		deleteBook.addEventListener('click', function () {
			let confirmToUser = confirm('Apakah kamu yakin ingin menghapus buku ini ? ');
			if (confirmToUser) {
				deleteBookFromShelf(bookObject.id);
			}
		});

		if (bookObject.isComplete == false) {
			const unCompletedReadButton = document.createElement('button');
			unCompletedReadButton.className = 'uncompleted-read';
			unCompletedReadButton.innerHTML = '<span>Selesai Dibaca</span>';
			actionButtons.append(unCompletedReadButton, deleteBook);

			unCompletedReadButton.addEventListener('click', function () {
				moveToCompletedShelf(bookObject.id);
			});
		} else {
			const completedReadButton = document.createElement('button');
			completedReadButton.className = 'completed-read';
			completedReadButton.innerHTML = '<span>Belum Selesai Dibaca</span>';
			actionButtons.append(completedReadButton, deleteBook);

			completedReadButton.addEventListener('click', function () {
				moveToUncompletedShelf(bookObject.id);
			});
		}

		bookItem.append(title, id, author, year, actionButtons);

		return bookItem;
	};

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
		const submitForm = document.getElementById('submitForm');
		const searchKeywordButton = document.getElementById('search-keyword-button');
		loadDataFromStorage();

		submitForm.addEventListener('submit', function (event) {
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
