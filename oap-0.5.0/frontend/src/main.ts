// @ts-ignore
import "./styles.css";

import {
  createRequest,
  createUser,
  getRequests,
  getUsers,
  removeRequest,
  updateRequest,
  getEndpointUsers,
  getEndpointRequests,
  getEndpointRequestComments,
} from "./apiClient";

import type {
  ApiErrorDto,
  CreateRequestRequestDto,
  RequestResponseDto,
  RequestStatus,
  UserResponseDto,
} from "./dtos";

type ListStatus = "idle" | "loading" | "success" | "empty" | "error";

const state: {
  items: RequestResponseDto[];
  users: UserResponseDto[];
  editingId: string | null;
  listStatus: ListStatus;
  error: ApiErrorDto | null;
} = {
  items: [],
  users: [],
  editingId: null,
  listStatus: "idle",
  error: null,
};

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
<div class="page-bg">
  <div class="layout">
    <section class="block form-block">
      <h1 id="formTitle">Нова заявка</h1>

      <form id="form">
        <div class="field">
          <span class="input-label">Код обладнання:</span>
          <div class="input-box">
            <input type="text" id="itemCode" maxlength="12" autocomplete="off">
            <span class="hint">тільки цифри, 3–12 символів</span>
            <small id="itemCodeError" class="error"></small>
          </div>
        </div>

        <div class="field">
          <span class="input-label">Користувач:</span>
          <div class="input-box">
            <input type="text" id="userName" list="userOptions" autocomplete="off" placeholder="Введіть користувача">
            <datalist id="userOptions"></datalist>
            <small id="userNameError" class="error"></small>
          </div>
        </div>

        <div class="row">
          <div class="field">
            <span class="input-label">Дата з:</span>
            <div class="input-box">
              <input type="date" id="dateFrom">
            </div>
          </div>

          <div class="field">
            <span class="input-label">Дата до:</span>
            <div class="input-box">
              <input type="date" id="dateTo">
            </div>
          </div>
        </div>

        <small id="dateError" class="error"></small>

        <div class="field">
          <span class="input-label">Коментар:</span>
          <div class="input-box">
            <textarea id="comment"></textarea>
            <span class="hint">від 5 до 500 символів</span>
            <small id="commentError" class="error"></small>
          </div>
        </div>

        <div class="field">
          <span class="input-label">Статус:</span>
          <div class="input-box">
            <select id="status">
              <option value="New">Нова</option>
              <option value="Approved">Підтверджено</option>
              <option value="Rejected">Відхилено</option>
            </select>
          </div>
        </div>

        <div class="buttons">
          <button id="saveBtn" type="submit">Зберегти</button>
          <button type="reset">Скинути</button>
          <button type="button" id="cancelEdit" class="hidden">Скасувати</button>
        </div>
      </form>
    </section>

    <section class="block table-block">
      <h1>Таблиця заявок на обладнання</h1>

      <div class="toolbar">
        <input type="text" id="searchInput" placeholder="Пошук...">

        <select id="sortSelect">
          <option value="itemCode-asc">Код ↑</option>
          <option value="itemCode-desc">Код ↓</option>
          <option value="userName-asc">Користувач ↑</option>
          <option value="userName-desc">Користувач ↓</option>
          <option value="dateFrom-asc">Дата з ↑</option>
          <option value="dateFrom-desc">Дата з ↓</option>
          <option value="dateTo-asc">Дата до ↑</option>
          <option value="dateTo-desc">Дата до ↓</option>
          <option value="status-asc">Статус ↑</option>
          <option value="status-desc">Статус ↓</option>
        </select>

        <button id="reloadBtn" type="button">Оновити</button>
      </div>

      <div id="notice"></div>
      <div id="listStatus"></div>
      <div class="endpoint-panel">
  <h2>Перевірка API</h2>

  <div class="buttons">
    <button type="button" id="usersEndpointBtn">
      Users
    </button>

    <button type="button" id="requestsEndpointBtn">
      Requests
    </button>

    <button type="button" id="commentsEndpointBtn">
      Request Comments
    </button>
  </div>

  <table>
    <thead id="endpointHead"></thead>
    <tbody id="endpointBody"></tbody>
  </table>
