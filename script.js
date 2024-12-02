class FinanceManager {
    constructor() {
        this.data = { name: '', color: '#007BFF', accounts: [], transactions: [] };
        this.fileHandle = null;
        this.initEventListeners();
        this.updateColor();
    }

    initEventListeners() {
        document.getElementById('load-file').addEventListener('click', () => this.loadFile());
        document.getElementById('save-file').addEventListener('click', () => this.saveFile());
        document.getElementById('account-form').addEventListener('submit', (event) => this.addAccount(event));
        document.getElementById('transaction-form').addEventListener('submit', (event) => this.addTransaction(event));
        document.getElementById('finance-name-input').addEventListener('input', (event) => this.updateFinanceName(event));
        document.getElementById('color-picker').addEventListener('input', (event) => this.updateColor(event));
    }

    async loadFile() {
        try {
            [this.fileHandle] = await window.showOpenFilePicker();
            const file = await this.fileHandle.getFile();
            const content = await file.text();
            console.log("File Content:", content); // Log the content for debugging
            this.data = JSON.parse(content);
            this.renderAccounts();
            this.renderTransactions();
            this.updateFinanceNameDisplay();
            this.updateColor();
        } catch (error) {
            if (error instanceof SyntaxError && error.message.includes("Unexpected end of JSON input")) {
                console.error("Error parsing JSON: Possibly incomplete file read or invalid JSON.", error);
                alert("Error loading file: Invalid JSON or incomplete file read. Please check the file.");
            } else {
                console.error("Error loading file:", error);
                alert("Error loading file: " + error.message);
            }
        }
    }

    async saveFile() {
        if (!this.fileHandle) {
            [this.fileHandle] = await window.showSaveFilePicker();
        }
        const writable = await this.fileHandle.createWritable();
        await writable.write(JSON.stringify(this.data, null, 2));
        await writable.close();
        alert('Arquivo salvo com sucesso!');
    }

    updateFinanceName(event) {
        this.data.name = event.target.value;
        this.updateFinanceNameDisplay();
    }

    updateFinanceNameDisplay() {
        document.getElementById('finance-name').textContent = this.data.name;
    }

    updateColor(event) {
        if (event) {
            this.data.color = event.target.value;
        }
        document.documentElement.style.setProperty('--primary-color', this.data.color);
        document.querySelectorAll('header, #file-section button').forEach(element => {
            element.style.backgroundColor = this.data.color;
        });
    }

    async addAccount(event) {
        event.preventDefault();
        const name = document.getElementById('account-name').value;
        const balance = parseFloat(document.getElementById('account-balance').value);
        this.data.accounts.push({ name, balance });
        this.renderAccounts();
        document.getElementById('account-form').reset();
    }

    async addTransaction(event) {
        event.preventDefault();
        const accountIndex = parseInt(document.getElementById('transaction-account').value);
        const description = document.getElementById('transaction-description').value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const date = document.getElementById('transaction-date').value;
        this.data.transactions.push({ accountIndex, description, amount, date });
        this.data.accounts[accountIndex].balance += amount;
        this.renderAccounts();
        this.renderTransactions();
        document.getElementById('transaction-form').reset();
    }

    renderAccounts() {
        const accountList = document.getElementById('account-list');
        const transactionAccount = document.getElementById('transaction-account');
        accountList.innerHTML = '';
        transactionAccount.innerHTML = '';
        this.data.accounts.forEach((account, index) => {
            const li = document.createElement('li');
            li.textContent = `${account.name} - Saldo: R$${account.balance.toFixed(2)}`;
            accountList.appendChild(li);
            const option = document.createElement('option');
            option.value = index;
            option.textContent = account.name;
            transactionAccount.appendChild(option);
        });
    }

    renderTransactions() {
        const transactionList = document.getElementById('transaction-list');
        transactionList.innerHTML = '';
        this.data.transactions.forEach((transaction) => {
            const li = document.createElement('li');
            li.textContent = `${transaction.date}: ${transaction.description} - Valor: R$${transaction.amount.toFixed(2)}`;
            transactionList.appendChild(li);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new FinanceManager());