class EquipmentRegistry {
    constructor() {
        this.requests = [];
        this.tableBody = document.getElementById('tableBody');
    }

    addRequest(requestData) {
        const newEntry = {
            id: Date.now(),
            ...requestData
        };
        this.requests.push(newEntry);
        this.render();
    }

    render() {
        this.tableBody.innerHTML = '';
        
        if (this.requests.length === 0) {
            this.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center">Записи відсутні</td></tr>';
            return;
        }

        this.requests.forEach(req => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>#${req.itemCode}</strong></td>
                <td>${req.userName}</td>
                <td>${this.formatDate(req.dateFrom)}</td>
                <td>${this.formatDate(req.dateTo)}</td>
                <td>${req.comment || '-'}</td>
                <td><span class="status-badge">${req.status}</span></td>
            `;
            this.tableBody.appendChild(row);
        });
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('uk-UA');
    }
}

const registry = new EquipmentRegistry();
const checkoutForm = document.getElementById('checkoutForm');
const itemCodeInput = document.getElementById('itemCode');

itemCodeInput.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
});

checkoutForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const itemCode = document.getElementById('itemCode').value;
    const userName = document.getElementById('userName').value.trim();
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    const status = document.getElementById('status').value;
    const comment = document.getElementById('comment').value.trim();

    if (new Date(dateFrom) > new Date(dateTo)) {
        alert("Помилка: Дата видачі не може бути пізнішою за дату повернення.");
        return;
    }

    registry.addRequest({
        itemCode,
        userName,
        dateFrom,
        dateTo,
        status,
        comment
    });

    this.reset();
    itemCodeInput.focus();
});