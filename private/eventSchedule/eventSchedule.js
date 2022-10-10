import { addNavbar } from '/functions/addNavbar.js';
import { loadName } from '/functions/loadName.js';

window.addEventListener('load', async () => {
	addNavbar();
	loadName();

	await getEventSchedule();
	await setEnvironment();
	deleteTimeBlock();
	hideCreatorDivClass();
	listenToSchedulePage();

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

	const eventName = result.detail.name;
	const startDateTime = new Date(result.detail.start_datetime)
		.toLocaleString('en-US', { hour12: false })
		.replace(', ', ' ')
		.slice(0, -3);
	const endDateTime = new Date(result.detail.end_datetime)
		.toLocaleString('en-US', { hour12: false })
		.replace(', ', ' ')
		.slice(0, -3);
	const activitiesArr = result.activities;
	const startTime = startDateTime.slice(-5);
	const endTime = endDateTime.slice(-5);
	const startHour = parseInt(startTime.slice(0, 2));
	const endHour = parseInt(endTime.slice(0, 2));
	const startMin = parseInt(startTime.slice(3, 5));
	const endMin = parseInt(endTime.slice(3, 5));
	const startTimeInMin = toMin(startTime);
	const endTimeInMin = toMin(endTime);

	//in case of two or more days of event
	const startDate = startDateTime.slice(0, 10);
	const endDate = endDateTime.slice(0, 10);
	const startYear = parseInt(startDateTime.slice(6, 10));
	const endYear = parseInt(endDateTime.slice(6, 10));
	const startMonth = parseInt(startDateTime.slice(0, 3));
	const endMonth = parseInt(endDateTime.slice(0, 3));
	const startDay = parseInt(startDateTime.slice(3, 5));
	const endDay = parseInt(endDateTime.slice(3, 5));

	const dayDifference = (new Date(endDate).getTime() - new Date(startDate).getTime()) / 1000 / 60 / 60 / 24;
	const daysOfEventInMin = (new Date(endDateTime).getTime() - new Date(startDateTime).getTime()) / 1000 / 60;

	console.log(dayDifference);

	let dateSelectorContainer = document.querySelector('#date-selector-container');
	let pageTitle = document.querySelector('#event-name');
	let timeContainer = document.querySelector('#event-time-container');

	pageTitle.innerHTML = `${eventName}`;
	timeContainer.innerHTML = `( ${startTime} on ${startDate} )   to   ( ${endTime} on ${endDate} )`;
	dateSelectorContainer.innerHTML = `
                    <input type="date" id="date-selector" name="trip-start"
                    value="${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}"
                    min="${startYear}-${startMonth}-${startDay}" max="${endYear}-${endMonth}-${endDay}"></input>`;

	addTimeInput(startHour, startMin, endHour, endMin);
	await getPresetTimeBlock(startTimeInMin, dayDifference);
	await getSavedTimeBlocks(activitiesArr);
	await correctDiv(startTimeInMin, endTimeInMin);
	await getMemo(activitiesArr);
}

async function getMemo(activitiesArr) {
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
            <div name="memo" id="memo" class="time-block-memo">
                <div id="memo-item-cluster">
                    <div class="memo-item-container">
                        <label class="memo-item-label" for="activity">ACTIVITY DETAIL:</label>
                        <a value="${id}" class="btn creator-function" id="edit-activities">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </a>
                        <div class="modal-footer" id="separator"></div>
                        <div value="${id}" name="activity" id="activity-detail${id}">${description}</div>
                        <div id="submit-user"></div>
                    </div> 
                    
                    <div class="memo-item-container">
                        <label class="memo-item-label" for="item">ITEM DETAIL:</label>
                        <a value="${id}" class="btn creator-function" id="edit-show-item">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </a>
                        <div class="modal-footer" id="separator"></div>
                        <div value="${id}" name="item" id="item-detail${id}">here put items detail</div>
                    </div> 

                    <div class="memo-item-container">
                        <label class="memo-item-label" for="remark">REMARKS:</label>
                        <a value="${id}" class="btn creator-function" id="edit-remarks">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </a>
                        <div class="modal-footer" id="separator"></div>
                        <div value="${id}" name="remark" id="remark-detail${id}">${remark}</div>
                        <div id="submit-user"></div>
                    </div> 
                </div> 

            </div>
            `;
			editActivity(id, description);
			editRemarks(id, remark);
		});
	});
}

async function addTimeInput(startHour, startMin, endHour, endMin) {
	//restrict time input according to the event start and end time

	const startTimeRange = document.querySelector('#start-time');
	const endTimeRange = document.querySelector('#start-time');

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
                        <span id="time-stamp-box" class="time-stamp-container col-2">
                            <div id="stamp-${start}" class="time-stamp">${timeString}</div>
                        </span>
                        <span id="time-block-${start}" start="${start}" end="${end}" class="time-block col-10"></span>
                    </div>    
                `;
		document.querySelector(`#time-block-${start}`).style.height = `${height}px`;
	}

	//set scroll bar top
	document.querySelector(`#time-block-${startTime}`).innerHTML = 'Event Start Time';
	const scrollBarDiv = document.querySelector('#rundown-container');
	scrollBarDiv.scrollTop = document.querySelector(`#time-block-${startTime}`).offsetTop;

	//loop the scroll
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

async function getSavedTimeBlocks(activitiesArr) {
	activitiesArr.forEach((activity) => {
		const start = activity.start_time;
		const end = activity.end_time;
		const title = activity.title;
		const startTimeInMin = toMin(activity.start_time);
		const endTimeInMin = toMin(activity.end_time);
		const startId = start.slice(0, 2);
		const startMin = start.slice(3, 5);
		const endId = end.slice(0, 2);
		const endMin = end.slice(3, 5);
		const divHeight = endTimeInMin - startTimeInMin;
		const id = activity.id;

		document.querySelector(`#time-block-container-${startTimeInMin}`).innerHTML = `
                <span id="time-stamp-box" class="time-stamp-container col-2">
                    <i value="${id}" id="trash-can" type="button" class="btn fa-solid fa-trash"></i>
                    <div id="stamp-${startTimeInMin}" class="time-stamp">${start}</div>
                </span>
                <span type="button" id="time-block-${startTimeInMin}" start="${startTimeInMin}" end="${endTimeInMin}" class="time-block save-time-block col-10">
                </span>
        `;
		document.querySelector(`#time-block-${startTimeInMin}`).innerHTML = title;
		document.querySelector(`#time-block-${startTimeInMin}`).style.height = `${divHeight}px`;
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
		console.log(`checked ${x} times from top to bottom`);
	}
	return;
}

async function correctDiv(eventStartTimeInMin, eventEndTimeInMin) {
	const divCluster = document.querySelectorAll(`.time-block`);

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
			divCluster[i].setAttribute(`data-bs-target`, `#create-time-block-modal`);
			divCluster[i].setAttribute(`type`, 'button');
			divCluster[i].setAttribute(`data-bs-toggle`, `modal`);
		}
	}

	deleteRedundantDiv(20);
	fixTimeStamp();
	fixDivHeight(10);
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
	const startHour = parseInt(startTime.slice(0, 2));
	const startMin = parseInt(startTime.slice(3, 5));
	const endHour = parseInt(endTime.slice(0, 2));
	const endMin = parseInt(endTime.slice(3, 5));

	console.log(form);

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
			date
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

async function editActivity(id, description) {
	document.querySelector(`#edit-activities`).addEventListener('click', (e) => {
		e.preventDefault();
		// target div becomes a textarea
		const div = document.querySelector(`#activity-detail${id}`);

		div.innerHTML = `
                        <form value="${id}" id="edit-description-form">
                        <textarea id="edit-description" type="input" rows="5">${description}</textarea>
                        <button form="edit-description-form" type="submit" class="btn btn-primary">
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
		console.log(form, description, id);

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

function editRemarks(id, remark) {
	document.querySelector(`#edit-remarks`).addEventListener('click', (e) => {
		e.preventDefault();

		console.log('target ID =' + id);

		// target div becomes a textarea
		const div = document.querySelector(`#remark-detail${id}`);

		div.innerHTML = `
                        <form value="${id}" id="edit-remark-form">    
                        <textarea type="input" id="edit-remark" rows="5">${remark}</textarea>
                        <button form="edit-remark-form" type="submit" class="btn btn-primary">
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
		console.log(form, remark, id, date);

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
			if (res.status !== 200) {
				alert('Unable to delete time block');
				const data = await res.json();
				alert(data.msg);
				return;
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

	if (!isCreator) {
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

async function creatorCheck() {
	const params = new URLSearchParams(window.location.search);
	const isCreator = params.get('is-creator');
	return isCreator;
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
