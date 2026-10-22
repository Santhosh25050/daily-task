const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");

const totalCount = document.getElementById("total-count");
const pendingCount = document.getElementById("pending-count");
const completedCount = document.getElementById("completed-count");
const feedback = document.getElementById("feedback");

const filterButtons = document.querySelectorAll(".filter");
const clearCompletedButton = document.getElementById("clear-completed");

let tasks = [];

try {
  const savedTasks = JSON.parse(localStorage.getItem("taskflow-tasks"));

  if (Array.isArray(savedTasks)) {
    tasks = savedTasks.filter(task =>
      task &&
      typeof task.id === "string" &&
      typeof task.text === "string" &&
      typeof task.completed === "boolean"
    );
  }
} catch {
  tasks = [];
}

let currentFilter = "all";

document.getElementById("date").textContent =
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

function saveTasks() {
  try {
    localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
  } catch {
    feedback.textContent = "Unable to save tasks in this browser.";
  }
}

function renderTasks() {
  taskList.replaceChildren();

  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "pending") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = "task-item";

    if (task.completed) {
      item.classList.add("done");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Complete ${task.text}`);

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
      feedback.textContent = task.completed
        ? "Task completed!"
        : "Task marked as pending.";
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${task.text}`);

    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks();
      renderTasks();
      feedback.textContent = "Task deleted.";
    });

    item.append(checkbox, text, deleteButton);
    taskList.appendChild(item);
  });

  const completed = tasks.filter(task => task.completed).length;
  const pending = tasks.length - completed;

  totalCount.textContent = `${tasks.length} ${
    tasks.length === 1 ? "task" : "tasks"
  }`;

  pendingCount.textContent = pending;
  completedCount.textContent = completed;

  emptyMessage.hidden = visibleTasks.length !== 0;

  if (tasks.length === 0) {
    emptyMessage.textContent = "No tasks here yet. Add one to get started!";
  } else if (visibleTasks.length === 0) {
    emptyMessage.textContent = "No tasks match this filter.";
  }

  clearCompletedButton.disabled = completed === 0;
  clearCompletedButton.style.opacity = completed === 0 ? "0.5" : "1";
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (!text) {
    feedback.textContent = "Please enter a task.";
    return;
  }

  tasks.unshift({
    id: crypto.randomUUID(),
    text: text,
    completed: false
  });

  saveTasks();
  currentFilter = "all";

  filterButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.filter === "all");
  });

  taskInput.value = "";
  feedback.textContent = "New task added!";
  renderTasks();
  taskInput.focus();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(item => {
      item.classList.toggle("active", item === button);
    });

    feedback.textContent = "";
    renderTasks();
  });
});

clearCompletedButton.addEventListener("click", () => {
  const previousLength = tasks.length;

  tasks = tasks.filter(task => !task.completed);

  if (tasks.length !== previousLength) {
    saveTasks();
    feedback.textContent = "Completed tasks cleared.";
  }

  renderTasks();
});

renderTasks();