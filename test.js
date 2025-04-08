function outputData() {
    var spreadsheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1m06Bhz9Fku6NdAfT70g_Hr5in9Y89xI__jE8oB09k5k/edit?gid=0#gid=0');
    var sheet = spreadsheet.getSheetByName('入力用シート');
    var resultSheet = spreadsheet.getSheetByName('出力用シート');
  
    // 業務開始・終了のキーワードを追加
    var startKeywords = ["業務開始報告", "お願い"];
    var endKeywords = ["業務終了報告", "ありがとうございました"];
    //　離席開始・終了のワード追加
    var breakStartKeywords = ["離席開始報告", "離席します"];
    var breakEndKeywords = ["離席終了報告", "戻りました"];
  
    // シート全体の範囲を選択＆データ取得
    var LastRow = sheet.getLastRow();
    var maxColumns = sheet.getMaxColumns();
    var dataRange = sheet.getRange(1, 1, LastRow, maxColumns);
    var data = dataRange.getValues();
    
    // データを名前と日付ごとにグループ化
    var groupedData = {};
  
    // データの各行
    for (var i = 0; i < data.length; i++) {
      var messageId = data[i][0];   // メッセージID
      var accountId = data[i][1];   // アカウントID
      var name = data[i][2];        // 名前
      var type = data[i][3];        // タイプ
      var content = data[i][4];     // 内容
      var sentTime = data[i][5];    // 送信時刻
      var updateTime = data[i][6];  // 更新時刻
      var messageLink = data[i][7]; // メッセージリンク
  
      // 送信時刻から日付を取出
      var date = new Date(sentTime);
      var formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  
      // 名前ごとにデータをグループ化
      if (!groupedData[name]) {
        groupedData[name] = {};
      }
      
      // 日付ごとにデータをグループ化
      if (!groupedData[name][formattedDate]) {
        groupedData[name][formattedDate] = [];
      }
  
      // グループにメッセージを追加
      groupedData[name][formattedDate].push({
        messageId: messageId,
        accountId: accountId,
        content: content,
        sentTime: sentTime,
        messageLink: messageLink
      });
    }
  
    // ここから業務時間と離席時間の計算処理
    var outputData = [];
  
    // グループ化されたデータを処理して、業務時間と離席時間を計算
    for (var name in groupedData) {
      for (var date in groupedData[name]) {
        var startTime = null;
        var endTime = null;
        var totalBreakTime = 0;
        var breakDetails = [];   // 離席時間のペア情報を保存
  
        var breakStartTimes = [];  // 離席開始時刻を保存
        var breakEndTimes = [];    // 離席終了時刻を保存
  
        // 名前と日付の関連を確認
        var messages = groupedData[name][date];
        for (var j = 0; j < messages.length; j++) {
          var content = messages[j].content;
          var sentTime = new Date(messages[j].sentTime);
  
          // 業務開始・終了を設定
          if (startKeywords.some(keyword => content.includes(keyword))) {
            startTime = sentTime;
          }
          if (endKeywords.some(keyword => content.includes(keyword))) {
            endTime = sentTime;
          }
  
          // 離席時間の処理
          if (breakStartKeywords.some(keyword => content.includes(keyword))) {
            breakStartTimes.push(sentTime);
          }
          if (breakEndKeywords.some(keyword => content.includes(keyword))) {
            breakEndTimes.push(sentTime);
          }
        }
  
        // 離席時間の計算
        for (var k = 0; k < breakStartTimes.length; k++) {
          if (breakEndTimes[k]) {
            var breakStart = new Date(breakStartTimes[k]);
            var breakEnd = new Date(breakEndTimes[k]);
  
            // 終了時刻が開始時刻より前なら、翌日とみなして補正
            if (breakEnd < breakStart) {
              breakEnd.setDate(breakEnd.getDate() + 1);
            }
  
            var breakDuration = (breakEnd - breakStart) / (1000 * 60); // 分単位
            totalBreakTime += breakDuration;
  
            breakDetails.push(
              Utilities.formatDate(breakStart, Session.getScriptTimeZone(), 'HH:mm') +
              " - " +
              Utilities.formatDate(breakEnd, Session.getScriptTimeZone(), 'HH:mm')
            );
          }
  }
  
        // 業務時間の計算
        // 業務時間の計算
          var workDuration = 0;
          if (startTime && endTime) {
            // 終了時間が開始時間より前なら翌日に補正
            if (endTime < startTime) {
              endTime.setDate(endTime.getDate() + 1);
            }
            workDuration = (endTime - startTime) / (1000 * 60 * 60);
          }
  
        // 出力用データに追加
        outputData.push([name, date, 
                         startTime ? Utilities.formatDate(startTime, Session.getScriptTimeZone(), 'HH:mm') : 'データ無し',
                         endTime ? Utilities.formatDate(endTime, Session.getScriptTimeZone(), 'HH:mm') : 'データ無し', 
                         workDuration, totalBreakTime, breakDetails.join(", ")]);
      }
    }
  

  }
  