</div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Код</th>
              <th>Користувач</th>
              <th>Дата з</th>
              <th>Дата до</th>
              <th>Коментар</th>
              <th>Статус</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody id="tableBody"></tbody>
        </table>
      </div>
    </section>
  </div>
</div>
`;

const form = document.querySelector<HTMLFormElement>("#form")!;
const tableBody = document.querySelector<HTMLTableSectionElement>("#tableBody")!;
const itemCodeInput = document.querySelector<HTMLInputElement>("#itemCode")!;
const userNameInput = document.querySelector<HTMLInputElement>("#userName")!;
const userOptions = document.querySelector<HTMLDataListElement>("#userOptions")!;
const dateFromInput = document.querySelector<HTMLInputElement>("#dateFrom")!;
const dateToInput = document.querySelector<HTMLInputElement>("#dateTo")!;
const commentInput = document.querySelector<HTMLTextAreaElement>("#comment")!;
const statusInput = document.querySelector<HTMLSelectElement>("#status")!;
const searchInput = document.querySelector<HTMLInputElement>("#searchInput")!;
const sortSelect = document.querySelector<HTMLSelectElement>("#sortSelect")!;
const reloadBtn = document.querySelector<HTMLButtonElement>("#reloadBtn")!;
const formTitle = document.querySelector<HTMLHeadingElement>("#formTitle")!;
const saveBtn = document.querySelector<HTMLButtonElement>("#saveBtn")!;
const cancelEditBtn = document.querySelector<HTMLButtonElement>("#cancelEdit")!;
const listStatus = document.querySelector<HTMLDivElement>("#listStatus")!;
const notice = document.querySelector<HTMLDivElement>("#notice")!;
const usersEndpointBtn =
  document.querySelector<HTMLButtonElement>("#usersEndpointBtn")!;

const requestsEndpointBtn =
  document.querySelector<HTMLButtonElement>("#requestsEndpointBtn")!;

const commentsEndpointBtn =
  document.querySelector<HTMLButtonElement>("#commentsEndpointBtn")!;

const endpointHead =
  document.querySelector<HTMLTableSectionElement>("#endpointHead")!;

const endpointBody =
  document.querySelector<HTMLTableSectionElement>("#endpointBody")!;


itemCodeInput.addEventListener("input", () => {
  itemCodeInput.value = itemCodeInput.value.replace(/\D/g, "").slice(0, 12);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = getForm();

  if (!validate(formData)) return;

  setFormEnabled(false);

  try {
    const user = await findOrCreateUser(formData.userName);

    const dto: CreateRequestRequestDto = {
      itemCode: formData.itemCode,
      userId: user.id,
      dateFrom: formData.dateFrom,
      dateTo: formData.dateTo,
      comment: formData.comment,
      status: formData.status,
    };

    if (state.editingId) {
      await updateRequest(state.editingId, dto);
      showNotice("Заявку оновлено", "success");
    } else {
      await createRequest(dto);
      showNotice("Заявку створено", "success");
    }

    resetForm();
    await loadAll();
  } catch (error) {
    showApiError(error);
  } finally {
    setFormEnabled(true);
  }
});

async function findOrCreateUser(fullName: string) {
  const existing = state.users.find(
    (user) => user.fullName.toLowerCase() === fullName.toLowerCase()
  );

  if (existing) return existing;

  const user = await createUser({
    fullName,
    email: `${Date.now()}@mail.com`,
    role: "Student",
  });

  state.users.unshift(user);
  renderUserOptions();

  return user;
}

function renderUserOptions() {
  userOptions.textContent = "";

  for (const user of state.users) {
    const option = document.createElement("option");
    option.value = user.fullName;
    userOptions.appendChild(option);
  }
}

function getForm() {
  return {
    itemCode: itemCodeInput.value.trim(),
    userName: userNameInput.value.trim(),
    dateFrom: dateFromInput.value,
    dateTo: dateToInput.value,
    comment: commentInput.value.trim(),
    status: statusInput.value as RequestStatus,
  };
}

function validate(d: ReturnType<typeof getForm>) {
  clearErrors();

  let ok = true;

  if (!/^\d{3,12}$/.test(d.itemCode)) {
    showError("itemCodeError", "Код має містити 3–12 цифр");
    ok = false;
  }

  if (d.userName.length < 2) {
    showError("userNameError", "Введіть користувача");
    ok = false;
  }

  if (!d.dateFrom || !d.dateTo) {
    showError("dateError", "Заповніть дати");
    ok = false;
  }

  if (d.dateFrom && d.dateTo && d.dateFrom > d.dateTo) {
    showError("dateError", "Дата до не може бути раніше дати з");
    ok = false;
  }

  if (d.comment.length < 5 || d.comment.length > 500) {
    showError("commentError", "Коментар має бути 5–500 символів");
    ok = false;
  }

  return ok;
}

function showError(id: string, message: string) {
  const el = document.getElementById(id);
  if (el) el.textContent = message;
}

function clearErrors() {
  document.querySelectorAll(".error").forEach((e) => {
    e.textContent = "";
  });
}

function resetForm() {
  form.reset();
  state.editingId = null;
  formTitle.textContent = "Нова заявка";
  cancelEditBtn.classList.add("hidden");
}

function setFormEnabled(enabled: boolean) {
  saveBtn.disabled = !enabled;
}

async function loadAll() {
  await loadUsers();
  await loadRequests();
}

async function loadUsers() {
  try {
    const result = await getUsers();
    state.users = result.items;
    renderUserOptions();
  } catch (error) {
    showApiError(error);
  }
}

async function loadRequests() {
  state.listStatus = "loading";
  renderStatus();

  try {
    const result = await getRequests();
    state.items = result.items;
    state.listStatus = state.items.length === 0 ? "empty" : "success";
    renderTable();
  } catch (error) {
    state.listStatus = "error";
    state.error = normalizeError(error);
  }

  renderStatus();
}

function renderStatus() {
  listStatus.textContent = "";

  if (state.listStatus === "loading") {
    listStatus.textContent = "Завантаження...";
  }

  if (state.listStatus === "empty") {
    listStatus.textContent = "Немає даних";
  }

  if (state.listStatus === "error") {
    listStatus.textContent = "Помилка завантаження";
  }
}

function renderTable() {
  tableBody.textContent = "";

  const list = getSortedAndFilteredItems();

  list.forEach((item, index) => {
    const tr = document.createElement("tr");

    appendCell(tr, String(index + 1));
    appendCell(tr, item.itemCode);
    appendCell(tr, item.userName);
    appendCell(tr, item.dateFrom);
    appendCell(tr, item.dateTo);
    appendCell(tr, item.comment);
    appendCell(tr, item.status);

    const actions = document.createElement("td");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Редагувати";
    editBtn.dataset.edit = item.id;

    editBtn.onclick = () => {
      state.editingId = item.id;

      itemCodeInput.value = item.itemCode;
      userNameInput.value = item.userName;
      dateFromInput.value = item.dateFrom;
      dateToInput.value = item.dateTo;
      commentInput.value = item.comment;
      statusInput.value = item.status;

      formTitle.textContent = "Редагування заявки";
      cancelEditBtn.classList.remove("hidden");
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Видалити";
    deleteBtn.dataset.delete = item.id;

    deleteBtn.onclick = async () => {
      await removeRequest(item.id, item.userId);
      await loadRequests();
    };

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    tr.appendChild(actions);
    tableBody.appendChild(tr);
  });
}

function getSortedAndFilteredItems() {
  const search = searchInput.value.trim().toLowerCase();
  const [field, direction] = sortSelect.value.split("-") as [
    keyof RequestResponseDto,
    "asc" | "desc"
  ];

  return [...state.items]
    .filter((item) => {
      const text = `${item.itemCode} ${item.userName} ${item.comment} ${item.status}`.toLowerCase();
      return text.includes(search);
    })
    .sort((a, b) => {
      const valueA = String(a[field] ?? "").toLowerCase();
      const valueB = String(b[field] ?? "").toLowerCase();

      if (valueA < valueB) return direction === "asc" ? -1 : 1;
      if (valueA > valueB) return direction === "asc" ? 1 : -1;
      return 0;
    });
}

function appendCell(row: HTMLTableRowElement, text: string) {
  const td = document.createElement("td");
  td.textContent = text;
  row.appendChild(td);
}

function showNotice(message: string, type: "success" | "error" | "info" = "info") {
  notice.textContent = message;
  notice.className = message ? `notice ${type}` : "";
}

function showApiError(error: unknown) {
  const apiError = normalizeError(error);
  showNotice(`Помилка (${apiError.status}): ${apiError.message}`, "error");
}

function normalizeError(error: unknown): ApiErrorDto {
  if (typeof error === "object" && error !== null && "status" in error && "message" in error) {
    return error as ApiErrorDto;
  }

  return {
    status: 0,
    code: "UNKNOWN_ERROR",
    message: error instanceof Error ? error.message : String(error),
    details: null,
  };
}
function normalizeEndpointItems(result: any): any[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result.items)) return result.items;
  if (Array.isArray(result.data)) return result.data;
  return [];
}

function renderEndpointTable(result: any) {
  endpointHead.textContent = "";
  endpointBody.textContent = "";

  const items = normalizeEndpointItems(result);

  if (items.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.textContent = "Даних немає";
    row.appendChild(cell);
    endpointBody.appendChild(row);
    return;
  }

  const columns = Object.keys(items[0]);

  const headRow = document.createElement("tr");

  columns.forEach((column) => {
    const th = document.createElement("th");
    th.textContent = column;
    headRow.appendChild(th);
  });

  endpointHead.appendChild(headRow);

  items.forEach((item) => {
    const row = document.createElement("tr");

    columns.forEach((column) => {
      const td = document.createElement("td");
      const value = item[column];

      td.textContent =
        value === null || value === undefined
          ? ""
          : typeof value === "object"
          ? JSON.stringify(value)
          : String(value);

      row.appendChild(td);
    });

    endpointBody.appendChild(row);
  });
}

usersEndpointBtn.addEventListener("click", async () => {
  try {
    const result = await getEndpointUsers();
    renderEndpointTable(result);
    showNotice("Users endpoint викликано", "success");
  } catch (error) {
    showApiError(error);
  }
});

requestsEndpointBtn.addEventListener("click", async () => {
  try {
    const result = await getEndpointRequests();
    endpointHead.innerHTML = `
