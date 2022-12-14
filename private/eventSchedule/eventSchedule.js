import { addNavbar } from '/functions/addNavbar.js';
import { loadName } from '/functions/loadName.js';

window.addEventListener('load', async () => {
	addNavbar();
	loadName();

	await getEventSchedule();
	await setEnvironment();
	deleteTimeBlock();
	listenToSchedulePage();
	hideCreatorDivClass();

	document.body.style.display = 'block';
});

async function setEnvironment() {
	setGlobalHeight(2);

	let formStartTime = document.querySelector('#start-time');
	let formEndTime = document.querySelector('#end-time');

	const blankTimeBlocks = document.querySelectorAll('.event-schedule');
	blankTimeBlocks.forEach((blankTimeBlock) => {
		blankTimeBlock.addEventListener('click', (e) => {
			e.preventDefault();
			const startTime = parseInt(e.target.getAttribute('start'));
			const endTime = parseInt(e.target.getAttribute('end'));

			formStartTime.value = minToTimeString(startTime);
			formEndTime.value = minToTimeString(endTime);
		});
	});

	blankTimeBlocks.forEach((blankTimeBlock) => {
		blankTimeBlock.addEventListener('mousedown', (e) => {
			e.preventDefault();
			const startTime = parseInt(e.target.getAttribute('start'));
			let formStartTime = document.querySelector('#start-time');
			formStartTime.value = minToTimeString(startTime);

			blankTimeBlock.addEventListener('mouseup', (e) => {
				const endTime = parseInt(e.target.getAttribute('end'));
				let formEndTime = document.querySelector('#end-time');
				formEndTime.value = minToTimeString(endTime);
			});
		});
	});
}

async function getEventSchedule() {
	const params = new URLSearchParams(window.location.search);
	const eventId = params.get('event-id');
	const isCreator = params.get('is-creator');
	const date = params.get('date');

	const res = await fetch(`/eventSchedule/?event-id=${eventId}&is-creator=${isCreator}&date=${date}`);

	if (res.status !== 200) {
		const data = await res.json();
		alert(data.msg);
		return;
	}

	const result = await res.json();

	const option = {
		hour12: false,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	};

	const eventName = result.detail.name;
	const startDateTime = new Date(result.detail.start_datetime)
		.toLocaleString('en-US', option)
		.replace(', ', ' ')
		.slice(0, -3);
	const endDateTime = new Date(result.detail.end_datetime)
		.toLocaleString('en-US', option)
		.replace(', ', ' ')
		.slice(0, -3);
	const activitiesArr = result.activities;
	const itemList = result.items;
	const savedItemList = result.savedItems;
	const startTime = startDateTime.slice(-5);
	const endTime = endDateTime.slice(-5);
	const startDate = startDateTime.slice(0, 10);
	const endDate = endDateTime.slice(0, 10);
	const startYear = startDateTime.slice(6, 10);
	const endYear = endDateTime.slice(6, 10);
	const startMonth = startDateTime.slice(0, 2);
	const endMonth = endDateTime.slice(0, 2);
	const startDay = startDateTime.slice(3, 5);
	const endDay = endDateTime.slice(3, 5);

	//in case of two or more days of event
	let startHour = parseInt(startTime.slice(0, 2));
	let endHour = parseInt(endTime.slice(0, 2));
	let startMin = parseInt(startTime.slice(3, 5));
	let endMin = parseInt(endTime.slice(3, 5));
	let startTimeInMin = toMin(startTime);
	let endTimeInMin = toMin(endTime);

	const dayDifference = (new Date(endDate).getTime() - new Date(startDate).getTime()) / 1000 / 60 / 60 / 24;
	const daysOfEventInMin = (new Date(endDateTime).getTime() - new Date(startDateTime).getTime()) / 1000 / 60;

	let dateSelectorContainer = document.querySelector('#date-selector-container');
	let pageTitle = document.querySelector('#event-name');
	let timeContainer = document.querySelector('#event-time-container');

	pageTitle.innerHTML = `${eventName}`;
	timeContainer.innerHTML = `( ${startTime} on ${startDate} )   to   ( ${endTime} on ${endDate} )`;
	dateSelectorContainer.innerHTML = `
                    <input type="date" id="date-selector" name="trip-start"
                    value="${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}"
                    min="${startYear}-${startMonth}-${startDay}" max="${endYear}-${endMonth}-${endDay}"></input>`;

	if (
		dayDifference > 0 &&
		date !== `${startYear}${startMonth}${startDay}` &&
		date !== `${endYear}${endMonth}${endDay}`
	) {
		startHour = 0;
		endHour = 24;
		startMin = 0;
		endMin = 1;
		startTimeInMin = 0;
		endTimeInMin = 1440;
		console.log('case 1');
	}

	if (dayDifference > 0 && date === `${startYear}${startMonth}${startDay}`) {
		endHour = 24;
		endMin = 1;
		endTimeInMin = 1440;
		console.log('case 2');
	}

	if (dayDifference > 0 && date === `${endYear}${endMonth}${endDay}`) {
		startHour = 0;
		startMin = 0;
		startTimeInMin = 0;
		console.log('case 3');
	}

	addTimeInput(startHour, startMin, endHour, endMin);
	getPresetTimeBlock(startTimeInMin);
	getSavedTimeBlocks(activitiesArr);
	correctDiv(startTimeInMin, endTimeInMin);
	await getMemo(activitiesArr, itemList, savedItemList);
	submitEditTimeName(startTimeInMin, endTimeInMin);

	// Add backward button
	document.querySelector('#back-page').href = `/eventSummary/event.html?event-id=${eventId}&is-creator=${isCreator}`;
}

