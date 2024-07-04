export interface WorldEntry {
  date: string;
  worldName: string;
  worldId: string;
  instanceId: string;
  instanceType: string;
  users: string[];
  visitTime: string;
}

export function parseLogFiles(files: File[]): Promise<WorldEntry[]> {
  return Promise.all(files.map(readFile))
    .then(contents => {
      const entries = contents.flatMap(parseLogContent);
      console.log("Final parsed entries:", entries);
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
      instanceType: '',
      visitTime: '',
    };
  }

  function addCurrentEntry(joinUsers: Set<string>) {
    if (currentEntry.date && currentEntry.worldId && currentEntry.worldName) {
      entries.push({ ...currentEntry, users: Array.from(joinUsers) });
      console.log("Adding entry:", JSON.stringify(currentEntry, null, 2));
    }

    currentEntry = {
      ...createNewEntry(),
      users: currentEntry.users,
    };
  }

  function determineInstanceType(instanceId: string): string {
    if (instanceId.includes('~hidden')) return 'FRIEND_PLUS';
    if (instanceId.includes('~friends')) return 'FRIEND';
    if (instanceId.includes('~private') && instanceId.includes('~canRequestInvite')) return 'INVITE_PLUS';
    if (instanceId.includes('~private') && !instanceId.includes('~canRequestInvite')) return 'INVITE';
    if (instanceId.includes('~group') && instanceId.includes('~groupAccessType(members)')) return 'GROUP';
    if (instanceId.includes('~group') && instanceId.includes('~groupAccessType(plus)')) return 'GROUP_PLUS';
    if (instanceId.includes('~group') && instanceId.includes('~groupAccessType(public)')) return 'GROUP_PUBLIC';
    return 'PUBLIC';
  }

  let selfJoinFlag: boolean = false;
  let joinDate = '';
  let joinUsers = new Set<string>();
  lines.forEach(line => {
    const dateMatch = line.match(/^(\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}:\d{2})/);
    const EnteringWorldMatch = line.match(/^(\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}:\d{2}) Log\s+-\s+\[Behaviour\] Entering Room: (.*)$/);
    const joiningWorldMatch = line.match(/Joining (wrld_[^:]+):([^~]+)(.*)/);
    const userJoinMatch = line.match(/OnPlayerJoined (.+)/);
    const userLeaveMatch = line.match(/OnPlayerLeft (.+)/);
    const userLeftRoomMatch = line.match(/^(\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}:\d{2}) Log\s+-\s+\[Behaviour\] OnLeftRoom$/);

    if (EnteringWorldMatch && !selfJoinFlag) {
      const newDate = EnteringWorldMatch[1];
      joinDate = newDate;
      currentEntry.worldName = EnteringWorldMatch[2].trim();
      console.log("Found world name:", currentEntry.worldName);
      selfJoinFlag = true;
    }
    if (joiningWorldMatch) {
      currentEntry.worldId = joiningWorldMatch[1];
      currentEntry.instanceId = joiningWorldMatch[2] + (joiningWorldMatch[3] || '');
      currentEntry.date = joinDate;
      currentEntry.instanceType = determineInstanceType(currentEntry.instanceId);
      console.log("Found world ID:", currentEntry.worldId, "Instance ID:", currentEntry.instanceId, "Instance Type:", currentEntry.instanceType);
      console.log("Found date:", currentEntry.date);
    }

    if (selfJoinFlag) {
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
    if (userLeftRoomMatch && selfJoinFlag) {
      console.log("User left room" + currentEntry.worldName);
      const leftRoomDate = userLeftRoomMatch[1];
      console.log("left Time" + leftRoomDate);

      const formattedLeftRoomDate = leftRoomDate.replace(/\./g, '-');
      const formattedJoinDate = joinDate.replace(/\./g, '-');

      const startTime = new Date(formattedJoinDate);
      const endTime = new Date(formattedLeftRoomDate);
      const diffTime = endTime.getTime() - startTime.getTime();
      const diffHour = Math.floor(diffTime / (1000 * 60 * 60));
      const diffMin = Math.floor(diffTime % (1000 * 60 * 60) / (1000 * 60));

      currentEntry.date = leftRoomDate;
      currentEntry.visitTime = diffHour + "時間" + diffMin + "分";
      console.log("Visit Time:", currentEntry.visitTime);
      console.log("Join Users:", joinUsers);
      addCurrentEntry(joinUsers);
      selfJoinFlag = false;
      joinUsers = new Set<string>();
    }
  });

  return entries;
}