

document
    .querySelector("#from-container")
    .addEventListener("submit", async function (e) {
        e.preventDefault();
        const form = e.target;
        const eventName = form.event_name.value;
        const eventVenue = form.event_venue.value;
        const indoor = form.indoor_check.checked;
        const outdoor = form.outdoor_check.checked;
        const startTime = form.event_date_start.value;
        const endTime = form.event_date_end.value;
        const eventRemark = form.event_remark.value;
        const parkingLot = form.parking_check.checked;
        const lotNumber = form.lot_input.value;

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
        if (startTimeValue >= endTimeValue) {
            dataPass = false;
            alert("Start time cannot equals or later than end time!");
        }

        if (dataPass) {
            const res = await fetch("/events", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formObj),
            });
        }
    });