async function getPresetTimeBlock(startTime) {
	let rundown = document.querySelector('#rundown');

	//generate time block for 24 hours
	for (let i = 0; i < 96; i++) {
		let start = i * 15;
		let end = (i + 1) * 15;
		const timeString = minToTimeString(start);
		const height = end - start;
		rundown.innerHTML += `
                    <div id="time-block-container-${start}" start="${start}" end="${end}" class="individual-time-block row">
                        <span id="time-stamp-box" class="time-stamp-container col-sm-2">
                            <div id="stamp-${start}" class="time-stamp">${timeString}</div>
                        </span>
                        <span id="time-block-${start}" start="${start}" end="${end}" class="time-block col-sm-10"></span>
                    </div>    
                `;
		document.querySelector(`#time-block-${start}`).style.height = `${height}px`;
	}

	//set scroll bar top
	document.querySelector('#date-selector').value;
	document.querySelector(`#time-block-${startTime}`).innerHTML = 'Event Start Time';
	const scrollBarDiv = document.querySelector('#rundown-container');
	scrollBarDiv.scrollTop = document.querySelector(`#time-block-${startTime}`).offsetTop;
}


async function getMemo(activitiesArr, itemList, savedItemList) {
	const timeBlocks = document.querySelectorAll('.save-time-block');
	const memoContainer = document.querySelector('#time-block-memo-container');

	timeBlocks.forEach((block) => {
		const startTimeString = minToTimeString(parseInt(block.getAttribute('start')));
		const endTimeString = minToTimeString(parseInt(block.getAttribute('end')));

		block.addEventListener('click', (event) => {
			const activityName = event.target.innerHTML;

			let targetActivity = '';

			activitiesArr.forEach((activity) => {
				if (activity.title === activityName) {
					return (targetActivity = activity);
				}
			});

			const description = targetActivity.description;
			const remark = targetActivity.remark;
			const id = targetActivity.id;

			memoContainer.innerHTML = `
            <label for="memo" id="memo-tag">${startTimeString} to ${endTimeString}</label>
            <button type="button" class="btn-close" id="close-memo" aria-label="Close"></button>
            <div name="memo" id="memo" class="time-block-memo">
                <div id="memo-item-cluster">
                    <div class="memo-item-container">
                        <label class="memo-item-label" for="activity">ACTIVITY DETAIL:</label>
                        <a value="${id}" class="btn creator-function edit-button" id="edit-activities">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </a>
                        <div class="modal-footer" id="separator"></div>
                        <div value="${id}" name="activity" id="activity-detail${id}">${description}</div>
                        <div id="submit-user"></div>
                    </div> 
                    
                    <div class="memo-item-container">
                        <label class="memo-item-label" for="item">ITEM DETAIL:</label>
                        <a value="${id}" class="btn creator-function edit-button" id="edit-show-item" data-bs-toggle="modal" data-bs-target="#edit-item-modal">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </a>
                        <div class="modal-footer" id="separator"></div>
                        
                        <div class="row">
                            <div class="col-sm-6">
                            <label class="memo-item-label" for="food-item">Food</label>
                            <div value="${id}" name="food-item" id="food-detail${id}"></div>
                            </div>
                            
                            <div class="col-sm-6">
                            <label class="memo-item-label" for="drink-item">Drinks</label>
                            <div value="${id}" name="drink-item" id="drink-detail${id}"></div>
                            </div>

                            <div class="col-sm-6">
                            <label class="memo-item-label" for="decoration-item">Decoration</label>
                            <div value="${id}" name="decoration-item" id="decoration-detail${id}"></div>
                            </div>

                            <div class="col-sm-6">
                            <label class="memo-item-label" for="other-item">Other</label>
                            <div value="${id}" name="other-item" id="other-detail${id}"></div>
                            </div>
                        </div>

                    </div> 

                    <div class="memo-item-container">
                        <label class="memo-item-label" for="remark">REMARKS:</label>
                        <a value="${id}" class="btn creator-function edit-button" id="edit-remarks">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </a>
                        <div class="modal-footer" id="separator"></div>
                        <div value="${id}" name="remark" id="remark-detail${id}">${remark}</div>
                        <div id="submit-user"></div>
                    </div> 
                </div> 

            </div>
            `;
			// add saved items
			savedItemList.forEach((savedItem) => {
				if (savedItem.time_block_id === id && savedItem.type_name === 'food') {
					document.querySelector(`#food-detail${id}`).innerHTML += `
                    <li>${savedItem.name}</li>
                    `;
				}
				if (savedItem.time_block_id === id && savedItem.type_name === 'drink') {
					document.querySelector(`#drink-detail${id}`).innerHTML += `
                    <li>${savedItem.name}</li>
                    `;
				}
				if (savedItem.time_block_id === id && savedItem.type_name === 'decoration') {
					document.querySelector(`#decoration-detail${id}`).innerHTML += `
                    <li>${savedItem.name}</li>
                    `;
				}
				if (savedItem.time_block_id === id && savedItem.type_name === 'other') {
					document.querySelector(`#other-detail${id}`).innerHTML += `
                    <li>${savedItem.name}</li>
                    `;
				}
			});

			editActivity(id, description);
			editRemarks(id, remark);
			editItem(id, itemList, savedItemList);

			document.querySelector('#close-memo').addEventListener('click', (e) => {
				e.preventDefault;
				memoContainer.innerHTML = '';
			});
			hideCreatorDivClass();
		});
	});
}

