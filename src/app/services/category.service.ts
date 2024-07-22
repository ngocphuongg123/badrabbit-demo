import { Injectable } from '@angular/core';
import { Category } from '../models/category';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  url = 'http://localhost:8000/v1';


  constructor(private httpClient: HttpClient, private auth: AuthService) { }

  getAll() {
    // Gọi  API với Bearer token
    const headers = { 'Authorization': 'Bearer ' + this.auth.getToken() };
    return this.httpClient.get(`${this.url}/category`, { headers });
  }

  get(id: string) {
    return this.httpClient.get(`${this.url}/category/${id}`);
  }

  delete(id: string) {
    return this.httpClient.delete(`${this.url}/category/${id}`);
  }

  save(category: Category) {
    return this.httpClient.post(`${this.url}/category`,category);
  }
  update(id: string, category: Category) {
    return this.httpClient.put<any>(`${this.url}/category/${id}`,category);
  }
}
