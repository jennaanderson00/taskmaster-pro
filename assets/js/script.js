var tasks = {};

// create elements that make up a task item
var createTask = function(taskText, taskDate, taskList) {
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);
  taskLi.append(taskSpan, taskP);
  auditTask(taskLi);
  $("#list-" + taskList).append(taskLi);
};

//task auditing
var auditTask = function(taskEl) {
  var date = $(taskEl).find("span")
    .text()
    .trim();
  var time = moment(date, "L")
    .set("hour", 17);
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};

// if nothing in localStorage, create a new object to track all task status arrays
var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// focus task input
$(".list-group").on("click", "p", function() {
  var text = $(this)
    .text()
    .trim();
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

// blur callback function
$(".list-group").on("blur", "textarea", function() {
  var text = $(this)
    .val()
    .trim();
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  var index = $(this)
    .closest("list-group-item")
    .index();
  tasks[status][index].text = text;
  saveTasks();
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);
  $(this).replaceWith(taskP);
})

// edit due date on click
$(".list-group").on("click", "span", function() {
  var date = $(this)
    .text()
    .trim();
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);
  $(this).replaceWith(dateInput);
  dateInput.datepicker({
    minDate: 1
    onClose: function() {
      $(this).trigger("change");
    }
  });
  dateInput.trigger("focus");
})

// convert back when User clicks out of element
$(".list-group").on("change", "input[type='text']", function() {
  var date = $(this)
    .val()
    .trim();
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  var index = $(this)
    .closest("list-group-item")
    .index();
  tasks[status][index].date = date;
  saveTasks();
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
  $(this).replaceWith(taskSpan);
  auditTask($(taskSpan).closest(".list-group-item"));
})

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();
  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");
    $("#task-form-modal").modal("hide");
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });
    saveTasks();
  }
});

// modal date picker
$("#modalDueDate").datepicker({
  minDate: 1
});

// sortable list
$(".card .list-group").sortable({
  connectWith: $(".card .listgroup"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    console.log("activate", this);
  },
  deactivate: function(event) {
    console.log("deactivate", this);
  },
  over: function(event) {
    console.log("over", event.target);
  },
  out: function(event) {
    console.log("out", event.target);
  },
  update: function(event) {
    var tempArr = [];
    $(this).children().each(function() {
      var text = $(this)
        .find("p")
        .text()
        .trim();
      var date = $(this)
        .find("span")
        .text()
        .trim();
      tempArr.push({
        text: text,
        date: date
      });
    });
    var arrName = $(this)
      .attr("id")
      .replace("list", "");
    tasks[arrName] = tempArr;
    saveTasks();
    console.log(text, date);
  }
});

// droppable trash
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolarance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
    console.log("drop");
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


