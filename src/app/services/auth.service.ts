import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  url = 'http://localhost:8000/v1';
  loggedIn = false;
  constructor(private httpClient: HttpClient) { }

  isAuthenticated() {
    const promise = new Promise<boolean>((resolve, reject) => {
      let jsonData = localStorage.getItem('login');
      if (jsonData) {
        this.loggedIn = true;
        resolve(this.loggedIn);
      } else {
        resolve(this.loggedIn);
      }
    }
    );
    return promise;
  }

  isAdmin() {
    const promise = new Promise<boolean>((resolve, reject) => {
      let jsonData = localStorage.getItem('login');
      if (jsonData) {
        if (JSON.parse(jsonData).user.admin == true) {
          this.loggedIn = true;
          resolve(this.loggedIn);
        }
      } else {
        resolve(this.loggedIn);
      }
    }
    );
    return promise;
  }

  checkLogin() {
    let jsonData = localStorage.getItem('login');
    if (jsonData) {
      return JSON.parse(jsonData);
    }
    return false;
  }

  checkAdmin() {
    let jsonData = localStorage.getItem('login');
    if (jsonData) {
      if (JSON.parse(jsonData).user.admin == true) {
        return JSON.parse(jsonData);
      }
    }
  }

  // Hàm đăng ký - register
  register(body: any): Observable<any> {
    return this.httpClient.post<any>(`${this.url}/account/add`, body);
  }

  // Hàm đăng nhập - login
  login(body: any): Observable<any> {
    return this.httpClient.post<any>(`${this.url}/account/login`, body);
  }

  getToken() {
    let jsonData = localStorage.getItem('login')
    if (jsonData) {
      return JSON.parse(jsonData).accessToken;
    }
    return false;
  }

  getRefreshToken() {
    let jsonData = localStorage.getItem('login')
    if (jsonData) {
      return JSON.parse(jsonData).refreshToken;
    }
    return false;
  }

  // hàm đăng nhập
  refreshToken(refreshToken: any): any {
    return this.httpClient.post<any>(`${this.url}/refresh`, refreshToken)
  }
}
