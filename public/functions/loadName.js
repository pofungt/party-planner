export async function loadName() {
	const res = await fetch(`/login/name`);
	if (res.status !== 200) {
		const data = await res.json();
		alert(data.msg);
		return;
	}
	const result = await res.json();
	if (result.status) {
		const nameHTML = document.querySelector('.user-login button');
		nameHTML.innerHTML = `<i class="bi bi-person-circle"></i>${result.user}`;
	}
}