<tr>
  <th>Код</th>
  <th>Користувач</th>
  <th>Дата з</th>
  <th>Дата до</th>
  <th>Коментар</th>
  <th>Статус</th>
</tr>
`;

endpointBody.innerHTML = "";

result.items.forEach((item: any) => {
  endpointBody.innerHTML += `
    <tr>
      <td>${item.itemCode}</td>
      <td>${item.userName}</td>
      <td>${item.dateFrom}</td>
      <td>${item.dateTo}</td>
      <td>${item.comment}</td>
      <td>${item.status}</td>
    </tr>
  `;
});
    renderEndpointTable(result);
    showNotice("Requests endpoint викликано", "success");
  } catch (error) {
    showApiError(error);
  }
});

commentsEndpointBtn.addEventListener("click", async () => {
  try {
    const result = await getEndpointRequestComments();
    renderEndpointTable(result);
    showNotice("Request comments endpoint викликано", "success");
  } catch (error) {
    showApiError(error);
  }
});
reloadBtn.addEventListener("click", () => {
  void loadAll();
});

sortSelect.addEventListener("change", () => {
  renderTable();
});

searchInput.addEventListener("input", () => {
  renderTable();
});

cancelEditBtn.addEventListener("click", () => {
  resetForm();
});

void loadAll();