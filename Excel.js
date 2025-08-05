// exportJsonFileToExcel.js
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

/**
 * Reads a JSON file from path and exports it to Excel.
 *
 * @param {string} jsonFilePath - Full path to the JSON file
 * @param {string} [fileName] - Optional output Excel file name (without extension)
 */
export function exportParsedResponseToExcel(jsonFilePath, fileName) {
    try {
        const resolvedPath = path.resolve(jsonFilePath);
        const rawData = fs.readFileSync(resolvedPath, 'utf-8');
        const jsonData = JSON.parse(rawData);

        if (!Array.isArray(jsonData) || jsonData.length === 0) {
            console.warn("⚠️ JSON is not an array or is empty.");
            return;
        }

        const parsedRows = [];

        for (const item of jsonData) {
            if (item.response) {
                try {
                    const parsed = JSON.parse(item.response);
                    parsedRows.push(parsed);
                } catch (err) {
                    console.warn("⚠️ Failed to parse response for one item:", err.message);
                    parsedRows.push({ error: "Invalid JSON in response", original: item.response });
                }
            } else {
                parsedRows.push({ error: "No response field", original: JSON.stringify(item) });
            }
        }

        const worksheet = XLSX.utils.json_to_sheet(parsedRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'ParsedResponse');

        const baseName = fileName || path.basename(jsonFilePath, path.extname(jsonFilePath));
        const outputFile = `${baseName}_parsed.xlsx`;

        XLSX.writeFile(workbook, outputFile);
        console.log(`✅ Excel file created: ${outputFile}`);
    } catch (err) {
        console.error("❌ Failed to export parsed response JSON to Excel:", err.message);
    }
}


exportParsedResponseToExcel('./ocr.json');
