import { Injectable, OnDestroy } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

export interface LoginContext {
  username: string;
  password: string;
  remember?: boolean;
}

/**
 * Provides a base for authentication workflow.
 * The login/logout methods should be replaced with proper implementation.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService implements OnDestroy {
  loggedIn = false;
  constructor(private authService: MsalService) {}
  ngOnDestroy() {}
  /**
   * Authenticates the user.
   * @param context The login parameters.
   * @return The user credentials.
   */
  checkAccount(): boolean {
    this.loggedIn = !!this.authService.getAccount();
    return this.loggedIn;
  }
  /**
   * Logs out the user and clear credentials.
   * @return True if the user was logged out successfully.
   */
  loginWithAd() {
    const isIE =
      window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

    if (isIE) {
      this.authService.loginRedirect();
    } else {
      this.authService.loginPopup();
    }
  }
}
