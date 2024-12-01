class FinanceManager {
    constructor() {
        this.data = { accounts: [], transactions: [] };
        this.autosave = false;
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('load-file').addEventListener('click', () => this.loadFile());
        document.getElementById('save-file').addEventListener('click', () => this.saveFile());
        document.getElementById('autosave-toggle').addEventListener('change', (event) => this.toggleAutosave(event));
        document.getElementById('account-form').addEventListener('submit', (event) => this.addAccount(event));
        document.getElementById('transaction-form').addEventListener('submit', (event) => this.addTransaction(event));
    }

    async loadFile() {
        const fileHandle = await window.showOpenFilePicker();
        const file = await fileHandle[0].getFile();
        const content = await file.text();
        this.data = JSON.parse(content);
        this.renderAccounts();
        this.renderTransactions();
    }

    async saveFile() {
        const fileHandle = await window.showSaveFilePicker();
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(this.data, null, 2));
        await writable.close();
        alert('Arquivo salvo com sucesso!');
    }

    toggleAutosave(event) {
        this.autosave = event.target.checked;
    }

    async autosaveIfEnabled() {
        if (this.autosave) {
            await this.saveFile();
        }
    }

    async addAccount(event) {
        event.preventDefault();
        const name = document.getElementById('account-name').value;
        const balance = parseFloat(document.getElementById('account-balance').value);
        this.data.accounts.push({ name, balance });
        this.renderAccounts();
        document.getElementById('account-form').reset();
        await this.autosaveIfEnabled();
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
        await this.autosaveIfEnabled();
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