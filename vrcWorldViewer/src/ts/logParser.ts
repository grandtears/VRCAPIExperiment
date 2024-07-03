export interface WorldEntry {
  date: string;
  worldName: string;
  worldId: string;
  instanceId: string;
  users: string[];
  visitTime: string;
}

export function parseLogFiles(files: File[]): Promise<WorldEntry[]> {
  return Promise.all(files.map(readFile))
    .then(contents => {
      const entries = contents.flatMap(parseLogContent);
      console.log("Final parsed entries:", entries); // entriesをそのまま出力
      return entries;
    });
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as string);
    reader.onerror = e => reject(e);
    reader.readAsText(file);
  });
}

function parseLogContent(content: string): WorldEntry[] {
  const lines = content.split('\n');
  const entries: WorldEntry[] = [];
  let currentEntry: Omit<WorldEntry, 'users'> & { users: Set<string> } = createNewEntry();

  function createNewEntry(): Omit<WorldEntry, 'users'> & { users: Set<string> } {
    return {
      users: new Set<string>(),
      date: '',
      worldName: '',
      worldId: '',
      instanceId: '',
      visitTime: '',
    };
  }

  function addCurrentEntry(joinUsers: Set<string>) {
    if (currentEntry.date && currentEntry.worldId && currentEntry.worldName) {
      entries.push({ ...currentEntry, users: Array.from(joinUsers) }); // スプレッド構文でコピー
      console.log("Adding entry:", JSON.stringify(currentEntry, null, 2)); // currentEntryをそのまま出力
    }

    // 新しいcurrentEntryを作成する際に、前のcurrentEntryのusersを引き継ぐ
    currentEntry = {
      ...createNewEntry(),  // 新しいcurrentEntryを作成
      users: currentEntry.users, // 直前のcurrentEntryのusersをセット
    };
  }
  let seflJoniFlg:boolean = false;
  let joinDate = '';
  let joinUsers = new Set<string>();
  lines.forEach(line => {
    const dateMatch = line.match(/^(\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}:\d{2})/);
    const EnteringWorldMatch = line.match(/^(\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}:\d{2}) Log\s+-\s+\[Behaviour\] Entering Room: (.*)$/);
    const joiningWorldMatch = line.match(/Joining (wrld_[^:]+):([^~]+)/);
    const userJoinMatch = line.match(/OnPlayerJoined (.+)/);
    const userLeaveMatch = line.match(/OnPlayerLeft (.+)/);
    const userLeftRoomMatch = line.match(/^(\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}:\d{2}) Log\s+-\s+\[Behaviour\] OnLeftRoom$/);

     // 日付を初期化する
/*     if (dateMatch) {
      const newDate = dateMatch[1];
      joinDate = newDate; // 日付を設定する
    } */
    
    // ワールドのJOIN情報した際に新規エントリーを追加
    if (EnteringWorldMatch && !seflJoniFlg) {
      const newDate = EnteringWorldMatch[1];
      joinDate = newDate;
      currentEntry.worldName = EnteringWorldMatch[2].trim();
      console.log("Found world name:", currentEntry.worldName);
      seflJoniFlg = true;
    }
    if (joiningWorldMatch) {
      currentEntry.worldId = joiningWorldMatch[1];
      currentEntry.instanceId = joiningWorldMatch[2];
      currentEntry.date = joinDate;
      console.log("Found world ID:", currentEntry.worldId, "Instance ID:", currentEntry.instanceId);
      console.log("Found date:", currentEntry.date);
    }

    if(seflJoniFlg){
      if (userJoinMatch) {
        const user = userJoinMatch[1];
        joinUsers.add(user);
        console.log("User joined:", user, "Current unique users:", currentEntry.users);
      }

      if (userLeaveMatch) {
        const user = userLeaveMatch[1];
        console.log("User left:", user, "Current unique users:", currentEntry.users);
      }
    }
    if (userLeftRoomMatch && seflJoniFlg) {
      console.log("User left room" + currentEntry.worldName);
      const leftRoomDate = userLeftRoomMatch[1];
      console.log("left Time" + leftRoomDate);

      // joinDate ～ leftRoomDate までの時間を計算
      // 日付と時刻の形式を変換
      const formattedLeftRoomDate = leftRoomDate.replace(/\./g, '-'); // . を - に置換
      const formattedJoinDate = joinDate.replace(/\./g, '-'); // . を - に置換

      const startTime = new Date(formattedJoinDate);
      const endTime = new Date(formattedLeftRoomDate);
      const diffTime = endTime.getTime() - startTime.getTime();
      const diffHour = Math.floor(diffTime / (1000 * 60 * 60));
      const diffMin = Math.floor(diffTime % (1000 * 60 * 60) / (1000 * 60));

      currentEntry.date = leftRoomDate; // currentEntryの日付を更新
      currentEntry.visitTime = diffHour + "時間" + diffMin + "分"; // 滞在時間を追加
      console.log("Visit Time:", currentEntry.visitTime);
      console.log("Join Users:", joinUsers);
      addCurrentEntry(joinUsers);
      seflJoniFlg = false;
      // joinUsersを初期化
      joinUsers = new Set<string>();
    }

  });

  return entries;
}
