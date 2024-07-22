import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  products!: Product[];
  private subscription!: Subscription;

  constructor(private productService: ProductService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.subscription = this.route.queryParams
      .subscribe(params => {
        this.productService.getProductByQuery(params).subscribe(data => {
          this.products = data as Product[];
        });
      });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
