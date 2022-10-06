import { addNavbar } from "/functions/addNavbar.js";
import { loadName } from "/functions/loadEvent.js";

window.addEventListener("load", () => {
    addNavbar();
    loadName();
    document.body.style.display = "block";
});

document
    .querySelector("#from-container")
    .addEventListener("submit", async function (e) {
        e.preventDefault();
        const form = e.target;
        const eventName = form.event_name.value;
        const eventVenue = form.event_venue.value || null;
        const indoor = form.indoor_check.checked;
        const outdoor = form.outdoor_check.checked;
        const startTime = form.event_date_start.value
            ? new Date(form.event_date_start.value).toISOString()
            : null;
        const endTime = form.event_date_end.value
            ? new Date(form.event_date_end.value).toISOString()
            : null;
        const eventRemark = form.event_remark.value;
        const parkingLot = form.parking_check.checked;
        const lotNumber = form.lot_input.value || null;
        const eventBudget = form.event_budget.value || null;

        let formObj = {
            eventName,
            eventVenue,
            indoor,
            outdoor,
            startTime,
            endTime,
            parkingLot,
            lotNumber,
            eventRemark,
            eventBudget,
        };

        let dataPass = true;

        if (!eventName) {
            dataPass = false;
            alert("Please fill in the event name!");
        }

        if (lotNumber) {
            !Number;
            alert("Please fill number only!");
        }

        const startTimeValue = new Date(startTime).getTime();
        const endTimeValue = new Date(endTime).getTime();

        // check time validity
        if (startTimeValue && endTimeValue) {
            if (startTimeValue >= endTimeValue) {
                dataPass = false;
                alert("Start time cannot equals or later than end time!");
            }
        } else if (!!startTimeValue + !!endTimeValue) {
            dataPass = false;
            alert("You cannot only leave 1 time blank!");
        }

        // check budget validity
        if (eventBudget < 0) {
            dataPass = false;
            alert("Please fill positive number!");
        }

        if (dataPass) {
            const res = await fetch("/events", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formObj),
            });

            const eventsResult = await res.json();
            if (eventsResult.status === true) {
                window.location = "/"; //
            }
        }
    });
