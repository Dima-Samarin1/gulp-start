document.addEventListener("DOMContentLoaded", () => {
	const tabWrappers = document.querySelectorAll(".tabs__wrapper")

	tabWrappers.forEach(wrapper => {
		const tabs = wrapper.querySelectorAll(".tab")
		const contents = wrapper.querySelectorAll(".tabs-content")

		tabs.forEach(tab => {
			tab.addEventListener("click", event => {
				event.preventDefault()

				// Удаляем класс 'tabs--active' у всех вкладок
				tabs.forEach(t => t.classList.remove("tabs--active"))
				// Добавляем класс 'tabs--active' к текущей вкладке
				tab.classList.add("tabs--active")

				// Получаем ID целевого контента
				const targetId = tab.getAttribute("href").substring(1)

				// Удаляем класс 'tabs-content--active' у всех содержимых вкладок
				contents.forEach(content =>
					content.classList.remove("tabs-content--active")
				)

				// Добавляем класс 'tabs-content--active' к целевому содержимому вкладки
				const targetContent = wrapper.querySelector(`#${targetId}`)
				if (targetContent) {
					targetContent.classList.add("tabs-content--active")
				}
			})
		})
	})
})
