//

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  url = 'http://localhost:8000/v1';

  constructor(private httpClient: HttpClient) { }

  getAll(): Observable<Product[]> {
    return this.httpClient.get<Product[]>(`${this.url}/product`);
  }

  getProductByQuery(params: any): Observable<Product[]> {
    let httpParams = new HttpParams();

    if (params.keyword) {
      httpParams = httpParams.set('keyword', params.keyword);
    }
    if (params.category) {
      httpParams = httpParams.set('category', params.category);
    }

    return this.httpClient.get<Product[]>(`${this.url}/products`, { params: httpParams });
  }

  get(id: string): Observable<Product> {
    return this.httpClient.get<Product>(`${this.url}/product/${id}`);
  }

  delete(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.url}/product/${id}`);
  }

  save(product: Product): Observable<Product> {
    return this.httpClient.post<Product>(`${this.url}/product`, product);
  }

  update(id: string, product: Product): Observable<Product> {
    return this.httpClient.put<Product>(`${this.url}/product/${id}`, product);
  }
}