async function addTimeInput(startHour, startMin, endHour, endMin) {
	//restrict time input according to the event start and end time

	const startTimeRange = document.querySelector('#start-time');
	const endTimeRange = document.querySelector('#end-time');

	if (startMin === 0 && endMin !== 0) {
		startTimeRange.setAttribute('min', `${startHour}:0${startMin}`);
		startTimeRange.setAttribute('max', `${endHour}:${endMin}`);
		endTimeRange.setAttribute(`min`, `${startHour}:0${startMin}`);
		endTimeRange.setAttribute(`max`, `${endHour}:${endMin}`);
	}

	if (startMin === 0 && endMin === 0) {
		startTimeRange.setAttribute('min', `${startHour}:0${startMin}`);
		startTimeRange.setAttribute('max', `${endHour}:0${endMin}`);
		endTimeRange.setAttribute(`min`, `${startHour}:0${startMin}`);
		endTimeRange.setAttribute(`max`, `${endHour}:0${endMin}`);
	}

	if (startMin !== 0 && endMin !== 0) {
		startTimeRange.setAttribute('min', `${startHour}:${startMin}`);
		startTimeRange.setAttribute('max', `${endHour}:${endMin}`);
		endTimeRange.setAttribute(`min`, `${startHour}:${startMin}`);
		endTimeRange.setAttribute(`max`, `${endHour}:${endMin}`);
	}

	if (startMin !== 0 && endMin === 0) {
		startTimeRange.setAttribute('min', `${startHour}:${startMin}`);
		startTimeRange.setAttribute('max', `${endHour}:0${endMin}`);
		endTimeRange.setAttribute(`min`, `${startHour}:${startMin}`);
		endTimeRange.setAttribute(`max`, `${endHour}:0${endMin}`);
	}

	//generate time block for 24 hours
	for (let i = 0; i < 96; i++) {
		let start = i * 15;
		let end = (i + 1) * 15;
		const timeString = minToTimeString(start);
		const height = end - start;
		rundown.innerHTML += `
                    <div id="time-block-container-${start}" start="${start}" end="${end}" class="individual-time-block row">
                        <span id="time-stamp-box" class="time-stamp-container col-sm-2">
                            <div id="stamp-${start}" class="time-stamp">${timeString}</div>
                        </span>
                        <span id="time-block-${start}" start="${start}" end="${end}" class="time-block col-sm-10"></span>
                    </div>    
                `;
		document.querySelector(`#time-block-${start}`).style.height = `${height}px`;
	}

	//set scroll bar top
	document.querySelector('#date-selector').value;
	document.querySelector(`#time-block-${startTime}`).innerHTML = 'Event Start Time';
	const scrollBarDiv = document.querySelector('#rundown-container');
	scrollBarDiv.scrollTop = document.querySelector(`#time-block-${startTime}`).offsetTop;
}

