import {
	loadCreateEvents,
	loadParticipateEvents,
	currentParticipantsList,
	loadParticipantsModal
} from './loadEvent.js';

function onlyNumbers(str) {
	return /^[0-9]+$/.test(str);
}

export function listenCreateButtons() {
	document.querySelector('.create .next-round').addEventListener('click', async (e) => {
		e.stopImmediatePropagation();
		const params = new URLSearchParams(window.location.search);
		let page = '2';

		if (!params.has('create-page')) {
			page = await loadCreateEvents(page);
		} else {
			if (onlyNumbers(params.get('create-page'))) {
				if (parseInt(params.get('create-page')) >= 1) {
					page = (parseInt(params.get('create-page')) + 1).toString();
					page = await loadCreateEvents(page);
				} else {
					page = '1';
					page = await loadCreateEvents(page);
				}
			} else {
				page = '1';
				page = await loadCreateEvents(page);
			}
		}

		if (!params.has('participate-page')) {
			history.pushState({}, 'Dashboard', `http://localhost:8080/index.html?create-page=${page}`);
		} else {
			const participatePage = params.get('participate-page');
			history.pushState(
				{},
				'Dashboard',
				`http://localhost:8080/index.html?create-page=${page}&participate-page=${participatePage}`
			);
		}

		listenCreateButtons();
	});

	document.querySelector('.create .previous-round').addEventListener('click', async (e) => {
		e.stopImmediatePropagation();
		const params = new URLSearchParams(window.location.search);
		let page = '1';

		if (!params.has('create-page')) {
			page = await loadCreateEvents(page);
		} else {
			if (onlyNumbers(params.get('create-page'))) {
				if (parseInt(params.get('create-page')) >= 2) {
					page = (parseInt(params.get('create-page')) - 1).toString();
					page = await loadCreateEvents(page);
				} else {
					page = '1';
					page = await loadCreateEvents(page);
				}
			} else {
				page = '1';
				page = await loadCreateEvents(page);
			}
		}

		if (!params.has('participate-page')) {
			history.pushState({}, 'Dashboard', `http://localhost:8080/index.html?create-page=${page}`);
		} else {
			const participatePage = params.get('participate-page');
			history.pushState(
				{},
				'Dashboard',
				`http://localhost:8080/index.html?create-page=${page}&participate-page=${participatePage}`
			);
		}

		listenCreateButtons();
	});
}

export function listenParticipateButtons() {
	document.querySelector('.participate .next-round').addEventListener('click', async (e) => {
		e.stopImmediatePropagation();
		const params = new URLSearchParams(window.location.search);
		let page = '2';

		if (!params.has('participate-page')) {
			page = await loadParticipateEvents(page);
		} else {
			if (onlyNumbers(params.get('participate-page'))) {
				if (parseInt(params.get('participate-page')) >= 1) {
					page = (parseInt(params.get('participate-page')) + 1).toString();
					page = await loadParticipateEvents(page);
				} else {
					page = '1';
					page = await loadParticipateEvents(page);
				}
			} else {
				page = '1';
				page = await loadParticipateEvents(page);
			}
		}

		if (!params.has('create-page')) {
			history.pushState({}, 'Dashboard', `http://localhost:8080/index.html?participate-page=${page}`);
		} else {
			const createPage = params.get('create-page');
			history.pushState(
				{},
				'Dashboard',
				`http://localhost:8080/index.html?create-page=${createPage}&participate-page=${page}`
			);
		}

		listenParticipateButtons();
	});

	document.querySelector('.participate .previous-round').addEventListener('click', async (e) => {
		e.stopImmediatePropagation();
		const params = new URLSearchParams(window.location.search);
		let page = '1';

		if (!params.has('participate-page')) {
			page = await loadParticipateEvents(page);
		} else {
			if (onlyNumbers(params.get('participate-page'))) {
				if (parseInt(params.get('participate-page')) >= 2) {
					page = (parseInt(params.get('participate-page')) - 1).toString();
					page = await loadParticipateEvents(page);
				} else {
					page = '1';
					page = await loadParticipateEvents(page);
				}
			} else {
				page = '1';
				page = await loadParticipateEvents(page);
			}
		}

		if (!params.has('create-page')) {
			history.pushState({}, 'Dashboard', `http://localhost:8080/index.html?participate-page=${page}`);
		} else {
			const createPage = params.get('create-page');
			history.pushState(
				{},
				'Dashboard',
				`http://localhost:8080/index.html?create-page=${createPage}&participate-page=${page}`
			);
		}

		listenParticipateButtons();
	});
}

export function listenEditButtons() {
	const editCreatedButtons = document.querySelectorAll("[class^='created_detail_'] a");
	for (let editButton of editCreatedButtons) {
		editButton.addEventListener('click', async () => {
			const className = editButton.parentNode.parentNode.className;
			const eventId = className.replace('created_detail_', '');
			window.location.href = `/eventSummary/event.html?event-id=${eventId}&is-creator=1`;
		});
	}

	const editParticipatedButtons = document.querySelectorAll("[class^='participated_detail_'] a");
	for (let editButton of editParticipatedButtons) {
		editButton.addEventListener('click', async () => {
			const className = editButton.parentNode.parentNode.className;
			const eventId = className.replace('participated_detail_', '');
			window.location.href = `/eventSummary/event.html?event-id=${eventId}&is-creator=0`;
		});
	}
}

export function listenToSchedulePage(datetime) {
	const date = datetime ? `${datetime.slice(0, 4)}${datetime.slice(5, 7)}${datetime.slice(8, 10)}` : '';
	const toScheduleDiv = document.querySelector('.schedule .info-button');
	const params = new URLSearchParams(window.location.search);
	const eventId = params.get('event-id');
	const isCreator = params.get('is-creator');
	if (toScheduleDiv) {
		toScheduleDiv.addEventListener('click', () => {
			window.location.href = `/eventSchedule/eventSchedule.html?event-id=${eventId}&is-creator=${isCreator}&date=${date}`;
		});
	}
}

export function listenToItemPage() {
	const toScheduleDiv = document.querySelector('.item .info-button');
	const params = new URLSearchParams(window.location.search);
	const eventId = params.get('event-id');
	const isCreator = params.get('is-creator');
	if (toScheduleDiv) {
		toScheduleDiv.addEventListener('click', () => {
			window.location.href = `/itemPostPage/itemPost.html?event-id=${eventId}&is-creator=${isCreator}`;
		});
	}
}

export let deletedParticipantsList = [];
export function listenToDeleteParticipants() {
	const deleteButtonDivList = document.querySelectorAll('#participants-modal .delete-button');
	for (let deleteButtonDiv of deleteButtonDivList) {
		deleteButtonDiv.addEventListener('click', (e) => {
			e.stopImmediatePropagation();
			const userId = parseInt(e.path[1].id.replace('delete_button_user_', ''));
			for (let i = 0; i < currentParticipantsList.length; i++) {
				if (currentParticipantsList[i].id === userId) {
					const [deletedParticipant] = currentParticipantsList.splice(i, 1);
					deletedParticipantsList.push(deletedParticipant);
					loadParticipantsModal(currentParticipantsList, deletedParticipantsList);
				}
			}
			listenToDeleteParticipants();
		});
	}
}
