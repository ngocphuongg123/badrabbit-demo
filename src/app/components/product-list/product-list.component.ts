import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})

export class ProductListComponent implements OnInit {
/* deleteProduct(arg0: string) {
throw new Error('Method not implemented.');
} */
  products!: Product[];
  constructor(private productService: ProductService, private router: Router) { }

  ngOnInit() {
    return this.productService.getAll().subscribe(data=>{
      this.products = data as Product[]; // Trường hợp dữ liệu không khớp
      console.log(this.products);
    })
  }

  deleteProduct( id: string ) {
    var result = confirm("Want to delete?");
    if ( result) {
      this.productService.delete(id).subscribe(data=>{
        console.log(data);
        this.router.navigate(['/product-list'])
        .then(() => {
          window.location.reload();
        })
      })
    }
  }
}