async function getSavedTimeBlocks(activitiesArr) {
	activitiesArr.forEach(async (activity) => {
		const start = activity.start_time;
		const end = activity.end_time;
		const title = activity.title;
		const startTimeInMin = toMin(activity.start_time);
		const endTimeInMin = toMin(activity.end_time);
		const divHeight = endTimeInMin - startTimeInMin;
		const id = activity.id;
		const presetColor = '#f29659';
		let color = activity.color;

		if (activity.color === null || undefined) {
			color = presetColor;
		}

		document.querySelector(`#time-block-container-${startTimeInMin}`).innerHTML = `
                <span id="time-stamp-box" class="time-stamp-container col-2">
                    <i value="${id}" id="trash-can" type="button" class="fa-solid fa-trash creator-function"></i>
                    <a value="${id}" class="btn creator-function" id="edit-time-name${id}" data-bs-toggle="modal" data-bs-target="#edit-time-name-modal" >
                    <i class="fa-regular fa-pen-to-square"></i>
                    </a>
                    <div id="stamp-${startTimeInMin}" class="time-stamp">${start}</div>
                </span>
                <span value="${id}" type="button" id="time-block-${startTimeInMin}" start="${startTimeInMin}" end="${endTimeInMin}" class="time-block save-time-block col-10">
                </span>
                
        `;
		document.querySelector(`#time-block-${startTimeInMin}`).innerHTML = title;
		document.querySelector(`#time-block-${startTimeInMin}`).style.height = `${divHeight}px`;
		document.querySelector(`#time-block-${startTimeInMin}`).style.backgroundColor = `${color}`;

		editTimeName(id, title, activity.start_time, activity.end_time, color);
	});
}

document.querySelector('#activity-form').addEventListener('submit', async function formSubmit(e) {
	e.preventDefault();

	const params = new URLSearchParams(window.location.search);
	const eventId = params.get('event-id');
	const isCreator = params.get('is-creator');
	const date = params.get('date');

	const form = e.target;
	const title = form['activity-name'].value;
	const description = form.description.value;
	const remark = form.remark.value;
	const startTime = form.start.value;
	const endTime = form.end.value;
	const color = form.color.value;

	//check time input
	const startHour = parseInt(startTime.slice(0, 2));
	const startMin = parseInt(startTime.slice(3, 5));
	const endHour = parseInt(endTime.slice(0, 2));
	const endMin = parseInt(endTime.slice(3, 5));

	let dataPass = true;

	const startTimeInMin = startHour * 60 + startMin;
	const endTimeInMin = endHour * 60 + endMin;

	if (endTimeInMin <= startTimeInMin) {
		dataPass = false;
		alert('Activity End Time is Smaller than Start Time');
		return;
	}

	if (!title) {
		dataPass = false;
		alert('Title Field is Mandatory');
		return;
	}

	if (dataPass) {
		let formObj = {
			title,
			description,
			remark,
			startTime,
			endTime,
			date,
			color
		};

		const res = await fetch(`/eventSchedule/activity/?event-id=${eventId}&is-creator=${isCreator}&date=${date}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formObj)
		});

		if (res.status !== 200) {
			const data = await res.json();
			alert(data.msg);
			return;
		}

		const result = await res.json();
		if (result.status === true) {
			alert('Activity successfully added!');
			location.reload();
		}
	}
});

async function fixDivHeight(x) {
	if (x > 0) {
		const divCluster = document.querySelectorAll('.time-block');
		divCluster.forEach((div) => {
			let nextDiv;
			if (div.parentElement.nextElementSibling?.childNodes !== null) {
				nextDiv = div.parentElement.nextElementSibling.childNodes[3];
			}
			const height = parseInt(div.getAttribute('end')) - parseInt(div.getAttribute('start'));
			if (!!div.parentElement.nextElementSibling.childNodes) {
				if (nextDiv) {
					if (div.classList === nextDiv.classList && !div.classList.contains('save-time-block')) {
						div.style.height = newHeight;
						const newHeight = parseInt(nextDiv.getAttribute('end')) - parseInt(div.getAttribute('start'));
						div.setAttribute(`start`, `${nextDiv.getAttribute('end')}`);
						nextDiv.parentElement.innerHTML = '';
					} else if (height > 60 && !div.classList.contains('save-time-block')) {
						div.style.height = '60px';
						const redundantHeight = height - 60;
						nextDiv.setAttribute(`start`, `${parseInt(nextDiv.getAttribute('start')) + redundantHeight}`);
					} else {
						div.style.height = `${height}px`;
					}
				}
			}
		});
		console.log(`list has been fixed ${x} times`);
		fixDivHeight(x - 1);
	} else {
		return console.log('fix finished');
	}
}

function editTimeName(id, title, startTime, endTime, color) {
	document.querySelector(`#edit-time-name${id}`).addEventListener('click', (e) => {
		e.preventDefault();
		console.log('target ID = ' + id);

		document.querySelector('#edit-time-name-form').setAttribute('value', `${id}`);
		document.querySelector(`#edit-activity-name`).value = title;
		document.querySelector(`#edit-start-time`).value = startTime;
		document.querySelector(`#edit-end-time`).value = endTime;
		document.querySelector('#edit-color').value = color;
	});
}

function submitEditTimeName(eventStartTimeInMin, eventEndTimeInMin) {
	document.querySelector('#edit-time-name-form').addEventListener('submit', async (e) => {
		e.preventDefault();

		const params = new URLSearchParams(window.location.search);
		const eventId = params.get('event-id');
		const isCreator = params.get('is-creator');
		const date = params.get('date');

		const form = e.target;
		const id = e.target.getAttribute('value');
		const title = form['edit-activity-name'].value;
		const editStartTime = form['edit-start-time'].value;
		const editEndTime = form['edit-end-time'].value;
		const editColor = form['edit-color'].value;

		//check time input
		const startHour = parseInt(editStartTime.slice(0, 2));
		const startMin = parseInt(editStartTime.slice(3, 5));
		const endHour = parseInt(editEndTime.slice(0, 2));
		const endMin = parseInt(editEndTime.slice(3, 5));

		let dataPass = true;

		const startTimeInMin = startHour * 60 + startMin;
		const endTimeInMin = endHour * 60 + endMin;

		if (endTimeInMin <= startTimeInMin) {
			dataPass = false;
			alert('Activity End Time is Smaller than Start Time');
			return;
		}
		if (startTimeInMin < eventStartTimeInMin) {
			dataPass = false;
			alert('Activity Start Time is Smaller than Event Start Time');
			return;
		}
		if (endTimeInMin > eventEndTimeInMin) {
			dataPass = false;
			alert('Activity End Time is Bigger than Event End Time');
			return;
		}

		if (!title) {
			dataPass = false;
			alert('Title Field is Mandatory');
			return;
		}

		console.log(startTimeInMin, endTimeInMin);

		if (dataPass) {
			const formObj = {
				title,
				editStartTime,
				editEndTime,
				editColor
			};

			const res = await fetch(
				`/eventSchedule/timeName/edit/?event-id=${eventId}&is-creator=${isCreator}&id=${id}&date=${date}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(formObj)
				}
			);

			if (res.status !== 200) {
				const data = await res.json();
				alert(data.msg);
				return;
			}

			const result = await res.json();
			if (result.status === true) {
				alert('Activity successfully edited!');
				location.reload();
			}
		}
	});
}

async function editActivity(id, description) {
	document.querySelector(`#edit-activities`).addEventListener('click', (e) => {
		e.preventDefault();
		// target div becomes a textarea

		const div = document.querySelector(`#activity-detail${id}`);

		div.innerHTML = `
                        <form value="${id}" id="edit-description-form">
                        <textarea id="edit-description" type="input" rows="5">${description}</textarea>
                        <button form="edit-description-form" type="submit" class="btn btn-primary button-53">
                            Submit
                        </button>
                        </form>
                        `;
		submitEditActivity();
	});
}

async function submitEditActivity() {
	document.querySelector('#edit-description-form').addEventListener('submit', async (e) => {
		e.preventDefault();

		const params = new URLSearchParams(window.location.search);
		const eventId = params.get('event-id');
		const isCreator = params.get('is-creator');
		const date = params.get('date');

		const form = e.target;
		const id = e.target.getAttribute('value');
		const description = form['edit-description'].value;

		if (!description || onlySpaces(description)) {
			if (!window.confirm('Input field seems to be empty, are you sure to proceed?')) {
				return;
			}
		}

		const res = await fetch(
			`/eventSchedule/description/edit/?event-id=${eventId}&is-creator=${isCreator}&id=${id}&date=${date}`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ description })
			}
		);

		if (res.status !== 200) {
			const data = await res.json();
			alert(data.msg);
			return;
		}

		const result = await res.json();
		if (result.status === true) {
			alert('Activity successfully edited!');
			location.reload();
		}
	});
}

