// instanceTypeUtils.ts

/**
 * Determines the instance type based on the given instance ID.
 * @param instanceId The ID of the instance to analyze.
 * @returns The determined instance type as a string.
 */
export function determineInstanceType(instanceId: string): string {
    if (instanceId.includes('~hidden')) return 'FRIEND_PLUS';
    if (instanceId.includes('~friends')) return 'FRIEND';
    if (instanceId.includes('~private') && instanceId.includes('~canRequestInvite')) return 'INVITE_PLUS';
    if (instanceId.includes('~private') && !instanceId.includes('~canRequestInvite')) return 'INVITE';
    if (instanceId.includes('~group') && instanceId.includes('~groupAccessType(members)')) return 'GROUP';
    if (instanceId.includes('~group') && instanceId.includes('~groupAccessType(plus)')) return 'GROUP_PLUS';
    if (instanceId.includes('~group') && instanceId.includes('~groupAccessType(public)')) return 'GROUP_PUBLIC';
    return 'PUBLIC';
  }
  
  // インスタンスタイプの列挙型を定義
  export enum InstanceType {
    PUBLIC = 'PUBLIC',
    FRIEND_PLUS = 'FRIEND_PLUS',
    FRIEND = 'FRIEND',
    INVITE_PLUS = 'INVITE_PLUS',
    INVITE = 'INVITE',
    GROUP = 'GROUP',
    GROUP_PLUS = 'GROUP_PLUS',
    GROUP_PUBLIC = 'GROUP_PUBLIC'
  }