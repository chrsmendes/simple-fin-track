class FileManager {
    constructor() {
        this.fileHandle = null;
    }

    isFileSystemAccessSupported() {
        return 'showOpenFilePicker' in window;
    }

    async openFile() {
        try {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] },
                }],
            });

            this.fileHandle = fileHandle;
            const file = await fileHandle.getFile();
            const contents = await file.text();
            return JSON.parse(contents);
        } catch (error) {
            console.error('Error opening file:', error);
            throw error;
        }
    }

    async createFile() {
        try {
            const handle = await window.showSaveFilePicker({
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] },
                }],
            });

            this.fileHandle = handle;
            return {
                accounts: [],
                transactions: []
            };
        } catch (error) {
            console.error('Error creating file:', error);
            throw error;
        }
    }

    async saveFile(data) {
        if (!this.fileHandle) return;

        try {
            const writable = await this.fileHandle.createWritable();
            await writable.write(JSON.stringify(data, null, 2));
            await writable.close();
        } catch (error) {
            console.error('Error saving file:', error);
            throw error;
        }
    }
}

export default FileManager;
