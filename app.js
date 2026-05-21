const form = document.getElementById("form");
const tableBody = document.getElementById("tableBody");

const itemCodeInput = document.getElementById("itemCode");
const userNameInput = document.getElementById("userName");
const dateFromInput = document.getElementById("dateFrom");
const dateToInput = document.getElementById("dateTo");
const commentInput = document.getElementById("comment");
const statusInput = document.getElementById("status");

const searchInput = document.getElementById("searchInput");

const state = {
    items: [],
    editingId: null
};

itemCodeInput.addEventListener("input", e => {
    e.target.value = e.target.value.replace(/\D/g, "");
});

form.addEventListener("submit", e => {
    e.preventDefault();

    const dto = getForm();

    if (!validate(dto)) return;

    if (state.editingId) {
        state.items = state.items.map(i =>
            i.id === state.editingId ? { ...i, ...dto } : i
        );
    } else {
        state.items.push({
            id: Date.now(),
            status: "New",
            ...dto
        });
    }

    resetForm();
    render();
});

tableBody.addEventListener("click", e => {
    if (e.target.dataset.delete) {
        state.items = state.items.filter(i => i.id != e.target.dataset.delete);
        render();
    }

    if (e.target.dataset.edit) {
        const item = state.items.find(i => i.id == e.target.dataset.edit);

        state.editingId = item.id;

        itemCodeInput.value = item.itemCode;
        userNameInput.value = item.userName;
        dateFromInput.value = item.dateFrom;
        dateToInput.value = item.dateTo;
        commentInput.value = item.comment;
        statusInput.value = item.status;
    }
});

function render() {
    tableBody.innerHTML = "";

    let list = [...state.items];

    if (searchInput.value) {
        list = list.filter(i =>
            i.itemCode.includes(searchInput.value) ||
            i.userName.toLowerCase().includes(searchInput.value.toLowerCase())
        );
    }

    list.forEach((item, i) => {

        let statusUA = "Нова";
        if (item.status === "Approved") statusUA = "Підтверджено";
        if (item.status === "Rejected") statusUA = "Відхилено";

        tableBody.innerHTML += `
        <tr>
            <td>${i + 1}</td>
            <td>${item.itemCode}</td>
            <td>${item.userName}</td>
            <td>${item.dateFrom}</td>
            <td>${item.dateTo}</td>
            <td>${item.comment}</td>
            <td>${statusUA}</td>
            <td>
                <button data-edit="${item.id}">Редагувати</button>
                <button data-delete="${item.id}">Видалити</button>
            </td>
        </tr>`;
    });
}


function getForm() {
    return {
        itemCode: itemCodeInput.value,
        userName: userNameInput.value,
        dateFrom: dateFromInput.value,
        dateTo: dateToInput.value,
        comment: commentInput.value,
        status: statusInput.value
    };
}

function validate(d) {
    clearErrors();
    let ok = true;

    if (!d.itemCode) {
        showError("itemCode", "itemCodeError", "Введіть тільки цифри");
        ok = false;
    }

    if (!d.userName) {
        showError("userName", "userNameError", "Обов'язково");
        ok = false;
    }

    if (!d.dateFrom || !d.dateTo) {
        showError("dateFrom", "dateError", "Вкажіть дати");
        ok = false;
    }

    if (d.dateFrom > d.dateTo) {
        showError("dateFrom", "dateError", "Невірний діапазон");
        ok = false;
    }

    if (!d.comment) {
        showError("comment", "commentError", "Напишіть коментар");
        ok = false;
    }

    return ok;
}

function showError(inputId, errorId, msg) {
    document.getElementById(inputId).classList.add("invalid");
    document.getElementById(errorId).textContent = msg;
}

function clearErrors() {
    document.querySelectorAll(".error").forEach(e => e.textContent = "");
    document.querySelectorAll(".invalid").forEach(e => e.classList.remove("invalid"));
}

function resetForm() {
    form.reset();
    state.editingId = null;
}