function editItem(timeBlockId, itemList, savedItemList) {
	document.querySelector(`#edit-show-item`).addEventListener('click', (e) => {
		e.preventDefault();

		document.querySelector(`#edit-item-form`).setAttribute('value', `${timeBlockId}`);

		let savedItemArr = [];
		savedItemList.forEach((savedItem) => {
			if (savedItem.time_block_id === timeBlockId) savedItemArr.push(savedItem.item_id);
		});

		let foodArr = [];
		let drinkArr = [];
		let decorationArr = [];
		let otherArr = [];

		// sort items by types
		itemList.forEach((item) => {
			if (item.type_name === 'food') {
				foodArr.push(item);
			}
			if (item.type_name === 'drink') {
				drinkArr.push(item);
			}
			if (item.type_name === 'decoration') {
				decorationArr.push(item);
			}
			if (item.type_name === 'other') {
				otherArr.push(item);
			}
		});

		//list items in modal according to type and set preset "checked" if they are already saved
		let foodListContainer = document.querySelector('#food-list');
		foodListContainer.innerHTML = '';
		foodArr.forEach((food) => {
			if (savedItemArr.includes(food.id)) {
				foodListContainer.innerHTML += `
                 <li>
                    <input value="${food.id}" class="checkbox" type="checkbox" id="${food.name}" name="food" checked>
                <label for="${food.name}">${food.name} ( ${food.quantity} )</label>
                </li>
            `;
			} else {
				foodListContainer.innerHTML += `
                 <li>
                    <input value="${food.id}" class="checkbox" type="checkbox" id="${food.name}" name="food" unchecked>
                <label for="${food.name}">${food.name} ( ${food.quantity} )</label>
                </li>
            `;
			}
		});

		let drinkListContainer = document.querySelector('#drink-list');
		drinkListContainer.innerHTML = '';
		drinkArr.forEach((drink) => {
			if (savedItemArr.includes(drink.id)) {
				drinkListContainer.innerHTML += `
                 <li>
                    <input value="${drink.id}" class="checkbox" type="checkbox" id="${drink.name}" name="drink" checked>
                <label for="${drink.name}">${drink.name} ( ${drink.quantity} )</label>
                </li>
            `;
			} else {
				drinkListContainer.innerHTML += `
                 <li>
                    <input value="${drink.id}" class="checkbox" type="checkbox" id="${drink.name}" name="drink" unchecked>
                <label for="${drink.name}">${drink.name} ( ${drink.quantity} )</label>
                </li>
            `;
			}
		});

		let otherListContainer = document.querySelector('#other-list');
		otherListContainer.innerHTML = '';
		otherArr.forEach((other) => {
			if (savedItemArr.includes(other.id)) {
				otherListContainer.innerHTML += `
                 <li>
                    <input value="${other.id}" class="checkbox" type="checkbox" id="${other.name}" name="other" checked>
                <label for="${other.name}">${other.name} ( ${other.quantity} )</label>
                </li>
            `;
			} else {
				otherListContainer.innerHTML += `
                 <li>
                    <input value="${other.id}" class="checkbox" type="checkbox" id="${other.name}" name="other" unchecked>
                <label for="${other.name}">${other.name} ( ${other.quantity} )</label>
                </li>
            `;
			}
		});

		let decorationListContainer = document.querySelector('#decoration-list');
		decorationListContainer.innerHTML = '';
		decorationArr.forEach((decoration) => {
			if (savedItemArr.includes(decoration.id)) {
				decorationListContainer.innerHTML += `
                 <li>
                    <input value="${decoration.id}" class="checkbox" type="checkbox" id="${decoration.name}" name="decoration" checked>
                <label for="${decoration.name}">${decoration.name} ( ${decoration.quantity} )</label>
                </li>
            `;
			} else {
				decorationListContainer.innerHTML += `
                <li>
                    <input value="${decoration.id}" class="checkbox" type="checkbox" id="${decoration.name}" name="decoration" unchecked>
                <label for="${decoration.name}">${decoration.name} ( ${decoration.quantity} )</label>
                </li>
            `;
			}
		});
	});
}

