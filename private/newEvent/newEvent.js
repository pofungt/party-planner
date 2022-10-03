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
      eventDate,
      startTime,
      endTime,
      eventRemark,
      parkingLot,
      lotNumber,
    };

    let dataPass = true;

    if (!eventName) {
      dataPass = false;
      alert("Please fill in the event name!");
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
