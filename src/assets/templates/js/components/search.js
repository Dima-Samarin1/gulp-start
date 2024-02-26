export function search() {
	let search = document.querySelector('.search')
	let searchField = document.querySelector('.search-field')
	let searchFieldInput = document.querySelector(
		'.search-field input[type=text]'
	)
	let searchWrap = document.querySelector('.search-wrap')

	function closeSearch(event) {
		if (event.key === 'Escape') {
			searchField.classList.remove('active')
		}
	}

	search.addEventListener('click', function () {
		searchField.classList.toggle('active')
		searchFieldInput.focus()
	})

	document.addEventListener('keydown', closeSearch)

	document.addEventListener('click', function (event) {
		if (
			!event.target.closest('.search-wrap') &&
			!event.target.closest('.search-field')
		) {
			searchField.classList.remove('active')
		}
	})
}