import { determineInstanceType, InstanceType } from './instanceTypeUtils';
import { calculateVisitTime, formatDate } from './timeUtils';

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

      currentEntry.date = joinDate;
      currentEntry.visitTime = calculateVisitTime(joinDate, leftRoomDate);
      console.log("Visit Time:", currentEntry.visitTime);
      console.log("Join Users:", joinUsers);
      addCurrentEntry(joinUsers);
      selfJoinFlag = false;
      joinUsers = new Set<string>();
    }
  });

  return entries;
}