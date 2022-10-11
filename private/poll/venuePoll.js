import { addNavbar } from '/functions/addNavbar.js';
import { loadName } from '/functions/loadName.js';

window.addEventListener('load', async () => {
    addNavbar();
    await loadName();
    await loadOptions();
    document.body.style.display = 'block';
});

async function loadOptions() {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event-id');
    const res = await fetch(`/events/poll/venue/${eventId}`);
    const result = await res.json();
    console.log(result)
    if (result.status) {
        let pollTitle = "";
        let pollFrameHTML = "";
        let buttonContainerHTML = "";

        // Poll Options HTML
        const optionsList = result.pollOptions;
        optionsList.forEach((each, index) => {
            pollFrameHTML += `
                <div class="option-container" id="option_${each.id}">
                    <div class="title">
                        Venue ${index + 1}
                    </div>
                    <div class="address">
                        ${each.address}
                    </div>
                </div>
            `
        });
        document.querySelector('.poll-frame').innerHTML = pollFrameHTML;

        // Poll title HTML
        if (result.pollTerminated) {
            pollTitle = "Poll Terminated";
        } else if (result.eventDeleted) {
            pollTitle = "Deleted Event";
        } else if (!result.creator) {
            if (result.choice) {
                pollTitle = `Your choice was ...`;
            } else {
                pollTitle = "Please click on the venue option to vote:";
            }
        } else {
            pollTitle = "You may click button below to terminate poll.";
        }
        document.querySelector('.poll-title').innerHTML = pollTitle;

        // Button HTML
        if (!result.pollTerminated && !result.eventDeleted) {
            if (result.creator) {
                buttonContainerHTML = `<button id="poll-terminate-button">Terminate Poll</button>`;
            } else {
                if (!result.choice) {
                    buttonContainerHTML = `<button id="poll-submit-button">Submit Choice</button>`;
                }
            }
        }
        document.querySelector('.button-container').innerHTML = buttonContainerHTML;

        // Check if participant that has not yet voted
        if (!result.pollTerminated && !result.eventDeleted) {
            if (!result.creator && !result.choice) {
                // Listen option choice
                let optionId;

                const optionsDiv = document.querySelectorAll('.option-container');
                optionsDiv.forEach((each) => {
                    each.addEventListener('click', (e) => {
                        if (e.target.classList.contains("option-container")) {
                            e.target.classList.add("selected");
                            optionId = e.target.id;
                            const otherDiv = document.querySelectorAll(`.option-container:not([id*="${optionId}"])`);
                            otherDiv.forEach((each) => {
                                each.classList.remove("selected");
                            })
                        }
                    })
                })

                // Listen submit button for voting
                document.querySelector('#poll-submit-button').addEventListener('click', async ()=>{
                    const optionId = document.querySelector('.selected').id.replace("option_","");
                    const res = await fetch(`/events/poll/venue/vote/${eventId}/${optionId}`,{
                        method: 'POST'
                    });
                    const result = await res.json();
                    if (result.status) {
                        alert('Successfully voted!');
                        await loadOptions();
                    } else {
                        alert('Unable to submit vote!');
                    }
                });
            }
        }

        // Listen to terminate button


    } else {
        alert('Unable to load venue poll page!');
        window.location.href = '/index.html';
    }
}