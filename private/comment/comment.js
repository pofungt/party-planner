import { addNavbar } from '/functions/addNavbar.js';
import { loadName } from '/functions/loadName.js';

window.addEventListener('load', async () => {
	addNavbar();
	await loadName();
	await getComment();

	await checkedComment();

	document.body.style.display = 'block';
});

async function getComment() {
	const res = await fetch(`/comment/`);

	if (res.status !== 200) {
		const data = await res.json();
		alert(data.msg);
		return;
	}

	const result = await res.json();

	// to Creator List

	const creatorCommentArr = result.cComment;
	const creatorCommentContainer = document.querySelector('#input-list-my-events');
	creatorCommentArr.forEach((comment) => {
		let name = comment.first_name + ' ' + comment.last_name;
		if (comment.anonymous) {
			name = 'Anonymous';
		}
		let checked = 'unchecked';
		const eventId = comment.event_id;
		const content = comment.content;
		const receivingTime = new Date(comment.created_at).toLocaleDateString('en-US');
		const commentId = comment.id;
		const eventName = comment.name;

		if (comment.read) {
			checked = 'checked';

			creatorCommentContainer.innerHTML += `
            <tr id="comment-box" class="comment-box">
                <th class="table-secondary">${name}</th>
                <th class="table-secondary">${content}</th>
                <th class="table-secondary">${eventName}</th>
                <th class="table-secondary">${receivingTime}</th>
                <th class="table-secondary"><input type="checkbox" event="${eventId}" value="${commentId}" id="creator-read" name="creator-read" ${checked}></th>
            </tr>
        `;
		} else {
			creatorCommentContainer.innerHTML += `
            <tr id="comment-box" class="comment-box">
                <th class="table-primary">${name}</th>
                <th class="table-primary">${content}</th>
                <th class="table-primary">${eventName}</th>
                <th class="table-primary">${receivingTime}</th>
                <th class="table-primary"><input type="checkbox" event="${eventId}" value="${commentId}" id="creator-read" name="creator-read" ${checked}></th>
            </tr>
        `;
		}
	});

	// to Participant List

	const participantsCommentArr = result.pComment;
	const participantsCommentContainer = document.querySelector('#input-list-participated-events');
	participantsCommentArr.forEach(async (comment) => {
		let name = comment.first_name + ' ' + comment.last_name;
		if (comment.anonymous) {
			name = 'Anonymous';
		}
		let checked = 'unchecked';
		const content = comment.content;
		const receivingTime = new Date(comment.created_at).toLocaleDateString('en-US');
		const commentId = comment.id;
		const eventName = comment.name;
		if (comment.read) {
			checked = 'checked';
			participantsCommentContainer.innerHTML += `
            <tr id="comment-box" class="comment-box">
                <th class="table-secondary">${name}</th>
                <th class="table-secondary">${content}</th>
                <th class="table-secondary">${eventName}</th>
                <th class="table-secondary">${receivingTime}</th>
                <th class="table-secondary"><input type="checkbox" value="${commentId}" id="read" name="read" disabled readonly ${checked}></th>
            </tr>
            `;
		} else {
			participantsCommentContainer.innerHTML += `
            <tr id="comment-box" class="comment-box">
                <th class="table-primary">${name}</th>
                <th class="table-primary">${content}</th>
                <th class="table-primary">${eventName}</th>
                <th class="table-primary">${receivingTime}</th>
                <th class="table-primary"><input type="checkbox" value="${commentId}" id="read" name="read" disabled readonly ${checked}></th>
            </tr>
            `;
		}
	});
	postComment(result);
}

async function postComment(result) {
	const eventArr = result.events;
	eventArr.forEach((event) => {
		document.querySelector('#receiver').innerHTML += `
            <option value="${event.event_id}">${event.name}</option>
        `;
	});

	document.querySelector('#comment-form').addEventListener('submit', async (e) => {
		e.preventDefault();

		const form = e.target;
		const receiver = form['receiver'].value;
		const comment = form['comment'].value;
		const category = form['category'].value;
		const anonymous = form['anonymous'].checked;

		let dataPass = true;
		if (!comment || onlySpaces(comment)) {
			dataPass = false;
			alert('Comment field seems to be empty or only space');
			return;
		}

		if (receiver === 'null') {
			dataPass = false;
			alert('Please select a receiving event!');
			return;
		}

		if (dataPass) {
			const formObj = {
				receiver: receiver,
				comment: comment,
				category: category,
				anonymous: anonymous
			};

			const res = await fetch(`/comment/`, {
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
			console.log(result);
			if (result.status === true) {
				alert('Comment successfully sent!');
				location.reload();
			}
		}
	});
}

async function checkedComment() {
	document.querySelectorAll('#creator-read').forEach((checkbox) => {
		checkbox.addEventListener('change', async (e) => {
			e.preventDefault;
			const commentId = e.target.value;
			const check = e.target.checked;
			const eventId = e.target.getAttribute('event');

			const obj = {
				commentId: commentId,
				check: check,
				eventId: eventId
			};

			const res = await fetch(`/comment/`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(obj)
			});

			const result = await res.json();
			if (result.status) {
				console.log(result.msg);
			} else {
				alert('something when wrong when marking message as read');
			}
		});
	});
}

function onlySpaces(str) {
	return str.trim().length === 0;
}
