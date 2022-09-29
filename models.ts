export interface EventList {
    id?: Number;
    partyName : String;
    address: String;
    date: Date;
    start_time: Date;
    end_time: Date;
    status: String;
}

export interface Users {
    id?: Number;
    firstName : String;
    lastName: String;
    email: String;
    phone?: String;
    password: String;
}