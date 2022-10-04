export interface Events {
  id: number;
  name: string;
  venue: string | null;
  budget: number | null;
  start_datetime: string | null;
  end_datetime: string | null;
  indoor: boolean | null;
  outdoor: boolean | null;
  parking_lot: boolean | null;
  lot_number: number | null;
  remark: string | null;
  creator_id: number;
  created_at: string;
  updated_at: string;
  status?: string;
}

export interface Users {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  password: string;
  created_at: string;
  updated_at: string;
}

export type UsersInput = Omit<Users, "id" | "created_at" | "updated_at">;

export interface Participants {
  id: number;
  event_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface DataParts {
  firstName: string[];
  lastName: string[];
  emailHost: string[];
  phoneAreaCode: string[];
  partyReason: string[];
  streetName: string[];
}
