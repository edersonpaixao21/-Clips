export default interface IUser {
  email: string;
  name: string;
  age: number;
  password?: string;
  phoneNumber: string;
}

interface User {
  email: string;
  password: string;
}
