export interface EventList {
    id?: Number;
    name : String;
    venue: String;
    budget: Number;
    date: String;
    start_time: String;
    end_time: String;
    creator_id: Number;
    created_at?: String;
    updated_at?: String
    status?: String
}

export interface Users {
    id?: Number;
    firstName : String;
    lastName: String;
    email: String;
    phone: String;
    password: String;
    created_at?: String;
    updated_at?: String
}