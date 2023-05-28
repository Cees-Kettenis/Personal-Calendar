var calendar;
const API_URL = "http://localhost:5001/";

$(document).ready(async function () {
  //setup the calendar.
  var calendarEl = document.getElementById("calendar");
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    timeZone: "local",
    timeFormat: "HH:mm",
    dayMaxEvents: true,
    eventContent: function (info) {
      if (info.event.end && !info.event.allDay && info.view.type == "dayGridMonth") {
        return {
          html: info.timeText + " - " + moment(info.event.end).format("HH:mm").toString() + " " + info.event.title,
        };
      } else {
        return {
          html: info.timeText + " " + info.event.title,
        };
      }
    },
    eventClick: function (info) {
      console.log(info.event.id);
      if (info.event.id) {
        $("#ddlThemeu").val(info.event.classNames).trigger("change");
        $("#txtStartDateu").val(moment(info.event.start).format("YYYY-MM-DDTHH:mm:ss")).trigger("change");
        $(".delete").attr("event-id", info.event.id);
        $(".update").attr("event-id", info.event.id);
        $("#txtEndDateu").val(moment(info.event.end).format("YYYY-MM-DDTHH:mm:ss")).trigger("change");
        $("#txtAllDayu").prop("checked", info.event.allDay).trigger("change");
        $("#txtTitleu").val(info.event.title);
        $("#mdlEventu").modal("show");
        $("#txtEventDescriptionu").val(info.event.extendedProps.description);
      }
    },
    eventTimeFormat: {
      hour: "numeric",
      minute: "2-digit",
      separator: " - ",
      meridiem: false,
      hour12: false,
    },
    headerToolbar: {
      start: "",
      center: "AddEvent,prev,title,next,today",
      end: "timeGridWeek,dayGridMonth,listWeek",
    },
    dayHeaderContent: function (info) {
      return info.date.toLocaleDateString(undefined, { weekday: "long" });
    },
    dayHeaderDidMount: function (info) {
      var dayOfWeek = info.date.getDay();

      if (dayOfWeek === 0) {
        // Sunday (dayOfWeek === 0)
        info.el.classList.add("sunday");
      }
    },
    customButtons: {
      AddEvent: {
        text: "Add Event",
        click: function () {
          $("#mdlEvent").modal("show");
          $("#mdlEvent #preview").removeClass().addClass($("#ddlTheme").val());
        },
      },
    },
  });
  calendar.render();
  $("#ddlTheme")
    .select2()
    .on("change", function () {
      $("#mdlEvent #preview").removeClass().addClass($("#ddlTheme").val());
    });
  $("#txtTitle").on("keyup", function () {
    $("#mdlEvent #preview").text($(this).val());
  });

  $("#ddlThemeu")
    .select2()
    .on("change", function () {
      $("#mdlEventu #previewu").removeClass().addClass($("#ddlThemeu").val());
    });
  $("#txtTitleu").on("keyup", function () {
    $("#mdlEventu #previewu").text($(this).val());
  });

  $("#chkAllDay").on("change", function () {
    if ($(this).prop("checked")) {
      //remove time component.
      var selectedStartDate = $("#txtStartDate").val();
      var selectedEndDate = $("#txtEndDate").val();

      $("#txtStartDate").attr("type", "date").val(selectedStartDate.split("T")[0]);
      $("#txtEndDate").attr("type", "date").val(selectedEndDate.split("T")[0]);
    } else {
      var selectedStartDate = $("#txtStartDate").val();
      var selectedEndDate = $("#txtEndDate").val();
      $("#txtStartDate")
        .attr("type", "datetime-local")
        .val(selectedStartDate + "T00:00:00");
      $("#txtEndDate")
        .attr("type", "datetime-local")
        .val(selectedEndDate + "T00:01:00");
    }
  });

  $("#chkAllDayu").on("change", function () {
    if ($(this).prop("checked")) {
      //remove time component.
      var selectedStartDate = $("#txtStartDateu").val();
      var selectedEndDate = $("#txtEndDateu").val();

      $("#txtStartDateu").attr("type", "date").val(selectedStartDate.split("T")[0]);
      $("#txtEndDateu").attr("type", "date").val(selectedEndDate.split("T")[0]);
    } else {
      var selectedStartDate = $("#txtStartDateu").val();
      var selectedEndDate = $("#txtEndDateu").val();
      $("#txtStartDateu")
        .attr("type", "datetime-local")
        .val(selectedStartDate + "T00:00:00");
      $("#txtEndDateu")
        .attr("type", "datetime-local")
        .val(selectedEndDate + "T00:01:00");
    }
  });

  LoadData();
});

