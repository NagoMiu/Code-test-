function organizeSheetData() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      Logger.log("データがありません。");
      return;
    }
  
    const headers = data[0];
    const rows = data.slice(1);
  
    const uniqueValuesByColumn = headers.map((_, colIndex) => {
      const columnData = rows.map(row => row[colIndex]);
      const uniqueValues = [...new Set(columnData.filter(val => val !== ""))];
      return uniqueValues;
    });
    const outputSheetName = "整理結果";
    let outputSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(outputSheetName);
    
    if (!outputSheet) {
      outputSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(outputSheetName);
    } else {
      outputSheet.clear(); 
    }

    outputSheet.getRange(1, 1, 1, headers.length).setValues([headers]);


    const maxUniqueLength = Math.max(...uniqueValuesByColumn.map(col => col.length));

    for (let row = 0; row < maxUniqueLength; row++) {
      const rowData = uniqueValuesByColumn.map(col => col[row] || "");
      outputSheet.getRange(row + 2, 1, 1, headers.length).setValues([rowData]);
    }

  
  
    headers.forEach((header, i) => {
      Logger.log(`【${header}】`);
      Logger.log(uniqueValuesByColumn[i].join(", "));
    });
  }