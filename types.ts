export interface AppointmentRecord {
  operator: string;
  operatorKey: string;
  date: string;
  time: string;
  service: string;
  duration: string;
  guest: string;
}

export type OperatorGroups = Record<string, AppointmentRecord[]>;

export interface HeaderPositionInfo {
  rowIndex: number;
  map: {
    TIME: number;
    GUEST: number;
    SERVICE: number;
    DURATION: number;
  };
}