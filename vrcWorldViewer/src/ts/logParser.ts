export interface WorldEntry {
    date: string;
    worldName: string;
    worldId: string;
    instanceId: string;
    users: Set<string>;
  }
  
  export function parseLogFiles(files: File[]): Promise<WorldEntry[]> {
    return Promise.all(files.map(readFile))
      .then(contents => {
        const entries = contents.flatMap(parseLogContent);
        console.log("Final parsed entries:", entries.map(entry => ({
          ...entry,
          users: Array.from(entry.users)
        })));
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
    let currentEntry: Partial<WorldEntry> & { users: Set<string> } = createNewEntry();
  
    function createNewEntry(): Partial<WorldEntry> & { users: Set<string> } {
      return {
        users: new Set<string>(),
        date: '',
        worldName: '',
        worldId: '',
        instanceId: ''
      };
    }
  
    function addCurrentEntry() {
      if (currentEntry.date && currentEntry.worldId && currentEntry.worldName) {
        entries.push({
          date: currentEntry.date,
          worldName: currentEntry.worldName,
          worldId: currentEntry.worldId,
          instanceId: currentEntry.instanceId || '',
          users: new Set(currentEntry.users) // ユーザーリストをコピー
        });
        console.log("Adding entry:", JSON.stringify({
          ...currentEntry,
          users: Array.from(currentEntry.users)
        }, null, 2));
      }
    }
  
    lines.forEach(line => {
      const dateMatch = line.match(/^(\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}:\d{2})/);
      const enteringRoomMatch = line.match(/Entering Room: (.*)/);
      const joiningWorldMatch = line.match(/Joining (wrld_[^:]+):([^~]+)/);
      const userJoinMatch = line.match(/OnPlayerJoined (.+)/);
      const userLeaveMatch = line.match(/OnPlayerLeft (.+)/);
  
      if (dateMatch) {
        const newDate = dateMatch[1];
        if (currentEntry.date && currentEntry.date !== newDate) {
          addCurrentEntry();
          currentEntry = createNewEntry(); // 新しいエントリーを作成
          currentEntry.date = newDate; // 日付を更新
        } else {
          currentEntry.date = newDate;
        }
      }
  
      if (enteringRoomMatch) {
        addCurrentEntry(); // 新しいワールドに入る前に現在のエントリーを追加
        currentEntry = createNewEntry(); // 初期化
        currentEntry.worldName = enteringRoomMatch[1].trim();
        console.log("Found world name:", currentEntry.worldName);
      }
  
      if (joiningWorldMatch) {
        currentEntry.worldId = joiningWorldMatch[1];
        currentEntry.instanceId = joiningWorldMatch[2];
      }
  
      if (userJoinMatch) {
        const user = userJoinMatch[1];
        currentEntry.users.add(user);
        console.log("User joined:", user, "Current users:", Array.from(currentEntry.users));
      }
  
      if (userLeaveMatch) {
        const user = userLeaveMatch[1];
        currentEntry.users.delete(user);
        console.log("User left:", user, "Current users:", Array.from(currentEntry.users));
      }
    });
  
    addCurrentEntry(); // 最後のエントリーを追加
  
    console.log("Final entries:", entries.map(entry => ({
      ...entry,
      users: Array.from(entry.users)
    })));
  
    return entries;
  }
  