class FinanceManager {
    constructor() {
        this.data = {
            accounts: [],
            transactions: []
        };
        this.fileHandle = null;
        // this.loadFromLocalStorage();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('openFile').addEventListener('click', () => this.openFile());
        document.getElementById('createFile').addEventListener('click', () => this.createFile());
        document.getElementById('saveFile').addEventListener('click', () => this.saveFile());
        document.getElementById('addAccount').addEventListener('click', () => this.showAddAccountDialog());
        document.getElementById('addTransaction').addEventListener('click', () => this.showAddTransactionDialog());
        // window.addEventListener('beforeunload', () => this.saveToLocalStorage());
    }

    async openFile() {
        try {
            this.showSpinner();
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{
                    description: 'JSON Files',
                    accept: {'application/json': ['.json']},
                }],
            });
            
            this.fileHandle = fileHandle;
            const file = await fileHandle.getFile();
            const contents = await file.text();
            this.data = JSON.parse(contents);
            this.updateTotalBalance();
            this.updateUI();
            document.getElementById('saveFile').disabled = false;
            // this.saveToLocalStorage();
        } catch (error) {
            console.error('Error opening file:', error);
        } finally {
            this.hideSpinner();
        }
    }

    async createFile() {
        try {
            this.showSpinner();
            const handle = await window.showSaveFilePicker({
                types: [{
                    description: 'JSON Files',
                    accept: {'application/json': ['.json']},
                }],
            });
            
            this.fileHandle = handle;
            this.data = {
                accounts: [],
                transactions: []
            };
            await this.saveFile();
            this.updateUI();
            document.getElementById('saveFile').disabled = false;
            // this.saveToLocalStorage();
        } catch (error) {
            console.error('Error creating file:', error);
        } finally {
            this.hideSpinner();
        }
    }

    async saveFile() {
        if (!this.fileHandle) return;

        try {
            const writable = await this.fileHandle.createWritable();
            await writable.write(JSON.stringify(this.data, null, 2));
            await writable.close();
        } catch (error) {
            console.error('Error saving file:', error);
        }
    }

    // saveToLocalStorage() {
    //     localStorage.setItem('financeManagerData', JSON.stringify(this.data));
    //     if (this.fileHandle) {
    //         localStorage.setItem('financeManagerFileHandle', JSON.stringify(this.fileHandle));
    //     }
    // }

    // loadFromLocalStorage() {
    //     const data = localStorage.getItem('financeManagerData');
    //     if (data) {
    //         this.data = JSON.parse(data);
    //     }
    //     const fileHandle = localStorage.getItem('financeManagerFileHandle');
    //     if (fileHandle) {
    //         this.fileHandle = JSON.parse(fileHandle);
    //     }
    //     this.updateUI();
    // }

    updateUI() {
        // Update accounts UI
        const accountList = document.querySelector('.account-list');
        accountList.innerHTML = '';
        this.data.accounts.forEach(account => {
            const accountItem = document.createElement('div');
            accountItem.textContent = `${account.name}: R$${account.balance.toFixed(2)}`;
            accountList.appendChild(accountItem);
        });

        // Update transactions UI
        const transactionList = document.querySelector('.transaction-list');
        transactionList.innerHTML = '';
        this.data.transactions.forEach(transaction => {
            const transactionItem = document.createElement('div');
            transactionItem.textContent = `${transaction.date} - ${transaction.description}: R$${transaction.amount.toFixed(2)} (${transaction.account})`;
            transactionList.appendChild(transactionItem);
        });

        // Update monthly summary UI
        const monthlySummary = document.querySelector('.monthly-summary');
        monthlySummary.innerHTML = '';
        const transactionsByMonth = this.data.transactions.reduce((acc, transaction) => {
            const month = transaction.date.slice(0, 7);
            if (!acc[month]) acc[month] = { income: 0, expense: 0 };
            if (transaction.amount > 0) acc[month].income += transaction.amount;
            else acc[month].expense += transaction.amount;
            return acc;
        }, {});
        for (const [month, summary] of Object.entries(transactionsByMonth)) {
            const summaryItem = document.createElement('div');
            summaryItem.textContent = `${month}: Receitas: R$${summary.income.toFixed(2)}, Despesas: R$${summary.expense.toFixed(2)}, Saldo: R$${(summary.income + summary.expense).toFixed(2)}`;
            monthlySummary.appendChild(summaryItem);
        }
    }

    showAddAccountDialog() {
        const dialog = document.getElementById('addAccountDialog');
        dialog.classList.add('active');
        dialog.querySelector('.save-button').onclick = () => {
            const accountName = dialog.querySelector('#accountName').value;
            const initialBalance = parseFloat(dialog.querySelector('#initialBalance').value);
            if (accountName && !isNaN(initialBalance)) {
                this.data.accounts.push({ name: accountName, balance: initialBalance });
                this.updateUI();
                dialog.classList.remove('active');
                // this.saveToLocalStorage();
                this.saveFile();
            }
        };
        dialog.querySelector('.cancel-button').onclick = () => {
            dialog.classList.remove('active');
        };
    }

    showAddTransactionDialog() {
        const dialog = document.getElementById('addTransactionDialog');
        const accountSelect = dialog.querySelector('#transactionAccount');
        accountSelect.innerHTML = ''; // Clear existing options
        this.data.accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.name;
            option.textContent = account.name;
            accountSelect.appendChild(option);
        });

        dialog.classList.add('active');
        dialog.querySelector('.save-button').onclick = () => {
            const description = dialog.querySelector('#transactionDescription').value;
            const amount = parseFloat(dialog.querySelector('#transactionAmount').value);
            const date = dialog.querySelector('#transactionDate').value;
            const accountName = dialog.querySelector('#transactionAccount').value;
            if (description && !isNaN(amount) && date && accountName) {
                this.data.transactions.push({ description, amount, date, account: accountName });
                this.updateAccountBalance(accountName, amount);
                this.updateUI();
                dialog.classList.remove('active');
                // this.saveToLocalStorage();
                this.saveFile();
            }
        };
        dialog.querySelector('.cancel-button').onclick = () => {
            dialog.classList.remove('active');
        };
    }

    updateAccountBalance(accountName, amount) {
        const account = this.data.accounts.find(acc => acc.name === accountName);
        if (account) {
            account.balance += amount;
        }
    }

    updateTotalBalance() {
        this.data.accounts.forEach(account => {
            account.balance = this.data.transactions
                .filter(transaction => transaction.account === account.name)
                .reduce((acc, transaction) => acc + transaction.amount, 0);
        });
    }

    showSpinner() {
        const spinner = document.getElementById('spinner');
        spinner.classList.add('active');
    }

    hideSpinner() {
        const spinner = document.getElementById('spinner');
        spinner.classList.remove('active');
    }
}

// Initialize the application
const app = new FinanceManager();