submitEditItem();

function submitEditItem() {
	document.querySelector('#edit-item-form').addEventListener('submit', async (e) => {
		e.preventDefault();

		const params = new URLSearchParams(window.location.search);
		const eventId = params.get('event-id');
		const isCreator = params.get('is-creator');
		const date = params.get('date');

		const form = e.target;
		const id = e.target.getAttribute('value');

		const formDecorationList = form['decoration'];
		const formFoodList = form['food'];
		const formOtherList = form['other'];
		const formDrinkList = form['drink'];

		console.log(formFoodList)

		let checkedFoodList = [];
		formFoodList.forEach((food) => {
			if (food.checked === true) {
				checkedFoodList.push(food.getAttribute('value'));
			}
		});

		console.log(checkedFoodList)


		let checkedDrinkList = [];
		formDrinkList.forEach((drink) => {
			if (drink.checked === true) {
				checkedDrinkList.push(drink.getAttribute('value'));
			}
		});

		let checkedDecorationList = [];
		formDecorationList.forEach((decoration) => {
			if (decoration.checked === true) {
				checkedDecorationList.push(decoration.getAttribute('value'));
			}
		});

		let checkedOtherList = [];
		formOtherList.forEach((other) => {
			if (other.checked === true) {
				checkedOtherList.push(other.getAttribute('value'));
			}
		});

		let allCheckedItems = checkedFoodList.concat(checkedDrinkList, checkedDecorationList, checkedOtherList);

		const res = await fetch(
			`/eventSchedule/item/?event-id=${eventId}&is-creator=${isCreator}&id=${id}&date=${date}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(allCheckedItems)
			}
		);

		if (res.status !== 200) {
			const data = await res.json();
			alert(data.msg);
			return;
		}

		const result = await res.json();
		if (result.status === true) {
			alert('Items Successfully Added to the Activity!');
			location.reload();
		}
	});
}

function editRemarks(id, remark) {
	document.querySelector(`#edit-remarks`).addEventListener('click', (e) => {
		e.preventDefault();

		console.log('target ID =' + id);

		// target div becomes a textarea
		const div = document.querySelector(`#remark-detail${id}`);

		div.innerHTML = `
                        <form value="${id}" id="edit-remark-form">    
                        <textarea type="input" id="edit-remark" rows="5">${remark}</textarea>
                        <button form="edit-remark-form" type="submit" class="btn btn-primary button-53">
                            Submit
                        </button>
                        <form>
                        `;
		submitEditRemark();
	});
}

async function submitEditRemark() {
	document.querySelector('#edit-remark-form').addEventListener('submit', async (e) => {
		e.preventDefault();

		const params = new URLSearchParams(window.location.search);
		const eventId = params.get('event-id');
		const isCreator = params.get('is-creator');
		const date = params.get('date');

		const form = e.target;
		const id = e.target.getAttribute('value');
		const remark = form['edit-remark'].value;

		if (!remark || onlySpaces(remark)) {
			if (!window.confirm('Input field seems to be empty, are you sure to proceed?')) {
				return;
			}
		}

		const res = await fetch(
			`/eventSchedule/remark/edit/?event-id=${eventId}&is-creator=${isCreator}&id=${id}&date=${date}`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ remark })
			}
		);

		if (res.status !== 200) {
			const data = await res.json();
			alert(data.msg);
			return;
		}

		const result = await res.json();
		if (result.status === true) {
			alert('Activity successfully edited!');
			location.reload();
		}
	});
}

