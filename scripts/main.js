
class FinanceManager {
    constructor() {
        this.data = {
            accounts: [],
            transactions: []
        };
        this.fileHandle = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('openFile').addEventListener('click', () => this.openFile());
        document.getElementById('createFile').addEventListener('click', () => this.createFile());
        document.getElementById('saveFile').addEventListener('click', () => this.saveFile());
        document.getElementById('addAccount').addEventListener('click', () => this.showAddAccountDialog());
        document.getElementById('addTransaction').addEventListener('click', () => this.showAddTransactionDialog());
    }

    async openFile() {
        try {
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
            this.updateUI();
            document.getElementById('saveFile').disabled = false;
        } catch (error) {
            console.error('Error opening file:', error);
        }
    }

    async createFile() {
        try {
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
        } catch (error) {
            console.error('Error creating file:', error);
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

    updateUI() {
        // TODO: Implement UI update logic
    }

    showAddAccountDialog() {
        // TODO: Implement add account dialog
    }

    showAddTransactionDialog() {
        // TODO: Implement add transaction dialog
    }
}

// Initialize the application
const app = new FinanceManager();