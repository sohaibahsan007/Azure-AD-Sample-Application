import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { merge } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Logger, untilDestroyed } from '@core';
import { BroadcastService, MsalService } from '@azure/msal-angular';
import { AuthenticationService } from './auth';
const log = new Logger('App');
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  isIframe = false;
  constructor(
    private router: Router,
    private broadcastService: BroadcastService,
    private authService: MsalService,
    private auth: AuthenticationService,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) {}

  ngOnInit() {
    // Setup logger
    if (environment.production) {
      Logger.enableProductionMode();
    }

    log.debug('init');

    // handle Azure AD
    this.isIframe = window !== window.parent && !window.opener;
    if (!this.auth.checkAccount()) {
      this.router.navigateByUrl('/login');
    }

    this.broadcastService.subscribe('msal:loginSuccess', () => {
      this.auth.checkAccount();
      this.router.navigateByUrl('/home');
    });

    this.broadcastService.subscribe('msal:loginFailure', (error) => {
      console.log('Login Fails:', error);
    });
    this.authService.handleRedirectCallback((authError, response) => {
      if (authError) {
        console.error('Redirect Error: ', authError.errorMessage);
        return;
      }
      console.log('Redirect Success: ', response.accessToken);
    });

    const onNavigationEnd = this.router.events.pipe(filter((event) => event instanceof NavigationEnd));

    // Change page title on navigation or language change, based on route data
    merge(onNavigationEnd)
      .pipe(
        map(() => {
          let route = this.activatedRoute;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter((route) => route.outlet === 'primary'),
        switchMap((route) => route.data),
        untilDestroyed(this)
      )
      .subscribe((event) => {
        const title = event.title;
        if (title) {
          this.titleService.setTitle(title);
        }
      });
  }

  ngOnDestroy() {}
}