async function deleteTimeBlock() {
	const trashCans = document.querySelectorAll('#trash-can');
	trashCans.forEach((trashcan) => {
		trashcan.addEventListener('click', async (e) => {
			e.preventDefault();

			if (!window.confirm('Do you really want to delete?')) {
				return;
			}

			const params = new URLSearchParams(window.location.search);
			const eventId = params.get('event-id');
			const isCreator = params.get('is-creator');
			const date = params.get('date');

			const id = e.target.getAttribute(`value`);
			console.log('target ID =' + id);

			const res = await fetch(
				`/eventSchedule/timeBlock/?event-id=${eventId}&is-creator=${isCreator}&id=${id}&date=${date}`,
				{
					method: 'DELETE'
				}
			);
			if (res.status === 400) {
				const data = await res.json();
				alert(data.msg);
				return;
			} else if (res.status !== 200) {
				alert('Unable to delete time block');
			} else {
				const result = await res.json();
				location.reload();
			}
		});
	});
}

function hideCreatorDivClass() {
	const params = new URLSearchParams(window.location.search);
	const isCreator = params.get('is-creator');
	const creatorDiv = document.querySelectorAll('.creator-function');

	if (isCreator === '0') {
		creatorDiv.forEach((div) => {
			div.style.display = 'none';
		});
	}
}

function minToTimeString(timeInMin) {
	if (timeInMin < 10) {
		return `00:0${timeInMin}`;
	} else if (timeInMin < 60) {
		return `00:${timeInMin}`;
	} else if (Math.floor(timeInMin / 60) < 10 && timeInMin % 60 < 10) {
		const hour = Math.floor(timeInMin / 60);
		const min = timeInMin % 60;
		return `0${hour}:0${min}`;
	} else if (Math.floor(timeInMin / 60) >= 10 && timeInMin % 60 < 10) {
		const hour = Math.floor(timeInMin / 60);
		const min = timeInMin % 60;
		return `${hour}:0${min}`;
	} else if (Math.floor(timeInMin / 60) >= 10 && timeInMin % 60 >= 10) {
		const hour = Math.floor(timeInMin / 60);
		const min = timeInMin % 60;
		return `${hour}:${min}`;
	} else if (Math.floor(timeInMin / 60) < 10 && timeInMin % 60 >= 10) {
		const hour = Math.floor(timeInMin / 60);
		const min = timeInMin % 60;
		return `0${hour}:${min}`;
	}
}

function toMin(timeInput) {
	const hourInMin = parseInt(timeInput.slice(0, 2)) * 60;
	const min = parseInt(timeInput.slice(3, 5));
	return hourInMin + min;
}

async function setGlobalHeight(input) {
	const allBlocks = document.querySelectorAll('.time-block');
	allBlocks.forEach((block) => {
		const originalHeight = parseInt(block.style.height.slice(0, -2));
		block.style.height = `${originalHeight * input}px`;
	});
}

function onlySpaces(str) {
	return str.trim().length === 0;
}

async function listenToSchedulePage() {
	document.querySelector('#date-selector').addEventListener('change', (e) => {
		e.preventDefault();
		const rawDate = document.querySelector('#date-selector').value;
		const date = `${rawDate.slice(0, 4)}${rawDate.slice(5, 7)}${rawDate.slice(8, 10)}`;
		const params = new URLSearchParams(window.location.search);
		const eventId = params.get('event-id');
		const isCreator = params.get('is-creator');
		window.location.href = `/eventSchedule/eventSchedule.html?event-id=${eventId}&is-creator=${isCreator}&date=${date}`;
	});
}

