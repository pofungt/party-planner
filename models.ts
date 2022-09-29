export interface EventList {
    id: Number;
    name : String;
    venue: String | null;
    budget: Number | null;
    date: String | null;
    start_time: String | null;
    end_time: String | null;
    creator_id: Number;
    created_at: String;
    updated_at: String;
    status?: String
}

export interface Users {
    id: Number;
    firstName : String;
    lastName: String;
    email: String;
    phone: String | null;
    password: String;
    created_at: String;
    updated_at: String
}