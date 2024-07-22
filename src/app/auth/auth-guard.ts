import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {

    return this.authService.isAuthenticated() // trả về 1 Promise
      .then((authenticated: boolean) => {
        console.log('authenticated');
        console.log(authenticated);
        if (authenticated) {
          return true; // cho phép sử dụng router
        } else {
          this.router.navigate(['/']); // this.router.navigate['/login]
          return false; // không cho phép sử dụng route
        }
      });

  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
  // call canActivate again in class
  return this.canActivate(childRoute, state);

  }


}
