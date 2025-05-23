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

  const emptyCountByColumn = headers.map((_, colIndex) => {
    return rows.filter(row => row[colIndex] === "").length;
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

  const now = new Date();
  outputSheet.getRange(maxUniqueLength + 3, 1).setValue(`処理完了時刻: ${now.toLocaleString()}`);
  const sourceSheetName = sheet.getName();
  outputSheet.getRange(maxUniqueLength + 4, 1).setValue(`元シート: ${sourceSheetName}`);

  headers.forEach((header, i) => {
    Logger.log(`【${header}】`);
    Logger.log(uniqueValuesByColumn[i].join(", "));
  });

  SpreadsheetApp.getUi().alert("ユニーク値の整理が完了しました！");

  outputSheet.autoResizeColumns(1, headers.length);

  const headerRange = outputSheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold").setBackground("#d9ead3");

  const summaryStartRow = maxUniqueLength + 6;
  outputSheet.getRange(summaryStartRow, 1).setValue("【列ごとの上位5件ユニーク値】");

  headers.forEach((header, i) => {
    const topValues = uniqueValuesByColumn[i].slice(0, 5);
    outputSheet.getRange(summaryStartRow + i + 1, 1).setValue(`${header}`);
    outputSheet.getRange(summaryStartRow + i + 1, 2).setValue(topValues.join(", "));
  });

  const statsStartRow = summaryStartRow + headers.length + 3;
  outputSheet.getRange(statsStartRow, 1).setValue("【列ごとの空のセル数】");

  headers.forEach((header, i) => {
    outputSheet.getRange(statsStartRow + i + 1, 1).setValue(`${header}`);
    outputSheet.getRange(statsStartRow + i + 1, 2).setValue(`${emptyCountByColumn[i]} 件`);
  });

  SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(outputSheet);
  SpreadsheetApp.getActiveSpreadsheet().moveActiveSheet(1);
}
