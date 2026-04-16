import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  email: string;
  password: string;
  name: string;
  householdId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'atlas_users';
  private readonly SESSION_KEY = 'atlas_current_user';
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.currentUser());
  users = signal<User[]>([]);
  userCount = computed(() => this.users().length);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem(this.SESSION_KEY);
      if (savedUser) {
        this.currentUser.set(JSON.parse(savedUser));
      }
      this.loadUsers();
    }
  }

  private loadUsers() {
    if (isPlatformBrowser(this.platformId)) {
      const users = localStorage.getItem(this.STORAGE_KEY);
      this.users.set(users ? JSON.parse(users) : []);
    }
  }

  getUsers(): User[] {
    return this.users();
  }

  register(user: Omit<User, 'householdId'>): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const users = this.getUsers();
      if (users.find(u => u.email === user.email)) {
        return false;
      }
      const newUser: User = {
        ...user,
        householdId: Math.random().toString(36).substring(2, 15)
      };
      const updatedUsers = [...users, newUser];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUsers));
      this.users.set(updatedUsers);
      return true;
    }
    return false;
  }

  login(email: string, password: string): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const users = this.getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        this.currentUser.set(user);
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
        return true;
      }
    }
    return false;
  }

  logout() {
    this.currentUser.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.SESSION_KEY);
    }
    this.router.navigate(['/login']);
  }

  updateUser(updatedUser: User) {
    if (isPlatformBrowser(this.platformId)) {
      const users = this.getUsers();
      const index = users.findIndex(u => u.email === updatedUser.email);
      if (index !== -1) {
        const updatedUsers = [...users];
        updatedUsers[index] = updatedUser;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUsers));
        this.users.set(updatedUsers);
        this.currentUser.set(updatedUser);
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(updatedUser));
      }
    }
  }

  deleteAccount(email: string) {
    if (isPlatformBrowser(this.platformId)) {
      const users = this.getUsers();
      const userToDelete = users.find(u => u.email === email);
      
      if (userToDelete) {
        // Remove user from users list
        const updatedUsers = users.filter(u => u.email !== email);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUsers));
        this.users.set(updatedUsers);
        
        // Remove user's financial data
        localStorage.removeItem(`atlas_data_h_${userToDelete.householdId}`);
        
        // Logout if it's the current user
        if (this.currentUser()?.email === email) {
          this.logout();
        }
      }
    }
  }

  joinHousehold(householdId: string): boolean {
    const user = this.currentUser();
    if (user && isPlatformBrowser(this.platformId)) {
      const updatedUser = { ...user, householdId };
      this.updateUser(updatedUser);
      return true;
    }
    return false;
  }
}
