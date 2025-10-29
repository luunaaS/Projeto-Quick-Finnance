// Common types for the application

export interface Goal {
  id: number;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  type: 'SAVINGS' | 'INVESTMENT' | 'DEBT_PAYMENT' | 'EMERGENCY_FUND' | 'VACATION' | 'CAR_PURCHASE' | 'HOME_DOWN_PAYMENT' | 'EDUCATION' | 'OTHER';
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Transaction {
  id: number;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  description: string;
  date: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface Financing {
  id: number;
  name: string;
  description: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  interestRate: number;
  termMonths: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  user: User;
  createdAt: string;
  updatedAt: string;
}
