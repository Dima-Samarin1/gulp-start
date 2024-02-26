export function tabs () {
  function handleClick(event) {
	event.preventDefault();

	const siblings = Array.from(this.parentNode.children).filter(function (child) {
		return child !== this;
	}, this);

	siblings.forEach(function (sibling) {
		sibling.classList.remove('tabs--active');
	});

	const parentSiblings = Array.from(this.parentNode.parentNode.children).filter(function (child) {
		return child !== this.parentNode;
	}, this);

	parentSiblings.forEach(function (sibling) {
		Array.from(sibling.querySelectorAll('div')).forEach(function (div) {
			div.classList.remove('tabs-content--active');
		});
	});

	this.classList.add('tabs--active');

	const contentId = this.getAttribute('href');
	document.querySelector(contentId).classList.add('tabs-content--active');
}

document.addEventListener('DOMContentLoaded', function () {
	const tabs = document.querySelectorAll('.tab');

	tabs.forEach(function (tab) {
		tab.addEventListener('click', handleClick);
	});
});
}

