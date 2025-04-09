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
  
    headers.forEach((header, i) => {
      Logger.log(`【${header}】`);
      Logger.log(uniqueValuesByColumn[i].join(", "));
    });
  }