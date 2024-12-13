class FinanceDataManager {
    constructor() {
        this.data = {
            accounts: [],
            transactions: []
        };
        this.currentYearMonth = null;
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

    getTransactionsByMonth() {
        return this.data.transactions.reduce((acc, transaction) => {
            const month = transaction.date.slice(0, 7);
            if (!acc[month]) acc[month] = { income: 0, expense: 0, transactions: [] };
            if (transaction.amount > 0) acc[month].income += transaction.amount;
            else acc[month].expense += transaction.amount;
            acc[month].transactions.push(transaction);
            return acc;
        }, {});
    }
}

export default FinanceDataManager;
