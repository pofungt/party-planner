export interface Events {
    id: number;
    name : string;
    venue: string | null;
    budget: number | null;
    date: string | null;
    start_time: string | null;
    end_time: string | null;
    creator_id: number;
    created_at: string;
    updated_at: string;
    status?: string
}

export interface Users {
    id: number;
    firstName : string;
    lastName: string;
    email: string;
    phone: string | null;
    password: string;
    created_at: string;
    updated_at: string
}