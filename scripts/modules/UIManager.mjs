class UIManager {
    constructor(financeDataManager, fileManager) {
        this.financeDataManager = financeDataManager;
        this.fileManager = fileManager;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('openFile').addEventListener('click', () => this.openFile());
        document.getElementById('createFile').addEventListener('click', () => this.createFile());
        document.getElementById('saveFile').addEventListener('click', () => this.saveFile());
        document.getElementById('addAccount').addEventListener('click', () => this.showAddAccountDialog());
        document.getElementById('addTransaction').addEventListener('click', () => this.showUpdateOrEditTransactionDialog());
        document.querySelectorAll('.cancel-button').forEach(this.handleCancelButtonClick);
    }

    handleCancelButtonClick(button) {
        button.onclick = () => {
            const dialog = button.closest('.dialog');
            dialog.classList.remove('active');
        };
    }

    async openFile() {
        try {
            this.toggleSpinner();
            const data = await this.fileManager.openFile();
            this.financeDataManager.data = data;
            this.financeDataManager.updateTotalBalance();
            this.updateUI();
            document.getElementById('saveFile').disabled = false;
        } catch (error) {
            console.error('Error opening file:', error);
        } finally {
            this.toggleSpinner();
        }
    }

    async createFile() {
        try {
            this.toggleSpinner();
            const data = await this.fileManager.createFile();
            this.financeDataManager.data = data;
            await this.saveFile();
            this.updateUI();
            document.getElementById('saveFile').disabled = false;
        } catch (error) {
            console.error('Error creating file:', error);
        } finally {
            this.toggleSpinner();
        }
    }

    async saveFile() {
        try {
            await this.fileManager.saveFile(this.financeDataManager.data);
        } catch (error) {
            console.error('Error saving file:', error);
        }
    }

    updateUI() {
        // Update accounts UI
        const accountList = document.querySelector('.account-list');
        accountList.innerHTML = '';
        this.financeDataManager.data.accounts.forEach(account => {
            const accountItem = document.createElement('div');
            accountItem.textContent = `${account.name}: R$${account.balance.toFixed(2)}`;
            accountList.appendChild(accountItem);
        });

        // Update transactions UI
        this.updateTransactionsUI();

        // Update monthly summary UI
        this.updateMonthlySummaryUI();
    }

    updateTransactionsUI() {
        const transactionList = document.querySelector('.transaction-list');
        transactionList.innerHTML = '';

        if (!this.financeDataManager.currentYearMonth) {
            transactionList.textContent = 'Select a month to view transactions.';
            return;
        }

        const transactions = this.financeDataManager.data.transactions.filter(transaction => transaction.date.startsWith(this.financeDataManager.currentYearMonth));
        if (transactions.length === 0) {
            transactionList.textContent = 'No transactions available for the selected month.';
            return;
        }

        transactions.forEach((transaction, index) => {
            const transactionItem = document.createElement('div');
            transactionItem.classList.add('transaction-item');
            transactionItem.innerHTML = `
                <span>${transaction.date} - ${transaction.description}: R$${transaction.amount.toFixed(2)} (${transaction.account})</span>
                <button class="edit-transaction" data-index="${index}">Edit</button>
                <button class="delete-transaction" data-index="${index}">Remove</button>
            `;
            transactionList.appendChild(transactionItem);
        });

        transactionList.querySelectorAll('.edit-transaction').forEach(button => {
            button.addEventListener('click', (e) => this.showUpdateOrEditTransactionDialog(e.target.dataset.index));
        });

        transactionList.querySelectorAll('.delete-transaction').forEach(button => {
            button.addEventListener('click', (e) => this.removeTransaction(e.target.dataset.index));
        });
    }

    updateMonthlySummaryUI() {
        const monthlySummary = document.querySelector('.monthly-summary');
        monthlySummary.innerHTML = '';

        const transactionsByMonth = this.financeDataManager.getTransactionsByMonth();
        const months = Object.keys(transactionsByMonth);
        if (months.length === 0) {
            monthlySummary.textContent = 'No data available.';
            return;
        }

        const monthButtons = document.createElement('div');
        monthButtons.classList.add('month-buttons');
        months.forEach(month => {
            const button = document.createElement('button');
            button.textContent = month;
            button.onclick = () => {
                this.financeDataManager.currentYearMonth = month;
                this.updateTransactionsUI();
                this.showMonthlyDetails(transactionsByMonth[month]);
            };
            monthButtons.appendChild(button);
        });
        monthlySummary.appendChild(monthButtons);

        if (this.financeDataManager.currentYearMonth) {
            const summary = transactionsByMonth[this.financeDataManager.currentYearMonth];
            this.showMonthlyDetails(summary);
        }
    }

    showMonthlyDetails(summary) {
        const monthlySummary = document.querySelector('.monthly-summary');
        const existingDetails = monthlySummary.querySelector('.summary-details');
        if (existingDetails) {
            monthlySummary.removeChild(existingDetails);
        }
        const summaryDetails = document.createElement('div');
        summaryDetails.classList.add('summary-details');
        summaryDetails.innerHTML = `
            <p>Income: R$${summary.income.toFixed(2)}</p>
            <p>Expenses: R$${summary.expense.toFixed(2)}</p>
            <p>Final Balance: R$${(summary.income + summary.expense).toFixed(2)}</p>
        `;
        monthlySummary.appendChild(summaryDetails);
    }

    showAddAccountDialog() {
        const dialog = document.getElementById('addAccountDialog');
        dialog.classList.add('active');
        dialog.querySelector('.save-button').onclick = () => {
            const accountName = dialog.querySelector('#accountName').value;
            const initialBalance = parseFloat(dialog.querySelector('#initialBalance').value);
            if (accountName && !isNaN(initialBalance)) {
                this.financeDataManager.data.accounts.push({ name: accountName, balance: initialBalance });
                // Add transaction with initial balance
                const today = new Date().toISOString().split('T')[0];
                this.financeDataManager.data.transactions.push({
                    description: `Initial balance for ${accountName}`,
                    amount: initialBalance,
                    date: today,
                    account: accountName
                });
                this.handleDialogSaveButtonClick(dialog);
            }
        };
    }

    showUpdateOrEditTransactionDialog(index = null) {
        const isEditDialog = index !== null;
        let transaction = null;
        const dialog = document.getElementById('addTransactionDialog');
        const accountSelect = dialog.querySelector('#transactionAccount');
        if (isEditDialog) {
            transaction = this.financeDataManager.data.transactions[index];
            dialog.querySelector('#transactionDescription').value = transaction.description;
            dialog.querySelector('#transactionAmount').value = transaction.amount;
            dialog.querySelector('#transactionDate').value = transaction.date;
        }

        this.populateAccountOptions(isEditDialog, transaction);
        this.initializeDialogFields(isEditDialog, transaction);
        this.setupSaveButtonHandler(dialog, isEditDialog, index);

        dialog.classList.add('active');
    }

    populateAccountOptions(isEditDialog, transaction) {
        const accountSelect = document.getElementById('transactionAccount');
        accountSelect.innerHTML = ''; // Clear existing options
        this.financeDataManager.data.accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.name;
            option.textContent = account.name;
            if (isEditDialog) {
                option.selected = transaction.account === account.name;
            }
            accountSelect.appendChild(option);
        });
    }

    initializeDialogFields(isEditDialog, transaction) {
        const dialog = document.getElementById('addTransactionDialog');
        if (isEditDialog) {
            dialog.querySelector('#transactionDescription').value = transaction.description;
            dialog.querySelector('#transactionAmount').value = transaction.amount;
            dialog.querySelector('#transactionDate').value = transaction.date;
        }
    }

    setupSaveButtonHandler(dialog, isEditDialog, index) {
        dialog.querySelector('.save-button').onclick = () => {
            const description = dialog.querySelector('#transactionDescription').value;
            const amount = parseFloat(dialog.querySelector('#transactionAmount').value);
            const date = dialog.querySelector('#transactionDate').value;
            const accountName = dialog.querySelector('#transactionAccount').value;
            if (description && !isNaN(amount) && date && accountName) {
                this.financeDataManager.data.transactions.push({ description, amount, date, account: accountName });
                this.financeDataManager.updateAccountBalance(accountName, amount);
                if (isEditDialog) {
                    const oldAmount = this.financeDataManager.data.transactions[index].amount;
                    const oldAccount = this.financeDataManager.data.transactions[index].account;
                    this.financeDataManager.updateAccountBalance(oldAccount, -oldAmount); // Revert old transaction amount
                }
                this.handleDialogSaveButtonClick(dialog);
            }
        };
    }

    removeTransaction(index) {
        const transaction = this.financeDataManager.data.transactions[index];
        this.financeDataManager.data.transactions.splice(index, 1);
        this.financeDataManager.updateAccountBalance(transaction.account, -transaction.amount);
        this.updateUI();
        this.saveFile();
    }

    toggleSpinner() {
        const spinner = document.getElementById('spinner');
        spinner.classList.toggle('active');
    }

    handleDialogSaveButtonClick(dialog) {
        this.updateUI();
        dialog.classList.remove('active');
        this.saveFile();
    }
}

export default UIManager;