async function fixTimeStamp() {
	const timeStampDiv = document.querySelectorAll('.time-stamp');
	timeStampDiv.forEach((stamp) => {
		let nextTimeBlock;
		let placeholder = stamp.parentElement.nextElementSibling;

		while (placeholder) {
			if (placeholder.classList.contains('time-block')) {
				nextTimeBlock = placeholder;
				break;
			}
			placeholder = placeholder.nextElementSibling;
		}
		const time = minToTimeString(parseInt(nextTimeBlock.getAttribute('start')));
		stamp.innerHTML = time;
	});
}

async function deleteRedundantDiv(x) {
	const divCluster = document.querySelectorAll(`.time-block`);
	if (x > 0) {
		for (let i = 0; i < divCluster.length; i++) {
			if (!!divCluster[i + 1]) {
				const endTime = parseInt(divCluster[i].getAttribute('end'));
				const nextStartTime = parseInt(divCluster[i + 1].getAttribute('start'));
				if (endTime > nextStartTime) {
					divCluster[i + 1].parentElement.remove();
				} else if (endTime < nextStartTime) {
					divCluster[i + 1].setAttribute(`start`, `${endTime}`);
				}
			}
		}
		deleteRedundantDiv(x - 1);
	}
	return;
}

async function correctDiv(eventStartTimeInMin, eventEndTimeInMin) {
	const divCluster = document.querySelectorAll(`.time-block`);
	const params = new URLSearchParams(window.location.search);
	const isCreator = params.get('is-creator');

	for (let i = 0; i < divCluster.length; i++) {
		const startTime = parseInt(divCluster[i].getAttribute('start'));
		const endTime = parseInt(divCluster[i].getAttribute('end'));
		const height = endTime - startTime;
		const timeString = minToTimeString(startTime);

		if (!!divCluster[i + 1]) {
			divCluster[i].style.height = `${height}px`;
			const nextStartTime = parseInt(divCluster[i + 1].getAttribute('start'));
			const nextEndTime = parseInt(divCluster[i + 1].getAttribute('end'));
			const newDivHeight = nextStartTime - endTime;
			const nextStartTimeFormat = minToTimeString(nextStartTime);

			if (endTime < nextStartTime && startTime >= eventStartTimeInMin && startTime < eventEndTimeInMin) {
				divCluster[i].parentNode.insertAdjacentHTML(
					'afterend',
					`
                <div id="time-block-container-${endTime}" class="individual-time-block row">
                    <span id="time-stamp-box" class="time-stamp-container col-2">
                        <div id="stamp-${endTime}" class="time-stamp">${nextStartTimeFormat}</div>
                    </span>
                    <span type="button" id="time-block-${endTime}" start="${endTime}" end="${nextStartTime}" class="time-block event-schedule col-10" data-bs-toggle="modal" data-bs-target="#create-time-block-modal"></span>
                </div>    
                `
				);
				document.querySelector(`#time-block-${endTime}`).style.height = `${newDivHeight}px`;
			} else if (endTime < nextStartTime) {
				divCluster[i].parentNode.insertAdjacentHTML(
					'afterend',
					`
                <div id="time-block-container-${endTime}" class="individual-time-block row">
                    <span id="time-stamp-box" class="time-stamp-container col-2">
                        <div id="stamp-${endTime}" class="time-stamp">${nextStartTimeFormat}</div>
                    </span>
                    <span id="time-block-${endTime}" start="${endTime}" end="${nextStartTime}" class="time-block col-10"></span>
                </div>    
                `
				);
				document.querySelector(`#time-block-${endTime}`).style.height = `${newDivHeight}px`;
			}

			document.querySelector(`#stamp-${startTime}`).innerHTML = timeString;
			divCluster[i].style.height = `${height}`;
		}

		if (
			startTime >= eventStartTimeInMin &&
			startTime < eventEndTimeInMin &&
			!divCluster[i].classList.contains('save-time-block')
		) {
			divCluster[i].classList.add('event-schedule');
			if (isCreator === '1') {
				divCluster[i].setAttribute(`data-bs-target`, `#create-time-block-modal`);
				divCluster[i].setAttribute(`type`, 'button');
				divCluster[i].setAttribute(`data-bs-toggle`, `modal`);
			}
		}
	}

	deleteRedundantDiv(100);
	fixTimeStamp();
	fixDivHeight(10);
}

function loopScrollBar() {
	let rundownContainer = document.querySelector('#rundown-container');
	rundownContainer.addEventListener('scroll', function () {
		let max_scroll = this.scrollHeight - this.clientHeight;
		let current_scroll = this.scrollTop;
		let bottom = 100;
		if (current_scroll + bottom >= max_scroll) {
			let outerDiv = document.querySelectorAll('.rundown')[0];
			let current = parseInt(outerDiv.dataset.current, 10);
			let timeBlock = document.querySelectorAll('.individual-time-block')[current];
			let new_div = timeBlock.cloneNode(true);
			outerDiv.appendChild(new_div);
			outerDiv.dataset.current = current + 1;
		}
	});
}
