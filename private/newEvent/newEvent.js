document
    .querySelector("#event-submit")
    .addEventListener("click", async function (e) {
        e.preventDefault();
        const eventName = form.event_name.value;
        const eventVenue = form.event_venue.value;
        const indoor = form.indoor_check.checked;
        const outdoor = form.outdoor_check.checked;
        const startDate = form.event_time_start.value;
        const endDate = form.event_time_end.value;
        const eventRemark = form.event_remark.value;
        const parkingLot = form.parking_check.checked;
        const lotNumber = form.lot_input.value;

        let fromObj = {
            eventName,
            eventVenue,
            indoor,
            outdoor,
            startDate,
            endDate,
            eventRemark,
            parkingLot,
            lotNumber,
        };

        let dataPass = true;

        if (!eventName) {
            dataPass = false;
            alert("Please fill in the event name!")
        }
        
        if (dataPass) {
            const res = await fetch("/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formObj),
            });
        }
    });