async function LoadData() {
  calendar.removeAllEvents();
  clearModals();
  $.getJSON("/Client/events/holidays.json", function (data) {
    $.each(data.holidays, function (index, item) {
      var event;
      if (item.states == "All") {
        event = {
          title: item.name,
          start: item.date.iso,
          classNames: "holiday",
        };
      } else if (item.states.length > 0) {
        if (item.states.find((element) => element.name === "Penang")) {
          event = {
            title: item.name,
            start: item.date.iso,
            classNames: "holiday",
          };
        }
      }
      if (event != null) {
        calendar.addEvent(event);
      }
    });
  });
  //load the user made events from the db
  $.ajax({
    url: API_URL,
    method: "GET",
    success: function (data) {
      $.each(data, function (index, item) {
        item.id = item._id;
        calendar.addEvent(item);
      });
    },
    error: function () {
      alert("There was some error performing the AJAX call!");
    },
  });
}

async function CreateEvent() {
  var event;
  if ($("#chkAllDay").prop("checked")) {
    event = {
      allDay: true,
      title: $("#txtTitle").val(),
      start: $("#txtStartDate").val(),
      end: $("#txtEndDate").val(),
      classNames: $("#ddlTheme").val(),
      extendedProps: {
        description: $("#txtEventDescription").val(),
      },
    };
  } else {
    event = {
      allDay: false,
      title: $("#txtTitle").val(),
      start: $("#txtStartDate").val(),
      end: $("#txtEndDate").val(),
      classNames: $("#ddlTheme").val(),
      extendedProps: {
        description: $("#txtEventDescription").val(),
      },
    };
  }

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  };
  const response = await fetch(API_URL, requestOptions).then((response) => response.json());
  LoadData();
  $("#mdlEvent").modal("hide");
}

async function UpdateEvent() {
  var event;
  if ($("#chkAllDayu").prop("checked")) {
    event = {
      allDay: true,
      title: $("#txtTitleu").val(),
      start: $("#txtStartDateu").val(),
      end: $("#txtEndDateu").val(),
      classNames: $("#ddlThemeu").val(),
      extendedProps: {
        description: $("#txtEventDescriptionu").val(),
      },
    };
  } else {
    event = {
      allDay: false,
      title: $("#txtTitleu").val(),
      start: $("#txtStartDatue").val(),
      end: $("#txtEndDateu").val(),
      classNames: $("#ddlThemeu").val(),
      extendedProps: {
        description: $("#txtEventDescriptionu").val(),
      },
    };
  }

  var id = $(".update").attr("event-id");
  event._id = id;
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  };
  const response = await fetch(API_URL + id, requestOptions).then((response) => response.json());
  await LoadData();

  $("#mdlEventu").modal("hide");
}

async function DeleteEvent() {
  var id = $(".delete").attr("event-id");
  const requestOptions = {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  };

  const response = await fetch(API_URL + id, requestOptions).then((response) => response.json());
  await LoadData();
  $("#mdlEventu").modal("hide");
}

function clearModals() {
  $("#ddlThemeu").val("reminder").trigger("change");
  $("#txtStartDateu").val("").trigger("change");
  $(".delete").removeAttr("event-id");
  $(".update").removeAttr("event-id");
  $("#txtEndDateu").val("").trigger("change");
  $("#txtAllDayu").prop("checked", false).trigger("change");
  $("#txtTitleu").val("");
  $("#txtEventDescriptionu").val("");

  $("#ddlTheme").val("reminder").trigger("change");
  $("#txtStartDate").val("").trigger("change");
  $("#txtEndDate").val("").trigger("change");
  $("#txtAllDay").prop("checked", false).trigger("change");
  $("#txtTitle").val("");
  $("#txtEventDescription").val("");
}
