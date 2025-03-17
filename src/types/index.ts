export interface Job {
  id: string;
  name: string;
  company: {
    name: string;
  };
  locations: Array<{
    name: string;
  }>;
  levels: Array<{
    name: string;
  }>;
  refs: {
    landing_page: string;
  };
  publication_date: string;
  contents: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  dateOfBirth?: string;
  age?: number;
} 