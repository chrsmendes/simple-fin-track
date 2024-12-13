import FinanceDataManager from './modules/FinanceDataManager.mjs';
import FileManager from './modules/FileManager.mjs';
import UIManager from './modules/UIManager.mjs';

class FinanceApp {
    constructor() {
        this.financeDataManager = new FinanceDataManager();
        this.fileManager = new FileManager();
        this.uiManager = new UIManager(this.financeDataManager, this.fileManager);
    }
}

// Initialize the application
const app = new FinanceApp();
